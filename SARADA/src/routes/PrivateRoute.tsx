import React from 'react';
import { UserRole } from '../shared/types';

interface PrivateRouteProps {
  userRole: UserRole | null;
  allowedRoles?: UserRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({
  userRole,
  allowedRoles,
  children,
  fallback = null,
}) => {
  if (!userRole) return <>{fallback}</>;
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) return <>{fallback}</>;
  return <>{children}</>;
};

export default PrivateRoute;
