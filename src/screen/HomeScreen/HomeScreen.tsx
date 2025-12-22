import React, { useCallback, useRef, useState, } from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import * as Progress from 'react-native-progress';
import AppUsage from 'react-native-app-usage';

import IMAGES from '../../assets/images';
import { CustomText } from '../../components/CustomText';
import COLORS from '../../utils/Colors';
import styles from './style';
import { useFocusEffect} from '@react-navigation/native';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { RootTabParamList } from '../../types';
import { t } from 'i18next';
import axios from 'axios';
import { Base_Url } from '../../utils/ApiUrl';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  appNameMap, iconMap,
} from '../../components/Appname';


interface AppItem {
  id: number;
  name: string;
  icon: any;
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

  const isFetchingRef = useRef(false);
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
    return t("unknown_app");
  };

  const getAppIcon = (packageName: string, isOtherApp: boolean = false) => {
    if (isOtherApp) {
      return IMAGES.univercel || IMAGES.univercel;
    }
    if (iconMap[packageName]) {
      return iconMap[packageName];
    }
    for (const key in iconMap) {
      if (packageName.includes(key.split('.')[1])) {
        return iconMap[key];
      }
    }
    return IMAGES.univercel;
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
      const DEVICE_ID = await AsyncStorage.getItem('device_id');

      const payload = {
        deviceId: DEVICE_ID,
        timeRange: "today",

        startTime: new Date(startTime).toLocaleString(),
        endTime: new Date(endTime).toLocaleString(),
        totalUsageTime: formatForegroundTime(totalUsageTime) || "0",
        apps: rawStats.map(app => ({
          packageName: app.packageName,
          name: formatAppName(app.packageName),
          foregroundTime: formatForegroundTime(app.totalForegroundTime || 0),
          lastVisibleTime: formatLastVisibleTime(app.lastVisibleTime || 0),
          launchCount: app.launchCount || 0,
          percentage: totalUsageTime > 0 ? (app.totalForegroundTime || 0) / totalUsageTime : 0,
          isOtherApp: app.isOtherApp || false
        }))
      };

      console.log('Sending payload:', payload);
      const res = await axios.post(Base_Url.sendAppUsagesData, payload);
     
      if (res?.data?.message !== "Your device is not verified") {
        setIsApproval(true);
        return res;

      } else {
        setIsApproval(false);
        return false
      }
    } catch (error: any) {
      console.error(' Error sending app usage data:', error);
      throw error;
    }
  };

  const onTabPress = async (range: TimeRange) => {
    if (timeRange === range && appData.length > 0) return;
    setAppData([]);
    setTotalTime('0h 0m');
    setTimeRange(range);
    fetchAppUsage(range);
  };
 
  const fetchAppUsage = async (range: TimeRange) => {
  if (isFetchingRef.current) return;
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

    const todayStats = stats.filter(app => {
      const foregroundTime = app.totalForegroundTime || 0;
      const lastTime = app.lastVisibleTime || app.lastUsageTime || 0;
      return foregroundTime > 0 && lastTime >= startTime;
    });

    const filteredStats = todayStats.filter(app => app.packageName !== 'com.apptrack');

    const processedStats = filteredStats.map(app => ({
      ...app,
      usageTime: app.totalForegroundTime || 0
    }));

    const totalUsageTime = processedStats.reduce((sum, app) =>
      sum + (app.totalForegroundTime || 0), 0
    );

    try {
      const sendResult = await sendAppUsageData(processedStats, totalUsageTime, startTime, endTime);
      if (sendResult === false) {
        console.log('not verified');
        return;
      }

      const hasServerData = await fetchAppUsageFromServer(range);

      if (!hasServerData) {
        console.log('No server data found');
      }

    } catch (error: any) {
      console.log('Using local data due to server error:', error.message);
    }
  } catch (error) {
    console.error('Error fetching app usage:', error.message);
    
    setAppData([]);
    setTotalTime('0h 0m');
  } finally {
    setLoading(false);
    isFetchingRef.current = false;
  }
};

  const fetchAppUsageFromServer = async (range: TimeRange,) => {
    try {
      const DEVICE_ID = await AsyncStorage.getItem('device_id');
      if (!DEVICE_ID) return false;

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
            const defaultName = app.name || app.packageName?.split('.').pop() || t("unknown");
            const formattedName = formatAppName(app.packageName, defaultName);
            const appItem = {
              id: index + 1,
              name: formattedName,
              icon: getAppIcon(app.packageName),
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
      console.log(error)
      return false;
    }
  };

  useFocusEffect(
    useCallback(() => {
      checkNewDay();

      requestUsagePermission();
      fetchAppUsage(timeRange);
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
      <View style={styles.headr}>
        <CustomText type='heading' style={styles.heading}>{t("Apptrack")}</CustomText>
      </View>

      <View style={{ flexDirection: 'row', marginHorizontal: 20, marginVertical: 15 }}>
        <TouchableOpacity
          style={[
            styles.tabButton,
            timeRange === 'today' && styles.activeTabButton
          ]}
          onPress={() => onTabPress('today')}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={[
            styles.tabButtonText,
            timeRange === 'today' && styles.activeTabButtonText
          ]}>
            {t('today')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tabButton,
            timeRange === 'month' && styles.activeTabButton
          ]}
          onPress={() => onTabPress('month')}
          activeOpacity={0.7}
          disabled={loading}
        >
          <Text style={[
            styles.tabButtonText,
            timeRange === 'month' && styles.activeTabButtonText
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
          <CustomText type='title' style={styles.timeTagText}>{totalTime}</CustomText>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {
          !isApproved ?(<View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("notapprovel")}</Text>
            </View>)
          :
          appData.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>{t("no_app_usage_data")}</Text>
            </View>
          ) : (
            <>
              {appData.map((item: AppItem) => (
                <View key={`main-${item.id}`} style={styles.card}>
                  <Image style={styles.cardimg} source={item.icon} />
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
                          {item.count} {t("opens")}
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
                      borderRadius={5}
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
