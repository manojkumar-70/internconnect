import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { AuthContext } from '../context/AuthContext';
import { ratingAPI } from '../services/api';
import '../styles/CompanyPages.css';

function CompanyRatings() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = React.useContext(AuthContext);
  const [summary, setSummary] = useState({ average: null, count: 0 });

  useEffect(() => {
    if (!user?._id && !user?.id) {
      setLoading(false);
      return;
    }
    const companyId = user._id || user.id;
    Promise.all([ratingAPI.getRatings(companyId, 'company'), ratingAPI.getSummary(companyId, 'company')])
      .then(([reviewsResponse, summaryResponse]) => {
        const records = Array.isArray(reviewsResponse.data) ? reviewsResponse.data : reviewsResponse.data?.ratings || [];
        const data = summaryResponse.data?.summary || summaryResponse.data || {};
        setReviews(records);
        setSummary({ average: data.averageRating ?? data.average ?? null, count: data.totalRatings ?? data.count ?? records.length });
      })
      .catch(() => {
        setReviews([]);
        setSummary({ average: null, count: 0 });
      })
      .finally(() => setLoading(false));
  }, [user]);

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
            <span className="rating-score">{summary.average ?? 'Not available'}</span>
            <p>Average Rating</p>
          </div>
          <div className="rating-box">
            <span className="rating-count">{summary.count}</span>
            <p>Total Reviews</p>
          </div>
        </div>

        <div className="reviews-grid">
          {reviews.map(review => (
              <div className="review-card" key={review._id || review.id}>
              <div className="review-header">
                <div>
                  <h3>{review.student?.name || review.student || 'Not available'}</h3>
                  <p>{review.createdAt || review.date || 'Not available'}</p>
                </div>
                <span className="rating-pill">{review.rating} ★</span>
              </div>
              <p>{review.comment || 'Not available'}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default CompanyRatings;
