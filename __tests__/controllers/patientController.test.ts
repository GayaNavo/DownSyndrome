import { PatientController } from '../../controllers/patientController';
import { PatientService } from '../../services/patientService';
import { Patient } from '../../models/Patient';

// Mock PatientService
jest.mock('../../services/patientService');

describe('PatientController', () => {
  let controller: PatientController;
  let mockService: jest.Mocked<PatientService>;

  beforeEach(() => {
    mockService = new PatientService() as jest.Mocked<PatientService>;
    (PatientService as jest.Mock).mockImplementation(() => mockService);
    controller = new PatientController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAll', () => {
    it('should return all patients', async () => {
      const mockPatients: Patient[] = [
        {
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          dateOfBirth: new Date('2010-05-15'),
          diagnosisDate: new Date('2010-06-20'),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockService.getAllPatients.mockResolvedValue({
        success: true,
        message: '✅ Patients retrieved successfully',
        data: mockPatients,
      });

      const result = await controller.getAll();

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPatients);
      expect(mockService.getAllPatients).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', async () => {
      const error = new Error('Database error');
      mockService.getAllPatients.mockRejectedValue(error);

      // Spy on console.error to verify error handling
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await expect(controller.getAll()).rejects.toThrow('Failed to fetch all patients');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Patient Controller Error'),
        expect.anything()
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getById', () => {
    it('should return a patient by ID', async () => {
      const mockPatient: Patient = {
        id: '1',
        firstName: 'Jane',
        lastName: 'Smith',
        dateOfBirth: new Date('2012-08-22'),
        diagnosisDate: new Date('2012-09-10'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.getPatientById.mockResolvedValue({
        success: true,
        message: '✅ Patient retrieved successfully',
        data: mockPatient,
      });

      const result = await controller.getById('1');

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockPatient);
      expect(mockService.getPatientById).toHaveBeenCalledWith('1');
    });

    it('should return not found for non-existent patient', async () => {
      mockService.getPatientById.mockResolvedValue({
        success: false,
        message: '⚠️ Patient not found',
        data: null,
      });

      const result = await controller.getById('invalid-id');

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new patient', async () => {
      const patientData = {
        firstName: 'Alice',
        lastName: 'Johnson',
        dateOfBirth: new Date('2015-03-20'),
        diagnosisDate: new Date('2015-04-15'),
      };

      const createdPatient: Patient = {
        id: 'generated-id',
        ...patientData,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.createPatient.mockResolvedValue({
        success: true,
        message: '✅ Patient created successfully',
        data: createdPatient,
      });

      const result = await controller.create(patientData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(createdPatient);
      expect(mockService.createPatient).toHaveBeenCalledWith(patientData);
    });
  });

  describe('update', () => {
    it('should update an existing patient', async () => {
      const updateData = { firstName: 'Updated' };
      const updatedPatient: Patient = {
        id: '1',
        firstName: 'Updated',
        lastName: 'Doe',
        dateOfBirth: new Date('2010-05-15'),
        diagnosisDate: new Date('2010-06-20'),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockService.updatePatient.mockResolvedValue({
        success: true,
        message: '✅ Patient updated successfully',
        data: updatedPatient,
      });

      const result = await controller.update('1', updateData);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(updatedPatient);
      expect(mockService.updatePatient).toHaveBeenCalledWith('1', updateData);
    });

    it('should return not found when updating non-existent patient', async () => {
      mockService.updatePatient.mockResolvedValue({
        success: false,
        message: '⚠️ Patient not found',
        data: null,
      });

      const result = await controller.update('invalid-id', { firstName: 'Test' });

      expect(result.success).toBe(false);
      expect(result.data).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete an existing patient', async () => {
      mockService.deletePatient.mockResolvedValue({
        success: true,
        message: '✅ Patient deleted successfully',
      });

      const result = await controller.delete('1');

      expect(result.success).toBe(true);
      expect(mockService.deletePatient).toHaveBeenCalledWith('1');
    });

    it('should return not found when deleting non-existent patient', async () => {
      mockService.deletePatient.mockResolvedValue({
        success: false,
        message: '⚠️ Patient not found',
      });

      const result = await controller.delete('invalid-id');

      expect(result.success).toBe(false);
    });
  });
});
