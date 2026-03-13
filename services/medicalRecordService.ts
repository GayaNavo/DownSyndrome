import { MedicalRecord } from '../models/MedicalRecord';

export interface ServiceResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
}

export class MedicalRecordService {
  private records: MedicalRecord[] = [];

  constructor() {
    // Initialize with some dummy data
    this.records = [
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
  }

  async getAllRecords(): Promise<ServiceResponse<MedicalRecord[]>> {
    try {
      const records = await this.records;
      return {
        success: true,
        message: '✅ Medical records retrieved successfully',
        data: records,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to retrieve medical records: ${error.message}`,
        error,
      };
    }
  }

  async getRecordById(id: string): Promise<ServiceResponse<MedicalRecord | null>> {
    try {
      const record = this.records.find(r => r.id === id);
      if (record) {
        return {
          success: true,
          message: '✅ Medical record retrieved successfully',
          data: record,
        };
      }
      return {
        success: false,
        message: '⚠️ Medical record not found',
        data: null,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to retrieve medical record: ${error.message}`,
        error,
      };
    }
  }

  async createRecord(recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<MedicalRecord>> {
    try {
      const newRecord: MedicalRecord = {
        id: Math.random().toString(36).substr(2, 9),
        ...recordData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.records.push(newRecord);
      return {
        success: true,
        message: `✅ Medical record created successfully for patient!`,
        data: newRecord,
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to create medical record: ${error.message}`,
        error,
      };
    }
  }

  async updateRecord(id: string, recordData: Partial<MedicalRecord>): Promise<ServiceResponse<MedicalRecord | null>> {
    try {
      const index = this.records.findIndex(r => r.id === id);
      if (index === -1) {
        return {
          success: false,
          message: '⚠️ Medical record not found',
          data: null,
        };
      }
      
      this.records[index] = {
        ...this.records[index],
        ...recordData,
        updatedAt: new Date(),
      };
      
      return {
        success: true,
        message: `✅ Medical record updated successfully!`,
        data: this.records[index],
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to update medical record: ${error.message}`,
        error,
      };
    }
  }

  async deleteRecord(id: string): Promise<ServiceResponse<void>> {
    try {
      const initialLength = this.records.length;
      this.records = this.records.filter(r => r.id !== id);
      if (this.records.length < initialLength) {
        return {
          success: true,
          message: '✅ Medical record deleted successfully',
        };
      }
      return {
        success: false,
        message: '⚠️ Medical record not found',
      };
    } catch (error: any) {
      return {
        success: false,
        message: `❌ Failed to delete medical record: ${error.message}`,
        error,
      };
    }
  }
}