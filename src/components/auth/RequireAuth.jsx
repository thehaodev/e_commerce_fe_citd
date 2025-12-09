import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth, { getRedirectPathForRole } from "../../hooks/useAuth";

export const RequireAuth = ({ allowedRoles, children }) => {
  const { user, isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn || !user) {
    const from = `${location.pathname}${location.search}`;
    return (
      <Navigate to={`/login?from=${encodeURIComponent(from)}`} replace />
    );
  }

  if (!allowedRoles?.includes(user.role)) {
    return <Navigate to={getRedirectPathForRole(user.role)} replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
