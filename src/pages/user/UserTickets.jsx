import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Plus, Clock, CheckCircle2, MessageSquare, LifeBuoy } from 'lucide-react';
import Swal from 'sweetalert2';

const UserTickets = () => {
  const { createTicket, getUserTickets } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [showForm, setShowForm] = useState(false);
  
  // Fake devices array for dropdown (ideally fetched from context/DB)
  const devices = [{ id: 'esp-1', name: 'ESP32 Ruang Tamu' }];
  
  const [selectedDevice, setSelectedDevice] = useState(devices[0].id);
  const [description, setDescription] = useState('');

  useEffect(() => {
    getUserTickets().then(data => setTickets(data));
  }, [getUserTickets]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!description) return;
    
    await createTicket(selectedDevice, description);
    const updatedTickets = await getUserTickets();
    setTickets(updatedTickets);
    setDescription('');
    setShowForm(false);
    
    Swal.fire({
      icon: 'success',
      title: 'Terkirim',
      text: 'Laporan kerusakan Anda telah dikirim ke Admin.',
      background: '#1e293b',
      color: '#f8fafc',
      timer: 1500,
      showConfirmButton: false
    });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={24} className="text-primary" />
          <h2 style={{ margin: 0 }}>Support Tickets</h2>
        </div>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="btn btn-primary"
          style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          <Plus size={16} /> Buat Tiket
        </button>
      </div>

      {showForm && (
        <div className="glass-card mb-3" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Lapor Kerusakan</h3>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label>Pilih Alat</label>
              <select 
                className="input-field" 
                value={selectedDevice}
                onChange={(e) => setSelectedDevice(e.target.value)}
                style={{ appearance: 'none', background: 'var(--glass-bg)', paddingLeft: '1rem' }}
              >
                {devices.map(d => (
                  <option key={d.id} value={d.id} style={{ color: '#000' }}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="input-group">
              <label>Deskripsi Masalah</label>
              <textarea 
                className="input-field" 
                rows="3"
                placeholder="Jelaskan kendala yang Anda alami..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ paddingLeft: '1rem', paddingTop: '0.75rem', height: 'auto' }}
                required
              />
            </div>
            <div className="flex gap-2 mt-2">
              <button type="submit" className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>Kirim</button>
              <button type="button" className="btn" style={{ padding: '0.5rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => setShowForm(false)}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tickets.length === 0 ? (
          <div className="text-center" style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <LifeBuoy size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>Anda belum pernah membuat tiket pengaduan.</p>
          </div>
        ) : (
          tickets.slice().reverse().map(ticket => (
            <div key={ticket.id} className="glass-card" style={{ padding: '1.25rem' }}>
              <div className="flex justify-between items-start mb-2">
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.date}</span>
                <span style={{ 
                  fontSize: '0.75rem', 
                  padding: '2px 8px', 
                  borderRadius: '12px',
                  background: ticket.status === 'Selesai' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(234, 179, 8, 0.1)',
                  color: ticket.status === 'Selesai' ? 'var(--success)' : 'var(--warning)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {ticket.status === 'Selesai' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                  {ticket.status}
                </span>
              </div>
              <p style={{ margin: '0 0 0.5rem 0', fontWeight: '500', fontSize: '0.9rem' }}>Alat: {ticket.deviceId}</p>
              <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-main)' }}>{ticket.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UserTickets;
