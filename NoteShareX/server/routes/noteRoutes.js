import express from 'express';
import * as noteController from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all notes (with filters) and create new note
router
  .route('/')
  .get(noteController.getNotes)
  .post(protect, noteController.createNote);

// Get courses list for filtering
router.get('/courses', noteController.getCourses);

// Get, update, and delete note by ID
router
  .route('/:id')
  .get(noteController.getNoteById)
  .put(protect, noteController.updateNote)
  .delete(protect, noteController.deleteNote);

// Upvote a note
router.post('/:id/upvote', protect, noteController.upvoteNote);

export default router;
