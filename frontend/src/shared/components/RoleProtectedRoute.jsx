import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * RoleProtectedRoute component to guard route paths based on user roles.
 * @param {React.ReactNode} children - The target component to render if authorized.
 * @param {string[]} allowedRoles - List of authorized role names (e.g. ['Admin']).
 */
export default function RoleProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-white text-xl animate-pulse font-semibold">Validating credentials...</div>
      </div>
    );
  }

  // 1. If user is not authenticated, redirect to /login with state preservation
  if (!user) {
    console.log('[DEBUG] RoleProtectedRoute - Unauthenticated user. Redirecting to /login.');
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. If user role is not inside allowedRoles list, block and redirect to role dashboard root (/)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn(
      `[DEBUG] RoleProtectedRoute - Access Denied for role '${user.role}'. Required one of:`,
      allowedRoles
    );
    return <Navigate to="/" replace />;
  }

  // 3. Render children components if fully authorized
  return children;
}
