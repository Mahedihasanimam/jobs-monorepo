import { useCallback, useEffect, useMemo, useState } from 'react';
import * as FileSystem from 'expo-file-system/legacy';
import { ExternalLink, FileWarning, RefreshCw } from 'lucide-react-native';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { colors } from '@/constants/colors';
import { getValidUrl, openExternalUrl } from '@/utils/url';

type ViewerState = { status: 'loading' } | { status: 'ready'; html: string } | { status: 'error'; message: string };

function fileKey(url: string) {
  let hash = 0;
  for (let index = 0; index < url.length; index += 1) hash = ((hash << 5) - hash + url.charCodeAt(index)) | 0;
  return `circular-${Math.abs(hash)}.pdf`;
}

function viewerHtml(base64: string) {
  return `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=3,user-scalable=yes"><style>html,body{margin:0;background:#eef2f0}#pages{padding:8px}canvas{display:block;width:100%;height:auto;margin:0 auto 10px;background:white;box-shadow:0 1px 5px rgba(0,0,0,.16)}#status{padding:30px 15px;text-align:center;color:#52635b;font:14px sans-serif}</style></head><body><div id="status">সার্কুলার প্রস্তুত হচ্ছে…</div><div id="pages"></div><script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script><script>(async()=>{try{pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';const binary=atob('${base64}'),bytes=new Uint8Array(binary.length);for(let i=0;i<binary.length;i++)bytes[i]=binary.charCodeAt(i);const pdf=await pdfjsLib.getDocument({data:bytes}).promise;document.getElementById('status').remove();const root=document.getElementById('pages');for(let n=1;n<=pdf.numPages;n++){const page=await pdf.getPage(n),viewport=page.getViewport({scale:1.45}),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');canvas.width=viewport.width;canvas.height=viewport.height;root.appendChild(canvas);await page.render({canvasContext:ctx,viewport}).promise}window.ReactNativeWebView.postMessage('ready')}catch(error){document.getElementById('status').textContent='সার্কুলার দেখানো যাচ্ছে না';window.ReactNativeWebView.postMessage('error:'+String(error))}})();</script></body></html>`;
}

export function CircularPdfViewer({ url }: { url: string }) {
  const valid = useMemo(() => getValidUrl(url), [url]);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<ViewerState>({ status: 'loading' });

  const load = useCallback(async () => {
    if (!valid) { setState({ status: 'error', message: 'সঠিক পিডিএফ লিংক পাওয়া যায়নি।' }); return; }
    setState({ status: 'loading' });
    try {
      const path = `${FileSystem.cacheDirectory}${fileKey(valid)}`;
      const info = await FileSystem.getInfoAsync(path);
      if (!info.exists) await FileSystem.downloadAsync(valid, path);
      const base64 = await FileSystem.readAsStringAsync(path, { encoding: FileSystem.EncodingType.Base64 });
      if (!base64) throw new Error('Empty PDF');
      setState({ status: 'ready', html: viewerHtml(base64) });
    } catch {
      setState({ status: 'error', message: 'পিডিএফটি ডাউনলোড বা প্রস্তুত করা যায়নি।' });
    }
  }, [valid]);

  useEffect(() => { void load(); }, [load, attempt]);

  if (state.status === 'loading') return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /><Text style={styles.message}>সার্কুলার ডাউনলোড হচ্ছে…</Text></View>;
  if (state.status === 'error') return <View style={styles.center}><FileWarning size={34} color={colors.textSecondary} /><Text style={styles.errorTitle}>প্রিভিউ দেখানো যাচ্ছে না</Text><Text style={styles.message}>{state.message}</Text><View style={styles.actions}><Pressable style={styles.retry} onPress={() => setAttempt((value) => value + 1)}><RefreshCw size={16} color={colors.primary} /><Text style={styles.retryText}>আবার চেষ্টা করুন</Text></Pressable>{valid ? <Pressable style={styles.open} onPress={() => void openExternalUrl(valid)}><ExternalLink size={16} color="#fff" /><Text style={styles.openText}>ব্রাউজারে খুলুন</Text></Pressable> : null}</View></View>;
  return <WebView source={{ html: state.html, baseUrl: 'https://cdnjs.cloudflare.com' }} originWhitelist={['*']} javaScriptEnabled domStorageEnabled mixedContentMode="never" setSupportMultipleWindows={false} style={styles.web} onMessage={(event) => { if (event.nativeEvent.data.startsWith('error:')) setState({ status: 'error', message: 'এই পিডিএফটি ডিভাইসে রেন্ডার করা যায়নি।' }); }} />;
}

const styles = StyleSheet.create({
  web: { flex: 1, backgroundColor: '#EEF2F0' },
  center: { flex: 1, minHeight: 240, alignItems: 'center', justifyContent: 'center', gap: 9, padding: 20, backgroundColor: colors.background },
  errorTitle: { color: colors.text, fontSize: 15, fontWeight: '800' },
  message: { color: colors.textSecondary, fontSize: 11, lineHeight: 17, textAlign: 'center' },
  actions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  retry: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.primary },
  retryText: { color: colors.primary, fontSize: 11, fontWeight: '800' },
  open: { minHeight: 42, flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, borderRadius: 10, backgroundColor: colors.primary },
  openText: { color: '#fff', fontSize: 11, fontWeight: '800' },
});
