import React, { useState } from 'react';
import ocrService from '../lib/ocr-service';
import { OCRResult, ProcessedDocument } from '../lib/ocr-service';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Upload, FileText, CheckCircle, Database, Hash, Copy, Eye, Clock, X, Loader2, Download, ExternalLink, Scan, Zap, Brain } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { FileUpload } from "@/components/ui/file-upload"; // 1. THIS LINE IS ADDED

interface DocumentProcessorProps {
  onProcessingComplete?: (result: OCRResult) => void;
  onStoreOnChain?: (result: OCRResult) => void;
}

const DocumentProcessor: React.FC<DocumentProcessorProps> = ({ 
  onProcessingComplete, 
  onStoreOnChain 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isStoring, setIsStoring] = useState(false);
  const [result, setResult] = useState<OCRResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);
  const [showBlockchainPopup, setShowBlockchainPopup] = useState(false);
  const [transactionData, setTransactionData] = useState<any>(null);
  const [progressValue, setProgressValue] = useState(0);
  const { toast } = useToast();

  // 3. THIS FUNCTION IS MODIFIED
  const handleFileUpload = (files: File[]) => {
    const file = files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF file containing all required documents",
        variant: "destructive"
      });
      return;
    }

    setUploadedFile(file);
    toast({
      title: "PDF Uploaded",
      description: `${file.name} is ready for processing`,
    });
  };

  const processDocument = async () => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please upload a PDF file first",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    setShowPopup(true);
    setProgressValue(0);
    
    try {
      // Enhanced processing steps with progress animation
      setProcessingStep('Analyzing PDF structure...');
      setProgressValue(20);
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setProcessingStep('Extracting document data...');
      setProgressValue(50);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setProcessingStep('Generating hash...');
      setProgressValue(80);
      await new Promise(resolve => setTimeout(resolve, 600));
      
      setProcessingStep('Finalizing results...');
      setProgressValue(100);
      
      const ocrResult = await ocrService.processSinglePDF(uploadedFile);
      
      setResult(ocrResult);
      
      toast({
        title: "Processing Complete!",
        description: `Successfully processed all documents`,
      });

      if (onProcessingComplete) {
        onProcessingComplete(ocrResult);
      }
    } catch (error) {
      toast({
        title: "Processing Failed",
        description: "Failed to process PDF. Please try again.",
        variant: "destructive"
      });
      console.error('Document processing error:', error);
      setShowPopup(false);
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
      setProgressValue(0);
    }
  };

  const handleStoreOnChain = async () => {
    if (!result) return;
    
    setShowBlockchainPopup(true);
    setIsStoring(true);
    
    try {
      if (onStoreOnChain) {
        await onStoreOnChain(result);
      }
      
      // Simulate blockchain transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate mock transaction data
      const mockTransactionData = {
        signature: `${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        blockHeight: 298_745_123 + Math.floor(Math.random() * 1000),
        timestamp: new Date().toISOString(),
        fee: 0.000005,
        status: 'confirmed',
        documentHash: result.mockHash,
        documentsCount: result.documents.length
      };
      
      setTransactionData(mockTransactionData);
      
      toast({
        title: "Successfully Stored on Blockchain",
        description: "Document data has been permanently recorded",
      });
      
    } catch (error) {
      toast({
        title: "Storage Failed",
        description: "Failed to store on blockchain. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsStoring(false);
    }
  };

  const downloadProof = () => {
    if (!transactionData || !result) return;

    const proofData = {
      transactionSignature: transactionData.signature,
      blockHeight: transactionData.blockHeight,
      timestamp: transactionData.timestamp,
      documentHash: result.mockHash,
      documents: result.documents.map(doc => ({
        name: doc.name,
        fieldsExtracted: Object.keys(doc.fields).length
      })),
      network: 'Solana Devnet',
      status: 'Confirmed'
    };

    const blob = new Blob([JSON.stringify(proofData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `blockchain-proof-${transactionData.signature.substring(0, 8)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Proof Downloaded",
      description: "Blockchain proof has been saved to your downloads",
    });
  };

  const copyHash = () => {
    if (result?.mockHash) {
      navigator.clipboard.writeText(result.mockHash);
      toast({
        title: "Hash Copied",
        description: "Document hash copied to clipboard",
      });
    }
  };

  const closePopup = () => {
    if (!isProcessing && !isStoring) {
      setShowPopup(false);
      setResult(null);
    }
  };

  const resetProcessor = () => {
    setResult(null);
    setUploadedFile(null);
    setShowPopup(false);
  };

  const getFieldLabel = (key: string): string => {
    const labels: Record<string, string> = {
      projectName: "Project Name",
      areaPlanned: "Area Planned (hectares)",
      speciesToBePlanted: "Species to be Planted",
      numberOfSaplings: "Number of Saplings",
      gpsCoordinates: "GPS Coordinates",
      plantingStartDate: "Planting Start Date",
      plantingEndDate: "Planting End Date",
      ngoName: "NGO Name",
      registrationNumber: "Registration Number",
      dateOfRegistration: "Date of Registration",
      issuingAuthority: "Issuing Authority",
      validity: "Validity",
      dateOfObservation: "Date of Observation",
      areaPlanted: "Area Planted (hectares)",
      numberOfSaplingSurvived: "Number of Saplings Survived",
      healthStatus: "Health Status / Growth Notes",
      observerName: "Observer / Field Officer Name",
      photoImageName: "Photo / Image Name",
      timestamp: "Timestamp / Date",
      caption: "Caption / Description",
      droneFieldOfficerId: "Drone / Field Officer ID"
    };
    return labels[key] || key;
  };

  // Enhanced OCR Processing Popup with Animations
  const OCRPopup = () => {
    if (!showPopup) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[85vh] overflow-hidden">
          {/* Compact Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Document Processing</h2>
              <p className="text-xs text-gray-600">AI-powered document analysis</p>
            </div>
            {!isProcessing && (
              <Button onClick={() => setShowPopup(false)} variant="ghost" size="sm">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <div className="p-4 space-y-4 overflow-y-auto max-h-[calc(85vh-100px)]">
            {/* Enhanced Loading State with Animations */}
            {isProcessing && (
              <div className="text-center py-12 relative">
                {/* Background animated elements */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute top-10 left-1/4 w-2 h-2 bg-blue-300 rounded-full animate-ping opacity-75"></div>
                  <div className="absolute top-20 right-1/3 w-1 h-1 bg-indigo-400 rounded-full animate-ping opacity-50 animation-delay-500"></div>
                  <div className="absolute bottom-20 left-1/3 w-1.5 h-1.5 bg-purple-300 rounded-full animate-ping opacity-60 animation-delay-1000"></div>
                  <div className="absolute bottom-10 right-1/4 w-1 h-1 bg-blue-400 rounded-full animate-ping opacity-40 animation-delay-1500"></div>
                </div>

                {/* Main processing animation */}
                <div className="relative z-10">
                  {/* Multi-ring spinner with icons */}
                  <div className="w-20 h-20 mx-auto mb-6 relative">
                    {/* Outer ring */}
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                    
                    {/* Middle ring */}
                    <div className="absolute inset-2 border-2 border-indigo-300 rounded-full border-r-transparent animate-spin animation-delay-300 animation-reverse"></div>
                    
                    {/* Inner ring */}
                    <div className="absolute inset-4 border-2 border-purple-400 rounded-full border-b-transparent animate-spin animation-delay-600"></div>
                    
                    {/* Center icon with pulse */}
                    <div className="absolute inset-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center animate-pulse">
                      {processingStep.includes('Analyzing') && <Scan className="h-3 w-3 text-white" />}
                      {processingStep.includes('Extracting') && <Brain className="h-3 w-3 text-white" />}
                      {processingStep.includes('Generating') && <Zap className="h-3 w-3 text-white" />}
                      {processingStep.includes('Finalizing') && <CheckCircle className="h-3 w-3 text-white" />}
                    </div>
                  </div>
                  
                  {/* Floating status indicators */}
                  <div className="flex justify-center space-x-2 mb-6">
                    <div className={`w-3 h-3 rounded-full transition-all duration-500 ${progressValue >= 20 ? 'bg-blue-500 animate-bounce' : 'bg-gray-300'}`}></div>
                    <div className={`w-3 h-3 rounded-full transition-all duration-500 animation-delay-200 ${progressValue >= 50 ? 'bg-indigo-500 animate-bounce' : 'bg-gray-300'}`}></div>
                    <div className={`w-3 h-3 rounded-full transition-all duration-500 animation-delay-400 ${progressValue >= 80 ? 'bg-purple-500 animate-bounce' : 'bg-gray-300'}`}></div>
                    <div className={`w-3 h-3 rounded-full transition-all duration-500 animation-delay-600 ${progressValue >= 100 ? 'bg-green-500 animate-bounce' : 'bg-gray-300'}`}></div>
                  </div>
                </div>
                
                {/* Processing text with typewriter effect */}
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 animate-pulse">Processing Document</h3>
                  <p className="text-blue-600 text-sm mb-4 font-medium animate-pulse">{processingStep}</p>
                  
                  {/* Enhanced progress bar with glow effect */}
                  <div className="max-w-xs mx-auto mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden relative">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-full transition-all duration-1000 ease-out relative"
                        style={{width: `${progressValue}%`}}
                      >
                        {/* Shimmer effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                      </div>
                      {/* Glow effect */}
                      <div 
                        className="absolute top-0 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-50 transition-all duration-1000"
                        style={{width: `${progressValue}%`}}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">AI analysis in progress...</p>
                  </div>

                  {/* Processing steps indicator */}
                  <div className="flex justify-center space-x-6 text-xs">
                    <div className={`flex flex-col items-center transition-all duration-500 ${progressValue >= 20 ? 'text-blue-600' : 'text-gray-400'}`}>
                      <Scan className={`h-4 w-4 mb-1 ${progressValue >= 20 ? 'animate-pulse' : ''}`} />
                      <span>Analyze</span>
                    </div>
                    <div className={`flex flex-col items-center transition-all duration-500 ${progressValue >= 50 ? 'text-indigo-600' : 'text-gray-400'}`}>
                      <Brain className={`h-4 w-4 mb-1 ${progressValue >= 50 ? 'animate-pulse' : ''}`} />
                      <span>Extract</span>
                    </div>
                    <div className={`flex flex-col items-center transition-all duration-500 ${progressValue >= 80 ? 'text-purple-600' : 'text-gray-400'}`}>
                      <Zap className={`h-4 w-4 mb-1 ${progressValue >= 80 ? 'animate-pulse' : ''}`} />
                      <span>Generate</span>
                    </div>
                    <div className={`flex flex-col items-center transition-all duration-500 ${progressValue >= 100 ? 'text-green-600' : 'text-gray-400'}`}>
                      <CheckCircle className={`h-4 w-4 mb-1 ${progressValue >= 100 ? 'animate-pulse' : ''}`} />
                      <span>Complete</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Compact Results State */}
            {result && !isProcessing && (
              <>
                {/* Success Header */}
                <div className="text-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Processing Complete!</h3>
                  <p className="text-sm text-gray-600">Extracted data from {result.documents.length} documents</p>
                </div>

                {/* Compact Document Sections */}
                <div className="space-y-3">
                  {result.documents.map((doc, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center gap-2 text-gray-900 text-base">
                          <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                            <FileText className="h-3 w-3 text-blue-600" />
                          </div>
                          <span className="truncate">{doc.name}</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(doc.fields).slice(0, 4).map(([key, value]) => (
                            <div key={key} className="bg-gray-50 p-2 rounded text-xs">
                              <div className="text-gray-500 mb-1 uppercase tracking-wide">
                                {getFieldLabel(key)}
                              </div>
                              <div className="text-gray-900 font-medium truncate">
                                {String(value)}
                              </div>
                            </div>
                          ))}
                          {Object.keys(doc.fields).length > 4 && (
                            <div className="text-xs text-gray-500 p-2">
                              +{Object.keys(doc.fields).length - 4} more fields
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Compact Hash Section */}
                <Card className="border border-gray-200">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-gray-900 flex items-center gap-2 text-sm">
                      <Hash className="h-4 w-4 text-purple-600" />
                      Document Hash
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-xs">
                      <code className="flex-1 text-gray-800 font-mono truncate">
                        {result.mockHash}
                      </code>
                      <Button onClick={copyHash} size="sm" variant="outline" className="h-6 px-2">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Store Button */}
                <div className="text-center pt-2">
                  <Button 
                    onClick={handleStoreOnChain}
                    size="lg"
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-2"
                  >
                    <Database className="h-4 w-4 mr-2" />
                    Store on Blockchain
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Custom CSS for enhanced animations */}
        <style jsx>{`
          .animation-delay-200 { animation-delay: 0.2s; }
          .animation-delay-300 { animation-delay: 0.3s; }
          .animation-delay-400 { animation-delay: 0.4s; }
          .animation-delay-500 { animation-delay: 0.5s; }
          .animation-delay-600 { animation-delay: 0.6s; }
          .animation-delay-1000 { animation-delay: 1s; }
          .animation-delay-1500 { animation-delay: 1.5s; }
          .animation-reverse { animation-direction: reverse; }

          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }

          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }

          @keyframes glow {
            0%, 100% { box-shadow: 0 0 5px rgba(59, 130, 246, 0.5); }
            50% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.8); }
          }
          .animate-glow {
            animation: glow 2s ease-in-out infinite;
          }

          .border-3 {
            border-width: 3px;
          }
        `}</style>
      </div>
    );
  };

  // New Blockchain Transaction Popup
  const BlockchainPopup = () => {
    if (!showBlockchainPopup) return null;

    return (
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 backdrop-blur-md">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl max-w-lg w-full mx-4 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-red-50">
            <h2 className="text-xl font-bold text-gray-900">Blockchain Transaction</h2>
            <p className="text-xs text-gray-600">Solana Network Storage</p>
          </div>

          <div className="p-4 space-y-4">
            {/* Loading State */}
            {isStoring && !transactionData && (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 relative">
                  <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                  <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                  <div className="absolute inset-3 w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Database className="h-5 w-5 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Processing Transaction</h3>
                <p className="text-gray-600 mb-4">Securing data on Solana blockchain</p>
                <div className="max-w-xs mx-auto">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="h-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
                  </div>
                </div>
              </div>
            )}

            {/* Success State */}
            {transactionData && (
              <>
                <div className="text-center py-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Transaction Successful!</h3>
                  <p className="text-sm text-gray-600">Data permanently stored on blockchain</p>
                </div>

                {/* Transaction Details */}
                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">TRANSACTION SIGNATURE</div>
                    <div className="text-sm font-mono text-gray-900 break-all">{transactionData.signature}</div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">BLOCK HEIGHT</div>
                      <div className="text-sm font-semibold text-gray-900">{transactionData.blockHeight.toLocaleString()}</div>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="text-xs text-gray-500 mb-1">NETWORK FEE</div>
                      <div className="text-sm font-semibold text-gray-900">{transactionData.fee} SOL</div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">STATUS</div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-semibold text-green-700">Confirmed</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button 
                    onClick={downloadProof}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Proof
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowBlockchainPopup(false);
                      setShowPopup(false);
                      setResult(null);
                      setUploadedFile(null);
                      setTransactionData(null);
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Close
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Blue Carbon Document Processor
          </CardTitle>
          <p className="text-gray-300">
            Upload a single PDF containing all required documents for AI-powered OCR processing
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* 2. THIS BLOCK IS REPLACED */}
          <FileUpload onChange={handleFileUpload} />

          {/* Uploaded File Display */}
          {uploadedFile && (
            <div className="bg-gray-800 p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-red-400" />
                <div className="flex-1">
                  <div className="text-white font-medium">{uploadedFile.name}</div>
                  <div className="text-gray-400 text-sm">
                    {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB • PDF Document
                  </div>
                </div>
                <CheckCircle className="h-6 w-6 text-green-500" />
              </div>
            </div>
          )}

          {/* Process Button */}
          <Button 
            onClick={processDocument} 
            disabled={isProcessing || !uploadedFile}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Process PDF with AI OCR
            </div>
          </Button>
        </CardContent>
      </Card>

      {/* OCR Processing Popup */}
      <OCRPopup />
      
      {/* Blockchain Transaction Popup */}
      <BlockchainPopup />
    </div>
  );
};

export default DocumentProcessor;