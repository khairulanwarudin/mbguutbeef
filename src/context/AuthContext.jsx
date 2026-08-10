import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, db } from '../config/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  onAuthStateChanged
} from 'firebase/auth';
import { ref, set, get, update, push, remove } from 'firebase/database';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const isRegisteringRef = React.useRef(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (isRegisteringRef.current) {
          // Abaikan pengecekan jika sedang dalam proses registrasi
          return;
        }

        // Ambil metadata dari RTDB
        const metadataRef = ref(db, `users/${user.uid}/metadata`);
        try {
          const snapshot = await get(metadataRef);
          if (snapshot.exists()) {
            const data = snapshot.val();
            
            // SECURITY ENFORCEMENT: Pastikan terverifikasi dan disetujui
            if (!user.emailVerified || (!data.isApproved && data.role !== 'admin')) {
              await signOut(auth);
              setCurrentUser(null);
            } else {
              setCurrentUser({
                uid: user.uid,
                email: user.email,
                emailVerified: user.emailVerified,
                isApproved: data.isApproved,
                role: data.role,
                name: data.name || '',
                phone: data.phone || ''
              });
            }
          } else {
            // Jika data tidak ada di database, tendang keluar
            await signOut(auth);
            setCurrentUser(null);
          }
        } catch (error) {
          console.error("Error fetching user metadata:", error);
          await signOut(auth);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const isAdmin = currentUser?.role === 'admin';

  const register = async (email, password) => {
    isRegisteringRef.current = true;
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      
      const isAdminEmail = email.toLowerCase() === 'admin@termoapp.com';
      
      // Tulis metadata ke DB
      await set(ref(db, `users/${userCredential.user.uid}`), {
        metadata: {
          email: email,
          isApproved: isAdminEmail,
          role: isAdminEmail ? 'admin' : 'user'
        }
      });
      
      // Cegah Auto-Login! Paksa keluar agar user harus melewati fungsi login()
      await signOut(auth);
      return userCredential.user;
    } catch (error) {
      if (userCredential && userCredential.user) {
        await userCredential.user.delete();
      }
      throw new Error(`Gagal menyimpan profil: ${error.message}`);
    } finally {
      isRegisteringRef.current = false;
    }
  };

  const login = async (email, password) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    if (!user.emailVerified) {
      await signOut(auth); // Sign out jika belum verifikasi email
      throw new Error("Email belum diverifikasi. Silakan cek kotak masuk Anda.");
    }
    
    const metadataRef = ref(db, `users/${user.uid}/metadata`);
    const snapshot = await get(metadataRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      if (!data.isApproved && data.role !== 'admin') {
        await signOut(auth);
        throw new Error("Akun Anda sedang menunggu persetujuan dari Admin.");
      }
    } else {
      await signOut(auth);
      throw new Error("Data pengguna tidak ditemukan di database.");
    }
    
    return user;
  };

  const logout = () => signOut(auth);

  const resetPassword = (email) => sendPasswordResetEmail(auth, email);

  // --- ADMIN FUNCTIONS ---
  const approveUser = async (uid) => {
    await update(ref(db, `users/${uid}/metadata`), {
      isApproved: true
    });
  };

  const removeUser = async (uid) => {
    try {
      // Ambil daftar perangkat yang dimiliki user ini
      const devicesSnapshot = await get(ref(db, `users/${uid}/devices`));
      if (devicesSnapshot.exists()) {
        const devices = devicesSnapshot.val();
        // Hapus histori data sensor di root /devices/ untuk setiap perangkat
        for (const deviceId of Object.keys(devices)) {
          await remove(ref(db, `devices/${deviceId}`));
          await remove(ref(db, `device_owners/${deviceId}`));
        }
      }
      // Hapus profil dan data kepemilikan perangkat pengguna tersebut
      await remove(ref(db, `users/${uid}`));
    } catch (error) {
      console.error("Error deleting user devices:", error);
      throw error;
    }
  };

  const getAllUsers = async () => {
    const snapshot = await get(ref(db, 'users'));
    const users = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const uid = childSnapshot.key;
        const metadata = childSnapshot.val().metadata;
        if (metadata) {
          users.push({
            uid,
            ...metadata
          });
        }
      });
    }
    return users;
  };
  
  // --- TICKETING FUNCTIONS ---
  const createTicket = async (deviceId, description) => {
    const newTicketRef = push(ref(db, 'tickets'));
    const ticketData = {
      uid: currentUser.uid,
      email: currentUser.email,
      deviceId,
      description,
      status: 'Menunggu',
      date: new Date().toLocaleDateString(),
      timestamp: Date.now()
    };
    await set(newTicketRef, ticketData);
    return { id: newTicketRef.key, ...ticketData };
  };
  
  const getUserTickets = async () => {
    const snapshot = await get(ref(db, 'tickets'));
    const tickets = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        const ticket = childSnapshot.val();
        if (ticket.uid === currentUser?.uid) {
          tickets.push({ id: childSnapshot.key, ...ticket });
        }
      });
    }
    return tickets;
  };
  
  const getAllTickets = async () => {
    const snapshot = await get(ref(db, 'tickets'));
    const tickets = [];
    if (snapshot.exists()) {
      snapshot.forEach((childSnapshot) => {
        tickets.push({ id: childSnapshot.key, ...childSnapshot.val() });
      });
    }
    return tickets;
  };
  
  const resolveTicket = async (ticketId) => {
    await update(ref(db, `tickets/${ticketId}`), {
      status: 'Selesai'
    });
  };

  const value = {
    currentUser,
    isAdmin,
    login,
    register,
    logout,
    resetPassword,
    approveUser,
    removeUser,
    getAllUsers,
    createTicket,
    getUserTickets,
    getAllTickets,
    resolveTicket
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
