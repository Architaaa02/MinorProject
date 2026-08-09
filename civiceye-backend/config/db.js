const mongoose = require('mongoose');

/**
 * Establishes the MongoDB connection used as CivicEye's primary data store
 * (Section VI, System Architecture — MongoDB / database layer).
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error('MONGO_URI is not set. Add it to your .env file.');
  }

  mongoose.set('strictQuery', true);

  try {
    const conn = await mongoose.connect(uri, {
      // Modern mongoose (6+) no longer needs useNewUrlParser/useUnifiedTopology,
      // they're accepted here harmlessly for older driver compatibility.
    });
    console.log(`[db] MongoDB connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (err) {
    console.error('[db] MongoDB connection failed:', err.message);
    process.exit(1);
  }
}

module.exports = connectDB;
