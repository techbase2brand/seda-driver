// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   StyleSheet,
//   ActivityIndicator,
//   Platform,
//   PermissionsAndroid,
//   Alert,
//   TouchableOpacity,
//   Text,
// } from 'react-native';
// import MapView, { Marker } from 'react-native-maps';
// import MapViewDirections from 'react-native-maps-directions';
// import Geolocation from '@react-native-community/geolocation';
// import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';
// import Color from '../constants/Color';
// import Icon from 'react-native-vector-icons/Ionicons';

const GOOGLE_MAPS_APIKEY = 'AIzaSyBXNyT9zcGdvhAUCUEYTm6e_qPw26AOPgI';

// const DriverMapScreen = ({ navigation, route }) => {
//   const mapRef = useRef(null);
//   const [currentLocation, setCurrentLocation] = useState(null);
//   const [destination, setDestination] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const deliveryAddress = route?.params?.address;
//   const orderId = route?.params?.order?.id;
//   const driverId =route?.params?.order?.driver_id

//   const selectedAddress = deliveryAddress?.find(
//     item => item.isSelected === true,
//   );
//   const buildAddressString = address => {
//     return `${address.street}, ${address.city}, ${address.state}, ${address.zipCode}`;
//   };
//   console.log('DriverMapScreenDriverMapScreen', route?.params?.order);
//   useEffect(() => {
//     getCurrentLocation();
//     // requestLocationPermission();
//     if (selectedAddress) {
//       getCoordinatesFromAddress(
//         `${selectedAddress.street}, ${selectedAddress.city}, ${selectedAddress.state}, ${selectedAddress.zipCode}`,
//       );
//     }
//   }, []);

//   const requestLocationPermission = async () => {
//     try {
//       let permission;

//       if (Platform.OS === 'android') {
//         permission = PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
//       } else {
//         permission = PERMISSIONS.IOS.LOCATION_WHEN_IN_USE;
//       }

//       const result = await request(permission);

//       if (result === RESULTS.GRANTED) {
//         getCurrentLocation();
//       } else {
//         Alert.alert(
//           'Permission Required',
//           'Location permission is required to show directions.',
//         );
//         setLoading(false);
//       }
//     } catch (error) {
//       console.log('Permission error:', error);
//       setLoading(false);
//     }
//   };

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
//   const getCoordinatesFromAddress = async address => {
//     try {
//       const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
//         address,
//       )}&key=${GOOGLE_MAPS_APIKEY}`;

//       const response = await fetch(url);
//       const json = await response.json();

//       if (json.results.length > 0) {
//         const location = json.results[0].geometry.location;
//         setDestination({
//           latitude: location.lat,
//           longitude: location.lng,
//         });
//       } else {
//         Alert.alert('Error', 'Location not found for this address');
//       }
//     } catch (error) {
//       console.log(error);
//       Alert.alert('Error', 'Failed to fetch destination coordinates');
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
//       <View style={styles.header}>
//         <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
//           <TouchableOpacity
//             style={styles.back}
//             onPress={() => navigation.goBack()}
//           >
//             <Icon name="arrow-back" size={20} color={Color.WHITE} />
//           </TouchableOpacity>
//           <View>
//             <Text style={styles.title}>Delivery Address</Text>
//           </View>
//         </View>
//       </View>
//       <View style={{ flex: 1 }}>
//         <MapView
//           ref={mapRef}
//           style={StyleSheet.absoluteFill}
//           showsUserLocation
//           followsUserLocation
//           initialRegion={{
//             latitude: currentLocation.latitude,
//             longitude: currentLocation.longitude,
//             latitudeDelta: 0.05,
//             longitudeDelta: 0.05,
//           }}
//         >
//           <Marker coordinate={currentLocation} title="Your Location" />
//           <Marker coordinate={destination} title={selectedAddress?.street} />

//           <MapViewDirections
//             origin={currentLocation}
//             destination={destination}
//             apikey={GOOGLE_MAPS_APIKEY}
//             strokeWidth={5}
//             strokeColor="#1E90FF"
//             onReady={result => {
//               mapRef.current.fitToCoordinates(result.coordinates, {
//                 edgePadding: {
//                   top: 50,
//                   bottom: 50,
//                   left: 50,
//                   right: 50,
//                 },
//               });
//             }}
//           />
//         </MapView>
//       </View>
//     </View>
//   );
// };

