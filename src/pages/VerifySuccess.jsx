import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function VerifySuccess() {
    const navigate = useNavigate();

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.icon}>✅</div>
                <h2 style={styles.title}>Account Verified!</h2>
                <p style={styles.text}>
                    Your Universal Bank account is now active. You can securely log in to manage your funds.
                </p>
                <button style={styles.button} onClick={() => navigate("/")}>
                    Go to Login
                </button>
            </div>
        </div>
    );
}

const styles = {
    container: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f4f7f6' },
    card: { background: '#fff', padding: '40px', borderRadius: '12px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', textAlign: 'center', maxWidth: '400px' },
    icon: { fontSize: '50px', marginBottom: '20px' },
    title: { color: '#2c3e50', marginBottom: '10px' },
    text: { color: '#7f8c8d', marginBottom: '30px', lineHeight: '1.5' },
    button: { width: '100%', padding: '12px', backgroundColor: '#1a73e8', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }
};