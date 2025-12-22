"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Invoice {
  INVOICEID: number;
  APPOINTMENTID: number;
  TOTALAMOUNT: number;
  PAYMENTMETHOD: string;
  DATEPAID: string;
  APPOINTMENTDATE: string;
  PATIENT_IC: string;
  PATIENT_NAME: string;
  DOCTOR_NAME: string;
  PAYMENT_STATUS: string;
}

export default function Invoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterDate, setFilterDate] = useState("");
  const [searchPatient, setSearchPatient] = useState("");

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/invoice");
      const data = await response.json();

      if (data.success) {
        setInvoices(data.data);
        setError("");
      } else {
        setError(data.message || "Failed to load invoices");
      }
    } catch (error) {
      console.error("Error fetching invoices:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this invoice?")) return;

    try {
      const response = await fetch(`http://localhost:5000/api/invoice/${id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Invoice deleted successfully!");
        fetchInvoices();
      } else {
        alert(data.message || "Failed to delete invoice");
      }
    } catch (error) {
      console.error("Error deleting invoice:", error);
      alert("Network error occurred");
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    return status === "Paid"
      ? "bg-green-100 text-green-800"
      : "bg-yellow-100 text-yellow-800";
  };

  const filteredInvoices = invoices.filter((inv) => {
    // Filter by status
    if (filterStatus !== "All" && inv.PAYMENT_STATUS !== filterStatus) {
      return false;
    }
    
    // Filter by date
    if (filterDate) {
      const invDate = new Date(inv.APPOINTMENTDATE).toISOString().split("T")[0];
      if (invDate !== filterDate) {
        return false;
      }
    }
    
    // Search by patient name or IC
    if (searchPatient) {
      const search = searchPatient.toLowerCase();
      const matchesName = inv.PATIENT_NAME.toLowerCase().includes(search);
      const matchesIC = inv.PATIENT_IC.toLowerCase().includes(search);
      if (!matchesName && !matchesIC) {
        return false;
      }
    }
    
    return true;
  });

  // Calculate totals
  const totalAmount = invoices.reduce((sum, inv) => sum + (inv.TOTALAMOUNT || 0), 0);
  const paidAmount = invoices
    .filter((inv) => inv.PAYMENT_STATUS === "Paid")
    .reduce((sum, inv) => sum + (inv.TOTALAMOUNT || 0), 0);
  const pendingAmount = totalAmount - paidAmount;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Invoices</h2>
              <p className="text-gray-600">Manage patient billing and payments</p>
            </div>
            <Link
              href="/invoices/add"
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              + Generate Invoice
            </Link>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-blue-50 rounded-xl p-6">
              <p className="text-sm text-blue-600 font-medium">Total Invoices</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(totalAmount)}</p>
              <p className="text-sm text-blue-600">{invoices.length} invoices</p>
            </div>
            <div className="bg-green-50 rounded-xl p-6">
              <p className="text-sm text-green-600 font-medium">Paid</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(paidAmount)}</p>
              <p className="text-sm text-green-600">
                {invoices.filter((i) => i.PAYMENT_STATUS === "Paid").length} invoices
              </p>
            </div>
            <div className="bg-yellow-50 rounded-xl p-6">
              <p className="text-sm text-yellow-600 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900">{formatCurrency(pendingAmount)}</p>
              <p className="text-sm text-yellow-600">
                {invoices.filter((i) => i.PAYMENT_STATUS === "Pending").length} invoices
              </p>
            </div>
          </div>

          {/* Filter */}
          <div className="mb-6 flex gap-4 flex-wrap">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Patient
              </label>
              <input
                type="text"
                placeholder="Search by name or IC..."
                value={searchPatient}
                onChange={(e) => setSearchPatient(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              >
                <option value="All">All Status</option>
                <option value="Paid">Paid</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Appointment Date
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            
            {(filterDate || filterStatus !== "All" || searchPatient) && (
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setFilterDate("");
                    setFilterStatus("All");
                    setSearchPatient("");
                  }}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
                >
                  Clear Filters
                </button>
              </div>
            )}
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
              <p className="mt-4 text-gray-600">Loading invoices...</p>
            </div>
          )}

          {/* Invoices Table */}
          {!loading && !error && (
            <div className="overflow-x-auto">
              {filteredInvoices.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No invoices found</p>
                  <Link
                    href="/invoices/add"
                    className="mt-4 inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                  >
                    Generate First Invoice
                  </Link>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Patient
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Appointment Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInvoices.map((invoice) => (
                      <tr key={invoice.INVOICEID} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          INV-{String(invoice.INVOICEID).padStart(4, '0')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {invoice.PATIENT_NAME}
                          </div>
                          <div className="text-sm text-gray-500">{invoice.PATIENT_IC}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          Dr. {invoice.DOCTOR_NAME}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(invoice.APPOINTMENTDATE)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.TOTALAMOUNT)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.PAYMENTMETHOD || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                              invoice.PAYMENT_STATUS
                            )}`}
                          >
                            {invoice.PAYMENT_STATUS}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <Link
                            href={`/invoices/${invoice.INVOICEID}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            View
                          </Link>
                          <Link
                            href={`/invoices/edit/${invoice.INVOICEID}`}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            {invoice.PAYMENT_STATUS === "Pending" ? "Pay" : "Edit"}
                          </Link>
                          <button
                            onClick={() => handleDelete(invoice.INVOICEID)}
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
