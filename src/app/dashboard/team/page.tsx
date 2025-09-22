'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { Plus, Edit, Trash2, User, Calendar } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface TeamMember {
  _id: string;
  name: string;
  designation: string;
  speciality: string;
  image: {
    public_id: string;
    url: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function TeamPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/team');
      if (response.data.success) {
        setTeamMembers(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching team members:', error);
      toast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        setDeletingId(id);
        const response = await api.delete(`/api/team/${id}`);
        if (response.data.success) {
          setTeamMembers(teamMembers.filter(member => member._id !== id));
          toast.success('Team member deleted successfully');
        }
      } catch (error: any) {
        console.error('Error deleting team member:', error);
        toast.error(error.response?.data?.message || 'Failed to delete team member');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await api.put(`/api/team/${id}`, {
        isActive: !currentStatus
      });
      if (response.data.success) {
        setTeamMembers(teamMembers.map(member => 
          member._id === id ? { ...member, isActive: !currentStatus } : member
        ));
        toast.success(`Team member ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error: any) {
      console.error('Error updating team member status:', error);
      toast.error('Failed to update team member status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Team" subtitle="Manage your team members">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#963f36] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Team" subtitle="Manage your team members">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="brand-bg text-on-brand rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Team Members</h1>
              <p className="text-white/90 mt-1">Manage your dental team</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/team/create')}
              className="btn-brand-contrast flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-black" />
              <span className="text-black">Add Member</span>
            </button>
          </div>
        </div>

        {/* Team Grid */}
        {teamMembers.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <User className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No team members yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first team member</p>
            <button
              onClick={() => router.push('/dashboard/team/create')}
              className="btn-surface-contrast inline-flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white">Add Member</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {teamMembers.map((member) => (
              <div key={member._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Member Image */}
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={member.image.url}
                    alt={member.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Member Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{member.name}</h3>
                  <p className="text-[#963f36] font-medium text-sm mb-2">{member.designation}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{member.speciality}</p>

                  {/* Member Stats */}
                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(member.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard/team/${member._id}/edit`)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-[#963f36] bg-[#963f36]/10 rounded-lg hover:bg-[#963f36]/20 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(member._id, member.isActive)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        member.isActive
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {member.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(member._id)}
                      disabled={deletingId === member._id}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                    >
                      {deletingId === member._id ? (
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
