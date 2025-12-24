/* eslint-disable prettier/prettier */
import React, {useEffect, useState} from 'react';
import {StatusBar, Alert, Platform, LogBox} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import Navigation from './src/navigation/Navigation';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {check, request, PERMISSIONS, RESULTS} from 'react-native-permissions';
import {I18nextProvider} from 'react-i18next';
import i18n from './src/context/i18n';
LogBox.ignoreAllLogs();
function App() {
  const [userDeviceDetails, setUserDeviceDetails] = useState();
  const [visible, setIsVisible] = useState();

  const requestPermission = async () => {
    try {
      let permission;
      if (Platform.OS === 'android') {
        permission = PERMISSIONS.ANDROID.ACTIVITY_RECOGNITION;
      } else {
        // Handle iOS if needed, or provide a fallback
        return;
      }

      // Check current permission status
      const result = await check(permission);
      if (result === RESULTS.GRANTED) {
        Alert.alert(
          'To use this app you have to allow permission for better user experience.',
        );
      } else if (result === RESULTS.DENIED) {
        // Request permission
        const requestResult = await request(permission);
        if (requestResult === RESULTS.GRANTED) {
          Alert.alert('Permission granted', 'You have granted the permission.');
        } else {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    requestPermission();
  }, []);
  return (
    <NavigationContainer>
      <SafeAreaProvider>
        <I18nextProvider i18n={i18n}>
          <StatusBar backgroundColor="#3F51B5" />
          <Navigation />
        </I18nextProvider>
      </SafeAreaProvider>
    </NavigationContainer>
  );
}
export default App;

// react-native-check-app-install
