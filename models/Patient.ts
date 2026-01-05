// Patient Model
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  diagnosisDate: Date;
  guardianId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class PatientModel {
  static validate(patient: Patient): boolean {
    return !!patient.firstName && !!patient.lastName && !!patient.dateOfBirth;
  }
}