'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { Plus, Edit, Trash2, HelpCircle, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
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

export default function FAQsPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/faqs');
      if (response.data.success) {
        setFaqs(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching FAQs:', error);
      toast.error('Failed to fetch FAQs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this FAQ?')) {
      try {
        setDeletingId(id);
        const response = await api.delete(`/api/faqs/${id}`);
        if (response.data.success) {
          setFaqs(faqs.filter(faq => faq._id !== id));
          toast.success('FAQ deleted successfully');
        }
      } catch (error: any) {
        console.error('Error deleting FAQ:', error);
        toast.error(error.response?.data?.message || 'Failed to delete FAQ');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await api.put(`/api/faqs/${id}`, {
        isActive: !currentStatus
      });
      if (response.data.success) {
        setFaqs(faqs.map(faq => 
          faq._id === id ? { ...faq, isActive: !currentStatus } : faq
        ));
        toast.success(`FAQ ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error: any) {
      console.error('Error updating FAQ status:', error);
      toast.error('Failed to update FAQ status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="FAQs" subtitle="Manage frequently asked questions">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#963f36] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="FAQs" subtitle="Manage frequently asked questions">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="brand-bg text-on-brand rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Frequently Asked Questions</h1>
              <p className="text-white/90 mt-1">Manage your FAQ content</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/faqs/create')}
              className="btn-brand-contrast flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-black" />
              <span className="text-black">Add FAQ</span>
            </button>
          </div>
        </div>

        {/* FAQs List */}
        {faqs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <HelpCircle className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No FAQs yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first FAQ</p>
            <button
              onClick={() => router.push('/dashboard/faqs/create')}
              className="btn-surface-contrast inline-flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white">Add FAQ</span>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div key={faq._id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{faq.question}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${faq.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{faq.isActive ? 'Active' : 'Inactive'}</span>
                    </div>
                    <p className="text-gray-600 mb-4 line-clamp-3">{faq.answer}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(faq.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => router.push(`/dashboard/faqs/${faq._id}/edit`)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-[#963f36] bg-[#963f36]/10 rounded-lg hover:bg-[#963f36]/20 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(faq._id, faq.isActive)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${faq.isActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
                    >
                      {faq.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(faq._id)}
                      disabled={deletingId === faq._id}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                    >
                      {deletingId === faq._id ? (
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
