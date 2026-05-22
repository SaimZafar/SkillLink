import React from "react";

export default function Landing() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#07080f",
      padding: "40px",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "48px" }}>
        <div style={{
          width: "44px", height: "44px", borderRadius: "10px",
          background: "#00ffcc",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontWeight: 800, fontSize: "22px", color: "#000",
        }}>S</div>
        <span style={{ fontWeight: 700, fontSize: "24px" }}>SkillLink</span>
      </div>

      <h1 style={{
        fontSize: "48px", fontWeight: 800,
        textAlign: "center", marginBottom: "16px", lineHeight: 1.1,
      }}>
        Welcome to <span style={{ color: "#00ffcc" }}>SkillLink</span>
      </h1>

      <p style={{
        color: "#888", fontSize: "16px",
        textAlign: "center", marginBottom: "56px",
        maxWidth: "400px", lineHeight: 1.7,
      }}>
        Pakistan's freelance marketplace. Choose how you want to sign in.
      </p>

      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", justifyContent: "center" }}>

        <div onClick={() => { window.location.href = "/login"; }} style={{
          width: "260px", padding: "32px",
          background: "#12131a",
          border: "1px solid #2a2a3a",
          borderRadius: "16px", cursor: "pointer",
          textAlign: "center",
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "#00ffcc"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "#2a2a3a"; }}
        >
          <div style={{ fontSize: "40px", marginBottom: "20px", color: '#00ffcc' }}>👤</div>
          <p style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>User</p>
          <p style={{ color: "#888", fontSize: "13px", lineHeight: 1.6, marginBottom: "24px" }}>
            Sign in as a Client or Freelancer to post projects, place bids and manage contracts.
          </p>
          <div style={{
            padding: "10px 20px", background: "#00ffcc",
            borderRadius: "8px", color: "#000", fontWeight: 700, fontSize: "13px",
          }}>
            Sign in as User
          </div>
        </div>

        <div onClick={() => { window.location.href = "/admin/login"; }} style={{
          width: "260px", padding: "32px",
          background: "#12131a",
          border: "1px solid #2a2a3a",
          borderRadius: "16px", cursor: "pointer",
          textAlign: "center",
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = "#ff4d00"; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = "#2a2a3a"; }}
        >
          <div style={{ fontSize: "40px", marginBottom: "20px", color: '#ff4d00' }}>⚙️</div>
          <p style={{ fontSize: "20px", fontWeight: 700, marginBottom: "8px" }}>Admin</p>
          <p style={{ color: "#888", fontSize: "13px", lineHeight: 1.6, marginBottom: "24px" }}>
            Sign in as Admin to view full platform data, analytics and manage all users(freelancers and clients).
          </p>
          <div style={{
            padding: "10px 20px", background: "#ff4d00",
            borderRadius: "8px", color: "#fff", fontWeight: 700, fontSize: "13px",
          }}>
            Sign in as Admin
          </div>
        </div>
      </div>

      <p style={{ marginTop: "48px", color: "#333", fontSize: "11px" }}>
        ORACLE 21C | NODE.JS | REACT | JWT
      </p>
    </div>
  );
}
