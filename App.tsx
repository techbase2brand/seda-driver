/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaView, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import AuthStack from './src/navigations/AuthStack'
import DeliveryStack from './src/navigations/DeliveryStack'
import { useEffect, useState } from 'react';
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
    console.log("franchiseIdfranchiseId>>",franchiseId,token);
    setUserToken(token)
    }
  tokenn()
   
  }, [])
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
