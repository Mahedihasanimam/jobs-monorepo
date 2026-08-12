import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { JobCard } from '@/components/job/JobCard';
import { JobCardSkeleton } from '@/components/job/JobCardSkeleton';
import { AppHeader } from '@/components/layout/AppHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { ScreenContainer } from '@/components/ui/ScreenContainer';
import { colors } from '@/constants/colors';
import { useSavedJobs } from '@/hooks/useJob';
import { useSavedJobsStore } from '@/store/savedJobs.store';

const EMBLEM = require('@/assets/images/custom_emblem.png');

export default function SavedScreen() {
  const ids = useSavedJobsStore((state) => state.savedJobIds);
  const query = useSavedJobs(ids);
  return <ScreenContainer><OfflineBanner /><FlatList data={query.data ?? []} keyExtractor={(item) => String(item.id)} renderItem={({ item }) => <JobCard job={item} />} ItemSeparatorComponent={() => <View style={{ height: 12 }} />} contentContainerStyle={styles.content}
    refreshControl={ids.length ? <RefreshControl refreshing={query.isRefetching} onRefresh={() => void query.refetch()} tintColor={colors.primary} /> : undefined}
    ListHeaderComponent={<View style={styles.header}><AppHeader logo={EMBLEM} topText="গণপ্রজাতন্ত্রী বাংলাদেশ সরকার" title="সংরক্ষিত চাকরি" subtitle="সরকারি চাকরির তথ্য ও আবেদন" /></View>}
    ListEmptyComponent={query.isLoading ? <View style={styles.list}><JobCardSkeleton /><JobCardSkeleton /></View> : query.isError ? <EmptyState title="সংরক্ষিত চাকরি লোড হচ্ছে না" message="ক্যাশ বা ইন্টারনেট সংযোগ যাচাই করে আবার চেষ্টা করুন।" actionLabel="আবার চেষ্টা করুন" onAction={() => void query.refetch()} /> : <EmptyState title="এখনও কোনো চাকরি সংরক্ষণ করেননি" message="পছন্দের চাকরিতে বুকমার্ক আইকনে চাপ দিয়ে এখানে সংরক্ষণ করুন।" />}
  /></ScreenContainer>;
}
const styles = StyleSheet.create({ content: { flexGrow: 1, padding: 16, paddingBottom: 26 }, header: { marginBottom: 18 }, list: { gap: 12 } });
