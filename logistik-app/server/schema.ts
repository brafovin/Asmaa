// Alle Tabellen der Anwendung. "IF NOT EXISTS" bedeutet: Bereits vorhandene
// Tabellen (und ihre Daten) bleiben unverändert.

export const schemaSql = `
CREATE TABLE IF NOT EXISTS kunden (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  name        TEXT NOT NULL,
  ort         TEXT NOT NULL,
  email       TEXT,
  telefon     TEXT,
  erstellt_am TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS artikel (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  artikelnummer  TEXT NOT NULL UNIQUE,
  bezeichnung    TEXT NOT NULL,
  kategorie      TEXT NOT NULL,
  einheit        TEXT NOT NULL DEFAULT 'Stk',
  bestand        INTEGER NOT NULL DEFAULT 0 CHECK (bestand >= 0),
  mindestbestand INTEGER NOT NULL DEFAULT 0,
  preis          REAL NOT NULL DEFAULT 0,
  lagerplatz     TEXT
);

CREATE TABLE IF NOT EXISTS fahrzeuge (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  kennzeichen    TEXT NOT NULL UNIQUE,
  typ            TEXT NOT NULL,
  kapazitaet_kg  INTEGER NOT NULL,
  status         TEXT NOT NULL DEFAULT 'verfuegbar'
                 CHECK (status IN ('verfuegbar', 'im_einsatz', 'werkstatt')),
  tuev_bis       TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fahrer (
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  name     TEXT NOT NULL,
  telefon  TEXT,
  status   TEXT NOT NULL DEFAULT 'verfuegbar'
           CHECK (status IN ('verfuegbar', 'im_einsatz', 'abwesend'))
);

CREATE TABLE IF NOT EXISTS touren (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  bezeichnung TEXT NOT NULL,
  datum       TEXT NOT NULL,
  fahrzeug_id INTEGER REFERENCES fahrzeuge(id),
  fahrer_id   INTEGER REFERENCES fahrer(id),
  status      TEXT NOT NULL DEFAULT 'geplant'
              CHECK (status IN ('geplant', 'unterwegs', 'abgeschlossen'))
);

CREATE TABLE IF NOT EXISTS auftraege (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  nummer        TEXT NOT NULL UNIQUE,
  kunde_id      INTEGER NOT NULL REFERENCES kunden(id),
  status        TEXT NOT NULL DEFAULT 'neu'
                CHECK (status IN ('neu', 'in_bearbeitung', 'versandbereit', 'unterwegs', 'geliefert', 'storniert')),
  ziel_ort      TEXT NOT NULL,
  gesamtwert    REAL NOT NULL DEFAULT 0,
  erstellt_am   TEXT NOT NULL,
  liefertermin  TEXT NOT NULL,
  geliefert_am  TEXT,
  tour_id       INTEGER REFERENCES touren(id)
);

CREATE TABLE IF NOT EXISTS auftrag_positionen (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  auftrag_id   INTEGER NOT NULL REFERENCES auftraege(id) ON DELETE CASCADE,
  artikel_id   INTEGER NOT NULL REFERENCES artikel(id),
  menge        INTEGER NOT NULL CHECK (menge > 0),
  einzelpreis  REAL NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_auftraege_status ON auftraege(status);
CREATE INDEX IF NOT EXISTS idx_auftraege_erstellt ON auftraege(erstellt_am);
CREATE INDEX IF NOT EXISTS idx_positionen_auftrag ON auftrag_positionen(auftrag_id);
`;
