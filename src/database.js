const mongoose = require('mongoose');

// Connection string matches user created in seed_database.js
const MONGO_URI = 'mongodb://appuser:apppassword@mongo:27017/utkrusht_store?authSource=utkrusht_store';

let connection = null;

async function connectToDatabase() {
  if (!connection) {
    console.log('[database] Connecting to MongoDB...');
    connection = await mongoose.connect(MONGO_URI, {
      // using basic options suitable for a simple setup
    });
    console.log('[database] MongoDB connection established');
  }
  return connection;
}

module.exports = {
  mongoose,
  connectToDatabase,
};
