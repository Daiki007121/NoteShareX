# NoteShareX Design Document

## Project Description

NoteShareX is an academic notes sharing platform designed to help students share and discover quality study materials. The platform allows users to create, browse, upvote, and favorite notes across various academic disciplines. 

## Overview

NoteShare is a platform allowing students to share and discover academic notes. The platform enables users to upload notes organized by courses, search for study materials, and rate helpful content. This approach creates a collaborative ecosystem where students can both contribute and benefit from shared knowledge.

## User Personas

### 1. Alex, the Dedicated Note-Taker
- **Age:** 20
- **Occupation:** Junior student
- **Goals:** Takes detailed notes in all classes and wants an efficient way to share them with peers while gaining recognition for quality contributions
- **Pain Points:** Lacks an organized platform to share meticulously created notes, seeks validation for hard work
- **Behaviors:** Regularly attends all lectures, spends time organizing and formatting notes, enjoys helping peers understand difficult concepts

### 2. Morgan, the Last-Minute Studier
- **Age:** 21
- **Occupation:** Student balancing academics with extracurricular activities
- **Goals:** Needs quick access to reliable notes before exams, especially for missed lectures
- **Pain Points:** Limited time to create comprehensive notes, struggles to identify quality materials when cramming
- **Behaviors:** Studies intensively before deadlines, relies on supplementary materials to fill knowledge gaps, values efficiency and clarity

### 3. Jamie, the International Exchange Student
- **Age:** 22
- **Occupation:** Exchange student from abroad
- **Goals:** Overcome language barriers through locally created notes that explain concepts in more accessible ways
- **Pain Points:** Difficulty following lectures in non-native language, needs culturally relevant explanations of concepts
- **Behaviors:** Actively seeks multiple explanations of complex topics, benefits from notes with visual elements, appreciates simplified language

## User Stories

### For Alex (Dedicated Note-Taker)
1. As a dedicated note-taker, I want to upload my detailed lecture notes so that I can help others understand complex topics.
2. As a dedicated note-taker, I want to receive recognition for my contributions so that I feel motivated to continue sharing quality content.
3. As a dedicated note-taker, I want to organize my notes by course and topic so that they are easily discoverable by other students.

### For Morgan (Last-Minute Studier)
1. As a last-minute studier, I want to quickly search for specific topics so that I can efficiently fill gaps in my knowledge before exams.
2. As a last-minute studier, I want to save favorite notes so that I can easily access them later for exam preparation.
3. As a last-minute studier, I want to see the most highly-rated notes first so that I don't waste time on low-quality content.

### For Jamie (International Exchange Student)
1. As an international student, I want to find notes created by local students so that I can understand concepts explained in more accessible language.
2. As an international student, I want to contribute notes from my unique perspective so that I can help others with different viewpoints.
3. As an international student, I want to search for notes in specific subjects where I struggle with terminology.

## Core Features

### 1. Note Management
- Create, edit, and delete text-based notes
- Categorize notes by course and topic
- View notes in a clean, readable format
- Support for basic formatting and organization

### 2. Simple Search
- Filter notes by course or keyword
- Sort by date or rating
- Quick access to recent uploads
- Browse by academic department or subject area

### 3. Basic Rating System
- Upvote helpful notes
- View highest-rated notes
- Build reputation through contributions
- Track popular content across different courses

### 4. User Account
- Simple signup/login
- View personal contribution history
- Save favorite notes
- Track user upvotes and reputation

## Design Mockups

### Homepage



![Homepage Mockup](screenshots/home.png)

The homepage features:
- Clean navigation bar at the top with NoteShare logo and authentication options
- Hero section with welcome message and platform description
- Search functionality with course filtering options
- Grid view of recent and popular notes for easy discovery
- Responsive design for optimal viewing on any device

### Browse Notes Page



![Browse Notes Mockup](screenshots/browse-notes.png)

The browse notes page includes:
- Comprehensive search and filtering system
- Sort options (most recent, highest rated)
- Note cards displaying title, course, preview content, and rating
- Clean grid layout optimized for scanning multiple notes quickly
- "Create Note" button for authenticated users

### Note Detail Page



![Note Detail Mockup](screenshots/notedetail2.png)

The note detail page displays:
- Full note content with clear formatting
- Metadata (author, course, creation date)
- Interaction options (upvote, favorite)
- Author-specific actions (edit, delete) when applicable
- Navigation back to notes listing

### User Profile



![User Profile Mockup](screenshots/userprofile.png)

The user profile includes:
- User identification and join date
- Tabbed interface for created notes and favorites
- Statistics dashboard showing contribution metrics
- Note management interface for personal content
- Responsive layout adapting to different screen sizes

## Technical Architecture

### Frontend
- React for component-based UI development
- React Router for navigation
- CSS modules for component-specific styling
- State management with React Context and hooks

### Backend
- Node.js with Express for API development
- MongoDB for database storage
- JWT for authentication
- RESTful API design

### Data Models

#### User
- _id: ObjectID
- username: String
- email: String
- password: String (hashed)
- favorites: Array of Note references
- createdAt: Date

#### Note
- _id: ObjectID
- title: String
- content: String
- course: String
- topic: String
- author: User reference
- upvotes: Number
- upvotedBy: Array of User references
- createdAt: Date
- updatedAt: Date

## Future Enhancements

- Rich text editor with support for mathematical formulas
- File attachments for notes (PDFs, images)
- Collaborative note editing
- Comment system for discussions
- Advanced search with natural language processing
- Mobile application

This design document serves as the foundation for developing NoteShareX, defining the project scope, target users, and core functionality that will guide the implementation process.
