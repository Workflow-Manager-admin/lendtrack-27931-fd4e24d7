import React from "react";

// PUBLIC_INTERFACE
function Welcome({ onGetStarted }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background-dark)",
        color: "var(--text-color)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter,Roboto,Helvetica,Arial,sans-serif",
      }}
    >
      <div
        className="container"
        style={{
          maxWidth: 540,
          padding: "40px 30px 36px 30px",
          background: "var(--surface-dark)",
          borderRadius: 17,
          boxShadow: "0 7px 36px rgba(45,156,219,0.16)",
          textAlign: "center",
        }}
      >
        <div className="logo" style={{
          fontSize: "2.05rem",
          fontWeight: 700,
          color: "var(--primary)",
          marginBottom: 14,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 15
        }}>
          <span className="logo-symbol" style={{ fontSize: 38, color: "var(--primary)" }}>💸</span>
          LendTrack
        </div>
        <div className="title" style={{
          fontWeight: 800,
          fontSize: "2.9rem",
          color: "var(--secondary)",
          marginBottom: 10,
          letterSpacing: "-0.025em",
        }}>
          Welcome to LendTrack!
        </div>
        <div className="subtitle" style={{
          color: "var(--primary)",
          fontSize: "1.25rem",
          marginBottom: 22,
        }}>
          Smart, stress-free money lending & tracking.
        </div>
        <div className="description" style={{
          color: "var(--text-secondary)",
          fontSize: "1.13rem",
          marginBottom: 38,
          lineHeight: 1.7,
        }}>
          Keep tabs on lent money. Send polite reminders. Borrowers can repay or ask for more time. <br /><strong>Get started below and take control of your lending journey!</strong>
        </div>
        <button
          className="btn btn-large"
          style={{
            background: "var(--primary)",
            color: "#fff",
            borderRadius: 8,
            fontWeight: 700,
            boxShadow: "var(--shadow)",
            padding: "15px 40px",
            fontSize: "1.25rem",
            letterSpacing: "0.02em",
            cursor: "pointer",
            outline: "none",
            border: "none",
            transition: "background 0.16s, box-shadow 0.13s",
          }}
          onClick={onGetStarted}
        >
          Get Started
        </button>
      </div>
      <div style={{
        marginTop: 44,
        fontSize: "1rem",
        color: "var(--text-muted)",
        fontWeight: 400,
        letterSpacing: "-0.01em"
      }}>
        &copy; {new Date().getFullYear()} LendTrack &middot; Secure. Simple. Kind.
      </div>
    </div>
  );
}

export default Welcome;
