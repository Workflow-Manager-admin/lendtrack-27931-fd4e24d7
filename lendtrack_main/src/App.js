import React from 'react';
import './App.css';
import LendTrackMain from './LendTrackMain';
import Welcome from './Welcome';

// Add React Router dependency (react-router-dom)
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';

// Welcome wrapper to handle navigation on "Get Started"
function WelcomeWithNav() {
  const navigate = useNavigate();
  return <Welcome onGetStarted={() => navigate('/dashboard')} />;
}

// PUBLIC_INTERFACE
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<WelcomeWithNav />} />
        <Route path="/dashboard" element={<LendTrackMain />} />
        {/* fallback: any unknown path also shows Welcome */}
        <Route path="*" element={<WelcomeWithNav />} />
      </Routes>
    </Router>
  );
}

export default App;