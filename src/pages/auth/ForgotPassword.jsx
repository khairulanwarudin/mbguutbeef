import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Loader2, ArrowLeft } from 'lucide-react';
import Swal from 'sweetalert2';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await resetPassword(email);
      Swal.fire({
        icon: 'success',
        title: 'Terkirim!',
        text: 'Cek email Anda untuk tautan reset password.',
        background: '#1e293b',
        color: '#f8fafc'
      });
      navigate('/login');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
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
        <div className="mb-3">
          <Link to="/login" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
            <ArrowLeft size={16} /> Kembali ke Login
          </Link>
        </div>
        
        <div className="text-center mb-3">
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>Lupa Password</h2>
          <p className="mt-2 text-muted" style={{ fontSize: '0.875rem' }}>
            Masukkan email Anda, kami akan mengirimkan tautan untuk mereset kata sandi.
          </p>
        </div>

        <form onSubmit={handleReset}>
          <div className="input-group">
            <label>Email Terdaftar</label>
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

          <button type="submit" className="btn btn-primary mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Kirim Link Reset'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
