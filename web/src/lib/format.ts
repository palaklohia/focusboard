export function toInputDate(iso: string | null): string {
  return iso ? iso.slice(0, 10) : '';
}

export function formatDate(iso: string | null): string {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function isPastDue(iso: string | null): boolean {
  return !!iso && iso.slice(0, 10) < new Date().toISOString().slice(0, 10);
}
