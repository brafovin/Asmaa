import type { DatabaseSync } from 'node:sqlite';
import type { AuftragStatus } from '../shared/types.ts';
import { tageVor, zeitstempel } from './datum.ts';

// Fester Zufallsgenerator: Jeder Start erzeugt dieselben Beispieldaten.
function zufallsgenerator(startwert: number) {
  let a = startwert;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const KUNDEN: [string, string][] = [
  ['Nordwind Handels GmbH', 'Hamburg'],
  ['Rheinland Möbel AG', 'Köln'],
  ['Bavaria Sport & Freizeit', 'München'],
  ['Hanse Elektronik GmbH', 'Bremen'],
  ['Sachsen Bau-Zentrum', 'Leipzig'],
  ['Schwabenmarkt Großhandel', 'Stuttgart'],
  ['Berlin Fashion Outlet', 'Berlin'],
  ['Ruhrgebiet Werkzeug KG', 'Dortmund'],
  ['Main-Frankfurt Pharma', 'Frankfurt am Main'],
  ['Weserbergland Naturkost', 'Hannover'],
  ['Elbe Gartenwelt', 'Dresden'],
  ['Kieler Bürobedarf', 'Kiel'],
];

// [Nummer, Bezeichnung, Kategorie, Einheit, Bestand, Mindestbestand, Preis, Lagerplatz]
const ARTIKEL: [string, string, string, string, number, number, number, string][] = [
  ['EL-1001', 'Akku-Bohrschrauber 18 V', 'Werkzeug', 'Stk', 142, 40, 89.9, 'A-01-01'],
  ['EL-1002', 'Schlagbohrmaschine 750 W', 'Werkzeug', 'Stk', 96, 30, 64.5, 'A-01-02'],
  ['EL-1003', 'Werkzeugkoffer 120-teilig', 'Werkzeug', 'Stk', 18, 25, 79.0, 'A-01-03'],
  ['BU-2001', 'Kopierpapier A4, 500 Blatt', 'Büro', 'Pack', 1850, 600, 4.2, 'B-02-01'],
  ['BU-2002', 'Ordner A4, breit', 'Büro', 'Stk', 640, 200, 2.8, 'B-02-02'],
  ['BU-2003', 'Kugelschreiber, 50er-Box', 'Büro', 'Box', 0, 40, 12.5, 'B-02-03'],
  ['MO-3001', 'Bürostuhl ergonomisch', 'Möbel', 'Stk', 54, 20, 219.0, 'C-03-01'],
  ['MO-3002', 'Schreibtisch höhenverstellbar', 'Möbel', 'Stk', 33, 15, 389.0, 'C-03-02'],
  ['MO-3003', 'Regal 5 Fächer, Eiche', 'Möbel', 'Stk', 61, 20, 119.0, 'C-03-03'],
  ['SP-4001', 'Fitnessmatte rutschfest', 'Sport', 'Stk', 210, 60, 24.9, 'D-04-01'],
  ['SP-4002', 'Kurzhantel-Set 20 kg', 'Sport', 'Set', 72, 25, 59.0, 'D-04-02'],
  ['SP-4003', 'Trinkflasche Edelstahl 750 ml', 'Sport', 'Stk', 28, 80, 16.5, 'D-04-03'],
  ['LE-5001', 'Bio-Nudeln Vollkorn 500 g', 'Lebensmittel', 'Karton', 320, 100, 38.0, 'E-05-01'],
  ['LE-5002', 'Olivenöl nativ extra 1 l', 'Lebensmittel', 'Karton', 185, 60, 72.0, 'E-05-02'],
  ['LE-5003', 'Haferflocken 1 kg', 'Lebensmittel', 'Karton', 410, 120, 29.5, 'E-05-03'],
  ['GA-6001', 'Gartenschlauch 25 m', 'Garten', 'Stk', 87, 30, 32.0, 'F-06-01'],
  ['GA-6002', 'Rasenmäher-Akku 36 V', 'Garten', 'Stk', 12, 15, 249.0, 'F-06-02'],
  ['GA-6003', 'Blumenerde 40 l', 'Garten', 'Sack', 540, 150, 6.9, 'F-06-03'],
  ['TE-7001', 'Bluetooth-Lautsprecher', 'Elektronik', 'Stk', 130, 40, 49.0, 'G-07-01'],
  ['TE-7002', 'USB-C-Ladegerät 65 W', 'Elektronik', 'Stk', 8, 50, 34.9, 'G-07-02'],
  ['TE-7003', 'Monitor 27 Zoll', 'Elektronik', 'Stk', 46, 15, 229.0, 'G-07-03'],
  ['BK-8001', 'Winterjacke Herren', 'Bekleidung', 'Stk', 175, 50, 99.0, 'H-08-01'],
  ['BK-8002', 'Laufschuhe Damen', 'Bekleidung', 'Paar', 98, 40, 84.0, 'H-08-02'],
  ['BK-8003', 'Baumwoll-T-Shirt 3er-Pack', 'Bekleidung', 'Pack', 460, 150, 22.0, 'H-08-03'],
];

// [Kennzeichen, Typ, Kapazität kg, TÜV in Tagen]
const FAHRZEUGE: [string, string, number, number][] = [
  ['HH-LF 2041', 'Sprinter 3,5 t', 1200, 220],
  ['HH-LF 2042', 'Sprinter 3,5 t', 1200, 12],
  ['HH-LF 3107', 'Transporter 7,5 t', 2800, 340],
  ['HB-TR 515', 'Transporter 7,5 t', 2800, 95],
  ['H-KM 880', 'LKW 12 t', 6000, 410],
  ['H-KM 881', 'LKW 12 t', 6000, 260],
  ['K-VW 4410', 'Kastenwagen 2,8 t', 900, 180],
  ['M-LG 7721', 'Sattelzug 24 t', 14000, 60],
];

const FAHRER: [string, string, string][] = [
  ['Jens Albrecht', '0171 5550101', 'im_einsatz'],
  ['Marta Kowalski', '0172 5550102', 'im_einsatz'],
  ['Thomas Berger', '0160 5550103', 'im_einsatz'],
  ['Sabine Neumann', '0151 5550104', 'verfuegbar'],
  ['Mehmet Yilmaz', '0176 5550105', 'verfuegbar'],
  ['Katrin Vogel', '0170 5550106', 'verfuegbar'],
  ['Ralf Hoffmann', '0173 5550107', 'abwesend'],
  ['Elena Petrova', '0162 5550108', 'verfuegbar'],
];

export function befuelleBeispieldaten(db: DatabaseSync) {
  const zufall = zufallsgenerator(20260101);
  const zahl = (von: number, bis: number) => von + Math.floor(zufall() * (bis - von + 1));
  const wahl = <T>(liste: T[]): T => liste[Math.floor(zufall() * liste.length)];
  const heute = new Date();

  db.exec('BEGIN');
  try {
    // --- Kunden ---------------------------------------------------------
    const kundeEinfuegen = db.prepare(
      'INSERT INTO kunden (name, ort, email, telefon, erstellt_am) VALUES (?, ?, ?, ?, ?)',
    );
    KUNDEN.forEach(([name, ort], i) => {
      const mail = name.toLowerCase().replace(/[^a-zäöüß]+/g, '-').replace(/^-|-$/g, '');
      kundeEinfuegen.run(name, ort, `einkauf@${mail}.example`, `040 ${5550200 + i}`, tageVor(200 - i * 7));
    });

    // --- Artikel --------------------------------------------------------
    const artikelEinfuegen = db.prepare(
      `INSERT INTO artikel (artikelnummer, bezeichnung, kategorie, einheit, bestand, mindestbestand, preis, lagerplatz)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    ARTIKEL.forEach((a) => artikelEinfuegen.run(...a));

    // --- Fahrzeuge & Fahrer --------------------------------------------
    // Fahrzeuge 1-3 gehören zu den aktiven Touren (siehe unten) und sind daher "im Einsatz".
    // Fahrzeug 8 steht in der Werkstatt.
    const fahrzeugEinfuegen = db.prepare(
      'INSERT INTO fahrzeuge (kennzeichen, typ, kapazitaet_kg, status, tuev_bis) VALUES (?, ?, ?, ?, ?)',
    );
    FAHRZEUGE.forEach(([kennzeichen, typ, kapazitaet, tuevTage], i) => {
      const status = i < 3 ? 'im_einsatz' : i === 7 ? 'werkstatt' : 'verfuegbar';
      fahrzeugEinfuegen.run(kennzeichen, typ, kapazitaet, status, tageVor(-tuevTage));
    });

    const fahrerEinfuegen = db.prepare('INSERT INTO fahrer (name, telefon, status) VALUES (?, ?, ?)');
    FAHRER.forEach((f) => fahrerEinfuegen.run(...f));

    // --- Touren ---------------------------------------------------------
    const tourEinfuegen = db.prepare(
      'INSERT INTO touren (bezeichnung, datum, fahrzeug_id, fahrer_id, status) VALUES (?, ?, ?, ?, ?)',
    );
    const tourNord = Number(tourEinfuegen.run('Tour Nord – Hamburg / Lübeck', tageVor(0), 1, 1, 'unterwegs').lastInsertRowid);
    const tourWest = Number(tourEinfuegen.run('Tour West – Köln / Dortmund', tageVor(0), 2, 2, 'unterwegs').lastInsertRowid);
    const tourSued = Number(tourEinfuegen.run('Tour Süd – München / Stuttgart', tageVor(-1), 3, 3, 'geplant').lastInsertRowid);

    // --- Aufträge -------------------------------------------------------
    const auftragEinfuegen = db.prepare(
      `INSERT INTO auftraege (nummer, kunde_id, status, ziel_ort, gesamtwert, erstellt_am, liefertermin, geliefert_am, tour_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    );
    const positionEinfuegen = db.prepare(
      'INSERT INTO auftrag_positionen (auftrag_id, artikel_id, menge, einzelpreis) VALUES (?, ?, ?, ?)',
    );
    let laufendeNummer = 10000;

    const neuerAuftrag = (alterTage: number, status: AuftragStatus, optionen: { tourId?: number; liefertermin?: string } = {}) => {
      const kundeId = zahl(1, KUNDEN.length);
      const erstellt = new Date(heute);
      erstellt.setDate(erstellt.getDate() - alterTage);
      erstellt.setHours(zahl(7, 17), zahl(0, 59));

      const frist = zahl(2, 5);
      const liefertermin = optionen.liefertermin ?? tageVor(alterTage - frist, heute);

      let geliefertAm: string | null = null;
      if (status === 'geliefert') {
        // etwa 88 % pünktlich, der Rest ein Tag zu spät
        const verspaetet = zufall() < 0.12;
        const dauer = Math.max(0, Math.min(alterTage, frist + (verspaetet ? 1 : -zahl(0, 1))));
        geliefertAm = tageVor(alterTage - dauer, heute);
      }

      // 1 bis 4 Positionen
      const positionen = Array.from({ length: zahl(1, 4) }, () => {
        const artikelId = zahl(1, ARTIKEL.length);
        return { artikelId, menge: zahl(1, 12), preis: ARTIKEL[artikelId - 1][6] };
      });
      const gesamt = Math.round(positionen.reduce((s, p) => s + p.menge * p.preis, 0) * 100) / 100;

      laufendeNummer += 1;
      const auftragId = Number(
        auftragEinfuegen.run(
          `AU-${laufendeNummer}`,
          kundeId,
          status,
          KUNDEN[kundeId - 1][1],
          gesamt,
          zeitstempel(erstellt),
          liefertermin,
          geliefertAm,
          optionen.tourId ?? null,
        ).lastInsertRowid,
      );
      positionen.forEach((p) => positionEinfuegen.run(auftragId, p.artikelId, p.menge, p.preis));
    };

    // 60 Tage Historie: ältere Aufträge sind fast alle geliefert
    for (let alter = 60; alter >= 2; alter--) {
      const wochentag = new Date(heute.getTime() - alter * 86400000).getDay();
      const anzahl = wochentag === 0 || wochentag === 6 ? zahl(0, 1) : zahl(3, 7);
      for (let i = 0; i < anzahl; i++) {
        neuerAuftrag(alter, zufall() < 0.05 ? 'storniert' : 'geliefert');
      }
    }
    // Gestern und heute: noch in Arbeit
    for (let i = 0; i < 6; i++) neuerAuftrag(1, wahl<AuftragStatus>(['neu', 'in_bearbeitung', 'in_bearbeitung', 'versandbereit']), { liefertermin: tageVor(-zahl(1, 3)) });
    for (let i = 0; i < 2; i++) neuerAuftrag(1, 'geliefert');
    for (let i = 0; i < 9; i++) neuerAuftrag(0, wahl<AuftragStatus>(['neu', 'neu', 'in_bearbeitung']), { liefertermin: tageVor(-zahl(2, 5)) });
    // Überfällige Aufträge (Liefertermin liegt in der Vergangenheit)
    neuerAuftrag(5, 'in_bearbeitung', { liefertermin: tageVor(2) });
    neuerAuftrag(6, 'versandbereit', { liefertermin: tageVor(1) });
    // Aufträge, die gerade auf Tour sind
    for (let i = 0; i < 4; i++) neuerAuftrag(2, 'unterwegs', { tourId: tourNord, liefertermin: tageVor(-1) });
    for (let i = 0; i < 3; i++) neuerAuftrag(2, 'unterwegs', { tourId: tourWest, liefertermin: tageVor(0) });
    // Aufträge für die geplante Tour Süd und zwei ohne Tour
    for (let i = 0; i < 3; i++) neuerAuftrag(1, 'versandbereit', { tourId: tourSued, liefertermin: tageVor(-2) });
    for (let i = 0; i < 2; i++) neuerAuftrag(1, 'versandbereit', { liefertermin: tageVor(-2) });

    db.exec('COMMIT');
  } catch (fehler) {
    db.exec('ROLLBACK');
    throw fehler;
  }
}
