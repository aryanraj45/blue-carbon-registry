import React, { useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  Clock, 
  Coins, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Package // Added Package for consistency
} from 'lucide-react';

// --- DATA ---
// Using your original data structure
const systemAlerts = [
    { id: '1', type: 'error', message: 'Verifier Dr. Smith has 3 projects overdue for review', timestamp: '2 hours ago' },
    { id: '2', type: 'warning', message: 'Project #1847 approved despite low AI confidence (65%).', timestamp: '4 hours ago' },
    { id: '3', type: 'info', message: 'Ocean Conservation NGO has had 3 consecutive projects rejected.', timestamp: '1 day ago' }
];

const activityFeed = [
    { id: '1', type: 'approval', message: 'Project #1852 approved by Verifier Dr. Martinez', timestamp: '15 minutes ago' },
    { id: '2', type: 'registration', message: 'New NGO "Coastal Guardians" registered and awaiting approval', timestamp: '1 hour ago' },
    { id: '3', type: 'minting', message: '1,500 Carbon Credits minted for Project #1849.', timestamp: '2 hours ago' }
];

// Data for the new chart and pipeline
const monthlyMintData = [
  { name: 'Apr', minted: 1200 }, { name: 'May', minted: 2100 }, { name: 'Jun', minted: 1500 },
  { name: 'Jul', minted: 3200 }, { name: 'Aug', minted: 2500 }, { name: 'Sep', minted: 4100 },
];

const pipelineData = [
  { name: 'Under Review', count: 47, icon: Eye }, { name: 'Approved', count: 23, icon: CheckCircle },
  { name: 'Awaiting Minting', count: 12, icon: Package }, { name: 'Recently Minted', count: 5, icon: Activity },
];


// --- CUSTOM CHART TOOLTIP ---
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-white/10 bg-black/50 p-3 backdrop-blur-xl">
        <p className="label text-sm text-cyan-400">{`${label}`}</p>
        <p className="intro text-white">{`Minted : ${payload[0].value.toLocaleString()}`}</p>
      </div>
    );
  }
  return null;
};


const SystemOverview: React.FC = () => {
  const getAlertIcon = useCallback((type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-400" />;
    }
  }, []);

  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case 'approval': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'registration': return <Users className="h-4 w-4 text-cyan-400" />;
      case 'minting': return <Package className="h-4 w-4 text-fuchsia-400" />;
      default: return <Activity className="h-4 w-4" />;
    }
  }, []);

  // A helper for card styles to avoid repetition
  const cardClassName = "bg-white/5 backdrop-blur-md border-white/10 shadow-lg";

  return (
    <div className="space-y-6">
      {/* KPI Cards - STYLES ENHANCED, POSITION UNCHANGED */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className={cardClassName}>
          <CardContent className="p-4 flex items-center gap-4">
            <Eye className="h-8 w-8 text-cyan-400" />
            <div>
              <p className="text-2xl font-bold text-white">47</p>
              <p className="text-sm text-gray-400">Total Projects Under Review</p>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClassName}>
          <CardContent className="p-4 flex items-center gap-4">
            <Users className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-2xl font-bold text-white">8</p>
              <p className="text-sm text-gray-400">Pending User Approvals</p>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClassName}>
          <CardContent className="p-4 flex items-center gap-4">
            <Clock className="h-8 w-8 text-fuchsia-400" />
            <div>
              <p className="text-2xl font-bold text-white">12</p>
              <p className="text-sm text-gray-400">Credits Awaiting Minting</p>
            </div>
          </CardContent>
        </Card>
        <Card className={cardClassName}>
          <CardContent className="p-4 flex items-center gap-4">
            <Coins className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-2xl font-bold text-white">15,847</p>
              <p className="text-sm text-gray-400">Total Credits Minted</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ALERTS & FEED - STYLES ENHANCED, POSITION UNCHANGED */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <span>System Alerts & Flags</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {systemAlerts.map((alert) => (
              <Alert key={alert.id} className="flex items-start gap-3 bg-transparent border-white/10 p-3">
                {getAlertIcon(alert.type)}
                <div>
                  <AlertDescription className="text-gray-200 text-sm">{alert.message}</AlertDescription>
                  <p className="text-xs text-gray-500 mt-1">{alert.timestamp}</p>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
        <Card className={cardClassName}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
              <Activity className="h-5 w-5 text-green-400" />
              <span>Live Activity Feed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {activityFeed.map((event) => (
              <div key={event.id} className="flex items-start gap-3 p-3 border border-white/10 rounded-lg">
                {getActivityIcon(event.type)}
                <div>
                  <p className="text-sm text-gray-200">{event.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{event.timestamp}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* PLATFORM ANALYTICS - PLACEHOLDERS REPLACED, POSITION UNCHANGED */}
      <Card className={cardClassName}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-white">
            <TrendingUp className="h-5 w-5 text-cyan-400" />
            <span>Platform Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 h-72 w-full p-2 border border-white/10 rounded-lg">
              <ResponsiveContainer>
                <BarChart data={monthlyMintData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                  <defs><linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} /><stop offset="95%" stopColor="#22d3ee" stopOpacity={0.4} /></linearGradient></defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
                  <XAxis dataKey="name" stroke="rgba(255, 255, 255, 0.5)" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="rgba(255, 255, 255, 0.5)" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }} />
                  <Bar dataKey="minted" radius={[4, 4, 0, 0]}>{monthlyMintData.map((entry, index) => <Cell key={`cell-${index}`} fill="url(#barGradient)" />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            {/* Pipeline */}
            <div className="p-2 border border-white/10 rounded-lg">
              <h3 className="text-sm font-semibold text-white mb-4 px-2">Project Pipeline</h3>
              <ul className="space-y-4">
                {pipelineData.map((stage, index) => {
                    const Icon = stage.icon;
                    return (
                        <li key={stage.name} className="relative flex items-center gap-4 pl-3">
                            {index !== pipelineData.length - 1 && <div className="absolute left-[21px] top-9 h-full w-px bg-white/10" />}
                            <div className="z-10 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-fuchsia-500/10 text-fuchsia-400"><Icon size={16} /></div>
                            <div>
                                <p className="text-sm font-semibold text-white">{stage.name}</p>
                                <p className="text-xs text-gray-400">{stage.count} Projects</p>
                            </div>
                        </li>
                    )
                })}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverview;