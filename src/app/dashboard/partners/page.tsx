'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { Plus, Edit, Trash2, Handshake, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Partner {
  _id: string;
  partnerName: string;
  image: {
    public_id: string;
    url: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/partners');
      if (response.data.success) {
        setPartners(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching partners:', error);
      toast.error('Failed to fetch partners');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this partner?')) {
      try {
        setDeletingId(id);
        const response = await api.delete(`/api/partners/${id}`);
        if (response.data.success) {
          setPartners(partners.filter(partner => partner._id !== id));
          toast.success('Partner deleted successfully');
        }
      } catch (error: any) {
        console.error('Error deleting partner:', error);
        toast.error(error.response?.data?.message || 'Failed to delete partner');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await api.put(`/api/partners/${id}`, {
        isActive: !currentStatus
      });
      if (response.data.success) {
        setPartners(partners.map(partner => 
          partner._id === id ? { ...partner, isActive: !currentStatus } : partner
        ));
        toast.success(`Partner ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error: any) {
      console.error('Error updating partner status:', error);
      toast.error('Failed to update partner status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Partners" subtitle="Manage your business partners">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#963f36] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Partners" subtitle="Manage your business partners">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="brand-bg text-on-brand rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Business Partners</h1>
              <p className="text-white/90 mt-1">Manage your business partners and sponsors</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/partners/create')}
              className="btn-brand-contrast flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-black" />
              <span className="text-black">Add Partner</span>
            </button>
          </div>
        </div>

        {/* Partners Grid */}
        {partners.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Handshake className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No partners yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first business partner</p>
            <button
              onClick={() => router.push('/dashboard/partners/create')}
              className="btn-surface-contrast inline-flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white">Add Partner</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <div key={partner._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Partner Logo */}
                <div className="relative h-32 bg-gray-100 flex items-center justify-center">
                  <img
                    src={partner.image.url}
                    alt={partner.partnerName}
                    className="max-w-full max-h-full object-contain p-4"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      partner.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {partner.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Partner Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {partner.partnerName}
                  </h3>

                  {/* Partner Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(partner.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleToggleStatus(partner._id, partner.isActive)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        partner.isActive
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {partner.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(partner._id)}
                      disabled={deletingId === partner._id}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                    >
                      {deletingId === partner._id ? (
                        <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
