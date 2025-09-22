'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { Plus, Edit, Trash2, MessageSquare, Calendar, Star, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export default function FeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/feedback');
      if (response.data.success) {
        setFeedbacks(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching feedbacks:', error);
      toast.error('Failed to fetch feedbacks');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        setDeletingId(id);
        const response = await api.delete(`/api/feedback/${id}`);
        if (response.data.success) {
          setFeedbacks(feedbacks.filter(feedback => feedback._id !== id));
          toast.success('Feedback deleted successfully');
        }
      } catch (error: any) {
        console.error('Error deleting feedback:', error);
        toast.error(error.response?.data?.message || 'Failed to delete feedback');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await api.put(`/api/feedback/${id}`, {
        isActive: !currentStatus
      });
      if (response.data.success) {
        setFeedbacks(feedbacks.map(feedback => 
          feedback._id === id ? { ...feedback, isActive: !currentStatus } : feedback
        ));
        toast.success(`Feedback ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error: any) {
      console.error('Error updating feedback status:', error);
      toast.error('Failed to update feedback status');
    }
  };

  const handleToggleDisplayStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'enable' ? 'disable' : 'enable';
      const response = await api.put(`/api/feedback/${id}`, {
        status: newStatus
      });
      if (response.data.success) {
        setFeedbacks(feedbacks.map(feedback => 
          feedback._id === id ? { ...feedback, status: newStatus } : feedback
        ));
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
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) {
    return (
      <DashboardLayout title="Feedback" subtitle="Manage customer feedback">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#963f36] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Feedback" subtitle="Manage customer feedback">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="brand-bg text-on-brand rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Customer Feedback</h1>
              <p className="text-white/90 mt-1">Manage customer testimonials and feedback</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/feedback/create')}
              className="btn-brand-contrast flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-black" />
              <span className="text-black">Add Feedback</span>
            </button>
          </div>
        </div>

        {/* Feedbacks List */}
        {feedbacks.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MessageSquare className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first customer feedback</p>
            <button
              onClick={() => router.push('/dashboard/feedback/create')}
              className="btn-surface-contrast inline-flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white">Add Feedback</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div key={feedback._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <User className="w-5 h-5 text-gray-400" />
                        <span className="font-medium text-gray-900">{feedback.username}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {renderStars(feedback.rating)}
                      </div>
                      <div className="flex space-x-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          feedback.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {feedback.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          feedback.status === 'enable'
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {feedback.status === 'enable' ? 'Displayed' : 'Hidden'}
                        </span>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {feedback.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {feedback.description}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => router.push(`/dashboard/feedback/${feedback._id}/edit`)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-[#963f36] rounded-lg hover:bg-[#7f352f] transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4 text-white" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleDisplayStatus(feedback._id, feedback.status)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        feedback.status === 'enable'
                          ? 'text-orange-600 bg-orange-50 hover:bg-orange-100'
                          : 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                      }`}
                    >
                      {feedback.status === 'enable' ? 'Hide' : 'Show'}
                    </button>
                    <button
                      onClick={() => handleToggleStatus(feedback._id, feedback.isActive)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        feedback.isActive
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {feedback.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(feedback._id)}
                      disabled={deletingId === feedback._id}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                    >
                      {deletingId === feedback._id ? (
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
      </div>
    </DashboardLayout>
  );
}
