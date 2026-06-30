import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Master.css";
import "../styles/Login.css";

function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [collegeId, setCollegeId] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment,setSelectedDepartment]=useState("");
  const [contactNo, setContactNo] = useState("");
  const [address, setAddress] = useState("");
  
  const [collegesList, setCollegesList] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    fetch("http://localhost:8000/colleges")
      .then((res) => res.json())
      .then((data) => {
        setCollegesList(data);
        setCollegeId(""); // Default to empty select option
      })
      .catch((err) => console.error("Error fetching colleges:", err));
  }, []);
useEffect(() => {
  if (!collegeId) return;

  fetch(`http://localhost:8000/colleges/${collegeId}/departments`)
    .then(res => res.json())
    .then(data => {
      setDepartments(data);
      setSelectedDepartment(""); 
    })
    .catch(console.error);
}, [collegeId]);
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

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
        setError(data.detail || "Incorrect credentials");
        setLoading(false);
        return;
      }

      localStorage.setItem("user_id", data.user_id);
      localStorage.setItem("name", `${data.first_name || ""} ${data.last_name || ""}`.trim() || data.email);
      localStorage.setItem("first_name", data.first_name || "");
      localStorage.setItem("last_name", data.last_name || "");
      localStorage.setItem("email", data.email);
      localStorage.setItem("college_id", data.college_id);
      localStorage.setItem("college", data.college || "N/A");
      localStorage.setItem("department", data.department || "");
      localStorage.setItem("contact_no", data.contact_no || "");
      localStorage.setItem("address", data.address || "");
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("role", data.role);
      if (data.profile_pic) {
        localStorage.setItem("profile_pic", data.profile_pic);
      } else {
        localStorage.removeItem("profile_pic");
      }

      if (data.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMsg("");

    if (!email || !password || !firstName || !lastName || !collegeId || !selectedDepartment || !contactNo || !address) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          email: email.trim(),
          password: password,
          college_id: Number(collegeId),
          department: selectedDepartment.trim(),
          contact_no: contactNo.trim() || null,
          address: address.trim() || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Signup failed");
        setLoading(false);
        return;
      }

      setSuccessMsg("Registration successful! You can now log in.");
     
      setPassword("");
      setEmail("");
       setIsSignup(false);
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
        <div className={`card login-card ${isSignup ? "signup-card" : ""}`}>
          <h2 className="login-title">{isSignup ? "Create Account" : "Welcome"}</h2>
          {successMsg && <div style={{ color: "#22c55e", fontSize: "14px", fontWeight: "500", marginBottom: "8px" }}>{successMsg}</div>}

          <form onSubmit={isSignup ? handleSignup : handleLogin} style={{ width: "100%" }}>
            {isSignup && (
              <div style={{ display: "flex", gap: "10px" }}>
                <input
                  type="text"
                  className="input"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
                <input
                  type="text"
                  className="input"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
            )}

            <input
              type="email"
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              className="input"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {isSignup && (
              <>
                <select
                  className="select-input"
                  value={collegeId}
                  onChange={(e) => setCollegeId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select your College</option>
                  {collegesList.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>

                <select disabled={!collegeId}
  className="select-input"
  value={selectedDepartment}
  onChange={(e) => setSelectedDepartment(e.target.value)}
  required
>
  <option value="">Select Department</option>
  {departments.map((d, index) => (
    <option key={index} value={d.name}>
      {d.name}
    </option>
  ))}
</select>

                <input
                  type="text"
                  className="input"
                  placeholder="Contact Number"
                  value={contactNo}
                  onChange={(e) => setContactNo(e.target.value)}
                  required
                />

                <input
                  type="text"
                  className="input"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </>
            )}

            {error && <div className="error-message">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: "10px" }}
            >
              {loading ? "Connecting..." : isSignup ? "Sign Up" : "Login"}
            </button>
          </form>

          <div
            className="login-toggle-link"
            onClick={() => {
              setIsSignup(!isSignup);
              setEmail("");
              setPassword("");
              setFirstName("");
              setLastName("");
              setCollegeId("");
              setDepartments([]);        
              setSelectedDepartment(""); 
              setContactNo("");
              setAddress("");
              setError("");
              setSuccessMsg("");
            }}
          >
            {isSignup ? "Already have an account? Log In" : "Don't have an account? Sign Up"}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
