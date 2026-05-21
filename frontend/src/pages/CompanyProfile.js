import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { companyAPI } from '../services/api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const CompanyProfile = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({});

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useEffect(() => {
    if (!user || user.role !== 'company') {
      navigate('/login');
      return;
    }

    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      const response = await companyAPI.getProfile();
      setProfile(response.data);
      setFormData(response.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load profile');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    try {
      await companyAPI.updateProfile(formData);
      setProfile(formData);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  if (loading) {
    return (
      <>
        <Navbar user={user} onLogout={handleLogout} />
        <div className="spinner"></div>
      </>
    );
  }

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="container">
        <div className="card mt-4">
          <div className="flex-between">
            <h2>Company Profile</h2>
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setEditing(!editing)}
            >
              {editing ? 'Cancel' : 'Edit'}
            </button>
          </div>

          {editing ? (
            <form>
              <div className="form-group mt-3">
                <label>Company Name</label>
                <input
                  type="text"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                ></textarea>
              </div>

              <div className="form-group">
                <label>Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />
              </div>

              <button
                type="button"
                className="btn btn-success"
                onClick={handleSave}
              >
                Save Changes
              </button>
            </form>
          ) : (
            <div className="mt-3">
              <p>
                <strong>Company Name:</strong> {profile?.companyName}
              </p>
              <p>
                <strong>Email:</strong> {profile?.email}
              </p>
              <p>
                <strong>Industry:</strong> {profile?.industry || 'Not specified'}
              </p>
              <p>
                <strong>Location:</strong> {profile?.location || 'Not specified'}
              </p>
              <p>
                <strong>Website:</strong>{' '}
                {profile?.website ? (
                  <a href={profile.website} target="_blank" rel="noopener noreferrer">
                    {profile.website}
                  </a>
                ) : (
                  'Not provided'
                )}
              </p>
              <p>
                <strong>Phone:</strong> {profile?.phone || 'Not provided'}
              </p>
              <p>
                <strong>Description:</strong> {profile?.description || 'Not provided'}
              </p>
              <p>
                <strong>Verified:</strong> {profile?.isVerified ? '✅ Yes' : '❌ No'}
              </p>
              <p>
                <strong>Rating:</strong> ⭐ {profile?.rating || 0} ({profile?.ratingCount || 0} reviews)
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CompanyProfile;
