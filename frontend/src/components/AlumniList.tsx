import { useState, useEffect } from 'react';
import api from '../services/api';
import { Search, Briefcase, MapPin, Building, ExternalLink, Trash2, X, Download, Filter, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';


interface Alumni {
  id: number;
  full_name: string;
  linkedin_url: string;
  company: string;
  designation: string;
  location: string;
  experience?: any;
  education?: any;
  skills?: any;
  profile_picture?: string;
  summary?: string;
  languages?: any;
  certifications?: any;
  connection_count?: number;
  follower_count?: number;
  extra_data?: any;
  publications?: any;
  organisations?: any;
  position_groups?: any;
}

const AlumniList = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [alumniHistory, setAlumniHistory] = useState<any[]>([]);
  const [trackingId, setTrackingId] = useState<number | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 12;
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchAlumni(page);
  }, [page]);

  useEffect(() => {
    if (selectedAlumni) {
      api.get(`/alumni/${selectedAlumni.id}/changelog`)
        .then(res => setAlumniHistory(res.data))
        .catch(err => console.error('Failed to fetch tracking history', err));
    } else {
      setAlumniHistory([]);
    }
  }, [selectedAlumni]);

  const fetchAlumni = async (pageNum = 1) => {
    setLoading(true);
    try {
      const skip = (pageNum - 1) * limit;
      let endpoint = `/alumni?skip=${skip}&limit=${limit}`;
      
      if (searchQuery) endpoint += `&q=${encodeURIComponent(searchQuery)}`;
      if (companyFilter) endpoint += `&company=${encodeURIComponent(companyFilter)}`;
      if (locationFilter) endpoint += `&location=${encodeURIComponent(locationFilter)}`;

      const response = await api.get(endpoint);
      setAlumni(response.data);
      setHasMore(response.data.length === limit);
    } catch (error) {
      console.error('Error fetching alumni', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAlumni(1);
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation(); // Prevent opening modal
    if (!window.confirm("Are you sure you want to delete this alumni record?")) return;
    
    try {
      await api.delete(`/alumni/${id}`);
      setAlumni(alumni.filter(a => a.id !== id));
    } catch (error) {
      alert("Failed to delete alumni");
    }
  };

  const handleExport = async () => {
    try {
      let endpoint = `/alumni/export?`;
      if (searchQuery) endpoint += `&q=${encodeURIComponent(searchQuery)}`;
      if (companyFilter) endpoint += `&company=${encodeURIComponent(companyFilter)}`;
      if (locationFilter) endpoint += `&location=${encodeURIComponent(locationFilter)}`;

      const response = await api.get(endpoint, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'alumni_export.csv');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      alert("Failed to export data");
    }
  };

  const handleTrack = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setTrackingId(id);
    try {
      await api.post(`/alumni/${id}/track`);
      fetchAlumni(page); // Refresh data
    } catch (error) {
      alert("Failed to track profile");
    } finally {
      setTrackingId(null);
    }
  };

  const formatLocation = (loc: any) => {
    if (!loc) return 'Unknown location';
    let val: any = loc;
    if (typeof loc === 'object') {
      val = loc.country || loc.countryName || loc.location || loc.name || loc.city || JSON.stringify(loc);
    } else {
      const locStr = String(loc).trim();
      if (locStr.startsWith('{') || locStr.startsWith('[')) {
        try {
          const normalized = locStr.replace(/'/g, '"').replace(/True/g, 'true').replace(/False/g, 'false').replace(/None/g, 'null');
          const parsed = JSON.parse(normalized);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const first = parsed[0];
            val = first.country || first.countryName || first.location || first.name || first.city || JSON.stringify(first);
          } else {
            val = parsed.country || parsed.countryName || parsed.location || parsed.name || parsed.city || locStr;
          }
        } catch (e) {
          val = locStr;
        }
      } else {
        val = locStr;
      }
    }

    const valStr = typeof val === 'string' ? val.trim() : String(val).trim();
    if (!valStr || valStr.toLowerCase() === 'nan' || valStr.toLowerCase() === 'none' || valStr.toLowerCase() === 'null') {
      return 'Unknown location';
    }
    const parts = valStr.split(',').map(p => p.trim()).filter(Boolean);
    return parts.length > 0 ? parts[parts.length - 1] : valStr;
  };

  const renderRichArray = (data: any) => {
    if (!data) return null;
    let arr = Array.isArray(data) ? data : [data];
    if (arr.length === 0) return null;

    return (
      <div className="space-y-3 mt-2">
        {arr.map((item, idx) => {
          const titleStr = typeof item.title === 'string' ? item.title : (item.title?.name || '');
          const nameStr = typeof item.name === 'string' ? item.name : (item.name?.name || '');
          const companyNameStr = typeof item.companyName === 'string' ? item.companyName : (item.companyName?.name || '');
          const companyStr = typeof item.company === 'string' ? item.company : (item.company?.name || '');
          const publisherStr = typeof item.publisher === 'string' ? item.publisher : (item.publisher?.name || '');
          const positionStr = typeof item.position === 'string' ? item.position : (item.position?.name || '');
          const locationStr = typeof item.location === 'string' ? item.location : (item.location?.name || '');
          
          const schoolStr = typeof item.schoolName === 'string' ? item.schoolName : (typeof item.school === 'string' ? item.school : (item.school?.name || ''));
          const degreeStr = typeof item.degreeName === 'string' ? item.degreeName : (typeof item.degree === 'string' ? item.degree : (item.degree?.name || ''));
          const fieldOfStudyStr = typeof item.fieldOfStudy === 'string' ? item.fieldOfStudy : '';
          
          let dateVal = item.dates || item.dateRange || item.date || item.year;
          let dateStr = '';
          if (dateVal) {
            if (typeof dateVal === 'object') {
              dateStr = (dateVal.start?.year || dateVal.start || '') + (dateVal.end ? ` - ${dateVal.end?.year || dateVal.end}` : '');
              if (!dateStr) dateStr = JSON.stringify(dateVal);
            } else {
              dateStr = String(dateVal);
            }
          }
          
          // If standard date fields are missing, try start_date and end_date
          if (!dateStr) {
            const startDate = item.start_date || item.startDate || item.start || '';
            const endDate = item.end_date || item.endDate || item.end || '';
            if (startDate && endDate) {
              const startStr = typeof startDate === 'string' ? startDate : (startDate?.text || JSON.stringify(startDate));
              const endStr = typeof endDate === 'string' ? endDate : (endDate?.text || JSON.stringify(endDate));
              dateStr = `${startStr} - ${endStr}`;
            } else if (startDate || endDate) {
              const dateVal = startDate || endDate;
              dateStr = typeof dateVal === 'string' ? dateVal : (dateVal?.text || JSON.stringify(dateVal));
            }
          }

          return (
          <div key={idx} className="bg-white border border-gray-100 shadow-sm p-4 rounded-xl relative overflow-hidden group">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h5 className="font-bold text-gray-900 text-sm">
              {titleStr || nameStr || schoolStr || companyNameStr || companyStr || 'Untitled'}
            </h5>
            
            {degreeStr && (
              <p className="text-xs font-medium text-primary-600 mt-1">
                {degreeStr}{fieldOfStudyStr ? ` in ${fieldOfStudyStr}` : ''}
              </p>
            )}
            
            {(companyStr && companyStr !== titleStr && companyStr !== nameStr) && (
              <p className="text-xs font-medium text-gray-600 mt-1">{companyStr}</p>
            )}
            {publisherStr && <p className="text-xs font-medium text-primary-600 mt-1">{publisherStr}</p>}
            {positionStr && <p className="text-xs font-medium text-primary-600 mt-1">{positionStr}</p>}
            
            {dateStr && (
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                 <Briefcase className="h-3 w-3 mr-1" />
                 {dateStr}
              </p>
            )}
            
            {locationStr && (
              <p className="text-xs text-gray-500 mt-1 flex items-center">
                 <MapPin className="h-3 w-3 mr-1" />
                 {locationStr}
              </p>
            )}

            {item.description && (
              <p className="text-xs text-gray-700 mt-2 bg-gray-50 p-2 rounded whitespace-pre-wrap">{typeof item.description === 'string' ? item.description : JSON.stringify(item.description)}</p>
            )}

            {item.profilePositions && Array.isArray(item.profilePositions) && (
              <div className="mt-3 pl-4 border-l-2 border-gray-100 space-y-3">
                {item.profilePositions.map((pos: any, pIdx: number) => {
                  let posDateVal = pos.dateRange || pos.dates;
                  let posDateStr = '';
                  if (posDateVal) {
                    if (typeof posDateVal === 'object') {
                      posDateStr = (posDateVal.start?.year || posDateVal.start || '') + (posDateVal.end ? ` - ${posDateVal.end?.year || posDateVal.end}` : '');
                      if (!posDateStr) posDateStr = JSON.stringify(posDateVal);
                    } else {
                      posDateStr = String(posDateVal);
                    }
                  }
                  
                  // If standard date fields are missing, try start_date and end_date
                  if (!posDateStr) {
                    const posStartDate = pos.start_date || pos.startDate || pos.start || '';
                    const posEndDate = pos.end_date || pos.endDate || pos.end || '';
                    if (posStartDate && posEndDate) {
                      const startStr = typeof posStartDate === 'string' ? posStartDate : (posStartDate?.text || JSON.stringify(posStartDate));
                      const endStr = typeof posEndDate === 'string' ? posEndDate : (posEndDate?.text || JSON.stringify(posEndDate));
                      posDateStr = `${startStr} - ${endStr}`;
                    } else if (posStartDate || posEndDate) {
                      const dateVal = posStartDate || posEndDate;
                      posDateStr = typeof dateVal === 'string' ? dateVal : (dateVal?.text || JSON.stringify(dateVal));
                    }
                  }
                  return (
                  <div key={pIdx}>
                    <h6 className="font-semibold text-gray-800 text-sm">{typeof pos.title === 'string' ? pos.title : (pos.title?.name || '')}</h6>
                    {posDateStr && <p className="text-xs text-gray-500 mt-0.5">{posDateStr}</p>}
                    {pos.location && <p className="text-xs text-gray-500 mt-0.5">{typeof pos.location === 'string' ? pos.location : (pos.location?.name || '')}</p>}
                    {pos.description && <p className="text-xs text-gray-600 mt-1 bg-gray-50 p-2 rounded whitespace-pre-wrap">{typeof pos.description === 'string' ? pos.description : JSON.stringify(pos.description)}</p>}
                  </div>
                )})}
              </div>
            )}
          </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full relative">
      {/* Header & Search */}
      <div className="p-6 border-b border-gray-200 bg-white">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Alumni Directory</h2>
            <button 
                onClick={handleExport}
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
                <Download className="h-4 w-4 mr-2" />
                Export CSV
            </button>
        </div>
        
        <form onSubmit={handleSearch} className="flex flex-col space-y-3">
          <div className="flex space-x-3">
            <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                type="text"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm shadow-sm"
                placeholder="Search by name, role, etc..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <button 
                type="button" 
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 border rounded-lg flex items-center justify-center transition-colors ${showFilters ? 'bg-primary-50 border-primary-200 text-primary-700' : 'bg-white border-gray-300 text-gray-600 hover:bg-gray-50'}`}
            >
                <Filter className="h-5 w-5" />
            </button>
            <button type="submit" className="px-6 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm">
                Search
            </button>
          </div>

          {showFilters && (
              <div className="flex space-x-4 p-4 bg-gray-50 border border-gray-200 rounded-lg animate-in slide-in-from-top-2">
                  <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Company</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Google" 
                        value={companyFilter}
                        onChange={(e) => setCompanyFilter(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                  </div>
                  <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                      <input 
                        type="text" 
                        placeholder="e.g. San Francisco" 
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        className="w-full border-gray-300 rounded-md shadow-sm sm:text-sm focus:ring-primary-500 focus:border-primary-500"
                      />
                  </div>
              </div>
          )}
        </form>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
        {loading && page === 1 ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : alumni.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
            <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No alumni found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your filters or search query.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alumni.map((person) => (
                <div 
                    key={person.id} 
                    className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-all group cursor-pointer"
                    onClick={() => setSelectedAlumni(person)}
                >
                    <div className="p-5">
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-bold text-gray-900 truncate pr-4">{person.full_name || 'Unknown Name'}</h3>
                        <a 
                        href={person.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gray-400 hover:text-primary-600 transition-colors"
                        onClick={(e) => e.stopPropagation()}
                        >
                        <ExternalLink className="h-5 w-5" />
                        </a>
                    </div>
                    
                    <div className="mt-4 space-y-2">
                        <div className="flex items-start text-sm text-gray-600">
                        <Briefcase className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{person.designation || 'No designation'}</span>
                        </div>
                        <div className="flex items-start text-sm text-gray-600">
                        <Building className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{person.company || 'No company'}</span>
                        </div>
                        <div className="flex items-start text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-400 flex-shrink-0" />
                        <span className="truncate">{formatLocation(person.location)}</span>
                        </div>
                    </div>
                    </div>
                    <div className="bg-gray-50 px-5 py-3 border-t border-gray-100 flex justify-between items-center">
                    <button 
                        onClick={(e) => handleDelete(e, person.id)}
                        className="text-gray-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                        title="Delete Alumni"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="flex space-x-2">
                        <button 
                            onClick={(e) => handleTrack(e, person.id)}
                            disabled={trackingId === person.id}
                            className={`text-xs font-medium text-white px-3 py-1.5 rounded-lg flex items-center transition-colors ${trackingId === person.id ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700'}`}
                        >
                            <RefreshCw className={`h-3 w-3 mr-1 ${trackingId === person.id ? 'animate-spin' : ''}`} /> 
                            {trackingId === person.id ? 'Tracking...' : 'Track'}
                        </button>
                        <button className="text-xs font-medium text-primary-600 hover:text-primary-800 transition-colors">
                            View Details
                        </button>
                    </div>
                    </div>
                </div>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="mt-8 flex justify-center items-center space-x-4">
                <button 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="p-2 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <span className="text-sm font-medium text-gray-700">Page {page}</span>
                <button 
                    onClick={() => setPage(p => p + 1)}
                    disabled={!hasMore}
                    className="p-2 rounded-full border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    <ChevronRight className="h-5 w-5" />
                </button>
            </div>
          </>
        )}
      </div>

      {/* Details Modal */}
      {selectedAlumni && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50">
              <div className="flex-1">
                <div className="flex items-center space-x-4">
                  {selectedAlumni.profile_picture ? (
                    <img src={selectedAlumni.profile_picture} alt={selectedAlumni.full_name} className="w-16 h-16 rounded-full object-cover shadow-sm border border-gray-200" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xl font-bold shadow-sm border border-primary-200">
                      {selectedAlumni.full_name?.charAt(0) || 'A'}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h2 className="text-2xl font-bold text-gray-900">{selectedAlumni.full_name}</h2>
                      {selectedAlumni.skills || selectedAlumni.education || selectedAlumni.experience ? (
                        <span className="px-2.5 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">Tracked ✓</span>
                      ) : (
                        <span className="px-2.5 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">Prefilled Only</span>
                      )}
                    </div>
                    <a href={selectedAlumni.linkedin_url} target="_blank" rel="noreferrer" className="text-primary-600 hover:underline text-sm flex items-center mt-1">
                      LinkedIn Profile <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedAlumni(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors flex-shrink-0 ml-4"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              {/* Basic Info Section - From Upload */}
              <div className="mb-8 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-2 mb-4">
                  <h4 className="text-lg font-bold text-gray-900">Basic Information</h4>
                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">From Upload</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Current Role</p>
                    <p className="text-gray-900 font-semibold flex items-center">
                      <Briefcase className="h-4 w-4 mr-2 text-blue-600" />
                      {selectedAlumni.designation || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Company</p>
                    <p className="text-gray-900 font-semibold flex items-center">
                      <Building className="h-4 w-4 mr-2 text-blue-600" />
                      {selectedAlumni.company || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-xl border border-blue-200 md:col-span-2">
                    <p className="text-xs text-blue-600 font-medium uppercase tracking-wider mb-1">Location</p>
                    <p className="text-gray-900 font-semibold flex items-center">
                      <MapPin className="h-4 w-4 mr-2 text-blue-600" />
                      {formatLocation(selectedAlumni.location)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Uploaded Details */}
              {selectedAlumni.extra_data && Object.keys(selectedAlumni.extra_data).length > 0 && (
                <div className="mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <h4 className="text-lg font-bold text-gray-900">Uploaded Details</h4>
                    <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">From File</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(selectedAlumni.extra_data).map(([key, value]) => (
                      <div key={key} className="bg-white border border-blue-100 shadow-sm p-3 rounded-xl">
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{key}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1">{String(value) || 'N/A'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* LinkedIn Tracked Data Section */}
              {(selectedAlumni.summary || selectedAlumni.connection_count || selectedAlumni.follower_count || selectedAlumni.skills) && (
                <div className="mb-8 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-2 mb-4">
                    <h4 className="text-lg font-bold text-gray-900">LinkedIn Profile</h4>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">From Tracking</span>
                  </div>
                  
                  {/* Summary and Stats */}
                  {selectedAlumni.summary && (
                    <div className="mb-4">
                      <h5 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-2">About</h5>
                      <p className="text-sm text-gray-700 bg-white border border-gray-200 p-4 rounded-xl leading-relaxed whitespace-pre-wrap shadow-sm">
                        {selectedAlumni.summary}
                      </p>
                    </div>
                  )}
                  <div className="flex space-x-4 text-sm">
                    {selectedAlumni.connection_count !== undefined && (
                      <div className="flex flex-col bg-green-50 border border-green-200 p-3 rounded-lg shadow-sm min-w-[120px]">
                        <span className="text-green-700 font-medium text-xs uppercase tracking-wider">Connections</span>
                        <span className="text-xl font-bold text-green-900">{selectedAlumni.connection_count}</span>
                      </div>
                    )}
                    {selectedAlumni.follower_count !== undefined && (
                      <div className="flex flex-col bg-green-50 border border-green-200 p-3 rounded-lg shadow-sm min-w-[120px]">
                        <span className="text-green-700 font-medium text-xs uppercase tracking-wider">Followers</span>
                        <span className="text-xl font-bold text-green-900">{selectedAlumni.follower_count}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <h4 className="text-lg font-bold text-gray-900">Skills & Expertise</h4>
                    {selectedAlumni.skills && <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">Tracked</span>}
                  </div>
                  
                  {/* Skills */}
                  {selectedAlumni.skills && (
                    <div className="mb-4">
                      <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {Array.isArray(selectedAlumni.skills) ? 
                          selectedAlumni.skills.map((skill: any, i: number) => (
                            <span key={i} className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium">
                              {typeof skill === 'string' ? skill : skill.name || JSON.stringify(skill)}
                            </span>
                          )) : 
                          <p className="text-gray-600 text-sm">{JSON.stringify(selectedAlumni.skills)}</p>
                        }
                      </div>
                    </div>
                  )}

                  {/* Languages */}
                  {selectedAlumni.languages && Array.isArray(selectedAlumni.languages) && selectedAlumni.languages.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Languages</h5>
                      <div className="flex flex-wrap gap-2">
                          {selectedAlumni.languages.map((lang: any, i: number) => (
                            <span key={`lang-${i}`} className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium border border-green-100">
                              {typeof lang === 'string' ? lang : lang.name || JSON.stringify(lang)}
                            </span>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {selectedAlumni.certifications && Array.isArray(selectedAlumni.certifications) && selectedAlumni.certifications.length > 0 && (
                    <div className="mb-4">
                      <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Certifications</h5>
                      <div className="flex flex-col gap-2 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">
                          {selectedAlumni.certifications.map((cert: any, i: number) => (
                            <div key={`cert-${i}`} className="flex items-start">
                              <span className="mr-2 text-primary-500">•</span>
                              <span>{typeof cert === 'string' ? cert : cert.name || cert.title || JSON.stringify(cert)}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {!selectedAlumni.skills && !selectedAlumni.languages && !selectedAlumni.certifications && (
                    <p className="text-gray-400 text-sm italic">No skills or expertise data available. Trigger track to update.</p>
                  )}
                </div>

                {selectedAlumni.position_groups && (
                <div>
                  <div className="flex items-center space-x-2 mb-3 mt-6">
                    <h4 className="text-lg font-bold text-gray-900">Experience</h4>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">Tracked</span>
                  </div>
                  {renderRichArray(selectedAlumni.position_groups)}
                </div>
                )}

                {selectedAlumni.education && (
                <div>
                  <div className="flex items-center space-x-2 mb-3 mt-6">
                    <h4 className="text-lg font-bold text-gray-900">Education</h4>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">Tracked</span>
                  </div>
                  {renderRichArray(selectedAlumni.education)}
                </div>
                )}

                {selectedAlumni.organisations && (
                <div>
                  <div className="flex items-center space-x-2 mb-3 mt-6">
                    <h4 className="text-lg font-bold text-gray-900">Organisations</h4>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">Tracked</span>
                  </div>
                  {renderRichArray(selectedAlumni.organisations)}
                </div>
                )}

                {selectedAlumni.publications && (
                <div>
                  <div className="flex items-center space-x-2 mb-3 mt-6">
                    <h4 className="text-lg font-bold text-gray-900">Publications</h4>
                    <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">Tracked</span>
                  </div>
                  {renderRichArray(selectedAlumni.publications)}
                </div>
                )}

                {alumniHistory && alumniHistory.length > 0 && (
                <div>
                  <h4 className="text-lg font-bold text-gray-900 border-b pb-2 mb-3 mt-6">Profile Change History</h4>
                  <div className="space-y-3 mt-2">
                    {alumniHistory.map((log: any, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-200 shadow-sm p-4 rounded-xl relative overflow-hidden">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-gray-900 text-sm capitalize">{log.field_changed} updated</span>
                          <span className="text-xs text-gray-500">{new Date(log.detected_at).toLocaleDateString()}</span>
                        </div>
                        <div className="mt-2 flex items-center text-xs text-gray-700 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                          <span className="line-through text-gray-400">{log.old_value || 'None'}</span>
                          <span className="mx-2 text-gray-400">→</span>
                          <span className="font-semibold text-primary-600">{log.new_value || 'None'}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                )}
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
              <button 
                onClick={() => setSelectedAlumni(null)}
                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const UsersIcon = (props: any) => (
  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default AlumniList;
