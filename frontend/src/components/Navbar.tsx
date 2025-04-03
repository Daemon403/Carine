import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { FaHome, FaUserPlus, FaSignInAlt, FaSignOutAlt, FaUserCircle, FaTools } from 'react-icons/fa';

const NavBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const status = useAppSelector((state) => state.auth.status);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/');
  };

  return (
    <nav className="bg-indigo-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl">
              <FaTools />
            </span>
            <span className="text-xl font-bold">ArtisanP2P</span>
          </Link>

          <div className="hidden md:flex space-x-6">
            <Link to="/" className="flex items-center space-x-1 hover:text-indigo-200 transition">
              <span className="text-lg">
                <FaHome />
              </span>
              <span>Home</span>
            </Link>
            
            {user ? (
              <>
                <Link to="/dashboard" className="flex items-center space-x-1 hover:text-indigo-200 transition">
                  <span className="text-lg">
                    <FaUserCircle />
                  </span>
                  <span>Dashboard</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="flex items-center space-x-1 hover:text-indigo-200 transition"
                  disabled={status === 'loading'}
                >
                  <span className="text-lg">
                    <FaSignOutAlt />
                  </span>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/register" className="flex items-center space-x-1 hover:text-indigo-200 transition">
                  <span className="text-lg">
                    <FaUserPlus />
                  </span>
                  <span>Register</span>
                </Link>
                <Link to="/login" className="flex items-center space-x-1 hover:text-indigo-200 transition">
                  <span className="text-lg">
                    <FaSignInAlt />
                  </span>
                  <span>Login</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;