import React, { memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from './DashboardHeader';
import SystemOverview from './admin/SystemOverview';
import UserManagement from './admin/UserManagement';
import ProjectOversight from './admin/ProjectOversight';
import MintingConsole from './admin/MintingConsole';
import { BarChart3, Users, Eye, Coins } from 'lucide-react';

const TAB_CONFIG = [
  { value: 'overview', icon: BarChart3, label: 'System Overview', component: <SystemOverview /> },
  { value: 'users', icon: Users, label: 'User Management', component: <UserManagement /> },
  { value: 'projects', icon: Eye, label: 'Project Oversight', component: <ProjectOversight /> },
  { value: 'minting', icon: Coins, label: 'Minting Console', component: <MintingConsole /> },
];

const AdminDashboard: React.FC = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4">
    <div className="max-w-7xl mx-auto space-y-6">
      <DashboardHeader 
        title="Admin Dashboard" 
        subtitle="NCCR Carbon Credit Management Portal"
      />
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          {TAB_CONFIG.map(({ value, icon: Icon, label }) => (
            <TabsTrigger key={value} value={value} className="flex items-center space-x-2">
              <Icon className="h-4 w-4" />
              <span>{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>
        {TAB_CONFIG.map(({ value, component }) => (
          <TabsContent key={value} value={value}>
            {component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  </div>
));

export default AdminDashboard;
