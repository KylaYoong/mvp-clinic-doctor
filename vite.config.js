import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  root: '.', // Ensure the root is set correctly if your files are in the default locations
  publicDir: 'public', // This specifies the directory for static assets
});
