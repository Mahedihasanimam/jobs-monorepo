import { useState } from 'react';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { BriefcaseBusiness, CalendarDays, Check, ChevronLeft, ChevronRight, GraduationCap, MapPin, UserRound } from 'lucide-react-native';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { IntroSlides } from '@/components/onboarding/IntroSlides';
import { useJobProfile } from '@/hooks/useJobProfile';
import { useOnboarding } from '@/hooks/useOnboarding';
import { EMPTY_PROFILE, type CandidateProfile } from '@/types/profile';
import { toBanglaDigits } from '@/utils/date';

const education = ['এসএসসি', 'এইচএসসি', 'ডিপ্লোমা', 'স্নাতক', 'স্নাতকোত্তর'];
const genders = [{ value: 'male', label: 'পুরুষ' }, { value: 'female', label: 'নারী' }, { value: 'other', label: 'অন্যান্য' }] as const;
const categories = ['কম্পিউটার ও আইটি', 'ব্যাংক', 'রেলওয়ে', 'প্রতিরক্ষা', 'শিক্ষা', 'স্বাস্থ্য', 'প্রশাসন'];
const govt = ['শুধু সরকারি', 'মন্ত্রণালয়', 'স্বায়ত্তশাসিত প্রতিষ্ঠান', 'সরকারি ব্যাংক'];
const steps = [
  { title: 'ব্যক্তিগত তথ্য', hint: 'আপনার বয়স ও প্রযোজ্য শর্ত মিলিয়ে দেখব', icon: UserRound },
  { title: 'শিক্ষাগত যোগ্যতা', hint: 'শিক্ষা ও অভিজ্ঞতার সঙ্গে চাকরি মিলবে', icon: GraduationCap },
  { title: 'ঠিকানা', hint: 'আপনার পছন্দের এলাকার চাকরি আগে দেখাব', icon: MapPin },
  { title: 'চাকরির পছন্দ', hint: 'আপনার আগ্রহ অনুযায়ী ফলাফল সাজাব', icon: BriefcaseBusiness },
] as const;

