import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Routes
import noteRoutes from './routes/noteRoutes.js';
import userRoutes from './routes/userRoutes.js';
import authRoutes from './routes/authRoutes.js';

// Load environment variables
dotenv.config();

// __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express app
const app = express();

// Connect to MongoDB
// Changed: Import getDB and ObjectId
import { connectDB, getDB, ObjectId } from './config/db.js';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// API Routes
app.use('/api/notes', noteRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

// Added: Database initialization function to ensure course data exists
async function ensureBasicCourses() {
  try {
    const db = getDB();
    const courses = await db.collection('notes').distinct('course');
    
    // If no courses exist, create sample notes with basic courses
    if (!courses || courses.length === 0) {
      const basicCourses = [
        'Computer Science', 'Mathematics', 'Physics', 'Biology', 'Chemistry',
        'Psychology', 'Economics', 'Business', 'Engineering', 'Literature', 'History',
        'Philosophy', 'Sociology', 'Political Science', 'Art History'
      ];
      
      console.log('No courses found. Adding basic courses...');
      
      // Create sample notes for each course
      const notesToInsert = [];
      for (const course of basicCourses) {
        notesToInsert.push({
          title: `Sample ${course} Note`,
          content: `This is a sample note for ${course}.`,
          course: course,
          topic: 'Introduction',
          author: new ObjectId(), // Random ID
          upvotes: 0,
          upvotedBy: [],
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
      
      await db.collection('notes').insertMany(notesToInsert);
      console.log('Basic courses added successfully');
    } else {
      console.log('Courses already exist:', courses);
    }
  } catch (error) {
    console.error('Error ensuring basic courses:', error);
  }
}

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../dist')));

  // Any route that's not an API route will be handled by the React app
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../dist', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: err.message || 'Something went wrong on the server',
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack
  });
});

// Changed: Connect to database, initialize courses, then start server
connectDB().then(async () => {
  try {
    // Initialize database with courses
    await ensureBasicCourses();
    
    // Start server
    const PORT = process.env.PORT || 5001;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
});
