# Backend Testing Guide

This guide explains how to test the backend components of your Down Syndrome Detection application.

## Overview

Your project has two backend components that can be tested:

1. **Next.js/TypeScript Backend** - Controllers, Services, and Models
2. **Flask API (Python)** - ML inference API for image analysis

---

## 1. TypeScript Backend Tests (Jest)

### Test Files Created

- `__tests__/models/Patient.test.ts` - Model validation tests
- `__tests__/services/patientService.test.ts` - Service layer tests
- `__tests__/controllers/patientController.test.ts` - Controller layer tests

### Running TypeScript Tests

```powershell
# Navigate to project directory
cd e:\SLIIT\Year 3\FYP\Code\DownSyndrome

# Run all tests
npm test

# Run tests in watch mode (auto-reload on changes)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### What's Being Tested

#### Model Tests (`Patient.test.ts`)
- ✅ Valid patient data validation
- ✅ Missing required fields (firstName, lastName, dateOfBirth)
- ✅ Optional fields (guardianId)

#### Service Tests (`patientService.test.ts`)
- ✅ getAllPatients() - Returns all patients with success flag
- ✅ getPatientById() - Returns specific patient or not found
- ✅ createPatient() - Creates new patient with auto-generated ID
- ✅ updatePatient() - Updates existing patient
- ✅ deletePatient() - Removes patient from list

#### Controller Tests (`patientController.test.ts`)
- ✅ getAll() - Delegates to service and returns response
- ✅ getById() - Handles found and not found cases
- ✅ create() - Creates patient through service
- ✅ update() - Updates patient through service
- ✅ delete() - Deletes patient through service
- ✅ Error handling - Proper error propagation

### Test Structure Example

```typescript
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
    });
  });
});
```

---

## 2. Flask API Tests (Pytest)

### Test File Created

- `flask-api/test_app.py` - Complete API endpoint tests

### Running Flask Tests

```powershell
# Navigate to flask-api directory
cd e:\SLIIT\Year 3\FYP\Code\DownSyndrome\flask-api

# Run all tests with verbose output
C:\Python312\python.exe -m pytest test_app.py -v

# Or simply (if pytest is in PATH)
pytest test_app.py -v
```

### What's Being Tested

#### Health Endpoint Tests
- ✅ GET `/health` - Returns 200 status
- ✅ Response contains 'status': 'healthy'
- ✅ Response contains model_loaded status
- ✅ Response contains timestamp

#### Root Endpoint Tests
- ✅ GET `/` - Returns 200 status
- ✅ Response contains API name
- ✅ Response contains version
- ✅ Response contains available endpoints

#### Prediction Endpoint Tests
- ✅ POST `/predict` - Missing image returns 400
- ✅ POST `/predict` - Valid image returns prediction
- ✅ Response contains features vector
- ✅ Response contains timestamp
- ✅ Invalid base64 returns 400

#### Mock Prediction Tests
- ✅ Returns dictionary with required fields
- ✅ Prediction value is valid ('downsyndrome' or 'healthy')
- ✅ Confidence is between 0 and 1
- ✅ Detections list is properly formatted

### Test Structure Example

```python
class TestHealthEndpoint:
    """Tests for /health endpoint"""
    
    def test_health_check_returns_200(self, client):
        """Health check should return status code 200"""
        response = client.get('/health')
        assert response.status_code == 200
    
    def test_health_check_returns_status(self, client):
        """Health check should return health status"""
        response = client.get('/health')
        data = response.get_json()
        assert data['status'] == 'healthy'
```

---

## 3. Manual Testing

### Testing Flask API Manually

#### Start the Flask Server

```powershell
cd e:\SLIIT\Year 3\FYP\Code\DownSyndrome\flask-api
C:\Python312\python.exe app.py
```

#### Test Endpoints with cURL

```powershell
# Health check
curl http://localhost:5000/health

# Root endpoint
curl http://localhost:5000/

# Prediction endpoint (with sample image)
curl -X POST http://localhost:5000/predict ^
  -H "Content-Type: application/json" ^
  -d "{\"image\": \"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==\"}"
