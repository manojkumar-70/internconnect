import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import { authAPI } from '../services/api';
import '../styles/Auth.css';

const GoogleSignup = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const role = new URLSearchParams(location.search).get('role');
  const [form, setForm] = useState({ college: '', cgpa: '', skills: '', name: '', companyName: '', industry: '', location: '', website: '' });
  const [loading, setLoading] = useState(false);

  if (!['student', 'company'].includes(role)) return <main className="auth-callback-page"><h1>Choose a role before signing in with Google.</h1></main>;

  const change = (event) => setForm({ ...form, [event.target.name]: event.target.value });
  const submit = async (event) => {
    event.preventDefault(); setLoading(true);
    const data = role === 'student'
      ? { college: form.college, cgpa: Number(form.cgpa), skills: form.skills.split(',').map((skill) => skill.trim()).filter(Boolean) }
      : { name: form.name, companyName: form.companyName, industry: form.industry, location: form.location, website: form.website };
    try {
      const response = await authAPI.completeGoogleRegistration(data);
      login(response.data.user, response.data.token);
      navigate(role === 'student' ? '/student-dashboard' : '/company-dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Unable to complete registration.');
    } finally { setLoading(false); }
  };

  return <main className="google-signup-page"><section className="google-signup-card"><p className="admin-kicker">Google account setup</p><h1>Complete your {role} profile</h1><p>Use the verified Google account and add the required InternConnect profile information.</p><form onSubmit={submit}>{role === 'student' ? <><label>College / University<input name="college" value={form.college} onChange={change} required /></label><label>CGPA<input name="cgpa" type="number" min="0" max="10" step="0.01" value={form.cgpa} onChange={change} required /></label><label>Skills<input name="skills" value={form.skills} onChange={change} placeholder="Python, React, SQL" required /></label></> : <><label>Recruiter name<input name="name" value={form.name} onChange={change} required /></label><label>Company name<input name="companyName" value={form.companyName} onChange={change} required /></label><label>Industry<input name="industry" value={form.industry} onChange={change} required /></label><label>Location<input name="location" value={form.location} onChange={change} required /></label><label>Website<input name="website" value={form.website} onChange={change} /></label></>}<button className="btn-primary" disabled={loading}>{loading ? 'Creating account...' : 'Continue with Google'}</button></form></section></main>;
};

export default GoogleSignup;
