import { Suspense, lazy, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { AuthGuard } from '../../core/guards/auth.guard';
import { PermissionGuard } from '../../core/guards/permission.guard';
import { Loader } from '../../components/ui/Loader/Loader';
import { LoginPage } from '../../features/auth/pages/LoginPage';
import { PreferencesPage } from '../../features/preferences/pages/PreferencesPage';
import { NotFoundPage } from '../pages/NotFoundPage';
import { ForbiddenPage } from '../pages/ForbiddenPage';

const DashboardPage = lazy(() =>
  import('../../features/dashboard/pages/DashboardPage').then((m) => ({
    default: m.DashboardPage,
  }))
);
const UsersPage = lazy(() =>
  import('../../presentation/pages/UsersPage').then((m) => ({
    default: m.UsersPage,
  }))
);
const ActivityLogPage = lazy(() =>
  import('../../features/activity/pages/ActivityLogPage').then((m) => ({
    default: m.ActivityLogPage,
  }))
);
const ProfilePage = lazy(() =>
  import('../../features/profile/pages/ProfilePage').then((m) => ({
    default: m.ProfilePage,
  }))
);
const SettingsLayout = lazy(() =>
  import('../../features/settings/pages/SettingsLayout').then((m) => ({
    default: m.SettingsLayout,
  }))
);
const ReportsPage = lazy(() =>
  import('../../features/reports/pages/ReportsPage').then((m) => ({
    default: m.ReportsPage,
  }))
);

const withSuspense = (element: ReactNode) => (
  <Suspense fallback={<Loader text="Loading page..." />}>
    {element}
  </Suspense>
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
      {
        path: 'login',
        element: <LoginPage />,
      },
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
      {
        path: 'dashboard',
        element: (
          <PermissionGuard permissions={['dashboard.view']}>
            {withSuspense(<DashboardPage />)}
          </PermissionGuard>
        ),
      },
      {
        path: 'users',
        element: (
          <PermissionGuard permissions={['users.view']}>
            {withSuspense(<UsersPage />)}
          </PermissionGuard>
        ),
      },
      {
        path: 'reports',
        element: (
          <PermissionGuard permissions={['reports.view']}>
            {withSuspense(<ReportsPage />)}
          </PermissionGuard>
        ),
      },
      {
        path: 'activity',
        element: (
          <PermissionGuard permissions={['dashboard.view']}>
            {withSuspense(<ActivityLogPage />)}
          </PermissionGuard>
        ),
      },
      {
        path: 'preferences',
        element: <PreferencesPage />,
      },
      {
        path: 'profile',
        element: withSuspense(<ProfilePage />),
      },
      {
        path: 'settings/general',
        element: (
          <PermissionGuard permissions={['settings.view']}>
            {withSuspense(<SettingsLayout initialTab="general" />)}
          </PermissionGuard>
        ),
      },
      {
        path: 'settings/security',
        element: (
          <PermissionGuard permissions={['settings.view']}>
            {withSuspense(<SettingsLayout initialTab="security" />)}
          </PermissionGuard>
        ),
      },
      {
        path: 'settings/notifications',
        element: (
          <PermissionGuard permissions={['settings.view']}>
            {withSuspense(<SettingsLayout initialTab="notifications" />)}
          </PermissionGuard>
        ),
      },
    ],
  },
  {
    path: '/403',
    element: <ForbiddenPage />,
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
