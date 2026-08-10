import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => NetInfo.addEventListener((state) => setOffline(state.isConnected === false)), []);
  if (!offline) return null;
  return <View style={styles.wrap}><WifiOff size={15} color={colors.text} /><Text style={styles.text}>অফলাইন—ক্যাশ করা তথ্য দেখানো হচ্ছে</Text></View>;
}
const styles = StyleSheet.create({ wrap: { minHeight: 34, backgroundColor: '#FFF4D6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, paddingHorizontal: 12 }, text: { color: colors.text, fontSize: 12, fontWeight: '600' } });
