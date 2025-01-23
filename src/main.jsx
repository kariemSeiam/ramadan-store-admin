// main.jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './index.css';
import { Toaster } from 'react-hot-toast';
import RamadanStore from './Ramadan.jsx';
import AdminDashboard from './Admin.jsx';
import { AuthProvider } from '../contexts/AuthContext.jsx';

const App = () => {
  return (
    <StrictMode>
      <AdminDashboard />
    </StrictMode>
  );
};

createRoot(document.getElementById('root')).render(<App />);