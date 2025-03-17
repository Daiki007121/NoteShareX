import * as userModel from '../models/userModel.js';
import * as noteModel from '../models/noteModel.js';

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await userModel.findUserById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(userModel.getUserWithoutPassword(user));
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by username
// @route   GET /api/users/:username
// @access  Public
export const getUserByUsername = async (req, res, next) => {
  try {
    const user = await userModel.findUserByUsername(req.params.username);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove sensitive data
    const { password, email, ...userWithoutSensitiveData } = user;
    
    res.status(200).json(userWithoutSensitiveData);
  } catch (error) {
    next(error);
  }
};

// @desc    Get notes by current user
// @route   GET /api/users/me/notes
// @access  Private
export const getCurrentUserNotes = async (req, res, next) => {
  try {
    const notes = await noteModel.getNotesByAuthor(req.user.id);
    
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

// @desc    Get notes by username
// @route   GET /api/users/:username/notes
// @access  Public
export const getUserNotesByUsername = async (req, res, next) => {
  try {
    const user = await userModel.findUserByUsername(req.params.username);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const notes = await noteModel.getNotesByAuthor(user._id);
    
    res.status(200).json(notes);
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user's favorite notes
// @route   GET /api/users/me/favorites
// @access  Private
export const getCurrentUserFavorites = async (req, res, next) => {
  try {
    const favorites = await userModel.getUserFavorites(req.user.id);
    
    res.status(200).json(favorites);
  } catch (error) {
    next(error);
  }
};

// @desc    Add note to favorites
// @route   POST /api/users/me/favorites/:noteId
// @access  Private
export const addToFavorites = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    
    // Check if note exists
    const note = await noteModel.getNoteById(noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Add to favorites
    const result = await userModel.addToFavorites(req.user.id, noteId);
    
    if (!result) {
      return res.status(400).json({ message: 'Failed to add to favorites' });
    }
    
    res.status(200).json({ message: 'Note added to favorites' });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove note from favorites
// @route   DELETE /api/users/me/favorites/:noteId
// @access  Private
export const removeFromFavorites = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    
    // Remove from favorites
    const result = await userModel.removeFromFavorites(req.user.id, noteId);
    
    if (!result) {
      return res.status(400).json({ message: 'Failed to remove from favorites' });
    }
    
    res.status(200).json({ message: 'Note removed from favorites' });
  } catch (error) {
    next(error);
  }
};
