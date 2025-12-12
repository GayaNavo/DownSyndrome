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

    it('should return false for a patient missing required fields', () => {
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
  });
});