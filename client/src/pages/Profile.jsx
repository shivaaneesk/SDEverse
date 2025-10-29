import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from 'react-router-dom'; // <-- Import useParams
import {
  getMyProfile,
  getUserByUsername,
  patchMyProfile,
  refreshSocialStats,
  refreshCompetitiveStats,
} from "../features/user/userSlice";
import { Loader2, NotebookText, Edit, User, Bookmark } from "lucide-react";
import ProfileForm from "./ProfileForm";
import AllNotesList from "../components/AllNotesList";
import Bookmarks from "../components/bookmark"; // Corrected path assuming it's in components

function formatKey(key) {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/^./, (s) => s.toUpperCase())
    .replace(/_/g, " ");
}

const PLATFORM_DOMAINS = {
  github: "github.com", linkedin: "linkedin.com", twitter: "twitter.com",
  facebook: "facebook.com", instagram: "instagram.com", leetcode: "leetcode.com",
  codechef: "codechef.com", codeforces: "codeforces.com", atcoder: "atcoder.jp",
  spoj: "spoj.com",
};

const ensureProtocol = (url) => {
  if (!url) return "";
  const trimmed = url.trim();
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  return `https://${trimmed}`;
};

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { username } = useParams(); // <-- ADD THIS LINE to define username
  const { myProfile, selectedUser, status } = useSelector((state) => state.user); // Get these from user slice
  const authUser = useSelector((state) => state.auth.user); // Get logged-in user from auth slice
  const themeMode = useSelector((state) => state.theme.mode);

  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [refreshing, setRefreshing] = useState({ type: null });
  const [lastRefreshed, setLastRefreshed] = useState({ competitive: null, social: null });
  const [activeTab, setActiveTab] = useState('profile');

  // --- State from previous merge (needed for ProfileForm) ---
  const [urlErrors, setUrlErrors] = useState({});
  const [actionError, setActionError] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [uploadedImageBase64, setUploadedImageBase64] = useState(null);
  const [uploadedBannerBase64, setUploadedBannerBase64] = useState(null);

  const imageData = {
    imagePreview, setImagePreview, uploadedImageBase64, setUploadedImageBase64,
    bannerPreview, setBannerPreview, uploadedBannerBase64, setUploadedBannerBase64,
  };

  const isViewingOtherUser = username && !(authUser && authUser.username === username);
  const profileDataToDisplay = isViewingOtherUser ? selectedUser : myProfile;
  const canEdit = !isViewingOtherUser && authUser;

  useEffect(() => {
    if (username) {
      if (authUser && authUser.username === username) {
        dispatch(getMyProfile());
      } else {
        dispatch(getUserByUsername(username));
      }
    } else if (authUser) { // If no username param, fetch logged-in user's profile
        dispatch(getMyProfile());
    }
     // Optional: Handle case where user is not logged in and no username provided
     // else { navigate('/login'); }
  }, [dispatch, username, authUser]); // Add dependencies

  useEffect(() => {
    const profileData = isViewingOtherUser ? selectedUser : myProfile;
    if (profileData) {
      setFormData({
        fullName: profileData.fullName || "",
        bio: profileData.bio || "",
        avatarUrl: profileData.avatarUrl || "",
        bannerUrl: profileData.bannerUrl || "", // Make sure bannerUrl exists in your model/state
        location: profileData.location || "",
        website: profileData.website || "",
        socialLinks: profileData.socialLinks || {},
        competitiveProfiles: profileData.competitiveProfiles || {},
        socialStats: profileData.socialStats || {},
        competitiveStats: profileData.competitiveStats || {},
      });
      setLastRefreshed({
        competitive: profileData.lastCompetitiveRefresh || null,
        social: profileData.lastSocialRefresh || null,
      });
      setHasChanges(false);
      setUrlErrors({});
      setImagePreview(null);
      setBannerPreview(null);
      setUploadedImageBase64(null);
      setUploadedBannerBase64(null);
      setIsEditing(false);
    }
  }, [myProfile, selectedUser, isViewingOtherUser]);

  const isValidUrl = (val) => {
    if (!val) return true;
    const trimmedVal = val.trim();
    try {
      const url = new URL(trimmedVal.startsWith("http") ? trimmedVal : `https://${trimmedVal}`);
      return !!url.hostname && url.hostname.includes(".");
    } catch {
      return false;
    }
  };

  const validateAndSetError = (name, value) => {
    let errorMsg = null;
    const trimmedValue = value ? value.trim() : "";
    if (trimmedValue && !isValidUrl(trimmedValue)) {
      errorMsg = "Please enter a valid URL structure (e.g., https://example.com or example.com).";
    }
    if (!errorMsg && trimmedValue && (name.startsWith("socialLinks.") || name.startsWith("competitiveProfiles."))) {
      const parts = name.split(".");
      if (parts.length === 2) {
        const platform = parts[1];
        const requiredDomain = PLATFORM_DOMAINS[platform];
        if (requiredDomain) {
          try {
            const url = new URL(trimmedValue.startsWith("http") ? trimmedValue : `https://${trimmedValue}`);
            if (!url.hostname.endsWith(requiredDomain)) {
              errorMsg = `This link must be a valid ${formatKey(platform)} profile URL (must contain ${requiredDomain}).`;
            }
          } catch {
            errorMsg = "Invalid URL structure.";
          }
        }
      }
    }
    setUrlErrors((prev) => {
      const next = { ...prev };
      if (errorMsg) next[name] = errorMsg;
      else delete next[name];
      return next;
    });
  };

  const validateAllUrlsBeforeSubmit = (data) => {
    const errors = {};
    const check = (k, v) => {
      const trimmedValue = v ? v.trim() : "";
      if (!trimmedValue) return;
      if (!isValidUrl(trimmedValue)) {
        errors[k] = "Please enter a valid URL structure (e.g., https://example.com).";
        return;
      }
      if (k.startsWith("socialLinks.") || k.startsWith("competitiveProfiles.")) {
        const platform = k.split(".")[1];
        const requiredDomain = PLATFORM_DOMAINS[platform];
        if (requiredDomain) {
          try {
            const url = new URL(trimmedValue.startsWith("http") ? trimmedValue : `https://${trimmedValue}`);
            if (!url.hostname.endsWith(requiredDomain)) {
              errors[k] = `The link must be a valid ${formatKey(platform)} profile URL (must contain ${requiredDomain}).`;
            }
          } catch {
            errors[k] = "Invalid URL format.";
          }
        }
      }
    };
    check("avatarUrl", data.avatarUrl);
    check("website", data.website);
    if (data.socialLinks) {
      Object.entries(data.socialLinks).forEach(([key, val]) => check(`socialLinks.${key}`, val));
    }
    if (data.competitiveProfiles) {
      Object.entries(data.competitiveProfiles).forEach(([key, val]) => check(`competitiveProfiles.${key}`, val));
    }
    return errors;
  };

  const getAvatarValue = () => uploadedImageBase64 || formData?.avatarUrl || "";
  const getBannerValue = () => uploadedBannerBase64 || formData?.bannerUrl || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setHasChanges(true);
    setActionError(null);
    const isUrlField = name === "avatarUrl" || name === "website" || name === "bannerUrl" || name.startsWith("socialLinks.") || name.startsWith("competitiveProfiles.");
    const newValue = value;
    if (name.includes(".")) {
      const [section, key] = name.split(".");
      setFormData((prev) => ({ ...prev, [section]: { ...(prev?.[section] || {}), [key]: newValue } }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: newValue }));
    }
    if (isUrlField) {
      validateAndSetError(name, newValue);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData || !canEdit) return;
    const avatarValue = getAvatarValue();
    const bannerValue = getBannerValue();
    const currentFormData = { ...formData, avatarUrl: avatarValue, bannerUrl: bannerValue };
    const validationErrors = validateAllUrlsBeforeSubmit(currentFormData);
    if (Object.keys(validationErrors).length > 0) {
      setUrlErrors(validationErrors);
      setActionError("Please fix the errors in the form before saving.");
      return;
    }
    const dataToSubmit = { ...currentFormData };
    if (dataToSubmit.avatarUrl && !dataToSubmit.avatarUrl.startsWith("data:")) {
      dataToSubmit.avatarUrl = ensureProtocol(dataToSubmit.avatarUrl);
    }
    if (dataToSubmit.bannerUrl && !dataToSubmit.bannerUrl.startsWith("data:")) {
        dataToSubmit.bannerUrl = ensureProtocol(dataToSubmit.bannerUrl);
    }
    dataToSubmit.website = ensureProtocol(dataToSubmit.website);
    if (dataToSubmit.socialLinks) {
        dataToSubmit.socialLinks = Object.fromEntries(
            Object.entries(dataToSubmit.socialLinks).map(([key, val]) => [key, ensureProtocol(val)])
        );
    }
    if (dataToSubmit.competitiveProfiles) {
        dataToSubmit.competitiveProfiles = Object.fromEntries(
            Object.entries(dataToSubmit.competitiveProfiles).map(([key, val]) => [key, ensureProtocol(val)])
        );
    }
    try {
      setActionError(null);
      const res = await dispatch(patchMyProfile(dataToSubmit));
      if (res?.error) throw new Error(res.error?.message || res.payload || 'Update failed');
      const res2 = await dispatch(getMyProfile());
      if (res2?.error) throw new Error(res2.error?.message || res2.payload || 'Fetch profile failed after update');
    } catch (err) {
      setActionError(err.message || 'Failed to update profile');
      return;
    }
    setIsEditing(false);
    setHasChanges(false);
    setUrlErrors({});
    setImagePreview(null);
    setBannerPreview(null);
    setUploadedImageBase64(null);
    setUploadedBannerBase64(null);
  };

  const handleCancel = () => {
    const profileData = isViewingOtherUser ? selectedUser : myProfile;
    if (profileData) {
       setFormData({
         fullName: profileData.fullName || "",
         bio: profileData.bio || "",
         avatarUrl: profileData.avatarUrl || "",
         bannerUrl: profileData.bannerUrl || "",
         location: profileData.location || "",
         website: profileData.website || "",
         socialLinks: profileData.socialLinks || {},
         competitiveProfiles: profileData.competitiveProfiles || {},
         socialStats: profileData.socialStats || {},
         competitiveStats: profileData.competitiveStats || {},
       });
    }
    setImagePreview(null);
    setBannerPreview(null);
    setUploadedImageBase64(null);
    setUploadedBannerBase64(null);
    setIsEditing(false);
    setHasChanges(false);
    setUrlErrors({});
    setActionError(null);
  };

  const handleRefresh = async (type) => {
    if (!canEdit) return;
    setRefreshing({ type });
    try {
      setActionError(null);
      const thunk = type === "competitive" ? refreshCompetitiveStats() : refreshSocialStats();
      const res = await dispatch(thunk);
      if (res?.error) throw new Error(res.error?.message || res.payload || 'Refresh failed');
      const res2 = await dispatch(getMyProfile());
      if (res2?.error) throw new Error(res2.error?.message || res2.payload || 'Fetch profile failed after refresh');
    } catch(err) {
        setActionError(err.message || `Failed to refresh ${type} stats`);
    } finally {
      setRefreshing({ type: null });
    }
  };

  const handleTabChange = (tabName) => {
    if (isEditing && activeTab === 'profile') {
        if (!window.confirm("You have unsaved changes. Are you sure you want to switch tabs? Changes will be lost.")) {
            return;
        }
    }
    setActiveTab(tabName);
    handleCancel();
  };

  const handleEditProfile = () => {
    if (!canEdit) return;
     setActiveTab('profile');
     setIsEditing(true);
  };

  const isLoading = status.fetchProfile === "loading" || status.fetchSelectedUser === "loading";
  if (isLoading || !formData) {
     return (
       <div className={`flex items-center justify-center min-h-screen ${themeMode === 'dark' ? 'bg-gray-950 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
         <Loader2 className="animate-spin text-blue-500 mr-3" size={48} />
         <p className="text-xl font-semibold">Loading Profile...</p>
       </div>
     );
  }

  const getTabClassName = (tabName) => {
      const baseStyle = "flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition duration-200 font-medium text-sm sm:text-base";
      const activeStyle = "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-200";
      const inactiveStyle = "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600";
      return `${baseStyle} ${activeTab === tabName ? activeStyle : inactiveStyle}`;
  };

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${themeMode === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
         <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-center sm:justify-start">
            <button onClick={() => handleTabChange('profile')} className={getTabClassName('profile')}>
                <User size={18} /> <span>Profile</span>
            </button>
            {canEdit && (
              <>
                <button onClick={() => handleTabChange('notes')} className={getTabClassName('notes')}>
                    <NotebookText size={18} /> <span>All Notes</span>
                </button>
                 <button onClick={() => handleTabChange('bookmarks')} className={getTabClassName('bookmarks')}>
                    <Bookmark size={18} /> <span>Bookmarks</span>
                </button>
              </>
            )}
         </div>
         <div className="w-full sm:w-auto flex justify-end">
             {canEdit && activeTab === 'profile' && !isEditing && (
                <button
                    onClick={handleEditProfile}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition duration-200"
                >
                    <Edit size={18} />
                    <span>Edit Profile</span>
                </button>
             )}
         </div>
      </div>

      {activeTab === 'profile' && (
          <ProfileForm
            key={profileDataToDisplay?._id || 'profile-form'}
            formData={formData}
            isEditing={isEditing && canEdit}
            hasChanges={hasChanges}
            refreshing={refreshing}
            lastRefreshed={lastRefreshed}
            urlErrors={urlErrors}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onEditToggle={handleEditProfile}
            onRefresh={handleRefresh}
            imageData={imageData}
            actionError={actionError}
            readonly={!canEdit}
          />
        )}

      {canEdit && activeTab === 'notes' && <AllNotesList />}
      {canEdit && activeTab === 'bookmarks' && <Bookmarks />}

    </div>
  );
}