// export default DriverMapScreen;

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//   },
//   loader: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   header: {
//     backgroundColor: Color.PRIMARY,
//     padding: 20,
//     paddingTop: 50,
//     paddingBottom: 25,
//   },
//   back: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   backText: {
//     color: Color.WHITE,
//     marginLeft: 4,
//   },
//   title: {
//     color: Color.WHITE,
//     fontSize: 18,
//     fontWeight: '700',
//   },
//   sub: {
//     color: Color.WHITE,
//     opacity: 0.9,
//     marginTop: 2,
//   },
// });

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  Text,
  Platform,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons';
import Color from '../constants/Color';
import { supabase } from '../lib/supabase';

const DriverMapScreen = ({ navigation, route }) => {
  const mapRef = useRef(null);

  const deliveryAddress = route?.params?.address;
  const orderId = route?.params?.order?.id;
  const driverId = route?.params?.order?.driver_id;

  const selectedAddress = deliveryAddress?.find(
    item => item.isSelected === true,
  );

  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  //  Build address string
  const buildAddressString = address =>
    [address.street, address.city, address.state, address.zipCode]
      .filter(Boolean)
      .join(', ');

  //  Initial load
  useEffect(() => {
    getCurrentLocation();

    if (selectedAddress) {
      const addressString = buildAddressString(selectedAddress);
      getCoordinatesFromAddress(addressString);
    }
  }, []);

  //  Track location every 5 seconds
  useEffect(() => {
    let intervalId;

    if (driverId && orderId) {
      intervalId = setInterval(() => {
        trackAndSaveLocation();
      }, 5000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [driverId, orderId]);

  // Get current GPS
  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        setLoading(false);
      },
      error => {
        console.log(error);
        Alert.alert('Error', 'Unable to fetch location');
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      },
    );
  };

  //  Track + save
  const trackAndSaveLocation = () => {
    Geolocation.getCurrentPosition(
      async position => {
        const { latitude, longitude } = position.coords;

        setCurrentLocation({ latitude, longitude });

        await saveLocationToSupabase(latitude, longitude);
      },
      error => {
        console.log('Tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      },
    );
  };

  //  Save to Supabase (UPSERT)
//   const saveLocationToSupabase = async (lat, lng) => {
//     try {
//       const { error } = await supabase.from('driver_locations').upsert(
//         {
//           driver_id: driverId,
//           order_id: orderId,
//           latitude: lat,
//           longitude: lng,
//           updated_at: new Date(),
//         },
//       );

//       if (error) {
//         console.log('Supabase error:', error);
//       } else {
//         console.log('Location saved:', lat, lng,driverId,
//           orderId,);
//       }
//     } catch (err) {
//       console.log('Save failed:', err);
//     }
//   };
const saveLocationToSupabase = async (lat, lng) => {
  try {
    const { error } = await supabase
      .from('driver_locations')
      .upsert(
        {
          order_id: orderId,     // 🔑 UNIQUE KEY
          driver_id: driverId,
          latitude: lat,
          longitude: lng,
          updated_at: new Date(),
        },
        {
          onConflict: 'order_id',
        },
      );

    if (error) {
      console.log('Supabase error:', error);
    } else {
      console.log(
        'Location updated for order:',
        orderId,
        lat,
        lng,
      );
    }
  } catch (err) {
    console.log('Save failed:', err);
  }
};

  // 🔹 Address → Coordinates
  const getCoordinatesFromAddress = async address => {
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
        Alert.alert('Error', 'Location not found');
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Error', 'Failed to fetch destination');
    } finally {
      setLoading(false);
    }
  };

  if (loading || !currentLocation || !destination) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Icon name="arrow-back" size={22} color={Color.WHITE} />
          </TouchableOpacity>
          <Text style={styles.title}>Delivery Address</Text>
        </View>
      </View>

      {/* Map */}
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
        <Marker coordinate={destination} title={selectedAddress?.street} />

        <MapViewDirections
          origin={currentLocation}
          destination={destination}
          apikey={GOOGLE_MAPS_APIKEY}
          strokeWidth={5}
          strokeColor="#1E90FF"
          onReady={result => {
            mapRef.current.fitToCoordinates(result.coordinates, {
              edgePadding: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50,
              },
            });
          }}
        />
      </MapView>
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
  },
  header: {
    backgroundColor: Color.PRIMARY,
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    zIndex: 10,
  },
  title: {
    color: Color.WHITE,
    fontSize: 18,
    fontWeight: '700',
  },
});
