import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserCheck, UserX, Users, Trash2 } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminUsers = () => {
  const { getAllUsers, approveUser, removeUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [tab, setTab] = useState('pending'); // 'pending' or 'active'

  useEffect(() => {
    getAllUsers().then(data => setUsers(data));
  }, [getAllUsers]);

  const handleApprove = async (uid, email) => {
    try {
      await approveUser(uid);
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      Swal.fire({
        icon: 'success',
        title: 'Disetujui',
        text: `Akun ${email} telah disetujui.`,
        background: '#1e293b',
        color: '#f8fafc',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (uid, email) => {
    const result = await Swal.fire({
      title: 'Hapus Pengguna?',
      text: `Apakah Anda yakin ingin menghapus akses untuk ${email}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'rgba(255,255,255,0.1)',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      background: '#1e293b',
      color: '#f8fafc'
    });

    if (result.isConfirmed) {
      try {
        await removeUser(uid);
        const updatedUsers = await getAllUsers();
        setUsers(updatedUsers);
        Swal.fire({
          icon: 'success',
          title: 'Dihapus',
          text: `Akses untuk ${email} telah dicabut.`,
          background: '#1e293b',
          color: '#f8fafc',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        console.error(error);
        Swal.fire({
          icon: 'error',
          title: 'Gagal',
          text: 'Gagal menghapus pengguna.',
          background: '#1e293b',
          color: '#f8fafc'
        });
      }
    }
  };

  const pendingUsers = users.filter(u => !u.isApproved);
  const activeUsers = users.filter(u => u.isApproved);

  const displayUsers = tab === 'pending' ? pendingUsers : activeUsers;

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Users size={28} className="text-primary" />
        <h2 style={{ margin: 0 }}>Kelola Pengguna</h2>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button 
          className={`btn ${tab === 'pending' ? 'btn-primary' : ''}`}
          style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem', background: tab === 'pending' ? '' : 'rgba(255,255,255,0.05)', color: tab === 'pending' ? 'white' : 'var(--text-muted)' }}
          onClick={() => setTab('pending')}
        >
          Menunggu ({pendingUsers.length})
        </button>
        <button 
          className={`btn ${tab === 'active' ? 'btn-primary' : ''}`}
          style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem', background: tab === 'active' ? '' : 'rgba(255,255,255,0.05)', color: tab === 'active' ? 'white' : 'var(--text-muted)' }}
          onClick={() => setTab('active')}
        >
          Aktif ({activeUsers.length})
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1rem' }}>
        {displayUsers.length === 0 ? (
          <div className="text-center" style={{ padding: '2rem 1rem', color: 'var(--text-muted)' }}>
            {tab === 'pending' ? <UserX size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} /> : <UserCheck size={40} style={{ opacity: 0.3, marginBottom: '1rem' }} />}
            <p>{tab === 'pending' ? 'Tidak ada pengguna yang menunggu persetujuan.' : 'Belum ada pengguna aktif.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {displayUsers.map(user => (
              <div key={user.uid} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                background: 'rgba(0,0,0,0.2)',
                borderRadius: '0.75rem',
                border: '1px solid var(--glass-border)'
              }}>
                <div>
                  <p style={{ margin: '0 0 0.25rem 0', fontWeight: '500' }}>{user.email}</p>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    Role: <span style={{ textTransform: 'capitalize', color: user.role === 'admin' ? 'var(--warning)' : 'inherit' }}>{user.role}</span>
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  {tab === 'pending' && (
                    <button 
                      onClick={() => handleApprove(user.uid, user.email)}
                      className="btn btn-primary"
                      style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                    >
                      Setujui
                    </button>
                  )}
                  {tab === 'active' && (
                    <span style={{ fontSize: '0.75rem', color: 'var(--success)' }}>
                      <UserCheck size={20} />
                    </span>
                  )}
                  {user.role !== 'admin' && (
                    <button 
                      onClick={() => handleDelete(user.uid, user.email)}
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: 'var(--error)', 
                        cursor: 'pointer',
                        padding: '0.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                      title="Hapus Pengguna"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUsers;
