import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from './features/auth/authSlice';
import { fetchJobs } from './features/jobs/jobsSlice';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import JobDetailPage from './pages/JobDetailPage';
import PostJobPage from './pages/PostJobPage';
import Navbar from './components/Navbar';
import useSocket  from './hooks/useSocket';
import { addBid } from './features/jobs/jobsSlice';

const App: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();

  // Initialize socket connection
  const socket = useSocket();

  useEffect(() => {
    if (user) {
      // Get user's location (simplified - in production use browser geolocation API)
      const defaultCoords = { lng: -0.2, lat: 5.6 }; // Default to Accra coordinates
      dispatch(fetchJobs(defaultCoords));

      // Set up socket listeners
      if (socket) {
        socket.on('newBid', (data: { jobId: string; bid: Bid }) => {
          dispatch(addBid(data));
        });
      }
    }

    return () => {
      if (socket) {
        socket.off('newBid');
      }
    };
  }, [user, dispatch, socket]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={!user ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to="/" />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route 
            path="/post-job" 
            element={user?.role === 'client' ? <PostJobPage /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </div>
  );
};

export default App;