import React, { useState, useEffect } from 'react';
import { Plus, Cpu, Trash2, Settings, Loader2, Edit2 } from 'lucide-react';
import Swal from 'sweetalert2';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { ref, onValue, set, get, remove } from 'firebase/database';

const Devices = () => {
  const { currentUser } = useAuth();
  const [devices, setDevices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showConfig, setShowConfig] = useState(null);
  
  const [newDeviceId, setNewDeviceId] = useState('');
  const [newName, setNewName] = useState('');

  const [editThresholds, setEditThresholds] = useState({ minTemp: '', maxTemp: '', minHum: '', maxHum: '' });
  
  // State untuk edit nama alat
  const [editNameId, setEditNameId] = useState(null);
  const [editNameValue, setEditNameValue] = useState('');

  useEffect(() => {
    if (!currentUser) return;
    const devicesRef = ref(db, `users/${currentUser.uid}/devices`);
    const unsubscribe = onValue(devicesRef, (snapshot) => {
      setIsLoading(false);
      if (snapshot.exists()) {
        const data = snapshot.val();
        const devicesList = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setDevices(devicesList);
      } else {
        setDevices([]);
      }
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleAddDevice = async (e) => {
    e.preventDefault();
    if (newDeviceId && newName) {
      try {
        const ownerRef = ref(db, `device_owners/${newDeviceId}`);
        const ownerSnapshot = await get(ownerRef);
        
        if (ownerSnapshot.exists() && ownerSnapshot.val() !== currentUser.uid) {
          return Swal.fire({ icon: 'error', title: 'Akses Ditolak', text: 'ID Alat ini sudah diklaim oleh pengguna lain!', background: '#1e293b', color: '#f8fafc' });
        }
        
        // Tandai sebagai milik user ini
        await set(ownerRef, currentUser.uid);

        const deviceRef = ref(db, `users/${currentUser.uid}/devices/${newDeviceId}`);
        await set(deviceRef, {
          deviceId: newDeviceId,
          name: newName,
          status: 'online',
          thresholds: { minTemp: 10, maxTemp: 40, minHum: 30, maxHum: 90 }
        });
        
        setNewDeviceId('');
        setNewName('');
        setShowAddForm(false);
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Alat berhasil diklaim dan ditambahkan!',
          background: '#1e293b',
          color: '#f8fafc',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: error.message, background: '#1e293b', color: '#f8fafc' });
      }
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Alat?',
      text: "Data histori alat ini di server juga akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'rgba(255,255,255,0.1)',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal',
      background: '#1e293b',
      color: '#f8fafc'
    });

    if (result.isConfirmed) {
      try {
        // Hapus histori alat dari root devices (jika Anda ingin riwayat sensor ikut dihapus)
        await remove(ref(db, `devices/${id}`));
        // Lepaskan klaim kepemilikan alat
        await remove(ref(db, `device_owners/${id}`));
        // Hapus klaim alat dari profil pengguna
        await remove(ref(db, `users/${currentUser.uid}/devices/${id}`));
        
        Swal.fire({
          icon: 'success',
          title: 'Terhapus',
          text: 'Alat beserta datanya telah dihapus.',
          background: '#1e293b',
          color: '#f8fafc',
          timer: 1500,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({ icon: 'error', title: 'Gagal', text: error.message, background: '#1e293b', color: '#f8fafc' });
      }
    }
  };

  const openConfig = (device) => {
    setEditThresholds(device.thresholds || { minTemp: 10, maxTemp: 40, minHum: 30, maxHum: 90 });
    setShowConfig(device.id);
  };

  const saveConfig = async (id) => {
    try {
      await set(ref(db, `users/${currentUser.uid}/devices/${id}/thresholds`), editThresholds);
      setShowConfig(null);
      Swal.fire({
        icon: 'success',
        title: 'Tersimpan',
        text: 'Ambang batas berhasil diperbarui.',
        background: '#1e293b',
        color: '#f8fafc',
        timer: 1500,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal', text: error.message, background: '#1e293b', color: '#f8fafc' });
    }
  };

  const saveName = async (id) => {
    if (!editNameValue) return;
    try {
      await set(ref(db, `users/${currentUser.uid}/devices/${id}/name`), editNameValue);
      setEditNameId(null);
      setEditNameValue('');
    } catch (error) {
      Swal.fire({ icon: 'error', title: 'Gagal Menyimpan Nama', text: error.message, background: '#1e293b', color: '#f8fafc' });
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h2 style={{ margin: 0 }}>Kelola Alat</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="btn btn-primary"
          style={{ width: 'auto', padding: '0.5rem 1rem', fontSize: '0.875rem' }}
        >
          <Plus size={16} /> Tambah
        </button>
      </div>

      {showAddForm && (
        <div className="glass-card mb-3" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Tambah Alat Baru</h3>
          <form onSubmit={handleAddDevice}>
            <div className="input-group">
              <label>Nama Alat (Opsional)</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Misal: Termometer Kamar"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ paddingLeft: '1rem' }}
                required
              />
            </div>
            <div className="input-group">
              <label>ID Alat ESP32</label>
              <input 
                type="text" 
                className="input-field" 
                placeholder="Misal: TERMO_ESP32_01"
                value={newDeviceId}
                onChange={(e) => setNewDeviceId(e.target.value)}
                style={{ paddingLeft: '1rem' }}
                required
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary">Simpan</button>
              <button type="button" className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white' }} onClick={() => setShowAddForm(false)}>Batal</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {isLoading ? (
          <div className="text-center" style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Loader2 size={48} className="animate-spin mx-auto" style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>Memuat daftar alat...</p>
          </div>
        ) : devices.length === 0 ? (
          <div className="text-center" style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <Cpu size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
            <p>Belum ada alat yang terdaftar.</p>
          </div>
        ) : (
          devices.map(device => (
            <div key={device.id} className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div className="flex items-center gap-4">
                  <div style={{ 
                    background: 'rgba(99, 102, 241, 0.2)', 
                    padding: '0.75rem', 
                    borderRadius: '0.75rem',
                    color: 'var(--primary)'
                  }}>
                    <Cpu size={24} />
                  </div>
                  <div>
                    {editNameId === device.id ? (
                      <div className="flex gap-2 items-center mb-1">
                        <input 
                          type="text" 
                          className="input-field" 
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem' }}
                          autoFocus
                        />
                        <button onClick={() => saveName(device.id)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>Simpan</button>
                        <button onClick={() => setEditNameId(null)} className="btn" style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', background: 'transparent' }}>Batal</button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <h4 style={{ margin: 0 }}>{device.name}</h4>
                        <button 
                          onClick={() => { setEditNameId(device.id); setEditNameValue(device.name); }}
                          style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                    <p style={{ margin: 0, fontSize: '0.75rem', fontFamily: 'monospace' }}>{device.deviceId}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                      <div style={{ 
                        width: '8px', 
                        height: '8px', 
                        borderRadius: '50%', 
                        background: device.status === 'online' ? 'var(--success)' : 'var(--text-muted)' 
                      }}></div>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {device.status === 'online' ? 'Terhubung' : 'Offline'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => openConfig(device)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.5rem' }}
                    title="Konfigurasi Ambang Batas"
                  >
                    <Settings size={20} />
                  </button>
                  <button 
                    onClick={() => handleDelete(device.id)}
                    style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer', padding: '0.5rem' }}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              {/* Threshold Config Panel */}
              {showConfig === device.id && (
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '1rem', color: 'var(--text-muted)' }}>Pengaturan Ambang Batas</h4>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="input-group mb-2">
                      <label>Suhu Min (°C)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        style={{ paddingLeft: '1rem' }}
                        value={editThresholds.minTemp}
                        onChange={(e) => setEditThresholds({...editThresholds, minTemp: e.target.value})}
                      />
                    </div>
                    <div className="input-group mb-2">
                      <label>Suhu Max (°C)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        style={{ paddingLeft: '1rem' }}
                        value={editThresholds.maxTemp}
                        onChange={(e) => setEditThresholds({...editThresholds, maxTemp: e.target.value})}
                      />
                    </div>
                    <div className="input-group mb-2">
                      <label>Lembap Min (%)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        style={{ paddingLeft: '1rem' }}
                        value={editThresholds.minHum}
                        onChange={(e) => setEditThresholds({...editThresholds, minHum: e.target.value})}
                      />
                    </div>
                    <div className="input-group mb-2">
                      <label>Lembap Max (%)</label>
                      <input 
                        type="number" 
                        className="input-field" 
                        style={{ paddingLeft: '1rem' }}
                        value={editThresholds.maxHum}
                        onChange={(e) => setEditThresholds({...editThresholds, maxHum: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => saveConfig(device.id)} className="btn btn-primary" style={{ padding: '0.5rem', fontSize: '0.875rem' }}>Simpan</button>
                    <button onClick={() => setShowConfig(null)} className="btn" style={{ padding: '0.5rem', fontSize: '0.875rem', background: 'rgba(255,255,255,0.1)', color: 'white' }}>Batal</button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Devices;
