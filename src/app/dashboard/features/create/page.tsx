'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp } from '@/lib/animations';
import { ArrowLeft, Save, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

export default function CreateFeaturePage() {
  const [formData, setFormData] = useState({
    featureName: '',
    featureDescription: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.featureName.trim()) {
      newErrors.featureName = 'Feature name is required';
    } else if (formData.featureName.length > 100) {
      newErrors.featureName = 'Feature name must be 100 characters or less';
    }

    if (!formData.featureDescription.trim()) {
      newErrors.featureDescription = 'Feature description is required';
    } else if (formData.featureDescription.length > 100) {
      newErrors.featureDescription = 'Feature description must be 100 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/api/features', formData);
      
      if (response.data.success) {
        toast.success('Feature created successfully');
        router.push('/dashboard/features');
      }
    } catch (error: any) {
      console.error('Error creating feature:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to create feature');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Feature" subtitle="Add a new clinic feature">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="brand-bg text-on-brand rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Create New Feature</h1>
              <p className="text-white/90 mt-1">Add a new feature to showcase your clinic</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Feature Name */}
            <div>
              <label htmlFor="featureName" className="block text-sm font-medium text-gray-700 mb-2">
                Feature Name *
              </label>
              <input
                type="text"
                id="featureName"
                name="featureName"
                value={formData.featureName}
                onChange={handleChange}
                maxLength={100}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#963f36] focus:border-transparent transition-colors duration-200 ${
                  errors.featureName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter feature name (max 100 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.featureName && (
                  <p className="text-sm text-red-600">{errors.featureName}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.featureName.length}/100
                </p>
              </div>
            </div>

            {/* Feature Description */}
            <div>
              <label htmlFor="featureDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Feature Description *
              </label>
              <textarea
                id="featureDescription"
                name="featureDescription"
                value={formData.featureDescription}
                onChange={handleChange}
                maxLength={100}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#963f36] focus:border-transparent transition-colors duration-200 resize-none ${
                  errors.featureDescription ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter feature description (max 100 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.featureDescription && (
                  <p className="text-sm text-red-600">{errors.featureDescription}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.featureDescription.length}/100
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-surface-contrast flex items-center space-x-2 px-6 py-3 rounded-lg disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{loading ? 'Creating...' : 'Create Feature'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Star className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Feature Guidelines</h3>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Maximum 2 features allowed</li>
                <li>• Feature name and description must be 100 characters or less</li>
                <li>• Choose features that best represent your clinic's strengths</li>
                <li>• Keep descriptions concise and impactful</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
