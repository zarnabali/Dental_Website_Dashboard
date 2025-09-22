'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface FAQData {
  question: string;
  answer: string;
  isActive: boolean;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const schema = yup.object({
  question: yup.string().required('Question is required'),
  answer: yup.string().required('Answer is required'),
  isActive: yup.boolean().default(true),
});

export default function EditFAQPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [faqData, setFaqData] = useState<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FAQData>({
    resolver: yupResolver(schema),
    defaultValues: {
      question: '',
      answer: '',
      isActive: true,
    },
  });

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchFAQData();
  }, []);

  const fetchFAQData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/faqs/${resolvedParams.id}`);
      if (response.data.success) {
        const faq = response.data.data;
        setFaqData(faq);
        
        // Set form values
        setValue('question', faq.question || '');
        setValue('answer', faq.answer || '');
        setValue('isActive', faq.isActive);
      }
    } catch (error: any) {
      console.error('Error fetching FAQ:', error);
      toast.error('Failed to fetch FAQ data');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FAQData) => {
    try {
      // Validate required fields
      if (!data.question?.trim()) {
        toast.error('Question is required');
        return;
      }
      if (!data.answer?.trim()) {
        toast.error('Answer is required');
        return;
      }

      setLoading(true);
      
      const response = await api.put(`/api/faqs/${resolvedParams.id}`, data);

      if (response.data.success) {
        toast.success('FAQ updated successfully');
        router.push('/dashboard/faqs');
      }
    } catch (error: any) {
      console.error('Error updating FAQ:', error);
      toast.error(error.response?.data?.message || 'Failed to update FAQ');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !faqData) {
    return (
      <DashboardLayout title="Edit FAQ" subtitle="Update FAQ content">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit FAQ" subtitle="Update FAQ content">
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
              <h1 className="text-2xl font-bold text-gray-900">Edit FAQ</h1>
              <p className="text-gray-600 mt-1">Update your FAQ content</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/dashboard/faqs/${resolvedParams.id}`)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <Eye className="w-5 h-5" />
              <span>View</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Question */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Question *
              </label>
              <input
                {...register('question')}
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter the question"
              />
              {errors.question && (
                <p className="mt-1 text-sm text-red-600">{errors.question.message}</p>
              )}
            </div>
          </div>

          {/* Answer */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Answer *
              </label>
              <textarea
                {...register('answer')}
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Enter the answer"
              />
              {errors.answer && (
                <p className="mt-1 text-sm text-red-600">{errors.answer.message}</p>
              )}
            </div>
          </div>

          {/* Status */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Status</h2>
            <div className="flex items-center space-x-3">
              <input
                {...register('isActive')}
                type="checkbox"
                id="isActive"
                className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
              />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">
                Active (visible to users)
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center bg-[#963f36] space-x-2 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{loading ? 'Updating...' : 'Update FAQ'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
