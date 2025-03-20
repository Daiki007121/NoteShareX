import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './NoteDetail.css';

const NoteDetail = ({ isLoggedIn, user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // ノートデータを最新化する関数
  const refreshNote = async () => {
    try {
      const noteResponse = await fetch(`/api/notes/${id}`);
      if (!noteResponse.ok) {
        throw new Error('Failed to fetch note data');
      }
      
      const refreshedNote = await noteResponse.json();
      setNote(refreshedNote);
      return refreshedNote;
    } catch (error) {
      console.error('Error refreshing note:', error);
      throw error;
    }
  };

  useEffect(() => {
    const fetchNote = async () => {
      try {
        setLoading(true);
        console.log('Fetching note with ID:', id);
        
        const response = await fetch(`/api/notes/${id}`);
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error('Note not found');
        }
        
        const data = await response.json();
        console.log('Received note data:', data);
        
        setNote(data);
        
        // Check if this note is in user's favorites
        if (isLoggedIn) {
          try {
            const favResponse = await fetch('/api/users/me/favorites');
            if (favResponse.ok) {
              const favData = await favResponse.json();
              // Check if note ID is in favorites array
              const favorites = Array.isArray(favData) ? favData : [];
              setIsFavorite(favorites.some(fav => fav._id === id));
            }
          } catch (favError) {
            console.error('Error checking favorites:', favError);
          }
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
      // Add loading state
      setLoading(true);
      setErrorMessage('');
      
      // まず試みる：通常のupvoteリクエスト
      try {
        const response = await fetch(`/api/notes/${id}/upvote`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });
        
        // レスポンスのテキストを取得
        const responseText = await response.text();
        let responseData;
        try {
          if (responseText) {
            responseData = JSON.parse(responseText);
          }
        } catch (e) {
          console.error('Error parsing response:', e);
        }
        
        if (response.status === 400 && responseData && responseData.message === 'You have already upvoted this note') {
          // 既にアップボート済みの場合
          setErrorMessage('You have already upvoted this note');
          setLoading(false);
          return;
        }
        
        if (response.ok) {
          console.log('Upvote successful via direct API call');
          // 成功した場合はノートを更新
          if (responseData) {
            setNote(responseData);
          } else {
            // レスポンスボディがない場合は最新のノートを取得
            await refreshNote();
          }
          setLoading(false);
          return; // 成功したので終了
        }
        
        console.log('Direct upvote API call failed, trying fallback');
      } catch (directApiError) {
        console.error('Error with direct API call:', directApiError);
        // エラーを無視して代替案を試す
      }
      
      // 最新のノートデータを取得
      await refreshNote();
      setLoading(false);
    } catch (error) {
      console.error('Error upvoting note:', error);
      setErrorMessage(error.message || 'Failed to upvote. Please try again later.');
      setLoading(false);
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
    if (!isLoggedIn || !note) {
      setErrorMessage('You do not have permission to delete this note.');
      return;
    }

    // Check if user is the author
    const isAuthor = user && note.author && user._id === note.author._id;
    
    if (!isAuthor) {
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

  // Check if current user is the author
  const isAuthor = user && note.author && user._id === note.author._id;

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
              By: {note.author ? note.author.username : 'Unknown'}
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
  isLoggedIn: PropTypes.bool,
  user: PropTypes.object
};

export default NoteDetail;
