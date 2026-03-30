import React from 'react';
import { MapContainer, TileLayer, Rectangle, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Users, Droplets } from 'lucide-react';

// Custom Boat Icon generator
const createBoatIcon = (boat, isSelected) => {
  let classes = 'text-white flex flex-col items-center justify-center rounded-full shadow-lg transition-transform ';
  if (isSelected) classes += 'bg-yellow-500 ring-4 ring-yellow-400/50 scale-110';
  else if (boat.status === 'rescuing') classes += 'bg-green-500 animate-pulse';
  else classes += 'bg-slate-900';

  const html = `
    <div class="${classes}" style="width:30px;height:30px;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22V8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/><circle cx="12" cy="5" r="3"/>
      </svg>
    </div>
  `;

  return L.divIcon({
    html,
    className: '', // prevent default leaflet divIcon styling
    iconSize: [30, 30],
    iconAnchor: [15, 15] // center the icon
  });
};

export default function Map({ grid, boats, onCellClick, selectedBoatId, onSelectBoat, mode }) {
  // Center of Chennai bounded box
  const center = [13.025, 80.20];

  const getRectangleProps = (cell) => {
    let color = '#94a3b8'; // default slate
    let fillOpacity = 0.05;
    
    if (cell.urgency > 20) { color = '#ef4444'; fillOpacity = 0.5; }
    else if (cell.urgency > 10) { color = '#f97316'; fillOpacity = 0.4; }
    else if (cell.water_level === 3) { color = '#2563eb'; fillOpacity = 0.5; }
    else if (cell.water_level === 2) { color = '#60a5fa'; fillOpacity = 0.4; }
    else if (cell.water_level === 1) { color = '#bfdbfe'; fillOpacity = 0.3; }

    const weight = cell.reserved ? 3 : 1;
    const dashArray = cell.reserved ? '5, 5' : '0';
    const borderColor = cell.reserved ? '#eab308' : color;

    return { 
      color: borderColor, 
      weight, 
      fillColor: color, 
      fillOpacity, 
      dashArray 
    };
  };

  return (
    <div className="w-full h-[500px] rounded-xl overflow-hidden border-2 border-slate-300 relative">
      <MapContainer 
        center={center} 
        zoom={12} 
        style={{ height: '100%', width: '100%', background: '#f8fafc' }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />

        {/* Render grid rectangles */}
        {grid.map((row) => 
          row.map((cell) => {
            const props = getRectangleProps(cell);
            return (
              <Rectangle 
                key={`cell-${cell.x}-${cell.y}`}
                bounds={cell.bounds} 
                pathOptions={{ 
                  color: props.color, 
                  weight: props.weight, 
                  fillColor: props.fillColor, 
                  fillOpacity: props.fillOpacity,
                  dashArray: props.dashArray
                }}
                eventHandlers={{
                  click: () => onCellClick(cell.x, cell.y)
                }}
              >
                {/* Tooltip on hover if population or water exists */}
                {(cell.population > 0 || cell.water_level > 0) && (
                  <Tooltip sticky>
                    <div className="text-xs">
                      <div className="font-bold mb-1">Zone ({cell.x}, {cell.y})</div>
                      <div className="flex justify-between gap-4">
                        <span>P: {cell.population}</span>
                        <span>W: lvl {cell.water_level}</span>
                      </div>
                      <div className="text-[10px] opacity-70 mt-1">Urgency: {cell.urgency.toFixed(1)}</div>
                    </div>
                  </Tooltip>
                )}
              </Rectangle>
            );
          })
        )}

        {/* Render Boat Markers */}
        {boats.map((boat) => (
          <Marker 
            key={boat.id} 
            position={[boat.lat, boat.lng]} 
            icon={createBoatIcon(boat, selectedBoatId === boat.id)}
            eventHandlers={{
              click: () => mode === 'manual' && onSelectBoat(boat.id)
            }}
          >
            <Tooltip direction="top" offset={[0, -15]}>
              <div className="text-xs font-bold text-center">
                Rescue {boat.id} <br/>
                <span className="text-[10px] font-normal uppercase">{boat.status}</span>
              </div>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Global CSS overrides for Leaflet map filtering to match light theme aesthetic */}
      <style>{`
        .map-tiles { filter: saturate(0.5) contrast(1.1) brightness(1.05); }
      `}</style>
    </div>
  );
}
