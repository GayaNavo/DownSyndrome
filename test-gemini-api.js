/**
 * Quick test to verify Gemini API key is working
 * Run this with Node.js to test the API connection
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testGeminiAPI() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('❌ Error: GEMINI_API_KEY not found in environment');
    console.log('\n📝 Please add this to your .env file:');
    console.log('GEMINI_API_KEY=your_actual_api_key_here');
    return;
  }

  console.log('🔑 Found API Key:', apiKey.substring(0, 15) + '...');
  console.log('\n🧪 Testing Gemini API...\n');

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    console.log('⏳ Sending request to Gemini...\n');

    const result = await model.generateContent(
      'Hello! This is a test. Please respond with just "API Working!" if you receive this.'
    );
    
    const response = await result.response;
    const text = response.text();

    console.log('✅ SUCCESS!\n');
    console.log('🤖 Gemini Response:', text);
    console.log('\n🎉 Your Gemini API integration is working correctly!');

  } catch (error) {
    console.error('❌ FAILED!\n');
    console.error('Error:', error.message);
    
    if (error.message.includes('API_KEY_INVALID')) {
      console.log('\n💡 The API key is invalid. Please:');
      console.log('   1. Visit: https://aistudio.google.com/app/apikey');
      console.log('   2. Create a new API key');
      console.log('   3. Replace it in your .env file');
    } else if (error.message.includes('quota') || error.message.includes('rate limit')) {
      console.log('\n💡 You\'ve hit the rate limit. Wait a minute and try again.');
    } else if (error.message.includes('404') || error.message.includes('NOT_FOUND')) {
      console.log('\n💡 API not enabled. Please:');
      console.log('   1. Visit: https://console.cloud.google.com/apis/library');
      console.log('   2. Enable "Generative Language API"');
      console.log('   3. Wait 5 minutes for propagation');
    }
  }
}

// Run the test
testGeminiAPI();
