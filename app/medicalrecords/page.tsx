"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface MedicalRecord {
  RECORDID: number;
  VISITDATE: string;
  PATIENTIC: string;
  PATIENT_NAME: string;
  DOCTORID: number;
  DOCTOR_NAME: string;
  SYMPTOM: string;
  DIAGNOSIS: string;
  APPOINTMENTID: number;
}

export default function MedicalRecords() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/medicalrecords");
      const data = await response.json();

      if (data.success) {
        setRecords(data.data);
        setError("");
      } else {
        setError(data.message || "Failed to load medical records");
      }
    } catch (error) {
      console.error("Error fetching medical records:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this medical record?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/medicalrecords/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Medical record deleted successfully!");
        fetchRecords();
      } else {
        alert(data.message || "Failed to delete medical record");
      }
    } catch (error) {
      console.error("Error deleting medical record:", error);
      alert("Network error occurred");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Medical Records</h2>
              <p className="text-gray-600">View and manage patient medical records</p>
            </div>
            <Link
              href="/medicalrecords/add"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              + New Record
            </Link>
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
              <p className="mt-4 text-gray-600">Loading medical records...</p>
            </div>
          )}

          {/* Medical Records Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              {records.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No medical records found</p>
                  <Link
                    href="/medicalrecords/add"
                    className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Create First Record
                  </Link>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Record ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Visit Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Symptoms
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Diagnosis
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {records.map((record) => (
                      <tr key={record.RECORDID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          #{record.RECORDID}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(record.VISITDATE)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {record.PATIENT_NAME}
                          </div>
                          <div className="text-sm text-gray-500">{record.PATIENTIC}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Dr. {record.DOCTOR_NAME}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {record.SYMPTOM || "N/A"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                          {record.DIAGNOSIS || "N/A"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            href={`/medicalrecords/edit/${record.RECORDID}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(record.RECORDID)}
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
      </div>
    </div>
  );
}
