import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectAllJobs, selectJobsStatus } from '../features/jobs/jobsSlice';
import { fetchJobs } from '../features/jobs/jobsSlice';
import JobCard from '../components/JobCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { RootState } from '../app/store';
import Job  from '../features/jobs/jobsSlice';

const HomePage: React.FC = () => {
  const dispatch = useDispatch();
  const jobs = useSelector((state: RootState) => selectAllJobs(state));
  const status = useSelector((state: RootState) => selectJobsStatus(state));
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [radiusFilter, setRadiusFilter] = useState<number>(10); // Default 10km radius

  // Available skills for filter
  const availableSkills = [
    'welding',
    'plumbing',
    'electrical',
    'carpentry',
    'masonry',
    'painting'
  ];

  // Fetch jobs on component mount
  useEffect(() => {
    // In a real app, you would get user's location first
    const defaultLocation = { lng: -0.2, lat: 5.6 }; // Default to Accra coordinates
    dispatch(fetchJobs(defaultLocation));
  }, [dispatch]);

  // Apply filters whenever jobs, search term, or filters change
  useEffect(() => {
    let results = [...jobs];

    // Apply search term filter
    if (searchTerm) {
      results = results.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply skill filter
    if (skillFilter.length > 0) {
      results = results.filter(job => 
        skillFilter.some(skill => 
          job.requiredSkills?.includes(skill)
      );
    }

    // Note: Location radius filtering would be done in the backend API call
    // This is just frontend representation of filtered jobs
    setFilteredJobs(results);
  }, [jobs, searchTerm, skillFilter, radiusFilter]);

  const handleSkillToggle = (skill: string) => {
    setSkillFilter(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Find Artisan Jobs</h1>
          <p className="text-gray-600">
            Browse available jobs in your area and place your bids
          </p>
        </div>

        {/* Filter Bar */}
        <FilterBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          availableSkills={availableSkills}
          selectedSkills={skillFilter}
          onSkillToggle={handleSkillToggle}
          radius={radiusFilter}
          setRadius={setRadiusFilter}
        />

        {/* Status Info */}
        {status === 'loading' && (
          <div className="flex justify-center my-8">
            <LoadingSpinner />
          </div>
        )}

        {status === 'failed' && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            Failed to load jobs. Please try again later.
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Available
          </h2>
          <div className="text-sm text-gray-500">
            Showing within {radiusFilter}km radius
          </div>
        </div>

        {/* Jobs List */}
        {status === 'succeeded' && filteredJobs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              Try adjusting your search filters or check back later
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                showActionButtons={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;