import express from 'express';
import * as userController from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Current user profile and notes
router.get('/me', protect, userController.getCurrentUser);
router.get('/me/notes', protect, userController.getCurrentUserNotes);

// Favorites management
router.get('/me/favorites', protect, userController.getCurrentUserFavorites);
router.post('/me/favorites/:noteId', protect, userController.addToFavorites);
router.delete('/me/favorites/:noteId', protect, userController.removeFromFavorites);

// Public user profiles and notes
router.get('/:username', userController.getUserByUsername);
router.get('/:username/notes', userController.getUserNotesByUsername);

export default router;
