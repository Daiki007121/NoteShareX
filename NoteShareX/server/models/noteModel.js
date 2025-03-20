import { getDB, ObjectId } from '../config/db.js';

// Get all notes
export const getNotes = async (queryParams) => {
  // Implementation omitted for brevity
};

// Get note by ID
export const getNoteById = async (id) => {
  // Implementation omitted for brevity
};

// Upvote a note
export const upvoteNote = async (id, userId) => {
  if (!ObjectId.isValid(id) || !ObjectId.isValid(userId)) {
    return { error: 'Invalid ID format' };
  }
  
  const userIdObj = new ObjectId(userId);
  const noteIdObj = new ObjectId(id);
  
  // Get the note
  const note = await getDB().collection('notes').findOne({ _id: noteIdObj });
  
  if (!note) {
    return { error: 'Note not found' };
  }
  
  // Convert author to string for comparison
  let authorIdStr;
  if (typeof note.author === 'string') {
    authorIdStr = note.author;
  } else if (note.author instanceof ObjectId) {
    authorIdStr = note.author.toString();
  } else if (note.author && note.author._id) {
    authorIdStr = note.author._id.toString();
  }
  
  // Prevent upvoting your own note
  if (authorIdStr === userId) {
    return { error: 'You cannot upvote your own note' };
  }
  
  // Ensure upvotedBy is an array
  const upvotedBy = Array.isArray(note.upvotedBy) ? note.upvotedBy : [];
  
  // Check if already upvoted
  const hasUpvoted = upvotedBy.some(id => {
    if (typeof id === 'string') {
      return id === userId;
    } else if (id instanceof ObjectId) {
      return id.toString() === userId;
    }
    return false;
  });
  
  if (hasUpvoted) {
    return { error: 'You have already upvoted this note' };
  }
  
  // Add upvote
  const result = await getDB().collection('notes').findOneAndUpdate(
    { _id: noteIdObj },
    { 
      $addToSet: { upvotedBy: userIdObj },
      $inc: { upvotes: 1 }
    },
    { returnDocument: 'after' }
  );
  
  if (!result.value) {
    return { error: 'Failed to upvote note' };
  }
  
  return result.value;
};
