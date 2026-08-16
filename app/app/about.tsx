import { View, Text, StyleSheet, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { ChevronLeft, Info, ShieldCheck } from 'lucide-react-native';

import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';

export default function AboutScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.header}>
        <Pressable style={styles.headerButton} accessibilityLabel="পেছনে যান" onPress={() => router.back()}>
          <ChevronLeft size={25} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>অ্যাপ সম্পর্কে</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.brandSection}>
          <Image source={require('@/assets/images/custom_emblem.png')} contentFit="contain" style={styles.emblem} />
          <Text style={styles.brandTitle}>সরকারি চাকরি</Text>
          <Text style={styles.version}>সংস্করণ ১.০.০</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.iconBg}>
              <Info size={20} color={colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>আমাদের লক্ষ্য</Text>
              <Text style={styles.rowDesc}>
                আমাদের মূল লক্ষ্য হলো চাকরিপ্রার্থীদের মূল্যবান সময় বাঁচানো। কোথায় নতুন জব সার্কুলার এল বা আপনার যোগ্যতার সাথে কোন চাকরিটি ম্যাচ করে—তা জানতে যেন আর বিভিন্ন ওয়েবসাইটে ঘুরতে না হয়, সে জন্যই আমাদের এই অ্যাপ।
              </Text>
            </View>
          </View>
          
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <View style={styles.iconBg}>
              <ShieldCheck size={20} color={colors.primary} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.rowTitle}>তথ্যসূত্র ও ডিসক্লেইমার</Text>
              <Text style={styles.rowDesc}>
                এই অ্যাপটি প্রকাশ্যে পাওয়া সরকারি চাকরির তথ্য একত্র করে। এটি বাংলাদেশ সরকারের কোনো অফিসিয়াল অ্যাপ নয়। চাকরির তথ্য সংশ্লিষ্ট সরকারি প্রতিষ্ঠানের অফিসিয়াল প্রকাশনা থেকে সংগ্রহ করা হয়। আবেদন করার আগে অবশ্যই অফিসিয়াল বিজ্ঞপ্তি যাচাই করে নিবেন।
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 58, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card },
  headerButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: colors.text, fontSize: 17, textAlign: 'center', fontWeight: '700' },
  headerRight: { width: 44, height: 44 },
  content: { padding: 16, gap: 24, paddingBottom: 40 },
  brandSection: { alignItems: 'center', marginTop: 20 },
  emblem: { width: 80, height: 80, borderRadius: 40, marginBottom: 16 },
  brandTitle: { color: colors.primaryDeep, fontSize: 24, fontWeight: '900', marginBottom: 4 },
  version: { color: colors.textSecondary, fontSize: 14, fontWeight: '600' },
  card: { backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: { flexDirection: 'row', padding: 16, gap: 14 },
  iconBg: { width: 40, height: 40, borderRadius: 12, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
  rowText: { flex: 1 },
  rowTitle: { color: colors.text, fontSize: 16, fontWeight: '700', marginBottom: 6 },
  rowDesc: { color: colors.textSecondary, fontSize: 13, lineHeight: 20 },
  divider: { height: 1, backgroundColor: colors.border, marginLeft: 70 },
});
