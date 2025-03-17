import bcrypt from 'bcryptjs';
import { getDB, ObjectId } from '../config/db.js';

// Collection name
const COLLECTION = 'users';

// Create a new user
export const createUser = async (userData) => {
  const { username, email, password } = userData;
  
  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const result = await getDB().collection(COLLECTION).insertOne({
    username,
    email,
    password: hashedPassword,
    favorites: [],
    createdAt: new Date()
  });
  
  return { 
    _id: result.insertedId, 
    username, 
    email, 
    favorites: [],
    createdAt: new Date() 
  };
};

// Find user by email
export const findUserByEmail = async (email) => {
  return await getDB().collection(COLLECTION).findOne({ email });
};

// Find user by ID
export const findUserById = async (id) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  return await getDB().collection(COLLECTION).findOne({ _id: new ObjectId(id) });
};

// Find user by username
export const findUserByUsername = async (username) => {
  return await getDB().collection(COLLECTION).findOne({ username });
};

// Compare password
export const comparePassword = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

// Get user without password
export const getUserWithoutPassword = (user) => {
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

// Update user's favorites (add a note)
export const addToFavorites = async (userId, noteId) => {
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(noteId)) {
    return null;
  }
  
  return await getDB().collection(COLLECTION).updateOne(
    { _id: new ObjectId(userId) },
    { $addToSet: { favorites: new ObjectId(noteId) } }
  );
};

// Update user's favorites (remove a note)
export const removeFromFavorites = async (userId, noteId) => {
  if (!ObjectId.isValid(userId) || !ObjectId.isValid(noteId)) {
    return null;
  }
  
  return await getDB().collection(COLLECTION).updateOne(
    { _id: new ObjectId(userId) },
    { $pull: { favorites: new ObjectId(noteId) } }
  );
};

// Get user's favorites
export const getUserFavorites = async (userId) => {
  if (!ObjectId.isValid(userId)) {
    return [];
  }
  
  const user = await getDB().collection(COLLECTION).findOne(
    { _id: new ObjectId(userId) },
    { projection: { favorites: 1 } }
  );
  
  if (!user || !user.favorites || user.favorites.length === 0) {
    return [];
  }
  
  // Get the actual notes
  return await getDB().collection('notes').find(
    { _id: { $in: user.favorites } }
  ).toArray();
};
