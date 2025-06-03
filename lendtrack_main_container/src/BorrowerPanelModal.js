import React, { useState } from "react";

/**
 * BorrowerPanelModal - Opens on dashboard via the Borrower Panel button.
 * Lets the user select a debt and act as a "borrower" to repay or request extension (actions previously in DebtDetailModal).
 */
function BorrowerPanelModal({ debts, onClose, onRepay, onRequestExtension, accent, primary }) {
  const [selectedDebtId, setSelectedDebtId] = useState("");
  const [repayAmount, setRepayAmount] = useState("");
  const [repayMethod, setRepayMethod] = useState("Venmo");
  if (!debts.length) {
    return (
      <Modal onClose={onClose}>
        <h2 style={{ color: primary }}>Borrower Panel</h2>
        <div style={{ margin: "18px 0" }}>No debts found.</div>
      </Modal>
    );
  }

  const selectedDebt = debts.find(d => String(d.id) === String(selectedDebtId));

  return (
    <Modal onClose={onClose}>
      <h2 style={{ color: accent, fontWeight: 700, marginBottom: 7 }}>
        Borrower Panel
      </h2>
      <div style={{ marginBottom: 12 }}>
        <label style={{ fontWeight: 600, marginRight: 8 }}>Select Debt:</label>
        <select
          value={selectedDebtId}
          onChange={e => {
            setSelectedDebtId(e.target.value);
            // Reset repay UI when debt changes
            if (e.target.value) {
              const d = debts.find(x => String(x.id) === String(e.target.value));
              setRepayAmount(d ? d.amount : "");
              setRepayMethod("Venmo");
            }
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
          <option value="">-- Choose Debt --</option>
          {debts.map(d =>
            <option key={d.id} value={d.id}>
              {d.borrower} - {d.amount} {d.currency} {"(" + (d.status === "repaid" ? "Paid" : "Outstanding") + ")"}
            </option>
          )}
        </select>
      </div>
      {selectedDebt && selectedDebt.status !== "repaid" && (
        <>
          <form
            onSubmit={e => {
              e.preventDefault();
              if (!repayAmount || Number(repayAmount) < 1 || Number(repayAmount) > selectedDebt.amount) return;
              onRepay(selectedDebt.id, Number(repayAmount), repayMethod);
              setRepayAmount(selectedDebt.amount);
            }}
            style={{ marginBottom: 10 }}
          >
            <label style={{ fontWeight: 500 }}>Repay Amount: </label>
            <input
              type="number"
              min="1"
              max={selectedDebt.amount}
              value={repayAmount}
              required
              onChange={e => setRepayAmount(e.target.value)}
              style={{
                margin: "0 10px 5px 0",
                background: "#181C20",
                color: "#fff",
                border: `1px solid ${accent}`,
                borderRadius: 4,
                width: 80
              }}
            />
            <label style={{ fontWeight: 500 }}>Method: </label>
            <select
              value={repayMethod}
              onChange={e => setRepayMethod(e.target.value)}
              style={{
                marginRight: 10,
                background: "#181C20",
                color: "#fff",
                border: `1px solid ${primary}`,
                borderRadius: 4
              }}
            >
              <option>Venmo</option>
              <option>PayPal</option>
              <option>Cash</option>
              <option>Bank</option>
            </select>
            <button
              className="btn"
              type="submit"
              style={{
                background: accent,
                color: "#fff",
                border: "none",
                borderRadius: 5,
                fontSize: 13,
                marginLeft: 3,
                marginRight: 3,
                padding: "6px 12px",
                cursor: "pointer"
              }}
            >
              Repay
            </button>
          </form>
          <button
            className="btn"
            style={{
              background: primary,
              color: "#fff",
              border: "none",
              borderRadius: 5,
              fontSize: 13,
              marginLeft: 0,
              marginRight: 7,
              padding: "6px 12px",
              cursor: "pointer"
            }}
            onClick={() => onRequestExtension(selectedDebt.id)}
          >
            Request Extension
          </button>
        </>
      )}
      {selectedDebt && selectedDebt.status === "repaid" && (
        <div style={{ margin: "12px 0", color: accent }}>
          This debt is already fully paid.
        </div>
      )}
    </Modal>
  );
}

// Simple Modal re-use (just import Modal from main file)
function Modal({ children, onClose }) {
  // The Modal styling and semantics should match App.js
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
          maxWidth: "95vw",
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
