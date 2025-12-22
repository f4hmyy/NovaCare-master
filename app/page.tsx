import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">NovaCare</h1>
                <p className="text-xs text-gray-500">Clinic Management System</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <Link 
                href="/appointments" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Appointments
              </Link>
              <Link 
                href="/patients" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Patients
              </Link>
              <Link 
                href="/doctors" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Doctors
              </Link>
              <Link 
                href="/specializations" 
                className="px-4 py-2 text-gray-600 hover:text-gray-900 font-medium transition"
              >
                Specializations
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <div className="inline-block mb-4 px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
            For Clinic Staff & Administrators
          </div>
          <h2 className="text-5xl font-extrabold text-gray-900 sm:text-6xl mb-6">
            Welcome to <span className="text-indigo-600">NovaCare</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Comprehensive internal management system for clinic staff to manage patient appointments, 
            medical records, billing, inventory, and daily operations efficiently.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link 
              href="/appointments/add" 
              className="px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-semibold text-lg shadow-lg transition"
            >
              Book Appointment
            </Link>
            <Link 
              href="/appointments" 
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 font-semibold text-lg shadow-lg border-2 border-indigo-600 transition"
            >
              View Appointments
            </Link>
            <Link 
              href="/patients" 
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 font-semibold text-lg shadow-lg border-2 border-indigo-600 transition"
            >
              Patients
            </Link>
            <Link 
              href="/doctors" 
              className="px-8 py-4 bg-white text-gray-600 rounded-lg hover:bg-gray-50 font-semibold text-lg shadow-lg border-2 border-gray-300 transition"
            >
              Doctors
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Staff Tools & Features
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Patient Records Management</h4>
              <p className="text-gray-600 text-sm">
                Create, update, and access complete patient records including medical history, prescriptions, and visit notes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Appointment Management</h4>
              <p className="text-gray-600 text-sm">
                Schedule, reschedule, and cancel appointments. Manage doctor availability and view daily schedules.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Billing & Payment Processing</h4>
              <p className="text-gray-600 text-sm">
                Process patient payments, generate invoices, track insurance claims, and manage accounts receivable.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Inventory Tracking</h4>
              <p className="text-gray-600 text-sm">
                Monitor medical supplies and medications. Receive low-stock alerts and manage reorder workflows.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Staff Scheduling</h4>
              <p className="text-gray-600 text-sm">
                Create and manage staff work schedules, shift assignments, and track attendance records.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Reports & Analytics</h4>
              <p className="text-gray-600 text-sm">
                Generate daily reports on appointments, revenue, patient visits, and clinic operational metrics.
              </p>
            </div>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="mt-24 bg-white rounded-2xl shadow-xl p-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            Quick Access for Staff
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/login" className="p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Appointment Scheduler</h4>
              <p className="text-sm text-gray-600">Book and manage patient appointments</p>
            </Link>

            <Link href="/login" className="p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Patient Records</h4>
              <p className="text-sm text-gray-600">Access and update patient files</p>
            </Link>

            <Link href="/login" className="p-6 border-2 border-indigo-200 rounded-xl hover:border-indigo-400 hover:shadow-md transition text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Billing Portal</h4>
              <p className="text-sm text-gray-600">Process payments and invoices</p>
            </Link>
          </div>
        </div>

        {/* System Info Section */}
        <div className="mt-24 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-xl p-12 text-white">
          <div className="text-center mb-8">
            <h3 className="text-3xl font-bold mb-4">Need Help?</h3>
            <p className="text-lg text-indigo-100">
              Support resources for clinic staff
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <Link href="/help" className="block hover:scale-105 transition">
                <div className="text-4xl mb-2">📚</div>
                <div className="font-bold mb-2">User Documentation</div>
                <p className="text-sm text-indigo-100">Step-by-step guides and tutorials</p>
              </Link>
            </div>
            <div>
              <Link href="/support" className="block hover:scale-105 transition">
                <div className="text-4xl mb-2">💬</div>
                <div className="font-bold mb-2">IT Support</div>
                <p className="text-sm text-indigo-100">Contact technical support team</p>
              </Link>
            </div>
            <div>
              <Link href="/training" className="block hover:scale-105 transition">
                <div className="text-4xl mb-2">🎓</div>
                <div className="font-bold mb-2">Training Videos</div>
                <p className="text-sm text-indigo-100">Watch training materials</p>
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-600 mb-4 md:mb-0">
              © 2025 NovaCare Clinic Management System • For Internal Staff Use Only
            </div>
            <div className="flex space-x-6">
              <Link href="/help" className="text-gray-600 hover:text-indigo-600 transition">Help Center</Link>
              <Link href="/support" className="text-gray-600 hover:text-indigo-600 transition">IT Support</Link>
              <Link href="/privacy" className="text-gray-600 hover:text-indigo-600 transition">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
