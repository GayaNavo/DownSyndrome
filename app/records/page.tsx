'use client';

import { useEffect, useState } from 'react';
import { MedicalRecord } from '../../models/MedicalRecord';

interface RecordFormData {
  patientId: string;
  doctorId: string;
  visitDate: string;
  diagnosis: string;
  treatment: string;
  notes: string;
}

export default function MedicalRecordsPage() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<RecordFormData>({
    patientId: '',
    doctorId: '',
    visitDate: '',
    diagnosis: '',
    treatment: '',
    notes: '',
  });

  // In a real app, this would come from a controller/service
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        // Simulate API call
        const mockRecords: MedicalRecord[] = [
          {
            id: '1',
            patientId: '1',
            doctorId: 'doc1',
            visitDate: new Date('2023-01-15'),
            diagnosis: 'Routine checkup',
            treatment: 'Vitamin supplements',
            notes: 'Patient showing good progress',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            patientId: '2',
            doctorId: 'doc2',
            visitDate: new Date('2023-02-20'),
            diagnosis: 'Physical therapy assessment',
            treatment: 'Weekly sessions',
            notes: 'Refer to specialist',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        setRecords(mockRecords);
      } catch (error) {
        console.error('Failed to fetch records:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call a controller method
    alert('Medical record would be created in a real application');
    setShowForm(false);
    setFormData({
      patientId: '',
      doctorId: '',
      visitDate: '',
      diagnosis: '',
      treatment: '',
      notes: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">Medical Records</h1>
      
      <div className="w-full max-w-4xl mb-6">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showForm ? 'Cancel' : 'Add New Record'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mb-8 p-6 border rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Medical Record</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="patientId" className="block text-sm font-medium mb-1">Patient ID</label>
              <input
                type="text"
                id="patientId"
                name="patientId"
                value={formData.patientId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="doctorId" className="block text-sm font-medium mb-1">Doctor ID</label>
              <input
                type="text"
                id="doctorId"
                name="doctorId"
                value={formData.doctorId}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="visitDate" className="block text-sm font-medium mb-1">Visit Date</label>
              <input
                type="date"
                id="visitDate"
                name="visitDate"
                value={formData.visitDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="diagnosis" className="block text-sm font-medium mb-1">Diagnosis</label>
              <input
                type="text"
                id="diagnosis"
                name="diagnosis"
                value={formData.diagnosis}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="treatment" className="block text-sm font-medium mb-1">Treatment</label>
              <input
                type="text"
                id="treatment"
                name="treatment"
                value={formData.treatment}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <div className="md:col-span-2">
              <label htmlFor="notes" className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border rounded-md"
              ></textarea>
            </div>
          </div>
          <button 
            type="submit" 
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Save Record
          </button>
        </form>
      )}

      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4">Medical Records</h2>
        {records.length === 0 ? (
          <p>No medical records found.</p>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <div key={record.id} className="border p-4 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-medium">Record #{record.id}</h3>
                    <p className="text-gray-600">Patient ID: {record.patientId}</p>
                    <p className="text-gray-600">Doctor ID: {record.doctorId}</p>
                  </div>
                  <p className="text-gray-500">Visit: {record.visitDate.toLocaleDateString()}</p>
                </div>
                <div className="mt-3">
                  <p><span className="font-medium">Diagnosis:</span> {record.diagnosis}</p>
                  <p><span className="font-medium">Treatment:</span> {record.treatment}</p>
                  <p><span className="font-medium">Notes:</span> {record.notes}</p>
                </div>
                <p className="text-sm text-gray-500 mt-3">
                  Created: {record.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}