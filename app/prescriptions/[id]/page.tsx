"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface PrescriptionItem {
  PRESCRIPTIONITEMID: number;
  MEDICINEID: number;
  MEDNAME: string;
  MEDDOSAGEFORM: string;
  QUANTITY: number;
  DOSAGE: string;
  DATE: string;
}

interface PrescriptionDetail {
  PRESCRIPTIONID: number;
  RECORDID: number;
  INSTRUCTION: string;
  VISITDATE: string;
  PATIENTIC: string;
  PATIENT_NAME: string;
  DOCTORID: number;
  DOCTOR_NAME: string;
  DIAGNOSIS: string;
  SYMPTOM: string;
  items: PrescriptionItem[];
}

export default function ViewPrescription() {
  const params = useParams();
  const prescriptionId = params.id;

  const [prescription, setPrescription] = useState<PrescriptionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchPrescription();
  }, []);

  const fetchPrescription = async () => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/prescription/${prescriptionId}`
      );
      const data = await response.json();

      if (data.success) {
        setPrescription(data.data);
        setError("");
      } else {
        setError(data.message || "Failed to load prescription");
      }
    } catch (error) {
      console.error("Error fetching prescription:", error);
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          <p className="mt-4 text-gray-600">Loading prescription...</p>
        </div>
      </div>
    );
  }

  if (error || !prescription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 shadow-xl max-w-md">
          <div className="text-red-600 mb-4">{error || "Prescription not found"}</div>
          <Link
            href="/prescriptions"
            className="text-indigo-600 hover:text-indigo-900 font-medium"
          >
            ← Back to Prescriptions
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
              <Link href="/" className="px-4 py-2 text-gray-600 hover:text-gray-900">
                Home
              </Link>
              <Link href="/prescriptions" className="px-4 py-2 text-gray-600 hover:text-gray-900">
                Back to List
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                  Prescription #{prescription.PRESCRIPTIONID}
                </h2>
                <p className="text-sm text-gray-500">
                  Medical Record #{prescription.RECORDID}
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Visit Date</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatDate(prescription.VISITDATE)}
                </div>
              </div>
            </div>
          </div>

          {/* Patient & Doctor Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Patient</h3>
              <p className="text-lg font-semibold text-gray-900">{prescription.PATIENT_NAME}</p>
              <p className="text-sm text-gray-600">IC: {prescription.PATIENTIC}</p>
            </div>

            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Prescribed By</h3>
              <p className="text-lg font-semibold text-gray-900">Dr. {prescription.DOCTOR_NAME}</p>
              <p className="text-sm text-gray-600">Doctor ID: {prescription.DOCTORID}</p>
            </div>
          </div>

          {/* Diagnosis & Symptoms */}
          <div className="mb-8 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Diagnosis</h3>
              <p className="text-gray-900">{prescription.DIAGNOSIS || "N/A"}</p>
            </div>
            {prescription.SYMPTOM && (
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">Symptoms</h3>
                <p className="text-gray-900">{prescription.SYMPTOM}</p>
              </div>
            )}
          </div>

          {/* General Instructions */}
          {prescription.INSTRUCTION && (
            <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">General Instructions</h3>
              <p className="text-gray-700">{prescription.INSTRUCTION}</p>
            </div>
          )}

          {/* Prescribed Medicines */}
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-4">Prescribed Medicines</h3>
            {prescription.items && prescription.items.length > 0 ? (
              <div className="space-y-4">
                {prescription.items.map((item, index) => (
                  <div
                    key={item.PRESCRIPTIONITEMID}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">{item.MEDNAME}</h4>
                        <p className="text-sm text-gray-500">{item.MEDDOSAGEFORM}</p>
                      </div>
                      <span className="px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium">
                        {item.QUANTITY} units
                      </span>
                    </div>
                    <div className="bg-gray-50 rounded p-3 mt-3">
                      <p className="text-sm font-medium text-gray-700 mb-1">Dosage Instructions:</p>
                      <p className="text-gray-900">{item.DOSAGE}</p>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Prescribed on: {formatDate(item.DATE)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No medicines prescribed</p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200 flex justify-between">
            <Link
              href="/prescriptions"
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              ← Back to List
            </Link>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
            >
              Print Prescription
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
