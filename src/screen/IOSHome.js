import React, { useState, useEffect } from 'react';
import { View, Text, Alert, Platform, Linking } from 'react-native';

const IOSHome = () => {
  const [installedApps, setInstalledApps] = useState([]);

  useEffect(() => {
    const checkInstalledApps = async () => {
      if (Platform.OS !== 'ios') return;

      const appChecks = [
        { name: 'WhatsApp', urlScheme: 'whatsapp://' },
        { name: 'Instagram', urlScheme: 'instagram://' },
      ];

      const detectedApps = [];
      for (const app of appChecks) {
        const isInstalled = await Linking.canOpenURL(app.urlScheme);
        if (isInstalled) {
          detectedApps.push(app.name);
        }
      }

      setInstalledApps(detectedApps);
      if (detectedApps.length > 0) {
        Alert.alert(`Installed Apps`, `You have installed: ${detectedApps.join(', ')}`);
      } else {
        Alert.alert('No Installed Apps', 'WhatsApp and Instagram are not installed.');
      }
    };

    checkInstalledApps();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Checking for WhatsApp & Instagram...</Text>
    </View>
  );
};

export default IOSHome;
