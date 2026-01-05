import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AuthProvider } from './context/AuthContext';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { DashboardPage } from './pages/Dashboard';
import { DailyPage } from './pages/Daily';
import { WeeklyPage } from './pages/Weekly';
import { LandingPage } from './pages/Landing';
import { HistoryPage } from './pages/History';
import { ProfilePage } from './pages/Profile';

function App() {
  return (
    <ErrorBoundary>
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/daily" element={<DailyPage />} />
          <Route path="/weekly" element={<WeeklyPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
