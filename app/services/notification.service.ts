import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from '@/lib/supabase';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
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

export async function unsubscribeFromJobUpdates(jobId: number, token: string) {
  try {
    await supabase.from('job_subscriptions').delete().match({ job_id: jobId, token: token });
    return true;
  } catch (error) {
    console.error('Error unsubscribing from job:', error);
    return false;
  }
}

export type NotificationPreferences = {
  wants_new_jobs: boolean;
  wants_deadlines: boolean;
};

export async function getNotificationPreferences(token: string): Promise<NotificationPreferences | null> {
  try {
    const { data, error } = await supabase
      .from('device_tokens')
      .select('wants_new_jobs, wants_deadlines')
      .eq('token', token)
      .maybeSingle();
      
    if (error) throw error;
    
    // If data is null, the row doesn't exist yet, return defaults
    if (!data) {
      return {
        wants_new_jobs: true,
        wants_deadlines: true,
      };
    }
    
    return {
      wants_new_jobs: data.wants_new_jobs ?? true,
      wants_deadlines: data.wants_deadlines ?? true,
    };
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    return null;
  }
}

export async function updateNotificationPreferences(token: string, prefs: Partial<NotificationPreferences>) {
  try {
    const { error } = await supabase
      .from('device_tokens')
      .update(prefs)
      .eq('token', token);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return false;
  }
}
