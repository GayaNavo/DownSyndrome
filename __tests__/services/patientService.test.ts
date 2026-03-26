import { PatientService } from '../../services/patientService';
import { Patient } from '../../models/Patient';

describe('PatientService', () => {
  let service: PatientService;

  beforeEach(() => {
    service = new PatientService();
  });

  describe('getAllPatients', () => {
    it('should return all patients with success true', async () => {
      const result = await service.getAllPatients();

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.message).toContain('✅');
    });

    it('should return at least one patient', async () => {
      const result = await service.getAllPatients();

      expect(result.data).toBeDefined();
      expect(result.data!.length).toBeGreaterThan(0);
    });
  });

  describe('getPatientById', () => {
    it('should return a patient by valid ID', async () => {
      const result = await service.getPatientById('1');

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.id).toBe('1');
      expect(result.data?.firstName).toBe('John');
    });

    it('should return not found for invalid ID', async () => {
      const result = await service.getPatientById('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
      expect(result.message).toContain('⚠️');
    });
  });

  describe('createPatient', () => {
    it('should create a new patient successfully', async () => {
      const newPatientData = {
        firstName: 'Alice',
        lastName: 'Johnson',
        dateOfBirth: new Date('2015-03-20'),
        diagnosisDate: new Date('2015-04-15'),
        guardianId: 'guardian-123',
      };

      const result = await service.createPatient(newPatientData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.firstName).toBe('Alice');
      expect(result.data?.lastName).toBe('Johnson');
      expect(result.data?.id).toBeDefined();
      expect(result.message).toContain('✅');
    });

    it('should assign an ID to the new patient', async () => {
      const newPatientData = {
        firstName: 'Bob',
        lastName: 'Williams',
        dateOfBirth: new Date('2014-07-10'),
        diagnosisDate: new Date('2014-08-01'),
      };

      const result = await service.createPatient(newPatientData);

      expect(result.data?.id).toBeDefined();
      expect(typeof result.data?.id).toBe('string');
    });

    it('should set createdAt and updatedAt timestamps', async () => {
      const newPatientData = {
        firstName: 'Carol',
        lastName: 'Brown',
        dateOfBirth: new Date('2016-01-05'),
        diagnosisDate: new Date('2016-02-10'),
      };

      const result = await service.createPatient(newPatientData);

      expect(result.data?.createdAt).toBeDefined();
      expect(result.data?.updatedAt).toBeDefined();
      expect(result.data?.createdAt instanceof Date).toBe(true);
    });
  });

  describe('updatePatient', () => {
    it('should update an existing patient', async () => {
      const updateData = {
        firstName: 'Jonathan',
      };

      const result = await service.updatePatient('1', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.firstName).toBe('Jonathan');
      expect(result.data?.id).toBe('1');
      expect(result.message).toContain('✅');
    });

    it('should return not found for non-existent patient', async () => {
      const updateData = {
        firstName: 'Invalid',
      };

      const result = await service.updatePatient('non-existent-id', updateData);

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });

    it('should update the updatedAt timestamp', async () => {
      const beforeUpdate = await service.getPatientById('1');
      const oldUpdatedAt = beforeUpdate.data?.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const updateData = { lastName: 'Updated' };
      const result = await service.updatePatient('1', updateData);

      expect(result.data?.updatedAt).not.toEqual(oldUpdatedAt);
    });
  });

  describe('deletePatient', () => {
    it('should delete an existing patient', async () => {
      const result = await service.deletePatient('1');

      expect(result.success).toBe(true);
      expect(result.message).toContain('✅');

      // Verify patient is deleted
      const getResult = await service.getPatientById('1');
      expect(getResult.success).toBe(false);
      expect(getResult.data).toBeNull();
    });

    it('should return not found for deleting non-existent patient', async () => {
      const result = await service.deletePatient('non-existent-id');

      expect(result.success).toBe(false);
      expect(result.message).toContain('⚠️');
    });

    it('should actually remove the patient from the list', async () => {
      const allBefore = await service.getAllPatients();
      const initialCount = allBefore.data!.length;

      await service.deletePatient('1');

      const allAfter = await service.getAllPatients();
      expect(allAfter.data!.length).toBe(initialCount - 1);
    });
  });
});
