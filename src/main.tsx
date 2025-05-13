
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Define global brand colors
document.documentElement.style.setProperty('--elmeet-blue', '#16849b');
document.documentElement.style.setProperty('--elmeet-blue-dark', '#0d7390');
document.documentElement.style.setProperty('--elmeet-orange', '#ffa700');
document.documentElement.style.setProperty('--elmeet-orange-dark', '#e69600');

createRoot(document.getElementById("root")!).render(<App />);
