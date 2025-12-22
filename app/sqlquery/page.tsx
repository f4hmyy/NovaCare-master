"use client";

import { useState } from "react";
import Link from "next/link";

interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
}

export default function SQLQuery() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sampleQueries = [
    {
      name: "View All Patients",
      query: "SELECT PATIENTIC, FIRSTNAME, LASTNAME, EMAIL, PHONENUM FROM PATIENTS ORDER BY PATIENTIC DESC"
    },
    {
      name: "View All Appointments",
      query: "SELECT a.APPOINTMENTID, a.PATIENTIC, p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME, a.APPOINTMENTDATE, a.APPOINTMENTTIME, a.STATUS FROM APPOINTMENTS a JOIN PATIENTS p ON a.PATIENTIC = p.PATIENTIC ORDER BY a.APPOINTMENTDATE DESC"
    },
    {
      name: "View All Doctors",
      query: "SELECT d.DOCTORID, d.FIRSTNAME, d.LASTNAME, s.SPECIALIZATIONTYPE, d.EMAIL FROM DOCTORS d LEFT JOIN SPECIALIZATION s ON d.SPECIALIZATIONID = s.SPECIALIZATIONID ORDER BY d.DOCTORID DESC"
    },
    {
      name: "View Medical Records",
      query: "SELECT r.RECORDID, r.VISITDATE, a.PATIENTIC, p.FIRSTNAME || ' ' || p.LASTNAME as PATIENT_NAME, r.DIAGNOSIS FROM MEDICALRECORD r JOIN APPOINTMENTS a ON r.APPOINTMENTID = a.APPOINTMENTID JOIN PATIENTS p ON a.PATIENTIC = p.PATIENTIC ORDER BY r.VISITDATE DESC"
    },
    {
      name: "View Medicines Stock",
      query: "SELECT MEDICINEID, MEDNAME, CURRENTSTOCK, MEDPRICE, MEDEXPIRYDATE FROM MEDICINE ORDER BY CURRENTSTOCK ASC"
    }
  ];

  const executeQuery = async () => {
    if (!query.trim()) {
      setError("Please enter a SQL query");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch("http://localhost:5000/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();

      if (data.success) {
        setResult({
          columns: data.columns || [],
          rows: data.rows || [],
          rowCount: data.rowCount || 0,
        });
      } else {
        setError(data.message || "Query execution failed");
      }
    } catch (err) {
      setError("Network error. Please check if the server is running.");
      console.error("Error executing query:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadSampleQuery = (sampleQuery: string) => {
    setQuery(sampleQuery);
    setResult(null);
    setError("");
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
                <p className="text-xs text-gray-500">SQL Query Tool</p>
              </div>
            </Link>
            <Link
              href="/"
              className="px-4 py-2 text-gray-600 hover:text-gray-900"
            >
              ← Back to Home
            </Link>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">SQL Query Console</h2>
            <p className="text-gray-600">Execute SQL queries directly on the database</p>
            <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Warning:</strong> Be careful with UPDATE, DELETE, and DROP queries. They can modify or delete data permanently.
              </p>
            </div>
          </div>

          {/* Sample Queries */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Sample Queries:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sampleQueries.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => loadSampleQuery(sample.query)}
                  className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 text-sm font-medium transition-colors text-left"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          {/* Query Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SQL Query <span className="text-red-500">*</span>
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter your SQL query here... (e.g., SELECT * FROM PATIENTS)"
              rows={8}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-mono text-sm"
            />
          </div>

          {/* Execute Button */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={executeQuery}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Executing..." : "Execute Query"}
            </button>
            <button
              onClick={() => {
                setQuery("");
                setResult(null);
                setError("");
              }}
              className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            >
              Clear
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-800 border border-red-200 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="mt-6">
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 font-medium">
                  ✓ Query executed successfully! ({result.rowCount} rows returned)
                </p>
              </div>

              {result.rows.length > 0 ? (
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        {result.columns.map((column, index) => (
                          <th
                            key={index}
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {result.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-gray-50">
                          {result.columns.map((column, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                            >
                              {row[column] !== null && row[column] !== undefined
                                ? String(row[column])
                                : "NULL"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-gray-500 border border-gray-200 rounded-lg">
                  Query executed successfully but returned no rows.
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
