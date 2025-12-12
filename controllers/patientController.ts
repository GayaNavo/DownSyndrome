import { Patient } from '../models/Patient';
import { PatientService } from '../services/patientService';
import { BaseController } from './BaseController';

export class PatientController extends BaseController<Patient> {
  private patientService: PatientService;

  constructor() {
    super('Patient');
    this.patientService = new PatientService();
  }

  async getAll(): Promise<Patient[]> {
    try {
      return await this.patientService.getAllPatients();
    } catch (error) {
      this.handleError(error, 'fetch all patients');
    }
  }

  async getById(id: string): Promise<Patient | null> {
    try {
      return await this.patientService.getPatientById(id);
    } catch (error) {
      this.handleError(error, `fetch patient by ID ${id}`);
    }
  }

  async create(data: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>): Promise<Patient> {
    try {
      return await this.patientService.createPatient(data);
    } catch (error) {
      this.handleError(error, 'create patient');
    }
  }

  async update(id: string, data: Partial<Patient>): Promise<Patient | null> {
    try {
      return await this.patientService.updatePatient(id, data);
    } catch (error) {
      this.handleError(error, `update patient ${id}`);
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      return await this.patientService.deletePatient(id);
    } catch (error) {
      this.handleError(error, `delete patient ${id}`);
    }
  }
}