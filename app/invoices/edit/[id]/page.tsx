"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";

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
  REASON_TO_VISIT: string;
  PAYMENT_STATUS: string;
}

export default function EditInvoice() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const [formData, setFormData] = useState({
    totalamount: "",
    paymentmethod: "",
    datepaid: "",
  });

  useEffect(() => {
    fetchInvoice();
  }, []);

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/invoice/${invoiceId}`);
      const data = await response.json();

      if (data.success) {
        const inv = data.data;
        setInvoice(inv);
        setFormData({
          totalamount: inv.TOTALAMOUNT?.toString() || "",
          paymentmethod: inv.PAYMENTMETHOD || "",
          datepaid: inv.DATEPAID ? new Date(inv.DATEPAID).toISOString().split("T")[0] : "",
        });
      } else {
        setError(data.message || "Failed to load invoice");
      }
    } catch (err) {
      console.error("Error fetching invoice:", err);
      setError("Network error. Please check if the server is running.");
    } finally {
      setFetching(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
      const response = await fetch(`http://localhost:5000/api/invoice/${invoiceId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Invoice updated successfully!");
        router.push("/invoices");
      } else {
        setError(data.message || "Failed to update invoice");
      }
    } catch (err) {
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const markAsPaid = () => {
    const today = new Date().toISOString().split("T")[0];
    setFormData({
      ...formData,
      datepaid: today,
      paymentmethod: formData.paymentmethod || "Cash",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-MY', {
      style: 'currency',
      currency: 'MYR'
    }).format(amount);
  };

  if (fetching) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading invoice...</p>
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
              Edit Invoice INV-{String(invoiceId).padStart(4, '0')}
            </h2>
            <p className="text-gray-600">Update invoice details and payment status</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Invoice Details Card */}
          {invoice && (
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <h3 className="font-medium text-gray-900 mb-4">Invoice Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Patient:</span>
                  <span className="ml-2 text-gray-900 font-medium">{invoice.PATIENT_NAME}</span>
                </div>
                <div>
                  <span className="text-gray-500">IC:</span>
                  <span className="ml-2 text-gray-900">{invoice.PATIENT_IC}</span>
                </div>
                <div>
                  <span className="text-gray-500">Doctor:</span>
                  <span className="ml-2 text-gray-900">Dr. {invoice.DOCTOR_NAME}</span>
                </div>
                <div>
                  <span className="text-gray-500">Appointment Date:</span>
                  <span className="ml-2 text-gray-900">
                    {new Date(invoice.APPOINTMENTDATE).toLocaleDateString()}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Reason for Visit:</span>
                  <span className="ml-2 text-gray-900">{invoice.REASON_TO_VISIT || "N/A"}</span>
                </div>
                <div>
                  <span className="text-gray-500">Current Status:</span>
                  <span className={`ml-2 px-2 py-1 rounded text-xs font-medium ${
                    invoice.PAYMENT_STATUS === "Paid" 
                      ? "bg-green-100 text-green-800" 
                      : "bg-yellow-100 text-yellow-800"
                  }`}>
                    {invoice.PAYMENT_STATUS}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          {invoice?.PAYMENT_STATUS === "Pending" && (
            <div className="mb-6">
              <button
                type="button"
                onClick={markAsPaid}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                ✓ Mark as Paid Today
              </button>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
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
                <option value="">Select Payment Method</option>
                <option value="Cash">Cash</option>
                <option value="Card">Card</option>
                <option value="Insurance">Insurance</option>
                <option value="Online Transfer">Online Transfer</option>
              </select>
            </div>

            {/* Date Paid */}
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
                Set a date to mark as paid, or leave empty for pending status
              </p>
            </div>

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
                {loading ? "Updating..." : "Update Invoice"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
