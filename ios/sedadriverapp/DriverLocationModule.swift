import Foundation
import React

@objc(DriverLocation)
class DriverLocation: NSObject {
  @objc static func requiresMainQueueSetup() -> Bool { false }

  @objc(start:supabaseKey:driverId:resolver:rejecter:)
  func start(
    _ supabaseUrl: String,
    supabaseKey: String,
    driverId: Double,
    resolver resolve: RCTPromiseResolveBlock,
    rejecter reject: RCTPromiseRejectBlock
  ) {
    DriverLocationTracker.shared.start(url: supabaseUrl, key: supabaseKey, driverId: Int(driverId))
    resolve(true)
  }

  @objc(stop:rejecter:)
  func stop(resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock) {
    DriverLocationTracker.shared.stop()
    resolve(true)
  }

  // Android-only concepts; present so shared JS can call them on both platforms.
  @objc(isIgnoringBatteryOptimizations:rejecter:)
  func isIgnoringBatteryOptimizations(
    resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock
  ) {
    resolve(true)
  }

  @objc(openBatterySettings:rejecter:)
  func openBatterySettings(
    resolver resolve: RCTPromiseResolveBlock, rejecter reject: RCTPromiseRejectBlock
  ) {
    resolve(false)
  }
}
