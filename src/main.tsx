import '@fontsource/yatra-one/devanagari-400.css';
import '@fontsource/yatra-one/latin-400.css';
import '@fontsource/mukta/devanagari-400.css';
import '@fontsource/mukta/devanagari-600.css';
import '@fontsource/mukta/devanagari-700.css';
import '@fontsource/mukta/latin-400.css';
import '@fontsource/mukta/latin-600.css';
import '@fontsource/mukta/latin-700.css';
import './ui/styles/tokens.css';
import './ui/styles/base.css';
import './ui/styles/components.css';
import './ui/styles/print.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
