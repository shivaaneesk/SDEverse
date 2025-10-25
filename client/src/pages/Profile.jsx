import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import {
  getMyProfile,
  patchMyProfile,
  refreshSocialStats,
  refreshCompetitiveStats,
} from "../features/user/userSlice";
import { Loader2, NotebookText, Edit, User, Bookmark } from "lucide-react";
import ProfileForm from "./ProfileForm";
import AllNotesList from "../components/AllNotesList";
import Bookmarks from "../components/bookmark";

export default function Profile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const myProfile = useSelector((state) => state.auth.user);
  const status = useSelector((state) => state.user.status);
  const themeMode = useSelector((state) => state.theme.mode);

  const [formData, setFormData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [refreshing, setRefreshing] = useState({ type: null });
  const [lastRefreshed, setLastRefreshed] = useState({ competitive: null, social: null });
  const [activeTab, setActiveTab] = useState('profile');

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
      setLastRefreshed({
        competitive: myProfile.lastCompetitiveRefresh || null,
        social: myProfile.lastSocialRefresh || null,
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
        [section]: { ...(prev?.[section] || {}), [key]: value },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData) return;
    await dispatch(patchMyProfile(formData));
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleCancel = () => {
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
    }
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

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleEditProfile = () => {
     setActiveTab('profile');
     setIsEditing(true);
  };

   if (!myProfile) {
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
            <button onClick={() => handleTabChange('notes')} className={getTabClassName('notes')}>
                <NotebookText size={18} /> <span>All Notes</span>
            </button>
             <button onClick={() => handleTabChange('bookmarks')} className={getTabClassName('bookmarks')}>
                <Bookmark size={18} /> <span>Bookmarks</span>
            </button>
         </div>

         <div className="w-full sm:w-auto flex justify-end">
             {activeTab === 'profile' && !isEditing && (
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

      {activeTab === 'profile' && formData && (
          <ProfileForm
            formData={formData}
            isEditing={isEditing}
            hasChanges={hasChanges}
            refreshing={refreshing}
            lastRefreshed={lastRefreshed}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            onEditToggle={handleEditProfile}
            onRefresh={handleRefresh}
          />
        )}

      {activeTab === 'notes' && <AllNotesList />}

      {activeTab === 'bookmarks' && <Bookmarks />}

    </div>
  );
}