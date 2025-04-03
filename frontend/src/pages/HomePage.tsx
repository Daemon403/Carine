import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectAllJobs, selectJobsStatus } from '../features/jobs/jobsSlice';
import { fetchJobs } from '../features/jobs/jobsSlice';
import JobCard from '../components/JobCard';
import FilterBar from '../components/FilterBar';
import LoadingSpinner from '../components/LoadingSpinner';
import { Job } from '../features/types';

const HomePage: React.FC = () => {
  const dispatch = useAppDispatch();
  const jobs = useAppSelector(selectAllJobs);
  const status = useAppSelector(selectJobsStatus);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [skillFilter, setSkillFilter] = useState<string[]>([]);
  const [radiusFilter, setRadiusFilter] = useState<number>(10);
  const [error, setError] = useState<string | null>(null);

  const availableSkills = [
    'welding',
    'plumbing',
    'electrical',
    'carpentry',
    'masonry',
    'painting'
  ];

  useEffect(() => {
    const fetchJobsData = async () => {
      try {
        setError(null);
        const defaultLocation = { lng: -0.2, lat: 5.6 };
        await dispatch(fetchJobs(defaultLocation)).unwrap();
      } catch (err) {
        setError('Failed to load jobs. Please try again later.');
        console.error('Failed to fetch jobs:', err);
      }
    };

    fetchJobsData();
  }, [dispatch]);

  useEffect(() => {
    let results = [...jobs];

    // Search term filter
    if (searchTerm) {
      results = results.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Skill filter - now handles undefined requiredSkills
    if (skillFilter.length > 0) {
      results = results.filter(job => 
        job.requiredSkills && 
        skillFilter.some(skill => 
          job.requiredSkills.includes(skill)
      ));
    }

    setFilteredJobs(results);
  }, [jobs, searchTerm, skillFilter, radiusFilter]);

  const handleSkillToggle = (skill: string) => {
    setSkillFilter(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const handleRetry = () => {
    const defaultLocation = { lng: -0.2, lat: 5.6 };
    dispatch(fetchJobs(defaultLocation));
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

        <FilterBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          availableSkills={availableSkills}
          selectedSkills={skillFilter}
          onSkillToggle={handleSkillToggle}
          radius={radiusFilter}
          setRadius={setRadiusFilter}
        />

        {status === 'loading' && (
          <div className="flex justify-center my-8">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center">
            <span>{error}</span>
            <button 
              onClick={handleRetry}
              className="ml-4 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">
            {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Available
          </h2>
          <div className="text-sm text-gray-500">
            Showing within {radiusFilter}km radius
          </div>
        </div>

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