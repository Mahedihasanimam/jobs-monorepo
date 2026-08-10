import { ShieldCheck } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';

export function SourceBadge({ source }: { source: string }) {
  return <View style={styles.wrap}><ShieldCheck size={13} color={colors.primary} /><Text numberOfLines={1} style={styles.text}>{source || 'অফিসিয়াল সোর্স'}</Text></View>;
}
const styles = StyleSheet.create({ wrap: { maxWidth: '72%', flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 5, backgroundColor: colors.primaryLight, borderRadius: 8 }, text: { flexShrink: 1, color: colors.primary, fontSize: 11, fontWeight: '700' } });
