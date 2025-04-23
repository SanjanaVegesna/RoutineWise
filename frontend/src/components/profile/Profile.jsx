import React from "react";
import { useNavigate } from "react-router-dom";
import { useDarkMode } from "../../context/DarkModeContext";
import { auth } from "../../firebase";
import MainWrapper from "../../context/MainWrapper";

const Profile = () => {
    const { toggleDarkMode, darkMode } = useDarkMode();
    const navigate = useNavigate();
    const user = auth.currentUser;

    return (
        <MainWrapper>
            <div className="max-w-2xl mx-auto space-y-8 dark:text-black">


                {/* User Info */}
                <section className="bg-white bg-gray-800 rounded-2xl shadow p-6 space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Account Info</h2>
                    <p>
                        <span className="font-medium">Display Name:</span>{" "}
                        {user?.displayName || "N/A"}
                    </p>
                    <p>
                        <span className="font-medium">Email:</span> {user?.email}
                    </p>
                </section>

                {/* Preferences */}
                <section className="bg-white bg-gray-800 rounded-2xl shadow p-6 space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Preferences</h2>
                    <div className="flex items-center justify-between">
                        <span>🌗 Dark Mode</span>
                        <button
                            onClick={toggleDarkMode}
                            className={`px-4 py-1 rounded-full text-sm font-medium transition ${darkMode
                                ? "bg-blue-300 text-blue-900"
                                : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                }`}
                        >
                            {darkMode ? "Disable" : "Enable"}
                        </button>
                    </div>
                </section>

                {/* Account Actions */}
                <section className="bg-white bg-gray-800 rounded-2xl shadow p-6 space-y-4">
                    <h2 className="text-xl font-semibold border-b pb-2">Account Actions</h2>
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
