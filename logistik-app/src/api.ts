import { useCallback, useEffect, useState } from 'react';

interface Zustand<T> {
  daten: T | null;
  laedt: boolean;
  fehler: string | null;
}

/** Lädt Daten vom Server und bietet eine Funktion zum erneuten Laden. */
export function useApi<T>(pfad: string) {
  const [zustand, setZustand] = useState<Zustand<T>>({ daten: null, laedt: true, fehler: null });

  const laden = useCallback(async () => {
    setZustand((z) => ({ ...z, laedt: true, fehler: null }));
    try {
      const antwort = await fetch(pfad);
      if (!antwort.ok) throw new Error(`Server-Fehler (${antwort.status})`);
      setZustand({ daten: (await antwort.json()) as T, laedt: false, fehler: null });
    } catch (e) {
      setZustand((z) => ({
        ...z,
        laedt: false,
        fehler: e instanceof Error ? e.message : 'Unbekannter Fehler',
      }));
    }
  }, [pfad]);

  useEffect(() => {
    void laden();
  }, [laden]);

  return { ...zustand, neuLaden: laden };
}
