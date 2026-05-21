import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/CompanyPages.css';

function CompanyRatings() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mockReviews = [
      {
        id: 301,
        student: 'Riya Sharma',
        rating: 4.5,
        comment: 'Great interview process and clear communication throughout.',
        date: '2026-05-08'
      },
      {
        id: 302,
        student: 'Vikram Rao',
        rating: 4.0,
        comment: 'Good opportunity and supportive mentor guidance.',
        date: '2026-05-12'
      },
      {
        id: 303,
        student: 'Simran Kaur',
        rating: 3.8,
        comment: 'Overall positive but onboarding took longer than expected.',
        date: '2026-05-14'
      }
    ];

    setReviews(mockReviews);
    setLoading(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="company-page">
      <Navbar />
      <div className="company-container">
        <div className="page-header">
          <h1>Ratings & Reviews</h1>
        </div>

        <div className="ratings-summary">
          <div className="rating-box">
            <span className="rating-score">4.1</span>
            <p>Average Rating</p>
          </div>
          <div className="rating-box">
            <span className="rating-count">3</span>
            <p>Total Reviews</p>
          </div>
        </div>

        <div className="reviews-grid">
          {reviews.map(review => (
            <div className="review-card" key={review.id}>
              <div className="review-header">
                <div>
                  <h3>{review.student}</h3>
                  <p>{review.date}</p>
                </div>
                <span className="rating-pill">{review.rating} ★</span>
              </div>
              <p>{review.comment}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CompanyRatings;
