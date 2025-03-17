import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate, useLocation } from 'react-router-dom';
import './SearchBar.css';

const SearchBar = ({ onSearch }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [courses, setCourses] = useState([]);
  
  // Parse query parameters on component mount or location change
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const searchParam = queryParams.get('search') || '';
    const courseParam = queryParams.get('course') || '';
    
    setSearchQuery(searchParam);
    setCourseFilter(courseParam);
    
    // onSearch呼び出しを削除（無限ループの原因）
  }, [location.search]); // onSearchを依存配列から削除
  
  // Fetch available courses for the filter dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch('/api/notes/courses');
        if (response.ok) {
          const data = await response.json();
          setCourses(data);
        } else {
          console.error('Failed to fetch courses');
          // Use fallback default courses
          setCourses([
            'Computer Science',
            'Mathematics',
            'Physics',
            'Biology',
            'Chemistry'
          ]);
        }
      } catch (error) {
        console.error('Error fetching courses:', error);
        // Use fallback default courses
        setCourses([
          'Computer Science',
          'Mathematics',
          'Physics',
          'Biology',
          'Chemistry'
        ]);
      }
    };
    
    fetchCourses();
  }, []); // 空の依存配列でマウント時のみ実行
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };
  
  const handleCourseChange = (e) => {
    setCourseFilter(e.target.value);
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Build query string based on filters
    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) {
      queryParams.set('search', searchQuery.trim());
    }
    if (courseFilter) {
      queryParams.set('course', courseFilter);
    }
    
    const queryString = queryParams.toString();
    
    // Navigate to search results with filters as query params
    navigate({
      pathname: '/notes',
      search: queryString ? `?${queryString}` : ''
    });
    
    // Also inform parent component if onSearch prop exists
    if (onSearch) {
      onSearch(searchQuery, courseFilter);
    }
  };
  
  const handleClear = () => {
    setSearchQuery('');
    setCourseFilter('');
    
    // Navigate to notes list without filters
    navigate('/notes');
    
    // Inform parent component if onSearch prop exists
    if (onSearch) {
      onSearch('', '');
    }
  };
  
  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-group">
          <input
            type="text"
            className="search-input"
            placeholder="Search notes by keyword..."
            value={searchQuery}
            onChange={handleSearchChange}
            aria-label="Search notes"
          />
          
          <select
            className="course-filter"
            value={courseFilter}
            onChange={handleCourseChange}
            aria-label="Filter by course"
          >
            <option value="">All Courses</option>
            {courses.map((course, index) => (
              <option 
                key={index} 
                value={typeof course === 'string' ? course : course}
              >
                {typeof course === 'string' ? course : course}
              </option>
            ))}
          </select>
        </div>
        
        <div className="search-button-group">
          <button 
            type="button" 
            className="clear-button"
            onClick={handleClear}
            aria-label="Clear search"
          >
            Clear
          </button>
          <button 
            type="submit" 
            className="search-button"
            aria-label="Search"
          >
            Search
          </button>
        </div>
      </form>
    </div>
  );
};

SearchBar.propTypes = {
  onSearch: PropTypes.func
};

export default SearchBar;
