import React, { useEffect, useState } from 'react';
import { FaSearch, FaPlus } from 'react-icons/fa';
import './Auth.css';
import API from '../api';

const Sales = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const isWorker = user?.role === 'worker';
  const userClinic = user?.clinic;

  const [search, setSearch] = useState('');
  const [filtered, setFiltered] = useState([]);
  const [selectedMed, setSelectedMed] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [rate, setRate] = useState('');
  const [sales, setSales] = useState([]);
  const [error, setError] = useState('');

  // Fetch today's sales for this clinic
  useEffect(() => {
    if (isWorker && userClinic) {
      API.get(`/api/sales/today?clinic=${userClinic}`)
        .then(res => setSales(res.data))
        .catch(() => setError('Failed to fetch today\'s sales'));
    }
  }, [isWorker, userClinic]);

  // Update: Fetch filtered medicines from backend as user types
  useEffect(() => {
    if (isWorker && userClinic && search) {
      API.get(`/api/medicines?clinic=${userClinic}&search=${encodeURIComponent(search)}`)
        .then(res => setFiltered(res.data))
        .catch(() => setFiltered([]));
    } else {
      setFiltered([]);
    }
  }, [search, isWorker, userClinic]);

  // Calculate total
  const total = sales.reduce((t, s) => t + (s.quantity * s.rate), 0);

  const handleSelectMed = med => {
    setSelectedMed(med);
    setSearch(med.name);
    setRate(med.price);
    setFiltered([]);
  };

  const handleAddSale = async e => {
    e.preventDefault();
    if (!selectedMed || !quantity || !rate) return;
    setError('');
    try {
      await API.post('/api/sales', {
        medicineId: selectedMed._id,
        medicineName: selectedMed.name,
        clinic: userClinic,
        quantity: Number(quantity),
        rate: Number(rate),
        soldBy: user.email,
        soldByName: user.name,
      });
      // Refresh sales after successful sale
      API.get(`/api/sales/today?clinic=${userClinic}`)
        .then(res => setSales(res.data));
      setSelectedMed(null);
      setSearch('');
      setQuantity('');
      setRate('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to record sale');
    }
  };

  return (
    <div className="auth-container" style={{ maxWidth: 600 }}>
      <h2 style={{ color: '#1976d2', fontWeight: 800, marginBottom: 18 }}>Sales Entry</h2>
      {isWorker ? (
        <form className="auth-form" onSubmit={handleAddSale} style={{ background: '#f3f6fa', borderRadius: 12, padding: 18, marginBottom: 24 }}>
          <div className="input-group" style={{ position: 'relative', marginBottom: 16 }}>
            <FaSearch style={{ color: '#1976d2' }} />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setSelectedMed(null); }}
              placeholder="Search medicine name"
              autoComplete="off"
              required
              style={{ zIndex: 2 }}
            />
            {filtered.length > 0 && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #e3eaf2', borderRadius: 6, zIndex: 10 }}>
                {filtered.map(med => (
                  <div key={med._id} style={{ padding: '0.5rem 1rem', cursor: 'pointer' }} onClick={() => handleSelectMed(med)}>{med.name}</div>
                ))}
              </div>
            )}
          </div>
          {/* TEMPORARY DEBUG BUTTON BELOW SEARCH, VISIBLE AND CLEAR */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: '#1976d2', fontWeight: 600, marginBottom: 4 }}>Debug: Show fetched medicines in console</span>
            <button type="button" style={{ background: '#fffbe6', border: '2px solid #ffd700', borderRadius: 6, color: '#1976d2', fontWeight: 700, cursor: 'pointer', padding: '8px 22px', fontSize: 15 }}
              onClick={() => console.log('Filtered medicines:', filtered)}>
              Show Search Results
            </button>
          </div>
          {selectedMed && (
            <div style={{ background: '#fff', borderRadius: 8, padding: 12, margin: '10px 0', boxShadow: '0 1px 6px #e3eaf2' }}>
              <div><b>Name:</b> {selectedMed.name}</div>
              <div><b>Description:</b> {selectedMed.description}</div>
              <div><b>Available:</b> {selectedMed.quantity}</div>
              <div><b>Default Rate:</b> {selectedMed.price}</div>
            </div>
          )}
          <div className="input-group">
            <input
              type="number"
              min="1"
              max={selectedMed ? selectedMed.quantity : ''}
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              placeholder="Quantity Sold"
              required
              disabled={!selectedMed}
            />
          </div>
          <div className="input-group">
            <input
              type="number"
              min="0"
              value={rate}
              onChange={e => setRate(e.target.value)}
              placeholder="Rate"
              required
              disabled={!selectedMed}
            />
          </div>
          <button type="submit" disabled={!selectedMed || !quantity || !rate}>
            Add Sale <FaPlus style={{ marginLeft: 4 }} />
          </button>
        </form>
      ) : <div style={{ color: '#888' }}>Only clinic workers can enter sales.</div>}
      {sales.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <h3 style={{ color: '#1976d2', fontWeight: 700 }}>Today's Sales</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(25, 118, 210, 0.07)' }}>
            <thead>
              <tr style={{ background: '#e3eaf2' }}>
                <th style={{ padding: 12 }}>Medicine</th>
                <th style={{ padding: 12 }}>Quantity</th>
                <th style={{ padding: 12 }}>Rate</th>
                <th style={{ padding: 12 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((s, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e3eaf2' }}>
                  <td style={{ padding: 10 }}>{s.medicineName}</td>
                  <td style={{ padding: 10 }}>{s.quantity}</td>
                  <td style={{ padding: 10 }}>{s.rate}</td>
                  <td style={{ padding: 10 }}>{s.quantity * s.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ textAlign: 'right', marginTop: 10, fontWeight: 700, color: '#1976d2' }}>
            Total: {total}
          </div>
        </div>
      )}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default Sales;
