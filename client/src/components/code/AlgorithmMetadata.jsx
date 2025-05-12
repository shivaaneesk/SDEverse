const AlgorithmMetadata = ({ algorithm }) => {
  return (
    <>
      {/* Time Complexity Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Time Complexity</h3>
        <p className="text-gray-700 dark:text-gray-300">
          {algorithm.complexity?.time ? algorithm.complexity.time : "N/A"}
        </p>
      </div>

      {/* Space Complexity Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Space Complexity</h3>
        <p className="text-gray-700 dark:text-gray-300">
          {algorithm.complexity?.space ? algorithm.complexity.space : "N/A"}
        </p>
      </div>

      {/* Category Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Category</h3>
        <p className="text-gray-700 dark:text-gray-300">
          {Array.isArray(algorithm.category)
            ? algorithm.category.join(", ")
            : "N/A"}
        </p>
      </div>

      {/* Difficulty Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Difficulty</h3>
        <p className="text-gray-700 dark:text-gray-300">
          {algorithm.difficulty || "N/A"}
        </p>
      </div>

      {/* Useful Links Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Useful Links</h3>
        {algorithm.links?.length > 0 ? (
          <ul className="list-disc pl-6 text-blue-600 dark:text-blue-400">
            {algorithm.links.map((link, index) => (
              <li key={index} className="mt-1">
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {link}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600 dark:text-gray-300">No links available.</p>
        )}
      </div>

      {/* Tags Section */}
      <div className="mt-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Tags</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {algorithm.tags?.length > 0 ? (
            algorithm.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-full text-sm"
              >
                {tag}
              </span>
            ))
          ) : (
            <p className="text-gray-600 dark:text-gray-300">No tags available.</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AlgorithmMetadata;
