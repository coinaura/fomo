// src/main.tsx
//---------------------------------------------------------------
//  Entry file for Vite + React + Tailwind
//---------------------------------------------------------------

import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';
import './index.css';      // ← Tailwind directives live in this file

// React 18 createRoot API
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
