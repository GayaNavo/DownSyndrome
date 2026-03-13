import { Patient } from '../models/Patient';

export interface ServiceResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

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

  async getAllPatients(): Promise<ServiceResponse<Patient[]>> {
    try {
      const patients = await this.patients;
      return {
        success: true,
        message: '✅ Patients retrieved successfully',
        data: patients,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to retrieve patients: ${error.message}`,
        error,
      };
    }
  }

  async getPatientById(id: string): Promise<ServiceResponse<Patient | null>> {
    try {
      const patient = this.patients.find(p => p.id === id);
      if (patient) {
        return {
          success: true,
          message: '✅ Patient retrieved successfully',
          data: patient,
        };
      }
      return {
        success: false,
        message: '⚠️ Patient not found',
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to retrieve patient: ${error.message}`,
        error,
      };
    }
  }

  async createPatient(patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<Patient>> {
    try {
      const newPatient: Patient = {
        id: Math.random().toString(36).substr(2, 9),
        ...patientData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.patients.push(newPatient);
      return {
        success: true,
        message: `✅ Patient ${newPatient.firstName} ${newPatient.lastName} created successfully!`,
        data: newPatient,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to create patient: ${error.message}`,
        error,
      };
    }
  }

  async updatePatient(id: string, patientData: Partial<Patient>): Promise<ServiceResponse<Patient | null>> {
    try {
      const index = this.patients.findIndex(p => p.id === id);
      if (index === -1) {
        return {
          success: false,
          message: '⚠️ Patient not found',
          data: null,
        };
      }
      
      this.patients[index] = {
        ...this.patients[index],
        ...patientData,
        updatedAt: new Date(),
      };
      
      return {
        success: true,
        message: `✅ Patient ${this.patients[index].firstName} ${this.patients[index].lastName} updated successfully!`,
        data: this.patients[index],
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to update patient: ${error.message}`,
        error,
      };
    }
  }

  async deletePatient(id: string): Promise<ServiceResponse<void>> {
    try {
      const initialLength = this.patients.length;
      this.patients = this.patients.filter(p => p.id !== id);
      if (this.patients.length < initialLength) {
        return {
          success: true,
          message: '✅ Patient deleted successfully',
        };
      }
      return {
        success: false,
        message: '⚠️ Patient not found',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to delete patient: ${error.message}`,
        error,
      };
    }
  }
}