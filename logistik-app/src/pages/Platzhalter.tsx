import { Link } from 'react-router-dom';
import { Hammer } from 'lucide-react';
import type { NavEintrag } from '../navigation.ts';

export default function Platzhalter({ eintrag }: { eintrag?: NavEintrag }) {
  if (!eintrag) {
    return (
      <div className="karte zentriert-karte">
        <h2>Seite nicht gefunden</h2>
        <Link to="/" className="btn btn-primaer">Zum Dashboard</Link>
      </div>
    );
  }
  const Icon = eintrag.icon;
  return (
    <div className="seite">
      <div className="seitenkopf">
        <div>
          <h1>{eintrag.name}</h1>
          <p className="gedaempft">{eintrag.beschreibung}</p>
        </div>
      </div>
      <div className="karte zentriert-karte">
        <span className="platzhalter-icon"><Icon size={30} /></span>
        <h2>Dieser Bereich wird als Nächstes gebaut</h2>
        <p className="gedaempft">Hier entsteht Schritt für Schritt Folgendes:</p>
        <ul className="funktionsliste">
          {eintrag.funktionen.map((f) => (
            <li key={f}><Hammer size={15} /> {f}</li>
          ))}
        </ul>
        <Link to="/" className="btn btn-sekundaer">Zurück zum Dashboard</Link>
      </div>
    </div>
  );
}
