import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, role }) {
  const user = localStorage.getItem("user");

  if (!user) return <Navigate to="/" />;

  if (role === "admin" && !user.includes("admin")) {
    return <Navigate to="/home" />;
  }

  return children;
}

export default ProtectedRoute;