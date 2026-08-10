import type { PropsWithChildren } from 'react';
import { StyleSheet, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';

export function ScreenContainer({ children, style }: PropsWithChildren<{ style?: ViewStyle }>) {
  return <SafeAreaView edges={['top']} style={[styles.safe, style]}>{children}</SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background } });
