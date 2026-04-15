'use client'

import { useState, useEffect } from 'react'
import { checkModelHealth, checkModelHealthWithRetry } from '@/services/modelApiService'
import { MODEL_CONFIG } from '@/config/model.config'

export default function ModelHealthCheck() {
  const [health, setHealth] = useState<'healthy' | 'offline' | 'checking'>('checking')
  const [details, setDetails] = useState('')

  useEffect(() => {
    checkHealth()

    const interval = setInterval(checkHealth, 10000)
    return () => clearInterval(interval)
  }, [])

  const checkHealth = async () => {
    setHealth('checking')
    setDetails('Checking AI model connection...')
    
    try {
      console.log('Checking health at:', MODEL_CONFIG.API_ENDPOINT.replace('/predict', '/health'))
      
      const isHealthy = await checkModelHealthWithRetry(6, 2000)
      
      if (isHealthy) {
        setHealth('healthy')
        setDetails('✅ AI Model is online and responding!')
      } else {
        setHealth('offline')
        setDetails('❌ AI Model is offline or unreachable. Retrying automatically every 10s.')
      }
    } catch (error: any) {
      setHealth('offline')
      setDetails(`❌ ${error.message || 'Cannot connect to AI model'}`)
    }
  }

  const testPrediction = async () => {
    setDetails('Testing prediction endpoint...')
    
    try {
      // Test with a minimal request
      const response = await fetch(MODEL_CONFIG.API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: '' }),
      })
      
      console.log('Test response:', response.status, await response.text())
      
      if (response.ok) {
        setDetails('✅ Prediction endpoint is working!')
      } else {
        setDetails(`⚠️ Endpoint responded but returned status ${response.status}`)
      }
    } catch (error: any) {
      setDetails(`❌ Test failed: ${error.message}`)
    }
  }

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🤖 AI Model Health Check</h1>
      
      <div className={`p-6 rounded-lg mb-6 ${
        health === 'healthy' ? 'bg-green-100 border-2 border-green-500' :
        health === 'offline' ? 'bg-red-100 border-2 border-red-500' :
        'bg-yellow-100 border-2 border-yellow-500'
      }`}>
        <div className="text-center">
          <div className="text-4xl mb-2">
            {health === 'healthy' ? '✅' : health === 'offline' ? '❌' : '⏳'}
          </div>
          <div className="text-xl font-bold mb-2">
            {health === 'healthy' ? 'AI Model is ONLINE' :
             health === 'offline' ? 'AI Model is OFFLINE' :
             'Checking...'}
          </div>
          <div className="text-gray-700">{details}</div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-100 rounded">
          <h2 className="font-bold mb-2">Configuration:</h2>
          <p className="text-sm"><strong>API Endpoint:</strong> {MODEL_CONFIG.API_ENDPOINT}</p>
          <p className="text-sm"><strong>Timeout:</strong> {MODEL_CONFIG.TIMEOUT}ms</p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={checkHealth}
            disabled={health === 'checking'}
            className="px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            🔄 Check Again
          </button>
          
          <button
            onClick={testPrediction}
            disabled={health !== 'healthy'}
            className="px-6 py-3 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            🧪 Test Prediction
          </button>
        </div>

        {health === 'offline' && (
          <div className="p-4 bg-yellow-100 rounded border border-yellow-300">
            <h3 className="font-bold mb-2">🔧 Troubleshooting Steps:</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Make sure Flask server is running on port 5000</li>
              <li>Check terminal for Flask errors</li>
              <li>Verify Flask is accessible: http://localhost:5000/health</li>
              <li>Restart the Flask server if needed</li>
              <li>Check browser console for detailed error messages</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  )
}
