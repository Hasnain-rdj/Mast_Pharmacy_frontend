import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCapsules, FaSignOutAlt, FaUser, FaPills, FaChartBar, FaBars, FaTimes } from 'react-icons/fa';
import './Navbar.css';

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

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const user = getStoredUser();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiry');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    navigate('/login');
  };  // Close menu when clicking on a link
  const handleNavClick = () => {
    setIsOpen(false);
  };
  
  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <FaCapsules size={36} className="logo-icon" />
        <span className="navbar-title">Mast Pharmacy</span>
      </div>
      <button className="menu-button" onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
      </button>
      <div className={`navbar-links ${isOpen ? 'active' : ''}`}>
        {user ? (
          <>            <Link to="/dashboard" onClick={handleNavClick} className={location.pathname === '/dashboard' ? 'active' : ''}><FaUser style={{marginRight:4}}/>Dashboard</Link>            {user.role === 'admin' && <Link to="/admin/medicines" onClick={handleNavClick} className={location.pathname === '/admin/medicines' ? 'active' : ''}><FaPills style={{marginRight:4}}/>Medicines</Link>}
            {user.role === 'admin' && <Link to="/admin/sales" onClick={handleNavClick} className={location.pathname === '/admin/sales' ? 'active' : ''}><FaPills style={{marginRight:4}}/>Sales</Link>}
            {user.role === 'admin' && <Link to="/admin/analytics" onClick={handleNavClick} className={location.pathname === '/admin/analytics' ? 'active' : ''}><FaChartBar style={{marginRight:4}}/>Analytics</Link>}
            {user.role === 'worker' && <Link to="/worker/analytics" onClick={handleNavClick} className={location.pathname === '/worker/analytics' ? 'active' : ''}><FaChartBar style={{marginRight:4}}/>Analytics</Link>}
            {user.role === 'worker' && <Link to="/inventory" onClick={handleNavClick} className={location.pathname === '/inventory' ? 'active' : ''}><FaPills style={{marginRight:4}}/>Inventory</Link>}
            <Link to="/profile" onClick={handleNavClick} className={location.pathname === '/profile' ? 'active' : ''}><FaUser style={{marginRight:4}}/>Profile</Link>
            <button onClick={() => {handleNavClick(); handleLogout();}} className="logout-btn" title="Logout" style={{marginLeft:8, background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:'1.13rem', display:'inline-flex', alignItems:'center'}}><FaSignOutAlt style={{marginRight:4}}/>Logout</button>
          </>        ) : (
          <>
            <Link to="/login" onClick={handleNavClick} className={location.pathname === '/login' ? 'active' : ''}>Login</Link>
            <Link to="/signup" onClick={handleNavClick} className={location.pathname === '/signup' ? 'active' : ''}>Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
