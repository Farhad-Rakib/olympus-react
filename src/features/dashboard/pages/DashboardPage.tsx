import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { Users, UserPlus, Shield, Activity, RefreshCw, Eye, AlertTriangle } from 'lucide-react';
import { dashboardApi } from '../../../core/api/services/dashboard.api';
import { useAuthStore } from '../../auth/store/auth.store';
import { Loader } from '../../../components/ui/Loader/Loader';
import { getErrorMessage } from '../../../core/api/api-error';

const RANGES = [
  { days: 7, label: 'Last 7 days' },
  { days: 30, label: 'Last 30 days' },
  { days: 90, label: 'Last 90 days' },
];

// Validated pair (light + dark): requests = primary blue, failed = error red.
const REQUESTS_COLOR = '#3b82f6';
const FAILED_COLOR = '#ef4444';

const tooltipStyle = { backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' };

const formatDay = (isoDate: string) =>
  new Date(`${isoDate}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

export const DashboardPage: React.FC = () => {
  const [days, setDays] = useState(7);
  const name = useAuthStore((s) => s.tokenPayload?.name);
  const canViewMetrics = useAuthStore((s) => s.hasPermission('reports.read'));
  const canViewAudit = useAuthStore((s) => s.hasPermission('audit.read'));

  const { data, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ['dashboard', days],
    queryFn: () => dashboardApi.getDashboardData(days),
    enabled: canViewMetrics,
    retry: false,
  });

  const greeting = (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
        Welcome back{typeof name === 'string' && name ? `, ${name}` : ''}!
      </p>
    </div>
  );

  // Users without reports.read get a plain welcome instead of system-wide metrics.
  if (!canViewMetrics) {
    return (
      <div className="space-y-6">
        {greeting}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Use the menu to get to the areas you have access to.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) return <Loader text="Loading dashboard..." />;

  const stats = data?.stats;
  const errorRate = stats && stats.requests > 0 ? (stats.failedRequests / stats.requests) * 100 : 0;
  const statCards = stats ? [
    { title: 'Total Users', value: stats.totalUsers, detail: `${stats.activeUsers} active`, icon: Users, color: 'text-blue-600', lightBg: 'bg-blue-50 dark:bg-blue-900/20' },
    { title: 'New Users', value: stats.newUsers, detail: `in the last ${days} days`, icon: UserPlus, color: 'text-emerald-600', lightBg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { title: 'Roles', value: stats.totalRoles, detail: 'defined', icon: Shield, color: 'text-amber-600', lightBg: 'bg-amber-50 dark:bg-amber-900/20' },
    { title: 'API Requests', value: stats.requests, detail: `${errorRate.toFixed(1)}% failed`, icon: Activity, color: 'text-rose-600', lightBg: 'bg-rose-50 dark:bg-rose-900/20' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {greeting}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <select
            aria-label="Date range"
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {RANGES.map((r) => <option key={r.days} value={r.days}>{r.label}</option>)}
          </select>
        </div>
      </div>

      {error && (
        <div role="alert" className="flex items-center justify-between gap-3 p-4 rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20">
          <div className="flex items-center gap-2 text-sm text-red-700 dark:text-red-400">
            <AlertTriangle className="w-4 h-4" />
            {getErrorMessage(error, 'Failed to load dashboard')}
          </div>
          <button onClick={() => refetch()} className="text-sm font-medium text-red-700 dark:text-red-400 hover:underline">Retry</button>
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <div key={stat.title} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
                  <div className={`w-11 h-11 ${stat.lightBg} rounded-lg flex items-center justify-center mb-4`}>
                    <Icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value.toLocaleString()}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {stat.title} · {stat.detail}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">API Activity</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Requests per day from the audit log</p>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.activity} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="requestsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={REQUESTS_COLOR} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={REQUESTS_COLOR} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.08} vertical={false} />
                <XAxis dataKey="date" tickFormatter={formatDay} stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} minTickGap={16} />
                <YAxis allowDecimals={false} stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} labelFormatter={(label) => formatDay(String(label))} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Area type="linear" name="Requests" dataKey="requests" stroke={REQUESTS_COLOR} strokeWidth={2} fill="url(#requestsGrad)" />
                <Area type="linear" name="Failed" dataKey="failed" stroke={FAILED_COLOR} strokeWidth={2} fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
              <div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white">Recent Activity</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest changes (create, update, delete)</p>
              </div>
              {canViewAudit && (
                <Link to="/audit-logs" className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center gap-1">
                  <Eye className="w-3 h-3" /> View all
                </Link>
              )}
            </div>
            {data.recentActivity.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center text-gray-400">No activity in this period</p>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {data.recentActivity.map((a) => (
                  <li key={a.id} className="flex items-center gap-4 px-5 py-3">
                    <span
                      className={`shrink-0 px-2 py-0.5 text-[11px] font-medium rounded-full ${a.success
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}
                    >
                      {a.statusCode ?? (a.success ? 'OK' : 'Error')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-white truncate">
                        <span className="font-medium">{a.user}</span>{' '}
                        <span className="text-gray-500 dark:text-gray-400">{a.method} · {a.action}</span>
                      </p>
                    </div>
                    <time className="shrink-0 text-xs text-gray-400 dark:text-gray-500" dateTime={a.timestamp}>
                      {new Date(a.timestamp).toLocaleString()}
                    </time>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};
