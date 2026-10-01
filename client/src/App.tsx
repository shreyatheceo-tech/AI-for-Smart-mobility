import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ResultsPage } from './pages/ResultsPage.js';
import { HistoryPage } from './pages/HistoryPage.js';
import { PreferencesPage } from './pages/PreferencesPage.js';
import { LoginPage } from './pages/LoginPage.js';
import { RegisterPage } from './pages/RegisterPage.js';
import { ProfilePage } from './pages/ProfilePage.js';
import { AdminDashboardPage } from './pages/AdminDashboardPage.js';
import { AiAssistantWidget } from './components/AiAssistantWidget.js';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-cream-100 text-warm-charcoal selection:bg-rose-400 selection:text-white font-sans antialiased">
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/admin" element={<AdminDashboardPage />} />
            <Route path="/app" element={<DashboardPage />} />
            <Route path="/app/results" element={<ResultsPage />} />
            <Route path="/app/history" element={<HistoryPage />} />
            <Route path="/app/preferences" element={<PreferencesPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signin" element={<Navigate to="/login" replace />} />
            <Route path="/sign-in" element={<Navigate to="/login" replace />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/signup" element={<Navigate to="/register" replace />} />
            <Route path="/sign-up" element={<Navigate to="/register" replace />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <AiAssistantWidget />
      </div>
    </BrowserRouter>
  );
};

export default App;
