#!/usr/bin/env node

const axios = require('axios');

const BASE_URL = 'http://localhost:3000';

async function testAPI() {
  console.log('🎲 Testing Game Awards API...\n');

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
      name: 'Get Awards for Hare & Tortoise (BGG ID 361)',
      url: `${BASE_URL}/api/?bgg_id=361`
    },
    {
      name: 'Search by Title',
      url: `${BASE_URL}/api/?t=winner&year=2020`
    },
    {
      name: 'Get All Award Sets',
      url: `${BASE_URL}/api/awards`
    },
    {
      name: 'Get All Categories',
      url: `${BASE_URL}/api/categories`
    },
    {
      name: 'Get Awards by Year',
      url: `${BASE_URL}/api/years/2020`
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
      
      const response = await axios.get(test.url, { timeout: 5000 });
      const data = response.data;
      
      console.log(`✅ Status: ${response.status}`);
      
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
      } else {
        console.log(`❌ Response: ${data.Error}`);
      }
      
    } catch (error) {
      if (error.response) {
        console.log(`❌ HTTP ${error.response.status}: ${error.response.statusText}`);
      } else {
        console.log(`❌ Error: ${error.message}`);
      }
    }
    
    console.log('---\n');
  }

  console.log('🎯 API Testing Complete!');
}

if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = testAPI;
