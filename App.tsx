/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { Alert, PermissionsAndroid, Platform, SafeAreaView, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import AuthStack from './src/navigations/AuthStack'
import DeliveryStack from './src/navigations/DeliveryStack'
import { useEffect, useState } from 'react';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';


function App() {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const [userToken, setUserToken] =useState()
useEffect(() => {
    const tokenn = async()=>{
      const token = await AsyncStorage.getItem('token');
    const franchiseId = await AsyncStorage.getItem('franchise_id');
    console.log("franchiseIdfranchise/Id>>",franchiseId,token);
    setUserToken(token)
    }
  tokenn()
   
  }, [])

   useEffect(() => {
    const requestPermissions = async () => {
      if (Platform.OS === 'ios') {
        await requestUserIosPermission();
      } else {
        await requestNotificationPermission();
      }
    };
    requestPermissions();
  }, []);
  useEffect(() => {
    // Request location permission when app starts
    // requestLocationPermission();
  }, []);
  const requestNotificationPermission = async () => {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Notification Permission',
            message: 'This app would like to send you notifications.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getFcmToken();
          console.log('Notification permission granted');
        } else {
          console.log('Notification permission denied');
          Alert.alert(
            'Permission Denied',
            'You will not receive notifications.',
          );
        }
      } catch (err) {
        console.warn('Permission error:', err);
      }
    }
  };
  const requestUserIosPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('iOS Notification permission granted:', authStatus);
      getFcmToken();
    } else {
      console.log('iOS Notification permission denied:', authStatus);
    }
  };

  useEffect(() => {
    // const unsubscribe = messaging().onMessage(async remoteMessage => {
    //   Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
    // });
    // return unsubscribe;
  }, []);

  const getFcmToken = async () => {
    try {
      const existingToken = await AsyncStorage.getItem('fcmToken');
      if (existingToken) {
        console.log('FCM token (from storage):', existingToken);
        return existingToken;
      }

      const token = await messaging().getToken();
      console.log("fcmtoken>>",token);
      
      if (token) {
        await AsyncStorage.setItem('fcmToken', token);
        return token;
      }
    } catch (error) {
      console.log('Error getting FCM token:', error);
    }
  };
  return (
    <View style={styles.container}>
      {/* <NewAppScreen
        templateFileName="App.tsx"
        safeAreaInsets={safeAreaInsets}
      /> */}
       <NavigationContainer>
   {userToken ?  
      <DeliveryStack/>: <AuthStack/> }

    </NavigationContainer>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
