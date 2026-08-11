import React, { useState } from 'react';
import {
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Bookmark,
  Briefcase,
  ChevronRight,
  Clock,
  Cross,
  GraduationCap,
  HeartHandshake,
  Landmark,
  LayoutGrid,
  Menu,
  Megaphone,
  Search,
  SlidersHorizontal,
  Sparkles,
  Train,
} from 'lucide-react-native';

import { useClosingSoonJobs, useHomeSearch, useHomeStats, useLatestJobs } from '@/hooks/useJobs';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { AppDrawer } from '@/components/layout/AppDrawer';
import { JobCard } from '@/components/job/JobCard';
import { JobCardSkeleton } from '@/components/job/JobCardSkeleton';
import { useSavedJobsStore } from '@/store/savedJobs.store';
import { useJobFiltersStore } from '@/store/jobFilters.store';
import { toBanglaDigits } from '@/utils/date';
import { useJobProfile } from '@/hooks/useJobProfile';
import { matchJob } from '@/utils/jobMatch';

const EMBLEM = require('@/assets/images/bd-government-emblem.jpg');

const COLORS = {
  primary: '#008A60',
  primaryDark: '#006F4E',
  primaryDarker: '#005B40',
  primarySoft: '#EAF7F1',
  text: '#17211D',
  text2: '#55615C',
  text3: '#7E8984',
  border: '#E5EAE7',
  borderSoft: '#EDF1EF',
  background: '#FFFFFF',
  surface: '#FFFFFF',
  softSurface: '#F8FAF9',
  orange: '#FF9B38',
  orangeSoft: '#FFF2E4',
  cyan: '#1E9CCB',
  cyanSoft: '#E8F6FB',
  red: '#E33F45',
};

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedQuick, setSelectedQuick] = useState<'all' | 'latest' | 'closing'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());

  const latest = useLatestJobs();
  const closing = useClosingSoonJobs();
  const stats = useHomeStats();
  const searchResults = useHomeSearch(debouncedSearch);
  const savedCount = useSavedJobsStore((state) => state.savedJobIds.length);
  const resetJobFilters = useJobFiltersStore((state) => state.resetFilters);
  const { profile } = useJobProfile();
  const personalized = (latest.data ?? []).map((job) => ({ job, match: matchJob(job, profile) })).sort((a, b) => b.match.percentage - a.match.percentage);

  const refreshing =
    latest.isRefetching || closing.isRefetching || stats.isRefetching;

  const refresh = () => {
    void latest.refetch();
    void closing.refetch();
    void stats.refetch();
  };

  const goJobs = (params?: Record<string, string>) => {
    resetJobFilters();
    router.push({ pathname: '/jobs', params });
  };

  const submitSearch = () => setSearch((value) => value.trim());

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.screen}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.brandWrap}>
              <View style={styles.logoWrap}>
                <Image source={EMBLEM} style={styles.logo} resizeMode="cover" />
              </View>

              <View style={styles.brandTextWrap}>
                <Text style={styles.govText}>গণপ্রজাতন্ত্রী বাংলাদেশ সরকার</Text>
                <Text style={styles.brandTitle}>সরকারি চাকরি</Text>
                <Text style={styles.brandSubtitle}>সরকারি চাকরির তথ্য ও আবেদন</Text>
              </View>
            </View>

            <Pressable
              accessibilityLabel="মেনু খুলুন"
              hitSlop={10}
              style={styles.bellButton}
              onPress={() => setDrawerOpen(true)}
            >
              <Menu size={23} color={COLORS.text} strokeWidth={1.8} />
            </Pressable>
          </View>

          {/* Search */}
          <View style={styles.searchBox}>
            <Search size={20} color="#38443F" strokeWidth={1.8} />
            <TextInput
              value={search}
              onChangeText={setSearch}
              onSubmitEditing={submitSearch}
              returnKeyType="search"
              placeholder="পদ, বিভাগ বা প্রতিষ্ঠান খুঁজুন"
              placeholderTextColor="#9AA29E"
              style={styles.searchInput}
            />
            <Pressable
              hitSlop={8}
              onPress={() => router.push({ pathname: '/filters', params: { from: 'home' } })}
              style={styles.filterButton}
            >
              <SlidersHorizontal size={18} color="#34413B" strokeWidth={1.8} />
            </Pressable>
          </View>

          {/* Quick filters */}
          <View style={styles.quickRow}>
            <QuickFilter
              active={selectedQuick === 'all'}
              icon={Briefcase}
              label="সব চাকরি"
              onPress={() => { setSelectedQuick('all'); goJobs({ preset: 'all' }); }}
            />
            <QuickFilter
              active={selectedQuick === 'latest'} icon={Sparkles}
              label="নতুন চাকরি"
              onPress={() => { setSelectedQuick('latest'); goJobs({ published: '7', preset: 'latest' }); }}
            />
            <QuickFilter
              active={selectedQuick === 'closing'} icon={Clock}
              label="শেষ সময় নিকটে"
              onPress={() => { setSelectedQuick('closing'); goJobs({ deadline: '7', preset: 'closing' }); }}
            />
          </View>

          {debouncedSearch.length >= 2 ? <View style={styles.inlineResults}><View style={styles.inlineResultHead}><Text style={styles.inlineResultTitle}>অনুসন্ধানের ফলাফল</Text>{searchResults.data ? <Text style={styles.inlineResultCount}>{toBanglaDigits(searchResults.data.count)}টি পাওয়া গেছে</Text> : null}</View>{searchResults.isLoading ? <><JobCardSkeleton /><JobCardSkeleton /></> : searchResults.isError ? <View style={styles.emptyCard}><Text style={styles.emptyTitle}>অনুসন্ধান করা যাচ্ছে না</Text><Pressable style={styles.retryButton} onPress={() => void searchResults.refetch()}><Text style={styles.retryText}>আবার চেষ্টা করুন</Text></Pressable></View> : searchResults.data?.jobs.length ? searchResults.data.jobs.slice(0, 5).map((job) => <JobCard key={job.id} job={job} />) : <View style={styles.emptyCard}><Text style={styles.emptyTitle}>কোনো মিল পাওয়া যায়নি</Text><Text style={styles.emptyText}>অন্য পদ বা প্রতিষ্ঠানের নাম লিখে দেখুন।</Text></View>}</View> : null}

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetScroller}>{([['🔥 শেষ সময় নিকটে', 'closing'], ['🆕 আজকের নতুন চাকরি', 'today'], ['🎓 এসএসসি পাস চাকরি', 'ssc'], ['🎓 এইচএসসি পাস চাকরি', 'hsc'], ['🎓 ডিপ্লোমা চাকরি', 'diploma'], ['🎓 স্নাতক চাকরি', 'graduate'], ['💻 কম্পিউটার ও আইসিটি', 'ict'], ['🏦 ব্যাংক চাকরি', 'bank'], ['🚆 রেলওয়ে চাকরি', 'railway'], ['👮 প্রতিরক্ষা চাকরি', 'defence'], ['👩 নারীদের জন্য চাকরি', 'women'], ['🧑‍🎓 নতুন প্রার্থীদের চাকরি', 'freshers'], ['💰 বেশি বেতনের চাকরি', 'highSalary']] as [string, string][]).map(([label, preset]) => <Pressable key={preset} style={styles.searchPreset} onPress={() => goJobs(preset === 'closing' ? { preset, deadline: '7' } : { preset })}><Text style={styles.searchPresetText}>{label}</Text></Pressable>)}</ScrollView>

          {/* Job summary */}
          <SectionTitle title="আপনার চাকরির সুযোগ" onPress={() => router.push('/overview')} />

          <View style={styles.summaryCard}>
            <SummaryItem
              icon={Briefcase}
              value={stats.data?.active}
              label="মোট চাকরি"
              tone="green"
              loading={stats.isLoading}
            />
            <View style={styles.summaryDivider} />
            <SummaryItem
              icon={Sparkles}
              value={stats.data?.recent}
              label="নতুন চাকরি"
              tone="teal"
              loading={stats.isLoading}
            />
            <View style={styles.summaryDivider} />
            <SummaryItem
              icon={Clock}
              value={stats.data?.closing}
              label="শেষ সময় নিকটে"
              tone="orange"
              loading={stats.isLoading}
            />
            <View style={styles.summaryDivider} />
            <SummaryItem
              icon={Bookmark}
              value={savedCount}
              label="সংরক্ষিত"
              tone="blue"
              loading={false}
            />
          </View>

          {/* Notice */}
          <View style={styles.noticeCard}>
            <View style={styles.noticeIconBox}>
              <Megaphone size={23} color="#FFFFFF" strokeWidth={1.8} />
            </View>

            <View style={styles.noticeCopy}>
              <Text style={styles.noticeTitle}>গুরুত্বপূর্ণ বিজ্ঞপ্তি</Text>
              <Text style={styles.noticeText} numberOfLines={2}>
                সর্বশেষ চাকরির সার্কুলার ও গুরুত্বপূর্ণ আপডেট এক জায়গায় দেখুন।
              </Text>
            </View>

            <Pressable
              style={styles.noticeAction}
              onPress={() => router.push('/notices')}
            >
              <Text style={styles.noticeActionText}>বিজ্ঞপ্তি দেখুন</Text>
              <ChevronRight
                size={12}
                color={COLORS.primary}
                strokeWidth={2.2}
              />
            </Pressable>
          </View>

          {/* Categories */}
          <SectionTitle title="বিভাগসমূহ" onPress={() => router.push('/categories')} />

          <View style={styles.categoryRow}>
            <CategoryItem
              icon={Train}
              label="রেলওয়ে"
              active={selectedCategory === 'রেলওয়ে'} onPress={() => { setSelectedCategory('রেলওয়ে'); goJobs({ categoryKey: 'railway' }); }}
            />
            <CategoryItem
              icon={GraduationCap}
              label="শিক্ষা মন্ত্রণালয়"
              active={selectedCategory === 'শিক্ষা'} onPress={() => { setSelectedCategory('শিক্ষা'); goJobs({ categoryKey: 'education' }); }}
            />
            <CategoryItem
              icon={Cross}
              label="স্বাস্থ্য"
              active={selectedCategory === 'স্বাস্থ্য'} onPress={() => { setSelectedCategory('স্বাস্থ্য'); goJobs({ categoryKey: 'health' }); }}
            />
            <CategoryItem
              icon={HeartHandshake}
              label="সামাজিক কল্যাণ"
              active={selectedCategory === 'সামাজিক কল্যাণ'} onPress={() => { setSelectedCategory('সামাজিক কল্যাণ'); goJobs({ categoryKey: 'welfare' }); }}
            />
            <CategoryItem
              icon={Landmark}
              label="জনপ্রশাসন"
              active={selectedCategory === 'জনপ্রশাসন'} onPress={() => { setSelectedCategory('জনপ্রশাসন'); goJobs({ categoryKey: 'administration' }); }}
            />
            <CategoryItem
              icon={GraduationCap}
              label="ডিপ্লোমা চাকরি"
              active={selectedCategory === 'ডিপ্লোমা'} onPress={() => { setSelectedCategory('ডিপ্লোমা'); goJobs({ preset: 'diploma' }); }}
            />
            <CategoryItem icon={LayoutGrid} label="আরও" onPress={() => router.push('/categories')} />
          </View>

          {/* Latest jobs */}
          <SectionTitle title="আপনার উপযোগী চাকরি" onPress={() => goJobs()} />

          <View style={styles.jobList}>
            {latest.isLoading ? (
              <>
                <JobCardSkeleton />
                <JobCardSkeleton />
                <JobCardSkeleton />
              </>
            ) : latest.isError ? (
              <View style={styles.errorCard}>
                <Text style={styles.errorTitle}>চাকরির তথ্য লোড করা যাচ্ছে না</Text>
                <Text style={styles.errorText}>
                  ইন্টারনেট সংযোগ ও তথ্যসেবা কনফিগারেশন যাচাই করুন।
                </Text>
                <Pressable style={styles.retryButton} onPress={() => void latest.refetch()}>
                  <Text style={styles.retryText}>আবার চেষ্টা করুন</Text>
                </Pressable>
              </View>
            ) : latest.data?.length ? (
              personalized.slice(0, 6).map(({ job }) => <JobCard key={job.id} job={job} />)
            ) : (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyTitle}>কোনো চাকরি পাওয়া যায়নি</Text>
                <Text style={styles.emptyText}>নতুন চাকরি প্রকাশ হলে এখানে দেখা যাবে।</Text>
              </View>
            )}
          </View>
        </ScrollView>

      </View>
      <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </SafeAreaView>
  );
}

