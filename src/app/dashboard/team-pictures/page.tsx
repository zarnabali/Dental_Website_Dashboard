'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp } from '@/lib/animations';
import { Plus, Edit, Trash2, Camera, Calendar, Upload } from 'lucide-react';
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

export default function TeamPicturesPage() {
  const [teamPicture, setTeamPicture] = useState<TeamPicture | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchTeamPicture();
  }, []);

  const fetchTeamPicture = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/team-pictures');
      if (response.data.success) {
        setTeamPicture(response.data.data);
      }
    } catch (error: any) {
      if (error.response?.status === 404) {
        // No team picture exists yet
        setTeamPicture(null);
      } else {
        console.error('Error fetching team picture:', error);
        toast.error('Failed to fetch team picture');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete the team picture? This action cannot be undone.')) {
      try {
        setDeleting(true);
        const response = await api.delete('/api/team-pictures');
        if (response.data.success) {
          setTeamPicture(null);
          toast.success('Team picture deleted successfully');
        }
      } catch (error: any) {
        console.error('Error deleting team picture:', error);
        toast.error(error.response?.data?.message || 'Failed to delete team picture');
      } finally {
        setDeleting(false);
      }
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Team Pictures" subtitle="Manage team picture">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#963f36] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Team Pictures" subtitle="Manage team picture">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="brand-bg text-on-brand rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Team Picture</h1>
              <p className="text-white/90 mt-1">Manage your team picture (Only one picture allowed)</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/team-pictures/create')}
              className="btn-brand-contrast flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5" />
              <span>{teamPicture ? 'Update Picture' : 'Add Picture'}</span>
            </button>
          </div>
        </div>

        {/* Team Picture Display */}
        {!teamPicture ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Camera className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team picture yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your team picture</p>
            <button
              onClick={() => router.push('/dashboard/team-pictures/create')}
              className="btn-surface-contrast inline-flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Upload className="w-5 h-5 text-white" />
              <span className="text-white">Add Team Picture</span>
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Image */}
              <div className="lg:w-1/3">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={teamPicture.picture.url}
                    alt={teamPicture.teamName}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Content */}
              <div className="lg:w-2/3">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{teamPicture.teamName}</h3>
                    <p className="text-gray-600 text-lg leading-relaxed">{teamPicture.description}</p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    teamPicture.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {teamPicture.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                {/* Metadata */}
                <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created: {new Date(teamPicture.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Updated: {new Date(teamPicture.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => router.push('/dashboard/team-pictures/edit')}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-[#963f36] bg-[#963f36]/10 rounded-lg hover:bg-[#963f36]/20 transition-colors duration-200"
                  >
                    <Edit className="w-4 h-4" />
                    <span>Edit Picture</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                  >
                    {deleting ? (
                      <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>{deleting ? 'Deleting...' : 'Delete Picture'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
