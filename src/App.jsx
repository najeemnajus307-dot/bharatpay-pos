import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import POSCalculator from './components/POSCalculator';
import Dashboard from './components/Dashboard';
import History from './components/History';
import Settings from './components/Settings';
import Login from './components/Login';
import QRModal from './components/QRModal';
import { initializeDynamicFirebase, isCloudConnected } from './firebase';
import { collection, getDocs, addDoc, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';
import { Activity, ShieldAlert, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(true);
  const [activeTab, setActiveTab] = useState('POS');
  const [collapsed, setCollapsed] = useState(false);

  // Shop Settings State (Loaded from localStorage on start)
  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('bharatpay_settings');
    return saved ? JSON.parse(saved) : {
      shopName: 'BharatPay POS Store',
      upiId: '9999999999@ybl',
      holderName: 'Merchant Owner',
      mobileNumber: '9999999999',
      bankName: 'STATE BANK OF INDIA',
      adminPin: '1234',
      enableVoice: true,
      cloudSyncEnabled: false
    };
  });

  // Local Transactions State (Loaded from localStorage on start)
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('bharatpay_txns');
    return saved ? JSON.parse(saved) : [];
  });

  // Dynamic QR Modal States
  const [qrModalData, setQrModalData] = useState(null); // { amount, customerName }

  // Online / Network Diagnostic state
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);

  // Watch Network connectivity shifts
  useEffect(() => {
    const pingOnline = () => setIsOnline(true);
    const pingOffline = () => setIsOnline(false);
    window.addEventListener('online', pingOnline);
    window.addEventListener('offline', pingOffline);
    return () => {
      window.removeEventListener('online', pingOnline);
      window.removeEventListener('offline', pingOffline);
    };
  }, []);

  // Sync Dynamic Firebase configs
  useEffect(() => {
    if (settings?.cloudSyncEnabled && isOnline) {
      const config = {
        apiKey: settings.firebaseApiKey,
        projectId: settings.firebaseProjectId,
        authDomain: settings.firebaseAuthDomain,
        appId: settings.firebaseAppId
      };
      
      const res = initializeDynamicFirebase(config);
      if (res.initialized) {
        setFirebaseInitialized(true);
        console.log("App loaded Firestore dynamically!");
        
        // Listen to live database events
        const db = res.db;
        const q = query(collection(db, 'transactions'), orderBy('timestamp', 'asc'));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const cloudTxns = [];
          snapshot.forEach((doc) => {
            cloudTxns.push({ id: doc.id, ...doc.data() });
          });
          
          if (cloudTxns.length > 0) {
            setTransactions(cloudTxns);
            localStorage.setItem('bharatpay_txns', JSON.stringify(cloudTxns));
          }
        }, (error) => {
          console.error("Firestore sync listener error:", error);
        });

        return () => unsubscribe();
      } else {
        setFirebaseInitialized(false);
      }
    } else {
      setFirebaseInitialized(false);
    }
  }, [settings, isOnline]);

  // Handle saving configurations
  const handleSaveSettings = (newSettings) => {
    setSettings(newSettings);
    localStorage.setItem('bharatpay_settings', JSON.stringify(newSettings));
  };

  // Dispatch payment records
  const handlePaymentSuccess = async (txnRecord) => {
    // 1. Add locally
    const updated = [...transactions, txnRecord];
    setTransactions(updated);
    localStorage.setItem('bharatpay_txns', JSON.stringify(updated));

    // 2. Sync to Firestore in background if active
    if (settings.cloudSyncEnabled && firebaseInitialized && isOnline) {
      try {
        const { getDb } = await import('./firebase');
        const db = getDb();
        if (db) {
          await addDoc(collection(db, 'transactions'), txnRecord);
          console.log("Payout successfully synced to cloud!");
        }
      } catch (err) {
        console.error("Cloud syncing failed:", err);
      }
    }
  };

  // Row deletions
  const handleDeleteTransaction = async (id) => {
    // 1. Delete locally
    const updated = transactions.filter(t => t.id !== id);
    setTransactions(updated);
    localStorage.setItem('bharatpay_txns', JSON.stringify(updated));

    // 2. Delete cloud item
    if (settings.cloudSyncEnabled && firebaseInitialized && isOnline) {
      try {
        const { getDb } = await import('./firebase');
        const db = getDb();
        if (db) {
          // If transaction has custom firestore ID, delete doc directly.
          // Note: In custom PWA layouts, we match item ID fields.
          await deleteDoc(doc(db, 'transactions', id));
          console.log("Payout removed from Firestore cloud");
        }
      } catch (err) {
        console.error("Firestore deletion failed:", err);
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} savedSettings={settings} />;
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-dark-bg select-none relative font-sans text-gray-100">
      
      {/* Visual background atmospheric lights */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[160px] pointer-events-none" />

      {/* Nav Sidebar components */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
        settings={settings}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* Central View Dashboard Container */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative pb-16 md:pb-0">
        
        {/* Responsive top indicator headers */}
        <header className="h-16 px-6 border-b border-white/5 flex items-center justify-between z-10 glass-panel-light">
          <div className="flex items-center gap-2">
            <h1 className="text-sm font-extrabold text-white uppercase tracking-wider">
              {activeTab === 'POS' && 'POS CHECKOUT REGISTER'}
              {activeTab === 'DASHBOARD' && 'ANALYTICS REPORTING'}
              {activeTab === 'HISTORY' && 'BILLING ARCHIVES'}
              {activeTab === 'SETTINGS' && 'SYSTEM CONFIGURATIONS'}
            </h1>
          </div>

          {/* Connection badge status */}
          <div className="flex items-center gap-2.5">
            {settings.cloudSyncEnabled && (
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
                firebaseInitialized && isOnline 
                  ? 'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400' 
                  : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
              }`}>
                <span>CLOUD SYNC</span>
              </span>
            )}
            
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 ${
              isOnline 
                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
              {isOnline ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
              <span>{isOnline ? 'ONLINE' : 'OFFLINE MODE'}</span>
            </span>
          </div>
        </header>

        {/* Dynamic Viewport Router */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {activeTab === 'POS' && (
            <POSCalculator
              settings={settings}
              onGenerateQR={(amount, customerName) => setQrModalData({ amount, customerName })}
            />
          )}

          {activeTab === 'DASHBOARD' && (
            <Dashboard transactions={transactions} />
          )}

          {activeTab === 'HISTORY' && (
            <History
              transactions={transactions}
              settings={settings}
              onDeleteTransaction={handleDeleteTransaction}
            />
          )}

          {activeTab === 'SETTINGS' && (
            <Settings
              settings={settings}
              onSaveSettings={handleSaveSettings}
            />
          )}
        </div>
      </main>

      {/* Dynamic Fullscreen Checkout Overlay */}
      {qrModalData && (
        <QRModal
          amount={qrModalData.amount}
          customerName={qrModalData.customerName}
          settings={settings}
          onClose={() => setQrModalData(null)}
          onPaymentSuccess={(record) => {
            handlePaymentSuccess(record);
            // Modal remains open on SUCCESS page to let user print receipt.
          }}
        />
      )}

    </div>
  );
}
