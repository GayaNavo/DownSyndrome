import { MedicalRecord } from '../models/MedicalRecord';

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

  async getAllRecords(): Promise<MedicalRecord[]> {
    return this.records;
  }

  async getRecordById(id: string): Promise<MedicalRecord | null> {
    const record = this.records.find(r => r.id === id);
    return record || null;
  }

  async createRecord(recordData: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalRecord> {
    const newRecord: MedicalRecord = {
      id: Math.random().toString(36).substr(2, 9),
      ...recordData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.records.push(newRecord);
    return newRecord;
  }

  async updateRecord(id: string, recordData: Partial<MedicalRecord>): Promise<MedicalRecord | null> {
    const index = this.records.findIndex(r => r.id === id);
    if (index === -1) return null;
    
    this.records[index] = {
      ...this.records[index],
      ...recordData,
      updatedAt: new Date(),
    };
    
    return this.records[index];
  }

  async deleteRecord(id: string): Promise<boolean> {
    const initialLength = this.records.length;
    this.records = this.records.filter(r => r.id !== id);
    return this.records.length < initialLength;
  }
}