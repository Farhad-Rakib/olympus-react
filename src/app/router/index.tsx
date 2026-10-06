import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthGuard } from '../../core/guards/auth.guard';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { AuthCallbackPage } from '../../features/auth/pages/AuthCallbackPage';
import { DashboardPage } from '../../features/dashboard/pages/DashboardPage';
import { UsersPage } from '../../features/users/pages/UsersPage';
import { RolesPage } from '../../features/roles/pages/RolesPage';
import { PermissionsPage } from '../../features/permissions/pages/PermissionsPage';
import { RolePermissionsPage } from '../../features/role-permissions/pages/RolePermissionsPage';
import { UserRolesPage } from '../../features/user-roles/pages/UserRolesPage';
import { MenuPage } from '../../features/menu/pages/MenuPage';
import { ReportsPage } from '../../features/reports/pages/ReportsPage';
import { PreferencesPage } from '../../features/preferences/pages/PreferencesPage';
import { ProfilePage } from '../../features/profile/pages/ProfilePage';
import { SiteSettingsPage } from '../../features/site-settings/pages/SiteSettingsPage';
import { AuditLogsPage } from '../../features/audit-logs/pages/AuditLogsPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';

const guarded = (element: React.ReactElement, permission: string) => (
  <PermissionGuard permissions={[permission]}>{element}</PermissionGuard>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <LoginPage /> },
      { path: 'auth/callback', element: <AuthCallbackPage /> },
    ],
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <DashboardLayout />
      </AuthGuard>
    ),
    children: [
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'users', element: guarded(<UsersPage />, 'users.read') },
      { path: 'roles', element: guarded(<RolesPage />, 'roles.read') },
      { path: 'permissions', element: guarded(<PermissionsPage />, 'permissions.read') },
      { path: 'roles/permissions', element: guarded(<RolePermissionsPage />, 'role-permissions.read') },
      { path: 'users/roles', element: guarded(<UserRolesPage />, 'user-roles.read') },
      { path: 'menu-management', element: guarded(<MenuPage />, 'menus.read') },
      { path: 'reports', element: guarded(<ReportsPage />, 'reports.read') },
      { path: 'preferences', element: <PreferencesPage /> },
      { path: 'profile', element: <ProfilePage /> },
      { path: 'site-settings', element: guarded(<SiteSettingsPage />, 'site-settings.read') },
      { path: 'audit-logs', element: guarded(<AuditLogsPage />, 'audit.read') },
    ],
  },
  { path: '/403', element: <ForbiddenPage /> },
  { path: '*', element: <NotFoundPage /> },
]);
