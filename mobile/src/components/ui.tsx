import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNetInfo } from '@react-native-community/netinfo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, shadow } from '../theme';
import { HEALTH_LABEL, PRIORITY_LABEL } from '../lib/labels';
import type { Priority, ProjectHealth } from '../types';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

const variants = {
  primary: { bg: colors.brand600, fg: '#ffffff' },
  soft: { bg: colors.brand50, fg: colors.brand700 },
  ghost: { bg: 'transparent', fg: colors.ink },
  danger: { bg: colors.coral100, fg: colors.coral500 },
};

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading,
  disabled,
  icon,
  style,
}: {
  title: string;
  onPress: () => void;
  variant?: keyof typeof variants;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  style?: StyleProp<ViewStyle>;
}) {
  const v = variants[variant];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        s.btn,
        { backgroundColor: v.bg, opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        variant === 'primary' && shadow,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={v.fg} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={18} color={v.fg} />}
          <Text style={[s.btnText, { color: v.fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

export function Field({ label, error, style, ...rest }: TextInputProps & { label: string; error?: string }) {
  return (
    <View style={{ gap: 6 }}>
      <Text style={s.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.inkFaint}
        style={[
          s.input,
          rest.multiline && { minHeight: 96, textAlignVertical: 'top' },
          !!error && { borderColor: colors.coral500 },
          style,
        ]}
        {...rest}
      />
      {!!error && <Text style={s.error}>{error}</Text>}
    </View>
  );
}

export function SearchBar({ value, onChangeText, placeholder }: { value: string; onChangeText: (v: string) => void; placeholder: string }) {
  return (
    <View style={s.search}>
      <Ionicons name="search" size={18} color={colors.inkFaint} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.inkFaint}
        style={s.searchInput}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
      />
      {value.length > 0 && (
        <Pressable onPress={() => onChangeText('')} hitSlop={10} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color={colors.inkFaint} />
        </Pressable>
      )}
    </View>
  );
}

export function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[s.chip, active && { backgroundColor: colors.brand600, borderColor: colors.brand600 }]}
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
    >
      <Text style={[s.chipText, active && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

export function FilterChips<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} keyboardShouldPersistTaps="handled">
      {options.map((o) => (
        <Chip key={o.value} label={o.label} active={o.value === value} onPress={() => onChange(o.value)} />
      ))}
    </ScrollView>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[s.card, style]}>{children}</View>;
}

export function Badge({ label, bg, fg }: { label: string; bg: string; fg: string }) {
  return (
    <View style={[s.badge, { backgroundColor: bg }]}>
      <Text style={[s.badgeText, { color: fg }]}>{label}</Text>
    </View>
  );
}

const priorityColors: Record<Priority, { bg: string; fg: string }> = {
  HIGH: { bg: colors.coral100, fg: colors.coral500 },
  MEDIUM: { bg: colors.sun100, fg: colors.sun500 },
  LOW: { bg: colors.mint100, fg: colors.mint500 },
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const c = priorityColors[priority];
  return <Badge label={PRIORITY_LABEL[priority].toUpperCase()} bg={c.bg} fg={c.fg} />;
}

const healthColors: Record<ProjectHealth, { bg: string; fg: string }> = {
  ON_TRACK: { bg: colors.mint100, fg: colors.mint500 },
  AT_RISK: { bg: colors.sun100, fg: colors.sun500 },
  OVERDUE: { bg: colors.coral100, fg: colors.coral500 },
  COMPLETED: { bg: colors.brand50, fg: colors.brand700 },
};

export function HealthBadge({ health }: { health: ProjectHealth }) {
  const c = healthColors[health];
  return <Badge label={HEALTH_LABEL[health]} bg={c.bg} fg={c.fg} />;
}

export function StatusPill({ label }: { label: string }) {
  return <Badge label={label} bg="rgba(0,0,0,0.05)" fg={colors.inkSoft} />;
}

export function ProgressBar({ value }: { value: number }) {
  return (
    <View style={s.track}>
      <View style={[s.fill, { width: `${value}%` }]} />
    </View>
  );
}

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={s.center}>
      <ActivityIndicator size="large" color={colors.brand600} />
      <Text style={s.centerText}>{label}</Text>
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={s.center}>
      <View style={[s.iconCircle, { backgroundColor: colors.coral100 }]}>
        <Ionicons name="cloud-offline-outline" size={30} color={colors.coral500} />
      </View>
      <Text style={s.centerTitle}>Something went wrong</Text>
      <Text style={s.centerText}>{message}</Text>
      {onRetry && <Button title="Try again" onPress={onRetry} variant="soft" style={{ marginTop: 16 }} />}
    </View>
  );
}

export function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <View style={[s.center, { paddingVertical: 48 }]}>
      <View style={[s.iconCircle, { backgroundColor: colors.brand50 }]}>
        <Ionicons name="file-tray-outline" size={30} color={colors.brand600} />
      </View>
      <Text style={s.centerTitle}>{title}</Text>
      <Text style={s.centerText}>{text}</Text>
    </View>
  );
}

// Floating pill shown whenever the phone has no internet connection
export function OfflineBanner() {
  const net = useNetInfo();
  const insets = useSafeAreaInsets();
  if (net.isConnected !== false) return null;
  return (
    <View pointerEvents="none" style={[s.offline, { top: insets.top + 8 }]}>
      <Ionicons name="cloud-offline-outline" size={16} color="#fff" />
      <Text style={s.offlineText}>You're offline. Showing what's loaded; changes need a connection.</Text>
    </View>
  );
}

const s = StyleSheet.create({
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, paddingVertical: 14, paddingHorizontal: 22, minHeight: 48 },
  btnText: { fontSize: 15, fontWeight: '700' },
  label: { fontSize: 13, fontWeight: '700', color: colors.ink },
  input: { backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 13, fontSize: 15, color: colors.ink },
  error: { fontSize: 12, fontWeight: '600', color: colors.coral500 },
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.white, borderRadius: 999, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 16, height: 46 },
  searchInput: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 0 },
  chip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border },
  chipText: { fontSize: 13, fontWeight: '700', color: colors.inkSoft },
  card: { backgroundColor: colors.white, borderRadius: 24, padding: 18, ...shadow },
  badge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  badgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  track: { height: 8, borderRadius: 999, backgroundColor: colors.brand50, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 999, backgroundColor: colors.brand500 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 8, backgroundColor: colors.cream },
  centerTitle: { fontSize: 20, fontWeight: '800', color: colors.ink, textAlign: 'center' },
  centerText: { fontSize: 14, color: colors.inkSoft, textAlign: 'center', lineHeight: 20 },
  iconCircle: { width: 64, height: 64, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  offline: { position: 'absolute', left: 16, right: 16, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.ink, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10, zIndex: 100 },
  offlineText: { flex: 1, color: '#fff', fontSize: 12, fontWeight: '600' },
});
