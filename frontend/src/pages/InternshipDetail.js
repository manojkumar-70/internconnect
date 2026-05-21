import React, { useState, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { internshipAPI, applicationAPI } from '../services/api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const InternshipDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, logout } = useContext(AuthContext);
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  React.useEffect(() => {
    fetchInternship();
  }, [id]);

  const fetchInternship = async () => {
    try {
      const response = await internshipAPI.getById(id);
      setInternship(response.data);
      setLoading(false);
    } catch (err) {
      toast.error('Failed to load internship');
      setLoading(false);
    }
  };

  const handleApply = async (e) => {
    e.preventDefault();

    if (!user || user.role !== 'student') {
      toast.error('Only students can apply for internships');
      navigate('/login');
      return;
    }

    try {
      setApplying(true);
      await applicationAPI.apply({
        internshipId: id,
        coverLetter,
      });
      toast.success('Application submitted successfully');
      setCoverLetter('');
      navigate('/my-applications');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setApplying(false);
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
        {internship && (
          <div className="card mt-4">
            <h2>{internship.title}</h2>

            <div className="grid grid-2 mt-4">
              <div>
                <p>
                  <strong>Company:</strong> {internship.company?.companyName}
                </p>
                <p>
                  <strong>Location:</strong> {internship.location}
                </p>
                <p>
                  <strong>Duration:</strong> {internship.duration}
                </p>
                <p>
                  <strong>Stipend:</strong> ₹{internship.stipend}/month
                </p>
              </div>

              <div>
                <p>
                  <strong>Type:</strong> {internship.type}
                </p>
                <p>
                  <strong>Status:</strong> {internship.status}
                </p>
                <p>
                  <strong>Positions:</strong> {internship.positionsAvailable}
                </p>
                <p>
                  <strong>Min CGPA:</strong> {internship.minCGPA}
                </p>
              </div>
            </div>

            <div className="mt-4">
              <h3>Description</h3>
              <p>{internship.description}</p>
            </div>

            {internship.requiredSkills?.length > 0 && (
              <div className="mt-4">
                <h3>Required Skills</h3>
                <div className="flex gap-2">
                  {internship.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: 'var(--light-gray)',
                        borderRadius: '0.25rem',
                      }}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user?.role === 'student' && internship.status === 'open' && (
              <form onSubmit={handleApply} className="mt-4">
                <div className="form-group">
                  <label>Cover Letter</label>
                  <textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows="6"
                    placeholder="Tell the company why you're interested..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={applying}
                >
                  {applying ? 'Applying...' : 'Apply Now'}
                </button>
              </form>
            )}

            {internship.status !== 'open' && (
              <div className="alert alert-warning mt-4">
                This internship is currently closed
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default InternshipDetail;
