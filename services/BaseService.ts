// Base Service Class
export abstract class BaseService<T> {
  protected modelName: string;

  constructor(modelName: string) {
    this.modelName = modelName;
  }

  protected handleError(error: unknown, operation: string): never {
    console.error(`${this.modelName} Service Error - ${operation}:`, error);
    throw new Error(`Failed to ${operation} ${this.modelName.toLowerCase()}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}