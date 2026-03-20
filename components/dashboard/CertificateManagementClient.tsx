'use client';

import { useState, useRef } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Upload,
  FileText,
  Plus,
  Download,
  Loader2,
} from 'lucide-react';

interface CertificateData {
  // Required
  studentName: string;
  courseName: string;
  credentialCode: string;
  level: string;
  enrollmentId: string;
  userId: string;
  // Optional
  issueDate?: string;
  validUntil?: string;
  grade?: string;
  institution?: string;
  instructorNotes?: string;
}

interface ApiResponse {
  success: boolean;
  message?: string;
  error?: string;
  details?: string[];
  count?: number;
  certificate?: Record<string, unknown>;
  certificates?: Record<string, unknown>[];
  totalErrors?: number;
  skippedRows?: number;
}

export function CertificateManagementClient() {
  const [activeTab, setActiveTab] = useState('single');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Single Insert State
  const [singleForm, setSingleForm] = useState<CertificateData>({
    studentName: '',
    courseName: '',
    credentialCode: '',
    level: 'Beginner',
    enrollmentId: '',
    userId: '',
    issueDate: new Date().toISOString().split('T')[0],
    validUntil: '',
    grade: '',
    institution: '',
    instructorNotes: '',
  });

  // Batch Upload State
  const [batchInput, setBatchInput] = useState('');

  // CSV Upload State
  const [csvFile, setCSVFile] = useState<File | null>(null);

  // ============ Single Insert ============
  const handleSingleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch('/api/dashboard/certificates/single-insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(singleForm),
      });

      const data = (await res.json()) as ApiResponse;
      setResponse(data);

      if (data.success) {
        setSingleForm({
          studentName: '',
          courseName: '',
          credentialCode: '',
          level: 'Beginner',
          enrollmentId: '',
          userId: '',
          issueDate: new Date().toISOString().split('T')[0],
          validUntil: '',
          grade: '',
          institution: '',
          instructorNotes: '',
        });
      }
    } catch (error) {
      setResponse({
        success: false,
        error: `Network error: ${(error as Error).message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============ Batch Insert ============
  const handleBatchSubmit = async () => {
    if (!batchInput.trim()) {
      setResponse({
        success: false,
        error: 'Please paste JSON data',
      });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      let parsed;
      try {
        parsed = JSON.parse(batchInput);
      } catch {
        setResponse({
          success: false,
          error: 'Invalid JSON format. Please check your input.',
        });
        setLoading(false);
        return;
      }

      // Handle both array and object with certificates property
      const certificates = Array.isArray(parsed) ? parsed : parsed.certificates;

      if (!Array.isArray(certificates)) {
        setResponse({
          success: false,
          error: 'Expected array of certificates or object with "certificates" property',
        });
        setLoading(false);
        return;
      }

      const res = await fetch('/api/dashboard/certificates/batch-insert', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ certificates }),
      });

      const data = (await res.json()) as ApiResponse;
      setResponse(data);

      if (data.success) {
        setBatchInput('');
      }
    } catch (error) {
      setResponse({
        success: false,
        error: `Network error: ${(error as Error).message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============ CSV Import ============
  const handleCSVChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setCSVFile(e.target.files[0]);
      setResponse(null);
    }
  };

  const handleCSVSubmit = async () => {
    if (!csvFile) {
      setResponse({
        success: false,
        error: 'Please select a CSV file',
      });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const formData = new FormData();
      formData.append('file', csvFile);

      const res = await fetch('/api/dashboard/certificates/csv-import', {
        method: 'POST',
        body: formData,
      });

      const data = (await res.json()) as ApiResponse;
      setResponse(data);

      if (data.success) {
        setCSVFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    } catch (error) {
      setResponse({
        success: false,
        error: `Network error: ${(error as Error).message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  // ============ Helpers ============
  const downloadTemplate = (type: 'batch' | 'csv') => {
    const sampleData =
      type === 'batch'
        ? JSON.stringify(
            {
              certificates: [
                {
                  studentName: 'John Doe',
                  courseName: 'Web Development Mastery',
                  credentialCode: 'WEB-DEV-2024-001',
                  level: 'Advanced',
                  enrollmentId: '550e8400-e29b-41d4-a716-446655440000',
                  userId: '550e8400-e29b-41d4-a716-446655440001',
                  issueDate: '2026-03-20',
                  validUntil: '2028-03-20',
                  grade: 95.5,
                  institution: 'KitchenOfTech Academy',
                  instructorNotes: 'Excellent performance in all modules',
                },
                {
                  studentName: 'Jane Smith',
                  courseName: 'Advanced React',
                  credentialCode: 'REACT-2024-002',
                  level: 'Master',
                  enrollmentId: '550e8400-e29b-41d4-a716-446655440002',
                  userId: '550e8400-e29b-41d4-a716-446655440003',
                  issueDate: '2026-03-21',
                  validUntil: '2028-03-21',
                  grade: 98.0,
                  institution: 'KitchenOfTech Academy',
                  instructorNotes: 'Outstanding achievement and dedication',
                },
              ],
            },
            null,
            2
          )
        : 'studentName,courseName,credentialCode,level,enrollmentId,userId,issueDate,validUntil,grade,institution,instructorNotes\nJohn Doe,Web Development Mastery,WEB-DEV-2024-001,Advanced,550e8400-e29b-41d4-a716-446655440000,550e8400-e29b-41d4-a716-446655440001,2026-03-20,2028-03-20,95.5,KitchenOfTech Academy,Excellent performance in all modules\nJane Smith,Advanced React,REACT-2024-002,Master,550e8400-e29b-41d4-a716-446655440002,550e8400-e29b-41d4-a716-446655440003,2026-03-21,2028-03-21,98.0,KitchenOfTech Academy,Outstanding achievement and dedication';

    const element = document.createElement('a');
    element.setAttribute(
      'href',
      `data:text/${type === 'batch' ? 'plain' : 'csv'};charset=utf-8,${encodeURIComponent(sampleData)}`
    );
    element.setAttribute('download', `certificate_template.${type === 'batch' ? 'json' : 'csv'}`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Certificate Management</h1>
          <p className="text-gray-400 mt-2">Insert and manage course completion certificates</p>
        </div>
      </div>

      {/* Response Alert */}
      {response && (
        <div
          className={`p-4 rounded-lg border ${
            response.success
              ? 'bg-green-500/10 border-green-500/50 text-green-200'
              : 'bg-red-500/10 border-red-500/50 text-red-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {response.success ? (
              <CheckCircle2 className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="flex-1">
              <p className="font-semibold">{response.message || response.error}</p>
              {response.details && response.details.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm ml-4">
                  {response.details.map((detail, i) => (
                    <li key={i} className="list-disc">
                      {detail}
                    </li>
                  ))}
                </ul>
              )}
              {response.totalErrors && (
                <p className="mt-2 text-sm">
                  Showing first 20 errors. Total errors: {response.totalErrors}
                </p>
              )}
            </div>
            <button
              onClick={() => setResponse(null)}
              className="text-gray-400 hover:text-gray-200 flex-shrink-0"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <div className="bg-gray-900 border border-gray-800 rounded-lg">
        <div className="p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold">Insert Certificates</h2>
          <p className="text-gray-400 text-sm mt-1">Choose your preferred method to add certificates to the system</p>
        </div>

        <div className="p-6">
          {/* Tab Navigation */}
          <div className="flex gap-2 mb-6 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('single')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                activeTab === 'single'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Plus className="h-4 w-4" />
              Single Entry
            </button>
            <button
              onClick={() => setActiveTab('batch')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                activeTab === 'batch'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Upload className="h-4 w-4" />
              Batch JSON
            </button>
            <button
              onClick={() => setActiveTab('csv')}
              className={`flex items-center gap-2 px-4 py-2 font-medium transition-colors ${
                activeTab === 'csv'
                  ? 'text-blue-400 border-b-2 border-blue-400'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <FileText className="h-4 w-4" />
              CSV Import
            </button>
          </div>

          {/* Single Insert Tab */}
          {activeTab === 'single' && (
            <div className="space-y-4">
              <p className="text-sm text-gray-400 mb-4">Add a single certificate by filling out the form below</p>

              <form onSubmit={handleSingleSubmit} className="space-y-4">
                {/* Required Fields Row 1 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="student-name" className="block text-sm font-medium text-gray-200">
                      Student Name *
                    </label>
                    <input
                      id="student-name"
                      placeholder="John Doe"
                      value={singleForm.studentName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSingleForm({ ...singleForm, studentName: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="course-name" className="block text-sm font-medium text-gray-200">
                      Course Name *
                    </label>
                    <input
                      id="course-name"
                      placeholder="Web Development Mastery"
                      value={singleForm.courseName}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSingleForm({ ...singleForm, courseName: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Required Fields Row 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="credential-code" className="block text-sm font-medium text-gray-200">
                      Credential Code *
                    </label>
                    <input
                      id="credential-code"
                      placeholder="WEB-DEV-2024-001"
                      value={singleForm.credentialCode}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSingleForm({ ...singleForm, credentialCode: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="level" className="block text-sm font-medium text-gray-200">
                      Level *
                    </label>
                    <select
                      id="level"
                      value={singleForm.level}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setSingleForm({ ...singleForm, level: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Master">Master</option>
                    </select>
                  </div>
                </div>

                {/* Required Fields Row 3 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="enrollment-id" className="block text-sm font-medium text-gray-200">
                      Enrollment ID *
                    </label>
                    <input
                      id="enrollment-id"
                      placeholder="550e8400-e29b-41d4-a716-446655440000"
                      value={singleForm.enrollmentId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSingleForm({ ...singleForm, enrollmentId: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="user-id" className="block text-sm font-medium text-gray-200">
                      User ID *
                    </label>
                    <input
                      id="user-id"
                      placeholder="550e8400-e29b-41d4-a716-446655440001"
                      value={singleForm.userId}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSingleForm({ ...singleForm, userId: e.target.value })
                      }
                      required
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Optional Fields Row 1 */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="issue-date" className="block text-sm font-medium text-gray-200">
                      Issue Date
                    </label>
                    <input
                      id="issue-date"
                      type="date"
                      value={singleForm.issueDate}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSingleForm({ ...singleForm, issueDate: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="valid-until" className="block text-sm font-medium text-gray-200">
                      Valid Until
                    </label>
                    <input
                      id="valid-until"
                      type="date"
                      value={singleForm.validUntil}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSingleForm({ ...singleForm, validUntil: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="grade" className="block text-sm font-medium text-gray-200">
                      Grade (0-100)
                    </label>
                    <input
                      id="grade"
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      placeholder="95.50"
                      value={singleForm.grade}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSingleForm({ ...singleForm, grade: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Optional Fields Row 2 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="institution" className="block text-sm font-medium text-gray-200">
                      Institution
                    </label>
                    <input
                      id="institution"
                      placeholder="KitchenOfTech Academy"
                      value={singleForm.institution}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSingleForm({ ...singleForm, institution: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="instructor-notes" className="block text-sm font-medium text-gray-200">
                      Instructor Notes
                    </label>
                    <input
                      id="instructor-notes"
                      placeholder="Excellent performance in all modules"
                      value={singleForm.instructorNotes}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setSingleForm({ ...singleForm, instructorNotes: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Inserting...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Insert Certificate
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* Batch JSON Tab */}
          {activeTab === 'batch' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Paste JSON array or object with certificates property (max 100 records)</p>
                <button
                  onClick={() => downloadTemplate('batch')}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </button>
              </div>

              <textarea
                placeholder={`{
  "certificates": [
    {
      "studentName": "John Doe",
      "courseName": "Web Development Mastery",
      "credentialCode": "WEB-DEV-2024-001",
      "level": "Advanced",
      "enrollmentId": "uuid",
      "userId": "uuid",
      "issueDate": "2026-03-20",
      "validUntil": "2028-03-20",
      "grade": 95.5,
      "institution": "KitchenOfTech Academy",
      "instructorNotes": "Excellent performance"
    }
  ]
}`}
                value={batchInput}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBatchInput(e.target.value)}
                rows={10}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white font-mono text-xs placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />

              <button
                onClick={handleBatchSubmit}
                disabled={loading || !batchInput.trim()}
                className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    Upload Batch
                  </>
                )}
              </button>
            </div>
          )}

          {/* CSV Import Tab */}
          {activeTab === 'csv' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-400">Upload CSV file with certificate data (max 100 rows, 5MB file size)</p>
                <button
                  onClick={() => downloadTemplate('csv')}
                  className="flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 rounded-lg transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  Download Template
                </button>
              </div>

              {/* CSV Requirements */}
              <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4">
                <h4 className="font-semibold text-sm text-blue-200 mb-2">CSV Requirements:</h4>
                <ul className="text-sm space-y-1 ml-4 text-blue-100">
                  <li>• <strong>Required columns:</strong> studentName, courseName, credentialCode, level, enrollmentId, userId</li>
                  <li>• <strong>Optional columns:</strong> issueDate, validUntil, grade, institution, instructorNotes</li>
                  <li>• Date format: YYYY-MM-DD</li>
                  <li>• Grade range: 0-100</li>
                  <li>• First row must be header</li>
                  <li>• Maximum 100 rows per file</li>
                  <li>• File size limit: 5MB</li>
                </ul>
              </div>

              {/* File Input */}
              <div
                className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-800/50 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleCSVChange}
                  className="hidden"
                />
                <FileText className="h-12 w-12 mx-auto text-gray-500 mb-2" />
                <p className="font-semibold text-white">
                  {csvFile ? csvFile.name : 'Click to upload or drag and drop'}
                </p>
                <p className="text-sm text-gray-400">CSV files only</p>
              </div>

              <button
                onClick={handleCSVSubmit}
                disabled={loading || !csvFile}
                className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 rounded-lg font-medium text-white transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Import CSV
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Information Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
            <Plus className="h-4 w-4" />
            Single Entry
          </h3>
          <p className="text-sm text-gray-400">Perfect for adding one certificate at a time. Ideal for manual entries or testing.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
            <Upload className="h-4 w-4" />
            Batch JSON
          </h3>
          <p className="text-sm text-gray-400">Upload up to 100 certificates using JSON format. Great for programmatic or API-based imports.</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-4">
          <h3 className="font-semibold text-white flex items-center gap-2 mb-2">
            <FileText className="h-4 w-4" />
            CSV Import
          </h3>
          <p className="text-sm text-gray-400">Upload certificate data from spreadsheets. Most user-friendly option for bulk operations.</p>
        </div>
      </div>
    </div>
  );
}
