import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Signup from './components/Signup';
import Sales from './components/Sales';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import AdminMedicineModule from './components/admin/AdminMedicineModule';
import AdminAnalytics from './components/admin/AdminAnalytics';
import WorkerAnalytics from './components/WorkerAnalytics';
import AdminSalesByDate from './components/admin/AdminSalesByDate';
import './App.css';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        {/* <Route path="/inventory" element={<Inventory />} /> */}
        <Route path="/sales" element={<Sales />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/admin/medicines" element={<AdminMedicineModule />} />
        <Route path="/admin/analytics" element={<AdminAnalytics />} />
        <Route path="/worker/analytics" element={<WorkerAnalytics />} />
        <Route path="/admin/sales-by-date" element={<AdminSalesByDate />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
