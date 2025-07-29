'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Permissions } from '@/lib/better-auth-helpers/types';
import { UserRole } from '@/lib/better-auth-helpers/types';
import { authClient } from '@/lib/auth-client';

interface AuthGuardProps {
  children: ReactNode;
  role?: UserRole | UserRole[];
  permission?: Permissions;
  fallback?: ReactNode;
}

export function AuthGuard({ children, role, permission, fallback = null }: AuthGuardProps) {
  const { data: session, isPending } = authClient.useSession();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuthorization = async () => {
      if (isPending) {
        setIsChecking(true);
        return;
      }

      if (!session) {
        setIsAuthorized(false);
        setIsChecking(false);
        return;
      }

      // Default to authorized if no specific role or permission is required
      if (!role && !permission) {
        setIsAuthorized(true);
        setIsChecking(false);
        return;
      }

      // Role check
      if (role) {
        const userRoles = Array.isArray(session.user.role) ? session.user.role : [session.user.role];
        const requiredRoles = Array.isArray(role) ? role : [role];
        const hasRole = requiredRoles.some(r => userRoles.includes(r as UserRole));
        if (hasRole) {
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }
      }

      // Permission check
      if (permission) {
        const hasPermission = await authClient.admin.hasPermission({ permissions: permission });
        if (hasPermission) {
          setIsAuthorized(true);
          setIsChecking(false);
          return;
        }
      }

      // If neither role nor permission check passed
      setIsAuthorized(false);
      setIsChecking(false);
    };

    checkAuthorization();
  }, [session, isPending, role, permission]);

  if (isChecking) {
    return null; // Or a loading spinner
  }

  return isAuthorized ? <>{children}</> : <>{fallback}</>;
}
