'use client';

import React, { useEffect, useRef, useState, use } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp } from '@/lib/animations';
import { ArrowLeft, Edit, Trash2, Image as ImageIcon, Smartphone, Monitor, Calendar, Palette } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeroImage {
  _id: string;
  image: {
    public_id: string;
    url: string;
  };
  mobileImage: {
    public_id: string;
    url: string;
  };
  title: string;
  description: string;
  textColor: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function ViewHeroImagePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [heroImage, setHeroImage] = useState<HeroImage | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchHeroImage();
  }, [resolvedParams.id]);

  const fetchHeroImage = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/hero-images/${resolvedParams.id}`);
      if (response.data.success) {
        setHeroImage(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching hero image:', error);
      toast.error('Failed to fetch hero image');
      router.push('/dashboard/hero-images');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!heroImage) return;
    
    try {
      setDeleting(true);
      const response = await api.delete(`/api/hero-images/${heroImage._id}`);
      if (response.data.success) {
        toast.success('Hero image deleted successfully');
        router.push('/dashboard/hero-images');
      }
    } catch (error: any) {
      console.error('Error deleting hero image:', error);
      toast.error('Failed to delete hero image');
    } finally {
      setDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Hero Image" subtitle="View hero image details">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!heroImage) {
    return (
      <DashboardLayout title="Hero Image" subtitle="Hero image not found">
        <div className="text-center py-12">
          <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Hero image not found</h3>
          <p className="text-gray-600 mb-6">The hero image you're looking for doesn't exist.</p>
          <Link
            href="/dashboard/hero-images"
            className="inline-flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Hero Images</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Hero Image" subtitle="View hero image details">
      <div ref={containerRef} className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link
            href="/dashboard/hero-images"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Hero Images</span>
          </Link>
          <div className="flex space-x-3">
            <Link
              href={`/dashboard/hero-images/${heroImage._id}/edit`}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Link>
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Hero Image Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{heroImage.title}</h2>
            <p className="text-gray-600">{heroImage.description}</p>
          </div>

          <div className="p-6">
            {/* Images Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Web Image */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Monitor className="w-4 h-4" />
                  <span>Web Image</span>
                </div>
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={heroImage.image.url}
                    alt={heroImage.title}
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>

              {/* Mobile Image */}
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                  <Smartphone className="w-4 h-4" />
                  <span>Mobile Image</span>
                </div>
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 rounded-lg overflow-hidden">
                  <img
                    src={heroImage.mobileImage.url}
                    alt={`${heroImage.title} - Mobile`}
                    className="w-full h-64 object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Image Properties */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Text Color</h3>
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-lg border border-gray-300"
                    style={{ backgroundColor: heroImage.textColor }}
                  ></div>
                  <span className="text-sm text-gray-600 font-mono">{heroImage.textColor}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Status</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  heroImage.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {heroImage.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700">Created</h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(heroImage.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Hero Image</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this hero image? This action cannot be undone and will permanently remove both web and mobile images.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto"></div>
                  ) : (
                    'Delete'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
