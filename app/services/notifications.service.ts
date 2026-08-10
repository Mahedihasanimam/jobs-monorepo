import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Architecture-ready only: call from an explicit user opt-in flow when a
// notification backend is available. The first release never requests on boot.
export async function requestNotificationPermission() {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('job-alerts', {
      name: 'চাকরির আপডেট',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }
  return requested.granted;
}

export async function getExpoPushToken(projectId: string) {
  const permission = await requestNotificationPermission();
  if (!permission) return null;
  return (await Notifications.getExpoPushTokenAsync({ projectId })).data;
}
