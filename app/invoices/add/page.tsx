"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Appointment {
  APPOINTMENT_ID: number;
  PATIENT_IC: string;
  PATIENT_NAME: string;
  DOCTOR_NAME: string;
  APPOINTMENT_DATE: string;
  APPOINTMENT_TIME: string;
  STATUS: string;
}

export default function AddInvoice() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);

  const [formData, setFormData] = useState({
    appointmentid: "",
    totalamount: "",
    paymentmethod: "",
    datepaid: "",
  });

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/appointments");
      const data = await response.json();
      if (data.success) {
        // Filter to only show completed appointments without existing invoices
        // For now, show all appointments - can add filter later
        setAppointments(data.data);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });

    // Update selected appointment when appointment changes
    if (name === "appointmentid") {
      const apt = appointments.find((a) => a.APPOINTMENT_ID === parseInt(value));
      setSelectedAppointment(apt || null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://localhost:5000/api/invoice", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Invoice generated successfully!");
        router.push("/invoices");
      } else {
        setError(data.message || "Failed to create invoice");
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Generate Invoice</h2>
            <p className="text-gray-600">Create a new invoice for an appointment</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                  <option key={apt.APPOINTMENT_ID} value={apt.APPOINTMENT_ID}>
                    #{apt.APPOINTMENT_ID} - {apt.PATIENT_NAME} with Dr. {apt.DOCTOR_NAME} ({new Date(apt.APPOINTMENT_DATE).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Selected Appointment Details */}
            {selectedAppointment && (
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Appointment Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Patient:</span>
                    <span className="ml-2 text-gray-900">{selectedAppointment.PATIENT_NAME}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">IC:</span>
                    <span className="ml-2 text-gray-900">{selectedAppointment.PATIENT_IC}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Doctor:</span>
                    <span className="ml-2 text-gray-900">Dr. {selectedAppointment.DOCTOR_NAME}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Date:</span>
                    <span className="ml-2 text-gray-900">
                      {new Date(selectedAppointment.APPOINTMENT_DATE).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Amount (MYR) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="totalamount"
                required
                min="0"
                step="0.01"
                value={formData.totalamount}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="0.00"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <select
                name="paymentmethod"
                value={formData.paymentmethod}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Payment Method (if paid)</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Insurance">Insurance</option>
                <option value="Online Transfer">Online Transfer</option>
              </select>
            </div>

            {/* Date Paid (optional - only if paying now) */}
            {formData.paymentmethod && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Paid
                </label>
                <input
                  type="date"
                  name="datepaid"
                  value={formData.datepaid}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Leave empty to mark as pending payment
                </p>
              </div>
            )}

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Link
                href="/invoices"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? "Generating..." : "Generate Invoice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
