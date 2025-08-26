// test-api.js - Simple API testing script
const baseUrl = 'http://localhost:8888';

// Test different API endpoints
const tests = [
  {
    name: 'Search for "ticket"',
    url: `${baseUrl}/api?s=ticket`
  },
  {
    name: 'Search for "Spiel des Jahres"',
    url: `${baseUrl}/api?s=Spiel%20des%20Jahres`
  },
  {
    name: 'Get award by ID',
    url: `${baseUrl}/api?i=8783`
  },
  {
    name: 'Search by title',
    url: `${baseUrl}/api?t=Hare`
  },
  {
    name: 'Health check',
    url: `${baseUrl}/health`
  }
];

async function testEndpoint(test) {
  try {
    console.log(`\n🧪 Testing: ${test.name}`);
    console.log(`📍 URL: ${test.url}`);
    
    const response = await fetch(test.url);
    const data = await response.json();
    
    console.log(`✅ Status: ${response.status}`);
    
    if (data.Response === "True") {
      console.log(`📊 Results: ${data.totalResults || 1} found`);
      if (data.title) console.log(`🎯 Title: ${data.title}`);
    } else if (data.Response === "False") {
      console.log(`❌ Error: ${data.Error}`);
    } else {
      console.log(`📄 Response:`, JSON.stringify(data, null, 2).substring(0, 200) + '...');
    }
    
  } catch (error) {
    console.log(`❌ Failed: ${error.message}`);
  }
}

async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  for (const test of tests) {
    await testEndpoint(test);
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  console.log('\n✨ Tests completed!');
}

runTests();
