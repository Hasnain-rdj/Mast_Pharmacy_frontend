import React, { useEffect, useState } from 'react';
import { FaSearch, FaList, FaPills, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import './Auth.css';
import API from '../api';
import { getStoredUser } from '../utils';

const ClinicInventory = () => {
  const user = getStoredUser();
  const userClinic = user?.clinic;
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState('asc');

  // Fetch medicines on component mount
  useEffect(() => {
    if (userClinic) {
      setLoading(true);
      API.get(`/api/medicines?clinic=${userClinic}`)
        .then(res => {
          setMedicines(res.data);
          setLoading(false);
        })
        .catch(err => {
          setError('Failed to load medicines');
          setMedicines([]);
          setLoading(false);
        });
    }
  }, [userClinic]);

  // Helper: fuzzy/character-sequence match (e.g., 'ot' matches 'Oxytocin')
  function fuzzyMatch(str, pattern) {
    if (!pattern) return true;
    str = str.toLowerCase();
    pattern = pattern.toLowerCase();
    let j = 0;
    for (let i = 0; i < str.length && j < pattern.length; i++) {
      if (str[i] === pattern[j]) j++;
    }
    return j === pattern.length;
  }

  // Sort and filter medicines
  const filteredMedicines = medicines
    .filter(med => 
      !search.trim() || 
      med.name.toLowerCase().includes(search.toLowerCase()) ||
      fuzzyMatch(med.name, search)
    )
    .sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      } else if (sortField === 'quantity') {
        return sortDirection === 'asc'
          ? a.quantity - b.quantity
          : b.quantity - a.quantity;
      }
      return 0;
    });

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return <FaSort />;
    return sortDirection === 'asc' ? <FaSortUp /> : <FaSortDown />;
  };
  return (
    <div className="container-fluid" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f3f6fa 60%, #e3eaf2 100%)', padding: 0, margin: 0, display: 'flex', justifyContent: 'center' }}>
      <div className="container py-4" style={{ maxWidth: 1200, marginTop: '100px', width: '100%' }}>
        <h2 style={{ 
          color: '#1976d2', 
          fontWeight: 900, 
          marginBottom: 24, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 12, 
          fontSize: 32 
        }}>
          <FaPills /> Clinic Medicine Inventory
        </h2>
        
        {/* Search Bar */}
        <div className="row mb-4">
          <div className="col-md-6">
            <div className="input-group" style={{ position: 'relative', margin: 0 }}>
              <FaSearch style={{ color: '#1976d2' }} />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search medicines..."
                autoComplete="off"
                style={{ zIndex: 2 }}
              />
            </div>
          </div>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading medicines...</p>
          </div>
        ) : (
          <>
            {/* Stats Card */}
            <div className="row mb-4">
              <div className="col-md-4">
                <div style={{ 
                  background: '#f3f6fa', 
                  borderRadius: 16, 
                  boxShadow: '0 2px 12px rgba(25, 118, 210, 0.07)',
                  padding: 24,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <FaList style={{ color: '#1976d2', fontSize: 24 }} />
                  <div style={{ fontWeight: 600, fontSize: 18 }}>
                    Total Items: {filteredMedicines.length}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Medicines Table */}
            <div style={{ 
              background: '#fff', 
              borderRadius: 12, 
              boxShadow: '0 2px 12px rgba(25, 118, 210, 0.07)', 
              padding: 24,
              overflowX: 'auto'
            }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 17 }}>
                <thead>
                  <tr style={{ background: '#e3eaf2' }}>
                    <th 
                      style={{ padding: 16, cursor: 'pointer', userSelect: 'none' }} 
                      onClick={() => handleSort('name')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        Medicine Name {getSortIcon('name')}
                      </div>
                    </th>
                    <th 
                      style={{ padding: 16, cursor: 'pointer', userSelect: 'none', textAlign: 'center' }} 
                      onClick={() => handleSort('quantity')}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}>
                        Available Quantity {getSortIcon('quantity')}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMedicines.length === 0 ? (
                    <tr>
                      <td colSpan="2" style={{ padding: 24, textAlign: 'center', color: '#888' }}>
                        No medicines found
                      </td>
                    </tr>
                  ) : (
                    filteredMedicines.map(med => (
                      <tr key={med._id} style={{ borderBottom: '1px solid #e3eaf2' }}>
                        <td style={{ padding: 16 }}>{med.name}</td>
                        <td style={{ padding: 16, textAlign: 'center' }}>
                          <span style={{ 
                            background: med.quantity > 10 ? '#e8f5e9' : med.quantity > 0 ? '#fff3e0' : '#ffebee',
                            color: med.quantity > 10 ? '#2e7d32' : med.quantity > 0 ? '#ef6c00' : '#c62828',
                            padding: '6px 16px',
                            borderRadius: 20,
                            fontWeight: 600,
                            display: 'inline-block',
                            minWidth: '80px'
                          }}>
                            {med.quantity}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>        </>
      )}
      </div>
    </div>
  );
};

export default ClinicInventory;
