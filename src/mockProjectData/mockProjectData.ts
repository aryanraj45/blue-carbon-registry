export const mockProjectData = {
    id: 'PROJ-08B-451',
    confidenceScore: 87,
    aiSummary:
      'The project demonstrates strong alignment with initial goals, particularly in reforestation efforts observed via satellite imagery analysis between Q2 2024 and Q3 2025. Key legal documents confirm land tenure and rights. However, a potential encroachment on the western boundary has been flagged, corresponding with a "failed" checklist item for boundary integrity. OCR analysis of submitted field reports shows a 92% accuracy, with key coordinates and dates successfully extracted. Communication logs indicate active engagement from the NGO partner, with 2 unread messages requiring attention.',
    checklistItems: [
      { id: 'chk-1', label: 'Land Tenure & Rights Verified', status: 'completed', description: 'Legal documents cross-referenced with government records.' },
      { id: 'chk-2', label: 'Boundary Integrity Confirmed', status: 'failed', description: 'Satellite imagery shows potential encroachment on the western perimeter.' },
      { id: 'chk-3', label: 'Community Consent Forms Received', status: 'completed', description: 'All required forms from local stakeholders are on file.' },
      { id: 'chk-4', label: 'Reforestation Milestones Met', status: 'warning', description: 'Q3 planting target is 15% behind schedule but recoverable.' },
      { id: 'chk-5', label: 'Financial Audit Trail Clear', status: 'pending', description: 'Awaiting Q3 financial report submission.' },
    ],
    documents: [
      {
        id: 'doc-1',
        name: 'Land_Title_Deed.pdf',
        type: 'pdf',
        size: '2.1 MB',
        uploadDate: '2025-06-15',
        ocrText: 'This document confirms the title of the land designated for the Amazon Reforestation Project...',
        highlighted_entities: [
          { text: 'Amazon Reforestation Project', type: 'name', confidence: 0.99 },
          { text: 'July 1, 2024', type: 'date', confidence: 0.95 },
          { text: 'Clause 7.B', type: 'legal_clause', confidence: 0.88 },
        ],
      },
      {
        id: 'doc-2',
        name: 'Site_Photo_West_Boundary.jpg',
        type: 'jpg',
        size: '4.5 MB',
        uploadDate: '2025-08-22',
        url: 'https://picsum.photos/seed/forest/800/600', // Using a placeholder image
      },
      {
        id: 'doc-3',
        name: 'Community_Consent_Agreements.docx',
        type: 'docx',
        size: '870 KB',
        uploadDate: '2025-07-03',
      },
      {
        id: 'doc-4',
        name: 'Drone_Survey_Aug_2025.jpg',
        type: 'jpg',
        size: '6.2 MB',
        uploadDate: '2025-08-30',
        url: 'https://picsum.photos/seed/droneview/800/600', // Using a placeholder image
      },
    ],
    projectBounds: [
      [-10.88, -69.55],
      [-10.90, -69.51],
      [-10.92, -69.53],
      [-10.91, -69.56],
      [-10.88, -69.55],
    ],
    mapLayers: [
      { id: 'layer-1', name: 'Satellite (Aug 2025)', type: 'satellite', date: '2025-08-15', enabled: true },
      { id: 'layer-2', name: 'Satellite (Jan 2024)', type: 'satellite', date: '2024-01-20', enabled: false },
      { id: 'layer-3', name: 'Field Photos', type: 'photo', date: '2025-09-01', enabled: true },
      { id: 'layer-4', name: 'AI Deforestation Analysis', type: 'analysis', date: '2025-09-02', enabled: true },
    ],
    photoPins: [
      { id: 'pin-1', lat: -10.89, lng: -69.54, title: 'New Sapling Growth', date: '2025-08-25', thumbnail: 'https://picsum.photos/seed/sapling/100/100' },
      { id: 'pin-2', lat: -10.915, lng: -69.555, title: 'Western Boundary Concern', date: '2025-08-22', thumbnail: 'https://picsum.photos/seed/boundary/100/100' },
    ],
    analysisAreas: [
      { id: 'area-1', type: 'concern', coordinates: [ [-10.91, -69.56], [-10.912, -69.558], [-10.915, -69.561], [-10.91, -69.56] ], description: 'Area of potential illegal logging activity.' },
      { id: 'area-2', type: 'growth', coordinates: [ [-10.885, -69.53], [-10.89, -69.528], [-10.888, -69.535], [-10.885, -69.53] ], description: 'High-density reforestation zone showing excellent progress.' },
    ],
    auditTrail: [
      { id: 'aud-1', timestamp: '2025-09-15 11:45 UTC', actor: 'Verifier (Alice)', action: 'Status Changed: Boundary Integrity', details: 'Changed status from Pending to Failed based on satellite data.' },
      { id: 'aud-2', timestamp: '2025-09-15 09:20 UTC', actor: 'System', action: 'New Document Added', details: 'Drone_Survey_Aug_2025.jpg' },
      { id: 'aud-3', timestamp: '2025-09-14 18:05 UTC', actor: 'NGO Contact (Bob)', action: 'Sent Message', details: 'Message regarding Q3 milestones.' },
    ],
    messages: [
      { id: 'msg-1', sender: 'Verifier (Alice)', senderType: 'verifier', message: 'Thanks for the latest field photos. Can you provide more detail on the western boundary?', timestamp: '2025-09-14 14:22 UTC', read: true },
      { id: 'msg-2', sender: 'NGO Contact (Bob)', senderType: 'ngo', message: 'Hi Alice, we are looking into it. We believe it might be an old access road. We will send a team to verify on the ground this week.', timestamp: '2025-09-14 18:05 UTC', read: false },
      { id: 'msg-3', sender: 'NGO Contact (Bob)', senderType: 'ngo', message: 'Also, a quick update: The Q3 financial reports are ready and will be uploaded by EOD tomorrow.', timestamp: '2025-09-15 10:15 UTC', read: false },
    ],
  };