import React, { useState } from 'react';
import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Welcome from './Welcome';
// Import the new Borrower panel modal
import BorrowerPanelModal from './BorrowerPanelModal';

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

// Sample starting debt list data
const initialDebts = [
  {
    id: 1,
    borrower: 'Alice Smith',
    amount: 100,
    currency: 'USD',
    lentDate: '2024-04-05',
    dueDate: '2024-05-07',
    reason: 'Dinner outing',
    status: 'outstanding', // or 'repaid'
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
    currency: 'USD',
    lentDate: '2024-03-20',
    dueDate: '2024-04-20',
    reason: 'Concert tickets',
    status: 'repaid',
    isAnonymous: true,
    remindersSent: 2,
    history: [
      { type: 'reminder', date: '2024-03-28', tone: 'funny', via: 'sms', anonymous: true },
      { type: 'repayment', date: '2024-04-20', method: 'Venmo' },
    ],
  },
  {
    id: 3,
    borrower: 'Cara Miller',
    amount: 150,
    currency: 'USD',
    lentDate: '2023-12-01',
    dueDate: '2024-02-01',
    reason: 'Short-term rent help',
    status: 'outstanding',
    isAnonymous: false,
    remindersSent: 0,
    history: [],
  }
];

/**
 * DashboardPage is extracted to support routing below.
 */
function DashboardPage() {
  // All state and function logic is preserved inside App previously.
  // We'll hoist state up to App() component which renders <Routes>.
  const [debts, setDebts] = useState(initialDebts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState(null); // for view details
  const [reminderSettings, setReminderSettings] = useState({
    tone: 'soft',
    anonymous: false,
  });

  // --- Stats Aggregation ---
  const totalLent = debts.reduce((acc, d) => acc + d.amount, 0);
  const outstanding = debts.filter(d => d.status === 'outstanding').reduce((acc, d) => acc + d.amount, 0);
  const repaid = debts.filter(d => d.status === 'repaid').reduce((acc, d) => acc + d.amount, 0);

  // --- Debt Actions ---
  function addDebt(entry) {
    setDebts([
      {
        ...entry,
        id: Date.now(),
        status: 'outstanding',
        isAnonymous: reminderSettings.anonymous,
        remindersSent: 0,
        history: [],
      }, ...debts]);
    setShowAddForm(false);
  }
  function markDebtPaid(debtId) {
    setDebts(debts.map(d =>
      d.id === debtId ? { ...d, status: 'repaid', history: [...d.history, { type: 'repayment', date: (new Date()).toISOString().slice(0, 10), method: 'manual' }] } : d));
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
    setDebts(debts.map(d =>
      d.id === debtId
        ? {
            ...d,
            amount: d.amount - amount,
            status: d.amount - amount <= 0 ? 'repaid' : d.status,
            history: [
              ...d.history,
              { type: 'repayment', date: (new Date()).toISOString().slice(0, 10), method, amount }
            ]
          }
        : d));
    setSelectedDebt(null);
    alert("Repayment simulated!");
  }

  // --- UI Handlers ---
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
        <div className="container" style={{marginTop: 90, marginBottom: 40}}>
          <section style={{display: "flex", gap: "24px", marginBottom: 32, flexWrap: "wrap"}}>
            <SummaryCard label="Total Lent" value={totalLent} color={COLORS.secondary} darkText={true} icon="🔢"/>
            <SummaryCard 
              label={
                <span>
                  Outstanding&nbsp;
                  <span style={{position: 'relative', display: 'inline-block'}}>
                    <span 
                      tabIndex={0}
                      style={{
                        cursor: 'pointer', 
                        display: 'inline-block',
                        color: '#fff',
                        fontWeight: 600,
                        borderRadius: '100%',
                        width: '17px',
                        height: '17px',
                        fontSize: '13px',
                        verticalAlign: 'middle',
                        textAlign: 'center', 
                        background: 'rgba(45,156,219,0.7)'
                      }}
                      aria-label="Outstanding explanation"
                    >?</span>
                    <span 
                      style={{
                        visibility: 'hidden',
                        opacity: 0,
                        background: '#232933',
                        color: '#fff',
                        textAlign: 'left',
                        borderRadius: 7,
                        padding: '7px 10px',
                        position: 'absolute',
                        zIndex: 10,
                        minWidth: 180,
                        fontSize: 13,
                        left: '20px',
                        top: '-6px',
                        transition: 'opacity 0.14s',
                        boxShadow: '0 2px 12px rgba(0,0,0,0.22)',
                        pointerEvents: 'none'
                      }}
                      className="outstanding-tooltip"
                    >
                      Outstanding: Amount lent out that has not yet been repaid.
                    </span>
                  </span>
                </span>
              }
              value={outstanding}
              color={COLORS.primary}
              icon="💰"
              tooltip
            />
            <SummaryCard label="Repaid" value={repaid} color={COLORS.accent} icon="✅"/>
          </section>

          {/* Debt List */}
          <div style={{
            background: COLORS.surface,
            borderRadius: 12,
            boxShadow: "0 2px 8px rgba(40,56,80,0.10)",
            padding: 18,
            marginBottom: 18,
          }}>
            <h2 style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              marginBottom: 6,
              color: COLORS.primary,
              letterSpacing: 0.5,
            }}>Your Debts</h2>
            {debts.length === 0 && <div style={{color: COLORS.secondary, padding: 16}}>No records. Log a new lending above!</div>}
            <DebtList
              debts={debts}
              onView={debt => setSelectedDebt(debt)}
              onRemind={(debt) => sendReminder(debt.id, reminderSettings.tone, reminderSettings.anonymous)}
              onMarkPaid={markDebtPaid}
              accent={COLORS.accent}
              primary={COLORS.primary}
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
              onRepay={(amount, method) => borrowerRepay(selectedDebt.id, amount, method)}
              onRequestExtension={() => borrowerRequestExtension(selectedDebt.id)}
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

