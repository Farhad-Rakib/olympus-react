import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface WeeklyTrafficPoint {
  day: string;
  visitors: number;
  pageViews: number;
}

interface WeeklyTrafficChartProps {
  data: WeeklyTrafficPoint[];
}

export const WeeklyTrafficChart: React.FC<WeeklyTrafficChartProps> = ({ data }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Weekly Traffic</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
          <XAxis dataKey="day" stroke="#6B7280" fontSize={11} />
          <YAxis stroke="#6B7280" fontSize={11} />
          <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }} />
          <Legend wrapperStyle={{ fontSize: '12px' }} />
          <Area type="monotone" dataKey="visitors" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} name="Visitors" />
          <Area type="monotone" dataKey="pageViews" stroke="#10b981" fill="#10b981" fillOpacity={0.1} name="Page Views" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
