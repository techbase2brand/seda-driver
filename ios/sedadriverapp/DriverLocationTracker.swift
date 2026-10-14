import Foundation
import CoreLocation

/// Posts the driver's GPS position to Supabase while any of their orders is
/// 'in transit'. Entirely native (no JS), so it keeps going while the app is in
/// the background, and - because of significant-location-change monitoring -
/// iOS relaunches the app after a swipe-kill so it can carry on (needs the
/// "Always" location permission).
final class DriverLocationTracker: NSObject, CLLocationManagerDelegate {
  static let shared = DriverLocationTracker()

  private let manager = CLLocationManager()
  private let defaults = UserDefaults.standard
  private let queue = DispatchQueue(label: "driver.location.upload")

  private let enabledKey = "dlt_enabled"
  private let urlKey = "dlt_url"
  private let keyKey = "dlt_key"
  private let driverKey = "dlt_driver_id"

  private let uploadInterval: TimeInterval = 10
  private let orderRefreshInterval: TimeInterval = 60

  private var running = false // main thread only
  private var orderIds: [Int] = []
  private var lastOrderRefresh = Date.distantPast
  private var lastUpload = Date.distantPast

  func start(url: String, key: String, driverId: Int) {
    defaults.set(url, forKey: urlKey)
    defaults.set(key, forKey: keyKey)
    defaults.set(driverId, forKey: driverKey)
    defaults.set(true, forKey: enabledKey)
    begin()
  }

  func stop() {
    defaults.set(false, forKey: enabledKey)
    end()
  }

  /// Called from AppDelegate on every launch, including the relaunch iOS does
  /// after a location event for a killed app.
  func resumeIfEnabled() {
    if defaults.bool(forKey: enabledKey) {
      begin()
    }
  }

  private func begin() {
    DispatchQueue.main.async {
      if self.running { return }
      self.manager.delegate = self
      self.manager.desiredAccuracy = kCLLocationAccuracyBest
      self.manager.distanceFilter = kCLDistanceFilterNone
      self.manager.pausesLocationUpdatesAutomatically = false
      self.manager.allowsBackgroundLocationUpdates = true
      self.manager.showsBackgroundLocationIndicator = true

      let status = self.manager.authorizationStatus
      if status == .notDetermined || status == .authorizedWhenInUse {
        self.manager.requestAlwaysAuthorization()
      }

      self.lastOrderRefresh = Date.distantPast
      self.manager.startUpdatingLocation()
      self.manager.startMonitoringSignificantLocationChanges()
      self.running = true
    }
  }

  private func end() {
    DispatchQueue.main.async {
      guard self.running else { return }
      self.manager.stopUpdatingLocation()
      self.manager.stopMonitoringSignificantLocationChanges()
      self.running = false
    }
  }

  func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
    guard let location = locations.last else { return }
    let now = Date()
    if now.timeIntervalSince(lastUpload) < uploadInterval - 2 { return }
    lastUpload = now

    queue.async { self.upload(location, now: now) }
  }

  func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
    NSLog("DriverLocationTracker: location error \(error.localizedDescription)")
  }

  private func upload(_ location: CLLocation, now: Date) {
    guard
      let url = defaults.string(forKey: urlKey),
      let key = defaults.string(forKey: keyKey),
      defaults.integer(forKey: driverKey) != 0
    else { return }
    let driverId = defaults.integer(forKey: driverKey)

    if now.timeIntervalSince(lastOrderRefresh) > orderRefreshInterval {
      let query = "\(url)/rest/v1/orders?select=id&driver_id=eq.\(driverId)&deliveryStatus=eq.in%20transit"
      if let data = send("GET", query, key, nil, nil).data,
         let json = try? JSONSerialization.jsonObject(with: data) as? [[String: Any]] {
        orderIds = json.compactMap { $0["id"] as? Int }
        lastOrderRefresh = now
      }
    }

    if orderIds.isEmpty && lastOrderRefresh != Date.distantPast {
      // Nothing in transit any more - nothing left to share.
      defaults.set(false, forKey: enabledKey)
      end()
      return
    }

    let iso = ISO8601DateFormatter()
    iso.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
    let stamp = iso.string(from: now)
    let rows: [[String: Any]] = orderIds.map {
      [
        "order_id": $0,
        "driver_id": driverId,
        "latitude": location.coordinate.latitude,
        "longitude": location.coordinate.longitude,
        "updated_at": stamp,
      ]
    }
    guard !rows.isEmpty, let body = try? JSONSerialization.data(withJSONObject: rows) else { return }

    let code = send(
      "POST",
      "\(url)/rest/v1/driver_locations?on_conflict=order_id",
      key,
      body,
      "resolution=merge-duplicates,return=minimal"
    ).status
    NSLog("DriverLocationTracker: sent \(location.coordinate.latitude),\(location.coordinate.longitude) for \(orderIds) -> HTTP \(code ?? -1)")
  }

  private func send(_ method: String, _ urlString: String, _ key: String, _ body: Data?, _ prefer: String?)
    -> (status: Int?, data: Data?)
  {
    guard let url = URL(string: urlString) else { return (nil, nil) }
    var request = URLRequest(url: url)
    request.httpMethod = method
    request.timeoutInterval = 10
    request.setValue(key, forHTTPHeaderField: "apikey")
    request.setValue("Bearer \(key)", forHTTPHeaderField: "Authorization")
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    if let prefer = prefer { request.setValue(prefer, forHTTPHeaderField: "Prefer") }
    request.httpBody = body

    let semaphore = DispatchSemaphore(value: 0)
    var status: Int?
    var data: Data?
    URLSession.shared.dataTask(with: request) { responseData, response, _ in
      status = (response as? HTTPURLResponse)?.statusCode
      data = responseData
      semaphore.signal()
    }.resume()
    _ = semaphore.wait(timeout: .now() + 12)

    if let status = status, !(200..<300).contains(status) { return (status, nil) }
    return (status, data)
  }
}
