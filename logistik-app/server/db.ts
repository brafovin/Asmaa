import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { schemaSql } from './schema.ts';
import { befuelleBeispieldaten } from './seed.ts';

// Die Datenbank ist eine einzelne Datei: data/logistik.db
// Sie bleibt erhalten, auch wenn du den Server beendest oder den PC ausschaltest.
export const datenOrdner = process.env.DATA_DIR ?? path.resolve('data');
fs.mkdirSync(datenOrdner, { recursive: true });

export const dbDatei = path.join(datenOrdner, 'logistik.db');
export const db = new DatabaseSync(dbDatei);

db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec(schemaSql);

// Beim allerersten Start (leere Datenbank) werden Beispieldaten eingefügt,
// damit das Dashboard sofort mit Leben gefüllt ist.
const { anzahl } = db.prepare('SELECT COUNT(*) AS anzahl FROM kunden').get() as { anzahl: number };
if (anzahl === 0) {
  befuelleBeispieldaten(db);
  console.log('Beispieldaten wurden in die neue Datenbank eingefügt.');
}
