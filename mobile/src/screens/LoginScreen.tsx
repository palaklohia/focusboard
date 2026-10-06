import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import AuthLayout from '../components/AuthLayout';
import { Button, Field } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme';
import type { AuthStackParamList } from '../navigation/types';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen({ navigation }: NativeStackScreenProps<AuthStackParamList, 'Login'>) {
  const { login, notice, clearNotice } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit() {
    clearNotice();
    setFormError('');
    const next: Record<string, string> = {};
    if (!EMAIL_RE.test(email.trim())) next.email = 'Enter a valid email address';
    if (!password) next.password = 'Password is required';
    setErrors(next);
    if (Object.keys(next).length) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Something went wrong');
      setLoading(false);
    }
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in with the same account you use on the web.">
      {!!notice && (
        <View style={{ backgroundColor: colors.sun100, borderRadius: 16, padding: 14 }}>
          <Text style={{ color: colors.ink, fontWeight: '600' }}>{notice}</Text>
        </View>
      )}
      <Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" autoComplete="email" error={errors.email} />
      <Field label="Password" value={password} onChangeText={setPassword} placeholder="Your password" secureTextEntry autoCapitalize="none" autoComplete="password" error={errors.password} />
      {!!formError && (
        <Text style={{ backgroundColor: colors.coral100, color: colors.coral500, fontWeight: '600', padding: 12, borderRadius: 14, overflow: 'hidden' }}>{formError}</Text>
      )}
      <Button title="Log in" onPress={submit} loading={loading} />
      <Pressable onPress={() => navigation.navigate('Register')} style={{ alignItems: 'center', padding: 8 }}>
        <Text style={{ color: colors.inkSoft }}>
          New here? <Text style={{ color: colors.brand700, fontWeight: '800' }}>Create an account</Text>
        </Text>
      </Pressable>
    </AuthLayout>
  );
}
