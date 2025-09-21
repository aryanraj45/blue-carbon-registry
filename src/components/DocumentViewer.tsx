import React, { useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Eye, Download, AlertCircle } from 'lucide-react';

interface Document {
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
}

interface DocumentViewerProps {
  documents: Document[];
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ documents }) => {
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(() => documents[0] || null);

  const getFileIcon = useCallback((type: string) => {
    switch (type) {
      case 'pdf': return '📄';
      case 'docx': return '📝';
      case 'jpg':
      case 'png': return '🖼️';
      default: return '📁';
    }
  }, []);

  const getAccuracyBadge = useCallback((accuracy?: number) => {
    if (!accuracy) return null;
    if (accuracy >= 95) return <Badge className="bg-success text-success-foreground">High Accuracy</Badge>;
    if (accuracy >= 80) return <Badge variant="secondary">Medium Accuracy</Badge>;
    return <Badge variant="destructive">Low Accuracy</Badge>;
  }, []);

  const highlightEntities = useCallback((text: string, entities: Document['highlighted_entities'] = []) => {
    if (!entities.length) return text;

    let highlightedText = text;
    entities.forEach((entity) => {
      const regex = new RegExp(`(${entity.text})`, 'gi');
      const className = `bg-${entity.type === 'coordinate' ? 'primary' : 
                        entity.type === 'date' ? 'secondary' : 
                        entity.type === 'name' ? 'accent' : 'muted'}/20 px-1 rounded`;
      highlightedText = highlightedText.replace(regex, `<mark class="${className}">$1</mark>`);
    });
    return highlightedText;
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      {/* Document List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Documents</span>
            <Badge variant="outline">{documents.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px]">
            <div className="space-y-2">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedDoc?.id === doc.id
                      ? 'bg-primary/10 border-primary'
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getFileIcon(doc.type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {doc.size} • {doc.uploadDate}
                      </p>
                    </div>
                  </div>
                  {doc.ocrAccuracy && (
                    <div className="mt-2">
                      {getAccuracyBadge(doc.ocrAccuracy)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Document Viewer */}
      <div className="lg:col-span-2 space-y-4">
        {selectedDoc ? (
          <>
            {/* Document Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Eye className="h-5 w-5" />
                    <span>{selectedDoc.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    {selectedDoc.ocrAccuracy && (
                      <>
                        {getAccuracyBadge(selectedDoc.ocrAccuracy)}
                        {selectedDoc.ocrAccuracy < 80 && <AlertCircle className="h-4 w-4 text-destructive" />}
                      </>
                    )}
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-[4/3] bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                  <div className="text-center">
                    <FileText className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Document preview</p>
                    <p className="text-xs text-muted-foreground mt-1">{selectedDoc.name}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* OCR Text */}
            {selectedDoc.ocrText && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Extracted Text (OCR)</span>
                    <div className="flex items-center space-x-2">
                      {selectedDoc.highlighted_entities && (
                        <Badge variant="outline">
                          {selectedDoc.highlighted_entities.length} Entities
                        </Badge>
                      )}
                      {selectedDoc.ocrAccuracy && (
                        <Badge variant="outline">
                          {selectedDoc.ocrAccuracy}% Accuracy
                        </Badge>
                      )}
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[300px]">
                    <div
                      className="prose max-w-none text-sm whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: highlightEntities(selectedDoc.ocrText, selectedDoc.highlighted_entities)
                      }}
                    />
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card className="h-full">
            <CardContent className="flex items-center justify-center h-[500px]">
              <div className="text-center">
                <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">Select a document to view</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DocumentViewer;
