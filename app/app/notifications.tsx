import { useEffect, useState } from 'react';
import { View, Text, Switch, StyleSheet, ScrollView, ActivityIndicator, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { ChevronLeft, BellRing, BriefcaseBusiness, CalendarClock } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';
import { 
  getNotificationPreferences, 
  updateNotificationPreferences, 
  registerForPushNotificationsAsync,
  type NotificationPreferences 
} from '@/services/notification.service';

export default function NotificationsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    wants_new_jobs: true,
    wants_deadlines: true,
  });

  useEffect(() => {
    async function loadPreferences() {
      try {
        const pushToken = await registerForPushNotificationsAsync();
        if (pushToken) {
          setToken(pushToken);
          const currentPrefs = await getNotificationPreferences(pushToken);
          if (currentPrefs) {
            setPrefs(currentPrefs);
          }
        }
      } catch (error) {
        console.error('Failed to load preferences:', error);
      } finally {
        setLoading(false);
      }
    }
    loadPreferences();
  }, []);

  const handleToggle = async (key: keyof NotificationPreferences, value: boolean) => {
    if (!token) return;
    
    // Optimistic update
    setPrefs(prev => ({ ...prev, [key]: value }));
    setSaving(true);
    
    try {
      await updateNotificationPreferences(token, { [key]: value });
    } catch (error) {
      console.error('Failed to update preference:', error);
      // Revert on failure
      setPrefs(prev => ({ ...prev, [key]: !value }));
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable style={styles.headerButton} accessibilityLabel="পেছনে যান" onPress={() => router.back()}>
          <ChevronLeft size={25} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>নোটিফিকেশন সেটিং</Text>
        <View style={styles.headerRight}>
          {saving && <ActivityIndicator size="small" color={colors.primary} />}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>লোড হচ্ছে...</Text>
        </View>
      ) : !token ? (
        <View style={styles.center}>
          <BellRing size={48} color={colors.textSecondary} style={{ marginBottom: 16 }} />
          <Text style={styles.errorTitle}>নোটিফিকেশন অনুমতি নেই</Text>
          <Text style={styles.errorDesc}>
            আপনার ডিভাইসের সেটিং থেকে এই অ্যাপের জন্য নোটিফিকেশন চালু করুন।
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.sectionTitle}>কোন ধরণের নোটিফিকেশন পেতে চান?</Text>
          
          <View style={styles.card}>
            <View style={styles.row}>
              <View style={styles.iconBg}>
                <BriefcaseBusiness size={20} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>নতুন জব অ্যালার্ট</Text>
                <Text style={styles.rowDesc}>প্রতিদিন নতুন প্রকাশিত চাকরির খবর</Text>
              </View>
              <Switch
                value={prefs.wants_new_jobs}
                onValueChange={(val) => handleToggle('wants_new_jobs', val)}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={prefs.wants_new_jobs ? colors.primary : '#f4f3f4'}
              />
            </View>
            
            <View style={styles.divider} />
            
            <View style={styles.row}>
              <View style={styles.iconBg}>
                <CalendarClock size={20} color={colors.primary} />
              </View>
              <View style={styles.rowText}>
                <Text style={styles.rowTitle}>আবেদনের শেষ সময়</Text>
                <Text style={styles.rowDesc}>সেভ করা জবগুলোর ডেডলাইন রিমাইন্ডার</Text>
              </View>
              <Switch
                value={prefs.wants_deadlines}
                onValueChange={(val) => handleToggle('wants_deadlines', val)}
                trackColor={{ false: colors.border, true: colors.primaryLight }}
                thumbColor={prefs.wants_deadlines ? colors.primary : '#f4f3f4'}
              />
            </View>
          </View>
          
          <Text style={styles.footerNote}>
            আপনার পছন্দ অনুযায়ী আমরা নোটিফিকেশন পাঠাবো, যাতে আপনার বিরক্তি না হয়।
          </Text>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: colors.text, fontSize: 17, textAlign: 'center', fontWeight: '700' },
  headerRight: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  loadingText: { color: colors.textSecondary, marginTop: 12, fontSize: 15 },
  errorTitle: { color: colors.text, fontSize: 18, fontWeight: '700', marginBottom: 8 },
  errorDesc: { color: colors.textSecondary, fontSize: 14, textAlign: 'center', lineHeight: 22 },
  content: { padding: 16, gap: 16 },
  sectionTitle: { color: colors.textSecondary, fontSize: 13, fontWeight: '700', marginLeft: 4, marginBottom: 4 },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16, gap: 14 },
  iconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 15, fontWeight: '700', marginBottom: 2 },
  rowDesc: { color: colors.textSecondary, fontSize: 12, lineHeight: 18 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 70 },
  footerNote: { color: colors.textSecondary, fontSize: 12, textAlign: 'center', marginTop: 12, paddingHorizontal: 20, lineHeight: 18 },
});
