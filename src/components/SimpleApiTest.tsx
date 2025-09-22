'use client';

import React, { useState } from 'react';
import api from '@/lib/api';

const SimpleApiTest = () => {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    setResult('Testing...');
    
    try {
      console.log('Testing API call...');
      const response = await api.get('/api/upload/test');
      console.log('API Response:', response);
      setResult(`Success! Status: ${response.status}, Data: ${JSON.stringify(response.data)}`);
    } catch (error: any) {
      console.error('API Error:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border border-gray-300 rounded-lg">
      <h3 className="text-lg font-bold text-black mb-4">Simple API Test</h3>
      <button
        onClick={testApi}
        disabled={loading}
        className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test API'}
      </button>
      {result && (
        <div className="mt-4 p-3 bg-gray-100 rounded">
          <pre className="text-sm text-black">{result}</pre>
        </div>
      )}
    </div>
  );
};

export default SimpleApiTest;
















