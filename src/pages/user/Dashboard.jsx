import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../config/firebase';
import { ref, onValue } from 'firebase/database';
import { Thermometer, Droplets, RefreshCw, Download } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const [data, setData] = useState([]);
  const [currentTemp, setCurrentTemp] = useState(0);
  const [currentHum, setCurrentHum] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(true);
  const [userDevices, setUserDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
    
    // 1. Ambil daftar alat yang dimiliki oleh user ini
    const userDevicesRef = ref(db, `users/${currentUser.uid}/devices`);
    const unsubscribeUser = onValue(userDevicesRef, (snapshot) => {
      if (snapshot.exists()) {
        const devicesData = snapshot.val();
        const devicesList = Object.values(devicesData);
        setUserDevices(devicesList);
        
        // Pilih alat pertama secara default jika belum ada yang dipilih
        if (devicesList.length > 0 && !selectedDevice) {
          setSelectedDevice(devicesList[0].deviceId);
        }
      } else {
        setUserDevices([]);
        setSelectedDevice(null);
        setIsRefreshing(false);
      }
    });

    return () => unsubscribeUser();
  }, [currentUser]);

  useEffect(() => {
    if (!selectedDevice) {
      setData([]);
      setCurrentTemp(0);
      setCurrentHum(0);
      return;
    }
    
    setIsRefreshing(true);
    // 2. Dengarkan data histori HANYA untuk alat yang dipilih
    const historyRef = ref(db, `devices/${selectedDevice}/history`);
    
    // Listener Realtime (Otomatis ter-trigger setiap kali ESP32 mengirim data baru)
    const unsubscribeHistory = onValue(historyRef, (snapshot) => {
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
            
            const day = String(time.getDate()).padStart(2, '0');
            const month = String(time.getMonth() + 1).padStart(2, '0');
            const year = time.getFullYear();
            const hours = String(time.getHours()).padStart(2, '0');
            const minutes = String(time.getMinutes()).padStart(2, '0');
            const seconds = String(time.getSeconds()).padStart(2, '0');
            const formattedFullDate = `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
            
            parsedData.push({
              time: `${hours}:${minutes}`,
              fullDate: formattedFullDate,
              suhu: parseFloat(item.suhu),
              kelembapan: parseFloat(item.kelembapan),
              rawTimestamp: item.timestamp
            });
          }
        });
        
        // Urutkan data berdasarkan waktu (agar grafik bergeser dari kiri ke kanan dengan benar)
        parsedData.sort((a, b) => a.rawTimestamp - b.rawTimestamp);
        
        // Gunakan spread operator agar React benar-benar yakin ini array baru (memicu re-render Recharts)
        setData([...parsedData]);
        
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

    // Bersihkan listener saat pindah halaman atau ganti alat
    return () => unsubscribeHistory();
  }, [selectedDevice]);

  const generatePDF = () => {
    if (!data || data.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Data Kosong',
        text: 'Tidak ada histori data sensor untuk diunduh.',
        background: '#1e293b',
        color: '#f8fafc'
      });
      return;
    }

    // Hitung statistik
    const suhus = data.map(d => d.suhu);
    const hums = data.map(d => d.kelembapan);
    const minSuhu = Math.min(...suhus).toFixed(1);
    const maxSuhu = Math.max(...suhus).toFixed(1);
    const avgSuhu = (suhus.reduce((a, b) => a + b, 0) / suhus.length).toFixed(1);
    
    const minHum = Math.min(...hums).toFixed(1);
    const maxHum = Math.max(...hums).toFixed(1);
    const avgHum = (hums.reduce((a, b) => a + b, 0) / hums.length).toFixed(1);

    const currentDeviceInfo = userDevices.find(d => d.deviceId === selectedDevice);
    const deviceName = currentDeviceInfo?.name || selectedDevice;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Set Font ke Helvetica
    doc.setFont("helvetica");

    // ==========================================
    // 1. HEADER (Dark Theme Corporate)
    // ==========================================
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 26, 'F'); // Tinggi dikurangi dari 35 menjadi 26
    
    // Gambar Logo Placeholder Abstrak (Dua Lingkaran Overlap + Titik Tengah)
    doc.setFillColor(59, 130, 246); // Blue-500
    doc.circle(20, 13, 5, 'F');
    doc.setFillColor(56, 189, 248); // Sky-400
    doc.circle(25, 13, 5, 'F');
    doc.setFillColor(255, 255, 255); // White dot
    doc.circle(22.5, 13, 1.5, 'F');
    
    // Teks Judul (Digeser ke kanan logo)
    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text('TERMOAPP', 35, 16);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('INDUSTRIAL SENSOR DATA REPORT', 35, 21);
    
    // Tanggal Cetak di Kanan Atas
    doc.setFontSize(8);
    doc.setTextColor(200, 200, 200);
    doc.text(`Dicetak: ${new Date().toLocaleString('id-ID')}`, pageWidth - 14, 16, { align: 'right' });

    // ==========================================
    // 2. KOTAK RINGKASAN (Summary Box)
    // ==========================================
    doc.setFillColor(248, 250, 252); // slate-50
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.roundedRect(14, 34, pageWidth - 28, 28, 2, 2, 'FD'); // Naik dari y=42 menjadi 34, tinggi 28

    // Teks Ringkasan (Kiri)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85); // slate-700
    doc.text('Informasi Perangkat', 18, 41);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Device ID : ${selectedDevice}`, 18, 47);
    doc.text(`Nama Alat : ${deviceName}`, 18, 52);
    doc.text(`Pengelola : ${currentUser?.name || currentUser?.email}`, 18, 57);

    // Teks Ringkasan (Kanan)
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(51, 65, 85);
    doc.text('Statistik Data', pageWidth / 2 + 10, 41);
    
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(`Total Records : ${data.length} data`, pageWidth / 2 + 10, 47);
    doc.text(`Suhu (Min/Avg/Max) : ${minSuhu} / ${avgSuhu} / ${maxSuhu} °C`, pageWidth / 2 + 10, 52);
    doc.text(`Hum  (Min/Avg/Max) : ${minHum} / ${avgHum} / ${maxHum} %`, pageWidth / 2 + 10, 57);

    // ==========================================
    // 3. TABEL DATA
    // ==========================================
    const tableColumn = ["No", "Waktu Terekam", "Suhu (°C)", "Kelembapan (%)"];
    const tableRows = [];

    data.forEach((item, index) => {
      tableRows.push([
        (index + 1).toString(),
        item.fullDate || item.time, // Menggunakan tanggal lengkap
        item.suhu.toFixed(1),
        item.kelembapan.toFixed(1)
      ]);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 68, // Naik dari 80 ke 68 menyesuaikan header yang lebih ramping
      theme: 'grid', // Menggunakan grid tapi dimodifikasi agar terlihat modern
      headStyles: { 
        fillColor: [30, 41, 59], // slate-800
        textColor: 255, 
        fontStyle: 'bold',
        halign: 'center' 
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 15 },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' }
      },
      styles: { 
        font: 'helvetica',
        fontSize: 9,
        textColor: [51, 65, 85],
        lineColor: [226, 232, 240], // Batas tabel lembut
        lineWidth: 0.1
      },
      alternateRowStyles: { fillColor: [248, 250, 252] }, // Zebra row sangat halus
      didDrawPage: function (data) {
        // Footer (Nomor Halaman & Copyright)
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(148, 163, 184);
        
        doc.text('© TermoApp PWA - Realtime IoT Monitoring', 14, doc.internal.pageSize.height - 10);
        doc.text(`Halaman ${doc.internal.getNumberOfPages()}`, pageWidth - 14, doc.internal.pageSize.height - 10, { align: 'right' });
      }
    });

    // Simpan file
    doc.save(`TermoApp_Report_${selectedDevice}_${new Date().getTime()}.pdf`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 style={{ margin: 0 }}>Dasbor</h2>
          <p style={{ margin: 0, fontSize: '0.875rem' }}>Halo, {currentUser?.name || currentUser?.email}</p>
        </div>
        {userDevices.length > 0 && (
          <select 
            value={selectedDevice || ''} 
            onChange={(e) => setSelectedDevice(e.target.value)}
            className="input-field"
            style={{ width: 'auto', padding: '0.5rem', fontSize: '0.875rem' }}
          >
            {userDevices.map(dev => (
              <option key={dev.deviceId} value={dev.deviceId}>{dev.name || dev.deviceId}</option>
            ))}
          </select>
        )}
      </div>

      {!selectedDevice ? (
        <div className="glass-card text-center" style={{ padding: '3rem 1rem', color: 'var(--text-muted)' }}>
          <p>Anda belum mendaftarkan alat apapun.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>Silakan masuk ke menu Perangkat untuk menambah alat Anda.</p>
        </div>
      ) : (
        <>
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
          <div className="flex gap-2 items-center">
            <button 
              onClick={generatePDF}
              className="btn btn-primary"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              title="Unduh Laporan PDF"
            >
              <Download size={16} /> <span className="hidden sm:inline">PDF</span>
            </button>
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
        </div>
        
          {/* Wrapper responsif dengan horizontal scroll */}
          <div style={{ width: '100%', overflowX: 'auto', marginTop: '1rem', paddingBottom: '0.5rem' }}>
            <div style={{ height: '280px', minWidth: '600px' }}>
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
      </>
      )}
    </div>
  );
};

export default Dashboard;
