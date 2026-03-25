import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './i18n'
import './App.css'
import App from './App.tsx'

// Load saved theme before render to avoid flash
const savedTheme = localStorage.getItem('wally-theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)