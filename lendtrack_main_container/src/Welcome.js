import React from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

// PUBLIC_INTERFACE
function Welcome() {
  /**
   * Welcome (Landing) Page for LendTrack application.
   * Shows app description and a prominent 'Get Started' button.
   * Navigates user to the dashboard when the button is pressed.
   */

  const navigate = useNavigate();

  // Handler for button click
  // PUBLIC_INTERFACE
  function handleGetStarted() {
    navigate('/dashboard');
  }

  return (
    <div className="app" style={{ minHeight: '100vh', background: 'var(--base-dark)', display: 'flex', flexDirection: 'column' }}>
      <nav className="navbar" style={{ background: "#212733", borderBottom: `2px solid var(--base-light)` }}>
        <div className="container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div className="logo" style={{ color: 'var(--base-light)', fontWeight: 700 }}>
            <span className="logo-symbol" style={{ fontSize: '1.2em' }}>₤</span> LendTrack
          </div>
        </div>
      </nav>

      <main style={{ flex: '1 1 auto' }}>
        <div className="container hero" style={{ paddingTop: 140 }}>
          <div className="subtitle" style={{ color: 'var(--base-light)', fontWeight: 600 }}>
            Welcome to LendTrack
          </div>
          <h1 className="title" style={{ color: '#fff' }}>
            Effortless Lending. <br />Friendly Reminders. <br />Peace of Mind.
          </h1>
          <div className="description">
            LendTrack helps you easily log money you’ve lent to others, automate reminders, and track payback history—all with a friendly interface and privacy controls.
            <br /><br />
            Customize reminder style, choose anonymity if you wish, and let borrowers mark as paid, repay, or request more time. 
            <br /><br />
            <strong>Ready to simplify your personal lending?</strong>
          </div>
          <button
            className="btn btn-large"
            style={{
              background: 'var(--base-light)',
              color: '#232733',
              fontWeight: 700,
              fontSize: "1.13em",
              borderRadius: "6px",
              padding: "14px 45px",
              marginTop: "18px",
              letterSpacing: "0.02em",
              boxShadow: "0 2px 14px 0 rgba(0,255,255,0.04)",
              border: 'none',
              cursor: 'pointer',
            }}
            onClick={handleGetStarted}
            tabIndex={0}
            autoFocus
          >
            Get Started
          </button>
        </div>
      </main>
      <footer style={{ color: 'var(--text-secondary)', textAlign: "center", fontSize: 15, opacity: 0.7, marginBottom: 8 }}>
        <span style={{ color: 'var(--base-light)', fontWeight: 600 }}>LendTrack</span> — Modern lending, simplified.
      </footer>
    </div>
  );
}

export default Welcome;
