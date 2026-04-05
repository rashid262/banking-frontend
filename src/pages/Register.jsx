import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function Register() {
  const [form, setForm] = useState({ 
    username: "", 
    email: "", // 
    passwordHash: "", 
    accountId: "",
    currency: "INR" 
  });
  
  const navigate = useNavigate();
  const accountRegex = /^UB-\d{4}$/;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; 

  const handleRegister = async () => {
    // 1. Check for empty fields
    if (!form.username.trim() || !form.email.trim() || !form.passwordHash.trim() || !form.accountId.trim()) {
      alert("⚠️ All fields are required.");
      return;
    }

    // 2. Email Format Validation
    if (!emailRegex.test(form.email)) {
      alert("❌ Please enter a valid email address.");
      return;
    }

    // 3. Account Number Format Validation
    if (!accountRegex.test(form.accountId)) {
      alert("❌ Invalid Format! Use UB-XXXX (e.g., UB-1001)");
      return;
    }

    const res = await apiRequest("/auth/register", "POST", form);
    
    if (res?.status === "SUCCESS") {
      alert("✅ Registration Successful! Please check your email for the verification link.");
      navigate("/");
    } else {
      alert("❌ " + (res?.message || "Registration failed"));
    }
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.card}>
        <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333' }}>Universal Bank</h2>
        <p style={{ textAlign: 'center', marginBottom: '20px', fontSize: '14px', color: '#666' }}>Create your account</p>
        
        <input 
          style={styles.input} 
          placeholder="Choose Username" 
          value={form.username}
          onChange={e => setForm({...form, username: e.target.value})} 
        />

        <input 
          style={styles.input} 
          type="email"
          placeholder="Email Address" 
          value={form.email}
          onChange={e => setForm({...form, email: e.target.value})} 
        />
        
        <input 
          style={styles.input} 
          type="password" 
          placeholder="Password" 
          value={form.passwordHash}
          onChange={e => setForm({...form, passwordHash: e.target.value})} 
        />
        
        <input 
          style={styles.input} 
          placeholder="Account Number (UB-XXXX)" 
          value={form.accountId}
          onChange={e => setForm({...form, accountId: e.target.value})} 
        />

        <select 
          style={styles.input} 
          value={form.currency} 
          onChange={e => setForm({...form, currency: e.target.value})}
        >
          <option value="INR">INR (Indian Rupee)</option>
          <option value="USD">USD (US Dollar)</option>
        </select>
        
        <button style={styles.primaryBtn} onClick={handleRegister}>Sign Up</button>
        <button style={styles.linkBtn} onClick={() => navigate("/")}>Back to Login</button>
      </div>
    </div>
  );
}

const styles = {
  authContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f0f2f5' },
  card: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', width: '380px' },
  input: { width: '100%', padding: '14px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', fontSize: '14px' },
  primaryBtn: { width: '100%', padding: '14px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' },
  linkBtn: { width: '100%', background: 'none', border: 'none', color: '#555', marginTop: '15px', cursor: 'pointer', fontSize: '14px' }
};