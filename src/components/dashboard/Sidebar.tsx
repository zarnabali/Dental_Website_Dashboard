'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  Info, 
  Image, 
  Video, 
  Stethoscope, 
  FileText, 
  Users, 
  Handshake, 
  HelpCircle, 
  MessageSquare,
  Settings,
  LogOut,
  Star,
  Camera
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { fadeInUp, slideInLeft } from '@/lib/animations';

const sidebarItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Clinic Info', href: '/dashboard/clinic-info', icon: Info },
  { name: 'Hero Images', href: '/dashboard/hero-images', icon: Image },
  { name: 'Hero Videos', href: '/dashboard/hero-videos', icon: Video },
  { name: 'Services', href: '/dashboard/services', icon: Stethoscope },
  { name: 'Blogs', href: '/dashboard/blogs', icon: FileText },
  { name: 'Team', href: '/dashboard/team', icon: Users },
  { name: 'Team Pictures', href: '/dashboard/team-pictures', icon: Camera },
  { name: 'Features', href: '/dashboard/features', icon: Star },
  { name: 'Partners', href: '/dashboard/partners', icon: Handshake },
  { name: 'FAQs', href: '/dashboard/faqs', icon: HelpCircle },
  { name: 'Feedback', href: '/dashboard/feedback', icon: MessageSquare },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (sidebarRef.current) {
      slideInLeft(sidebarRef.current);
    }
  }, []);

  return (
    <div ref={sidebarRef} className="w-64 bg-white shadow-lg h-full flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-regular text-black">Dr. Sami Ullah</h1>
            <p className="text-sm text-gray-600">Dental Clinic</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-black'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? 'text-primary-600' : 'text-gray-400 group-hover:text-gray-600'
                }`} 
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
            {user?.avatar ? (
              <img 
                src={user.avatar.url} 
                alt={user.username} 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <span className="text-primary-600 font-semibold text-sm">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-black truncate">
              {user?.username}
            </p>
            <p className="text-xs text-gray-600 truncate">
              {user?.email}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <button className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-colors duration-200">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
          
          <button 
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}

