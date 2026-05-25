import React, { useState } from 'react';
import { Save, ShieldCheck, Printer, Radio, Database, Sparkles, AlertCircle, Key } from 'lucide-react';

export default function Settings({ settings, onSaveSettings }) {
  const [shopName, setShopName] = useState(settings?.shopName || 'BharatPay Store');
  const [upiId, setUpiId] = useState(settings?.upiId || 'merchant@upi');
  const [holderName, setHolderName] = useState(settings?.holderName || 'Store Owner');
  const [mobileNumber, setMobileNumber] = useState(settings?.mobileNumber || '9999999999');
  const [bankName, setBankName] = useState(settings?.bankName || 'STATE BANK OF INDIA');
  const [adminPin, setAdminPin] = useState(settings?.adminPin || '1234');
  
  // Audio Options
  const [enableVoice, setEnableVoice] = useState(settings?.enableVoice ?? true);

  // Simulated Bluetooth Printer Settings
  const [printerPaired, setPrinterPaired] = useState(false);
  const [printerLoading, setPrinterLoading] = useState(false);

  // Firebase configurations
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(settings?.cloudSyncEnabled || false);
  const [firebaseApiKey, setFirebaseApiKey] = useState(settings?.firebaseApiKey || '');
  const [firebaseProjectId, setFirebaseProjectId] = useState(settings?.firebaseProjectId || '');
  const [firebaseAuthDomain, setFirebaseAuthDomain] = useState(settings?.firebaseAuthDomain || '');
  const [firebaseAppId, setFirebaseAppId] = useState(settings?.firebaseAppId || '');

  // Payment Gateway configurations
  const [activeGateway, setActiveGateway] = useState(settings?.activeGateway || 'MOCK');
  const [phonepeMerchantId, setPhonepeMerchantId] = useState(settings?.phonepeMerchantId || '');
  const [phonepeSaltKey, setPhonepeSaltKey] = useState(settings?.phonepeSaltKey || '');
  const [phonepeSaltIndex, setPhonepeSaltIndex] = useState(settings?.phonepeSaltIndex || '1');
  const [razorpayKeyId, setRazorpayKeyId] = useState(settings?.razorpayKeyId || '');
  const [razorpayKeySecret, setRazorpayKeySecret] = useState(settings?.razorpayKeySecret || '');
  const [cashfreeAppId, setCashfreeAppId] = useState(settings?.cashfreeAppId || '');
  const [cashfreeSecretKey, setCashfreeSecretKey] = useState(settings?.cashfreeSecretKey || '');

  const [message, setMessage] = useState({ text: '', type: '' });

  const handleSave = () => {
    onSaveSettings({
      shopName,
      upiId,
      holderName,
      mobileNumber,
      bankName,
      adminPin,
      enableVoice,
      cloudSyncEnabled,
      firebaseApiKey,
      firebaseProjectId,
      firebaseAuthDomain,
      firebaseAppId,
      activeGateway,
      phonepeMerchantId,
      phonepeSaltKey,
      phonepeSaltIndex,
      razorpayKeyId,
      razorpayKeySecret,
      cashfreeAppId,
      cashfreeSecretKey
    });
    
    setMessage({ text: 'All settings saved locally successfully!', type: 'SUCCESS' });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handlePairPrinter = () => {
    setPrinterLoading(true);
    setTimeout(() => {
      setPrinterPaired(prev => !prev);
      setPrinterLoading(false);
    }, 1200);
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 p-1 animate-slide-up">
      
      {/* Left Column: Store Profile Details */}
      <div className="flex-1 flex flex-col gap-5">
        <div className="glass-panel rounded-3xl p-6 border-white/5 flex flex-col gap-5 shadow-glass-sm">
          
          <div className="flex justify-between items-center pb-3 border-b border-white/5">
            <div>
              <h3 className="font-extrabold text-white text-base">Shop Billing Profile</h3>
              <p className="text-xs text-gray-400 mt-0.5">Parameters utilized to generate customer billing receipts & UPI strings</p>
            </div>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-indigo-600 font-extrabold text-white text-xs tracking-wide shadow-glow-indigo active:scale-95 transition-all flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>SAVE CONFIG</span>
            </button>
          </div>

          {message.text && (
            <div className={`p-4.5 rounded-2xl flex items-center gap-2.5 text-xs font-bold ${
              message.type === 'SUCCESS' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
            }`}>
              <ShieldCheck className="w-4 h-4" />
              <span>{message.text}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Shop Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                placeholder="BharatPay POS Store"
                className="glass-input text-xs font-semibold"
              />
            </div>

            {/* UPI ID */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Merchant UPI Address</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="storename@upi"
                className="glass-input text-xs font-semibold"
              />
            </div>

            {/* Holder Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account Holder Name</label>
              <input
                type="text"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
                placeholder="Merchant Owner Name"
                className="glass-input text-xs font-semibold"
              />
            </div>

            {/* Mobile Number */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile Number</label>
              <input
                type="text"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="9999999999"
                className="glass-input text-xs font-semibold"
              />
            </div>

            {/* Bank Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Associated Settlement Bank</label>
              <input
                type="text"
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="STATE BANK OF INDIA"
                className="glass-input text-xs font-semibold"
              />
            </div>

            {/* Admin PIN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Security PIN lockscreen</label>
              <input
                type="password"
                maxLength={4}
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value.replace(/\D/g,''))}
                placeholder="1234"
                className="glass-input text-xs font-semibold font-mono tracking-widest"
              />
            </div>

          </div>

          {/* Sound receipt option toggle */}
          <div className="mt-4 p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-200">Audio Broadcast Receipts</h4>
              <p className="text-[10px] text-gray-400 mt-0.5">Synthesizes voice announcements upon transaction credit success</p>
            </div>
            <button
              onClick={() => setEnableVoice(prev => !prev)}
              className={`w-12 h-6.5 rounded-full p-1 transition-all duration-200 flex items-center ${
                enableVoice ? 'bg-indigo-600 justify-end' : 'bg-gray-700 justify-start'
              }`}
            >
              <span className="w-4.5 h-4.5 rounded-full bg-white shadow-md" />
            </button>
          </div>

        </div>
      </div>

      {/* Right Column: cloud Backup & POS Printer Pairings */}
      <div className="w-full lg:w-[360px] flex flex-col gap-5">
        
        {/* Payment Gateway Configurations */}
        <div className="glass-panel rounded-3xl p-6 border-white/5 flex flex-col gap-4 shadow-glass-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400 animate-pulse" />
            <span>Payment Gateway API</span>
          </h3>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Select and configure your active commercial payment gateway for verified, automated credit status detection.
          </p>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Gateway</label>
            <select
              value={activeGateway}
              onChange={(e) => setActiveGateway(e.target.value)}
              className="glass-input text-xs font-semibold py-2.5 bg-[#0B0F19] cursor-pointer text-white border-white/5 outline-none rounded-xl"
            >
              <option value="MOCK">MOCK SIMULATOR (AUTO-SUCCESS)</option>
              <option value="PHONEPE">PHONEPE MERCHANT API</option>
              <option value="RAZORPAY">RAZORPAY PAYMENTS API</option>
              <option value="CASHFREE">CASHFREE CHECKOUT API</option>
            </select>
          </div>

          {activeGateway === 'PHONEPE' && (
            <div className="flex flex-col gap-3 mt-1 animate-scale-in">
              <input
                type="text"
                value={phonepeMerchantId}
                onChange={(e) => setPhonepeMerchantId(e.target.value)}
                placeholder="PhonePe Merchant ID"
                className="glass-input text-[11px] font-mono py-2.5"
              />
              <input
                type="password"
                value={phonepeSaltKey}
                onChange={(e) => setPhonepeSaltKey(e.target.value)}
                placeholder="PhonePe Salt Key"
                className="glass-input text-[11px] font-mono py-2.5"
              />
              <input
                type="text"
                value={phonepeSaltIndex}
                onChange={(e) => setPhonepeSaltIndex(e.target.value)}
                placeholder="Salt Index (e.g. 1)"
                className="glass-input text-[11px] font-mono py-2.5"
              />
            </div>
          )}

          {activeGateway === 'RAZORPAY' && (
            <div className="flex flex-col gap-3 mt-1 animate-scale-in">
              <input
                type="text"
                value={razorpayKeyId}
                onChange={(e) => setRazorpayKeyId(e.target.value)}
                placeholder="Razorpay Key ID"
                className="glass-input text-[11px] font-mono py-2.5"
              />
              <input
                type="password"
                value={razorpayKeySecret}
                onChange={(e) => setRazorpayKeySecret(e.target.value)}
                placeholder="Razorpay Secret"
                className="glass-input text-[11px] font-mono py-2.5"
              />
            </div>
          )}

          {activeGateway === 'CASHFREE' && (
            <div className="flex flex-col gap-3 mt-1 animate-scale-in">
              <input
                type="text"
                value={cashfreeAppId}
                onChange={(e) => setCashfreeAppId(e.target.value)}
                placeholder="Cashfree App ID"
                className="glass-input text-[11px] font-mono py-2.5"
              />
              <input
                type="password"
                value={cashfreeSecretKey}
                onChange={(e) => setCashfreeSecretKey(e.target.value)}
                placeholder="Cashfree Secret"
                className="glass-input text-[11px] font-mono py-2.5"
              />
            </div>
          )}
        </div>

        {/* Firebase Sync */}
        <div className="glass-panel rounded-3xl p-6 border-white/5 flex flex-col gap-4 shadow-glass-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
          
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Database className="w-4 h-4 text-indigo-400 animate-pulse" />
            <span>Firebase Cloud Storage</span>
          </h3>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Toggle multi-device cloud synchronization. Enable this, insert your Firestore credentials, and backing up databases occurs in real-time.
          </p>

          <div className="p-3 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between text-xs">
            <span className="text-gray-300 font-semibold">Enable Sync</span>
            <button
              onClick={() => setCloudSyncEnabled(prev => !prev)}
              className={`w-10 h-5.5 rounded-full p-0.5 transition-all duration-200 flex items-center ${
                cloudSyncEnabled ? 'bg-indigo-600 justify-end' : 'bg-gray-700 justify-start'
              }`}
            >
              <span className="w-4.5 h-4.5 rounded-full bg-white" />
            </button>
          </div>

          {cloudSyncEnabled && (
            <div className="flex flex-col gap-3 mt-1 animate-scale-in">
              <input
                type="text"
                value={firebaseApiKey}
                onChange={(e) => setFirebaseApiKey(e.target.value)}
                placeholder="Firebase API Key"
                className="glass-input text-[11px] font-mono py-2.5"
              />
              <input
                type="text"
                value={firebaseProjectId}
                onChange={(e) => setFirebaseProjectId(e.target.value)}
                placeholder="Firestore Project ID"
                className="glass-input text-[11px] font-mono py-2.5"
              />
              <input
                type="text"
                value={firebaseAuthDomain}
                onChange={(e) => setFirebaseAuthDomain(e.target.value)}
                placeholder="Auth Domain"
                className="glass-input text-[11px] font-mono py-2.5"
              />
              <input
                type="text"
                value={firebaseAppId}
                onChange={(e) => setFirebaseAppId(e.target.value)}
                placeholder="Firebase App ID"
                className="glass-input text-[11px] font-mono py-2.5"
              />
              
              <div className="p-3 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-gray-400 leading-relaxed font-semibold">
                  Once saved, databases link dynamically to your personal Firebase backend database rules.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Simulated Thermal Printer bluetooth pairing */}
        <div className="glass-panel rounded-3xl p-6 border-white/5 flex flex-col gap-4 shadow-glass-sm">
          <h3 className="font-extrabold text-white text-base flex items-center gap-2">
            <Printer className="w-4 h-4 text-indigo-400" />
            <span>Thermal Print System</span>
          </h3>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Integrates browser visual printer logs. Search, pair, and send POS receipt documents to thermal output simulators.
          </p>

          <div className="p-4 bg-white/2 border border-white/5 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-300 font-semibold">Gateway Status</span>
              <span className={`font-bold px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider flex items-center gap-1.5 ${
                printerPaired ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse' : 'bg-gray-700 border border-gray-600 text-gray-400'
              }`}>
                <Radio className="w-3 h-3" />
                {printerPaired ? 'PAIRED (58mm)' : 'DISCONNECTED'}
              </span>
            </div>

            <button
              onClick={handlePairPrinter}
              disabled={printerLoading}
              className={`w-full py-3 rounded-xl font-bold text-xs tracking-wide active:scale-95 transition-all flex items-center justify-center gap-2 ${
                printerPaired
                  ? 'bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 text-rose-400'
                  : 'bg-indigo-600/15 hover:bg-indigo-600/25 border border-indigo-500/20 text-indigo-400'
              }`}
            >
              {printerLoading ? (
                <span>SCANNING CHANNELS...</span>
              ) : (
                <span>{printerPaired ? 'UNPAIR THERMAL PRINTER' : 'PAIR THERMAL PRINTER'}</span>
              )}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
