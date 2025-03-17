import { MongoClient, ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { faker } from '@faker-js/faker';

// Load environment variables
dotenv.config();

// MongoDB connection
const uri = process.env.MONGO_URI || 'mongodb://localhost:27017';
const dbName = 'noteshare';

// Array of courses
const courses = [
  'Computer Science',
  'Mathematics',
  'Physics',
  'Biology',
  'Chemistry',
  'Psychology',
  'Economics',
  'Business',
  'Engineering',
  'Literature',
  'History',
  'Philosophy',
  'Sociology',
  'Political Science',
  'Art History'
];

// Array of topics
const topics = {
  'Computer Science': ['Algorithms', 'Data Structures', 'Machine Learning', 'Web Development', 'Databases', 'Operating Systems', 'Computer Networks'],
  'Mathematics': ['Calculus', 'Linear Algebra', 'Probability', 'Statistics', 'Discrete Math', 'Number Theory', 'Real Analysis'],
  'Physics': ['Mechanics', 'Thermodynamics', 'Quantum Physics', 'Electromagnetism', 'Relativity', 'Nuclear Physics'],
  'Biology': ['Genetics', 'Ecology', 'Cell Biology', 'Anatomy', 'Evolution', 'Microbiology', 'Neuroscience'],
  'Chemistry': ['Organic Chemistry', 'Inorganic Chemistry', 'Physical Chemistry', 'Biochemistry', 'Analytical Chemistry'],
  'Psychology': ['Cognitive Psychology', 'Developmental Psychology', 'Social Psychology', 'Clinical Psychology', 'Abnormal Psychology'],
  'Economics': ['Microeconomics', 'Macroeconomics', 'International Economics', 'Behavioral Economics', 'Econometrics'],
  'Business': ['Marketing', 'Finance', 'Management', 'Entrepreneurship', 'Accounting', 'Business Ethics'],
  'Engineering': ['Mechanical Engineering', 'Electrical Engineering', 'Civil Engineering', 'Chemical Engineering', 'Software Engineering'],
  'Literature': ['American Literature', 'British Literature', 'World Literature', 'Poetry', 'Drama', 'Literary Theory'],
  'History': ['Ancient History', 'Medieval History', 'Modern History', 'World Wars', 'American History', 'European History'],
  'Philosophy': ['Ethics', 'Epistemology', 'Metaphysics', 'Logic', 'Political Philosophy', 'Existentialism'],
  'Sociology': ['Social Theory', 'Cultural Sociology', 'Urban Sociology', 'Global Sociology', 'Family Studies'],
  'Political Science': ['International Relations', 'Comparative Politics', 'Political Theory', 'Public Policy', 'Government Systems'],
  'Art History': ['Renaissance Art', 'Modern Art', 'Contemporary Art', 'Ancient Art', 'Architecture', 'Sculpture']
};

// Connect to MongoDB and seed data
async function seedDatabase() {
  let client;
  
  try {
    client = new MongoClient(uri);
    await client.connect();
    console.log('MongoDB connected for seeding');
    
    const db = client.db(dbName);
    
    // Clear existing data
    await db.collection('users').deleteMany({});
    await db.collection('notes').deleteMany({});
    
    console.log('Existing data cleared');
    
    // Generate users
    const users = await generateUsers(db, 50);
    console.log(`${users.length} users inserted`);
    
    // Generate notes
    const notesCount = await generateNotes(db, users, 1000);
    console.log(`${notesCount} notes inserted`);
    
    // Add some random favorites to users
    await addRandomFavorites(db, users);
    console.log('Random favorites added to users');
    
    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    if (client) {
      await client.close();
    }
    process.exit();
  }
}

// Generate users
async function generateUsers(db, count) {
  const users = [];
  
  // Create a fixed admin user for testing
  const adminPassword = await bcrypt.hash('admin123', 10);
  const adminUser = {
    username: 'admin',
    email: 'admin@example.com',
    password: adminPassword,
    favorites: [],
    createdAt: new Date()
  };
  
  await db.collection('users').insertOne(adminUser);
  users.push(adminUser);
  
  // Generate random users
  const randomUsers = [];
  for (let i = 1; i < count; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    const username = `${firstName.toLowerCase()}${lastName.substring(0, 2).toLowerCase()}${Math.floor(Math.random() * 100)}`;
    
    const password = await bcrypt.hash('password123', 10);
    
    randomUsers.push({
      username,
      email: faker.internet.email({ firstName, lastName }),
      password,
      favorites: [],
      createdAt: faker.date.past({ years: 2 })
    });
  }
  
  if (randomUsers.length > 0) {
    await db.collection('users').insertMany(randomUsers);
    users.push(...randomUsers);
  }
  
  // Get users with _id
  return await db.collection('users').find({}).toArray();
}

// Generate notes
async function generateNotes(db, users, count) {
  const batches = [];
  const batchSize = 100; // Insert in batches to avoid memory issues
  
  for (let i = 0; i < count; i += batchSize) {
    const notes = [];
    const currentBatchSize = Math.min(batchSize, count - i);
    
    for (let j = 0; j < currentBatchSize; j++) {
      const randomUser = users[Math.floor(Math.random() * users.length)];
      const randomCourse = courses[Math.floor(Math.random() * courses.length)];
      const randomTopic = topics[randomCourse][Math.floor(Math.random() * topics[randomCourse].length)];
      
      // Generate upvotes
      const upvoteCount = Math.floor(Math.random() * 50);
      const upvotedBy = [];
      
      // Randomly select users who upvoted this note
      const availableUsers = users.filter(user => user._id.toString() !== randomUser._id.toString());
      for (let k = 0; k < upvoteCount && k < availableUsers.length; k++) {
        // Ensure no duplicate upvotes
        const randomUpvoterIndex = Math.floor(Math.random() * availableUsers.length);
        const randomUpvoter = availableUsers[randomUpvoterIndex];
        
        if (!upvotedBy.includes(randomUpvoter._id)) {
          upvotedBy.push(randomUpvoter._id);
          // Remove this user to avoid duplicates
          availableUsers.splice(randomUpvoterIndex, 1);
        }
      }
      
      // Generate created and updated dates
      const createdAt = faker.date.past({ years: 1 });
      const updatedAt = faker.date.between({ from: createdAt, to: new Date() });
      
      notes.push({
        title: faker.lorem.sentence({ min: 4, max: 10 }),
        content: faker.lorem.paragraphs({ min: 3, max: 10 }, '\n\n'),
        course: randomCourse,
        topic: randomTopic,
        author: randomUser._id,
        upvotes: upvotedBy.length,
        upvotedBy,
        createdAt,
        updatedAt
      });
    }
    
    batches.push(notes);
  }
  
  let totalInserted = 0;
  for (const batch of batches) {
    if (batch.length > 0) {
      const result = await db.collection('notes').insertMany(batch);
      totalInserted += result.insertedCount;
    }
  }
  
  return totalInserted;
}

// Add random favorites to users
async function addRandomFavorites(db, users) {
  const notes = await db.collection('notes').find({}).toArray();
  
  for (const user of users) {
    const randomNoteCount = Math.floor(Math.random() * 15);
    const randomNoteIndices = new Set();
    
    // Get random unique notes that the user didn't author
    while (randomNoteIndices.size < randomNoteCount && randomNoteIndices.size < notes.length) {
      const randomIndex = Math.floor(Math.random() * notes.length);
      const note = notes[randomIndex];
      
      if (note.author.toString() !== user._id.toString()) {
        randomNoteIndices.add(randomIndex);
      }
    }
    
    // Add the selected notes to user's favorites
    const favorites = Array.from(randomNoteIndices).map(index => notes[index]._id);
    
    await db.collection('users').updateOne(
      { _id: user._id },
      { $set: { favorites } }
    );
  }
}

// Start seeding
seedDatabase();
