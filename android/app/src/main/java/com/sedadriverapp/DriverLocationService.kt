package com.sedadriverapp

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.location.Location
import android.os.Build
import android.os.IBinder
import android.os.Looper
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import com.google.android.gms.location.LocationCallback
import com.google.android.gms.location.LocationRequest
import com.google.android.gms.location.LocationResult
import com.google.android.gms.location.LocationServices
import com.google.android.gms.location.Priority
import java.net.HttpURLConnection
import java.net.URL
import java.util.concurrent.Executors
import org.json.JSONArray
import org.json.JSONObject

/**
 * Posts the driver's GPS position to Supabase while any of their orders is
 * 'in transit'. Runs entirely natively - no React Native / JS involved - so it
 * keeps going when the app is minimised or swiped away. START_STICKY lets
 * Android bring it back if the system kills the process.
 */
class DriverLocationService : Service() {

  private val io = Executors.newSingleThreadExecutor()
  private val fused by lazy { LocationServices.getFusedLocationProviderClient(this) }
  private var updatesStarted = false

  @Volatile private var orderIds: List<Long> = emptyList()
  @Volatile private var lastOrderRefreshAt = 0L
  @Volatile private var lastUploadAt = 0L

  private val callback =
    object : LocationCallback() {
      override fun onLocationResult(result: LocationResult) {
        result.lastLocation?.let { onLocation(it) }
      }
    }

  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE)

    // intent == null means Android restarted us after killing the process.
    if (intent?.action == ACTION_STOP || !prefs.getBoolean(KEY_ENABLED, false)) {
      stopTracking()
      return START_NOT_STICKY
    }

    try {
      ServiceCompat.startForeground(
        this,
        NOTIFICATION_ID,
        buildNotification(),
        if (Build.VERSION.SDK_INT >= 29) ServiceInfo.FOREGROUND_SERVICE_TYPE_LOCATION else 0,
      )
    } catch (e: Exception) {
      // E.g. restarted from the background without location access. Give up
      // quietly; the app re-starts us next time it is opened.
      Log.w(TAG, "could not enter foreground", e)
      stopSelf()
      return START_NOT_STICKY
    }

    if (!updatesStarted) lastOrderRefreshAt = 0L // fresh start: read orders now
    startLocationUpdates()
    return START_STICKY
  }

  private fun startLocationUpdates() {
    if (updatesStarted) return
    val request =
      LocationRequest.Builder(Priority.PRIORITY_HIGH_ACCURACY, UPLOAD_INTERVAL_MS)
        .setMinUpdateIntervalMillis(UPLOAD_INTERVAL_MS / 2)
        .build()
    try {
      fused.requestLocationUpdates(request, callback, Looper.getMainLooper())
      updatesStarted = true
    } catch (e: SecurityException) {
      Log.w(TAG, "no location permission", e)
      stopTracking()
    }
  }

  private fun onLocation(location: Location) {
    val now = System.currentTimeMillis()
    if (now - lastUploadAt < UPLOAD_INTERVAL_MS / 2) return
    lastUploadAt = now

    io.execute {
      try {
        val prefs = getSharedPreferences(PREFS, Context.MODE_PRIVATE)
        val url = prefs.getString(KEY_URL, null)
        val key = prefs.getString(KEY_KEY, null)
        val driverId = prefs.getLong(KEY_DRIVER_ID, 0L)
        if (url == null || key == null || driverId == 0L) return@execute

        if (now - lastOrderRefreshAt > ORDER_REFRESH_MS) {
          refreshOrders(url, key, driverId)
          lastOrderRefreshAt = now
        }

        val ids = orderIds
        if (ids.isEmpty()) {
          // Server says nothing is in transit any more - nothing left to share.
          stopTracking()
          return@execute
        }

        val iso =
          java.text.SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", java.util.Locale.US)
            .apply { timeZone = java.util.TimeZone.getTimeZone("UTC") }
            .format(java.util.Date())
        val rows = JSONArray()
        for (id in ids) {
          rows.put(
            JSONObject()
              .put("order_id", id)
              .put("driver_id", driverId)
              .put("latitude", location.latitude)
              .put("longitude", location.longitude)
              .put("updated_at", iso)
          )
        }
        val code =
          request(
            "POST",
            "$url/rest/v1/driver_locations?on_conflict=order_id",
            key,
            rows.toString(),
            "resolution=merge-duplicates,return=minimal",
          )
        Log.d(TAG, "sent ${location.latitude},${location.longitude} for $ids -> HTTP $code")
      } catch (e: Exception) {
        // Network blips are normal on the road; the next fix tries again.
        Log.w(TAG, "upload failed", e)
      }
    }
  }

  private fun refreshOrders(url: String, key: String, driverId: Long) {
    val query =
      "$url/rest/v1/orders?select=id&driver_id=eq.$driverId&deliveryStatus=eq.in%20transit"
    val body = requestForBody("GET", query, key) ?: return // keep old ids on failure
    val arr = JSONArray(body)
    orderIds = (0 until arr.length()).map { arr.getJSONObject(it).getLong("id") }
  }

  private fun request(
    method: String,
    url: String,
    key: String,
    body: String?,
    prefer: String?,
  ): Int {
    val conn = URL(url).openConnection() as HttpURLConnection
    try {
      conn.requestMethod = method
      conn.connectTimeout = 10000
      conn.readTimeout = 10000
      conn.setRequestProperty("apikey", key)
      conn.setRequestProperty("Authorization", "Bearer $key")
      conn.setRequestProperty("Content-Type", "application/json")
      if (prefer != null) conn.setRequestProperty("Prefer", prefer)
      if (body != null) {
        conn.doOutput = true
        conn.outputStream.use { it.write(body.toByteArray()) }
      }
      return conn.responseCode
    } finally {
      conn.disconnect()
    }
  }

  private fun requestForBody(method: String, url: String, key: String): String? {
    val conn = URL(url).openConnection() as HttpURLConnection
    try {
      conn.requestMethod = method
      conn.connectTimeout = 10000
      conn.readTimeout = 10000
      conn.setRequestProperty("apikey", key)
      conn.setRequestProperty("Authorization", "Bearer $key")
      if (conn.responseCode !in 200..299) return null
      return conn.inputStream.bufferedReader().use { it.readText() }
    } finally {
      conn.disconnect()
    }
  }

  private fun stopTracking() {
    getSharedPreferences(PREFS, Context.MODE_PRIVATE).edit().putBoolean(KEY_ENABLED, false).apply()
    if (updatesStarted) {
      fused.removeLocationUpdates(callback)
      updatesStarted = false
    }
    stopForeground(STOP_FOREGROUND_REMOVE)
    stopSelf()
  }

  override fun onDestroy() {
    if (updatesStarted) {
      fused.removeLocationUpdates(callback)
      updatesStarted = false
    }
    io.shutdown()
    super.onDestroy()
  }

  private fun buildNotification(): Notification {
    val manager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (Build.VERSION.SDK_INT >= 26) {
      manager.createNotificationChannel(
        NotificationChannel(CHANNEL_ID, "Delivery tracking", NotificationManager.IMPORTANCE_LOW)
      )
    }
    val open =
      PendingIntent.getActivity(
        this,
        0,
        Intent(this, MainActivity::class.java),
        PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT,
      )
    return NotificationCompat.Builder(this, CHANNEL_ID)
      .setSmallIcon(applicationInfo.icon)
      .setContentTitle("Coconut Driver")
      .setContentText("Sharing your location with customers while orders are in transit")
      .setOngoing(true)
      .setContentIntent(open)
      .setCategory(NotificationCompat.CATEGORY_SERVICE)
      .build()
  }

  companion object {
    const val TAG = "DriverLocationService"
    const val ACTION_STOP = "com.sedadriverapp.STOP_TRACKING"
    const val PREFS = "driver_location_tracking"
    const val KEY_ENABLED = "enabled"
    const val KEY_URL = "supabase_url"
    const val KEY_KEY = "supabase_key"
    const val KEY_DRIVER_ID = "driver_id"
    private const val CHANNEL_ID = "driver_location_tracking"
    private const val NOTIFICATION_ID = 92901
    private const val UPLOAD_INTERVAL_MS = 10_000L
    private const val ORDER_REFRESH_MS = 60_000L
  }
}
