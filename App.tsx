/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import { NavigationContainer } from '@react-navigation/native';
import { KeyboardAvoidingView, Platform, StatusBar, StyleSheet, useColorScheme, View } from 'react-native';
import {
  SafeAreaProvider,
} from 'react-native-safe-area-context';
import AuthStack from './src/navigations/AuthStack'
import DeliveryStack from './src/navigations/DeliveryStack'
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkForAppUpdate, openAppStore } from './src/utils/checkForUpdate';
import UpdateAvailableModal from './src/components/UpdateAvailableModal';

type AppUpdateInfo = {
  storeVersion?: string;
  storeUrl: string;
};


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
  const [updateInfo, setUpdateInfo] = useState<AppUpdateInfo | null>(null);

  useEffect(() => {
    const tokenn = async()=>{
      const token = await AsyncStorage.getItem('token');
      const franchiseId = await AsyncStorage.getItem('franchise_id');
      console.log("franchiseIdfranchise/Id>>",franchiseId,token);
      setUserToken(token)
    }
    tokenn()
    checkForAppUpdate().then(setUpdateInfo)
  }, [])

  const handleInstallUpdate = () => {
    const storeUrl = updateInfo?.storeUrl;
    setUpdateInfo(null);
    if (storeUrl) {
      openAppStore(storeUrl);
    }
  };

  return (
   <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={styles.container}>
        <NavigationContainer>
          {userToken ? <DeliveryStack /> : <AuthStack />}
        </NavigationContainer>
      </View>

      <UpdateAvailableModal
        visible={updateInfo != null}
        storeVersion={updateInfo?.storeVersion}
        onUpdate={handleInstallUpdate}
        onLater={() => setUpdateInfo(null)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
