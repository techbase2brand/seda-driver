#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE (DriverLocation, NSObject)

RCT_EXTERN_METHOD(start : (NSString *)supabaseUrl supabaseKey : (NSString *)supabaseKey driverId : (double)
                      driverId resolver : (RCTPromiseResolveBlock)resolve rejecter : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(stop : (RCTPromiseResolveBlock)resolve rejecter : (RCTPromiseRejectBlock)reject)
RCT_EXTERN_METHOD(isIgnoringBatteryOptimizations : (RCTPromiseResolveBlock)resolve rejecter : (RCTPromiseRejectBlock)
                      reject)
RCT_EXTERN_METHOD(openBatterySettings : (RCTPromiseResolveBlock)resolve rejecter : (RCTPromiseRejectBlock)reject)

@end
