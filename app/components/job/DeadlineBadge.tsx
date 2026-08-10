import { Clock3 } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { formatJobDate, getDaysRemaining, isExpired, toBanglaDigits } from '@/utils/date';

export function DeadlineBadge({ deadline, active = true }: { deadline: string | null; active?: boolean }) {
  if (!deadline) return null;
  const days = getDaysRemaining(deadline);
  const expired = !active || isExpired(deadline);
  const urgent = days !== null && days >= 0 && days <= 7;
  const text = expired ? 'আবেদনের সময় শেষ' : days === 0 ? 'আজই শেষ' : urgent ? `আর ${toBanglaDigits(days)} দিন` : `শেষ: ${formatJobDate(deadline)}`;
  return <View style={[styles.badge, expired && styles.expired, urgent && !expired && styles.urgent]}><Clock3 size={14} color={expired ? colors.textSecondary : urgent ? colors.warning : colors.primary} /><Text style={[styles.text, expired && styles.expiredText, urgent && !expired && styles.urgentText]}>{text}</Text></View>;
}
const styles = StyleSheet.create({ badge: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 9, backgroundColor: colors.primaryLight }, text: { color: colors.primary, fontSize: 12, fontWeight: '700' }, urgent: { backgroundColor: colors.warningLight }, urgentText: { color: '#9A5B00' }, expired: { backgroundColor: '#EEF1EF' }, expiredText: { color: colors.textSecondary } });
