'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { fadeInUp, slideInLeft, slideInRight } from '@/lib/animations';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import BackendStatus from '@/components/BackendStatus';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { login, loading } = useAuth();

  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) fadeInUp(containerRef.current);
    if (cardRef.current) slideInRight(cardRef.current, 0.2);
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      await login(formData.email, formData.password);
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-50">
        <BackendStatus />
      </div>

      <div ref={containerRef} className="w-full max-w-6xl mx-auto">
        <div className="relative grid lg:grid-cols-2 bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Left side - brand color with subtle pattern */}
          <div className="hidden lg:block relative bg-[#963f36]">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #ffffff 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
            <div className="relative h-full p-12 flex flex-col justify-center text-white space-y-6">
              <h1 className="text-4xl font-regular">Dr. Sami Ullah Clinic</h1>
              <p className="text-white/90 text-lg">Professional dental care management system</p>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3"><span className="w-2 h-2 bg-white/60 rounded-full" /> <span>Manage clinic information</span></li>
                <li className="flex items-center space-x-3"><span className="w-2 h-2 bg-white/60 rounded-full" /> <span>Content management system</span></li>
                <li className="flex items-center space-x-3"><span className="w-2 h-2 bg-white/60 rounded-full" /> <span>Patient feedback tracking</span></li>
              </ul>
            </div>
          </div>

          {/* Right side - login card */}
          <div className="p-8 lg:p-12 bg-[#963f36]">
            <div ref={cardRef} className="max-w-md mx-auto bg-[#ffffff0f] backdrop-blur-sm border border-white/20 rounded-2xl p-8 text-white">
              <div className="mb-8 text-center">
                <h2 className="text-2xl font-regular mb-2">Welcome Back</h2>
                <p className="text-white/90">Sign in to your account</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-white w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-4 py-3 rounded-lg bg-transparent text-white placeholder-white border ${errors.email ? 'border-white' : 'border-white'} focus:ring-2 focus:ring-white/70 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {errors.email && <p className="text-white text-sm mt-1">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-white w-5 h-5" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-10 pr-12 py-3 rounded-lg bg-transparent text-white placeholder-white border ${errors.password ? 'border-white' : 'border-white'} focus:ring-2 focus:ring-white/70 focus:border-transparent transition-all duration-200`}
                      placeholder="Enter your password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-white text-sm mt-1">{errors.password}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-white hover:bg-gray-100 text-black font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span className="text-black">Sign In</span>
                      <ArrowRight className="w-5 h-5 text-black" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

