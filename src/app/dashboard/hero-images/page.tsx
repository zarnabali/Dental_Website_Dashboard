'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { useCrud } from '@/hooks/useCrud';
import { fadeInUp, staggerChildren } from '@/lib/animations';
import { Plus, Edit, Trash2, Eye, Image as ImageIcon, Smartphone, Monitor } from 'lucide-react';
import Link from 'next/link';

export default function HeroImagesPage() {
  const { items: heroImages, loading, fetchItems, deleteItem } = useCrud({
    endpoint: '/api/hero-images',
  });
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchItems();
  }, []);

  useEffect(() => {
    if (gridRef.current && heroImages.length > 0) {
      staggerChildren(gridRef.current, '.hero-card', 0.1);
    }
  }, [heroImages]);

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting hero image:', error);
    }
  };

  return (
    <DashboardLayout title="Hero Images" subtitle="Manage hero section images">
      <div ref={containerRef} className="space-y-6">
        {/* Header */}
        <div className="brand-bg text-on-brand rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Hero Images</h2>
              <p className="text-white/90 mt-1">Manage images for web and mobile hero sections</p>
            </div>
            <Link
              href="/dashboard/hero-images/create"
              className="btn-brand-contrast flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-black" />
              <span className="text-black">Add Hero Image</span>
            </Link>
          </div>
        </div>

        {/* Hero Images Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#963f36] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : heroImages.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hero images found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first hero image</p>
            <Link
              href="/dashboard/hero-images/create"
              className="btn-surface-contrast inline-flex items-center space-x-2 px-6 py-3 rounded-lg"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white">Add Hero Image</span>
            </Link>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {heroImages.map((heroImage) => (
              <div
                key={heroImage._id}
                className="hero-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Web Image */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  {heroImage.image?.url ? (
                    <img
                      src={heroImage.image.url}
                      alt={heroImage.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <Monitor className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Mobile Image */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-100 border-t border-gray-200">
                  {heroImage.mobileImage?.url ? (
                    <img
                      src={heroImage.mobileImage.url}
                      alt={`${heroImage.title} - Mobile`}
                      className="w-full h-32 object-cover"
                    />
                  ) : (
                    <div className="w-full h-32 bg-gray-100 flex items-center justify-center">
                      <Smartphone className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {heroImage.title || 'Untitled Hero Image'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {heroImage.description || 'No description available'}
                  </p>

                  {/* Image Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Monitor className="w-4 h-4 mr-2" />
                      <span>Web Image: {heroImage.image?.url ? 'Uploaded' : 'Not uploaded'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <Smartphone className="w-4 h-4 mr-2" />
                      <span>Mobile Image: {heroImage.mobileImage?.url ? 'Uploaded' : 'Not uploaded'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium">Text Color:</span>
                      <span className="ml-2 flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full border border-gray-300 mr-2"
                          style={{ backgroundColor: heroImage.textColor || '#000000' }}
                        ></div>
                        {heroImage.textColor || '#000000'}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/hero-images/${heroImage._id}`}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-[#963f36] bg-[#963f36]/10 rounded-lg hover:bg-[#963f36]/20 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    <Link
                      href={`/dashboard/hero-images/${heroImage._id}/edit`}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-[#963f36] rounded-lg hover:bg-[#7f352f] transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4 text-white" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(heroImage._id)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Hero Image</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this hero image? This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowDeleteModal(null)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteModal)}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}


