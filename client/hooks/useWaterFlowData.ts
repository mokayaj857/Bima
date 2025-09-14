import { useState, useEffect, useRef } from 'react';

interface WaterFlowDataPoint {
  timestamp: string;
  value: number;
}

const WS_URL = 'wss://example.com/water-flow-data'; // Replace with actual WebSocket URL
const POLLING_INTERVAL = 10000; // 10 seconds

export function useWaterFlowData() {
  const [data, setData] = useState<WaterFlowDataPoint[]>([]);
  const ws = useRef<WebSocket | null>(null);
  const pollingTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    function fetchWaterFlowData() {
      fetch('http://localhost:5000/api/water-flow') // Backend API endpoint
        .then(res => res.json())
        .then(setData)
        .catch(console.error);
    }

    if ('WebSocket' in window) {
      ws.current = new WebSocket(WS_URL);

      ws.current.onopen = () => {
        console.log('WebSocket connected for water flow data');
      };

      ws.current.onmessage = (event) => {
        try {
          const flowUpdate = JSON.parse(event.data);
          setData(flowUpdate);
        } catch (e) {
          console.error('Error parsing water flow data', e);
        }
      };

      ws.current.onerror = (error) => {
        console.error('WebSocket error', error);
        fetchWaterFlowData();
        pollingTimer.current = setInterval(fetchWaterFlowData, POLLING_INTERVAL);
      };

      ws.current.onclose = () => {
        console.log('WebSocket closed, falling back to polling');
        fetchWaterFlowData();
        pollingTimer.current = setInterval(fetchWaterFlowData, POLLING_INTERVAL);
      };
    } else {
      fetchWaterFlowData();
      pollingTimer.current = setInterval(fetchWaterFlowData, POLLING_INTERVAL);
    }

    return () => {
      if (ws.current) {
        ws.current.close();
      }
      if (pollingTimer.current) {
        clearInterval(pollingTimer.current);
      }
    };
  }, []);

  return data;
}
