// Base Controller Class
export abstract class BaseController<T> {
  protected modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  abstract getAll(): Promise<T[]>;
  abstract getById(id: string): Promise<T | null>;
  abstract create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  abstract update(id: string, data: Partial<T>): Promise<T | null>;
  abstract delete(id: string): Promise<boolean>;

  protected handleError(error: unknown, operation: string): never {
    console.error(`${this.modelName} Controller Error - ${operation}:`, error);
    throw new Error(`Failed to ${operation} ${this.modelName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}