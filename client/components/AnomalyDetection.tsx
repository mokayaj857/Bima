import React from 'react';

const AnomalyDetection: React.FC = () => {
  const anomalies = [
    {
      id: 1,
      sensor: 'Sensor 3',
      timestamp: '2024-01-15 14:30:00',
      type: 'Flow Rate Spike',
      severity: 'High',
      description: 'Flow rate exceeded normal threshold by 45%'
    },
    {
      id: 2,
      sensor: 'Sensor 7',
      timestamp: '2024-01-15 09:15:00',
      type: 'Pressure Drop',
      severity: 'Medium',
      description: 'Pressure dropped below minimum threshold'
    },
    {
      id: 3,
      sensor: 'Sensor 12',
      timestamp: '2024-01-14 18:45:00',
      type: 'Leak Detection',
      severity: 'High',
      description: 'Potential leak detected in pipeline section'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return 'text-red-400 bg-red-900/20';
      case 'medium':
        return 'text-yellow-400 bg-yellow-900/20';
      case 'low':
        return 'text-green-400 bg-green-900/20';
      default:
        return 'text-gray-400 bg-gray-900/20';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#232323] rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Total Anomalies</h3>
          <p className="text-3xl font-bold text-red-400">12</p>
          <p className="text-sm text-gray-400">Last 7 days</p>
        </div>
        <div className="bg-[#232323] rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">High Priority</h3>
          <p className="text-3xl font-bold text-orange-400">5</p>
          <p className="text-sm text-gray-400">Require immediate attention</p>
        </div>
        <div className="bg-[#232323] rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-2">Resolved</h3>
          <p className="text-3xl font-bold text-green-400">8</p>
          <p className="text-sm text-gray-400">This week</p>
        </div>
      </div>

      <div className="bg-[#232323] rounded-lg p-6">
        <h3 className="text-xl font-bold text-white mb-4">Recent Anomalies</h3>
        <div className="space-y-3">
          {anomalies.map(anomaly => (
            <div key={anomaly.id} className="border border-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="text-white font-semibold">{anomaly.sensor} - {anomaly.type}</h4>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getSeverityColor(anomaly.severity)}`}>
                  {anomaly.severity}
                </span>
              </div>
              <p className="text-gray-300 text-sm mb-2">{anomaly.description}</p>
              <p className="text-gray-500 text-xs">{anomaly.timestamp}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AnomalyDetection;
