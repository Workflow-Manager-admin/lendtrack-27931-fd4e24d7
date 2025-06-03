import React, { useState } from "react";

/**
 * BorrowerPanelModal - Modal for borrowers to select their debt, see owing details,
 * choose a payment method (GPay, PhonePe, PayPal), and "Pay" (simulated).
 * @param {Array} debts - Debts to select from.
 * @param {Function} onClose - Handler to close modal.
 * @param {Function} onRepay - Handler for repayment.
 * @param {Function} onRequestExtension - Handler for extension request.
 * @param {string} accent - Accent color hex.
 * @param {string} primary - Primary color hex.
 */
function BorrowerPanelModal({ debts, onClose, onRepay, onRequestExtension, accent, primary }) {
  const [selectedDebtId, setSelectedDebtId] = useState('');
  const [payMethod, setPayMethod] = useState('GPay');
  const [confirmation, setConfirmation] = useState('');
  
  if (!debts.length) {
    return (
      <Modal onClose={onClose}>
        <h2 style={{ color: primary }}>Borrower Panel</h2>
        <div style={{ margin: "18px 0" }}>No debts found.</div>
      </Modal>
    );
  }

  // Only allow selection of outstanding debts (simulate borrower POV)
  const outstandingDebts = debts.filter(d => d.status === 'outstanding');
  const selectedDebt = outstandingDebts.find(d => String(d.id) === String(selectedDebtId));

  function handlePay(e) {
    e.preventDefault();
    if (!selectedDebt) return;
    // Simulate a payment; update actual via onRepay if provided
    setConfirmation(
      `Repayment of $${selectedDebt.amount} to ${selectedDebt.borrower} using ${payMethod} successful!`
    );
    // Simulate "repay": mark current debt as repaid and give feedback to parent app.
    if (typeof onRepay === "function") {
      onRepay(selectedDebt.id, selectedDebt.amount, payMethod);
    }
    setTimeout(() => setConfirmation(''), 2000);
  }

  return (
    <Modal onClose={onClose}>
      <h2 style={{ color: accent, fontWeight: 700, marginBottom: 7 }}>
        Borrower Panel
      </h2>
      <div style={{ marginBottom: 10 }}>
        <label style={{ fontWeight: 600, marginRight: 8 }}>Select Borrower:</label>
        <select
          value={selectedDebtId}
          onChange={e => {
            setSelectedDebtId(e.target.value);
            setConfirmation('');
          }}
          style={{
            background: "#181C20",
            color: "#fff",
            border: `1px solid ${accent}`,
            borderRadius: 5,
            fontSize: 16,
            padding: "6px 8px",
            minWidth: 130
          }}
        >
          <option value="">-- Choose Borrower --</option>
          {outstandingDebts.map(d => (
            <option key={d.id} value={d.id}>
              {d.borrower} - ${d.amount} {d.currency}
            </option>
          ))}
        </select>
      </div>
      {selectedDebt && (
        <div style={{
          background: "#242933",
          padding: 16, borderRadius: 8, marginBottom: 14,
          marginTop: 4
        }}>
          <div style={{marginBottom: 4}}>
            <span style={{ fontWeight: 500 }}>Borrower:</span> {selectedDebt.borrower}
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>Amount to Repay:</span>{" "}
            <span style={{ color: accent, fontWeight: 700 }}>
              ${selectedDebt.amount}
            </span>
          </div>
        </div>
      )}
      {selectedDebt && (
        <>
          <form onSubmit={handlePay}>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="pay-method" style={{ fontWeight: 500, marginRight: 12 }}>Payment Method:</label>
              <select
                id="pay-method"
                value={payMethod}
                onChange={e => setPayMethod(e.target.value)}
                style={{
                  background: "#181C20",
                  color: "#fff",
                  border: `1px solid ${primary}`,
                  borderRadius: 5,
                  fontSize: 15,
                  padding: "5px 10px",
                  minWidth: 80
                }}
                required
              >
                <option value="GPay">GPay</option>
                <option value="PhonePe">PhonePe</option>
                <option value="PayPal">PayPal</option>
              </select>
            </div>
            <button
              className="btn"
              type="submit"
              style={{
                background: accent,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: "1em",
                fontWeight: 500,
                padding: "9px 28px",
                marginBottom: 8,
                cursor: "pointer",
                marginRight: 10,
                boxShadow: "0 2px 8px #27AE6033"
              }}
            >
              Pay
            </button>
            <button
              type="button"
              className="btn"
              style={{
                background: primary,
                color: "#fff",
                border: "none",
                borderRadius: 6,
                fontSize: "1em",
                fontWeight: 500,
                padding: "8px 13px",
                marginBottom: 8,
                cursor: "pointer",
                marginLeft: 8
              }}
              onClick={() => onRequestExtension(selectedDebt.id)}
            >
              Request Extension
            </button>
          </form>
          {confirmation && (
            <div style={{
              background: "#18395a",
              color: "#7ef8aa",
              border: `1.5px solid #43eb92`,
              borderRadius: 7,
              padding: "10px 13px",
              marginTop: 10,
              textAlign: "center",
              fontWeight: 600
            }}>
              {confirmation}
            </div>
          )}
        </>
      )}
      {!selectedDebtId && (
        <div style={{ color: "#cccc", marginTop: 13 }}>
          Select a borrower to proceed with payment.
        </div>
      )}
    </Modal>
  );
}

// Simple Modal reuse (copied from App.js for style parity)
function Modal({ children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        zIndex: 5001,
        background: "rgba(0,0,0,.64)"
      }}
    >
      <div
        style={{
          background: "#22272D",
          color: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px 0 #000a",
          maxWidth: "97vw",
          width: 430,
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          padding: "36px 18px 20px 18px",
          maxHeight: "92vh",
          overflowY: "auto",
          overscrollBehavior: "contain"
        }}
        tabIndex={-1}
        aria-modal="true"
        role="dialog"
      >
        <button
          className="btn"
          style={{
            position: "absolute",
            right: 14,
            top: 10,
            background: "transparent",
            color: "#fff",
            fontSize: 26,
            border: "none",
            cursor: "pointer"
          }}
          onClick={onClose}
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

export default BorrowerPanelModal;
