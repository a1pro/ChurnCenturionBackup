/* eslint-disable prettier/prettier */
import React, { useState, useEffect, useCallback } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  BackHandler,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { getInstalledApps } from 'react-native-similar-app-check';
import { styles } from '../styles/Styles';
import HomeScreen from './HomeScreen/HomeScreen';
import { base_url, Base_Url } from '../apiEndpoint/ApiEndpoint';

const Home = () => {
  const navigation = useNavigation();

  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [matchedApps, setMatchedApps] = useState([]);
  const [dynamicAppList, setDynamicAppList] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        const storedUserId = await AsyncStorage.getItem('user_id');
        if (storedToken) setToken(storedToken);
        if (storedUserId) setUserId(storedUserId);
      } catch (error) {
        console.error('Failed to retrieve token or userId:', error);
      }
    })();
  }, []);

  useEffect(() => {
    if (!token || !userId) return;

    const checkAndSendUserDetails = async () => {
      try {
        // Fetch dynamic app list
        const res = await axios.post(
          Base_Url.appnames,
          { operatorId: '1' },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        if (!(res.data.success && Array.isArray(res.data.data))) {
          console.warn('Unexpected API response structure:', res.data);
          return;
        }

        setDynamicAppList(res.data.data);

        const apiAppNamesLower = res.data.data
          .map(item => (item.app_name ? item.app_name.trim().toLowerCase() : null))
          .filter(Boolean);

        // Get installed apps
        const installed = await getInstalledApps();

        // Match installed apps to api app names
        const matched = installed.filter(app =>
          apiAppNamesLower.some(apiName =>
            app.appName?.toLowerCase().includes(apiName)
          )
        );
        setMatchedApps(matched);

        Alert.alert(
          matched.length > 0 ? 'Similar Apps Detected' : 'No Similar Apps Detected',
          matched.length > 0
            ? `You have installed similar app(s): ${matched.map(app => app.appName).join(', ')}`
            : 'No matching apps found.'
        );

        // Extract matched ids and names for payload
        const matchedAppIds = matched
          .map(installedApp => {
            const match = res.data.data.find(apiApp =>
              installedApp.appName?.toLowerCase().includes(apiApp.app_name.toLowerCase())
            );
            return match?.id;
          })
          .filter(Boolean);

        const matchedAppNames = matched
          .map(app => app.appName)
          .filter(Boolean);

        // Device info
        const deviceId = await DeviceInfo.getUniqueId();
        const deviceModel = await DeviceInfo.getModel();
        const deviceName = await DeviceInfo.getDeviceName();
        const deviceOs = await DeviceInfo.getSystemName();

        // Prepare payload with comma-separated strings
        const payload = {
          deviceId,
          deviceModel,
          deviceName,
          deviceOs,
          appid: '123434',
          app_name: matchedAppNames.join(',') || '',
          app_ids: matchedAppIds.join(',') || '',
          app_closedate: '2025-10-15',
          operatorId: '1',
          user_id: userId,
        };

        const response = await axios.post(
          Base_Url.appdetect,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (response.status === 200 && response.data.code === 200) {
          Alert.alert('Success', 'User details sent successfully');
        } else {
          Alert.alert('Error', 'Unexpected response from server');
        }
      } catch (error) {
        Alert.alert('Error', `Failed during app check: ${error.message}`);
      }
    };

    checkAndSendUserDetails();
  }, [token, userId]);
useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        BackHandler.exitApp();
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      Alert.alert('Logout Successfully');
      navigation.navigate('Login');
    } catch (error) {
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <HomeScreen/>
  );
};

export default Home;
