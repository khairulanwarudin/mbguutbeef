import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, LogOut, Mail, Key, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { updatePassword } from 'firebase/auth';
import { auth } from '../../config/firebase';
import Swal from 'sweetalert2';

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar Aplikasi?',
      text: "Anda yakin ingin keluar dari TermoApp?",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'rgba(255,255,255,0.1)',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
      background: '#1e293b',
      color: '#f8fafc'
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        navigate('/login');
      }
    });
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return Swal.fire({ icon: 'error', title: 'Gagal', text: 'Password baru dan konfirmasi tidak cocok!', background: '#1e293b', color: '#f8fafc' });
    }
    
    setIsUpdating(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Password Anda telah berhasil diperbarui.',
        background: '#1e293b',
        color: '#f8fafc',
        timer: 2000,
        showConfirmButton: false
      });
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      // Jika error requires-recent-login, minta user relogin
      if (error.code === 'auth/requires-recent-login') {
        Swal.fire({
          icon: 'warning',
          title: 'Sesi Kedaluwarsa',
          text: 'Demi keamanan, Anda harus logout dan login kembali sebelum dapat mengganti password.',
          background: '#1e293b',
          color: '#f8fafc'
        });
      } else {
        Swal.fire({ icon: 'error', title: 'Gagal', text: error.message, background: '#1e293b', color: '#f8fafc' });
      }
    } finally {
      setIsUpdating(false);
    }
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
          {showPasswordForm ? (
            <div className="glass-card" style={{ padding: '1rem', background: 'rgba(0,0,0,0.2)' }}>
              <form onSubmit={handleUpdatePassword}>
                <div className="input-group mb-2">
                  <label>Password Baru</label>
                  <div style={{ position: 'relative' }}>
                    <Key className="input-icon" size={18} />
                    <input 
                      type={showPass ? 'text' : 'password'} 
                      className="input-field" 
                      placeholder="Minimal 6 karakter"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPass(!showPass)}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                    >
                      {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="input-group mb-3">
                  <label>Konfirmasi Password Baru</label>
                  <div style={{ position: 'relative' }}>
                    <Key className="input-icon" size={18} />
                    <input 
                      type={showConfirmPass ? 'text' : 'password'} 
                      className="input-field" 
                      placeholder="Ulangi password baru"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowConfirmPass(!showConfirmPass)}
                      style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                    >
                      {showConfirmPass ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button type="submit" className="btn btn-primary" disabled={isUpdating} style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}>
                    {isUpdating ? <Loader2 className="animate-spin" size={18} style={{ margin: '0 auto' }} /> : 'Simpan'}
                  </button>
                  <button type="button" className="btn" onClick={() => setShowPasswordForm(false)} style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.1)', color: 'white' }}>
                    Batal
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <button 
              onClick={() => setShowPasswordForm(true)}
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
          )}
          
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
