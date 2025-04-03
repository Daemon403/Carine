import React from 'react';
import { Link } from 'react-router-dom';
import { Job } from '../features/types';

interface JobCardProps {
  job: Job;
  showActionButtons?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({ job, showActionButtons = true }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{job.title}</h3>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
            job.status === 'open' 
              ? 'bg-green-100 text-green-800' 
              : job.status === 'assigned' 
                ? 'bg-blue-100 text-blue-800' 
                : 'bg-gray-100 text-gray-800'
          }`}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{job.description}</p>
        
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {job.requiredSkills.map(skill => (
                <span 
                  key={skill} 
                  className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">
              {job.bids.length} {job.bids.length === 1 ? 'bid' : 'bids'}
            </p>
            <p className="text-sm text-gray-500">
              Posted {new Date(job.createdAt).toLocaleDateString()}
            </p>
          </div>
          
          {showActionButtons && (
            <Link
              to={`/jobs/${job.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              View Details
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;