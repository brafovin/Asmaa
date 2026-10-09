import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { dbDatei } from './db.ts';
import { dashboardRouter } from './routes/dashboard.ts';

const app = express();
app.use(express.json());

// --- Schnittstellen (API) ----------------------------------------------------
app.get('/api/health', (_anfrage, antwort) => antwort.json({ status: 'ok' }));
app.use('/api/dashboard', dashboardRouter);
app.use('/api', (_anfrage, antwort) => antwort.status(404).json({ fehler: 'Unbekannte Schnittstelle' }));

// --- Fertige Oberfläche ausliefern (nur nach "npm run build" / beim Online-Betrieb)
const dist = path.resolve('dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((_anfrage, antwort) => antwort.sendFile(path.join(dist, 'index.html')));
}

const port = Number(process.env.PORT ?? 3001);
app.listen(port, '0.0.0.0', () => {
  console.log(`LogiFlow-Server läuft auf Port ${port}`);
  console.log(`Datenbank: ${dbDatei}`);
});
