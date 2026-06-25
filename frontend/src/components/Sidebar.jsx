import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Sidebar({collapsed, setCollapsed}) {

  const navigate = useNavigate();
  

const handleLogout = () => {
  localStorage.clear();
  navigate("/");
};

  return (
    <div className={`sidebar ${collapsed ? "collapsed" : ""}`}>

      <div className="sidebar-top">
        

        {!collapsed && <h2 className="logo">AI Study Companion</h2>}
        <button
  className="toggle-btn"
  onClick={() => setCollapsed(!collapsed)}
  aria-label="Toggle sidebar"
>
  <span className="toggle-icon" />
</button>
      </div>

      <div className="nav-group">

        <button onClick={() => navigate("/home")}>
          🏠 {!collapsed && "Home"}
        </button>

        <button onClick={() => navigate("/newassessment")}>
          🧪 {!collapsed && "New Assessment"}
        </button>

        <button onClick={() => navigate("/history")}>
          📚 {!collapsed && "View My Assessments"}
        </button>

        <button onClick={() => navigate("/performance")}>
          📊 {!collapsed && "Performance"}
        </button>

        <button onClick={() => navigate("/profile")}>
          👤 {!collapsed && "Profile"}
        </button>
        <button className="sidebar-item logout" onClick={handleLogout}>
  ↪️ {!collapsed && "Logout"}
</button>

      </div>

    </div>
  );
}