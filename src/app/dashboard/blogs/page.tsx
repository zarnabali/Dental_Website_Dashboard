'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { Plus, Edit, Trash2, Eye, Calendar, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import toast from 'react-hot-toast';

interface Blog {
  _id: string;
  cardInfo: {
    title: string;
    description: string;
    image: {
      public_id: string;
      url: string;
    };
  };
  blogContent: {
    title: string;
    description: string;
    heroImage: {
      public_id: string;
      url: string;
    };
    paras: Array<{
      heading: string;
      content: string;
    }>;
    pointParas: Array<{
      heading: string;
      sentences: string[];
    }>;
    youtubeLinks: string[];
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/blogs');
      if (response.data.success) {
        setBlogs(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching blogs:', error);
      toast.error('Failed to fetch blogs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        setDeletingId(id);
        const response = await api.delete(`/api/blogs/${id}`);
        if (response.data.success) {
          setBlogs(blogs.filter(blog => blog._id !== id));
          toast.success('Blog deleted successfully');
        }
      } catch (error: any) {
        console.error('Error deleting blog:', error);
        toast.error(error.response?.data?.message || 'Failed to delete blog');
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      const response = await api.put(`/api/blogs/${id}`, {
        isActive: !currentStatus
      });
      if (response.data.success) {
        setBlogs(blogs.map(blog => 
          blog._id === id ? { ...blog, isActive: !currentStatus } : blog
        ));
        toast.success(`Blog ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error: any) {
      console.error('Error updating blog status:', error);
      toast.error('Failed to update blog status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Blogs" subtitle="Manage your blog posts">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-[#963f36] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Blogs" subtitle="Manage your blog posts">
      <div ref={containerRef} className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="brand-bg text-on-brand rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Blog Posts</h1>
              <p className="text-white/90 mt-1">Manage your dental blog content</p>
            </div>
            <button
              onClick={() => router.push('/dashboard/blogs/create')}
              className="btn-brand-contrast flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-black" />
              <span className="text-black">Create Blog</span>
            </button>
          </div>
        </div>

        {/* Blogs Grid */}
        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <Edit className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No blogs yet</h3>
            <p className="text-gray-600 mb-6">Get started by creating your first blog post</p>
            <button
              onClick={() => router.push('/dashboard/blogs/create')}
              className="btn-surface-contrast inline-flex items-center space-x-2 px-4 py-2 rounded-lg"
            >
              <Plus className="w-5 h-5 text-white" />
              <span className="text-white">Create Blog</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div key={blog._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-200">
                {/* Blog Image */}
                <div className="relative h-48 bg-gray-100">
                  <img
                    src={blog.cardInfo.image.url}
                    alt={blog.cardInfo.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 right-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      blog.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {blog.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>

                {/* Blog Content */}
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {blog.cardInfo.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {blog.cardInfo.description}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => router.push(`/dashboard/blogs/${blog._id}`)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => router.push(`/dashboard/blogs/${blog._id}/edit`)}
                      className="flex-1 flex items-center justify-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-[#963f36] rounded-lg hover:bg-[#7f352f] transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4 text-white" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => handleToggleStatus(blog._id, blog.isActive)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                        blog.isActive
                          ? 'text-red-600 bg-red-50 hover:bg-red-100'
                          : 'text-green-600 bg-green-50 hover:bg-green-100'
                      }`}
                    >
                      {blog.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                    <button
                      onClick={() => handleDelete(blog._id)}
                      disabled={deletingId === blog._id}
                      className="px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50"
                    >
                      {deletingId === blog._id ? (
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
