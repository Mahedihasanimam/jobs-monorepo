import { Tabs } from 'expo-router';
import { Bookmark, BriefcaseBusiness, Home, Megaphone } from 'lucide-react-native';
import { colors } from '@/constants/colors';

export default function TabsLayout() {
  return <Tabs screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.textSecondary, tabBarStyle: { height: 68, paddingTop: 7, paddingBottom: 6, borderTopColor: colors.border, backgroundColor: colors.card, elevation: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: -2 } }, tabBarLabelStyle: { fontSize: 9, fontWeight: '600' } }}>
    <Tabs.Screen name="index" options={{ title: 'হোম', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
    <Tabs.Screen name="jobs" options={{ title: 'চাকরি', tabBarIcon: ({ color, size }) => <BriefcaseBusiness color={color} size={size} /> }} />
    <Tabs.Screen name="notices" options={{ title: 'বিজ্ঞপ্তি', tabBarIcon: ({ color, size }) => <Megaphone color={color} size={size} /> }} />
    <Tabs.Screen name="saved" options={{ title: 'সংরক্ষিত', tabBarIcon: ({ color, size }) => <Bookmark color={color} size={size} /> }} />
    <Tabs.Screen name="more" options={{ href: null }} />
  </Tabs>;
}
