import React, { useState, useEffect } from 'react';
import { Lock, Keyboard, CheckCircle, AlertCircle, ShieldAlert } from 'lucide-react';

export default function Login({ onLogin, savedSettings }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  const targetPin = savedSettings?.adminPin || '1234';

  const handleKeyPress = (num) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      setError(false);
      
      // Auto submit on 4 digits
      if (newPin === targetPin) {
        setTimeout(() => {
          onLogin();
        }, 300);
      } else if (newPin.length === 4) {
        setTimeout(() => {
          setShake(true);
          setError(true);
          setPin('');
          setTimeout(() => setShake(false), 500);
        }, 200);
      }
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="min-h-screen neon-grid bg-[#070B13] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Visual glowing background circles */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className={`w-full max-w-md glass-panel-heavy rounded-3xl p-8 relative z-10 shadow-glass-lg ${shake ? 'animate-bounce' : 'animate-fade-in'}`}>
        
        {/* Lock Screen Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-glow-indigo mb-4 animate-pulse">
            <Lock className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            {savedSettings?.shopName || 'BharatPay POS'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">Terminal Lock - Administrator PIN required</p>
        </div>

        {/* PIN Indicators */}
        <div className="flex flex-col items-center gap-4 mb-8">
          <div className="flex gap-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full border-2 transition-all duration-150 ${
                  pin.length > i
                    ? 'bg-indigo-500 border-indigo-500 scale-110 shadow-glow-indigo'
                    : error
                    ? 'border-red-500 bg-red-500/20'
                    : 'border-gray-600 bg-transparent'
                }`}
              />
            ))}
          </div>
          {error && (
            <div className="flex items-center gap-1.5 text-rose-500 text-xs mt-1 animate-pulse">
              <AlertCircle className="w-4 h-4" />
              <span>Incorrect PIN passcode. Access Denied.</span>
            </div>
          )}
        </div>

        {/* Numeric Tactile Passcode Keypad */}
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              onClick={() => handleKeyPress(num.toString())}
              className="keypad-btn select-none hover:bg-white/5 active:bg-indigo-600/20 text-xl font-semibold border-white/5"
            >
              {num}
            </button>
          ))}
          
          <button
            onClick={handleClear}
            className="keypad-btn text-rose-400 font-semibold select-none text-base border-white/5"
          >
            Clear
          </button>
          
          <button
            onClick={() => handleKeyPress('0')}
            className="keypad-btn select-none text-xl border-white/5"
          >
            0
          </button>
          
          <button
            onClick={handleDelete}
            className="keypad-btn text-gray-400 font-semibold select-none text-base border-white/5"
          >
            Delete
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-3 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex gap-2.5 items-center justify-center">
          <Keyboard className="w-4 h-4 text-indigo-400 flex-shrink-0" />
          <span className="text-gray-400 text-xs">
            Default Administrator Lock passcode: <strong className="text-indigo-400">1234</strong>
          </span>
        </div>
      </div>
    </div>
  );
}
