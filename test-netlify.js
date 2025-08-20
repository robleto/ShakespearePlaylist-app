#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = process.env.NETLIFY_DEV === 'true' 
  ? 'http://localhost:8888' 
  : 'https://gameawards.netlify.app';

async function testNetlifyAPI() {
  console.log('🎲 Testing Game Awards API on Netlify...\n');
  console.log(`Base URL: ${BASE_URL}\n`);

  const tests = [
    {
      name: 'Health Check',
      url: `${BASE_URL}/health`
    },
    {
      name: 'Get Award by ID',
      url: `${BASE_URL}/api/?i=10865`
    },
    {
      name: 'Search for Spiel des Jahres',
      url: `${BASE_URL}/api/?s=Spiel des Jahres&year=1979`
    },
    {
      name: 'Get Awards for BGG ID 361',
      url: `${BASE_URL}/api/?bgg_id=361`
    },
    {
      name: 'Get All Award Sets',
      url: `${BASE_URL}/.netlify/functions/awards`
    },
    {
      name: 'Get All Categories', 
      url: `${BASE_URL}/.netlify/functions/categories`
    },
    {
      name: 'Search Origins Awards',
      url: `${BASE_URL}/api/?s=Origins`
    },
    {
      name: 'Error Test - No Parameters',
      url: `${BASE_URL}/api/`
    }
  ];

  for (const test of tests) {
    try {
      console.log(`Testing: ${test.name}`);
      console.log(`URL: ${test.url}`);
      
      const response = await axios.get(test.url, { 
        timeout: 10000,
        validateStatus: () => true // Don't throw on 4xx/5xx status codes
      });
      
      console.log(`✅ Status: ${response.status}`);
      
      const data = response.data;
      if (data.Response === "True") {
        console.log(`✅ Response: Success`);
        if (data.totalResults) {
          console.log(`📊 Results: ${data.totalResults}`);
        }
        if (data.awards && data.awards.length > 0) {
          console.log(`🏆 First award: ${data.awards[0].title}`);
        }
        if (data.title) {
          console.log(`🏆 Award: ${data.title}`);
        }
        if (data.awardSets) {
          console.log(`🏆 Award Sets: ${data.awardSets.length}`);
        }
        if (data.categories) {
          console.log(`📋 Categories: ${data.categories.length}`);
        }
      } else if (data.Response === "False") {
        console.log(`❌ Response: ${data.Error}`);
      } else {
        console.log(`ℹ️  Response: ${JSON.stringify(data).substring(0, 100)}...`);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ HTTP ${error.response.status}: ${error.response.statusText}`);
        if (error.response.data) {
          console.log(`❌ Error: ${JSON.stringify(error.response.data).substring(0, 200)}...`);
        }
      } else if (error.code === 'ECONNREFUSED') {
        console.log(`❌ Connection refused - is the server running?`);
      } else {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    console.log('---\n');
  }

  console.log('🎯 Netlify API Testing Complete!');
  
  if (BASE_URL.includes('localhost')) {
    console.log('\n💡 Tip: Run "netlify dev" to test functions locally');
  } else {
    console.log('\n💡 Tip: Set NETLIFY_DEV=true to test against localhost:8888');
  }
}

if (require.main === module) {
  testNetlifyAPI().catch(console.error);
}

module.exports = testNetlifyAPI;
