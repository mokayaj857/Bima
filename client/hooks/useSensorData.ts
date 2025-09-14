import { useState, useEffect, useRef } from 'react';

interface SensorData {
  id: number;
  lat: number;
  lng: number;
  name: string;
  status: string;
}

const WS_URL = 'ws://localhost:5000';
const POLLING_INTERVAL = 10000;

// Fallback mock data
const mockSensorData: SensorData[] = [
  { id: 1, lat: -6.2, lng: 106.8, name: 'Sensor 1', status: 'active' },
  { id: 2, lat: -6.25, lng: 106.85, name: 'Sensor 2', status: 'active' },
  { id: 3, lat: -6.15, lng: 106.75, name: 'Sensor 3', status: 'inactive' },
  { id: 4, lat: -6.3, lng: 106.9, name: 'Sensor 4', status: 'active' },
  { id: 5, lat: -6.1, lng: 106.7, name: 'Sensor 5', status: 'active' },
];

export function useSensorData() {
  const [data, setData] = useState<SensorData[]>(mockSensorData);
  const ws = useRef<WebSocket | null>(null);
  const pollingTimer = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function fetchSensorData() {
      fetch('http://localhost:5000/api/sensors')
        .then(res => res.json())
        .then(fetchedData => {
          if (fetchedData && fetchedData.length > 0) {
            setData(fetchedData);
          }
        })
        .catch(err => {
          console.log('API fetch failed, using mock data');
        });
    }

    function connectWebSocket() {
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        return;
      }

      try {
        ws.current = new WebSocket(WS_URL);

        ws.current.onopen = () => {
          console.log('WebSocket connected for sensor data');
          if (reconnectTimer.current) {
            clearTimeout(reconnectTimer.current);
            reconnectTimer.current = null;
          }
        };

        ws.current.onmessage = (event) => {
          try {
            const sensorUpdate = JSON.parse(event.data);
            if (Array.isArray(sensorUpdate) && sensorUpdate.length > 0) {
              setData(sensorUpdate);
            }
          } catch (e) {
            console.error('Error parsing sensor data');
          }
        };

        ws.current.onerror = (error) => {
          console.log('WebSocket connection error, falling back to polling');
          fetchSensorData();
          if (pollingTimer.current) {
            clearInterval(pollingTimer.current);
          }
          pollingTimer.current = setInterval(fetchSensorData, POLLING_INTERVAL);
        };

        ws.current.onclose = () => {
          console.log('WebSocket closed, attempting to reconnect...');
          fetchSensorData();
          if (pollingTimer.current) {
            clearInterval(pollingTimer.current);
          }
          pollingTimer.current = setInterval(fetchSensorData, POLLING_INTERVAL);

          reconnectTimer.current = setTimeout(() => {
            connectWebSocket();
          }, 5000);
        };
      } catch (error) {
        console.log('Failed to create WebSocket connection, using polling');
        fetchSensorData();
        pollingTimer.current = setInterval(fetchSensorData, POLLING_INTERVAL);
      }
    }

    if ('WebSocket' in window) {
      connectWebSocket();
    } else {
      console.log('WebSocket not supported, using polling');
      fetchSensorData();
      pollingTimer.current = setInterval(fetchSensorData, POLLING_INTERVAL);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (pollingTimer.current) {
        clearInterval(pollingTimer.current);
      }
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
    };
  }, []);

  return data;
}
