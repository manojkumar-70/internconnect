import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Context
import { AuthProvider } from './context/AuthContext';

// Pages
import Home from './pages/Home';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import StudentDashboard from './pages/StudentDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import AdminDashboard from './pages/AdminDashboard';
import InternshipList from './pages/InternshipList';
import InternshipDetail from './pages/InternshipDetail';
import StudentProfile from './pages/StudentProfile';
import CompanyProfile from './pages/CompanyProfile';
import MyApplications from './pages/MyApplications';
import ApplicationTracker from './pages/ApplicationTracker';
import PostInternship from './pages/PostInternship';
import CompanyInternships from './pages/CompanyInternships';
import CompanyApplications from './pages/CompanyApplications';
import CompanyTeams from './pages/CompanyTeams';
import CompanyTasks from './pages/CompanyTasks';
import CompanyRatings from './pages/CompanyRatings';
import AdminStats from './pages/AdminStats';
import AdminStudents from './pages/AdminStudents';
import AdminCompanies from './pages/AdminCompanies';
import AdminInternships from './pages/AdminInternships';
import AdminApplications from './pages/AdminApplications';
import AdminSettings from './pages/AdminSettings';
import TeamDetails from './pages/TeamDetails';
import RecoveryTaskDetails from './pages/RecoveryTaskDetails';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/internships" element={<InternshipList />} />
            <Route path="/internships/:id" element={<InternshipDetail />} />
            <Route path="/student-dashboard" element={<StudentDashboard />} />
            <Route path="/company-dashboard" element={<CompanyDashboard />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/student/profile" element={<StudentProfile />} />
            <Route path="/company/profile" element={<CompanyProfile />} />
            <Route path="/company/internships" element={<CompanyInternships />} />
            <Route path="/company/applications" element={<CompanyApplications />} />
            <Route path="/company/teams" element={<CompanyTeams />} />
            <Route path="/company/teams/:teamId" element={<TeamDetails />} />
            <Route path="/company/tasks" element={<CompanyTasks />} />
            <Route path="/company/ratings" element={<CompanyRatings />} />
            <Route path="/student/tasks/:taskId" element={<RecoveryTaskDetails />} />
            <Route path="/admin/stats" element={<AdminStats />} />
            <Route path="/admin/students" element={<AdminStudents />} />
            <Route path="/admin/companies" element={<AdminCompanies />} />
            <Route path="/admin/internships" element={<AdminInternships />} />
            <Route path="/admin/applications" element={<AdminApplications />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/my-applications" element={<MyApplications />} />
            <Route path="/applications" element={<ApplicationTracker />} />
            <Route path="/internship/create" element={<PostInternship />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <ToastContainer position="bottom-right" autoClose={3000} />
      </AuthProvider>
    </Router>
  );
}

export default App;
