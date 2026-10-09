import { useState } from 'react';
import { AUFTRAG_STATUS_LABEL, type StatusAnzahl } from '../../shared/types.ts';

const GROESSE = 190;
const MITTE = GROESSE / 2;
const RADIUS = 72;
const DICKE = 24;
const LUECKE = 2.4; // Grad Abstand zwischen den Segmenten

// Feste Farbe pro Status (folgt dem Eintrag, nicht der Rangfolge)
const FARBE_KLASSE: Record<string, string> = {
  geliefert: 'serie-1',
  unterwegs: 'serie-2',
  versandbereit: 'serie-3',
  in_bearbeitung: 'serie-4',
  neu: 'serie-5',
  storniert: 'serie-grau',
};
const REIHENFOLGE = ['geliefert', 'unterwegs', 'versandbereit', 'in_bearbeitung', 'neu', 'storniert'];

function bogen(startWinkel: number, endWinkel: number) {
  const punkt = (w: number) => {
    const rad = ((w - 90) * Math.PI) / 180;
    return [MITTE + RADIUS * Math.cos(rad), MITTE + RADIUS * Math.sin(rad)];
  };
  const [x1, y1] = punkt(startWinkel);
  const [x2, y2] = punkt(endWinkel);
  const gross = endWinkel - startWinkel > 180 ? 1 : 0;
  return `M${x1},${y1} A${RADIUS},${RADIUS} 0 ${gross} 1 ${x2},${y2}`;
}

export default function Ringdiagramm({ daten }: { daten: StatusAnzahl[] }) {
  const [aktiv, setAktiv] = useState<string | null>(null);
  const sortiert = [...daten].sort((a, b) => REIHENFOLGE.indexOf(a.status) - REIHENFOLGE.indexOf(b.status));
  const summe = sortiert.reduce((s, d) => s + d.anzahl, 0);
  const gewaehlt = sortiert.find((d) => d.status === aktiv);

  let winkel = 0;
  const segmente = sortiert.map((d) => {
    const spanne = (d.anzahl / summe) * 360;
    const start = winkel;
    winkel += spanne;
    return { ...d, start, ende: winkel, spanne };
  });

  return (
    <div className="ring-bereich">
      <div className="ring-grafik">
        <svg width={GROESSE} height={GROESSE} viewBox={`0 0 ${GROESSE} ${GROESSE}`} role="img" aria-label="Ringdiagramm: Verteilung der Aufträge nach Status">
          {segmente.map((s) => {
            const luecke = s.spanne > LUECKE * 2 ? LUECKE / 2 : 0;
            return (
              <path
                key={s.status}
                d={bogen(s.start + luecke, Math.max(s.start + luecke + 0.5, s.ende - luecke))}
                className={`ring-segment ${FARBE_KLASSE[s.status]} ${aktiv && aktiv !== s.status ? 'gedimmt' : ''}`}
                strokeWidth={aktiv === s.status ? DICKE + 4 : DICKE}
                onMouseEnter={() => setAktiv(s.status)}
                onMouseLeave={() => setAktiv(null)}
              />
            );
          })}
        </svg>
        <div className="ring-mitte">
          <div className="ring-zahl">{gewaehlt ? gewaehlt.anzahl : summe}</div>
          <div className="ring-text">{gewaehlt ? AUFTRAG_STATUS_LABEL[gewaehlt.status] : 'Aufträge'}</div>
        </div>
      </div>

      <ul className="legende">
        {segmente.map((s) => (
          <li
            key={s.status}
            className={aktiv === s.status ? 'aktiv' : ''}
            onMouseEnter={() => setAktiv(s.status)}
            onMouseLeave={() => setAktiv(null)}
          >
            <span className={`legende-punkt ${FARBE_KLASSE[s.status]}`} aria-hidden="true" />
            <span className="legende-name">{AUFTRAG_STATUS_LABEL[s.status]}</span>
            <span className="legende-wert">{s.anzahl}</span>
            <span className="legende-prozent">{Math.round((s.anzahl / summe) * 100)} %</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
