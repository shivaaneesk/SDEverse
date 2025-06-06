import { ExternalLink, Loader2, RefreshCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  refreshSingleSocialStat,
  refreshSingleCompetitiveStat,
} from "../features/user/userSlice";

export default function LinksSection({
  title,
  links,
  stats,
  isEditing,
  readonly,
  handleChange,
  refreshing,
  onRefresh,
  lastUpdated,
}) {
  const platforms = Object.keys(links);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Helper to format numerical values (round off and add commas)
  const formatStatValue = (value) => {
    if (typeof value === 'number') {
      if (Number.isInteger(value)) {
        return value.toLocaleString();
      } else {
        return value.toFixed(2).toLocaleString();
      }
    }
    return value;
  };

  const getPlatformIcon = (platform) => {
    // You can add specific icons here based on platform name (e.g., GitHub, LinkedIn, etc.)
    // Example: if (platform.toLowerCase() === 'github') return <Github size={20} className="text-gray-300" />;
    return null;
  };

  return (
    <div className="space-y-6 bg-gray-800 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-700">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-700">
        <h2 className="text-3xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500">
          {title}
        </h2>
        {!isEditing && !readonly && (
          <div className="flex items-center gap-4 text-sm text-gray-400 flex-wrap">
            {lastUpdated && (
              <span className="italic">
                Last refreshed{" "}
                {formatDistanceToNow(new Date(lastUpdated), {
                  addSuffix: true,
                })}
              </span>
            )}
            <button
              onClick={onRefresh}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-full hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-md text-base font-medium"
            >
              {refreshing ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <RefreshCcw size={20} />
              )}
              Refresh All
            </button>
          </div>
        )}
      </div>

      <div className="space-y-4"> {/* Vertical stacking, not a grid */}
        {platforms.length === 0 && !isEditing ? (
          <p className="text-gray-500 text-lg text-center py-4">
            No {title.toLowerCase()} added yet. {readonly ? '' : 'Click "Edit Profile" to add them!'}
          </p>
        ) : (
          platforms.map((platform, index) => {
            const link = links[platform];
            const stat = stats[platform] || {};
            const hasData = !!link;

            if (!hasData && !isEditing) return null;

            // Apply bg-gray-900 to all items, removing alternating colors
            const itemBgClass = 'bg-gray-900';

            return (
              <div
                key={platform}
                className={`p-4 rounded-lg shadow-md transition-all duration-300
                  ${itemBgClass} border border-gray-700 hover:border-emerald-500/50 flex flex-col`}
              >
                {/* Platform Title, Link/Input, and "Get More Info" button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-3 border-b border-gray-700">
                  <div className="flex items-center gap-3">
                    {getPlatformIcon(platform)}
                    <span className="font-bold capitalize text-xl text-teal-300">
                      {formatKey(platform)}
                    </span>
                    {!isEditing && link && (
                      <a
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1 text-sm ml-2"
                        aria-label={`Visit ${platform} profile`}
                      >
                        Visit Link <ExternalLink size={14} />
                      </a>
                    )}
                  </div>

                  {isEditing ? (
                    <input
                      type="text"
                      name={`${
                        title === "Competitive Links"
                          ? "competitiveProfiles"
                          : "socialLinks"
                      }.${platform}`}
                      value={link || ""}
                      onChange={handleChange}
                      placeholder={`Enter ${platform} link`}
                      className="flex-grow w-full px-3 py-1.5 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-500 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all duration-200"
                    />
                  ) : (
                      !link && <p className="text-gray-500 italic text-sm">Link not set</p>
                  )}

                  {!isEditing && link && !readonly && (
                    <button
                      className="text-indigo-400 text-sm font-medium hover:underline hover:text-indigo-300 transition-colors px-3 py-1.5 rounded-md bg-gray-800/50 hover:bg-gray-700/50 mt-2 sm:mt-0"
                      onClick={() => {
                        if (title === "Competitive Links") {
                          dispatch(refreshSingleCompetitiveStat(platform));
                        } else {
                          dispatch(refreshSingleSocialStat(platform));
                        }
                        navigate(`/moreinfo/${platform}`);
                      }}
                    >
                      View Detailed Stats
                    </button>
                  )}
                </div>

                {/* Stats Display - with ample vertical room and responsive grid within */}
                {!isEditing && (Object.keys(stat).length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm text-gray-300 mt-2">
                    {Object.entries(stat)
                      .filter(([k]) => k !== "updatedAt")
                      .map(([k, v]) => (
                        <div key={k} className="flex flex-col">
                          <span className="font-medium text-gray-200 text-xs">{formatKey(k)}:</span>
                          <span className="text-white text-base font-semibold">
                            {formatStatValue(v)}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic text-sm text-center py-1">
                    No stats available for this platform.
                    {!readonly && " Add a link or refresh to get data."}
                  </p>
                ))}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function formatKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ");
}