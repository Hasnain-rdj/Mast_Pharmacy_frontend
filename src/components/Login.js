import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const navigate = useNavigate();
  React.useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user) {
      if (user.role === 'admin') {
        navigate('/dashboard');
      } else if (user.role === 'worker') {
        navigate('/sales');
      }
    }
  }, [navigate]);
  return (
    <div className="auth-container login-form">
      <div className="auth-logo-wrapper">
        <img src="/logo192.png" alt="Mast Pharmacy Logo" className="auth-logo" />
      </div>
      <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 4 }}>Welcome Back</h2>
      <p style={{ color: '#6b7280', marginBottom: 18, fontSize: '1.05rem' }}>Login to your Mast Pharmacy account</p>
      <Formik
        initialValues={{ email: '', password: '', remember: false }}
        validationSchema={Yup.object({
          email: Yup.string().email('Invalid email').required('Required'),
          password: Yup.string().required('Required'),
        })}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          try {
            const res = await API.post('/api/auth/login', values);
            // If remember is checked, store in localStorage with expiry, else use sessionStorage
            if (values.remember) {
              const now = new Date();
              const expiry = now.getTime() + 7 * 24 * 60 * 60 * 1000; // 7 days
              localStorage.setItem('token', res.data.token);
              localStorage.setItem('user', JSON.stringify(res.data.user));
              localStorage.setItem('expiry', expiry);
            } else {
              sessionStorage.setItem('token', res.data.token);
              sessionStorage.setItem('user', JSON.stringify(res.data.user));
            }
            setStatus({ success: 'Login successful!' });
            setTimeout(() => navigate('/dashboard'), 1000);
          } catch (err) {
            setStatus({ error: err.response?.data?.message || 'Login failed' });
          }
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, status }) => (
          <Form className="auth-form">
            <div className="input-group">
              <FaEnvelope />
              <Field name="email" type="email" placeholder="Email" />
            </div>
            <ErrorMessage name="email" component="div" className="error" />
            <div className="input-group">
              <FaLock />
              <Field name="password" type="password" placeholder="Password" />
            </div>
            <ErrorMessage name="password" component="div" className="error" />
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <Field type="checkbox" name="remember" id="remember" style={{ marginRight: 8 }} />
              <label htmlFor="remember" style={{ fontSize: 15, color: '#555', cursor: 'pointer' }}>Remember me?</label>
            </div>
            <button type="submit" disabled={isSubmitting}>
              Login
            </button>
            {status && status.error && <div className="error">{status.error}</div>}
            {status && status.success && <div className="success">{status.success}</div>}
          </Form>
        )}
      </Formik>
      <div className="auth-redirect">
        <span>Don't have an account?</span>
        <Link to="/signup">Sign Up</Link>
      </div>
    </div>
  );
};

export default Login;
