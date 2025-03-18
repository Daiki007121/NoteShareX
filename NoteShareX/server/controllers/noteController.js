import { getDB, ObjectId } from '../config/db.js';

// @desc    Get all notes (with filters and pagination)
// @route   GET /api/notes
// @access  Public
export const getNotes = async (req, res, next) => {
  try {
    const { course, search, page = 1, limit = 10, sort = 'recent' } = req.query;
    
    // Build query
    const query = {};
    
    if (course) {
      query.course = course;
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Build sort object
    let sortOptions = {};
    
    if (sort === 'rating') {
      sortOptions = { upvotes: -1 };
    } else if (sort === 'oldest') {
      sortOptions = { createdAt: 1 };
    } else {
      // Default to most recent
      sortOptions = { createdAt: -1 };
    }
    
    // Convert page and limit to numbers
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    
    // Execute query with pagination
    const skip = (pageNum - 1) * limitNum;
    
    const notes = await getDB().collection('notes')
      .find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .toArray();
    
    // Get total count for pagination
    const count = await getDB().collection('notes').countDocuments(query);
    
    res.status(200).json({
      notes,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalNotes: count
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get note by ID
// @route   GET /api/notes/:id
// @access  Public
export const getNoteById = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    
    const note = await getDB().collection('notes').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
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
    
    const note = {
      title,
      content,
      course,
      topic,
      author: new ObjectId(req.user.id),
      upvotes: 0,
      upvotedBy: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const result = await getDB().collection('notes').insertOne(note);
    
    res.status(201).json({
      _id: result.insertedId,
      ...note
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/notes/:id
// @access  Private
export const updateNote = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    
    const { title, content, course, topic } = req.body;
    
    // Check if note exists and user is the author
    const note = await getDB().collection('notes').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Check if user is the author
    if (note.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to update this note' });
    }
    
    const updatedNote = await getDB().collection('notes').findOneAndUpdate(
      { _id: new ObjectId(req.params.id) },
      { 
        $set: { 
          title, 
          content, 
          course, 
          topic,
          updatedAt: new Date() 
        } 
      },
      { returnDocument: 'after' }
    );
    
    res.status(200).json(updatedNote.value);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete note
// @route   DELETE /api/notes/:id
// @access  Private
export const deleteNote = async (req, res, next) => {
  try {
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID format' });
    }
    
    // Check if note exists and user is the author
    const note = await getDB().collection('notes').findOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Check if user is the author
    if (note.author.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized to delete this note' });
    }
    
    await getDB().collection('notes').deleteOne({ 
      _id: new ObjectId(req.params.id) 
    });
    
    // Remove note from all users' favorites
    await getDB().collection('users').updateMany(
      { favorites: new ObjectId(req.params.id) },
      { $pull: { favorites: new ObjectId(req.params.id) } }
    );
    
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
    console.log('Upvote request for note ID:', req.params.id, 'by user:', req.user.id);
    
    // Check if ID is valid ObjectId format
    if (!ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid note ID' });
    }
    
    const noteId = new ObjectId(req.params.id);
    const userId = new ObjectId(req.user.id);
    
    // Check if note exists
    const note = await getDB().collection('notes').findOne({ _id: noteId });
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    
    // Handle case where author field might be string or ObjectId
    let authorId;
    if (typeof note.author === 'string') {
      authorId = note.author;
    } else if (note.author instanceof ObjectId) {
      authorId = note.author.toString();
    } else if (note.author && note.author._id) {
      authorId = note.author._id.toString();
    }
    
    // Prevent authors from upvoting their own notes
    if (authorId === req.user.id) {
      return res.status(400).json({ message: 'You cannot upvote your own note' });
    }
    
    // Initialize upvotedBy array if it doesn't exist
    if (!note.upvotedBy) {
      await getDB().collection('notes').updateOne(
        { _id: noteId },
        { $set: { upvotedBy: [] } }
      );
    }
    
    // Check if user has already upvoted
    const upvotedBy = Array.isArray(note.upvotedBy) ? note.upvotedBy : [];
    
    const hasUpvoted = upvotedBy.some(id => {
      if (typeof id === 'string') {
        return id === req.user.id;
      } else if (id instanceof ObjectId) {
        return id.toString() === req.user.id;
      }
      return false;
    });
    
    if (hasUpvoted) {
      return res.status(400).json({ message: 'You have already upvoted this note' });
    }
    
    // Add upvote
    const result = await getDB().collection('notes').findOneAndUpdate(
      { _id: noteId },
      { 
        $addToSet: { upvotedBy: userId },
        $inc: { upvotes: 1 }
      },
      { returnDocument: 'after' }
    );
    
    if (!result.value) {
      return res.status(500).json({ message: 'Failed to upvote note' });
    }
    
    // Return updated note
    res.status(200).json(result.value);
  } catch (error) {
    console.error('Upvote error:', error);
    next(error);
  }
};

// @desc    Get available courses
// @route   GET /api/notes/courses
// @access  Public
export const getCourses = async (req, res, next) => {
  try {
    // Aggregate unique course names from notes
    const courses = await getDB().collection('notes').distinct('course');
    
    res.status(200).json(courses);
  } catch (error) {
    next(error);
  }
};
