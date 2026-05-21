import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/AdminPages.css';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    setCompanies([
      {
        id: 1,
        name: 'Tech Company',
        email: 'hr@techcompany.com',
        industry: 'Technology',
        status: 'Verified',
        description: 'A leading software solutions provider focusing on scalable web applications and product engineering.'
      },
      {
        id: 2,
        name: 'Growth Labs',
        email: 'info@growthlabs.com',
        industry: 'Education',
        status: 'Pending',
        description: 'An edtech startup helping students gain real-world skills through mentorship and career workshops.'
      },
      {
        id: 3,
        name: 'Urban Travel',
        email: 'careers@urbantravel.com',
        industry: 'Travel',
        status: 'Verified',
        description: 'A travel-focused marketplace connecting interns with hospitality and tourism companies across India.'
      }
    ]);
  }, []);

  const handleView = (company) => {
    toast.info(`${company.name}\n${company.industry} • ${company.email}`, {
      autoClose: 4000,
      pauseOnHover: true
    });
  };

  const handleDetails = (company) => {
    if (company.status === 'Pending') {
      setCompanies((prevCompanies) =>
        prevCompanies.map((item) =>
          item.id === company.id ? { ...item, status: 'Verified' } : item
        )
      );
      toast.success(`${company.name} has been verified.`);
      return;
    }

    toast.info(`${company.name}: ${company.description}`, {
      autoClose: 6000,
      pauseOnHover: true
    });
  };

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Manage Companies</h1>
          <p>Review, approve, or reject company registrations and manage profiles.</p>
        </div>

        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Email</th>
                <th>Industry</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((company) => (
                <tr key={company.id}>
                  <td>{company.name}</td>
                  <td>{company.email}</td>
                  <td>{company.industry}</td>
                  <td>{company.status}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => handleView(company)}>
                      View
                    </button>
                    <button
                      className={company.status === 'Pending' ? 'btn-primary' : 'btn-secondary'}
                      onClick={() => handleDetails(company)}
                    >
                      {company.status === 'Pending' ? 'Verify' : 'Details'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminCompanies;
