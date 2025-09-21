import React, { useState, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Brain, FileText, Map, MessageCircle } from 'lucide-react';
import AIAnalysisTab from './AIAnalysisTab';
import DocumentViewer from './DocumentViewer';
import MapComparator from './MapComparator';
import CommunicationLog from './CommunicationLog';

interface EvidenceHubProps {
  projectData: {
    id: string;
    confidenceScore: number;
    aiSummary: string;
    checklistItems: Array<{
      id: string;
      label: string;
      status: 'completed' | 'failed' | 'warning' | 'pending';
      description?: string;
    }>;
    documents: Array<{
      id: string;
      name: string;
      type: 'pdf' | 'docx' | 'jpg' | 'png';
      size: string;
      uploadDate: string;
      ocrText?: string;
      ocrAccuracy?: number;
      highlighted_entities?: Array<{
        text: string;
        type: 'name' | 'date' | 'coordinate' | 'legal_clause';
        confidence: number;
      }>;
    }>;
    projectBounds: number[][];
    mapLayers: Array<{
      id: string;
      name: string;
      type: 'satellite' | 'photo' | 'analysis';
      date: string;
      enabled: boolean;
    }>;
    photoPins: Array<{
      id: string;
      lat: number;
      lng: number;
      title: string;
      date: string;
      thumbnail: string;
    }>;
    analysisAreas: Array<{
      id: string;
      type: 'concern' | 'growth' | 'deforestation';
      coordinates: number[][];
      description: string;
    }>;
    auditTrail: Array<{
      id: string;
      timestamp: string;
      actor: string;
      action: string;
      details?: string;
    }>;
    messages: Array<{
      id: string;
      sender: string;
      senderType: 'verifier' | 'ngo' | 'system';
      message: string;
      timestamp: string;
      read: boolean;
    }>;
  };
}

const EvidenceHub: React.FC<EvidenceHubProps> = ({ projectData }) => {
  const [activeTab, setActiveTab] = useState('ai-analysis');

  const handleUpdateChecklist = useCallback((items: any[]) => {
    // Update checklist logic goes here
    console.log('Checklist updated:', items);
  }, []);

  const handleLayerToggle = useCallback((layerId: string, enabled: boolean) => {
    // Layer toggle logic goes here
    console.log('Layer toggled:', layerId, enabled);
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    // Send message logic goes here
    console.log('Message sent:', message);
  }, []);

  const unreadMessages = useMemo(
    () => projectData.messages.filter(m => !m.read && m.senderType === 'ngo').length,
    [projectData.messages]
  );

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="ai-analysis" className="flex items-center space-x-2">
          <Brain className="h-4 w-4" />
          <span className="hidden sm:inline">AI Summary</span>
          <Badge variant="outline" className="ml-1 hidden md:inline">
            {projectData.confidenceScore}%
          </Badge>
        </TabsTrigger>
        
        <TabsTrigger value="documents" className="flex items-center space-x-2">
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Documents</span>
          <Badge variant="outline" className="ml-1 hidden md:inline">
            {projectData.documents.length}
          </Badge>
        </TabsTrigger>
        
        <TabsTrigger value="map-imagery" className="flex items-center space-x-2">
          <Map className="h-4 w-4" />
          <span className="hidden sm:inline">Map & Imagery</span>
          <Badge variant="outline" className="ml-1 hidden md:inline">
            {projectData.photoPins.length}
          </Badge>
        </TabsTrigger>
        
        <TabsTrigger value="communication" className="flex items-center space-x-2">
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">History & Chat</span>
          {unreadMessages > 0 && (
            <Badge className="ml-1 bg-destructive text-destructive-foreground">
              {unreadMessages}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <div className="mt-6">
        <TabsContent value="ai-analysis" className="space-y-6">
          <AIAnalysisTab
            projectId={projectData.id}
            confidenceScore={projectData.confidenceScore}
            aiNarrativeSummary={projectData.aiSummary}
            checklistItems={projectData.checklistItems}
            onUpdateChecklist={handleUpdateChecklist}
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentViewer documents={projectData.documents} />
        </TabsContent>

        <TabsContent value="map-imagery" className="space-y-6">
          <MapComparator
            projectBounds={projectData.projectBounds}
            layers={projectData.mapLayers}
            photoPins={projectData.photoPins}
            analysisAreas={projectData.analysisAreas}
            onLayerToggle={handleLayerToggle}
          />
        </TabsContent>

        <TabsContent value="communication" className="space-y-6">
          <CommunicationLog
            projectId={projectData.id}
            auditTrail={projectData.auditTrail}
            messages={projectData.messages}
            onSendMessage={handleSendMessage}
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default EvidenceHub;
