import { MongoClient, ObjectId } from 'mongodb';

// Get MongoDB connection URI from environment variables or use default
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017';
const DB_NAME = 'noteshare';
let db;

// Connect to MongoDB
export const connectDB = async () => {
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    console.log('MongoDB connected successfully');
    db = client.db(DB_NAME);
    return db;
  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  }
};

// Export the database connection and helpers
export const getDB = () => db;
export { ObjectId };
