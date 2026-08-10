import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { LifeBuoy, Clock, CheckCircle2 } from 'lucide-react';
import Swal from 'sweetalert2';

const AdminTickets = () => {
  const { getAllTickets, resolveTicket } = useAuth();
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    getAllTickets().then(data => setTickets(data));
  }, [getAllTickets]);

  const handleResolve = async (ticketId) => {
    try {
      await resolveTicket(ticketId);
      const updatedTickets = await getAllTickets();
      setTickets(updatedTickets);
      Swal.fire({
        icon: 'success',
        title: 'Terselesaikan',
        text: 'Tiket telah ditandai sebagai Selesai.',
        background: '#1e293b',
        color: '#f8fafc',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <LifeBuoy size={28} className="text-warning" />
        <h2 style={{ margin: 0 }}>Kelola Pengaduan</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {tickets.length === 0 ? (
          <div className="glass-card text-center" style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <LifeBuoy size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <p>Belum ada tiket pengaduan masuk.</p>
          </div>
        ) : (
          tickets.slice().reverse().map(ticket => (
            <div key={ticket.id} className="glass-card" style={{ padding: '1.25rem', borderLeft: ticket.status === 'Selesai' ? '4px solid var(--success)' : '4px solid var(--warning)' }}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{ticket.date} • {ticket.email}</span>
                </div>
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
              <p style={{ margin: '0 0 1rem 0', fontSize: '0.875rem', color: 'var(--text-main)' }}>{ticket.description}</p>
              
              {ticket.status !== 'Selesai' && (
                <div className="flex justify-end mt-2 pt-2" style={{ borderTop: '1px solid var(--glass-border)' }}>
                  <button 
                    onClick={() => handleResolve(ticket.id)}
                    className="btn btn-primary"
                    style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                  >
                    Tandai Selesai
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminTickets;
