import React from 'react';
import { OCRResult } from '../types/ocr';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';

interface OCRResultsProps {
  result: OCRResult;
  onClear: () => void;
}

const OCRResults: React.FC<OCRResultsProps> = ({ result, onClear }) => {
  const renderStructuredData = () => {
    if (!result.structuredData || Object.keys(result.structuredData).length === 0) {
      return (
        <div className="text-gray-500 text-center p-4">
          No structured data extracted
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(result.structuredData).map(([key, value]) => (
          <div key={key} className="bg-gray-50 p-3 rounded-lg">
            <div className="font-medium text-sm text-gray-600 mb-1">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </div>
            <div className="text-gray-900">{String(value)}</div>
          </div>
        ))}
      </div>
    );
  };

  const getDocumentTypeColor = (type: string) => {
    const lowerType = type.toLowerCase();
    if (lowerType.includes('carbon') || lowerType.includes('credit')) return 'bg-green-100 text-green-800';
    if (lowerType.includes('verification') || lowerType.includes('certificate')) return 'bg-blue-100 text-blue-800';
    if (lowerType.includes('report') || lowerType.includes('environmental')) return 'bg-purple-100 text-purple-800';
    if (lowerType.includes('monitoring') || lowerType.includes('data')) return 'bg-orange-100 text-orange-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Document Analysis Results</h2>
        <Button onClick={onClear} variant="outline">
          Clear Results
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Document Type
              <Badge className={getDocumentTypeColor(result.documentType)}>
                {result.documentType}
              </Badge>
            </CardTitle>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Confidence Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Progress value={result.confidence * 100} className="w-full" />
              <div className="text-sm text-gray-600 text-center">
                {Math.round(result.confidence * 100)}% confidence
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extracted Information</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStructuredData()}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Full Extracted Text</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg max-h-64 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm text-gray-700">
              {result.extractedText}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OCRResults;