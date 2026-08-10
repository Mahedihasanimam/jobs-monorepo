import { BriefcaseBusiness, WifiOff } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';

export function EmptyState({ title = 'কোনো চাকরি পাওয়া যায়নি', message = 'অন্য কোনো শব্দ দিয়ে খুঁজে দেখুন।', offline = false, actionLabel, onAction }: { title?: string; message?: string; offline?: boolean; actionLabel?: string; onAction?: () => void }) {
  const Icon = offline ? WifiOff : BriefcaseBusiness;
  return <View style={styles.wrap}><View style={styles.icon}><Icon size={30} color={colors.primary} /></View><Text style={styles.title}>{title}</Text><Text style={styles.message}>{message}</Text>{actionLabel && onAction ? <Pressable style={styles.button} onPress={onAction}><Text style={styles.buttonText}>{actionLabel}</Text></Pressable> : null}</View>;
}
const styles = StyleSheet.create({ wrap: { alignItems: 'center', paddingHorizontal: 30, paddingVertical: 48 }, icon: { width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }, title: { color: colors.text, fontWeight: '700', fontSize: 18, textAlign: 'center' }, message: { color: colors.textSecondary, fontSize: 14, lineHeight: 21, textAlign: 'center', marginTop: 7 }, button: { marginTop: 18, minHeight: 44, backgroundColor: colors.primary, paddingHorizontal: 20, borderRadius: 12, justifyContent: 'center' }, buttonText: { color: '#fff', fontWeight: '700' } });
