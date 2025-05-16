import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getMyProfile, patchMyProfile } from "../features/user/userSlice";
import { Loader2, Pencil } from "lucide-react";

export default function Profile() {
  const dispatch = useDispatch();
  const { myProfile, status } = useSelector((state) => state.user);
  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

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
        socialLinks: {
          github: myProfile.socialLinks?.github || "",
          linkedin: myProfile.socialLinks?.linkedin || "",
          twitter: myProfile.socialLinks?.twitter || "",
          facebook: myProfile.socialLinks?.facebook || "",
          instagram: myProfile.socialLinks?.instagram || "",
        },
        competitiveProfiles: {
          leetcode: myProfile.competitiveProfiles?.leetcode || "",
          codeforces: myProfile.competitiveProfiles?.codeforces || "",
          codechef: myProfile.competitiveProfiles?.codechef || "",
          atcoder: myProfile.competitiveProfiles?.atcoder || "",
          spoj: myProfile.competitiveProfiles?.spoj || "",
        },
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
    setFormData(myProfile);
    setIsEditing(false);
    setHasChanges(false);
  };

  const renderField = (label, name, value, isUrl = false) => (
    <div className="space-y-1">
      <label className="block font-medium text-gray-700 dark:text-white">{label}</label>
      {isEditing ? (
        <input
          type="text"
          name={name}
          value={value}
          onChange={handleChange}
          className="w-full px-3 py-2 border rounded-md bg-white dark:bg-gray-800 dark:text-white"
        />
      ) : isUrl && value ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline break-all">
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
            <Pencil size={18} />
            Edit
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
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Save
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* LEFT PANEL */}
        <div className="col-span-1 flex flex-col items-center gap-6">
          {/* Avatar */}
          {formData.avatarUrl ? (
            <img
              src={formData.avatarUrl}
              alt="Avatar"
              className="w-48 h-48 object-cover rounded-xl border"
            />
          ) : (
            <div className="w-48 h-48 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500">
              No Image
            </div>
          )}
          {isEditing && renderField("Avatar URL", "avatarUrl", formData.avatarUrl, true)}

          {/* Details below Avatar */}
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
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
                  {formData.bio || "—"}
                </p>
              )}
            </div>
            {renderField("Website", "website", formData.website, true)}
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="col-span-2 space-y-6">
          {/* Social Links */}
          <div>
            <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">Social Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(formData.socialLinks).map(([key, val]) =>
                renderField(key.charAt(0).toUpperCase() + key.slice(1), `socialLinks.${key}`, val, true)
              )}
            </div>
          </div>

          {/* Competitive Programming */}
          <div>
            <h3 className="font-medium text-lg text-gray-900 dark:text-white mb-2">Competitive Profiles</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(formData.competitiveProfiles).map(([key, val]) =>
                renderField(key.charAt(0).toUpperCase() + key.slice(1), `competitiveProfiles.${key}`, val, true)
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
