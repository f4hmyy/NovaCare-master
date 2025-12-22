"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Patient {
  PATIENT_IC: string;
  FIRST_NAME: string;
  LAST_NAME: string;
}

interface Doctor {
  DOCTOR_ID: number;
  FIRST_NAME: string;
  LAST_NAME: string;
  SPECIALIZATION: string;
}

interface Staff {
  STAFF_ID: number;
  FIRST_NAME: string;
  LAST_NAME: string;
  ROLE_NAME: string;
}

interface Room {
  ROOM_ID: number;
  ROOM_TYPE: string;
  AVAILABILITY_STATUS: string;
}

export default function AddAppointment() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    staffId: "",
    patientIC: "",
    doctorId: "",
    roomId: "",
    appointmentDate: "",
    appointmentTime: "",
    reasonToVisit: "",
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    const fetchAllData = async () => {
      setDataLoading(true);
      await Promise.all([
        fetchPatients(),
        fetchDoctors(),
        fetchStaff(),
        fetchRooms()
      ]);
      setDataLoading(false);
    };
    fetchAllData();
  }, []);

  const fetchPatients = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/patients");
      const data = await response.json();
      console.log("Patients data:", data);
      if (data.success && Array.isArray(data.data)) {
        console.log("First patient sample:", data.data[0]);
        console.log("Patient keys:", data.data[0] ? Object.keys(data.data[0]) : "No patients");
        setPatients(data.data);
      } else {
        console.error("Invalid patients data structure:", data);
      }
    } catch (error) {
      console.error("Error fetching patients:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/doctors");
      const data = await response.json();
      console.log("Doctors data:", data);
      if (data.success) {
        setDoctors(data.data);
      }
    } catch (error) {
      console.error("Error fetching doctors:", error);
    }
  };

  const fetchStaff = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/staff");
      const data = await response.json();
      console.log("Staff data:", data);
      if (data.success) {
        setStaff(data.data);
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/rooms");
      const data = await response.json();
      console.log("Rooms data:", data);
      if (data.success) {
        const availableRooms = data.data.filter((room: Room) => room.AVAILABILITY_STATUS === 'Available');
        console.log("Available rooms:", availableRooms);
        setRooms(availableRooms);
      }
    } catch (error) {
      console.error("Error fetching rooms:", error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      const response = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: "success", text: "Appointment booked successfully!" });
        setTimeout(() => router.push("/appointments"), 2000);
      } else {
        setMessage({ type: "error", text: data.message || "Failed to book appointment" });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Network error. Please check if the server is running." });
    } finally {
      setLoading(false);
    }
  };

  // Generate time slots from 8 AM to 6 PM in 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

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
              <Link href="/appointments" className="px-4 py-2 text-gray-600 hover:text-gray-900">
                View Appointments
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Book Appointment</h2>
            <p className="text-gray-600">Schedule a new appointment for a patient</p>
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

          {/* Data Loading State */}
          {dataLoading && (
            <div className="mb-6 p-4 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg">
              Loading form data... (Patients: {patients.length}, Doctors: {doctors.length}, Staff: {staff.length}, Rooms: {rooms.length})
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Patient Selection */}
              <div>
                <label htmlFor="patientIC" className="block text-sm font-medium text-gray-700 mb-2">
                  Patient <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">({patients.length} available)</span>
                </label>
                <select
                  id="patientIC"
                  name="patientIC"
                  value={formData.patientIC}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Patient ({patients.length} available)</option>
                  {patients.length === 0 ? (
                    <option disabled>No patients found - Please add a patient first</option>
                  ) : (
                    patients.map((patient, index) => (
                      <option key={`patient-${patient.PATIENT_IC || index}`} value={patient.PATIENT_IC || ''}>
                        {patient.PATIENT_IC || 'N/A'} - {patient.FIRST_NAME || 'Unknown'} {patient.LAST_NAME || 'Unknown'}
                      </option>
                    ))
                  )}
                </select>
                <Link
                  href="/patients/add"
                  className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 inline-block"
                >
                  + Add New Patient
                </Link>
              </div>

              {/* Doctor Selection */}
              <div>
                <label htmlFor="doctorId" className="block text-sm font-medium text-gray-700 mb-2">
                  Doctor <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 ml-2">({doctors.length} available)</span>
                </label>
                <select
                  id="doctorId"
                  name="doctorId"
                  value={formData.doctorId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Doctor ({doctors.length} available)</option>
                  {doctors.length === 0 ? (
                    <option disabled>No doctors found</option>
                  ) : (
                    doctors.map((doctor, index) => (
                      <option key={`doctor-${doctor.DOCTOR_ID || index}`} value={doctor.DOCTOR_ID || ''}>
                        Dr. {doctor.FIRST_NAME || 'Unknown'} {doctor.LAST_NAME || 'Unknown'} - {doctor.SPECIALIZATION || 'N/A'}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Staff Selection */}
              <div>
                <label htmlFor="staffId" className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Staff
                  <span className="text-xs text-gray-500 ml-2">({staff.length} available)</span>
                </label>
                <select
                  id="staffId"
                  name="staffId"
                  value={formData.staffId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Staff - {staff.length} available (Optional)</option>
                  {staff.length === 0 ? (
                    <option disabled>No staff members found</option>
                  ) : (
                    staff.map((s, index) => (
                      <option key={`staff-${s.STAFF_ID || index}`} value={s.STAFF_ID || ''}>
                        {s.FIRST_NAME || 'Unknown'} {s.LAST_NAME || 'Unknown'} - {s.ROLE_NAME || 'N/A'}
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Room Selection */}
              <div>
                <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-2">
                  Room
                  <span className="text-xs text-gray-500 ml-2">({rooms.length} available)</span>
                </label>
                <select
                  id="roomId"
                  name="roomId"
                  value={formData.roomId}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Room - {rooms.length} available (Optional)</option>
                  {rooms.length === 0 ? (
                    <option disabled>No available rooms</option>
                  ) : (
                    rooms.map((room, index) => (
                      <option key={`room-${room.ROOM_ID || index}`} value={room.ROOM_ID || ''}>
                        Room {room.ROOM_ID || 'N/A'} - {room.ROOM_TYPE || 'Unknown'} ({room.AVAILABILITY_STATUS || 'Unknown'})
                      </option>
                    ))
                  )}
                </select>
              </div>

              {/* Appointment Date */}
              <div>
                <label htmlFor="appointmentDate" className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  id="appointmentDate"
                  name="appointmentDate"
                  value={formData.appointmentDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split("T")[0]}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              {/* Appointment Time */}
              <div>
                <label htmlFor="appointmentTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Appointment Time <span className="text-red-500">*</span>
                </label>
                <select
                  id="appointmentTime"
                  name="appointmentTime"
                  value={formData.appointmentTime}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select Time</option>
                  {timeSlots.map((time, index) => (
                    <option key={`time-${index}`} value={time}>
                      {time}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Reason to Visit */}
            <div>
              <label htmlFor="reasonToVisit" className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit
              </label>
              <textarea
                id="reasonToVisit"
                name="reasonToVisit"
                value={formData.reasonToVisit}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Regular checkup, Follow-up visit, Symptoms..."
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <Link
                href="/appointments"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? "Booking..." : "Book Appointment"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
