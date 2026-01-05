'use client';

import { useEffect, useState } from 'react';
import { Patient } from '../../models/Patient';

interface PatientFormData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  diagnosisDate: string;
}

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    diagnosisDate: '',
  });

  // In a real app, this would come from a controller/service
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        // Simulate API call
        const mockPatients: Patient[] = [
          {
            id: '1',
            firstName: 'John',
            lastName: 'Doe',
            dateOfBirth: new Date('2010-05-15'),
            diagnosisDate: new Date('2010-06-20'),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: '2',
            firstName: 'Jane',
            lastName: 'Smith',
            dateOfBirth: new Date('2012-08-22'),
            diagnosisDate: new Date('2012-09-10'),
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        setPatients(mockPatients);
      } catch (error) {
        console.error('Failed to fetch patients:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would call a controller method
    alert('Patient would be created in a real application');
    setShowForm(false);
    setFormData({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      diagnosisDate: '',
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-3xl font-bold mb-6">Patients</h1>
      
      <div className="w-full max-w-4xl mb-6">
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          {showForm ? 'Cancel' : 'Add New Patient'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="w-full max-w-4xl mb-8 p-6 border rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Add New Patient</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium mb-1">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium mb-1">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">Date of Birth</label>
              <input
                type="date"
                id="dateOfBirth"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="diagnosisDate" className="block text-sm font-medium mb-1">Diagnosis Date</label>
              <input
                type="date"
                id="diagnosisDate"
                name="diagnosisDate"
                value={formData.diagnosisDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
          </div>
          <button 
            type="submit" 
            className="mt-4 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Save Patient
          </button>
        </form>
      )}

      <div className="w-full max-w-4xl">
        <h2 className="text-2xl font-semibold mb-4">Patient List</h2>
        {patients.length === 0 ? (
          <p>No patients found.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {patients.map((patient) => (
              <div key={patient.id} className="border p-4 rounded-lg shadow">
                <h3 className="text-xl font-medium">{patient.firstName} {patient.lastName}</h3>
                <p className="text-gray-600">DOB: {patient.dateOfBirth.toLocaleDateString()}</p>
                <p className="text-gray-600">Diagnosed: {patient.diagnosisDate.toLocaleDateString()}</p>
                <p className="text-sm text-gray-500 mt-2">
                  Added: {patient.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}