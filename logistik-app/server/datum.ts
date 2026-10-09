// Kleine Hilfsfunktionen für Datumsangaben (Format: JJJJ-MM-TT).

const zweistellig = (n: number) => String(n).padStart(2, '0');

export function isoDatum(d: Date): string {
  return `${d.getFullYear()}-${zweistellig(d.getMonth() + 1)}-${zweistellig(d.getDate())}`;
}

/** Datum von heute +/- n Tagen. tageVor(1) = gestern, tageVor(-3) = in 3 Tagen. */
export function tageVor(n: number, basis: Date = new Date()): string {
  const d = new Date(basis);
  d.setDate(d.getDate() - n);
  return isoDatum(d);
}

export function zeitstempel(d: Date): string {
  return `${isoDatum(d)} ${zweistellig(d.getHours())}:${zweistellig(d.getMinutes())}`;
}
