import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Home, 
  FlaskConical, 
  BookOpen, 
  BarChart3, 
  User, 
  LogOut 
} from "lucide-react";
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
          <Home className="sidebar-icon" />
          {!collapsed && "Home"}
        </button>

        <button onClick={() => navigate("/newassessment")}>
    <FlaskConical className="sidebar-icon" />
    {!collapsed && "New Assessment"}
  </button>

  <button onClick={() => navigate("/performance")}>
    <BarChart3 className="sidebar-icon" />
    {!collapsed && "View My Assessments"}
  </button>

  <button onClick={() => navigate("/profile")}>
    <User className="sidebar-icon" />
    {!collapsed && "Profile"}
  </button>

      </div>

      <div className="sidebar-bottom">
        <button className="sidebar-item logout" onClick={handleLogout}>
          <LogOut className="sidebar-icon" />
          {!collapsed && "Logout"}
        </button>
      </div>

    </div>
  );
}