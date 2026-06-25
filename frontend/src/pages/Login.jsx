import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Master.css";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email and password is required");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          email: email.trim(),
          password: password 
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail);
        setLoading(false);
        return;
      }

      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("name", data.name);
      localStorage.setItem("email", data.email);
      localStorage.setItem("college", data.college);
      localStorage.setItem("department", data.department);

      navigate("/home");
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      
      {/* --- UPGRADED LEFT PANEL --- */}
      <div className="login-left">
        {/* Animated Background Orbs */}
        <div className="ambient-orb orb-1"></div>
        <div className="ambient-orb orb-2"></div>

        <div className="login-left-content">
          <div className="badge">✨ Your Personal AI Tutor</div>
          <h1>AI Study Companion</h1>
          <p>Learn smarter. Track progress. Improve faster.</p>

          
        </div>
      </div>
      {/* --------------------------- */}

      <div className="login-right">
        <div className="card login-card">
          <h2 className="login-title">Welcome</h2>
          <p className="login-sub">Login with institutional email</p>

          <form onSubmit={handleLogin} style={{ width: "100%" }}>
            <input 
              type="email"
              className="input" 
              placeholder="Enter your college email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
            />
            <input
              type="password"
              className="input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            
            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
            >
              {loading ? "Connecting..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;