import React, {useEffect, useState} from 'react';
// import AsyncStorage from '@react-native-async-storage/async-storage';
import DeliveryLoginScreen from '../screens/DeliveryLoginScreen';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DeliveriesScreen from '../screens/DeliveriesScreen';
import DeliveryStack from './DeliveryStack';

const Stack = createNativeStackNavigator();

export default function AuthStack() {
  // const [isFirstLaunch, setIsFirstLaunch] = useState(null);

  // useEffect(() => {
  //   const checkFirstLaunch = async () => {
  //     try {
  //       const hasLaunched = await AsyncStorage.getItem('hasLaunched');
  //       if (hasLaunched === null) {
  //         await AsyncStorage.setItem('hasLaunched', 'true');
  //         setIsFirstLaunch(true); // Show OnBoarding
  //       } else {
  //         setIsFirstLaunch(false); // Skip OnBoarding
  //       }
  //     } catch (error) {
  //       console.error('Error checking first launch:', error);
  //     }
  //   };
  //   checkFirstLaunch();
  // }, []);

  // if (isFirstLaunch === null) {
  //   return (
  //     <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
  //       <ActivityIndicator size="large" color="#000" />
  //     </View>
  //   );
  // }

  return (
    <Stack.Navigator screenOptions={{headerShown: false}}>
      {/* {isFirstLaunch && (
        <Stack.Screen name="OnBoard" component={OnBoardingScreen} />
      )} */}
      <Stack.Screen name="Login" component={DeliveryLoginScreen} />
      <Stack.Screen name="DeliveryStack" component={DeliveryStack} />

      {/* <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen
        name="ResetPasswordScreen"
        component={ResetPasswordScreen}
      />
      <Stack.Screen name="MainTabNavigator" component={MainTabNavigator} /> */}
    </Stack.Navigator>
  );
}
