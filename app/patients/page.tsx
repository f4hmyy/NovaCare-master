"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Patient {
  PATIENT_IC: string;
  FIRST_NAME: string;
  LAST_NAME: string;
  DATE_OF_BIRTH: string;
  GENDER: string;
  PHONE: string;
  EMAIL: string;
  ADDRESS: string;
  EMERGENCY_CONTACT: string;
  BLOOD_TYPE: string;
  ALLERGIES: string;
}

export default function Patients() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/patients");
      const data = await response.json();
      
      console.log("Fetched patients:", data);
      
      if (data.success) {
        setPatients(data.data);
        setError("");
      } else {
        setError(data.message || "Failed to load patients");
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (ic: string) => {
    if (!confirm("Are you sure you want to delete this patient?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/patients/${ic}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Patient deleted successfully!");
        fetchPatients();
      } else {
        alert(data.message || "Failed to delete patient");
      }
    } catch (error) {
      console.error("Error deleting patient:", error);
      alert("Network error occurred");
    }
  };

  const calculateAge = (dob: string) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 page-transition">
      {/* Header */}
      <header className="bg-white shadow-sm animate-fade-in">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2 hover-scale smooth-transition">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">NovaCare</h1>
                <p className="text-xs text-gray-500">Clinic Management System</p>
              </div>
            </Link>
            <div className="flex space-x-4">
              <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900 smooth-transition hover-scale">
                Home
              </Link>
              <Link
                href="/patients/add"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:shadow-lg hover-lift smooth-transition btn-press"
              >
                Add New Patient
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8 animate-fade-in-up">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Patients</h2>
            <p className="text-gray-600">Manage patient records and information</p>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name, IC, phone, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent smooth-transition"
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
            <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg animate-fade-in-up">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="text-center py-12 animate-fade-in">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              <p className="mt-4 text-gray-600">Loading patients...</p>
            </div>
          )}

          {/* Patients Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              {(() => {
                const filteredPatients = patients.filter((patient) =>
                  `${patient.FIRST_NAME} ${patient.LAST_NAME} ${patient.PATIENT_IC} ${patient.PHONE} ${patient.EMAIL}`
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                );
                return filteredPatients.length === 0 ? (
                <div className="text-center py-12 animate-fade-in-up">
                  <p className="text-gray-500 text-lg">No patients found</p>
                  <Link
                    href="/patients/add"
                    className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 hover:shadow-lg hover-lift smooth-transition btn-press"
                  >
                    Add Your First Patient
                  </Link>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IC Number
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Age / Gender
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Blood Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredPatients.map((patient, index) => (
                      <tr key={patient.PATIENT_IC} className="hover:bg-indigo-50 smooth-transition stagger-item" style={{ animationDelay: `${index * 0.03}s` }}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.PATIENT_IC}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {patient.FIRST_NAME} {patient.LAST_NAME}
                          </div>
                          <div className="text-sm text-gray-500">{patient.EMAIL || "No email"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {calculateAge(patient.DATE_OF_BIRTH)} years / {patient.GENDER}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{patient.PHONE}</div>
                          <div className="text-sm text-gray-500">{patient.EMERGENCY_CONTACT || "No emergency contact"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {patient.BLOOD_TYPE || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Link
                            href={`/patients/edit/${patient.PATIENT_IC}`}
                            className="text-indigo-600 hover:text-indigo-900 mr-4 hover-scale smooth-transition"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(patient.PATIENT_IC)}
                            className="text-red-600 hover:text-red-900 hover-scale smooth-transition btn-press"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              );})()}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
