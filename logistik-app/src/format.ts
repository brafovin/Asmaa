const euro = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const euroGenau = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' });
const zahl = new Intl.NumberFormat('de-DE');

export const formatEuro = (n: number) => euro.format(n);
export const formatEuroGenau = (n: number) => euroGenau.format(n);
export const formatZahl = (n: number) => zahl.format(n);

/** "2026-10-09" -> "09.10.2026" */
export function formatDatum(iso: string): string {
  const [j, m, t] = iso.split('-');
  return `${t}.${m}.${j}`;
}

const WOCHENTAGE = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
export function wochentagKurz(iso: string): string {
  const [j, m, t] = iso.split('-').map(Number);
  return WOCHENTAGE[new Date(j, m - 1, t).getDay()];
}

/** Veränderung in Prozent, z. B. +12,4 %. Gibt null zurück, wenn der Vergleichswert 0 ist. */
export function prozentAenderung(neu: number, alt: number): number | null {
  if (alt === 0) return null;
  return Math.round(((neu - alt) / alt) * 1000) / 10;
}

export function begruessung(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Guten Morgen';
  if (h < 18) return 'Guten Tag';
  return 'Guten Abend';
}
