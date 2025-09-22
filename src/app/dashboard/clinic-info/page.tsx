'use client';

import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '@/components/dashboard/Layout';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { fadeInUp, scaleIn } from '@/lib/animations';
import { Save, Edit, Trash2, MapPin, Phone, Mail, Facebook, Instagram } from 'lucide-react';
import api from '@/lib/api';
import toast from 'react-hot-toast';

const createSchema = yup.object({
  name: yup.string().required('Name is required').max(200, 'Name must be less than 200 characters'),
  noOfExperience: yup.number().required('Experience is required').min(0, 'Experience must be positive'),
  noOfPatients: yup.number().required('Patients count is required').min(0, 'Patients count must be positive'),
  phoneNumber: yup.string().required('Phone number is required'),
  'location1.url': yup.string().required('Location 1 URL is required').url('Must be a valid URL'),
  'location1.description': yup.string().required('Location 1 description is required').max(500, 'Description must be less than 500 characters'),
  'location2.url': yup.string().required('Location 2 URL is required').url('Must be a valid URL'),
  'location2.description': yup.string().required('Location 2 description is required').max(500, 'Description must be less than 500 characters'),
  'socialLinks.facebook': yup.string().url('Must be a valid URL').optional(),
  'socialLinks.instagram': yup.string().url('Must be a valid URL').optional(),
  email: yup.string().required('Email is required').email('Must be a valid email'),
});

const updateSchema = yup.object({
  name: yup.string().max(200, 'Name must be less than 200 characters'),
  noOfExperience: yup.number().min(0, 'Experience must be positive'),
  noOfPatients: yup.number().min(0, 'Patients count must be positive'),
  phoneNumber: yup.string(),
  'location1.url': yup.string().url('Must be a valid URL'),
  'location1.description': yup.string().max(500, 'Description must be less than 500 characters'),
  'location2.url': yup.string().url('Must be a valid URL'),
  'location2.description': yup.string().max(500, 'Description must be less than 500 characters'),
  'socialLinks.facebook': yup.string().url('Must be a valid URL').optional(),
  'socialLinks.instagram': yup.string().url('Must be a valid URL').optional(),
  email: yup.string().email('Must be a valid email'),
});

type FormData = yup.InferType<typeof updateSchema>;

