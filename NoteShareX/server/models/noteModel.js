import { getDB, ObjectId } from '../config/db.js';

// Collection name
const COLLECTION = 'notes';

// Create a new note
export const createNote = async (noteData) => {
  const { title, content, course, topic, author } = noteData;
  
  const result = await getDB().collection(COLLECTION).insertOne({
    title,
    content,
    course,
    topic,
    author: new ObjectId(author),
    upvotes: 0,
    upvotedBy: [],
    createdAt: new Date(),
    updatedAt: new Date()
  });
  
  return { 
    _id: result.insertedId,
    title,
    content,
    course,
    topic,
    author,
    upvotes: 0,
    createdAt: new Date(),
    updatedAt: new Date()
  };
};

// Get all notes with filters
export const getNotes = async (filters = {}, sortBy = 'recent', page = 1, limit = 10) => {
  const query = {};
  
  if (filters.course) {
    query.course = filters.course;
  }
  
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { content: { $regex: filters.search, $options: 'i' } }
    ];
  }
  
  // Build sort object
  let sortOptions = {};
  
  if (sortBy === 'rating') {
    sortOptions = { upvotes: -1 };
  } else if (sortBy === 'oldest') {
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
  
  const notes = await getDB().collection(COLLECTION)
    .find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(limitNum)
    .toArray();
  
  // Get author info for each note
  const notesWithAuthor = await Promise.all(notes.map(async (note) => {
    const author = await getDB().collection('users').findOne(
      { _id: note.author },
      { projection: { username: 1 } }
    );
    
    return {
      ...note,
      author: author ? { _id: author._id, username: author.username } : { _id: note.author, username: 'Unknown' }
    };
  }));
  
  // Get total count for pagination
  const count = await getDB().collection(COLLECTION).countDocuments(query);
  
  return {
    notes: notesWithAuthor,
    totalPages: Math.ceil(count / limitNum),
    currentPage: pageNum,
    totalNotes: count
  };
};

// Get note by ID
export const getNoteById = async (id) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  const note = await getDB().collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  
  if (!note) {
    return null;
  }
  
  // Get author info
  const author = await getDB().collection('users').findOne(
    { _id: note.author },
    { projection: { username: 1 } }
  );
  
  return {
    ...note,
    author: author ? { _id: author._id, username: author.username } : { _id: note.author, username: 'Unknown' }
  };
};

// Update note
export const updateNote = async (id, noteData, userId) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  // Check if user is the author
  const note = await getDB().collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  
  if (!note) {
    return null;
  }
  
  if (note.author.toString() !== userId) {
    return { error: 'Not authorized to update this note' };
  }
  
  const { title, content, course, topic } = noteData;
  
  const result = await getDB().collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
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
  
  return result.value;
};

// Delete note
export const deleteNote = async (id, userId) => {
  if (!ObjectId.isValid(id)) {
    return null;
  }
  
  // Check if user is the author
  const note = await getDB().collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  
  if (!note) {
    return null;
  }
  
  if (note.author.toString() !== userId) {
    return { error: 'Not authorized to delete this note' };
  }
  
  const result = await getDB().collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
  
  // Remove this note from all users' favorites
  await getDB().collection('users').updateMany(
    { favorites: new ObjectId(id) },
    { $pull: { favorites: new ObjectId(id) } }
  );
  
  return result;
};

// Upvote a note
export const upvoteNote = async (id, userId) => {
  if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) {
    return null;
  }
  
  // Check if note exists
  const note = await getDB().collection(COLLECTION).findOne({ _id: new ObjectId(id) });
  
  if (!note) {
    return null;
  }
  
  // Check if user has already upvoted
  if (note.upvotedBy && note.upvotedBy.some(id => id.toString() === userId)) {
    return { error: 'You have already upvoted this note' };
  }
  
  // Don't allow author to upvote their own note
  if (note.author.toString() === userId) {
    return { error: 'You cannot upvote your own note' };
  }
  
  // Add user to upvotedBy array and increment upvotes
  const result = await getDB().collection(COLLECTION).findOneAndUpdate(
    { _id: new ObjectId(id) },
    {
      $addToSet: { upvotedBy: new ObjectId(userId) },
      $inc: { upvotes: 1 }
    },
    { returnDocument: 'after' }
  );
  
  return result.value;
};

// Get available courses
export const getCourses = async () => {
  const courses = await getDB().collection(COLLECTION).distinct('course');
  return courses;
};

// Get notes by author
export const getNotesByAuthor = async (authorId) => {
  if (!ObjectId.isValid(authorId)) {
    return [];
  }
  
  return await getDB().collection(COLLECTION)
    .find({ author: new ObjectId(authorId) })
    .sort({ createdAt: -1 })
    .toArray();
};
