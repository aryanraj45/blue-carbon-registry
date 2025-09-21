import React, { useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  Users, 
  Clock, 
  Coins, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  Eye
} from 'lucide-react';

interface SystemAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  timestamp: string;
}

interface ActivityEvent {
  id: string;
  type: 'approval' | 'registration' | 'minting';
  message: string;
  timestamp: string;
}

const SystemOverview: React.FC = () => {
  const systemAlerts = useMemo(() => [
    {
      id: '1',
      type: 'warning',
      message: 'Verifier Dr. Smith has 3 projects overdue for review',
      timestamp: '2 hours ago'
    },
    {
      id: '2',
      type: 'error',
      message: 'Project #1847 approved despite low AI confidence (65%). Admin audit recommended.',
      timestamp: '4 hours ago'
    },
    {
      id: '3',
      type: 'info',
      message: 'Ocean Conservation NGO has had 3 consecutive projects rejected. Review account.',
      timestamp: '1 day ago'
    }
  ], []);

  const activityFeed = useMemo(() => [
    {
      id: '1',
      type: 'approval',
      message: 'Project #1852 approved by Verifier Dr. Martinez',
      timestamp: '15 minutes ago'
    },
    {
      id: '2',
      type: 'registration',
      message: 'New NGO "Coastal Guardians" registered and awaiting approval',
      timestamp: '1 hour ago'
    },
    {
      id: '3',
      type: 'minting',
      message: '1,500 Carbon Credits minted for Project #1849. Tx: 0x742d35Cc...',
      timestamp: '2 hours ago'
    }
  ], []);

  const getAlertIcon = useCallback((type: string) => {
    switch (type) {
      case 'error': return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case 'warning': return <Clock className="h-4 w-4 text-warning" />;
      default: return <Eye className="h-4 w-4 text-info" />;
    }
  }, []);

  const getActivityIcon = useCallback((type: string) => {
    switch (type) {
      case 'approval': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'registration': return <Users className="h-4 w-4 text-primary" />;
      case 'minting': return <Coins className="h-4 w-4 text-secondary" />;
      default: return <Activity className="h-4 w-4" />;
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-lg border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold text-foreground">47</p>
                <p className="text-sm text-muted-foreground">Total Projects Under Review</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-secondary/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-secondary" />
              <div>
                <p className="text-2xl font-bold text-foreground">8</p>
                <p className="text-sm text-muted-foreground">Pending User Approvals</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-accent/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-8 w-8 text-accent" />
              <div>
                <p className="text-2xl font-bold text-foreground">12</p>
                <p className="text-sm text-muted-foreground">Credits Awaiting Minting</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-lg border-success/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Coins className="h-8 w-8 text-success" />
              <div>
                <p className="text-2xl font-bold text-foreground">15,847</p>
                <p className="text-sm text-muted-foreground">Total Credits Minted</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <span>System Alerts & Flags</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {systemAlerts.map((alert) => (
              <Alert key={alert.id} className="border-l-4 border-l-warning">
                <div className="flex items-start space-x-3">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <AlertDescription className="text-foreground">
                      {alert.message}
                    </AlertDescription>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.timestamp}
                    </p>
                  </div>
                </div>
              </Alert>
            ))}
          </CardContent>
        </Card>
        {/* Live Activity Feed */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-primary" />
              <span>Live Activity Feed</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activityFeed.map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-3 p-3 border border-border rounded-lg"
              >
                {getActivityIcon(event.type)}
                <div className="flex-1">
                  <p className="text-sm text-foreground">{event.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {event.timestamp}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts Placeholder */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-secondary" />
            <span>Platform Analytics</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Carbon Credits Minted (Monthly)</p>
              </div>
            </div>
            <div className="h-64 bg-muted/50 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Project Pipeline Funnel</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemOverview;
