import { Building2 } from 'lucide-react-native';
import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';
import { colors } from '@/constants/colors';

export function OrganizationLogo({ name, logoUrl, size = 52 }: { name: string; logoUrl?: string | null; size?: number }) {
  const source = logoUrl ? { uri: logoUrl } : null;
  return <View accessibilityLabel={`${name} লোগো`} style={[styles.logo, { width: size, height: size, borderRadius: size / 2 }]}>
    {source ? <Image source={source} contentFit="contain" transition={150} style={{ width: size - 8, height: size - 8, borderRadius: (size - 8) / 2 }} /> : <Building2 size={size * 0.45} color={colors.primary} />}
  </View>;
}

const styles = StyleSheet.create({ logo: { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.card, borderWidth: 1, borderColor: '#B9DDD1', overflow: 'hidden' } });
