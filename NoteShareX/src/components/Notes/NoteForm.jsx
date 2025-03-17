import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useParams } from 'react-router-dom';
import './NoteForm.css';

const NoteForm = ({ isEdit = false }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [formData, setFormData] = useState({
    title: '',
    course: '',
    topic: '',
    content: ''
  });
  const [courseOptions, setCourseOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    // Fetch course list for dropdown
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/courses');
        const data = await response.json();
        setCourseOptions(data);
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Use fallback default courses
        setCourseOptions([
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
          'History'
        ]);
      }
    };

    fetchCourses();

    // If editing, fetch the note data
    if (isEdit && id) {
      const fetchNote = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/notes/${id}`);
          
          if (!response.ok) {
            throw new Error('Note not found or you do not have permission to edit it');
          }
          
          const noteData = await response.json();
          setFormData({
            title: noteData.title,
            course: noteData.course,
            topic: noteData.topic || '',
            content: noteData.content
          });
          setLoading(false);
        } catch (error) {
          console.error('Error fetching note:', error);
          setError('Failed to load note. It may have been deleted or you may not have permission to edit it.');
          setLoading(false);
        }
      };

      fetchNote();
    }
  }, [isEdit, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.title.trim() || !formData.course.trim() || !formData.content.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const url = isEdit ? `/api/notes/${id}` : '/api/notes';
      const method = isEdit ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save note');
      }

      const data = await response.json();
      setSuccessMessage(isEdit ? 'Note updated successfully!' : 'Note created successfully!');
      
      // Redirect after a short delay to show success message
      setTimeout(() => {
        navigate(`/notes/${data._id}`);
      }, 1500);
    } catch (error) {
      console.error('Error saving note:', error);
      setError(error.message || 'Failed to save note. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
    return <div className="loading">Loading note data...</div>;
  }

  return (
    <div className="note-form-container">
      <h1 className="note-form-title">{isEdit ? 'Edit Note' : 'Create New Note'}</h1>
      
      {error && <div className="note-form-error">{error}</div>}
      {successMessage && <div className="note-form-success">{successMessage}</div>}
      
      <form onSubmit={handleSubmit} className="note-form">
        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Enter a descriptive title"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="course">Course *</label>
          <select
            id="course"
            name="course"
            value={formData.course}
            onChange={handleChange}
            required
          >
            <option value="">Select a course</option>
            {courseOptions.map((course, index) => (
              <option key={index} value={typeof course === 'string' ? course : course.name}>
                {typeof course === 'string' ? course : course.name}
              </option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="topic">Topic</label>
          <input
            type="text"
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleChange}
            placeholder="Specific topic (optional)"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="content">Content *</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Write your note content here..."
            rows="10"
            required
          ></textarea>
        </div>
        
        <div className="form-actions">
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => navigate(isEdit ? `/notes/${id}` : '/notes')}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? 'Saving...' : isEdit ? 'Update Note' : 'Create Note'}
          </button>
        </div>
      </form>
    </div>
  );
};

NoteForm.propTypes = {
  isEdit: PropTypes.bool
};

export default NoteForm;
