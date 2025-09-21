import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, CheckCircle, XCircle, MessageSquare, TrendingUp,
  FileSignature, Loader2, ShieldCheck, X, Copy, MapPin,
  CalendarDays, Scaling
} from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import EvidenceHub from './EvidenceHub';
import { motion, AnimatePresence } from 'framer-motion';

// Import statements for the images
import mapSnapshotImage from '@/assets/assets23.jpg';
import solTokenImage from '@/assets/sol.webp';

// =========== TYPE DEFINITIONS for TypeScript =========== //

type ProjectStatus = 'Pending' | 'Approved' | 'Rejected';

interface ChecklistItem {
  id: string;
  label: string;
  status: 'completed' | 'warning';
  description: string;
}

interface HighlightedEntity {
  text: string;
  type: 'name' | 'coordinate' | 'legal_clause';
  confidence: number;
}

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'jpg';
  size: string;
  uploadDate: string;
  ocrText?: string;
  ocrAccuracy?: number;
  highlighted_entities?: HighlightedEntity[];
}

interface MapLayer {
  id: string;
  name: string;
  type: 'satellite' | 'photo' | 'analysis';
  date: string;
  enabled: boolean;
}

interface PhotoPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  date: string;
  thumbnail: string;
}

interface AnalysisArea {
  id: string;
  type: 'concern' | 'growth';
  coordinates: number[][];
  description: string;
}

interface AuditTrailEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
}

interface Message {
  id: string;
  sender: string;
  senderType: 'ngo' | 'system';
  message: string;
  timestamp: string;
  read: boolean;
}

interface ProjectData {
  id: string;
  name: string;
  ngoName: string;
  location: string;
  hectares: number;
  carbonClaim: number;
  dateSubmitted: string;
  confidenceScore: number;
  aiRecommendation: 'Data Sufficient' | 'Field Visit Recommended' | 'In Review';
  aiSummary: string;
  checklistItems: ChecklistItem[];
  documents: Document[];
  projectBounds: number[][];
  mapLayers: MapLayer[];
  photoPins: PhotoPin[];
  analysisAreas: AnalysisArea[];
  auditTrail: AuditTrailEntry[];
  messages: Message[];
}

// =========== MOCK PROJECT DATA OUTSIDE COMPONENT =========== //

const MOCK_PROJECT_DATA: ProjectData = {
  id: '1',
  name: 'Mombasa Mangrove Restoration',
  ngoName: 'Ocean Conservation Trust',
  location: 'Mombasa, Kenya',
  hectares: 150,
  carbonClaim: 2500,
  dateSubmitted: '2025-09-15',
  confidenceScore: 72,
  aiRecommendation: 'Field Visit Recommended',
  aiSummary: `The submitted land ownership deed (doc_1.pdf) was successfully processed via OCR, and the stated coordinates align with the project's geographic boundaries. However, a 15% discrepancy was noted between the claimed biomass density in the northern sector and our analysis of Sentinel-2 satellite imagery from August 2025...`,
  checklistItems: [
    { id: '1', label: 'Document Authenticity', status: 'completed', description: 'OCR data is clear and consistent' },
    { id: '2', label: 'Geospatial Integrity', status: 'completed', description: 'Boundaries match land deeds' },
    { id: '3', label: 'Visual Evidence Correlation', status: 'warning', description: 'NGO imagery partially conflicts with satellite data' },
    { id: '4', label: 'Methodology Compliance', status: 'completed', description: 'Aligns with Verra VCS standards' },
    { id: '5', label: 'Temporal Analysis', status: 'warning', description: 'Growth patterns require field verification' }
  ],
  documents: [
    { id: '1', name: 'land_ownership_deed.pdf', type: 'pdf', size: '2.4 MB', uploadDate: '2025-09-15', highlighted_entities: [{ text: 'Ocean Conservation NGO', type: 'name', confidence: 0.99 }] },
    { id: '2', name: 'project_methodology.docx', type: 'docx', size: '1.8 MB', uploadDate: '2025-09-15' },
    { id: '3', name: 'field_photos_2025.zip', type: 'jpg', size: '45.2 MB', uploadDate: '2025-09-15' }
  ],
  projectBounds: [[-4.0435, 39.6682], [-4.0445, 39.6692], [-4.0455, 39.6685], [-4.0450, 39.6675]],
  mapLayers: [{ id: 'satellite-2025', name: 'Sentinel-2 Latest', type: 'satellite', date: '2025-09-10', enabled: true }],
  photoPins: [{ id: '1', lat: -4.0440, lng: 39.6685, title: 'Northern Sector', date: '2025-09-15', thumbnail: '' }],
  analysisAreas: [{ id: '1', type: 'concern', coordinates: [[-4.0435, 39.6685], [-4.0440, 39.6690]], description: '15% biomass discrepancy detected.' }],
  auditTrail: [{ id: '1', timestamp: '2025-09-15 11:40 AM', actor: 'NGO', action: 'Project Submitted', details: 'Initial submission' }],
  messages: [{ id: '1', sender: 'Ocean Conservation Trust', senderType: 'ngo', message: 'Hello, we have submitted our project for verification.', timestamp: '2025-09-15 12:00 PM', read: true }]
};

