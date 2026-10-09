import { useEffect, useRef, useState } from 'react';

/** Misst die Breite eines Elements, damit Diagramme scharf und passend gezeichnet werden. */
export function useBreite<T extends HTMLElement>(): [React.RefObject<T>, number] {
  const ref = useRef<T>(null);
  const [breite, setBreite] = useState(0);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const beobachter = new ResizeObserver(([eintrag]) => setBreite(Math.floor(eintrag.contentRect.width)));
    beobachter.observe(el);
    setBreite(Math.floor(el.getBoundingClientRect().width));
    return () => beobachter.disconnect();
  }, []);
  return [ref as React.RefObject<T>, breite];
}
