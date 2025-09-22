'use client';

import React, { useEffect, useRef, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { ArrowLeft, Edit, Trash2, Calendar, Eye, EyeOff, Star, User } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Feedback {
  _id: string;
  username: string;
  rating: number;
  title: string;
  description: string;
  status: 'enable' | 'disable';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ViewFeedbackPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/feedback/${resolvedParams.id}`);
      if (response.data.success) {
        setFeedback(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching feedback:', error);
      toast.error('Failed to fetch feedback data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this feedback? This action cannot be undone.')) {
      try {
        setDeleting(true);
        const response = await api.delete(`/api/feedback/${resolvedParams.id}`);
        if (response.data.success) {
          toast.success('Feedback deleted successfully');
          router.push('/dashboard/feedback');
        }
      } catch (error: any) {
        console.error('Error deleting feedback:', error);
        toast.error(error.response?.data?.message || 'Failed to delete feedback');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleToggleStatus = async () => {
    if (!feedback) return;
    
    try {
      const response = await api.put(`/api/feedback/${resolvedParams.id}`, {
        isActive: !feedback.isActive
      });
      if (response.data.success) {
        setFeedback({ ...feedback, isActive: !feedback.isActive });
        toast.success(`Feedback ${!feedback.isActive ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error: any) {
      console.error('Error updating feedback status:', error);
      toast.error('Failed to update feedback status');
    }
  };

  const handleToggleDisplayStatus = async () => {
    if (!feedback) return;
    
    try {
      const newStatus = feedback.status === 'enable' ? 'disable' : 'enable';
      const response = await api.put(`/api/feedback/${resolvedParams.id}`, {
        status: newStatus
      });
      if (response.data.success) {
        setFeedback({ ...feedback, status: newStatus });
        toast.success(`Feedback ${newStatus === 'enable' ? 'enabled' : 'disabled'} for display`);
      }
    } catch (error: any) {
      console.error('Error updating feedback display status:', error);
      toast.error('Failed to update feedback display status');
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <DashboardLayout title="Feedback Details" subtitle="View feedback information">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!feedback) {
    return (
      <DashboardLayout title="Feedback Details" subtitle="View feedback information">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Feedback not found</h3>
          <p className="text-gray-600 mb-6">The feedback you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push('/dashboard/feedback')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Feedback</span>
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Feedback Details" subtitle="View feedback information">
      <div ref={containerRef} className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Feedback Details</h1>
              <p className="text-gray-600 mt-1">View feedback information</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/dashboard/feedback/${resolvedParams.id}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
            >
              <Edit className="w-5 h-5" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleToggleDisplayStatus}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                feedback.status === 'enable'
                  ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                  : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
              }`}
            >
              {feedback.status === 'enable' ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span>{feedback.status === 'enable' ? 'Hide' : 'Show'}</span>
            </button>
            <button
              onClick={handleToggleStatus}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                feedback.isActive
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-green-600 bg-green-50 hover:bg-green-100'
              }`}
            >
              {feedback.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span>{feedback.isActive ? 'Deactivate' : 'Activate'}</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
            >
              {deleting ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Status Badges */}
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              feedback.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {feedback.isActive ? 'Active' : 'Inactive'}
            </span>
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              feedback.status === 'enable'
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {feedback.status === 'enable' ? 'Displayed' : 'Hidden'}
            </span>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(feedback.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Updated: {new Date(feedback.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* User Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">User Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <User className="w-5 h-5 text-gray-400" />
                <span className="text-lg font-medium text-gray-900">{feedback.username}</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Rating:</span>
                <div className="flex items-center space-x-1">
                  {renderStars(feedback.rating)}
                </div>
                <span className="text-sm text-gray-600">({feedback.rating}/5)</span>
              </div>
            </div>
          </div>

          {/* Feedback Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Feedback Content</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Title</h3>
                <p className="text-gray-900 text-lg font-medium">{feedback.title}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{feedback.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
