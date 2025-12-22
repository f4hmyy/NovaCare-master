"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditRole() {
  const params = useParams();
  const router = useRouter();
  const roleId = params.id;

  const [formData, setFormData] = useState({
    roleName: "",
    roleDescription: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchRole();
  }, []);

  const fetchRole = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/roles/${roleId}`);
      const data = await response.json();

      if (data.success) {
        const role = data.data;
        setFormData({
          roleName: role.ROLE_NAME || "",
          roleDescription: role.ROLE_DESCRIPTION || "",
        });
      } else {
        setMessage({ type: "error", text: "Failed to load role data" });
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      setMessage({ type: "error", text: "Network error. Please check if the server is running." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch(`http://localhost:5000/api/roles/${roleId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Role updated successfully!" });
        setTimeout(() => {
          router.push("/roles");
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update role" });
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage({ type: "error", text: "Network error. Please check if the server is running." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading role data...</p>
        </div>
      </div>
    );
  }

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
              <Link href="/roles" className="px-4 py-2 text-gray-600 hover:text-gray-900">
                View Roles
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Role</h2>
            <p className="text-gray-600">Update role information</p>
          </div>

          {/* Success/Error Message */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-100 text-green-800 border border-green-200"
                  : "bg-red-100 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Role Name */}
            <div>
              <label htmlFor="roleName" className="block text-sm font-medium text-gray-700 mb-2">
                Role Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="roleName"
                name="roleName"
                value={formData.roleName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Nurse, Receptionist, Lab Technician"
              />
            </div>

            {/* Role Description */}
            <div>
              <label htmlFor="roleDescription" className="block text-sm font-medium text-gray-700 mb-2">
                Role Description
              </label>
              <textarea
                id="roleDescription"
                name="roleDescription"
                value={formData.roleDescription}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Brief description of the role and responsibilities"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/roles"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {saving ? "Saving..." : "Update Role"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
