// Simple API test script
const axios = require('axios');

const baseURL = 'http://localhost:8080';

// Test API endpoints
async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${baseURL}/api/v1/auth/health`);
    console.log('Health:', healthResponse.data);
    
    // Test users endpoint (should fail without auth)
    console.log('\n2. Testing users endpoint without auth...');
    try {
      const usersResponse = await axios.get(`${baseURL}/api/v1/users`);
      console.log('Users:', usersResponse.data);
    } catch (error) {
      console.log('Expected auth error:', error.response?.status, error.response?.data);
    }
    
    console.log('\nAPI test completed');
  } catch (error) {
    console.error('API test failed:', error.message);
  }
}

testAPI();
