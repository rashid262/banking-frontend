import { useState, useEffect } from "react";
import { apiRequest } from "../api";

export default function AdminDashboard() {
  const [accForm, setAccForm] = useState({ id: "", username: "", email: "", currency: "INR" });
  const [creditForm, setCreditForm] = useState({ id: "", amount: "", key: "" });
  
  // 🕵️ State for the Global Money Flow
  const [globalLogs, setGlobalLogs] = useState([]);

  const accountRegex = /^UB-\d{4}$/;

  // 🕵️ Fetch Global Transactions
  const fetchGlobalLogs = async () => {
    const res = await apiRequest("/admin/transactions/all", "GET");
    if (res?.status === "SUCCESS") {
      setGlobalLogs(res.data);
    }
  };

  useEffect(() => {
    fetchGlobalLogs();
    // Auto-refresh every 30 seconds for a "Live" feel
    const interval = setInterval(fetchGlobalLogs, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleCreate = async () => {
    if (!accForm.id || !accForm.username || !accForm.email) {
      return alert("❌ Missing Information: Please enter Username, Email, and Account Number.");
    }

    if (!accountRegex.test(accForm.id)) {
      return alert("❌ Invalid Format! Use UB-XXXX (e.g., UB-1001)");
    }

    const res = await apiRequest("/accounts", "POST", { 
      accountId: accForm.id, 
      username: accForm.username,
      email: accForm.email, 
      currency: accForm.currency 
    });

    if (res?.status === "SUCCESS") {
      alert(`✅ Account ${accForm.id} provisioned!\n📧 Credentials sent to: ${accForm.email}.`);
      setAccForm({ id: "", username: "", email: "", currency: "INR" });
    } else {
      alert("❌ Provisioning Failed: " + (res?.message || "Error"));
    }
  };

  const handleCredit = async () => {
    if (!creditForm.id || !creditForm.amount) return alert("Please enter Target ID and Amount");

    const res = await apiRequest(`/accounts/${creditForm.id}/credit`, "POST", {
      amount: parseFloat(creditForm.amount), 
      currency: "INR", 
      idempotencyKey: creditForm.key || crypto.randomUUID()
    });
    
    if (res?.status === "SUCCESS") {
      alert("💰 Funds Dispatched Successfully!");
      setCreditForm({ id: "", amount: "", key: "" });
      fetchGlobalLogs(); // Refresh logs immediately
    } else {
      alert("❌ Credit Failed: " + (res?.message || "Error"));
    }
  };

  return (
    <div style={styles.dashboard}>
      <header style={styles.header}>
        <div style={styles.headerTitle}>
          <h1 style={{color: '#1a73e8', margin: 0}}>Admin Command Center</h1>
          <p style={{margin: 0, fontSize: '14px', color: '#666'}}>Universal Bank Management System</p>
        </div>
        <button style={styles.logoutBtn} onClick={() => {localStorage.clear(); window.location.href="/"}}>Logout</button>
      </header>
      
      <div style={styles.grid}>
        {/* CARD 1: ACCOUNT PROVISIONING */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>🚀 Open New Account</h3>
          <p style={styles.subText}>Create a new client with a system-generated secure password.</p>
          
          <label style={styles.label}>Username</label>
          <input style={styles.input} placeholder="e.g. John Doe" value={accForm.username} onChange={e => setAccForm({...accForm, username: e.target.value})} />

          <label style={styles.label}>Client Email</label>
          <input style={styles.input} type="email" placeholder="name@example.com" value={accForm.email} onChange={e => setAccForm({...accForm, email: e.target.value})} />
          
          <label style={styles.label}>Account ID</label>
          <input style={styles.input} placeholder="UB-XXXX" value={accForm.id} onChange={e => setAccForm({...accForm, id: e.target.value})} />
          
          <label style={styles.label}>Primary Currency</label>
          <select style={styles.input} value={accForm.currency} onChange={e => setAccForm({...accForm, currency: e.target.value})}>
             <option value="INR">INR (₹)</option>
             <option value="USD">USD ($)</option>
          </select>
          <button style={styles.primaryBtn} onClick={handleCreate}>Provision & Dispatch Invite</button>
        </div>

        {/* CARD 2: VAULT DISBURSEMENT */}
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>💸 Credit Vault</h3>
          <p style={styles.subText}>Inject liquidity directly into client accounts from SYSTEM_VAULT.</p>
          <label style={styles.label}>Target Account ID</label>
          <input style={styles.input} placeholder="UB-XXXX" value={creditForm.id} onChange={e => setCreditForm({...creditForm, id: e.target.value})} />
          <label style={styles.label}>Amount to Credit</label>
          <input style={styles.input} type="number" placeholder="0.00" value={creditForm.amount} onChange={e => setCreditForm({...creditForm, amount: e.target.value})} />
          <label style={styles.label}>Idempotency Key</label>
          <input style={styles.input} placeholder="Auto-generated" value={creditForm.key} onChange={e => setCreditForm({...creditForm, key: e.target.value})} />
          <button style={styles.successBtn} onClick={handleCredit}>Authorize Disbursement</button>
        </div>

        {/* 🕵️ CARD 3: GLOBAL MONEY FLOW (SPAN FULL WIDTH) */}
        <div style={{...styles.card, gridColumn: 'span 2'}}>
          <h3 style={styles.cardTitle}>🛰️ Global Money Flow Tracker</h3>
          <p style={styles.subText}>Real-time monitoring of all bank-wide transactions.</p>
          
          <div style={styles.logTable}>
            <div style={styles.tableHeader}>
              <span>Timestamp</span>
              <span>Source</span>
              <span>Direction</span>
              <span>Destination</span>
              <span>Amount</span>
              <span>Type</span>
            </div>
            
            {globalLogs.length > 0 ? globalLogs.map((tx, idx) => (
              <div key={idx} style={styles.tableRow}>
                <span style={{fontSize: '12px'}}>{new Date(tx.createdAt).toLocaleString()}</span>
                <span style={tx.sourceAccountId === "SYSTEM_VAULT" ? styles.systemText : styles.userText}>{tx.sourceAccountId}</span>
                <span>➔</span>
                <span style={styles.userText}>{tx.destinationAccountId}</span>
                <span style={{fontWeight: 'bold'}}>{tx.amount.toFixed(2)}</span>
                <span style={tx.type === "CREDIT" ? styles.badgeBlue : styles.badgeGreen}>{tx.type}</span>
              </div>
            )) : <p style={{textAlign: 'center', padding: '20px'}}>No transactions detected in the system.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboard: { padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: '"Inter", sans-serif', backgroundColor: '#f8f9fa', minHeight: '100vh' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: '2px solid #eef0f2', paddingBottom: '20px' },
  headerTitle: { display: 'flex', flexDirection: 'column' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' },
  card: { background: '#fff', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', border: '1px solid #eee' },
  cardTitle: { margin: '0 0 5px 0', fontSize: '18px', color: '#1a202c' },
  subText: { fontSize: '13px', color: '#718096', marginBottom: '20px' },
  label: { fontSize: '12px', fontWeight: 'bold', color: '#4a5568', marginBottom: '5px', display: 'block' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', boxSizing: 'border-box', fontSize: '14px', outline: 'none' },
  primaryBtn: { width: '100%', padding: '14px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
  successBtn: { width: '100%', padding: '14px', background: '#34a853', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px' },
  logoutBtn: { padding: '10px 20px', background: '#e53e3e', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '500' },
  
  // Table Styles
  logTable: { marginTop: '10px', maxHeight: '400px', overflowY: 'auto', border: '1px solid #edf2f7', borderRadius: '8px' },
  tableHeader: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.5fr 1fr 1fr 1fr', padding: '12px', background: '#f7fafc', fontWeight: 'bold', fontSize: '13px', borderBottom: '1px solid #edf2f7' },
  tableRow: { display: 'grid', gridTemplateColumns: '1.5fr 1fr 0.5fr 1fr 1fr 1fr', padding: '12px', fontSize: '13px', borderBottom: '1px solid #edf2f7', alignItems: 'center' },
  systemText: { color: '#1a73e8', fontWeight: 'bold' },
  userText: { color: '#2d3748', fontWeight: '500' },
  badgeBlue: { background: '#ebf8ff', color: '#2b6cb0', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' },
  badgeGreen: { background: '#f0fff4', color: '#2f855a', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold', textAlign: 'center' }
};