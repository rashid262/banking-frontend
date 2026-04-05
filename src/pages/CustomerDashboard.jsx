import { useEffect, useState } from "react";
import { apiRequest } from "../api";

export default function CustomerDashboard() {
  const [accountData, setAccountData] = useState({ balance: 0, currency: "INR", description: "" });
  const [isVerified, setIsVerified] = useState(true); // 🛡️ Track verification status
  const [transactions, setTransactions] = useState([]);
  const [transfer, setTransfer] = useState({ recipientId: "", amount: "", note: "" });
  
  // 🛡️ State for Change Password - Ensure keys match Java DTO
  const [pwForm, setPwForm] = useState({ oldPassword: "", newPassword: "" });

  const accountId = localStorage.getItem("account_id");
  const username = localStorage.getItem("user");

  const EXCHANGE_RATE = 83.0;

  const fetchDashboardData = async () => {
    try {
      // 1. Get Balance and Account Details
      const balanceRes = await apiRequest(`/accounts/${accountId}/balance`, "GET");
      if (balanceRes?.status === "SUCCESS") {
        setAccountData(balanceRes.data); 
        // Sync verification status from backend
        setIsVerified(balanceRes.data.verified !== false); 
      }

      // 2. Get Transaction History
      const historyRes = await apiRequest(`/accounts/${accountId}/transactions`, "GET");
      if (historyRes?.status === "SUCCESS") {
        setTransactions(historyRes.data);
      }
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();
    
    // Safety check for unverified users
    if (!isVerified) {
        alert("❌ Transfer Denied: Your account must be verified first.");
        return;
    }

    if (transfer.recipientId === accountId) {
      alert("⚠️ You cannot transfer money to your own account.");
      return;
    }

    const res = await apiRequest("/transactions/transfer", "POST", {
      sourceAccountId: accountId,
      destinationAccountId: transfer.recipientId,
      amount: parseFloat(transfer.amount),
      note: transfer.note,
      idempotencyKey: crypto.randomUUID()
    });

    if (res?.status === "SUCCESS") {
      alert("✅ Transfer completed!");
      setTransfer({ recipientId: "", amount: "", note: "" });
      fetchDashboardData();
    } else {
      alert("❌ " + (res?.message || "Transfer failed"));
    }
  };

  // 🛡️ Handle Password Change
  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Check for empty fields before sending
    if (!pwForm.oldPassword || !pwForm.newPassword) {
        alert("Please enter both current and new passwords.");
        return;
    }

    const res = await apiRequest("/auth/change-password", "POST", {
        username: username,
        oldPassword: pwForm.oldPassword, // Matches backend DTO
        newPassword: pwForm.newPassword  // Matches backend DTO
    });

    // Handle JSON response instead of raw string to avoid HTTP 400
    if (res?.status === "SUCCESS") {
        alert("🔒 Security Updated: Your password has been changed successfully.");
        setPwForm({ oldPassword: "", newPassword: "" });
    } else {
        // Show actual error message from backend
        alert("❌ Update Failed: " + (res?.message || "Check your current password and try again."));
    }
  };

  useEffect(() => {
    if (accountId) fetchDashboardData();
  }, [accountId]);

  return (
    <div style={styles.container}>
      {/* 🛡️ VERIFICATION WARNING BANNER */}
      {!isVerified && (
        <div style={styles.warningBanner}>
          ⚠️ <strong>Account Restricted:</strong> Please check your email to verify your account. 
          Transfer features are disabled until verification is complete.
        </div>
      )}

      <header style={styles.header}>
        <div style={styles.userSection}>
          <div style={styles.avatar}>{username?.charAt(0).toUpperCase()}</div>
          <h3>Welcome back, {username}</h3>
        </div>
        <button onClick={() => { localStorage.clear(); window.location.href = "/"; }} style={styles.logoutBtn}>Logout</button>
      </header>

      <div style={styles.balanceCard}>
        <p style={{ fontSize: '12px', opacity: 0.8 }}>ACTIVE BALANCE</p>
        <h1 style={styles.balanceText}>
          {new Intl.NumberFormat(accountData.currency === 'INR' ? 'en-IN' : 'en-US', {
            style: 'currency',
            currency: accountData.currency || 'INR'
          }).format(accountData.balance)}
        </h1>
        <div style={styles.accountBadge}>
          {accountData.description || "No recent activity"}
        </div>
        <div style={{marginTop: '10px', fontSize: '12px'}}>ID: {accountId}</div>
      </div>

      <div style={styles.contentGrid}>
        {/* CARD 1: TRANSFER */}
        <div style={styles.card}>
          <h3>💸 Transfer Funds</h3>
          <form onSubmit={handleTransfer} style={styles.form}>
            <input 
              disabled={!isVerified}
              type="text" 
              placeholder={isVerified ? "Recipient Account ID" : "Verify account to enable"} 
              style={{...styles.input, backgroundColor: isVerified ? '#fff' : '#f0f0f0'}} 
              value={transfer.recipientId} 
              onChange={(e) => setTransfer({ ...transfer, recipientId: e.target.value })} 
              required 
            />
            <input 
              disabled={!isVerified}
              type="number" 
              step="0.01" 
              placeholder="Amount" 
              style={{...styles.input, backgroundColor: isVerified ? '#fff' : '#f0f0f0'}} 
              value={transfer.amount} 
              onChange={(e) => setTransfer({ ...transfer, amount: e.target.value })} 
              required 
            />
            
            {isVerified && transfer.amount && transfer.recipientId && (
              <div style={styles.previewBox}>
                <small>ℹ️ Estimate: {accountData.currency === 'USD' ? `₹${(transfer.amount * EXCHANGE_RATE).toLocaleString()}` : `$${(transfer.amount / EXCHANGE_RATE).toFixed(2)}`}</small>
              </div>
            )}

            <input 
              disabled={!isVerified}
              type="text" 
              placeholder="Note (Optional)" 
              style={{...styles.input, backgroundColor: isVerified ? '#fff' : '#f0f0f0'}} 
              value={transfer.note} 
              onChange={(e) => setTransfer({ ...transfer, note: e.target.value })} 
            />
            
            <button 
              type="submit" 
              disabled={!isVerified}
              style={{
                ...styles.transferBtn, 
                background: isVerified ? '#3f51b5' : '#a0a0a0',
                cursor: isVerified ? 'pointer' : 'not-allowed'
              }}
            >
              {isVerified ? "Confirm Transfer" : "Verification Required"}
            </button>
          </form>
        </div>

        {/* CARD 2: HISTORY */}
        <div style={styles.card}>
          <h3>📜 History</h3>
          <div style={styles.historyList}>
            {transactions.length > 0 ? (
              transactions.map((tx, index) => {
                const isCredit = tx.destinationAccountId === accountId;
                const displayAmount = isCredit ? tx.amount : (tx.sourceAmount || tx.amount);
                const displayNote = isCredit ? tx.destinationDescription : tx.sourceDescription;

                return (
                  <div key={index} style={styles.txRow}>
                    <div style={styles.txInfo}>
                      <div style={styles.txIcon}>{isCredit ? "📥" : "📤"}</div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                          {tx.type === "TRANSFER" ? (isCredit ? "Transfer Received" : "Transfer Sent") : "System Deposit"}
                        </div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{displayNote}</div>
                        <div style={{ fontSize: '11px', color: '#888' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                      </div>
                    </div>
                    <span style={{ color: isCredit ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
                      {isCredit ? "+" : "-"}{parseFloat(displayAmount).toFixed(2)}
                    </span>
                  </div>
                );
              })
            ) : (
              <p style={{textAlign: 'center', color: '#999'}}>No activity found yet.</p>
            )}
          </div>
        </div>

        {/* CARD 3: CHANGE PASSWORD 🛡️ */}
        <div style={{...styles.card, gridColumn: 'span 2'}}>
            <h3>🔒 Security Settings</h3>
            <p style={{fontSize: '13px', color: '#666', marginBottom: '15px'}}>Update your account password to stay secure.</p>
            <form onSubmit={handleChangePassword} style={{display: 'flex', gap: '15px', alignItems: 'center'}}>
                <input 
                    type="password" 
                    placeholder="Current Password" 
                    style={{...styles.input, marginBottom: 0, flex: 1}} 
                    value={pwForm.oldPassword} 
                    onChange={e => setPwForm({...pwForm, oldPassword: e.target.value})} 
                    required 
                />
                <input 
                    type="password" 
                    placeholder="New Secure Password" 
                    style={{...styles.input, marginBottom: 0, flex: 1}} 
                    value={pwForm.newPassword} 
                    onChange={e => setPwForm({...pwForm, newPassword: e.target.value})} 
                    required 
                />
                <button type="submit" style={{...styles.transferBtn, padding: '12px 25px', width: 'auto'}}>Update Password</button>
            </form>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px', maxWidth: '1100px', margin: '0 auto', fontFamily: '"Segoe UI", sans-serif', backgroundColor: '#f4f7fe', minHeight: '100vh' },
  warningBanner: { padding: '15px', backgroundColor: '#fff3cd', color: '#856404', borderRadius: '12px', marginBottom: '20px', border: '1px solid #ffeeba', textAlign: 'center', fontSize: '14px' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' },
  userSection: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', backgroundColor: '#3f51b5', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
  balanceCard: { background: 'linear-gradient(135deg, #0d1252 0%, #3f51b5 100%)', color: '#fff', padding: '30px', borderRadius: '20px', textAlign: 'center', marginBottom: '30px' },
  balanceText: { fontSize: '48px', margin: '10px 0' },
  accountBadge: { display: 'inline-block', padding: '6px 14px', background: 'rgba(255,255,255,0.2)', borderRadius: '20px', fontSize: '14px' },
  contentGrid: { display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '30px' },
  card: { background: '#fff', padding: '25px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' },
  form: { display: 'flex', flexDirection: 'column', gap: '15px' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px' },
  previewBox: { padding: '10px', backgroundColor: '#e8eaf6', borderRadius: '8px' },
  transferBtn: { padding: '12px', borderRadius: '8px', border: 'none', color: '#fff', fontWeight: 'bold', fontSize: '15px', transition: '0.3s', cursor: 'pointer', background: '#3f51b5' },
  txRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid #eee' },
  txInfo: { display: 'flex', alignItems: 'center', gap: '12px' },
  txIcon: { fontSize: '20px', padding: '8px', background: '#f0f2f5', borderRadius: '8px' },
  historyList: { maxHeight: '400px', overflowY: 'auto' },
  logoutBtn: { padding: '8px 16px', borderRadius: '6px', border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: '13px' }
};