import { MoreHorizontal } from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface RevenueDatum {
  name: string;
  value: number;
}

interface DashboardOverviewChartsProps {
  revenueData: RevenueDatum[];
}

const weeklyData = [
  { day: 'Mon', sales: 340, orders: 45 },
  { day: 'Tue', sales: 280, orders: 38 },
  { day: 'Wed', sales: 520, orders: 67 },
  { day: 'Thu', sales: 410, orders: 52 },
  { day: 'Fri', sales: 680, orders: 84 },
  { day: 'Sat', sales: 390, orders: 41 },
  { day: 'Sun', sales: 250, orders: 29 },
];

export const DashboardOverviewCharts: React.FC<DashboardOverviewChartsProps> = ({ revenueData }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
      <div className="lg:col-span-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Revenue Overview</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monthly revenue performance</p>
          </div>
          <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={revenueData}>
            <defs>
              <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.08} />
            <XAxis dataKey="name" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v / 1000}k`} />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
            <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} fill="url(#revenueGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white">Weekly Sales</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Sales performance this week</p>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.08} />
            <XAxis dataKey="day" stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
            <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="orders" fill="#10b981" radius={[4, 4, 0, 0]} opacity={0.7} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
