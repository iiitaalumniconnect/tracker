import { useState, useEffect } from 'react';
import api from '../services/api';
import { Activity, Trash2, File as FileIcon, Clock, HardDrive, Download, Activity as ActivityIcon } from 'lucide-react';

interface UploadHistory {
  id: number;
  filename: string;
  uploaded_at: string;
  status: string;
  record_count: number;
}

const HistoryList = () => {
  const [history, setHistory] = useState<UploadHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [trackingAll, setTrackingAll] = useState(false);
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [trackingTotal, setTrackingTotal] = useState(0);
  const [trackingStatus, setTrackingStatus] = useState('');

  useEffect(() => {
    fetchHistory();
    
    // Setup WebSocket for real-time updates
    const wsUrl = `ws://localhost:8000/api/v1/ws`;
    const ws = new WebSocket(wsUrl);
    
    ws.onmessage = (event) => {
        try {
            const data = JSON.parse(event.data);
            if (data.type === 'status_update') {
                fetchHistory(); // Refresh history automatically
            }
        } catch (e) {
            console.error("Failed to parse WS message", e);
        }
    };
    
    return () => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.close();
        }
    };
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/upload/history');
      setHistory(response.data);
    } catch (err: any) {
      setError('Failed to fetch history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this file from your history? Note: This only deletes the history log, not the imported alumni records.")) {
        return;
    }
    
    try {
      await api.delete(`/upload/history/${id}`);
      setHistory(history.filter(h => h.id !== id));
    } catch (err) {
      alert("Failed to delete history record");
    }
  };

  const handleTrackAll = async () => {
    if (!window.confirm("This will start tracking all profiles from all uploaded files. This may take a while. Continue?")) {
        return;
    }
    
    setTrackingAll(true);
    try {
      // Get all unique alumni and track them
      const response = await api.get('/alumni/');
      const alumni = response.data;
      
      setTrackingTotal(alumni.length);
      setTrackingStatus(`Starting to track ${alumni.length} profiles...`);
      
      let successCount = 0;
      let failedCount = 0;
      
      for (let index = 0; index < alumni.length; index++) {
        const alumnus = alumni[index];
        try {
          await api.post(`/alumni/${alumnus.id}/track`);
          successCount++;
        } catch (err) {
          failedCount++;
        }
        setTrackingProgress(index + 1);
        setTrackingStatus(`Tracking: ${index + 1}/${alumni.length} (✓ ${successCount} | ✗ ${failedCount})`);
      }
      
      alert(`Tracking Complete!\n✓ Tracked: ${successCount} profiles\n✗ Failed: ${failedCount} profiles`);
    } catch (err) {
      alert("Failed to start tracking profiles");
      console.error(err);
    } finally {
      setTrackingAll(false);
      setTrackingProgress(0);
      setTrackingTotal(0);
      setTrackingStatus('');
    }
  };

  const handleDownloadAll = async () => {
    try {
      const response = await api.get('/alumni/export', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Alumni_Updates_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (err) {
      alert("Failed to download all profiles");
      console.error(err);
    }
  };

  const handleTrackUpload = async (uploadId: number) => {
    if (!window.confirm("This will start tracking all profiles from this upload. Continue?")) {
        return;
    }
    
    setTrackingAll(true);
    try {
      // Get alumni from this upload and track them
      const response = await api.get(`/alumni/?skip=0&limit=100000&upload_id=${uploadId}`);
      const allAlumni = response.data;
      
      setTrackingTotal(allAlumni.length);
      setTrackingStatus(`Starting to track ${allAlumni.length} profiles...`);
      
      let successCount = 0;
      let failedCount = 0;
      
      for (let index = 0; index < allAlumni.length; index++) {
        const alumnus = allAlumni[index];
        try {
          await api.post(`/alumni/${alumnus.id}/track`);
          successCount++;
        } catch (err) {
          failedCount++;
        }
        setTrackingProgress(index + 1);
        setTrackingStatus(`Tracking: ${index + 1}/${allAlumni.length} (✓ ${successCount} | ✗ ${failedCount})`);
      }
      
      alert(`Tracking Complete!\n✓ Tracked: ${successCount} profiles\n✗ Failed: ${failedCount} profiles`);
    } catch (err) {
      alert("Failed to track profiles from this upload");
      console.error(err);
    } finally {
      setTrackingAll(false);
      setTrackingProgress(0);
      setTrackingTotal(0);
      setTrackingStatus('');
    }
  };

  // const handleDownloadTracked = async (uploadId?: number) => {
  //   try {
  //     const url = uploadId 
  //       ? `/alumni/export?upload_id=${uploadId}`
  //       : '/alumni/export';
      
  //     const response = await api.get(url, {
  //       responseType: 'blob'
  //     });
      
  //     const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
  //     const link = document.createElement('a');
  //     link.href = blobUrl;
  //     link.setAttribute('download', `Alumni_Tracked_${new Date().toISOString().split('T')[0]}.xlsx`);
  //     document.body.appendChild(link);
  //     link.click();
  //     link.parentNode?.removeChild(link);
  //   } catch (err) {
  //     alert("Failed to download tracked profiles");
  //     console.error(err);
  //   }
  // };
const handleDownloadTracked = async (uploadId?: number) => {
    let timer: ReturnType<typeof setInterval> | undefined;

    try {
        const url = uploadId
            ? `/alumni/export?upload_id=${uploadId}`
            : "/alumni/export";

        console.log("Starting download...");

        let seconds = 0;

        timer = setInterval(() => {
            seconds++;

            console.clear();

            const progress = Math.min(seconds * 2, 90);

            console.log("Preparing Excel...");
            console.log(`Progress: ${progress}%`);
            console.log(`Elapsed: ${seconds} sec`);
        }, 1000);

        const response = await api.get(url, {
            responseType: "blob",
        });

        if (timer) clearInterval(timer);

        console.clear();
        console.log("Progress: 100%");
        console.log("Download ready.");

        const blobUrl = window.URL.createObjectURL(
            new Blob([response.data])
        );

        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = `Alumni_Tracked_${new Date().toISOString().split("T")[0]}.xlsx`;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        window.URL.revokeObjectURL(blobUrl);

    } catch (err) {

        if (timer) clearInterval(timer);

        console.error(err);
    }
};
  const handleDownloadOriginal = async (id: number, filename: string) => {
    try {
        const response = await api.get(`/upload/download-original/${id}`, {
            responseType: 'blob'
        });
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
    } catch (err) {
        alert("Original file may have been deleted or is unavailable for download.");
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
            Upload & Activity History
        </h2>
        <p className="mt-1 text-sm text-gray-500">Track files you've uploaded to the platform.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {trackingAll && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">
                        {trackingStatus || 'Tracking in progress...'}
                    </span>
                    <span className="text-sm text-blue-700">
                        {trackingTotal > 0 ? Math.round((trackingProgress / trackingTotal) * 100) : 0}%
                    </span>
                </div>
                <div className="w-full bg-blue-200 rounded-full h-2.5">
                    <div 
                        className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${trackingTotal > 0 ? (trackingProgress / trackingTotal) * 100 : 0}%` }}
                    ></div>
                </div>
                <p className="text-xs text-blue-600 mt-2">{trackingProgress} of {trackingTotal} profiles processed</p>
            </div>
        )}
        
        {error && (
            <div className="bg-red-50 text-red-700 p-4 rounded-md mb-6">{error}</div>
        )}

        {history.length === 0 ? (
           <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
               <HardDrive className="mx-auto h-12 w-12 text-gray-300" />
               <h3 className="mt-2 text-sm font-medium text-gray-900">No history found</h3>
               <p className="mt-1 text-sm text-gray-500">You haven't uploaded any CSV files yet.</p>
           </div>
        ) : (
            <div className="space-y-4">
                <div className="flex items-center justify-start gap-3 mb-4">
                  <button 
                    onClick={handleTrackAll}
                    disabled={history.length === 0 || trackingAll}
                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-colors ${
                      history.length === 0 || trackingAll
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                    title="Track all profiles from all uploads"
                  >
                    <ActivityIcon className="h-4 w-4" />
                    <span>{trackingAll ? 'Tracking...' : 'Track All'}</span>
                  </button>
                  <button 
                    onClick={handleDownloadAll}
                    disabled={history.length === 0}
                    className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center space-x-2 transition-colors ${
                      history.length === 0 
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                    title="Download all profiles as Excel"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download All</span>
                  </button>
                </div>
                {history.map((item) => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 flex items-center justify-between group">
                        <div className="flex items-center space-x-4">
                            <div className="bg-primary-50 p-3 rounded-lg">
                                <FileIcon className="h-6 w-6 text-primary-600" />
                            </div>
                            <div>
                                <h4 className="text-base font-semibold text-gray-900 flex items-center">
                                    {item.filename}
                                    <span className={`ml-3 px-2.5 py-0.5 rounded-full text-xs font-medium ${item.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                        {item.status}
                                    </span>
                                </h4>
                                <div className="mt-1 flex items-center text-sm text-gray-500 space-x-4">
                                    <span className="flex items-center">
                                        <Clock className="h-4 w-4 mr-1" />
                                        {new Date(item.uploaded_at).toLocaleString()}
                                    </span>
                                    <span>•</span>
                                    <span>{item.record_count} records imported</span>
                                    <span>•</span>
                                    <span className="font-mono text-xs">ID: {item.id}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => handleTrackUpload(item.id)}
                                className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-1"
                                title="Track this upload"
                            >
                                <ActivityIcon className="h-4 w-4" />
                                <span>Track</span>
                            </button>
                            <button 
                                onClick={() => handleDownloadTracked(item.id)}
                                className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center space-x-1"
                                title="Download tracked data"
                            >
                                <Download className="h-4 w-4" />
                                <span>Tracked</span>
                            </button>
                            <button 
                                onClick={() => handleDownloadOriginal(item.id, item.filename)}
                                className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-1"
                                title="Download original CSV"
                            >
                                <Download className="h-4 w-4" />
                                <span>Original File</span>
                            </button>
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete from history"
                            >
                                <Trash2 className="h-5 w-5" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default HistoryList;
