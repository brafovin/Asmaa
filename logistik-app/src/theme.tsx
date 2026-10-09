import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

type Modus = 'hell' | 'dunkel';

interface ThemeWert {
  modus: Modus;
  umschalten: () => void;
}

const ThemeKontext = createContext<ThemeWert>({ modus: 'hell', umschalten: () => {} });
export const useTheme = () => useContext(ThemeKontext);

const SCHLUESSEL = 'logiflow-modus';

function startModus(): Modus {
  try {
    const gespeichert = localStorage.getItem(SCHLUESSEL);
    if (gespeichert === 'hell' || gespeichert === 'dunkel') return gespeichert;
  } catch {
    /* Browser-Speicher nicht verfügbar – dann gilt die System-Einstellung */
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dunkel' : 'hell';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [modus, setModus] = useState<Modus>(startModus);

  useEffect(() => {
    document.documentElement.dataset.theme = modus === 'dunkel' ? 'dark' : 'light';
    try {
      localStorage.setItem(SCHLUESSEL, modus);
    } catch {
      /* ignorieren */
    }
  }, [modus]);

  return (
    <ThemeKontext.Provider value={{ modus, umschalten: () => setModus((m) => (m === 'hell' ? 'dunkel' : 'hell')) }}>
      {children}
    </ThemeKontext.Provider>
  );
}
