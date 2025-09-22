'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp } from '@/lib/animations';
import { Plus, Edit, Trash2, Star, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Feature {
  id: number;
  featureName: string;
  featureDescription: string;
}

export default function FeaturesPage() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/features');
      if (response.data.success) {
        setFeatures(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching features:', error);
      toast.error('Failed to fetch features');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this feature?')) {
      try {
        setDeletingId(id);
        const response = await api.delete(`/api/features/${id}`);
        if (response.data.success) {
          setFeatures(features.filter(feature => feature.id !== id));
          toast.success('Feature deleted successfully');
        }
      } catch (error: any) {
        console.error('Error deleting feature:', error);
        toast.error(error.response?.data?.message || 'Failed to delete feature');
      } finally {
        setDeletingId(null);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Features" subtitle="Manage clinic features">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#963f36] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Features" subtitle="Manage clinic features">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="brand-bg text-on-brand rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Clinic Features</h1>
              <p className="text-white/90 mt-1">Manage your clinic features (Max 2 features)</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/features/create')}
              disabled={features.length >= 2}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                features.length >= 2
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'btn-brand-contrast hover:bg-white/90'
              }`}
            >
              <Plus className="w-5 h-5" />
              <span>Add Feature</span>
            </button>
          </div>
        </div>

        {/* Features List */}
        {features.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Star className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No features yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first feature</p>
            <button
              onClick={() => router.push('/dashboard/features/create')}
              className="btn-surface-contrast inline-flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white">Add Feature</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {features.map((feature) => (
              <div key={feature.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{feature.featureName}</h3>
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                        Feature {feature.id}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-4">{feature.featureDescription}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Added recently</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => router.push(`/dashboard/features/${feature.id}/edit`)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#963f36] bg-[#963f36]/10 rounded-lg hover:bg-[#963f36]/20 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleDelete(feature.id)}
                      disabled={deletingId === feature.id}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                    >
                      {deletingId === feature.id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Max Features Warning */}
        {features.length >= 2 && (
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-600" />
              <p className="text-yellow-800 font-medium">Maximum features reached</p>
            </div>
            <p className="text-yellow-700 text-sm mt-1">
              You can only have 2 features at a time. Delete an existing feature to add a new one.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
