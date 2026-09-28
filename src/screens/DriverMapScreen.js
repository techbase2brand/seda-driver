// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   StyleSheet,
//   ActivityIndicator,
//   Alert,
//   TouchableOpacity,
//   Text,
//   Platform,
// } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import MapViewDirections from 'react-native-maps-directions';
// import Geolocation from '@react-native-community/geolocation';
// import Icon from 'react-native-vector-icons/Ionicons';
// import Color from '../constants/Color';
// import { supabase } from '../lib/supabase';
// const GOOGLE_MAPS_APIKEY = 'AIzaSyBXNyT9zcGdvhAUCUEYTm6e_qPw26AOPgI';

// const DriverMapScreen = ({ navigation, route }) => {
//   const mapRef = useRef(null);

//   const deliveryAddress = route?.params?.address;
//   const orderId = route?.params?.order?.id;
//   const driverId = route?.params?.order?.driver_id;

//   const selectedAddress = Array.isArray(deliveryAddress)
//   && deliveryAddress.find(item => item.isSelected === true)
//   // : deliveryAddress;

//   console.log("deliveryAddressdeliveryAddress",deliveryAddress,selectedAddress);

//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [destination, setDestination] = useState(null);
//   const [loading, setLoading] = useState(true);

//   //  Build address string
//   const buildAddressString = address =>
//     [address.street, address.city, address.state, address.zipCode]
//       .filter(Boolean)
//       .join(', ');

//   //  Initial load
//   useEffect(() => {
//     getCurrentLocation();

//     if (selectedAddress || deliveryAddress) {
//       const addressString = buildAddressString(selectedAddress);
//       getCoordinatesFromAddress(addressString || deliveryAddress);
//     }
//   }, []);

//   //  Track location every 5 seconds
//   // useEffect(() => {
//   //   let intervalId;

//   //   if (driverId && orderId) {
//   //     intervalId = setInterval(() => {
//   //       // trackAndSaveLocation();
//   //     }, 5000);
//   //   }

//   //   return () => {
//   //     if (intervalId) clearInterval(intervalId);
//   //   };
//   // }, [driverId, orderId]);

//   // Get current GPS
//   const getCurrentLocation = () => {
//     Geolocation.getCurrentPosition(
//       position => {
//         const { latitude, longitude } = position.coords;
//         setCurrentLocation({ latitude, longitude });
//         setLoading(false);
//       },
//       error => {
//         console.log(error);
//         Alert.alert('Error', 'Unable to fetch location');
//         setLoading(false);
//       },
//       {
//         enableHighAccuracy: true,
//         timeout: 15000,
//         maximumAge: 10000,
//       },
//     );
//   };

//   useEffect(() => {
//     const watchId = Geolocation.watchPosition(
//       async position => {
//         const { latitude, longitude } = position.coords;

//         setCurrentLocation({ latitude, longitude });
//         await saveLocationToSupabase(latitude, longitude);
//       },
//       error => console.log(error),
//       {
//         enableHighAccuracy: true,
//         distanceFilter: 10, // 10 meters move hone par
//       },
//     );

//     return () => Geolocation.clearWatch(watchId);
//   }, []);

//   //  Track + save
//   const trackAndSaveLocation = () => {
//     Geolocation.getCurrentPosition(
//       async position => {
//         const { latitude, longitude } = position.coords;

//         setCurrentLocation({ latitude, longitude });

//         await saveLocationToSupabase(latitude, longitude);
//       },
//       error => {
//         console.log('Tracking error:', error);
//       },
//       {
//         enableHighAccuracy: true,
//         maximumAge: 0,
//       },
//     );
//   };

//   //  Save to Supabase (UPSERT)
//   //   const saveLocationToSupabase = async (lat, lng) => {
//   //     try {
//   //       const { error } = await supabase.from('driver_locations').upsert(
//   //         {
//   //           driver_id: driverId,
//   //           order_id: orderId,
//   //           latitude: lat,
//   //           longitude: lng,
//   //           updated_at: new Date(),
//   //         },
//   //       );

