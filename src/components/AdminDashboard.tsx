import React, { memo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DashboardHeader from './DashboardHeader';
import SystemOverview from './admin/SystemOverview';
import UserManagement from './admin/UserManagement';
import ProjectOversight from './admin/ProjectOversight';
import MintingConsole from './admin/MintingConsole';
import { BarChart3, Users, Eye, Coins } from 'lucide-react';
// Configuration
const TAB_CONFIG = [
  { value: 'overview', icon: BarChart3, label: 'Overview', component: <SystemOverview /> },
  { value: 'users', icon: Users, label: 'Users', component: <UserManagement /> },
  { value: 'projects', icon: Eye, label: 'Projects', component: <ProjectOversight /> },
  { value: 'minting', icon: Coins, label: 'Minting', component: <MintingConsole /> },
];

const AdminDashboard: React.FC = memo(() => (
  <div className="relative min-h-screen overflow-x-hidden bg-[#0D0E18] p-4 font-sans text-white">
    <div className="absolute inset-0 z-0 opacity-[0.03] bg-[url('/noise.png')]" />

    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <div className="absolute -top-1/4 left-1/4 h-1/2 w-1/2 animate-aurora rounded-full bg-fuchsia-600/40 blur-3xl" />
      <div className="absolute -bottom-1/4 right-1/4 h-1/2 w-1/2 animate-aurora-delay rounded-full bg-cyan-500/40 blur-3xl" />
    </div>

    <div className="relative z-10 mx-auto max-w-screen-xl space-y-12">
      <DashboardHeader
        title="🦄 Admin Control Deck"
        subtitle="NCCR Carbon Credit Management Portal"
      />

      <Tabs defaultValue="overview" className="w-full">
        {/* Added perspective to this container to enable 3D effects on children */}
        <TabsList className="
          grid h-auto w-full grid-cols-2 gap-2 rounded-2xl border border-white/10 
          bg-black/20 p-2 backdrop-blur-lg md:grid-cols-4
          [perspective:800px]
        ">
          {TAB_CONFIG.map(({ value, icon: Icon, label }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="
                group relative flex w-full items-center justify-center gap-2 rounded-lg 
                px-4 py-3 text-sm font-semibold text-gray-400 
                
                /* ▼▼▼ 3D EFFECT & TRANSITION ADDED HERE ▼▼▼ */
                transition-all duration-300 ease-in-out
                hover:scale-105 hover:-translate-y-1 hover:shadow-xl hover:shadow-fuchsia-500/20
                data-[state=active]:scale-105
                [transform-style:preserve-3d] 
                hover:[transform:rotateX(15deg)_translateZ(15px)]
                data-[state=active]:[transform:rotateX(5deg)_translateZ(5px)]
                /* ▲▲▲ END OF 3D EFFECT ▲▲▲ */

                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500
                focus-visible:ring-offset-2 focus-visible:ring-offset-black/20
                data-[state=active]:bg-gradient-to-br data-[state=active]:from-fuchsia-600/80
                data-[state=active]:to-indigo-700/80 data-[state=active]:text-white
                data-[state=active]:shadow-lg data-[state=active]:shadow-indigo-700/30
              "
            >
              <Icon className="
                h-5 w-5 transition-transform duration-300 
                group-hover:scale-110 group-data-[state=active]:text-white
              " />
              <span className="hidden sm:inline">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="relative mt-8 min-h-[400px]">
          {TAB_CONFIG.map(({ value, component }) => (
            <TabsContent
              key={value}
              value={value}
              className="
                absolute inset-0 rounded-2xl border border-white/10 bg-black/20
                p-6 backdrop-blur-xl transition-opacity duration-500
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-500
                data-[state=inactive]:opacity-0 data-[state=inactive]:pointer-events-none
              "
            >
              {component}
            </TabsContent>
          ))}
        </div>
      </Tabs>
    </div>
  </div>
));

export default AdminDashboard;