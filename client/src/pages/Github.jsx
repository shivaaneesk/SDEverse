// src/components/MoreInfo/Github.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { refreshSingleSocialStat } from '../features/user/userSlice';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart, 
  Pie, 
  Cell,
  Legend
} from 'recharts';
import CalendarHeatmap from "react-calendar-heatmap";

import { Tooltip as ReactTooltip } from 'react-tooltip';
import { ExternalLink, Star, GitFork, Code, Activity } from 'lucide-react';
import Loader from "../components/Loader";

const Github = () => {
  const dispatch = useDispatch();
  const { myProfile, status } = useSelector((state) => state.user);
  const githubStats = myProfile?.socialStats?.github || {};
  const isLoading = status.updateSingleSocialStat === 'loading';

  useEffect(() => {
    if (!githubStats.updatedAt) {
      dispatch(refreshSingleSocialStat('github'));
    }
  }, [dispatch, githubStats.updatedAt]);

  // Prepare heatmap data
  const prepareHeatmapData = () => {
    if (!githubStats.activityAnalysis?.heatmap) return [];
    
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    
    const data = [];
    const heatmap = githubStats.activityAnalysis.heatmap;
    
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      data.push({
        date: new Date(d),
        count: heatmap[dateStr] || 0,
      });
    }
    
    return data;
  };

  // Prepare language data
  const prepareLanguageData = () => {
    if (!githubStats.technicalProfile?.topLanguages) return [];
    return githubStats.technicalProfile.topLanguages.map(lang => ({
      name: lang.language,
      value: lang.bytes,
    }));
  };

  // Prepare activity data
  const prepareActivityData = () => {
    if (!githubStats.activityAnalysis?.contributionTypes) return [];
    
    return Object.entries(githubStats.activityAnalysis.contributionTypes)
      .filter(([key]) => key !== 'totalActivity')
      .map(([key, value]) => ({
        name: key.replace('Event', ''),
        value,
      }))
      .sort((a, b) => b.value - a.value);
  };

  // Heatmap tooltip
  const heatmapTooltip = (value) => {
    if (!value || value.count === 0) return null;
    return (
      <div className="bg-white p-2 rounded shadow-md text-sm">
        <strong>{value.count} contributions</strong>
        <div>{value.date.toDateString()}</div>
      </div>
    );
  };

  // Format heatmap date
  const formatHeatmapDate = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Activity level colors
  const getActivityColor = (count) => {
    if (count === 0) return '#ebedf0';
    if (count < 3) return '#9be9a8';
    if (count < 5) return '#40c463';
    if (count < 10) return '#30a14e';
    return '#216e39';
  };

  // Language colors (predefined for popular languages)
  const languageColors = {
    JavaScript: '#f1e05a',
    TypeScript: '#3178c6',
    Python: '#3572A5',
    Java: '#b07219',
    HTML: '#e34c26',
    CSS: '#563d7c',
    PHP: '#4F5D95',
    Ruby: '#701516',
    C: '#555555',
    'C++': '#f34b7d',
    Swift: '#ffac45',
    Kotlin: '#F18E33',
    Go: '#00ADD8',
    Rust: '#dea584',
    Shell: '#89e051',
    'C#': '#178600',
    Vue: '#41b883',
    React: '#61dafb',
    Angular: '#dd0031',
    Svelte: '#ff3e00',
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="lg" />
      </div>
    );
  }

  if (!githubStats.publicRepos) {
    return (
      <div className="text-center py-10">
        <div className="text-2xl font-bold mb-2">No GitHub Data Available</div>
        <p className="text-gray-600 mb-4">
          We couldn't find any GitHub statistics for this profile.
        </p>
        <button
          onClick={() => dispatch(refreshSingleSocialStat('github'))}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
        >
          Refresh GitHub Stats
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">GitHub Profile</h1>
          <div className="flex items-center text-gray-600">
            <span className="mr-4">Account age: {githubStats.accountAgeYears} years</span>
            <span>Last updated: {formatDate(githubStats.updatedAt)}</span>
          </div>
        </div>
        <a
          href={githubStats.profileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 md:mt-0 flex items-center text-blue-600 hover:text-blue-800"
        >
          View on GitHub <ExternalLink className="ml-2 w-4 h-4" />
        </a>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard 
          icon={<Star className="w-6 h-6" />} 
          title="Stars" 
          value={githubStats.repoStats?.totalStars} 
        />
        <StatCard 
          icon={<GitFork className="w-6 h-6" />} 
          title="Forks" 
          value={githubStats.repoStats?.totalForks} 
        />
        <StatCard 
          icon={<Code className="w-6 h-6" />} 
          title="Repositories" 
          value={githubStats.publicRepos} 
        />
        <StatCard 
          icon={<Activity className="w-6 h-6" />} 
          title="Active Repos" 
          value={githubStats.repoStats?.activeRepos} 
          total={githubStats.publicRepos} 
        />
      </div>

      {/* Heatmap */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Contribution Activity</h2>
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            <CalendarHeatmap
              startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
              endDate={new Date()}
              values={prepareHeatmapData()}
              classForValue={(value) => {
                if (!value) return 'color-empty';
                return `color-scale-${Math.min(value.count, 10)}`;
              }}
              tooltipContent={heatmapTooltip}
              showWeekdayLabels
            />
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Less</span>
              <div className="flex">
                {[0, 1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className="w-4 h-4 mx-1"
                    style={{ backgroundColor: getActivityColor(level) }}
                  />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Languages Chart */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Language Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={prepareLanguageData()}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {prepareLanguageData().map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={languageColors[entry.name] || '#8884d8'} 
                    />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${Math.round(value / 1000)} KB`, 'Size']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Activity Types */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Activity Breakdown</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={prepareActivityData()}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Repository Insights */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Repository Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Most Starred Repository</h3>
            {githubStats.repoStats?.mostStarredRepo ? (
              <div className="border rounded-lg p-4 hover:bg-gray-50">
                <a 
                  href={githubStats.repoStats.mostStarredRepo.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  {githubStats.repoStats.mostStarredRepo.name}
                </a>
                <div className="flex mt-2">
                  <div className="flex items-center mr-4">
                    <Star className="w-4 h-4 mr-1 text-yellow-500" />
                    <span>{githubStats.repoStats.mostStarredRepo.stars} stars</span>
                  </div>
                  <div className="text-gray-500 text-sm">
                    Updated: {formatDate(githubStats.repoStats.mostStarredRepo.updatedAt)}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No data available</p>
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-2">Repository Health</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between mb-1">
                  <span>Active Repositories</span>
                  <span>{githubStats.repoStats?.activeRepos || 0} / {githubStats.publicRepos}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-green-600 h-2.5 rounded-full" 
                    style={{ 
                      width: `${githubStats.publicRepos ? ((githubStats.repoStats?.activeRepos || 0) / githubStats.publicRepos * 100) : 0}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <span>External Contributions</span>
                  <span>{githubStats.activityAnalysis?.externalContributions || 0}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ 
                      width: `${githubStats.activityAnalysis?.externalContributionRatio * 100 || 0}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Community */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Community Involvement</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Organizations</h3>
            {githubStats.community?.organizations?.length > 0 ? (
              <div className="flex flex-wrap gap-3">
                {githubStats.community.organizations.map((org, index) => (
                  <a
                    key={index}
                    href={org.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center"
                    data-tooltip-id="org-tooltip"
                    data-tooltip-content={org.name}
                  >
                    {org.avatar ? (
                      <img 
                        src={org.avatar} 
                        alt={org.name} 
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                    )}
                  </a>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">Not part of any organizations</p>
            )}
          </div>
          
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Interests</h3>
            <div>
              <p className="mb-2">
                Starred <span className="font-semibold">{githubStats.community?.starredRepos || 0}</span> repositories
              </p>
              {githubStats.community?.topStarredLanguages?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {githubStats.community.topStarredLanguages.map((lang, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ReactTooltip id="org-tooltip" />
    </div>
  );
};

// Stat card component
const StatCard = ({ icon, title, value, total }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-100">
    <div className="flex items-center">
      <div className="p-2 bg-blue-50 rounded-lg mr-3">
        {icon}
      </div>
      <div>
        <div className="text-gray-600 text-sm">{title}</div>
        <div className="text-2xl font-bold">{value || 0}</div>
        {total && (
          <div className="text-xs text-gray-500">
            {Math.round((value / total) * 100)}% of total
          </div>
        )}
      </div>
    </div>
  </div>
);

export default Github;