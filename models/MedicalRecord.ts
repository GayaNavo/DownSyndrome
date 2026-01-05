// Medical Record Model
export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  visitDate: Date;
  diagnosis: string;
  treatment: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export class MedicalRecordModel {
  static validate(record: MedicalRecord): boolean {
    return !!record.patientId && !!record.doctorId && !!record.visitDate;
  }
}