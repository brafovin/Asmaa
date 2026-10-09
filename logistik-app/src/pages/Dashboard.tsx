import { Link } from 'react-router-dom';
import {
  AlertOctagon,
  AlertTriangle,
  CalendarCheck,
  CheckCircle2,
  Clock,
  ClipboardList,
  Euro,
  Info,
  PackageCheck,
  RefreshCw,
  Truck,
} from 'lucide-react';
import { useApi } from '../api.ts';
import { begruessung, formatDatum, formatEuro, formatEuroGenau, formatZahl, prozentAenderung } from '../format.ts';
import type { DashboardDaten, WarnStufe } from '../../shared/types.ts';
import KennzahlKarte from '../components/KennzahlKarte.tsx';
import Saeulendiagramm from '../components/Saeulendiagramm.tsx';
import Ringdiagramm from '../components/Ringdiagramm.tsx';
import StatusBadge from '../components/StatusBadge.tsx';

const WARN_ICON = { kritisch: AlertOctagon, warnung: AlertTriangle, info: Info } as const;
const WARN_LABEL: Record<WarnStufe, string> = { kritisch: 'Kritisch', warnung: 'Warnung', info: 'Hinweis' };

export default function Dashboard() {
  const { daten, laedt, fehler, neuLaden } = useApi<DashboardDaten>('/api/dashboard');

  if (!daten) {
    return (
      <div className="karte zentriert-karte">
        {fehler ? (
          <>
            <AlertTriangle size={30} className="fehler-icon" />
            <h2>Der Server ist nicht erreichbar</h2>
            <p className="gedaempft">{fehler}. Läuft das Programm noch? Starte es mit <code>npm run dev</code>.</p>
            <button className="btn btn-primaer" onClick={neuLaden}>Erneut versuchen</button>
          </>
        ) : (
          <p className="gedaempft">Daten werden geladen …</p>
        )}
      </div>
    );
  }

  const k = daten.kennzahlen;
  const heute = new Date().toLocaleDateString('de-DE', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const kritisch = daten.warnungen.filter((w) => w.stufe === 'kritisch').length;

  return (
    <div className={`seite ${laedt ? 'aktualisiert' : ''}`}>
      <div className="seitenkopf">
        <div>
          <h1>{begruessung()}!</h1>
          <p className="gedaempft">{heute} – so steht es heute um deine Logistik.</p>
        </div>
        <button className="btn btn-sekundaer" onClick={neuLaden} disabled={laedt}>
          <RefreshCw size={16} className={laedt ? 'dreht' : ''} /> Aktualisieren
        </button>
      </div>

      <div className="raster kennzahlen">
        <KennzahlKarte titel="Aufträge heute" wert={formatZahl(k.auftraegeHeute)} icon={ClipboardList}
          aenderung={prozentAenderung(k.auftraegeHeute, k.auftraegeGestern)} vergleich="zu gestern" />
        <KennzahlKarte titel="Offene Aufträge" wert={formatZahl(k.offeneAuftraege)} icon={PackageCheck}
          hinweis="neu, in Bearbeitung oder versandbereit" />
        <KennzahlKarte titel="Unterwegs" wert={formatZahl(k.unterwegs)} icon={Truck}
          hinweis={`${daten.aktiveTouren.filter((t) => t.status === 'unterwegs').length} aktive Touren`} />
        <KennzahlKarte titel="Umsatz (30 Tage)" wert={formatEuro(k.umsatz30Tage)} icon={Euro}
          aenderung={prozentAenderung(k.umsatz30Tage, k.umsatzVorperiode)} vergleich="zu den 30 Tagen davor" />
        <KennzahlKarte titel="Pünktlichkeit" wert={k.puenktlichkeit == null ? '–' : `${k.puenktlichkeit.toLocaleString('de-DE')} %`} icon={Clock}
          hinweis="Lieferungen im Zeitraum, letzte 30 Tage" />
        <KennzahlKarte titel="Freie Fahrzeuge" wert={`${k.fahrzeugeVerfuegbar} / ${k.fahrzeugeGesamt}`} icon={CalendarCheck}
          hinweis="sofort verfügbar" />
      </div>

      <div className="raster zwei-spalten">
        <section className="karte">
          <header className="karte-kopf">
            <div>
              <h2>Aufträge pro Tag</h2>
              <p className="gedaempft">Neue Aufträge der letzten 14 Tage</p>
            </div>
          </header>
          <Saeulendiagramm daten={daten.auftraegeProTag} />
        </section>

        <section className="karte">
          <header className="karte-kopf">
            <div>
              <h2>Auftragsstatus</h2>
              <p className="gedaempft">Aufträge der letzten 30 Tage</p>
            </div>
          </header>
          <Ringdiagramm daten={daten.statusVerteilung} />
        </section>
      </div>

      <div className="raster zwei-spalten-gleich">
        <section className="karte">
          <header className="karte-kopf">
            <div>
              <h2>Warnmeldungen</h2>
              <p className="gedaempft">
                {daten.warnungen.length === 0 ? 'Alles in Ordnung' : `${daten.warnungen.length} Meldungen, davon ${kritisch} kritisch`}
              </p>
            </div>
          </header>
          {daten.warnungen.length === 0 ? (
            <div className="leer"><CheckCircle2 size={28} /> Keine Warnungen – alles läuft rund.</div>
          ) : (
            <ul className="warnliste">
              {daten.warnungen.map((w) => {
                const Icon = WARN_ICON[w.stufe];
                return (
                  <li key={w.id}>
                    <Link to={w.link} className={`warnung warnung-${w.stufe}`}>
                      <span className="warnung-icon"><Icon size={18} /></span>
                      <span className="warnung-text">
                        <span className="warnung-titel">{w.titel}</span>
                        <span className="gedaempft">{w.text}</span>
                      </span>
                      <span className="warnung-stufe">{WARN_LABEL[w.stufe]}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section className="karte">
          <header className="karte-kopf">
            <div>
              <h2>Aktive Touren</h2>
              <p className="gedaempft">Geplant und unterwegs</p>
            </div>
          </header>
          {daten.aktiveTouren.length === 0 ? (
            <div className="leer"><Truck size={28} /> Aktuell sind keine Touren geplant.</div>
          ) : (
            <ul className="tourenliste">
              {daten.aktiveTouren.map((t) => (
                <li key={t.id} className="tour">
                  <span className="tour-icon"><Truck size={18} /></span>
                  <div className="tour-info">
                    <div className="tour-name">{t.bezeichnung}</div>
                    <div className="gedaempft">{t.fahrer} · {t.kennzeichen} · {t.stopps} {t.stopps === 1 ? 'Stopp' : 'Stopps'}</div>
                  </div>
                  <span className={`tour-status tour-${t.status}`}>
                    {t.status === 'unterwegs' ? 'Unterwegs' : `Geplant · ${formatDatum(t.datum).slice(0, 5)}`}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="karte">
        <header className="karte-kopf">
          <div>
            <h2>Letzte Aufträge</h2>
            <p className="gedaempft">Die 8 neuesten Aufträge</p>
          </div>
          <Link to="/auftraege" className="link">Alle ansehen</Link>
        </header>
        <div className="tabelle-wrap">
          <table className="tabelle">
            <thead>
              <tr>
                <th>Auftrag</th>
                <th>Kunde</th>
                <th className="nur-gross">Ziel</th>
                <th>Status</th>
                <th className="nur-gross">Liefertermin</th>
                <th className="rechts">Wert</th>
              </tr>
            </thead>
            <tbody>
              {daten.letzteAuftraege.map((a) => (
                <tr key={a.id}>
                  <td className="fett">{a.nummer}</td>
                  <td>{a.kunde}</td>
                  <td className="nur-gross">{a.zielOrt}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td className="nur-gross">{formatDatum(a.liefertermin)}</td>
                  <td className="rechts zahl">{formatEuroGenau(a.gesamtwert)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
