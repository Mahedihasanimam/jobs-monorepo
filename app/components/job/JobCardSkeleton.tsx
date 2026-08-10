import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';

export function JobCardSkeleton() {
  return <View style={styles.card}><View style={[styles.line, styles.short]} /><View style={[styles.line, styles.title]} /><View style={[styles.line, styles.medium]} /><View style={styles.row}><View style={[styles.pill, styles.medium]} /><View style={styles.pill} /></View></View>;
}
const styles = StyleSheet.create({ card: { padding: 16, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: 11 }, line: { height: 12, borderRadius: 6, backgroundColor: '#E9EEEB' }, short: { width: '36%' }, title: { height: 18, width: '88%' }, medium: { width: '62%' }, row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }, pill: { height: 28, width: '30%', borderRadius: 8, backgroundColor: '#E9EEEB' } });
