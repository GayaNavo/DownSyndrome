import { Patient } from '../models/Patient';

export class PatientService {
  private patients: Patient[] = [];

  constructor() {
    // Initialize with some dummy data
    this.patients = [
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
  }

  async getAllPatients(): Promise<Patient[]> {
    return this.patients;
  }

  async getPatientById(id: string): Promise<Patient | null> {
    const patient = this.patients.find(p => p.id === id);
    return patient || null;
  }

  async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    const newPatient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      ...patientData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.patients.push(newPatient);
    return newPatient;
  }

  async updatePatient(id: string, patientData: Partial<Patient>): Promise<Patient | null> {
    const index = this.patients.findIndex(p => p.id === id);
    if (index === -1) return null;
    
    this.patients[index] = {
      ...this.patients[index],
      ...patientData,
      updatedAt: new Date(),
    };
    
    return this.patients[index];
  }

  async deletePatient(id: string): Promise<boolean> {
    const initialLength = this.patients.length;
    this.patients = this.patients.filter(p => p.id !== id);
    return this.patients.length < initialLength;
  }
}