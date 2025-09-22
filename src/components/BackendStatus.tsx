'use client';

import React, { useState, useEffect } from 'react';
import api from '@/lib/api';
import { CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';

const BackendStatus = () => {
  const [status, setStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const checkBackend = async () => {
    setStatus('checking');
    try {
      const response = await api.get('/health');
      if (response.status === 200) {
        setStatus('online');
      } else {
        setStatus('offline');
      }
    } catch (error) {
      console.error('Backend check failed:', error);
      setStatus('offline');
    }
    setLastChecked(new Date());
  };

  useEffect(() => {
    checkBackend();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <Loader className="w-5 h-5 animate-spin text-blue-500" />;
      case 'online':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'offline':
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'checking':
        return 'Checking...';
      case 'online':
        return 'Backend Online';
      case 'offline':
        return 'Backend Offline';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'text-blue-600';
      case 'online':
        return 'text-green-600';
      case 'offline':
        return 'text-red-600';
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <p className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </p>
            <p className="text-sm text-gray-600">
              {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}
            </p>
            {lastChecked && (
              <p className="text-xs text-gray-500">
                Last checked: {lastChecked.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={checkBackend}
          disabled={status === 'checking'}
          className="p-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${status === 'checking' ? 'animate-spin' : ''}`} />
        </button>
      </div>
      
      {status === 'offline' && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            <strong>Backend is not running!</strong> Please start your backend server:
          </p>
          <div className="mt-2 text-xs text-red-700 font-mono bg-red-100 p-2 rounded">
            cd Dentist_Backend && npm start
          </div>
        </div>
      )}
    </div>
  );
};

export default BackendStatus;
