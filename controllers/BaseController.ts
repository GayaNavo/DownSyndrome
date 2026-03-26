// Base Controller Class
import { ServiceResponse } from '../services/patientService';

export abstract class BaseController<T> {
  protected modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  abstract getAll(): Promise<ServiceResponse<T[]>>;
  abstract getById(id: string): Promise<ServiceResponse<T | null>>;
  abstract create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<ServiceResponse<T>>;
  abstract update(id: string, data: Partial<T>): Promise<ServiceResponse<T | null>>;
  abstract delete(id: string): Promise<ServiceResponse<void>>;

  protected handleError(error: unknown, operation: string): never {
    console.error(`${this.modelName} Controller Error - ${operation}:`, error);
    throw new Error(`Failed to ${operation} ${this.modelName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}