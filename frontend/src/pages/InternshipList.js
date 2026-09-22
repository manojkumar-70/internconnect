import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { internshipAPI, applicationAPI } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ApplicationModal from '../components/ApplicationModal';
import '../styles/InternshipList.css';

const BOOKMARK_STORAGE_KEY = 'internconnect-bookmarks';

const normalizeSkills = (value) => {
  if (!value) return [];
  return (Array.isArray(value) ? value : [value])
    .flatMap((item) => (typeof item === 'string' ? item.split(',') : item))
    .map((skill) => String(skill).trim())
    .filter(Boolean);
};

const normalizeCompany = (company) => {
  if (!company) {
    return {
      companyName: 'Unknown company',
      logo: 'https://ui-avatars.com/api/?name=IC&background=0f172a&color=ffffff',
    };
  }

  return {
    _id: company._id || company.id,
    companyName: company.companyName || company.name || 'Unknown company',
    logo:
      company.logo ||
      `https://ui-avatars.com/api/?name=${encodeURIComponent(
        company.companyName || company.name || 'IC'
      )}&background=1d4ed8&color=ffffff`,
  };
};

const normalizeInternship = (item) => {
  if (!item) return null;

  const skills = normalizeSkills(item.requiredSkills || item.skills || []);
  const type = item.type || 'full-time';
  const stipend = Number(item.stipend ?? 0);

  return {
    _id: item._id || item.id,
    title: item.title || 'Untitled internship',
    description: item.description || 'No description provided yet.',
    company: normalizeCompany(item.company),
    location: item.location || 'Remote',
    duration: item.duration || 'Flexible',
    stipend,
    status: item.status || 'open',
    type,
    skills,
    applications: Number(item.applications ?? item.applicants?.length ?? 0),
    postedDate: item.postedDate || item.createdAt || item.startDate,
    requiredSkills: skills,
  };
};

const getDomainFromTitle = (title = '') => {
  const text = title.toLowerCase();

  if (text.includes('frontend') || text.includes('react') || text.includes('ui')) return 'Frontend';
  if (text.includes('backend') || text.includes('node') || text.includes('api')) return 'Backend';
  if (text.includes('data') || text.includes('analytics') || text.includes('sql')) return 'Data';
  if (text.includes('machine') || text.includes('ai') || text.includes('ml')) return 'AI / ML';
  if (text.includes('devops') || text.includes('cloud') || text.includes('docker')) return 'DevOps';
  if (text.includes('design') || text.includes('ux')) return 'Design';
  if (text.includes('product') || text.includes('marketing')) return 'Product';
  if (text.includes('qa') || text.includes('testing')) return 'QA';
  return 'General';
};

