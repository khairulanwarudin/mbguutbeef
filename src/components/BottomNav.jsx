import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Cpu, ShieldCheck, LifeBuoy, Users, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BottomNav = () => {
  const { isAdmin } = useAuth();
  
  const navStyle = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '70px',
    background: 'var(--glass-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderTop: '1px solid var(--glass-border)',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    zIndex: 1000
  };

  const getLinkStyle = (isActive, highlightColor = 'var(--primary)') => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    color: isActive ? highlightColor : 'var(--text-muted)',
    textDecoration: 'none',
    fontSize: '0.75rem',
    fontWeight: isActive ? '600' : '400',
    transition: 'color 0.2s ease'
  });

  if (isAdmin) {
    return (
      <nav style={navStyle}>
        <NavLink to="/admin" end style={({ isActive }) => getLinkStyle(isActive, 'var(--warning)')}>
          <ShieldCheck size={24} />
          <span>Dasbor</span>
        </NavLink>
        
        <NavLink to="/admin/users" style={({ isActive }) => getLinkStyle(isActive, 'var(--warning)')}>
          <Users size={24} />
          <span>Pengguna</span>
        </NavLink>

        <NavLink to="/admin/tickets" style={({ isActive }) => getLinkStyle(isActive, 'var(--warning)')}>
          <LifeBuoy size={24} />
          <span>Tiket</span>
        </NavLink>
        
        <NavLink to="/profile" style={({ isActive }) => getLinkStyle(isActive, 'var(--warning)')}>
          <User size={24} />
          <span>Profil</span>
        </NavLink>
      </nav>
    );
  }

  // USER NAVIGATION
  return (
    <nav style={navStyle}>
      <NavLink to="/dashboard" style={({ isActive }) => getLinkStyle(isActive)}>
        <LayoutDashboard size={24} />
        <span>Dasbor</span>
      </NavLink>
      
      <NavLink to="/devices" style={({ isActive }) => getLinkStyle(isActive)}>
        <Cpu size={24} />
        <span>Alat ESP32</span>
      </NavLink>

      <NavLink to="/tickets" style={({ isActive }) => getLinkStyle(isActive)}>
        <LifeBuoy size={24} />
        <span>Pengaduan</span>
      </NavLink>

      <NavLink to="/profile" style={({ isActive }) => getLinkStyle(isActive)}>
        <User size={24} />
        <span>Profil</span>
      </NavLink>
    </nav>
  );
};

export default BottomNav;
