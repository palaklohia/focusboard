import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { Button, Field } from '../components/ui';
import { useAuth } from '../context/AuthContext';
import { ApiError } from '../lib/api';
import { EMAIL_RE, passwordProblem } from '../lib/validation';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
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
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err instanceof ApiError && err.details?.length) {
        setErrors(Object.fromEntries(err.details.map((d) => [d.field, d.message])));
      } else {
        setFormError(err instanceof Error ? err.message : 'Something went wrong');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthShell title="Create your account" subtitle="One account for web and mobile.">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <Field label="Full name" autoComplete="name" placeholder="Alex Morgan" value={fullName} onChange={(e) => setFullName(e.target.value)} error={errors.fullName} />
        <Field label="Email" type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} />
        <Field label="Password" type="password" autoComplete="new-password" placeholder="At least 8 characters, with a number" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        {formError && <p className="rounded-2xl bg-coral-100 p-3 text-sm font-medium text-coral-500">{formError}</p>}
        <Button type="submit" loading={loading} className="w-full py-3">Create account</Button>
      </form>
      <p className="mt-6 text-center text-sm text-ink/60">
        Already have an account? <Link to="/login" className="font-semibold text-brand-700 hover:underline">Log in</Link>
      </p>
    </AuthShell>
  );
}
