import { useRouter } from 'expo-router';
import { Bookmark, BriefcaseBusiness, ChevronLeft, ChevronRight, Clock3, LayoutGrid, Sparkles } from 'lucide-react-native';
import { ImageBackground, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { useHomeStats } from '@/hooks/useJobs';
import { useSavedJobsStore } from '@/store/savedJobs.store';
import { toBanglaDigits } from '@/utils/date';

const BANNER_IMAGE = 'https://www.protidinersangbad.com/assets/news_photos/2022/09/23/image-355011.jpg';

export default function OverviewScreen() {
  const router = useRouter();
  const stats = useHomeStats();
  const saved = useSavedJobsStore((state) => state.savedJobIds.length);
  const go = (params?: Record<string, string>) => router.push({ pathname: '/jobs', params });

  const cards = [
    { title: 'চলমান চাকরি', hint: 'সব সক্রিয় নিয়োগ', value: stats.data?.active, icon: BriefcaseBusiness, onPress: () => go() },
    { title: 'নতুন চাকরি', hint: 'গত ৭ দিনে প্রকাশিত', value: stats.data?.recent, icon: Sparkles, onPress: () => go({ published: '7' }) },
    { title: 'সময় শেষ হচ্ছে', hint: 'আগামী ৭ দিনের মধ্যে', value: stats.data?.closing, icon: Clock3, urgent: true, onPress: () => go({ deadline: '7' }) },
    { title: 'সংরক্ষিত চাকরি', hint: 'আপনার পছন্দের তালিকা', value: saved, icon: Bookmark, onPress: () => router.push('/saved') },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable accessibilityLabel="পেছনে যান" style={styles.back} onPress={router.back}><ChevronLeft size={28} color="#0B1A14" /></Pressable>
        <View><Text style={styles.title}>চাকরির সারসংক্ষেপ</Text><Text style={styles.subtitle}>গুরুত্বপূর্ণ চাকরির তথ্য এক নজরে দেখুন</Text></View>
      </View>

      <ScrollView contentContainerStyle={styles.content} refreshControl={<RefreshControl refreshing={stats.isRefetching} onRefresh={() => void stats.refetch()} tintColor={colors.primary} />}>
        <ImageBackground source={{ uri: BANNER_IMAGE }} style={styles.banner} imageStyle={styles.bannerImage} resizeMode="cover">
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerEyebrow}>চাকরির হালনাগাদ তথ্য</Text>
            <Text style={styles.bannerTitle}>{stats.isLoading ? 'তথ্য প্রস্তুত হচ্ছে…' : `${toBanglaDigits(stats.data?.active ?? 0)}টি চলমান চাকরি`}</Text>
            <Text style={styles.bannerSubtitle}>নতুন নিয়োগ, শেষ সময় ও সংরক্ষিত চাকরি{`\n`}এক জায়গা থেকে সহজে দেখুন</Text>
          </View>
        </ImageBackground>

        <View style={styles.sectionHead}><Text style={styles.sectionTitle}>আপনার চাকরির তথ্য</Text><Text style={styles.sectionHint}>কার্ডে চাপ দিয়ে তালিকা দেখুন</Text></View>
        <View style={styles.grid}>
          {cards.map((item) => <OverviewCard key={item.title} {...item} loading={stats.isLoading && item.title !== 'সংরক্ষিত চাকরি'} />)}
        </View>

        <Pressable style={({ pressed }) => [styles.categoryCard, pressed && styles.pressed]} onPress={() => router.push('/categories')}>
          <View style={styles.categoryIcon}><LayoutGrid size={25} color="#006A4E" /></View>
          <View style={styles.categoryCopy}><Text style={styles.categoryTitle}>বিভাগ অনুযায়ী চাকরি খুঁজুন</Text><Text style={styles.categoryText}>সব বিভাগ ও সংশ্লিষ্ট চাকরির সংখ্যা দেখুন</Text></View>
          <ChevronRight size={21} color="#6B7280" />
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function OverviewCard({ icon: Icon, title, hint, value, urgent, loading, onPress }: { icon: typeof BriefcaseBusiness; title: string; hint: string; value?: number; urgent?: boolean; loading?: boolean; onPress: () => void }) {
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.pressed]} onPress={onPress}>
      <View style={[styles.iconContainer, urgent && styles.urgentIcon]}><Icon size={24} color={urgent ? '#B45309' : '#006A4E'} /></View>
      <Text style={[styles.value, urgent && styles.urgentText]}>{loading || value === undefined ? '—' : toBanglaDigits(value)}</Text>
      <Text style={styles.cardTitle} numberOfLines={1}>{title}</Text>
      <Text style={styles.cardSubtitle} numberOfLines={1}>{hint}</Text>
      <View style={styles.openRow}><Text style={styles.openText}>তালিকা দেখুন</Text><ChevronRight size={15} color="#00845A" /></View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: { minHeight: 80, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, backgroundColor: colors.background },
  back: { alignItems: 'center', justifyContent: 'center', marginLeft: -8 },
  title: { color: '#0B1A14', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#6B7280', fontSize: 13, marginTop: 2, fontWeight: '500' },
  content: { padding: 16, paddingBottom: 30 },
  banner: { minHeight: 150, justifyContent: 'center', padding: 20, marginBottom: 23, borderRadius: 16, overflow: 'hidden', backgroundColor: '#E5F4EC' },
  bannerImage: { borderRadius: 16 },
  bannerOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 35, 24, 0.64)' },
  bannerContent: { zIndex: 1 },
  bannerEyebrow: { color: '#BDE7D4', fontSize: 10, fontWeight: '800', marginBottom: 5 },
  bannerTitle: { color: '#FFFFFF', fontSize: 22, fontWeight: '900', marginBottom: 7 },
  bannerSubtitle: { color: '#E5F2EC', fontSize: 12, lineHeight: 18, fontWeight: '500' },
  sectionHead: { marginBottom: 13 },
  sectionTitle: { color: '#0B1A14', fontSize: 17, fontWeight: '900' },
  sectionHint: { color: '#6B7280', fontSize: 11, marginTop: 3 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  card: { width: '48%', minHeight: 176, padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#EFEFEF', backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: .03, shadowRadius: 2, elevation: 1 },
  pressed: { opacity: .75, transform: [{ scale: .98 }] },
  iconContainer: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center', marginBottom: 10, borderRadius: 12, backgroundColor: '#EEF4F1' },
  urgentIcon: { backgroundColor: '#FFF4E5' },
  value: { color: '#00845A', fontSize: 26, lineHeight: 31, fontWeight: '900' },
  urgentText: { color: '#B45309' },
  cardTitle: { color: '#0B1A14', fontSize: 13, fontWeight: '800', marginTop: 3 },
  cardSubtitle: { color: '#6B7280', fontSize: 9.5, marginTop: 3 },
  openRow: { flexDirection: 'row', alignItems: 'center', marginTop: 'auto', paddingTop: 9 },
  openText: { color: '#00845A', fontSize: 10.5, fontWeight: '700' },
  categoryCard: { minHeight: 78, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, marginTop: 18, borderRadius: 16, borderWidth: 1, borderColor: '#DCE8E2', backgroundColor: '#FFFFFF' },
  categoryIcon: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: 13, backgroundColor: '#EEF4F1' },
  categoryCopy: { flex: 1 },
  categoryTitle: { color: '#0B1A14', fontSize: 14, fontWeight: '900' },
  categoryText: { color: '#6B7280', fontSize: 10.5, marginTop: 4 },
});
