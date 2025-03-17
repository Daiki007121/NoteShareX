import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useSearchParams } from 'react-router-dom';
import './NoteList.css';

const NoteList = ({ searchQuery, courseFilter }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('recent'); // 'recent', 'rating'
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Fetch notes from API
    const fetchNotes = async () => {
      try {
        setLoading(true);
        
        // Get values from props or URL search params
        const search = searchQuery || searchParams.get('search') || '';
        const course = courseFilter || searchParams.get('course') || '';
        const sort = searchParams.get('sort') || sortBy;
        
        // Build API URL with query parameters
        let url = '/api/notes';
        const params = new URLSearchParams();
        
        if (search) params.append('search', search);
        if (course) params.append('course', course);
        params.append('sort', sort);
        
        const queryString = params.toString();
        if (queryString) {
          url += `?${queryString}`;
        }
        
        console.log('Fetching notes with URL:', url);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch notes');
        }
        
        const data = await response.json();
        
        // Check the structure of received data
        console.log('Received notes data:', data);
        
        // Extract notes array from response
        const notesArray = data.notes || data;
        
        if (Array.isArray(notesArray)) {
          setNotes(notesArray);
        } else {
          console.error('Expected array of notes but got:', typeof notesArray);
          setNotes([]);
        }
        
        setLoading(false);
        setError('');
      } catch (error) {
        console.error('Error fetching notes:', error);
        setLoading(false);
        setError('Failed to load notes. Please try again later.');
        setNotes([]);
      }
    };

    fetchNotes();
  }, [searchQuery, courseFilter, sortBy, searchParams]);

  const handleSortChange = (event) => {
    const newSortBy = event.target.value;
    setSortBy(newSortBy);
  };

  if (loading) {
    return <div className="loading">Loading notes...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="note-list-container">
      <div className="note-list-header">
        <h2>Notes</h2>
        <div className="note-list-controls">
          <select 
            value={sortBy} 
            onChange={handleSortChange}
            className="sort-selector"
          >
            <option value="recent">Most Recent</option>
            <option value="rating">Highest Rated</option>
          </select>
          <Link to="/notes/new" className="create-note-btn">Create Note</Link>
        </div>
      </div>

      {notes.length === 0 ? (
        <p className="no-notes-message">No notes found. Try a different search or create a new note!</p>
      ) : (
        <div className="notes-grid">
          {notes.map((note) => (
            <div key={note._id} className="note-card">
              <h3 className="note-title">{note.title}</h3>
              <div className="note-meta">
                <span className="note-course">{note.course}</span>
                {note.topic && <span className="note-topic">{note.topic}</span>}
              </div>
              <p className="note-preview">
                {note.content.substring(0, 100)}
                {note.content.length > 100 ? '...' : ''}
              </p>
              <div className="note-footer">
                <span className="note-upvotes">
                  ⭐ {note.upvotes}
                </span>
                <span className="note-date">
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
                <Link to={`/notes/${note._id}`} className="view-note-btn">
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

NoteList.propTypes = {
  searchQuery: PropTypes.string,
  courseFilter: PropTypes.string
};

export default NoteList;
