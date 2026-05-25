import React, { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import confetti from 'canvas-confetti';
import { X, CheckCircle2, AlertTriangle, Printer, Download, Sparkles, Volume2, ShieldCheck, ArrowRight, Loader2, User } from 'lucide-react';
import { formatRupee, generateTxnId } from '../utils/formatters';
import { generateThermalReceipt } from '../utils/receiptGenerator';

export default function QRModal({ amount, customerName, settings, onClose, onPaymentSuccess }) {
  const [txnId] = useState(generateTxnId());
  const [status, setStatus] = useState('PENDING'); // 'PENDING', 'SUCCESS', 'FAILED'
  const [countdown, setCountdown] = useState(180); // 3 minutes checkout timer
  const audioAnnouncedRef = useRef(false);

  const shopName = settings?.shopName || "BharatPay POS Store";
  const upiId = settings?.upiId || "merchant@upi";
  const holderName = settings?.holderName || "Store Owner";

  // Construct NPCI Standard UPI Payload String
  // upi://pay?pa=upiid&pn=name&am=amount&tn=txnid&cu=INR
  const upiString = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(holderName)}&am=${amount}&tn=${encodeURIComponent(txnId)}&cu=INR`;

  // Countdown timer
  useEffect(() => {
    if (status !== 'PENDING') return;
    if (countdown <= 0) {
      setStatus('FAILED');
      return;
    }
    const timer = setInterval(() => {
      setCountdown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [countdown, status]);

  // Automatic Smart Settlement Sensor
  // Simulates bank credit detection 7 seconds after QR is scanned
  useEffect(() => {
    if (status !== 'PENDING') return;
    
    const autoSuccessTimer = setTimeout(() => {
      handleSimulateStatus('SUCCESS');
    }, 7000); // 7 seconds simulation

    return () => clearTimeout(autoSuccessTimer);
  }, [status]);

  // Audio Broadcaster / Speech synthesiser
  const triggerAudioReceipt = () => {
    if (audioAnnouncedRef.current) return;
    audioAnnouncedRef.current = true;
    
    if (!window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const text = `Received ${amount} rupees on ${shopName}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-IN';
      
      const voices = window.speechSynthesis.getVoices();
      const localized = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN'));
      if (localized) {
        utterance.voice = localized;
      }
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Voice synthesis failed:", e);
    }
  };

  // Status transitions handler
  const handleSimulateStatus = (newStatus) => {
    if (status !== 'PENDING') return;
    setStatus(newStatus);
    
    if (newStatus === 'SUCCESS') {
      // Confetti shower
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6366F1', '#A855F7', '#10B981']
      });

      // Sound receipt broadcast
      triggerAudioReceipt();

      // Dispatch to main history sync engine
      onPaymentSuccess({
        id: txnId,
        amount,
        customerName,
        status: 'PAID',
        timestamp: new Date().toISOString()
      });
    }
  };

  // Helper format countdown minutes
  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remaining = secs % 60;
    return `${mins}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  const handlePrint = () => {
    const txn = { id: txnId, amount, customerName, timestamp: new Date().toISOString() };
    generateThermalReceipt(txn, settings, true);
  };

  const handleDownload = () => {
    const txn = { id: txnId, amount, customerName, timestamp: new Date().toISOString() };
    generateThermalReceipt(txn, settings, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      
      <div className="w-full max-w-lg glass-panel-heavy rounded-3xl overflow-hidden shadow-glass-lg border-white/10 relative flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-white text-base">UPI DIGITAL CHECKOUT</h3>
              <p className="text-[10px] text-gray-400 font-semibold">SECURE GATEWAY v2.6</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center active:scale-95 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center gap-6">
          
          {status === 'PENDING' && (
            <>
              {/* Payment Bill Info */}
              <div className="text-center">
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-1">TOTAL PAYABLE AMOUNT</p>
                <h2 className="text-4xl font-extrabold text-white tracking-tight">{formatRupee(amount)}</h2>
                <div className="mt-2.5 inline-flex items-center gap-1.5 bg-indigo-500/10 border border-indigo-500/20 px-3 py-1 rounded-full text-indigo-400 text-xs font-semibold">
                  <User className="w-3.5 h-3.5" />
                  <span>Billing To: {customerName}</span>
                </div>
              </div>

              {/* Dynamic QR Canvas */}
              <div className="p-6 bg-white rounded-3xl shadow-glass-lg relative group transition-all border-4 border-indigo-500/20">
                <QRCodeSVG
                  value={upiString}
                  size={200}
                  level="Q"
                  includeMargin={false}
                />
                
                {/* Visual scan frame overlay */}
                <div className="absolute inset-0 border-2 border-indigo-500/0 group-hover:border-indigo-500/40 rounded-3xl transition-all duration-300 pointer-events-none" />
              </div>

              {/* Scan description */}
              <div className="text-center max-w-xs">
                <p className="text-gray-200 text-sm font-semibold">Scan and pay using any UPI App</p>
                <p className="text-gray-400 text-xs mt-1 leading-relaxed">Supports Google Pay, PhonePe, Paytm, BHIM, Cred and all banking apps.</p>
              </div>

              {/* Secure logos list */}
              <div className="flex items-center gap-4 py-1.5 opacity-60">
                <span className="text-[10px] font-bold tracking-widest text-indigo-400">NPCI SECURED</span>
                <div className="h-4 w-px bg-white/10" />
                <span className="text-[10px] font-mono text-gray-300">UPI 2.0</span>
              </div>

              {/* Timer status */}
              <div className="w-full bg-white/2 rounded-2xl p-4 border border-white/5 flex justify-between items-center">
                <span className="text-gray-400 text-xs flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                  Waiting for webhook callback...
                </span>
                <span className="font-mono text-sm font-bold text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/15">
                  {formatTime(countdown)}
                </span>
              </div>
            </>
          )}

          {status === 'SUCCESS' && (
            <div className="w-full flex flex-col items-center text-center gap-6 py-6 animate-scale-in">
              <div className="w-24 h-24 rounded-full bg-emerald-500/15 border-4 border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-glow-emerald animate-pulse">
                <CheckCircle2 className="w-12 h-12" />
              </div>

              <div className="flex flex-col gap-2">
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider mx-auto">
                  Payment Success
                </span>
                <h3 className="text-3xl font-extrabold text-white tracking-tight">₹{amount} Received</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">The transaction has been successfully paid, verified, and saved to the store history.</p>
              </div>

              {/* Transaction details card */}
              <div className="w-full bg-white/2 border border-white/5 rounded-3xl p-5 text-left flex flex-col gap-3 font-medium text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Transaction ID</span>
                  <span className="text-white font-mono">{txnId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Customer Name</span>
                  <span className="text-white font-semibold">{customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Merchant UPI Account</span>
                  <span className="text-white font-semibold">{upiId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Verification Source</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    NPCI INSTANT CREDIT
                  </span>
                </div>
              </div>

              {/* POS Actions */}
              <div className="w-full grid grid-cols-2 gap-3 mt-4">
                <button
                  onClick={handlePrint}
                  className="py-4.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-extrabold tracking-wide border border-white/5 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{ height: '48px' }}
                >
                  <Printer className="w-4 h-4 text-indigo-400" />
                  PRINT RECEIPT
                </button>
                <button
                  onClick={handleDownload}
                  className="py-4.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-extrabold tracking-wide border border-white/5 flex items-center justify-center gap-2 active:scale-95 transition-all"
                  style={{ height: '48px' }}
                >
                  <Download className="w-4 h-4 text-indigo-400" />
                  PDF INVOICE
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4.5 rounded-2xl bg-gradient-to-tr from-indigo-500 to-indigo-600 font-extrabold text-white text-sm tracking-wide shadow-glow-indigo active:scale-95 transition-all flex items-center justify-center gap-2 mt-2"
                style={{ height: '52px' }}
              >
                <span>START NEXT BILLING</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {status === 'FAILED' && (
            <div className="w-full flex flex-col items-center text-center gap-6 py-6 animate-scale-in">
              <div className="w-20 h-20 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertTriangle className="w-10 h-10" />
              </div>
              
              <div className="flex flex-col gap-1">
                <h3 className="text-2xl font-extrabold text-white">Payment Timeout / Cancelled</h3>
                <p className="text-gray-400 text-sm max-w-xs mx-auto">No credit validation signal was captured within the limit. Check the simulator panel or retry billing.</p>
              </div>

              <button
                onClick={onClose}
                className="w-full py-4 rounded-2xl bg-white/5 hover:bg-white/10 font-bold text-white text-sm border border-white/5"
              >
                RE-ENTER AMOUNT
              </button>
            </div>
          )}

        </div>

        {/* Cashier Payment Simulation Console (ADMIN SANDBOX) */}
        {status === 'PENDING' && (
          <div className="p-4 bg-indigo-500/5 border-t border-white/5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold tracking-widest text-indigo-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                OPERATOR SIMULATOR SANDBOX
              </span>
              <span className="text-[9px] text-gray-500">Mocks bank credit callbacks</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => handleSimulateStatus('SUCCESS')}
                className="py-2.5 px-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 border border-emerald-500/20 text-emerald-400 text-[10px] font-extrabold tracking-wide active:scale-95 transition-all text-center"
              >
                MOCK SUCCESS
              </button>
              <button
                onClick={() => handleSimulateStatus('FAILED')}
                className="py-2.5 px-1.5 rounded-xl bg-rose-600/15 hover:bg-rose-600/25 border border-rose-500/20 text-rose-400 text-[10px] font-extrabold tracking-wide active:scale-95 transition-all text-center"
              >
                MOCK FAILURE
              </button>
              <button
                onClick={() => setCountdown(5)}
                className="py-2.5 px-1.5 rounded-xl bg-amber-600/15 hover:bg-amber-600/25 border border-amber-500/20 text-amber-400 text-[10px] font-extrabold tracking-wide active:scale-95 transition-all text-center"
              >
                FAST FORWARD TIMER
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
