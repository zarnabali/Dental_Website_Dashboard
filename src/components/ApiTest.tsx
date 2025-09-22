'use client';

import React, { useState } from 'react';
import api from '@/lib/api';
import { CheckCircle, XCircle, Loader } from 'lucide-react';

const ApiTest = () => {
  const [testResults, setTestResults] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);

  const testEndpoints = [
    { name: 'Auth Test', url: '/api/auth/me', method: 'GET' },
    { name: 'Clinic Info', url: '/api/clinic-info', method: 'GET' },
    { name: 'Hero Images', url: '/api/hero-images', method: 'GET' },
    { name: 'Hero Videos', url: '/api/hero-videos', method: 'GET' },
    { name: 'Services', url: '/api/services', method: 'GET' },
    { name: 'Blogs', url: '/api/blogs', method: 'GET' },
    { name: 'Team', url: '/api/team', method: 'GET' },
    { name: 'Partners', url: '/api/partners', method: 'GET' },
    { name: 'FAQs', url: '/api/faqs', method: 'GET' },
    { name: 'Feedback', url: '/api/feedback', method: 'GET' },
  ];

  const runTests = async () => {
    setLoading(true);
    const results: Record<string, any> = {};

    for (const endpoint of testEndpoints) {
      try {
        const response = await api.get(endpoint.url);
        results[endpoint.name] = {
          status: 'success',
          statusCode: response.status,
          data: response.data,
        };
      } catch (error: any) {
        results[endpoint.name] = {
          status: 'error',
          statusCode: error.response?.status || 'Network Error',
          error: error.message,
        };
      }
    }

    setTestResults(results);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-black">API Connection Test</h3>
        <button
          onClick={runTests}
          disabled={loading}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center space-x-2"
        >
          {loading ? (
            <Loader className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          <span>{loading ? 'Testing...' : 'Test All Endpoints'}</span>
        </button>
      </div>

      <div className="space-y-4">
        {testEndpoints.map((endpoint) => {
          const result = testResults[endpoint.name];
          return (
            <div
              key={endpoint.name}
              className="flex items-center justify-between p-4 border border-gray-200 rounded-lg"
            >
              <div className="flex items-center space-x-3">
                {result ? (
                  result.status === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )
                ) : (
                  <div className="w-5 h-5 border-2 border-gray-300 rounded-full"></div>
                )}
                <div>
                  <p className="font-medium text-black">{endpoint.name}</p>
                  <p className="text-sm text-gray-600">{endpoint.method} {endpoint.url}</p>
                </div>
              </div>
              <div className="text-right">
                {result ? (
                  <div>
                    <p className={`text-sm font-medium ${
                      result.status === 'success' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {result.statusCode}
                    </p>
                    {result.status === 'error' && (
                      <p className="text-xs text-red-500">{result.error}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Not tested</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-black mb-2">API Configuration</h4>
        <p className="text-sm text-gray-600">
          Base URL: {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}
        </p>
        <p className="text-sm text-gray-600">
          Make sure your backend is running on the configured URL.
        </p>
      </div>
    </div>
  );
};

export default ApiTest;