// Summary card for stats
function SummaryCard({label, value, color, icon, darkText, tooltip}) {
  // Tooltip logic only applied if tooltip prop is true (used for Outstanding metric)
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
      <div style={{fontWeight: 700, fontSize: "1.2em"}}>${value}</div>
      <div style={{fontSize: 14, opacity: 0.9, position: "relative"}}>
        {tooltip
          ? (
            <span
              style={{position: "relative"}}
              onMouseEnter={e => {
                const tooltipNode = e.currentTarget.querySelector(".outstanding-tooltip");
                if (tooltipNode) {
                  tooltipNode.style.visibility = "visible";
                  tooltipNode.style.opacity = "1";
                  tooltipNode.style.pointerEvents = 'auto';
                }
              }}
              onMouseLeave={e => {
                const tooltipNode = e.currentTarget.querySelector(".outstanding-tooltip");
                if (tooltipNode) {
                  tooltipNode.style.visibility = "hidden";
                  tooltipNode.style.opacity = "0";
                  tooltipNode.style.pointerEvents = 'none';
                }
              }}
              onFocus={e => {
                const tooltipNode = e.currentTarget.querySelector(".outstanding-tooltip");
                if (tooltipNode) {
                  tooltipNode.style.visibility = "visible";
                  tooltipNode.style.opacity = "1";
                  tooltipNode.style.pointerEvents = 'auto';
                }
              }}
              onBlur={e => {
                const tooltipNode = e.currentTarget.querySelector(".outstanding-tooltip");
                if (tooltipNode) {
                  tooltipNode.style.visibility = "hidden";
                  tooltipNode.style.opacity = "0";
                  tooltipNode.style.pointerEvents = 'none';
                }
              }}
              tabIndex={0}
            >
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
function DebtList({debts, onView, onRemind, onMarkPaid, accent, primary}) {
  if (!debts.length)
    return <div style={{padding: 12, color: "#D5DDE6"}}>No debts found.</div>;

  return (
    <div style={{overflowX: 'auto'}}>
      <table style={{
        width: "100%",
        borderCollapse: "collapse",
        minWidth: 620,
      }}>
        <thead>
          <tr style={{fontSize: 15, color: primary, background: 'rgba(45,156,219,0.07)'}}>
            <th style={tblCell({bold:true})}>Borrower</th>
            <th style={tblCell()}>Amount</th>
            <th style={tblCell()}>Due</th>
            <th style={tblCell()}>Reason</th>
            <th style={tblCell()}>Status</th>
            <th style={tblCell()}>Actions</th>
          </tr>
        </thead>
        <tbody>
        {debts.map(d => (
          <tr key={d.id} style={{
            background: d.status==='repaid' ? 'rgba(39,174,96,0.17)' : 'rgba(45,156,219,0.09)',
            borderRadius: 8,
            borderBottom: "1px solid #242F36"
          }}>
            <td style={tblCell()}>{d.borrower}</td>
            <td style={tblCell()}>${d.amount}</td>
            <td style={tblCell()}>{d.dueDate}</td>
            <td style={tblCell()}>{d.reason}</td>
            <td style={tblCell({color: d.status === 'repaid' ? accent : primary, bold:true})}>
              {d.status.charAt(0).toUpperCase() + d.status.slice(1)}
            </td>
            <td style={tblCell()}>
              <button className="btn" style={miniBtnStyle(primary)} onClick={()=>onView(d)}>View</button>
              {d.status !== 'repaid' &&
                <>
                  <button className="btn" style={miniBtnStyle(primary)} onClick={()=>onRemind(d)}>
                    Remind
                  </button>
                  <button className="btn" style={miniBtnStyle(accent)} onClick={()=>onMarkPaid(d.id)}>
                    Mark Paid
                  </button>
                </>
              }
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </div>
  );
}

// Modal for showing full debt details and borrower actions
function DebtDetailModal({debt, onClose, onMarkPaid, reminderSettings, onSendReminder, onRepay, onRequestExtension, accent, primary}) {
  const [showBorrowerActions, setShowBorrowerActions] = useState(false);
  const [repayAmount, setRepayAmount] = useState(debt.amount);
  const [repayMethod, setRepayMethod] = useState('Venmo');

  return (
    <Modal onClose={onClose}>
      <h2 style={{ color: primary }}>Debt Details</h2>
      <div style={{marginBottom:18}}>
        <strong>Borrower:</strong> {debt.borrower}<br/>
        <strong>Amount:</strong> <span style={{color: accent}}>${debt.amount}</span><br/>
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
          <button className="btn" style={miniBtnStyle(primary)} onClick={()=>setShowBorrowerActions(x=>!x)}>
            {showBorrowerActions ? "Hide" : "Borrower Actions"}
          </button>
        </div>
      }
      {/* Borrower Sim --> acts as the borrower's UI */}
      {showBorrowerActions && debt.status !== 'repaid' &&
        <div style={{padding: 10, background: "#242F31", borderRadius: 10, marginBottom:8}}>
          <h4 style={{margin: '8px 0', color: accent}}>Borrower Panel</h4>
          <form onSubmit={e => {e.preventDefault(); onRepay(Number(repayAmount), repayMethod);}}>
            <label style={{fontWeight:500}}>Repay Amount: </label>
            <input type="number" required min="1" max={debt.amount} value={repayAmount} onChange={e=>setRepayAmount(e.target.value)}
              style={{margin: '0 10px 5px 0', background: '#181C20', color:'#fff', border: `1px solid ${accent}`, borderRadius:4, width:80}} />
            <label style={{fontWeight:500}}>Method: </label>
            <select value={repayMethod} onChange={e=>setRepayMethod(e.target.value)}
              style={{marginRight: 10, background: '#181C20', color:'#fff', border: `1px solid ${primary}`, borderRadius:4}}>
              <option>Venmo</option>
              <option>PayPal</option>
              <option>Cash</option>
              <option>Bank</option>
            </select>
            <button className="btn" type="submit" style={miniBtnStyle(accent)}>Repay</button>
          </form>
          <button className="btn" style={miniBtnStyle(primary)} onClick={onRequestExtension}>
            Request Extension
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
                <span style={{color: accent}}>Repaid</span> ${h.amount || debt.amount} via {h.method} <span style={{color:'#bbb'}}>{h.date}</span>
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
    currency: 'USD',
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
        <input name="amount" type="number" required min="1" value={fields.amount} onChange={onChange} style={inputStyle()} /><br/>
        <label>Currency</label><br/>
        <select name="currency" value={fields.currency} onChange={onChange} style={inputStyle()} >
          <option>USD</option><option>EUR</option><option>GBP</option>
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
