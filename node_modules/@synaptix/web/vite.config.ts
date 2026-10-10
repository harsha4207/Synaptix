import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { synaptixServerApi } from './src/server/vitePlugin';

export default defineConfig(({ mode }) => {
  // Load environment variables (including server-side GEMINI_API_KEY, ELEVENLABS_API_KEY) into process.env
  const env = loadEnv(mode, process.cwd(), '');
  for (const key in env) {
    if (process.env[key] === undefined || process.env[key] === '') {
      process.env[key] = env[key];
    }
  }

  return {
    plugins: [react(), synaptixServerApi()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 3000,
      host: true,
    },
    define: {
      'process.env': {},
    },
    envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  };
});
