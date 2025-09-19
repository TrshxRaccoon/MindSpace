import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Journal = () => {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-xl font-semibold">MindSpace</Link>
              <Link to="/posts" className="text-gray-600 hover:text-gray-900">Posts</Link>
              <Link to="/journal" className="text-blue-600 font-medium">Journal</Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">{user?.displayName}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Journal</h1>
          <div className="bg-white shadow rounded-lg p-6">
            <p className="text-gray-600">Journal functionality will be implemented here.</p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Journal;