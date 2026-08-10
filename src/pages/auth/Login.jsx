import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Mail, Lock, Loader2, Eye, EyeOff } from 'lucide-react';
import Swal from 'sweetalert2';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil',
        text: 'Selamat datang kembali!',
        timer: 1500,
        showConfirmButton: false,
        background: '#1e293b',
        color: '#f8fafc'
      });
      navigate('/dashboard');
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
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
          <p className="mt-2">Masuk ke Dasbor Monitoring Anda</p>
        </div>

        <form onSubmit={handleLogin}>
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
                placeholder="• • • • • • • •"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
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

          <button type="submit" className="btn btn-primary mt-2" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Masuk'}
          </button>
        </form>

        <div className="flex justify-between mt-3" style={{ fontSize: '0.875rem' }}>
          <Link to="/forgot-password" style={{ color: 'var(--text-muted)' }}>Lupa Password?</Link>
          <span>Belum punya akun? <Link to="/register">Daftar</Link></span>
        </div>
      </div>
    </div>
  );
};

export default Login;
