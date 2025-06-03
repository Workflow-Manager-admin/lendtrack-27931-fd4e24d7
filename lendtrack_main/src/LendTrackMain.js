import React, { useState } from "react";

/**
 * Color constants for palette
 */
const COLORS = {
  primary: "#2D9CDB",
  secondary: "#F2F2F2",
  accent: "#27AE60",
  bg: "#181C24",
  section: "#232837",
  card: "#232837",
  danger: "#EB5757",
  disabled: "#BDBDBD"
};

const REMINDER_TONES = [
  { label: "Soft", value: "soft" },
  { label: "Funny", value: "funny" },
  { label: "Formal", value: "formal" }
];

// PUBLIC_INTERFACE
function LendTrackMain() {
  /** Debt list state: array of {id, borrower, amount, date, reason, dueDate, status, reminders: [{tone, date}], isAnon, history: []} */
  const [debts, setDebts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null);
  const [settings, setSettings] = useState({
    reminderTone: "soft",
    anonymous: true
  });

  // Derived summary
  const totalLent = debts.reduce((sum, d) => sum + Number(d.amount), 0);
  const totalRepaid = debts
    .filter((d) => d.status === "repaid")
    .reduce((sum, d) => sum + Number(d.amount), 0);
  const totalOutstanding =
    totalLent -
    totalRepaid -
    debts
      .filter((d) => d.status === "cancelled")
      .reduce((sum, d) => sum + Number(d.amount), 0);

  // PUBLIC_INTERFACE
  function handleAddDebt(debt) {
    setDebts([
      ...debts,
      {
        ...debt,
        id: Date.now(),
        status: "outstanding", // outstanding | repaid | extension_requested | cancelled
        reminders: [],
        history: []
      }
    ]);
    setShowAddForm(false);
  }

  // PUBLIC_INTERFACE
  function handleSendReminder(debtId, toneOverride, isAnonOverride) {
    setDebts((prev) =>
      prev.map((d) =>
        d.id === debtId
          ? {
              ...d,
              reminders: [
                ...d.reminders,
                {
                  tone: toneOverride || settings.reminderTone,
                  date: new Date().toISOString(),
                  anonymous:
                    typeof isAnonOverride === "boolean"
                      ? isAnonOverride
                      : settings.anonymous
                }
              ]
            }
          : d
      )
    );
    alert("Reminder simulated! (No real email sent)");
  }

  // PUBLIC_INTERFACE
  function handleMarkAsPaid(debtId) {
    setDebts((prev) =>
      prev.map((d) =>
        d.id === debtId
          ? {
              ...d,
              status: "repaid",
              history: [
                ...d.history,
                { type: "repaid", date: new Date().toISOString() }
              ]
            }
          : d
      )
    );
  }

  // PUBLIC_INTERFACE
  function handleRequestExtension(debtId) {
    setDebts((prev) =>
      prev.map((d) =>
        d.id === debtId
          ? {
              ...d,
              status: "extension_requested",
              history: [
                ...d.history,
                { type: "extension_requested", date: new Date().toISOString() }
              ]
            }
          : d
      )
    );
  }

  // PUBLIC_INTERFACE
  function handleRepay(debtId) {
    // Full repay for now, simulate payment
    handleMarkAsPaid(debtId);
    alert("Repayment simulated! (No real payment platform connected)");
  }

  // PUBLIC_INTERFACE
  function handleSettingsChange(newSettings) {
    setSettings(newSettings);
  }

  // Borrower actions (simulate borrower view)
  function BorrowerActions({ debt }) {
    if (!debt || debt.status === "repaid" || debt.status === "cancelled")
      return null;
    return (
      <div style={{ marginTop: 8 }}>
        <button
          className="lt-btn"
          style={{ backgroundColor: COLORS.accent, color: "#fff" }}
          onClick={() => handleRepay(debt.id)}
        >
          Mark as Repaid
        </button>
        <button
          className="lt-btn"
          style={{ backgroundColor: COLORS.primary, color: "#fff", marginLeft: 8 }}
          onClick={() => handleRequestExtension(debt.id)}
        >
          Request Extension
        </button>
      </div>
    );
  }

  // Reminder tone to sample preview
  function tonePreview(tone) {
    switch (tone) {
      case "soft":
        return "Hi! Just a gentle reminder about the repayment 😊";
      case "funny":
        return "Knock knock! Who owes me money? Just kidding. Please repay soon!";
      case "formal":
        return "Dear borrower, this is a formal reminder for your repayment.";
      default:
        return "";
    }
  }

  return (
    <div
      className="lt-app-bg"
      style={{
        minHeight: "100vh",
        background: COLORS.bg,
        color: COLORS.secondary,
        fontFamily: "Inter,Roboto,Helvetica,Arial,sans-serif"
      }}
    >
      <div
        className="lt-navbar"
        style={{
          width: "100%",
          background: COLORS.card,
          padding: "18px 0",
          borderBottom: `1px solid ${COLORS.primary}`,
          position: "sticky",
          top: 0,
          zIndex: 100
        }}
      >
        <div className="lt-container" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div
            className="lt-logo"
            style={{
              fontSize: "1.4rem",
              fontWeight: 700,
              color: COLORS.primary,
              display: "flex",
              gap: "12px"
            }}
          >
            <span style={{ color: COLORS.primary }}>💸</span>
            LendTrack
          </div>
          <div>
            <button
              className="lt-btn"
              style={{
                marginRight: "10px",
                backgroundColor: COLORS.primary,
                color: "#fff"
              }}
              onClick={() => setShowAddForm(true)}
            >
              + Add Lending
            </button>
            <button
              className="lt-btn"
              style={{
                backgroundColor: COLORS.section,
                color: COLORS.primary,
                border: `1.5px solid ${COLORS.primary}`
              }}
              onClick={() => setShowSettings((v) => !v)}
            >
              ⚙️ Settings
            </button>
          </div>
        </div>
      </div>
      <div
        style={{
          margin: "40px auto 0",
          maxWidth: 950,
          minHeight: 500,
          padding: "16px"
        }}
      >
        {/* DASHBOARD SUMMARY */}
        <div
          style={{
            display: "flex",
            background: COLORS.section,
            borderRadius: 16,
            padding: 24,
            gap: 24,
            marginBottom: 32,
            boxShadow: "0 4px 20px rgba(0,0,0,0.16)"
          }}
        >
          <DashboardCard
            color={COLORS.primary}
            title="Total Lent"
            amount={totalLent}
          />
          <DashboardCard
            color={COLORS.accent}
            title="Outstanding"
            amount={totalOutstanding}
          />
          <DashboardCard
            color={COLORS.secondary}
            title="Repaid"
            amount={totalRepaid}
            textColor={COLORS.bg}
          />
        </div>

        {/* DEBT LIST */}
        <div
          style={{
            marginBottom: 36,
            background: COLORS.section,
            padding: "24px 18px",
            borderRadius: 12,
            boxShadow: "0 2px 16px rgba(0,0,0,0.13)"
          }}
        >
          <div style={{ fontSize: 22, fontWeight: 600, color: COLORS.primary, marginBottom: 18 }}>
            Debts
          </div>
          {debts.length === 0 ? (
            <div style={{ color: COLORS.disabled, textAlign: "center" }}>
              No debts logged yet.
            </div>
          ) : (
            <DebtList
              debts={debts}
              colors={COLORS}
              onView={(debt) => setSelectedDebt(debt)}
              onReminder={handleSendReminder}
              onMarkPaid={handleMarkAsPaid}
            />
          )}
        </div>

        {/* HISTORY */}
        <div
          style={{
            background: COLORS.section,
            padding: "18px 12px",
            borderRadius: 10,
            marginBottom: 20
          }}
        >
          <div style={{ fontWeight: 600, color: COLORS.accent, fontSize: 18 }}>
            Debt History
          </div>
          <DebtHistory debts={debts} colors={COLORS} />
        </div>
      </div>

      {/* DIALOGS */}
      {showAddForm && (
        <Modal onClose={() => setShowAddForm(false)}>
          <LendingForm
            onAdd={handleAddDebt}
            primaryColor={COLORS.primary}
            accentColor={COLORS.accent}
          />
        </Modal>
      )}
      {showSettings && (
        <Modal onClose={() => setShowSettings(false)}>
          <SettingsPanel
            settings={settings}
            onChange={handleSettingsChange}
            accentColor={COLORS.accent}
            primaryColor={COLORS.primary}
          />
        </Modal>
      )}
      {selectedDebt && (
        <Modal onClose={() => setSelectedDebt(null)}>
          <DebtDetails
            debt={selectedDebt}
            onSendReminder={handleSendReminder}
            onMarkPaid={handleMarkAsPaid}
            settings={settings}
            accentColor={COLORS.accent}
            primaryColor={COLORS.primary}
          />
          <BorrowerActions debt={selectedDebt} />
        </Modal>
      )}

      {/* Custom Style */}
      <style>
        {`
        .lt-btn {
          border: none;
          border-radius: 6px;
          padding: 10px 18px;
          margin: 0 2px;
          font-weight: 500;
          font-size: .98rem;
          cursor: pointer;
          transition: background 0.16s;
        }
        .lt-btn[disabled] {
          opacity: 0.4;
          cursor: not-allowed;
        }
        .lt-container {
          width: 90%;
          max-width: 950px;
          margin: 0 auto;
          display: flex;
        }
        input, select, textarea {
          background: #232837;
          color: ${COLORS.secondary};
          border: 1px solid #435366;
          border-radius: 7px;
          padding: 9px 13px;
          margin-bottom: 12px;
          font-size: 1rem;
          outline: none;
        }
        input:focus, select:focus, textarea:focus {
          border-color: ${COLORS.primary};
        }
        label {
          color: ${COLORS.primary};
          font-weight: 500;
          display: block;
          margin-bottom: 3px;
        }
        `}
      </style>
    </div>
  );
}

