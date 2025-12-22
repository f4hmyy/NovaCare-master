"use client";

import { useState } from "react";
import Link from "next/link";

interface QueryResult {
  columns: string[];
  rows: any[];
  rowCount: number;
  rowsAffected?: number;
  queryType?: string;
}

export default function SQLQuery() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [executionTime, setExecutionTime] = useState<number>(0);

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
    },
    {
      name: "Count All Tables",
      query: "SELECT 'PATIENTS' as TABLE_NAME, COUNT(*) as ROW_COUNT FROM PATIENTS UNION ALL SELECT 'APPOINTMENTS', COUNT(*) FROM APPOINTMENTS UNION ALL SELECT 'DOCTORS', COUNT(*) FROM DOCTORS UNION ALL SELECT 'MEDICINE', COUNT(*) FROM MEDICINE"
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
    const startTime = performance.now();

    try {
      const response = await fetch("http://localhost:5000/api/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const data = await response.json();
      const endTime = performance.now();
      setExecutionTime(endTime - startTime);

      if (data.success) {
        setResult({
          columns: data.columns || [],
          rows: data.rows || [],
          rowCount: data.rowCount || 0,
          rowsAffected: data.rowsAffected,
          queryType: data.queryType
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey && e.key === 'Enter') || e.key === 'F5') {
      e.preventDefault();
      executeQuery();
    }
  };

  const formatValue = (value: any) => {
    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">NULL</span>;
    }
    if (typeof value === 'string' && value.length > 100) {
      return <span className="text-xs">{value}</span>;
    }
    return String(value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 text-white">
      <header className="bg-slate-950 shadow-lg border-b border-slate-700">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">NovaCare SQL Console</h1>
                <p className="text-xs text-slate-400">Database Query Tool</p>
              </div>
            </Link>
            <Link href="/" className="px-4 py-2 text-slate-300 hover:text-white transition">
              ← Back to Home
            </Link>
          </div>
        </nav>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-slate-800 rounded-xl shadow-2xl border border-slate-700">
          <div className="p-6 border-b border-slate-700">
            <h2 className="text-2xl font-bold text-white mb-2">SQL Query Worksheet</h2>
            <p className="text-slate-400 text-sm">Execute SQL queries • Press Ctrl+Enter or F5 to run</p>
            <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-700/50 rounded-lg">
              <p className="text-sm text-yellow-200">
                ⚠️ <strong>Warning:</strong> This console executes queries directly on the production database.
              </p>
            </div>
          </div>

          <div className="p-6 border-b border-slate-700 bg-slate-850">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Quick Queries:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {sampleQueries.map((sample, index) => (
                <button
                  key={index}
                  onClick={() => loadSampleQuery(sample.query)}
                  className="px-3 py-2 bg-slate-700 text-slate-200 rounded-md hover:bg-slate-600 text-xs font-medium transition-colors text-left border border-slate-600"
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-900">
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="-- Enter your SQL query here
-- Examples:
--   SELECT * FROM PATIENTS;
--   INSERT INTO PATIENTS (PATIENTIC, FIRSTNAME, LASTNAME) VALUES ('123', 'John', 'Doe');
--   UPDATE PATIENTS SET EMAIL = 'new@email.com' WHERE PATIENTIC = '123';
--   DELETE FROM PATIENTS WHERE PATIENTIC = '123';"
              rows={12}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm text-slate-100 placeholder-slate-500"
              spellCheck={false}
            />
          </div>

          <div className="flex gap-3 p-6 bg-slate-850 border-t border-slate-700">
            <button
              onClick={executeQuery}
              disabled={loading || !query.trim()}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-600 disabled:cursor-not-allowed font-medium transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Executing...
                </>
              ) : (
                <>
                  <span>▶</span>
                  Execute (Ctrl+Enter)
                </>
              )}
            </button>
            <button
              onClick={() => {
                setQuery("");
                setResult(null);
                setError("");
              }}
              className="px-6 py-2.5 bg-slate-700 text-slate-200 rounded-lg hover:bg-slate-600 font-medium transition-colors"
            >
              Clear
            </button>
          </div>

          {error && (
            <div className="mx-6 mb-6 p-4 bg-red-900/30 text-red-200 border border-red-700 rounded-lg">
              <div className="font-semibold mb-1">❌ Error:</div>
              <div className="text-sm font-mono">{error}</div>
            </div>
          )}

          {result && (
            <div className="p-6 border-t border-slate-700">
              <div className="mb-4 p-4 bg-green-900/30 border border-green-700 rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-green-200 font-medium">✓ Query executed successfully</p>
                  <p className="text-xs text-green-300 mt-1">
                    {result.queryType === 'SELECT' ? (
                      `${result.rowCount} row${result.rowCount !== 1 ? 's' : ''} returned`
                    ) : (
                      `${result.rowsAffected || 0} row${result.rowsAffected !== 1 ? 's' : ''} affected`
                    )}
                  </p>
                </div>
                <div className="text-right text-xs text-green-300">
                  <div>Execution time: {executionTime.toFixed(2)}ms</div>
                </div>
              </div>

              {result.queryType === 'SELECT' && result.rows.length > 0 ? (
                <div className="overflow-x-auto rounded-lg border border-slate-600">
                  <table className="min-w-full divide-y divide-slate-600">
                    <thead className="bg-slate-900">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider bg-slate-800">
                          #
                        </th>
                        {result.columns.map((column, index) => (
                          <th
                            key={index}
                            className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase tracking-wider"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="bg-slate-900 divide-y divide-slate-700">
                      {result.rows.map((row, rowIndex) => (
                        <tr key={rowIndex} className="hover:bg-slate-800 transition">
                          <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400 font-mono bg-slate-850">
                            {rowIndex + 1}
                          </td>
                          {result.columns.map((column, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-4 py-3 text-sm text-slate-200 font-mono"
                            >
                              {formatValue(row[column])}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : result.queryType === 'SELECT' ? (
                <div className="p-8 text-center text-slate-400 border border-slate-600 rounded-lg bg-slate-900">
                  Query executed successfully but returned no rows.
                </div>
              ) : (
                <div className="p-6 text-center text-slate-300 border border-slate-600 rounded-lg bg-slate-900">
                  <div className="text-lg font-semibold mb-2">
                    {result.queryType} operation completed
                  </div>
                  <div className="text-sm text-slate-400">
                    {result.rowsAffected || 0} row(s) affected
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
