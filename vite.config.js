import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The server address is NOT here: it comes from VITE_API_URL (.env locally, an environment variable on Render).
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 }
});
