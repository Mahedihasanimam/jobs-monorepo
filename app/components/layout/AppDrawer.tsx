import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Bookmark, BriefcaseBusiness, CalendarClock, ChevronRight, Home, Info, X } from 'lucide-react-native';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

export function AppDrawer({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const router = useRouter();
  const go = (path: '/(tabs)' | '/jobs' | '/saved' | '/exams', params?: Record<string, string>) => { onClose(); router.push({ pathname: path, params }); };
  return <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <View style={styles.frame}><Pressable accessibilityLabel="মেনু বন্ধ করুন" style={styles.backdrop} onPress={onClose} />
      <SafeAreaView style={styles.drawer}><View style={styles.brand}><Image source={require('@/assets/images/bd-government-emblem.jpg')} contentFit="contain" style={styles.emblem} /><View style={styles.brandText}><Text style={styles.brandTitle}>সরকারি চাকরি</Text><Text style={styles.brandSub}>বাংলাদেশের সরকারি চাকরির তথ্য</Text></View><Pressable style={styles.close} onPress={onClose}><X size={23} color={colors.text} /></Pressable></View>
        <Text style={styles.label}>প্রধান মেনু</Text>
        <Item icon={Home} label="হোম" onPress={() => go('/(tabs)')} />
        <Item icon={BriefcaseBusiness} label="সকল চাকরি" onPress={() => go('/jobs')} />
        <Item icon={CalendarClock} label="পরীক্ষা ও প্রবেশপত্রের হালনাগাদ" onPress={() => go('/exams')} />
        <Item icon={Bookmark} label="সংরক্ষিত চাকরি" onPress={() => go('/saved')} />
        <View style={styles.divider} /><Item icon={Info} label="অ্যাপ সম্পর্কে" onPress={onClose} />
        <Text style={styles.note}>তথ্য সংশ্লিষ্ট সরকারি প্রতিষ্ঠানের প্রকাশিত বিজ্ঞপ্তি থেকে সংগ্রহ করা হয়।</Text>
      </SafeAreaView>
    </View>
  </Modal>;
}
function Item({ icon: Icon, label, onPress }: { icon: typeof Home; label: string; onPress: () => void }) { return <Pressable style={styles.item} onPress={onPress}><Icon size={21} color={colors.primary} /><Text style={styles.itemText}>{label}</Text><ChevronRight size={19} color={colors.textSecondary} /></Pressable>; }
const styles = StyleSheet.create({ frame: { flex: 1, flexDirection: 'row' }, backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay }, drawer: { width: '84%', maxWidth: 360, height: '100%', backgroundColor: colors.card, paddingHorizontal: 18 }, brand: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 20 }, emblem: { width: 52, height: 52, borderRadius: 26 }, brandText: { flex: 1 }, brandTitle: { color: colors.primaryDeep, fontSize: 21, fontWeight: '900' }, brandSub: { color: colors.textSecondary, fontSize: 10, marginTop: 2 }, close: { width: 40, height: 44, alignItems: 'center', justifyContent: 'center' }, label: { color: colors.textSecondary, fontSize: 12, fontWeight: '700', marginVertical: 12 }, item: { minHeight: 56, flexDirection: 'row', alignItems: 'center', gap: 14, borderRadius: 12, paddingHorizontal: 10 }, itemText: { flex: 1, color: colors.text, fontSize: 15, fontWeight: '700' }, divider: { height: 1, backgroundColor: colors.border, marginVertical: 12 }, note: { color: colors.textSecondary, fontSize: 11, lineHeight: 18, marginTop: 'auto', marginBottom: 22 } });
