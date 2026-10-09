import { ArrowDownRight, ArrowUpRight, Minus, type LucideIcon } from 'lucide-react';

interface Props {
  titel: string;
  wert: string;
  icon: LucideIcon;
  /** Veränderung in Prozent (z. B. 12.4) – null blendet den Hinweis aus */
  aenderung?: number | null;
  vergleich?: string;
  /** Freitext statt Veränderung, z. B. „von 8 Fahrzeugen“ */
  hinweis?: string;
}

export default function KennzahlKarte({ titel, wert, icon: Icon, aenderung, vergleich, hinweis }: Props) {
  const richtung = aenderung == null ? null : aenderung > 0 ? 'hoch' : aenderung < 0 ? 'runter' : 'gleich';
  return (
    <section className="karte kennzahl">
      <div className="kennzahl-kopf">
        <span className="kennzahl-titel">{titel}</span>
        <span className="kennzahl-icon"><Icon size={19} strokeWidth={1.9} /></span>
      </div>
      <div className="kennzahl-wert">{wert}</div>
      <div className="kennzahl-fuss">
        {richtung && (
          <span className={`delta delta-${richtung}`}>
            {richtung === 'hoch' ? <ArrowUpRight size={14} /> : richtung === 'runter' ? <ArrowDownRight size={14} /> : <Minus size={14} />}
            {aenderung! > 0 ? '+' : ''}
            {aenderung!.toLocaleString('de-DE')} %
          </span>
        )}
        {vergleich && richtung && <span className="gedaempft">{vergleich}</span>}
        {hinweis && <span className="gedaempft">{hinweis}</span>}
      </div>
    </section>
  );
}
