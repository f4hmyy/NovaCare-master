"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Specialization {
  ID: number;
  NAME: string;
}

export default function Specializations() {
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [loading, setLoading] = useState(true);
  const [newSpecName, setNewSpecName] = useState("");
  const [adding, setAdding] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchSpecializations();
  }, []);

  const fetchSpecializations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/specializations");
      const data = await response.json();
      if (data.success) {
        setSpecializations(data.data);
      }
    } catch (error) {
      console.error("Error fetching specializations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpecName.trim()) return;

    setAdding(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:5000/api/specializations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: newSpecName }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Specialization added successfully!" });
        setNewSpecName("");
        fetchSpecializations();
      } else {
        setMessage({ type: "error", text: data.message || "Failed to add specialization" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please check if the server is running." });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this specialization?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/specializations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setMessage({ type: "success", text: "Specialization deleted successfully!" });
        fetchSpecializations();
      } else {
        const data = await response.json();
        setMessage({ type: "error", text: data.message || "Failed to delete specialization" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error." });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                NovaCare
              </Link>
              <div className="hidden md:flex space-x-6">
                <Link href="/" className="text-gray-600 hover:text-gray-900">
                  Home
                </Link>
                <Link href="/doctors" className="text-gray-600 hover:text-gray-900">
                  View Doctors
                </Link>
                <Link href="/doctors/add" className="text-gray-600 hover:text-gray-900">
                  Add Doctor
                </Link>
                <Link href="/specializations" className="text-indigo-600 font-semibold">
                  Specializations
                </Link>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Manage Specializations</h2>
            <p className="text-gray-600">Add or remove medical specializations</p>
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

          {/* Add Form */}
          <form onSubmit={handleAdd} className="mb-8">
            <div className="flex gap-4">
              <input
                type="text"
                value={newSpecName}
                onChange={(e) => setNewSpecName(e.target.value)}
                placeholder="Enter specialization name (e.g., Cardiology)"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <button
                type="submit"
                disabled={adding}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {adding ? "Adding..." : "Add"}
              </button>
            </div>
          </form>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search specializations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>

          {/* List */}
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          ) : (() => {
            const filteredSpecializations = specializations.filter((spec) =>
              spec.NAME.toLowerCase().includes(searchQuery.toLowerCase())
            );
            return filteredSpecializations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No specializations found. Add one above.
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSpecializations.map((spec) => (
                <div
                  key={spec.ID}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100"
                >
                  <div>
                    <span className="font-medium text-gray-900">{spec.NAME}</span>
                    <span className="ml-3 text-sm text-gray-500">ID: {spec.ID}</span>
                  </div>
                  <button
                    onClick={() => handleDelete(spec.ID)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          );})()}
        </div>
      </main>
    </div>
  );
}
