import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { RagProvider } from './lib/rag';
import { SupabaseAuthProvider } from './lib/supabase';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <SupabaseAuthProvider>
      <RagProvider>
        <App />
      </RagProvider>
    </SupabaseAuthProvider>
  </React.StrictMode>
);
