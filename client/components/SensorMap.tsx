import React from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { useSensorData } from '@/hooks/useSensorData';

// Component to update map view when center changes
const ChangeView: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  map.setView(center, zoom);
  return null;
};

const SensorMap: React.FC = () => {
  const sensorData = useSensorData();

  // Fallback static sensor locations if no real-time data
  const staticSensorLocations = [
    { id: 1, lat: 40.7128, lng: -74.0060, name: 'Sensor 1', status: 'Active' },
    { id: 2, lat: 40.7589, lng: -73.9851, name: 'Sensor 2', status: 'Active' },
    { id: 3, lat: 40.7505, lng: -73.9934, name: 'Sensor 3', status: 'Warning' },
    { id: 4, lat: 40.7282, lng: -73.7949, name: 'Sensor 4', status: 'Active' },
  ];

  const sensorLocations = sensorData.length > 0 ? sensorData : staticSensorLocations;

  // Center map on first sensor location or default
  const center: [number, number] = sensorLocations.length > 0
    ? [sensorLocations[0].lat, sensorLocations[0].lng]
    : [40.7128, -74.0060];

  return (
    <div className="h-96 w-full">
      <MapContainer
        center={center}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
        key="sensor-map"
      >
        <ChangeView center={center} zoom={12} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {sensorLocations.map(sensor => (
          <Marker key={sensor.id} position={[sensor.lat, sensor.lng]}>
            <Popup>
              <div>
                <h3 className="font-bold">{sensor.name}</h3>
                <p>Status: {sensor.status}</p>
                <p>Lat: {sensor.lat.toFixed(4)}</p>
                <p>Lng: {sensor.lng.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default SensorMap;
