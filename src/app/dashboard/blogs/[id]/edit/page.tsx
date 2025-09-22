'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRouter } from 'next/navigation';
import { use } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { ArrowLeft, Upload, X, Plus, Trash2, Save, Eye } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface BlogData {
  cardInfo: {
    title: string;
    description: string;
    image: File | null;
  };
  blogContent: {
    title: string;
    description: string;
    heroImage: File | null;
  };
  youtubeLinks: string[];
  isActive: boolean;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const schema = yup.object({
  cardInfo: yup.object({
    title: yup.string().required('Card title is required'),
    description: yup.string().required('Card description is required'),
    image: yup.mixed().nullable(),
  }),
  blogContent: yup.object({
    title: yup.string().required('Blog title is required'),
    description: yup.string().required('Blog description is required'),
    heroImage: yup.mixed().nullable(),
  }),
  youtubeLinks: yup.array().of(yup.string().url('Must be a valid URL')).default([]),
  isActive: yup.boolean().default(true),
});

export default function EditBlogPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [blogData, setBlogData] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BlogData>({
    resolver: yupResolver(schema),
    defaultValues: {
      cardInfo: {
        title: '',
        description: '',
        image: null,
      },
      blogContent: {
        title: '',
        description: '',
        heroImage: null,
      },
      youtubeLinks: [],
      isActive: true,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'youtubeLinks' as any,
  });

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchBlogData();
  }, []);

  const fetchBlogData = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/blogs/${resolvedParams.id}`);
      if (response.data.success) {
        const blog = response.data.data;
        setBlogData(blog);
        
        // Set form values
        setValue('cardInfo.title', blog.cardInfo?.title || '');
        setValue('cardInfo.description', blog.cardInfo?.description || '');
        setValue('blogContent.title', blog.blogContent?.title || '');
        setValue('blogContent.description', blog.blogContent?.description || '');
        setValue('youtubeLinks', blog.blogContent?.youtubeLinks || []);
        setValue('isActive', blog.isActive);
        
        // Set image previews
        if (blog.cardInfo?.image) {
          setImagePreview((blog.cardInfo.image as any)?.url || (blog.cardInfo.image as any));
        }
        if (blog.blogContent?.heroImage) {
          setHeroImagePreview((blog.blogContent.heroImage as any)?.url || (blog.blogContent.heroImage as any));
        }
      }
    } catch (error: any) {
      console.error('Error fetching blog:', error);
      toast.error('Failed to fetch blog data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'card' | 'hero') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      if (type === 'card') {
        setValue('cardInfo.image', file);
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      } else {
        setValue('blogContent.heroImage', file);
        const reader = new FileReader();
        reader.onload = (e) => setHeroImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const removeImage = (type: 'card' | 'hero') => {
    if (type === 'card') {
      setValue('cardInfo.image', null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } else {
      setValue('blogContent.heroImage', null);
      setHeroImagePreview(null);
      if (heroFileInputRef.current) {
        heroFileInputRef.current.value = '';
      }
    }
  };

  const onSubmit = async (data: BlogData) => {
    try {
      // Validate required fields
      if (!data.cardInfo.title?.trim()) {
        toast.error('Card title is required');
        return;
      }
      if (!data.cardInfo.description?.trim()) {
        toast.error('Card description is required');
        return;
      }
      if (!data.blogContent.title?.trim()) {
        toast.error('Blog title is required');
        return;
      }
      if (!data.blogContent.description?.trim()) {
        toast.error('Blog description is required');
        return;
      }

      setLoading(true);

      const payload: any = {
        cardInfo: {
          title: data.cardInfo.title,
          description: data.cardInfo.description,
        },
        blogContent: {
          title: data.blogContent.title,
          description: data.blogContent.description,
          youtubeLinks: data.youtubeLinks || [],
        },
        isActive: data.isActive,
      };

      const response = await api.put(`/api/blogs/${resolvedParams.id}`, payload);

      if (response.data.success) {
        toast.success('Blog updated successfully');
        router.push('/dashboard/blogs');
      }
    } catch (error: any) {
      console.error('Error updating blog:', error);
      toast.error(error.response?.data?.message || 'Failed to update blog');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !blogData) {
    return (
      <DashboardLayout title="Edit Blog" subtitle="Update blog content">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Blog" subtitle="Update blog content">
      <div ref={containerRef} className="max-w-4xl mx-auto">
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
              <h1 className="text-2xl font-bold text-gray-900">Edit Blog</h1>
              <p className="text-gray-600 mt-1">Update your blog content</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/dashboard/blogs/${resolvedParams.id}`)}
              className="flex items-center space-x-2 px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              <Eye className="w-5 h-5" />
              <span>View</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Card Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Card Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Title *
                  </label>
                  <input
                    {...register('cardInfo.title')}
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter card title"
                  />
                  {(errors as any).cardInfo?.title && (
                    <p className="mt-1 text-sm text-red-600">{(errors as any).cardInfo.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Description *
                  </label>
                  <textarea
                    {...register('cardInfo.description')}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter card description"
                  />
                  {(errors as any).cardInfo?.description && (
                    <p className="mt-1 text-sm text-red-600">{(errors as any).cardInfo.description.message}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Image
                </label>
                <div className="space-y-4">
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Card preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('card')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload image</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'card')}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Blog Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Blog Content</h2>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Title *
                </label>
                <input
                  {...register('blogContent.title')}
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter blog title"
                />
                {(errors as any).blogContent?.title && (
                  <p className="mt-1 text-sm text-red-600">{(errors as any).blogContent.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Description *
                </label>
                <textarea
                  {...register('blogContent.description')}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Enter blog description"
                />
                {(errors as any).blogContent?.description && (
                  <p className="mt-1 text-sm text-red-600">{(errors as any).blogContent.description.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hero Image
                </label>
                <div className="space-y-4">
                  {heroImagePreview ? (
                    <div className="relative">
                      <img
                        src={heroImagePreview}
                        alt="Hero image preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage('hero')}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => heroFileInputRef.current?.click()}
                      className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-colors duration-200"
                    >
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-600">Click to upload hero image</p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG up to 5MB</p>
                    </div>
                  )}
                  <input
                    ref={heroFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(e, 'hero')}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* YouTube Links */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">YouTube Links</h2>
              <button
                type="button"
                onClick={() => append('')}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                <span>Add Link</span>
              </button>
            </div>

            <div className="space-y-3">
              {fields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-3">
                  <input
                    {...register(`youtubeLinks.${index}` as any)}
                    type="url"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter YouTube URL"
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
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
              <span>{loading ? 'Updating...' : 'Update Blog'}</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
