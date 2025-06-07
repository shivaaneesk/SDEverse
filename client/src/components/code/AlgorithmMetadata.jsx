import React from 'react'; // Added React import

const AlgorithmMetadata = ({ algorithm }) => {
  const { complexity = {} } = algorithm;
  const { time, space } = complexity;

  return (
    <div className="space-y-8 mt-8"> {/* Overall spacing for metadata sections */}

      {/* Time Complexity Section */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Time Complexity
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-base">
          {time || "N/A"}
        </p>
      </div>

      {/* Space Complexity Section */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Space Complexity
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-base">
          {space || "N/A"}
        </p>
      </div>

      {/* Category Section */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Category
        </h3>
        <p className="text-gray-700 dark:text-gray-300 text-base">
          {Array.isArray(algorithm.category)
            ? algorithm.category.join(", ")
            : "N/A"}
        </p>
      </div>

      {/* Difficulty Section */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Difficulty
        </h3>
        <p className={`text-base font-medium ${
            algorithm.difficulty === 'Easy' ? 'text-green-500' :
            algorithm.difficulty === 'Medium' ? 'text-yellow-500' :
            algorithm.difficulty === 'Hard' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'
          }`}>
          {algorithm.difficulty || "N/A"}
        </p>
      </div>

      {/* Useful Links Section */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Useful Links
        </h3>
        {algorithm.links?.length > 0 ? (
          <ul className="list-disc pl-6 text-blue-600 dark:text-blue-400 space-y-2">
            {algorithm.links.map((link, index) => (
              <li key={index}>
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-base break-all"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-300 text-base">
            No links available.
          </p>
        )}
      </div>

      {/* Tags Section */}
      <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
          Tags
        </h3>
        <div className="flex flex-wrap gap-3 mt-2">
          {algorithm.tags?.length > 0 ? (
            algorithm.tags.map((tag, index) => (
              <span
                key={index}
                className="px-4 py-1.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium shadow-sm transition-colors hover:bg-blue-200 dark:hover:bg-blue-800"
              >
                {tag}
              </span>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-300 text-base">
              No tags available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlgorithmMetadata;