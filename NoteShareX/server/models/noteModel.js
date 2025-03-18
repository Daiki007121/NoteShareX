// server/models/noteModel.js - update the upvoteNote function

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
  
  // Prevent upvoting your own note
  if (note.author instanceof ObjectId && note.author.equals(userIdObj) || 
      note.author.toString() === userId) {
    return { error: 'You cannot upvote your own note' };
  }
  
  // Normalize upvotedBy array
  const upvotedBy = Array.isArray(note.upvotedBy) ? note.upvotedBy : [];
  
  // Check if already upvoted
  const hasUpvoted = upvotedBy.some(id => 
    (id instanceof ObjectId && id.equals(userIdObj)) || id.toString() === userId
  );
  
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
  
  return result.value;
};
