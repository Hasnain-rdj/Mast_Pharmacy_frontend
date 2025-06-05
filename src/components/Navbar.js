import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FaCapsules, FaSignOutAlt, FaUser, FaPills, FaChartBar } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();  const storedUser = localStorage.getItem('user');
  let user = null;
  try {
    user = storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    localStorage.removeItem('user'); // Clear invalid data
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-logo">
        <FaCapsules size={36} className="logo-icon" />
        <span className="navbar-title">Mast Pharmacy</span>
      </div>
      <div className="navbar-links">
        {user ? (
          <>
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}><FaUser style={{marginRight:4}}/>Dashboard</Link>
            {user.role === 'admin' && <Link to="/admin/medicines" className={location.pathname === '/admin/medicines' ? 'active' : ''}><FaPills style={{marginRight:4}}/>Medicines</Link>}
            {user.role === 'admin' && <Link to="/admin/analytics" className={location.pathname === '/admin/analytics' ? 'active' : ''}><FaChartBar style={{marginRight:4}}/>Analytics</Link>}
            {user.role === 'worker' && <Link to="/worker/analytics" className={location.pathname === '/worker/analytics' ? 'active' : ''}><FaChartBar style={{marginRight:4}}/>Analytics</Link>}
            {/* <Link to="/inventory" className={location.pathname === '/inventory' ? 'active' : ''}><FaCapsules style={{marginRight:4}}/>Inventory</Link> */}
            <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}><FaUser style={{marginRight:4}}/>Profile</Link>
            <button onClick={handleLogout} className="logout-btn" title="Logout" style={{marginLeft:8, background:'none', border:'none', color:'#fff', cursor:'pointer', fontSize:'1.13rem', display:'inline-flex', alignItems:'center'}}><FaSignOutAlt style={{marginRight:4}}/>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>Login</Link>
            <Link to="/signup" className={location.pathname === '/signup' ? 'active' : ''}>Signup</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