// =========== PROJECT SUMMARY CARDS =========== //

const PROJECT_SUMMARY_CARDS = [
  { icon: TrendingUp, label: "Carbon Claim", value: (data: ProjectData) => `${data.carbonClaim.toLocaleString()} tCO₂e` },
  { icon: Scaling, label: "Area", value: (data: ProjectData) => `${data.hectares} Hectares` },
  { icon: MapPin, label: "Location", value: (data: ProjectData) => data.location },
  { icon: CalendarDays, label: "Submitted", value: (data: ProjectData) => data.dateSubmitted }
];

// =========== REACT COMPONENT =========== //

const ProjectVerificationWorkspace: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [projectStatus, setProjectStatus] = useState<ProjectStatus>('Pending');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [isSigningModalOpen, setIsSigningModalOpen] = useState<boolean>(false);
  const [signingStep, setSigningStep] = useState<'confirm' | 'processing' | 'complete'>('confirm');
  const [transactionHash, setTransactionHash] = useState<string>('');

  // Use correct project data for view (static/mocked here)
  const projectData = useMemo(() => ({
    ...MOCK_PROJECT_DATA,
    id: projectId || MOCK_PROJECT_DATA.id,
  }), [projectId]);

  // BADGES: Memoized for performance
  const getStatusBadge = useMemo(() => {
    switch (projectStatus) {
      case 'Approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shadow-sm hover:bg-green-500/30 transition-colors">Approved</Badge>;
      case 'Rejected':
        return <Badge variant="destructive" className="bg-red-500/20 text-red-400 border-red-500/30 shadow-sm hover:bg-red-500/30 transition-colors">Rejected</Badge>;
      default:
        return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-400 shadow-sm">Under Review</Badge>;
    }
  }, [projectStatus]);

  const getAIRecommendationBadge = useMemo(() => {
    switch (projectData.aiRecommendation) {
      case 'Data Sufficient':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 shadow-sm">AI Confidence: {projectData.confidenceScore}% (Data Sufficient)</Badge>;
      case 'Field Visit Recommended':
        return <Badge variant="secondary" className="bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-sm">AI Confidence: {projectData.confidenceScore}% (Field Visit Recommended)</Badge>;
      default:
        return <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-sm">AI: In Review</Badge>;
    }
  }, [projectData.aiRecommendation, projectData.confidenceScore]);

  // HANDLERS: Memoized if useful or static; otherwise inline
  const handleApprove = useCallback(() => {
    setIsSigningModalOpen(true);
  }, []);

  const handleConfirmSign = useCallback(() => {
    setIsProcessing(true);
    setSigningStep('processing');
    setTimeout(() => {
      const mockTxHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
      setTransactionHash(mockTxHash);
      setSigningStep('complete');
      setProjectStatus('Approved');
      toast({
        title: "Transaction Successful",
        description: "Carbon credits have been minted on the Solana blockchain.",
      });
      setIsProcessing(false);
    }, 3500);
  }, [toast]);

  const handleCloseModal = useCallback(() => {
    setIsSigningModalOpen(false);
    setTimeout(() => {
      setSigningStep('confirm');
      setTransactionHash('');
    }, 300);
  }, []);

  const handleReject = useCallback(() => {
    setIsProcessing(true);
    setTimeout(() => {
      setProjectStatus('Rejected');
      toast({
        title: 'Project Submitted for Rejection',
        description: 'A senior verifier must confirm this decision.',
        variant: 'destructive',
      });
      setIsProcessing(false);
    }, 1500);
  }, [toast]);

  const handleRequestInfo = useCallback(() => {
    toast({
      title: 'Information Request Sent',
      description: 'A message has been sent to the NGO.',
    });
  }, [toast]);

  // ========== RENDER ==========

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-8xl mx-auto space-y-6">
        <DashboardHeader 
          title="Project Verification Workspace"
          subtitle="Detailed Evidence Analysis & Decision Making"
        />

        <Button
          variant="ghost"
          onClick={() => navigate('/verifier-dashboard')}
          className="group text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Button>

        <Card className="shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <CardTitle className="text-3xl font-bold tracking-tight text-foreground">{projectData.name}</CardTitle>
                <p className="text-muted-foreground mt-2">
                  ID: {projectData.id} • Submitted by <span className="font-medium text-foreground/80">{projectData.ngoName}</span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {getAIRecommendationBadge}
                {getStatusBadge}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {PROJECT_SUMMARY_CARDS.map((item, index) => (
                <div key={index} className="bg-muted/40 p-4 rounded-lg border border-border/50 group hover:bg-muted/80 hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-background rounded-md border border-border/50">
                      <item.icon className="h-6 w-6 text-primary transition-transform duration-300 group-hover:scale-110" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{item.label}</p>
                      <p className="font-bold text-lg text-foreground">{item.value(projectData)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card/80 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-xl font-semibold tracking-tight">Verification Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <Button
                onClick={handleApprove}
                disabled={isProcessing || projectStatus !== 'Pending'}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold transition-all duration-300 hover:scale-105 group shadow-md hover:shadow-lg hover:shadow-green-500/20"
              >
                <CheckCircle className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                Approve & Mint Credits
              </Button>

              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={isProcessing || projectStatus !== 'Pending'}
                className="transition-all duration-300 hover:scale-105 group shadow-md hover:shadow-lg hover:shadow-red-500/20"
              >
                <XCircle className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:rotate-12" />
                Reject Project
              </Button>

              <Button
                variant="outline"
                onClick={handleRequestInfo}
                disabled={isProcessing || projectStatus !== 'Pending'}
                className="transition-all duration-300 hover:scale-105 hover:bg-accent hover:border-primary/50 group"
              >
                <MessageSquare className="h-4 w-4 mr-2 transition-transform duration-300 group-hover:-rotate-12" />
                Request More Information
              </Button>
            </div>
          </CardContent>
        </Card>

        <EvidenceHub projectData={projectData} />
      </div>

      <AnimatePresence>
        {isSigningModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <Card className="w-full max-w-xl shadow-2xl bg-card border-border/50">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg font-semibold flex items-center">
                        <FileSignature className="h-5 w-5 mr-2 text-primary" />
                        Sign Contract & Issue Credits
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        Review the details before broadcasting to the blockchain.
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full -mt-2 -mr-2"
                      onClick={handleCloseModal}
                      disabled={isProcessing}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {signingStep === 'confirm' && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 group">
                          <p className="text-sm font-semibold">Project Evidence Snapshot</p>
                          <div className="aspect-video rounded-lg overflow-hidden border border-border/50 group-hover:border-primary/50 transition-all duration-300 p-1">
                            <img src={mapSnapshotImage} alt="Project map snapshot" className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105" />
                          </div>
                        </div>
                        <div className="space-y-2 group">
                          <p className="text-sm font-semibold">Digital Asset Preview</p>
                          <div className="aspect-video rounded-lg overflow-hidden border border-border/50 group-hover:border-primary/50 transition-all duration-300 p-1">
                            <img src={solTokenImage} alt="Solana carbon credit token" className="w-full h-full object-cover rounded-md transition-transform duration-300 group-hover:scale-105" />
                          </div>
                        </div>
                      </div>

                      <div className="border border-border/50 bg-muted/40 rounded-lg p-4 space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span>Project:</span>
                          <span className="font-medium text-right text-foreground">{projectData.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Credits to Mint:</span>
                          <span className="font-bold text-green-500 text-right">{projectData.carbonClaim.toLocaleString()} CO₂e Tokens</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>Network Fee (Solana):</span>
                          <span className="font-mono text-muted-foreground text-right">~0.00005 SOL</span>
                        </div>
                      </div>
                      <div className="flex gap-4 pt-2">
                        <Button variant="outline" className="w-full hover:bg-accent hover:border-primary/50" onClick={handleCloseModal}>Cancel</Button>
                        <Button className="w-full bg-primary hover:bg-primary/90 transition-transform hover:scale-105 shadow-md shadow-primary/20" onClick={handleConfirmSign}>Confirm & Sign On-Chain</Button>
                      </div>
                    </div>
                  )}

                  {signingStep === 'processing' && (
                    <div className="flex flex-col items-center justify-center text-center p-8 space-y-4 min-h-[300px] relative overflow-hidden">
                      <div className="absolute inset-0 bg-primary/5 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
                      <Loader2 className="h-12 w-12 text-primary animate-spin" />
                      <p className="font-semibold text-lg text-foreground">Processing Transaction</p>
                      <p className="text-sm text-muted-foreground max-w-xs">
                        Broadcasting to the Solana network. This may take a few moments. Please don't close this window.
                      </p>
                    </div>
                  )}

                  {signingStep === 'complete' && (
                    <div className="flex flex-col items-center justify-center text-center p-6 space-y-4 min-h-[300px]">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }}>
                        <ShieldCheck className="h-14 w-14 text-green-500" />
                      </motion.div>
                      <p className="font-semibold text-xl text-foreground">Transaction Successful!</p>
                      <p className="text-sm text-muted-foreground">
                        {projectData.carbonClaim.toLocaleString()} carbon credits have been successfully minted.
                      </p>
                      <div className="w-full bg-muted/50 p-3 rounded-md border border-border/50 text-left relative group">
                        <p className="text-xs text-muted-foreground">Solana Transaction Signature</p>
                        <p className="font-mono text-xs break-all text-foreground">{transactionHash}</p>
                        <Button variant="ghost" size="icon"
                          className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => { navigator.clipboard.writeText(transactionHash); toast({ title: 'Copied to clipboard!' }); }}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button className="w-full mt-4 bg-primary hover:bg-primary/90" onClick={handleCloseModal}>Done</Button>
                    </div>
                  )}

                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectVerificationWorkspace;
