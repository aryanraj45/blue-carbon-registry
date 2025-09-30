import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, FileText, Map, Coins, Download, Eye,
  CheckCircle, XCircle, Upload, Satellite, ImageIcon, X, Activity,
  Loader2, Hash, ExternalLink, Copy, Wallet
} from 'lucide-react';
import DashboardHeader from './DashboardHeader';
import VerificationMap from './VerificationMap';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { MultiStepLoader } from '@/components/ui/multi-step-loader';

// Import document images
import doc1Image from '@/assets/doc1.png';
import doc2Image from '@/assets/doc2.png';
import doc3Image from '@/assets/doc3.png';
import doc4Image from '@/assets/doc4.png';
import simageAsset from '@/assets/simage.png';

// =========== TYPE DEFINITIONS =========== //

type ActiveTab = 'documents' | 'map' | 'minting';

interface Document {
  id: string;
  name: string;
  type: 'pdf' | 'docx' | 'jpg' | 'zip';
  size: string;
  uploadDate: string;
  imageUrl: string;
}

interface ProjectData {
  id: string;
  name: string;
  ngoName: string;
  location: string;
  hectares: number;
  carbonClaim: number;
  dateSubmitted: string;
  documents: Document[];
}

// =========== MOCK DATA =========== //

const MOCK_PROJECT_DATA: ProjectData = {
  id: 'BCR-001',
  name: 'Mombasa Mangrove Restoration',
  ngoName: 'Ocean Conservation Trust',
  location: 'Sundarban, India',
  hectares: 150,
  carbonClaim: 2500,
  dateSubmitted: '2025-09-15',
  documents: [
    { id: '1', name: 'land_ownership_deed.pdf', type: 'pdf', size: '2.4 MB', uploadDate: '2025-09-15', imageUrl: doc1Image },
    { id: '2', name: 'Community / NGO Agreements.docx', type: 'docx', size: '1.8 MB', uploadDate: '2025-09-15', imageUrl: doc2Image },
    { id: '3', name: 'field_photos_2025.zip', type: 'zip', size: '45.2 MB', uploadDate: '2025-09-15', imageUrl: doc3Image },
    { id: '4', name: 'Plantation / Restoration Proof.pdf', type: 'pdf', size: '3.2 MB', uploadDate: '2025-09-15', imageUrl: doc4Image },
  ]
};

// =========== MAIN COMPONENT =========== //

