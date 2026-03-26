"""
Test suite for Flask API endpoints
Run with: pytest test_app.py -v
"""

import pytest
from app import app, mock_prediction


@pytest.fixture
def client():
    """Create a test client for the Flask application"""
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client


@pytest.fixture
def sample_image_data():
    """Sample base64 image data for testing"""
    # This is a minimal valid base64 encoded 1x1 pixel PNG
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='


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
    
    def test_health_check_returns_model_loaded(self, client):
        """Health check should return model_loaded status"""
        response = client.get('/health')
        data = response.get_json()
        assert 'model_loaded' in data
    
    def test_health_check_returns_timestamp(self, client):
        """Health check should return timestamp"""
        response = client.get('/health')
        data = response.get_json()
        assert 'timestamp' in data


class TestRootEndpoint:
    """Tests for / endpoint"""
    
    def test_root_returns_200(self, client):
        """Root endpoint should return status code 200"""
        response = client.get('/')
        assert response.status_code == 200
    
    def test_root_returns_api_name(self, client):
        """Root endpoint should return API name"""
        response = client.get('/')
        data = response.get_json()
        assert 'Down Syndrome Detection API' in data['name']
    
    def test_root_returns_version(self, client):
        """Root endpoint should return version"""
        response = client.get('/')
        data = response.get_json()
        assert 'version' in data
    
    def test_root_returns_endpoints(self, client):
        """Root endpoint should return available endpoints"""
        response = client.get('/')
        data = response.get_json()
        assert 'endpoints' in data


class TestPredictEndpoint:
    """Tests for /predict endpoint"""
    
    def test_predict_missing_image(self, client):
        """Predict should return 400 when no image provided"""
        response = client.post('/predict', json={})
        assert response.status_code == 400
        data = response.get_json()
        assert 'MISSING_IMAGE' in data['code']
    
    def test_predict_with_valid_image(self, client, sample_image_data):
        """Predict should process valid base64 image"""
        response = client.post('/predict', json={'image': sample_image_data})
        assert response.status_code == 200
        data = response.get_json()
        assert 'prediction' in data
        assert 'confidence' in data
        assert data['prediction'] in ['downsyndrome', 'healthy']
    
    def test_predict_returns_features(self, client, sample_image_data):
        """Predict should return feature vector"""
        response = client.post('/predict', json={'image': sample_image_data})
        data = response.get_json()
        assert 'features' in data
        assert 'facialFeatures' in data['features']
        assert 'probability' in data['features']
    
    def test_predict_returns_timestamp(self, client, sample_image_data):
        """Predict should return timestamp"""
        response = client.post('/predict', json={'image': sample_image_data})
        data = response.get_json()
        assert 'timestamp' in data
    
    def test_predict_invalid_base64(self, client):
        """Predict should handle invalid base64 data"""
        response = client.post('/predict', json={'image': 'invalid_base64_data'})
        assert response.status_code == 400
        data = response.get_json()
        assert 'INVALID_IMAGE' in data['code']


class TestMockPrediction:
    """Tests for mock prediction function"""
    
    def test_mock_prediction_returns_dict(self):
        """Mock prediction should return a dictionary"""
        result = mock_prediction()
        assert isinstance(result, dict)
    
    def test_mock_prediction_has_required_fields(self):
        """Mock prediction should have all required fields"""
        result = mock_prediction()
        assert 'prediction' in result
        assert 'confidence' in result
        assert 'detections' in result
    
    def test_mock_prediction_valid_values(self):
        """Mock prediction should have valid prediction values"""
        result = mock_prediction()
        assert result['prediction'] in ['downsyndrome', 'healthy']
        assert 0 <= result['confidence'] <= 1
    
    def test_mock_prediction_detections_format(self):
        """Mock prediction detections should be properly formatted"""
        result = mock_prediction()
        assert isinstance(result['detections'], list)
        assert len(result['detections']) > 0
        detection = result['detections'][0]
        assert 'class' in detection
        assert 'confidence' in detection


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
