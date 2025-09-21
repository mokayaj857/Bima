cdimport React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useSensorData } from '@/hooks/useSensorData';

// Dynamically import Leaflet components to avoid SSR issues
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });
const Popup = dynamic(() => import('react-leaflet').then(mod => mod.Popup), { ssr: false });

const SensorMap: React.FC = () => {
  const sensorData = useSensorData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fallback to static data if no real-time data is available
  const staticSensorLocations = [
    { id: 1, lat: 40.7128, lng: -74.0060, name: 'Sensor 1', status: 'Active' },
    { id: 2, lat: 40.7589, lng: -73.9851, name: 'Sensor 2', status: 'Active' },
    { id: 3, lat: 40.7505, lng: -73.9934, name: 'Sensor 3', status: 'Warning' },
    { id: 4, lat: 40.7282, lng: -73.7949, name: 'Sensor 4', status: 'Active' },
  ];

  const sensorLocations = sensorData.length > 0 ? sensorData : staticSensorLocations;

  if (!mounted) return null;

  return (
    <div className="h-96 w-full">
      <MapContainer
        center={[40.7128, -74.0060]}
        zoom={12}
        style={{ height: '100%', width: '100%' }}
      >
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
