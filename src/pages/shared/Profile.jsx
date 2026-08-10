import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Mail, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div>
      <h2 style={{ margin: '0 0 1rem 0' }}>Profil Saya</h2>
      
      <div className="glass-card text-center" style={{ padding: '2rem 1rem', marginBottom: '1.5rem' }}>
        <div style={{
          width: '80px',
          height: '80px',
          background: 'var(--primary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto',
          color: '#fff'
        }}>
          <User size={40} />
        </div>
        <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.2rem' }}>Informasi Akun</h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
          <Mail size={16} />
          <span>{currentUser?.email}</span>
        </div>
        {/* Role identifier is intentionally hidden for cleaner UI as requested */}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', color: 'var(--text-muted)' }}>Pengaturan</h4>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <button 
            className="btn" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              background: 'rgba(255,255,255,0.05)',
              color: 'var(--text-main)',
              border: '1px solid var(--glass-border)'
            }}
          >
            <Key size={18} /> Ganti Password
          </button>
          
          <button 
            onClick={handleLogout}
            className="btn" 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '0.5rem',
              background: 'rgba(239, 68, 68, 0.1)',
              color: 'var(--danger)',
              border: '1px solid rgba(239, 68, 68, 0.2)'
            }}
          >
            <LogOut size={18} /> Keluar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
