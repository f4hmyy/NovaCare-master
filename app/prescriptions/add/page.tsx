"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface MedicalRecord {
  RECORDID: number;
  PATIENTIC: string;
  PATIENT_NAME: string;
  DOCTOR_NAME: string;
  VISITDATE: string;
  DIAGNOSIS: string;
  SYMPTOM: string;
}

interface Medicine {
  MEDICINE_ID: number;
  NAME: string;
  DOSAGE_FORM: string;
  CURRENT_STOCK: number;
}

interface PrescriptionItem {
  medicineId: number;
  medicineName?: string;
  quantity: number;
  dosage: string;
}

export default function AddPrescription() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);

  const [formData, setFormData] = useState({
    recordId: "",
    instruction: "",
  });

  const [items, setItems] = useState<PrescriptionItem[]>([
    { medicineId: 0, quantity: 1, dosage: "" },
  ]);

  useEffect(() => {
    fetchRecords();
    fetchMedicines();
  }, []);

  const fetchRecords = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/medicalrecords");
      const data = await response.json();
      if (data.success) {
        setRecords(data.data);
      }
    } catch (err) {
      console.error("Error fetching records:", err);
    }
  };

  const fetchMedicines = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/medicine");
      const data = await response.json();
      if (data.success) {
        setMedicines(data.data);
      }
    } catch (err) {
      console.error("Error fetching medicines:", err);
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

  const handleItemChange = (index: number, field: keyof PrescriptionItem, value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { medicineId: 0, quantity: 1, dosage: "" }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const validItems = items.filter(
      (item) => item.medicineId > 0 && item.quantity > 0 && item.dosage
    );

    if (validItems.length === 0) {
      setError("Please add at least one medicine with dosage information");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/prescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recordId: parseInt(formData.recordId),
          items: validItems,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Prescription created successfully!");
        router.push("/prescriptions");
      } else {
        setError(data.message || "Failed to create prescription");
      }
    } catch (err) {
      setError("Network error. Please check if the server is running.");
    } finally {
      setLoading(false);
    }
  };

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
                View Prescriptions
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Prescription</h2>
            <p className="text-gray-600">Select medical record and add medicines</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Medical Record Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical Record <span className="text-red-500">*</span>
              </label>
              <select
                name="recordId"
                required
                value={formData.recordId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">Select Medical Record</option>
                {records.map((record) => (
                  <option key={record.RECORDID} value={record.RECORDID}>
                    #{record.RECORDID} - {record.PATIENT_NAME} - Dr. {record.DOCTOR_NAME} (
                    {new Date(record.VISITDATE).toLocaleDateString()}) - {record.DIAGNOSIS}
                  </option>
                ))}
              </select>
            </div>

            {/* Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                General Instructions
              </label>
              <textarea
                name="instruction"
                value={formData.instruction}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g., Take all medications with food, Avoid alcohol, etc."
              />
            </div>

            {/* Prescription Items */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Medicines</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  + Add Medicine
                </button>
              </div>

              {items.map((item, index) => (
                <div key={index} className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medicine <span className="text-red-500">*</span>
                      </label>
                      <select
                        required
                        value={item.medicineId}
                        onChange={(e) =>
                          handleItemChange(index, "medicineId", parseInt(e.target.value))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="0">Select Medicine</option>
                        {medicines.map((med) => (
                          <option key={med.MEDICINE_ID} value={med.MEDICINE_ID}>
                            {med.NAME} ({med.DOSAGE_FORM}) - Stock: {med.CURRENT_STOCK}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", parseInt(e.target.value))
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Dosage Instructions <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={item.dosage}
                        onChange={(e) => handleItemChange(index, "dosage", e.target.value)}
                        placeholder="e.g., 1 tablet twice daily"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>

                    <div className="md:col-span-1 flex items-end">
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="w-full px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 font-bold"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-4">
              <Link
                href="/prescriptions"
                className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400"
              >
                {loading ? "Creating..." : "Create Prescription"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
