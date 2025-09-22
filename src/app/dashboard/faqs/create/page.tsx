'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { Save } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const schema = yup.object({
  question: yup.string().required('Question is required').max(500, 'Question must be less than 500 characters'),
  answer: yup.string().required('Answer is required').max(2000, 'Answer must be less than 2000 characters'),
});

type FormData = yup.InferType<typeof schema>;

export default function CreateFAQPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
  }, []);

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      const response = await api.post('/api/faqs', data);

      if (response.data.success) {
        toast.success('FAQ created successfully');
        router.push('/dashboard/faqs');
      }
    } catch (error: any) {
      console.error('Error creating FAQ:', error);
      toast.error(error.response?.data?.message || 'Failed to create FAQ');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add FAQ" subtitle="Add a new frequently asked question">
      <div ref={containerRef} className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">FAQ Information</h3>
            
            <div className="space-y-6">
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Question *
                </label>
                <input
                  {...register('question')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.question ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter the frequently asked question"
                />
                {errors.question && (
                  <p className="text-red-500 text-sm mt-1">{errors.question.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 500 characters
                </p>
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Answer *
                </label>
                <textarea
                  {...register('answer')}
                  rows={6}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.answer ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter the detailed answer"
                />
                {errors.answer && (
                  <p className="text-red-500 text-sm mt-1">{errors.answer.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 2000 characters
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center bg-[#963f36] space-x-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Create FAQ</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
