import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Cpu, Users, PieChart } from 'lucide-react';

const AdminDashboard = () => {
  const { getAllUsers } = useAuth();
  const [stats, setStats] = useState({ users: 0, pending: 0, devices: 1 }); // Hardcoded device stat for mockup

  useEffect(() => {
    getAllUsers().then(allUsers => {
      setStats({
        users: allUsers.filter(u => u.isApproved).length,
        pending: allUsers.filter(u => !u.isApproved).length,
        devices: 1 // fake device count
      });
    });
  }, [getAllUsers]);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <PieChart size={24} className="text-primary" />
          System Statistics
        </h2>
      </div>
      
      <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
        Ringkasan keseluruhan aplikasi TermoApp.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        
        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
            <Users size={32} />
          </div>
          <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>
            {stats.users}
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Pengguna Aktif</p>
          {stats.pending > 0 && (
            <span style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--warning)', background: 'rgba(234, 179, 8, 0.1)', padding: '2px 8px', borderRadius: '12px' }}>
              {stats.pending} menunggu
            </span>
          )}
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ color: 'var(--success)', marginBottom: '0.5rem' }}>
            <Cpu size={32} />
          </div>
          <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>
            {stats.devices}
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Alat Terdaftar</p>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
