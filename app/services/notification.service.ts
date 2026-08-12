import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function requestNotificationPermissionAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  return finalStatus === 'granted';
}

export async function registerForPushNotificationsAsync() {
  let token: string | null = null;

  if (!Device.isDevice) {
    token = 'ExponentPushToken[dummy-token-emulator]';
  } else {
    const hasPermission = await requestNotificationPermissionAsync();
    if (!hasPermission) return null;

    try {
      const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.expoConfig?.slug ?? 'govt-jobs-bd';
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId,
      });
      token = tokenData.data;
    } catch (error) {
      console.error('Error fetching push token:', error);
      token = __DEV__ ? 'ExponentPushToken[dummy-token-fallback]' : null;
    }
  }

  // Save token to Supabase
  if (token) {
    await supabase.from('device_tokens').upsert({ 
      token: token, 
      platform: Platform.OS 
    }, { onConflict: 'token' });
  }

  return token;
}

export async function subscribeToJobUpdates(jobId: number, token: string) {
  try {
    await supabase.from('job_subscriptions').upsert({
      job_id: jobId,
      token: token,
    }, { onConflict: 'job_id,token' });
    return true;
  } catch (error) {
    console.error('Error subscribing to job:', error);
    return false;
  }
}
