import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar.js';
import { Footer } from './components/Footer.js';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ResultsPage } from './pages/ResultsPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { PreferencesPage } from './pages/PreferencesPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ProfilePage } from './pages/ProfilePage.js';

const MainLayout: React.FC = () => {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <div
      className={`flex flex-col min-h-screen font-sans transition-colors duration-200 ${
        isLanding
          ? 'bg-[#F9F9F9] text-gray-900 selection:bg-[#E60023] selection:text-white'
          : 'bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950'
      }`}
    >
      {!isLanding && <Navbar />}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/results" element={<ResultsPage />} />
          <Route path="/app/history" element={<HistoryPage />} />
          <Route path="/app/preferences" element={<PreferencesPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isLanding && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
};

export default App;
