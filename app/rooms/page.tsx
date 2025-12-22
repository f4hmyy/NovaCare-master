"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Room {
  ROOM_ID: number;
  ROOM_TYPE: string;
  AVAILABILITY_STATUS: string;
}

export default function Rooms() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/rooms");
      const data = await response.json();

      console.log("Fetched rooms:", data);

      if (data.success) {
        setRooms(data.data);
        setError("");
      } else {
        setError(data.message || "Failed to load rooms");
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this room?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Room deleted successfully!");
        fetchRooms();
      } else {
        alert(data.message || "Failed to delete room");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
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
                href="/rooms/add"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add New Room
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Rooms</h2>
            <p className="text-gray-600">Manage clinic rooms and their availability</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by room type or availability status..."
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
              <p className="mt-4 text-gray-600">Loading rooms...</p>
            </div>
          )}

          {/* Rooms Grid */}
          {!loading && !error && (
            <div>
              {(() => {
                const filteredRooms = rooms.filter((room) =>
                  `${room.ROOM_TYPE} ${room.AVAILABILITY_STATUS}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                );
                return filteredRooms.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No rooms found</p>
                  <Link
                    href="/rooms/add"
                    className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Add Your First Room
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRooms.map((room) => (
                    <div
                      key={room.ROOM_ID}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">Room {room.ROOM_ID}</h3>
                          <p className="text-sm text-gray-600 mt-1">{room.ROOM_TYPE}</p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            room.AVAILABILITY_STATUS === "Available"
                              ? "bg-green-100 text-green-800"
                              : room.AVAILABILITY_STATUS === "Occupied"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {room.AVAILABILITY_STATUS}
                        </span>
                      </div>

                      <div className="flex justify-end space-x-3 mt-4">
                        <Link
                          href={`/rooms/edit/${room.ROOM_ID}`}
                          className="px-4 py-2 text-sm text-indigo-600 hover:text-indigo-900 font-medium"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(room.ROOM_ID)}
                          className="px-4 py-2 text-sm text-red-600 hover:text-red-900 font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );})()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
