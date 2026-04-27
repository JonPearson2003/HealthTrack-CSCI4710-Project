import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './Profile.css';

export default function Profile() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-content">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account settings</p>
      </div>

      <div className="profile-card card">
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h2>{user?.username}</h2>
            <p>{user?.email}</p>
          </div>
        </div>

        <div className="profile-details">
          <div className="profile-detail-item">
            <span className="profile-detail-label">Username</span>
            <span className="profile-detail-value">{user?.username}</span>
          </div>
          <div className="profile-detail-item">
            <span className="profile-detail-label">Email</span>
            <span className="profile-detail-value">{user?.email}</span>
          </div>
          <div className="profile-detail-item">
            <span className="profile-detail-label">Role</span>
            <span className="badge badge-primary">{user?.role}</span>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={handleLogout} className="btn btn-danger">
            <svg viewBox="0 0 20 20" fill="currentColor" width="18" height="18">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm9.707 7.707a1 1 0 000 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L13 8.914V12a1 1 0 001 1 1 1 0 001-1V8.914l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 000-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L12 7.086V4a1 1 0 00-1-1 1 1 0 00-1 1v3.086L8.707 4.293a1 1 0 00-1.414 1.414l3 3z" clipRule="evenodd" />
            </svg>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}