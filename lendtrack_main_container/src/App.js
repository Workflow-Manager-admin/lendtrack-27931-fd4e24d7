import React, { useState } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './Welcome';
// RepaymentModal for in-line payments (not BorrowerPanel centralized)
import RepaymentModal from './RepaymentModal';

/**
 * Colors for theme (as per LendTrack spec)
 * primary: #2D9CDB
 * secondary: #F2F2F2
 * accent: #27AE60
 * dark: #181C20
 */
const COLORS = {
  primary: "#2D9CDB",
  secondary: "#F2F2F2",
  accent: "#27AE60",
  dark: "#181C20",
  danger: "#F44336",
  surface: "#23272F", // background cards
};

const REMINDER_TONES = [
  { name: 'Soft', value: 'soft' },
  { name: 'Funny', value: 'funny' },
  { name: 'Formal', value: 'formal' }
];

/**
 * Formats a number as Indian Rupees with comma separators and the ₹ symbol.
 * @param {number|string} amount
 * @returns {string}
 */
// PUBLIC_INTERFACE
function formatINR(amount) {
  if (typeof amount === "string") amount = parseFloat(amount);
  if (isNaN(amount)) return "₹0";
  // Use Intl API for Indian formatting
  return (
    "₹" +
    amount.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    })
  );
}

// Sample starting debt list data
const initialDebts = [
  {
    id: 1,
    borrower: 'Alice Smith',
    amount: 100,
    currency: 'INR',
    lentDate: '2024-04-05',
    dueDate: '2024-05-07',
    reason: 'Dinner outing',
    status: 'not paid', // or 'repaid'
    isAnonymous: false,
    remindersSent: 1,
    history: [
      { type: 'reminder', date: '2024-04-10', tone: 'soft', via: 'email', anonymous: false }
    ],
  },
  {
    id: 2,
    borrower: 'Bob Jones',
    amount: 200,
    currency: 'INR',
    lentDate: '2024-03-20',
    dueDate: '2024-04-20',
    reason: 'Concert tickets',
    status: 'repaid',
    isAnonymous: true,
    remindersSent: 2,
    history: [
      { type: 'reminder', date: '2024-03-28', tone: 'funny', via: 'sms', anonymous: true },
      { type: 'repayment', date: '2024-04-20', method: 'UPI' },
    ],
  },
  {
    id: 3,
    borrower: 'Cara Miller',
    amount: 150,
    currency: 'INR',
    lentDate: '2023-12-01',
    dueDate: '2024-02-01',
    reason: 'Short-term rent help',
    status: 'not paid',
    isAnonymous: false,
    remindersSent: 0,
    history: [],
  }
];

/**
 * DashboardPage is extracted to support routing below.
 */
