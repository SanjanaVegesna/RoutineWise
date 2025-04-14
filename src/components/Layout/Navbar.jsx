import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { toast } from "react-toastify";
import { useState, useEffect, useRef } from "react";
import { useDarkMode } from "../../context/DarkModeContext";
import { FaUserCircle } from "react-icons/fa";

const Navbar = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useDarkMode();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (err) {
      toast.error("Failed to logout: " + err.message);
    }
  };

  return (
    <header
      className={`shadow-lg px-6 py-5 flex justify-between items-center sticky top-0 z-10 ${
        darkMode ? "bg-gray-800 text-white" : "bg-white text-gray-800"
      }`}
    >
      {/* Logo */}
      <h1 className="text-xl font-bold flex items-center gap-3">
        <img
          src="/images/RoutineWise1.png"
          alt="RoutineWise Logo"
          className="w-10 h-10 object-contain"
        />
        <span className="tracking-tight">RoutineWise</span>
      </h1>

      {/* Navigation */}
      <nav className="flex gap-4 text-sm sm:text-base items-center relative">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `px-3 py-2 rounded-md transition ${
              isActive
                ? "text-white bg-gray-300 dark:bg-gray-700"
                : "hover:bg-white dark:hover:bg-gray-700"
            }`
          }
        >
          Home
        </NavLink>
        <NavLink
          to="/make-plan"
          className={({ isActive }) =>
            `px-3 py-2 rounded-md transition ${
              isActive
                ? "text-white bg-gray-300 dark:bg-gray-700"
                : "hover:bg-gray-200 dark:hover:bg-gray-700"
            }`
          }
        >
          Make a Plan
        </NavLink>

        {/* Dark Mode Toggle */}
        <button
          onClick={toggleDarkMode}
          className="text-sm px-3 py-1 rounded-full bg-blue-100 hover:bg-blue-300 text-blue-800"
        >
          {darkMode ? "🌞 Light Mode" : "🌙 Dark Mode"}
        </button>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="focus:outline-none"
          >
            <FaUserCircle className="w-8 h-8 text-blue-600 hover:text-blue-800" />
          </button>

          {dropdownOpen && (
            <div
              className={`absolute right-0 mt-2 w-40 rounded-md shadow-lg py-2 text-sm z-50 border transition ${
                darkMode
                  ? "bg-gray-700 text-white border-gray-600"
                  : "bg-white border-gray-200"
              }`}
            >
              <button
                className="block w-full text-left px-4 py-2 transition hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => {
                  setDropdownOpen(false);
                  navigate("/profile");
                }}
              >
                👤 Profile
              </button>
              <button
                className="block w-full text-left px-4 py-2 transition hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={handleLogout}
              >
                🚪 Logout
              </button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