const ProjectVerificationWorkspace: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { publicKey, connected } = useWallet();
  const { connection } = useConnection();

  const [activeTab, setActiveTab] = useState<ActiveTab>('documents');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isDocumentModalOpen, setIsDocumentModalOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [scanningBoxes, setScanningBoxes] = useState<any[]>([]);
  const [analysis, setAnalysis] = useState({
    keyFieldsMatch: true,
    contentValid: true,
    overallValid: true
  });

  const projectData = useMemo(() => ({
    ...MOCK_PROJECT_DATA,
    id: projectId || MOCK_PROJECT_DATA.id,
  }), [projectId]);

  const handleViewDocument = (doc: Document) => {
    setSelectedDocument(doc);
    setIsDocumentModalOpen(true);
    // Reset analysis state when opening new document
    setIsScanning(false);
    setAnalysisComplete(false);
    setScanningBoxes([]);
  };

  const handleCloseDocumentModal = () => {
    setIsDocumentModalOpen(false);
    setTimeout(() => {
      setSelectedDocument(null);
      setIsScanning(false);
      setAnalysisComplete(false);
      setScanningBoxes([]);
    }, 300);
  };

  const getDocumentSpecificBoxes = (documentName: string) => {
    switch (documentName) {
      case 'land_ownership_deed.pdf':
        return [
          { x: 15, y: 20, width: 40, height: 8, status: 'pending', label: 'Certificate Title Authentication' },
          { x: 55, y: 30, width: 35, height: 6, status: 'pending', label: 'Proprietor Name Verification' },
          { x: 12, y: 45, width: 45, height: 10, status: 'pending', label: 'Property Description & Lot Details' },
          { x: 20, y: 65, width: 30, height: 8, status: 'pending', label: 'Registration Date Validation' },
          { x: 60, y: 75, width: 28, height: 8, status: 'pending', label: 'Official Seals & Signatures' },
          { x: 25, y: 85, width: 35, height: 6, status: 'pending', label: 'Folio Number Authentication' },
        ];
      case 'Community / NGO Agreements.docx':
        return [
          { x: 10, y: 15, width: 45, height: 10, status: 'pending', label: 'Certificate of Incorporation Verification' },
          { x: 60, y: 25, width: 32, height: 8, status: 'pending', label: 'Ministry of Corporate Affairs Seal' },
          { x: 15, y: 40, width: 42, height: 12, status: 'pending', label: 'Foundation Name & Legal Status' },
          { x: 12, y: 60, width: 38, height: 8, status: 'pending', label: 'Companies Act 2013 Compliance' },
          { x: 55, y: 70, width: 30, height: 10, status: 'pending', label: 'Incorporation Date Authentication' },
          { x: 20, y: 85, width: 50, height: 8, status: 'pending', label: 'Project Site Location Mapping' },
        ];
      case 'field_photos_2025.zip':
        return [
          { x: 8, y: 12, width: 25, height: 18, status: 'pending', label: 'Regional Map Analysis' },
          { x: 38, y: 12, width: 28, height: 18, status: 'pending', label: 'Satellite Imagery Verification' },
          { x: 72, y: 12, width: 25, height: 18, status: 'pending', label: 'Restoration Plot Boundaries' },
          { x: 15, y: 40, width: 35, height: 15, status: 'pending', label: 'Sundarban Biosphere Reserve ID' },
          { x: 55, y: 45, width: 32, height: 12, status: 'pending', label: 'Mangrove Growth Documentation' },
          { x: 25, y: 70, width: 45, height: 15, status: 'pending', label: 'Geographic Coordinate Validation' },
        ];
      case 'Plantation / Restoration Proof.pdf':
        return [
          { x: 12, y: 18, width: 38, height: 12, status: 'pending', label: 'Multi-Site Project Scope Analysis' },
          { x: 55, y: 25, width: 35, height: 10, status: 'pending', label: 'Ecosystem Recovery Stages' },
          { x: 20, y: 45, width: 40, height: 8, status: 'pending', label: 'River Channel Documentation' },
          { x: 65, y: 50, width: 30, height: 12, status: 'pending', label: 'Mudflat Restoration Evidence' },
          { x: 15, y: 70, width: 42, height: 10, status: 'pending', label: 'Root System Development' },
          { x: 25, y: 85, width: 48, height: 8, status: 'pending', label: 'MRV Process Compliance Check' },
        ];
      default:
        return [];
    }
  };

  const startAIAnalysis = () => {
    if (!selectedDocument) return;
    
    setIsScanning(true);
    setAnalysisComplete(false);
    
    const initialBoxes = getDocumentSpecificBoxes(selectedDocument.name);
    setScanningBoxes(initialBoxes);

    // Animate each box sequentially with 3.5-4.5 second total duration
    const totalDuration = 4200; // 4.2 seconds total
    const boxDelay = totalDuration / (initialBoxes.length + 1); // Distribute timing evenly
    const scanningDuration = 700; // How long each box shows "scanning" state

    initialBoxes.forEach((_, index) => {
      setTimeout(() => {
        setScanningBoxes(prev => 
          prev.map((box, i) => 
            i === index ? { ...box, status: 'scanning' } : box
          )
        );
        
        // After scanning animation, set final status
        setTimeout(() => {
          setScanningBoxes(prev => 
            prev.map((box, i) => {
              if (i === index) {
                // All documents are verified based on your provided analysis
                return { ...box, status: 'verified' };
              }
              return box;
            })
          );
        }, scanningDuration);
      }, index * boxDelay);
    });

    // Complete analysis after all boxes are processed
    setTimeout(() => {
      setIsScanning(false);
      setAnalysisComplete(true);
      toast({
        title: "AI Analysis Complete",
        description: "Document verification has been processed successfully.",
      });
    }, totalDuration + 500);
  };

  const getDocumentInsights = (documentName: string) => {
    switch (documentName) {
      case 'land_ownership_deed.pdf':
        return [
          { type: 'success', text: 'Certificate confirms William Seguro as the registered proprietor of Lot 124 in Deposited Plan 1234567.' },
          { type: 'success', text: 'Official registration under Property Law Act, 1974 within Torrens Title system verified.' },
          { type: 'success', text: 'Document contains authentic official seals, registrar signature, and unique folio number.' },
          { type: 'info', text: 'Title transfer and registration completed on July 12, 2012 - provides legal foundation for property activities.' },
          { type: 'success', text: 'State-guaranteed title system ensures clear and undisputed ownership of specified land parcel.' },
        ];
      case 'Community / NGO Agreements.docx':
        return [
          { type: 'success', text: 'Certificate of Incorporation issued by Government of India Ministry of Corporate Affairs verified.' },
          { type: 'success', text: 'Innovation Foundation officially incorporated under Indian Companies Act, 2013 on March 5, 2021.' },
          { type: 'info', text: 'Legal entity status confirmed - authorized for binding agreements, project management, and funding.' },
          { type: 'success', text: 'Mangrove restoration site within Sundarban Biosphere Reserve clearly delineated with satellite imagery.' },
          { type: 'success', text: 'Project area boundaries outlined in yellow provide concrete geographic scope for milestone tracking.' },
          { type: 'info', text: 'Visual documentation includes regional maps and photographs of dense mangrove growth along riverbank.' },
        ];
      case 'field_photos_2025.zip':
        return [
          { type: 'success', text: 'Regional map analysis confirms project location within designated Sundarban Biosphere Reserve.' },
          { type: 'success', text: 'Satellite imagery verification shows clearly defined restoration plot boundaries in yellow markers.' },
          { type: 'info', text: 'Visual evidence provides concrete, verifiable proof of project\'s precise location and physical scope.' },
          { type: 'success', text: 'Geographic coordinates validated against official Sundarban reserve boundaries.' },
          { type: 'success', text: 'Photographic documentation shows dense mangrove growth along riverbank areas.' },
          { type: 'info', text: 'Essential for milestone tracking and site verification processes in restoration project.' },
        ];
      case 'Plantation / Restoration Proof.pdf':
        return [
          { type: 'success', text: 'Comprehensive visual evidence demonstrates restoration work across five distinct study sites.' },
          { type: 'success', text: 'Documentation covers multiple ecosystem recovery stages from sparse mudflat growth to established trees.' },
          { type: 'info', text: 'Wide river channels and complex mangrove root systems photographically documented.' },
          { type: 'success', text: 'Project scale verified through variety of images showing different restoration phases.' },
          { type: 'success', text: 'Robust on-the-ground proof validates implementation of restoration activities across multiple sites.' },
          { type: 'info', text: 'Critical documentation for Monitoring, Reporting, and Verification (MRV) processes compliance.' },
        ];
      default:
        return [
          { type: 'info', text: 'Document analysis completed using standard verification protocols.' },
          { type: 'success', text: 'No major inconsistencies detected in the submitted documentation.' },
        ];
    }
  };

  // =========== TAB CONTENT COMPONENTS =========== //

  const DocumentsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-foreground">Project Documents</h3>
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          {projectData.documents.length} Documents
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {projectData.documents.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-all duration-300 border-border/50 bg-card/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{doc.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {doc.size} • Uploaded: {doc.uploadDate}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="hover:bg-accent"
                    onClick={() => handleViewDocument(doc)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  
                  <Button variant="outline" size="sm" className="hover:bg-accent">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <Card className="border-dashed border-2 border-border/50 bg-muted/20">
        <CardContent className="p-8 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h4 className="text-lg font-semibold text-foreground mb-2">Upload Additional Documents</h4>
          <p className="text-muted-foreground mb-4">Drag and drop files here or click to browse</p>
          <Button className="bg-primary hover:bg-primary/90">
            <Upload className="h-4 w-4 mr-2" />
            Browse Files
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const MapTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-2xl font-semibold text-foreground">Blue Carbon Sentinel Map & AI Analysis</h3>
        <div className="flex space-x-2">
          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
            <Satellite className="h-3 w-3 mr-1" />
            LIVE Satellite Data
          </Badge>
          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
            ⚡ WebGL GPU
          </Badge>
          <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
            🆓 MapLibre GL JS
          </Badge>
        </div>
      </div>
      
      <div className="flex gap-6 h-[700px]">
        {/* Blue Carbon Sentinel Map in the target div */}
        <div className="flex-1 bg-muted/20 rounded-lg border border-border/50 overflow-hidden">
          <VerificationMap 
            projectId={projectData.id}
            centerCoordinate={[-10.9, -69.53]}
            height="100%"
            className="w-full h-full"
          />
        </div>
      </div>
    </div>
  );

  const MintingTab = () => {
    const [showMintingModal, setShowMintingModal] = useState(false);
    const [verificationStep, setVerificationStep] = useState<'checking' | 'verified' | 'minting' | 'complete'>('checking');
    const [hashResults, setHashResults] = useState<any[]>([]);
    const [mintingDetails, setMintingDetails] = useState<any>(null);
    const [showTxModal, setShowTxModal] = useState(false);
    const [lastTx, setLastTx] = useState<any>(null);

    // Fallback effect: if mint finished but modal not shown, open it automatically
    useEffect(() => {
      if (verificationStep === 'complete' && mintingDetails && !showTxModal) {
        console.log('[MintingTab] Auto-opening transaction modal');
        setShowTxModal(true);
      }
    }, [verificationStep, mintingDetails, showTxModal]);

    const loadingStates = [
      { text: 'Initializing blockchain connection...' },
      { text: 'Verifying document hashes...' },
      { text: 'Authenticating project ownership...' },
      { text: 'Calculating carbon credit allocation...' },
      { text: 'Preparing smart contract deployment...' },
      { text: 'Executing carbon token minting...' },
      { text: 'Confirming blockchain transaction...' },
      { text: 'Finalizing carbon token creation...' }
    ];

    const startTokenization = () => {
      console.log('[MintingTab] startTokenization invoked');
      setShowMintingModal(true);
      setVerificationStep('checking');
      setHashResults([]);
      setMintingDetails(null);

      const documents = [
        { name: 'land_ownership_deed.pdf', hash: '0xa1b2c3d4e5f6', status: 'checking' },
        { name: 'Community / NGO Agreements.docx', hash: '0xf6e5d4c3b2a1', status: 'checking' },
        { name: 'field_photos_2025.zip', hash: '0x123abc456def', status: 'checking' },
        { name: 'Plantation / Restoration Proof.pdf', hash: '0xdef456abc123', status: 'checking' },
        { name: 'Satellite Imagery Data', hash: '0x789ghi012jkl', status: 'checking' }
      ];
      setHashResults(documents);

      documents.forEach((doc, index) => {
        setTimeout(() => {
          console.log(`[MintingTab] Hash verified for: ${doc.name}`);
          setHashResults(prev => prev.map(r => r.name === doc.name ? { ...r, status: 'matched' } : r));
          if (index === documents.length - 1) {
            setTimeout(() => setVerificationStep('verified'), 400);
          }
        }, (index + 1) * 650);
      });
    };

    const handleMintTokens = () => {
      console.log('[MintingTab] handleMintTokens invoked');
      if (!connected || !publicKey) {
        toast({ title: 'Wallet Not Connected', description: 'Proceeding with simulated mint (test mode).' });
      }
      setVerificationStep('minting');

      // Calculate proper duration based on MultiStepLoader
      // 8 loading states * 1000ms per step = 8000ms total
      const totalDuration = 8000; // 8 seconds to match the loading states
      console.log('[MintingTab] totalDuration(ms)=', totalDuration);

      const simulate = () => {
        console.log('[MintingTab] Simulated mint complete, preparing details');
        
        // Generate more realistic Solana transaction signature format
        const generateRealisticTxHash = () => {
          const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz123456789';
          let result = '';
          for (let i = 0; i < 88; i++) { // Solana signatures are typically 87-88 chars
            result += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          return result;
        };
        
        const txHash = generateRealisticTxHash();
        const walletAddr = connected && publicKey ? publicKey.toBase58() : `So1anaWal1etAddre55${crypto.getRandomValues(new Uint32Array(1))[0].toString(36)}123`;
        
        const details = {
          transactionHash: txHash,
          blockNumber: Math.floor(Math.random() * 900000) + 18500000,
          timestamp: new Date().toISOString(),
          formattedTimestamp: new Date().toLocaleString('en-US', { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit', 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            timeZone: 'UTC',
            timeZoneName: 'short'
          }),
          status: 'Success',
          carbonTokens: projectData.carbonClaim,
          walletAddress: walletAddr,
          tokenAddress: `${generateRealisticTxHash().slice(0, 44)}`, // Token address format
          networkFee: '0.00012 SOL',
          gasUsed: '0.00234 SOL',
          totalCost: '0.00246 SOL'
        };
        
        setMintingDetails(details);
        setLastTx(details);
        
        // First set verification to complete (this will stop the loading)
        setVerificationStep('complete');
        
        // Wait a brief moment for loading to finish, then show transaction modal
        setTimeout(() => {
          setShowMintingModal(false);
          setShowTxModal(true);
        }, 500);
      };

      setTimeout(() => {
        simulate();
      }, totalDuration);
    };

    const copyToClipboard = (val: string) => {
      navigator.clipboard.writeText(val);
      toast({ title: 'Copied', description: 'Value copied to clipboard.' });
    };

    const closeTxModal = () => {
      setShowTxModal(false);
      setVerificationStep('checking');
      setMintingDetails(null);
      setHashResults([]);
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-semibold text-foreground">Carbon Tokenization</h3>
          <div className="flex items-center gap-2">
            <WalletMultiButton />
            {connected && (
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center">
                <Wallet className="h-3 w-3 mr-1" /> Connected
              </Badge>
            )}
          </div>
        </div>

        <Card className="border border-border/50 bg-card/50">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Coins className="h-5 w-5 mr-2 text-primary" />
              Initiate Carbon Tokenization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">This process verifies all project evidence and mints the carbon tokens on-chain.</p>
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border">
              <div>
                <h4 className="font-semibold text-sm">Ready for Tokenization</h4>
                <p className="text-xs text-muted-foreground">All prerequisite verification steps passed</p>
              </div>
              <Button onClick={startTokenization} disabled={!connected || verificationStep==='minting'} className="bg-primary hover:bg-primary/90">
                <Coins className="h-4 w-4 mr-2" /> Start
              </Button>
            </div>
            {!connected && (
              <div className="text-xs text-orange-600 bg-orange-50 dark:bg-orange-900/30 p-3 rounded border">Connect wallet to proceed.</div>
            )}
          </CardContent>
        </Card>

        {/* Hash Verification Modal */}
        <AnimatePresence>
          {showMintingModal && verificationStep !== 'minting' && verificationStep !== 'complete' && (
            <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowMintingModal(false)}>
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 30 }} className="w-full max-w-lg bg-background rounded-xl border border-border/50 shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b">
                  <div className="flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    <h4 className="font-semibold text-sm">Hash Verification</h4>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowMintingModal(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-4 space-y-4 max-h-[60vh] overflow-auto">
                  <p className="text-xs text-muted-foreground">
                    {verificationStep === 'checking' ? 'Verifying submitted document & imagery hashes...' : 'All hashes verified successfully.'}
                  </p>
                  <div className="space-y-2">
                    {hashResults.map((item, i) => (
                      <motion.div key={item.name} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-center justify-between text-xs px-3 py-2 rounded bg-muted/40 border">
                        <span className="truncate max-w-[150px]" title={item.name}>{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">{item.hash}</span>
                          {item.status === 'checking' && <Loader2 className="h-3 w-3 text-yellow-500 animate-spin" />}
                          {item.status === 'matched' && <CheckCircle className="h-3 w-3 text-green-500" />}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                  {verificationStep === 'verified' && (
                    <div className="pt-2 text-center space-y-3">
                      <div className="text-green-600 text-sm font-medium flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 mr-1" /> All hashes matched
                      </div>
                      <Button onClick={handleMintTokens} className="w-full bg-green-600 hover:bg-green-700 text-white">
                        <Coins className="h-4 w-4 mr-2" /> Mint Carbon Tokens
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MultiStep Loader for Minting */}
        <MultiStepLoader loadingStates={loadingStates} loading={verificationStep === 'minting'} duration={1000} />

        {/* Transaction Result Modal */}
        <AnimatePresence>
          {showTxModal && mintingDetails && (
            <motion.div className="fixed inset-0 z-[300] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="w-full max-w-xl bg-background rounded-xl border border-border/60 shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="p-5 border-b flex items-center justify-between bg-muted/30">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <h4 className="font-semibold text-sm">Carbon Tokens Minted</h4>
                  </div>
                  <Button size="icon" variant="ghost" onClick={closeTxModal}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="text-center space-y-1">
                    <div className="text-4xl font-bold text-green-600">{mintingDetails.carbonTokens.toLocaleString()}</div>
                    <div className="text-xs uppercase tracking-wide text-muted-foreground">Blue Carbon Tokens (BCT)</div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <p className="text-muted-foreground mb-1">Transaction Hash</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] break-all flex-1">{mintingDetails.transactionHash}</span>
                        <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => copyToClipboard(mintingDetails.transactionHash)}>
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <p className="text-muted-foreground mb-1">Block</p>
                      <p className="font-medium">#{mintingDetails.blockNumber.toLocaleString()}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <p className="text-muted-foreground mb-1">Timestamp</p>
                      <p className="font-medium">{mintingDetails.formattedTimestamp}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <p className="text-muted-foreground mb-1">Status</p>
                      <Badge className="bg-green-600 text-white h-5 px-2">{mintingDetails.status}</Badge>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <p className="text-muted-foreground mb-1">Wallet Address</p>
                      <p className="font-mono text-[10px] break-all">{mintingDetails.walletAddress}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <p className="text-muted-foreground mb-1">Network Fee</p>
                      <p className="font-medium">{mintingDetails.networkFee}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border">
                      <p className="text-muted-foreground mb-1">Total Cost</p>
                      <p className="font-medium">{mintingDetails.totalCost}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-muted/40 border sm:col-span-2">
                      <p className="text-muted-foreground mb-1">Token Address</p>
                      <p className="font-mono text-[10px] break-all">{mintingDetails.tokenAddress}</p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      className="flex-1" 
                      onClick={() => {
                        // Open Solscan with a notice about simulated transactions
                        const url = `https://solscan.io/tx/${mintingDetails.transactionHash}`;
                        window.open(url, '_blank');
                        
                        // Show helpful toast about simulation
                        toast({
                          title: "Explorer Opened",
                          description: "Note: This is a simulated transaction for demo purposes. In production, this would link to the actual blockchain transaction.",
                          duration: 5000
                        });
                      }}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" /> View on Solscan
                    </Button>
                    <Button variant="outline" className="flex-1" onClick={() => copyToClipboard(mintingDetails.transactionHash)}>Copy Hash</Button>
                    <Button variant="secondary" className="flex-1" onClick={closeTxModal}>Close</Button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Inline Last Transaction Summary */}
        {lastTx && !showTxModal && (
          <Card className="border border-green-500/30 bg-green-50/40 dark:bg-green-900/10">
            <CardContent className="py-4 px-5 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="text-sm">
                <span className="font-semibold text-green-700 dark:text-green-300">Last Mint:</span> {lastTx.carbonTokens} BCT • Tx {lastTx.transactionHash.slice(0, 14)}... • Block #{lastTx.blockNumber}
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setShowTxModal(true)}>Details</Button>
                <Button size="sm" variant="ghost" onClick={() => navigator.clipboard.writeText(lastTx.transactionHash)}>Copy Hash</Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // =========== RENDER =========== //

  return (
    <div className="">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader 
          title="Project Verification Workspace"
          subtitle="Comprehensive project review and verification system"
        />

        <Button
          variant="ghost"
          onClick={() => navigate('/verifier-dashboard')}
          className="group text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Button>

        {/* Project Header */}
        <div className="bg-gradient-to-r from-blue-50/50 to-green-50/50 dark:from-blue-950/20 dark:to-green-950/20 rounded-xl p-6 border border-border/50">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div>
              <h1 className="text-3xl font-bold text-foreground">{projectData.name}</h1>
              <p className="text-muted-foreground mt-1">
                Project ID: {projectData.id} • Submitted by {projectData.ngoName}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                {projectData.location}
              </Badge>
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                {projectData.hectares} Hectares
              </Badge>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 p-1 bg-muted/30 rounded-lg border border-border/50">
          <Button
            variant={activeTab === 'documents' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('documents')}
            className={`flex-1 ${activeTab === 'documents' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </Button>
          
          <Button
            variant={activeTab === 'map' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('map')}
            className={`flex-1 ${activeTab === 'map' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Map className="h-4 w-4 mr-2" />
            Map & Imagery
          </Button>
          
          <Button
            variant={activeTab === 'minting' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('minting')}
            className={`flex-1 ${activeTab === 'minting' 
              ? 'bg-background text-foreground shadow-sm' 
              : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Coins className="h-4 w-4 mr-2" />
            Minting
          </Button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px]">
          {activeTab === 'documents' && <DocumentsTab />}
          {activeTab === 'map' && <MapTab />}
          {activeTab === 'minting' && <MintingTab />}
        </div>
      </div>

      {/* Document Viewer Modal */}
      <AnimatePresence>
        {isDocumentModalOpen && selectedDocument && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
            onClick={handleCloseDocumentModal}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="relative w-full max-w-6xl max-h-[90vh] bg-background rounded-xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-border/50 bg-muted/20">
                <div className="flex items-center space-x-3">
                  <FileText className="h-6 w-6 text-primary" />
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{selectedDocument.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedDocument.size} • {selectedDocument.type.toUpperCase()}
                    </p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-muted"
                  onClick={handleCloseDocumentModal}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-auto max-h-[calc(90vh-200px)]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Document Image Section */}
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-foreground flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-primary" />
                      Document View
                    </h4>
                    <div className="relative">
                      <img 
                        src={selectedDocument.imageUrl} 
                        alt={selectedDocument.name}
                        className="w-full h-auto rounded-lg shadow-lg border border-border/20"
                        style={{ maxHeight: '500px', objectFit: 'contain' }}
                      />
                      
                      {/* Overlay Scanning Boxes */}
                      {isScanning && (
                        <div className="absolute inset-0">
                          {scanningBoxes.map((box, index) => (
                            <motion.div
                              key={index}
                              className={`absolute border-2 rounded ${
                                box.status === 'scanning' 
                                  ? 'border-yellow-400 bg-yellow-400/20' 
                                  : box.status === 'verified'
                                  ? 'border-green-400 bg-green-400/20'
                                  : box.status === 'warning'
                                  ? 'border-orange-400 bg-orange-400/20'
                                  : 'border-gray-400 bg-gray-400/20'
                              }`}
                              style={{
                                left: `${box.x}%`,
                                top: `${box.y}%`,
                                width: `${box.width}%`,
                                height: `${box.height}%`,
                              }}
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: index * 0.3 }}
                            >
                              <div className="absolute -bottom-8 left-0 bg-background/90 backdrop-blur-sm px-2 py-1 rounded text-xs font-medium border border-border/50">
                                {box.status === 'scanning' && (
                                  <span className="text-yellow-600 flex items-center">
                                    <motion.div
                                      className="w-2 h-2 bg-yellow-400 rounded-full mr-1"
                                      animate={{ opacity: [1, 0.3, 1] }}
                                      transition={{ repeat: Infinity, duration: 0.8 }}
                                    />
                                    Analyzing...
                                  </span>
                                )}
                                {box.status === 'verified' && (
                                  <span className="text-green-600 flex items-center">
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Verified
                                  </span>
                                )}
                                {box.status === 'warning' && (
                                  <span className="text-orange-600 flex items-center">
                                    <XCircle className="w-3 h-3 mr-1" />
                                    Check Required
                                  </span>
                                )}
                                <div className="text-[10px] text-muted-foreground">{box.label}</div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* AI Analysis Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-foreground flex items-center">
                        <Satellite className="h-5 w-5 mr-2 text-primary" />
                        AI Analysis
                      </h4>
                      <Button
                        onClick={startAIAnalysis}
                        disabled={isScanning}
                        className={`${
                          isScanning 
                            ? 'bg-yellow-500 hover:bg-yellow-600' 
                            : analysisComplete
                            ? 'bg-green-500 hover:bg-green-600'
                            : 'bg-primary hover:bg-primary/90'
                        } transition-all duration-300`}
                      >
                        {isScanning ? (
                          <>
                            <motion.div
                              className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full"
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            />
                            Scanning...
                          </>
                        ) : analysisComplete ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Analysis Complete
                          </>
                        ) : (
                          'Start AI Analysis'
                        )}
                      </Button>
                    </div>

                    {/* Analysis Results */}
                    <div className="space-y-4">
                      {analysisComplete && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                          className="bg-muted/30 rounded-lg p-4 border border-border/50"
                        >
                          <h5 className="font-semibold text-foreground mb-3">Verification Summary</h5>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Key Fields</span>
                              <Badge variant={analysis.keyFieldsMatch ? "default" : "destructive"}>
                                {analysis.keyFieldsMatch ? 'Match' : 'No Match'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Content Validity</span>
                              <Badge variant={analysis.contentValid ? "default" : "destructive"}>
                                {analysis.contentValid ? 'Valid' : 'Invalid'}
                              </Badge>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm">Overall Status</span>
                              <Badge variant={analysis.overallValid ? "default" : "destructive"}>
                                {analysis.overallValid ? 'Approved' : 'Rejected'}
                              </Badge>
                            </div>
                          </div>
                        </motion.div>
                      )}

                      {/* Generated Insights */}
                      {analysisComplete && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.8 }}
                          className="bg-gradient-to-br from-blue-50/50 to-green-50/50 dark:from-blue-950/20 dark:to-green-950/20 rounded-lg p-4 border border-border/50"
                        >
                          <h5 className="font-semibold text-foreground mb-3 flex items-center">
                            <Eye className="h-4 w-4 mr-2 text-primary" />
                            Generated Insights
                          </h5>
                          <div className="space-y-3 text-sm">
                            {getDocumentInsights(selectedDocument.name).map((insight, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1 + index * 0.2 }}
                                className="flex items-start space-x-2"
                              >
                                <div className={`w-2 h-2 rounded-full mt-2 ${
                                  insight.type === 'success' ? 'bg-green-500' :
                                  insight.type === 'warning' ? 'bg-orange-500' :
                                  'bg-blue-500'
                                }`} />
                                <p className="text-muted-foreground leading-relaxed">{insight.text}</p>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between p-6 border-t border-border/50 bg-muted/20 mt-auto">
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    Uploaded: {selectedDocument.uploadDate}
                  </Badge>
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" className="hover:bg-accent">
                    <Download className="h-4 w-4 mr-2" />
                    Download Original
                  </Button>
                  <Button className="bg-primary hover:bg-primary/90">
                    Mark as Reviewed
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectVerificationWorkspace;