//   //       if (error) {
//   //         console.log('Supabase error:', error);
//   //       } else {
//   //         console.log('Location saved:', lat, lng,driverId,
//   //           orderId,);
//   //       }
//   //     } catch (err) {
//   //       console.log('Save failed:', err);
//   //     }
//   //   };
//   const saveLocationToSupabase = async (lat, lng) => {
//     try {
//       const { error } = await supabase.from('driver_locations').upsert(
//         {
//           order_id: orderId, //UNIQUE KEY
//           driver_id: driverId,
//           latitude: lat,
//           longitude: lng,
//           updated_at: new Date(),
//         },
//         {
//           onConflict: 'order_id',
//         },
//       );

//       if (error) {
//         console.log('Supabase error:', error);
//       } else {
//         console.log('Location updated for order:', orderId, lat, lng);
//       }
//     } catch (err) {
//       console.log('Save failed:', err);
//     }
//   };

//   // 🔹 Address → Coordinates
//   const getCoordinatesFromAddress = async address => {
//     console.log("getCoordinatesFromAddress>>>",address);

//     try {
//       const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//         address,
//       )}&key=${GOOGLE_MAPS_APIKEY}`;

//       const response = await fetch(url);
//       const json = await response.json();

//       if (json.results?.length > 0) {
//         const location = json.results[0].geometry.location;
//         setDestination({
//           latitude: location.lat,
//           longitude: location.lng,
//         });
//       } else {
//         Alert.alert('Error', 'Location not found');
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert('Error', 'Failed to fetch destination');
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading || !currentLocation || !destination) {
//     return (
//       <View style={styles.loader}>
//         <ActivityIndicator size="large" />
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Header */}
//       <View style={styles.header}>
//         <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
//           <TouchableOpacity onPress={() => navigation.goBack()}>
//             <Icon name="arrow-back" size={22} color={Color.WHITE} />
//           </TouchableOpacity>
//           <Text style={styles.title}>Delivery Address</Text>
//         </View>
//       </View>

//       {/* Map */}
//       <MapView
//         ref={mapRef}
//         style={StyleSheet.absoluteFill}
//         showsUserLocation
//         followsUserLocation
//         initialRegion={{
//           latitude: currentLocation.latitude,
//           longitude: currentLocation.longitude,
//           latitudeDelta: 0.05,
//           longitudeDelta: 0.05,
//         }}
//       >
//         <Marker coordinate={currentLocation} title="Your Location" />
//         <Marker coordinate={destination} title={selectedAddress?.street || deliveryAddress} />

//         <MapViewDirections
//           origin={currentLocation}
//           destination={destination}
//           apikey={GOOGLE_MAPS_APIKEY}
//           strokeWidth={5}
//           strokeColor="#1E90FF"
//           onReady={result => {
//             mapRef.current.fitToCoordinates(result.coordinates, {
//               edgePadding: {
//                 top: 50,
//                 bottom: 50,
//                 left: 50,
//                 right: 50,
//               },
//             });
//           }}
//         />
//       </MapView>
//     </View>
//   );
// };

// export default DriverMapScreen;

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     backgroundColor: Color.PRIMARY,
//     paddingTop: 50,
//     paddingHorizontal: 20,
//     paddingBottom: 20,
//     zIndex: 10,
//   },
//   title: {
//     color: Color.WHITE,
//     fontSize: 18,
//     fontWeight: '700',
//   },
// });

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
  Platform,
  PermissionsAndroid,
  Modal,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons';
import Color from '../constants/Color';
import { fontFamilyHeading } from '../constants/Fonts';
import { supabase } from '../lib/supabase';
import { GOOGLE_MAPS_APIKEY } from '../constants/Constants';
import { buildAddressString } from '../utils';
import {
  requestIOSLocationPermission,
  hasForegroundLocation,
  requestAndroidLocationPermission,
  hasBackgroundLocation,
  requestBackgroundLocationPermission,
  fetchLocationWithFallback,
} from '../utils/locationPermissions';

