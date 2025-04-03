import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { createJob, selectJobsStatus } from '../features/jobs/jobsSlice';
import { FaTools, FaCalendarAlt, FaMapMarkerAlt, FaInfoCircle } from 'react-icons/fa'; //FaBillWallet, FaMoneyBillWave, FaTools
import { MultiSelect } from 'react-multi-select-component';
import { RootState } from '../app/store';

interface JobFormData {
  title: string;
  description: string;
  requiredSkills: string[];
  budget?: number;
  deadline: string;
  location: string;
}

interface Location {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}

interface CreateJobPayload {
  title: string;
  description: string;
  requiredSkills: string[];
  budget?: number;
  deadline: string;
  location: Location;
}

const PostJobPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const status = useAppSelector(selectJobsStatus);
  const user = useAppSelector((state: RootState) => state.auth.user);

  const [formData, setFormData] = useState<JobFormData>({
    title: '',
    description: '',
    requiredSkills: [],
    budget: undefined,
    deadline: '',
    location: ''
  });

  const [errors, setErrors] = useState<Partial<JobFormData>>({});
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Available skills for selection
  const skillsOptions = [
    { label: 'Welding', value: 'welding' },
    { label: 'Plumbing', value: 'plumbing' },
    { label: 'Electrical', value: 'electrical' },
    { label: 'Carpentry', value: 'carpentry' },
    { label: 'Masonry', value: 'masonry' },
    { label: 'Painting', value: 'painting' },
    { label: 'HVAC', value: 'hvac' },
    { label: 'Roofing', value: 'roofing' },
  ];

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setCurrentLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setFormData(prev => ({
            ...prev,
            location: `${position.coords.latitude}, ${position.coords.longitude}`
          }));
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (selected: any[]) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: selected.map(item => item.value)
    }));
  };

  const validateForm = () => {
    const newErrors: Partial<JobFormData> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (formData.requiredSkills.length === 0) newErrors.requiredSkills = ['At least one skill is required'];
    if (!formData.location) newErrors.location = 'Location is required';
    if (!formData.deadline) newErrors.deadline = 'Deadline is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      alert('You must be logged in to post a job');
      navigate('/login');
      return;
    }

    if (validateForm()) {
      try {
        const [lat, lng] = formData.location.split(',').map(coord => parseFloat(coord.trim()));
        
        const jobData: CreateJobPayload = {
          title: formData.title,
          description: formData.description,
          requiredSkills: formData.requiredSkills,
          budget: formData.budget,
          deadline: formData.deadline,
          location: {
            type: 'Point',
            coordinates: [lng, lat] // GeoJSON uses [longitude, latitude]
          }
        };
        
        await dispatch(createJob(jobData)).unwrap();
        
        navigate('/jobs');
      } catch (err) {
        console.error('Failed to post job:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="text-gray-600 mr-2">
                <FaTools size={20} />
              </span>
              Post a New Job
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Fill out the form below to create a new job posting
            </p>
          </div>

          <form onSubmit={handleSubmit} className="px-6 py-4">
            {/* Job Title */}
            <div className="mb-6">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`block w-full px-4 py-2 border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="e.g., Need a plumber for bathroom renovation"
              />
              {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
            </div>

            {/* Job Description */}
            <div className="mb-6">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Detailed Description *
              </label>
              <textarea
                id="description"
                name="description"
                rows={5}
                value={formData.description}
                onChange={handleChange}
                className={`block w-full px-4 py-2 border ${errors.description ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                placeholder="Describe the job in detail..."
              />
              {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
            </div>

            {/* Required Skills */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Required Skills *
              </label>
              <MultiSelect
                options={skillsOptions}
                value={formData.requiredSkills.map(skill => 
                  skillsOptions.find(option => option.value === skill) || { label: skill, value: skill }
                )}
                onChange={handleSkillsChange}
                labelledBy="Select skills"
                className={`border ${errors.requiredSkills ? 'border-red-500' : 'border-gray-300'} rounded-md`}
              />
              {errors.requiredSkills && (
                <p className="mt-1 text-sm text-red-600">{errors.requiredSkills[0]}</p>
              )}
            </div>

            {/* Budget */}
            <div className="mb-6">
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-1">
                Budget (Optional)
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  id="budget"
                  name="budget"
                  min="0"
                  value={formData.budget || ''}
                  onChange={handleChange}
                  className="block w-full pl-7 pr-12 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="0.00"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">USD</span>
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="mb-6">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">
                    <FaMapMarkerAlt size={18} />
                  </span>
                </div>
                <input
                  type="text"
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                  placeholder="Latitude, Longitude"
                />
                {currentLocation && (
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({
                      ...prev,
                      location: `${currentLocation.lat}, ${currentLocation.lng}`
                    }))}
                    className="absolute right-2 top-2 text-sm text-indigo-600 hover:text-indigo-800"
                  >
                    Use Current
                  </button>
                )}
              </div>
              {errors.location && <p className="mt-1 text-sm text-red-600">{errors.location}</p>}
              <p className="mt-1 text-xs text-gray-500 flex items-center">
                <span className="text-gray-400 mr-1">
                  <FaInfoCircle size={14} />
                </span>
                We use your location to match you with nearby artisans
              </p>
            </div>

            {/* Deadline */}
            <div className="mb-6">
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                Deadline *
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-400">
                    <FaCalendarAlt size={18} />
                  </span>
                </div>
                <input
                  type="date"
                  id="deadline"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`block w-full pl-10 pr-3 py-2 border ${errors.deadline ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500`}
                />
              </div>
              {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
            </div>

            {/* Submit Button */}
            <div className="mt-8 border-t border-gray-200 pt-4">
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white ${status === 'loading' ? 'bg-indigo-400' : 'bg-indigo-600 hover:bg-indigo-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
              >
                {status === 'loading' ? 'Posting Job...' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostJobPage;