'use client';

import React, { useEffect, useRef, useState } from 'react';
import { use } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { ArrowLeft, Edit, Trash2, Calendar, Eye, EyeOff, ExternalLink } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Service {
  _id: string;
  cardInfo: {
    title: string;
    description: string;
    image: any;
  };
  serviceBlog: {
    title: string;
    description: string;
    heroImage: any;
    paras?: { heading: string; content: string }[];
    pointParas?: { heading: string; sentences: string[] }[];
    youtubeLinks?: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ViewServicePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchService();
  }, []);

  const fetchService = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/services/${resolvedParams.id}`);
      if (response.data.success) {
        setService(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching service:', error);
      toast.error('Failed to fetch service data');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this service? This action cannot be undone.')) {
      try {
        setDeleting(true);
        const response = await api.delete(`/api/services/${resolvedParams.id}`);
        if (response.data.success) {
          toast.success('Service deleted successfully');
          router.push('/dashboard/services');
        }
      } catch (error: any) {
        console.error('Error deleting service:', error);
        toast.error(error.response?.data?.message || 'Failed to delete service');
      } finally {
        setDeleting(false);
      }
    }
  };

  const handleToggleStatus = async () => {
    if (!service) return;
    
    try {
      const response = await api.put(`/api/services/${resolvedParams.id}`, {
        isActive: !service.isActive
      });
      if (response.data.success) {
        setService({ ...service, isActive: !service.isActive });
        toast.success(`Service ${!service.isActive ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error: any) {
      console.error('Error updating service status:', error);
      toast.error('Failed to update service status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Service Details" subtitle="View service information">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (!service) {
    return (
      <DashboardLayout title="Service Details" subtitle="View service information">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900 mb-2">Service not found</h3>
          <p className="text-gray-600 mb-6">The service you're looking for doesn't exist or has been deleted.</p>
          <button
            onClick={() => router.push('/dashboard/services')}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Services</span>
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Service Details" subtitle="View service information">
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
              <h1 className="text-2xl font-bold text-gray-900">{service.serviceBlog.title}</h1>
              <p className="text-gray-600 mt-1">Service Details</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => router.push(`/dashboard/services/${resolvedParams.id}/edit`)}
              className="flex items-center space-x-2 px-4 py-2 text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
            >
              <Edit className="w-5 h-5" />
              <span>Edit</span>
            </button>
            <button
              onClick={handleToggleStatus}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors duration-200 ${
                service.isActive
                  ? 'text-red-600 bg-red-50 hover:bg-red-100'
                  : 'text-green-600 bg-green-50 hover:bg-green-100'
              }`}
            >
              {service.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              <span>{service.isActive ? 'Deactivate' : 'Activate'}</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
            >
              {deleting ? (
                <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Trash2 className="w-5 h-5" />
              )}
              <span>Delete</span>
            </button>
          </div>
        </div>

        <div className="space-y-8">
          {/* Status Badge */}
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 text-sm font-medium rounded-full ${
              service.isActive 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {service.isActive ? 'Active' : 'Inactive'}
            </span>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>Created: {new Date(service.createdAt).toLocaleDateString()}</span>
              <span>•</span>
              <span>Updated: {new Date(service.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Card Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Card Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Title</h3>
                  <p className="text-gray-900">{service.cardInfo.title}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                  <p className="text-gray-600">{service.cardInfo.description}</p>
                </div>
              </div>
              
              {service.cardInfo.image && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Card Image</h3>
                  <img
                    src={service.cardInfo.image?.url || service.cardInfo.image}
                    alt="Card preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Service Content */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Service Content</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Title</h3>
                <p className="text-gray-900 text-lg">{service.serviceBlog.title}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
                <p className="text-gray-600 whitespace-pre-wrap">{service.serviceBlog.description}</p>
              </div>
              
              {service.serviceBlog.heroImage && (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Hero Image</h3>
                  <img
                    src={service.serviceBlog.heroImage?.url || service.serviceBlog.heroImage}
                    alt="Hero image"
                    className="w-full h-64 object-cover rounded-lg border border-gray-200"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Paragraphs */}
          {service.serviceBlog.paras && service.serviceBlog.paras.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Paragraphs</h2>
              <div className="space-y-4">
                {service.serviceBlog.paras.map((para, index) => (
                  <div key={index} className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-800">{para.heading}</h4>
                    <p className="text-gray-600 whitespace-pre-wrap">{para.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Point Paragraphs */}
          {service.serviceBlog.pointParas && service.serviceBlog.pointParas.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Point Paragraphs</h2>
              <div className="space-y-4">
                {service.serviceBlog.pointParas.map((point, index) => (
                  <div key={index} className="space-y-1">
                    <h4 className="text-sm font-medium text-gray-800">{point.heading}</h4>
                    <ul className="list-disc pl-5 text-gray-600">
                      {point.sentences?.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* YouTube Links */}
          {service.serviceBlog.youtubeLinks && service.serviceBlog.youtubeLinks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">YouTube Links</h2>
              <div className="space-y-3">
                {service.serviceBlog.youtubeLinks.map((link, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">#{index + 1}</span>
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors duration-200"
                    >
                      <span className="truncate">{link}</span>
                      <ExternalLink className="w-4 h-4 flex-shrink-0" />
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
