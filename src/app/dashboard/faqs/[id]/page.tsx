'use client';

import React, { useEffect, useRef, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { ArrowLeft, Edit, Trash2, Calendar, Eye, EyeOff } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface FAQ {
  _id: string;
  question: string;
  answer: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ViewFAQPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchFAQ();
  }, []);

  const fetchFAQ = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/faqs/${resolvedParams.id}`);
      if (response.data.success) {
        setFaq(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching FAQ:', error);
      toast.error('Failed to fetch FAQ data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this FAQ? This action cannot be undone.')) {
      try {
        setDeleting(true);
        const response = await api.delete(`/api/faqs/${resolvedParams.id}`);
        if (response.data.success) {
          toast.success('FAQ deleted successfully');
          router.push('/dashboard/faqs');
        }
      } catch (error: any) {
        console.error('Error deleting FAQ:', error);
        toast.error(error.response?.data?.message || 'Failed to delete FAQ');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleToggleStatus = async () => {
    if (!faq) return;
    
    try {
      const response = await api.put(`/api/faqs/${resolvedParams.id}`, {
        isActive: !faq.isActive
      });
      if (response.data.success) {
        setFaq({ ...faq, isActive: !faq.isActive });
        toast.success(`FAQ ${!faq.isActive ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error: any) {
      console.error('Error updating FAQ status:', error);
      toast.error('Failed to update FAQ status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="FAQ Details" subtitle="View FAQ information">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!faq) {
    return (
      <DashboardLayout title="FAQ Details" subtitle="View FAQ information">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">FAQ not found</h3>
          <p className="text-gray-600 mb-6">The FAQ you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push('/dashboard/faqs')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to FAQs</span>
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="FAQ Details" subtitle="View FAQ information">
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
              <h1 className="text-2xl font-bold text-gray-900">FAQ Details</h1>
              <p className="text-gray-600 mt-1">View FAQ information</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/dashboard/faqs/${resolvedParams.id}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
            >
              <Edit className="w-5 h-5" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleToggleStatus}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                faq.isActive
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-green-600 bg-green-50 hover:bg-green-100'
              }`}
            >
              {faq.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span>{faq.isActive ? 'Deactivate' : 'Activate'}</span>
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
          {/* Status Badge */}
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              faq.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {faq.isActive ? 'Active' : 'Inactive'}
            </span>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(faq.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Updated: {new Date(faq.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* FAQ Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-2">Question</h2>
                <p className="text-gray-900 text-lg font-medium">{faq.question}</p>
              </div>
              
              <div>
                <h2 className="text-sm font-medium text-gray-700 mb-2">Answer</h2>
                <p className="text-gray-600 whitespace-pre-wrap">{faq.answer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
