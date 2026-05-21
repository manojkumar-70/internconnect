import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const NotFound = () => {
  return (
    <>
      <Navbar user={null} />
      <div className="container">
        <div className="card text-center mt-4" style={{ maxWidth: '500px', margin: '4rem auto' }}>
          <h1 style={{ fontSize: '3rem' }}>404</h1>
          <h2>Page Not Found</h2>
          <p>The page you're looking for doesn't exist.</p>
          <a href="/" className="btn btn-primary mt-3">
            Go Home
          </a>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default NotFound;
