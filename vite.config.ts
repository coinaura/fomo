import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';   // SWC variant

export default defineConfig({
  plugins: [react()],
});
