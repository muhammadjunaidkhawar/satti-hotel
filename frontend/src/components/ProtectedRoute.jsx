import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { isAuthenticated as checkAuth } from "../utils/auth";

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Also check localStorage directly as a fallback (in case state hasn't updated yet)
  const hasToken = checkAuth();

  if (isLoading) {
    // Show loading state while checking authentication
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#000000]">
        <div className="text-[#FF9500]">Loading...</div>
      </div>
    );
  }

  // Allow access if either the auth state or localStorage indicates authentication
  if (!isAuthenticated && !hasToken) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" replace />;
  }

  return children;
}
