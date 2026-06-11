import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LogOut, Upload, Users, Search, Activity, BarChart2 } from 'lucide-react';

// Components
import AlumniList from '../components/AlumniList';
import CsvUpload from '../components/CsvUpload';
import HistoryList from '../components/HistoryList';
import Analytics from '../components/Analytics';
import TrackingList from '../components/TrackingList';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-primary-600 mr-2" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">AlumniTracker</span>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="flex items-center text-gray-600 hover:text-red-600 transition-colors px-3 py-2 rounded-md text-sm font-medium"
              >
                <LogOut className="h-5 w-5 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-8 flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden sticky top-24">
            <nav className="flex flex-col p-2 space-y-1">
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <BarChart2 className="h-5 w-5 mr-3" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('directory')}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'directory' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <Search className="h-5 w-5 mr-3" />
                Alumni Directory
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'upload' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <Upload className="h-5 w-5 mr-3" />
                Add Alumni Data
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'history' ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50'}`}
              >
                <Activity className="h-5 w-5 mr-3" />
                Activity History
              </button>
              
            </nav>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[600px]">
          {activeTab === 'analytics' && <Analytics />}
          {activeTab === 'directory' && <AlumniList />}
          {activeTab === 'upload' && <CsvUpload />}
          {activeTab === 'history' && <HistoryList />}
          {activeTab === 'tracking' && <TrackingList />}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
