// test-db-connection.js
require('dotenv').config();
const db = require('../config/database');

console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ Set' : '❌ Missing');
console.log('PGUSER:', process.env.PGUSER ? '✅ Set' : '❌ Missing');
console.log('PGPASSWORD:', process.env.PGPASSWORD ? '✅ Set' : '❌ Missing');

// Test database connection
db.healthCheck()
  .then(result => {
    console.log('Database connection successful:', result);
    process.exit(0);
  })
  .catch(error => {
    console.error('Database connection failed:', error);
    process.exit(1);
  });
