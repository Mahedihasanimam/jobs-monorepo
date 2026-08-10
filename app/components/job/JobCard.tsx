import { memo, useCallback } from 'react';
import { Bookmark, CalendarDays, CheckCircle2, Clock, ArrowRight } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '@/constants/colors';
import { radius, shadow } from '@/constants/layout';
import { useSavedJobsStore } from '@/store/savedJobs.store';
import type { Job } from '@/types/job';
import { formatJobDate } from '@/utils/date';
import { OrganizationLogo } from './OrganizationLogo';

export type JobCardVariant = 'default' | 'compact' | 'featured' | 'closingSoon';

function JobCardComponent({ job, variant = 'default' }: { job: Job; variant?: JobCardVariant }) {
  const router = useRouter();
  const saved = useSavedJobsStore((state) => state.savedJobIds.includes(job.id));
  const toggle = useSavedJobsStore((state) => state.toggleSaved);
  const open = useCallback(() => router.push({ pathname: '/job/[id]', params: { id: String(job.id) } }), [job.id, router]);
  const published = formatJobDate(job.published_date);
  const deadline = formatJobDate(job.deadline);

  return (
    <Pressable onPress={open} accessibilityRole="button" accessibilityLabel={`${job.title}, ${job.organization}`} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      {/* Top Row: Logo, Org, Verified Badge, Bookmark */}
      <View style={styles.topRow}>
        <OrganizationLogo name={job.organization} logoUrl={job.organization_logo_url} size={44} />
        <View style={styles.orgWrap}>
          <View style={styles.verified}>
            <Text numberOfLines={1} style={styles.org}>{job.organization}</Text>
            {job.is_government_source ? (
              <View style={styles.verifiedBadge}>
                <Text style={styles.verifiedText}>সরকারি যাচাইকৃত</Text>
                <CheckCircle2 size={12} color={colors.success} />
              </View>
            ) : null}
          </View>
        </View>
        <Pressable hitSlop={12} accessibilityRole="button" accessibilityLabel={saved ? 'সংরক্ষণ থেকে সরান' : 'সংরক্ষণ করুন'} onPress={(event) => { event.stopPropagation(); toggle(job.id); }} style={styles.bookmark}>
          <Bookmark size={22} color={colors.textSecondary} fill={saved ? colors.textSecondary : 'transparent'} />
        </Pressable>
      </View>

      {/* Middle Row: Title */}
      <Text numberOfLines={variant === 'compact' ? 2 : 3} style={styles.title}>{job.title}</Text>

      {/* Timeline Row */}
      {variant !== 'compact' ? (
        <View style={styles.timeline}>
          <View style={styles.dateItem}>
            <CalendarDays size={14} color={colors.textSecondary} />
            <Text style={styles.dateText}>প্রকাশ: {published || 'উল্লেখ নেই'}</Text>
          </View>
          <View style={styles.dateItem}>
            <Clock size={14} color={colors.textSecondary} />
            <Text style={styles.dateText}>শেষ সময়: {deadline || 'উল্লেখ নেই'}</Text>
          </View>
        </View>
      ) : null}

      {/* Bottom Row: Tags and Button */}
      <View style={styles.footer}>
        <View style={styles.tagsContainer}>
          {job.category ? <View style={styles.tag}><Text style={styles.tagText}>{job.category}</Text></View> : null}
          {job.employment_type ? <View style={styles.tag}><Text style={styles.tagText}>{job.employment_type}</Text></View> : null}
          {job.location ? <View style={styles.tag}><Text numberOfLines={1} style={styles.tagText}>{job.location}</Text></View> : null}
        </View>
        
        <View style={styles.detailsBtn}>
          <Text style={styles.detailsBtnText}>বিস্তারিত দেখুন</Text>
          <ArrowRight size={12} color="#FFF" />
        </View>
      </View>
    </Pressable>
  );
}

export const JobCard = memo(JobCardComponent);
const styles = StyleSheet.create({
  card: { backgroundColor: colors.card, padding: 14, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, ...shadow },
  pressed: { opacity: 0.84, transform: [{ scale: 0.995 }] },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 9 }, 
  orgWrap: { flex: 1, justifyContent: 'center' }, 
  verified: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }, 
  org: { flexShrink: 1, color: colors.primaryDeep, fontWeight: '800', fontSize: 13, lineHeight: 18 }, 
  verifiedBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primaryLight, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 100 },
  verifiedText: { color: colors.primary, fontSize: 10.5, fontWeight: '700' },
  bookmark: { width: 34, height: 34, marginRight: -6, alignItems: 'center', justifyContent: 'center' },
  title: { color: colors.text, fontSize: 16, lineHeight: 23, fontWeight: '800', marginTop: 9 }, 
  timeline: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginTop: 10, paddingVertical: 7, borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.border }, 
  dateItem: { flexGrow: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }, 
  dateText: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 }, 
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 7, marginTop: 10 },
  tagsContainer: { flexDirection: 'row', alignItems: 'center', gap: 5, flex: 1, flexWrap: 'wrap' },
  tag: { backgroundColor: colors.blueTagBg, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
  tagText: { color: colors.blueTagText, fontSize: 9.5, fontWeight: '600' },
  detailsBtn: { height: 28, flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.primary, paddingHorizontal: 9, borderRadius: 6 },
  detailsBtnText: { color: '#FFF', fontSize: 9.5, fontWeight: '700' }
});
