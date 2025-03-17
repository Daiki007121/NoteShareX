import * as noteModel from '../models/noteModel.js';

// @desc    Get all notes (with filters and pagination)
// @route   GET /api/notes
// @access  Public
export const getNotes = async (req, res, next) => {
  try {
    const { course, search, page = 1, limit = 10, sort = 'recent' } = req.query;
    
    // Build filters
    const filters = {};
    
    if (course) {
      filters.course = course;
    }
    
    if (search) {
      filters.search = search;
    }
    
    const result = await noteModel.getNotes(filters, sort, page, limit);
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get note by ID
// @route   GET /api/notes/:id
// @access  Public
export const getNoteById = async (req, res, next) => {
  try {
    const note = await noteModel.getNoteById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new note
// @route   POST /api/notes
// @access  Private
export const createNote = async (req, res, next) => {
  try {
    const { title, content, course, topic } = req.body;
    
    const note = await noteModel.createNote({
      title,
      content,
      course,
      topic,
      author: req.user.id
    });
    
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res, next) => {
  try {
    const { title, content, course, topic } = req.body;
    
    const updatedNote = await noteModel.updateNote(
      req.params.id, 
      { title, content, course, topic }, 
      req.user.id
    );
    
    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    if (updatedNote.error) {
      return res.status(403).json({ message: updatedNote.error });
    }
    
    res.status(200).json(updatedNote);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res, next) => {
  try {
    const result = await noteModel.deleteNote(req.params.id, req.user.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    if (result.error) {
      return res.status(403).json({ message: result.error });
    }
    
    res.status(200).json({ message: 'Note deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Upvote a note
// @route   POST /api/notes/:id/upvote
// @access  Private
export const upvoteNote = async (req, res, next) => {
  try {
    const result = await noteModel.upvoteNote(req.params.id, req.user.id);
    
    if (!result) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    if (result.error) {
      return res.status(400).json({ message: result.error });
    }
    
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

// @desc    Get available courses
// @route   GET /api/courses
// @access  Public
export const getCourses = async (req, res, next) => {
  try {
    const courses = await noteModel.getCourses();
    
    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
};
