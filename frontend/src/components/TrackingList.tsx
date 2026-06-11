import { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, ArrowRight, User, Pause, Play, CheckCircle, AlertCircle } from 'lucide-react';

interface ChangeLog {
  id: number;
  alumni_id: number;
  full_name: string;
  linkedin_url: string;
  field_changed: string;
  old_value: string;
  new_value: string;
  detected_at: string;
  is_tracking: boolean;
}

const TrackingList = () => {
  const [logs, setLogs] = useState<ChangeLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [actioningId, setActioningId] = useState<number | null>(null);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/analytics/changelog');
      setLogs(response.data);
    } catch (err: any) {
      setError('Failed to fetch tracking history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStopTracking = async (alumniId: number, fullName: string) => {
    try {
      setActioningId(alumniId);
      const response = await api.post(`/analytics/tracking/stop/${alumniId}`);
      
      if (response.data.success) {
        setSuccessMessage(`✓ Tracking stopped for ${fullName}`);
        
        // Update UI
        setLogs(logs.map(log => 
          log.alumni_id === alumniId ? { ...log, is_tracking: false } : log
        ));
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      setError(`Failed to stop tracking for ${fullName}`);
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  const handleResumeTracking = async (alumniId: number, fullName: string) => {
    try {
      setActioningId(alumniId);
      const response = await api.post(`/analytics/tracking/resume/${alumniId}`);
      
      if (response.data.success) {
        setSuccessMessage(`✓ Tracking resumed for ${fullName}`);
        
        // Update UI
        setLogs(logs.map(log => 
          log.alumni_id === alumniId ? { ...log, is_tracking: true } : log
        ));
        
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err: any) {
      setError(`Failed to resume tracking for ${fullName}`);
      console.error(err);
    } finally {
      setActioningId(null);
    }
  };

  if (loading) {
     return (
        <div className="flex justify-center items-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
     );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="p-6 border-b border-gray-200 bg-white">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Activity className="h-6 w-6 mr-2 text-primary-600" />
            Profile Tracking
        </h2>
        <p className="mt-1 text-sm text-gray-500">Track career changes and updates across alumni. Stop or resume tracking for specific profiles.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6 flex items-center">
              <AlertCircle className="h-5 w-5 mr-3" />
              {error}
            </div>
        )}

        {successMessage && (
            <div className="bg-green-50 text-green-700 p-4 rounded-md mb-6 flex items-center">
              <CheckCircle className="h-5 w-5 mr-3" />
              {successMessage}
            </div>
        )}

        {logs.length === 0 ? (
           <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
               <Activity className="mx-auto h-12 w-12 text-gray-300" />
               <h3 className="mt-2 text-sm font-medium text-gray-900">No changes detected</h3>
               <p className="mt-1 text-sm text-gray-500">No profile updates have been tracked yet.</p>
           </div>
        ) : (
            <div className="space-y-4">
                {logs.map((item) => (
                    <div key={item.id} className={`bg-white rounded-xl shadow-sm border ${item.is_tracking ? 'border-gray-200' : 'border-yellow-200'} p-5 flex items-start justify-between`}>
                        <div className="flex items-start space-x-4 flex-1">
                            <div className={`p-3 rounded-lg mt-1 ${item.is_tracking ? 'bg-blue-50' : 'bg-yellow-50'}`}>
                                <User className={`h-6 w-6 ${item.is_tracking ? 'text-blue-600' : 'text-yellow-600'}`} />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <h4 className="text-base font-semibold text-gray-900 flex items-center">
                                      {item.full_name || 'Unknown User'}
                                      <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide ${
                                        item.is_tracking 
                                          ? 'bg-green-100 text-green-800' 
                                          : 'bg-yellow-100 text-yellow-800'
                                      }`}>
                                          {item.is_tracking ? '🔴 Tracking' : '⏸️ Paused'}
                                      </span>
                                  </h4>
                                </div>
                                <span className={`mt-1 text-xs font-medium ${
                                  item.is_tracking ? 'text-green-700' : 'text-yellow-700'
                                }`}>
                                  {item.field_changed} updated
                                </span>
                                <div className="mt-3 flex items-center text-sm text-gray-700 space-x-3 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
                                    <span className="line-through text-gray-400 max-w-[200px] truncate" title={item.old_value || 'None'}>{item.old_value || 'None'}</span>
                                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                                    <span className="font-medium text-primary-700 max-w-[200px] truncate" title={item.new_value || 'None'}>{item.new_value || 'None'}</span>
                                </div>
                                <div className="mt-3 flex items-center text-xs text-gray-400">
                                    <span>Detected on {new Date(item.detected_at).toLocaleString()}</span>
                                    {item.linkedin_url && (
                                        <>
                                            <span className="mx-2">•</span>
                                            <a href={item.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:underline">
                                                View LinkedIn
                                            </a>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          {item.is_tracking ? (
                            <button
                              onClick={() => handleStopTracking(item.alumni_id, item.full_name)}
                              disabled={actioningId === item.alumni_id}
                              className="flex items-center space-x-1 px-3 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Stop tracking this profile"
                            >
                              <Pause className="h-4 w-4" />
                              <span className="text-xs font-medium">Stop</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleResumeTracking(item.alumni_id, item.full_name)}
                              disabled={actioningId === item.alumni_id}
                              className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
                              title="Resume tracking this profile"
                            >
                              <Play className="h-4 w-4" />
                              <span className="text-xs font-medium">Resume</span>
                            </button>
                          )}
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default TrackingList;
