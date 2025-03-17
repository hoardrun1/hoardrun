import { SystemMetricsDashboard } from '@/components/monitoring/SystemMetricsDashboard';

export default function MonitoringPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">System Monitoring</h1>
      <SystemMetricsDashboard />
    </div>
  );
}