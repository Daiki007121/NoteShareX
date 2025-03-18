import jwt from 'jsonwebtoken';
import { getDB, ObjectId } from '../config/db.js';

// Middleware to protect routes
export const protect = async (req, res, next) => {
  let token;

  // Get token from cookies
  if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ message: 'Not authorized, please login' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Check if user exists
    const user = await getDB().collection('users').findOne({ 
      _id: new ObjectId(decoded.id) 
    });
    
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Attach user to request object
    req.user = { id: user._id.toString() };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
