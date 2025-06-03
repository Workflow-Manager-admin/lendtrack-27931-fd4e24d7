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
  const [repayAmount, setRepayAmount] = useState('');
  const [error, setError] = useState('');
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

  // Filter for actual repayments with amount
  const repayments = selectedDebt
    ? (selectedDebt.history || []).filter(h => h.type === 'repayment' && h.amount)
    : [];

  function handlePay(e) {
    e.preventDefault();
    if (!selectedDebt) return;
    // Validate amount
    const max = Number(selectedDebt.amount);
    const amt = Number(repayAmount);
    if (!amt || amt <= 0) {
      setError('Enter a valid amount to repay.');
      return;
    }
    if (amt > max) {
      setError(`Cannot repay more than ${formatINR(max)}`);
      return;
    }
    setError('');
    setConfirmation(
      `Repayment of ${formatINR(amt)} to ${selectedDebt.borrower} using ${payMethod} successful!`
    );
    if (typeof onRepay === "function") {
      onRepay(selectedDebt.id, amt, payMethod);
    }
    setRepayAmount('');
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
            setRepayAmount('');
            setError('');
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
              {d.borrower} - {formatINR(d.amount)} (₹)
            </option>
          ))}
        </select>
      </div>

      {/* Show repayment history for that borrower */}
      {selectedDebt && repayments.length > 0 && (
        <div style={{
          background: "#19334a",
          color: "#bcf8bb",
          borderRadius: 8,
          marginBottom: 10,
          padding: "10px 13px 6px 13px"
        }}>
          <div style={{ fontWeight: 500, color: accent, marginBottom: 5, fontSize: 15 }}>
            Repayment Installments:
          </div>
          <ul style={{ fontSize: 15, paddingLeft: 20, margin: 0 }}>
            {repayments.map((h, i) => (
              <li key={i} style={{ margin: "0 0 3px 0" }}>
                Paid <b>{formatINR(h.amount)}</b> on <span style={{ color: "#c4fbf3", fontWeight: 400 }}>{h.date}</span> via <i>{h.method}</i>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Borrower debt details */}
      {selectedDebt && (
        <div style={{
          background: "#242933",
          padding: 16, borderRadius: 8, marginBottom: 14,
          marginTop: 4
        }}>
          <div style={{ marginBottom: 4 }}>
            <span style={{ fontWeight: 500 }}>Borrower:</span> {selectedDebt.borrower}
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>Amount Remaining:</span>{" "}
            <span style={{ color: accent, fontWeight: 700 }}>
              {formatINR(selectedDebt.amount)}
            </span>
          </div>
        </div>
      )}
      {selectedDebt && (
        <>
          <form onSubmit={handlePay}>
            <div style={{ marginBottom: 12 }}>
              <label htmlFor="repay-amount" style={{ fontWeight: 500, marginRight: 10 }}>
                Repay Amount:
              </label>
              <input
                name="repayAmount"
                id="repay-amount"
                type="number"
                min="1"
                max={selectedDebt.amount}
                step="any"
                value={repayAmount}
                style={{
                  background: "#181C20",
                  color: "#fff",
                  border: `1px solid ${accent}`,
                  borderRadius: 5,
                  fontSize: 15,
                  padding: "7px 7px",
                  width: 120,
                  marginRight: 8
                }}
                onChange={e => {
                  setRepayAmount(e.target.value);
                  setError('');
                }}
                required
                placeholder="Enter amount in ₹"
              />
              <span style={{ color: "#bcf8bb", fontWeight: 400, fontSize: 13 }}>
                (max {formatINR(selectedDebt.amount)})
              </span>
            </div>
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
            {error && <div style={{ color: "#f67575", marginBottom: 8 }}>{error}</div>}
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
