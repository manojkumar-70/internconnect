import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { internshipAPI } from '../services/api';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ApplicationModal from '../components/ApplicationModal';
import '../styles/InternshipList.css';

const InternshipList = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'details' or 'application'
  const [filters, setFilters] = useState({
    location: '',
    minStipend: 0,
    maxStipend: 50000,
    skills: [],
  });

  // Sample internship data with all required details
  const [allInternships] = useState([
    {
      _id: '1',
      title: 'Frontend Developer',
      company: {
        _id: 'comp1',
        companyName: 'Tech Innovations Inc',
        logo: 'https://via.placeholder.com/80?text=TII',
      },
      location: 'Bangalore, India',
      duration: '3 months',
      stipend: 25000,
      status: 'open',
      description: 'Join our team to build responsive web applications using React and modern JavaScript. You will work with experienced developers and contribute to production-grade applications.',
      requirements: 'Knowledge of React, HTML, CSS, JavaScript, Git',
      skills: ['React', 'JavaScript', 'CSS', 'HTML'],
      postedDate: '2024-05-10',
      applications: 12,
    },
    {
      _id: '2',
      title: 'Data Analyst',
      company: {
        _id: 'comp2',
        companyName: 'Data Solutions Ltd',
        logo: 'https://via.placeholder.com/80?text=DSL',
      },
      location: 'Mumbai, India',
      duration: '6 months',
      stipend: 30000,
      status: 'open',
      description: 'Analyze data and create meaningful insights. Work with SQL, Python, and data visualization tools to help drive business decisions.',
      requirements: 'SQL, Python, Excel, Statistics knowledge',
      skills: ['SQL', 'Python', 'Data Analysis', 'Excel'],
      postedDate: '2024-05-08',
      applications: 28,
    },
    {
      _id: '3',
      title: 'Backend Engineer',
      company: {
        _id: 'comp3',
        companyName: 'Cloud Systems Inc',
        logo: 'https://via.placeholder.com/80?text=CSI',
      },
      location: 'Delhi, India',
      duration: '4 months',
      stipend: 32000,
      status: 'open',
      description: 'Build scalable backend services using Node.js and Express. Work with databases, APIs, and microservices architecture.',
      requirements: 'Node.js, Express, MongoDB, REST APIs',
      skills: ['Node.js', 'JavaScript', 'MongoDB', 'REST APIs'],
      postedDate: '2024-05-12',
      applications: 35,
    },
    {
      _id: '4',
      title: 'UX/UI Designer',
      company: {
        _id: 'comp4',
        companyName: 'Creative Studios',
        logo: 'https://via.placeholder.com/80?text=CS',
      },
      location: 'Pune, India',
      duration: '3 months',
      stipend: 22000,
      status: 'open',
      description: 'Design beautiful and intuitive user interfaces. Use design tools like Figma to create mockups and prototypes for web applications.',
      requirements: 'Figma, UI/UX principles, Prototyping',
      skills: ['UI Design', 'Figma', 'Prototyping', 'User Research'],
      postedDate: '2024-05-14',
      applications: 19,
    },
    {
      _id: '5',
      title: 'DevOps Engineer',
      company: {
        _id: 'comp5',
        companyName: 'Infrastructure Tech',
        logo: 'https://via.placeholder.com/80?text=IT',
      },
      location: 'Hyderabad, India',
      duration: '5 months',
      stipend: 35000,
      status: 'open',
      description: 'Manage and optimize cloud infrastructure. Work with Docker, Kubernetes, and CI/CD pipelines.',
      requirements: 'Docker, Kubernetes, Linux, CI/CD',
      skills: ['Docker', 'Kubernetes', 'Linux', 'AWS'],
      postedDate: '2024-05-11',
      applications: 15,
    },
    {
      _id: '6',
      title: 'Full Stack Developer',
      company: {
        _id: 'comp1',
        companyName: 'Tech Innovations Inc',
        logo: 'https://via.placeholder.com/80?text=TII',
      },
      location: 'Bangalore, India',
      duration: '6 months',
      stipend: 38000,
      status: 'open',
      description: 'Build end-to-end web applications. Work on both frontend and backend to create complete solutions.',
      requirements: 'React, Node.js, MongoDB, REST APIs',
      skills: ['React', 'Node.js', 'MongoDB', 'JavaScript'],
      postedDate: '2024-05-13',
      applications: 42,
    },
    {
      _id: '7',
      title: 'Machine Learning Intern',
      company: {
        _id: 'comp2',
        companyName: 'Data Solutions Ltd',
        logo: 'https://via.placeholder.com/80?text=DSL',
      },
      location: 'Mumbai, India',
      duration: '6 months',
      stipend: 40000,
      status: 'open',
      description: 'Work on ML models and AI applications. Use Python, TensorFlow, and implement machine learning solutions.',
      requirements: 'Python, Machine Learning, TensorFlow, Math',
      skills: ['Python', 'Machine Learning', 'TensorFlow', 'Data Science'],
      postedDate: '2024-05-09',
      applications: 56,
    },
    {
      _id: '8',
      title: 'QA Engineer',
      company: {
        _id: 'comp3',
        companyName: 'Cloud Systems Inc',
        logo: 'https://via.placeholder.com/80?text=CSI',
      },
      location: 'Noida, India',
      duration: '3 months',
      stipend: 18000,
      status: 'closed',
      description: 'Test software applications and ensure quality. Write test cases and perform manual and automated testing.',
      requirements: 'Testing, Selenium, Test automation',
      skills: ['Testing', 'Selenium', 'Automation', 'QA'],
      postedDate: '2024-04-25',
      applications: 28,
    },
  ]);

  const [filteredInternships, setFilteredInternships] = useState(allInternships);
  const [loading, setLoading] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Filter internships based on search and filters
  useEffect(() => {
    let results = allInternships.filter((internship) => {
      // Search filter
      const matchesSearch =
        internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.company.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        internship.location.toLowerCase().includes(searchQuery.toLowerCase());

      // Location filter
      const matchesLocation =
        !filters.location ||
        internship.location.toLowerCase().includes(filters.location.toLowerCase());

      // Stipend filter
      const matchesStipend =
        internship.stipend >= filters.minStipend && internship.stipend <= filters.maxStipend;

      // Skills filter
      const matchesSkills =
        filters.skills.length === 0 ||
        filters.skills.some((skill) =>
          internship.skills.some((s) => s.toLowerCase().includes(skill.toLowerCase()))
        );

      return matchesSearch && matchesLocation && matchesStipend && matchesSkills;
    });

    setFilteredInternships(results);
  }, [searchQuery, filters]);

  const handleSkillChange = (skill) => {
    setFilters((prev) => ({
      ...prev,
      skills: prev.skills.includes(skill)
        ? prev.skills.filter((s) => s !== skill)
        : [...prev.skills, skill],
    }));
  };

  const openModal = (internship) => {
    setSelectedInternship(internship);
    setModalType('details');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedInternship(null);
    setModalType(null);
  };

  const handleApply = (internship) => {
    if (!user) {
      toast.warning('Please login to apply');
      navigate('/login');
      return;
    }
    setSelectedInternship(internship);
    setModalType('application');
    setShowModal(true);
  };

  const handleApplicationSubmit = (applicationData) => {
    // Save application to state or backend
    console.log('Application submitted:', applicationData);
    toast.success(`Successfully applied for ${applicationData.internshipTitle}`);
    setShowModal(false);
  };

  // Get unique skills from all internships for filter options
  const allSkills = [...new Set(allInternships.flatMap((i) => i.skills))];

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />
      <div className="internship-listing-container">
        {/* Header Section */}
        <section className="listing-header">
          <h1>Internship Opportunities</h1>
          <p>Find and apply to internships that match your skills</p>
        </section>

        <div className="listing-wrapper">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar">
            <div className="filter-section">
              <h3>Filters</h3>

              {/* Search Bar */}
              <div className="filter-group">
                <label>Search</label>
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Job title, company, location..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="search-input"
                  />
                  <span className="search-icon">🔍</span>
                </div>
              </div>

              {/* Location Filter */}
              <div className="filter-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="Filter by location"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="filter-input"
                />
              </div>

              {/* Stipend Filter */}
              <div className="filter-group">
                <label>
                  Stipend Range: ₹{filters.minStipend} - ₹{filters.maxStipend}
                </label>
                <input
                  type="range"
                  min="0"
                  max="50000"
                  step="500"
                  value={filters.maxStipend}
                  onChange={(e) =>
                    setFilters({ ...filters, maxStipend: parseInt(e.target.value) })
                  }
                  className="range-slider"
                />
              </div>

              {/* Skills Filter */}
              <div className="filter-group">
                <label>Skills</label>
                <div className="skills-filter">
                  {allSkills.map((skill) => (
                    <label key={skill} className="skill-checkbox">
                      <input
                        type="checkbox"
                        checked={filters.skills.includes(skill)}
                        onChange={() => handleSkillChange(skill)}
                      />
                      <span>{skill}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Reset Filters */}
              <button
                className="btn-reset-filters"
                onClick={() =>
                  setFilters({
                    location: '',
                    minStipend: 0,
                    maxStipend: 50000,
                    skills: [],
                  })
                }
              >
                Reset Filters
              </button>
            </div>
          </aside>

          {/* Main Content */}
          <main className="listings-main">
            {/* Results Header */}
            <div className="results-header">
              <p className="results-count">
                {filteredInternships.length} internship{filteredInternships.length !== 1 ? 's' : ''} found
              </p>
            </div>

            {/* Internship Cards Grid */}
            {loading ? (
              <div className="loading-spinner">Loading...</div>
            ) : filteredInternships.length === 0 ? (
              <div className="no-results">
                <p>😔 No internships found matching your criteria</p>
                <p>Try adjusting your filters or search query</p>
              </div>
            ) : (
              <div className="internships-grid">
                {filteredInternships.map((internship) => (
                  <div key={internship._id} className="internship-card">
                    {/* Card Header with Company Info */}
                    <div className="card-header-section">
                      <img
                        src={internship.company.logo}
                        alt={internship.company.companyName}
                        className="company-logo"
                      />
                      <div className="company-info">
                        <h4 className="company-name">{internship.company.companyName}</h4>
                        <span className={`status-badge status-${internship.status}`}>
                          {internship.status}
                        </span>
                      </div>
                    </div>

                    {/* Card Title */}
                    <h3 className="internship-title">{internship.title}</h3>

                    {/* Card Details */}
                    <div className="card-details">
                      <div className="detail-item">
                        <span className="detail-icon">📍</span>
                        <span>{internship.location}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">⏱️</span>
                        <span>{internship.duration}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">💰</span>
                        <span>₹{internship.stipend.toLocaleString()}/month</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-icon">👥</span>
                        <span>{internship.applications} applications</span>
                      </div>
                    </div>

                    {/* Skills Tags */}
                    <div className="skills-tags">
                      {internship.skills.slice(0, 3).map((skill) => (
                        <span key={skill} className="skill-tag">
                          {skill}
                        </span>
                      ))}
                      {internship.skills.length > 3 && (
                        <span className="skill-tag more">+{internship.skills.length - 3}</span>
                      )}
                    </div>

                    {/* Card Actions */}
                    <div className="card-actions">
                      <button
                        className="btn-details"
                        onClick={() => openModal(internship)}
                      >
                        View Details
                      </button>
                      <button
                        className="btn-apply"
                        onClick={() => handleApply(internship)}
                        disabled={internship.status !== 'open'}
                      >
                        Apply Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Application Modal */}
      {showModal && selectedInternship && modalType === 'application' && user && (
        <ApplicationModal
          internship={selectedInternship}
          user={user}
          onClose={closeModal}
          onSubmit={handleApplicationSubmit}
        />
      )}

      {/* Details Modal */}
      {showModal && selectedInternship && modalType === 'details' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="modal-header">
              <div className="modal-company-info">
                <img
                  src={selectedInternship.company.logo}
                  alt={selectedInternship.company.companyName}
                  className="modal-logo"
                />
                <div>
                  <h2>{selectedInternship.title}</h2>
                  <p className="modal-company-name">{selectedInternship.company.companyName}</p>
                </div>
              </div>
              <button className="modal-close" onClick={closeModal}>
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body">
              {/* Key Details */}
              <div className="modal-details">
                <div className="detail-row">
                  <span className="detail-label">📍 Location:</span>
                  <span>{selectedInternship.location}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">💰 Stipend:</span>
                  <span>₹{selectedInternship.stipend.toLocaleString()}/month</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">⏱️ Duration:</span>
                  <span>{selectedInternship.duration}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">📅 Posted:</span>
                  <span>{selectedInternship.postedDate}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">👥 Applications:</span>
                  <span>{selectedInternship.applications}</span>
                </div>
              </div>

              {/* Description */}
              <div className="modal-section">
                <h4>About the Role</h4>
                <p>{selectedInternship.description}</p>
              </div>

              {/* Requirements */}
              <div className="modal-section">
                <h4>Requirements</h4>
                <p>{selectedInternship.requirements}</p>
              </div>

              {/* Skills */}
              <div className="modal-section">
                <h4>Required Skills</h4>
                <div className="modal-skills">
                  {selectedInternship.skills.map((skill) => (
                    <span key={skill} className="skill-badge">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="modal-footer">
              <button className="btn-close" onClick={closeModal}>
                Close
              </button>
              <button
                className="btn-apply-modal"
                onClick={() => handleApply(selectedInternship)}
                disabled={selectedInternship.status !== 'open'}
              >
                {selectedInternship.status === 'open' ? 'Apply Now' : 'Position Closed'}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default InternshipList;
