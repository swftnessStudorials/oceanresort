import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getAllReservations } from '../firebase/reservationService';
import './Dashboard.css';

export default function Dashboard() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await getAllReservations();
        if (!cancelled) setReservations(data);
      } catch (e) {
        if (!cancelled) {
          const msg = e?.code === 'permission-denied'
            ? 'Permission denied. Check Firestore rules or sign out and sign in again.'
            : (e?.message || 'Failed to load reservations.');
          setError(msg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  const filtered = useMemo(() => {
    let list = reservations;
    if (filterStatus !== 'all') {
      list = list.filter((r) => (r.status || 'confirmed') === filterStatus);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (r) =>
          (r.reservationNumber && r.reservationNumber.toLowerCase().includes(q)) ||
          (r.guestName && r.guestName.toLowerCase().includes(q)) ||
          (r.contactNumber && r.contactNumber.includes(q))
      );
    }
    return list;
  }, [reservations, search, filterStatus]);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const total = reservations.length;
    const confirmed = reservations.filter((r) => (r.status || 'confirmed') === 'confirmed').length;
    const cancelled = reservations.filter((r) => r.status === 'cancelled').length;
    const upcoming = reservations.filter(
      (r) => (r.status || 'confirmed') === 'confirmed' && r.checkIn >= today
    ).length;
    return { total, confirmed, cancelled, upcoming };
  }, [reservations]);

  const quickLinks = [
    { to: '/add-reservation', label: 'Add New Reservation', desc: 'Register a new guest and create a booking', icon: '➕' },
    { to: '/view-reservation', label: 'View Reservation', desc: 'Look up booking details by reservation number', icon: '🔍' },
    { to: '/bill', label: 'Calculate Bill', desc: 'Compute and print the total stay cost', icon: '🧾' },
    { to: '/help', label: 'Help', desc: 'Guidelines for using the system', icon: '❓' },
  ];

  return (
    <div className="dashboard page-enter">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-intro">Welcome to Ocean View Resort. Manage reservations and guest bookings from here.</p>

      <section className="dashboard-stats card-enter">
        <h2 className="sr-only">Summary</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Reservations</span>
          </div>
          <div className="stat-card stat-confirmed">
            <span className="stat-value">{stats.confirmed}</span>
            <span className="stat-label">Confirmed</span>
          </div>
          <div className="stat-card stat-upcoming">
            <span className="stat-value">{stats.upcoming}</span>
            <span className="stat-label">Upcoming</span>
          </div>
          <div className="stat-card stat-cancelled">
            <span className="stat-value">{stats.cancelled}</span>
            <span className="stat-label">Cancelled</span>
          </div>
        </div>
      </section>

      <section className="quick-links">
        <h2>Quick Actions</h2>
        <div className="quick-links-grid">
          {quickLinks.map(({ to, label, desc, icon }, i) => (
            <Link
              key={to}
              to={to}
              className="quick-link-card card-enter"
              style={{ animationDelay: `${i * 0.05}s` }}
            >
              <span className="quick-link-icon">{icon}</span>
              <h3>{label}</h3>
              <p>{desc}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="recent-reservations">
        <div className="section-header">
          <h2>Reservations</h2>
          <div className="reservation-filters">
            <input
              type="text"
              placeholder="Search by number, guest, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
              aria-label="Search reservations"
            />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="filter-select"
              aria-label="Filter by status"
            >
              <option value="all">All</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        {loading && <p className="loading-msg">Loading reservations...</p>}
        {error && <p className="error-msg">{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="empty-msg">
            {reservations.length === 0 ? (
              <>No reservations yet. <Link to="/add-reservation">Add your first reservation</Link>.</>
            ) : (
              'No reservations match your search.'
            )}
          </p>
        )}
        {!loading && !error && filtered.length > 0 && (
          <div className="table-wrap card-enter">
            <table className="reservations-table">
              <thead>
                <tr>
                  <th>Reservation #</th>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-in</th>
                  <th>Check-out</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 15).map((r) => (
                  <tr key={r.id} className={r.status === 'cancelled' ? 'row-cancelled' : ''}>
                    <td><strong>{r.reservationNumber}</strong></td>
                    <td>{r.guestName}</td>
                    <td>{r.roomType}</td>
                    <td>{r.checkIn}</td>
                    <td>{r.checkOut}</td>
                    <td>
                      <span className={`status-badge status-${r.status || 'confirmed'}`}>
                        {r.status || 'confirmed'}
                      </span>
                    </td>
                    <td>
                      {r.status !== 'cancelled' && (
                        <Link to={`/edit-reservation/${r.id}`} className="link-edit">
                          Edit
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
