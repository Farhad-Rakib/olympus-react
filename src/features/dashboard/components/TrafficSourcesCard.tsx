import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const channelData = [
  { name: 'Direct', value: 35, color: '#3b82f6' },
  { name: 'Organic', value: 30, color: '#10b981' },
  { name: 'Social', value: 20, color: '#f59e0b' },
  { name: 'Referral', value: 15, color: '#ef4444' },
];

export const TrafficSourcesCard: React.FC = () => {
  return (
    <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
      <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Traffic Sources</h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie data={channelData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
            {channelData.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
            formatter={(value) => [`${Number(value ?? 0)}%`, '']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="space-y-3 mt-4">
        {channelData.map((ch) => (
          <div key={ch.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: ch.color }} />
              <span className="text-sm text-gray-700 dark:text-gray-300">{ch.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${ch.value}%`, backgroundColor: ch.color }} />
              </div>
              <span className="text-sm font-medium text-gray-900 dark:text-white w-8 text-right">{ch.value}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
