"use client";
import { useEffect, useState } from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

type AnalyticsData = {
  performanceData?: Array<{ date: string; score: number; course: string; roundType: string }>;
  weatherImpact?: Array<{ condition: string; averageScore: number; count: number }>;
  trends?: Array<{ month: string; averageScore: number; rounds: number; bestScore: number; worstScore: number }>;
  distribution?: Array<{ range: string; count: number; percentage: number }>;
  comparison?: Array<{ course: string; averageScore: number; rounds: number; bestScore: number; worstScore: number }>;
};

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({});
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('performance');
  const [timePeriod, setTimePeriod] = useState('year');
  const [roundCount, setRoundCount] = useState<number | null>(null);

  const fetchRoundCount = async () => {
    try {
      console.log('Fetching round count...');
      const res = await fetch('/api/analytics?type=count');
      const data = await res.json();
      console.log('Round count response:', data);
      setRoundCount(data.count || 0);
    } catch (error) {
      console.error('Failed to fetch round count:', error);
    }
  };

  const fetchAnalytics = async (type: string) => {
    setLoading(true);
    try {
      console.log('Fetching analytics for type:', type, 'timePeriod:', timePeriod);
      const res = await fetch(`/api/analytics?type=${type}&timePeriod=${timePeriod}`);
      const data = await res.json();
      console.log('Analytics response for', type, ':', data);
      console.log('Data keys:', Object.keys(data));
      console.log('Data structure:', JSON.stringify(data, null, 2));
      
      // Extract the actual data array from the response
      // The API returns { performanceData: [...] } for performance type
      // So we need to extract the specific key from the response
      const actualData = data[`${type}Data`] || data[type] || data;
      console.log('Extracted data for', type, ':', actualData);
      console.log('Extracted data type:', typeof actualData);
      console.log('Extracted data is array:', Array.isArray(actualData));
      setAnalyticsData(prev => ({ ...prev, [type]: actualData }));
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoundCount();
    fetchAnalytics(selectedType);
  }, [selectedType, timePeriod]);

  // Debug analytics data
  useEffect(() => {
    console.log('Analytics data updated:', analyticsData);
    console.log('Selected type:', selectedType);
    console.log('Has performance data:', !!analyticsData.performanceData);
    console.log('Performance data is array:', Array.isArray(analyticsData.performanceData));
  }, [analyticsData, selectedType]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <main className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">📈</span>
          <h1 className="text-2xl font-bold text-[var(--header-color)]">Analytics Dashboard</h1>
        </div>
        <div className="flex gap-2">
          <select 
            className="border rounded p-2 bg-white dark:bg-gray-800 dark:text-white dark:border-gray-600 flex items-center gap-2"
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            <option value="month">📅 Last Month</option>
            <option value="year">📆 Last Year</option>
            <option value="all">📊 All Time</option>
          </select>
        </div>
      </div>

      {/* Analytics Type Selector */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { key: 'performance', label: 'Performance', icon: '📈' },
          { key: 'weather', label: 'Weather Impact', icon: '🌤️' },
          { key: 'trends', label: 'Trends', icon: '📊' },
          { key: 'distribution', label: 'Distribution', icon: '📋' },
          { key: 'course-comparison', label: 'Course Comparison', icon: '🥏' }
        ].map((type) => (
          <button
            key={type.key}
            className={`px-3 py-2 rounded-full text-sm whitespace-nowrap ${
              selectedType === type.key
                ? 'bg-[var(--color-brand)] text-[#002F45]'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-white'
            }`}
            onClick={() => setSelectedType(type.key)}
          >
            {type.icon} {type.label}
          </button>
        ))}
      </div>

      {/* Performance Chart */}
      {selectedType === 'performance' && analyticsData.performanceData && Array.isArray(analyticsData.performanceData) && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Performance Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#8884d8" name="Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Weather Impact Chart */}
      {selectedType === 'weather' && analyticsData.weatherImpact && Array.isArray(analyticsData.weatherImpact) && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Weather Impact on Performance</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.weatherImpact}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="condition" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="averageScore" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {analyticsData.weatherImpact.map((item, index) => (
              <div key={index} className="text-sm">
                <span className="font-semibold">{item.condition}:</span> {item.averageScore.toFixed(1)} avg ({item.count} rounds)
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Trends Chart */}
      {selectedType === 'trends' && analyticsData.trends && Array.isArray(analyticsData.trends) && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.trends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="averageScore" stroke="#8884d8" name="Average Score" />
              <Line type="monotone" dataKey="bestScore" stroke="#00C49F" name="Best Score" />
              <Line type="monotone" dataKey="worstScore" stroke="#FF8042" name="Worst Score" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Score Distribution */}
      {selectedType === 'distribution' && analyticsData.distribution && Array.isArray(analyticsData.distribution) && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Score Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.distribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="range" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Course Comparison */}
      {selectedType === 'course-comparison' && analyticsData.comparison && Array.isArray(analyticsData.comparison) && (
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Course Performance Comparison</h3>
          <div className="space-y-3">
            {analyticsData.comparison.map((course, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded">
                <div>
                  <div className="font-semibold">{course.course}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {course.rounds} rounds • Best: {course.bestScore} • Worst: {course.worstScore}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">{course.averageScore.toFixed(1)}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Average</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="card text-center py-8">
          <div className="text-gray-600 dark:text-white">Loading analytics...</div>
        </div>
      )}

      {/* No Data Message */}
      {!loading && selectedType && !analyticsData[selectedType as keyof AnalyticsData] && (
        <div className="card text-center py-8">
          <div className="text-gray-600 dark:text-white">
            <h3 className="text-lg font-semibold mb-2">No Analytics Data Yet</h3>
            {roundCount !== null && (
              <p className="mb-4">
                You have completed <strong>{roundCount} rounds</strong>. 
                You need at least <strong>3-5 rounds</strong> to see meaningful analytics.
              </p>
            )}
            <div className="text-sm text-gray-500 dark:text-gray-400">
              <p>• <strong>Performance charts</strong> need 3+ completed rounds</p>
              <p>• <strong>Weather analysis</strong> needs rounds with weather data</p>
              <p>• <strong>Trends & distribution</strong> need 5+ rounds for accuracy</p>
              <p>• <strong>Course comparison</strong> needs multiple courses played</p>
            </div>
            <div className="mt-4">
              <a 
                href="/new" 
                className="btn btn-primary"
              >
                Start Playing Rounds
              </a>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
