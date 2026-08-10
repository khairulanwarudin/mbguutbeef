import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return Swal.fire({
        icon: 'error',
        title: 'Validasi Gagal',
        text: 'Password tidak cocok!',
        background: '#1e293b',
        color: '#f8fafc'
      });
    }

    setIsLoading(true);
    try {
      await register(email, password);
      Swal.fire({
        icon: 'success',
        title: 'Pendaftaran Berhasil',
        html: '<p style="font-size: 0.9rem">Akun Anda telah dibuat.</p><p style="font-size: 0.9rem; color: var(--warning)">Mohon cek email Anda untuk verifikasi, dan tunggu persetujuan dari Admin sebelum bisa login.</p>',
        background: '#1e293b',
        color: '#f8fafc',
      });
      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Daftar Gagal',
        text: error.message,
        background: '#1e293b',
        color: '#f8fafc'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center" style={{ minHeight: 'calc(100vh - 4rem)' }}>
      <div className="glass-card" style={{ width: '100%', maxWidth: '400px', margin: '0 auto' }}>
        <div className="text-center mb-3">
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>TermoApp</h2>
          <p className="mt-2 text-muted" style={{ fontSize: '0.875rem' }}>Buat Akun Baru</p>
        </div>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail className="input-icon" size={20} />
              <input 
                type="email" 
                className="input-field" 
                placeholder="email@anda.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock className="input-icon" size={20} />
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="input-field" 
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                style={{ paddingRight: '2.5rem' }}
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                tabIndex="-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="input-group">
            <label>Konfirmasi Password</label>
            <div style={{ position: 'relative' }}>
              <Lock className="input-icon" size={20} />
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                className="input-field" 
                placeholder="Ulangi password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                style={{ paddingRight: '2.5rem' }}
              />
              <button 
                type="button" 
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex' }}
                tabIndex="-1"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Daftar Sekarang'}
          </button>
        </form>

        <p className="text-center mt-3" style={{ fontSize: '0.875rem' }}>
          Sudah punya akun? <Link to="/login">Masuk di sini</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
