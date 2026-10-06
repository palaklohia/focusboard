import type { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

export default function AuthLayout({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  const insets = useSafeAreaInsets();
  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.brand600 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.brand600, colors.brand500, '#c58bff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[s.hero, { paddingTop: insets.top + 36 }]}
        >
          <View style={s.logoRow}>
            <View style={s.logo}>
              <Ionicons name="radio-button-on" size={22} color="#fff" />
            </View>
            <Text style={s.brand}>FocusBoard</Text>
          </View>
          <Text style={s.tagline}>Know exactly what to work on next.</Text>
        </LinearGradient>

        <View style={s.sheet}>
          <Text style={s.title}>{title}</Text>
          <Text style={s.subtitle}>{subtitle}</Text>
          <View style={{ marginTop: 24, gap: 16 }}>{children}</View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  hero: { paddingHorizontal: 24, paddingBottom: 56, gap: 18 },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 14, backgroundColor: 'rgba(255,255,255,0.22)', alignItems: 'center', justifyContent: 'center' },
  brand: { color: '#fff', fontSize: 22, fontWeight: '800' },
  tagline: { color: '#fff', fontSize: 30, fontWeight: '800', lineHeight: 36, maxWidth: 300 },
  sheet: { flex: 1, backgroundColor: colors.cream, borderTopLeftRadius: 32, borderTopRightRadius: 32, marginTop: -28, padding: 24, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: '800', color: colors.ink },
  subtitle: { fontSize: 15, color: colors.inkSoft, marginTop: 4 },
});
