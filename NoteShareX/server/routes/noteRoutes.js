import express from 'express';
import { 
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  upvoteNote,
  getCourses
} from '../controllers/noteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Get all notes (with filters) and create new note
router
  .route('/')
  .get(getNotes)
  .post(protect, createNote);

// Get courses list for filtering
router.get('/courses', getCourses);

// Get, update, and delete note by ID
router
  .route('/:id')
  .get(getNoteById)
  .put(protect, updateNote)
  .delete(protect, deleteNote);

// Upvote a note
router.post('/:id/upvote', protect, upvoteNote);

export default router;
