import { Search, SlidersHorizontal, X } from 'lucide-react-native';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { colors } from '@/constants/colors';
import { shadow } from '@/constants/layout';

interface Props { value: string; onChangeText: (value: string) => void; placeholder?: string; onSubmit?: () => void }
export function SearchBar({ value, onChangeText, placeholder = 'পদ, বিভাগ বা প্রতিষ্ঠান খুঁজুন', onSubmit }: Props) {
  return (
    <View style={styles.container}>
      <Search size={20} color={colors.textSecondary} />
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.textSecondary}
        style={styles.input} returnKeyType="search" onSubmitEditing={onSubmit} accessibilityLabel={placeholder} />
      {value ? <Pressable accessibilityRole="button" accessibilityLabel="খোঁজা মুছুন" hitSlop={10} onPress={() => onChangeText('')} style={styles.clearIcon}><X size={19} color={colors.textSecondary} /></Pressable> : null}
      <Pressable accessibilityRole="button" accessibilityLabel="ফিল্টার" hitSlop={10} onPress={() => {}} style={styles.filterIcon}>
        <SlidersHorizontal size={20} color={colors.text} />
      </Pressable>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { minHeight: 54, flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 18, borderRadius: 100, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, ...shadow },
  input: { flex: 1, color: colors.text, fontSize: 15, paddingVertical: 12 },
  clearIcon: { marginRight: 4 },
  filterIcon: { paddingLeft: 8, borderLeftWidth: 1, borderLeftColor: colors.border },
});
