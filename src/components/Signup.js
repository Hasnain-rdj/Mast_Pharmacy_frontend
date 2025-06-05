import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaUser, FaLock, FaEnvelope, FaClinicMedical, FaUserCircle } from 'react-icons/fa';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();
  return (
    <div className="auth-container signup-form">
      <div className="auth-logo-wrapper">
        <FaUserCircle className="auth-logo" size={80} />
      </div>
      <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 4 }}>Create Account</h2>
      <p style={{ color: '#6b7280', marginBottom: 18, fontSize: '1.05rem' }}>Sign up to join Mast Pharmacy</p>
      <Formik
        initialValues={{ name: '', email: '', password: '', role: '', clinic: '' }}
        enableReinitialize={true}
        validationSchema={Yup.object({
          name: Yup.string().required('Required'),
          email: Yup.string().email('Invalid email').required('Required'),
          password: Yup.string().min(6, 'Minimum 6 characters').required('Required'),
          role: Yup.string().oneOf(['admin', 'worker'], 'Select a role').required('Required'),
          clinic: Yup.string().when('role', (role, schema) =>
            role === 'worker' ? schema.required('Clinic is required for workers') : schema.notRequired()
          ),
        })}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          try {
            await API.post('/api/auth/signup', values);
            setStatus({ success: 'Signup successful! Please login.' });
            setTimeout(() => navigate('/login'), 1000);
          } catch (err) {
            setStatus({ error: err.response?.data?.message || 'Signup failed' });
          }
          setSubmitting(false);
        }}
      >
        {({ isSubmitting, status, setFieldValue, values }) => (
          <Form className="auth-form">
            <div className="input-group">
              <FaUser />
              <Field name="name" type="text" placeholder="Name" />
            </div>
            <ErrorMessage name="name" component="div" className="error" />
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
            <div className="input-group">
              <FaUser />
              <Field as="select" name="role" onChange={e => {
                setFieldValue('role', e.target.value);
                if (e.target.value !== 'worker') setFieldValue('clinic', '');
              }}>
                <option value="">Select Role</option>
                <option value="admin">Admin</option>
                <option value="worker">Pharmacy Worker</option>
              </Field>
            </div>
            <ErrorMessage name="role" component="div" className="error" />
            {values.role === 'worker' && (
              <>
                <div className="input-group">
                  <FaClinicMedical />
                  <Field name="clinic" type="text" placeholder="Clinic" />
                </div>
                <ErrorMessage name="clinic" component="div" className="error" />
              </>
            )}
            <button type="submit" disabled={isSubmitting}>
              Sign Up
            </button>
            {status && status.error && <div className="error">{status.error}</div>}
            {status && status.success && <div className="success">{status.success}</div>}
          </Form>
        )}
      </Formik>
      <div className="auth-redirect">
        <span>Already have an account?</span>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default Signup;