/**
 * Gemini API Diagnostic Script
 * Run this to check API connectivity and list available models
 */

const https = require('https');

const API_KEY = 'AIzaSyBksqs7o0UnpHBrATW74nz5uz5bm70CTD8';

console.log('🔍 Gemini API Diagnostic Tool\n');
console.log('API Key:', API_KEY.substring(0, 20) + '...\n');

// Test 1: List available models
function listModels() {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models?key=${API_KEY}`,
      method: 'GET',
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('📊 List Models Response:');
        console.log('Status:', res.statusCode);
        
        if (res.statusCode === 200) {
          const models = JSON.parse(data);
          console.log('✅ SUCCESS - Available models:');
          models.models?.forEach(m => {
            console.log(`  - ${m.name} (${m.displayName})`);
          });
          resolve(true);
        } else {
          console.log('❌ FAILED:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Error:', e.message);
      resolve(false);
    });

    req.end();
  });
}

// Test 2: Try generating content with gemini-pro
function testGenerate() {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      contents: [{
        parts: [{
          text: 'Hello! Say "API is working!" if you receive this.'
        }]
      }]
    });

    const options = {
      hostname: 'generativelanguage.googleapis.com',
      path: `/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('\n📝 Generate Content Response:');
        console.log('Status:', res.statusCode);
        
        if (res.statusCode === 200) {
          const response = JSON.parse(data);
          console.log('✅ SUCCESS!');
          console.log('Response:', response.candidates?.[0]?.content?.parts?.[0]?.text);
          resolve(true);
        } else {
          console.log('❌ FAILED:', data);
          resolve(false);
        }
      });
    });

    req.on('error', (e) => {
      console.log('❌ Error:', e.message);
      resolve(false);
    });

    req.write(postData);
    req.end();
  });
}

// Run tests
async function runDiagnostics() {
  console.log('Test 1: Listing available models...\n');
  await listModels();
  
  console.log('\n-------------------------------------------\n');
  
  console.log('Test 2: Testing content generation...\n');
  await testGenerate();
  
  console.log('\n-------------------------------------------\n');
  console.log('Diagnostics complete!');
}

runDiagnostics();
