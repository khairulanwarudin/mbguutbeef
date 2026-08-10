import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { ref, onValue } from 'firebase/database';
import { Thermometer, Droplets, RefreshCw } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [currentTemp, setCurrentTemp] = useState(0);
  const [currentHum, setCurrentHum] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(true);

  useEffect(() => {
    // Kita gunakan Device ID yang sama dengan ESP32
    const deviceId = 'TERMO_ESP32_01';
    const historyRef = ref(db, `devices/${deviceId}/history`);
    
    // Listener Realtime (Otomatis ter-trigger setiap kali ESP32 mengirim data baru)
    const unsubscribe = onValue(historyRef, (snapshot) => {
      setIsRefreshing(false);
      
      if (snapshot.exists()) {
        let parsedData = [];
        
        // Looping semua data laci FIFO
        snapshot.forEach((child) => {
          const item = child.val();
          if (item && item.timestamp) {
            // Cek apakah timestamp dalam detik (NTP) atau milidetik (Firebase ServerValue)
            // 1000000000000 adalah batas kasar untuk tahun 2001 dalam milidetik
            const timeValue = item.timestamp > 1000000000000 ? item.timestamp : item.timestamp * 1000;
            const time = new Date(timeValue);
            
            parsedData.push({
              time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              suhu: parseFloat(item.suhu),
              kelembapan: parseFloat(item.kelembapan),
              rawTimestamp: item.timestamp
            });
          }
        });
        
        // Urutkan data berdasarkan waktu (agar grafik bergeser dari kiri ke kanan dengan benar)
        parsedData.sort((a, b) => a.rawTimestamp - b.rawTimestamp);
        
        setData(parsedData);
        
        // Ambil data terbaru untuk kartu indikator angka besar
        if (parsedData.length > 0) {
          const latest = parsedData[parsedData.length - 1];
          setCurrentTemp(latest.suhu.toFixed(1));
          setCurrentHum(latest.kelembapan.toFixed(1));
        }
      } else {
        setData([]);
        setCurrentTemp(0);
        setCurrentHum(0);
      }
    });

    // Bersihkan listener saat pindah halaman
    return () => unsubscribe();
  }, []);

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 style={{ margin: 0 }}>Dasbor</h2>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Halo, {currentUser?.email}</p>
        </div>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', 
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Suhu Card */}
        <div className="glass-card" style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ color: 'var(--warning)', marginBottom: '0.5rem' }}>
            <Thermometer size={32} />
          </div>
          <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>
            {currentTemp}°C
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Suhu Saat Ini</p>
        </div>

        {/* Kelembapan Card */}
        <div className="glass-card" style={{ padding: '1.5rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <div style={{ color: 'var(--primary)', marginBottom: '0.5rem' }}>
            <Droplets size={32} />
          </div>
          <h3 style={{ fontSize: '2rem', margin: 0, color: 'var(--text-main)' }}>
            {currentHum}%
          </h3>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Kelembapan</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="glass-card" style={{ padding: '1.5rem 1rem' }}>
        <div className="flex justify-between items-center mb-2">
          <h3 style={{ fontSize: '1.1rem', margin: 0 }}>Histori Realtime (Maks. 30 Menit)</h3>
          <div 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              borderRadius: '50%',
              padding: '0.5rem',
              color: 'var(--text-main)',
              display: 'flex'
            }}
            title={isRefreshing ? "Menghubungkan ke Database..." : "Sinkronisasi Aktif"}
          >
            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
          </div>
        </div>
        
        <div style={{ height: '300px', width: '100%', marginTop: '1rem' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="time" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
              <YAxis yAxisId="left" stroke="var(--warning)" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
              <YAxis yAxisId="right" orientation="right" stroke="var(--primary)" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
              <Tooltip 
                contentStyle={{ background: 'var(--bg-gradient-start)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', marginTop: '10px' }}/>
              <Line yAxisId="left" type="monotone" dataKey="suhu" name="Suhu (°C)" stroke="var(--warning)" strokeWidth={2} dot={false} activeDot={{ r: 6 }} />
              <Line yAxisId="right" type="monotone" dataKey="kelembapan" name="Kelembapan (%)" stroke="var(--primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
