import { useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { ChevronLeft, Download } from 'lucide-react-native';
import { ActivityIndicator, Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { CircularPdfViewer } from '@/components/pdf/CircularPdfViewer';
import { getValidUrl } from '@/utils/url';

export default function PdfScreen() {
  const router = useRouter(); const { url, title } = useLocalSearchParams<{ url: string; title?: string }>(); const [busy, setBusy] = useState(false);
  const valid = getValidUrl(url);
  const download = async () => { if (!valid || busy) return; setBusy(true); try { const safe = (title || 'job-বিজ্ঞপ্তি').replace(/[^a-zA-Z0-9\u0980-\u09FF_-]/g, '-').slice(0, 50); const result = await FileSystem.downloadAsync(valid, `${FileSystem.cacheDirectory}${safe}.pdf`); if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(result.uri, { mimeType: 'application/pdf', dialogTitle: 'চাকরির বিজ্ঞপ্তি সংরক্ষণ করুন' }); else Alert.alert('ডাউনলোড সম্পন্ন', result.uri); } catch { Alert.alert('ডাউনলোড হয়নি', 'পিডিএফ ফাইলটি ডাউনলোড করা যায়নি। আবার চেষ্টা করুন।'); } finally { setBusy(false); } };
  return <SafeAreaView style={styles.safe}><View style={styles.header}><Pressable style={styles.button} onPress={router.back}><ChevronLeft size={25} color={colors.text} /></Pressable><View style={styles.heading}><Text numberOfLines={1} style={styles.title}>{title || 'চাকরির বিজ্ঞপ্তি'}</Text><Text style={styles.subtitle}>পূর্ণ স্ক্রিন সার্কুলার প্রদর্শক</Text></View><Pressable disabled={busy} style={styles.download} onPress={() => void download()}>{busy ? <ActivityIndicator color="#fff" /> : <><Download size={18} color="#fff" /><Text style={styles.downloadText}>ডাউনলোড</Text></>}</Pressable></View>{valid ? <CircularPdfViewer url={valid} /> : <View style={styles.loading}><Text>সঠিক পিডিএফ লিংক পাওয়া যায়নি।</Text></View>}</SafeAreaView>;
}
const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background }, header: { minHeight: 66, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 8, backgroundColor: colors.card, borderBottomWidth: 1, borderBottomColor: colors.border }, button: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }, heading: { flex: 1 }, title: { color: colors.text, fontSize: 15, fontWeight: '800' }, subtitle: { color: colors.textSecondary, fontSize: 10, marginTop: 2 }, download: { minWidth: 92, height: 42, flexDirection: 'row', gap: 6, paddingHorizontal: 11, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary }, downloadText: { color: '#fff', fontSize: 11, fontWeight: '800' }, loading: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: colors.background } });
