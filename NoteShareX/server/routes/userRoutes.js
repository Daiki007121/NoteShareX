import express from 'express';
import {
  getCurrentUser,
  getUserByUsername,
  getCurrentUserNotes,
  getUserNotesByUsername,
  getCurrentUserFavorites,
  addToFavorites,
  removeFromFavorites
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Current user profile and notes
router.get('/me', protect, getCurrentUser);
router.get('/me/notes', protect, getCurrentUserNotes);

// Favorites management
router.get('/me/favorites', protect, getCurrentUserFavorites);
router.post('/me/favorites/:noteId', protect, addToFavorites);
router.delete('/me/favorites/:noteId', protect, removeFromFavorites);

// Public user profiles and notes
router.get('/:username', getUserByUsername);
router.get('/:username/notes', getUserNotesByUsername);

export default router;
