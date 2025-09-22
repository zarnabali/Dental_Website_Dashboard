'use client';

import React, { useEffect, useRef } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { 
  Users, 
  FileText, 
  Stethoscope, 
  MessageSquare,
  TrendingUp,
  Activity
} from 'lucide-react';
import { fadeInUp, staggerChildren } from '@/lib/animations';

const stats = [
  {
    title: 'Total Services',
    value: '12',
    change: '+2 this month',
    icon: Stethoscope,
    color: 'bg-blue-500',
  },
  {
    title: 'Blog Posts',
    value: '8',
    change: '+1 this week',
    icon: FileText,
    color: 'bg-green-500',
  },
  {
    title: 'Team Members',
    value: '5',
    change: 'No change',
    icon: Users,
    color: 'bg-purple-500',
  },
  {
    title: 'Customer Feedback',
    value: '24',
    change: '+5 this month',
    icon: MessageSquare,
    color: 'bg-orange-500',
  },
];

const recentActivities = [
  {
    id: 1,
    type: 'service',
    title: 'New service added',
    description: 'Dental Implants service was created',
    time: '2 hours ago',
    icon: Stethoscope,
  },
  {
    id: 2,
    type: 'blog',
    title: 'Blog post published',
    description: 'Oral hygiene tips for better dental health',
    time: '4 hours ago',
    icon: FileText,
  },
  {
    id: 3,
    type: 'feedback',
    title: 'New customer feedback',
    description: '5-star rating received from Sarah Johnson',
    time: '6 hours ago',
    icon: MessageSquare,
  },
  {
    id: 4,
    type: 'team',
    title: 'Team member updated',
    description: 'Dr. Ahmed\'s profile was updated',
    time: '1 day ago',
    icon: Users,
  },
];

export default function DashboardPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const activitiesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    if (statsRef.current) {
      staggerChildren(statsRef.current, '.stat-card', 0.1);
    }
    if (activitiesRef.current) {
      staggerChildren(activitiesRef.current, '.activity-item', 0.1);
    }
  }, []);

  return (
    <DashboardLayout title="Dashboard" subtitle="Welcome to Dr. Sami Ullah Clinic Management">
      <div ref={containerRef} className="space-y-6">
        {/* Brand Header Strip */}
        <div className="brand-bg text-on-brand rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Overview</h2>
              <p className="text-white/90">Quick insights at a glance</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="btn-brand-contrast px-4 py-2 rounded-lg">New Service</button>
              <button className="btn-brand-contrast px-4 py-2 rounded-lg">Create Blog</button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className="stat-card bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{stat.title}</p>
                    <p className="text-3xl font-bold text-black mt-2">{stat.value}</p>
                    <p className="text-sm text-gray-600 mt-1">{stat.change}</p>
                  </div>
                  <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activities */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-[#963f36]" />
                  <h3 className="text-lg font-semibold text-black">Recent Activities</h3>
                </div>
              </div>
              <div ref={activitiesRef} className="p-6 space-y-4">
                {recentActivities.map((activity) => {
                  const Icon = activity.icon;
                  return (
                    <div
                      key={activity.id}
                      className="activity-item flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      <div className="w-10 h-10 bg-[#963f36]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#963f36]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black">{activity.title}</p>
                        <p className="text-sm text-gray-700 mt-1">{activity.description}</p>
                        <p className="text-xs text-gray-600 mt-2">{activity.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hero Images</span>
                  <span className="text-sm font-medium text-black">3</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hero Videos</span>
                  <span className="text-sm font-medium text-black">1</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Partners</span>
                  <span className="text-sm font-medium text-black">6</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">FAQs</span>
                  <span className="text-sm font-medium text-black">12</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-black mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
                  <Stethoscope className="w-5 h-5 text-[#963f36]" />
                  <span className="text-sm font-medium text-black">Add New Service</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
                  <FileText className="w-5 h-5 text-[#963f36]" />
                  <span className="text-sm font-medium text-black">Create Blog Post</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
                  <Users className="w-5 h-5 text-[#963f36]" />
                  <span className="text-sm font-medium text-black">Add Team Member</span>
                </button>
                <button className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center space-x-3">
                  <MessageSquare className="w-5 h-5 text-[#963f36]" />
                  <span className="text-sm font-medium text-black">View Feedback</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Test Section */}
        
      </div>
    </DashboardLayout>
  );
}

