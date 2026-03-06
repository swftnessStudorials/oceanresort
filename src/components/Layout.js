import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Layout.css';

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
    setMenuOpen(false);
  };

  const navItems = [
    { to: '/', label: 'Dashboard' },
    { to: '/add-reservation', label: 'Add Reservation' },
    { to: '/view-reservation', label: 'View Reservation' },
    { to: '/bill', label: 'Bill' },
    { to: '/help', label: 'Help' },
  ];

  return (
    <div className="layout">
      <header className="layout-header">
        <button
          type="button"
          className="menu-toggle"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span />
          <span />
          <span />
        </button>
        <NavLink to="/" className="layout-brand">
          <span className="brand-icon">🏖️</span>
          <span>Ocean View Resort</span>
        </NavLink>
        <nav className={`layout-nav ${menuOpen ? 'open' : ''}`}>
          {navItems.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
              onClick={() => setMenuOpen(false)}
            >
              {label}
            </NavLink>
          ))}
          <button type="button" className="nav-link logout" onClick={handleLogout}>
            Exit System
          </button>
        </nav>
      </header>
      <main className="layout-main">
        <Outlet />
      </main>
    </div>
  );
}
