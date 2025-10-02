'use client';

/**
 * Admin Data Import Dashboard
 * Modern, functional interface for CSV venue imports
 */

import { useState, useEffect } from 'react';

interface ImportStats {
  total: number;
  imported: number;
  failed: number;
  skipped: number;
  errors: Array<{
    venue: string;
    error: string;
  }>;
}

interface VenueStats {
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  byCity: Array<{ city: string; count: number }>;
  recent: Array<{
    id: string;
    publicId: string;
    type: string;
    title: string;
    city: string;
    createdAt: string;
  }>;
}

export default function DataImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [uploadResult, setUploadResult] = useState<any>(null);
  const [importResult, setImportResult] = useState<ImportStats | null>(null);
  const [stats, setStats] = useState<VenueStats | null>(null);
  const [error, setError] = useState<string>('');

  // Load stats on mount
  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await fetch('/api/admin/venues/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError('Please select a CSV file');
        return;
      }
      setFile(selectedFile);
      setError('');
      setUploadResult(null);
      setImportResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/admin/upload-csv', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploadResult(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleImport = async () => {
    if (!uploadResult?.filepath) {
      setError('Please upload a file first');
      return;
    }

    setImporting(true);
    setError('');

    try {
      const res = await fetch('/api/admin/import-csv', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          filepath: uploadResult.filepath,
          filename: uploadResult.filename,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setImportResult(data.stats);
      loadStats(); // Refresh stats
    } catch (err: any) {
      setError(err.message);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            📊 Data Import Dashboard
          </h1>
          <p className="text-slate-600 text-lg">
            Upload and import venue data from CSV files
          </p>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-6 border border-blue-100">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-slate-600 font-medium mt-1">Total Venues</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-green-100">
              <div className="text-3xl font-bold text-green-600">
                {stats.byType.HOTEL || 0}
              </div>
              <div className="text-slate-600 font-medium mt-1">Hotels</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-orange-100">
              <div className="text-3xl font-bold text-orange-600">
                {stats.byType.RESTAURANT || 0}
              </div>
              <div className="text-slate-600 font-medium mt-1">Restaurants</div>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6 border border-purple-100">
              <div className="text-3xl font-bold text-purple-600">
                {stats.byType.ACTIVITY || 0}
              </div>
              <div className="text-slate-600 font-medium mt-1">Activities</div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">
            📤 Upload CSV File
          </h2>

          <div className="space-y-4">
            {/* File Input */}
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors">
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
                id="csv-upload"
              />
              <label
                htmlFor="csv-upload"
                className="cursor-pointer inline-flex items-center gap-3 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Select CSV File
              </label>
              {file && (
                <div className="mt-4 text-slate-700 font-medium">
                  Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </div>
              )}
            </div>

            {/* Upload Button */}
            {file && !uploadResult && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
              >
                {uploading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Uploading...
                  </span>
                ) : (
                  'Upload File'
                )}
              </button>
            )}

            {/* Upload Success */}
            {uploadResult && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <div className="flex items-center gap-3 text-green-800 font-semibold text-lg mb-2">
                  <svg
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  File uploaded successfully!
                </div>
                <div className="text-green-700">
                  File: {uploadResult.filename}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Import Section */}
        {uploadResult && !importResult && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              💾 Import to Database
            </h2>

            <button
              onClick={handleImport}
              disabled={importing}
              className="w-full py-4 px-6 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold text-lg hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
            >
              {importing ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Importing venues...
                </span>
              ) : (
                'Start Import'
              )}
            </button>
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              ✅ Import Complete
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <div className="text-2xl font-bold text-blue-600">
                  {importResult.total}
                </div>
                <div className="text-slate-600 font-medium text-sm">Total</div>
              </div>
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <div className="text-2xl font-bold text-green-600">
                  {importResult.imported}
                </div>
                <div className="text-slate-600 font-medium text-sm">Imported</div>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <div className="text-2xl font-bold text-orange-600">
                  {importResult.skipped}
                </div>
                <div className="text-slate-600 font-medium text-sm">Skipped</div>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <div className="text-2xl font-bold text-red-600">
                  {importResult.failed}
                </div>
                <div className="text-slate-600 font-medium text-sm">Failed</div>
              </div>
            </div>

            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-800 mb-2">Errors:</h3>
                <ul className="space-y-1 text-sm text-red-700">
                  {importResult.errors.map((err, i) => (
                    <li key={i}>
                      • {err.venue}: {err.error}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => {
                setFile(null);
                setUploadResult(null);
                setImportResult(null);
                loadStats();
              }}
              className="mt-6 w-full py-3 px-6 bg-slate-600 text-white rounded-lg font-medium hover:bg-slate-700 transition-colors"
            >
              Import Another File
            </button>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <div className="flex items-center gap-3 text-red-800 font-semibold">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Recent Venues */}
        {stats?.recent && stats.recent.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-200">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              🕒 Recently Added Venues
            </h2>
            <div className="space-y-3">
              {stats.recent.map((venue) => (
                <div
                  key={venue.id}
                  className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-900">
                      {venue.title}
                    </div>
                    <div className="text-sm text-slate-600">
                      {venue.type} • {venue.city}
                    </div>
                  </div>
                  <div className="text-sm text-slate-500">
                    {new Date(venue.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