/** Rejects if a promise never settles, so the UI can never hang forever. */
const withTimeout = (promise, ms, label) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out`)), ms),
    ),
  ]);

/** Rough metres between two coordinates (haversine). */
const distanceInMetres = (a, b) => {
  if (!a || !b) return Infinity;

  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371000;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
};

// How far the driver must move before we ask Google for a fresh route. The
// marker follows every GPS tick, but redrawing the route on every tick would
// fire a Directions request every couple of seconds while driving.
const ROUTE_REFRESH_METRES = 150;

const DriverMapScreen = ({ navigation, route }) => {
  const mapRef = useRef(null);
  const disclosureResolverRef = useRef(null);
  const mountedRef = useRef(true);

  const deliveryAddress = route?.params?.address;
  const orderId = route?.params?.order?.id;
  const driverId = route?.params?.order?.driver_id;

  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(null);
  const [destinationError, setDestinationError] = useState(null);
  const [showBackgroundDisclosure, setShowBackgroundDisclosure] = useState(false);
  // Route origin is throttled separately from the live marker position.
  const [routeOrigin, setRouteOrigin] = useState(null);
  const [routeError, setRouteError] = useState(null);
  const hasFittedRouteRef = useRef(false);
  const routeCoordsRef = useRef(null);

  const saveLocationToSupabase = useCallback(async (lat, lng) => {
    try {
      const { error } = await supabase.from('driver_locations').upsert(
        {
          order_id: orderId,
          driver_id: driverId,
          latitude: lat,
          longitude: lng,
          updated_at: new Date(),
        },
        { onConflict: 'order_id' },
      );

      if (error) {
        console.log('Supabase error:', error);
      } else {
        console.log('Location updated:', lat, lng);
      }
    } catch (err) {
      console.log('Save failed:', err);
    }
  }, [orderId, driverId]);

  const getCoordinatesFromAddress = useCallback(async address => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        address,
      )}&key=${GOOGLE_MAPS_APIKEY}`;

      const response = await withTimeout(fetch(url), 15000, 'Geocoding');
      const json = await response.json();

      if (json.results?.length > 0) {
        const location = json.results[0].geometry.location;
        setDestination({
          latitude: location.lat,
          longitude: location.lng,
        });
      } else {
        setDestination(null);
        setDestinationError('Could not find that address on the map.');
        Alert.alert('Error', 'Location not found');
      }
    } catch (error) {
      console.log(error);
      setDestination(null);
      setDestinationError('Could not load the delivery address.');
      Alert.alert('Error', 'Failed to fetch destination');
    }
  }, []);

  const askLocationDisclosureConsent = useCallback(() => {
    return new Promise(resolve => {
      disclosureResolverRef.current = resolve;
      setShowBackgroundDisclosure(true);
    });
  }, []);

  const settleDisclosure = useCallback(granted => {
    if (disclosureResolverRef.current) {
      disclosureResolverRef.current(granted);
      disclosureResolverRef.current = null;
    }
  }, []);

  const handleBackgroundDisclosureContinue = useCallback(async () => {
    // Hide our sheet straight away so the driver never sees a frozen screen
    // while the system permission dialog is up.
    setShowBackgroundDisclosure(false);

    let granted = true;
    if (Platform.OS === 'ios') {
      granted = await requestIOSLocationPermission();
    }

    settleDisclosure(granted);
  }, [settleDisclosure]);

  const handleBackgroundDisclosureSkip = useCallback(() => {
    setShowBackgroundDisclosure(false);
    settleDisclosure(false);
  }, [settleDisclosure]);

  /**
   * Brings the whole route back into view. The camera is deliberately left
   * alone after the first fit so it never yanks while the driver is panning,
   * which means they need a way to get the overview back.
   */
  const handleRecenter = useCallback(() => {
    if (!mapRef.current) {
      return;
    }

    const coords = routeCoordsRef.current?.length
      ? routeCoordsRef.current
      : [currentLocation, destination].filter(Boolean);

    if (!coords.length) {
      return;
    }

    mapRef.current.fitToCoordinates(coords, {
      edgePadding: { top: 80, bottom: 120, left: 60, right: 60 },
      animated: true,
    });
  }, [currentLocation, destination]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (disclosureResolverRef.current) {
        disclosureResolverRef.current(false);
        disclosureResolverRef.current = null;
      }
    };
  }, []);

  const loadMapData = useCallback(async () => {
    setLocationError(null);
    setDestinationError(null);
    setDestination(null);
    setCurrentLocation(null);
    setRouteOrigin(null);
    setRouteError(null);
    hasFittedRouteRef.current = false;
    routeCoordsRef.current = null;
    setLoading(true);

    const finalAddress = buildAddressString(deliveryAddress);
    console.log('FINAL ADDRESS >>>', finalAddress);

    const geoPromise = finalAddress
      ? getCoordinatesFromAddress(finalAddress)
      : Promise.resolve();

    try {
      // 1. Foreground location.
      //    iOS shows its own dialog once and never again, so calling this when
      //    the driver already answered costs nothing and shows no popup.
      //    On Android we check first, so an allowed driver is never re-asked.
      if (Platform.OS === 'ios') {
        await requestIOSLocationPermission();
      } else if (!(await hasForegroundLocation())) {
        const granted = await requestAndroidLocationPermission();
        if (!granted) {
          setLocationError(
            'Location permission is needed to show you the route. Please allow location access, then tap "Try again".',
          );
          await geoPromise.catch(() => {});
          return;
        }
      }

      // The native callbacks are not guaranteed to fire (a simulator with no
      // location set never calls back at all), so race our own deadline -
      // otherwise the screen sits on the spinner for ever with no error.
      const position = await withTimeout(
        fetchLocationWithFallback(),
        35000,
        'Location',
      );
      const { latitude, longitude } = position.coords;
      setCurrentLocation({ latitude, longitude });
      setRouteOrigin({ latitude, longitude });

      if (!finalAddress) {
        setDestinationError(
          'No delivery address was found for this order.',
        );
      }
    } catch (error) {
      console.log('DriverMap: location error', error);
      setLocationError(
        'Unable to fetch your location. Turn on GPS or try again in an open area.',
      );
      Alert.alert('Error', 'Unable to fetch location');
    } finally {
      await geoPromise.catch(() => {});
      setLoading(false);
    }

    // Background location - Android only, and optional. Asked only after the
    // map has already loaded, so this consent sheet (which waits on the
    // driver to tap Allow/Not now, and used to run before the location fetch
    // even started) never holds up the spinner. We ask only while the
    // permission is still missing: once the driver allows it,
    // hasBackgroundLocation() is true and the sheet never appears again. If
    // they decline we do ask next time, so nobody who said yes gets nagged
    // and nobody who said no is silently dropped.
    if (
      mountedRef.current &&
      Platform.OS === 'android' &&
      !(await hasBackgroundLocation())
    ) {
      const consentGiven = await askLocationDisclosureConsent();

      if (consentGiven) {
        const result = await requestBackgroundLocationPermission();

        if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          // Android will not show its dialog any more, so our sheet alone
          // would be a dead end. Point them at Settings instead.
          Alert.alert(
            'Allow background location',
            'Android has stopped asking for this permission. To turn on live tracking, open Settings > Apps > Coconut Driver > Permissions > Location and choose "Allow all the time".',
          );
        } else if (result !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log(
            'DriverMap: background location declined - live tracking will only run while the app is open',
          );
        }
      }
    }
  }, [
    deliveryAddress,
    getCoordinatesFromAddress,
    askLocationDisclosureConsent,
  ]);

  useEffect(() => {
    loadMapData();
  }, [loadMapData]);

  const hasLocationFix = currentLocation != null;

  useEffect(() => {
    if (!hasLocationFix) {
      return undefined;
    }
    const watchId = Geolocation.watchPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        const next = { latitude, longitude };

        setCurrentLocation(next);

        // Redraw the route only once the driver has actually moved a block or
        // so. This is what makes the route follow the driver instead of
        // staying on the line drawn when the screen opened.
        setRouteOrigin(prev => {
          const moved = distanceInMetres(prev, next);
          if (moved > ROUTE_REFRESH_METRES) {
            console.log(
              'DriverMap: route origin refreshed, moved',
              Math.round(moved),
              'm',
            );
            return next;
          }
          return prev;
        });

        await saveLocationToSupabase(latitude, longitude);
      },
      err => console.log('DriverMap: watchPosition', err),
      {
        // Must be GPS. With enableHighAccuracy:false Android serves a coarse
        // network fix that barely reports while driving, so currentLocation
        // hardly changed and the route never refreshed.
        enableHighAccuracy: true,
        distanceFilter: 25,
        interval: 5000,
        fastestInterval: 2000,
      },
    );

    return () => Geolocation.clearWatch(watchId);
  }, [hasLocationFix, saveLocationToSupabase]);

  const mapErrorMessage = locationError || destinationError;
  const backgroundDisclosureModal = (
    <Modal
      visible={showBackgroundDisclosure}
      transparent
      animationType="fade"
      onRequestClose={handleBackgroundDisclosureSkip}
    >
      <View style={styles.disclosureBackdrop}>
        <View style={styles.disclosureCard}>
          <Text style={styles.disclosureTitle}>Allow background location</Text>
          <Text style={styles.disclosureBody}>
            We use your location in the background only while you are on an active
            delivery so customers can see live driver tracking and dispatch can
            manage orders accurately.
          </Text>
          <Text style={styles.disclosureBody}>
            Your location is used for delivery operations and is not sold to third
            parties.
          </Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleBackgroundDisclosureContinue}
          >
            <Text style={styles.retryButtonText}>Allow</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={handleBackgroundDisclosureSkip}
          >
            <Text style={styles.secondaryButtonText}>Not now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (mapErrorMessage) {
    return (
      <View style={styles.container}>
        <View style={styles.loader}>
          <Text style={styles.errorText}>{mapErrorMessage}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadMapData()}
          >
            <Text style={styles.retryButtonText}>Try again</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.secondaryButtonText}>Go back</Text>
          </TouchableOpacity>
        </View>
        {backgroundDisclosureModal}
      </View>
    );
  }

  if (loading || !currentLocation || !destination) {
    return (
      <View style={styles.container}>
        <View style={styles.loader}>
          <ActivityIndicator size="large" />
        </View>
        {backgroundDisclosureModal}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color={Color.WHITE} />
          </TouchableOpacity>
          <Text style={styles.title}>Delivery Address</Text>
        </View>
      </View>

      {!!routeError && (
        <View style={styles.routeErrorBanner}>
          <Icon name="alert-circle-outline" size={16} color={Color.WHITE} />
          <Text style={styles.routeErrorText}>{routeError}</Text>
        </View>
      )}

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        <Marker coordinate={currentLocation} title="Your Location" />

        <Marker
          coordinate={destination}
          title={buildAddressString(deliveryAddress)}
        />

        <MapViewDirections
          origin={routeOrigin || currentLocation}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={5}
          strokeColor="#1E90FF"
          onReady={result => {
            setRouteError(null);
            routeCoordsRef.current = result.coordinates;

            // Frame the whole route once. Doing it on every refresh yanked the
            // camera away from wherever the driver had panned to.
            if (!mapRef.current || hasFittedRouteRef.current) {
              return;
            }
            hasFittedRouteRef.current = true;
            mapRef.current.fitToCoordinates(result.coordinates, {
              edgePadding: { top: 80, bottom: 80, left: 60, right: 60 },
            });
          }}
          onError={err => {
            // Without this the Directions call failed silently: the driver got
            // a map with two pins and no line, and no idea why.
            console.log('DriverMap: directions error', err);
            setRouteError(
              'Could not draw the driving route. The pins still show you and the delivery address.',
            );
          }}
        />
      </MapView>

      <TouchableOpacity
        style={styles.recenterButton}
        onPress={handleRecenter}
        activeOpacity={0.85}
        accessibilityLabel="Show the whole route"
      >
        <Icon name="navigate" size={22} color={Color.PRIMARY} />
      </TouchableOpacity>

      {backgroundDisclosureModal}
    </View>
  );
};

