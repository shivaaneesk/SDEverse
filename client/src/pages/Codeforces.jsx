import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyProfile,
  refreshCompetitiveStats,
} from "../features/user/userSlice";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  Legend,
} from "recharts";

import { formatDistanceToNowStrict, parseISO, fromUnixTime } from "date-fns";

const LIGHT_COLORS = [
  "#14B8A6",
  "#8B5CF6",
  "#FB7185",
  "#F59E0B",
  "#3B82F6",
  "#EF4444",
];
const DARK_COLORS = [
  "#2DD4BF",
  "#C4B5FD",
  "#FCA5A5",
  "#FBBF24",
  "#60A5FA",
  "#F87171",
];

const Codeforces = () => {
  const dispatch = useDispatch();
  const { myProfile, status, error } = useSelector((state) => state.user);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showConstestDetails, setShowConstestDetails] = useState(false);

  useEffect(() => {
    dispatch(getMyProfile());
    dispatch(refreshCompetitiveStats());
  }, [dispatch]);

  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);
    const handler = (e) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener("change", handler);
    return () => darkModeQuery.removeEventListener("change", handler);
  }, []);

  const cfStats = myProfile?.extraCompetitiveStats?.codeforces;
  const summary = cfStats?.summary;
  const moreInfo = cfStats?.moreInfo;
  const profileUrl = cfStats?.profileUrl;
  const userHandle = moreInfo?.contests?.[0]?.handle || "Unknown";

  let tagsData = [];
  if (moreInfo?.solvedByTags) {
    tagsData = Object.entries(moreInfo.solvedByTags)
      .map(([tag, solved], idx) => ({
        tag,
        solved,
        color: (isDarkMode ? DARK_COLORS : LIGHT_COLORS)[
          idx % (isDarkMode ? DARK_COLORS.length : LIGHT_COLORS.length)
        ],
      }))
      .sort((a, b) => b.solved - a.solved);
  }

  function getRatingColor(rating) {
    if (rating >= 3000) return "#AA0000";
    if (rating >= 2600) return "#FF0000";
    if (rating >= 2400) return "#FF8C00";
    if (rating >= 2300) return "#FFA500";
    if (rating >= 2100) return "#FFCC00";
    if (rating >= 1900) return "#AA00FF";
    if (rating >= 1600) return "#0000FF";
    if (rating >= 1400) return "#00FFFF";
    if (rating >= 1200) return "#00FF00";
    return "#808080";
  }

  const ratingHistory = (moreInfo?.contests || [])
    .filter((item) => item.newRating && item.ratingUpdateTimeSeconds)
    .sort((a, b) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds)
    .map((item) => ({
      date: new Date(item.ratingUpdateTimeSeconds * 1000).toISOString(),
      rating: item.newRating,
      oldRating: item.oldRating,
      rank: item.rank,
      contestName: item.contestName,
    }));

  let lastContestRelative = "N/A";
  if (summary?.lastContestDate) {
    try {
      lastContestRelative = formatDistanceToNowStrict(
        parseISO(summary.lastContestDate),
        { addSuffix: true }
      );
    } catch {
      lastContestRelative = "N/A";
    }
  }

  let lastOnlineRelative = "N/A";
  if (moreInfo?.lastOnlineTimeSeconds) {
    try {
      lastOnlineRelative = formatDistanceToNowStrict(
        fromUnixTime(moreInfo.lastOnlineTimeSeconds),
        { addSuffix: true }
      );
    } catch {
      lastOnlineRelative = "N/A";
    }
  }

  const rankColors = {
    newbie: "#808080",
    pupil: "#03a89e",
    specialist: "#03a89e",
    expert: "#0000ff",
    "candidate master": "#a000a0",
    master: "#ff8c00",
    "international master": "#ff8c00",
    grandmaster: "#ff0000",
    "international grandmaster": "#ff0000",
    "legendary grandmaster": "#ff0000",
  };
  const rankColor =
    rankColors[(summary?.rank || "").toLowerCase()] || "#14B8A6";
  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  if (
    status?.fetchProfile === "loading" ||
    status?.updateCompetitiveStats === "loading"
  ) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-6">
          Codeforces Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Fetching your competitive programming stats...
        </p>
      </section>
    );
  }

  if (error?.fetchProfile || error?.updateCompetitiveStats) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-red-600 mb-6">
          Codeforces Insights
        </h1>
        <p className="text-red-600 text-lg">
          Failed to load your stats:{" "}
          {error.fetchProfile || error.updateCompetitiveStats}
        </p>
      </section>
    );
  }

  if (!cfStats || !summary || !moreInfo) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-6">
          Codeforces Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          No competitive programming stats found in your profile yet.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-colors duration-500">
      {/* Header */}
      <header className="mb-10 text-center px-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-teal-700 dark:text-teal-400 mb-2">
          Codeforces Competitive Insights
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg max-w-xl mx-auto">
          A comprehensive overview of your LeetCode competitive programming
          performance.
        </p>
        <p className="text-gray-700 dark:text-teal-300 text-lg max-w-2xl mx-auto">
          Handle: <span className="font-semibold">{userHandle}</span>
        </p>
        {profileUrl && (
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-4 px-6 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg font-semibold shadow-md transition"
          >
            View Full Profile
          </a>
        )}
      </header>

      {/* Summary Cards */}
      <section className="mb-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 px-4">
        <div className="bg-teal-50 dark:bg-teal-900 rounded-xl p-5 text-center shadow-lg hover:scale-105 transform transition-transform duration-300">
          <h3 className="text-lg font-semibold text-teal-700 dark:text-teal-300 mb-1">
            Max Rating
          </h3>
          <p className="text-3xl font-extrabold text-teal-900 dark:text-teal-200">
            {summary.maxRating?.toLocaleString() || 0}
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900 rounded-xl p-5 text-center shadow-lg hover:scale-105 transform transition-transform duration-300">
          <h3 className="text-lg font-semibold text-green-700 dark:text-green-300 mb-1">
            Current Rating
          </h3>
          <p className="text-3xl font-extrabold text-green-900 dark:text-green-200">
            {summary.currentRating?.toLocaleString() || 0}
          </p>
        </div>
        <div
          className="rounded-xl p-5 text-center shadow-lg hover:scale-105 transform transition-transform duration-300"
          style={{ backgroundColor: isDarkMode ? "#2a2a2a" : "#ffe6e6" }}
        >
          <h3
            className="text-lg font-semibold mb-1"
            style={{ color: rankColor }}
          >
            Rank
          </h3>
          <p className="text-3xl font-extrabold" style={{ color: rankColor }}>
            {summary.rank || "Unrated"}
          </p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 rounded-xl p-5 text-center shadow-lg hover:scale-105 transform transition-transform duration-300">
          <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-300 mb-1">
            Total Friends
          </h3>
          <p className="text-3xl font-extrabold text-purple-900 dark:text-purple-200">
            {moreInfo.friendOfCount || 0}
          </p>
        </div>

        <div className="bg-red-50 dark:bg-red-900 rounded-xl p-5 text-center shadow-lg hover:scale-105 transform transition-transform duration-300">
          <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 mb-1">
            Total Problems Solved
          </h3>
          <p className="text-3xl font-extrabold text-red-800 dark:text-red-300">
            {summary.totalSolved?.toLocaleString() || 0}
          </p>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900 rounded-xl p-5 text-center shadow-lg hover:scale-105 transform transition-transform duration-300">
          <h3 className="text-lg font-semibold text-amber-700 dark:text-amber-300 mb-1">
            Total Contests
          </h3>
          <p className="text-3xl font-extrabold text-amber-900 dark:text-amber-200">
            {summary.totalContests || 0}
          </p>
        </div>

        <div className="bg-sky-50 dark:bg-sky-900 rounded-xl p-5 text-center shadow-lg hover:scale-105 transform transition-transform duration-300">
          <h3 className="text-lg font-semibold text-sky-700 dark:text-sky-300 mb-1">
            Last Contest
          </h3>
          <p className="text-xl font-semibold text-sky-900 dark:text-sky-200">
            {lastContestRelative}
          </p>
        </div>

        <div className="bg-indigo-50 dark:bg-indigo-900 rounded-xl p-5 text-center shadow-lg hover:scale-105 transform transition-transform duration-300">
          <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
            Last Online
          </h3>
          <p className="text-xl font-semibold text-indigo-900 dark:text-indigo-200">
            {lastOnlineRelative}
          </p>
        </div>
      </section>

      {/* Problems solved by tags bar chart */}
      <section className="mb-16 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-teal-700 dark:text-teal-400 mb-8 text-center">
          Problems Solved by Tags
        </h2>

        {tagsData.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
            No problem solving data available.
          </p>
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <ResponsiveContainer width="100%" height={450}>
              <BarChart
                data={tagsData}
                margin={{ top: 20, right: 30, left: 20, bottom: 100 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                />
                <XAxis
                  dataKey="tag"
                  tick={{
                    fill: isDarkMode ? "#9CA3AF" : "#374151",
                    fontSize: 12,
                  }}
                  tickLine={false}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={80}
                />
                <YAxis
                  tick={{ fill: isDarkMode ? "#9CA3AF" : "#374151" }}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: isDarkMode ? "#111827" : "#f9fafb",
                    borderRadius: 12,
                    borderColor: isDarkMode ? "#374151" : "#ddd",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    color: isDarkMode ? "#e5e7eb" : "#111827",
                  }}
                  formatter={(value) => [`${value}`, "Problems Solved"]}
                />
                <Bar dataKey="solved" name="Problems Solved" fill={colors[0]}>
                  {tagsData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </section>

      {/* Contest rating history line chart */}
      <section className="mb-16 max-w-7xl mx-auto px-4">
        <h2 className="text-3xl font-semibold text-teal-700 dark:text-teal-400 mb-8 text-center">
          Contest Rating History
        </h2>

        {ratingHistory.length === 0 ? (
          <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
            No contest rating data available.
          </p>
        ) : (
          <div className="overflow-x-auto max-w-full">
            <div
              className="overflow-x-auto max-w-full"
            >
              <ResponsiveContainer width="100%" height={400}>
                <LineChart
                  data={ratingHistory}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#374151" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{
                      fill: isDarkMode ? "#9CA3AF" : "#374151",
                      fontSize: 12,
                      fontWeight: 500,
                    }}
                    angle={-40}
                    textAnchor="end"
                    height={100}
                    interval={0}
                    tickFormatter={(tick) =>
                      new Date(tick).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                      })
                    }
                  />
                  <YAxis
                    tick={{ fill: isDarkMode ? "#9CA3AF" : "#374151" }}
                    domain={[
                      (dataMin) => dataMin - 100,
                      (dataMax) => dataMax + 100,
                    ]}
                    allowDecimals={false}
                    label={{
                      value: "Rating",
                      angle: -90,
                      position: "insideLeft",
                      offset: 10,
                      fill: isDarkMode ? "#9CA3AF" : "#374151",
                      fontWeight: "bold",
                    }}
                  />
                  <Tooltip
                    content={({ payload }) => {
                      if (!payload || !payload.length) return null;
                      const d = payload[0].payload;
                      const change = d.rating - d.oldRating;
                      return (
                        <div
                          className={`p-3 rounded-xl shadow-lg ${
                            isDarkMode
                              ? "bg-gray-800 text-gray-100"
                              : "bg-white text-gray-800"
                          }`}
                        >
                          <p className="font-semibold text-lg">
                            {d.contestName}
                          </p>
                          <p>Date: {new Date(d.date).toLocaleDateString()}</p>
                          <p>Rank: {d.rank}</p>
                          <p>
                            Rating: <strong>{d.oldRating}</strong> →{" "}
                            <strong>{d.rating}</strong>{" "}
                            <span
                              className={
                                change > 0
                                  ? "text-green-500"
                                  : change < 0
                                  ? "text-red-500"
                                  : ""
                              }
                            >
                              ({change > 0 ? "+" : ""}
                              {change})
                            </span>
                          </p>
                        </div>
                      );
                    }}
                  />
                  <Legend
                    wrapperStyle={{
                      fontWeight: "700",
                      fontSize: 15,
                      color: isDarkMode ? "#9CA3AF" : "#374151",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="#8884d8"
                    strokeWidth={3}
                    dot={(props) => {
                      const color = getRatingColor(props.payload.rating);
                      return (
                        <circle
                          {...props}
                          fill={color}
                          stroke="#fff"
                          strokeWidth={2}
                          r={5}
                        />
                      );
                    }}
                    activeDot={(props) => {
                      const color = getRatingColor(props.payload.rating);
                      return (
                        <circle
                          {...props}
                          fill="#fff"
                          stroke={color}
                          strokeWidth={3}
                          r={6}
                        />
                      );
                    }}
                    isAnimationActive={true}
                    name="Rating"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {/* Button for Powerful Insights */}
        <div className="flex justify-center mb-12 px-4">
          <button
            onClick={() => setShowConstestDetails(!showConstestDetails)}
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg font-semibold shadow-md transition"
            aria-expanded={showConstestDetails}
          >
            {showConstestDetails ? "Hide" : "Show"} Contest Details
          </button>
        </div>

        {/* Powerful Insights: Contest-wise info */}
        {showConstestDetails && (
          <section className="mb-16 max-w-5xl mx-auto px-4">
            {moreInfo.contests.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400 text-lg">
                No contest data available.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full table-auto border-collapse border border-gray-300 dark:border-gray-700 rounded-lg text-sm sm:text-base">
                  <thead className="bg-teal-100 dark:bg-teal-800 text-teal-900 dark:text-teal-300">
                    <tr>
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                        Contest Name
                      </th>
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        Rank
                      </th>
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        Old Rating
                      </th>
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        New Rating
                      </th>
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        Rating Change
                      </th>
                      <th className="border border-gray-300 dark:border-gray-700 px-4 py-2">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...moreInfo.contests]
                      .sort(
                        (a, b) =>
                          b.ratingUpdateTimeSeconds - a.ratingUpdateTimeSeconds
                      )
                      .map((contest) => {
                        const ratingChange =
                          contest.newRating - contest.oldRating;
                        const date = new Date(
                          contest.ratingUpdateTimeSeconds * 1000
                        ).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        });
                        return (
                          <tr
                            key={contest.contestId}
                            className="even:bg-gray-50 dark:even:bg-gray-800"
                          >
                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-left">
                              {contest.contestName}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                              {contest.rank}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                              {contest.oldRating}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                              {contest.newRating}
                            </td>
                            <td
                              className={`border border-gray-300 dark:border-gray-700 px-4 py-2 text-center ${
                                ratingChange > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : ratingChange < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : ""
                              }`}
                            >
                              {ratingChange > 0 ? "+" : ""}
                              {ratingChange}
                            </td>
                            <td className="border border-gray-300 dark:border-gray-700 px-4 py-2 text-center">
                              {date}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
      </section>
    </section>
  );
};

export default Codeforces;
