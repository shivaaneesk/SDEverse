// Complete corrected profile.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getMyProfile,
  patchMyProfile,
  refreshSocialStats,
  refreshCompetitiveStats,
} from "../features/user/userSlice";
import {
  Loader2,
  Pencil,
  ExternalLink,
  RefreshCcw,
} from "lucide-react";

export default function Profile() {
  const dispatch = useDispatch();
  const { myProfile, status } = useSelector((state) => state.user);
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [refreshing, setRefreshing] = useState({ type: null });

  useEffect(() => {
    dispatch(getMyProfile());
  }, [dispatch]);

  useEffect(() => {
    if (myProfile) {
      setFormData({
        fullName: myProfile.fullName || "",
        bio: myProfile.bio || "",
        avatarUrl: myProfile.avatarUrl || "",
        location: myProfile.location || "",
        website: myProfile.website || "",
        socialLinks: myProfile.socialLinks || {},
        competitiveProfiles: myProfile.competitiveProfiles || {},
        socialStats: myProfile.socialStats || {},
        competitiveStats: myProfile.competitiveStats || {},
      });
      setHasChanges(false);
    }
  }, [myProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHasChanges(true);
    if (name.includes(".")) {
      const [section, key] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [section]: {
          ...prev[section],
          [key]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await dispatch(patchMyProfile(formData));
    await dispatch(getMyProfile());
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
    setFormData({ ...myProfile });
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleRefresh = async (type) => {
    setRefreshing({ type });
    try {
      if (type === "competitive") {
        await dispatch(refreshCompetitiveStats());
      } else {
        await dispatch(refreshSocialStats());
      }
      await dispatch(getMyProfile());
    } finally {
      setRefreshing({ type: null });
    }
  };

  const renderField = (label, name, value, isUrl = false) => (
    <div key={name} className="space-y-1">
      <label className="block font-medium text-gray-800 dark:text-white">{label}</label>
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
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
        <p className="text-gray-700 dark:text-gray-300">{value || "—"}</p>
      )}
    </div>
  );

  if (status === "loading" || !formData) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Profile</h1>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-blue-600 hover:underline"
          >
            <Pencil size={18} /> Edit
          </button>
        ) : (
          <div className="space-x-4">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-md text-gray-600 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!hasChanges}
              className={`px-4 py-2 text-white rounded-md ${
                hasChanges ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Save
            </button>
          </div>
        )}
      </div>

      {/* Profile Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="col-span-1 flex flex-col items-center gap-6">
          {formData.avatarUrl ? (
            <img src={formData.avatarUrl} alt="Avatar" className="w-48 h-48 object-cover rounded-xl border" />
          ) : (
            <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">No Image</div>
          )}
          {isEditing && renderField("Avatar URL", "avatarUrl", formData.avatarUrl, true)}
          <div className="w-full space-y-4">
            {renderField("Full Name", "fullName", formData.fullName)}
            {renderField("Location", "location", formData.location)}
            <div>
              <label className="block font-medium text-gray-700 dark:text-white mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
                />
              ) : (
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">{formData.bio || "—"}</p>
              )}
            </div>
            {renderField("Website", "website", formData.website, true)}
          </div>
        </div>

        {/* Editable Links & Stats */}
        <div className="col-span-2 space-y-8">
          <Section title="Social Links">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(formData.socialLinks).map(([key, val]) =>
                renderField(capitalize(key), `socialLinks.${key}`, val, true)
              )}
            </div>
          </Section>

          <Section title="Competitive Profiles">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(formData.competitiveProfiles).map(([key, val]) =>
                renderField(capitalize(key), `competitiveProfiles.${key}`, val, true)
              )}
            </div>
          </Section>

          <StatsSection
            title="Competitive Stats"
            data={formData.competitiveStats}
            links={formData.competitiveProfiles}
            refreshing={refreshing.type === "competitive"}
            onRefresh={() => handleRefresh("competitive")}
          />

          <StatsSection
            title="Social Stats"
            data={formData.socialStats}
            links={formData.socialLinks}
            refreshing={refreshing.type === "social"}
            onRefresh={() => handleRefresh("social")}
          />
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function StatsSection({ title, data, links, refreshing, onRefresh }) {
  const platforms = Object.keys(links).filter((platform) => links[platform]);
  if (platforms.length === 0) return null;

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-lg text-gray-900 dark:text-white">{title}</h3>
        <button
          onClick={onRefresh}
          className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
        >
          {refreshing ? <Loader2 size={16} className="animate-spin" /> : <RefreshCcw size={16} />}
          Refresh All
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {platforms.map((platform) => {
          const stats = data[platform];
          if (!stats || Object.keys(stats).length === 0) return null;

          return (
            <div
              key={platform}
              className="border p-4 rounded-lg bg-gray-50 dark:bg-gray-800 text-sm"
            >
              <div className="flex justify-between mb-2 items-center">
                <span className="font-semibold capitalize text-gray-900 dark:text-white">
                  {platform}
                </span>
                <a
                  href={links[platform]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-600 hover:underline"
                >
                  <ExternalLink size={16} />
                </a>
              </div>
              <div className="grid grid-cols-2 gap-2 text-gray-700 dark:text-gray-200">
                {Object.entries(stats).map(([key, val]) => (
                  <div key={key}>
                    <span className="font-medium">{formatKey(key)}:</span> {val}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function formatKey(key) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase()).replace(/_/g, " ");
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
