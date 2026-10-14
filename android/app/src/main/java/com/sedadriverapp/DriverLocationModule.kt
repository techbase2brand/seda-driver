package com.sedadriverapp

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import androidx.core.content.ContextCompat
import com.facebook.react.ReactPackage
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.uimanager.ViewManager

class DriverLocationModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName() = "DriverLocation"

  /** Saves the config and (re)starts the native service. Safe to call repeatedly. */
  @ReactMethod
  fun start(supabaseUrl: String, supabaseKey: String, driverId: Double, promise: Promise) {
    try {
      reactContext
        .getSharedPreferences(DriverLocationService.PREFS, Context.MODE_PRIVATE)
        .edit()
        .putBoolean(DriverLocationService.KEY_ENABLED, true)
        .putString(DriverLocationService.KEY_URL, supabaseUrl)
        .putString(DriverLocationService.KEY_KEY, supabaseKey)
        .putLong(DriverLocationService.KEY_DRIVER_ID, driverId.toLong())
        .apply()
      ContextCompat.startForegroundService(
        reactContext,
        Intent(reactContext, DriverLocationService::class.java),
      )
      promise.resolve(true)
    } catch (e: Exception) {
      promise.reject("START_FAILED", e)
    }
  }

  @ReactMethod
  fun stop(promise: Promise) {
    try {
      reactContext
        .getSharedPreferences(DriverLocationService.PREFS, Context.MODE_PRIVATE)
        .edit()
        .putBoolean(DriverLocationService.KEY_ENABLED, false)
        .apply()
      reactContext.startService(
        Intent(reactContext, DriverLocationService::class.java)
          .setAction(DriverLocationService.ACTION_STOP)
      )
      promise.resolve(true)
    } catch (e: Exception) {
      // Service not running - nothing to stop.
      promise.resolve(false)
    }
  }

  @ReactMethod
  fun isIgnoringBatteryOptimizations(promise: Promise) {
    val pm = reactContext.getSystemService(Context.POWER_SERVICE) as PowerManager
    promise.resolve(pm.isIgnoringBatteryOptimizations(reactContext.packageName))
  }

  /** Opens the system battery-optimisation list (no special permission needed). */
  @ReactMethod
  fun openBatterySettings(promise: Promise) {
    try {
      val intent =
        Intent(Settings.ACTION_IGNORE_BATTERY_OPTIMIZATION_SETTINGS).addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
      reactContext.startActivity(intent)
      promise.resolve(true)
    } catch (e: Exception) {
      try {
        reactContext.startActivity(
          Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS, Uri.parse("package:${reactContext.packageName}"))
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        )
        promise.resolve(true)
      } catch (e2: Exception) {
        promise.resolve(false)
      }
    }
  }
}

class DriverLocationPackage : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext) =
    listOf(DriverLocationModule(reactContext))

  override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> =
    emptyList()
}
