/* eslint-disable prettier/prettier */

import DeviceInfo from 'react-native-device-info';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const getDeviceId = async () => {
  return await DeviceInfo.getUniqueId();
};

// export const generateToken = async () => {
//   return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
// };

export const saveAuthToken = async () => {
  const deviceId = await getDeviceId();
  
  await AsyncStorage.setItem('device_id', deviceId);
  await AsyncStorage.setItem('login_time', Date.now().toString());
};

// export const getStoredToken = async () => {
//   return await AsyncStorage.getItem('token');
// };

export const isDeviceRegistered = async () => {
  const deviceId = await getDeviceId();
  const storedDeviceId = await AsyncStorage.getItem('device_id');
  console.log(storedDeviceId)
  return deviceId === storedDeviceId;
};

export const logout = async () => {
  await AsyncStorage.multiRemove(['device_id', 'login_time']);
};
