import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../api";

export default function RoleSelect() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    const response = await apiRequest("/auth/login", "POST", form);
    
    if (response?.status === "SUCCESS") {
      // Destructure the dynamic data from the Backend DTO
      const { token, username, accountId, role } = response.data;

      localStorage.setItem("bank_token", token);
      localStorage.setItem("user", username);
      localStorage.setItem("account_id", accountId); 

      // Navigate based on the Role returned by the DB
      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/customer");
      }
    } else {
      alert("❌ " + (response?.message || "Login Failed"));
    }
    setLoading(false);
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.card}>
        <h1 style={{color: '#1a73e8'}}>Gemini Bank</h1>
        <p style={{color: '#666', marginBottom: '25px'}}>Production Secure Portal</p>
        <input style={styles.input} placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} />
        <input style={styles.input} type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
        <button style={styles.primaryBtn} onClick={handleLogin} disabled={loading}>
          {loading ? "Authenticating..." : "Login"}
        </button>
        <p style={{marginTop: '15px', fontSize: '14px'}}>
          New user? <span style={{color: '#1a73e8', cursor: 'pointer'}} onClick={() => navigate("/register")}>Create Account</span>
        </p>
      </div>
    </div>
  );
}

const styles = {
  authContainer: { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#f8f9fa' },
  card: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '350px', textAlign: 'center' },
  input: { width: '100%', padding: '12px', marginBottom: '15px', borderRadius: '6px', border: '1px solid #ddd', boxSizing: 'border-box' },
  primaryBtn: { width: '100%', padding: '12px', background: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};