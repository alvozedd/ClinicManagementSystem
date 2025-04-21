const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

const connectDB = async () => {
  try {
    // Create an in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();
    
    // Connect to the in-memory database
    const conn = await mongoose.connect(mongoUri);
    
    console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongoServer) {
      await mongoServer.stop();
    }
    console.log('MongoDB Memory Server Disconnected');
  } catch (error) {
    console.error(`Error disconnecting: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB, disconnectDB };
