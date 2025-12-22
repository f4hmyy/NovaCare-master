"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface InvoiceDetail {
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

export default function ViewInvoice() {
  const params = useParams();
  const invoiceId = params.id;

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/invoice/${invoiceId}`
      );
      const data = await response.json();

      if (data.success) {
        setInvoice(data.data);
        setError("");
      } else {
        setError(data.message || "Failed to load invoice");
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-MY", {
      style: "currency",
      currency: "MYR",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md">
          <div className="text-red-600 mb-4">{error || "Invoice not found"}</div>
          <Link
            href="/invoices"
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            ← Back to Invoices
          </Link>
        </div>
      </div>
    );
  }

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
              <Link
                href="/"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Home
              </Link>
              <Link
                href="/invoices"
                className="px-4 py-2 text-gray-600 hover:text-gray-900"
              >
                Back to Invoices
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Invoice Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-8 py-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Invoice #{String(invoice.INVOICEID).padStart(4, "0")}
                </h2>
                <p className="text-indigo-100">NovaCare Clinic Management System</p>
              </div>
              <div className="text-right">
                <span
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    invoice.PAYMENT_STATUS === "Paid"
                      ? "bg-green-500 text-white"
                      : "bg-yellow-500 text-white"
                  }`}
                >
                  {invoice.PAYMENT_STATUS}
                </span>
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="px-8 py-6">
            {/* Patient and Appointment Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Patient Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Patient Name</span>
                    <p className="text-gray-900 font-medium">{invoice.PATIENT_NAME}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">IC Number</span>
                    <p className="text-gray-900 font-medium">{invoice.PATIENT_IC}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Doctor</span>
                    <p className="text-gray-900 font-medium">Dr. {invoice.DOCTOR_NAME}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Appointment Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Appointment ID</span>
                    <p className="text-gray-900 font-medium">#{invoice.APPOINTMENTID}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Appointment Date</span>
                    <p className="text-gray-900 font-medium">
                      {formatDate(invoice.APPOINTMENTDATE)}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Date Paid</span>
                    <p className="text-gray-900 font-medium">
                      {invoice.DATEPAID ? formatDate(invoice.DATEPAID) : "Not Paid"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Payment Information
              </h3>
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-sm text-gray-500">Payment Method</span>
                    <p className="text-gray-900 font-medium text-lg">
                      {invoice.PAYMENTMETHOD || "Not Specified"}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <p className="text-3xl font-bold text-indigo-600">
                      {formatCurrency(invoice.TOTALAMOUNT)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t border-gray-200 pt-6 flex justify-between items-center">
              <Link
                href="/invoices"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
              >
                ← Back to Invoices
              </Link>
              <div className="flex space-x-3">
                {invoice.PAYMENT_STATUS === "Pending" && (
                  <Link
                    href={`/invoices/edit/${invoice.INVOICEID}`}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Mark as Paid
                  </Link>
                )}
                <button
                  onClick={() => window.print()}
                  className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
