import React from 'react';
import DashboardHeader from './DashboardHeader';
import ProjectQueueTable from './ProjectQueueTable';
import VerificationMap from './VerificationMap';
import { InfiniteMovingCards } from './ui/infinite-moving-cards';
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

// Verifier Dashboard specific insights for infinite moving cards
const VERIFICATION_INSIGHTS = [
  {
    quote: "📊 Projects Status: 28 Projects Approved this month | 12 Projects Pending Review | 4 Projects Requiring Field Visit | Current approval rate: 87% with average processing time of 5.2 days per project.",
    name: "Monthly Verification Summary",
    title: "28 Approved • 12 Pending • 4 Field Visits",
    image: "/src/assets/image11.png"
  },
  {
    quote: "🛰️ Satellite Analysis: Real-time monitoring of 15,420 hectares across 42 blue carbon sites. Advanced AI detected vegetation changes in 89% of monitored areas with 94% accuracy. Next satellite pass scheduled in 2 hours.",
    name: "Satellite Monitoring Status", 
    title: "15,420 Ha Monitored • 94% AI Accuracy",
    image: "/src/assets/image12.png"
  },
  {
    quote: "🌊 Hectares Under Review: Currently verifying 2,847 hectares of mangrove restoration and 1,156 hectares of seagrass beds. Estimated carbon sequestration potential: 847 tCO₂e annually across all active projects.",
    name: "Active Verification Pipeline",
    title: "4,003 Ha Under Review • 847 tCO₂e/year"
  },
  {
    quote: "⚡ System Performance: Verification algorithms processed 156 satellite images today with 99.2% uptime. Blockchain integration stable with 0.3s average transaction time. All monitoring systems operational.",
    name: "Platform Health Dashboard",
    title: "99.2% Uptime • 156 Images Processed",
    image: "/src/assets/image11.png"
  },
  {
    quote: "🔍 Field Verification Queue: 4 projects require on-site inspection in Kenya coastal regions. Drone surveys scheduled for Kilifi (BCR-003) and Malindi (BCR-005). Field team deployment estimated for next week.",
    name: "Field Operations Status",
    title: "4 Site Visits Pending • 2 Drone Surveys"
  },
  {
    quote: "📈 Verification Metrics: Average verification confidence score increased to 91.3% this quarter. Successfully validated 847 hectares with blockchain certification. Quality assurance protocols maintain 99.7% accuracy rate.",
    name: "Quality Assurance Report",
    title: "91.3% Confidence • 847 Ha Certified",
    image: "/src/assets/image12.png"
  }
];

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
        
        {/* Infinite Moving Cards Section */}
        <div className="h-[16rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
          <InfiniteMovingCards
            items={VERIFICATION_INSIGHTS}
            direction="right"
            speed="slow"
            pauseOnHover={true}
            className="mb-4"
          />
        </div>
        
        <ProjectQueueTable projects={PROJECTS_DATA} />
      </div>
    </div>
  );
};

export default VerifierDashboard;