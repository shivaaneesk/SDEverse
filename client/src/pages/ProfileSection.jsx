export default function ProfileSection({ isEditing, formData, handleChange }) {
  return (
    <section className="space-y-6">
      <h2 className="text-2xl font-bold text-left text-gray-900 dark:text-white">
        Profile Details
      </h2>

      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-md space-y-6">
        <div className="flex flex-col items-center gap-4">
          {formData.avatarUrl ? (
            <img
              src={formData.avatarUrl}
              alt="Profile"
              className="w-48 h-48 object-cover rounded-2xl shadow-md"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-200 dark:bg-gray-700 rounded-2xl flex items-center justify-center text-gray-500 dark:text-gray-300 shadow-md">
              No Image
            </div>
          )}

          {isEditing && (
            <input
              type="text"
              name="avatarUrl"
              value={formData.avatarUrl}
              onChange={handleChange}
              placeholder="Avatar URL"
              className="w-full max-w-md px-4 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
            />
          )}
        </div>

        <div className="space-y-4 w-full max-w-6xl mx-auto">
          {renderField(
            "Full Name",
            "fullName",
            formData.fullName,
            isEditing,
            handleChange
          )}
          {renderField(
            "Location",
            "location",
            formData.location,
            isEditing,
            handleChange
          )}
          <div>
            <label className="block font-medium text-gray-800 dark:text-gray-200 mb-1">
              Bio
            </label>
            {isEditing ? (
              <textarea
                name="bio"
                rows={3}
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
                placeholder="Write something about yourself"
              />
            ) : (
              <p className="text-gray-800 dark:text-gray-200 whitespace-pre-line">
                {formData.bio || "—"}
              </p>
            )}
          </div>
          {renderField(
            "Website",
            "website",
            formData.website,
            isEditing,
            handleChange,
            true
          )}
        </div>
      </div>
    </section>
  );
}

function renderField(
  label,
  name,
  value,
  isEditing,
  handleChange,
  isUrl = false
) {
  return (
    <div className="space-y-2">
      <label className="block font-medium text-gray-800 dark:text-gray-200">
        {label}
      </label>
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600"
        />
      ) : isUrl && value ? (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="text-green-600 hover:underline break-all"
        >
          {value}
        </a>
      ) : (
        <p className="text-gray-800 dark:text-gray-200">{value || "—"}</p>
      )}
    </div>
  );
}
