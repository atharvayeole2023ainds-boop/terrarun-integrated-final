
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useTerritories } from '../hooks/useTerritories';
import { MapContainer, TileLayer, Polygon, Circle, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIconRetina from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIconRetina,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapEvents = ({ onBoundsChange }: { onBoundsChange: (bounds: any) => void }) => {
  const map = useMapEvents({
    moveend: () => {
      const b = map.getBounds();
      onBoundsChange({
        minLat: b.getSouth(),
        minLng: b.getWest(),
        maxLat: b.getNorth(),
        maxLng: b.getEast(),
      });
    },
  });
  return null;
};

const MapPage: React.FC = () => {
  const navigate = useNavigate();
  const { stats, showToast } = useGame();
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [bounds, setBounds] = useState<{ minLat: number; minLng: number; maxLat: number; maxLng: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const { territories, isLoading: loadingTerritories } = useTerritories(bounds || undefined);

  useEffect(() => {
    if ("geolocation" in navigator) {
      setIsLocating(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setCoords(newCoords);
          setIsLocating(false);
          
          // Set initial bounds roughly (0.01 degree approx 1km)
          setBounds({
            minLat: newCoords.lat - 0.01,
            minLng: newCoords.lng - 0.01,
            maxLat: newCoords.lat + 0.01,
            maxLng: newCoords.lng + 0.01,
          });
        },
        (error) => {
          console.error("Error obtaining location", error);
          showToast("Location Access Denied", "error");
          setIsLocating(false);
        }
      );
    }
  }, []);

  return (
    <div className="relative flex flex-col flex-1 overflow-hidden h-screen bg-background-dark">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 z-[1000] flex flex-col pt-12 pb-4 px-4 bg-gradient-to-b from-background-dark/95 via-background-dark/60 to-transparent pointer-events-none">
        <div className="flex items-center justify-between pointer-events-auto">
          <button onClick={() => navigate('/home')} className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background-dark/60 backdrop-blur-md border border-white/10 active:scale-90 transition-transform">
            <span className="material-symbols-outlined text-white text-[20px]">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-white text-base font-black leading-tight tracking-tight uppercase tracking-widest font-lexend">Territory Grid</h2>
            <p className="text-primary text-[10px] font-black uppercase tracking-[0.2em]">
              {coords ? `SEC ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}` : "Downtown Sector 7-B"}
            </p>
          </div>
          <button className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background-dark/60 backdrop-blur-md border border-white/10">
            <span className="material-symbols-outlined text-white">tune</span>
          </button>
        </div>
      </div>

      {/* Map Content */}
      <div className="relative flex-1 z-0">
        {coords ? (
          <MapContainer 
            center={[coords.lat, coords.lng]} 
            zoom={15} 
            style={{ height: '100%', width: '100%', background: '#0a0a0a' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <MapEvents onBoundsChange={setBounds} />
            
            {/* User Location */}
            <Circle 
              center={[coords.lat, coords.lng]} 
              radius={20} 
              pathOptions={{ color: '#f49d25', fillColor: '#f49d25', fillOpacity: 0.4 }} 
            />
            <Circle 
              center={[coords.lat, coords.lng]} 
              radius={5} 
              pathOptions={{ color: '#white', fillColor: '#f49d25', fillOpacity: 1, weight: 2 }} 
            />

            {/* Territories */}
            {territories.map((t: any) => {
              // Parse GeoJSON geometry
              const positions = t.geometry.coordinates[0].map((c: any) => [c[1], c[0]]);
              return (
                <Polygon
                  key={t.id}
                  positions={positions}
                  pathOptions={{
                    color: t.mode === 'running' ? '#4ade80' : '#f87171',
                    fillColor: t.mode === 'running' ? '#4ade80' : '#f87171',
                    fillOpacity: 0.3,
                    weight: 2
                  }}
                />
              );
            })}
          </MapContainer>
        ) : (
          <div className="flex h-full items-center justify-center text-primary font-black animate-pulse">
            INITIALIZING SATELLITE LINK...
          </div>
        )}
      </div>

      {/* Floating Controls */}
      <div className="absolute right-4 bottom-56 z-[1000] flex flex-col gap-3">
        <button className="flex size-12 items-center justify-center rounded-2xl bg-background-dark/80 backdrop-blur-xl border border-white/10 shadow-2xl text-primary">
          <span className="material-symbols-outlined text-[24px]">layers</span>
        </button>
      </div>

      <div className="absolute right-4 bottom-32 z-[1000]">
        <button 
          onClick={() => {
            if ("geolocation" in navigator) {
              setIsLocating(true);
              navigator.geolocation.getCurrentPosition((pos) => {
                setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                setIsLocating(false);
              });
            }
          }}
          className={`flex size-16 items-center justify-center rounded-full bg-primary text-black shadow-2xl shadow-primary/40 active:scale-90 transition-transform ${isLocating ? 'animate-pulse' : ''}`}
        >
          <span className="material-symbols-outlined text-[32px] fill">my_location</span>
        </button>
      </div>

      {/* Stats Summary Bar */}
      <div className="absolute bottom-6 left-0 right-0 z-[1000] px-4 mb-2">
        <div className="flex items-center justify-between gap-4 bg-background-dark/90 backdrop-blur-2xl rounded-[1.5rem] p-4 border border-primary/20 shadow-2xl">
          <div className="flex-1 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Total Zones</p>
              <p className="text-white text-lg font-black font-lexend">{stats.territories}</p>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex flex-col items-center">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Total Distance</p>
              <p className="text-primary text-lg font-black font-lexend">{stats.totalDistance}<span className="text-xs ml-1 opacity-60">KM</span></p>
            </div>
            <div className="w-[1px] h-8 bg-white/10"></div>
            <div className="flex flex-col items-center">
              <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Agent Level</p>
              <p className="text-white text-lg font-black font-lexend">{stats.level}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPage;
