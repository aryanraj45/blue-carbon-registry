import React, { useReducer, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Map, Layers, Image as ImageIcon, AlertTriangle, Camera } from 'lucide-react';
import mapImage from '@/assets/assets23.jpg';

//=========== TYPE DEFINITIONS ===========//
// (Interfaces for MapLayer, PhotoPin, AnalysisArea, etc. remain the same)
interface MapLayer { id: string; name: string; date: string; }
interface PhotoPin { id: string; lat: number; lng: number; title: string; date: string; }
interface AnalysisArea { id: string; type: 'concern' | 'growth' | 'deforestation'; description: string; }

//=========== UTILITY FUNCTIONS ===========//
// Moved outside the component to prevent re-creation on every render.
const getAnalysisColor = (type: string) => { /* ... logic from original file ... */ };
const getAnalysisIcon = (type: string) => { /* ... logic from original file ... */ };

//=========== STATE MANAGEMENT (useReducer) ===========//
type MapState = {
  selectedLayer1: string;
  selectedLayer2: string;
  comparisonMode: 'split' | 'slider' | 'overlay';
  opacity: number[];
  showAnalysis: boolean;
  selectedPhoto: PhotoPin | null;
};
type MapAction =
  | { type: 'SET_LAYER_1'; payload: string }
  | { type: 'SET_LAYER_2'; payload: string }
  | { type: 'SET_COMPARISON_MODE'; payload: 'split' | 'slider' | 'overlay' }
  | { type: 'SET_OPACITY'; payload: number[] }
  | { type: 'TOGGLE_ANALYSIS'; payload: boolean }
  | { type: 'SELECT_PHOTO'; payload: PhotoPin | null };

const initialState: MapState = {
  selectedLayer1: 'satellite-2024',
  selectedLayer2: 'satellite-2023',
  comparisonMode: 'split',
  opacity: [50],
  showAnalysis: true,
  selectedPhoto: null,
};

const mapReducer = (state: MapState, action: MapAction): MapState => {
  switch (action.type) {
    case 'SET_LAYER_1': return { ...state, selectedLayer1: action.payload };
    case 'SET_LAYER_2': return { ...state, selectedLayer2: action.payload };
    case 'SET_COMPARISON_MODE': return { ...state, comparisonMode: action.payload };
    case 'SET_OPACITY': return { ...state, opacity: action.payload };
    case 'TOGGLE_ANALYSIS': return { ...state, showAnalysis: action.payload };
    case 'SELECT_PHOTO': return { ...state, selectedPhoto: action.payload };
    default: return state;
  }
};

//=========== UI SUB-COMPONENTS (IN-FILE) ===========//

const LayerSelector = React.memo(({ label, value, onValueChange, layers }: any) => (
  <div>
    <label className="text-sm font-medium">{label}</label>
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger><SelectValue /></SelectTrigger>
      <SelectContent>{layers.map((layer: MapLayer) => <SelectItem key={layer.id} value={layer.id}>{layer.name} ({layer.date})</SelectItem>)}</SelectContent>
    </Select>
  </div>
));

const MapControls = React.memo(({ state, dispatch, layers }: { state: MapState; dispatch: React.Dispatch<MapAction>; layers: MapLayer[] }) => (
  <Card>
    <CardHeader><CardTitle className="flex items-center space-x-2"><Layers /><span>Map Controls</span></CardTitle></CardHeader>
    <CardContent className="space-y-4">
      {/* Comparison Mode Select */}
      <div className="flex items-center justify-between">
        <label>Comparison Mode:</label>
        <Select value={state.comparisonMode} onValueChange={(v) => dispatch({ type: 'SET_COMPARISON_MODE', payload: v as any })}>
            {/* ... Select Trigger and Content ... */}
        </Select>
      </div>
      {/* Layer Selectors */}
      <div className="grid grid-cols-2 gap-4">
        <LayerSelector label="Layer 1 (Left/Bottom):" value={state.selectedLayer1} onValueChange={(v: string) => dispatch({ type: 'SET_LAYER_1', payload: v })} layers={layers} />
        <LayerSelector label="Layer 2 (Right/Top):" value={state.selectedLayer2} onValueChange={(v: string) => dispatch({ type: 'SET_LAYER_2', payload: v })} layers={layers} />
      </div>
      {/* Opacity Slider */}
      {state.comparisonMode === 'overlay' && (
        <div>
          <label>Overlay Opacity: {state.opacity[0]}%</label>
          <Slider value={state.opacity} onValueChange={(v) => dispatch({ type: 'SET_OPACITY', payload: v })} />
        </div>
      )}
      {/* Analysis Toggle */}
      <div className="flex items-center justify-between">
        <label>Show AI Analysis:</label>
        <Switch checked={state.showAnalysis} onCheckedChange={(v) => dispatch({ type: 'TOGGLE_ANALYSIS', payload: v })} />
      </div>
    </CardContent>
  </Card>
));

const MapViewer = React.memo(({ photoPins, analysisAreas, showAnalysis, onPinClick }: any) => (
  <Card>
    <CardHeader>{/* ... CardHeader JSX ... */}</CardHeader>
    <CardContent>
      <div className="aspect-[16/10] bg-muted rounded-lg relative overflow-hidden">
        <img src={mapImage} alt="Satellite map" className="w-full h-full object-cover" />
        {/* Photo Pins Overlay */}
        {photoPins.slice(0, 3).map((pin: PhotoPin, index: number) => <div key={pin.id} onClick={() => onPinClick(pin)}>{/* ... Pin JSX ... */}</div>)}
        {/* Analysis Areas Overlay */}
        {showAnalysis && analysisAreas.slice(0, 2).map((area: AnalysisArea) => <div key={area.id}>{/* ... Analysis Area JSX ... */}</div>)}
      </div>
    </CardContent>
  </Card>
));

const PhotoDetails = React.memo(({ photo, onClose }: { photo: PhotoPin | null; onClose: () => void }) => {
    if (!photo) return null;
    return <Card>{/* ... Photo Details Card JSX ... */}</Card>;
});

const AnalysisSummary = React.memo(({ analysisAreas }: { analysisAreas: AnalysisArea[] }) => (
    <Card>
      <CardHeader><CardTitle>AI Analysis Summary</CardTitle></CardHeader>
      <CardContent className="space-y-3">
        {analysisAreas.map((area) => <div key={area.id}>{/* ... Analysis Summary Item JSX ... */}</div>)}
      </CardContent>
    </Card>
));


//=========== MAIN COMPONENT ===========//

const MapComparator: React.FC<MapComparatorProps> = ({ layers, photoPins, analysisAreas }) => {
  const [state, dispatch] = useReducer(mapReducer, initialState);

  const handlePinClick = useCallback((pin: PhotoPin | null) => {
    dispatch({ type: 'SELECT_PHOTO', payload: pin });
  }, []);

  return (
    <div className="space-y-6">
      <MapControls state={state} dispatch={dispatch} layers={layers} />
      <MapViewer 
        photoPins={photoPins}
        analysisAreas={analysisAreas}
        showAnalysis={state.showAnalysis}
        onPinClick={handlePinClick}
      />
      <PhotoDetails photo={state.selectedPhoto} onClose={() => handlePinClick(null)} />
      <AnalysisSummary analysisAreas={analysisAreas} />
    </div>
  );
};

export default MapComparator;