// PUBLIC_INTERFACE
function DashboardCard({ color, textColor, title, amount }) {
  return (
    <div
      style={{
        flex: 1,
        background: color,
        color: textColor || "#fff",
        borderRadius: 10,
        padding: "22px 18px",
        minWidth: 160,
        display: "flex",
        flexDirection: "column",
        alignItems: "center"
      }}
    >
      <div style={{ fontWeight: 500, fontSize: 15, opacity: 0.84 }}>{title}</div>
      <div style={{ fontWeight: 700, fontSize: 27, marginTop: 6 }}>
        ₹{amount || 0}
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function DebtList({ debts, colors, onView, onReminder, onMarkPaid }) {
  return (
    <table style={{ width: "100%", color: colors.secondary, borderCollapse: "collapse" }}>
      <thead>
        <tr style={{ background: colors.card }}>
          <th style={thStyle}>Borrower</th>
          <th style={thStyle}>Amount</th>
          <th style={thStyle}>Lent On</th>
          <th style={thStyle}>Due Date</th>
          <th style={thStyle}>Status</th>
          <th style={thStyle}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {debts.map((d, idx) => (
          <tr
            key={d.id}
            style={{
              background: idx % 2 === 0 ? "#1B2230" : colors.section,
              borderBottom: `1px solid ${colors.bg}`,
              transition: "background 0.18s"
            }}
          >
            <td style={tdStyle}>{d.borrower}</td>
            <td style={tdStyle}>₹{d.amount}</td>
            <td style={tdStyle}>{d.date}</td>
            <td style={tdStyle}>{d.dueDate}</td>
            <td style={tdStyle}>
              <span style={{ color: statusColor(d.status, colors) }}>
                {statusLabel(d.status)}
              </span>
            </td>
            <td style={tdStyle}>
              <button
                className="lt-btn"
                style={{ background: colors.primary, color: "#fff" }}
                onClick={() => onView(d)}
              >
                View
              </button>
              <button
                className="lt-btn"
                style={{ background: colors.accent, color: "#fff" }}
                disabled={d.status !== "outstanding"}
                onClick={() => onReminder(d.id)}
              >
                Send Reminder
              </button>
              <button
                className="lt-btn"
                style={{ background: colors.secondary, color: colors.bg }}
                disabled={d.status !== "outstanding"}
                onClick={() => onMarkPaid(d.id)}
              >
                Mark as Paid
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// PUBLIC_INTERFACE
function LendingForm({ onAdd, primaryColor, accentColor }) {
  const [borrower, setBorrower] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [dueDate, setDueDate] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!borrower || !amount || !date || !dueDate) {
      alert("Please fill in all required fields.");
      return;
    }
    onAdd({
      borrower,
      amount: Number(amount),
      date,
      reason,
      dueDate
    });
  }

  return (
    <form style={{ minWidth: 320 }} onSubmit={handleSubmit}>
      <div style={{ fontWeight: 700, fontSize: 21, marginBottom: 18, color: primaryColor }}>
        Log New Lending
      </div>
      <label>Borrower Name*</label>
      <input
        type="text"
        value={borrower}
        onChange={(e) => setBorrower(e.target.value)}
        required
        autoFocus
      />
      <label>Amount (₹)*</label>
      <input
        type="number"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        required
        min={1}
      />
      <label>Date Lent*</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />
      <label>Due Date*</label>
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        required
      />
      <label>
        Reason/Note <span style={{ color: "#757575", fontWeight: 300 }}>(optional)</span>
      </label>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        rows={2}
        style={{ resize: "vertical" }}
        maxLength={96}
      />
      <button
        type="submit"
        className="lt-btn"
        style={{ background: accentColor, color: "#fff", width: "100%", marginTop: 10 }}
      >
        Add Lending
      </button>
    </form>
  );
}

// PUBLIC_INTERFACE
function DebtDetails({
  debt,
  onSendReminder,
  onMarkPaid,
  settings,
  accentColor,
  primaryColor
}) {
  const [showCustomTone, setShowCustomTone] = useState(false);
  const [tone, setTone] = useState(settings.reminderTone);
  const [isAnon, setIsAnon] = useState(settings.anonymous);

  if (!debt) return null;

  return (
    <div
      style={{
        padding: 12,
        minWidth: 340,
        maxWidth: 600,
        color: "#fff"
      }}
    >
      <div style={{ fontWeight: 700, fontSize: 22, color: primaryColor }}>
        Debt Details
      </div>
      <div style={{ marginTop: 13 }}>
        <b>Borrower:</b> {debt.borrower}
      </div>
      <div>
        <b>Amount:</b> ₹{debt.amount}
      </div>
      <div>
        <b>Lent On:</b> {debt.date}
      </div>
      <div>
        <b>Due By:</b> {debt.dueDate}
      </div>
      {debt.reason && (
        <div>
          <b>Reason:</b> {debt.reason}
        </div>
      )}
      <div>
        <b>Status:</b> <span style={{ color: statusColor(debt.status, { primary: primaryColor, accent: accentColor }) }}>{statusLabel(debt.status)}</span>
      </div>
      {/* Reminder actions */}
      <div style={{ marginTop: 18 }}>
        <div style={{ marginBottom: 6, color: accentColor, fontWeight: 500 }}>Send Reminder</div>
        <div>
          <select
            value={tone}
            onChange={(e) => setTone(e.target.value)}
            style={{ width: 160, marginRight: 10 }}
          >
            {REMINDER_TONES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <label style={{ marginLeft: 5 }}>
            <input
              type="checkbox"
              checked={isAnon}
              onChange={() => setIsAnon((v) => !v)}
              style={{ marginRight: 4 }}
            />
            Send Anonymously
          </label>
        </div>
        <div style={{ fontSize: 13, color: "#bdbdbd", margin: "5px 0" }}>
          <i>Sample: {tonePreview(tone)}</i>
        </div>
        <button
          className="lt-btn"
          style={{ background: accentColor, color: "#fff" }}
          disabled={debt.status !== "outstanding"}
          onClick={() => onSendReminder(debt.id, tone, isAnon)}
        >
          Send Reminder
        </button>
      </div>
      {/* Mark paid */}
      <div style={{ marginTop: 16 }}>
        <button
          className="lt-btn"
          style={{ background: primaryColor, color: "#fff" }}
          disabled={debt.status !== "outstanding"}
          onClick={() => onMarkPaid(debt.id)}
        >
          Mark as Paid
        </button>
      </div>
      <div style={{ marginTop: 20 }}>
        <div style={{ fontWeight: 500, fontSize: 16, color: "#B0FFAA", marginBottom: 6 }}>Reminder History</div>
        <ul style={{ fontSize: 13, color: "#a9e2ff", paddingLeft: 10 }}>
          {debt.reminders.length === 0 ? <li>No reminders sent yet.</li> : debt.reminders.map((r, idx) =>
            <li key={idx}>{new Date(r.date).toLocaleString()} - {r.tone} ({r.anonymous ? "Anon" : "Named"})</li>
          )}
        </ul>
      </div>
      <div style={{ marginTop: 14 }}>
        <strong>Borrower Actions:</strong>
        <ul>
          <li>Mark as repaid</li>
          <li>Request extension</li>
          <li>Repay via payment (simulated)</li>
        </ul>
      </div>
      <div style={{ color: "#757575", fontSize: 13, marginTop: 12 }}>
        * Actual emails/payments are simulated only (front-end demo).
      </div>
    </div>
  );
}

// PUBLIC_INTERFACE
function DebtHistory({ debts, colors }) {
  // Flatten all history events
  const events = debts.flatMap((d) =>
    (d.history || []).map((ev) => ({
      ...ev,
      borrower: d.borrower,
      amount: d.amount,
      debtId: d.id
    }))
  );
  if (events.length === 0)
    return (
      <div style={{ color: colors.disabled, marginTop: 7, fontSize: 15 }}>
        No debt history yet.
      </div>
    );
  return (
    <ul style={{ margin: "8px 0 0 8px" }}>
      {events.map((ev, idx) => (
        <li key={idx} style={{ marginBottom: 5 }}>
          {ev.type === "repaid" ? (
            <span style={{ color: colors.accent }}>
              [{new Date(ev.date).toLocaleDateString()}] {ev.borrower} repaid ₹{ev.amount}
            </span>
          ) : (
            <span style={{ color: colors.primary }}>
              [{new Date(ev.date).toLocaleDateString()}] {ev.borrower} requested extension for ₹{ev.amount}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

// PUBLIC_INTERFACE
function SettingsPanel({ settings, onChange, accentColor, primaryColor }) {
  const [_reminderTone, _setReminderTone] = useState(settings.reminderTone);
  const [_anonymous, _setAnonymous] = useState(settings.anonymous);

  function handleSave(e) {
    e.preventDefault();
    onChange({ reminderTone: _reminderTone, anonymous: _anonymous });
  }

  return (
    <form style={{ minWidth: 300 }} onSubmit={handleSave}>
      <div style={{ fontWeight: 700, fontSize: 20, color: accentColor, marginBottom: 16 }}>
        Settings
      </div>
      <label>Reminder Tone</label>
      <select
        value={_reminderTone}
        onChange={(e) => _setReminderTone(e.target.value)}
        style={{ width: "100%" }}
      >
        {REMINDER_TONES.map((t) => (
          <option key={t.value} value={t.value}>
            {t.label}
          </option>
        ))}
      </select>
      <div style={{ fontSize: 13, margin: "4px 0 9px", color: "#bdbdbd" }}>
        {tonePreview(_reminderTone)}
      </div>
      <label>
        <input
          type="checkbox"
          checked={_anonymous}
          onChange={() => _setAnonymous((v) => !v)}
          style={{ marginRight: 6 }}
        />
        Send reminders anonymously
      </label>
      <div style={{ marginTop: 20 }}>
        <button
          className="lt-btn"
          style={{ background: accentColor, color: "#fff", width: "100%" }}
          type="submit"
        >
          Save Settings
        </button>
      </div>
    </form>
  );
}

/**
 * PUBLIC_INTERFACE
 * Modal dialog that centers children in the visible window and ensures that content is never clipped by viewport boundaries.
 * If the modal's content exceeds the available vertical space, a scroll bar appears to give full visibility.
 */
function Modal({ children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(25,26,30,0.82)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1001,
        overflow: "auto",
        padding: 24
      }}
      onMouseDown={onClose}
    >
      <div
        onMouseDown={e => e.stopPropagation()}
        style={{
          background: "#212333",
          borderRadius: 11,
          boxShadow: "0 8px 32px rgba(0,0,0,0.25)",
          padding: 30,
          minWidth: 280,
          maxWidth: "95vw",
          maxHeight: "98vh",
          overflowY: "auto",
          border: "1.5px solid #2D9CDB",
          position: "relative",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <button
          className="lt-btn"
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "#1d232d",
            color: "#fff",
            border: "none",
            fontWeight: 700,
            padding: "5px 11px",
            borderRadius: 7,
            fontSize: 21,
            lineHeight: "16px"
          }}
          onClick={onClose}
          type="button"
        >
          ×
        </button>
        <div>{children}</div>
      </div>
    </div>
  );
}

// Utility helpers
const statusLabel = (status) => {
  switch (status) {
    case "outstanding":
      return "Outstanding";
    case "repaid":
      return "Repaid";
    case "extension_requested":
      return "Extension Requested";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
};
const statusColor = (status, colors) => {
  switch (status) {
    case "outstanding":
      return colors.primary || "#2D9CDB";
    case "repaid":
      return colors.accent || "#27AE60";
    case "extension_requested":
      return "#ffa439";
    case "cancelled":
      return "#BDBDBD";
    default:
      return colors.secondary;
  }
};

const thStyle = {
  padding: "10px 8px",
  textAlign: "left",
  fontWeight: 500,
  fontSize: 15,
  borderBottom: `1.6px solid #2D9CDB`
};
const tdStyle = {
  padding: "8px 7px",
  fontSize: 15.5
};

function tonePreview(tone) {
  switch (tone) {
    case "soft":
      return "Hi! Just a gentle reminder about the repayment 😊";
    case "funny":
      return "Knock knock! Who owes me money? Just kidding. Please repay soon!";
    case "formal":
      return "Dear borrower, this is a formal reminder for your repayment.";
    default:
      return "";
  }
}

export default LendTrackMain;
