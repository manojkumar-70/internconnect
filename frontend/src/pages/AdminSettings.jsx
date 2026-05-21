import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import '../styles/AdminPages.css';

const AdminSettings = () => {
  const [activeSetting, setActiveSetting] = useState(null);

  const handleClick = (setting) => {
    setActiveSetting(setting);
    if (setting === 'notifications') {
      toast.info('Notification rules can now be configured.');
    } else if (setting === 'policies') {
      toast.info('Policy editor opened. You can update terms and privacy settings here.');
    } else {
      toast.info('Workflow settings are ready to update.');
    }
  };

  const settingDetails = {
    workflow: {
      title: 'Approval Workflow',
      description:
        'Configure verification behavior for new students and companies. Enable automatic approvals, manual review, or a hybrid workflow with admin review and email verification.',
      items: [
        'Student registration approval',
        'Company verification workflow',
        'Auto-reject invalid accounts',
        'Email notifications for status changes'
      ]
    },
    notifications: {
      title: 'Notifications Configuration',
      description:
        'Set which admin alerts and platform emails are sent for important events like new registrations, company approvals, and application submissions.',
      items: [
        'New student signup alert',
        'New company signup alert',
        'Application received alert',
        'Feedback notification settings'
      ]
    },
    policies: {
      title: 'Platform Policies',
      description:
        'Manage your platform terms of service, privacy policy, and community guidelines. Keep your policy content up to date and compliant with local regulations.',
      items: [
        'Terms of Service',
        'Privacy Policy',
        'Community Guidelines',
        'Data retention policies'
      ]
    }
  };

  return (
    <>
      <Navbar />
      <div className="admin-container">
        <div className="admin-header">
          <h1>Platform Settings</h1>
          <p>Configure global settings, platform policies, and operational preferences.</p>
        </div>

        <div className="settings-panel">
          <div className="setting-card">
            <h3>Approval Workflow</h3>
            <p>Control student and company verification flows from a centralized panel.</p>
            <button className="btn-primary" onClick={() => handleClick('workflow')}>
              Edit Workflow
            </button>
          </div>
          <div className="setting-card">
            <h3>Notifications</h3>
            <p>Manage admin alerts and platform notification preferences.</p>
            <button className="btn-primary" onClick={() => handleClick('notifications')}>
              Configure
            </button>
          </div>
          <div className="setting-card">
            <h3>Platform Policies</h3>
            <p>Update terms, privacy settings and site policy documents.</p>
            <button className="btn-primary" onClick={() => handleClick('policies')}>
              Update Policies
            </button>
          </div>
        </div>

        {activeSetting && (
          <div className="setting-detail-card">
            <h2>{settingDetails[activeSetting].title}</h2>
            <p>{settingDetails[activeSetting].description}</p>
            <ul>
              {settingDetails[activeSetting].items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
      <Footer />
    </>
  );
};

export default AdminSettings;
