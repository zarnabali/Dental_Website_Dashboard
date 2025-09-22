'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { Save, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const schema = yup.object({
  username: yup.string().required('Username is required').max(100, 'Username must be less than 100 characters'),
  rating: yup.number().required('Rating is required').min(1, 'Rating must be at least 1').max(5, 'Rating must be at most 5'),
  title: yup.string().required('Title is required').max(200, 'Title must be less than 200 characters'),
  description: yup.string().required('Description is required').max(1000, 'Description must be less than 1000 characters'),
  status: yup.string().oneOf(['enable', 'disable']).optional(),
});

type FormData = yup.InferType<typeof schema>;

export default function CreateFeedbackPage() {
  const [loading, setLoading] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      status: 'enable',
    },
  });

  const watchedRating = watch('rating');

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
  }, []);

  const handleRatingClick = (rating: number) => {
    setSelectedRating(rating);
    setValue('rating', rating);
  };

  const onSubmit = async (data: FormData) => {
    try {
      setLoading(true);
      
      const response = await api.post('/api/feedback', data);

      if (response.data.success) {
        toast.success('Feedback created successfully');
        router.push('/dashboard/feedback');
      }
    } catch (error: any) {
      console.error('Error creating feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to create feedback');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Add Feedback" subtitle="Add customer feedback">
      <div ref={containerRef} className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Feedback Information</h3>
            
            <div className="space-y-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  {...register('username')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.username ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter customer name"
                />
                {errors.username && (
                  <p className="text-red-500 text-sm mt-1">{errors.username.message}</p>
                )}
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rating *
                </label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => handleRatingClick(rating)}
                      className={`p-1 rounded ${
                        rating <= (selectedRating || watchedRating || 0)
                          ? 'text-yellow-400'
                          : 'text-gray-300'
                      } hover:text-yellow-400 transition-colors duration-200`}
                    >
                      <Star className={`w-8 h-8 ${
                        rating <= (selectedRating || watchedRating || 0)
                          ? 'fill-current'
                          : ''
                      }`} />
                    </button>
                  ))}
                  <span className="ml-2 text-sm text-gray-600">
                    {selectedRating || watchedRating || 0} out of 5 stars
                  </span>
                </div>
                {errors.rating && (
                  <p className="text-red-500 text-sm mt-1">{errors.rating.message}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Title *
                </label>
                <input
                  {...register('title')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter feedback title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 200 characters
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Feedback Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter detailed feedback description"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Maximum 1000 characters
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Display Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="enable">Enable (Show on website)</option>
                  <option value="disable">Disable (Hide from website)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose whether to display this feedback on the website
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
              <span>Create Feedback</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}

