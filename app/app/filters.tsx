import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, ChevronDown, RotateCcw, Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { FlatList, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';
import { colors } from '@/constants/colors';
import { radius } from '@/constants/layout';
import { useJobFacets } from '@/hooks/useJobs';
import { useJobFiltersStore } from '@/store/jobFilters.store';

const schema = z.object({
  organization: z.string().optional(), category: z.string().optional(), location: z.string().optional(), employmentType: z.string().optional(),
  qualification: z.literal('diploma').optional(),
  deadlineRange: z.union([z.literal('all'), z.literal(0), z.literal(3), z.literal(7), z.literal(30)]),
  publishedRange: z.union([z.literal('all'), z.literal(0), z.literal(3), z.literal(7), z.literal(30)]),
});
type FilterForm = z.infer<typeof schema>;
const rangeOptions = [{ value: 'all' as const, label: 'সব' }, { value: 0 as const, label: 'আজ' }, { value: 3 as const, label: '৩ দিন' }, { value: 7 as const, label: '৭ দিন' }, { value: 30 as const, label: '৩০ দিন' }];

export default function FiltersScreen() {
  const router = useRouter();
  const { from } = useLocalSearchParams<{ from?: string }>();
  const filters = useJobFiltersStore((state) => state.filters);
  const setFilters = useJobFiltersStore((state) => state.setFilters);
  const resetStore = useJobFiltersStore((state) => state.resetFilters);
  const facets = useJobFacets();
  const { control, handleSubmit, reset, watch } = useForm<FilterForm>({ resolver: zodResolver(schema), defaultValues: { organization: filters.organization, category: filters.category, location: filters.location, employmentType: filters.employmentType, qualification: filters.qualification, deadlineRange: filters.deadlineRange ?? 'all', publishedRange: filters.publishedRange ?? 'all' } });
  const values = watch();
  const activeCount = [values.organization, values.category, values.location, values.employmentType, values.qualification, values.deadlineRange !== 'all' ? values.deadlineRange : null, values.publishedRange !== 'all' ? values.publishedRange : null].filter((value) => value !== undefined && value !== null && value !== '').length;

  const apply = (values: FilterForm) => { setFilters({ ...filters, ...values, sort: filters.sort ?? 'latest' }); if (from === 'home') router.replace('/jobs'); else router.back(); };
  const clear = () => { resetStore(); reset({ organization: undefined, category: undefined, location: undefined, employmentType: undefined, qualification: undefined, deadlineRange: 'all', publishedRange: 'all' }); };

  return <SafeAreaView style={styles.screen} edges={['top']}><View style={styles.compactTop}><Text style={styles.compactTitle}>ফিল্টার</Text>{activeCount ? <View style={styles.activeBadge}><Text style={styles.activeBadgeText}>{activeCount} সক্রিয়</Text></View> : <Text style={styles.compactHint}>প্রয়োজনীয় অপশন বেছে নিন</Text>}<Pressable accessibilityLabel="ফিল্টার বন্ধ করুন" style={styles.close} onPress={() => router.back()}><X size={21} color={colors.text} /></Pressable></View>
    <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <FilterSection title="চাকরির পরিচিতি"><Controller control={control} name="organization" render={({ field }) => <SelectField label="প্রতিষ্ঠান" placeholder="সব প্রতিষ্ঠান" value={field.value} options={facets.data?.organizations ?? []} onChange={field.onChange} loading={facets.isLoading} />} /><Controller control={control} name="category" render={({ field }) => <SelectField label="ক্যাটাগরি" placeholder="সব ক্যাটাগরি" value={field.value} options={facets.data?.categories ?? []} onChange={field.onChange} loading={facets.isLoading} />} /><Controller control={control} name="employmentType" render={({ field }) => <SelectField label="চাকরির ধরন" placeholder="সব ধরন" value={field.value} options={facets.data?.employmentTypes ?? []} onChange={field.onChange} loading={facets.isLoading} />} /></FilterSection>
      <FilterSection title="বিশেষ যোগ্যতা">
        <Controller control={control} name="qualification" render={({ field }) => <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: field.value === 'diploma' }} onPress={() => field.onChange(field.value === 'diploma' ? undefined : 'diploma')} style={[styles.qualificationOption, field.value === 'diploma' && styles.qualificationOptionActive]}><View style={[styles.qualificationCheck, field.value === 'diploma' && styles.qualificationCheckActive]}>{field.value === 'diploma' ? <Check size={15} color="#fff" /> : null}</View><View style={styles.qualificationCopy}><Text style={styles.qualificationTitle}>ডিপ্লোমা হোল্ডারদের চাকরি</Text><Text style={styles.qualificationHint}>যেসব পদে ডিপ্লোমা যোগ্যতা গ্রহণযোগ্য</Text></View></Pressable>} />
      </FilterSection>
      <FilterSection title="তারিখ ও সময়"><Controller control={control} name="publishedRange" render={({ field }) => <RangeField label="কত দিনের মধ্যে প্রকাশিত" value={field.value} onChange={field.onChange} />} /><View style={styles.sectionDivider} /><Controller control={control} name="deadlineRange" render={({ field }) => <RangeField label="আবেদনের শেষ সময়" value={field.value} onChange={field.onChange} />} /></FilterSection>
      <FilterSection title="কর্মস্থল">
        <Controller
          control={control}
          name="location"
          render={({ field }) => (
            <SelectField
              label="এলাকা নির্বাচন করুন"
              placeholder="সব কর্মস্থল"
              value={field.value}
              options={facets.data?.locations ?? []}
              onChange={field.onChange}
              loading={facets.isLoading}
            />
          )}
        />
      </FilterSection>
      {facets.isError ? <Text style={styles.hint}>ফিল্টার অপশন লোড হয়নি। আবার খুলে চেষ্টা করুন।</Text> : null}
    </ScrollView>
    <View style={styles.actions}><Pressable disabled={!activeCount} style={[styles.reset, !activeCount && styles.resetDisabled]} onPress={clear}><RotateCcw size={17} color={activeCount ? colors.primary : colors.textSecondary} /><Text style={[styles.resetText, !activeCount && styles.resetTextDisabled]}>রিসেট</Text></Pressable><Pressable style={styles.apply} onPress={handleSubmit(apply)}><Search size={18} color="#fff" /><Text style={styles.applyText}>চাকরি দেখুন{activeCount ? ` (${activeCount})` : ''}</Text></Pressable></View>
  </SafeAreaView>;
}

