import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (role === "admin" && userRole !== "admin") {
    return <Navigate to="/home" replace />;
  }

  if (role === "student" && userRole === "admin") {
    return <Navigate to="/admin" replace />;
  }

  return children;
}

export default ProtectedRoute;