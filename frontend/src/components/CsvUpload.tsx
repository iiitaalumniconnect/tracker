import { useState } from 'react';
import api from '../services/api';
import { UploadCloud, File, CheckCircle, AlertCircle, Link as LinkIcon } from 'lucide-react';

const CsvUpload = () => {
  const [activeMode, setActiveMode] = useState<'csv' | 'single'>('csv');
  const [file, setFile] = useState<File | null>(null);
  const [singleUrl, setSingleUrl] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus('idle');
    }
  };

  const handleSubmit = async () => {
    setUploading(true);
    setStatus('idle');
    
    try {
      if (activeMode === 'csv') {
        if (!file) return;
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post('/upload/upload-csv', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        setStatus('success');
        setMessage(response.data.message);
        setFile(null);
      } else {
        if (!singleUrl) return;
        await api.post('/alumni/add-single', {
            linkedin_url: singleUrl,
            full_name: "", company: "", designation: "", location: ""
        });
        setStatus('success');
        setMessage('Successfully added single LinkedIn profile!');
        setSingleUrl('');
      }
    } catch (error: any) {
      setStatus('error');
      setMessage(error.response?.data?.detail || 'An error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto h-full flex flex-col justify-center">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Add Alumni Data</h2>
        <p className="mt-2 text-gray-600">Upload a CSV or Excel file, or add a single LinkedIn profile URL.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        
        {/* Toggle Bar */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeMode === 'csv' ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => { setActiveMode('csv'); setStatus('idle'); }}
          >
            Upload File
          </button>
          <button
            className={`flex-1 py-4 text-sm font-medium transition-colors ${activeMode === 'single' ? 'border-b-2 border-primary-500 text-primary-600 bg-primary-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}
            onClick={() => { setActiveMode('single'); setStatus('idle'); }}
          >
            Single URL
          </button>
        </div>

        <div className="p-8">
          {activeMode === 'csv' ? (
            <div 
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors
                ${file ? 'border-primary-500 bg-primary-50' : 'border-gray-300 hover:border-gray-400 bg-gray-50'}
              `}
            >
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                {file ? (
                  <File className="h-16 w-16 text-primary-500 mb-4" />
                ) : (
                  <UploadCloud className="h-16 w-16 text-gray-400 mb-4" />
                )}
                <span className="text-lg font-medium text-gray-900 mb-1">
                  {file ? file.name : 'Click to upload or drag and drop'}
                </span>
                <span className="text-sm text-gray-500">
                  {file ? `${(file.size / 1024).toFixed(2)} KB` : 'CSV or Excel files. Must contain a `linkedin_url` column.'}
                </span>
              </label>
            </div>
          ) : (
            <div className="py-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn Profile URL</label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="url"
                  className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 py-3 sm:text-sm border-gray-300 rounded-md border"
                  placeholder="https://linkedin.com/in/username"
                  value={singleUrl}
                  onChange={(e) => setSingleUrl(e.target.value)}
                />
              </div>
            </div>
          )}

          {status === 'success' && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
              <CheckCircle className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
              <p className="text-sm text-green-800 font-medium">{message}</p>
            </div>
          )}

          {status === 'error' && (
            <div className="mt-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5" />
              <p className="text-sm text-red-800 font-medium">{message}</p>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={uploading || (activeMode === 'csv' ? !file : !singleUrl)}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {uploading ? 'Processing...' : 'Submit Data'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CsvUpload;
