import { useRouter } from 'expo-router';
import { FlatList, RefreshControl, StyleSheet, View, Pressable, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft } from 'lucide-react-native';
import { JobCard } from '@/components/job/JobCard';
import { JobCardSkeleton } from '@/components/job/JobCardSkeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { OfflineBanner } from '@/components/ui/OfflineBanner';
import { colors } from '@/constants/colors';
import { useSavedJobs } from '@/hooks/useJob';
import { useAppliedJobsStore } from '@/store/appliedJobs.store';

export default function AppliedScreen() {
  const router = useRouter();
  const ids = useAppliedJobsStore((state) => state.appliedJobIds);
  // Reusing useSavedJobs since it just fetches a list of jobs by IDs
  const query = useSavedJobs(ids);

  return (
    <SafeAreaView style={styles.safe}>
      <OfflineBanner />
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Pressable accessibilityLabel="পেছনে যান" style={styles.back} onPress={router.back}>
            <ChevronLeft size={28} color="#0B1A14" />
          </Pressable>
          <View>
            <Text style={styles.title}>আমার আবেদনকৃত চাকরি</Text>
            <Text style={styles.subtitle}>যেসব চাকরিতে আপনি আবেদন করেছেন</Text>
          </View>
        </View>
      </View>

      <FlatList
        data={query.data ?? []}
        keyExtractor={(item) => String(item.id)}
        renderItem={({ item }) => <JobCard job={item} />}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        contentContainerStyle={styles.content}
        refreshControl={
          ids.length ? (
            <RefreshControl
              refreshing={query.isRefetching}
              onRefresh={() => void query.refetch()}
              tintColor={colors.primary}
            />
          ) : undefined
        }
        ListEmptyComponent={
          query.isLoading ? (
            <View style={styles.list}>
              <JobCardSkeleton />
              <JobCardSkeleton />
            </View>
          ) : query.isError ? (
            <EmptyState
              title="আবেদনকৃত চাকরি লোড হচ্ছে না"
              message="ক্যাশ বা ইন্টারনেট সংযোগ যাচাই করে আবার চেষ্টা করুন।"
              actionLabel="আবার চেষ্টা করুন"
              onAction={() => void query.refetch()}
            />
          ) : (
            <EmptyState
              title="আপনি এখনো কোনো চাকরিতে আবেদন করেননি"
              message="আবেদন করার পর সেগুলো এখানে সংরক্ষিত হবে।"
            />
          )
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    minHeight: 80,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: colors.background,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  back: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -8,
  },
  title: { color: '#0B1A14', fontSize: 22, fontWeight: '800' },
  subtitle: { color: '#6B7280', fontSize: 13, marginTop: 2, fontWeight: '500' },
  content: { flexGrow: 1, padding: 16, paddingBottom: 26 },
  list: { gap: 12 },
});
