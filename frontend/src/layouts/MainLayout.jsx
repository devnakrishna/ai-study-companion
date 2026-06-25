import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(true); // default = collapsed

  return (
    <div className="app-shell">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />

      <div className={`main-area ${collapsed ? "collapsed" : ""}`}>
        <Topbar collapsed={collapsed} setCollapsed={setCollapsed} />

        <div className="page-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}