import { useState, useEffect } from 'react';
import api from '../services/api';
import { Users, FileText, Activity, Globe, Building } from 'lucide-react';

interface AnalyticsData {
  total_alumni: number;
  total_uploads: number;
  total_changes: number;
}

interface CountryData {
  country: string;
  count: number;
}

interface CompanyData {
  company: string;
  count: number;
}

const Analytics = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [countryData, setCountryData] = useState<CountryData[]>([]);
  const [companyData, setCompanyData] = useState<CompanyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
    fetchCountryDistribution();
    fetchCompanyDistribution();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/analytics/summary');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCountryDistribution = async () => {
    try {
      const response = await api.get('/analytics/country-distribution');
      setCountryData(response.data);
    } catch (error) {
      console.error('Failed to fetch country distribution', error);
    }
  };

  const fetchCompanyDistribution = async () => {
    try {
      const response = await api.get('/analytics/company-distribution');
      setCompanyData(response.data);
    } catch (error) {
      console.error('Failed to fetch company distribution', error);
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
    <div className="p-8 h-full bg-gray-50 overflow-y-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="mt-2 text-gray-600">Key metrics and recent activity across your platform.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        
        {/* Card 1 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="bg-primary-50 p-4 rounded-xl mr-5">
            <Users className="h-8 w-8 text-primary-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Alumni Tracked</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{data?.total_alumni || 0}</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="bg-green-50 p-4 rounded-xl mr-5">
            <FileText className="h-8 w-8 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total CSV Uploads</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{data?.total_uploads || 0}</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center">
          <div className="bg-purple-50 p-4 rounded-xl mr-5">
            <Activity className="h-8 w-8 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Career Changes Detected</p>
            <p className="text-3xl font-bold text-gray-900 mt-1">{data?.total_changes || 0}</p>
          </div>
        </div>

      </div>

      {/* Advanced Analytics - Country-wise Distribution */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mt-8">
        <div className="flex items-center mb-6">
          <Globe className="h-6 w-6 text-blue-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Country-wise Distribution</h3>
        </div>
        
        {countryData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Country/Region</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Alumni Count</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Percentage</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {countryData.map((item, index) => {
                  const total = countryData.reduce((sum, d) => sum + d.count, 0);
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  const barWidth = Math.min(100, (item.count / countryData[0].count) * 100);
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-4 px-4 text-gray-900 font-medium">{item.country}</td>
                      <td className="text-right py-4 px-4 text-gray-700 font-semibold">{item.count}</td>
                      <td className="py-4 px-4 text-gray-600">{percentage}%</td>
                      <td className="py-4 px-4">
                        <div className="w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-blue-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Globe className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No location data available</p>
          </div>
        )}
      </div>

      {/* Advanced Analytics - Company-wise Distribution */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mt-8">
        <div className="flex items-center mb-6">
          <Building className="h-6 w-6 text-purple-600 mr-3" />
          <h3 className="text-xl font-bold text-gray-900">Company-wise Distribution</h3>
        </div>
        
        {companyData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Company/Organization</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Alumni Count</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Percentage</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Distribution</th>
                </tr>
              </thead>
              <tbody>
                {companyData.map((item, index) => {
                  const total = companyData.reduce((sum, d) => sum + d.count, 0);
                  const percentage = ((item.count / total) * 100).toFixed(1);
                  const barWidth = Math.min(100, (item.count / companyData[0].count) * 100);
                  
                  return (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition">
                      <td className="py-4 px-4 text-gray-900 font-medium">{item.company}</td>
                      <td className="text-right py-4 px-4 text-gray-700 font-semibold">{item.count}</td>
                      <td className="py-4 px-4 text-gray-600">{percentage}%</td>
                      <td className="py-4 px-4">
                        <div className="w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-purple-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${barWidth}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No company data available</p>
          </div>
        )}
      </div>

    </div>
  );
};

export default Analytics;
