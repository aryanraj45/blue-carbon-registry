export interface DocumentData {
  projectName?: string;
  areaPlanned?: string;
  speciesToBePlanted?: string;
  numberOfSaplings?: string;
  gpsCoordinates?: string;
  plantingStartDate?: string;
  plantingEndDate?: string;
  ngoName?: string;
  registrationNumber?: string;
  dateOfRegistration?: string;
  issuingAuthority?: string;
  validity?: string;
  dateOfObservation?: string;
  areaPlanted?: string;
  numberOfSaplingSurvived?: string;
  healthStatus?: string;
  observerName?: string;
  photoImageName?: string;
  timestamp?: string;
  caption?: string;
  droneFieldOfficerId?: string;
}

export interface ProcessedDocument {
  name: string;
  fields: DocumentData;
  confidence: number;
}

export interface OCRResult {
  documents: ProcessedDocument[];
  mockHash: string;
  overallConfidence: number;
}

export interface NGODocument {
  id: string;
  fileName: string;
  uploadDate: Date;
  ocrResult: OCRResult;
  status: 'processing' | 'completed' | 'failed';
}