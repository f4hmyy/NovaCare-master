"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

interface Appointment {
  APPOINTMENTID: number;
  PATIENT_IC: string;
  PATIENT_NAME: string;
  DOCTOR_NAME: string;
  APPOINTMENTDATE: string;
  APPOINTMENTTIME: string;
  STATUS: string;
}

export default function EditMedicalRecord() {
  const router = useRouter();
  const params = useParams();
  const recordId = params.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [formData, setFormData] = useState({
    appointmentid: "",
    visitdate: "",
    symptom: "",
    diagnosis: "",
  });

  useEffect(() => {
    fetchAppointments();
    fetchRecord();
  }, []);

  const fetchRecord = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/medicalrecords/${recordId}`);
      const data = await response.json();

      if (data.success) {
        const record = data.data;
        setFormData({
          appointmentid: record.APPOINTMENTID.toString(),
          visitdate: new Date(record.VISITDATE).toISOString().split("T")[0],
          symptom: record.SYMPTOM || "",
          diagnosis: record.DIAGNOSIS || "",
        });
      } else {
        setError(data.message || "Failed to load medical record");
      }
    } catch (err) {
      console.error("Error fetching medical record:", err);
      setError("Network error. Please check if the server is running.");
    } finally {
      setFetching(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/appointments");
      const data = await response.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`http://localhost:5000/api/medicalrecords/${recordId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Medical record updated successfully!");
        router.push("/medicalrecords");
      } else {
        setError(data.message || "Failed to update medical record");
      }
    } catch (err) {
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading medical record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Medical Record #{recordId}
            </h2>
            <p className="text-gray-600">Update patient medical record</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Appointment Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Appointment <span className="text-red-500">*</span>
                </label>
                <select
                  name="appointmentid"
                  required
                  value={formData.appointmentid}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Appointment</option>
                  {appointments.map((apt) => (
                    <option key={apt.APPOINTMENTID} value={apt.APPOINTMENTID}>
                      #{apt.APPOINTMENTID} - {apt.PATIENT_NAME} with Dr. {apt.DOCTOR_NAME} ({new Date(apt.APPOINTMENTDATE).toLocaleDateString()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Visit Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visit Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="visitdate"
                required
                value={formData.visitdate}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Symptoms */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symptoms
              </label>
              <textarea
                name="symptom"
                value={formData.symptom}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Describe patient symptoms..."
              />
            </div>

            {/* Diagnosis */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Diagnosis
              </label>
              <textarea
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter diagnosis..."
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Link
                href="/medicalrecords"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? "Updating..." : "Update Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
