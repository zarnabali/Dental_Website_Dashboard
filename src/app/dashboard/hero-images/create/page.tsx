'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp } from '@/lib/animations';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Save, Upload, X, Image as ImageIcon, Smartphone, Monitor } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const schema = yup.object({
  title: yup.string().required('Title is required').max(100, 'Title must be less than 100 characters'),
  description: yup.string().required('Description is required').max(500, 'Description must be less than 500 characters'),
  textColor: yup.string().required('Text color is required').matches(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
});

type FormData = yup.InferType<typeof schema>;

export default function CreateHeroImagePage() {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [mobileImageFile, setMobileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [mobileImagePreview, setMobileImagePreview] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      textColor: '#ffffff',
    },
  });

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'mobileImage') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (10MB limit for images)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size should be less than 10MB');
        return;
      }
      
      if (type === 'image') {
        setImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setMobileImageFile(file);
        const reader = new FileReader();
        reader.onload = () => setMobileImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!imageFile || !mobileImageFile) {
      toast.error('Please upload both web and mobile images');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('image', imageFile);
      formData.append('mobileImage', mobileImageFile);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('textColor', data.textColor);

      const response = await api.post('/api/hero-images', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Hero image created successfully');
        router.push('/dashboard/hero-images');
      }
    } catch (error: any) {
      console.error('Error creating hero image:', error);
      toast.error(error.response?.data?.message || 'Failed to create hero image');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Hero Image" subtitle="Add a new hero image for web and mobile">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Create Hero Image</h3>
            <p className="text-sm text-gray-600 mt-1">
              Upload images for both web and mobile hero sections
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Web Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Web Image *
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  if (!imagePreview) {
                    document.getElementById('image-upload')?.click();
                  }
                }}
              >
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Web image preview"
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setImageFile(null);
                        setImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Monitor className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">Upload web image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'image')}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Web Image
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPG, PNG, GIF, WebP, SVG
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mobile Image *
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  if (!mobileImagePreview) {
                    document.getElementById('mobile-image-upload')?.click();
                  }
                }}
              >
                {mobileImagePreview ? (
                  <div className="relative">
                    <img
                      src={mobileImagePreview}
                      alt="Mobile image preview"
                      className="w-full max-w-md mx-auto rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMobileImageFile(null);
                        setMobileImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Smartphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">Upload mobile image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'mobileImage')}
                      className="hidden"
                      id="mobile-image-upload"
                    />
                    <label
                      htmlFor="mobile-image-upload"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose Mobile Image
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPG, PNG, GIF, WebP, SVG
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Image Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  {...register('title')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter image title"
                />
                {errors.title && (
                  <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Color *
                </label>
                <div className="flex space-x-2">
                  <input
                    {...register('textColor')}
                    type="color"
                    className="w-16 h-12 border rounded-lg cursor-pointer"
                  />
                  <input
                    {...register('textColor')}
                    className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                      errors.textColor ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="#ffffff"
                  />
                </div>
                {errors.textColor && (
                  <p className="text-red-500 text-sm mt-1">{errors.textColor.message}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                {...register('description')}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter image description"
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
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
                <span>Create Hero Image</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
