import { useRef, useState } from 'react';
import { ChevronRight, FileCheck2, Globe2, RefreshCw, SearchCheck } from 'lucide-react-native';
import { FlatList, Image, Pressable, StyleSheet, Text, useWindowDimensions, View, type ViewToken } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

const EMBLEM = require('@/assets/images/bd-government-emblem.jpg');
const slides = [
  { key: 'problem', icon: Globe2, eyebrow: 'একটি পরিচিত সমস্যা', title: 'চাকরি খুঁজতে আর নয়\nwebsite থেকে website', text: 'মন্ত্রণালয় ও সরকারি দপ্তরের অসংখ্য website ঘুরে সঠিক নিয়োগ বিজ্ঞপ্তি খোঁজা সময়সাপেক্ষ। গুরুত্বপূর্ণ circular চোখ এড়িয়ে যাওয়ার দুশ্চিন্তাও থাকে।' },
  { key: 'solution', icon: FileCheck2, eyebrow: 'আপনার জন্য সহজ সমাধান', title: 'চাকরি, যোগ্যতা ও circular এখন একই platform-এ', text: 'বিভিন্ন সরকারি প্রতিষ্ঠানের প্রকাশিত চাকরি, আবেদনের যোগ্যতা, শেষ তারিখ এবং official PDF সাজানোভাবে দেখুন—এক জায়গা থেকেই।' },
  { key: 'updates', icon: RefreshCw, eyebrow: 'নিয়মিত তথ্য সংগ্রহ', title: 'প্রতিদিনের update-এ\nএগিয়ে থাকুন', text: 'নতুন চাকরি, deadline, পরীক্ষা ও প্রবেশপত্রের প্রকাশিত তথ্য নিয়মিত collect করি—আপনার সময় বাঁচাতে এবং সঠিক opportunity খুঁজে পেতে।' },
] as const;

export function IntroSlides({ onFinish }: { onFinish: () => void }) {
  const { width } = useWindowDimensions();
  const list = useRef<FlatList<(typeof slides)[number]>>(null);
  const indexRef = useRef(0);
  const [, renderIndex] = useStateWithRef();
  const index = indexRef.current;
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    const nextIndex = viewableItems[0]?.index;
    if (nextIndex !== null && nextIndex !== undefined) { indexRef.current = nextIndex; renderIndex(); }
  }).current;
  const next = () => index === slides.length - 1 ? onFinish() : list.current?.scrollToIndex({ index: index + 1, animated: true });

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.flagLine}><View style={styles.flagGreen} /><View style={styles.flagRed} /></View>
      <View style={styles.top}>
        <View style={styles.brand}><Image source={EMBLEM} style={styles.emblem} /><View><Text style={styles.gov}>সরকারি চাকরির তথ্যসেবা</Text><Text style={styles.brandTitle}>সরকারি চাকরি</Text></View></View>
        <Pressable accessibilityRole="button" onPress={onFinish} style={styles.skip}><Text style={styles.skipText}>এড়িয়ে যান</Text></Pressable>
      </View>
      <FlatList ref={list} data={slides} horizontal pagingEnabled showsHorizontalScrollIndicator={false} keyExtractor={(item) => item.key} onViewableItemsChanged={onViewableItemsChanged} viewabilityConfig={{ itemVisiblePercentThreshold: 60 }} renderItem={({ item, index: slideIndex }) => {
        const Icon = item.icon;
        return <View style={[styles.slide, { width }]}><View style={styles.art}><View style={styles.artOuter}><View style={styles.artMiddle}><View style={styles.artCard}><Image source={EMBLEM} resizeMode="contain" style={styles.artEmblem} /><Text style={styles.artBrand}>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</Text><View style={styles.artLineWide} /><View style={styles.artLine} /></View></View></View><View style={styles.searchBadge}><SearchCheck size={21} color="#fff" /></View><View style={styles.jobBadge}><Icon size={21} color={colors.primary} /></View><View style={[styles.numberBadge, slideIndex === 2 && styles.numberBadgeRed]}><Text style={styles.numberText}>{slideIndex + 1}</Text></View></View><Text style={styles.eyebrow}>{item.eyebrow}</Text><Text style={styles.title}>{item.title}</Text><Text style={styles.text}>{item.text}</Text><View style={styles.trust}><FileCheck2 size={15} color={colors.primary} /><Text style={styles.trustText}>প্রকাশিত source ও circular যাচাইয়ের সুবিধা</Text></View></View>;
      }} />
      <View style={styles.bottom}><View style={styles.dots}>{slides.map((slide, dot) => <View key={slide.key} style={[styles.dot, dot === index && styles.dotActive]} />)}</View><Pressable accessibilityRole="button" style={styles.next} onPress={next}><Text style={styles.nextText}>{index === slides.length - 1 ? 'আমার তথ্য যোগ করুন' : 'পরবর্তী'}</Text><ChevronRight size={20} color="#fff" /></Pressable><Text style={styles.disclaimer}>এটি একটি স্বাধীন তথ্যসংগ্রাহক platform—আবেদনের আগে official circular যাচাই করুন।</Text></View>
    </SafeAreaView>
  );
}

