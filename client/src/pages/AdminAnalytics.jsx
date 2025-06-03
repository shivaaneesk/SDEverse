import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { 
  FiUsers, 
  FiShield, 
  FiCode, 
  FiFileText, 
  FiMessageSquare, 
  FiActivity,
  FiPieChart,
  FiBarChart2,
  FiCalendar,
  FiTrendingUp,
  FiDatabase,
  FiUserCheck,
  FiUserX,
  FiClock
} from "react-icons/fi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from "recharts";
import { useDispatch, useSelector } from "react-redux";
import { getAdminAnalytics } from "../features/user/userSlice";
import Loader from "../components/Loader";
import FeedbackList from './FeedbackList';
// Optimized color palette for dark theme
const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#10b981', '#0ea5e9'];
const DARK_COLORS = ['#818cf8', '#a78bfa', '#f472b6', '#fb923c', '#34d399', '#38bdf8'];

const AdminAnalytics = () => {
  const dispatch = useDispatch();
  const adminAnalytics = useSelector((state) => state.user.adminAnalytics);
  const status = useSelector((state) => state.user.status.fetchAdminAnalytics);
  const error = useSelector((state) => state.user.error.fetchAdminAnalytics);
  const isLoading = status === "loading";

  useEffect(() => {
    dispatch(getAdminAnalytics());
  }, [dispatch]);

  // Calculate metrics based on new JSON structure
  const totalUsers = adminAnalytics?.platformMetrics?.totalUsers || 0;
  const activeUsers = adminAnalytics?.platformMetrics?.activeUsersLast30Days || 0;
  const inactiveUsers = Math.max(0, totalUsers - activeUsers);
  const activePercentage = totalUsers ? Math.round((activeUsers / totalUsers) * 100) : 0;

  // Role distribution
  const roleData = adminAnalytics?.userDemographics?.roleDistribution || [];
  const rolePercentages = roleData.map(role => ({
    ...role,
    percentage: totalUsers ? Math.round((role.count / totalUsers) * 100) : 0
  }));

  // Format daily stats for charts
  const formatDailyStats = () => {
    if (!adminAnalytics?.dailyStats) return [];
    
    const today = new Date();
    const dateMap = {};
    
    // Create empty entries for last 30 days
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = `${date.getMonth() + 1}/${date.getDate()}`;
      dateMap[dateString] = {
        date: dateString,
        newUsers: 0,
        newAlgorithms: 0,
        newProposals: 0,
        newComments: 0,
      };
    }
    
    // Populate with actual data
    const populateData = (data, key) => {
      data?.forEach(item => {
        const date = `${item._id.month}/${item._id.day}`;
        if (dateMap[date]) {
          dateMap[date][key] = item.count;
        }
      });
    };
    
    populateData(adminAnalytics.dailyStats.newUsers, "newUsers");
    populateData(adminAnalytics.dailyStats.newAlgorithms, "newAlgorithms");
    populateData(adminAnalytics.dailyStats.newProposals, "newProposals");
    populateData(adminAnalytics.dailyStats.newComments, "newComments");
    
    return Object.values(dateMap);
  };

  const dailyData = formatDailyStats();

  // Enhanced stats cards
  const statCards = [
    {
      title: "Total Users",
      value: totalUsers,
      icon: <FiUsers className="text-indigo-400" size={24} />,
      color: "bg-indigo-900/30 text-indigo-300",
      trend: `${activePercentage}% active`
    },
    {
      title: "Admins",
      value: adminAnalytics?.platformMetrics?.totalAdmins || 0,
      icon: <FiShield className="text-purple-400" size={24} />,
      color: "bg-purple-900/30 text-purple-300",
      trend: `${Math.round((adminAnalytics?.platformMetrics?.totalAdmins || 0) / totalUsers * 100) || 0}% of total`
    },
    {
      title: "Algorithms",
      value: adminAnalytics?.platformMetrics?.totalAlgorithms || 0,
      icon: <FiCode className="text-pink-400" size={24} />,
      color: "bg-pink-900/30 text-pink-300",
      trend: `${parseFloat(adminAnalytics?.userEngagement?.avgAlgorithmsPerUser || 0).toFixed(2)} per user`
    },
    {
      title: "Proposals",
      value: adminAnalytics?.platformMetrics?.totalProposals || 0,
      icon: <FiFileText className="text-orange-400" size={24} />,
      color: "bg-orange-900/30 text-orange-300",
      trend: `${adminAnalytics?.qualityMetrics?.proposalApprovalRate || 0}% approved`
    },
    {
      title: "Comments",
      value: adminAnalytics?.platformMetrics?.totalComments || 0,
      icon: <FiMessageSquare className="text-emerald-400" size={24} />,
      color: "bg-emerald-900/30 text-emerald-300",
      trend: `${parseFloat(adminAnalytics?.userEngagement?.avgCommentsPerUser || 0).toFixed(2)} per user`
    },
    {
      title: "Active Users",
      value: activeUsers,
      icon: <FiActivity className="text-cyan-400" size={24} />,
      color: "bg-cyan-900/30 text-cyan-300",
      trend: `${inactiveUsers} inactive`
    }
  ];

  // Engagement metrics
  const engagementMetrics = [
    {
      title: "Algorithm Contributors",
      value: adminAnalytics?.userEngagement?.userActivityBreakdown?.algorithmContributors || 0,
      icon: <FiCode className="text-yellow-400" size={20} />,
      desc: "Active contributors"
    },
    {
      title: "Proposal Contributors",
      value: adminAnalytics?.userEngagement?.userActivityBreakdown?.proposalContributors || 0,
      icon: <FiFileText className="text-green-400" size={20} />,
      desc: "Active contributors"
    },
    {
      title: "Comment Contributors",
      value: adminAnalytics?.userEngagement?.userActivityBreakdown?.commentContributors || 0,
      icon: <FiMessageSquare className="text-red-400" size={20} />,
      desc: "Active contributors"
    },
    {
      title: "Approval Rate",
      value: `${adminAnalytics?.qualityMetrics?.proposalApprovalRate || 0}%`,
      icon: <FiTrendingUp className="text-blue-400" size={20} />,
      desc: "Proposal success rate"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <Loader size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-950">
        <div className="text-center p-8 bg-red-900/30 rounded-xl max-w-md border border-gray-800">
          <h2 className="text-xl font-bold text-red-300 mb-2">Error Loading Analytics</h2>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => dispatch(getAdminAnalytics())}
            className="px-4 py-2 bg-red-700 text-white rounded-lg hover:bg-red-600 transition"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-gray-950 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-gray-400 mt-2">
            Comprehensive analytics and insights about your platform
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full text-sm">
              Last updated: {new Date().toLocaleString()}
            </span>
            <span className="px-3 py-1 bg-green-900/30 text-green-300 rounded-full text-sm">
              {totalUsers} users
            </span>
            <span className="px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full text-sm">
              {adminAnalytics?.platformMetrics?.totalAlgorithms || 0} algorithms
            </span>
            <span className="px-3 py-1 bg-orange-900/30 text-orange-300 rounded-full text-sm">
              {adminAnalytics?.qualityMetrics?.proposalApprovalRate || 0}% approval rate
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-gray-800 p-6 hover:shadow-lg transition-all bg-gray-900/50 backdrop-blur-sm"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                  <h3 className="text-3xl font-bold mt-2 text-white">{stat.value.toLocaleString()}</h3>
                  <p className="text-sm mt-2 text-gray-400 flex items-center gap-1">
                    {stat.trend}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-gray-800">
                  {stat.icon}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Engagement Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-gray-800 p-6 mb-8 bg-gray-900/50 backdrop-blur-sm"
        >
          <h2 className="text-lg font-semibold text-white mb-6">Engagement Metrics</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {engagementMetrics.map((metric, index) => (
              <div 
                key={metric.title}
                className="p-4 rounded-lg bg-gray-800 border border-gray-700"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-700">
                    {metric.icon}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">{metric.title}</p>
                    <p className="text-xl font-bold mt-1 text-white">{metric.value}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">{metric.desc}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Main Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Daily Activity Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl border border-gray-800 p-6 bg-gray-900/50 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">Daily Activity (Last 30 Days)</h2>
              <div className="flex items-center text-gray-400">
                <FiCalendar className="mr-2" />
                <span>Last 30 days</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dailyData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DARK_COLORS[0]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={DARK_COLORS[0]} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorAlgorithms" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DARK_COLORS[1]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={DARK_COLORS[1]} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProposals" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DARK_COLORS[2]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={DARK_COLORS[2]} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={DARK_COLORS[3]} stopOpacity={0.8}/>
                      <stop offset="95%" stopColor={DARK_COLORS[3]} stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: '0.5rem',
                      color: "#f3f4f6"
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="newUsers" 
                    stroke={DARK_COLORS[0]} 
                    fillOpacity={1} 
                    fill="url(#colorUsers)" 
                    name="New Users" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="newAlgorithms" 
                    stroke={DARK_COLORS[1]} 
                    fillOpacity={1} 
                    fill="url(#colorAlgorithms)" 
                    name="New Algorithms" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="newProposals" 
                    stroke={DARK_COLORS[2]} 
                    fillOpacity={1} 
                    fill="url(#colorProposals)" 
                    name="New Proposals" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="newComments" 
                    stroke={DARK_COLORS[3]} 
                    fillOpacity={1} 
                    fill="url(#colorComments)" 
                    name="New Comments" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Role Distribution Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-xl border border-gray-800 p-6 bg-gray-900/50 backdrop-blur-sm"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white">User Role Distribution</h2>
              <div className="flex items-center text-gray-400">
                <FiPieChart className="mr-2" />
                <span>{totalUsers} Total Users</span>
              </div>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={rolePercentages}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="percentage"
                    nameKey="_id"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {rolePercentages.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={DARK_COLORS[index % DARK_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}%`, "Percentage"]}
                    contentStyle={{ 
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: '0.5rem',
                      color: "#f3f4f6"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Activity Trends */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl border border-gray-800 p-6 mb-8 bg-gray-900/50 backdrop-blur-sm"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold text-white">Activity Trends (Last 7 Days)</h2>
            <div className="flex items-center text-gray-400">
              <FiBarChart2 className="mr-2" />
              <span>Daily Comparison</span>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
              <p className="text-sm text-gray-400">Avg. Users/Day</p>
              <p className="text-2xl font-bold mt-1 text-white">
                {dailyData.length 
                  ? Math.round(dailyData.reduce((sum, day) => sum + day.newUsers, 0) / dailyData.length) 
                  : 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
              <p className="text-sm text-gray-400">Avg. Algorithms/Day</p>
              <p className="text-2xl font-bold mt-1 text-white">
                {dailyData.length 
                  ? Math.round(dailyData.reduce((sum, day) => sum + day.newAlgorithms, 0) / dailyData.length) 
                  : 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
              <p className="text-sm text-gray-400">Avg. Proposals/Day</p>
              <p className="text-2xl font-bold mt-1 text-white">
                {dailyData.length 
                  ? Math.round(dailyData.reduce((sum, day) => sum + day.newProposals, 0) / dailyData.length) 
                  : 0}
              </p>
            </div>
            <div className="p-4 rounded-lg bg-gray-800 border border-gray-700">
              <p className="text-sm text-gray-400">Avg. Comments/Day</p>
              <p className="text-2xl font-bold mt-1 text-white">
                {dailyData.length 
                  ? Math.round(dailyData.reduce((sum, day) => sum + day.newComments, 0) / dailyData.length) 
                  : 0}
              </p>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={dailyData.slice(-7)}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="date" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1f2937",
                    border: "1px solid #374151",
                    borderRadius: '0.5rem',
                    color: "#f3f4f6"
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="newUsers" 
                  name="New Users" 
                  fill={DARK_COLORS[0]} 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="newAlgorithms" 
                  name="New Algorithms" 
                  fill={DARK_COLORS[1]} 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="newProposals" 
                  name="New Proposals" 
                  fill={DARK_COLORS[2]} 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="newComments" 
                  name="New Comments" 
                  fill={DARK_COLORS[3]} 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Role Distribution Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl border border-gray-800 overflow-hidden bg-gray-900/50 backdrop-blur-sm"
        >
          <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">User Roles Breakdown</h2>
            <span className="text-sm text-gray-400">
              {rolePercentages.length} roles • {totalUsers} users
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800">
              <thead className="bg-gray-800">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    User Count
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Percentage
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                    Active Users
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gray-900/50 divide-y divide-gray-800">
                {rolePercentages.map((role, index) => (
                  <tr key={`${role._id}-${index}`} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: DARK_COLORS[index % DARK_COLORS.length] }} 
                        />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-white capitalize">{role._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{role.count.toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-700 rounded-full h-2 mr-3">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${role.percentage}%`,
                              backgroundColor: DARK_COLORS[index % DARK_COLORS.length]
                            }}
                          />
                        </div>
                        <span className="text-sm text-white">{role.percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-white">
                        {Math.round(activeUsers * (role.percentage / 100))}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Additional Content Distribution Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Algorithms by Difficulty */}
          <div className="rounded-xl border border-gray-800 p-6 bg-gray-900/50 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-6">Algorithms by Difficulty</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={adminAnalytics?.contentDistribution?.algorithmsByDifficulty || []}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="_id" stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: '0.5rem',
                      color: "#f3f4f6"
                    }}
                  />
                  <Bar 
                    dataKey="count" 
                    name="Algorithms" 
                    fill={DARK_COLORS[0]} 
                    radius={[4, 4, 0, 0]} 
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Proposals by Status */}
          <div className="rounded-xl border border-gray-800 p-6 bg-gray-900/50 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-white mb-6">Proposals by Status</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={adminAnalytics?.contentDistribution?.proposalsByStatus || []}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="_id"
                    label={({ name, count }) => `${name}: ${count}`}
                  >
                    {adminAnalytics?.contentDistribution?.proposalsByStatus?.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={DARK_COLORS[index % DARK_COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1f2937",
                      border: "1px solid #374151",
                      borderRadius: '0.5rem',
                      color: "#f3f4f6"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
    <div className="container mx-auto px-4 py-8">
      <FeedbackList />
    </div>
    </>
  );
};

export default AdminAnalytics;