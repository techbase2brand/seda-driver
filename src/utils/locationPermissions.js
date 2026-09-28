import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

// Shared between DriverMapScreen (one-off navigation) and the background
// driver-location-tracking service (continuous, order-scoped). Extracted so
// both consumers ask for permission the same way - once, and only when it is
// actually still missing.

const IOS_PERMISSION_TIMEOUT_MS = 15000;

/**
 * Requests iOS "when in use" / "always" location permission.
 * Resolves true/false; never hangs.
 */
export async function requestIOSLocationPermission() {
  if (Platform.OS !== 'ios') {
    return true;
  }

  Geolocation.setRNConfiguration({
    skipPermissionRequests: false,
    authorizationLevel: 'always',
  });

  return new Promise(resolve => {
    let settled = false;

    const finish = value => {
      if (settled) {
        return;
      }
      settled = true;
      clearTimeout(timer);
      resolve(value);
    };

    // iOS does not always invoke either callback - most commonly when the user
    // picks "Allow While Using App" while we asked for "always". Without this
    // timeout a caller waiting on this promise can hang forever (a modal with
    // no way out, or a tracking loop that never starts).
    // Resolving true lets the caller continue: if location really is blocked,
    // the subsequent position fetch fails and surfaces its own error.
    const timer = setTimeout(() => finish(true), IOS_PERMISSION_TIMEOUT_MS);

    Geolocation.requestAuthorization(
      () => finish(true),
      () => finish(false),
    );
  });
}

/** True when Android foreground location is already granted. */
export async function hasForegroundLocation() {
  if (Platform.OS !== 'android') {
    return false;
  }

  const fine = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  const coarse = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
  return (
    (await PermissionsAndroid.check(fine)) ||
    (await PermissionsAndroid.check(coarse))
  );
}

export async function requestAndroidLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }
  const fine = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  const coarse = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
  const result = await PermissionsAndroid.requestMultiple([fine, coarse]);
  return (
    result[fine] === PermissionsAndroid.RESULTS.GRANTED ||
    result[coarse] === PermissionsAndroid.RESULTS.GRANTED
  );
}

/** True when Android background location is already granted, or not needed. */
export async function hasBackgroundLocation() {
  if (Platform.OS !== 'android' || Platform.Version < 29) {
    return true;
  }
  return PermissionsAndroid.check(
    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
  );
}

/** Requests Android background location. Returns a PermissionsAndroid.RESULTS value. */
export async function requestBackgroundLocationPermission() {
  if (Platform.OS !== 'android' || Platform.Version < 29) {
    return PermissionsAndroid.RESULTS.GRANTED;
  }

  return PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
  );
}

const getCurrentPositionAsync = options =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, options);
  });

/**
 * Gets a position fast, then falls back to a slower high-accuracy read.
 * A coarse/cached fix is enough for most uses here; asking for high accuracy
 * first can mean waiting 20-25s for a GPS lock, especially indoors.
 */
export async function fetchLocationWithFallback() {
  try {
    return await getCurrentPositionAsync({
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 600000,
    });
  } catch (e1) {
    console.log('locationPermissions: no quick fix available, trying GPS', e1);
    return await getCurrentPositionAsync({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0,
    });
  }
}
