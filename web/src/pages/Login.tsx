import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { Button, Field } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { EMAIL_RE } from '../lib/validation';

export default function Login() {
  const { login, notice, clearNotice } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
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
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Welcome back" subtitle="Log in to pick up where you left off.">
      {notice && (
        <div className="mb-5 rounded-2xl bg-sun-100 p-4 text-sm font-medium text-ink">{notice}</div>
      )}
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Field label="Password" type="password" autoComplete="current-password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        {formError && <p className="rounded-2xl bg-coral-100 p-3 text-sm font-medium text-coral-500">{formError}</p>}
        <Button type="submit" loading={loading} className="w-full py-3">Log in</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/60">
        New here? <Link to="/register" className="font-semibold text-brand-700 hover:underline">Create an account</Link>
      </p>
    </AuthShell>
  );
}
