import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Components
import NoteList from './components/Notes/NoteList';
import NoteDetail from './components/Notes/NoteDetail';
import NoteForm from './components/Notes/NoteForm';
import UserProfile from './components/User/UserProfile';
import SearchBar from './components/Search/SearchBar';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import NotFound from './components/Layout/NotFound';

// Protected route wrapper
const ProtectedRoute = ({ children, isLoggedIn }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useState({
    query: '',
    course: ''
  });

  useEffect(() => {
    // Check if user is already logged in
    const checkAuthStatus = async () => {
      try {
        const response = await fetch('/api/auth/me');
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    setIsLoggedIn(true);
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsLoggedIn(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  const handleSearch = useCallback((query, course) => {
    setSearchParams({ query, course });
  }, []);

  if (loading) {
    return <div className="loading-app">Loading...</div>;
  }

  return (
    <Router>
      <div className="app">
        <Header isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
        
        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <>
                  <div className="home-hero">
                    <div className="hero-content">
                      <h1>Welcome to NoteShare</h1>
                      <p>Discover and share academic notes with your peers</p>
                    </div>
                  </div>
                  <div className="container">
                    <SearchBar onSearch={handleSearch} />
                    <NoteList searchQuery={searchParams.query} courseFilter={searchParams.course} />
                  </div>
                </>
              } 
            />
            
            <Route 
              path="/notes" 
              element={
                <div className="container">
                  <SearchBar onSearch={handleSearch} />
                  <NoteList searchQuery={searchParams.query} courseFilter={searchParams.course} />
                </div>
              } 
            />
            
            {/* 具体的なルートを先に配置 */}
            <Route 
              path="/notes/new" 
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <div className="container">
                    <NoteForm />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/notes/:id/edit" 
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <div className="container">
                    <NoteForm isEdit={true} />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            {/* 動的パラメータを含むルートを後に配置 */}
            <Route path="/notes/:id" element={<NoteDetail isLoggedIn={isLoggedIn} user={user} />} />
            
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                  <div className="container">
                    <UserProfile isCurrentUser={true} />
                  </div>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/users/:username" 
              element={
                <div className="container">
                  <UserProfile />
                </div>
              } 
            />
            
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onRegister={handleLogin} />} />
            
            <Route path="/about" element={<div className="container"><h1>About Us</h1><p>This is the about page.</p></div>} />
            <Route path="/privacy" element={<div className="container"><h1>Privacy Policy</h1><p>This is the privacy policy page.</p></div>} />
            <Route path="/terms" element={<div className="container"><h1>Terms of Service</h1><p>This is the terms of service page.</p></div>} />
            <Route path="/faq" element={<div className="container"><h1>FAQs</h1><p>This is the FAQ page.</p></div>} />
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        
        <Footer />
      </div>
    </Router>
  );
}

export default App;
