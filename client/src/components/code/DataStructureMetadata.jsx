import { motion } from "framer-motion";
import { Tag, Link, Users, ThumbsUp, ThumbsDown, Eye } from "lucide-react";
import { format } from "date-fns";
import { Tooltip } from "react-tooltip";
import { useMemo } from "react";
import clsx from "clsx";

// Component to display metadata and additional resources
const DataStructureMetadata = ({ dataStructure, isAdmin = false }) => {
  if (!dataStructure) return null;

  // Memoize formatted data to prevent unnecessary re-renders
  const formattedData = useMemo(() => {
    // Ensure all data arrays are initialized to empty arrays if undefined
    return {
      applications: dataStructure.applications || [],
      comparisons: dataStructure.comparisons || [],
      tags: dataStructure.tags || [],
      references: dataStructure.references || [],
      videoLinks: dataStructure.videoLinks || [],
      contributors: dataStructure.contributors || [],
    };
  }, [dataStructure]);

  // Helper function to format dates
  const formatDate = (dateString) => {
    try {
      // Ensure dateString is not null or undefined before creating a Date object
      if (!dateString) return "Unknown Date";
      return format(new Date(dateString), "PPp");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid Date";
    }
  };

  // Animation variants for container
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1, // Stagger children animations
      },
    },
  };

  // Animation variants for child elements that appear sequentially
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
  };

  // Render a list section with animation
  const renderListSection = (title, items, IconComponent, renderItem) => {
    if (!items || items.length === 0) return null; // Don't render if no items

    return (
      <motion.div variants={itemVariants} className="space-y-4">
        <h3
          className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100"
          data-tooltip-id={`tooltip-${title.toLowerCase().replace(/\s/g, '-')}`} // Unique ID for tooltip
          data-tooltip-content={title}
        >
          <IconComponent size={20} className="text-blue-500" /> {title}
        </h3>
        <Tooltip
          id={`tooltip-${title.toLowerCase().replace(/\s/g, '-')}`} // Matching ID
          place="top"
          className="bg-gray-800 text-white text-sm rounded-md px-2 py-1 z-50" // Added z-50 for tooltip visibility
        />
        {title === "Tags" ? (
          <div className="flex flex-wrap gap-2">{items.map(renderItem)}</div>
        ) : (
          // Use 'div' instead of 'ul' here if 'renderItem' already returns 'motion.li'
          // This prevents nested <ul> elements which is invalid HTML
          <div className="space-y-4">{items.map(renderItem)}</div>
        )}
      </motion.div>
    );
  };

  // Render applications
  const renderApplication = (app, index) => (
    <motion.div // Changed from motion.li to motion.div to prevent nested <ul>
      key={index}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }} // Slight delay for ripple effect
      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
    >
      <div className="space-y-2">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          {app.domain || "N/A"}
        </p>
        {app.examples && app.examples.length > 0 ? (
          <div>
            <p className="text-base font-medium mb-1 text-gray-800 dark:text-gray-200">
              Examples:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {app.examples.map((example, i) => (
                <li key={i}>{example || "N/A"}</li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-sm ml-6 text-gray-700 dark:text-gray-400">
            No examples provided.
          </p>
        )}
      </div>
    </motion.div>
  );

  // Render comparisons
  const renderComparison = (comp, index) => (
    <motion.div // Changed from motion.li to motion.div
      key={index}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.05 }} // Slight delay for ripple effect
      className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600 shadow-sm"
    >
      <div className="space-y-2">
        <p className="font-medium text-gray-900 dark:text-gray-100">
          Compared with: {comp.with || "N/A"}
        </p>
        {comp.advantages && comp.advantages.length > 0 && (
          <div>
            <p className="text-base font-medium mb-1 text-gray-800 dark:text-gray-200">
              Advantages:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {comp.advantages.map((adv, i) => (
                <li key={i}>{adv || "N/A"}</li>
              ))}
            </ul>
          </div>
        )}
        {comp.disadvantages && comp.disadvantages.length > 0 && (
          <div className="mt-2">
            <p className="text-base font-medium mb-1 text-gray-800 dark:text-gray-200">
              Disadvantages:
            </p>
            <ul className="list-disc list-inside ml-6 space-y-1 text-sm text-gray-700 dark:text-gray-300">
              {comp.disadvantages.map((disadv, i) => (
                <li key={i}>{disadv || "N/A"}</li>
              ))}
            </ul>
          </div>
        )}
        {comp.whenToUse && (
          <div className="mt-2">
            <p className="text-base font-medium mb-1 text-gray-800 dark:text-gray-200">
              When to Use:
            </p>
            <p className="text-sm ml-6 text-gray-700 dark:text-gray-300">
              {comp.whenToUse}
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );

  // Render tags
  const renderTag = (tag, index) => (
    <motion.span
      key={index}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2, delay: index * 0.05 }} // Slight delay for ripple effect
      className="bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors cursor-pointer" // Added cursor-pointer
    >
      {tag}
    </motion.span>
  );

  // Render resources (references, video links)
  const renderResource = (item, index) => (
    <motion.li // Added motion to resource list items for individual animation
      key={index}
      variants={itemVariants} // Use itemVariants for consistent animation
      initial={{ opacity: 0, x: -5 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.15, delay: index * 0.05 }}
      className="text-sm text-blue-600 dark:text-blue-400"
    >
      <a
        href={item}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:underline break-all"
      >
        {item}
      </a>
    </motion.li>
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={clsx(
        "p-4 sm:p-6 lg:p-8 bg-white dark:bg-gray-900 rounded-2xl shadow-lg",
        "border border-gray-200 dark:border-gray-800",
        "max-w-full sm:max-w-3xl lg:max-w-5xl mx-auto"
      )}
    >
      <div className="space-y-8">
        {/* Applications */}
        {renderListSection(
          "Applications",
          formattedData.applications,
          Tag,
          renderApplication
        )}

        {/* Comparisons */}
        {renderListSection(
          "Comparisons",
          formattedData.comparisons,
          Tag,
          renderComparison
        )}

        {/* Tags */}
        {renderListSection("Tags", formattedData.tags, Tag, renderTag)}

        {/* Additional Resources */}
        {(formattedData.references.length > 0 ||
          formattedData.videoLinks.length > 0) && (
          <motion.div variants={itemVariants} className="space-y-4">
            <h3
              className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100"
              data-tooltip-id="tooltip-additional-resources"
              data-tooltip-content="Additional Resources"
            >
              <Link size={20} className="text-blue-500" /> Additional Resources
            </h3>
            <Tooltip
              id="tooltip-additional-resources"
              place="top"
              className="bg-gray-800 text-white text-sm rounded-md px-2 py-1 z-50"
            />
            <div className="space-y-4">
              {formattedData.references.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    References
                  </h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {formattedData.references.map((ref, index) =>
                      renderResource(ref, index)
                    )}
                  </ul>
                </div>
              )}
              {formattedData.videoLinks.length > 0 && (
                <div>
                  <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Video Links
                  </h4>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    {formattedData.videoLinks.map((video, index) =>
                      renderResource(video, index)
                    )}
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Admin-Only Fields */}
        {isAdmin && (
          <motion.div variants={itemVariants} className="space-y-4">
            <h3
              className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100"
              data-tooltip-id="tooltip-admin-metadata"
              data-tooltip-content="Admin Metadata"
            >
              <Users size={20} className="text-blue-500" /> Admin Metadata
            </h3>
            <Tooltip
              id="tooltip-admin-metadata"
              place="top"
              className="bg-gray-800 text-white text-sm rounded-md px-2 py-1 z-50"
            />
            <div className="space-y-4">
              {/* Contributors */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Contributors
                </h4>
                {formattedData.contributors.length > 0 ? (
                  <div className="space-y-4">
                    {" "}
                    {/* Changed from ul to div */}
                    {formattedData.contributors.map((contributor, index) => (
                      <motion.div // Changed from motion.li to motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }} // Slight delay
                        className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-800 dark:text-gray-400 space-y-1"
                      >
                        <p>
                          <span className="font-medium">User ID:</span>{" "}
                          {contributor.userId || "Unknown"}
                        </p>
                        <p>
                          <span className="font-medium">Contribution Type:</span>{" "}
                          {contributor.contributionType || "N/A"}
                        </p>
                        <p>
                          <span className="font-medium">Contributed At:</span>{" "}
                          {contributor.contributedAt
                            ? formatDate(contributor.contributedAt)
                            : "Unknown"}
                        </p>
                        {contributor.description && (
                          <p>
                            <span className="font-medium">Description:</span>{" "}
                            {contributor.description}
                          </p>
                        )}
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-300 ml-4">
                    No contributors data available.
                  </p>
                )}
              </div>

              {/* Voting Statistics */}
              <div>
                <h4 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  Voting Statistics
                </h4>
                <div className="flex flex-col sm:flex-row sm:gap-8 space-y-3 sm:space-y-0">
                  <div
                    className="flex items-center gap-2"
                    data-tooltip-id="tooltip-upvotes"
                    data-tooltip-content="Number of upvotes"
                  >
                    <ThumbsUp size={18} className="text-blue-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Upvotes:{" "}
                      <span className="font-medium">
                        {dataStructure.upvotes || 0}
                      </span>
                    </p>
                    <Tooltip
                      id="tooltip-upvotes"
                      place="top"
                      className="bg-gray-800 text-white text-sm rounded-md px-2 py-1 z-50"
                    />
                  </div>
                  <div
                    className="flex items-center gap-2"
                    data-tooltip-id="tooltip-downvotes"
                    data-tooltip-content="Number of downvotes"
                  >
                    <ThumbsDown size={18} className="text-blue-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Downvotes:{" "}
                      <span className="font-medium">
                        {dataStructure.downvotes || 0}
                      </span>
                    </p>
                    <Tooltip
                      id="tooltip-downvotes"
                      place="top"
                      className="bg-gray-800 text-white text-sm rounded-md px-2 py-1 z-50"
                    />
                  </div>
                  <div
                    className="flex items-center gap-2"
                    data-tooltip-id="tooltip-views"
                    data-tooltip-content="Number of views"
                  >
                    <Eye size={18} className="text-blue-500" />
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      Views:{" "}
                      <span className="font-medium">
                        {dataStructure.views || 0}
                      </span>
                    </p>
                    <Tooltip
                      id="tooltip-views"
                      place="top"
                      className="bg-gray-800 text-white text-sm rounded-md px-2 py-1 z-50"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default DataStructureMetadata;