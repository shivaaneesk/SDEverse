import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from 'react-router-dom';
import {
  getMyProfile,
  patchMyProfile,
  refreshSocialStats,
  refreshCompetitiveStats,
} from "../features/user/userSlice";
import { Loader2, NotebookText, Edit } from "lucide-react";
import ProfileForm from "./ProfileForm"; 
import AllNotesList from "../components/AllNotesList"; 

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
  const [lastRefreshed, setLastRefreshed] = useState({
    competitive: null,
    social: null,
  });
  const [showAllNotes, setShowAllNotes] = useState(false); 
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

  const handleChange = (e) => { /* ... (same as before) ... */ };
  const handleSubmit = async (e) => { /* ... (same as before) ... */ };
  const handleCancel = () => { /* ... (same as before, reset formData from myProfile) ... */ };
  const handleRefresh = async (type) => { /* ... (same as before) ... */ };

  const handleAllNotes = () => {
    setShowAllNotes(prev => !prev);
    setIsEditing(false);
    setHasChanges(false);
  };

  const handleEditProfile = () => {
     setIsEditing(true);
     setShowAllNotes(false); 
  };


   if (!myProfile || status === 'loading') { 
     return (
       <div className={`flex items-center justify-center min-h-screen ${themeMode === 'dark' ? 'bg-gray-950 text-gray-200' : 'bg-gray-50 text-gray-800'}`}>
         <Loader2 className="animate-spin text-blue-500 mr-3" size={48} />
         <p className="text-xl font-semibold">Loading Profile...</p>
       </div>
     );
   }

  return (
    <div className={`min-h-screen py-8 px-4 sm:px-6 lg:px-8 ${themeMode === 'dark' ? 'bg-gray-950 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>
      {/* Header section */}
      <div className="flex justify-between items-center mb-6">
         {/* All Notes Button */}
         <button
           onClick={handleAllNotes}
           className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-sm transition duration-200 ${
               showAllNotes
                 ? 'bg-indigo-200 dark:bg-indigo-700 text-indigo-800 dark:text-indigo-100 font-medium'
                 : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
           }`}
         >
           <NotebookText size={18} />
           <span>{showAllNotes ? 'Hide Notes' : 'All Notes'}</span>
         </button>

         {/* Title */}
         <h1 className="text-3xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500 hidden md:block">
           My Profile
         </h1>

         {/* Edit Button */}
         {!isEditing && !showAllNotes && (
            <button
                onClick={handleEditProfile}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg shadow-sm hover:bg-green-600 transition duration-200"
            >
                <Edit size={18} />
                <span>Edit Profile</span>
            </button>
         )}
         {/* Placeholder for alignment */}
         {(isEditing || showAllNotes) && <div className="w-32 h-10 invisible"></div>} {/* Use invisible placeholder */}

      </div>

      {/* Conditionally render Profile Form OR All Notes List */}
      {!showAllNotes ? (
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
        ) : (
          <AllNotesList />
      )}
    </div>
  );
}