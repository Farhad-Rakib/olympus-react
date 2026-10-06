export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  totalRoles: number;
  requests: number;
  failedRequests: number;
}

/** API traffic for one day (ISO date, yyyy-mm-dd). */
export interface DailyActivity {
  date: string;
  requests: number;
  failed: number;
}

export interface RecentActivity {
  id: number;
  user: string;
  action: string;
  method: string;
  statusCode: number | null;
  success: boolean;
  timestamp: string;
}

export interface DashboardData {
  days: number;
  stats: DashboardStats;
  activity: DailyActivity[];
  recentActivity: RecentActivity[];
}