```

#### Test with Postman

1. **GET** `http://localhost:5000/health`
2. **GET** `http://localhost:5000/`
3. **POST** `http://localhost:5000/predict`
   - Body (JSON): `{"image": "data:image/jpeg;base64,<YOUR_BASE64>"}`

---

## 4. Adding New Tests

### For TypeScript Backend

1. Create test file in `__tests__/` directory
2. Follow naming convention: `*.test.ts`
3. Use Jest's `describe`, `it`, and `expect` functions
4. Mock dependencies using `jest.mock()`

Example for testing another controller:

```typescript
// __tests__/controllers/userController.test.ts
import { UserController } from '../../controllers/userController';

jest.mock('../../services/userService');

describe('UserController', () => {
  it('should get all users', async () => {
    // Your test here
  });
});
```

### For Flask API

1. Add test class or function to `test_app.py`
2. Use pytest fixtures for reusable setup
3. Use assert statements for expectations

Example for adding new endpoint test:

```python
def test_new_endpoint(self, client):
    """Test new endpoint functionality"""
    response = client.get('/new-endpoint')
    assert response.status_code == 200
    data = response.get_json()
    assert 'key' in data
```

---

## 5. Test Results Summary

### Current Test Coverage

✅ **TypeScript Backend**: 27 tests passed
- Models: 6 tests
- Services: 13 tests  
- Controllers: 8 tests

✅ **Flask API**: 17 tests passed
- Health endpoints: 4 tests
- Root endpoint: 4 tests
- Prediction endpoint: 5 tests
- Mock prediction: 4 tests

**Total: 44 automated tests**

---

## 6. Troubleshooting

### TypeScript Tests Not Running

```powershell
# Ensure dependencies are installed
npm install

# Check Jest configuration
cat jest.config.js
```

### Flask Tests Not Running

```powershell
# Install pytest
pip install pytest

# Verify Flask installation
pip install flask flask-cors
```

### Test Failures

1. Check if mock data matches expected structure
2. Verify ServiceResponse pattern is used consistently
3. Ensure async/await is used correctly
4. Check error messages match actual output

---

## 7. Best Practices

### Writing Good Tests

✅ **DO**:
- Test one thing per test function
- Use descriptive test names
- Test both success and failure cases
- Keep tests independent (no shared state)
- Use beforeEach for setup

❌ **DON'T**:
- Test multiple things in one test
- Use vague names like "test1"
- Only test happy path
- Share state between tests
- Skip error case testing

### Test Naming Convention

**TypeScript**:
```typescript
it('should return all patients with success true', async () => {
  // ...
});

it('should return not found for invalid ID', async () => {
  // ...
});
```

**Python**:
```python
def test_health_check_returns_200(self, client):
    # ...

def test_predict_missing_image(self, client):
    # ...
```

---

## 8. Next Steps

### Expand Test Coverage

1. **Add more model tests**
   - User model validation
   - MedicalRecord model validation
   - AnalysisResult model validation

2. **Add service tests**
   - userService tests
   - medicalRecordService tests
   - analysisResultService tests
   - geminiService tests

3. **Add integration tests**
   - Full workflow tests (controller → service → database)
   - API endpoint integration tests

4. **Add performance tests**
   - Load testing for Flask API
   - Response time benchmarks

### Continuous Integration

Consider setting up:
- GitHub Actions for automatic test running
- Code coverage requirements (e.g., >80%)
- Pre-commit hooks to run tests before commits

---

## Quick Reference

### Run All Tests
```powershell
# TypeScript tests
cd DownSyndrome
npm test

# Flask tests
cd DownSyndrome\flask-api
C:\Python312\python.exe -m pytest test_app.py -v
```

### Watch Mode
```powershell
npm run test:watch
```

### Coverage Report
```powershell
npm run test:coverage
```

### Manual Flask Testing
```powershell
# Start server
python app.py

# Test in browser or Postman
http://localhost:5000/health
```

---

**Happy Testing! 🧪✅**
