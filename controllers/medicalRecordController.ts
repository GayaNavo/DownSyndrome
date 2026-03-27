import { MedicalRecord } from '../models/MedicalRecord';
import { MedicalRecordService, ServiceResponse } from '../services/medicalRecordService';
import { BaseController } from './BaseController';

export class MedicalRecordController extends BaseController<MedicalRecord> {
  private medicalRecordService: MedicalRecordService;

  constructor() {
    super('MedicalRecord');
    this.medicalRecordService = new MedicalRecordService();
  }

  async getAll(): Promise<ServiceResponse<MedicalRecord[]>> {
    try {
      return await this.medicalRecordService.getAllRecords();
    } catch (error) {
      this.handleError(error, 'fetch all medical records');
    }
  }

  async getById(id: string): Promise<ServiceResponse<MedicalRecord | null>> {
    try {
      return await this.medicalRecordService.getRecordById(id);
    } catch (error) {
      this.handleError(error, `fetch medical record by ID ${id}`);
    }
  }

  async create(data: Omit<MedicalRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<MedicalRecord>> {
    try {
      return await this.medicalRecordService.createRecord(data);
    } catch (error) {
      this.handleError(error, 'create medical record');
    }
  }

  async update(id: string, data: Partial<MedicalRecord>): Promise<ServiceResponse<MedicalRecord | null>> {
    try {
      return await this.medicalRecordService.updateRecord(id, data);
    } catch (error) {
      this.handleError(error, `update medical record ${id}`);
    }
  }

  async delete(id: string): Promise<ServiceResponse<void>> {
    try {
      return await this.medicalRecordService.deleteRecord(id);
    } catch (error) {
      this.handleError(error, `delete medical record ${id}`);
    }
  }
}