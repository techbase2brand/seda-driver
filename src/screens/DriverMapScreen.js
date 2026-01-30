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
import { fontFamilyHeading } from '../constants/Fonts';
import { supabase } from '../lib/supabase';

const GOOGLE_MAPS_APIKEY = 'AIzaSyBtb6hSmwJ9_OznDC5e8BcZM90ms4WD_DE';
const DriverMapScreen = ({ navigation, route }) => {
  const mapRef = useRef(null);

  const deliveryAddress = route?.params?.address;
  const orderId = route?.params?.order?.id;
  const driverId = route?.params?.order?.driver_id;

  const [currentLocation, setCurrentLocation] = useState(null);
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);

  // ✅ ADDRESS NORMALIZER (NEW – ONLY FIX)
  const getFinalAddressString = deliveryAddress => {
    if (typeof deliveryAddress === 'string') {
      return deliveryAddress;
    }

    if (Array.isArray(deliveryAddress)) {
      const selected =
        deliveryAddress.find(item => item.isSelected === true) ||
        deliveryAddress[0];

      if (typeof selected === 'object') {
        return selected.address || selected.delivery_address || '';
      }

      return selected || '';
    }

    if (typeof deliveryAddress === 'object' && deliveryAddress !== null) {
      return deliveryAddress.address || deliveryAddress.delivery_address || '';
    }

    return '';
  };

  // 🔹 Initial load
  useEffect(() => {
    getCurrentLocation();

    const finalAddress = getFinalAddressString(deliveryAddress);
    console.log('FINAL ADDRESS >>>', finalAddress);

    if (finalAddress) {
      getCoordinatesFromAddress(finalAddress);
    }
  }, []);

  // 🔹 Get current GPS
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

  // 🔹 Watch location
  useEffect(() => {
    const watchId = Geolocation.watchPosition(
      async position => {
        const { latitude, longitude } = position.coords;
        setCurrentLocation({ latitude, longitude });
        await saveLocationToSupabase(latitude, longitude);
      },
      error => console.log(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
      },
    );

    return () => Geolocation.clearWatch(watchId);
  }, []);

  // 🔹 Save location to Supabase
  const saveLocationToSupabase = async (lat, lng) => {
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
    fontWeight: '600',
    fontFamily: fontFamilyHeading,
  },
});
