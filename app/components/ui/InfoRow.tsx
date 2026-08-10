import type { LucideIcon } from 'lucide-react-native';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';

export function InfoRow({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <View style={styles.item}><View style={styles.icon}><Icon size={19} color={colors.primary} /></View><View style={styles.content}><Text style={styles.label}>{label}</Text><Text style={styles.value}>{value}</Text></View></View>;
}
const styles = StyleSheet.create({ item: { width: '48%', minHeight: 86, flexDirection: 'row', gap: 10, padding: 12, backgroundColor: colors.background, borderRadius: 14 }, icon: { width: 34, height: 34, borderRadius: 10, backgroundColor: colors.primaryLight, justifyContent: 'center', alignItems: 'center' }, content: { flex: 1 }, label: { color: colors.textSecondary, fontSize: 11, lineHeight: 16 }, value: { color: colors.text, fontSize: 13, lineHeight: 19, fontWeight: '700', marginTop: 3 } });
