import { useRouter } from 'expo-router';
import { Banknote, BriefcaseBusiness, Building2, ChevronLeft, ChevronRight, Cross, GraduationCap, HeartHandshake, Landmark, Laptop, Shield, Train } from 'lucide-react-native';
import { Pressable, ScrollView, StyleSheet, Text, View, ImageBackground, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { useCategoryCounts } from '@/hooks/useJobs';
import { toBanglaDigits } from '@/utils/date';

const categories = [
  { label: 'কম্পিউটার ও আইটি', categoryKey: 'ict', icon: Laptop },
  { label: 'ব্যাংক', categoryKey: 'bank', icon: Banknote },
  { label: 'রেলওয়ে', categoryKey: 'railway', icon: Train },
  { label: 'প্রতিরক্ষা', categoryKey: 'defence', icon: Shield },
  { label: 'শিক্ষা', categoryKey: 'education', icon: GraduationCap },
  { label: 'স্বাস্থ্য', categoryKey: 'health', icon: Cross },
  { label: 'প্রশাসন', categoryKey: 'administration', icon: Landmark },
  { label: 'সামাজিক কল্যাণ', categoryKey: 'welfare', icon: HeartHandshake },
  { label: 'প্রকৌশল', categoryKey: 'engineering', icon: Building2 },
  { label: 'অফিস সহায়ক', categoryKey: 'office', icon: BriefcaseBusiness },
] as const;

export default function CategoriesScreen() {
  const router = useRouter();
  const counts = useCategoryCounts();
  const open = (item: typeof categories[number]) => router.push({ pathname: '/jobs', params: { categoryKey: item.categoryKey } });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable accessibilityLabel="পেছনে যান" style={styles.back} onPress={router.back}>
            <ChevronLeft size={28} color="#0B1A14" />
          </Pressable>
          <View>
            <Text style={styles.title}>চাকরির বিভাগসমূহ</Text>
            <Text style={styles.subtitle}>একটি বিভাগ বেছে চাকরির সুযোগ খুঁজুন</Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={counts.isRefetching} onRefresh={() => void counts.refetch()} tintColor={colors.primary} />}>
        <ImageBackground
          source={{ uri: 'https://www.protidinersangbad.com/assets/news_photos/2022/09/23/image-355011.jpg' }}
          style={styles.banner}
          imageStyle={styles.bannerImage}
          resizeMode="cover"
        >
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>আপনার স্বপ্নের চাকরি{'\n'}খুঁজুন সহজেই</Text>
            <Text style={styles.bannerSubtitle}>সরকারি, ব্যাংক, শিক্ষা সহ সকল{'\n'}বিভাগের সব চাকরির সংগ্রহ</Text>
          </View>
        </ImageBackground>

        <View style={styles.grid}>
          {categories.map((item) => {
            const Icon = item.icon;
            return (
              <Pressable key={item.label} style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={() => open(item)}>
                <View style={styles.iconContainer}>
                  <Icon size={24} color="#006A4E" />
                </View>
                <View style={styles.cardTextContainer}>
                  <Text style={styles.cardTitle} numberOfLines={1}>{item.label}</Text>
                  <Text style={styles.cardSubtitle}>{counts.isLoading ? 'গণনা হচ্ছে…' : `${toBanglaDigits(counts.data?.[item.categoryKey] ?? 0)}টি চাকরি`}</Text>
                </View>
                <ChevronRight size={18} color="#6B7280" style={styles.cardChevron} />
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FAFCFB' },
  header: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#FAFCFB'
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8
  },
  title: { color: '#0B1A14', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#6B7280', fontSize: 13, marginTop: 2, fontWeight: '500' },
  searchButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: { padding: 16, paddingBottom: 30 },
  banner: {
    backgroundColor: '#E5F4EC',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    minHeight: 140,
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden'
  },
  bannerOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  bannerImage: {
    borderRadius: 16,
  },
  bannerContent: {
    zIndex: 1,
  },
  bannerTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 26,
    marginBottom: 8,
  },
  bannerSubtitle: {
    color: '#E5E7EB',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#EFEFEF',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  pressed: { opacity: .75, transform: [{ scale: .98 }] },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF4F1',
    marginRight: 10,
  },
  cardTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  cardTitle: { color: '#0B1A14', fontSize: 14, fontWeight: '800', marginBottom: 4 },
  cardSubtitle: { color: '#00845A', fontSize: 11, fontWeight: '600' },
  cardChevron: {
    marginLeft: 4
  }
});
