import { useEffect, useState } from "react";
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
  Label,
  ReferenceLine,
  Legend,
  Area,
} from "recharts";

import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";
import { format, subMonths } from "date-fns";

const LIGHT_COLORS = ["#14B8A6", "#8B5CF6", "#FB7185", "#F59E0B"];
const DARK_COLORS = ["#2DD4BF", "#C4B5FD", "#FCA5A5", "#FBBF24"];

const Codechef = () => {
  const dispatch = useDispatch();
  const { myProfile, status, error } = useSelector((state) => state.user);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showContestTable, setShowContestTable] = useState(false);
  const [heatmapRange, setHeatmapRange] = useState(12); // Months to show

  useEffect(() => {
    dispatch(getMyProfile());
    dispatch(refreshCompetitiveStats());
  }, [dispatch]);

  useEffect(() => {
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setIsDarkMode(darkModeQuery.matches);
    const updateDarkMode = (e) => setIsDarkMode(e.matches);
    darkModeQuery.addEventListener("change", updateDarkMode);
    return () => darkModeQuery.removeEventListener("change", updateDarkMode);
  }, []);

  const codechefStats = myProfile?.extraCompetitiveStats?.codechef;
  const summary = codechefStats?.summary || {};
  const moreInfo = codechefStats?.moreInfo || {};
  const colors = isDarkMode ? DARK_COLORS : LIGHT_COLORS;

  const {
    currentRating = 0,
    maxRating = 0,
    stars = 0,
    globalRank = "N/A",
    countryRank = "N/A",
  } = summary;

  const recentContests = moreInfo?.recentContests || [];
  const ratingHistory = moreInfo?.ratingHistory || [];
  const heatMap = moreInfo?.heatMap || [];
  const totalContests = moreInfo?.totalContests || 0;

  // Prepare data for rating line chart
  const contestHistory = ratingHistory
    .map((entry) => ({
      date: format(new Date(entry.end_date), "MMM dd, yyyy"),
      rating: Number(entry.rating),
      contestName: entry.name,
      contestUrl: `https://www.codechef.com/${entry.code}`,
    }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  const username = codechefStats?.profileUrl?.split("/").pop() || "unknown";

  // Enhanced heatmap data
  const heatmapData = heatMap.map((day) => ({
    ...day,
    date: new Date(day.date),
    count: day.value,
  }));

  // Calculate heatmap insights
  const maxActivity = Math.max(...heatMap.map((d) => d.value), 0);
  const totalActivity = heatMap.reduce((sum, day) => sum + day.value, 0);
  const activeDays = heatMap.filter((day) => day.value > 0).length;
  const avgActivity = activeDays ? (totalActivity / activeDays).toFixed(1) : 0;

  // Get start date for heatmap
  const getStartDate = () => {
    const today = new Date();
    return subMonths(today, heatmapRange);
  };

  // Heatmap color class generator
  const classForValue = (value) => {
    if (!value || !value.count) return "color-empty";
    const percentile = value.count / maxActivity;

    if (percentile >= 0.8) return "color-scale-4";
    if (percentile >= 0.6) return "color-scale-3";
    if (percentile >= 0.3) return "color-scale-2";
    return "color-scale-1";
  };

  if (
    status?.fetchProfile === "loading" ||
    status?.updateCompetitiveStats === "loading"
  ) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-6">
          CodeChef Insights
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
          CodeChef Insights
        </h1>
        <p className="text-red-600 text-lg">
          Failed to load your stats:{" "}
          {error.fetchProfile || error.updateCompetitiveStats}
        </p>
      </section>
    );
  }

  if (!codechefStats || !summary) {
    return (
      <section className="max-w-5xl mx-auto p-8 text-center">
        <h1 className="text-4xl font-extrabold text-teal-600 dark:text-teal-400 mb-6">
          CodeChef Insights
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-lg">
          No competitive programming stats found in your profile yet.
        </p>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto p-8 bg-white dark:bg-gray-900 rounded-xl shadow-lg transition-colors duration-500">
      {/* CSS for heatmap */}
      <style jsx>{`
        .react-calendar-heatmap text {
          font-size: 8px;
          fill: ${isDarkMode ? "#cbd5e1" : "#4b5563"};
        }

        .react-calendar-heatmap .color-empty {
          fill: ${isDarkMode ? "#374151" : "#f3f4f6"};
          rx: 2;
          ry: 2;
        }

        .react-calendar-heatmap .color-scale-1 {
          fill: ${isDarkMode ? "#0f766e" : "#a7f3d0"};
          rx: 2;
          ry: 2;
        }

        .react-calendar-heatmap .color-scale-2 {
          fill: ${isDarkMode ? "#0d9488" : "#5eead4"};
          rx: 2;
          ry: 2;
        }

        .react-calendar-heatmap .color-scale-3 {
          fill: ${isDarkMode ? "#14b8a6" : "#2dd4bf"};
          rx: 2;
          ry: 2;
        }

        .react-calendar-heatmap .color-scale-4 {
          fill: ${isDarkMode ? "#2dd4bf" : "#14b8a6"};
          rx: 2;
          ry: 2;
        }

        .react-calendar-heatmap rect:hover {
          stroke: ${isDarkMode ? "#d1d5db" : "#4b5563"};
          stroke-width: 1px;
        }

        .heatmap-tooltip {
          background: ${isDarkMode ? "#1f2937" : "white"};
          color: ${isDarkMode ? "#f3f4f6" : "#1f2937"};
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 14px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid ${isDarkMode ? "#374151" : "#e5e7eb"};
        }
      `}</style>

      <header className="mb-12 text-center">
        <h1 className="text-5xl font-extrabold text-teal-700 dark:text-teal-400 mb-3">
          CodeChef Competitive Insights
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg max-w-xl mx-auto mb-6">
          A comprehensive overview of your CodeChef competitive programming
          performance.
        </p>
        <p className="text-gray-700 dark:text-teal-300 text-lg max-w-2xl mx-auto">
          Handle: <span className="font-semibold">{username}</span>
        </p>
        <div className="flex justify-center gap-10 text-gray-800 dark:text-gray-300 mb-4 flex-wrap">
          <div className="bg-teal-100 dark:bg-teal-700 rounded-lg p-4 min-w-[160px]">
            <h3 className="font-semibold text-lg">Current Rating</h3>
            <p className="text-3xl font-bold">{currentRating}</p>
          </div>
          <div className="bg-purple-100 dark:bg-purple-700 rounded-lg p-4 min-w-[160px]">
            <h3 className="font-semibold text-lg">Max Rating</h3>
            <p className="text-3xl font-bold">{maxRating}</p>
          </div>
          <div className="bg-cyan-100 dark:bg-cyan-700 rounded-lg p-4 min-w-[160px]">
            <h3 className="font-semibold text-lg">Stars</h3>
            <p className="text-3xl font-bold">{stars}★</p>
          </div>
          <div className="bg-amber-100 dark:bg-amber-700 rounded-lg p-4 min-w-[160px]">
            <h3 className="font-semibold text-lg">Global Rank</h3>
            <p className="text-3xl font-bold">{globalRank}</p>
          </div>
        </div>

        {codechefStats.profileUrl && (
          <a
            href={codechefStats.profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 dark:bg-teal-500 dark:hover:bg-teal-600 text-white rounded-lg font-semibold shadow-md transition"
          >
            View Full Profile
          </a>
        )}
      </header>

      <section className="mb-16 flex justify-center gap-8">
        <StatCard title="Total Contests" value={totalContests} color="purple" />
        <StatCard title="Country Rank" value={countryRank} color="red" />
      </section>

      <section className="mb-16">
        <h2 className="text-4xl font-bold mb-8 text-center text-teal-700 dark:text-teal-300">
          Recent Contests
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {recentContests.slice(0, 3).map((contest, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition border border-gray-200 dark:border-gray-700"
            >
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 truncate">
                {contest.name}
              </h3>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">Rank:</span>
                <span className="font-semibold">{contest.rank}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-600 dark:text-gray-300">
                  Rating:
                </span>
                <span className="font-semibold">{contest.rating}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Date:</span>
                <span className="font-medium">
                  {format(new Date(contest.end_date), "MMM dd, yyyy")}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <button
            onClick={() => setShowContestTable((v) => !v)}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
          >
            {showContestTable ? "Hide" : "Show"} All Contest Details
          </button>
        </div>

        {showContestTable && recentContests.length > 0 && (
          <div className="overflow-x-auto max-w-full mt-8 rounded-lg shadow-md border border-gray-300 dark:border-gray-700">
            <table className="min-w-full border-collapse text-sm sm:text-base">
              <thead className="bg-teal-600 text-white sticky top-0 select-none">
                <tr>
                  <th className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-left">
                    Contest
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-center">
                    Date
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-center">
                    Rank
                  </th>
                  <th className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-center">
                    Rating
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white dark:bg-gray-900">
                {[...recentContests]
                  .sort(
                    (a, b) =>
                      new Date(b.end_date).getTime() -
                      new Date(a.end_date).getTime()
                  )
                  .map((contest, index, arr) => {
                    const ratingChange =
                      index < arr.length - 1
                        ? contest.rating - arr[index + 1].rating
                        : null;

                    return (
                      <tr
                        key={contest.code}
                        className={`border-b border-gray-300 dark:border-gray-700 cursor-pointer hover:bg-teal-50 dark:hover:bg-teal-900 transition-colors ${
                          index % 2 === 1 ? "bg-gray-50 dark:bg-gray-800" : ""
                        }`}
                        onClick={() =>
                          window.open(
                            `https://www.codechef.com/${contest.code}`,
                            "_blank"
                          )
                        }
                      >
                        <td className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-teal-700 dark:text-teal-400">
                          {contest.name}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-center">
                          {format(new Date(contest.end_date), "MMM dd, yyyy")}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-center font-bold">
                          {contest.rank}
                        </td>
                        <td className="border border-gray-300 dark:border-gray-700 py-3 px-4 text-center font-bold">
                          <span className="mr-2">{contest.rating}</span>
                          {ratingChange !== null && (
                            <span
                              className={`text-sm ${
                                ratingChange > 0
                                  ? "text-green-600 dark:text-green-400"
                                  : ratingChange < 0
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-gray-700 dark:text-gray-400"
                              }`}
                            >
                              ({ratingChange > 0 ? "+" : ""}
                              {ratingChange})
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="mb-16">
        <h2 className="text-4xl font-bold mb-8 text-center text-teal-700 dark:text-teal-300">
          Rating Progression
        </h2>

        {contestHistory.length > 0 ? (
          <div className="relative overflow-x-auto pb-4">
            <div style={{ minWidth: "600px" }}>
              <ResponsiveContainer
                width="100%"
                height={400}
                className="text-sm"
              >
                <LineChart
                  data={contestHistory}
                  margin={{ top: 20, right: 30, left: 20, bottom: 80 }}
                >
                  <defs>
                    <linearGradient
                      id="ratingGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={colors[1]}
                        stopOpacity={0.8}
                      />
                      <stop
                        offset="95%"
                        stopColor={colors[1]}
                        stopOpacity={0.1}
                      />
                    </linearGradient>
                    <linearGradient
                      id="areaGradient"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop
                        offset="5%"
                        stopColor={colors[1]}
                        stopOpacity={0.2}
                      />
                      <stop
                        offset="95%"
                        stopColor={colors[1]}
                        stopOpacity={0.01}
                      />
                    </linearGradient>
                  </defs>

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDarkMode ? "#4b5563" : "#e5e7eb"}
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    angle={-35}
                    textAnchor="end"
                    height={70}
                    padding={{ left: 10, right: 10 }}
                    tick={{
                      fill: isDarkMode ? "#9ca3af" : "#4b5563",
                      fontSize: 10,
                    }}
                    tickMargin={5}
                    minTickGap={3}
                  />

                  <YAxis
                    domain={["dataMin - 50", "dataMax + 50"]}
                    allowDecimals={false}
                    tick={{
                      fill: isDarkMode ? "#9ca3af" : "#4b5563",
                      fontSize: 10,
                    }}
                  />

                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const contest = payload[0].payload;
                        const currentIndex = contestHistory.findIndex(
                          (c) => c.date === contest.date
                        );
                        const prevContest = contestHistory[currentIndex - 1];
                        const ratingChange = prevContest
                          ? contest.rating - prevContest.rating
                          : 0;
                        const isPeak = contest.rating === maxRating;

                        return (
                          <div
                            className={`p-3 rounded-lg border max-w-[260px] ${
                              isDarkMode
                                ? "bg-gray-800 border-gray-700"
                                : "bg-white border-gray-200"
                            }`}
                          >
                            <h3 className="font-bold text-base mb-2 text-teal-600 dark:text-teal-400 truncate">
                              {contest.contestName}
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                  Rating:
                                </span>
                                <p className="font-bold">{contest.rating}</p>
                              </div>

                              <div>
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                  Change:
                                </span>
                                <p
                                  className={`font-bold ${
                                    ratingChange > 0
                                      ? "text-green-600 dark:text-green-400"
                                      : ratingChange < 0
                                      ? "text-red-600 dark:text-red-400"
                                      : ""
                                  }`}
                                >
                                  {ratingChange > 0 ? "+" : ""}
                                  {ratingChange}
                                </p>
                              </div>

                              <div className="col-span-2">
                                <span className="text-xs text-gray-600 dark:text-gray-300">
                                  Date:
                                </span>
                                <p className="font-medium">{label}</p>
                              </div>

                              {isPeak && (
                                <div className="col-span-2 mt-1">
                                  <div className="inline-flex items-center px-2 py-1 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 text-xs">
                                    <span className="mr-1">★</span>
                                    <span>Peak Rating</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {/* Reference lines - combined if same */}
                  {maxRating > 0 &&
                    currentRating > 0 &&
                    (maxRating === currentRating ? (
                      <ReferenceLine
                        y={maxRating}
                        stroke={colors[3]}
                        strokeDasharray="3 3"
                        strokeOpacity={0.7}
                        label={{
                          value: `Current & Peak: ${maxRating}`,
                          position: "right",
                          fill: isDarkMode ? colors[3] : colors[3],
                          fontSize: 10,
                          fontWeight: "bold",
                        }}
                      />
                    ) : (
                      <>
                        <ReferenceLine
                          y={maxRating}
                          stroke={colors[3]}
                          strokeDasharray="3 3"
                          strokeOpacity={0.7}
                          label={{
                            value: `Peak: ${maxRating}`,
                            position: "right",
                            fill: isDarkMode ? colors[3] : colors[3],
                            fontSize: 10,
                            fontWeight: "bold",
                            dy: -10, // Offset to avoid overlap
                          }}
                        />
                        <ReferenceLine
                          y={currentRating}
                          stroke={colors[0]}
                          strokeDasharray="3 3"
                          strokeOpacity={0.7}
                          label={{
                            value: `Current: ${currentRating}`,
                            position: "right",
                            fill: isDarkMode ? colors[0] : colors[0],
                            fontSize: 10,
                            fontWeight: "bold",
                            dy: 10, // Offset to avoid overlap
                          }}
                        />
                      </>
                    ))}

                  <Area
                    type="monotone"
                    dataKey="rating"
                    fill="url(#areaGradient)"
                    stroke="none"
                  />

                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke={colors[1]}
                    strokeWidth={2.5}
                    dot={({ cx, cy, payload }) => (
                      <g>
                        <circle
                          cx={cx}
                          cy={cy}
                          r={5}
                          fill={colors[1]}
                          stroke={isDarkMode ? "#1f2937" : "#f9fafb"}
                          strokeWidth={1.5}
                          onClick={(e) => {
                            e.stopPropagation();
                            window.open(payload.contestUrl, "_blank");
                          }}
                          className="cursor-pointer"
                        />
                        {payload.rating === maxRating && (
                          <text
                            x={cx}
                            y={cy - 15}
                            textAnchor="middle"
                            fill={isDarkMode ? colors[3] : colors[3]}
                            fontSize={10}
                            fontWeight="bold"
                          >
                            ★
                          </text>
                        )}
                      </g>
                    )}
                    activeDot={{
                      r: 6,
                      stroke: isDarkMode ? "#1f2937" : "#f9fafb",
                      strokeWidth: 1.5,
                      onClick: (e, payload) => {
                        e.stopPropagation();
                        window.open(payload.contestUrl, "_blank");
                      },
                      className: "cursor-pointer",
                    }}
                  />

                  {/* Trend projection line */}
                  {contestHistory.length > 2 && (
                    <Line
                      type="linear"
                      dataKey={(data) => {
                        const x = contestHistory.map((_, i) => i);
                        const y = contestHistory.map((d) => d.rating);

                        const sumX = x.reduce((a, b) => a + b, 0);
                        const sumY = y.reduce((a, b) => a + b, 0);
                        const sumXY = x
                          .map((xi, i) => xi * y[i])
                          .reduce((a, b) => a + b, 0);
                        const sumXX = x
                          .map((xi) => xi * xi)
                          .reduce((a, b) => a + b, 0);

                        const n = x.length;
                        const slope =
                          (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
                        const intercept = (sumY - slope * sumX) / n;

                        return slope * x[data.index] + intercept;
                      }}
                      stroke={colors[2]}
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                      dot={false}
                      activeDot={false}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="text-center mt-3 text-xs text-gray-600 dark:text-gray-400">
              {contestHistory.length} contests tracked | Click points to view
              contest details
            </div>
          </div>
        ) : (
          <div className="text-center py-10">
            <div className="text-4xl mb-3">📊</div>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              No rating history available yet
            </p>
            <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
              Participate in CodeChef contests to see your rating progression
            </p>
          </div>
        )}
      </section>

      <section className="mb-12">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h2 className="text-4xl font-bold text-center md:text-left text-teal-700 dark:text-teal-300">
            Problem Solving Activity
          </h2>

          <div className="flex justify-center mt-4 md:mt-0">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
                  heatmapRange === 6
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                }`}
                onClick={() => setHeatmapRange(6)}
              >
                6 Months
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium ${
                  heatmapRange === 12
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                }`}
                onClick={() => setHeatmapRange(12)}
              >
                1 Year
              </button>
              <button
                type="button"
                className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
                  heatmapRange === 24
                    ? "bg-teal-600 text-white"
                    : "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-300"
                }`}
                onClick={() => setHeatmapRange(24)}
              >
                2 Years
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-teal-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                {totalActivity}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Total Submission{" "}
              </div>
            </div>
            <div className="bg-teal-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                {activeDays}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Active Days
              </div>
            </div>
            <div className="bg-teal-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                {avgActivity}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Avg Submission/Day
              </div>
            </div>
            <div className="bg-teal-50 dark:bg-gray-700 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-teal-700 dark:text-teal-300">
                {maxActivity}
              </div>
              <div className="text-gray-600 dark:text-gray-300">
                Max Submission in a Day
              </div>
            </div>
          </div>

          <CalendarHeatmap
            startDate={getStartDate()}
            endDate={new Date()}
            values={heatmapData}
            classForValue={classForValue}
            showWeekdayLabels
            showMonthLabels
            titleForValue={(value) => {
              if (!value) return "No activity";
              const dateStr = format(value.date, "MMM dd, yyyy");
              return `${dateStr}: ${value.count} problem${
                value.count !== 1 ? "s" : ""
              } solved`;
            }}
            tooltipDataAttrs={(value) => ({
              "data-tip": value
                ? `${format(value.date, "MMM dd, yyyy")}: ${
                    value.count
                  } problems solved`
                : "No activity",
            })}
            gutterSize={3}
          />

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center">
              <span className="text-sm text-gray-600 dark:text-gray-300 mr-2">
                Less
              </span>
              <div className="flex">
                {[1, 2, 3, 4].map((level) => (
                  <div
                    key={level}
                    className={`w-6 h-4 mx-px ${
                      level === 1
                        ? "bg-color-scale-1"
                        : level === 2
                        ? "bg-color-scale-2"
                        : level === 3
                        ? "bg-color-scale-3"
                        : "bg-color-scale-4"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                More
              </span>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-300">
              {heatmapRange} month{heatmapRange !== 1 ? "s" : ""} of activity
            </div>
          </div>
        </div>
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

export default Codechef;
