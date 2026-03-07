import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth", { state: { from: location.pathname } });
    }
  }, [user, loading, navigate, location]);

  if (loading) return null;
  if (!user) return null;

  return <>{children}</>;
};

export default ProtectedRoute;
