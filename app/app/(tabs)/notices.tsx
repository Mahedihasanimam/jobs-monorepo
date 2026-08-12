import { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppHeader } from '@/components/layout/AppHeader';
import { JobCard } from '@/components/job/JobCard';
import { JobCardSkeleton } from '@/components/job/JobCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { useJobs } from '@/hooks/useJobs';
import { toBanglaDigits } from '@/utils/date';

const EMBLEM = require('@/assets/images/custom_emblem.png');

export default function NoticesScreen() {
  const query = useJobs({ sort: 'latest' });
  const jobs = useMemo(() => query.data?.pages.flatMap((page) => page.jobs) ?? [], [query.data]);
  const count = query.data?.pages[0]?.count ?? 0;
  return <ScreenContainer><OfflineBanner /><FlatList data={jobs} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <JobCard job={item} />} ItemSeparatorComponent={() => <View style={styles.separator} />} contentContainerStyle={styles.content}
    refreshControl={<RefreshControl refreshing={query.isRefetching && !query.isFetchingNextPage} onRefresh={() => void query.refetch()} tintColor={colors.primary} />}
    onEndReached={() => { if (query.hasNextPage && !query.isFetchingNextPage) void query.fetchNextPage(); }} onEndReachedThreshold={0.35}
    ListHeaderComponent={<View style={styles.header}><AppHeader logo={EMBLEM} topText="গণপ্রজাতন্ত্রী বাংলাদেশ সরকার" title="চাকরির বিজ্ঞপ্তি" subtitle="সরকারি চাকরির তথ্য ও আবেদন" /><View style={styles.summary}><Text style={styles.summaryValue}>{toBanglaDigits(count)}</Text><Text style={styles.summaryText}>টি চলমান বিজ্ঞপ্তি</Text></View></View>}
    ListEmptyComponent={query.isLoading ? <View style={styles.loading}><JobCardSkeleton /><JobCardSkeleton /></View> : query.isError ? <EmptyState title="বিজ্ঞপ্তি লোড করা যাচ্ছে না" message="ইন্টারনেট সংযোগ যাচাই করে আবার চেষ্টা করুন।" actionLabel="আবার চেষ্টা করুন" onAction={() => void query.refetch()} /> : <EmptyState title="কোনো চলমান বিজ্ঞপ্তি নেই" />}
    ListFooterComponent={query.isFetchingNextPage ? <View style={styles.footer}><JobCardSkeleton /></View> : <View style={styles.footerSpace} />}
  /></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { flexGrow: 1, padding: 16, paddingBottom: 42 }, header: { gap: 14, marginBottom: 16 }, summary: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'baseline', gap: 4, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12, backgroundColor: colors.primaryLight }, summaryValue: { color: colors.primary, fontSize: 17, fontWeight: '900' }, summaryText: { color: colors.primaryDeep, fontSize: 12, fontWeight: '700' }, separator: { height: 12 }, loading: { gap: 12 }, footer: { marginTop: 12 }, footerSpace: { height: 20 } });