const formatCurrency = (amount) => {
  const value = Number(amount || 0);
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (value) => {
  if (!value) return 'Recently';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const getInternshipDeadline = (internship) => {
  if (!internship) return null;

  return internship.deadline || internship.applicationDeadline || internship.endDate || internship.startDate || internship.postedDate;
};

const calculateAiMatchScore = (internshipSkills = [], studentSkills = []) => {
  if (!internshipSkills.length || !studentSkills.length) return null;

  const normalizedStudentSkills = new Set(
    studentSkills
      .map((skill) => String(skill).trim().toLowerCase())
      .filter(Boolean)
  );

  const normalizedJobSkills = internshipSkills
    .map((skill) => String(skill).trim().toLowerCase())
    .filter(Boolean);

  const matchedSkills = normalizedJobSkills.filter((skill) => normalizedStudentSkills.has(skill));

  if (!normalizedJobSkills.length) return null;

  const score = Math.round((matchedSkills.length / normalizedJobSkills.length) * 100);
  return Math.min(100, Math.max(0, score));
};

const InternshipList = () => {
  const navigate = useNavigate();
  const { user, logout } = useContext(AuthContext);

  const [allInternships, setAllInternships] = useState([]);
  const [filteredInternships, setFilteredInternships] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [savedInternships, setSavedInternships] = useState(() => {
    try {
      const storedValue = localStorage.getItem(BOOKMARK_STORAGE_KEY);
      return storedValue ? JSON.parse(storedValue) : [];
    } catch {
      return [];
    }
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInternship, setSelectedInternship] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [applicationStatus, setApplicationStatus] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const [filters, setFilters] = useState({
    location: '',
    domain: '',
    skills: '',
    type: '',
    minStipend: 0,
    maxStipend: 500000,
  });

  const availableSkills = useMemo(
    () => [...new Set(allInternships.flatMap((internship) => internship.skills))].sort(),
    [allInternships]
  );

  const availableLocations = useMemo(
    () => [...new Set(allInternships.map((internship) => internship.location).filter(Boolean))].sort(),
    [allInternships]
  );

  const availableDomains = useMemo(
    () => [...new Set(allInternships.map((internship) => getDomainFromTitle(internship.title)).filter(Boolean))].sort(),
    [allInternships]
  );

  useEffect(() => {
    const fetchInternships = async () => {
      setLoading(true);
      setError('');

      try {
        const response = await internshipAPI.getAll({});
        const payload = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.internships)
          ? response.data.internships
          : [];

        const normalizedInternships = payload
          .map(normalizeInternship)
          .filter(Boolean)
          .sort((a, b) => (b.postedDate || '').localeCompare(a.postedDate || ''));

        setAllInternships(normalizedInternships);
        setFilteredInternships(normalizedInternships);
      } catch (err) {
        setError('Unable to load internships right now. Please try again later.');
        setAllInternships([]);
        setFilteredInternships([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInternships();
  }, []);

  useEffect(() => {
    if (!user) {
      setUserApplications([]);
      return;
    }

    const fetchMyApplications = async () => {
      try {
        const response = await applicationAPI.getStudentApplications();
        const payload = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.applications)
          ? response.data.applications
          : [];
        setUserApplications(payload);
      } catch {
        setUserApplications([]);
      }
    };

    fetchMyApplications();
  }, [user]);

  useEffect(() => {
    localStorage.setItem(BOOKMARK_STORAGE_KEY, JSON.stringify(savedInternships));
  }, [savedInternships]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    const results = allInternships.filter((internship) => {
      const companyName = internship.company?.companyName || '';
      const text = `${internship.title} ${companyName} ${internship.location} ${internship.description}`.toLowerCase();

      const matchesSearch = !query || text.includes(query);
      const matchesLocation = !filters.location || internship.location.toLowerCase().includes(filters.location.toLowerCase());
      const matchesDomain = !filters.domain || getDomainFromTitle(internship.title) === filters.domain;
      const matchesSkills =
        !filters.skills ||
        internship.skills.some((skill) => skill.toLowerCase().includes(filters.skills.toLowerCase()));
      const matchesType = !filters.type || internship.type === filters.type;
      const matchesStipend =
        Number(internship.stipend) >= Number(filters.minStipend) &&
        Number(internship.stipend) <= Number(filters.maxStipend);

      return matchesSearch && matchesLocation && matchesDomain && matchesSkills && matchesType && matchesStipend;
    });

    setFilteredInternships(results);
    setVisibleCount(Math.min(6, results.length || 6));
  }, [allInternships, filters, searchQuery]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const resetFilters = () => {
    setFilters({
      location: '',
      domain: '',
      skills: '',
      type: '',
      minStipend: 0,
      maxStipend: 500000,
    });
    setSearchQuery('');
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
    const internshipName = applicationData.internshipTitle || selectedInternship?.title || 'this internship';
    setApplicationStatus(`Application submitted for ${internshipName}.`);
    toast.success(`Successfully applied for ${internshipName}`);
    setShowModal(false);
    setSelectedInternship(null);
    setModalType(null);

    if (user) {
      applicationAPI
        .getStudentApplications()
        .then((response) => {
          const payload = Array.isArray(response.data)
            ? response.data
            : Array.isArray(response.data?.applications)
            ? response.data.applications
            : [];
          setUserApplications(payload);
        })
        .catch(() => {});
    }
  };

  const isSaved = (internshipId) => savedInternships.includes(internshipId);

  const hasApplied = (internshipId) =>
    userApplications.some((item) => {
      const candidateId = item.internship?._id || item.internship || item.internshipId;
      return String(candidateId) === String(internshipId);
    });

  const toggleSaved = (internshipId) => {
    setSavedInternships((prev) =>
      prev.includes(internshipId) ? prev.filter((item) => item !== internshipId) : [...prev, internshipId]
    );
  };

  const visibleInternships = filteredInternships.slice(0, visibleCount);

  return (
    <>
      <Navbar user={user} onLogout={handleLogout} />

      <div className="internship-listing-container">
        <section className="listing-header">
          <div className="listing-header-inner">
            <p className="eyebrow">Career opportunities</p>
            <h1>Find your next internship</h1>
            <p>Browse internships from real companies and apply directly with your profile.</p>
          </div>
        </section>

        <div className="listing-wrapper">
          <aside className="filters-sidebar">
            <div className="filters-header-row">
              <h3>Filters</h3>
              <button type="button" className="clear-filters-btn" onClick={resetFilters}>
                Clear all
              </button>
            </div>

            <div className="filter-group">
              <label htmlFor="internship-search">Search</label>
              <div className="search-input-wrapper">
                <input
                  id="internship-search"
                  type="text"
                  placeholder="Title, company, skills..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="search-input"
                />
                <span className="search-icon">⌕</span>
              </div>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-location">Location</label>
              <select
                id="filter-location"
                value={filters.location}
                onChange={(event) => setFilters((prev) => ({ ...prev, location: event.target.value }))}
                className="filter-input"
              >
                <option value="">All locations</option>
                {availableLocations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-domain">Domain</label>
              <select
                id="filter-domain"
                value={filters.domain}
                onChange={(event) => setFilters((prev) => ({ ...prev, domain: event.target.value }))}
                className="filter-input"
              >
                <option value="">All domains</option>
                {availableDomains.map((domain) => (
                  <option key={domain} value={domain}>
                    {domain}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-type">Internship type</label>
              <select
                id="filter-type"
                value={filters.type}
                onChange={(event) => setFilters((prev) => ({ ...prev, type: event.target.value }))}
                className="filter-input"
              >
                <option value="">All types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="filter-skill">Skills</label>
              <select
                id="filter-skill"
                value={filters.skills}
                onChange={(event) => setFilters((prev) => ({ ...prev, skills: event.target.value }))}
                className="filter-input"
              >
                <option value="">All skills</option>
                {availableSkills.map((skill) => (
                  <option key={skill} value={skill}>
                    {skill}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="stipend-range">Stipend range</label>
              <div className="stipend-range-wrap">
                <span>₹{Number(filters.minStipend).toLocaleString('en-IN')}</span>
                <input
                  id="stipend-range"
                  type="range"
                  min="0"
                  max="500000"
                  step="5000"
                  value={filters.maxStipend}
                  onChange={(event) =>
                    setFilters((prev) => ({
                      ...prev,
                      maxStipend: Number(event.target.value),
                    }))
                  }
                  className="range-slider"
                />
                <span>₹{Number(filters.maxStipend).toLocaleString('en-IN')}</span>
              </div>
            </div>
          </aside>

          <main className="listings-main">
            <div className="results-header">
              <div>
                <p className="results-kicker">Live openings</p>
                <h2>
                  {filteredInternships.length} internship{filteredInternships.length === 1 ? '' : 's'} found
                </h2>
              </div>
            </div>

            {applicationStatus && (
              <div className="application-banner">
                <span>{applicationStatus}</span>
                <button type="button" onClick={() => setApplicationStatus('')}>
                  Clear
                </button>
              </div>
            )}

            {loading ? (
              <div className="state-card loading-state">
                <div className="spinner" aria-hidden="true" />
                <p>Loading internships...</p>
              </div>
            ) : error ? (
              <div className="state-card error-state">
                <h3>Something went wrong</h3>
                <p>{error}</p>
                <button type="button" className="retry-btn" onClick={() => window.location.reload()}>
                  Refresh page
                </button>
              </div>
            ) : filteredInternships.length === 0 ? (
              <div className="state-card empty-state">
                <h3>No internships match your filters</h3>
                <p>Try a different keyword or reset the filters to see more opportunities.</p>
              </div>
            ) : (
              <>
                <div className="internships-grid">
                  {visibleInternships.map((internship) => {
                    const applied = hasApplied(internship._id);
                    const saved = isSaved(internship._id);
                    const deadline = getInternshipDeadline(internship);
                    const studentSkillList = Array.isArray(user?.skills) ? user.skills : [];
                    const aiMatchScore = calculateAiMatchScore(internship.skills || [], studentSkillList);

                    return (
                      <article key={internship._id} className="internship-card">
                        <div className="card-header">
                          <div className="company-meta">
                            <img
                              src={internship.company.logo}
                              alt={internship.company.companyName}
                              className="company-logo"
                            />
                            <div>
                              <p className="company-name">{internship.company.companyName}</p>
                              <span className={`status-pill status-${internship.status}`}>
                                {internship.status}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            className={`save-btn ${saved ? 'saved' : ''}`}
                            onClick={() => toggleSaved(internship._id)}
                            aria-label={saved ? 'Remove bookmark' : 'Save internship'}
                          >
                            {saved ? '★' : '☆'}
                          </button>
                        </div>

                        <div className="internship-meta-row">
                          <span className="domain-badge">{getDomainFromTitle(internship.title)}</span>
                          <span className="type-badge">{internship.type}</span>
                          {typeof aiMatchScore === 'number' && (
                            <span className="ai-match-badge">AI match {aiMatchScore}%</span>
                          )}
                        </div>

                        <h3 className="internship-title">{internship.title}</h3>

                        <div className="card-badges-row">
                          {deadline && (
                            <span className="deadline-badge">Deadline: {formatDate(deadline)}</span>
                          )}
                        </div>

                        <div className="details-grid">
                          <div className="detail-item">
                            <span className="detail-icon">📍</span>
                            <span>{internship.location}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">⏱</span>
                            <span>{internship.duration}</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">₹</span>
                            <span>{formatCurrency(internship.stipend)} / month</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-icon">🗓</span>
                            <span>{deadline ? `Apply by ${formatDate(deadline)}` : formatDate(internship.postedDate)}</span>
                          </div>
                        </div>

                        <div className="card-description">
                          <p>{internship.description}</p>
                        </div>

                        <div className="skills-tag-list">
                          {(internship.skills || []).slice(0, 4).map((skill) => (
                            <span key={`${internship._id}-${skill}`} className="skill-tag">
                              {skill}
                            </span>
                          ))}
                          {(internship.skills || []).length > 4 && (
                            <span className="skill-tag more">+{(internship.skills || []).length - 4}</span>
                          )}
                        </div>

                        <div className="card-footer-row">
                          <div className="applicant-info">
                            <strong>{internship.applications}</strong>
                            <span>applications</span>
                          </div>

                          {applied ? (
                            <span className="applied-pill">Applied</span>
                          ) : (
                            <button type="button" className="apply-btn" onClick={() => handleApply(internship)}>
                              Apply now
                            </button>
                          )}
                          <button type="button" className="details-btn" onClick={() => openModal(internship)}>
                            View details
                          </button>
                        </div>
                      </article>
                    );
                  })}
                </div>

                {visibleCount < filteredInternships.length && (
                  <div className="load-more-wrap">
                    <button
                      type="button"
                      className="load-more-btn"
                      onClick={() => setVisibleCount((prev) => prev + 6)}
                    >
                      Load more internships
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>

      {showModal && selectedInternship && modalType === 'details' && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-company">
                <img
                  src={selectedInternship.company.logo}
                  alt={selectedInternship.company.companyName}
                  className="modal-logo"
                />
                <div>
                  <p className="company-name">{selectedInternship.company.companyName}</p>
                  <h3>{selectedInternship.title}</h3>
                </div>
              </div>
              <button type="button" className="modal-close-btn" onClick={closeModal}>
                ×
              </button>
            </div>

            <div className="modal-detail-grid">
              <div><strong>Location:</strong> {selectedInternship.location}</div>
              <div><strong>Duration:</strong> {selectedInternship.duration}</div>
              <div><strong>Stipend:</strong> {formatCurrency(selectedInternship.stipend)} / month</div>
              <div><strong>Type:</strong> {selectedInternship.type}</div>
              <div><strong>Posted:</strong> {formatDate(selectedInternship.postedDate)}</div>
              <div><strong>Applications:</strong> {selectedInternship.applications}</div>
            </div>

            <div className="modal-section">
              <h4>Role overview</h4>
              <p>{selectedInternship.description}</p>
            </div>

            <div className="modal-section">
              <h4>Skills required</h4>
              <div className="skills-tag-list">
                {(selectedInternship.skills || []).map((skill) => (
                  <span key={`${selectedInternship._id}-${skill}-detail`} className="skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="secondary-btn" onClick={closeModal}>
                Close
              </button>
              <button type="button" className="primary-btn" onClick={() => handleApply(selectedInternship)}>
                Apply now
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && selectedInternship && modalType === 'application' && user && (
        <ApplicationModal
          internship={selectedInternship}
          user={user}
          onClose={closeModal}
          onSubmit={handleApplicationSubmit}
        />
      )}

      <Footer />
    </>
  );
};

export default InternshipList;
