'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { CheckCircle, XCircle, Loader, RefreshCw } from 'lucide-react';

export default function TestConnectionPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    { name: 'Root API Test', url: '/', method: 'GET' },
    { name: 'Auth Test', url: '/api/auth/me', method: 'GET' },
    { name: 'Clinic Info', url: '/api/clinic-info', method: 'GET' },
    { name: 'Hero Images', url: '/api/hero-images', method: 'GET' },
    { name: 'Services', url: '/api/services', method: 'GET' },
  ];

  const runTests = async () => {
    setLoading(true);
    const results: any[] = [];

    for (const endpoint of testEndpoints) {
      try {
        console.log(`Testing ${endpoint.name}: ${endpoint.url}`);
        const response = await api.get(endpoint.url);
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'success',
          statusCode: response.status,
          data: response.data,
        });
      } catch (error: any) {
        console.error(`Error testing ${endpoint.name}:`, error);
        results.push({
          name: endpoint.name,
          url: endpoint.url,
          status: 'error',
          statusCode: error.response?.status || 'Network Error',
          error: error.message,
          isNetworkError: error.isNetworkError,
        });
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-black">Backend Connection Test</h1>
              <p className="text-gray-700 mt-1">Test all API endpoints to verify backend connection</p>
            </div>
            <button
              onClick={runTests}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span>{loading ? 'Testing...' : 'Run Tests'}</span>
            </button>
          </div>

          <div className="space-y-4">
            {testResults.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">Click "Run Tests" to test backend connection</p>
              </div>
            ) : (
              testResults.map((result, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    {result.status === 'success' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500" />
                    )}
                    <div>
                      <p className="font-medium text-black">{result.name}</p>
                      <p className="text-sm text-gray-600">{result.method} {result.url}</p>
                      {result.isNetworkError && (
                        <p className="text-xs text-red-500">Network Error - Backend not running</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      result.status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.statusCode}
                    </p>
                    {result.status === 'error' && (
                      <p className="text-xs text-red-500">{result.error}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-black mb-2">Configuration</h3>
            <p className="text-sm text-gray-600">
              API Base URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              Make sure your backend is running on the configured URL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
