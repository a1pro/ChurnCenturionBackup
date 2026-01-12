/* eslint-disable prettier/prettier */
import { AppState, Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppUsage from 'react-native-app-usage';
import axios from 'axios';
import { Base_Url } from '../apiEndpoint/ApiEndpoint';
import { getDeviceId } from '../service/DeviceAuthService';

class SimpleBackgroundService {
  private static instance: SimpleBackgroundService;
  private syncTimeout: NodeJS.Timeout | null = null;
  private checkInterval: NodeJS.Timeout | null = null;
  private isSyncing = false;

  static getInstance(): SimpleBackgroundService {
    if (!SimpleBackgroundService.instance) {
      SimpleBackgroundService.instance = new SimpleBackgroundService();
    }
    return SimpleBackgroundService.instance;
  }

  // Initialize service
  async initialize() {
    console.log('Initializing Simple Background Service...');

    // Request necessary permissions
    await this.requestPermissions();

    // Start the service
    await this.start();

    // Setup app state listener
    this.setupAppStateListener();

    console.log('Background Service Started');
  }

  // Request permissions
  async requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        // For Android 12+ alarm permission
        if (Platform.Version >= 31) {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.SCHEDULE_EXACT_ALARM,
            {
              title: 'Schedule Exact Alarm Permission',
              message: 'App needs permission to schedule daily sync at midnight',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );

          if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
            console.warn('Schedule exact alarm permission denied');
          }
        }
      } catch (error) {
        console.error('Permission error:', error);
      }
    }
  }

  // Start the background service
  async start() {
    try {
      // Clear any existing timeouts/intervals
      this.cleanup();

      // Calculate time until midnight (11:59:59 PM)
      const now = new Date();
      const midnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        23, 59, 59, 0
      );

      let delay = midnight.getTime() - now.getTime();

      // If already past midnight, schedule for tomorrow
      if (delay < 0) {
        delay += 24 * 60 * 60 * 1000; // Add 24 hours
      }

      console.log(`Scheduling midnight sync in ${Math.floor(delay/1000/60)} minutes`);

      // Schedule midnight sync
      this.syncTimeout = setTimeout(async () => {
        await this.executeMidnightSync();
        // Re-schedule for next day
        this.start();
      }, delay);

      // Also start checking every minute after 11:50 PM
      this.startMinuteChecker();

      // Store schedule info
      await AsyncStorage.setItem('midnight_sync_scheduled', new Date().toISOString());

    } catch (error) {
      console.error('Error starting background service:', error);
    }
  }

  // Start checking every minute after 11:50 PM
  startMinuteChecker() {
    // Clear existing interval
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    // Check every minute
    this.checkInterval = setInterval(async () => {
      try {
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes();

        // If it's 11:50 PM or later
        if (hours === 23 && minutes >= 50) {
          console.log('Late night check - close to midnight');

          // Check if we already synced today
          const lastSync = await AsyncStorage.getItem('last_midnight_sync');
          const today = new Date().toDateString();

          if (!lastSync || new Date(lastSync).toDateString() !== today) {
            // If we haven't synced today, sync now
            await this.executeMidnightSync();
          }
        }
      } catch (error) {
        console.error('Minute checker error:', error);
      }
    }, 60 * 1000); // 1 minute
  }

  // Execute midnight sync
  async executeMidnightSync() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    this.isSyncing = true;

    try {
      console.log('Starting midnight sync...');

      // Check if we already synced today
      const today = new Date().toDateString();
      const lastSync = await AsyncStorage.getItem('last_midnight_sync');

      if (lastSync && new Date(lastSync).toDateString() === today) {
        console.log('Already synced today');
        return;
      }

      // Get today's app usage data
      const now = Date.now();
      const todayStart = this.getTodayStartTime();

      // Get app usage stats
      const stats = await new Promise<any[]>((resolve) => {
        AppUsage.getUsageCustomRange(String(todayStart), String(now), resolve);
      });

      if (stats && stats.length > 0) {
        // Send data to server
        await this.sendUsageData(stats, todayStart, now);

        // Update last sync time
        await AsyncStorage.setItem('last_midnight_sync', new Date().toISOString());

        console.log('Midnight sync completed successfully');

        // Show success notification
        await this.showLocalNotification('Sync Complete', 'Daily app usage data synced successfully!');
      } else {
        console.log('No usage data to sync');
      }

    } catch (error) {
      console.error('Midnight sync error:', error);

      // Store failed sync for retry
      await this.storeFailedSync(error);

      // Show error notification
      await this.showLocalNotification('Sync Failed', 'Will retry when app is opened');
    } finally {
      this.isSyncing = false;
    }
  }

  // Get today's start time in milliseconds
  private getTodayStartTime(): number {
    const now = new Date();
    const todayStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      0, 0, 0, 0
    );
    return todayStart.getTime();
  }

  // Send usage data to server
  private async sendUsageData(stats: any[], startTime: number, endTime: number) {
    try {
      const DEVICE_ID = await getDeviceId();

      // Calculate total usage time
      const totalUsageTime = stats.reduce(
        (sum, app) => sum + (app.totalForegroundTime || 0),
        0
      );

      // Prepare payload
      const payload = {
        deviceId: DEVICE_ID,
        timeRange: 'today',
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
        totalUsageTime: this.formatTime(totalUsageTime),
        apps: stats.map(app => ({
          packageName: app.packageName,
          name: app.packageName,
          foregroundTime: this.formatTime(app.totalForegroundTime || 0),
          lastVisibleTime: new Date(app.lastVisibleTime || 0).toISOString(),
          launchCount: app.launchCount || 0,
        })),
      };

      // Send to server
      await axios.post(Base_Url.sendAppUsagesData, payload);

      console.log('Usage data sent to server successfully');

    } catch (error) {
      console.error('Error sending usage data:', error);
      throw error;
    }
  }

  // Format time to HH:MM:SS
  private formatTime(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  // Store failed sync for retry
  private async storeFailedSync(error: any) {
    try {
      const failedSyncs = await AsyncStorage.getItem('failed_syncs');
      const syncs = failedSyncs ? JSON.parse(failedSyncs) : [];

      syncs.push({
        timestamp: new Date().toISOString(),
        error: error.message || 'Unknown error',
      });

      // Keep only last 10 failed syncs
      if (syncs.length > 10) {
        syncs.splice(0, syncs.length - 10);
      }

      await AsyncStorage.setItem('failed_syncs', JSON.stringify(syncs));
    } catch (err) {
      console.error('Error storing failed sync:', err);
    }
  }

  // Show local notification (simplified)
  private async showLocalNotification(title: string, message: string) {
    try {
      // You can use any notification library here
      // For now, we'll just log it
      console.log(`Notification: ${title} - ${message}`);

      // If you have react-native-push-notification installed:
      // PushNotification.localNotification({
      //   title,
      //   message,
      //   playSound: false,
      // });
    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  // Setup app state listener
  private setupAppStateListener() {
    AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        // App came to foreground
        console.log('App became active, checking for pending syncs');

        // Retry any failed syncs
        await this.retryFailedSyncs();

        // Check if we need to sync today
        await this.checkTodaySync();
      }
    });
  }

  // Retry failed syncs
  async retryFailedSyncs() {
    try {
      const failedSyncs = await AsyncStorage.getItem('failed_syncs');
      if (!failedSyncs) {return;}

      const syncs = JSON.parse(failedSyncs);

      if (syncs.length > 0) {
        console.log(`Retrying ${syncs.length} failed syncs`);

        // Try to sync now
        await this.executeMidnightSync();

        // Clear failed syncs after successful retry
        await AsyncStorage.removeItem('failed_syncs');
      }
    } catch (error) {
      console.error('Error retrying failed syncs:', error);
    }
  }

  // Check if we need to sync today
  async checkTodaySync() {
    try {
      const today = new Date().toDateString();
      const lastSync = await AsyncStorage.getItem('last_midnight_sync');

      // If we haven't synced today
      if (!lastSync || new Date(lastSync).toDateString() !== today) {
        const now = new Date();
        const hours = now.getHours();

        // If it's 12 AM to 4 AM (midnight to early morning)
        if (hours >= 0 && hours <= 4) {
          console.log('Early morning sync check');
          await this.executeMidnightSync();
        }
      }
    } catch (error) {
      console.error('Error checking today sync:', error);
    }
  }

  // Manual sync trigger (for testing)
  async triggerManualSync() {
    console.log('Manual sync triggered');
    await this.executeMidnightSync();
  }

  // Cleanup timeouts and intervals
  cleanup() {
    if (this.syncTimeout) {
      clearTimeout(this.syncTimeout);
      this.syncTimeout = null;
    }

    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }
}

export default SimpleBackgroundService.getInstance();
