// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';

import WhatsAppDashboard from './WhatsAppDashboard.jsx';

const App = () => {
  return (
    <StrictMode>
      <WhatsAppDashboard />
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<App />);