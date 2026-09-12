import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

const ProtectedRoute = ({
  children,
  requireAuth = true,
  roles = [], // e.g. ['admin']
  redirectTo = '/login',
}) => {
  const { user, loading, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  // ⏳ Show loader while checking auth
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // 🔐 Not logged in
  if (requireAuth && !isAuthenticated) {
    return (
      <Navigate
        to={redirectTo}
        replace
        state={{ from: location }} // 💡 preserve route
      />
    );
  }

  // 🚫 Role-based restriction
  if (roles.length > 0 && user && !roles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // ✅ All good
  return children;
};

export default ProtectedRoute;