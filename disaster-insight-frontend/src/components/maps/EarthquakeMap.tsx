import { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';
import type { EarthquakeData } from '../../types';
import { Box, Paper, IconButton, Tooltip, Typography } from '@mui/material';
import {
  MyLocation,
  ZoomIn,
  ZoomOut,
  Fullscreen,
  Map as MapIcon,
  Satellite,
  DarkMode
} from '@mui/icons-material';
import styles from './EarthquakeMap.module.css';

// Tile Providers
const tileLayers = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
  },
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri'
  }
};

interface EarthquakeMapProps {
  data: EarthquakeData[];
}

// Clustering threshold
const CLUSTER_THRESHOLD = 50;
const BATCH_SIZE = 50;

export default function EarthquakeMap({ data }: EarthquakeMapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const heatLayerRef = useRef<L.Layer | null>(null);
  const markerLayerRef = useRef<L.LayerGroup | null>(null);
  const clusterLayerRef = useRef<L.LayerGroup | null>(null);
  const [mapStyle, setMapStyle] = useState<'dark' | 'standard' | 'satellite'>('satellite');
  const [tileLayer, setTileLayer] = useState<L.TileLayer | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadedCount, setLoadedCount] = useState(0);
  const [currentZoom, setCurrentZoom] = useState(2);
  const popupCache = useRef<Map<string, string>>(new Map());

  const getMagnitudeColor = (mag: number) => {
    if (mag >= 7) return '#ff0000';
    if (mag >= 6) return '#ff4500';
    if (mag >= 5) return '#ffa500';
    if (mag >= 4) return '#ffff00';
    return '#00ff00';
  };

  // Hardware acceleration
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.willChange = 'transform, opacity';
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current && containerRef.current) {
      const map = L.map(containerRef.current, {
        center: [20, 0],
        zoom: 2,
        zoomControl: false,
      });
      mapRef.current = map;

      // Add initial tile layer
      const initial = L.tileLayer(tileLayers[mapStyle].url, {
        attribution: tileLayers[mapStyle].attribution,
        maxZoom: 18
      }).addTo(map);
      setTileLayer(initial);

      markerLayerRef.current = L.layerGroup().addTo(map);
      clusterLayerRef.current = L.layerGroup().addTo(map);

      // Track zoom changes
      map.on('zoomend', () => {
        setCurrentZoom(map.getZoom());
      });
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Create popup content with caching
  const createPopupContent = useCallback((eq: EarthquakeData) => {
  const cached = popupCache.current.get(eq.id);
  if (cached) return cached;

  const bgColor = getMagnitudeColor(eq.magnitude);

  // Override text color to black ONLY for light magnitudes in popup
  const popupTextColor = (eq.magnitude >= 4 && eq.magnitude < 5) ? '#000000' : bgColor;

  const content = `
    <div class="${styles.popup}">
      <h3>${eq.place}</h3>
      <div class="${styles.popupContent}">
        <div class="${styles.popupRow}">
          <span class="${styles.popupLabel}">Magnitude:</span>
          <span class="${styles.popupValue}" style="color:${popupTextColor}">${eq.magnitude.toFixed(1)}</span>
        </div>
        <div class="${styles.popupRow}">
          <span class="${styles.popupLabel}">Depth:</span>
          <span class="${styles.popupValue}">${eq.depth.toFixed(1)} km</span>
        </div>
        <div class="${styles.popupRow}">
          <span class="${styles.popupLabel}">Time:</span>
          <span class="${styles.popupValue}">${new Date(eq.time).toLocaleString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          })}</span>
        </div>
      </div>
      <a href="${eq.url}" target="_blank" class="${styles.popupLink}">View Details →</a>
    </div>`;

  popupCache.current.set(eq.id, content);
  return content;
}, []);


  // Progressive loading and viewport-based rendering
  useEffect(() => {
    if (!mapRef.current || !markerLayerRef.current || !clusterLayerRef.current) return;

    let frameId: number;

    const renderMarkers = () => {
      const map = mapRef.current!;
      const markerLayer = markerLayerRef.current!;
      const clusterLayer = clusterLayerRef.current!;
      const bounds = map.getBounds();
      const zoom = map.getZoom();

      // Clear layers
      markerLayer.clearLayers();
      clusterLayer.clearLayers();

      // Remove existing heat layer
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
        heatLayerRef.current = null;
      }

      // Filter data to viewport
      const visibleData = data.filter(eq => 
        bounds.contains([eq.lat, eq.lon])
      );

      // Determine if we should use clustering
      const shouldCluster = zoom < 6 && visibleData.length > CLUSTER_THRESHOLD;

      // HEAT MAP with zoom-based radius
      const heatRadius = Math.max(10, 40 - (zoom * 2));
      const heatData = visibleData
        .filter(d => d.magnitude >= 4.5)
        .map(d => [d.lat, d.lon, d.magnitude / 10]);

      if (heatData.length > 0) {
        // @ts-ignore
        heatLayerRef.current = L.heatLayer(heatData, {
          radius: heatRadius,
          blur: 15,
          maxZoom: 10,
          gradient: {
            0.0: 'blue',
            0.5: 'lime',
            0.7: 'yellow',
            0.9: 'orange',
            1.0: 'red'
          }
        }).addTo(map);
      }

      if (shouldCluster) {
        // CLUSTERING MODE
        const clusters: { [key: string]: EarthquakeData[] } = {};
        
        visibleData.forEach(eq => {
          const gridSize = 5; // degrees
          const key = `${Math.floor(eq.lat/gridSize)}_${Math.floor(eq.lon/gridSize)}`;
          if (!clusters[key]) clusters[key] = [];
          clusters[key].push(eq);
        });

        Object.entries(clusters).forEach(([, earthquakes]) => {
          if (earthquakes.length > 1) {
            // Create cluster marker
            const avgLat = earthquakes.reduce((sum, eq) => sum + eq.lat, 0) / earthquakes.length;
            const avgLon = earthquakes.reduce((sum, eq) => sum + eq.lon, 0) / earthquakes.length;
            const maxMag = Math.max(...earthquakes.map(eq => eq.magnitude));
            const clusterSize = Math.min(60, 30 + earthquakes.length);

            const clusterIcon = L.divIcon({
              html: `
                <div class="${styles.cluster}" 
                     style="width: ${clusterSize}px; 
                            height: ${clusterSize}px;
                            background: linear-gradient(135deg, ${getMagnitudeColor(maxMag)} 0%, ${getMagnitudeColor(maxMag - 1)} 100%);
                            box-shadow: 0 0 20px ${getMagnitudeColor(maxMag)};">
                  <span>${earthquakes.length}</span>
                </div>`,
              className: 'earthquake-cluster',
              iconSize: [clusterSize, clusterSize],
              iconAnchor: [clusterSize/2, clusterSize/2]
            });

            const clusterMarker = L.marker([avgLat, avgLon], { icon: clusterIcon });
            
            clusterMarker.on('click', () => {
              map.setView([avgLat, avgLon], zoom + 2);
            });

            clusterMarker.bindPopup(`
              <div class="${styles.popup}">
                <h3>Earthquake Cluster</h3>
                <p><strong>${earthquakes.length}</strong> earthquakes</p>
                <p>Max magnitude: <strong>${maxMag.toFixed(1)}</strong></p>
                <p>Click to zoom in</p>
              </div>
            `);

            clusterLayer.addLayer(clusterMarker);
          } else {
            // Single earthquake in this grid cell
            renderSingleMarker(earthquakes[0], markerLayer);
          }
        });
      } else {
        // INDIVIDUAL MARKERS MODE - Progressive loading
        const dataToRender = visibleData.slice(0, loadedCount + BATCH_SIZE);
        
        dataToRender.forEach(eq => {
          renderSingleMarker(eq, markerLayer);
        });

        // Load more if needed
        if (loadedCount < visibleData.length) {
          setTimeout(() => {
            setLoadedCount(prev => Math.min(prev + BATCH_SIZE, visibleData.length));
          }, 16); // Next frame
        }
      }
    };

    // Helper function to render single marker
    const renderSingleMarker = (eq: EarthquakeData, layer: L.LayerGroup) => {
      const color = getMagnitudeColor(eq.magnitude);
      const size = Math.max(eq.magnitude * 6, 20);

      const divIcon = L.divIcon({
        html: `
          <div class="${styles.earthquakeMarker}"
               style="width: ${size}px;
                      height: ${size}px;
                      background: ${color};
                      box-shadow: 0 0 ${eq.magnitude * 4}px ${color};
                      border: 2px solid rgba(255,255,255,0.8);">
            <span>${eq.magnitude.toFixed(1)}</span>
          </div>`,
        className: 'custom-earthquake-marker',
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker([eq.lat, eq.lon], {
        icon: divIcon,
        zIndexOffset: Math.floor(eq.magnitude * 100)
      });

      // Lazy load popup - only create when needed
      let popupBound = false;
      
      const bindPopupLazy = () => {
        if (!popupBound) {
          marker.bindPopup(createPopupContent(eq), {
            className: styles.leafletPopup,
            maxWidth: 250,
            minWidth: 200
          });
          popupBound = true;
        }
      };

      marker.on('mouseover', function(this: L.Marker) {
        bindPopupLazy();
        this.openPopup();
      });

      marker.on('click', bindPopupLazy);

      layer.addLayer(marker);
    };

    // Debounced with requestAnimationFrame
    frameId = requestAnimationFrame(renderMarkers);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [data, loadedCount, currentZoom, createPopupContent]);

  // Reset loaded count when data changes
  useEffect(() => {
    setLoadedCount(BATCH_SIZE);
  }, [data]);

  // Update map tile style
  useEffect(() => {
    if (!mapRef.current || !tileLayer) return;

    mapRef.current.removeLayer(tileLayer);
    const newLayer = L.tileLayer(tileLayers[mapStyle].url, {
      attribution: tileLayers[mapStyle].attribution,
      maxZoom: 18
    }).addTo(mapRef.current);
    setTileLayer(newLayer);
  }, [mapStyle]);

  // Controls
  const handleZoomIn = () => mapRef.current?.zoomIn();
  const handleZoomOut = () => mapRef.current?.zoomOut();
  const handleFullscreen = () => {
    if (containerRef.current) {
      if (!document.fullscreenElement) {
        containerRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };
  const handleMyLocation = () => {
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude, longitude } = pos.coords;
      mapRef.current?.setView([latitude, longitude], 8);
      L.marker([latitude, longitude])
        .addTo(mapRef.current!)
        .bindPopup('You are here!')
        .openPopup();
    });
  };

  return (
    <Box className={styles.mapWrapper}>
      <Box className={styles.mapContainer} ref={containerRef}>
        {/* Controls */}
        <Paper className={styles.mapControls} elevation={3}>
          <Tooltip title="Dark Mode">
            <IconButton onClick={() => setMapStyle('dark')} size="small"
              className={`${styles.controlButton} ${mapStyle === 'dark' ? styles.activeControl : ''}`}>
              <DarkMode />
            </IconButton>
          </Tooltip>
          <Tooltip title="Standard Map">
            <IconButton onClick={() => setMapStyle('standard')} size="small"
              className={`${styles.controlButton} ${mapStyle === 'standard' ? styles.activeControl : ''}`}>
              <MapIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Satellite View">
            <IconButton onClick={() => setMapStyle('satellite')} size="small"
              className={`${styles.controlButton} ${mapStyle === 'satellite' ? styles.activeControl : ''}`}>
              <Satellite />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Zoom */}
        <Paper className={styles.zoomControls} elevation={3}>
          <Tooltip title="Zoom In">
            <IconButton onClick={handleZoomIn} size="small" className={styles.controlButton}>
              <ZoomIn />
            </IconButton>
          </Tooltip>
          <Tooltip title="Zoom Out">
            <IconButton onClick={handleZoomOut} size="small" className={styles.controlButton}>
              <ZoomOut />
            </IconButton>
          </Tooltip>
          <Tooltip title="My Location">
            <IconButton onClick={handleMyLocation} size="small" className={styles.controlButton}>
              <MyLocation />
            </IconButton>
          </Tooltip>
          <Tooltip title="Fullscreen">
            <IconButton onClick={handleFullscreen} size="small" className={styles.controlButton}>
              <Fullscreen />
            </IconButton>
          </Tooltip>
        </Paper>

        {/* Legend */}
        <Paper className={styles.legend} elevation={3}>
          <Typography variant="subtitle2" className={styles.legendTitle}>Magnitude Scale</Typography>
          <Box className={styles.legendItems}>
            {[
              { mag: '7.0+', color: '#ff0000', label: 'Major' },
              { mag: '6.0-6.9', color: '#ff4500', label: 'Strong' },
              { mag: '5.0-5.9', color: '#ffa500', label: 'Moderate' },
              { mag: '4.0-4.9', color: '#ffff00', label: 'Light' }
            ].map(item => (
              <Box key={item.mag} className={styles.legendItem}>
                <Box className={styles.legendColor} style={{ backgroundColor: item.color }} />
                <Typography variant="caption" className={styles.legendText}>
                  {item.mag}<br /><span className={styles.legendLabel}>{item.label}</span>
                </Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}