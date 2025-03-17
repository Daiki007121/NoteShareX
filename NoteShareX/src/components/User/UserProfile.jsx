import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link, useParams } from 'react-router-dom';
import './UserProfile.css';

const UserProfile = ({ isCurrentUser = false }) => {
  const { username } = useParams();
  const [user, setUser] = useState(null);
  const [userNotes, setUserNotes] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [activeTab, setActiveTab] = useState('notes');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        
        // Determine the API endpoint based on whether this is the current user's profile
        const userEndpoint = isCurrentUser
          ? '/api/users/me'
          : `/api/users/${username}`;
        
        const response = await fetch(userEndpoint);
        
        if (!response.ok) {
          throw new Error('Failed to load user profile');
        }
        
        const userData = await response.json();
        setUser(userData);
        
        // Fetch user's notes
        const notesResponse = await fetch(`${userEndpoint}/notes`);
        
        if (!notesResponse.ok) {
          throw new Error('Failed to load user notes');
        }
        
        const notesData = await notesResponse.json();
        setUserNotes(notesData);
        
        // Fetch favorites (only if viewing own profile)
        if (isCurrentUser) {
          const favoritesResponse = await fetch(`${userEndpoint}/favorites`);
          
          if (!favoritesResponse.ok) {
            throw new Error('Failed to load favorites');
          }
          
          const favoritesData = await favoritesResponse.json();
          setFavorites(favoritesData);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Could not load user profile. Please try again later.');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [username, isCurrentUser]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  if (loading) {
    return <div className="loading">Loading user profile...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!user) {
    return <div className="not-found">User not found</div>;
  }

  const renderNotes = () => {
    if (userNotes.length === 0) {
      return <p className="no-items">No notes have been created yet.</p>;
    }

    return (
      <div className="notes-grid">
        {userNotes.map((note) => (
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
              <span className="note-upvotes">⭐ {note.upvotes}</span>
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
    );
  };

  const renderFavorites = () => {
    if (!isCurrentUser) {
      return (
        <p className="private-content">
          Favorites are only visible to the account owner.
        </p>
      );
    }

    if (favorites.length === 0) {
      return <p className="no-items">No favorites have been saved yet.</p>;
    }

    return (
      <div className="notes-grid">
        {favorites.map((note) => (
          <div key={note._id} className="note-card">
            <h3 className="note-title">{note.title}</h3>
            <div className="note-meta">
              <span className="note-course">{note.course}</span>
              {note.topic && <span className="note-topic">{note.topic}</span>}
              <span className="note-author">
                by {note.author.username}
              </span>
            </div>
            <p className="note-preview">
              {note.content.substring(0, 100)}
              {note.content.length > 100 ? '...' : ''}
            </p>
            <div className="note-footer">
              <span className="note-upvotes">⭐ {note.upvotes}</span>
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
    );
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <h1 className="profile-username">{user.username}</h1>
          <p className="profile-member-since">
            Member since {new Date(user.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        {isCurrentUser && (
          <div className="profile-actions">
            <Link to="/settings" className="edit-profile-button">
              Edit Profile
            </Link>
          </div>
        )}
      </div>

      <div className="profile-stats">
        <div className="stat-box">
          <div className="stat-value">{userNotes.length}</div>
          <div className="stat-label">Notes</div>
        </div>
        
        <div className="stat-box">
          <div className="stat-value">
            {userNotes.reduce((total, note) => total + note.upvotes, 0)}
          </div>
          <div className="stat-label">Total Upvotes</div>
        </div>
        
        {isCurrentUser && (
          <div className="stat-box">
            <div className="stat-value">{favorites.length}</div>
            <div className="stat-label">Favorites</div>
          </div>
        )}
      </div>

      <div className="profile-content">
        <div className="profile-tabs">
          <button
            className={`tab-button ${activeTab === 'notes' ? 'active' : ''}`}
            onClick={() => handleTabChange('notes')}
          >
            Notes
          </button>
          
          <button
            className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => handleTabChange('favorites')}
            disabled={!isCurrentUser}
          >
            Favorites
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'notes' ? renderNotes() : renderFavorites()}
        </div>
      </div>
    </div>
  );
};

UserProfile.propTypes = {
  isCurrentUser: PropTypes.bool
};

export default UserProfile;
