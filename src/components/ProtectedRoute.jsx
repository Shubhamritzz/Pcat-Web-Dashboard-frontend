// src/components/ProtectedRoute.jsx
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // If not logged in → redirect to login
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise → show the requested page
  return children;
};

export default ProtectedRoute;
