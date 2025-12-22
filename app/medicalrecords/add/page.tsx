"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Appointment {
  APPOINTMENTID: number;
  PATIENT_IC: string;
  PATIENT_NAME: string;
  DOCTOR_NAME: string;
  APPOINTMENTDATE: string;
  APPOINTMENTTIME: string;
  STATUS: string;
}

export default function AddMedicalRecord() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/appointments");
      const data = await response.json();
      if (data.success) {
        // Only show completed appointments that don't have a medical record yet
        const completedAppointments = data.data.filter((apt: Appointment) => apt.STATUS === 'Completed');
        setAppointments(completedAppointments);
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
      const response = await fetch("http://localhost:5000/api/medicalrecords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Medical record created successfully!");
        router.push("/medicalrecords");
      } else {
        setError(data.message || "Failed to create medical record");
      }
    } catch (err) {
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">New Medical Record</h2>
            <p className="text-gray-600">Create a new patient medical record</p>
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
                {loading ? "Creating..." : "Create Record"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
