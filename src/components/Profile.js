import React, { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';
import { FaUserCircle, FaClinicMedical, FaEnvelope, FaPills, FaMoneyBillWave, FaChartBar, FaLock } from 'react-icons/fa';
import './Auth.css';

// Helper to get user from storage with expiry/session fallback
function getStoredUser() {
  const expiry = localStorage.getItem('expiry');
  const now = new Date().getTime();
  if (expiry && now > Number(expiry)) {
    // Expired, clear localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiry');
  }
  let user = localStorage.getItem('user');
  let token = localStorage.getItem('token');
  if (!user || !token) {
    // Try sessionStorage
    user = sessionStorage.getItem('user');
    token = sessionStorage.getItem('token');
  }
  return user ? JSON.parse(user) : null;
}

const Profile = () => {
  const navigate = useNavigate();
  const user = getStoredUser();
  const [profilePic, setProfilePic] = useState(user?.profilePic || '/logo192.png');
  const fileInput = useRef();
  const [stats, setStats] = useState({ totalSold: 0, totalEarned: 0 });
  const [showReset, setShowReset] = useState(false);
  const [resetForm, setResetForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');
  const [editProfile, setEditProfile] = useState(false);  const [profileForm, setProfileForm] = useState({ name: '', profilePic: profilePic });
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');  useEffect(() => {
    // Update profile form when user data is available
    if (user && !profileForm.name) {
      setProfileForm({ name: user.name || '', profilePic: user.profilePic || '/logo192.png' });
      setProfilePic(user.profilePic || '/logo192.png');
    }
  }, [user, profileForm.name]);

  useEffect(() => {
    let isMounted = true;
    
    const fetchStats = async () => {
      if (!user?.email) return;
      
      try {
        const res = await API.get(`/api/sales/stats?soldBy=${user.email}`);
        if (isMounted) {
          setStats(res.data);
        }
      } catch (err) {
        if (isMounted) {
          setStats({ totalSold: 0, totalEarned: 0 });
        }
      }
    };

    fetchStats();

    return () => {
      isMounted = false;
    };
  }, [user?.email]); // Only depend on user.email
  const handlePicChange = e => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();reader.onload = (ev) => {
        // Create an image element for compression
        const img = new Image();
        img.onload = () => {
          // Create canvas for compression
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Calculate new dimensions (max 500px width/height)
          let width = img.width;
          let height = img.height;
          if (width > height && width > 500) {
            height = Math.round((height * 500) / width);
            width = 500;
          } else if (height > 500) {
            width = Math.round((width * 500) / height);
            height = 500;
          }
          
          // Set canvas dimensions and draw image
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(img, 0, 0, width, height);
          
          // Get compressed image data
          const newProfilePic = canvas.toDataURL('image/jpeg', 0.8);          // Upload the compressed image
          API.put('/api/auth/update-profile', {
            email: user.email,
            name: user.name,
            profilePic: newProfilePic
          })
          .then((response) => {
            const updatedUser = response.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setProfilePic(updatedUser.profilePic);
            setProfileForm(f => ({...f, profilePic: updatedUser.profilePic}));
            setProfileError('');
          })
          .catch(err => {
            setProfileError(err.response?.data?.message || 'Failed to update profile picture');
          });
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  // Password reset handler
  const handleResetPassword = async e => {
    e.preventDefault();
    setResetError('');
    setResetSuccess('');
    if (!resetForm.oldPassword || !resetForm.newPassword || !resetForm.confirmPassword) {
      setResetError('All fields are required.');
      return;
    }
    if (resetForm.newPassword.length < 6) {
      setResetError('New password must be at least 6 characters.');
      return;
    }
    if (resetForm.newPassword !== resetForm.confirmPassword) {
      setResetError('Passwords do not match.');
      return;
    }
    try {
      await API.post('/api/auth/reset-password', {
        email: user.email,
        oldPassword: resetForm.oldPassword,
        newPassword: resetForm.newPassword
      });
      setResetSuccess('Password updated successfully!');
      setShowReset(false);
      setResetForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setResetError(err.response?.data?.message || 'Failed to reset password.');
    }
  };

  // Profile update handler
  const handleProfileUpdate = async e => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    if (!profileForm.name.trim()) {
      setProfileError('Name is required.');
      return;
    }
    try {      const response = await API.put('/api/auth/update-profile', {
        email: user.email,
        name: profileForm.name,
        profilePic: profileForm.profilePic
      });
      const updatedUser = response.data.user;
      setProfileSuccess('Profile updated successfully!');
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setProfilePic(updatedUser.profilePic);
      setEditProfile(false);
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Failed to update profile.');
    }
  };
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  if (!user) return null;
  const isAdmin = user.role === 'admin';
  return (
    <div className="auth-container" style={{ maxWidth: 500, width: '100%', marginTop: '90px', zIndex: 1 }}>
      <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 18, display: 'flex', alignItems: 'center', gap: 10 }}>
        <FaUserCircle /> Profile
      </h2><div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, marginBottom: 24 }}>        <div onClick={() => fileInput.current.click()} style={{ cursor: 'pointer' }}>
          <img
            src={profilePic}
            alt="Profile"
            style={{ width: 100, height: 100, borderRadius: '50%', border: '4px solid #1976d2', objectFit: 'cover' }}
          />
        </div>
        <input
          type="file"
          accept="image/*"
          ref={fileInput}
          style={{ display: 'none' }}
          onChange={handlePicChange}
        />
        {profileError && <div style={{ color: '#d32f2f', fontWeight: 600 }}>{profileError}</div>}
        {profileSuccess && <div style={{ color: '#388e3c', fontWeight: 600 }}>{profileSuccess}</div>}
        <button onClick={() => setEditProfile(true)} className="main-action-btn" style={{ background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
          Edit Profile
        </button>
        {editProfile && (
          <form onSubmit={handleProfileUpdate} style={{ background: '#f3f6fa', borderRadius: 12, padding: 18, marginTop: 8, width: '100%' }}>
            <div className="input-group">
              <input
                type="text"
                placeholder="Name"
                value={profileForm.name}
                onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}              required
              />
            </div>
            <button type="submit" className="main-action-btn"style={{ background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 16 }}>
              Save Changes
            </button>
            <button type="button" className="main-action-btn" style={{ background: '#e0e0e0', color: '#1976d2', fontWeight: 700, fontSize: 16, marginLeft: 10 }} onClick={() => { setEditProfile(false); setProfileError(''); setProfileSuccess(''); setProfileForm({ name: user.name, profilePic }); }}>
              Cancel
            </button>
          </form>
        )}
      </div>
      <div style={{ background: '#f3f6fa', borderRadius: 12, padding: 18, marginBottom: 24, width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <FaUserCircle style={{ color: '#1976d2' }} /> <b>Name:</b> {user.name}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <FaEnvelope style={{ color: '#1976d2' }} /> <b>Email:</b> {user.email}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <FaClinicMedical style={{ color: '#1976d2' }} /> <b>Clinic:</b> {user.clinic || 'Main Clinic'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <FaPills style={{ color: '#1976d2' }} /> <b>Role:</b> {user.role}
        </div>
      </div>
      {!isAdmin && (
        <div style={{ background: '#e3eaf2', borderRadius: 12, padding: 18, width: '100%' }}>
          <h3 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FaChartBar /> Analytics
          </h3>
          <div style={{ display: 'flex', gap: 32, justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <FaPills style={{ color: '#1976d2', fontSize: 28 }} />
              <div style={{ fontWeight: 700, fontSize: 22 }}>{stats.totalSold}</div>
              <div style={{ color: '#555', fontWeight: 500 }}>Medicines Sold</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <FaMoneyBillWave style={{ color: '#1976d2', fontSize: 28 }} />
              <div style={{ fontWeight: 700, fontSize: 22 }}>{stats.totalEarned}</div>
              <div style={{ color: '#555', fontWeight: 500 }}>Total Earned</div>
            </div>
          </div>
        </div>      )}
      {/* Password Reset Section */}<div style={{ margin: '32px 0 0 0', width: '100%', display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => setShowReset(v => !v)} className="main-action-btn" style={{ background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 16, marginBottom: 12 }}>
          <FaLock style={{ marginRight: 8 }} /> {showReset ? 'Cancel Password Reset' : 'Reset Password'}
        </button>
        {showReset && (
          <form onSubmit={handleResetPassword} style={{ background: '#f3f6fa', borderRadius: 12, padding: 18, marginTop: 8 }}>
            <div className="input-group">
              <input
                type="password"
                placeholder="Current Password"
                value={resetForm.oldPassword}
                onChange={e => setResetForm(f => ({ ...f, oldPassword: e.target.value }))}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="New Password"
                value={resetForm.newPassword}
                onChange={e => setResetForm(f => ({ ...f, newPassword: e.target.value }))}
                required
              />
            </div>
            <div className="input-group">
              <input
                type="password"
                placeholder="Confirm New Password"
                value={resetForm.confirmPassword}
                onChange={e => setResetForm(f => ({ ...f, confirmPassword: e.target.value }))}
                required
              />
            </div>
            {resetError && <div style={{ color: '#d32f2f', fontWeight: 600, marginBottom: 8 }}>{resetError}</div>}
            {resetSuccess && <div style={{ color: '#388e3c', fontWeight: 600, marginBottom: 8 }}>{resetSuccess}</div>}
            <button type="submit" className="main-action-btn" style={{ background: '#1976d2', color: '#fff', fontWeight: 700, fontSize: 16 }}>
              Update Password
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;