function parseDate(value: string) {
  const date = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T12:00:00`) : new Date(2000, 0, 1);
  return Number.isNaN(date.getTime()) ? new Date(2000, 0, 1) : date;
}

function dateValue(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

function displayDate(value: string) {
  if (!value) return 'তারিখ নির্বাচন করুন';
  const [year = '', month = '', day = ''] = value.split('-');
  return `${toBanglaDigits(day)}-${toBanglaDigits(month)}-${toBanglaDigits(year)}`;
}

export default function OnboardingScreen() {
  const [introComplete, setIntroComplete] = useState(false);
  return introComplete ? <ProfileForm /> : <IntroSlides onFinish={() => setIntroComplete(true)} />;
}

function ProfileForm() {
  const { profile, saveProfile } = useJobProfile();
  const { complete, saving } = useOnboarding(1);
  const [form, setForm] = useState<CandidateProfile>(profile.dateOfBirth ? profile : EMPTY_PROFILE);
  const [step, setStep] = useState(0);
  const [showIOSDate, setShowIOSDate] = useState(false);
  const set = (key: keyof CandidateProfile, value: CandidateProfile[typeof key]) => setForm((old) => ({ ...old, [key]: value }));
  const toggle = (key: 'preferredLocations' | 'jobCategories' | 'governmentPreferences', value: string) => setForm((old) => ({ ...old, [key]: old[key].includes(value) ? old[key].filter((item) => item !== value) : [...old[key], value] }));

  const selectDate = () => {
    if (Platform.OS === 'android') {
      DateTimePickerAndroid.open({ value: parseDate(form.dateOfBirth), mode: 'date', maximumDate: new Date(), minimumDate: new Date(1950, 0, 1), onChange: (_, date) => date && set('dateOfBirth', dateValue(date)) });
    } else setShowIOSDate((visible) => !visible);
  };

  const next = () => {
    if (step === 0 && !form.dateOfBirth) return Alert.alert('জন্মতারিখ নির্বাচন করুন', 'বয়সের শর্ত মিলিয়ে দেখাতে জন্মতারিখ প্রয়োজন।');
    if (step === 1 && !form.educationLevel) return Alert.alert('শিক্ষার স্তর নির্বাচন করুন', 'আপনার সর্বোচ্চ শিক্ষাগত যোগ্যতা নির্বাচন করুন।');
    if (step === 2 && !form.currentDistrict.trim()) return Alert.alert('বর্তমান জেলা লিখুন', 'এলাকাভিত্তিক চাকরি দেখাতে বর্তমান জেলা প্রয়োজন।');
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const submit = async () => {
    if (!form.dateOfBirth || !form.educationLevel || !form.currentDistrict.trim()) return Alert.alert('আরও কিছু তথ্য প্রয়োজন', 'জন্মতারিখ, শিক্ষার স্তর ও বর্তমান জেলা পূরণ করুন।');
    await saveProfile(form);
    await complete();
  };

  const current = steps[step] ?? steps[0];
  const StepIcon = current.icon;
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.head}>
          <View style={styles.mark}><BriefcaseBusiness size={22} color="#fff" /></View>
          <View style={styles.headCopy}><Text style={styles.eyebrow}>আমার চাকরির মিল</Text><Text style={styles.title}>আপনার জন্য সঠিক চাকরি খুঁজুন</Text></View>
          <Text style={styles.stepCount}>{toBanglaDigits(step + 1)}/{toBanglaDigits(steps.length)}</Text>
        </View>
        <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${((step + 1) / steps.length) * 100}%` }]} /></View>

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
          <View style={styles.stepIntro}>
            <View style={styles.stepIcon}><StepIcon size={22} color={colors.primary} /></View>
            <View style={styles.flex}><Text style={styles.stepTitle}>{current.title}</Text><Text style={styles.stepHint}>{current.hint}</Text></View>
          </View>

          <View style={styles.section}>
            {step === 0 ? <>
              <Text style={styles.label}>জন্মতারিখ <Text style={styles.required}>*</Text></Text>
              <Pressable style={[styles.input, styles.dateInput]} onPress={selectDate}><Text style={[styles.dateText, !form.dateOfBirth && styles.placeholder]}>{displayDate(form.dateOfBirth)}</Text><CalendarDays size={20} color={colors.primary} /></Pressable>
              {Platform.OS === 'ios' && showIOSDate ? <View style={styles.iosPicker}><DateTimePicker value={parseDate(form.dateOfBirth)} mode="date" display="spinner" maximumDate={new Date()} minimumDate={new Date(1950, 0, 1)} onChange={(_, date) => date && set('dateOfBirth', dateValue(date))} /><Pressable style={styles.dateDone} onPress={() => setShowIOSDate(false)}><Text style={styles.dateDoneText}>সম্পন্ন</Text></Pressable></View> : null}
              <Text style={styles.label}>লিঙ্গ</Text><View style={styles.chips}>{genders.map((item) => <Chip key={item.value} label={item.label} active={form.gender === item.value} onPress={() => set('gender', item.value)} />)}</View>
            </> : null}

            {step === 1 ? <>
              <Text style={styles.label}>সর্বোচ্চ শিক্ষার স্তর <Text style={styles.required}>*</Text></Text><View style={styles.chips}>{education.map((item) => <Chip key={item} label={item} active={form.educationLevel === item} onPress={() => set('educationLevel', item)} />)}</View>
              <Field label="ডিগ্রি" hint="যেমন: বিএসসি বা ডিপ্লোমা" value={form.degree} onChange={(v) => set('degree', v)} />
              <Field label="বিষয় / বিভাগ" hint="যেমন: কম্পিউটার বিজ্ঞান" value={form.subject} onChange={(v) => set('subject', v)} />
              <View style={styles.row}><View style={styles.flex}><Field label="পাসের বছর" hint="২০২৫" value={form.graduationYear} onChange={(v) => set('graduationYear', v)} keyboard="number-pad" /></View><View style={styles.flex}><Field label="জিপিএ / সিজিপিএ" hint="৩.৫০" value={form.result} onChange={(v) => set('result', v)} keyboard="decimal-pad" /></View></View>
              <Field label="অভিজ্ঞতা (বছর)" hint="নতুন প্রার্থী হলে ০" value={form.experienceYears} onChange={(v) => set('experienceYears', v)} keyboard="decimal-pad" />
            </> : null}

            {step === 2 ? <>
              <Field label="বর্তমান জেলা *" hint="যেমন: ঢাকা" value={form.currentDistrict} onChange={(v) => set('currentDistrict', v)} />
              <Field label="স্থায়ী জেলা" hint="যেমন: কুমিল্লা" value={form.permanentDistrict} onChange={(v) => set('permanentDistrict', v)} />
              <Field label="পছন্দের কর্মস্থল" hint="কমা দিয়ে লিখুন: ঢাকা, চট্টগ্রাম" value={form.preferredLocations.join(', ')} onChange={(v) => set('preferredLocations', v.split(',').map((item) => item.trim()).filter(Boolean))} />
              <Text style={styles.helper}>একাধিক জেলা লিখলে কমা ব্যবহার করুন।</Text>
            </> : null}

            {step === 3 ? <>
              <Text style={styles.label}>পছন্দের চাকরির বিভাগ</Text><Text style={styles.helper}>এক বা একাধিক বিভাগ নির্বাচন করতে পারেন।</Text><View style={styles.chips}>{categories.map((item) => <Chip key={item} label={item} active={form.jobCategories.includes(item)} onPress={() => toggle('jobCategories', item)} />)}</View>
              <Text style={styles.label}>সরকারি চাকরির অগ্রাধিকার</Text><View style={styles.chips}>{govt.map((item) => <Chip key={item} label={item} active={form.governmentPreferences.includes(item)} onPress={() => toggle('governmentPreferences', item)} />)}</View>
              <Field label="কোটা (প্রযোজ্য হলে)" hint="যেমন: মুক্তিযোদ্ধা বা প্রতিবন্ধী" value={form.quota} onChange={(v) => set('quota', v)} />
              <View style={styles.privacy}><Check size={16} color={colors.primary} /><Text style={styles.privacyText}>তথ্য শুধু এই ডিভাইসে থাকবে এবং চাকরির মিল নির্ধারণে ব্যবহার হবে।</Text></View>
            </> : null}
          </View>
        </ScrollView>

        <View style={styles.bottom}>
          {step > 0 ? <Pressable style={styles.backButton} onPress={() => setStep((currentStep) => currentStep - 1)}><ChevronLeft size={19} color={colors.primary} /><Text style={styles.backText}>পেছনে</Text></Pressable> : null}
          <Pressable disabled={saving} style={[styles.button, step === 0 && styles.fullButton, saving && styles.disabled]} onPress={step === steps.length - 1 ? () => void submit() : next}>
            <Text style={styles.buttonText}>{saving ? 'সংরক্ষণ হচ্ছে…' : step === steps.length - 1 ? 'আমার চাকরি দেখুন' : 'পরবর্তী ধাপ'}</Text><ChevronRight size={20} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function Field({ label, hint, value, onChange, keyboard = 'default' }: { label: string; hint: string; value: string; onChange: (value: string) => void; keyboard?: 'default' | 'number-pad' | 'decimal-pad' }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput value={value} onChangeText={onChange} keyboardType={keyboard} placeholder={hint} placeholderTextColor="#929C97" style={styles.input} returnKeyType="next" /></View>;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: active }} onPress={onPress} style={[styles.chip, active && styles.chipActive]}>{active ? <Check size={14} color="#fff" /> : null}<Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, flex: { flex: 1 },
  head: { minHeight: 72, flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 16, backgroundColor: '#fff' },
  headCopy: { flex: 1 }, mark: { width: 42, height: 42, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.primary },
  eyebrow: { color: colors.primary, fontSize: 9, fontWeight: '900', letterSpacing: .8 }, title: { color: colors.text, fontSize: 18, fontWeight: '900', marginTop: 2 },
  stepCount: { color: colors.primary, fontSize: 13, fontWeight: '900', backgroundColor: '#E9F5EF', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 12 },
  progressTrack: { height: 4, backgroundColor: '#DDE8E2' }, progressFill: { height: 4, backgroundColor: colors.primary, borderTopRightRadius: 3, borderBottomRightRadius: 3 },
  content: { padding: 16, paddingBottom: 28 }, stepIntro: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 14 },
  stepIcon: { width: 46, height: 46, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: '#E9F5EF' }, stepTitle: { color: colors.text, fontSize: 19, fontWeight: '900' }, stepHint: { color: colors.textSecondary, fontSize: 11.5, lineHeight: 17, marginTop: 2 },
  section: { gap: 14, padding: 17, borderRadius: 18, borderWidth: 1, borderColor: '#E2EAE6', backgroundColor: '#fff', shadowColor: '#183C2D', shadowOffset: { width: 0, height: 2 }, shadowOpacity: .04, shadowRadius: 8, elevation: 2 },
  field: { gap: 6 }, label: { color: colors.text, fontSize: 12, fontWeight: '800' }, required: { color: '#C43D3D' }, helper: { color: colors.textSecondary, fontSize: 10.5, lineHeight: 16, marginTop: -7 },
  input: { minHeight: 50, paddingHorizontal: 13, borderRadius: 12, borderWidth: 1, borderColor: '#D9E3DE', backgroundColor: '#FAFCFB', color: colors.text, fontSize: 14 },
  dateInput: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }, dateText: { color: colors.text, fontSize: 14, fontWeight: '700' }, placeholder: { color: '#929C97', fontWeight: '500' },
  iosPicker: { paddingBottom: 8, borderRadius: 12, backgroundColor: '#F8FAF9' }, dateDone: { alignSelf: 'flex-end', paddingHorizontal: 16, paddingVertical: 8 }, dateDoneText: { color: colors.primary, fontWeight: '900' },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, chip: { minHeight: 39, flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, borderRadius: 20, borderWidth: 1, borderColor: '#D9E3DE', backgroundColor: '#FAFCFB' }, chipActive: { borderColor: colors.primary, backgroundColor: colors.primary }, chipText: { color: colors.textSecondary, fontSize: 11.5, fontWeight: '700' }, chipTextActive: { color: '#fff' },
  row: { flexDirection: 'row', gap: 10 }, privacy: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, padding: 12, borderRadius: 12, backgroundColor: '#EFF7F3' }, privacyText: { flex: 1, color: colors.textSecondary, fontSize: 10.5, lineHeight: 16 },
  bottom: { flexDirection: 'row', gap: 10, padding: 12, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#fff' },
  backButton: { minHeight: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 3, paddingHorizontal: 18, borderRadius: 13, borderWidth: 1, borderColor: colors.primary }, backText: { color: colors.primary, fontSize: 13, fontWeight: '900' },
  button: { minHeight: 52, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, borderRadius: 13, backgroundColor: colors.primary }, fullButton: { flex: 1 }, buttonText: { color: '#fff', fontSize: 14, fontWeight: '900' }, disabled: { opacity: .6 },
});
