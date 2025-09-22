'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { useForm, useFieldArray } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { Save, Plus, Trash2, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const schema = yup.object({
  cardTitle: yup.string().required('Card title is required'),
  cardDescription: yup.string().required('Card description is required'),
  blogTitle: yup.string().required('Blog title is required'),
  blogDescription: yup.string().required('Blog description is required'),
  paras: yup.array().of(yup.object({
    heading: yup.string().required('Paragraph heading is required'),
    content: yup.string().required('Paragraph content is required')
  })).default([]),
  pointParas: yup.array().of(yup.object({
    heading: yup.string().required('Point paragraph heading is required'),
    sentences: yup.string().required('Sentences are required')
  })).default([]),
  youtubeLinks: yup.array().of(yup.string().url('Must be a valid URL')).default([]),
});

type FormData = yup.InferType<typeof schema>;

export default function CreateBlogPage() {
  const [loading, setLoading] = useState(false);
  const [cardImage, setCardImage] = useState<File | null>(null);
  const [heroImage, setHeroImage] = useState<File | null>(null);
  const [cardImagePreview, setCardImagePreview] = useState<string | null>(null);
  const [heroImagePreview, setHeroImagePreview] = useState<string | null>(null);
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      cardTitle: '',
      cardDescription: '',
      blogTitle: '',
      blogDescription: '',
      paras: [{ heading: '', content: '' }],
      pointParas: [{ heading: '', sentences: '' }],
      youtubeLinks: [''],
    },
  });

  const {
    fields: paraFields,
    append: appendPara,
    remove: removePara,
  } = useFieldArray<FormData, 'paras'>({
    control,
    name: 'paras',
  });

  const {
    fields: pointParaFields,
    append: appendPointPara,
    remove: removePointPara,
  } = useFieldArray<FormData, 'pointParas'>({
    control,
    name: 'pointParas',
  });

  const {
    fields: youtubeFields,
    append: appendYoutube,
    remove: removeYoutube,
  } = useFieldArray<FormData, any>({
    control,
    name: 'youtubeLinks' as any,
  });

  const watchedCardTitle = watch('cardTitle');
  const watchedCardDescription = watch('cardDescription');
  const watchedBlogTitle = watch('blogTitle');
  const watchedBlogDescription = watch('blogDescription');

  // Check if form is ready to submit
  const isFormReady = watchedCardTitle?.trim() && 
                     watchedCardDescription?.trim() && 
                     watchedBlogTitle?.trim() && 
                     watchedBlogDescription?.trim() && 
                     cardImage && 
                     heroImage;

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
  }, []);

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
        toast.error('Image size should be less than 5MB');
        return;
      }
      
      if (type === 'card') {
        setCardImage(file);
        const reader = new FileReader();
        reader.onload = () => setCardImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      } else {
        setHeroImage(file);
        const reader = new FileReader();
        reader.onload = () => setHeroImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const onSubmit = async (data: FormData) => {
    console.log('Form data received:', data);
    console.log('Card image:', cardImage);
    console.log('Hero image:', heroImage);
    console.log('Form errors:', errors);
    
    // Validate required fields
    if (!data.cardTitle?.trim()) {
      toast.error('Card title is required');
      return;
    }
    if (!data.cardDescription?.trim()) {
      toast.error('Card description is required');
      return;
    }
    if (!data.blogTitle?.trim()) {
      toast.error('Blog title is required');
      return;
    }
    if (!data.blogDescription?.trim()) {
      toast.error('Blog description is required');
      return;
    }
    if (!cardImage) {
      toast.error('Please upload card image');
      return;
    }
    if (!heroImage) {
      toast.error('Please upload hero image');
      return;
    }

    try {
      setLoading(true);
      
      const formData = new FormData();
      formData.append('cardImage', cardImage);
      formData.append('heroImage', heroImage);
      formData.append('cardTitle', data.cardTitle);
      formData.append('cardDescription', data.cardDescription);
      formData.append('blogTitle', data.blogTitle);
      formData.append('blogDescription', data.blogDescription);
      
      // Process paragraphs and point paragraphs
      const processedParas = data.paras?.map(para => ({
        heading: para.heading,
        content: para.content
      })) || [];
      
      const processedPointParas = data.pointParas?.map(pointPara => ({
        heading: pointPara.heading,
        sentences: pointPara.sentences.split('\n').filter((s: string) => s.trim())
      })) || [];

      formData.append('paras', JSON.stringify(processedParas));
      formData.append('pointParas', JSON.stringify(processedPointParas));
      formData.append('youtubeLinks', JSON.stringify(data.youtubeLinks || []));

      const response = await api.post('/api/blogs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        toast.success('Blog created successfully');
        router.push('/dashboard/blogs');
      }
    } catch (error: any) {
      console.error('Error creating blog:', error);
      toast.error(error.response?.data?.message || 'Failed to create blog');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Create Blog" subtitle="Add a new blog post">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Card Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Blog Card Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Image *
                </label>
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors duration-200 cursor-pointer"
                  onClick={() => {
                    if (!cardImagePreview) {
                      document.getElementById('card-image')?.click();
                    }
                  }}
                >
                  {cardImagePreview ? (
                    <div className="relative">
                      <img
                        src={cardImagePreview}
                        alt="Card preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCardImage(null);
                          setCardImagePreview(null);
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600 mb-2">Upload card image</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageChange(e, 'card')}
                        className="hidden"
                        id="card-image"
                      />
                      <label
                        htmlFor="card-image"
                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                        }}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Choose File
                      </label>
                      <p className="text-xs text-gray-500 mt-2">
                        Supported formats: JPG, PNG, GIF, WebP
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Card Details */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Title *
                  </label>
                  <input
                    {...register('cardTitle')}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                      errors.cardTitle ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter blog title"
                    required
                  />
                  {errors.cardTitle && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardTitle.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Card Description *
                  </label>
                  <textarea
                    {...register('cardDescription')}
                    rows={4}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                      errors.cardDescription ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Enter blog description"
                    required
                  />
                  {errors.cardDescription && (
                    <p className="text-red-500 text-sm mt-1">{errors.cardDescription.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Blog Content Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Blog Content Information</h3>
            
            {/* Hero Image */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hero Image *
              </label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-400 transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  if (!heroImagePreview) {
                    document.getElementById('hero-image')?.click();
                  }
                }}
              >
                {heroImagePreview ? (
                  <div className="relative">
                    <img
                      src={heroImagePreview}
                      alt="Hero preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroImage(null);
                        setHeroImagePreview(null);
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">Upload hero image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageChange(e, 'hero')}
                      className="hidden"
                      id="hero-image"
                    />
                    <label
                      htmlFor="hero-image"
                      className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 cursor-pointer transition-colors duration-200"
                      onClick={(e) => {
                        e.stopPropagation();
                      }}
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Choose File
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Supported formats: JPG, PNG, GIF, WebP
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Blog Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Title *
                </label>
                <input
                  {...register('blogTitle')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.blogTitle ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter blog title"
                  required
                />
                {errors.blogTitle && (
                  <p className="text-red-500 text-sm mt-1">{errors.blogTitle.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blog Description *
                </label>
                <textarea
                  {...register('blogDescription')}
                  rows={3}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.blogDescription ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Enter blog description"
                  required
                />
                {errors.blogDescription && (
                  <p className="text-red-500 text-sm mt-1">{errors.blogDescription.message}</p>
                )}
              </div>
            </div>

            {/* Paragraphs */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Blog Paragraphs
                </label>
                <button
                  type="button"
                  onClick={() => appendPara({ heading: '', content: '' })}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Paragraph</span>
                </button>
              </div>
              <div className="space-y-4">
                {paraFields.map((field, index) => (
                  <div key={field.id} className="space-y-2 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Paragraph {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removePara(index)}
                        className="px-3 py-1 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      {...register(`paras.${index}.heading`)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        (errors as any)[`paras.${index}.heading`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Paragraph heading"
                    />
                    {(errors as any)[`paras.${index}.heading`] && (
                      <p className="text-red-500 text-sm">{(errors as any)[`paras.${index}.heading`]?.message}</p>
                    )}
                    <textarea
                      {...register(`paras.${index}.content`)}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        (errors as any)[`paras.${index}.content`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Paragraph content"
                    />
                    {(errors as any)[`paras.${index}.content`] && (
                      <p className="text-red-500 text-sm">{(errors as any)[`paras.${index}.content`]?.message}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Point Paragraphs */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  Point Paragraphs
                </label>
                <button
                  type="button"
                  onClick={() => appendPointPara({ heading: '', sentences: '' })}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Point</span>
                </button>
              </div>
              <div className="space-y-4">
                {pointParaFields.map((field, index) => (
                  <div key={field.id} className="space-y-2 p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-700">Point Paragraph {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removePointPara(index)}
                        className="px-3 py-1 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input
                      {...register(`pointParas.${index}.heading`)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        (errors as any)[`pointParas.${index}.heading`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Point paragraph heading"
                    />
                    {(errors as any)[`pointParas.${index}.heading`] && (
                      <p className="text-red-500 text-sm">{(errors as any)[`pointParas.${index}.heading`]?.message}</p>
                    )}
                    <textarea
                      {...register(`pointParas.${index}.sentences`)}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        (errors as any)[`pointParas.${index}.sentences`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter sentences separated by new lines (each line will be treated as a separate sentence)"
                    />
                    {(errors as any)[`pointParas.${index}.sentences`] && (
                      <p className="text-red-500 text-sm">{(errors as any)[`pointParas.${index}.sentences`]?.message}</p>
                    )}
                    <p className="text-xs text-gray-500">Note: Each line will be treated as a separate sentence</p>
                  </div>
                ))}
              </div>
            </div>

            {/* YouTube Links */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-medium text-gray-700">
                  YouTube Links
                </label>
                <button
                  type="button"
                  onClick={() => appendYoutube('')}
                  className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Link</span>
                </button>
              </div>
              <div className="space-y-4">
                {youtubeFields.map((field, index) => (
                  <div key={field.id} className="flex space-x-2">
                    <input
                      {...register(`youtubeLinks.${index}`)}
                      type="url"
                      className={`flex-1 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        (errors as any)[`youtubeLinks.${index}`] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={`YouTube URL ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeYoutube(index)}
                      className="px-3 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
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
              disabled={loading || !isFormReady}
              className="flex items-center bg-[#963f36] space-x-2 px-6 py-3 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>Create Blog</span>
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
