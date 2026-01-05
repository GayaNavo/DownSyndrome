// Error Handler Utility
export class ErrorHandler {
  static handleControllerError(error: unknown, controllerName: string, operation: string): never {
    console.error(`[${controllerName}] Error during ${operation}:`, error);
    
    if (error instanceof Error) {
      throw new Error(`[${controllerName}] ${operation} failed: ${error.message}`);
    } else {
      throw new Error(`[${controllerName}] ${operation} failed: Unknown error occurred`);
    }
  }

  static handleServiceError(error: unknown, serviceName: string, operation: string): never {
    console.error(`[${serviceName}] Error during ${operation}:`, error);
    
    if (error instanceof Error) {
      throw new Error(`[${serviceName}] ${operation} failed: ${error.message}`);
    } else {
      throw new Error(`[${serviceName}] ${operation} failed: Unknown error occurred`);
    }
  }

  static createValidationError(message: string): Error {
    return new Error(`Validation Error: ${message}`);
  }

  static createNotFoundError(entity: string, id: string): Error {
    return new Error(`${entity} with ID ${id} not found`);
  }

  static createDuplicateError(entity: string, field: string, value: string): Error {
    return new Error(`A ${entity} with ${field} '${value}' already exists`);
  }
}