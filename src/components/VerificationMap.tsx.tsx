import React, { useRef, useEffect, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Input } from './ui/input';
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
  Pause,
  MapPin,
  X
} from 'lucide-react';

// Import analysis images
import ss1Image from '@/assets/ss1.png';
import ss2Image from '@/assets/ss2.png';
import ss33Image from '@/assets/ss33.png';
import ss4Image from '@/assets/ss4.png';
import ss5Image from '@/assets/ss5.png';

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
  const [longitude, setLongitude] = useState('');
  const [latitude, setLatitude] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisPopup, setShowAnalysisPopup] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<'loading' | 'images' | 'insights'>('loading');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showInsights, setShowInsights] = useState(false);

  // Analysis images from assets folder
  const analysisImages = [
    ss1Image,
    ss2Image, 
    ss33Image,
    ss4Image,
    ss5Image
  ];

  // AI Analysis insights
  const analysisInsights = [
    "Satellite imagery confirms active plantation activities in the designated blue carbon area.",
    "Vegetation growth patterns indicate successful mangrove restoration with 85% coverage increase.",
    "Soil analysis shows optimal conditions for blue carbon sequestration with high organic matter content.",
    "Water quality parameters support healthy ecosystem development for marine life.",
    "Carbon sequestration rate estimated at 12.5 tCO₂e per hectare annually based on vegetation density."
  ];

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

  // Navigate to coordinates
  const navigateToCoordinates = () => {
    if (!map.current || !longitude || !latitude) return;
    
    const lng = parseFloat(longitude);
    const lat = parseFloat(latitude);
    
    if (isNaN(lng) || isNaN(lat)) return;
    
    map.current.easeTo({
      center: [lng, lat],
      zoom: 15,
      duration: 2000
    });

    new maplibregl.Popup({ closeOnClick: true })
      .setLngLat([lng, lat])
      .setHTML(`
        <div class="p-3 min-w-64">
          <div class="flex items-center justify-between mb-2">
            <h4 class="font-bold text-lg">Destination</h4>
          </div>
          <p class="text-sm text-gray-700 mb-3">Longitude: ${lng}, Latitude: ${lat}</p>
        </div>
      `)
      .addTo(map.current!);
  };

  // AI Analysis workflow with zoom animation and analysis boxes
  const startAIAnalysisWorkflow = () => {
    if (!map.current || !mapLoaded || isAnalyzing) return;
    
    setIsAnalyzing(true);
    setShowAIAnalysis(true);
    
    // Get current map state
    const originalZoom = map.current.getZoom();
    const originalCenter = map.current.getCenter();
    const zoomOut = originalZoom - 2;
    
    // Step 1: Zoom out to show wider area (1 second)
    map.current.easeTo({
      zoom: zoomOut,
      duration: 1000,
      curve: 1
    });

    // Step 2: Pan around to simulate scanning (2-3 seconds)
    setTimeout(() => {
      map.current!.panBy([50, 0], { duration: 800 }); // pan right
    }, 1000);
    
    setTimeout(() => {
      map.current!.panBy([-100, 0], { duration: 1200 }); // pan left
    }, 1800);
    
    setTimeout(() => {
      map.current!.panBy([50, 0], { duration: 800 }); // back to center
    }, 3000);

    // Step 3: Zoom back in (1 second)
    setTimeout(() => {
      map.current!.easeTo({
        center: [originalCenter.lng, originalCenter.lat],
        zoom: originalZoom,
        duration: 1000,
        curve: 1
      });
    }, 3800);

    // Step 4: Show analysis boxes after zoom animation (5 seconds total)
    setTimeout(() => {
      showAnalysisBoxes();
    }, 4800);

    // Step 5: Open analysis popup after 6 seconds
    setTimeout(() => {
      setIsAnalyzing(false);
      setShowAnalysisPopup(true);
      setAnalysisStep('loading');
      startImageAnalysisSequence();
    }, 6000);
  };

  // Show colorful analysis boxes on the map
  const showAnalysisBoxes = () => {
    if (!map.current) return;

    // Get current center to place boxes around it
    const center = map.current.getCenter();
    const lng = center.lng;
    const lat = center.lat;
    
    // Create larger, more visible analysis boxes around the current center
    const analysisBoxesData = {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [[
              [lng - 0.01, lat - 0.01], 
              [lng + 0.005, lat - 0.01], 
              [lng + 0.005, lat + 0.005], 
              [lng - 0.01, lat + 0.005], 
              [lng - 0.01, lat - 0.01]
            ]]
          },
          properties: { color: "#22c55e", type: "healthy", label: "Healthy Vegetation" }
        },
        {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [[
              [lng + 0.005, lat - 0.005], 
              [lng + 0.02, lat - 0.005], 
              [lng + 0.02, lat + 0.01], 
              [lng + 0.005, lat + 0.01], 
              [lng + 0.005, lat - 0.005]
            ]]
          },
          properties: { color: "#ef4444", type: "concern", label: "Monitoring Required" }
        },
        {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [[
              [lng - 0.005, lat + 0.005], 
              [lng + 0.01, lat + 0.005], 
              [lng + 0.01, lat + 0.02], 
              [lng - 0.005, lat + 0.02], 
              [lng - 0.005, lat + 0.005]
            ]]
          },
          properties: { color: "#3b82f6", type: "restored", label: "Restoration Success" }
        },
        {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [[
              [lng - 0.02, lat + 0.01], 
              [lng - 0.005, lat + 0.01], 
              [lng - 0.005, lat + 0.025], 
              [lng - 0.02, lat + 0.025], 
              [lng - 0.02, lat + 0.01]
            ]]
          },
          properties: { color: "#f97316", type: "growth", label: "Active Growth" }
        },
        {
          type: "Feature" as const,
          geometry: {
            type: "Polygon" as const,
            coordinates: [[
              [lng + 0.01, lat - 0.02], 
              [lng + 0.025, lat - 0.02], 
              [lng + 0.025, lat - 0.005], 
              [lng + 0.01, lat - 0.005], 
              [lng + 0.01, lat - 0.02]
            ]]
          },
          properties: { color: "#8b5cf6", type: "carbon", label: "High Carbon Density" }
        }
      ]
    };

    // Remove existing analysis boxes if any
    if (map.current.getSource('analysis-boxes')) {
      map.current.removeLayer('analysis-boxes-layer');
      map.current.removeLayer('analysis-boxes-border');
      map.current.removeSource('analysis-boxes');
    }

    // Add the analysis boxes source
    map.current.addSource('analysis-boxes', {
      type: 'geojson',
      data: analysisBoxesData
    });

    // Add fill layer with high opacity
    map.current.addLayer({
      id: 'analysis-boxes-layer',
      type: 'fill',
      source: 'analysis-boxes',
      paint: {
        'fill-color': ['get', 'color'],
        'fill-opacity': 0.8  // High opacity for better visibility
      }
    });

    // Add border layer for even better visibility
    map.current.addLayer({
      id: 'analysis-boxes-border',
      type: 'line',
      source: 'analysis-boxes',
      paint: {
        'line-color': ['get', 'color'],
        'line-width': 3,
        'line-opacity': 1
      }
    });

    // Add popups for each analysis box
    analysisBoxesData.features.forEach((feature, index) => {
      const coords = feature.geometry.coordinates[0];
      const centerLng = coords.reduce((sum, coord) => sum + coord[0], 0) / coords.length;
      const centerLat = coords.reduce((sum, coord) => sum + coord[1], 0) / coords.length;
      
      setTimeout(() => {
        const popup = new maplibregl.Popup({ 
          closeOnClick: false,
          closeButton: false,
          anchor: 'center',
          className: 'analysis-popup'
        })
        .setLngLat([centerLng, centerLat])
        .setHTML(`
          <div class="bg-white p-2 rounded shadow-lg border-2" style="border-color: ${feature.properties.color}">
            <div class="text-xs font-semibold" style="color: ${feature.properties.color}">${feature.properties.label}</div>
          </div>
        `)
        .addTo(map.current!);

        // Auto-remove popup after 3 seconds
        setTimeout(() => {
          popup.remove();
        }, 3000);
      }, index * 500); // Stagger popup appearance
    });
  };

  // Start image analysis sequence in popup
  const startImageAnalysisSequence = () => {
    // Step 1: Show loading for 2 seconds
    setTimeout(() => {
      setAnalysisStep('images');
      setCurrentImageIndex(0);
      cycleImages();
    }, 2000);
  };

  // Cycle through analysis images
  const cycleImages = () => {
    const totalImages = analysisImages.length;
    let imageIndex = 0;

    const interval = setInterval(() => {
      if (imageIndex < totalImages - 1) {
        imageIndex++;
        setCurrentImageIndex(imageIndex);
      } else {
        clearInterval(interval);
        // Show insights after all images
        setTimeout(() => {
          setAnalysisStep('insights');
          setShowInsights(true);
        }, 1500);
      }
    }, 1500); // 1.5 second gap between images
  };

  // Close analysis popup
  const closeAnalysisPopup = () => {
    setShowAnalysisPopup(false);
    setAnalysisStep('loading');
    setCurrentImageIndex(0);
    setShowInsights(false);
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
      <Card className="absolute top-4 left-4 w-72 bg-white/95 backdrop-blur-sm shadow-lg z-10 h-96 overflow-y-auto">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Layers className="h-4 w-4 text-blue-600" />
            Blue Carbon Sentinel Controls
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Navigation Controls */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-600">Navigate to Location</label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                placeholder="-74.006 (e.g. NYC)"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
                className="text-xs h-8"
                type="number"
                step="any"
              />
              <Input
                placeholder="40.7128 (e.g. NYC)"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
                className="text-xs h-8"
                type="number"
                step="any"
              />
            </div>
            <div className="text-[10px] text-gray-400 space-y-1">
              <div>Longitude: -180 to 180 (West/East)</div>
              <div>Latitude: -90 to 90 (South/North)</div>
            </div>
            <Button 
              size="sm" 
              onClick={navigateToCoordinates}
              className="w-full text-xs"
              disabled={!longitude || !latitude}
            >
              <MapPin className="h-3 w-3 mr-1" />
              Go to Location
            </Button>
          </div>

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
          <div>
            <Button 
              onClick={startAIAnalysisWorkflow}
              className={`w-full text-xs ${isAnalyzing ? 'bg-yellow-500 hover:bg-yellow-600' : showAIAnalysis ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
              disabled={isAnalyzing}
            >
              <Activity className={`h-3 w-3 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? 'Analyzing...' : 'AI Analysis'}
            </Button>
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

      {/* AI Analysis Popup Modal */}
      {showAnalysisPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b bg-gradient-to-r from-blue-50 to-green-50">
              <div className="flex items-center space-x-3">
                <Activity className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-xl font-semibold text-gray-800">AI Analysis Results</h3>
                  <p className="text-sm text-gray-600">Blue Carbon Area Verification</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-gray-100"
                onClick={closeAnalysisPopup}
              >
                <Eye className="h-5 w-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-auto max-h-[calc(90vh-120px)]">
              {analysisStep === 'loading' && (
                <div className="flex flex-col items-center justify-center py-16">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Satellite className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                  <h4 className="mt-6 text-lg font-semibold text-gray-800">Fetching Images and Analyzing</h4>
                  <p className="mt-2 text-gray-600 text-center">Processing satellite imagery and AI analysis data...</p>
                </div>
              )}

              {analysisStep === 'images' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-800 mb-2">Satellite Image Analysis</h4>
                    <p className="text-gray-600">Analyzing plantation evidence from multiple sources</p>
                  </div>
                  
                  <div className="flex justify-center">
                    <div className="relative max-w-2xl">
                      <img 
                        src={analysisImages[currentImageIndex]} 
                        alt={`Analysis Image ${currentImageIndex + 1}`}
                        className="w-full h-auto rounded-lg shadow-lg border border-gray-200"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                      />
                      <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                        Image {currentImageIndex + 1} of {analysisImages.length}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center space-x-2">
                    {analysisImages.map((_, index) => (
                      <div 
                        key={index}
                        className={`w-3 h-3 rounded-full transition-colors ${
                          index <= currentImageIndex ? 'bg-blue-600' : 'bg-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {analysisStep === 'insights' && (
                <div className="space-y-6">
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-green-800 mb-2">Analysis Complete ✓</h4>
                    <p className="text-gray-600">Plantation verification successful</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Final Analysis Image */}
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-800">Final Satellite View</h5>
                      <img 
                        src={analysisImages[analysisImages.length - 1]} 
                        alt="Final Analysis"
                        className="w-full h-auto rounded-lg shadow-lg border border-gray-200"
                        style={{ maxHeight: '300px', objectFit: 'contain' }}
                      />
                    </div>

                    {/* Generated Insights */}
                    <div className="space-y-4">
                      <h5 className="font-semibold text-gray-800 flex items-center">
                        <Eye className="h-4 w-4 mr-2 text-green-600" />
                        Key Insights
                      </h5>
                      <div className="space-y-3">
                        {analysisInsights.map((insight, index) => (
                          <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                            <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0" />
                            <p className="text-sm text-gray-700 leading-relaxed">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Summary Stats */}
                  <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">95%</div>
                      <div className="text-xs text-gray-600">Verification Confidence</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">12.5</div>
                      <div className="text-xs text-gray-600">tCO₂e/ha/year</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">85%</                      <div className="text-xs text-gray-600">Coverage Increase</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            {analysisStep === 'insights' && (
              <div className="flex items-center justify-between p-6 border-t bg-gray-50">
                <div className="text-sm text-gray-600">
                  Analysis completed on {new Date().toLocaleDateString()}
                </div>
                <div className="flex space-x-3">
                  <Button variant="outline" onClick={closeAnalysisPopup}>
                    Close Analysis
                  </Button>
                  <Button className="bg-green-600 hover:bg-green-700 text-white">
                    Export Report
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default VerificationMap;
import VerificationMap from './VerificationMap.tsx';