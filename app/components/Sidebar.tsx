"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    {
      category: "Patient Care",
      items: [
        { name: "Dashboard", path: "/", icon: "🏠" },
        { name: "Patients", path: "/patients", icon: "👥" },
        { name: "Appointments", path: "/appointments", icon: "📅" },
        { name: "Medical Records", path: "/medicalrecords", icon: "📋" },
        { name: "Prescriptions", path: "/prescriptions", icon: "💊" },
      ],
    },
    {
      category: "Medical Staff",
      items: [
        { name: "Doctors", path: "/doctors", icon: "👨‍⚕️" },
        { name: "Staff", path: "/staff", icon: "👔" },
        { name: "Roles", path: "/roles", icon: "🔑" },
      ],
    },
    {
      category: "Resources",
      items: [
        { name: "Medicines", path: "/medicines", icon: "💉" },
        { name: "Rooms", path: "/rooms", icon: "🏥" },
        { name: "Specializations", path: "/specializations", icon: "🩺" },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-indigo-600 text-white rounded-lg shadow-lg"
      >
        {isOpen ? "✕" : "☰"}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-screen bg-white border-r border-gray-200 shadow-lg transition-all duration-300 z-40 ${
          isOpen ? "w-64" : "w-0 lg:w-20"
        } overflow-y-auto`}
      >
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xl">N</span>
            </div>
            {(isOpen || window.innerWidth >= 1024) && (
              <div className={`${isOpen ? "block" : "hidden lg:hidden"}`}>
                <h1 className="text-xl font-bold text-gray-900">NovaCare</h1>
                <p className="text-xs text-gray-500">Clinic System</p>
              </div>
            )}
          </Link>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          {menuItems.map((section, idx) => (
            <div key={idx} className="mb-6">
              {(isOpen || window.innerWidth >= 1024) && (
                <h3
                  className={`text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3 ${
                    isOpen ? "block" : "hidden lg:hidden"
                  }`}
                >
                  {section.category}
                </h3>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.path;
                  return (
                    <li key={item.path}>
                      <Link
                        href={item.path}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                          isActive
                            ? "bg-indigo-50 text-indigo-600 font-semibold"
                            : "text-gray-700 hover:bg-gray-100"
                        }`}
                        title={item.name}
                      >
                        <span className="text-xl flex-shrink-0">{item.icon}</span>
                        {(isOpen || window.innerWidth >= 1024) && (
                          <span className={`${isOpen ? "block" : "hidden lg:hidden"}`}>
                            {item.name}
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Footer */}
        {(isOpen || window.innerWidth >= 1024) && (
          <div
            className={`absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50 ${
              isOpen ? "block" : "hidden lg:hidden"
            }`}
          >
            <div className="text-xs text-gray-500 text-center">
              © 2025 NovaCare
              <br />
              Version 1.0.0
            </div>
          </div>
        )}
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
