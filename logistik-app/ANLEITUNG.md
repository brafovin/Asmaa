# LogiFlow – Anleitung für Anfänger

LogiFlow ist deine Logistik-App (Aufträge, Lager, Transport …). Dieser erste Schritt enthält
die **Startseite (Dashboard)**, das **Menü**, den **hellen/dunklen Modus**, die **Handy-Ansicht**
und die **Datenbank** mit Beispieldaten.

Alles ist kostenlos. Du brauchst **kein Konto** und **keine Anmeldung**. Die Daten liegen
in einer Datei auf deinem eigenen Computer (`data/logistik.db`).

---

## Schritt A – Einmalig: Node.js installieren

Node.js ist das Programm, das deine App ausführt. Du installierst es wie jedes andere Programm.

1. Öffne im Browser: https://nodejs.org
2. Klicke auf den grünen Knopf **„LTS“** (Download) und öffne die heruntergeladene Datei.
3. Klicke dich mit **„Weiter“ / „Next“** durch die Installation und lasse alle Voreinstellungen stehen.
4. Starte danach deinen Computer **nicht** neu, aber schließe alle offenen Terminal-Fenster.

**Prüfen, ob es geklappt hat:**

- Windows: Drücke die Windows-Taste, tippe `PowerShell`, drücke Enter.
- Mac: Drücke `Cmd + Leertaste`, tippe `Terminal`, drücke Enter.

Tippe in das Fenster (danach Enter):

```
node -v
```

Es muss eine Zahl ab **v22** erscheinen, z. B. `v24.1.0`. Ist die Zahl kleiner, installiere
die aktuelle LTS-Version von nodejs.org.

## Schritt B – Den Programmordner bekommen

Der Code liegt auf GitHub im Repository `brafovin/asmaa`, Branch `claude/happy-feynman-9qyqey`,
im Ordner `logistik-app`.

**Einfachster Weg (ohne Git):**

1. Öffne https://github.com/brafovin/asmaa/tree/claude/happy-feynman-9qyqey
2. Klicke auf den grünen Knopf **„Code“** → **„Download ZIP“**.
3. Entpacke die ZIP-Datei (Rechtsklick → „Alle extrahieren“ / Doppelklick auf dem Mac).
4. Öffne den entpackten Ordner und darin den Ordner **`logistik-app`**.

## Schritt C – App installieren und starten

1. **Terminal im Ordner öffnen**
   - Windows: Öffne den Ordner `logistik-app` im Explorer, klicke oben in die Adresszeile,
     tippe `powershell` und drücke Enter.
   - Mac: Rechtsklick auf den Ordner `logistik-app` → **„Neues Terminal beim Ordner“**.

2. **Pakete installieren** (nur beim ersten Mal, dauert 1–2 Minuten):

   ```
   npm install
   ```

3. **App starten:**

   ```
   npm run dev
   ```

4. Öffne im Browser: **http://localhost:5173**

Du siehst jetzt das Dashboard. Beim allerersten Start werden automatisch Beispieldaten angelegt.

**Beenden:** Im Terminal `Strg + C` drücken.
**Später wieder starten:** Terminal im Ordner öffnen und nur `npm run dev` eingeben.

## Auf dem Handy ansehen (im selben WLAN)

1. Starte die App wie oben am PC.
2. Im Terminal steht unter „Network“ eine Adresse wie `http://192.168.0.23:5173`.
3. Gib genau diese Adresse im Browser deines Handys ein.

## Beispieldaten zurücksetzen

Wenn du wieder frische Beispieldaten möchtest: App beenden (`Strg + C`), dann

```
npm run db:reset
npm run dev
```

## Wie ist die App aufgebaut?

```
logistik-app/
├── server/            Das Backend (Server + Datenbank)
│   ├── index.ts         Startet den Server
│   ├── db.ts            Öffnet die Datenbank (SQLite-Datei)
│   ├── schema.ts        Alle Tabellen
│   ├── seed.ts          Beispieldaten
│   └── routes/dashboard.ts   Berechnet die Zahlen für das Dashboard
├── src/               Die Oberfläche (React + TypeScript)
│   ├── pages/           Dashboard und Platzhalter für kommende Bereiche
│   ├── components/      Menü, Karten, Diagramme, Tabellen
│   └── styles.css       Das gesamte Design (Farben, Hell/Dunkel, Handy)
├── shared/types.ts    Typen, die Server und Oberfläche gemeinsam nutzen
├── data/              Hier liegt deine Datenbank (wird automatisch erstellt)
└── vorschau/          Screenshots des Designs
```

## Später online stellen (Überblick)

Das machen wir erst, wenn die App fertig ist. Grob:

1. Mit `npm run build` wird die Oberfläche gebaut; danach liefert `npm start` alles aus einem Server aus.
2. Ein Hoster, der Node.js-Programme ausführt (z. B. Render oder Railway), startet diesen Befehl.
   Wichtig: Die Datenbank ist eine Datei, deshalb braucht der Hoster einen **dauerhaften Speicher**
   („Persistent Disk“ / „Volume“), meist ein kleiner Betrag pro Monat.
3. Vor dem Online-Gang bauen wir eine **Anmeldung** (Benutzername + Passwort) ein.
   Das gehört zum Bereich „Einstellungen“.

Schritt für Schritt erkläre ich das, wenn es so weit ist.
