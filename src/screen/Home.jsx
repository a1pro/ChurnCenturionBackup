import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { getInstalledApps } from 'react-native-similar-app-check';
import { styles } from '../styles/Styles';

const Home = () => {
  const navigation = useNavigation();

  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [matchedApps, setMatchedApps] = useState([]);
  const [dynamicAppList, setDynamicAppList] = useState([]); // Full dynamic list with ids and names

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
          'https://churn.a1professionals.net/api/v1/get/appnames',
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

        console.log('Matched app names:', matchedAppNames);
        console.log('Matched app IDs:', matchedAppIds);

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
          'https://churn.a1professionals.net/api/v1/appdetect',
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.container}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={[styles.heading, { flex: 2 }]}>My Dashboard</Text>
          <TouchableOpacity onPress={handleLogout} style={{ flex: 1, alignItems: 'flex-end' }}>
            <Text style={{ fontWeight: '600', fontSize: 20, color: '#EE14D8' }}>Logout</Text>
          </TouchableOpacity>
        </View>
        <View style={{ flex: 1, paddingTop: 40, paddingBottom: 40 }}>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('Credits')}>
            <View style={styles.dashboardbox}>
              <Text style={styles.title}>Credits</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('Tutorials')}>
            <View style={styles.dashboardbox}>
              <Text style={styles.title}>Tutorials and Guides</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{ flex: 1 }} onPress={() => navigation.navigate('Tips')}>
            <View style={styles.dashboardbox}>
              <Text style={styles.title}>Tips</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;
