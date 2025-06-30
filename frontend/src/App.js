import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HomePage from './pages/HomePage';
// import AboutPage from './pages/AboutPage'; // Example for future page
import Header from './components/common/Header'; // We'll create this
import './App.css'; // We'll create this basic App CSS file next

function App() {
  return (
    <Router>
      <Header />
      <div className="container">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {/* <Route path="/about" element={<AboutPage />} /> */}
          {/* Add other routes here as pages are created */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
