import React from 'react';
import './App.css';
import LendTrackMain from './LendTrackMain';
import Welcome from './Welcome';

// Import react-router-dom components/hooks per v6+ API
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

/**
 * WelcomeWithNav - a wrapper for Welcome that handles navigation via useNavigate.
 */
function WelcomeWithNav() {
  const navigate = useNavigate();
  return <Welcome onGetStarted={() => navigate('/dashboard')} />;
}

// PUBLIC_INTERFACE
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<WelcomeWithNav />} />
        <Route path="/dashboard" element={<LendTrackMain />} />
        {/* fallback: any unknown path also shows Welcome */}
        <Route path="*" element={<WelcomeWithNav />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;