import { useEffect, useState } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import {
  requestIOSLocationPermission,
  hasForegroundLocation,
  requestAndroidLocationPermission,
  hasBackgroundLocation,
  requestBackgroundLocationPermission,
  fetchLocationWithFallback,
} from '../utils/locationPermissions';

/**
 * Background driver-location tracking.
 *
 * Spec: while a driver has one or more orders with deliveryStatus
 * 'in transit', post the device's GPS position to `driver_locations` every
 * 10-15s, upserted per (driver_id, order_id) - not just driver_id, so the
 * customer app's "Track Order" screen for an older order never shows the
 * driver's position from whatever job they are on right now. Stop the moment
 * an order leaves 'in transit' (completed, cancelled, unable to deliver).
 *
 * There is no single reliable "driver logged in" event in this app (see
 * App.tsx - the top-level auth state is only read once at cold start; every
 * login/logout after that happens by navigating within nested stacks, not by
 * changing that state). So instead of hanging this off a login event, each
 * tick independently re-reads the driver id from AsyncStorage and re-queries
 * which orders are 'in transit' right now. That makes the service correct
 * across logout/login/re-login without needing a teardown hook at every call
 * site that clears the session.
 */

const TICK_INTERVAL_MS = 12000; // within the spec's 10-15s window

let intervalId = null;
let ticking = false; // reentrancy guard - a slow tick must not overlap the next
let hasAskedForegroundThisSession = false;
let hasAskedBackgroundThisSession = false;

let status = {
  active: false,
  orderIds: [],
  lastPingAt: null,
  lastError: null,
};

const listeners = new Set();

function publish(next) {
  status = { ...status, ...next };
  listeners.forEach(listener => listener(status));
}

async function ensureForegroundPermission() {
  if (Platform.OS === 'ios') {
    // iOS shows its own dialog once and never again, so calling this when the
    // driver already answered is free and silent.
    await requestIOSLocationPermission();
    return true;
  }

  if (await hasForegroundLocation()) {
    return true;
  }

  if (hasAskedForegroundThisSession) {
    // Already asked once and it is still missing - the driver said no.
    // Don't re-prompt every 12 seconds; they can grant it from Settings.
    return false;
  }

  hasAskedForegroundThisSession = true;
  return requestAndroidLocationPermission();
}

async function ensureBackgroundPermissionBestEffort() {
  if (Platform.OS !== 'android') {
    return;
  }
  if (await hasBackgroundLocation()) {
    return;
  }
  if (hasAskedBackgroundThisSession) {
    return;
  }
  hasAskedBackgroundThisSession = true;

  // Lightweight rationale before the OS dialog - Android policy expects
  // context before asking for background location, and this keeps that
  // context consistent with the explanation on the map/navigate screen.
  await new Promise(resolve => {
    Alert.alert(
      'Share location while delivering',
      'Coconut Driver shares your location with the customer while an order is in transit, including when the app is minimised. You can allow this from the next prompt.',
      [{ text: 'Continue', onPress: resolve }],
      { cancelable: false },
    );
  });

  const result = await requestBackgroundLocationPermission();
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
    console.log(
      'driverLocationTracking: background location permanently denied - tracking will only run while the app is open',
    );
  }
}

async function fetchInTransitOrderIds(driverId) {
  const { data, error } = await supabase
    .from('orders')
    .select('id')
    .eq('driver_id', driverId)
    .eq('deliveryStatus', 'in transit');

  if (error) {
    console.log('driverLocationTracking: fetch in-transit orders failed', error);
    return [];
  }

  return (data || []).map(row => row.id);
}

async function tick() {
  if (ticking) {
    return; // previous tick (slow GPS fix, slow network) still running
  }
  ticking = true;

  try {
    const [token, driverIdRaw] = await Promise.all([
      AsyncStorage.getItem('token'),
      AsyncStorage.getItem('driver_id'),
    ]);
    const driverId = driverIdRaw ? Number(driverIdRaw) : null;

    if (!token || !driverId) {
      publish({ active: false, orderIds: [], lastError: null });
      return;
    }

    const orderIds = await fetchInTransitOrderIds(driverId);

    if (orderIds.length === 0) {
      publish({ active: false, orderIds: [], lastError: null });
      return;
    }

    const foregroundGranted = await ensureForegroundPermission();
    if (!foregroundGranted) {
      publish({
        active: false,
        orderIds,
        lastError: 'Location permission not granted',
      });
      return;
    }

    // Best-effort: never let a background-permission prompt block sending the
    // foreground location update below.
    ensureBackgroundPermissionBestEffort().catch(err =>
      console.log('driverLocationTracking: background permission step failed', err),
    );

    const position = await fetchLocationWithFallback();
    const { latitude, longitude } = position.coords;

    const rows = orderIds.map(orderId => ({
      order_id: orderId,
      driver_id: driverId,
      latitude,
      longitude,
      updated_at: new Date().toISOString(),
    }));

    const { error: upsertError } = await supabase
      .from('driver_locations')
      .upsert(rows, { onConflict: 'order_id' });

    if (upsertError) {
      console.log('driverLocationTracking: upsert failed', upsertError);
      publish({ active: true, orderIds, lastError: upsertError.message });
      return;
    }

    console.log(
      `driverLocationTracking: sent (${latitude.toFixed(5)}, ${longitude.toFixed(5)}) for order(s) ${orderIds.join(', ')}`,
    );
    publish({
      active: true,
      orderIds,
      lastPingAt: new Date(),
      lastError: null,
    });
  } catch (err) {
    console.log('driverLocationTracking: tick failed', err);
    publish({ lastError: err?.message || String(err) });
  } finally {
    ticking = false;
  }
}

/** Idempotent - safe to call more than once (e.g. app foreground events). */
export function startDriverLocationTracking() {
  if (intervalId) {
    return;
  }
  tick(); // don't wait a full interval for the first update
  intervalId = setInterval(tick, TICK_INTERVAL_MS);
}

export function stopDriverLocationTracking() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  hasAskedForegroundThisSession = false;
  hasAskedBackgroundThisSession = false;
  publish({ active: false, orderIds: [], lastPingAt: null, lastError: null });
}

/** For the small in-app indicator - read-only, does not start/stop anything. */
export function useDriverLocationTrackingStatus() {
  const [value, setValue] = useState(status);

  useEffect(() => {
    listeners.add(setValue);
    return () => listeners.delete(setValue);
  }, []);

  return value;
}
