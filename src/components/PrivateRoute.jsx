import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function PrivateRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading)
    return (
      <div
        style={{
          padding: "40px",
          textAlign: "center",
          fontSize: "18px",
          fontWeight: "500",
          color: "#333",
        }}
      >
        Loading...
      </div>
    );

  return user ? children : <Navigate to="/login" replace />;
}
