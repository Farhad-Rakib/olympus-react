import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Calendar } from 'lucide-react';

interface RevenuePoint {
  month: string;
  revenue: number;
  expenses: number;
}

interface RevenueExpensesChartProps {
  data: RevenuePoint[];
}

export const RevenueExpensesChart: React.FC<RevenueExpensesChartProps> = ({ data }) => {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-white">Revenue & Expenses</h3>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <Calendar className="w-3.5 h-3.5" /> 2024
        </div>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <BarChart data={data} barGap={2}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="month" stroke="#6B7280" fontSize={11} />
          <YAxis stroke="#6B7280" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, '']}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Bar dataKey="revenue" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Revenue" />
          <Bar dataKey="expenses" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expenses" opacity={0.7} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