function DashboardPage() {
  const [debts, setDebts] = useState(initialDebts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null); // for view details
  const [reminderSettings, setReminderSettings] = useState({
    tone: 'soft',
    anonymous: false,
  });
  // Dedicated Borrower Panel modal state
  const [showBorrowerPanel, setShowBorrowerPanel] = useState(false);
  // New: modal state for row-level full/installment payment, tracks {debt, mode}
  const [repayModal, setRepayModal] = useState({ open: false, debt: null, mode: null });

  // --- Stats Aggregation ---
  const totalLent = debts.reduce((acc, d) => acc + d.amount, 0);
  const notPaid = debts.filter(d => d.status === 'not paid').reduce((acc, d) => acc + d.amount, 0);
  const repaid = debts.filter(d => d.status === 'repaid').reduce((acc, d) => acc + d.amount, 0);

  // --- Debt Actions ---
  function addDebt(entry) {
    setDebts([
      {
        ...entry,
        id: Date.now(),
        status: 'not paid',
        isAnonymous: reminderSettings.anonymous,
        remindersSent: 0,
        history: [],
      }, ...debts]);
    setShowAddForm(false);
  }
  function markDebtPaid(debtId) {
    setDebts(debts.map(d =>
      d.id === debtId
        ? {
            ...d,
            status: 'repaid',
            history: [...d.history, { type: 'repayment', date: (new Date()).toISOString().slice(0, 10), method: 'manual' }],
          }
        : d
    ));
    setSelectedDebt(null);
  }
  function sendReminder(debtId, tone, anonymous) {
    setDebts(debts.map(d =>
      d.id === debtId
        ? {
            ...d,
            remindersSent: (d.remindersSent || 0) + 1,
            history: [
              ...d.history,
              {
                type: 'reminder',
                date: (new Date()).toISOString().slice(0, 10),
                tone,
                via: 'email',
                anonymous
              }
            ]
          }
        : d
    ));
    window.confirm("Reminder sent! (simulated)\nYour reminder was sent to the borrower.");
  }
  function borrowerRequestExtension(debtId, extraDays = 7) {
    setDebts(debts.map(d =>
      d.id === debtId
        ? {
            ...d,
            dueDate: (new Date(new Date(d.dueDate).getTime() + extraDays * 24 * 3600 * 1000)).toISOString().slice(0, 10),
            history: [
              ...d.history,
              { type: 'extension', date: (new Date()).toISOString().slice(0, 10), extraDays }
            ]
          }
        : d));
    alert("Extension requested (simulated)");
  }
  function borrowerRepay(debtId, amount, method) {
    setDebts(debts.map(d => {
      if (d.id !== debtId) return d;
      const remaining = d.amount - amount;
      // Don't allow negative remaining
      const safeRemaining = remaining < 0 ? 0 : remaining;
      return {
        ...d,
        amount: safeRemaining,
        status: safeRemaining <= 0 ? 'repaid' : d.status,
        history: [
          ...d.history,
          {
            type: 'repayment',
            date: (new Date()).toISOString().slice(0, 10),
            method,
            amount
          }
        ]
      };
    }));
    setSelectedDebt(null);
    alert("Repayment simulated!");
  }

  // --- UI Handlers and Layout ---
  return (
    <div className="app" style={{ background: COLORS.dark, minHeight: "100vh" }}>
      {/* LendTrack Navbar */}
      <nav className="navbar" style={{ background: "#212733", borderBottom: `2px solid ${COLORS.primary}` }}>
        <div className="container" style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
          <div className="logo" style={{color: COLORS.primary, fontWeight: 700, letterSpacing: 1}}>
            <span className="logo-symbol" style={{fontSize:'1.2em'}}>₤</span> LendTrack
          </div>
          <div style={{display: 'flex', gap: '14px'}}>
            <button className="btn" style={settingsBtnStyle(COLORS)} onClick={()=>setShowSettings(!showSettings)}>
              ⚙️ Settings
            </button>
            <button className="btn" style={primaryBtnStyle(COLORS)} onClick={()=>setShowAddForm(true)}>
              + Add Lending
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main>
        <div className="full-center-viewport">
          <div className="stats-bar" style={{marginBottom: 36}}>
            <section style={{
              display: "flex",
              gap: "24px",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "100%"
            }}>
              <SummaryCard label="Total Lent" value={totalLent} color={COLORS.secondary} darkText={true} icon="🔢"/>
              <SummaryCard
                label="Not Paid"
                value={outstanding}
                color={COLORS.primary}
                icon="💰"
              />
              <SummaryCard label="Repaid" value={repaid} color={COLORS.accent} icon="✅"/>
            </section>
          </div>

          {/* Per-row Repayment Modal, open if repayModal.open */}
          {repayModal.open && repayModal.debt && (
            <RepaymentModal
              debt={repayModal.debt}
              mode={repayModal.mode}
              onClose={() => setRepayModal({ open: false, debt: null, mode: null })}
              onRepay={borrowerRepay}
              onRequestExtension={borrowerRequestExtension}
              accent={COLORS.accent}
              primary={COLORS.primary}
            />
          )}

          {/* Centered/Prominent Debt List Box */}
          <div className="debts-centered-box">
            <h2 className="debts-title">Your Debts</h2>
            {debts.length === 0 && <div style={{color: COLORS.secondary, padding: 16}}>No records. Log a new lending above!</div>}
            <DebtList
              debts={debts}
              onView={debt => setSelectedDebt(debt)}
              onRemind={(debt) => sendReminder(debt.id, reminderSettings.tone, reminderSettings.anonymous)}
              onMarkPaid={markDebtPaid}
              accent={COLORS.accent}
              primary={COLORS.primary}
              onRepayFull={debt => setRepayModal({ open: true, debt, mode: "full" })}
              onRepayInstallment={debt => setRepayModal({ open: true, debt, mode: "installment" })}
            />
          </div>

          {/* Details Modal */}
          {selectedDebt &&
            <DebtDetailModal
              debt={selectedDebt}
              onClose={() => setSelectedDebt(null)}
              onMarkPaid={markDebtPaid}
              reminderSettings={reminderSettings}
              onSendReminder={() => sendReminder(selectedDebt.id, reminderSettings.tone, reminderSettings.anonymous)}
              accent={COLORS.accent}
              primary={COLORS.primary}
            />
          }

          {/* Add Debt Modal */}
          {showAddForm &&
            <AddLendingModal
              onAdd={addDebt}
              onCancel={() => setShowAddForm(false)}
              primary={COLORS.primary}
              accent={COLORS.accent}
            />
          }

          {/* Settings Modal */}
          {showSettings &&
            <SettingsModal
              reminderSettings={reminderSettings}
              setReminderSettings={setReminderSettings}
              onClose={() => setShowSettings(false)}
              primary={COLORS.primary}
            />
          }
        </div>
      </main>

      {/* Footer */}
      <footer style={{ color: COLORS.secondary, textAlign: "center", fontSize: 15, opacity: 0.70, marginBottom: 8 }}>
        <span style={{color:COLORS.primary, fontWeight: 600}}>LendTrack</span> — Manage your lending with ease 😎
      </footer>
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Routing: show Welcome page at root, dashboard at /dashboard, and default to Welcome
  return (
    <Routes>
      <Route path="/" element={<Welcome />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      {/* For URLs not recognized, redirect to welcome */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

// --- COMPONENTS ---

/**
 * Summary card for stats
 */
function SummaryCard({label, value, color, icon, darkText, tooltip}) {
  return (
    <div
      style={{
        background: color,
        color: darkText ? "#222" : "#fff",
        borderRadius: 12,
        minWidth: 148,
        minHeight: 80,
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 6px rgba(30,30,90,0.09)",
        position: "relative"
      }}
    >
      <span style={{fontSize: "1.8em", lineHeight: 1}}>{icon}</span>
      <div style={{fontWeight: 700, fontSize: "1.2em"}}>{formatINR(value)}</div>
      <div style={{fontSize: 14, opacity: 0.9, position: "relative"}}>
        {tooltip
          ? (
            <span style={{position: "relative"}} tabIndex={0}>
              {label}
            </span>
          )
          : label
        }
      </div>
    </div>
  );
}

// List debts on dashboard
function DebtList({
  debts, onView, onRemind, onMarkPaid, accent, primary,
  onRepayFull, onRepayInstallment
}) {
  if (!debts.length)
    return <div style={{padding: 12, color: "#D5DDE6"}}>No debts found.</div>;

  // Responsive scroll wrapper so table never overflows parent.
  return (
    <div className="debts-table-scroll-wrapper" style={{ maxWidth: "100%", overflowX: "auto" }}>
      <table
        className="debts-table"
        style={{
          tableLayout: "fixed", // fit columns within width
          background: "transparent",
        }}
      >
        <colgroup>
          <col style={{ width: "20%" }} />
          <col style={{ width: "15%" }} />
          <col style={{ width: "18%" }} />
          <col style={{ width: "20%" }} />
          <col style={{ width: "13%" }} />
          <col style={{ width: "14%" }} />
        </colgroup>
        <thead>
          <tr>
            <th>Borrower</th>
            <th>Amount</th>
            <th>Due</th>
            <th>Reason</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
        {debts.map(d => (
          <tr
            key={d.id}
            style={{
              background: d.status === "repaid"
                ? "rgba(39,174,96,0.17)"
                : "rgba(45,156,219,0.09)",
              borderRadius: 8,
              borderBottom: "1px solid #242F36",
            }}
          >
            <td title={d.borrower}>{d.borrower}</td>
            <td title={formatINR(d.amount)}>{formatINR(d.amount)}</td>
            <td title={d.dueDate}>{d.dueDate}</td>
            <td title={d.reason}>{d.reason}</td>
            <td style={{ color: d.status === "repaid" ? accent : primary, fontWeight: 700 }}>
              {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
            </td>
            <td className="actions-cell">
              <div className="debt-actions-btn-row">
                <button className="btn" style={miniBtnStyle(primary)} onClick={()=>onView(d)}>View</button>
                {d.status !== 'repaid' && (
                  <>
                    <button className="btn" style={miniBtnStyle(primary)} onClick={()=>onRemind(d)}>
                      Remind
                    </button>
                    <button className="btn" style={miniBtnStyle(accent)} onClick={()=>onMarkPaid(d.id)}>
                      Mark Paid
                    </button>
                    {/* Add repayment buttons */}
                    <button className="btn" style={miniBtnStyle(accent)} onClick={() => onRepayFull(d)}>
                      Full Payment
                    </button>
                    <button className="btn" style={miniBtnStyle(primary)} onClick={() => onRepayInstallment(d)}>
                      Installment Payment
                    </button>
                  </>
                )}
              </div>
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

// Modal for showing full debt details (borrower actions removed for dedicated Borrower Panel)
function DebtDetailModal({debt, onClose, onMarkPaid, reminderSettings, onSendReminder, accent, primary}) {
  return (
    <Modal onClose={onClose}>
      <h2 style={{ color: primary }}>Debt Details</h2>
      <div style={{marginBottom:18}}>
        <strong>Borrower:</strong> {debt.borrower}<br/>
        <strong>Amount:</strong> <span style={{color: accent}}>{formatINR(debt.amount)}</span><br/>
        <strong>Lent on:</strong> {debt.lentDate }<br/>
        <strong>Due:</strong> {debt.dueDate}<br/>
        <strong>Reason:</strong> <i>{debt.reason}</i><br/>
        <strong>Status:</strong> <span style={{color: debt.status==='repaid'?accent:primary}}>{debt.status.toUpperCase()}</span><br/>
        <strong>Sent Anonymously?</strong> {debt.isAnonymous ? "Yes" : "No"}
      </div>
      <div style={{marginBottom:14}}>
        <strong>Reminders Sent:</strong> {debt.remindersSent}
        <button className="btn" style={miniBtnStyle(primary)} onClick={onSendReminder}>Send Reminder</button>
      </div>
      {debt.status !== 'repaid' &&
        <div style={{marginBottom:16}}>
          <button className="btn" style={miniBtnStyle(accent)} onClick={()=>onMarkPaid(debt.id)}>
            Mark Paid
          </button>
        </div>
      }
      <h4 style={{marginTop: 18, color: primary}}>History</h4>
      <ol style={{fontSize: 15, marginLeft: 20}}>
        {debt.history.length === 0 && <li><i>No events yet.</i></li>}
        {debt.history.map((h, i) => (
          <li key={i}>
            {h.type === 'reminder' &&
              <span>
                <span style={{color: primary}}>Reminder</span> sent via <b>{h.via}</b> ({h.tone}), {h.anonymous ? "anonymously" : "with name"} <span style={{color:'#bbb'}}>{h.date}</span>
              </span>
            }
            {h.type === 'repayment' &&
              <span>
                <span style={{color: accent}}>Repaid</span> {formatINR(h.amount || debt.amount)} via {h.method} <span style={{color:'#bbb'}}>{h.date}</span>
              </span>
            }
            {h.type === 'extension' &&
              <span>
                <span style={{color:COLORS.primary}}>Extension</span> of {h.extraDays} days on <span style={{color:'#bbb'}}>{h.date}</span>
              </span>
            }
          </li>
        ))}
      </ol>
    </Modal>
  );
}

// Add Lending Modal (Form)
function AddLendingModal({onAdd, onCancel, primary, accent}) {
  const [fields, setFields] = useState({
    borrower: '',
    amount: '',
    currency: 'INR',
    lentDate: (new Date()).toISOString().slice(0,10),
    dueDate: '',
    reason: '',
  });
  const [error, setError] = useState('');
  // PUBLIC_INTERFACE
  function onChange(e) {
    setFields({...fields, [e.target.name]: e.target.value});
    setError('');
  }
  // PUBLIC_INTERFACE
  function submit(e) {
    e.preventDefault();
    if(!fields.borrower || !fields.amount || !fields.dueDate)
      return setError('Borrower, amount, and due date are required.');
    onAdd(fields);
  }
  return (
    <Modal onClose={onCancel}>
      <h2 style={{color: primary}}>Log New Lending</h2>
      <form onSubmit={submit}>
        <label>Name of Borrower <span style={{color:accent}}>*</span></label><br/>
        <input name="borrower" required value={fields.borrower} onChange={onChange} style={inputStyle()} /><br/>
        <label>Amount <span style={{color:accent}}>*</span></label><br/>
        <input
          name="amount"
          type="number"
          required
          min="1"
          value={fields.amount}
          onChange={onChange}
          style={inputStyle()}
          placeholder="Enter amount in ₹"
        /><br/>
        <label>Currency</label><br/>
        <select name="currency" value={fields.currency} onChange={onChange} style={inputStyle()} disabled>
          <option value="INR">INR (₹)</option>
        </select><br/>
        <label>Lent Date</label><br/>
        <input name="lentDate" type="date" value={fields.lentDate} onChange={onChange} style={inputStyle()} /><br/>
        <label>Due Date <span style={{color:accent}}>*</span></label><br/>
        <input name="dueDate" type="date" required value={fields.dueDate} onChange={onChange} style={inputStyle()} /><br/>
        <label>Reason (optional)</label><br/>
        <input name="reason" value={fields.reason} onChange={onChange} style={inputStyle()} /><br/>
        {error && <div style={{color:COLORS.danger, marginTop:6}}>{error}</div>}
        <div style={{marginTop:14, textAlign: "right"}}>
          <button className="btn" style={miniBtnStyle(primary)} type="button" onClick={onCancel}>Cancel</button>
          <button className="btn" style={miniBtnStyle(accent)} type="submit">Add</button>
        </div>
      </form>
    </Modal>
  );
}

// Modal for Reminder Tone/Anonymity Settings
function SettingsModal({reminderSettings, setReminderSettings, onClose, primary}) {
  // PUBLIC_INTERFACE
  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setReminderSettings({
      ...reminderSettings,
      [name]: type === "checkbox" ? checked : value
    });
  }
  return (
    <Modal onClose={onClose}>
      <h2 style={{color:primary}}>Reminder Settings</h2>
      <div style={{marginBottom:10}}>
        <label style={{fontWeight:500}}>Default Tone: </label>
        <select name="tone" value={reminderSettings.tone} onChange={handleChange} style={inputStyle()}>
          {REMINDER_TONES.map(o => <option value={o.value} key={o.value}>{o.name}</option>)}
        </select>
      </div>
      <div>
        <label style={{fontWeight:500}}>Send Anonymously: </label>
        <input type="checkbox" name="anonymous"
          checked={!!reminderSettings.anonymous} onChange={handleChange} />
      </div>
      <div style={{marginTop: 18, textAlign: "right"}}>
        <button className="btn" style={miniBtnStyle(primary)} onClick={onClose}>Close</button>
      </div>
    </Modal>
  );
}

/**
 * Modal wrapper component
 * Ensures modal content is always fully visible by:
 *  - making modal vertically responsive
 *  - using maxHeight and overflow auto
 */
function Modal({children, onClose}) {
  return (
    <div
      style={{
        position:'fixed', top:0, left:0, right:0, bottom:0,
        zIndex:5000,
        background:"rgba(0,0,0,.64)"
      }}
    >
      <div
        style={{
          background: "#22272D",
          color: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px 0 #000a",
          maxWidth: "98vw",
          width: 400,
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%,-50%)",
          padding: "32px 18px 20px 18px",
          maxHeight: "92vh", // ensure enough margin at top and bottom
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
            position:"absolute",
            right:12,
            top:12,
            background:"transparent",
            color:"#fff",
            fontSize:22,
            border:"none",
            cursor:"pointer"
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

// --- Inline Style Helpers ---

function tblCell({color, bold}={}) {
  return {
    borderBottom: "1px solid #263045",
    padding: "10px 8px",
    color: color || "#fff",
    fontWeight: bold ? 700 : 400,
    textAlign: "left",
    whiteSpace: 'nowrap'
  };
}
function primaryBtnStyle(COLORS) {
  return {
    backgroundColor: COLORS.primary,
    color: "#fff",
    border: "none",
    borderRadius: 6,
    fontWeight: 500, fontSize: 15,
    padding: "8px 18px",
    marginLeft: 0
  };
}
function settingsBtnStyle(COLORS) {
  return {
    backgroundColor: "#222733",
    color: COLORS.primary,
    border: `1px solid ${COLORS.primary}`,
    borderRadius: 6,
    fontWeight: 500, fontSize: 15,
    padding: "8px 14px"
  };
}
function miniBtnStyle(color) {
  return {
    background: color,
    color: "#fff",
    border: "none",
    borderRadius: 5,
    fontSize: 13,
    marginLeft: 3,
    marginRight: 3,
    padding: "6px 12px",
    cursor: "pointer"
  };
}
function inputStyle() {
  return {
    background: '#232733',
    color: '#fff',
    border: '1px solid #404C5B',
    borderRadius: 5,
    padding: "8px",
    marginBottom: 7,
    fontSize: 15,
    outline: "none",
    width: '93%'
  };
}



export default App;
