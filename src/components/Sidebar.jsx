import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  FileText,
  LogOut,
  ChevronDown
} from 'lucide-react';


const Sidebar = () => {
  const navItems = [
    { name: 'Navbar', icon: LayoutDashboard, to: '/navbar' },
    { name: 'Vendors', icon: Users, to: '/das' },
    { name: 'Leads', icon: FileText, to: '/dashboard' },
  ];

 const [activeItem, setActiveItem] = useState('Navbar');

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn");
    navigate("/login");
  };

  const handleNavItemClick = (name) => {
    setActiveItem(name.name)
    // In a real app with react-router-dom, you would use:
    navigate(name.to);
  };

  return (
    <div className="w-64 bg-slate-900 text-gray-200 h-screen flex flex-col justify-between shadow-lg fixed font-sans">

      {/* Top Section: Logo & Navigation */}
      <div>
        {/* Header / Profile Section */}
        <div className="p-5 h-20 flex items-center space-x-3 border-b border-slate-700">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold shrink-0">
            A
          </div>
          <div>
            <p className="text-white text-base font-semibold">Admin Panel</p>
            <p className="text-xs text-gray-400">Welcome, Admin</p>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-2 p-4 mt-4">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavItemClick(item)}
              className={`flex items-center space-x-3 p-3 cursor-pointer rounded-lg transition-all duration-200 w-full text-left ${
                activeItem === item.name
                  ? "bg-blue-600 text-white shadow-md font-medium" // Active state
                  : "text-gray-400 hover:bg-slate-800 hover:text-white" // Inactive state
              }`}
            >
              <item.icon className="w-5 h-5 shrink-0" />
              <span className="text-sm">{item.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Bottom Section: Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center cursor-pointer space-x-3 p-3 rounded-lg transition-all duration-200 w-full text-left text-red-400 hover:bg-red-900/50 hover:text-red-300"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};


export default Sidebar;
