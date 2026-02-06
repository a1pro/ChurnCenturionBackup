/* eslint-disable prettier/prettier */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react-native/no-inline-styles */

import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,

  AppState,
} from 'react-native';
import * as Progress from 'react-native-progress';
import AppUsage from 'react-native-app-usage';

import IMAGES from '../../assets/images';
import { CustomText } from '../../components/CustomText';
import COLORS from '../../utils/Colors';
import styles from './style';
import { useFocusEffect } from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../../types';
import { t } from 'i18next';
import axios from 'axios';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { allowedAndroidApps, alwaysExclude, appNameMap } from '../../components/Appname';
import { getDeviceId } from '../../service/DeviceAuthService';
import { Base_Url } from '../../apiEndpoint/ApiEndpoint';
import DynamicAppIcon from '../../components/AppIcon';

interface AppItem {
  id: number;
  name: string;
  time: string;
  rawTime: number;
  count: number;
  percentage: number;
  packageName?: string;
  isSystemApp?: boolean;
}

type TimeRange = 'today' | 'month';
type Props = BottomTabScreenProps<RootTabParamList, 'Home'>;

const HomeScreen: React.FC<Props> = () => {
  const [appData, setAppData] = useState<AppItem[]>([]);
  const [totalTime, setTotalTime] = useState('0h 0m');
  const [isApproved, setIsApproval] = useState<Boolean>(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('today');
  const [loading, setLoading] = useState(false);
  const [midnightTimer, setMidnightTimer] = useState<NodeJS.Timeout | null>(null);
  const [minuteChecker, setMinuteChecker] = useState<NodeJS.Timeout | null>(null);

  const isFetchingRef = useRef(false);

  // Background Service Functions
  const initializeBackgroundService = async () => {
    await scheduleMidnightSync();
    startMinuteChecker();
    setupAppStateListener();
  };

  const scheduleMidnightSync = async () => {
    try {
      // Clear existing timer
      if (midnightTimer) {
        clearTimeout(midnightTimer);
      }

      // Calculate time until 11:59:59 PM
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23, 59, 59, 0
      );

      let delay = midnight.getTime() - now.getTime();

      if (delay < 0) {
        delay += 24 * 60 * 60 * 1000;
      }

      const timer = setTimeout(async () => {
        await executeMidnightSync();
        await scheduleMidnightSync();
      }, delay);

      setMidnightTimer(timer);
      await AsyncStorage.setItem('midnight_sync_scheduled', new Date().toISOString());
      await AsyncStorage.setItem('next_sync_time', (now.getTime() + delay).toString());

    } catch (error) {
      console.error(' Error scheduling midnight sync:', error);
    }
  };

  const startMinuteChecker = () => {
    if (minuteChecker) {
      clearInterval(minuteChecker);
    }
    const interval = setInterval(async () => {
      try {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        if (hours === 23 && minutes >= 55) {

          const today = new Date().toDateString();
          const lastSync = await AsyncStorage.getItem('last_midnight_sync');

          if (!lastSync || new Date(lastSync).toDateString() !== today) {
            await executeMidnightSync();
          } else {
            console.log('Already synced today');
          }
        }
      } catch (error) {
        console.error('Minute checker error:', error);
      }
    }, 60 * 1000);

    setMinuteChecker(interval);
  };

  const executeMidnightSync = async () => {
    try {
      const today = new Date().toDateString();
      const lastSync = await AsyncStorage.getItem('last_midnight_sync');

      if (lastSync && new Date(lastSync).toDateString() === today) {
        return;
      }
      const now = Date.now();
      const todayStart = getTodayStartTime();

      const stats = await new Promise<any[]>((resolve) => {
        AppUsage.getUsageCustomRange(String(todayStart), String(now), resolve);
      });

      if (stats && stats.length > 0) {
        const totalUsageTime = stats.reduce(
          (sum, app) => sum + (app.totalForegroundTime || 0),
          0
        );
        await sendAppUsageData(stats, totalUsageTime, todayStart, now);
        await AsyncStorage.setItem('last_midnight_sync', new Date().toISOString());
        await AsyncStorage.setItem('last_sync_success', new Date().toISOString());
      } else {
        console.log('No usage data to sync');
      }

    } catch (error) {
      console.error('Midnight sync error:', error);
      await storeSyncError(error);
    }
  };

  const storeSyncError = async (error: any) => {
    try {
      const errorLogs = await AsyncStorage.getItem('sync_error_logs');
      const logs = errorLogs ? JSON.parse(errorLogs) : [];

      logs.push({
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error',
      })
      if (logs.length > 10) {
        logs.splice(0, logs.length - 10);
      }

      await AsyncStorage.setItem('sync_error_logs', JSON.stringify(logs));
    } catch (err) {
      console.error('Error storing sync error:', err);
    }
  };

  const setupAppStateListener = () => {
    AppState.addEventListener('change', async (nextAppState) => {

      if (nextAppState === 'active') {
        await checkMissedSync();
        await scheduleMidnightSync();
      }
    });
  };

  const checkMissedSync = async () => {
    try {
      const today = new Date().toDateString();
      const lastSync = await AsyncStorage.getItem('last_midnight_sync');

      if (!lastSync || new Date(lastSync).toDateString() !== today) {
        const now = new Date();
        const hours = now.getHours();

        if (hours >= 0 && hours <= 6) {
          await executeMidnightSync();
        }
      }
    } catch (error) {
      console.error('Error checking missed sync:', error);
    }
  };

  const cleanupBackgroundService = () => {

    if (midnightTimer) {
      clearTimeout(midnightTimer);
      setMidnightTimer(null);
    }

    if (minuteChecker) {
      clearInterval(minuteChecker);
      setMinuteChecker(null);
    }
  };

  useEffect(() => {
    initializeBackgroundService();

    return () => {
      cleanupBackgroundService();
    };
  }, []);

  const getTodayStartTime = (): number => {
    const now = new Date();

    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0, 0, 0, 0
    );
    return todayStart.getTime();
  };

  const checkNewDay = async () => {
    try {
      const now = new Date();
      const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

      const storedDate = await AsyncStorage.getItem('today_date_key');
      if (storedDate !== todayKey) {

        await AsyncStorage.setItem('today_date_key', todayKey);
        await AsyncStorage.removeItem('last_sync_time');

      }
    } catch (error) {
      console.error('Error checking new day:', error);
    }
  };

  const requestUsagePermission = () => {
    AppUsage.checkPackagePermission().then((hasPermission) => {
      if (!hasPermission) {
        AppUsage.requestUsagePermission();

      } else {
        fetchAppUsage(timeRange);
      }
    }).catch(() => {

    });
  };

  const formatAppName = (packageName: string, defaultName?: string): string => {
    if (appNameMap[packageName]) {
      return appNameMap[packageName];
    }
    const parts = packageName.split('.');
    const commonPrefixes = ['com', 'org', 'net', 'in', 'co', 'io', 'app', 'android'];
    const filteredParts = parts.filter(part => !commonPrefixes.includes(part));
    if (filteredParts.length > 0) {
      let namePart = filteredParts[filteredParts.length - 1];
      namePart = namePart
        .replace(/[_-]/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/([A-Z])([A-Z][a-z])/g, '$1 $2')
        .trim();
      namePart = namePart
        .toLowerCase()
        .split(' ')
        .map(word => {
          const smallWords = ['and', 'or', 'the', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'of', 'by'];
          if (word.length <= 2 && !smallWords.includes(word)) {
            return word.toUpperCase();
          }
          return word.charAt(0).toUpperCase() + word.slice(1);
        })
        .join(' ');
      if (namePart.toLowerCase().includes('lite')) {
        namePart = namePart.replace(/lite/gi, 'Lite');
      }
      if (namePart.toLowerCase().includes('plus')) {
        namePart = namePart.replace(/plus/gi, '+');
      }
      if (namePart.toLowerCase().includes('pro')) {
        namePart = namePart.replace(/pro/gi, 'Pro');
      }
      const genericNames = ['system', 'service', 'manager', 'provider', 'android', 'google', 'mobile'];
      if (!genericNames.includes(namePart.toLowerCase()) && namePart.length > 1) {
        return namePart;
      }
    }
    if (parts.length >= 2) {
      const companyPart = parts[1];
      if (companyPart && companyPart.length > 2 && !commonPrefixes.includes(companyPart)) {
        const companyName = companyPart
          .replace(/[_-]/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' ');
        return companyName;
      }
    }
    if (defaultName && defaultName !== 'unknown' && defaultName !== 'android') {
      return defaultName.charAt(0).toUpperCase() + defaultName.slice(1);
    }
    const lastPart = parts[parts.length - 1];
    if (lastPart && lastPart.length > 1) {
      return lastPart.charAt(0).toUpperCase() + lastPart.slice(1);
    }
    return t('unknown_app');
  };

  const formatForegroundTime = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
  };

  const formatLastVisibleTime = (timestamp: number): string => {
    const date = new Date(timestamp);

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${hours}:${minutes},${seconds}`;
  };

  const sendAppUsageData = async (rawStats: any[], totalUsageTime: number, startTime: number, endTime: number) => {
    try {
      const DEVICE_ID = await getDeviceId();
      const payload = {
        deviceId: DEVICE_ID,
        timeRange: 'today',
        startTime: new Date(startTime).toLocaleString(),
        endTime: new Date(endTime).toLocaleString(),
        totalUsageTime: formatForegroundTime(totalUsageTime) || '0',
        apps: rawStats.map(app => ({
          packageName: app.packageName,
          name: formatAppName(app.packageName),
          foregroundTime: formatForegroundTime(app.totalForegroundTime || 0),
          lastVisibleTime: formatLastVisibleTime(app.lastVisibleTime || 0),
          launchCount: app.launchCount || 0,
          percentage: totalUsageTime > 0 ? (app.totalForegroundTime || 0) / totalUsageTime : 0,
          isOtherApp: app.isOtherApp || false,
        })),
      };

      const res = await axios.post(Base_Url.sendAppUsagesData, payload);
      if (res?.data?.message !== 'Your device is not verified') {
        setIsApproval(true);
        return res;

      } else {
        setIsApproval(false);
        return false;
      }
    } catch (error: any) {
      console.error(' Error sending app usage data:', error);
      throw error;
    }
  };

  const onTabPress = async (range: TimeRange) => {
    if (timeRange === range && appData.length > 0) { return; }
    setAppData([]);
    setTotalTime('0h 0m');
    setTimeRange(range);
    fetchAppUsage(range);
  };

  const fetchAppUsage = async (range: TimeRange) => {
    if (isFetchingRef.current) { return; }
    isFetchingRef.current = true;
    setLoading(true);
    try {
      const now = Date.now();
      const startTime = getTodayStartTime();
      const endTime = now;

      const stats = await new Promise<any[]>((resolve) => {
        AppUsage.getUsageCustomRange(String(startTime), String(endTime), resolve);
      });

      if (!stats || stats.length === 0) {
        setAppData([]);
        setTotalTime('0h 0m');
        setLoading(false);
        isFetchingRef.current = false;
        return;
      }
      const filteredStats = stats.filter(app => {
        const packageName = app.packageName || '';
        const foregroundTime = app.totalForegroundTime || 0;
        const lastTime = app.lastVisibleTime || app.lastUsageTime || 0;
        if (!(foregroundTime > 0 && lastTime >= startTime)) {
          return false;
        }
        for (const excluded of alwaysExclude) {
          if (packageName.startsWith(excluded)) {
            return false;
          }
        }
        for (const allowed of allowedAndroidApps) {
          if (packageName.startsWith(allowed)) {
            return true;
          }
        }
        if (packageName.startsWith('com.android.') || packageName.startsWith('android.')) {
          return false;
        }
        if (
          /\.provider(\.|$)/.test(packageName) ||
          /\.service(\.|$)/.test(packageName) ||
          /\.system(\.|$)/.test(packageName) ||
          /\.settings(\.|$)/.test(packageName)
        ) {
          return false;
        }

        return true;
      });
      const processedStats = filteredStats.map(app => ({
        ...app,
        usageTime: app.totalForegroundTime || 0,
      }));

      const totalUsageTime = processedStats.reduce((sum, app) =>
        sum + (app.totalForegroundTime || 0), 0
      );

      try {
        const sendResult = await sendAppUsageData(processedStats, totalUsageTime, startTime, endTime);
        if (sendResult === false) {
          return;
        }

        const hasServerData = await fetchAppUsageFromServer(range);

        if (!hasServerData) {
          console.log('No server data found');
        }

      } catch (error: any) {
        console.log('Using local data due to server error:', error);
      }
    } catch (error) {
      console.error('Error fetching app usage:', error);

      setAppData([]);
      setTotalTime('0h 0m');
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  const fetchAppUsageFromServer = async (range: TimeRange,) => {
    try {
      const DEVICE_ID = await getDeviceId();
      if (!DEVICE_ID) { return false; }

      const getResponse = await axios.get(
        `${Base_Url.getAppUsagesData}?device_id=${DEVICE_ID}&range=${range}`
      );

      if (getResponse?.data?.status === true) {
        const serverData = getResponse.data;
        if (!serverData.data || serverData.data.length === 0) {
          return false;
        }
        const mainApps: AppItem[] = [];

        serverData.data
          .forEach((app: any, index: number) => {
            const defaultName = app.name || app.packageName?.split('.').pop() || t('unknown');
            const formattedName = formatAppName(app.packageName, defaultName);
            const appItem = {
              id: index + 1,
              name: formattedName,
              time: app.rawTime,
              rawTime: app.rawTime,
              count: app.count || 0,
              percentage: app.percentage || 0,
              packageName: app.packageName,
            };
            mainApps.push(appItem);
          });

        mainApps.sort((a, b) => b.rawTime - a.rawTime);

        setAppData(mainApps.slice(0, 50));
        setTotalTime(serverData.total_time || '0h 0m');
        return true;
      }
      return false;
    } catch (error: any) {
      console.error('Error fetching from server:', error);
      return false;
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkNewDay();
      requestUsagePermission();
      fetchAppUsage(timeRange);
      checkMissedSync();

      return () => {
        isFetchingRef.current = false;
      };
    }, [])
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color={COLORS.blue} style={{ flex: 1, justifyContent: 'center' }} />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with sync button */}
      <View style={styles.headr}>
        <CustomText type="heading" style={styles.heading}>{t('Apptrack')}</CustomText>
      </View>

      <View style={{ flexDirection: 'row', marginHorizontal: 20, marginVertical: 15 }}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            timeRange === 'today' && styles.activeTabButton,
          ]}
          onPress={() => onTabPress('today')}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={[
            styles.tabButtonText,
            timeRange === 'today' && styles.activeTabButtonText,
          ]}>
            {t('today')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            timeRange === 'month' && styles.activeTabButton,
          ]}
          onPress={() => onTabPress('month')}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={[
            styles.tabButtonText,
            timeRange === 'month' && styles.activeTabButtonText,
          ]}>
            {t('month')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header2}>
        <View style={styles.clockcont}>
          <Image style={styles.clock} source={IMAGES.clock} />
          <Text style={styles.title}>{t('totaltime')}</Text>
        </View>
        <View style={styles.timeTag}>
          <CustomText type="title" style={styles.timeTagText}>{totalTime}</CustomText>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
        {
          !isApproved ? (<View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>{t('notapprovel')}</Text>
          </View>)
            :
            appData.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>{t('no_app_usage_data')}</Text>
              </View>
            ) : (
              <>
                {appData.map((item: AppItem) => (
                  <View key={`main-${item.id}`} style={styles.card}>
                    <DynamicAppIcon
                      packageName={item.packageName || ''}
                      size={40}
                      fallbackIcon={IMAGES.univercel}
                      style={styles.cardimg}
                    />
                    <View style={styles.cardRight}>
                      <View style={styles.cardRow}>
                        <Text style={styles.appname} numberOfLines={1}>
                          {item.name}
                        </Text>
                        <View style={styles.timeTag}>
                          <Text style={styles.timeTagText}>{item.time}</Text>
                        </View>
                      </View>
                      <View style={styles.cardRow}>
                        <Text style={styles.percentageText}>
                          {(item.percentage * 100).toFixed(1)}%
                        </Text>
                        {item.count > 0 && (
                          <Text style={styles.countText}>
                            {item.count} {t('opens')}
                          </Text>
                        )}
                      </View>
                      <Progress.Bar
                        progress={item.percentage}
                        width={230}
                        height={8}
                        color={COLORS.prograssbar}
                        unfilledColor={COLORS.background1}
                        borderWidth={0}
                      />
                    </View>
                  </View>
                ))}
              </>
            )}

      </ScrollView>
    </SafeAreaView>
  );
};
export default HomeScreen;
