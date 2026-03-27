import { MedicalRecordController } from '../../controllers/medicalRecordController';
import { MedicalRecordService } from '../../services/medicalRecordService';
import { MedicalRecord } from '../../models/MedicalRecord';

jest.mock('../../services/medicalRecordService');

describe('MedicalRecordController', () => {
  let controller: MedicalRecordController;
  let mockService: jest.Mocked<MedicalRecordService>;

  beforeEach(() => {
    mockService = new MedicalRecordService() as jest.Mocked<MedicalRecordService>;
    (MedicalRecordService as jest.Mock).mockImplementation(() => mockService);
    controller = new MedicalRecordController();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should unwrap data from service response with getAllData', async () => {
    const mockRecords: MedicalRecord[] = [
      {
        id: '1',
        patientId: '1',
        doctorId: 'doc1',
        visitDate: new Date('2023-01-15'),
        diagnosis: 'Routine checkup',
        treatment: 'Vitamin supplements',
        notes: 'Patient improved',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockService.getAllRecords.mockResolvedValue({ success: true, message: 'ok', data: mockRecords });

    const result = await controller.getAllData();

    expect(result).toEqual(mockRecords);
    expect(mockService.getAllRecords).toHaveBeenCalledTimes(1);
  });

  it('should throw when getAllData receives unsuccessful response', async () => {
    mockService.getAllRecords.mockResolvedValue({ success: false, message: 'fail', data: [] });

    await expect(controller.getAllData()).rejects.toThrow('fail');
  });
});