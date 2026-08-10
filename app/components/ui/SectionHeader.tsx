import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export function SectionHeader({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return <View style={styles.row}><Text style={styles.title}>{title}</Text>{action && onPress ? <Pressable onPress={onPress} style={styles.action} hitSlop={8}><Text style={styles.actionText}>{action}</Text><ChevronRight size={16} color={colors.primary} /></Pressable> : null}</View>;
}
const styles = StyleSheet.create({ row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, title: { color: colors.text, fontSize: 20, lineHeight: 28, fontWeight: '700' }, action: { minHeight: 44, flexDirection: 'row', alignItems: 'center' }, actionText: { color: colors.primary, fontSize: 14, fontWeight: '700' } });
