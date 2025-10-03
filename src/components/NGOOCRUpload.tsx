import React, { useState, useCallback } from 'react';
import ocrService from '../lib/ocr-service';
import { OCRResult } from '../types/ocr';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface NGOOCRUploadProps {
  onOCRComplete: (result: OCRResult) => void;
}
//component for uploading and processing NGO documents via OCR
const NGOOCRUpload: React.FC<NGOOCRUploadProps> = ({ onOCRComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const result = await ocrService.extractTextFromImage(file);
      onOCRComplete(result);
    } catch (err) {
      setError('Failed to process document. Please try again.');
      console.error('OCR processing error:', err);
    } finally {
      setIsProcessing(false);
    }
  }, [onOCRComplete]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  }, [handleFiles]);

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8">
        <div
          className={`
            border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300
            ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
            ${isProcessing ? 'border-blue-400 bg-blue-25' : ''}
            ${!isProcessing ? 'hover:border-gray-400' : ''}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="file-upload"
            accept="image/*"
            onChange={handleFileInput}
            disabled={isProcessing}
            className="hidden"
          />
          
          {isProcessing ? (
            <div className="space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600">Processing document...</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-6xl mb-4">📄</div>
              <h3 className="text-xl font-semibold text-gray-800">Upload Carbon Registry Document</h3>
              <p className="text-gray-600">Drop your document here or click to browse</p>
              <p className="text-sm text-gray-500">
                Supports: Carbon credit certificates, Environmental reports, Verification documents
              </p>
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  Choose File
                </label>
              </Button>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NGOOCRUpload;