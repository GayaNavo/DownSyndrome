import { PatientModel } from '../../models/Patient';

describe('PatientModel', () => {
  describe('validate', () => {
    it('should return true for a valid patient', () => {
      const validPatient = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2010-05-15'),
        diagnosisDate: new Date('2010-06-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(PatientModel.validate(validPatient)).toBe(true);
    });

    it('should return false when firstName is missing', () => {
      const invalidPatient = {
        id: '1',
        firstName: '',
        lastName: 'Doe',
        dateOfBirth: new Date('2010-05-15'),
        diagnosisDate: new Date('2010-06-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(PatientModel.validate(invalidPatient as any)).toBe(false);
    });

    it('should return false when lastName is missing', () => {
      const invalidPatient = {
        id: '1',
        firstName: 'John',
        lastName: '',
        dateOfBirth: new Date('2010-05-15'),
        diagnosisDate: new Date('2010-06-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(PatientModel.validate(invalidPatient as any)).toBe(false);
    });

    it('should return false when dateOfBirth is missing', () => {
      const invalidPatient = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: null,
        diagnosisDate: new Date('2010-06-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(PatientModel.validate(invalidPatient as any)).toBe(false);
    });

    it('should return true when guardianId is optional', () => {
      const patientWithoutGuardian = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        dateOfBirth: new Date('2010-05-15'),
        diagnosisDate: new Date('2010-06-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(PatientModel.validate(patientWithoutGuardian)).toBe(true);
    });
  });
});
