import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../../context/DarkModeContext";
import { auth, db } from "../../firebase";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import MainWrapper from "../../context/MainWrapper";


const SuccessAlert = () => (
    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
      <strong className="font-bold">Success! </strong>
      <span className="block sm:inline">Your profile has been updated.</span>
    </div>
  );
  
const Profile = () => {
  const { toggleDarkMode, darkMode } = useDarkMode();
  const navigate = useNavigate();
  const user = auth.currentUser;
  
  // User profile state
  const [profile, setProfile] = useState({
    displayName: "",
    email: "",
    preferredName: "",
    gender: "",
    dateOfBirth: "",
    photoURL: "",
  });
  
  // Add a new state for the displayed name
  const [displayedName, setDisplayedName] = useState("");
  
  // Settings state
  const [settings, setSettings] = useState({
    voiceNotifications: false,
    webNotifications: false,
  });
  
  // UI state
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false); // New state to track image upload status

  // Fetch user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      console.log("Fetching user data for:", user.uid);
      try {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          console.log("User document exists, loading data");
          const userData = userDoc.data();
          const preferredNameValue = userData.preferredName || "";
          const displayNameValue = user.displayName || "N/A";
          
          // Prioritize the photoURL from Firestore over the one from auth
          const storedPhotoURL = userData.photoURL || user.photoURL || "";
          
          console.log("User data loaded:", { 
            preferredName: preferredNameValue,
            displayName: displayNameValue,
            photoURL: storedPhotoURL
          });
          
          // Force a fresh image URL by appending a timestamp
          const photoURLWithTimestamp = storedPhotoURL ? 
            `${storedPhotoURL}${storedPhotoURL.includes('?') ? '&' : '?'}t=${Date.now()}` : 
            "";
          
          setProfile({
            displayName: displayNameValue,
            email: user.email || "N/A",
            preferredName: preferredNameValue,
            gender: userData.gender || "",
            dateOfBirth: userData.dateOfBirth || "",
            photoURL: photoURLWithTimestamp,
          });
          
          // Set the image preview directly
          if (photoURLWithTimestamp) {
            setImagePreview(photoURLWithTimestamp);
          }
          
          // Set the displayed name
          setDisplayedName(preferredNameValue || displayNameValue);
          
          setSettings({
            voiceNotifications: userData.voiceNotifications || false,
            webNotifications: userData.webNotifications || false,
          });
          
          console.log("Loaded profile image URL:", photoURLWithTimestamp);
        } else {
          console.log("User document doesn't exist, creating new one");
          // Create a new user document if it doesn't exist
          const initialData = {
            displayName: user.displayName || "",
            email: user.email,
            preferredName: "",
            gender: "",
            dateOfBirth: "",
            photoURL: user.photoURL || "",
            voiceNotifications: false,
            webNotifications: false,
          };
          
          await setDoc(userDocRef, initialData);
          console.log("Created new user document");
          
          // Set the profile with initial data
          setProfile({
            displayName: user.displayName || "",
            email: user.email || "N/A",
            preferredName: "",
            gender: "",
            dateOfBirth: "",
            photoURL: user.photoURL || "",
          });
          
          // Set the displayed name to displayName if no preferred name exists
          setDisplayedName(user.displayName || "");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        alert("Failed to load profile data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [user]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value,
    });
  };

  // Handle settings toggle
  const handleSettingsToggle = (setting) => {
    setSettings({
      ...settings,
      [setting]: !settings[setting],
    });
  };

  // Handle profile image change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle immediate image upload
  const handleImageUpload = async () => {
    if (!user || !imageFile) return;
    
    console.log("Starting image upload process...");
    // Set loading state
    setIsUploadingImage(true);
    
    try {
      const storage = getStorage();
      const storageRef = ref(storage, `profile_images/${user.uid}_${Date.now()}`); // Add timestamp to avoid caching
    
      console.log("Uploading to Firebase Storage...");
      // Upload the image to Firebase Storage
      const uploadResult = await uploadBytes(storageRef, imageFile);
      console.log("Upload successful:", uploadResult);
      
      console.log("Getting download URL...");
      // Get the download URL
      const uploadedPhotoURL = await getDownloadURL(storageRef);
      console.log("Image uploaded successfully, URL:", uploadedPhotoURL);
      
      console.log("Updating Firestore...");
      // Update Firestore with new image URL
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        photoURL: uploadedPhotoURL,
      });
      console.log("Firestore updated successfully");
      
      // Update local state
      setProfile(prev => ({
        ...prev,
        photoURL: uploadedPhotoURL,
      }));
      
      // Clear the temporary file data
      setImageFile(null);
      
      // Keep image preview in sync with the uploaded image
      // This ensures the UI shows the uploaded image immediately
      setImagePreview(uploadedPhotoURL);
      
      // Show success message
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error uploading image:", error);
      alert(`Error uploading image: ${error.message}`);
      // Reset the image preview on error
      setImagePreview(profile.photoURL);
    } finally {
      console.log("Upload process finished, resetting loading state");
      // Reset loading state
      setIsUploadingImage(false);
    }
  };
  
  // Effect to trigger image upload when imageFile changes
  useEffect(() => {
    if (imageFile && !isUploadingImage) {
      console.log("Image file changed, triggering upload");
      handleImageUpload();
    }
  }, [imageFile]);

  // Effect to refresh the profile image when photoURL changes
  // This ensures the image stays consistent across tab switches
  useEffect(() => {
    if (profile.photoURL) {
      console.log("Profile photoURL changed, updating preview");
      // Add a timestamp or cache-busting parameter to force a fresh load
      const timestamp = new Date().getTime();
      setImagePreview(`${profile.photoURL}?t=${timestamp}`);
    }
  }, [profile.photoURL]);
  
  // Save profile data to Firestore
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      const userDocRef = doc(db, "users", user.uid);
      
      // Update Firestore
      await updateDoc(userDocRef, {
        displayName: profile.displayName,
        preferredName: profile.preferredName,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        voiceNotifications: settings.voiceNotifications,
        webNotifications: settings.webNotifications,
        // Ensure photoURL is also saved here to maintain consistency
        photoURL: profile.photoURL,
      });
      
      // Only now update local state
      setProfile(prev => ({
        ...prev,
        displayName: profile.displayName,
        preferredName: profile.preferredName,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
      }));
      
      // Update the displayed name only after successful save
      setDisplayedName(profile.preferredName || profile.displayName);
      
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("There was an error saving your profile. Please try again.");
    }
  };

  // Loading state enhancements
  if (isLoading) {
    return (
      <MainWrapper>
        <div className="flex flex-col justify-center items-center h-screen dark:text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <div className="max-w-2xl mx-auto space-y-8 dark:text-white">
        {/* Profile Header with Image */}
        <div className="flex flex-col items-center mb-6">
          <div className="relative mb-4">
            <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
              {isUploadingImage ? (
                <div className="flex items-center justify-center w-full h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Uploading...</span>
                </div>
              ) : (imagePreview || profile.photoURL) ? (
                <img 
                  src={imagePreview || profile.photoURL} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                  // Add key with timestamp to force re-render when image changes
                  key={`profile-img-${new Date().getTime()}`}
                  onError={(e) => {
                    console.error("Image failed to load");
                    e.target.onerror = null;
                    e.target.src = ''; // Clear the src to show fallback
                    // Show default avatar on error
                    e.target.parentNode.innerHTML = '<span class="text-4xl text-gray-400">👤</span>';
                  }}
                />
              ) : (
                <span className="text-4xl text-gray-400">👤</span>
              )}
            </div>
            <label htmlFor="profile-image" className={`absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer ${isUploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <input
                id="profile-image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                disabled={isUploadingImage}
              />
            </label>
          </div>
          <h1 className="text-2xl font-bold">{displayedName}</h1>
        </div>

        {/* User Info */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
          <div className="flex justify-between items-center border-b pb-2">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">Personal Info</h2>
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 hover:dark:text-blue-300"
              >
                Edit
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 hover:dark:text-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveProfile}
                  className="text-green-600 dark:text-green-500 hover:text-green-800 hover:dark:text-green-400"
                >
                  Save
                </button>
              </div>
            )}
          </div>

          {saveSuccess && <SuccessAlert />}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                 Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="displayName"
                  value={profile.displayName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              ) : (
                <p className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white">
                  {profile.displayName}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Preferred Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="preferredName"
                  value={profile.preferredName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              ) : (
                <p className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white">
                  {profile.preferredName || "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <p className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white">
                {profile.email}
              </p>
            </div>

           

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender
              </label>
              {isEditing ? (
                <select
                  name="gender"
                  value={profile.gender}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
              ) : (
                <p className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white capitalize">
                  {profile.gender || "Not set"}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Date of Birth
              </label>
              {isEditing ? (
                <input
                  type="date"
                  name="dateOfBirth"
                  value={profile.dateOfBirth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              ) : (
                <p className="mt-1 block w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md text-gray-800 dark:text-white">
                  {profile.dateOfBirth || "Not set"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-800 dark:text-white">Settings</h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-800 dark:text-white">🔊 Voice Notifications</span>
              <button
                onClick={() => handleSettingsToggle("voiceNotifications")}
                className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                  settings.voiceNotifications
                    ? "bg-blue-300 text-blue-900"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {settings.voiceNotifications ? "Disable" : "Enable"}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-800 dark:text-white">🔔 Web Notifications</span>
              <button
                onClick={() => handleSettingsToggle("webNotifications")}
                className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                  settings.webNotifications
                    ? "bg-blue-300 text-blue-900"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {settings.webNotifications ? "Disable" : "Enable"}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-800 dark:text-white">🌗 Dark Mode</span>
              <button
                onClick={toggleDarkMode}
                className={`px-4 py-1 rounded-full text-sm font-medium transition ${
                  darkMode
                    ? "bg-blue-300 text-blue-900"
                    : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                }`}
              >
                {darkMode ? "Disable" : "Enable"}
              </button>
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow p-6 space-y-4">
          <h2 className="text-xl font-semibold border-b pb-2 text-gray-800 dark:text-white">Account Actions</h2>
          <button
            onClick={() => alert("Feature coming soon!")}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-medium py-2 rounded"
          >
            🔒 Change Password
          </button>
        </section>

        <div className="text-center">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-blue-600 underline hover:text-blue-800 text-sm"
          >
            ← Back to Dashboard
          </button>
        </div>
      </div>
    </MainWrapper>
  );
};

export default Profile;