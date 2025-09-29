import React from 'react';
import DashboardHeader from './DashboardHeader';
import KPICards from './KPICards';
import ProjectQueueTable from './ProjectQueueTable';
import VerificationMap from './VerificationMap.tsx';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Satellite, Activity, Globe } from 'lucide-react';

// --- OPTIMIZATION: Static data is moved outside the component ---
// This prevents the data from being recreated on every render.

const KPI_DATA = {
  projectsPending: 12,
  projectsRequiringVisit: 4,
  approvedLast30Days: 28,
  totalHectaresVerified: 15420
};

// All 6 of your original projects are included here
const PROJECTS_DATA = [
  {
    id: 'BCR-001',
    name: 'Mangrove Restoration Project',
    ngoName: 'Ocean Conservation NGO',
    location: 'Mombasa, Kenya',
    dateSubmitted: '2024-01-15',
    aiRecommendation: 'Field Visit Recommended' as const,
    status: 'Pending' as const,
    confidenceScore: 72
  },
  {
    id: 'BCR-002',
    name: 'Coastal Wetland Protection',
    ngoName: 'Marine Life Foundation',
    location: 'Lamu, Kenya', 
    dateSubmitted: '2024-01-10',
    aiRecommendation: 'Data Sufficient' as const,
    status: 'Pending' as const,
    confidenceScore: 94
  },
  {
    id: 'BCR-003',
    name: 'Seagrass Restoration Initiative',
    ngoName: 'Blue Ocean Trust',
    location: 'Kilifi, Kenya',
    dateSubmitted: '2024-01-08',
    aiRecommendation: 'Data Sufficient' as const,
    status: 'Approved' as const,
    confidenceScore: 96
  },
  {
    id: 'BCR-004',
    name: 'Saltmarsh Conservation Project',
    ngoName: 'Coastal Guardians',
    location: 'Tana Delta, Kenya',
    dateSubmitted: '2024-01-12',
    aiRecommendation: 'In Review' as const,
    status: 'More Info Requested' as const,
    confidenceScore: 0
  },
  {
    id: 'BCR-005',
    name: 'Mangrove Nursery Initiative',
    ngoName: 'EcoRestore Africa',
    location: 'Malindi, Kenya',
    dateSubmitted: '2024-01-14',
    aiRecommendation: 'Field Visit Recommended' as const,
    status: 'Pending' as const,
    confidenceScore: 68
  },
  {
    id: 'BCR-006',
    name: 'Blue Carbon Sequestration',
    ngoName: 'Carbon Coast Initiative',
    location: 'Watamu, Kenya',
    dateSubmitted: '2024-01-11',
    aiRecommendation: 'Data Sufficient' as const,
    status: 'Pending' as const,
    confidenceScore: 89
  }
];

const VerifierDashboard = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <DashboardHeader 
          title="Blue Carbon Verifier Portal" 
          subtitle="Advanced Satellite Verification & AI Analysis Platform"
        />
        
        <KPICards 
          data={{
            projectsPending: KPI_DATA.projectsPending,
            projectsRequiringVisit: KPI_DATA.projectsRequiringVisit,
            approvedLast30Days: KPI_DATA.approvedLast30Days,
            totalHectaresVerified: KPI_DATA.totalHectaresVerified
          }}
        />
        
        <ProjectQueueTable projects={PROJECTS_DATA} />
        
        {/* Blue Carbon Sentinel Map Integration */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Blue Carbon Sentinel</h2>
              <p className="text-muted-foreground">AI-Powered Satellite Verification & Analysis Platform</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Satellite className="h-3 w-3 mr-1" />
                MapLibre GL JS
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                ⚡ WebGL GPU
              </Badge>
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                🆓 100% Free
              </Badge>
            </div>
          </div>
          
          {/* Enhanced Map Container with Blue Carbon Sentinel */}
          <div className="h-[600px] w-full rounded-lg border border-border/50 overflow-hidden">
            <VerificationMap 
              projectId="BCR-001"
              centerCoordinate={[-10.9, -69.53]}
              height="100%"
              className="w-full"
            />
          </div>
          
          {/* Technology Advantages Info Panel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-200 rounded-lg">
                    <Satellite className="h-5 w-5 text-green-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-green-800">Superior Technology</div>
                    <div className="text-sm text-green-600">10x faster than Canvas-based solutions</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-200 rounded-lg">
                    <Activity className="h-5 w-5 text-blue-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-blue-800">AI-Powered Analysis</div>
                    <div className="text-sm text-blue-600">Real-time change detection & verification</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-200 rounded-lg">
                    <Globe className="h-5 w-5 text-purple-700" />
                  </div>
                  <div>
                    <div className="font-semibold text-purple-800">Global Coverage</div>
                    <div className="text-sm text-purple-600">Worldwide satellite data access</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifierDashboard;