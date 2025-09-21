import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Coins, 
  Shield, 
  Lock, 
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Loader2,
  Copy,
  Database
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ReadyToMintProject {
  id: string;
  projectName: string;
  finalVerifiedTonnage: number;
  submittingNGO: string;
  immutableDataHash: string;
  verifierApprovalHash: string;
  verifierName: string;
  approvalDate: string;
}

const MintingConsole = () => {
  const { toast } = useToast();
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [mintingPassword, setMintingPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  
  const [readyProjects, setReadyProjects] = useState<ReadyToMintProject[]>([
    {
      id: '1848',
      projectName: 'Seagrass Restoration Initiative',
      finalVerifiedTonnage: 200,
      submittingNGO: 'Blue Ocean Trust',
      immutableDataHash: 'QmX7eJ8K9mN2pQ4rS6tU8vW1xY3zA5bC7dE9fG2hI4jK6l',
      verifierApprovalHash: '0x742d35Cc6634C0532925a3b8D7f0d75Df7a8b3C9dE2f',
      verifierName: 'Dr. James Smith',
      approvalDate: '2024-01-20'
    },
    {
      id: '1851',
      projectName: 'Coral Reef Protection Program',
      finalVerifiedTonnage: 350,
      submittingNGO: 'Marine Life Foundation',
      immutableDataHash: 'QmY8fJ9K0mO3qR5sT7uV9wX2yZ4aB6cD8eF0gH3iJ5kL7m',
      verifierApprovalHash: '0x853e46Dd7745D1643036b4c9E8f0e86Eg8b9c4D0eF3g',
      verifierName: 'Dr. Maria Rodriguez',
      approvalDate: '2024-01-18'
    }
  ]);

  const [mintedProjects, setMintedProjects] = useState([
    {
      id: '1849',
      projectName: 'Coastal Wetland Protection',
      carbonCredits: 180,
      transactionHash: '0x742d35Cc6634C0532925a3b8D7f0d75Df7a8b3C9dE2f1G3h',
      tokenId: 'NCCR-001849',
      mintDate: '2024-01-19',
      submittingNGO: 'Marine Life Foundation'
    }
  ]);

  const handleSelectProject = (projectId: string) => {
    setSelectedProjects(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  const handleMintCredits = async () => {
    if (selectedProjects.length === 0) {
      toast({
        title: "No Projects Selected",
        description: "Please select at least one project to mint.",
        variant: "destructive"
      });
      return;
    }
    
    if (!mintingPassword || !twoFactorCode) {
      toast({
        title: "Authentication Required",
        description: "Please enter your password and 2FA code.",
        variant: "destructive"
      });
      return;
    }

    setIsMinting(true);
    
    // Simulate blockchain minting process
    setTimeout(() => {
      const totalCredits = selectedProjects.reduce((sum, projectId) => {
        const project = readyProjects.find(p => p.id === projectId);
        return sum + (project?.finalVerifiedTonnage || 0);
      }, 0);

      // Move projects to minted list
      selectedProjects.forEach(projectId => {
        const project = readyProjects.find(p => p.id === projectId);
        if (project) {
          const transactionHash = `0x${Math.random().toString(16).substring(2, 10)}Cc6634C0532925a3b8D7f0d75Df7...${Math.random().toString(16).substring(2, 6)}`;
          
          setMintedProjects(prev => [...prev, {
            id: project.id,
            projectName: project.projectName,
            carbonCredits: project.finalVerifiedTonnage,
            transactionHash,
            tokenId: `NCCR-${project.id}`,
            mintDate: new Date().toISOString().split('T')[0],
            submittingNGO: project.submittingNGO
          }]);
        }
      });

      // Remove from ready list
      setReadyProjects(prev => prev.filter(p => !selectedProjects.includes(p.id)));
      
      toast({
        title: "Carbon Credits Minted Successfully!",
        description: `${totalCredits} carbon credits have been minted across ${selectedProjects.length} projects.`,
      });
      
      setSelectedProjects([]);
      setShowConfirmModal(false);
      setMintingPassword('');
      setTwoFactorCode('');
      setIsMinting(false);
    }, 4000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to Clipboard",
      description: "Hash has been copied to clipboard.",
    });
  };

  const totalSelectedCredits = selectedProjects.reduce((sum, projectId) => {
    const project = readyProjects.find(p => p.id === projectId);
    return sum + (project?.finalVerifiedTonnage || 0);
  }, 0);

  return (
    <div className="space-y-6">
      {/* Ready to Mint Queue */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Coins className="h-5 w-5 text-success" />
            <span>Blockchain & Carbon Credit Minting Console</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 border-warning bg-warning/10">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Security Notice:</strong> Minting carbon credits is an irreversible blockchain operation. 
              All project data will be permanently recorded on-chain with immutable proof packages.
            </AlertDescription>
          </Alert>

          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">"Ready to Mint" Queue</h3>
            <div className="space-y-4">
              {readyProjects.map((project) => (
                <Card 
                  key={project.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedProjects.includes(project.id) 
                      ? 'border-primary bg-primary/5' 
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => handleSelectProject(project.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={selectedProjects.includes(project.id)}
                          onChange={() => handleSelectProject(project.id)}
                          className="w-4 h-4"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold text-foreground">
                            Project #{project.id} - {project.projectName}
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2 text-sm">
                            <div>
                              <p className="text-muted-foreground">Final Verified Tonnage</p>
                              <p className="font-bold text-success">
                                {project.finalVerifiedTonnage} CO₂e
                              </p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Submitting NGO</p>
                              <p className="font-medium">{project.submittingNGO}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Verified By</p>
                              <p className="font-medium">{project.verifierName}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Approval Date</p>
                              <p className="font-medium">{project.approvalDate}</p>
                            </div>
                          </div>
                          
                          <div className="mt-3 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Database className="h-4 w-4 text-secondary" />
                              <span className="text-xs text-muted-foreground">IPFS Hash:</span>
                              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                {project.immutableDataHash}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(project.immutableDataHash);
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Shield className="h-4 w-4 text-primary" />
                              <span className="text-xs text-muted-foreground">Verifier Hash:</span>
                              <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                                {project.verifierApprovalHash}
                              </code>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  copyToClipboard(project.verifierApprovalHash);
                                }}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Minting Controls */}
          {selectedProjects.length > 0 && (
            <Card className="border-primary bg-primary/5">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground mb-1">
                      Ready to Mint: {selectedProjects.length} Projects
                    </h4>
                    <p className="text-success font-bold">
                      Total Credits: {totalSelectedCredits.toLocaleString()} CO₂e
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="space-y-2">
                      <Input
                        type="password"
                        placeholder="Admin Password"
                        value={mintingPassword}
                        onChange={(e) => setMintingPassword(e.target.value)}
                        className="w-48"
                      />
                      <Input
                        type="text"
                        placeholder="2FA Code"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value)}
                        className="w-48"
                      />
                    </div>
                    
                    <Button
                      size="lg"
                      onClick={handleMintCredits}
                      disabled={isMinting || !mintingPassword || !twoFactorCode}
                      className="bg-success text-success-foreground hover:bg-success/90"
                    >
                      {isMinting ? (
                        <>
                          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                          Minting on Blockchain...
                        </>
                      ) : (
                        <>
                          <Lock className="h-5 w-5 mr-2" />
                          Mint Carbon Credits
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Minted Projects Log */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-success" />
            <span>Minted Projects Registry</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mintedProjects.map((project) => (
              <Card key={project.id} className="border-success bg-success/5">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {project.projectName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {project.submittingNGO}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs">
                        <span>Token ID: <code className="bg-muted px-1 rounded">{project.tokenId}</code></span>
                        <span>Mint Date: {project.mintDate}</span>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-success text-lg">
                        {project.carbonCredits.toLocaleString()} CO₂e
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <code className="text-xs bg-muted px-2 py-1 rounded font-mono">
                          {project.transactionHash.substring(0, 20)}...
                        </code>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MintingConsole;