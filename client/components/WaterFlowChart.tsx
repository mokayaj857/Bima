import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { useWaterFlowData } from '@/hooks/useWaterFlowData';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const WaterFlowChart: React.FC = () => {
  const waterFlowData = useWaterFlowData();

  // Fallback to static data if no real-time data is available
  const staticData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    datasets: [
      {
        label: 'Water Flow (L/s)',
        data: [12, 19, 15, 22, 18, 24, 20],
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const data = waterFlowData.length > 0 ? {
    labels: waterFlowData.map(point => new Date(point.timestamp).toLocaleDateString()),
    datasets: [
      {
        label: 'Water Flow (L/s)',
        data: waterFlowData.map(point => point.value),
        borderColor: 'rgba(75,192,192,1)',
        backgroundColor: 'rgba(75,192,192,0.2)',
        fill: true,
        tension: 0.4,
      },
    ],
  } : staticData;

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Water Flow Over Time',
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default WaterFlowChart;
