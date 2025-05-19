import { Pencil } from "lucide-react";
import ProfileSection from "./ProfileSection";
import LinksSection from "./LinksSection";

export default function ProfileForm({
  formData,
  isEditing,
  hasChanges,
  refreshing,
  lastRefreshed,
  onChange,
  onSubmit,
  onCancel,
  onEditToggle,
  onRefresh,
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header with Edit aligned to the right */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <h1 className="text-4xl font-bold text-white dark:text-white text-center w-full sm:w-auto">
          My Profile
        </h1>

        {!isEditing ? (
          <button
            onClick={onEditToggle}
            className="flex items-center gap-2 text-green-600 font-medium bg-green-50 hover:bg-green-100 dark:bg-green-900/10 dark:hover:bg-green-900/20 px-4 py-2 rounded-xl transition shadow-sm hover:shadow-md hover:scale-[1.02]"
          >
            <Pencil size={18} className="text-green-600" />
            Edit
          </button>
        ) : (
          <div className="flex gap-3 flex-wrap justify-center sm:justify-end w-full sm:w-auto">
            <button
              onClick={onCancel}
              className="px-5 py-2 font-medium rounded-full border border-slate-600 text-slate-700 dark:border-slate-400 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition shadow-sm hover:shadow-md hover:scale-[1.02]"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!hasChanges}
              className={`px-5 py-2 font-semibold rounded-full transition ${
                hasChanges
                  ? "bg-green-600 text-white hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 shadow hover:shadow-lg hover:scale-105"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Profile Details */}
      <section className="space-y-6">
        <ProfileSection
          isEditing={isEditing}
          formData={formData}
          handleChange={onChange}
        />
      </section>

      {/* Competitive Links */}
      <section className="space-y-6">
        <LinksSection
          title="Competitive Links"
          links={formData.competitiveProfiles}
          stats={formData.competitiveStats}
          isEditing={isEditing}
          handleChange={onChange}
          refreshing={refreshing.type === "competitive"}
          onRefresh={() => onRefresh("competitive")}
          lastUpdated={lastRefreshed.competitive}
        />
      </section>

      {/* Social Links */}
      <section className="space-y-6">
        <LinksSection
          title="Social Links"
          links={formData.socialLinks}
          stats={formData.socialStats}
          isEditing={isEditing}
          handleChange={onChange}
          refreshing={refreshing.type === "social"}
          onRefresh={() => onRefresh("social")}
          lastUpdated={lastRefreshed.social}
        />
      </section>
    </div>
  );
}
