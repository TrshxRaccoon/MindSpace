import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Home = () => {
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
            <div className="flex items-center">
              <h1 className="text-xl font-semibold">MindSpace</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.displayName}!</span>
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
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Home Page</h2>
            <p className="text-gray-600 mb-6">Welcome to your MindSpace dashboard!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link
                to="/posts"
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-lg text-center font-medium"
              >
                View Posts
              </Link>
              <Link
                to="/journal"
                className="bg-green-600 hover:bg-green-700 text-white p-4 rounded-lg text-center font-medium"
              >
                My Journal
              </Link>
              <Link
                to="/chat/sample-chat-id"
                className="bg-purple-600 hover:bg-purple-700 text-white p-4 rounded-lg text-center font-medium"
              >
                Sample Chat
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;