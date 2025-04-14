import React from "react";
import { useDarkMode } from "../context/DarkModeContext";

const MainWrapper = ({ children }) => {
    const { darkMode } = useDarkMode();

    return (
        <main
            className={`min-h-screen font-sans p-4 sm:p-6 md:p-8 space-y-8 ${darkMode
                    ? "bg-gray-900 text-white"
                    : "bg-gradient-to-b from-blue-50 to-white text-gray-900"
                }`}
        >
            

            {children}
        </main>
    );
};

export default MainWrapper;