export default function ClinicInfoPage() {
  const [clinicInfo, setClinicInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(updateSchema),
  });

  // Watch form values for debugging
  const watchedValues = watch();

  useEffect(() => {
    if (containerRef.current) {
      fadeInUp(containerRef.current);
    }
    fetchClinicInfo();
  }, []);

  // Debug form values
  useEffect(() => {
    console.log('Current form values:', watchedValues);
  }, [watchedValues]);

  const fetchClinicInfo = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/clinic-info');
      if (response.data.success) {
        setClinicInfo(response.data.data);
        if (response.data.data) {
          console.log('Resetting form with data:', response.data.data);
          reset(response.data.data);
        }
      }
    } catch (error: any) {
      console.error('Error fetching clinic info:', error);
      
      // Only show error for non-404 errors (404 means no clinic info exists yet)
      if (error.response?.status !== 404) {
        let errorMessage = 'Failed to fetch clinic info';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.isNetworkError) {
          errorMessage = 'Unable to connect to server. Please make sure the backend is running.';
        }
        
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: any) => {
    try {
      setLoading(true);
      console.log('Form submitted with data:', data);
      let response;
      
      // Validate data against appropriate schema
      if (!clinicInfo) {
        // Creating new - validate against create schema
        await createSchema.validate(data, { abortEarly: false });
      }
      
      if (clinicInfo) {
        // Update existing - only send changed fields
        const updateData: any = {};
        
        // Only include fields that have changed
        if (data.name && data.name !== clinicInfo.name) updateData.name = data.name;
        if (data.noOfExperience !== undefined && data.noOfExperience !== clinicInfo.noOfExperience) updateData.noOfExperience = data.noOfExperience;
        if (data.noOfPatients !== undefined && data.noOfPatients !== clinicInfo.noOfPatients) updateData.noOfPatients = data.noOfPatients;
        if (data.phoneNumber && data.phoneNumber !== clinicInfo.phoneNumber) updateData.phoneNumber = data.phoneNumber;
        if (data.email && data.email !== clinicInfo.email) updateData.email = data.email;
        
        // Location 1 fields - check if any location1 field has changed
        console.log('Location 1 comparison:', {
          formData: {
            url: data['location1.url'],
            description: data['location1.description']
          },
          existingData: {
            url: clinicInfo.location1?.url,
            description: clinicInfo.location1?.description
          }
        });
        
        const location1UrlChanged = data['location1.url'] !== undefined && data['location1.url'] !== clinicInfo.location1?.url;
        const location1DescChanged = data['location1.description'] !== undefined && data['location1.description'] !== clinicInfo.location1?.description;
        const location1Changed = location1UrlChanged || location1DescChanged;
        
        if (location1Changed) {
          updateData.location1 = {
            url: data['location1.url'] !== undefined ? data['location1.url'] : clinicInfo.location1?.url,
            description: data['location1.description'] !== undefined ? data['location1.description'] : clinicInfo.location1?.description
          };
          console.log('Location 1 will be updated:', updateData.location1);
        }
        
        // Location 2 fields - check if any location2 field has changed
        console.log('Location 2 comparison:', {
          formData: {
            url: data['location2.url'],
            description: data['location2.description']
          },
          existingData: {
            url: clinicInfo.location2?.url,
            description: clinicInfo.location2?.description
          }
        });
        
        const location2UrlChanged = data['location2.url'] !== undefined && data['location2.url'] !== clinicInfo.location2?.url;
        const location2DescChanged = data['location2.description'] !== undefined && data['location2.description'] !== clinicInfo.location2?.description;
        const location2Changed = location2UrlChanged || location2DescChanged;
        
        if (location2Changed) {
          updateData.location2 = {
            url: data['location2.url'] !== undefined ? data['location2.url'] : clinicInfo.location2?.url,
            description: data['location2.description'] !== undefined ? data['location2.description'] : clinicInfo.location2?.description
          };
          console.log('Location 2 will be updated:', updateData.location2);
        }
        
        // Social links
        if (data['socialLinks.facebook'] !== undefined && data['socialLinks.facebook'] !== clinicInfo.socialLinks?.facebook) {
          updateData.socialLinks = {
            ...clinicInfo.socialLinks,
            facebook: data['socialLinks.facebook']
          };
        }
        if (data['socialLinks.instagram'] !== undefined && data['socialLinks.instagram'] !== clinicInfo.socialLinks?.instagram) {
          updateData.socialLinks = {
            ...clinicInfo.socialLinks,
            instagram: data['socialLinks.instagram']
          };
        }
        
        // Check if there are any changes
        console.log('Final updateData:', updateData);
        console.log('Number of changes:', Object.keys(updateData).length);
        
        if (Object.keys(updateData).length === 0) {
          toast.success('No changes detected');
          setIsEditing(false);
          return;
        }
        
        response = await api.put('/api/clinic-info/update', updateData);
      } else {
        // Create new - require all fields
        const createData = {
          name: data.name,
          noOfExperience: data.noOfExperience,
          noOfPatients: data.noOfPatients,
          phoneNumber: data.phoneNumber,
          email: data.email,
          location1: {
            url: data['location1.url'],
            description: data['location1.description']
          },
          location2: {
            url: data['location2.url'],
            description: data['location2.description']
          },
          socialLinks: {
            facebook: data['socialLinks.facebook'] || '',
            instagram: data['socialLinks.instagram'] || ''
          }
        };
        
        response = await api.post('/api/clinic-info', createData);
      }

      if (response.data.success) {
        setClinicInfo(response.data.data);
        setIsEditing(false);
        toast.success(clinicInfo ? 'Clinic info updated successfully' : 'Clinic info created successfully');
      }
    } catch (error: any) {
      console.error('Error saving clinic info:', error);
      
      // More detailed error handling
      let errorMessage = 'Failed to save clinic info';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = error.response.data.errors.map((err: any) => err.msg).join(', ');
        errorMessage = `Validation error: ${validationErrors}`;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.isNetworkError) {
        errorMessage = 'Unable to connect to server. Please make sure the backend is running.';
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!clinicInfo) return;
    
    if (window.confirm('Are you sure you want to delete the clinic info?')) {
      try {
        setLoading(true);
        const response = await api.delete('/api/clinic-info');
        if (response.data.success) {
          setClinicInfo(null);
          reset();
          toast.success('Clinic info deleted successfully');
        }
      } catch (error: any) {
        console.error('Error deleting clinic info:', error);
        
        let errorMessage = 'Failed to delete clinic info';
        
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        } else if (error.isNetworkError) {
          errorMessage = 'Unable to connect to server. Please make sure the backend is running.';
        }
        
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && !clinicInfo) {
    return (
      <DashboardLayout title="Clinic Information" subtitle="Manage your clinic details">
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Clinic Information" subtitle="Manage your clinic details">
      <div ref={containerRef} className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-black">Clinic Details</h3>
                <p className="text-sm text-gray-700 mt-1">
                  {clinicInfo ? 'Update your clinic information' : 'Add your clinic information'}
                </p>
              </div>
              <div className="flex space-x-3">
                {clinicInfo && !isEditing && (
                  <>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Clinic Name */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">
                  Clinic Name *
                </label>
                <input
                  {...register('name')}
                  disabled={!isEditing && clinicInfo}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.name ? 'border-red-500' : 'border-gray-300'
                  } ${!isEditing && clinicInfo ? 'bg-gray-50' : ''}`}
                  placeholder="Enter clinic name"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Years of Experience */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience *
                </label>
                <input
                  {...register('noOfExperience')}
                  type="number"
                  disabled={!isEditing && clinicInfo}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.noOfExperience ? 'border-red-500' : 'border-gray-300'
                  } ${!isEditing && clinicInfo ? 'bg-gray-50' : ''}`}
                  placeholder="Enter years of experience"
                />
                {errors.noOfExperience && (
                  <p className="text-red-500 text-sm mt-1">{errors.noOfExperience.message}</p>
                )}
              </div>

              {/* Number of Patients */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Patients *
                </label>
                <input
                  {...register('noOfPatients')}
                  type="number"
                  disabled={!isEditing && clinicInfo}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                    errors.noOfPatients ? 'border-red-500' : 'border-gray-300'
                  } ${!isEditing && clinicInfo ? 'bg-gray-50' : ''}`}
                  placeholder="Enter number of patients"
                />
                {errors.noOfPatients && (
                  <p className="text-red-500 text-sm mt-1">{errors.noOfPatients.message}</p>
                )}
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('phoneNumber')}
                    disabled={!isEditing && clinicInfo}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                      errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditing && clinicInfo ? 'bg-gray-50' : ''}`}
                    placeholder="Enter phone number"
                  />
                </div>
                {errors.phoneNumber && (
                  <p className="text-red-500 text-sm mt-1">{errors.phoneNumber.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    {...register('email')}
                    type="email"
                    disabled={!isEditing && clinicInfo}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditing && clinicInfo ? 'bg-gray-50' : ''}`}
                    placeholder="Enter email address"
                  />
                </div>
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Location 1 Section */}
              <div className="md:col-span-2">
                <h4 className="text-md font-medium text-gray-900 mb-4">Location 1</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location 1 URL *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...register('location1.url')}
                        disabled={!isEditing && clinicInfo}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                          errors['location1.url'] ? 'border-red-500' : 'border-gray-300'
                        } ${!isEditing && clinicInfo ? 'bg-gray-50' : ''}`}
                        placeholder="Enter location 1 URL"
                      />
                    </div>
                    {errors['location1.url'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['location1.url'].message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location 1 Description *
                    </label>
                    <textarea
                      {...register('location1.description')}
                      disabled={!isEditing && clinicInfo}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        errors['location1.description'] ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditing && clinicInfo ? 'bg-gray-50' : ''}`}
                      placeholder="Enter location 1 description"
                    />
                    {errors['location1.description'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['location1.description'].message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Location 2 Section */}
              <div className="md:col-span-2">
                <h4 className="text-md font-medium text-gray-900 mb-4">Location 2</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location 2 URL *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...register('location2.url')}
                        disabled={!isEditing && clinicInfo}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                          errors['location2.url'] ? 'border-red-500' : 'border-gray-300'
                        } ${!isEditing && clinicInfo ? 'bg-gray-50' : ''}`}
                        placeholder="Enter location 2 URL"
                      />
                    </div>
                    {errors['location2.url'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['location2.url'].message}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location 2 Description *
                    </label>
                    <textarea
                      {...register('location2.description')}
                      disabled={!isEditing && clinicInfo}
                      rows={3}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                        errors['location2.description'] ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditing && clinicInfo ? 'bg-gray-50' : ''}`}
                      placeholder="Enter location 2 description"
                    />
                    {errors['location2.description'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['location2.description'].message}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Social Links */}
              <div className="md:col-span-2">
                <h4 className="text-md font-medium text-gray-900 mb-4">Social Links</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook URL
                    </label>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...register('socialLinks.facebook')}
                        disabled={!isEditing && clinicInfo}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                          errors['socialLinks.facebook'] ? 'border-red-500' : 'border-gray-300'
                        } ${!isEditing && clinicInfo ? 'bg-gray-50' : ''}`}
                        placeholder="Enter Facebook URL"
                      />
                    </div>
                    {errors['socialLinks.facebook'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['socialLinks.facebook'].message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram URL
                    </label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        {...register('socialLinks.instagram')}
                        disabled={!isEditing && clinicInfo}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 ${
                          errors['socialLinks.instagram'] ? 'border-red-500' : 'border-gray-300'
                        } ${!isEditing && clinicInfo ? 'bg-gray-50' : ''}`}
                        placeholder="Enter Instagram URL"
                      />
                    </div>
                    {errors['socialLinks.instagram'] && (
                      <p className="text-red-500 text-sm mt-1">{errors['socialLinks.instagram'].message}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            {(!clinicInfo || isEditing) && (
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      reset(clinicInfo);
                    }}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center space-x-2 px-6 py-3 bg-[#963f36] text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>{clinicInfo ? 'Update' : 'Create'} Clinic Info</span>
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}

