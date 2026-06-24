import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Master.css";
import "../styles/Login.css";

function Login() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const allowedDomain = "@college.edu"; 

  const handleLogin = (e) => {
    e.preventDefault(); // Prevents optional form reload triggers
    setError("");

    if (!email) {
      setError("Email is required");
      return;
    }

    if (!email.endsWith(allowedDomain)) {
      setError(`Invalid user. Please use your college ID`);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      localStorage.setItem("user", email);
      navigate(email.includes("admin") ? "/admin" : "/home");
    }, 500);
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <h1>AI Study Companion</h1>
        <p>Learn smarter. Track progress. Improve faster.</p>
      </div>

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