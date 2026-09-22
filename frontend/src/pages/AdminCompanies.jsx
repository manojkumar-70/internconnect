import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { adminAPI } from '../services/api';
import '../styles/AdminPages.css';

const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    adminAPI.getCompanies()
      .then((response) => setCompanies(Array.isArray(response.data) ? response.data : response.data?.companies || []))
      .catch(() => setCompanies([]));
  }, []);

  const handleView = (company) => {
    toast.info(`${company.name}\n${company.industry} • ${company.email}`, {
      autoClose: 4000,
      pauseOnHover: true
    });
  };

  const handleDetails = (company) => {
    if (!company.isVerified) {
      adminAPI.updateCompanyVerification(company._id || company.id, { isVerified: true })
        .then((response) => {
          const updated = response.data?.company;
          setCompanies((prevCompanies) => prevCompanies.map((item) => item._id === company._id ? updated : item));
          toast.success(`${company.companyName || 'Company'} has been verified.`);
        })
        .catch(() => toast.error('Unable to update company verification.'));
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
                <tr key={company._id || company.id}>
                  <td>{company.companyName || 'Not available'}</td>
                  <td>{company.email || 'Not available'}</td>
                  <td>{company.industry || 'Not available'}</td>
                  <td>{company.isVerified ? 'Verified' : 'Pending'}</td>
                  <td>
                    <button className="btn-secondary" onClick={() => handleView(company)}>
                      View
                    </button>
                    <button
                      className={company.status === 'Pending' ? 'btn-primary' : 'btn-secondary'}
                      onClick={() => handleDetails(company)}
                    >
                      {!company.isVerified ? 'Verify' : 'Details'}
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
