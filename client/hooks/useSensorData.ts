import { useState, useEffect } from 'react';

interface SensorData {
  id: number;
  lat: number;
  lng: number;
  name: string;
  status: string;
  timestamp?: string;
}

const POLLING_INTERVAL = 5000; // 5 seconds

export function useSensorData() {
  const [data, setData] = useState<SensorData[]>([]);

  useEffect(() => {
    function fetchSensorData() {
      fetch('http://localhost:5000/api/sensors') // Backend API endpoint
        .then(res => res.json())
        .then(setData)
        .catch(console.error);
    }

    fetchSensorData();
    const interval = setInterval(fetchSensorData, POLLING_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return data;
}
