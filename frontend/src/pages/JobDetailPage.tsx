import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { selectCurrentUser } from '../features/auth/authSlice';
import { selectAllJobs } from '../features/jobs/jobsSlice';
import { placeBid, acceptBid } from '../features/jobs/jobsSlice';
import BidForm from '../components/BidForm';
import BidList from '../components/BidList';
import { ApiError } from '../features/types';

const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const jobs = useAppSelector(selectAllJobs);
  const user = useAppSelector(selectCurrentUser);
  const dispatch = useAppDispatch();
  
  const job = jobs.find(j => j.id === id);
  const [bidAmount, setBidAmount] = useState('');

  if (!job) {
    return (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold text-gray-800">Job not found</h2>
        <p className="text-gray-600 mt-2">The requested job does not exist or may have been removed.</p>
      </div>
    );
  }

  const handleBidSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bidAmount || isNaN(parseFloat(bidAmount))) {
      alert('Please enter a valid bid amount');
      return;
    }

    if (!user || user.role !== 'artisan') {
      alert('Only artisans can place bids');
      return;
    }

    dispatch(placeBid({ 
      jobId: job.id, 
      amount: parseFloat(bidAmount) 
    }))
    .unwrap()
    .then(() => {
      setBidAmount('');
    })
    .catch((error: ApiError) => {
      console.error('Failed to place bid:', error);
      alert(`Failed to place bid: ${error.message}`);
    });
  };

  const handleAcceptBid = (bidId: string) => {
    if (!user || user.id !== job.clientId) {
      alert('Only the job poster can accept a bid.');
      return;
    }

    dispatch(acceptBid({ 
      jobId: job.id, 
      bidId 
    }))
    .unwrap()
    .then(() => {
      alert('Bid accepted successfully! The artisan has been notified.');
    })
    .catch((error: ApiError) => {
      console.error('Failed to accept bid:', error);
      alert(`Failed to accept bid: ${error.message}`);
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-2xl font-bold mb-2 text-gray-800">{job.title}</h1>
        <p className="text-gray-700 mb-4">{job.description}</p>
        
        {job.requiredSkills && job.requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {job.requiredSkills.map(skill => (
              <span key={skill} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {skill}
              </span>
            ))}
          </div>
        )}
        
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            job.status === 'open' ? 'bg-green-100 text-green-800' : 
            job.status === 'assigned' ? 'bg-blue-100 text-blue-800' : 
            'bg-gray-100 text-gray-800'
          }`}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </span>
          <span className="text-sm text-gray-500">
            Posted on {new Date(job.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </span>
        </div>
      </div>

      {user?.role === 'artisan' && job.status === 'open' && (
        <div className="mb-8">
          <BidForm 
            bidAmount={bidAmount}
            setBidAmount={setBidAmount}
            onSubmit={handleBidSubmit}
            minBid={job.bids.length > 0 
              ? Math.min(...job.bids.map(b => b.amount)) * 0.9 
              : undefined}
          />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">
          Bids ({job.bids.length})
        </h2>
        <BidList 
          bids={job.bids} 
          currentUserId={user?.id}
          onAcceptBid={user?.id === job.clientId && job.status === 'open' ? handleAcceptBid : undefined}
        />
      </div>
    </div>
  );
};

export default JobDetailPage;