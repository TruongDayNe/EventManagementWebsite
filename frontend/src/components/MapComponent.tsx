import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, useMapEvents, Marker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L, { LatLng } from 'leaflet';

// Fix for default marker icon in Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Create a custom red marker icon
const redMarkerIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MapComponentProps {
  onLatLngChange: (latlng: LatLng) => void;
  canPin?: boolean;
  initialPosition?: LatLng;
}

interface MapClickHandlerProps {
  onLatLngChange: (latlng: LatLng) => void;
  onMarkerPlace: (latlng: LatLng) => void;
  canPin: boolean;
}

const MapClickHandler: React.FC<MapClickHandlerProps> = ({ onLatLngChange, onMarkerPlace, canPin }) => {
  useMapEvents({
    click(e) {
      onLatLngChange(e.latlng);
    },
    dblclick(e) {
      if (canPin) {
        onMarkerPlace(e.latlng);
      }
    },
  });
  return null;
};

const MapComponent: React.FC<MapComponentProps> = ({ 
  onLatLngChange, 
  canPin = true,
  initialPosition
}) => {
  const defaultPosition = new LatLng(16.0748, 108.152); // Default position (Da Nang)
  const [position] = useState<LatLng>(initialPosition || defaultPosition);
  const [markerPosition, setMarkerPosition] = useState<LatLng | null>(initialPosition || null);

  useEffect(() => {
    if (initialPosition) {
      setMarkerPosition(initialPosition);
    }
  }, [initialPosition]);

  const handleMarkerPlace = (latlng: LatLng) => {
    setMarkerPosition(latlng);
    onLatLngChange(latlng);
  };

  return (
    <div className="w-full h-96 relative">
      <MapContainer
        center={position}
        zoom={17}
        style={{ height: '100%', width: '100%' }}
        className="rounded-lg shadow-md"
        doubleClickZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler 
          onLatLngChange={onLatLngChange} 
          onMarkerPlace={handleMarkerPlace}
          canPin={canPin}
        />
        {markerPosition && (
          <Marker 
            position={markerPosition}
            icon={redMarkerIcon}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default MapComponent;
