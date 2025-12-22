"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function EditRoom() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id;

  const [formData, setFormData] = useState({
    roomType: "",
    availabilityStatus: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    fetchRoom();
  }, []);

  const fetchRoom = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
      const data = await response.json();

      if (data.success) {
        const room = data.data;
        setFormData({
          roomType: room.ROOM_TYPE || "",
          availabilityStatus: room.AVAILABILITY_STATUS || "",
        });
      } else {
        setMessage({ type: "error", text: "Failed to load room data" });
      }
    } catch (error) {
      console.error("Error fetching room:", error);
      setMessage({ type: "error", text: "Network error. Please check if the server is running." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
      const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Room updated successfully!" });
        setTimeout(() => {
          router.push("/rooms");
        }, 1500);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to update room" });
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
          <p className="mt-4 text-gray-600">Loading room data...</p>
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
              <Link href="/rooms" className="px-4 py-2 text-gray-600 hover:text-gray-900">
                View Rooms
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Edit Room</h2>
            <p className="text-gray-600">Update room information</p>
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
            {/* Room Type */}
            <div>
              <label htmlFor="roomType" className="block text-sm font-medium text-gray-700 mb-2">
                Room Type <span className="text-red-500">*</span>
              </label>
              <select
                id="roomType"
                name="roomType"
                value={formData.roomType}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Room Type</option>
                <option value="Consultation">Consultation</option>
                <option value="Emergency">Emergency</option>
                <option value="Surgery">Surgery</option>
                <option value="ICU">ICU</option>
                <option value="General Ward">General Ward</option>
                <option value="Laboratory">Laboratory</option>
                <option value="X-Ray">X-Ray</option>
                <option value="Pharmacy">Pharmacy</option>
              </select>
            </div>

            {/* Availability Status */}
            <div>
              <label htmlFor="availabilityStatus" className="block text-sm font-medium text-gray-700 mb-2">
                Availability Status <span className="text-red-500">*</span>
              </label>
              <select
                id="availabilityStatus"
                name="availabilityStatus"
                value={formData.availabilityStatus}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Status</option>
                <option value="Available">Available</option>
                <option value="Occupied">Occupied</option>
                <option value="Maintenance">Maintenance</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/rooms"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {saving ? "Saving..." : "Update Room"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
