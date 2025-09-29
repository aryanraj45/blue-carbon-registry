import React, { useState } from 'react';
import NGOOCRUpload from '../components/NGOOCRUpload';
import OCRResults from '../components/OCRResults';
import { OCRResult } from '../types/ocr';

const OCRPage: React.FC = () => {
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);

  const handleOCRComplete = (result: OCRResult) => {
    setOcrResult(result);
  };

  const handleClearResults = () => {
    setOcrResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Blue Carbon Document Processor
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload and process carbon registry documents using AI-powered OCR. 
            Extract key information from carbon credit certificates, environmental reports, 
            and verification documents.
          </p>
        </div>

        <div className="space-y-8">
          {!ocrResult ? (
            <NGOOCRUpload onOCRComplete={handleOCRComplete} />
          ) : (
            <OCRResults result={ocrResult} onClear={handleClearResults} />
          )}
        </div>
      </div>
    </div>
  );
};

export default OCRPage;