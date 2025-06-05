import React, { useEffect, useState } from 'react';
import API from '../api';
import { FaChartBar, FaFilePdf, FaSearch, FaPills, FaDollarSign, FaListOl } from 'react-icons/fa';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import './Auth.css';
Chart.register(ArcElement, Tooltip, Legend);

const WorkerAnalytics = () => {
  const user = JSON.parse(localStorage.getItem('user'));
  const [stats, setStats] = useState({ totalSales: 0, totalRevenue: 0, topMedicines: [] });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [month, setMonth] = useState('');
  // Track if monthly analytics is active
  const [isMonthly, setIsMonthly] = useState(false);

  useEffect(() => {
    fetchStats();
    // eslint-disable-next-line
  }, [user.clinic, fromDate, toDate]);

  // Only run fetchMonthlyStats when month changes and in monthly mode
  useEffect(() => {
    if (isMonthly && month) fetchMonthlyStats();
    // eslint-disable-next-line
  }, [user.clinic, month, isMonthly]);

  const fetchStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/api/sales/analytics?clinic=${user.clinic}&from=${fromDate}&to=${toDate}`);
      setStats(res.data);
    } catch (err) {
      setError('Failed to fetch analytics');
      setStats({ totalSales: 0, totalRevenue: 0, topMedicines: [] });
    }
    setLoading(false);
  };

  const fetchMonthlyStats = async () => {
    if (!month) return;
    setLoading(true);
    setError('');
    try {
      const res = await API.get(`/api/sales/monthly-analytics?clinic=${user.clinic}&month=${month}`);
      setStats(res.data);
    } catch (err) {
      setError('Failed to fetch monthly analytics');
      setStats({ totalSales: 0, totalRevenue: 0, topMedicines: [] });
    }
    setLoading(false);
  };

  const handlePDF = async () => {
    const jsPDF = (await import('jspdf')).default;
    const autoTable = (await import('jspdf-autotable')).default;
    const doc = new jsPDF();
    doc.text(`Analytics Report - ${user.clinic}`, 14, 18);
    doc.text(`From: ${fromDate || 'All Time'}  To: ${toDate || 'All Time'}`, 14, 28);
    autoTable(doc, {
      head: [['Medicine', 'Quantity Sold', 'Revenue']],
      body: stats.topMedicines.map(m => [m.name, m.quantity, m.revenue]),
      startY: 38,
    });
    doc.text(`Total Sales: ${stats.totalSales}`, 14, doc.lastAutoTable.finalY + 12);
    doc.text(`Total Revenue: ${stats.totalRevenue}`, 14, doc.lastAutoTable.finalY + 22);
    doc.save(`analytics_${user.clinic}_${Date.now()}.pdf`);
  };

  const handleMonthlyClick = () => {
    setIsMonthly(true);
    // fetchMonthlyStats will be triggered by useEffect
  };

  const handleSearchClick = () => {
    setIsMonthly(false);
    fetchStats();
  };

  // Pie chart data for top medicines
  const pieData = {
    labels: stats.topMedicines.map(m => m.name),
    datasets: [
      {
        label: 'Quantity Sold',
        data: stats.topMedicines.map(m => m.quantity),
        backgroundColor: [
          '#4caf50', '#2196f3', '#ff9800', '#9c27b0', '#f44336', '#00bcd4', '#ffc107', '#8bc34a', '#e91e63', '#3f51b5'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 0' }}>
      <h2 style={{ color: '#1976d2', fontWeight: 900, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, fontSize: 32, flexWrap: 'wrap' }}>
        <FaChartBar /> Clinic Analytics
      </h2>
      <div style={{ display: 'flex', gap: 18, marginBottom: 24, alignItems: 'center', flexWrap: 'wrap' }}>
        <label style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>Clinic:</label>
        <span style={{ fontWeight: 700, color: '#1976d2', fontSize: 18 }}>{user.clinic}</span>
        <label style={{ fontWeight: 600 }}>From:</label>
        <input
          type="date"
          value={fromDate}
          onChange={e => setFromDate(e.target.value)}
          className="custom-date-input"
          style={{ minWidth: 140, maxWidth: 180, marginRight: 6 }}
        />
        <label style={{ fontWeight: 600 }}>To:</label>
        <input
          type="date"
          value={toDate}
          onChange={e => setToDate(e.target.value)}
          className="custom-date-input"
          style={{ minWidth: 140, maxWidth: 180, marginRight: 6 }}
        />
        <button className="main-action-btn" onClick={handleSearchClick} style={{ marginLeft: 10, marginBottom: 8 }}><FaSearch /> Search</button>
        <label style={{ fontWeight: 600, marginLeft: 18 }}>Or Month:</label>
        <input
          type="month"
          value={month}
          onChange={e => setMonth(e.target.value)}
          className="custom-date-input"
          style={{ minWidth: 140, maxWidth: 180, marginRight: 6 }}
        />
        <button className="main-action-btn" style={{ marginLeft: 10, background: '#1976d2', color: '#fff', marginBottom: 8 }} onClick={handleMonthlyClick}>Monthly Analytics</button>
        <button className="main-action-btn" style={{ background: '#d32f2f', color: '#fff', marginLeft: 10, marginBottom: 8 }} onClick={handlePDF}><FaFilePdf /> Download PDF</button>
      </div>
      {error && <div className="error">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <>
          {/* Stat Cards */}
          <div style={{ display: 'flex', gap: 32, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            <div style={{ flex: 1, minWidth: 220, maxWidth: 350, background: '#f3f6fa', borderRadius: 16, boxShadow: '0 2px 12px rgba(25, 118, 210, 0.07)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
              <FaListOl style={{ color: '#1976d2', fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontWeight: 800, fontSize: 28 }}>{stats.totalSales}</div>
              <div style={{ color: '#1976d2', fontWeight: 600, fontSize: 16 }}>Total Sales</div>
            </div>
            <div style={{ flex: 1, minWidth: 220, maxWidth: 350, background: '#f3f6fa', borderRadius: 16, boxShadow: '0 2px 12px rgba(25, 118, 210, 0.07)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
              <FaDollarSign style={{ color: '#43a047', fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontWeight: 800, fontSize: 28 }}>{stats.totalRevenue}</div>
              <div style={{ color: '#43a047', fontWeight: 600, fontSize: 16 }}>Total Revenue</div>
            </div>
            <div style={{ flex: 1, minWidth: 220, maxWidth: 350, background: '#f3f6fa', borderRadius: 16, boxShadow: '0 2px 12px rgba(25, 118, 210, 0.07)', padding: 24, display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
              <FaPills style={{ color: '#ff9800', fontSize: 32, marginBottom: 8 }} />
              <div style={{ fontWeight: 800, fontSize: 28 }}>{stats.topMedicines.length}</div>
              <div style={{ color: '#ff9800', fontWeight: 600, fontSize: 16 }}>Top Medicines</div>
            </div>
          </div>
          {/* Pie Chart */}
          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 2px 12px rgba(25, 118, 210, 0.07)', padding: 24, marginBottom: 32, minWidth: 280, overflowX: 'auto' }}>
            <h3 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 18, fontSize: 20 }}>Top 10 Medicines Sold</h3>
            {stats.topMedicines.length === 0 ? (
              <div style={{ color: '#888', fontWeight: 500, fontSize: 18 }}>No data available.</div>
            ) : (
              <div style={{ width: '100%', maxWidth: 600, height: 340, margin: '0 auto' }}>
                <Pie
                  data={pieData}
                  options={{
                    plugins: { legend: { position: 'right' } },
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                  style={{ height: '100%', width: '100%' }}
                />
              </div>
            )}
          </div>
          {/* Table */}
          <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(25, 118, 210, 0.07)', padding: 16, marginTop: 18, overflowX: 'auto' }}>
            <h3 style={{ color: '#1976d2', fontWeight: 700, marginBottom: 12, fontSize: 20 }}>Top Medicines Sold (Table)</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 17, minWidth: 320 }}>
              <thead>
                <tr style={{ background: '#e3eaf2' }}>
                  <th style={{ padding: 12 }}>Medicine</th>
                  <th style={{ padding: 12 }}>Quantity Sold</th>
                  <th style={{ padding: 12 }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {stats.topMedicines.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: 18, color: '#888' }}>No data available.</td></tr>
                ) : (
                  stats.topMedicines.map((m, i) => (
                    <tr key={i}>
                      <td style={{ padding: 10 }}>{m.name}</td>
                      <td style={{ padding: 10 }}>{m.quantity}</td>
                      <td style={{ padding: 10 }}>{m.revenue}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            <div style={{ marginTop: 24, fontWeight: 700, color: '#1976d2', fontSize: 18 }}>
              Total Sales: {stats.totalSales} &nbsp; | &nbsp; Total Revenue: {stats.totalRevenue}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default WorkerAnalytics;