export default DriverMapScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  errorText: {
    color: Color.TEXT,
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    backgroundColor: Color.PRIMARY,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
    marginBottom: 12,
    minWidth: 200,
    alignItems: 'center',
  },
  retryButtonText: {
    color: Color.WHITE,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: fontFamilyHeading,
  },
  secondaryButton: {
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: Color.PRIMARY,
    fontSize: 15,
    fontWeight: '500',
  },
  header: {
    backgroundColor: Color.PRIMARY,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  title: {
    color: Color.WHITE,
    fontSize: 18,
    fontWeight: '600',
    fontFamily: fontFamilyHeading,
  },
  recenterButton: {
    position: 'absolute',
    right: 20,
    bottom: 36,
    height: 52,
    width: 52,
    borderRadius: 26,
    backgroundColor: Color.WHITE,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 5,
  },
  routeErrorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Color.ERROR,
    paddingHorizontal: 16,
    paddingVertical: 10,
    zIndex: 10,
  },
  routeErrorText: {
    color: Color.WHITE,
    fontSize: 12,
    flex: 1,
  },
  disclosureBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  disclosureCard: {
    backgroundColor: Color.WHITE,
    borderRadius: 14,
    padding: 20,
  },
  disclosureTitle: {
    color: Color.TEXT,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
    fontFamily: fontFamilyHeading,
  },
  disclosureBody: {
    color: Color.TEXT,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
});
