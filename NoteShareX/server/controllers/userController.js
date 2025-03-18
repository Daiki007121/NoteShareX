import { getDB, ObjectId } from '../config/db.js';

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
export const getCurrentUser = async (req, res, next) => {
  try {
    const user = await getDB().collection('users').findOne({ 
      _id: new ObjectId(req.user.id) 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    res.status(200).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user by username
// @route   GET /api/users/:username
// @access  Public
export const getUserByUsername = async (req, res, next) => {
  try {
    const user = await getDB().collection('users').findOne(
      { username: req.params.username },
      { projection: { password: 0, email: 0 } }
    );
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Get notes by current user
// @route   GET /api/users/me/notes
// @access  Private
export const getCurrentUserNotes = async (req, res, next) => {
  try {
    const notes = await getDB().collection('notes')
      .find({ author: new ObjectId(req.user.id) })
      .sort({ createdAt: -1 })
      .toArray();
    
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
    const user = await getDB().collection('users').findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    const notes = await getDB().collection('notes')
      .find({ author: user._id })
      .sort({ createdAt: -1 })
      .toArray();
    
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
    const user = await getDB().collection('users').findOne({ 
      _id: new ObjectId(req.user.id) 
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Ensure favorites is an array
    const favorites = Array.isArray(user.favorites) ? user.favorites : [];
    
    if (favorites.length === 0) {
      return res.status(200).json([]);
    }
    
    // Get the actual notes
    const favoriteNotes = await getDB().collection('notes')
      .find({ _id: { $in: favorites } })
      .toArray();
    
    res.status(200).json(favoriteNotes);
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
    
    if (!ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    
    // Check if note exists
    const note = await getDB().collection('notes').findOne({ 
      _id: new ObjectId(noteId) 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Add to favorites if not already there
    const result = await getDB().collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $addToSet: { favorites: new ObjectId(noteId) } }
    );
    
    if (result.modifiedCount === 0 && result.matchedCount === 1) {
      return res.status(400).json({ message: 'Note already in favorites' });
    }
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'Note added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    next(error);
  }
};

// @desc    Remove note from favorites
// @route   DELETE /api/users/me/favorites/:noteId
// @access  Private
export const removeFromFavorites = async (req, res, next) => {
  try {
    const noteId = req.params.noteId;
    
    if (!ObjectId.isValid(noteId)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    
    // Remove from favorites
    const result = await getDB().collection('users').updateOne(
      { _id: new ObjectId(req.user.id) },
      { $pull: { favorites: new ObjectId(noteId) } }
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json({ message: 'Note removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    next(error);
  }
};
