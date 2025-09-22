'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { useCrud } from '@/hooks/useCrud';
import { fadeInUp, staggerChildren, scaleIn } from '@/lib/animations';
import { Plus, Edit, Trash2, Eye, Stethoscope, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

export default function ServicesPage() {
  const { items: services, loading, fetchItems, deleteItem } = useCrud({
    endpoint: '/api/services',
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
    if (gridRef.current && services.length > 0) {
      staggerChildren(gridRef.current, '.service-card', 0.1);
    }
  }, [services]);

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      setShowDeleteModal(null);
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  return (
    <DashboardLayout title="Services" subtitle="Manage your dental services">
      <div ref={containerRef} className="space-y-6">
        {/* Header */}
        <div className="brand-bg text-on-brand rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Dental Services</h2>
              <p className="text-white/90 mt-1">Manage your clinic's services and treatments</p>
            </div>
            <Link
              href="/dashboard/services/create"
              className="btn-brand-contrast flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-black" />
              <span className="text-black">Add Service</span>
            </Link>
          </div>
        </div>

        {/* Services Grid */}
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-[#963f36] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : services.length === 0 ? (
          <div className="text-center py-12">
            <Stethoscope className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No services found</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first dental service</p>
            <Link
              href="/dashboard/services/create"
              className="btn-surface-contrast inline-flex items-center space-x-2 px-6 py-3 rounded-lg"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white">Add Service</span>
            </Link>
          </div>
        ) : (
          <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <div
                key={service._id}
                className="service-card bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200"
              >
                {/* Service Image */}
                <div className="aspect-w-16 aspect-h-9 bg-gray-100">
                  {service.cardInfo?.image?.url ? (
                    <img
                      src={service.cardInfo.image.url}
                      alt={service.cardInfo.title}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                {/* Service Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {service.cardInfo?.title || 'Untitled Service'}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {service.cardInfo?.description || 'No description available'}
                  </p>

                  {/* Service Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium">Service Blog:</span>
                      <span className="ml-2">{service.serviceBlog?.title || 'No blog title'}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium">Paragraphs:</span>
                      <span className="ml-2">{service.serviceBlog?.paras?.length || 0} sections</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <span className="font-medium">YouTube Links:</span>
                      <span className="ml-2">{service.serviceBlog?.youtubeLinks?.length || 0} videos</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/dashboard/services/${service._id}`}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-[#963f36] bg-[#963f36]/10 rounded-lg hover:bg-[#963f36]/20 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                    <Link
                      href={`/dashboard/services/${service._id}/edit`}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-[#963f36] rounded-lg hover:bg-[#7f352f] transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4 text-white" />
                      <span>Edit</span>
                    </Link>
                    <button
                      onClick={() => setShowDeleteModal(service._id)}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Service</h3>
              <p className="text-gray-600 mb-6">Are you sure you want to delete this service? This action cannot be undone.</p>
              <div className="flex space-x-4">
                <button onClick={() => setShowDeleteModal(null)} className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200">Cancel</button>
                <button onClick={() => handleDelete(showDeleteModal)} className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200">Delete</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

