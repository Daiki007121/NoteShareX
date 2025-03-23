# NoteShareX

## Academic Notes Sharing Platform

NoteShareX is a web application designed to help students share and discover academic notes across various courses and subjects.

## NoteShare URL 
The application is deployed at [https://notesharex-production.up.railway.app/](https://notesharex-production.up.railway.app/)

## Author
- Daiki Koike

## Class Link
[CS5610 - Web Development Spring 2025](https://johnguerra.co/classes/webDevelopment_spring_2025/)

## Project Objective
The objective of NoteShareX is to create a collaborative platform where students can share, discover, and upvote academic notes. The platform aims to improve study efficiency by centralizing high-quality study materials and fostering a community of knowledge sharing.

## Screenshots
![NoteShareX Home](screenshots/home.png)
*Home screen of the application*

![NoteShareX Browse Notes](screenshots/browse-notes.png)
*Browse notes page showing various academic notes*

![NoteShareX Note Detail](screenshots/detail-note.png)
*Detailed view of a specific note with content and actions*

![NoteShareX User Profile](screenshots/userprofile.png)
*User profile page displaying user information and contributions*

## Features
- User authentication system (register, login, logout)
- Create, read, update, and delete notes
- Browse notes by course and search by keywords
- Upvote system to highlight quality content
- Save favorite notes for quick access
- User profiles with activity tracking
- Responsive design for desktop and mobile

## Technologies Used
- **Frontend**: React 18.2.0, React Router 6.22.3, CSS
- **Backend**: Node.js, Express 4.21.2
- **Database**: MongoDB 6.14.2 (native driver)
- **Authentication**: JWT 9.0.2, HTTP-only cookies
- **Tools**: Vite 5.1.4, ESLint 8.57.0, Prettier
- **AI Assistance**: Claude Sonnet 3.7 (for documentation and code review)

## Instructions to Build

### Prerequisites
- Node.js (v16+)
- MongoDB (v6+)
- Git

### Installation Steps
1. Clone the repository
   ```
   git clone https://github.com/yourusername/notesharex.git
   cd notesharex
   ```

2. Install dependencies for both frontend and backend
   ```
   npm install
   ```

3. Set up environment variables
   - Create a `.env` file in the server directory based on the `.env.example` template
   - Update the MongoDB connection string and JWT secret

4. Seed the database with sample data
   ```
   npm run seed
   ```

5. Start the development server
   ```
   npm run dev
   ```
   This will run both frontend and backend servers concurrently

6. Build for production
   ```
   npm run build
   ```

7. Access the application
   - Development: http://localhost:5173
   - Backend API: http://localhost:5001/api

## Testing
Test credentials:
- Username: admin
- Password: admin123

## License
This project is licensed under the MIT License - see the LICENSE file for details.
The MIT License is a permissive license that allows for reuse with few restrictions. It permits users to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the software while providing attribution back to the original author.
