import 'bootstrap/dist/css/bootstrap.min.css';    // ← NEW
import './styles.css';                            // ← NEW (custom tweaks)
/* existing imports */
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
