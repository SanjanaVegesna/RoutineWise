import { NavLink } from 'react-router-dom';

const Navbar = () => (
  <nav className="flex justify-between bg-gray-800 text-white px-6 py-3 shadow">
    <div className="space-x-4 flex">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `px-3 py-2 rounded-md ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}
      >
        Home
      </NavLink>
      <NavLink
        to="/make-plan"
        className={({ isActive }) => `px-3 py-2 rounded-md ${isActive ? "bg-gray-700" : "hover:bg-gray-700"}`}
      >
        Make a Plan
      </NavLink>
    </div>
    <div className="space-x-4 flex items-center">
      <button className="hover:text-gray-300">⚙️ Settings</button>
      <button className="hover:text-gray-300">👤 Profile</button>
    </div>
  </nav>
);

export default Navbar;