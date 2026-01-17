"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Doctor {
  DOCTOR_ID: number;
  FIRST_NAME: string;
  LAST_NAME: string;
  SPECIALIZATION: number;
  EMAIL: string;
  PHONE: string;
  LICENSE_NUMBER: string;
  STATUS: string;
}

export default function ViewDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterNoAppointments, setFilterNoAppointments] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    setError("");
    try {
      const url = filterNoAppointments 
        ? "http://localhost:5000/api/doctors/without-appointments"
        : "http://localhost:5000/api/doctors";
      
      const response = await fetch(url);
      const data = await response.json();

      if (data.success) {
        setDoctors(data.data);
      } else {
        setError("Failed to fetch doctors");
      }
    } catch (err) {
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [filterNoAppointments]);

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this doctor?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (data.success) {
        setDoctors(doctors.filter((doctor) => doctor.DOCTOR_ID !== id));
        alert("Doctor deleted successfully");
      } else {
        alert("Failed to delete doctor");
      }
    } catch (err) {
      alert("Network error");
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
                href="/doctors/add"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add Doctor
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Doctors Directory</h2>
            <p className="text-gray-600">Manage all doctors in the system</p>
          </div>

          {/* Search Bar and Filter */}
          <div className="mb-6 space-y-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, email, phone, or license number..."
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
            
            {/* Filter Button */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setFilterNoAppointments(!filterNoAppointments)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterNoAppointments
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {filterNoAppointments ? '✓ ' : ''}Doctors Without Appointments
              </button>
              {filterNoAppointments && (
                <span className="text-sm text-gray-600">
                  Showing {doctors.length} doctor{doctors.length !== 1 ? 's' : ''} with no appointments
                </span>
              )}
            </div>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading doctors...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-900">No doctors found</h3>
              <p className="mt-2 text-gray-600">Get started by adding a new doctor.</p>
              <Link
                href="/doctors/add"
                className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                Add First Doctor
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      License
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {doctors.filter((doctor) =>
                    `${doctor.FIRST_NAME} ${doctor.LAST_NAME} ${doctor.EMAIL} ${doctor.PHONE} ${doctor.LICENSE_NUMBER}`
                      .toLowerCase()
                      .includes(searchQuery.toLowerCase())
                  ).map((doctor) => (
                    <tr key={doctor.DOCTOR_ID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          Dr. {doctor.FIRST_NAME} {doctor.LAST_NAME}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div>{doctor.EMAIL}</div>
                        <div className="text-gray-400">{doctor.PHONE}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${doctor.STATUS === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                          {doctor.STATUS}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {doctor.LICENSE_NUMBER}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleDelete(doctor.DOCTOR_ID)}
                          className="text-red-600 hover:text-red-900 ml-4"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
