
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider, useGame } from './context/GameContext';
import AuthPage from './pages/AuthPage';
import Home from './pages/Home';
import ActivityPage from './pages/ActivityPageEnhanced';
import ProfilePage from './pages/ProfilePage';
import MapPage from './pages/MapPage';
import MarketplacePage from './pages/MarketplacePage';
import ClansPage from './pages/ClansPage';
import AlertsPage from './pages/AlertsPage';
import AchievementDetailPage from './pages/AchievementDetailPage';
import BottomNav from './components/BottomNav';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoading } = useGame();

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center bg-background-dark text-primary">INITIALIZING...</div>;
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};

const AppContent: React.FC = () => {
  const { user } = useGame();

  return (
    <div className="flex flex-col min-h-screen bg-background-dark text-white max-w-[430px] mx-auto shadow-2xl overflow-hidden relative">
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/home" element={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        } />
        <Route path="/map" element={
          <PrivateRoute>
            <MapPage />
          </PrivateRoute>
        } />
        <Route path="/activity/*" element={
          <PrivateRoute>
            <ActivityPage />
          </PrivateRoute>
        } />
        <Route path="/marketplace" element={
          <PrivateRoute>
            <MarketplacePage />
          </PrivateRoute>
        } />
        <Route path="/clans" element={
          <PrivateRoute>
            <ClansPage />
          </PrivateRoute>
        } />
        <Route path="/profile" element={
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        } />
        <Route path="/me" element={<Navigate to="/profile" replace />} />
        <Route path="/alerts" element={
          <PrivateRoute>
            <AlertsPage />
          </PrivateRoute>
        } />
        <Route path="/achievement/:id" element={
          <PrivateRoute>
            <AchievementDetailPage />
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      
      {user && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <Router>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </Router>
  );
}

export default App;
