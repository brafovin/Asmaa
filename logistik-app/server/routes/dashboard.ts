import { Router } from 'express';
import { db } from '../db.ts';
import { isoDatum, tageVor } from '../datum.ts';
import type {
  AuftragKurz,
  AuftragStatus,
  DashboardDaten,
  StatusAnzahl,
  TagesWert,
  TourKurz,
  Warnung,
} from '../../shared/types.ts';

export const dashboardRouter = Router();

const zahl = (sql: string, ...param: (string | number)[]): number => {
  const zeile = db.prepare(sql).get(...param) as Record<string, number | null> | undefined;
  return Number(Object.values(zeile ?? { x: 0 })[0] ?? 0);
};

dashboardRouter.get('/', (_anfrage, antwort) => {
  const heute = tageVor(0);
  const gestern = tageVor(1);
  const vor30 = tageVor(29);
  const vor60 = tageVor(59);

  // --- Kennzahlen --------------------------------------------------------
  const auftraegeAn = (tag: string) =>
    zahl(`SELECT COUNT(*) FROM auftraege WHERE substr(erstellt_am, 1, 10) = ? AND status != 'storniert'`, tag);
  const umsatz = (von: string, bis: string) =>
    zahl(
      `SELECT COALESCE(SUM(gesamtwert), 0) FROM auftraege
       WHERE status != 'storniert' AND substr(erstellt_am, 1, 10) BETWEEN ? AND ?`,
      von,
      bis,
    );

  const geliefert30 = zahl(
    `SELECT COUNT(*) FROM auftraege WHERE status = 'geliefert' AND geliefert_am BETWEEN ? AND ?`,
    vor30,
    heute,
  );
  const puenktlich30 = zahl(
    `SELECT COUNT(*) FROM auftraege
     WHERE status = 'geliefert' AND geliefert_am BETWEEN ? AND ? AND geliefert_am <= liefertermin`,
    vor30,
    heute,
  );

  const kennzahlen = {
    auftraegeHeute: auftraegeAn(heute),
    auftraegeGestern: auftraegeAn(gestern),
    offeneAuftraege: zahl(`SELECT COUNT(*) FROM auftraege WHERE status IN ('neu', 'in_bearbeitung', 'versandbereit')`),
    unterwegs: zahl(`SELECT COUNT(*) FROM auftraege WHERE status = 'unterwegs'`),
    umsatz30Tage: umsatz(vor30, heute),
    umsatzVorperiode: umsatz(vor60, tageVor(30)),
    puenktlichkeit: geliefert30 > 0 ? Math.round((puenktlich30 / geliefert30) * 1000) / 10 : null,
    fahrzeugeVerfuegbar: zahl(`SELECT COUNT(*) FROM fahrzeuge WHERE status = 'verfuegbar'`),
    fahrzeugeGesamt: zahl(`SELECT COUNT(*) FROM fahrzeuge`),
  };

  // --- Aufträge pro Tag (letzte 14 Tage, Tage ohne Aufträge = 0) ----------
  const proTagZeilen = db
    .prepare(
      `SELECT substr(erstellt_am, 1, 10) AS datum, COUNT(*) AS anzahl FROM auftraege
       WHERE status != 'storniert' AND substr(erstellt_am, 1, 10) >= ?
       GROUP BY datum`,
    )
    .all(tageVor(13)) as unknown as TagesWert[];
  const proTagMap = new Map(proTagZeilen.map((z) => [z.datum, Number(z.anzahl)]));
  const auftraegeProTag: TagesWert[] = Array.from({ length: 14 }, (_, i) => {
    const datum = tageVor(13 - i);
    return { datum, anzahl: proTagMap.get(datum) ?? 0 };
  });

  // --- Statusverteilung (letzte 30 Tage) ----------------------------------
  const statusVerteilung = (
    db
      .prepare(
        `SELECT status, COUNT(*) AS anzahl FROM auftraege
         WHERE substr(erstellt_am, 1, 10) >= ? GROUP BY status`,
      )
      .all(vor30) as unknown as StatusAnzahl[]
  ).map((z) => ({ status: z.status as AuftragStatus, anzahl: Number(z.anzahl) }));

  // --- Warnmeldungen ---------------------------------------------------------
  const warnungen: Warnung[] = [];

  const leereArtikel = db
    .prepare('SELECT bezeichnung, artikelnummer FROM artikel WHERE bestand = 0 ORDER BY bezeichnung')
    .all() as unknown as { bezeichnung: string; artikelnummer: string }[];
  for (const a of leereArtikel) {
    warnungen.push({
      id: `leer-${a.artikelnummer}`,
      stufe: 'kritisch',
      titel: `${a.bezeichnung} ist ausverkauft`,
      text: `Artikel ${a.artikelnummer} hat keinen Bestand mehr. Bitte nachbestellen.`,
      link: '/lager',
    });
  }

  const knappeArtikel = db
    .prepare(
      `SELECT bezeichnung, artikelnummer, bestand, mindestbestand, einheit FROM artikel
       WHERE bestand > 0 AND bestand < mindestbestand ORDER BY (bestand * 1.0 / mindestbestand)`,
    )
    .all() as unknown as { bezeichnung: string; artikelnummer: string; bestand: number; mindestbestand: number; einheit: string }[];
  for (const a of knappeArtikel) {
    warnungen.push({
      id: `knapp-${a.artikelnummer}`,
      stufe: 'warnung',
      titel: `Bestand niedrig: ${a.bezeichnung}`,
      text: `Nur noch ${a.bestand} ${a.einheit} auf Lager (Mindestbestand: ${a.mindestbestand}).`,
      link: '/lager',
    });
  }

  const ueberfaellig = db
    .prepare(
      `SELECT a.nummer, k.name, a.liefertermin FROM auftraege a JOIN kunden k ON k.id = a.kunde_id
       WHERE a.status IN ('neu', 'in_bearbeitung', 'versandbereit') AND a.liefertermin < ?
       ORDER BY a.liefertermin`,
    )
    .all(heute) as unknown as { nummer: string; name: string; liefertermin: string }[];
  for (const a of ueberfaellig) {
    warnungen.push({
      id: `faellig-${a.nummer}`,
      stufe: 'kritisch',
      titel: `Auftrag ${a.nummer} ist überfällig`,
      text: `${a.name} – Liefertermin war am ${a.liefertermin.split('-').reverse().join('.')}.`,
      link: '/auftraege',
    });
  }

  const tuevBald = db
    .prepare(`SELECT kennzeichen, tuev_bis FROM fahrzeuge WHERE tuev_bis <= ? ORDER BY tuev_bis`)
    .all(isoDatum(new Date(Date.now() + 30 * 86400000))) as unknown as { kennzeichen: string; tuev_bis: string }[];
  for (const f of tuevBald) {
    warnungen.push({
      id: `tuev-${f.kennzeichen}`,
      stufe: 'warnung',
      titel: `TÜV bald fällig: ${f.kennzeichen}`,
      text: `Hauptuntersuchung bis ${f.tuev_bis.split('-').reverse().join('.')}.`,
      link: '/transport',
    });
  }

  const inWerkstatt = db
    .prepare(`SELECT kennzeichen, typ FROM fahrzeuge WHERE status = 'werkstatt'`)
    .all() as unknown as { kennzeichen: string; typ: string }[];
  for (const f of inWerkstatt) {
    warnungen.push({
      id: `werkstatt-${f.kennzeichen}`,
      stufe: 'info',
      titel: `${f.kennzeichen} ist in der Werkstatt`,
      text: `${f.typ} steht aktuell nicht für Touren zur Verfügung.`,
      link: '/transport',
    });
  }

  const ohneTour = zahl(`SELECT COUNT(*) FROM auftraege WHERE status = 'versandbereit' AND tour_id IS NULL`);
  if (ohneTour > 0) {
    warnungen.push({
      id: 'ohne-tour',
      stufe: 'info',
      titel: `${ohneTour} versandbereite ${ohneTour === 1 ? 'Auftrag hat' : 'Aufträge haben'} noch keine Tour`,
      text: 'Weise die Aufträge einer Liefertour zu, damit sie ausgeliefert werden können.',
      link: '/transport',
    });
  }

  const reihenfolge = { kritisch: 0, warnung: 1, info: 2 } as const;
  warnungen.sort((a, b) => reihenfolge[a.stufe] - reihenfolge[b.stufe]);

  // --- Letzte Aufträge ------------------------------------------------------
  const letzteAuftraege = (
    db
      .prepare(
        `SELECT a.id, a.nummer, k.name AS kunde, a.ziel_ort AS zielOrt, a.status, a.gesamtwert, a.liefertermin
         FROM auftraege a JOIN kunden k ON k.id = a.kunde_id
         ORDER BY a.erstellt_am DESC, a.id DESC LIMIT 8`,
      )
      .all() as unknown as AuftragKurz[]
  ).map((a) => ({ ...a, status: a.status as AuftragStatus }));

  // --- Aktive Touren ----------------------------------------------------------
  const aktiveTouren = db
    .prepare(
      `SELECT t.id, t.bezeichnung, t.status, t.datum, f.name AS fahrer, v.kennzeichen,
              (SELECT COUNT(*) FROM auftraege a WHERE a.tour_id = t.id) AS stopps
       FROM touren t
       JOIN fahrer f ON f.id = t.fahrer_id
       JOIN fahrzeuge v ON v.id = t.fahrzeug_id
       WHERE t.status IN ('geplant', 'unterwegs')
       ORDER BY t.datum, t.id`,
    )
    .all() as unknown as TourKurz[];

  const daten: DashboardDaten = {
    erstelltAm: new Date().toISOString(),
    kennzahlen,
    auftraegeProTag,
    statusVerteilung,
    warnungen,
    letzteAuftraege,
    aktiveTouren,
  };
  antwort.json(daten);
});
