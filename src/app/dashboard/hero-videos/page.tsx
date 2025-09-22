'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Save, Edit, Trash2, Upload, X, Video, Play } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const schema = yup.object({
  title: yup.string().required('Title is required').max(100, 'Title must be less than 100 characters'),
  description: yup.string().required('Description is required').max(500, 'Description must be less than 500 characters'),
  textColor: yup.string().required('Text color is required').matches(/^#[0-9A-F]{6}$/i, 'Must be a valid hex color'),
});

type FormData = yup.InferType<typeof schema>;

export default function HeroVideosPage() {
  const [heroVideo, setHeroVideo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
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
    fetchHeroVideo();
  }, []);

  const fetchHeroVideo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/hero-videos');
      if (response.data.success) {
        setHeroVideo(response.data.data);
        if (response.data.data) {
          reset(response.data.data);
        }
      }
    } catch (error: any) {
      console.error('Error fetching hero video:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to fetch hero video');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        toast.error('Please select a valid video file');
        return;
      }
      if (file.size > 100 * 1024 * 1024) {
        toast.error('Video size should be less than 100MB');
        return;
      }
      setVideoFile(file);
      const reader = new FileReader();
      reader.onload = () => setVideoPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    if (!videoFile && !heroVideo) {
      toast.error('Please upload a video file');
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      if (videoFile) formData.append('video', videoFile);
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('textColor', data.textColor);

      let response;
      if (heroVideo) {
        if (!videoFile) {
          toast.error('Please select a new video file for update');
          return;
        }
        response = await api.put('/api/hero-videos/update', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        response = await api.post('/api/hero-videos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }

      if (response.data.success) {
        setHeroVideo(response.data.data);
        setIsEditing(false);
        setVideoFile(null);
        setVideoPreview(null);
        toast.success(heroVideo ? 'Hero video updated successfully' : 'Hero video created successfully');
      }
    } catch (error: any) {
      console.error('Error saving hero video:', error);
      toast.error(error.response?.data?.message || 'Failed to save hero video');
    } finally {
      setLoading(false);
    }
  };

  if (loading && !heroVideo) {
    return (
      <DashboardLayout title="Hero Video" subtitle="Manage your hero video">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#963f36] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Hero Video" subtitle="Manage your hero video (only one allowed)">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="brand-bg text-on-brand rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold">Hero Video</h3>
              <p className="text-white/90 mt-1">Add or update your hero video</p>
            </div>
            {heroVideo && !isEditing && (
              <div className="flex space-x-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="btn-brand-contrast px-4 py-2 rounded-lg"
                >
                  Edit
                </button>
                <button
                  onClick={async () => {
                    if (!window.confirm('Are you sure you want to delete the hero video?')) return;
                    try {
                      setLoading(true);
                      const response = await api.delete('/api/hero-videos');
                      if (response.data.success) {
                        setHeroVideo(null);
                        reset();
                        toast.success('Hero video deleted successfully');
                      }
                    } catch (error: any) {
                      console.error('Error deleting hero video:', error);
                      toast.error(error.response?.data?.message || 'Failed to delete hero video');
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-4 py-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            {/* Video Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video File *</label>
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#963f36] transition-colors duration-200 cursor-pointer"
                onClick={() => {
                  if (!videoPreview && !heroVideo?.video?.url) {
                    document.getElementById('video-upload')?.click();
                  }
                }}
              >
                {videoPreview || heroVideo?.video?.url ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <video src={videoPreview || heroVideo?.video?.url} controls className="w-full max-w-md mx-auto rounded-lg" />
                      {(videoFile || (isEditing && heroVideo)) && (
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setVideoFile(null); setVideoPreview(null); }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {isEditing && (
                      <div className="border-t pt-4">
                        <p className="text-sm text-gray-600 mb-2">Replace video</p>
                        <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" id="video-upload" />
                        <label htmlFor="video-upload" className="btn-surface-contrast inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200" onClick={(e) => e.stopPropagation()}>
                          <Upload className="w-4 h-4 mr-2 text-white" />
                          <span className="text-white">Choose New Video</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Supported formats: MP4, MOV, AVI, WebM, MKV</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600 mb-2">Upload hero video</p>
                    <input type="file" accept="video/*" onChange={handleVideoChange} className="hidden" id="video-upload" />
                    <label htmlFor="video-upload" className="btn-surface-contrast inline-flex items-center px-4 py-2 rounded-lg cursor-pointer transition-colors duration-200" onClick={(e) => e.stopPropagation()}>
                      <Upload className="w-4 h-4 mr-2 text-white" />
                      <span className="text-white">Choose Video</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-2">Supported formats: MP4, MOV, AVI, WebM, MKV</p>
                  </div>
                )}
              </div>
            </div>

            {/* Video Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input {...register('title')} disabled={!isEditing && heroVideo} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#963f36] focus:border-transparent transition-all duration-200 ${errors.title ? 'border-red-500' : 'border-gray-300'} ${!isEditing && heroVideo ? 'bg-gray-50' : ''}`} placeholder="Enter video title" />
                {errors.title && (<p className="text-red-500 text-sm mt-1">{errors.title.message}</p>)}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Text Color *</label>
                <input {...register('textColor')} disabled={!isEditing && heroVideo} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#963f36] focus:border-transparent transition-all duration-200 ${errors.textColor ? 'border-red-500' : 'border-gray-300'} ${!isEditing && heroVideo ? 'bg-gray-50' : ''}`} placeholder="#ffffff" />
                {errors.textColor && (<p className="text-red-500 text-sm mt-1">{errors.textColor.message}</p>)}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
              <textarea {...register('description')} disabled={!isEditing && heroVideo} rows={4} className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#963f36] focus:border-transparent transition-all duration-200 ${errors.description ? 'border-red-500' : 'border-gray-300'} ${!isEditing && heroVideo ? 'bg-gray-50' : ''}`} placeholder="Enter video description" />
              {errors.description && (<p className="text-red-500 text-sm mt-1">{errors.description.message}</p>)}
            </div>

            {/* Actions */}
            {(!heroVideo || isEditing) && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                {isEditing && (
                  <button type="button" onClick={() => { setIsEditing(false); reset(heroVideo); setVideoFile(null); setVideoPreview(null); }} className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">Cancel</button>
                )}
                <button type="submit" disabled={loading} className="btn-surface-contrast flex items-center space-x-2 px-6 py-3 text-sm font-medium rounded-lg disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (<div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>) : (<Save className="w-4 h-4 text-white" />)}
                  <span className="text-white">{heroVideo ? 'Update' : 'Create'} Hero Video</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}


