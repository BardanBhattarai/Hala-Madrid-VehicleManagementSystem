import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const normalizeRole = (rawRole) => {
  const role = rawRole?.trim().toLowerCase();
  if (role === 'admin') return 'Admin';
  if (role === 'staff') return 'Staff';
  if (role === 'customer') return 'Customer';
  return rawRole?.trim();
};

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();
  const location = useLocation();
  const normalizedRole = normalizeRole(user?.role);

  if (!user) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(normalizedRole)) {
    // Role not authorized, redirect to home/dashboard based on role
    let redirectPath = '/';
    if (normalizedRole === 'Admin') redirectPath = '/admin/reports';
    else if (normalizedRole === 'Staff') redirectPath = '/staff/sales-invoices/new';
    else if (normalizedRole === 'Customer') redirectPath = '/customer/profile';
    
    return <Navigate to={redirectPath} replace />;
  }

  return children;
}
