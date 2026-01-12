/* eslint-disable space-infix-ops */
/* eslint-disable prettier/prettier */
import React, { useState, useEffect } from 'react';
import {
  Text,
  TouchableOpacity,
  View,
  Alert,
  ActivityIndicator
} from 'react-native';
import { styles } from '../styles/Styles';
import axios from 'axios';
import { Base_Url } from '../utils/ApiUrl';
import { getDeviceId } from '../service/DeviceAuthService';

const Splash2 = ({ navigation, route }) => {
  const phoneNumber = route?.params?.phoneNumber;
  const [loading, setLoading] = useState(false);
  const handleDeviceRegistration = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }
    try {
      setLoading(true);
      const deviceId = await getDeviceId();
      const existId = await axios.get(`${Base_Url.exist}?deviceId=${deviceId}`);
      if (existId.data.status === true) {
        navigation.replace("Home")
      } else {
        const response = await axios.post(Base_Url.register, {
          device_id: deviceId,
          phone: phoneNumber,
        });
        if (response.data?.status === true) {

          setLoading(false)
          navigation.replace('Home');
        } else {
          const errorMsg = response.data?.message;
          Alert.alert('Registration Failed', errorMsg);
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
    }

  };
  return (
    <View style={styles.container}>
      <View style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: '600',
            color: 'tomato',
          }}>
          Churn
          <Text style={{ color: 'green' }}> Centurion</Text>
        </Text>

        {loading && (
          <View style={{ marginTop: 20 }}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={{ marginTop: 10, color: '#666' }}>
              Registering device...
            </Text>
          </View>
        )}
      </View>

      <View style={{ flex: 1, alignItems: 'center' }}>
        <TouchableOpacity
          style={[styles.btn, loading && { opacity: 0.6 }]}
          onPress={handleDeviceRegistration}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.btntext}>Get Started</Text>
          )}
        </TouchableOpacity>


      </View>
    </View>
  );
};

export default Splash2;