import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ProfitTrendPoint {
  month: string;
  revenue: number;
  profit: number;
}

interface ProfitTrendChartProps {
  data: ProfitTrendPoint[];
}

export const ProfitTrendChart: React.FC<ProfitTrendChartProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Profit Trend</h3>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="month" stroke="#6B7280" fontSize={11} />
          <YAxis stroke="#6B7280" fontSize={11} tickFormatter={(v) => `$${v / 1000}k`} />
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            formatter={(value) => [`$${Number(value ?? 0).toLocaleString()}`, '']}
          />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={2.5} dot={{ fill: '#10b981', r: 4 }} name="Profit" />
          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={1.5} strokeDasharray="5 5" dot={false} name="Revenue" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
