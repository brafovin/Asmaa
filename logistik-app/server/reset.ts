// Löscht die Datenbankdatei, damit beim nächsten Start frische Beispieldaten entstehen.
// Aufruf:  npm run db:reset
import fs from 'node:fs';
import path from 'node:path';

const ordner = process.env.DATA_DIR ?? path.resolve('data');
for (const endung of ['', '-wal', '-shm']) {
  fs.rmSync(path.join(ordner, `logistik.db${endung}`), { force: true });
}
console.log('Datenbank wurde gelöscht. Beim nächsten Start werden neue Beispieldaten angelegt.');
