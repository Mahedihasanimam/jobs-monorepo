import type { LucideIcon } from 'lucide-react-native';
import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '@/constants/colors';

export function CategoryChip({ label, active = false, icon: Icon, onPress }: { label: string; active?: boolean; icon?: LucideIcon; onPress: () => void }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.chip, active && styles.active, pressed && { opacity: 0.75 }]}>{Icon ? <Icon size={16} color={active ? '#fff' : colors.primary} /> : null}<Text style={[styles.text, active && styles.activeText]}>{label}</Text></Pressable>;
}
const styles = StyleSheet.create({ chip: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 15, borderRadius: 21, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }, active: { backgroundColor: colors.primary, borderColor: colors.primary }, text: { color: colors.text, fontSize: 13, fontWeight: '600' }, activeText: { color: '#fff' } });
