"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Role {
  ROLE_ID: number;
  ROLE_NAME: string;
  ROLE_DESCRIPTION: string;
}

export default function Roles() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/roles");
      const data = await response.json();

      console.log("Fetched roles:", data);

      if (data.success) {
        setRoles(data.data);
        setError("");
      } else {
        setError(data.message || "Failed to load roles");
      }
    } catch (error) {
      console.error("Error fetching roles:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/roles/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Role deleted successfully!");
        fetchRoles();
      } else {
        alert(data.message || "Failed to delete role");
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      alert("Network error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">NovaCare</h1>
                <p className="text-xs text-gray-500">Clinic Management System</p>
              </div>
            </Link>
            <div className="flex space-x-4">
              <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link
                href="/roles/add"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add New Role
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Staff Roles</h2>
            <p className="text-gray-600">Manage staff roles and descriptions</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading roles...</p>
            </div>
          )}

          {/* Roles Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              {roles.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No roles found</p>
                  <Link
                    href="/roles/add"
                    className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add Your First Role
                  </Link>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {roles.map((role) => (
                      <tr key={role.ROLE_ID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {role.ROLE_ID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{role.ROLE_NAME}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{role.ROLE_DESCRIPTION || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/roles/edit/${role.ROLE_ID}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(role.ROLE_ID)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
