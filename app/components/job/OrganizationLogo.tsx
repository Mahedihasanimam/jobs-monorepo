import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { GOVT_BD_EMBLEM } from '@/constants/brand';
import { colors } from '@/constants/colors';

export function OrganizationLogo({ name, logoUrl, size = 52 }: { name: string; logoUrl?: string | null; size?: number }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [logoUrl]);
  const source = logoUrl && !failed ? { uri: logoUrl } : GOVT_BD_EMBLEM;
  return <View accessibilityLabel={`${name} লোগো`} style={[styles.logo, { width: size, height: size, borderRadius: size / 2 }]}>
    <Image source={source} contentFit="contain" transition={150} onError={() => { if (logoUrl && !failed) setFailed(true); }} style={{ width: size - 8, height: size - 8, borderRadius: (size - 8) / 2 }} />
  </View>;
}

const styles = StyleSheet.create({ logo: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: '#B9DDD1', overflow: 'hidden' } });
