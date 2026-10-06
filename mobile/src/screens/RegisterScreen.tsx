import { useState } from 'react';
import { Pressable, Text } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AuthLayout from '../components/AuthLayout';
import { Button, Field } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { colors } from '../theme';
import type { AuthStackParamList } from '../navigation/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function passwordProblem(p: string): string | null {
  if (p.length < 8) return 'Password must be at least 8 characters';
  if (p.length > 72) return 'Password must be at most 72 characters';
  if (!/[A-Za-z]/.test(p)) return 'Password must contain a letter';
  if (!/[0-9]/.test(p)) return 'Password must contain a number';
  return null;
}

export default function RegisterScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Register'>) {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    setFormError('');
    const next: Record<string, string> = {};
    if (fullName.trim().length < 2) next.fullName = 'Full name must be at least 2 characters';
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address';
    const pw = passwordProblem(password);
    if (pw) next.password = pw;
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await register(fullName.trim(), email.trim(), password);
    } catch (e) {
      if (e instanceof ApiError && e.details?.length) {
        setErrors(Object.fromEntries(e.details.map((d) => [d.field, d.message])));
      } else {
        setFormError(e instanceof Error ? e.message : 'Something went wrong');
      }
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Create your account" subtitle="One account for web and mobile.">
      <Field label="Full name" value={fullName} onChangeText={setFullName} placeholder="Alex Morgan" autoComplete="name" error={errors.fullName} />
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email} />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="At least 8 characters, with a number" secureTextEntry autoCapitalize="none" error={errors.password} />
      {!!formError && (
        <Text style={{ backgroundColor: colors.coral100, color: colors.coral500, fontWeight: '600', padding: 12, borderRadius: 14, overflow: 'hidden' }}>{formError}</Text>
      )}
      <Button title="Create account" onPress={submit} loading={loading} />
      <Pressable onPress={() => navigation.navigate('Login')} style={{ alignItems: 'center', padding: 8 }}>
        <Text style={{ color: colors.inkSoft }}>
          Already have an account? <Text style={{ color: colors.brand700, fontWeight: '800' }}>Log in</Text>
        </Text>
      </Pressable>
    </AuthLayout>
  );
}
