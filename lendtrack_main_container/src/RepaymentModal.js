import React, { useState } from "react";

/**
 * Formats amount as INR with ₹ and Indian separators.
 */
function formatINR(amount) {
  if (typeof amount === "string") amount = parseFloat(amount);
  if (isNaN(amount)) return "₹0";
  return (
    "₹" +
    amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    })
  );
}

/**
 * RepaymentModal: Modal to allow repaying a debt (full or installment mode)
 * Props:
 *   - debt: the debt entry
 *   - mode: "full" | "installment"
 *   - onClose: callback to close
 *   - onRepay: function(debtId, amount, method) -- will be called with full or partial
 *   - onRequestExtension: function(debtId)
 *   - accent, primary: colors
 */
function RepaymentModal({ debt, mode, onClose, onRepay, onRequestExtension, accent, primary }) {
  const [payMethod, setPayMethod] = useState('GPay');
  const [repayAmount, setRepayAmount] = useState('');
  const [error, setError] = useState('');
  const [confirmation, setConfirmation] = useState('');

  // Replication of logic for validation and UI
  function handleFullPay(e) {
    if (e) e.preventDefault();
    if (!debt) return;
    setError('');
    setConfirmation(
      `Full repayment of ${formatINR(debt.amount)} to ${debt.borrower} using ${payMethod} successful!`
    );
    if (typeof onRepay === "function") {
      onRepay(debt.id, debt.amount, payMethod);
    }
    setTimeout(() => {
      setConfirmation('');
      onClose();
    }, 1200);
  }

  function handleInstallmentPay(e) {
    e.preventDefault();
    const max = Number(debt.amount);
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
      `Repayment of ${formatINR(amt)} to ${debt.borrower} using ${payMethod} successful!`
    );
    if (typeof onRepay === "function") {
      onRepay(debt.id, amt, payMethod);
    }
    setRepayAmount('');
    setTimeout(() => {
      setConfirmation('');
      onClose();
    }, 1200);
  }

  return (
    <Modal onClose={onClose}>
      <h2 style={{ color: accent, fontWeight: 700, marginBottom: 7 }}>
        {mode === "full" ? "Full Payment" : "Installment Payment"}
      </h2>
      {/* Borrower info */}
      {debt && (
        <div style={{
          background: "#242933",
          padding: 11, borderRadius: 8, marginBottom: 12,
          marginTop: 2,
          fontSize: 15
        }}>
          <div style={{ marginBottom: 2 }}>
            <span style={{ fontWeight: 500 }}>Borrower:</span> {debt.borrower}
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>Amount Remaining:</span>{" "}
            <span style={{ color: accent, fontWeight: 700 }}>
              {formatINR(debt.amount)}
            </span>
          </div>
          <div>
            <span style={{ fontWeight: 500 }}>Due Date:</span> {debt.dueDate}
          </div>
        </div>
      )}

      {/* Full payment workflow */}
      {mode === "full" && debt && (
        <form
          onSubmit={handleFullPay}
          style={{marginTop: 8}}
        >
          <div style={{ marginBottom: 10 }}>
            <label style={{ fontWeight: 500, marginRight: 11 }}>Payment Method:</label>
            <select
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
              padding: "10px 30px",
              marginBottom: 8,
              cursor: "pointer",
              marginRight: 8,
              boxShadow: "0 2px 8px #27AE6033"
            }}
          >
            Pay Full Amount ({formatINR(debt.amount)})
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
            onClick={() => onRequestExtension(debt.id)}
          >
            Request Extension
          </button>
        </form>
      )}

      {/* Installment/partial payment workflow */}
      {mode === "installment" && debt && (
        <form onSubmit={handleInstallmentPay} style={{marginTop: 8}}>
          <div style={{ marginBottom: 12 }}>
            <label htmlFor="repay-amount" style={{ fontWeight: 500, marginRight: 10 }}>
              Installment Amount:
            </label>
            <input
              name="repayAmount"
              id="repay-amount"
              type="number"
              min="1"
              max={debt.amount}
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
              (max {formatINR(debt.amount)})
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
              padding: "10px 30px",
              marginBottom: 8,
              cursor: "pointer",
              marginRight: 10,
              boxShadow: "0 2px 8px #27AE6033"
            }}
          >
            Pay Installment
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
            onClick={() => onRequestExtension(debt.id)}
          >
            Request Extension
          </button>
        </form>
      )}

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
    </Modal>
  );
}

// Modal reused (style parity with App)
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

export default RepaymentModal;
