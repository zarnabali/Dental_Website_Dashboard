'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp } from '@/lib/animations';
import { ArrowLeft, Save, Camera, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface TeamPicture {
  _id: string;
  teamName: string;
  description: string;
  picture: {
    public_id: string;
    url: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditTeamPicturePage() {
  const [teamPicture, setTeamPicture] = useState<TeamPicture | null>(null);
  const [formData, setFormData] = useState({
    teamName: '',
    description: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchTeamPicture();
  }, []);

  const fetchTeamPicture = async () => {
    try {
      setFetching(true);
      const response = await api.get('/api/team-pictures');
      if (response.data.success) {
        const data = response.data.data;
        setTeamPicture(data);
        setFormData({
          teamName: data.teamName,
          description: data.description
        });
        setPreviewUrl(data.picture.url);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        toast.error('Team picture not found');
        router.push('/dashboard/team-pictures');
      } else {
        console.error('Error fetching team picture:', error);
        toast.error('Failed to fetch team picture');
        router.push('/dashboard/team-pictures');
      }
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({
          ...prev,
          image: 'Please select a valid image file'
        }));
        return;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({
          ...prev,
          image: 'File size must be less than 10MB'
        }));
        return;
      }

      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors(prev => ({
        ...prev,
        image: ''
      }));
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setPreviewUrl(teamPicture?.picture.url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.teamName.trim()) {
      newErrors.teamName = 'Team name is required';
    } else if (formData.teamName.length > 100) {
      newErrors.teamName = 'Team name must be 100 characters or less';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.length > 500) {
      newErrors.description = 'Description must be 500 characters or less';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Create FormData for file upload
      const formDataToSend = new FormData();
      if (selectedFile) {
        formDataToSend.append('image', selectedFile);
      }
      formDataToSend.append('teamName', formData.teamName);
      formDataToSend.append('description', formData.description);

      const response = await api.put('/api/team-pictures', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        toast.success('Team picture updated successfully');
        router.push('/dashboard/team-pictures');
      }
    } catch (error: any) {
      console.error('Error updating team picture:', error);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Failed to update team picture');
      }
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout title="Edit Team Picture" subtitle="Update team picture">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#963f36] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!teamPicture) {
    return (
      <DashboardLayout title="Edit Team Picture" subtitle="Update team picture">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Team picture not found</h3>
          <p className="text-gray-600 mb-6">The team picture you're looking for doesn't exist</p>
          <button
            onClick={() => router.push('/dashboard/team-pictures')}
            className="btn-surface-contrast inline-flex items-center space-x-2 px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Team Pictures</span>
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Team Picture" subtitle="Update team picture">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="brand-bg text-on-brand rounded-xl p-6 mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Edit Team Picture</h1>
              <p className="text-white/90 mt-1">Update your team picture and details</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Picture
              </label>
              <div className="space-y-4">
                {/* File Input */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#963f36] transition-colors duration-200 cursor-pointer"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    {selectedFile ? 'Change Image' : 'Click to change image'}
                  </p>
                  <p className="text-sm text-gray-500">
                    PNG, JPG, GIF up to 10MB
                  </p>
                </div>

                {/* Preview */}
                {previewUrl && (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    {selectedFile && (
                      <button
                        type="button"
                        onClick={removeFile}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors duration-200"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

                {errors.image && (
                  <p className="text-sm text-red-600">{errors.image}</p>
                )}
              </div>
            </div>

            {/* Team Name */}
            <div>
              <label htmlFor="teamName" className="block text-sm font-medium text-gray-700 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                id="teamName"
                name="teamName"
                value={formData.teamName}
                onChange={handleChange}
                maxLength={100}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#963f36] focus:border-transparent transition-colors duration-200 ${
                  errors.teamName ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter team name (max 100 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.teamName && (
                  <p className="text-sm text-red-600">{errors.teamName}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.teamName.length}/100
                </p>
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={500}
                rows={4}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#963f36] focus:border-transparent transition-colors duration-200 resize-none ${
                  errors.description ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Enter team description (max 500 characters)"
              />
              <div className="flex justify-between items-center mt-1">
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {formData.description.length}/500
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-surface-contrast flex items-center space-x-2 px-6 py-3 rounded-lg disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Save className="w-5 h-5" />
                )}
                <span>{loading ? 'Updating...' : 'Update Team Picture'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Info Card */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <Camera className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-800">Team Picture Guidelines</h3>
              <ul className="mt-2 text-sm text-blue-700 space-y-1">
                <li>• Only one team picture is allowed at a time</li>
                <li>• Team name must be 100 characters or less</li>
                <li>• Description must be 500 characters or less</li>
                <li>• Supported image formats: JPG, PNG, GIF</li>
                <li>• Maximum file size: 10MB</li>
                <li>• Use high-quality images for best results</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
