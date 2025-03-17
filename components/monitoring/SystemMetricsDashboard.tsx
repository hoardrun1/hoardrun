import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { prisma } from '@/lib/prisma';

interface MetricData {
  timestamp: string;
  value: number;
}

interface MetricGroup {
  name: string;
  unit: string;
  data: MetricData[];
}

export function SystemMetricsDashboard() {
  const [metrics, setMetrics] = useState<MetricGroup[]>([]);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchMetrics();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch(`/api/metrics?range=${timeRange}`);
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Metrics</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="border rounded p-2"
        >
          <option value="1h">Last Hour</option>
          <option value="24h">Last 24 Hours</option>
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
        </select>
      </div>

      {metrics.map((metric) => (
        <div key={metric.name} className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">
            {metric.name} ({metric.unit})
          </h3>
          <LineChart width={800} height={300} data={metric.data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="timestamp"
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleTimeString()}
            />
            <YAxis />
            <Tooltip
              labelFormatter={(timestamp) => new Date(timestamp).toLocaleString()}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="value"
              stroke="#8884d8"
              name={metric.name}
            />
          </LineChart>
        </div>
      ))}
    </div>
  );
}