function SectionTitle({ title, onPress }: { title: string; onPress: () => void }) {
  return (
    <View style={styles.sectionTitleRow}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Pressable hitSlop={8} style={styles.seeAll} onPress={onPress}>
        <Text style={styles.seeAllText}>সব দেখুন</Text>
        <ChevronRight size={13} color={COLORS.primary} strokeWidth={2.2} />
      </Pressable>
    </View>
  );
}

function QuickFilter({
  icon: Icon,
  label,
  active = false,
  onPress,
}: {
  icon: React.ComponentType<any>;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.quickButton,
        active && styles.quickButtonActive,
        pressed && { opacity: 0.86 },
      ]}
    >
      <Icon
        size={15}
        color={active ? '#FFFFFF' : '#3A4540'}
        strokeWidth={1.9}
      />
      <Text style={[styles.quickText, active && styles.quickTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

type SummaryTone = 'green' | 'teal' | 'orange' | 'blue';

const SUMMARY_TONES: Record<
  SummaryTone,
  { icon: string; bg: string; value: string }
> = {
  green: { icon: '#008A60', bg: '#E8F6EF', value: '#007D58' },
  teal: { icon: '#11A78B', bg: '#E3F7F3', value: '#06977E' },
  orange: { icon: '#FF922E', bg: '#FFF0DF', value: '#F48821' },
  blue: { icon: '#1597C8', bg: '#E7F5FB', value: '#1288B4' },
};

function SummaryItem({
  icon: Icon,
  value,
  label,
  tone,
  loading,
}: {
  icon: React.ComponentType<any>;
  value?: number;
  label: string;
  tone: SummaryTone;
  loading: boolean;
}) {
  const t = SUMMARY_TONES[tone];
  const displayed = value ?? 0;

  return (
    <View style={styles.summaryItem}>
      <View style={[styles.summaryIcon, { backgroundColor: t.bg }]}>
        <Icon size={20} color={t.icon} strokeWidth={1.8} />
      </View>
      <Text style={[styles.summaryValue, { color: t.value }]}>
        {loading ? '—' : toBanglaDigits(displayed)}
      </Text>
      <Text style={styles.summaryLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

function CategoryItem({
  icon: Icon,
  label,
  active = false,
  onPress,
}: {
  icon: React.ComponentType<any>;
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.categoryItem} onPress={onPress}>
      <View style={[styles.categoryIconBox, active && styles.categoryIconBoxActive]}>
        <Icon size={22} color={active ? '#fff' : COLORS.primaryDark} strokeWidth={1.7} />
      </View>
      <Text style={[styles.categoryText, active && styles.categoryTextActive]} numberOfLines={2}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 17,
    paddingTop: 9,
    paddingBottom: 92,
  },

  /* Header */
  header: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoWrap: {
    width: 47,
    height: 47,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  logo: {
    width: 47,
    height: 47,
  },
  brandTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  govText: {
    color: '#34684F',
    fontSize: 9.3,
    lineHeight: 13,
    fontWeight: '500',
  },
  brandTitle: {
    color: COLORS.primaryDark,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  brandSubtitle: {
    color: '#59655F',
    fontSize: 9.3,
    lineHeight: 12,
    fontWeight: '500',
  },
  bellButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  notificationDot: {
    position: 'absolute',
    top: 5,
    right: 4,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.red,
    borderWidth: 1.2,
    borderColor: '#FFFFFF',
  },

  /* Search */
  searchBox: {
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E8E6',
    shadowColor: '#1D3329',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 7,
    elevation: 2,
    marginBottom: 11,
  },
  searchInput: {
    flex: 1,
    height: 44,
    paddingHorizontal: 9,
    paddingVertical: 0,
    color: COLORS.text,
    fontSize: 12.5,
  },
  filterButton: {
    width: 27,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },

  /* Filters */
  quickRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 17,
  },
  presetScroller: { gap: 7, paddingBottom: 14 }, searchPreset: { minHeight: 34, justifyContent: 'center', paddingHorizontal: 11, borderRadius: 17, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface }, searchPresetText: { color: COLORS.text2, fontSize: 10.5, fontWeight: '700' },
  inlineResults: { gap: 9, marginTop: 16, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.softSurface },
  inlineResultHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  inlineResultTitle: { color: COLORS.text, fontSize: 13, fontWeight: '800' },
  inlineResultCount: { color: COLORS.primary, fontSize: 9.5, fontWeight: '700' },
  quickButton: {
    flex: 1,
    height: 34,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: '#FFFFFF',
  },
  quickButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  quickText: {
    color: '#38443E',
    fontSize: 10.5,
    lineHeight: 14,
    fontWeight: '600',
  },
  quickTextActive: {
    color: '#FFFFFF',
  },

  /* Section heading */
  sectionTitleRow: {
    height: 23,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#25302B',
    fontSize: 13.2,
    lineHeight: 18,
    fontWeight: '800',
  },
  seeAll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },
  seeAllText: {
    color: COLORS.primary,
    fontSize: 10.5,
    fontWeight: '700',
  },

  /* Summary */
  summaryCard: {
    height: 91,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#E6EBE8',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    shadowColor: '#173126',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.035,
    shadowRadius: 7,
    elevation: 1,
    marginBottom: 11,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryIcon: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 14.5,
    lineHeight: 18,
    fontWeight: '800',
  },
  summaryLabel: {
    color: '#66716C',
    fontSize: 8.1,
    lineHeight: 11,
    fontWeight: '500',
  },
  summaryDivider: {
    width: 1,
    height: 42,
    backgroundColor: '#EDF0EE',
  },

  /* Notice */
  noticeCard: {
    minHeight: 58,
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1ECE6',
    backgroundColor: '#F8FBF9',
    paddingHorizontal: 9,
    paddingVertical: 8,
    marginBottom: 15,
  },
  noticeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  noticeCopy: {
    flex: 1,
    paddingRight: 6,
  },
  noticeTitle: {
    color: '#29332F',
    fontSize: 10.4,
    lineHeight: 14,
    fontWeight: '800',
    marginBottom: 1,
  },
  noticeText: {
    color: '#69746F',
    fontSize: 8.2,
    lineHeight: 11.5,
    fontWeight: '500',
  },
  noticeAction: {
    height: 23,
    borderRadius: 7,
    paddingHorizontal: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
    backgroundColor: '#E8F5EF',
  },
  noticeActionText: {
    color: COLORS.primary,
    fontSize: 8.1,
    fontWeight: '700',
  },

  /* Categories */
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  categoryItem: {
    width: 49,
    alignItems: 'center',
  },
  categoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E9EEEB',
    backgroundColor: '#FFFFFF',
    shadowColor: '#173126',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.035,
    shadowRadius: 4,
    elevation: 1,
  },
  categoryIconBoxActive: { borderColor: COLORS.primary, backgroundColor: COLORS.primary }, categoryTextActive: { color: COLORS.primaryDark, fontWeight: '800' },
  categoryText: {
    marginTop: 4,
    color: '#59645F',
    fontSize: 7.6,
    lineHeight: 10,
    textAlign: 'center',
    fontWeight: '500',
  },

  /* Jobs */
  jobList: {
    gap: 7,
  },
  jobCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5EAE7',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 9,
    paddingTop: 8,
    paddingBottom: 7,
    shadowColor: '#173126',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.028,
    shadowRadius: 4,
    elevation: 1,
  },
  jobTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  jobLogoBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1,
    borderColor: '#E4EAE7',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    marginRight: 7,
  },
  jobLogo: {
    width: 34,
    height: 34,
  },
  jobMainCopy: {
    flex: 1,
    minWidth: 0,
  },
  orgRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 5,
    paddingRight: 4,
  },
  orgName: {
    maxWidth: '65%',
    color: COLORS.primary,
    fontSize: 9.1,
    lineHeight: 13,
    fontWeight: '800',
  },
  govBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#E8F5EF',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  govBadgeText: {
    color: '#368064',
    fontSize: 6.8,
    lineHeight: 9,
    fontWeight: '600',
  },
  govBadgeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#2A9E73',
  },
  jobTitle: {
    color: '#28322E',
    fontSize: 10.2,
    lineHeight: 14.5,
    fontWeight: '800',
    marginTop: 2,
    paddingRight: 3,
  },
  jobBookmark: {
    width: 23,
    height: 25,
    alignItems: 'flex-end',
    justifyContent: 'flex-start',
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 45,
    marginTop: 6,
    minHeight: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    color: '#89938F',
    fontSize: 7.2,
    lineHeight: 10,
    fontWeight: '500',
  },
  metaDot: {
    width: 2.5,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: '#B5BDB9',
    marginHorizontal: 7,
  },
  jobBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginLeft: 45,
    marginTop: 7,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  tag: {
    minHeight: 18,
    paddingHorizontal: 7,
    borderRadius: 5,
    backgroundColor: '#F0F5FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagText: {
    color: '#6280A0',
    fontSize: 7.2,
    fontWeight: '600',
  },
  detailsButton: {
    height: 24,
    borderRadius: 6,
    paddingHorizontal: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: COLORS.primary,
    marginLeft: 7,
  },
  detailsButtonText: {
    color: '#FFFFFF',
    fontSize: 7.7,
    fontWeight: '700',
  },

  /* Loading / empty */
  skeleton: {
    backgroundColor: '#EDF1EF',
    borderRadius: 5,
  },
  errorCard: {
    borderWidth: 1,
    borderColor: '#F0D7D7',
    backgroundColor: '#FFF9F9',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  errorTitle: {
    color: '#553737',
    fontSize: 12,
    fontWeight: '800',
  },
  errorText: {
    color: '#806969',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 7,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginTop: 9,
  },
  retryText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  emptyCard: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingVertical: 20,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  emptyTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
  },
  emptyText: {
    color: COLORS.text3,
    fontSize: 9.5,
    marginTop: 4,
  },

});
