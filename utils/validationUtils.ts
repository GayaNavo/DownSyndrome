// Validation Utilities
export class ValidationUtils {
  static isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static isNotEmpty(value: string): boolean {
    return value.trim().length > 0;
  }

  static isDateValid(dateString: string): boolean {
    const date = new Date(dateString);
    return date.toString() !== 'Invalid Date' && !isNaN(date.getTime());
  }

  static isFutureDate(dateString: string): boolean {
    const date = new Date(dateString);
    const today = new Date();
    return date > today;
  }

  static minLength(value: string, length: number): boolean {
    return value.length >= length;
  }

  static maxLength(value: string, length: number): boolean {
    return value.length <= length;
  }
}