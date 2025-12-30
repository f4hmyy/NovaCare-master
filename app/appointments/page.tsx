"use client";

import Link from "next/link";
import { useState, useEffect, useCallback } from "react";

// Toast notification type
interface Toast {
  id: number;
  message: string;
  type: "success" | "error" | "info";
}

interface Appointment {
  APPOINTMENT_ID: number;
  STAFF_ID: number;
  PATIENT_IC: string;
  DOCTOR_ID: number;
  ROOM_ID: number;
  APPOINTMENT_DATE: string;
  APPOINTMENT_TIME: string;
  REASON_TO_VISIT: string;
  STATUS: string;
  PATIENT_NAME: string;
  DOCTOR_NAME: string;
  STAFF_NAME: string;
  ROOM_TYPE: string;
  PATIENT_PHONE: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("cards");
  const [toasts, setToasts] = useState<Toast[]>([]);

  // Sound effect functions
  const playSound = useCallback((type: "success" | "error" | "checkin") => {
    const audioContext = new (window.AudioContext || (window as typeof window & { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === "success") {
      // Pleasant success chime
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.4);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.4);
    } else if (type === "checkin") {
      // Friendly check-in ding
      oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
      oscillator.frequency.setValueAtTime(1108.73, audioContext.currentTime + 0.15); // C#6
      gainNode.gain.setValueAtTime(0.25, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } else {
      // Error sound
      oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(150, audioContext.currentTime + 0.1);
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    }
  }, []);

  // Toast notification function
  const showToast = useCallback((message: string, type: "success" | "error" | "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto-remove toast after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    fetchAppointments();
    // Auto-set to today's appointments for staff convenience
    setFilterDate(getTodayDate());
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/appointments");
      const data = await response.json();
      if (data.success) {
        setAppointments(data.data);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  // Quick stats calculations
  const todayDate = getTodayDate();
  const todayAppointments = appointments.filter(apt => apt.APPOINTMENT_DATE.startsWith(todayDate));
  const scheduledCount = todayAppointments.filter(apt => apt.STATUS === "Scheduled").length;
  const checkedInCount = todayAppointments.filter(apt => apt.STATUS === "Checked-In").length;
  const completedCount = todayAppointments.filter(apt => apt.STATUS === "Completed").length;
  const cancelledCount = todayAppointments.filter(apt => apt.STATUS === "Cancelled" || apt.STATUS === "No-Show").length;

  // Check if appointment is coming up soon (within 30 minutes)
  const isUpcoming = (dateStr: string, timeStr: string) => {
    const now = new Date();
    const aptDate = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    aptDate.setHours(hours, minutes, 0, 0);
    const diff = aptDate.getTime() - now.getTime();
    return diff > 0 && diff <= 30 * 60 * 1000; // Within 30 minutes
  };

  // Check if appointment time has passed
  const isPast = (dateStr: string, timeStr: string) => {
    const now = new Date();
    const aptDate = new Date(dateStr);
    const [hours, minutes] = timeStr.split(':').map(Number);
    aptDate.setHours(hours, minutes, 0, 0);
    return aptDate.getTime() < now.getTime();
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchAppointments();
        
        // Play sound and show toast based on status
        if (newStatus === "Checked-In") {
          playSound("checkin");
          showToast("✅ Patient checked in successfully!", "success");
        } else if (newStatus === "Completed") {
          playSound("success");
          showToast("✅ Appointment completed!", "success");
        } else if (newStatus === "No-Show") {
          playSound("error");
          showToast("⚠️ Marked as No-Show", "info");
        } else if (newStatus === "Cancelled") {
          playSound("error");
          showToast("❌ Appointment cancelled", "info");
        } else {
          playSound("success");
          showToast(`Status updated to ${newStatus}`, "success");
        }
      } else {
        playSound("error");
        showToast("Failed to update appointment status", "error");
      }
    } catch (error) {
      console.error("Error updating appointment:", error);
      playSound("error");
      showToast("Network error - please try again", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this appointment?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchAppointments();
        playSound("success");
        showToast("🗑️ Appointment deleted", "info");
      } else {
        playSound("error");
        showToast("Failed to delete appointment", "error");
      }
    } catch (error) {
      console.error("Error deleting appointment:", error);
      playSound("error");
      showToast("Network error - please try again", "error");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { 
      year: "numeric", 
      month: "short", 
      day: "numeric" 
    });
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5); // HH:MM format
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Scheduled":
        return "bg-blue-100 text-blue-800";
      case "Checked-In":
        return "bg-purple-100 text-purple-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "No-Show":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAppointments = appointments
    .filter((apt) => {
      const matchesDate = !filterDate || apt.APPOINTMENT_DATE.startsWith(filterDate);
      const matchesStatus = filterStatus === "All" || apt.STATUS === filterStatus;
      const matchesSearch = !searchQuery || 
        `${apt.PATIENT_NAME} ${apt.DOCTOR_NAME} ${apt.REASON_TO_VISIT} ${apt.ROOM_TYPE}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      return matchesDate && matchesStatus && matchesSearch;
    })
    // Sort by time - upcoming appointments first
    .sort((a, b) => {
      const timeA = a.APPOINTMENT_TIME;
      const timeB = b.APPOINTMENT_TIME;
      return timeA.localeCompare(timeB);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`px-6 py-4 rounded-xl shadow-lg transform transition-all duration-300 animate-slide-in flex items-center gap-3 min-w-[300px] ${
              toast.type === "success" ? "bg-green-500 text-white" :
              toast.type === "error" ? "bg-red-500 text-white" :
              "bg-indigo-500 text-white"
            }`}
          >
            <span className="text-lg">
              {toast.type === "success" ? "✅" : toast.type === "error" ? "❌" : "ℹ️"}
            </span>
            <span className="font-medium">{toast.message}</span>
            <button
              onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
              className="ml-auto text-white/80 hover:text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

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
              <Link href="/appointments/add" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                + New Appointment
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Quick Stats Cards - Staff Dashboard */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Today&apos;s Total</p>
                <p className="text-3xl font-bold text-gray-900">{todayAppointments.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Waiting</p>
                <p className="text-3xl font-bold text-yellow-600">{scheduledCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Checked In</p>
                <p className="text-3xl font-bold text-purple-600">{checkedInCount}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-xl">🙋</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedCount}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-5 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-medium">Cancelled/No-Show</p>
                <p className="text-3xl font-bold text-red-600">{cancelledCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6">
          <div className="flex flex-wrap justify-between items-center mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Appointments</h2>
              <p className="text-gray-500 text-sm">Manage clinic appointments</p>
            </div>
            
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === "cards" ? "bg-white shadow text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                📋 Cards
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-4 py-2 rounded-md text-sm font-medium transition ${viewMode === "table" ? "bg-white shadow text-indigo-600" : "text-gray-600 hover:text-gray-900"}`}
              >
                📊 Table
              </button>
            </div>
          </div>

          {/* Quick Date Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setFilterDate(getTodayDate())}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${filterDate === getTodayDate() ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              📅 Today
            </button>
            <button
              onClick={() => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                setFilterDate(tomorrow.toISOString().split('T')[0]);
              }}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${filterDate === (() => { const t = new Date(); t.setDate(t.getDate() + 1); return t.toISOString().split('T')[0]; })() ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              Tomorrow
            </button>
            <button
              onClick={() => setFilterDate("")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition ${filterDate === "" ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
            >
              All Dates
            </button>
          </div>

          {/* Filters */}
          <div className="mb-6 flex flex-wrap gap-4">
            {/* Search Bar */}
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <input
                  type="text"
                  id="searchQuery"
                  placeholder="🔍 Search patient, doctor, or reason..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-3 pl-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 text-lg"
                />
              </div>
            </div>
            <div>
              <input
                type="date"
                id="filterDate"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <select
                id="filterStatus"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Status</option>
                <option value="Scheduled">🕐 Scheduled</option>
                <option value="Completed">✅ Completed</option>
                <option value="Cancelled">❌ Cancelled</option>
                <option value="No-Show">⚠️ No-Show</option>
              </select>
            </div>
            {(filterDate || filterStatus !== "All" || searchQuery) && (
              <div className="flex items-center">
                <button
                  onClick={() => {
                    setFilterDate("");
                    setFilterStatus("All");
                    setSearchQuery("");
                  }}
                  className="px-4 py-3 text-sm bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200"
                >
                  ✕ Clear All
                </button>
              </div>
            )}
          </div>

          {/* Results Count */}
          <div className="mb-4 text-sm text-gray-500">
            Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading appointments...</p>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-12">
              <svg
                className="mx-auto h-16 w-16 text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <h3 className="mt-4 text-xl font-medium text-gray-900">No appointments found</h3>
              <p className="mt-2 text-gray-500">Try adjusting your filters or book a new appointment.</p>
              <Link
                href="/appointments/add"
                className="mt-6 inline-block px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-medium"
              >
                + Book New Appointment
              </Link>
            </div>
          ) : viewMode === "cards" ? (
            /* Card View - Better for staff quick actions */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAppointments.map((appointment) => {
                const upcoming = isUpcoming(appointment.APPOINTMENT_DATE, appointment.APPOINTMENT_TIME);
                const past = isPast(appointment.APPOINTMENT_DATE, appointment.APPOINTMENT_TIME);
                
                return (
                  <div 
                    key={appointment.APPOINTMENT_ID} 
                    className={`rounded-xl border-2 p-5 transition-all hover:shadow-lg ${
                      appointment.STATUS === "Checked-In" ? "border-purple-400 bg-purple-50 ring-2 ring-purple-200" :
                      upcoming ? "border-orange-400 bg-orange-50 ring-2 ring-orange-200" :
                      appointment.STATUS === "Completed" ? "border-green-200 bg-green-50" :
                      appointment.STATUS === "Cancelled" || appointment.STATUS === "No-Show" ? "border-red-200 bg-red-50" :
                      past && appointment.STATUS === "Scheduled" ? "border-yellow-300 bg-yellow-50" :
                      "border-gray-200 bg-white"
                    }`}
                  >
                    {/* Checked-In Badge */}
                    {appointment.STATUS === "Checked-In" && (
                      <div className="mb-3 flex items-center gap-2 text-purple-600 font-semibold">
                        <span>🙋</span> Patient is here - Ready for doctor
                      </div>
                    )}
                    
                    {/* Upcoming Badge */}
                    {upcoming && appointment.STATUS === "Scheduled" && (
                      <div className="mb-3 flex items-center gap-2 text-orange-600 font-semibold">
                        <span className="animate-pulse">🔔</span> Coming up soon!
                      </div>
                    )}
                    
                    {/* Past + Still Scheduled Warning */}
                    {past && appointment.STATUS === "Scheduled" && (
                      <div className="mb-3 flex items-center gap-2 text-yellow-700 font-semibold text-sm">
                        ⚠️ Needs status update
                      </div>
                    )}
                    
                    {/* Time Display - Large and Prominent */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-2xl font-bold text-gray-900">
                          {formatTime(appointment.APPOINTMENT_TIME)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {formatDate(appointment.APPOINTMENT_DATE)}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(appointment.STATUS)}`}>
                        {appointment.STATUS}
                      </span>
                    </div>
                    
                    {/* Patient Info */}
                    <div className="mb-4">
                      <div className="text-lg font-semibold text-gray-900">{appointment.PATIENT_NAME}</div>
                      <div className="text-sm text-gray-600">Dr. {appointment.DOCTOR_NAME}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {appointment.ROOM_TYPE || "Room"} #{appointment.ROOM_ID}
                      </div>
                      <div className="text-sm text-indigo-600 mt-1">
                        {appointment.REASON_TO_VISIT || "General Checkup"}
                      </div>
                    </div>
                    
                    {/* Quick Call Button */}
                    {appointment.PATIENT_PHONE && (
                      <a 
                        href={`tel:${appointment.PATIENT_PHONE}`}
                        className="flex items-center gap-2 text-sm text-green-600 hover:text-green-700 mb-4 font-medium"
                      >
                        📞 {appointment.PATIENT_PHONE}
                      </a>
                    )}
                    
                    {/* Large Status Action Buttons */}
                    <div className="grid grid-cols-3 gap-2 mt-4">
                      {/* Check-In Button - Most Important for Staff */}
                      <button
                        onClick={() => handleStatusChange(appointment.APPOINTMENT_ID, "Checked-In")}
                        disabled={appointment.STATUS !== "Scheduled"}
                        className={`py-3 rounded-lg text-sm font-bold transition ${
                          appointment.STATUS !== "Scheduled"
                            ? "bg-purple-100 text-purple-400 cursor-not-allowed" 
                            : "bg-purple-600 text-white hover:bg-purple-700 shadow-md animate-pulse"
                        }`}
                      >
                        🙋 Check In
                      </button>
                      <button
                        onClick={() => handleStatusChange(appointment.APPOINTMENT_ID, "Completed")}
                        disabled={appointment.STATUS === "Completed" || appointment.STATUS === "Scheduled"}
                        className={`py-3 rounded-lg text-sm font-bold transition ${
                          appointment.STATUS === "Completed" 
                            ? "bg-green-100 text-green-400 cursor-not-allowed" 
                            : appointment.STATUS !== "Checked-In"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-green-500 text-white hover:bg-green-600 shadow-md"
                        }`}
                      >
                        ✓ Complete
                      </button>
                      <button
                        onClick={() => handleStatusChange(appointment.APPOINTMENT_ID, "No-Show")}
                        disabled={appointment.STATUS === "No-Show" || appointment.STATUS === "Completed" || appointment.STATUS === "Checked-In"}
                        className={`py-3 rounded-lg text-sm font-bold transition ${
                          appointment.STATUS === "No-Show" || appointment.STATUS === "Completed" || appointment.STATUS === "Checked-In"
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
                            : "bg-gray-500 text-white hover:bg-gray-600 shadow-md"
                        }`}
                      >
                        No Show
                      </button>
                    </div>
                    
                    {/* Secondary Actions */}
                    <div className="flex justify-between mt-3 pt-3 border-t border-gray-200">
                      <button
                        onClick={() => handleStatusChange(appointment.APPOINTMENT_ID, "Cancelled")}
                        disabled={appointment.STATUS === "Cancelled" || appointment.STATUS === "Completed"}
                        className="text-sm text-red-500 hover:text-red-700 disabled:text-gray-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(appointment.APPOINTMENT_ID)}
                        className="text-sm text-gray-400 hover:text-red-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table View - Original view */
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Reason
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.APPOINTMENT_ID} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatDate(appointment.APPOINTMENT_DATE)}
                        </div>
                        <div className="text-sm text-gray-500">{formatTime(appointment.APPOINTMENT_TIME)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{appointment.PATIENT_NAME}</div>
                        <div className="text-sm text-gray-500">{appointment.PATIENT_PHONE}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        Dr. {appointment.DOCTOR_NAME}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {appointment.ROOM_TYPE || "N/A"} {appointment.ROOM_ID && `#${appointment.ROOM_ID}`}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {appointment.STAFF_NAME || "Not assigned"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {appointment.REASON_TO_VISIT || "General Checkup"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={appointment.STATUS}
                          onChange={(e) => handleStatusChange(appointment.APPOINTMENT_ID, e.target.value)}
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.STATUS)}`}
                        >
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                          <option value="No-Show">No-Show</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleStatusChange(appointment.APPOINTMENT_ID, "Completed")}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-xs font-medium"
                        >
                          ✓ Done
                        </button>
                        <button
                          onClick={() => handleDelete(appointment.APPOINTMENT_ID)}
                          className="text-red-600 hover:text-red-900"
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