function FilterSection({ title, children }: React.PropsWithChildren<{ title: string }>) { return <View><Text style={styles.sectionTitle}>{title}</Text><View style={styles.sectionCard}>{children}</View></View>; }

function RangeField({ label, value, onChange }: { label: string; value: FilterForm['deadlineRange']; onChange: (value: FilterForm['deadlineRange']) => void }) {
  return <View style={styles.group}><Text style={styles.label}>{label}</Text><View style={styles.rangeRow}>{rangeOptions.map((option) => <Pressable key={String(option.value)} onPress={() => onChange(option.value)} style={[styles.chip, value === option.value && styles.chipActive]}><Text style={[styles.chipText, value === option.value && styles.chipTextActive]}>{option.label}</Text></Pressable>)}</View></View>;
}

function SelectField({ label, placeholder, value, options, onChange, loading }: { label: string; placeholder: string; value?: string; options: string[]; onChange: (value?: string) => void; loading?: boolean }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => options.filter((item) => item.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())), [options, query]);
  const close = () => { setOpen(false); setQuery(''); };
  return <View style={styles.group}><Text style={styles.label}>{label}</Text><Pressable disabled={loading} style={[styles.select, value && styles.selectActive]} onPress={() => setOpen(true)}><Text numberOfLines={1} style={[styles.selectText, !value && styles.placeholder]}>{loading ? 'লোড হচ্ছে…' : value ?? placeholder}</Text><ChevronDown size={19} color={value ? colors.primary : colors.textSecondary} /></Pressable>
    <Modal visible={open} transparent animationType="slide" onRequestClose={close}><Pressable style={styles.modalOverlay} onPress={close}><Pressable style={styles.modalCard} onPress={(event) => event.stopPropagation()}><View style={styles.modalHandle} /><View style={styles.modalHead}><View><Text style={styles.modalTitle}>{label}</Text><Text style={styles.modalSubtitle}>{options.length}টি অপশন</Text></View><Pressable style={styles.modalClose} onPress={close}><X size={22} color={colors.text} /></Pressable></View>{options.length > 8 ? <View style={styles.modalSearch}><Search size={18} color={colors.textSecondary} /><TextInput value={query} onChangeText={setQuery} placeholder="খুঁজুন…" placeholderTextColor={colors.textSecondary} style={styles.modalSearchInput} autoFocus /></View> : null}<FlatList keyboardShouldPersistTaps="handled" data={['', ...filtered]} keyExtractor={(item, index) => `${item}-${index}`} ListEmptyComponent={<Text style={styles.noOption}>কোনো অপশন পাওয়া যায়নি</Text>} renderItem={({ item }) => <Pressable style={[styles.selectOption, (value === item || (!value && !item)) && styles.selectOptionActive]} onPress={() => { onChange(item || undefined); close(); }}><Text style={styles.selectOptionText}>{item || placeholder}</Text>{value === item || (!value && !item) ? <Check size={19} color={colors.primary} /> : null}</Pressable>} /></Pressable></Pressable></Modal>
  </View>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  compactTop: { minHeight: 46, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.card }, compactTitle: { color: colors.primaryDeep, fontSize: 16, fontWeight: '900' }, compactHint: { flex: 1, color: colors.textSecondary, fontSize: 9.5 },
  activeBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, backgroundColor: colors.primaryLight }, activeBadgeText: { color: colors.primary, fontSize: 9, fontWeight: '800' }, close: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', marginLeft: 'auto' },
  content: { padding: 12, gap: 10, paddingBottom: 86 },
  sectionTitle: { color: colors.textSecondary, fontSize: 9.5, fontWeight: '800', marginLeft: 3, marginBottom: 5 }, sectionCard: { gap: 9, padding: 11, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }, sectionDivider: { height: 1, backgroundColor: colors.border },
  group: { gap: 5 }, label: { color: colors.text, fontSize: 11, fontWeight: '800' }, select: { minHeight: 42, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: colors.border, borderRadius: 10, backgroundColor: colors.background }, selectActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight }, selectText: { flex: 1, color: colors.text, fontSize: 12 }, placeholder: { color: colors.textSecondary },
  rangeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 }, chip: { minHeight: 33, justifyContent: 'center', paddingHorizontal: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 17, backgroundColor: colors.background }, chipActive: { backgroundColor: colors.primary, borderColor: colors.primary }, chipText: { color: colors.textSecondary, fontSize: 10.5, fontWeight: '600' }, chipTextActive: { color: '#fff', fontWeight: '800' }, hint: { color: colors.error, fontSize: 10, textAlign: 'center' },
  qualificationOption: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 10, borderWidth: 1, borderColor: colors.border, borderRadius: 11, backgroundColor: colors.background }, qualificationOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryLight }, qualificationCheck: { width: 24, height: 24, borderRadius: 7, borderWidth: 2, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' }, qualificationCheckActive: { borderColor: colors.primary, backgroundColor: colors.primary }, qualificationCopy: { flex: 1 }, qualificationTitle: { color: colors.text, fontSize: 12, fontWeight: '800' }, qualificationHint: { color: colors.textSecondary, fontSize: 9.5, marginTop: 3 },
  actions: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 8, padding: 10, paddingBottom: 14, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.card }, reset: { width: 94, minHeight: 44, flexDirection: 'row', gap: 5, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.primary, borderRadius: 10 }, resetDisabled: { borderColor: colors.border, backgroundColor: colors.background }, resetText: { color: colors.primary, fontSize: 11, fontWeight: '800' }, resetTextDisabled: { color: colors.textSecondary }, apply: { flex: 1, minHeight: 44, flexDirection: 'row', gap: 6, alignItems: 'center', justifyContent: 'center', borderRadius: 10, backgroundColor: colors.primary }, applyText: { color: '#fff', fontSize: 12, fontWeight: '900' },
  modalOverlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: colors.overlay }, modalCard: { maxHeight: '82%', minHeight: '45%', borderTopLeftRadius: 26, borderTopRightRadius: 26, backgroundColor: colors.card, paddingHorizontal: 18, paddingBottom: 28 }, modalHandle: { alignSelf: 'center', width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border, marginTop: 10, marginBottom: 12 }, modalHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 12 }, modalTitle: { color: colors.text, fontSize: 19, fontWeight: '900' }, modalSubtitle: { color: colors.textSecondary, fontSize: 10, marginTop: 3 }, modalClose: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }, modalSearch: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, borderRadius: 12, backgroundColor: colors.background, borderWidth: 1, borderColor: colors.border, marginBottom: 8 }, modalSearchInput: { flex: 1, color: colors.text, fontSize: 14 }, selectOption: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }, selectOptionActive: { backgroundColor: colors.primaryLight }, selectOptionText: { flex: 1, color: colors.text, fontSize: 13, paddingRight: 8 }, noOption: { color: colors.textSecondary, textAlign: 'center', paddingVertical: 30 },
});
