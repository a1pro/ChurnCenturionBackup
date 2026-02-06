/* eslint-disable prettier/prettier */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react/react-in-jsx-scope */
import {ScrollView, Text, TouchableOpacity, View, Alert, AppState} from 'react-native';
import {NativeModules, NativeEventEmitter} from 'react-native';
import {styles} from '../styles/Styles';
import DeviceInfo from 'react-native-device-info';
import {useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useNavigation} from '@react-navigation/native';

const {CustomModule} = NativeModules;
const customModuleEmitter = new NativeEventEmitter(CustomModule);

const Home = () => {
  const navigation = useNavigation();
  const [userDeviceDetails, setUserDeviceDetails] = useState(null);
  const [deviceId, setDeviceId] = useState('');
  const [deviceName, setDeviceName] = useState('');
  const [deviceModel, setDeviceModel] = useState('');
  const [deviceOs, setDeviceOs] = useState('');
  const [token, setToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [apiVersion, setApiVersion] = useState('');
  const [lastClosedDate, setLastClosedDate] = useState(null);

  const saveLastClosedDate = async () => {
    try {
      const currentDate = new Date().toISOString();
      await AsyncStorage.setItem('lastClosedDate', currentDate);
    } catch (error) {
      console.error('Error saving last closed date:', error);
    }
  };

  const getLastClosedDate = async () => {
    try {
      const value = await AsyncStorage.getItem('lastClosedDate');
      if (value !== null) {
        setLastClosedDate(value);

      }
    } catch (error) {
      console.error('Error fetching last closed date:', error);
    }
  };

  const checkAndSendUserDetails = async () => {
    try {
      const result = await CustomModule.checkSimilarApps();
      const similarApps = result.toString().trim();

      if (similarApps) {
        Alert.alert(
          `You have already installed similar app(s): ${similarApps}`,
        );


        if (userDeviceDetails) {
          await checkAndSendUserDetails(userDeviceDetails);
        }
      } else {
        Alert.alert('No Similar Apps Detected');
      }

      await getUserInfo();
    } catch (error) {
      console.error(error);
      Alert.alert('Error checking for similar apps');
    }
  };

  const getUserInfo = async () => {
    try {
      setApiVersion(await DeviceInfo.getSystemVersion());
      setDeviceId(await DeviceInfo.getUniqueId());
      setDeviceName(await DeviceInfo.getDeviceName());
      setDeviceModel(await DeviceInfo.getModel());
      setDeviceOs(await DeviceInfo.getSystemName());

      const userInfo = {
        deviceId,
        deviceName,
        deviceModel,
        deviceOs,
        lastClosedDate,
      };
      setUserDeviceDetails(userInfo);
    } catch (error) {
      console.error('Error getting device information:', error);
    }
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const value = await AsyncStorage.getItem('token');
        const userIdValue = await AsyncStorage.getItem('user_id');
        setUserId(userIdValue);
        if (value !== null) {
          setToken(value);

        }
      } catch (error) {
        console.error('Error fetching token:', error);
      }
    };
    fetchToken();
  }, []);

  useEffect(() => {
    const handleSimilarAppDetected = async packageName => {
      Alert.alert(
        'Similar App Detected',
        `Similar app with package name ${packageName} detected.`,
      );

      // Send user details when similar app is detected
      if (userDeviceDetails) {
        checkAndSendUserDetails(userDeviceDetails);
      }
    };

    // Add listener
    if (
      customModuleEmitter &&
      typeof customModuleEmitter.addListener === 'function'
    ) {
      customModuleEmitter.addListener(
        'SimilarAppDetected',
        handleSimilarAppDetected,
      );
    } else {
      console.warn('addListener is not available on customModuleEmitter');
    }

    // Call function to check and send user details
    checkAndSendUserDetails();

    // Cleanup function
    return () => {
      if (customModuleEmitter) {
        if (typeof customModuleEmitter.removeListener === 'function') {
          customModuleEmitter.removeListener(
            'SimilarAppDetected',
            handleSimilarAppDetected,
          );
        } else if (typeof customModuleEmitter.off === 'function') {
          customModuleEmitter.off(
            'SimilarAppDetected',
            handleSimilarAppDetected,
          );
        } else if (
          typeof customModuleEmitter.removeEventListener === 'function'
        ) {
          customModuleEmitter.removeEventListener(
            'SimilarAppDetected',
            handleSimilarAppDetected,
          );
        } else {
          console.warn('No valid method found to remove the listener');
        }
      } else {
        console.warn('customModuleEmitter is not defined');
      }
    };
  }, []);

  useEffect(() => {
    const appStateListener = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background') {
        saveLastClosedDate();
      }
    });
    getLastClosedDate();

    // Cleanup
    return () => {
      appStateListener.remove();
    };
  }, []);

  // Logout function
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('token');
      Alert.alert('Logout Successfully');
      navigation.navigate('Login');
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to log out. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={{flexGrow: 1}}>
      <View style={styles.container}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text style={[styles.heading, {flex: 2}]}>My Dashboard</Text>
          <TouchableOpacity
            onPress={handleLogout}
            style={{flex: 1, alignItems: 'flex-end'}}>
            <Text style={{fontWeight: '600', fontSize: 20, color: '#EE14D8'}}>
              Logout
            </Text>
          </TouchableOpacity>
        </View>
        <View style={{flex: 1, paddingTop: 40, paddingBottom: 40}}>
          <TouchableOpacity
            style={{flex: 1}}
            onPress={() => navigation.navigate('Credits')}>
            <View style={[styles.dashboardbox, {backgroundColor: '#45FBC4'}]}>
              <Text style={styles.title}>Credits</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={{flex: 1}}
            onPress={() => navigation.navigate('Tutorials')}>
            <View style={[styles.dashboardbox, {backgroundColor: '#FFF599'}]}>
              <Text style={styles.title}>Tutorials and Guides</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity style={{flex: 1}} onPress={()=>navigation.navigate('Tips')}>
            <View style={[styles.dashboardbox, {backgroundColor: '#9EC5FF'}]}>
              <Text style={styles.title}>Tips</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default Home;
