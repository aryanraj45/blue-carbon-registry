import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { 
  Satellite, 
  Layers, 
  Eye, 
  EyeOff,
  Map,
  Activity,
  TreePine,
  Waves,
  Mountain,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Navigation,
  Play,
  Pause
} from 'lucide-react';

// Define the props the map will accept
interface VerificationMapProps {
  projectBoundary?: GeoJSON.FeatureCollection | null; // GeoJSON for the project area
  aiAnalysisLayer?: GeoJSON.FeatureCollection | null; // GeoJSON from AI
  isAiLayerVisible?: boolean; // Control visibility from the dashboard
  centerCoordinate?: [number, number];
  projectId?: string;
  className?: string;
  height?: string;
}

interface MapLayer {
  id: string;
  name: string;
  type: 'satellite' | 'ai-analysis' | 'ecosystem' | 'carbon-density' | 'baseline';
  enabled: boolean;
  opacity: number;
  icon: React.ReactNode;
  color: string;
}

interface AnalysisArea {
  id: string;
  type: 'healthy' | 'degraded' | 'restored' | 'concern' | 'deforestation';
  coordinates: number[][];
  description: string;
  confidence: number;
  carbonDensity?: number;
  changeDetected: boolean;
}

const VerificationMap: React.FC<VerificationMapProps> = ({
  projectBoundary,
  aiAnalysisLayer,
  isAiLayerVisible = true,
  centerCoordinate = [-10.9, -69.53], // Default to Blue Carbon project area
  projectId = 'BCR-001',
  className = '',
  height = '100%'
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [is3D, setIs3D] = useState(false);
  const [selectedLayer, setSelectedLayer] = useState('satellite');
  const [showAIAnalysis, setShowAIAnalysis] = useState(isAiLayerVisible);
  const [aiOpacity, setAiOpacity] = useState(0.7);
  const [currentTimeIndex, setCurrentTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Blue Carbon Sentinel map layers
  const mapLayers: MapLayer[] = [
    { 
      id: 'satellite', 
      name: 'Sentinel-2 Satellite', 
      type: 'satellite', 
      enabled: true, 
      opacity: 1.0, 
      icon: <Satellite className="h-4 w-4" />,
      color: 'text-blue-600'
    },
    { 
      id: 'ai-analysis', 
      name: 'AI Change Detection', 
      type: 'ai-analysis', 
      enabled: showAIAnalysis, 
      opacity: aiOpacity, 
      icon: <Activity className="h-4 w-4" />,
      color: 'text-red-600'
    },
    { 
      id: 'ecosystem', 
      name: 'Ecosystem Classification', 
      type: 'ecosystem', 
      enabled: false, 
      opacity: 0.8, 
      icon: <TreePine className="h-4 w-4" />,
      color: 'text-green-600'
    },
    { 
      id: 'carbon-density', 
      name: 'Carbon Density Map', 
      type: 'carbon-density', 
      enabled: false, 
      opacity: 0.6, 
      icon: <Waves className="h-4 w-4" />,
      color: 'text-purple-600'
    }
  ];

  // Mock Blue Carbon analysis data for demonstration
  const mockAnalysisAreas: AnalysisArea[] = [
    {
      id: 'area-1',
      type: 'healthy',
      coordinates: [[-10.89, -69.54], [-10.895, -69.52], [-10.905, -69.525], [-10.89, -69.54]],
      description: 'Thriving mangrove restoration - 92% canopy coverage increase since 2020',
      confidence: 0.94,
      carbonDensity: 85,
      changeDetected: true
    },
    {
      id: 'area-2', 
      type: 'concern',
      coordinates: [[-10.91, -69.56], [-10.912, -69.558], [-10.915, -69.561], [-10.91, -69.56]],
      description: 'Potential illegal logging detected - requires field verification',
      confidence: 0.87,
      carbonDensity: 45,
      changeDetected: true
    },
    {
      id: 'area-3',
      type: 'restored',
      coordinates: [[-10.885, -69.53], [-10.89, -69.528], [-10.888, -69.535], [-10.885, -69.53]],
      description: 'Successful seagrass restoration - 78% coverage improvement',
      confidence: 0.91,
      carbonDensity: 68,
      changeDetected: true
    }
  ];

  const timeSeriesData = [
    { date: '2020-01', description: 'Project Baseline' },
    { date: '2021-06', description: 'Initial Planting Phase' },
    { date: '2022-12', description: 'Growth Assessment' },
    { date: '2024-06', description: 'Maturation Phase' },
    { date: '2025-09', description: 'Current Status' }
  ];

  // Initialize MapLibre GL JS map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors'
          },
          'satellite-tiles': {
            type: 'raster',
            tiles: ['https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'],
            tileSize: 256,
            attribution: '© Esri, Maxar, GeoEye • Blue Carbon Sentinel'
          }
        },
        layers: [
          {
            id: 'satellite-layer',
            type: 'raster',
            source: 'satellite-tiles',
            layout: { visibility: 'visible' }
          }
        ]
      },
      center: centerCoordinate,
      zoom: 13,
      pitch: 0,
      bearing: 0
    });

    // Add navigation controls
    map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.current.on('load', () => {
      if (!map.current) return;
      
      setMapLoaded(true);

      // Add project boundary from props or default
      const boundary = projectBoundary || {
        type: 'FeatureCollection' as const,
        features: [{
          type: 'Feature' as const,
          geometry: {
            type: 'Polygon' as const,
            coordinates: [[
              [-10.88, -69.55], [-10.90, -69.51], [-10.92, -69.53], [-10.91, -69.56], [-10.88, -69.55]
            ]]
          },
          properties: { name: 'Blue Carbon Project Area' }
        }]
      };

      map.current.addSource('project-boundary', {
        type: 'geojson',
        data: boundary
      });

      map.current.addLayer({
        id: 'project-boundary-fill',
        type: 'fill',
        source: 'project-boundary',
        paint: {
          'fill-color': '#00ff88',
          'fill-opacity': 0.15
        }
      });

      map.current.addLayer({
        id: 'project-boundary-line',
        type: 'line',
        source: 'project-boundary',
        paint: {
          'line-color': '#00ff88',
          'line-width': 4,
          'line-dasharray': [2, 2]
        }
      });

      // Add AI analysis areas
      mockAnalysisAreas.forEach(area => {
        const sourceId = `analysis-${area.id}`;
        map.current!.addSource(sourceId, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [area.coordinates]
            },
            properties: {
              ...area,
              fillColor: getAreaColor(area.type)
            }
          }
        });

        // 2D analysis layer
        map.current!.addLayer({
          id: `${sourceId}-fill`,
          type: 'fill',
          source: sourceId,
          paint: {
            'fill-color': ['get', 'fillColor'],
            'fill-opacity': ['case', ['get', 'changeDetected'], aiOpacity, 0.3]
          },
          layout: {
            visibility: showAIAnalysis ? 'visible' : 'none'
          }
        });

        map.current!.addLayer({
          id: `${sourceId}-line`,
          type: 'line',
          source: sourceId,
          paint: {
            'line-color': ['get', 'fillColor'],
            'line-width': 2,
            'line-dasharray': area.changeDetected ? [1, 1] : [4, 2]
          },
          layout: {
            visibility: showAIAnalysis ? 'visible' : 'none'
          }
        });

        // Add interactive popups
        map.current!.on('click', `${sourceId}-fill`, (e) => {
          if (!e.features?.[0]) return;
          
          const properties = e.features[0].properties;
          const coordinates = (e.lngLat.lng && e.lngLat.lat) ? [e.lngLat.lng, e.lngLat.lat] as [number, number] : centerCoordinate;

          new maplibregl.Popup({ closeOnClick: true })
            .setLngLat(coordinates)
            .setHTML(`
              <div class="p-3 min-w-64">
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-lg">${properties?.type?.toUpperCase()} Zone</h4>
                  <span class="text-xs bg-gray-100 px-2 py-1 rounded">${Math.round((properties?.confidence || 0) * 100)}% Confidence</span>
                </div>
                <p class="text-sm text-gray-700 mb-3">${properties?.description}</p>
                <div class="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span class="font-medium">Carbon Density:</span>
                    <br><span class="text-blue-600">${properties?.carbonDensity || 0} tCO₂e/ha</span>
                  </div>
                  <div>
                    <span class="font-medium">Change Status:</span>
                    <br><span class="text-green-600">${properties?.changeDetected ? 'Detected' : 'Stable'}</span>
                  </div>
                </div>
              </div>
            `)
            .addTo(map.current!);
        });

        // Change cursor on hover
        map.current!.on('mouseenter', `${sourceId}-fill`, () => {
          if (map.current) map.current.getCanvas().style.cursor = 'pointer';
        });

        map.current!.on('mouseleave', `${sourceId}-fill`, () => {
          if (map.current) map.current.getCanvas().style.cursor = '';
        });
      });
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [centerCoordinate, projectBoundary]);

  // Helper function to get colors for different area types
  const getAreaColor = (type: string): string => {
    switch (type) {
      case 'healthy': return '#22c55e';
      case 'restored': return '#3b82f6';
      case 'concern': return '#ef4444';
      case 'degraded': return '#f97316';
      case 'deforestation': return '#dc2626';
      default: return '#6b7280';
    }
  };

  // Toggle AI analysis visibility
  const toggleAIAnalysis = (visible: boolean) => {
    if (!map.current || !mapLoaded) return;
    
    setShowAIAnalysis(visible);
    
    mockAnalysisAreas.forEach(area => {
      const fillLayerId = `analysis-${area.id}-fill`;
      const lineLayerId = `analysis-${area.id}-line`;
      
      if (map.current?.getLayer(fillLayerId)) {
        map.current.setLayoutProperty(fillLayerId, 'visibility', visible ? 'visible' : 'none');
        map.current.setLayoutProperty(lineLayerId, 'visibility', visible ? 'visible' : 'none');
      }
    });
  };

  // Update AI layer opacity
  const updateAIOpacity = (opacity: number) => {
    if (!map.current || !mapLoaded) return;
    
    setAiOpacity(opacity);
    
    mockAnalysisAreas.forEach(area => {
      const fillLayerId = `analysis-${area.id}-fill`;
      if (map.current?.getLayer(fillLayerId)) {
        map.current.setPaintProperty(fillLayerId, 'fill-opacity', ['case', ['get', 'changeDetected'], opacity, 0.3]);
      }
    });
  };

  // Toggle 3D view
  const toggle3D = () => {
    if (!map.current) return;
    
    const newPitch = is3D ? 0 : 60;
    const newBearing = is3D ? 0 : -17.6;
    
    map.current.easeTo({
      pitch: newPitch,
      bearing: newBearing,
      duration: 1000
    });
    
    setIs3D(!is3D);
  };

  // Switch map layers
  const switchLayer = (layerId: string) => {
    if (!map.current) return;
    
    setSelectedLayer(layerId);
    
    switch (layerId) {
      case 'satellite':
        map.current.setLayoutProperty('satellite-layer', 'visibility', 'visible');
        if (map.current.getLayer('osm-layer')) {
          map.current.setLayoutProperty('osm-layer', 'visibility', 'none');
        }
        break;
      case 'ai-analysis':
        toggleAIAnalysis(true);
        break;
      default:
        break;
    }
  };

  // Reset map view
  const resetView = () => {
    if (!map.current) return;
    
    map.current.easeTo({
      center: centerCoordinate,
      zoom: 13,
      pitch: 0,
      bearing: 0,
      duration: 1000
    });
    
    setIs3D(false);
  };

  // Time series animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTimeIndex(prev => (prev + 1) % timeSeriesData.length);
      }, 2000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying]);

  const currentTimeData = timeSeriesData[currentTimeIndex];

  return (
    <div className={`relative w-full ${className}`} style={{ height }}>
      {/* Map Container - Positioned at Bottom */}
      <div 
        ref={mapContainer} 
        className="absolute bottom-0 left-0 right-0 w-full rounded-lg"
        style={{ height: 'calc(100% - 80px)', minHeight: '400px' }}
      />
      
      {/* Advanced Controls Panel */}
      <Card className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur-sm shadow-lg z-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            Blue Carbon Sentinel Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* View Mode Toggle */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">View Mode</label>
            <div className="flex gap-1">
              <Button 
                variant={!is3D ? "default" : "outline"} 
                size="sm" 
                onClick={() => !is3D || toggle3D()}
                className="flex-1 text-xs"
              >
                <Map className="h-3 w-3 mr-1" />
                2D
              </Button>  
              <Button 
                variant={is3D ? "default" : "outline"} 
                size="sm"
                onClick={() => is3D || toggle3D()}
                className="flex-1 text-xs"
              >
                <Mountain className="h-3 w-3 mr-1" />
                3D
              </Button>
            </div>
          </div>

          {/* AI Analysis Controls */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">AI Analysis Overlay</label>
              <Switch
                checked={showAIAnalysis}
                onCheckedChange={toggleAIAnalysis}
              />
            </div>
            
            {showAIAnalysis && (
              <div className="space-y-2">
                <label className="text-xs font-medium text-gray-600">
                  AI Layer Opacity: {Math.round(aiOpacity * 100)}%
                </label>
                <Slider
                  value={[aiOpacity]}
                  onValueChange={(value) => updateAIOpacity(value[0])}
                  max={1}
                  min={0.1}
                  step={0.1}
                  className="w-full"
                />
              </div>
            )}
          </div>

          {/* Layer Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Map Layers</label>
            <div className="grid grid-cols-1 gap-1">
              {mapLayers.slice(0, 3).map(layer => (
                <Button
                  key={layer.id}
                  variant={selectedLayer === layer.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => switchLayer(layer.id)}
                  className="justify-start text-xs h-8"
                >
                  <span className={layer.color}>
                    {layer.icon}
                  </span>
                  <span className="ml-2">{layer.name}</span>
                </Button>
              ))}
            </div>
          </div>

          {/* Time Series Controls */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Time Series Analysis</label>
            <div className="flex gap-2 mb-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setIsPlaying(!isPlaying)}
                className="text-xs"
              >
                {isPlaying ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => setCurrentTimeIndex(0)}
                className="text-xs"
              >
                <RotateCcw className="h-3 w-3" />
              </Button>
            </div>
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              <strong>{currentTimeData.date}</strong><br />
              {currentTimeData.description}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetView}
              className="flex-1 text-xs"
            >
              <Navigation className="h-3 w-3 mr-1" />
              Reset View
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => map.current?.zoomIn()}
              className="text-xs"
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => map.current?.zoomOut()}
              className="text-xs"
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Badges */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
        <Badge className="bg-green-100 text-green-800">
          <Satellite className="h-3 w-3 mr-1" />
          LIVE Satellite
        </Badge>
        {showAIAnalysis && (
          <Badge className="bg-red-100 text-red-800">
            <Activity className="h-3 w-3 mr-1" />
            AI Analysis Active
          </Badge>
        )}
        {is3D && (
          <Badge className="bg-blue-100 text-blue-800">
            <Mountain className="h-3 w-3 mr-1" />
            3D View
          </Badge>
        )}
      </div>

      {/* Analysis Summary */}
      <Card className="absolute bottom-4 left-4 w-72 bg-white/95 backdrop-blur-sm z-10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Analysis Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="font-bold text-green-600">
                {mockAnalysisAreas.filter(a => a.type === 'healthy' || a.type === 'restored').length}
              </div>
              <div className="text-gray-600">Healthy Areas</div>
            </div>
            <div className="text-center p-2 bg-red-50 rounded">
              <div className="font-bold text-red-600">
                {mockAnalysisAreas.filter(a => a.type === 'concern' || a.type === 'degraded').length}
              </div>
              <div className="text-gray-600">Concern Areas</div>
            </div>
          </div>
          <div className="text-xs text-gray-600">
            <strong>Project:</strong> {projectId} • <strong>Confidence:</strong> 91%
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VerificationMap;