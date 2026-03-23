import React from 'react';
import { Loader2, CheckCircle, AlertCircle, Clock } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress?: number;
  errorMessage?: string;
  processingTime?: number;
  fileName?: string;
}

export const ProcessingStatus: React.FC<ProcessingStatusProps> = ({
  status,
  progress = 0,
  errorMessage,
  processingTime,
  fileName,
}) => {
  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'text-cyan-400';
      case 'completed':
        return 'text-lime-400';
      case 'failed':
        return 'text-red-400';
      default:
        return 'text-yellow-400';
    }
  };

  const getStatusLabel = () => {
    switch (status) {
      case 'processing':
        return 'PROCESSING...';
      case 'completed':
        return 'COMPLETE';
      case 'failed':
        return 'FAILED';
      default:
        return 'PENDING';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 size={24} className="animate-spin" />;
      case 'completed':
        return <CheckCircle size={24} />;
      case 'failed':
        return <AlertCircle size={24} />;
      default:
        return <Clock size={24} />;
    }
  };

  return (
    <div className="w-full space-y-4">
      {/* Status Card */}
      <div className={`pixel-border p-4 md:p-6 ${
        status === 'completed' ? 'pixel-border' : 
        status === 'failed' ? 'border-red-500 border-4' :
        'pixel-border-cyan'
      }`}
      style={{
        boxShadow: status === 'completed' 
          ? '0 0 20px rgb(0 255 0 / 0.5)'
          : status === 'failed'
          ? '0 0 20px rgb(239 68 68 / 0.5)'
          : '0 0 20px rgb(0 255 255 / 0.5)',
      }}>
        <div className="flex items-center gap-4">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <div className="flex-1">
            <h3 className={`font-bold text-lg md:text-xl ${getStatusColor()}`}>
              {getStatusLabel()}
            </h3>
            {fileName && (
              <p className="text-xs md:text-sm text-muted-foreground mt-1">
                {fileName}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {status === 'processing' && (
          <div className="mt-4 space-y-2">
            <div className="w-full h-4 bg-slate-800 border-2 border-cyan-400 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-400 to-lime-400 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-cyan-400 text-center font-bold">
              {progress}%
            </p>
          </div>
        )}

        {/* Processing Time */}
        {status === 'completed' && processingTime && (
          <div className="mt-3 text-xs text-lime-400 font-bold">
            ⏱ Processed in {(processingTime / 1000).toFixed(2)}s
          </div>
        )}

        {/* Error Message */}
        {status === 'failed' && errorMessage && (
          <div className="mt-3 p-2 bg-red-900 border border-red-500 rounded">
            <p className="text-xs text-red-200">{errorMessage}</p>
          </div>
        )}
      </div>

      {/* Pixel Animation */}
      {status === 'processing' && (
        <div className="flex justify-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-2 h-2 bg-cyan-400"
              style={{
                animation: `pixel-pulse 0.6s ease-in-out ${i * 0.12}s infinite`,
                boxShadow: '0 0 8px rgb(0 255 255 / 0.8)',
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
