import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Menu, Moon, Package, Sun, X } from 'lucide-react';
import { ALLE_EINTRAEGE, NAVIGATION } from '../navigation.ts';
import { useTheme } from '../theme.tsx';

interface Props {
  children: ReactNode;
  menueOffen: boolean;
  setMenueOffen: (offen: boolean) => void;
}

export default function Layout({ children, menueOffen, setMenueOffen }: Props) {
  const { modus, umschalten } = useTheme();
  const { pathname } = useLocation();
  const aktuell = ALLE_EINTRAEGE.find((e) => e.pfad === pathname);

  return (
    <div className="app">
      <aside className={`sidebar ${menueOffen ? 'offen' : ''}`} aria-label="Hauptmenü">
        <div className="sidebar-kopf">
          <div className="logo">
            <span className="logo-icon"><Package size={20} strokeWidth={2.2} /></span>
            <span className="logo-text">LogiFlow</span>
          </div>
          <button className="icon-btn nur-mobil sidebar-schliessen" onClick={() => setMenueOffen(false)} aria-label="Menü schließen">
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {NAVIGATION.map((gruppe) => (
            <div className="nav-gruppe" key={gruppe.titel}>
              <div className="nav-titel">{gruppe.titel}</div>
              {gruppe.eintraege.map((e) => (
                <NavLink key={e.pfad} to={e.pfad} end className={({ isActive }) => `nav-link ${isActive ? 'aktiv' : ''}`}>
                  <e.icon size={19} strokeWidth={1.9} />
                  <span className="nav-name">{e.name}</span>
                  {!e.fertig && <span className="nav-bald">Bald</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-fuss">
          <div className="avatar" aria-hidden="true">AD</div>
          <div>
            <div className="fuss-name">Administrator</div>
            <div className="fuss-rolle">Lagerhaus Nord</div>
          </div>
        </div>
      </aside>

      {menueOffen && <div className="overlay" onClick={() => setMenueOffen(false)} aria-hidden="true" />}

      <div className="haupt">
        <header className="topbar">
          <button className="icon-btn nur-mobil" onClick={() => setMenueOffen(true)} aria-label="Menü öffnen">
            <Menu size={22} />
          </button>
          <div className="topbar-titel">{aktuell?.name ?? 'Seite nicht gefunden'}</div>
          <div className="topbar-aktionen">
            <button
              className="icon-btn"
              onClick={umschalten}
              aria-label={modus === 'hell' ? 'Dunklen Modus einschalten' : 'Hellen Modus einschalten'}
              title={modus === 'hell' ? 'Dunkler Modus' : 'Heller Modus'}
            >
              {modus === 'hell' ? <Moon size={19} /> : <Sun size={19} />}
            </button>
          </div>
        </header>
        <main className="inhalt">{children}</main>
      </div>
    </div>
  );
}