function useStateWithRef() {
  const [, setVersion] = useState(0);
  return [0, () => setVersion((value) => value + 1)] as const;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, flagLine: { height: 4, flexDirection: 'row' }, flagGreen: { flex: 1, backgroundColor: colors.primary }, flagRed: { width: 48, backgroundColor: colors.red },
  top: { minHeight: 66, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 18 }, brand: { flexDirection: 'row', alignItems: 'center', gap: 8 }, emblem: { width: 40, height: 40, borderRadius: 20 }, gov: { color: '#34684F', fontSize: 8.5, fontWeight: '700' }, brandTitle: { color: colors.primaryDeep, fontSize: 16, fontWeight: '900', marginTop: 1 }, skip: { minHeight: 40, justifyContent: 'center', paddingHorizontal: 8 }, skipText: { color: colors.primary, fontSize: 12, fontWeight: '800' },
  slide: { alignItems: 'center', paddingHorizontal: 28, paddingTop: 13 }, art: { width: 248, height: 242, alignItems: 'center', justifyContent: 'center', marginBottom: 15 }, artOuter: { width: 224, height: 224, borderRadius: 112, alignItems: 'center', justifyContent: 'center', backgroundColor: '#EFF8F4' }, artMiddle: { width: 174, height: 174, borderRadius: 87, alignItems: 'center', justifyContent: 'center', backgroundColor: '#DDF0E7', borderWidth: 1, borderColor: '#C8E7D9' }, artCard: { width: 126, height: 150, alignItems: 'center', justifyContent: 'center', borderRadius: 22, borderWidth: 1, borderColor: '#C9DED4', backgroundColor: '#fff', shadowColor: '#123B2B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: .09, shadowRadius: 9, elevation: 3 }, artEmblem: { width: 68, height: 68, borderRadius: 34 }, artBrand: { color: colors.primaryDeep, fontSize: 6.5, fontWeight: '800', textAlign: 'center', marginTop: 6 }, artLineWide: { width: 62, height: 5, borderRadius: 3, marginTop: 9, backgroundColor: '#B9DCCB' }, artLine: { width: 43, height: 5, borderRadius: 3, marginTop: 6, backgroundColor: '#D6E9E0' }, searchBadge: { position: 'absolute', right: 14, bottom: 28, width: 48, height: 48, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary, borderWidth: 4, borderColor: '#fff' }, jobBadge: { position: 'absolute', left: 11, top: 38, width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', borderWidth: 1, borderColor: '#C8E9DC' }, numberBadge: { position: 'absolute', right: 25, top: 25, width: 29, height: 29, borderRadius: 15, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }, numberBadgeRed: { backgroundColor: colors.red }, numberText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  eyebrow: { color: colors.primary, fontSize: 12, fontWeight: '900', marginBottom: 9 }, title: { color: colors.text, fontSize: 24, lineHeight: 34, fontWeight: '900', textAlign: 'center' }, text: { color: colors.textSecondary, fontSize: 13, lineHeight: 21, textAlign: 'center', marginTop: 12, maxWidth: 335 }, trust: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 11, paddingVertical: 7, borderRadius: 10, backgroundColor: colors.primaryLight, marginTop: 13 }, trustText: { color: colors.primaryDeep, fontSize: 9.5, fontWeight: '700' },
  bottom: { paddingHorizontal: 22, paddingBottom: 12, alignItems: 'center' }, dots: { height: 22, flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 }, dot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.border }, dotActive: { width: 24, backgroundColor: colors.primary }, next: { width: '100%', minHeight: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 14, backgroundColor: colors.primary }, nextText: { color: '#fff', fontSize: 14, fontWeight: '900' }, disclaimer: { color: colors.textSecondary, fontSize: 9, lineHeight: 14, textAlign: 'center', marginTop: 10 },
});
