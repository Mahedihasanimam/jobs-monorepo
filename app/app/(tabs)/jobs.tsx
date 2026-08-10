import { useEffect, useMemo, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowDownUp, SlidersHorizontal, X } from 'lucide-react-native';
import { FlatList, Modal, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { JobCard } from '@/components/job/JobCard';
import { JobCardSkeleton } from '@/components/job/JobCardSkeleton';
import { AppHeader } from '@/components/layout/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { SearchBar } from '@/components/ui/SearchBar';
import { colors } from '@/constants/colors';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useJobs } from '@/hooks/useJobs';
import { useJobFiltersStore } from '@/store/jobFilters.store';
import type { JobSort } from '@/types/job';
import { toBanglaDigits } from '@/utils/date';

const sortOptions: { value: JobSort; label: string }[] = [{ value: 'latest', label: 'সর্বশেষ' }, { value: 'deadline', label: 'আবেদনের শেষ তারিখ' }, { value: 'oldest', label: 'পুরনো' }];
const EMBLEM = require('@/assets/images/bd-government-emblem.jpg');

export default function JobsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ search?: string; deadline?: string; published?: string; category?: string; qualification?: 'diploma'; preset?: 'all' | 'latest' | 'closing' }>();
  const storedFilters = useJobFiltersStore((state) => state.filters);
  const setFilters = useJobFiltersStore((state) => state.setFilters);
  const [search, setSearch] = useState(params.search ?? '');
  const [sortOpen, setSortOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    const deadline = params.deadline ? Number(params.deadline) : undefined;
    const published = params.published ? Number(params.published) : undefined;
    if (deadline || published || params.category || params.qualification) setFilters({ sort: 'latest', category: params.category, qualification: params.qualification, deadlineRange: deadline === 7 ? 7 : 'all', publishedRange: published === 7 ? 7 : 'all' });
    // Route presets only need applying when incoming params change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.deadline, params.published, params.category, params.qualification]);

  const filters = useMemo(() => ({ ...storedFilters, search: debouncedSearch || undefined }), [storedFilters, debouncedSearch]);
  const query = useJobs(filters);
  const jobs = useMemo(() => query.data?.pages.flatMap((page) => page.jobs) ?? [], [query.data]);
  const count = query.data?.pages[0]?.count ?? 0;
  const activeFilterCount = [storedFilters.organization, storedFilters.category, storedFilters.location, storedFilters.employmentType, storedFilters.qualification, storedFilters.deadlineRange !== 'all' ? storedFilters.deadlineRange : null, storedFilters.publishedRange !== 'all' ? storedFilters.publishedRange : null].filter(Boolean).length;
  const activePreset = params.preset ?? (params.published === '7' ? 'latest' : params.deadline === '7' ? 'closing' : 'all');
  const applyPreset = (preset: 'all' | 'latest' | 'closing') => {
    setFilters({ sort: 'latest', deadlineRange: preset === 'closing' ? 7 : 'all', publishedRange: preset === 'latest' ? 7 : 'all' });
    router.setParams({ preset, deadline: preset === 'closing' ? '7' : '', published: preset === 'latest' ? '7' : '', category: '' });
  };

  return <ScreenContainer><OfflineBanner /><FlatList data={jobs} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <JobCard job={item} />} contentContainerStyle={styles.content} ItemSeparatorComponent={() => <View style={{ height: 12 }} />} keyboardShouldPersistTaps="handled"
    refreshControl={<RefreshControl refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => void query.refetch()} tintColor={colors.primary} />}
    onEndReached={() => { if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage(); }} onEndReachedThreshold={0.35}
    ListHeaderComponent={<View style={styles.header}><AppHeader logo={EMBLEM} topText="গণপ্রজাতন্ত্রী বাংলাদেশ সরকার" title="সরকারি চাকরি" subtitle="সরকারি চাকরির তথ্য ও আবেদন" /><SearchBar value={search} onChangeText={setSearch} /><View style={styles.presets}><Preset label="সব চাকরি" active={activePreset === 'all'} onPress={() => applyPreset('all')} /><Preset label="নতুন চাকরি" active={activePreset === 'latest'} onPress={() => applyPreset('latest')} /><Preset label="শেষ সময় নিকটে" active={activePreset === 'closing'} onPress={() => applyPreset('closing')} /></View><View style={styles.tools}><Pressable style={styles.tool} onPress={() => router.push('/filters')}><SlidersHorizontal size={18} color={colors.primary} /><Text style={styles.toolText}>ফিল্টার</Text>{activeFilterCount ? <View style={styles.countBadge}><Text style={styles.countBadgeText}>{toBanglaDigits(activeFilterCount)}</Text></View> : null}</Pressable><Pressable style={styles.tool} onPress={() => setSortOpen(true)}><ArrowDownUp size={18} color={colors.primary} /><Text style={styles.toolText}>সাজান</Text></Pressable><Text style={styles.result}>{toBanglaDigits(count)}টি চাকরি পাওয়া গেছে</Text></View></View>}
    ListEmptyComponent={query.isLoading ? <View style={styles.skeletons}><JobCardSkeleton /><JobCardSkeleton /><JobCardSkeleton /></View> : query.isError ? <EmptyState title="চাকরির তথ্য লোড করা যাচ্ছে না" message="আবার চেষ্টা করুন। পরিবেশ ভেরিয়েবলও যাচাই করতে পারেন।" actionLabel="আবার চেষ্টা করুন" onAction={() => void query.refetch()} /> : <EmptyState />}
    ListFooterComponent={query.isFetchingNextPage ? <View style={styles.footer}><JobCardSkeleton /></View> : <View style={{ height: 20 }} />}
  />
  <Modal visible={sortOpen} transparent animationType="fade" onRequestClose={() => setSortOpen(false)}><Pressable style={styles.overlay} onPress={() => setSortOpen(false)}><Pressable style={styles.sheet} onPress={(event) => event.stopPropagation()}><View style={styles.sheetHead}><Text style={styles.sheetTitle}>চাকরি সাজান</Text><Pressable hitSlop={10} onPress={() => setSortOpen(false)}><X size={22} color={colors.text} /></Pressable></View>{sortOptions.map((option) => <Pressable key={option.value} style={styles.option} onPress={() => { setFilters({ ...storedFilters, sort: option.value }); setSortOpen(false); }}><View style={[styles.radio, storedFilters.sort === option.value && styles.radioActive]}>{storedFilters.sort === option.value ? <View style={styles.radioDot} /> : null}</View><Text style={styles.optionText}>{option.label}</Text></Pressable>)}</Pressable></Pressable></Modal>
  </ScreenContainer>;
}
function Preset({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) { return <Pressable onPress={onPress} style={[styles.preset, active && styles.presetActive]}><Text style={[styles.presetText, active && styles.presetTextActive]}>{label}</Text></Pressable>; }
const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 24 }, header: { gap: 16, marginBottom: 14 }, presets: { flexDirection: 'row', gap: 7 }, preset: { flex: 1, minHeight: 39, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 5, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }, presetActive: { borderColor: colors.primary, backgroundColor: colors.primary }, presetText: { color: colors.textSecondary, fontSize: 10, fontWeight: '700', textAlign: 'center' }, presetTextActive: { color: '#fff' }, tools: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 8 }, tool: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }, toolText: { color: colors.text, fontSize: 13, fontWeight: '700' }, countBadge: { minWidth: 20, height: 20, paddingHorizontal: 4, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.primary }, countBadgeText: { color: '#fff', fontSize: 10, fontWeight: '800' }, result: { flex: 1, color: colors.textSecondary, textAlign: 'right', fontSize: 12 }, skeletons: { gap: 12 }, footer: { marginTop: 12 }, overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }, sheet: { backgroundColor: colors.card, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 34 }, sheetHead: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 }, sheetTitle: { color: colors.text, fontSize: 20, fontWeight: '800' }, option: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 12 }, optionText: { color: colors.text, fontSize: 15 }, radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, radioActive: { borderColor: colors.primary }, radioDot: { width: 11, height: 11, borderRadius: 6, backgroundColor: colors.primary },
});
