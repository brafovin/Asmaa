import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Entwicklung: Die Oberfläche läuft auf Port 5173, der Server auf Port 3001.
// Alle Anfragen an /api werden automatisch an den Server weitergereicht.
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // erlaubt den Zugriff vom Handy im selben WLAN
    port: 5173,
    proxy: { '/api': 'http://localhost:3001' },
  },
});
