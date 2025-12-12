// Utility functions for API handling
export class ApiUtils {
  static async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return response.json();
  }

  static async handleError(error: unknown): Promise<never> {
    console.error('API Error:', error);
    throw new Error(`Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  static createApiResponse<T>(data: T, success: boolean = true, message: string = '') {
    return {
      success,
      message,
      data
    };
  }

  static createError(message: string, errorCode: string = 'UNKNOWN_ERROR') {
    return {
      success: false,
      message,
      errorCode
    };
  }
}