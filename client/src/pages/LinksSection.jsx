import React from "react";
import { ExternalLink, Loader2, RefreshCcw } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function LinksSection({
  title,
  links,
  stats,
  isEditing,
  handleChange,
  refreshing,
  onRefresh,
  lastUpdated,
}) {
  const platforms = Object.keys(links);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
          {title}
        </h2>
        {!isEditing && (
          <div className="flex items-center gap-3 text-sm text-gray-500">
            {lastUpdated && (
              <span>
                Refreshed{" "}
                {formatDistanceToNow(new Date(lastUpdated), {
                  addSuffix: true,
                })}
              </span>
            )}
            <button
              onClick={onRefresh}
              className="text-green-600 hover:text-green-800 transition flex items-center gap-1"
            >
              {refreshing ? (
                <Loader2 size={16} className="animate-spin text-green-600" />
              ) : (
                <RefreshCcw size={16} className="text-green-600" />
              )}
              Refresh
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {platforms.map((platform) => {
          const link = links[platform];
          const stat = stats[platform] || {};
          const hasData = !!link;

          if (!hasData && !isEditing) return null;

          return (
            <div
              key={platform}
              className="rounded-2xl bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition p-4 space-y-3"
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize text-gray-800 dark:text-white">
                    {platform}
                  </span>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:underline"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
                {link && !isEditing && (
                  <button
                    className="text-green-600 text-sm font-medium hover:underline"
                    onClick={() => {
                      // Replace with navigation logic, e.g., navigate(`/more-info/${platform}`)
                    }}
                  >
                    Get More Info
                  </button>
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
                  placeholder={`${platform} link`}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              ) : Object.keys(stat).length > 0 ? (
                <div className="grid grid-cols-2 gap-y-1 text-sm text-gray-700 dark:text-gray-300">
                  {Object.entries(stat)
                    .filter(([k]) => k !== "updatedAt")
                    .map(([k, v]) => (
                      <div key={k}>
                        <span className="font-medium">{formatKey(k)}:</span> {v}
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No stats available</p>
              )}
            </div>
          );
        })}
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
