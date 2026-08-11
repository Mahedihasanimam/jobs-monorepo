import { useState, type ReactNode } from 'react';
import { Menu } from 'lucide-react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { AppDrawer } from './AppDrawer';

export function AppHeader({ title, subtitle, topText, logo, action }: { title: string; subtitle?: string; topText?: string; logo?: any; action?: ReactNode }) {
  const [open, setOpen] = useState(false);
  return <><View style={styles.row}>
    {logo ? (
      <Image source={logo} style={styles.logo} resizeMode="contain" />
    ) : (
      <Pressable accessibilityLabel="মেনু খুলুন" style={styles.menu} onPress={() => setOpen(true)}><Menu size={25} color={colors.primaryDeep} /></Pressable>
    )}
    <View style={styles.text}>
      {topText ? <Text style={styles.topText}>{topText}</Text> : null}
      <Text style={[styles.title, logo && styles.titleLarge]}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
    {action ?? (logo ? <Pressable accessibilityLabel="মেনু খুলুন" style={styles.headerMenu} onPress={() => setOpen(true)}><Menu size={23} color={colors.text} /></Pressable> : null)}
  </View><AppDrawer visible={open} onClose={() => setOpen(false)} /></>;
}
const styles = StyleSheet.create({
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  menu: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primaryLight },
  headerMenu: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  logo: { width: 47, height: 47, borderRadius: 24 },
  text: { flex: 1, justifyContent: 'center' },
  topText: { color: '#34684F', fontSize: 9.3, lineHeight: 13, fontWeight: '500' },
  title: { color: colors.text, fontSize: 23, lineHeight: 31, fontWeight: '900' },
  titleLarge: { color: colors.primaryDeep, fontSize: 21, lineHeight: 26, fontWeight: '800' },
  subtitle: { color: '#59655F', fontSize: 9.3, lineHeight: 12, fontWeight: '500' }
});
