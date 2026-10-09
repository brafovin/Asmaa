import { useEffect, useState } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Platzhalter from './pages/Platzhalter.tsx';
import { ALLE_EINTRAEGE } from './navigation.ts';

export default function App() {
  const [menueOffen, setMenueOffen] = useState(false);
  const { pathname } = useLocation();

  // Auf dem Handy: Menü nach einem Seitenwechsel automatisch schließen
  useEffect(() => setMenueOffen(false), [pathname]);

  return (
    <Layout menueOffen={menueOffen} setMenueOffen={setMenueOffen}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {ALLE_EINTRAEGE.filter((e) => !e.fertig).map((e) => (
          <Route key={e.pfad} path={e.pfad} element={<Platzhalter eintrag={e} />} />
        ))}
        <Route path="*" element={<Platzhalter />} />
      </Routes>
    </Layout>
  );
}
