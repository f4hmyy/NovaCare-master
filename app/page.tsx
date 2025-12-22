import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
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
              href="/patients/add" 
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 font-semibold text-lg shadow-lg border-2 border-indigo-600 transition"
            >
              Add Patient
            </Link>
            <Link 
              href="/prescriptions/add" 
              className="px-8 py-4 bg-white text-indigo-600 rounded-lg hover:bg-gray-50 font-semibold text-lg shadow-lg border-2 border-indigo-600 transition"
            >
              New Prescription
            </Link>
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-24">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Quick Access
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/patients" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Patients</h4>
              <p className="text-gray-600 text-sm">
                Manage patient records and information
              </p>
            </Link>

            <Link href="/appointments" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📅</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Appointments</h4>
              <p className="text-gray-600 text-sm">
                Schedule and manage appointments
              </p>
            </Link>

            <Link href="/prescriptions" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💊</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Prescriptions</h4>
              <p className="text-gray-600 text-sm">
                View and create prescriptions
              </p>
            </Link>

            <Link href="/doctors" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👨‍⚕️</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Doctors</h4>
              <p className="text-gray-600 text-sm">
                Manage doctor information
              </p>
            </Link>

            <Link href="/staff" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">👔</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Staff</h4>
              <p className="text-gray-600 text-sm">
                Manage staff members and schedules
              </p>
            </Link>

            <Link href="/medicines" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">💉</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Medicines</h4>
              <p className="text-gray-600 text-sm">
                Track medicine inventory and stock
              </p>
            </Link>

            <Link href="/rooms" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🏥</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Rooms</h4>
              <p className="text-gray-600 text-sm">
                Manage room availability
              </p>
            </Link>

            <Link href="/roles" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">🔑</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Roles</h4>
              <p className="text-gray-600 text-sm">
                Manage staff roles and permissions
              </p>
            </Link>

            <Link href="/medicalrecords" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">📋</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">Medical Records</h4>
              <p className="text-gray-600 text-sm">
                Patient medical history and records
              </p>
            </Link>

            <Link href="/sqlquery" className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition border-2 border-indigo-200">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">SQL Query</h4>
              <p className="text-gray-600 text-sm">
                Execute custom database queries
              </p>
            </Link>
          </div>
        </div>

        {/* Quick Access Section */}
        <div className="mt-24 bg-white rounded-2xl shadow-xl p-12">
          <h3 className="text-2xl font-bold text-center text-gray-900 mb-8">
            System Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border-2 border-green-200 bg-green-50 rounded-xl text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">System Online</h4>
              <p className="text-sm text-gray-600">All services operational</p>
            </div>

            <div className="p-6 border-2 border-blue-200 bg-blue-50 rounded-xl text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💾</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Database Connected</h4>
              <p className="text-sm text-gray-600">Oracle DB - Active</p>
            </div>

            <div className="p-6 border-2 border-indigo-200 bg-indigo-50 rounded-xl text-center">
              <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h4 className="font-bold text-gray-900 mb-2">Secure Connection</h4>
              <p className="text-sm text-gray-600">SSL/TLS Encrypted</p>
            </div>
          </div>
        </div>

        {/* System Info Section */}
        <div className="mt-24 bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl shadow-xl p-12 text-white">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">NovaCare Clinic Management</h3>
            <p className="text-lg text-indigo-100 mb-8">
              Complete healthcare management solution for modern clinics
            </p>
            <div className="flex justify-center gap-8 text-center flex-wrap">
              <div>
                <div className="text-4xl font-bold mb-2">8+</div>
                <p className="text-sm text-indigo-100">Management Modules</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">100%</div>
                <p className="text-sm text-indigo-100">Data Security</p>
              </div>
              <div>
                <div className="text-4xl font-bold mb-2">24/7</div>
                <p className="text-sm text-indigo-100">System Availability</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white mt-24 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            © 2025 NovaCare Clinic Management System • Version 1.0.0
          </div>
        </div>
      </footer>
    </div>
  );
}
