import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface AnomalyAlertProps {
  message: string;
  severity: 'high' | 'medium' | 'low';
  onDismiss?: () => void;
}

const AnomalyAlert: React.FC<AnomalyAlertProps> = ({ message, severity, onDismiss }) => {
  const getAlertStyles = () => {
    switch (severity) {
      case 'high':
        return 'bg-red-900/20 border-red-500 text-red-400';
      case 'medium':
        return 'bg-yellow-900/20 border-yellow-500 text-yellow-400';
      case 'low':
        return 'bg-blue-900/20 border-blue-500 text-blue-400';
      default:
        return 'bg-gray-900/20 border-gray-500 text-gray-400';
    }
  };

  const getIconColor = () => {
    switch (severity) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className={`border-l-4 p-4 rounded-r-lg ${getAlertStyles()}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertTriangle className={`h-5 w-5 ${getIconColor()}`} />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 ${getIconColor()} hover:bg-gray-700`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyAlert;
