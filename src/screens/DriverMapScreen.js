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

function getFinalAddressString(addr) {
  if (typeof addr === 'string') {
    return addr;
  }

  if (Array.isArray(addr)) {
    const selected = addr.find(item => item.isSelected === true) || addr[0];

    if (typeof selected === 'object') {
      return selected.address || selected.delivery_address || '';
    }

    return selected || '';
  }

  if (typeof addr === 'object' && addr !== null) {
    return addr.address || addr.delivery_address || '';
  }

  return '';
}

async function requestIOSLocationPermission() {
  if (Platform.OS !== 'ios') {
    return true;
  }

  Geolocation.setRNConfiguration({
    skipPermissionRequests: false,
    authorizationLevel: 'always',
  });

  return new Promise(resolve => {
    Geolocation.requestAuthorization(
      () => resolve(true),
      () => resolve(false),
    );
  });
}

async function requestAndroidLocationPermission() {
  if (Platform.OS !== 'android') {
    return true;
  }
  const fine = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
  const coarse = PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION;
  const hasFine = await PermissionsAndroid.check(fine);
  const hasCoarse = await PermissionsAndroid.check(coarse);
  if (hasFine || hasCoarse) {
    return true;
  }
  const result = await PermissionsAndroid.requestMultiple([fine, coarse]);
  return (
    result[fine] === PermissionsAndroid.RESULTS.GRANTED ||
    result[coarse] === PermissionsAndroid.RESULTS.GRANTED
  );
}

const getCurrentPositionAsync = options =>
  new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, options);
  });

/** GPS first, then network / cached — helps Android indoors. */
async function fetchLocationWithFallback() {
  try {
    return await getCurrentPositionAsync({
      enableHighAccuracy: true,
      timeout: 25000,
      maximumAge: 10000,
    });
  } catch (e1) {
    console.log(
      'DriverMap: high-accuracy location failed, trying low accuracy',
      e1,
    );
    return await getCurrentPositionAsync({
      enableHighAccuracy: false,
      timeout: 20000,
      maximumAge: 300000,
    });
  }
}

const DriverMapScreen = ({ navigation, route }) => {
  const mapRef = useRef(null);
  const disclosureResolverRef = useRef(null);
  const retryTimeoutRef = useRef(null);
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
  const [retryTick, setRetryTick] = useState(0);

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

      const response = await fetch(url);
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

  const handleBackgroundDisclosureContinue = useCallback(async () => {
    let granted = true;
    if (Platform.OS === 'ios') {
      granted = await requestIOSLocationPermission();
    }

    setShowBackgroundDisclosure(false);
    if (disclosureResolverRef.current) {
      disclosureResolverRef.current(granted);
      disclosureResolverRef.current = null;
    }
  }, []);

  const requestBackgroundLocationPermission = useCallback(async () => {
    if (Platform.OS !== 'android' || Platform.Version < 29) {
      return true;
    }

    const backgroundPermission =
      PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION;
    const hasBackground = await PermissionsAndroid.check(backgroundPermission);
    if (hasBackground) {
      return true;
    }

    const result = await PermissionsAndroid.request(backgroundPermission);
    return result === PermissionsAndroid.RESULTS.GRANTED;
  }, []);

  const clearBackgroundRetry = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
  }, []);

  const schedulePermissionRetry = useCallback(() => {
    clearBackgroundRetry();
    retryTimeoutRef.current = setTimeout(() => {
      if (!mountedRef.current) {
        return;
      }
      setRetryTick(prev => prev + 1);
    }, 60000);
  }, [clearBackgroundRetry]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
      clearBackgroundRetry();
      if (disclosureResolverRef.current) {
        disclosureResolverRef.current(false);
        disclosureResolverRef.current = null;
      }
    };
  }, [clearBackgroundRetry]);

  const loadMapData = useCallback(async () => {
    setLocationError(null);
    setDestinationError(null);
    setDestination(null);
    setCurrentLocation(null);
    setLoading(true);

    const finalAddress = getFinalAddressString(deliveryAddress);
    console.log('FINAL ADDRESS >>>', finalAddress);

    const geoPromise = finalAddress
      ? getCoordinatesFromAddress(finalAddress)
      : Promise.resolve();

    try {
      const consentGiven = await askLocationDisclosureConsent();
      if (!consentGiven) {
        setLocationError(
          'Location and background location are required for live delivery tracking. We will ask again in 1 minute.',
        );
        schedulePermissionRetry();
        await geoPromise.catch(() => {});
        return;
      }

      const granted = await requestAndroidLocationPermission();
      if (!granted) {
        setLocationError(
          'Location permission is required for delivery navigation. We will ask again in 1 minute.',
        );
        schedulePermissionRetry();
        await geoPromise.catch(() => {});
        return;
      }

      const backgroundGranted = await requestBackgroundLocationPermission();
      if (!backgroundGranted) {
        setLocationError(
          'Background location is required to track deliveries when the app is minimized. We will ask again in 1 minute.',
        );
        schedulePermissionRetry();
        await geoPromise.catch(() => {});
        return;
      }

      clearBackgroundRetry();

      const position = await fetchLocationWithFallback();
      const { latitude, longitude } = position.coords;
      setCurrentLocation({ latitude, longitude });

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
  }, [
    clearBackgroundRetry,
    deliveryAddress,
    getCoordinatesFromAddress,
    requestBackgroundLocationPermission,
    schedulePermissionRetry,
    askLocationDisclosureConsent,
  ]);

  useEffect(() => {
    loadMapData();
  }, [loadMapData, retryTick]);

  const hasLocationFix = currentLocation != null;

  useEffect(() => {
    if (!hasLocationFix) {
      return undefined;
    }
    const watchId = Geolocation.watchPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        await saveLocationToSupabase(latitude, longitude);
      },
      err => console.log('DriverMap: watchPosition', err),
      {
        enableHighAccuracy: false,
        distanceFilter: 10,
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
      onRequestClose={() => {}}
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
            <Text style={styles.retryButtonText}>Continue</Text>
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

      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        showsUserLocation
        followsUserLocation
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
          title={getFinalAddressString(deliveryAddress)}
        />

        <MapViewDirections
          origin={currentLocation}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={5}
          strokeColor="#1E90FF"
          onReady={result => {
            mapRef.current.fitToCoordinates(result.coordinates, {
              edgePadding: { top: 50, bottom: 50, left: 50, right: 50 },
            });
          }}
        />
      </MapView>

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
