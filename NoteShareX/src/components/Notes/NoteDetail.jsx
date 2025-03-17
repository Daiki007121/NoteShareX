import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './NoteDetail.css';

const NoteDetail = ({ isLoggedIn }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/notes/${id}`);
        
        if (!response.ok) {
          throw new Error('Note not found');
        }
        
        const data = await response.json();
        setNote(data);
        
        // Check if this note is in user's favorites
        if (isLoggedIn) {
          const favResponse = await fetch('/api/users/me/favorites');
          const favData = await favResponse.json();
          setIsFavorite(favData.favorites.includes(id));
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching note:', error);
        setErrorMessage('Failed to load note. It may have been deleted or you may not have permission to view it.');
        setLoading(false);
      }
    };

    fetchNote();
  }, [id, isLoggedIn]);

  const handleUpvote = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/notes/${id}` } });
      return;
    }

    try {
      const response = await fetch(`/api/notes/${id}/upvote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to upvote');
      }

      const updatedNote = await response.json();
      setNote(updatedNote);
    } catch (error) {
      console.error('Error upvoting note:', error);
      setErrorMessage('Failed to upvote. You may have already upvoted this note.');
    }
  };

  const handleFavorite = async () => {
    if (!isLoggedIn) {
      navigate('/login', { state: { from: `/notes/${id}` } });
      return;
    }

    try {
      const method = isFavorite ? 'DELETE' : 'POST';
      const response = await fetch(`/api/users/me/favorites/${id}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update favorites');
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
      setErrorMessage('Failed to update favorites. Please try again later.');
    }
  };

  const handleDelete = async () => {
    if (!isLoggedIn || !note || note.author._id !== 'current-user-id') {
      // Replace 'current-user-id' with actual authentication logic
      setErrorMessage('You do not have permission to delete this note.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this note? This action cannot be undone.')) {
      try {
        const response = await fetch(`/api/notes/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete note');
        }

        navigate('/notes');
      } catch (error) {
        console.error('Error deleting note:', error);
        setErrorMessage('Failed to delete note. Please try again later.');
      }
    }
  };

  if (loading) {
    return <div className="loading">Loading note...</div>;
  }

  if (errorMessage) {
    return (
      <div className="error-container">
        <p className="error-message">{errorMessage}</p>
        <Link to="/notes" className="back-link">Back to Notes</Link>
      </div>
    );
  }

  if (!note) {
    return <div>Note not found</div>;
  }

  const isAuthor = note.author._id === 'current-user-id'; // Replace with actual user ID check

  return (
    <div className="note-detail-container">
      <div className="note-detail-header">
        <h1 className="note-detail-title">{note.title}</h1>
        <div className="note-detail-meta">
          <div className="note-detail-tags">
            <span className="note-detail-course">{note.course}</span>
            {note.topic && <span className="note-detail-topic">{note.topic}</span>}
          </div>
          <div className="note-detail-info">
            <span className="note-detail-author">
              By: {note.author.username}
            </span>
            <span className="note-detail-date">
              {new Date(note.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="note-detail-actions">
        <button 
          className={`upvote-button ${isLoggedIn ? '' : 'disabled'}`}
          onClick={handleUpvote}
          disabled={!isLoggedIn}
        >
          ⭐ Upvote ({note.upvotes})
        </button>
        <button 
          className={`favorite-button ${isFavorite ? 'favorited' : ''} ${isLoggedIn ? '' : 'disabled'}`}
          onClick={handleFavorite}
          disabled={!isLoggedIn}
        >
          {isFavorite ? '❤️ Favorited' : '🤍 Add to Favorites'}
        </button>
        {isAuthor && (
          <div className="author-actions">
            <Link to={`/notes/${id}/edit`} className="edit-note-button">
              Edit
            </Link>
            <button className="delete-note-button" onClick={handleDelete}>
              Delete
            </button>
          </div>
        )}
      </div>

      <div className="note-detail-content">
        {/* Format content with proper paragraph breaks */}
        {note.content.split('\n').map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="note-detail-footer">
        <Link to="/notes" className="back-button">
          Back to Notes
        </Link>
      </div>
    </div>
  );
};

NoteDetail.propTypes = {
  isLoggedIn: PropTypes.bool
};

export default NoteDetail;
