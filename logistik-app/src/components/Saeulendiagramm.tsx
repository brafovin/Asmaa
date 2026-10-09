import { useState } from 'react';
import type { TagesWert } from '../../shared/types.ts';
import { formatDatum, wochentagKurz } from '../format.ts';
import { useBreite } from './useBreite.ts';

const HOEHE = 300;
const R = { oben: 12, rechts: 8, unten: 40, links: 34 };

/** Oben abgerundete Säule, unten gerade (liegt auf der Grundlinie). */
function saeulenPfad(x: number, y: number, b: number, h: number) {
  const r = Math.min(4, b / 2, h);
  return `M${x},${y + h} V${y + r} Q${x},${y} ${x + r},${y} H${x + b - r} Q${x + b},${y} ${x + b},${y + r} V${y + h} Z`;
}

/** Oberste Linie: ein Vielfaches von 4, damit alle Hilfslinien ganze Zahlen sind. */
function schoeneObergrenze(max: number) {
  return Math.max(4, Math.ceil(max / 4) * 4);
}

export default function Saeulendiagramm({ daten }: { daten: TagesWert[] }) {
  const [ref, breite] = useBreite<HTMLDivElement>();
  const [aktiv, setAktiv] = useState<number | null>(null);

  const innen = { b: Math.max(0, breite - R.links - R.rechts), h: HOEHE - R.oben - R.unten };
  const max = schoeneObergrenze(Math.max(...daten.map((d) => d.anzahl), 1));
  const schritt = innen.b / daten.length;
  const saeulenBreite = Math.max(6, Math.min(34, schritt - 8));
  const hilfslinien = [0, 0.25, 0.5, 0.75, 1].map((f) => Math.round(max * f));
  const y = (wert: number) => R.oben + innen.h - (wert / max) * innen.h;
  const dichteBeschriftung = schritt < 34; // auf schmalen Bildschirmen nur jede 2. Beschriftung

  const tipp = aktiv != null ? daten[aktiv] : null;
  const tippX = aktiv != null ? R.links + schritt * aktiv + schritt / 2 : 0;

  return (
    <div ref={ref} className="diagramm" style={{ height: HOEHE }}>
      {breite > 0 && (
        <svg width={breite} height={HOEHE} role="img" aria-label="Säulendiagramm: Aufträge pro Tag in den letzten 14 Tagen">
          {hilfslinien.map((wert) => (
            <g key={wert}>
              <line x1={R.links} x2={breite - R.rechts} y1={y(wert)} y2={y(wert)} className="achse-linie" />
              <text x={R.links - 8} y={y(wert) + 4} textAnchor="end" className="achse-text">{wert}</text>
            </g>
          ))}
          {daten.map((d, i) => {
            const mitteX = R.links + schritt * i + schritt / 2;
            const h = (d.anzahl / max) * innen.h;
            const zeigeLabel = !dichteBeschriftung || i % 2 === daten.length % 2 ? true : false;
            return (
              <g key={d.datum}>
                {d.anzahl > 0 && (
                  <path
                    d={saeulenPfad(mitteX - saeulenBreite / 2, y(d.anzahl), saeulenBreite, h)}
                    className={`saeule ${aktiv === i ? 'aktiv' : ''}`}
                  />
                )}
                {zeigeLabel && (
                  <>
                    <text x={mitteX} y={HOEHE - 22} textAnchor="middle" className="achse-text">{wochentagKurz(d.datum)}</text>
                    <text x={mitteX} y={HOEHE - 8} textAnchor="middle" className="achse-text achse-text-leise">{d.datum.slice(8)}.{d.datum.slice(5, 7)}.</text>
                  </>
                )}
                {/* Große, unsichtbare Fläche zum Darüberfahren und Antippen */}
                <rect
                  x={R.links + schritt * i}
                  y={R.oben}
                  width={schritt}
                  height={innen.h + R.unten}
                  fill="transparent"
                  tabIndex={0}
                  role="presentation"
                  onMouseEnter={() => setAktiv(i)}
                  onMouseLeave={() => setAktiv(null)}
                  onFocus={() => setAktiv(i)}
                  onBlur={() => setAktiv(null)}
                  onClick={() => setAktiv(i)}
                />
              </g>
            );
          })}
        </svg>
      )}
      {tipp && (
        <div className="tooltip" style={{ left: Math.min(Math.max(tippX, 70), breite - 70), top: Math.max(0, y(tipp.anzahl) - 62) }}>
          <div className="tooltip-titel">{wochentagKurz(tipp.datum)}, {formatDatum(tipp.datum)}</div>
          <div><strong>{tipp.anzahl}</strong> {tipp.anzahl === 1 ? 'Auftrag' : 'Aufträge'}</div>
        </div>
      )}
      <table className="nur-screenreader">
        <caption>Aufträge pro Tag</caption>
        <thead><tr><th>Datum</th><th>Aufträge</th></tr></thead>
        <tbody>{daten.map((d) => <tr key={d.datum}><td>{formatDatum(d.datum)}</td><td>{d.anzahl}</td></tr>)}</tbody>
      </table>
    </div>
  );
}
