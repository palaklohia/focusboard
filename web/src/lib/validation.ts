export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function passwordProblem(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 72) return 'Password must be at most 72 characters';
  if (!/[A-Za-z]/.test(password)) return 'Password must contain a letter';
  if (!/[0-9]/.test(password)) return 'Password must contain a number';
  return null;
}
