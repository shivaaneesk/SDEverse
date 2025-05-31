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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { format } from "date-fns";

const LIGHT_COLORS = ["#14B8A6", "#8B5CF6", "#FB7185", "#F59E0B"];
const DARK_COLORS = ["#2DD4BF", "#C4B5FD", "#FCA5A5", "#FBBF24"];

const LeetCode = () => {
  const dispatch = useDispatch();
  const { myProfile, status, error } = useSelector((state) => state.user);
  const [showContests, setShowContests] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

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

  const leetcodeStats = myProfile?.extraCompetitiveStats?.leetcode;
  const summary = leetcodeStats?.summary || {};
  const moreInfo = leetcodeStats?.moreInfo || {};
  const totalQuestions = moreInfo?.totalQuestions || {
    easy: 0,
    medium: 0,
    hard: 0,
  };
  const userHandle = moreInfo?.username || "Unknown";

  const difficultySolvedData = [
    { name: "Easy", value: summary.easy || 0, total: totalQuestions.easy || 0 },
    {
      name: "Medium",
      value: summary.medium || 0,
      total: totalQuestions.medium || 0,
    },
    { name: "Hard", value: summary.hard || 0, total: totalQuestions.hard || 0 },
  ].map((d) => ({
    ...d,
    percentSolved: d.total > 0 ? (d.value / d.total) * 100 : 0,
  }));

  let contestHistory = [];
  if (Array.isArray(moreInfo.contestHistory)) {
    contestHistory = moreInfo.contestHistory
      .filter(
        (item) =>
          item.rating !== null && item.contest?.startTime && item.contest?.title
      )
      .sort((a, b) => a.contest.startTime - b.contest.startTime)
      .map((item) => ({
        date: format(new Date(item.contest.startTime * 1000), "MMM dd, yyyy"),
        rating: Math.round(item.rating),
        contestName: item.contest.title,
        contestUrl: item.contest.contestSlug
          ? `https://leetcode.com/contest/${item.contest.contestSlug}/`
          : "https://leetcode.com/contest/",
      }));
  }

  const ranking = summary.ranking || "N/A";
  const topPercentage = moreInfo.contestStats?.topPercentage || "N/A";
  const globalRanking = summary.globalRanking || "N/A";
  const totalSolved = summary.totalSolved || 0;
  const totalAvailable =
    (totalQuestions.easy || 0) +
    (totalQuestions.medium || 0) +
    (totalQuestions.hard || 0);
  const totalPercentSolved =
    totalAvailable > 0 ? (totalSolved / totalAvailable) * 100 : 0;
  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  if (
    status?.fetchProfile === "loading" ||
    status?.updateCompetitiveStats === "loading"
  ) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-6">
          LeetCode Insights
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
          LeetCode Insights
        </h1>
        <p className="text-red-600 text-lg">
          Failed to load your stats:{" "}
          {error.fetchProfile || error.updateCompetitiveStats}
        </p>
      </section>
    );
  }

  if (!leetcodeStats || !summary) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-6">
          LeetCode Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          No competitive programming stats found in your profile yet.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-colors duration-500">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-teal-700 dark:text-teal-400 mb-3">
          LeetCode Competitive Insights
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg max-w-xl mx-auto mb-6">
          A comprehensive overview of your LeetCode competitive programming
          performance.
        </p>
        <p className="text-gray-700 dark:text-teal-300 text-lg max-w-2xl mx-auto">
          Handle: <span className="font-semibold">{userHandle}</span>
        </p>
        <div className="flex justify-center gap-10 text-gray-800 dark:text-gray-300 mb-4 flex-wrap">
          <div className="bg-teal-100 dark:bg-teal-700 rounded-lg p-4 min-w-[160px]">
            <h3 className="font-semibold text-lg">Ranking</h3>
            <p className="text-3xl font-bold">{ranking}</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-700 rounded-lg p-4 min-w-[160px]">
            <h3 className="font-semibold text-lg">Top %</h3>
            <p className="text-3xl font-bold">
              {topPercentage !== "N/A" ? `${topPercentage}%` : "N/A"}
            </p>
          </div>
          {globalRanking !== "N/A" && (
            <div className="bg-cyan-100 dark:bg-cyan-700 rounded-lg p-4 min-w-[160px]">
              <h3 className="font-semibold text-lg">Global Rank</h3>
              <p className="text-3xl font-bold">{globalRanking}</p>
            </div>
          )}
        </div>

        {leetcodeStats.profileUrl && (
          <a
            href={leetcodeStats.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg font-semibold shadow-md transition"
          >
            View Full Profile
          </a>
        )}
      </header>

      <section className="mb-16 grid grid-cols-1 sm:grid-cols-4 gap-8">
        <StatCard
          title="Total Problems Solved"
          value={totalSolved}
          color="teal"
        />
        <StatCard
          title="Total Questions Available"
          value={totalAvailable}
          color="purple"
        />
        <StatCard
          title="Overall % Solved"
          value={totalPercentSolved.toFixed(1) + "%"}
          color="red"
        />
        <StatCard
          title="Contests Participated"
          value={summary.totalContests || 0}
          color="amber"
        />
      </section>

      <section className="mb-20">
        <h2 className="text-4xl font-bold mb-8 text-center text-teal-700 dark:text-teal-300">
          Problems Solved by Difficulty
        </h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-8 max-w-4xl mx-auto">
          <ul className="space-y-4 w-full sm:w-1/2">
            {difficultySolvedData.map(
              ({ name, value, total, percentSolved }, i) => (
                <li
                  key={name}
                  className={`flex justify-between items-center rounded-lg p-4 shadow-md ${
                    isDarkMode ? "bg-gray-800" : "bg-gray-100"
                  }`}
                >
                  <span className="font-semibold text-lg text-teal-800 dark:text-teal-200">
                    {name}
                  </span>
                  <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                    {value} / {total} solved ({percentSolved.toFixed(1)}%)
                  </span>
                </li>
              )
            )}
          </ul>
          <ResponsiveContainer width="50%" height={280}>
            <PieChart>
              <Pie
                data={difficultySolvedData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                fill="#8884d8"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(1)}%`
                }
                labelLine={false}
              >
                {difficultySolvedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-4xl font-bold mb-6 text-center text-teal-700 dark:text-teal-300">
          Contest Rating History
        </h2>

        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={contestHistory}>
            <defs>
              <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors[1]} stopOpacity={0.8} />
                <stop offset="95%" stopColor={colors[1]} stopOpacity={0.1} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              angle={-45}
              textAnchor="end"
              height={100}
              padding={{ left: 20, right: 20 }}
            />
            <YAxis
              domain={[(dataMin) => dataMin - 50, (dataMax) => dataMax + 50]}
              label={{
                value: "Rating",
                angle: -90,
                position: "insideLeft",
                offset: 0,
                fill: isDarkMode ? "#9CA3AF" : "#374151",
                fontWeight: "bold",
              }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const curRating = payload[0].value;
                  // Find previous rating for difference
                  const idx = contestHistory.findIndex(
                    (item) => item.date === label
                  );
                  const prevRating =
                    idx > 0 ? contestHistory[idx - 1].rating : null;
                  const diff =
                    prevRating !== null ? curRating - prevRating : null;
                  return (
                    <div className="bg-black p-2 rounded shadow-lg border border-gray-300">
                      <p className="font-bold">{label}</p>
                      <p>
                        Rating:{" "}
                        <span className="font-semibold">{curRating}</span>
                      </p>
                      {diff !== null && (
                        <p
                          className={
                            diff >= 0 ? "text-green-600" : "text-red-600"
                          }
                        >
                          Change: {diff >= 0 ? "+" : ""}
                          {diff}
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="rating"
              stroke={colors[1]}
              strokeWidth={3}
              dot={{ r: 5, strokeWidth: 2, fill: colors[2] }}
              activeDot={{ r: 7 }}
              strokeOpacity={1}
              fill="url(#ratingGradient)"
            />
          </LineChart>
        </ResponsiveContainer>

        <div className="text-center mt-8">
          <button
            onClick={() => setShowContests((v) => !v)}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            {showContests ? "Hide" : "Show"} Contest Details
          </button>
        </div>

        {showContests && contestHistory.length > 0 && (
          <div className="overflow-x-auto max-w-full mt-8 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
            <table className="min-w-full border-collapse text-sm sm:text-base">
              <thead className="bg-teal-600 text-white sticky top-0 select-none">
                <tr>
                  <th className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-left">
                    Date
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-left">
                    Contest Name
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-center">
                    Rating
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-center">
                    Rating Change
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-900">
                {[...contestHistory]
                  .sort(
                    (a, b) =>
                      new Date(b.date).getTime() - new Date(a.date).getTime()
                  )
                  .map((entry, index, arr) => {
                    const prevEntry = arr[index + 1];
                    const ratingChange =
                      prevEntry && prevEntry.rating != null
                        ? entry.rating - prevEntry.rating
                        : null;

                    return (
                      <tr
                        key={entry.contestName + entry.date}
                        className={`border-b border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900 transition-colors ${
                          index % 2 === 1 ? "bg-gray-50 dark:bg-gray-800" : ""
                        }`}
                        onClick={() => window.open(entry.contestUrl, "_blank")}
                      >
                        <td className="border border-gray-300 dark:border-gray-700 py-3 px-4">
                          {entry.date}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-teal-700 dark:text-teal-400">
                          {entry.contestName}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-center font-bold">
                          {entry.rating}
                        </td>
                        <td
                          className={`border border-gray-300 dark:border-gray-700 py-3 px-4 text-center font-semibold ${
                            ratingChange > 0
                              ? "text-green-600 dark:text-green-400"
                              : ratingChange < 0
                              ? "text-red-600 dark:text-red-400"
                              : "text-gray-700 dark:text-gray-400"
                          }`}
                        >
                          {ratingChange !== null
                            ? ratingChange > 0
                              ? `+${ratingChange}`
                              : ratingChange
                            : "-"}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </section>
  );
};

const StatCard = ({ title, value, color }) => {
  const colorMap = {
    teal: "bg-teal-50 dark:bg-teal-900 text-teal-700 dark:text-teal-300",
    purple:
      "bg-purple-50 dark:bg-purple-900 text-purple-700 dark:text-purple-300",
    red: "bg-red-50 dark:bg-red-900 text-red-600 dark:text-red-400",
    amber: "bg-amber-50 dark:bg-amber-900 text-amber-700 dark:text-amber-300",
  };
  return (
    <div
      className={`rounded-xl p-8 text-center shadow-lg transform hover:scale-105 transition-transform duration-300 ${colorMap[color]}`}
    >
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-5xl font-extrabold">{value}</p>
    </div>
  );
};

export default LeetCode;
