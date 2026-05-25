import React, { useState } from 'react';
import { Mic, MicOff, User, CreditCard, ChevronRight, CornerDownLeft, RefreshCcw, DollarSign } from 'lucide-react';
import { useSpeech } from '../hooks/useSpeech';
import { formatRupee } from '../utils/formatters';

export default function POSCalculator({ onGenerateQR, settings }) {
  const [total, setTotal] = useState(0);
  const [currentInput, setCurrentInput] = useState('');
  const [activeOperation, setActiveOperation] = useState(null); // 'ADD', 'SUBTRACT'
  const [customerName, setCustomerName] = useState('');
  const [isListeningMic, setIsListeningMic] = useState(false);

  // Command processor callback
  const handleVoiceCommand = (command) => {
    switch (command.type) {
      case 'ADD':
        setTotal(prev => prev + command.value);
        break;
      case 'SUBTRACT':
        setTotal(prev => Math.max(0, prev - command.value));
        break;
      case 'SET':
        setTotal(command.value);
        break;
      case 'CLEAR':
        handleClear();
        break;
      case 'GENERATE_QR':
        handleCheckout();
        break;
      default:
        break;
    }
  };

  const { isListening, speechSupported, startListening, stopListening } = useSpeech(handleVoiceCommand);

  const toggleVoiceInput = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleNumClick = (val) => {
    if (currentInput.includes('.') && val === '.') return;
    setCurrentInput(prev => prev + val);
  };

  const handleClear = () => {
    setTotal(0);
    setCurrentInput('');
    setActiveOperation(null);
  };

  const handleBackspace = () => {
    setCurrentInput(prev => prev.slice(0, -1));
  };

  const applyOperation = (op) => {
    const inputNum = parseFloat(currentInput) || 0;
    
    if (currentInput) {
      if (total === 0) {
        setTotal(inputNum);
      } else if (activeOperation === 'ADD') {
        setTotal(prev => prev + inputNum);
      } else if (activeOperation === 'SUBTRACT') {
        setTotal(prev => Math.max(0, prev - inputNum));
      } else {
        setTotal(inputNum);
      }
      setCurrentInput('');
    }
    setActiveOperation(op);
  };

  const handleEquals = () => {
    const inputNum = parseFloat(currentInput) || 0;
    if (!currentInput) return;

    if (activeOperation === 'ADD') {
      setTotal(prev => prev + inputNum);
    } else if (activeOperation === 'SUBTRACT') {
      setTotal(prev => Math.max(0, prev - inputNum));
    } else {
      setTotal(inputNum);
    }
    
    setCurrentInput('');
    setActiveOperation(null);
  };

  const addPreset = (val) => {
    setTotal(prev => prev + val);
  };

  const handleCheckout = () => {
    let finalAmount = total;
    const inputNum = parseFloat(currentInput) || 0;
    
    // Auto-commit any remaining active inputs
    if (currentInput) {
      if (activeOperation === 'ADD') {
        finalAmount = total + inputNum;
      } else if (activeOperation === 'SUBTRACT') {
        finalAmount = Math.max(0, total - inputNum);
      } else {
        finalAmount = inputNum;
      }
      setTotal(finalAmount);
      setCurrentInput('');
      setActiveOperation(null);
    }

    if (finalAmount <= 0) return;
    onGenerateQR(finalAmount, customerName || 'Walk-in Customer');
  };

  return (
    <div className="w-full h-full flex flex-col lg:flex-row gap-6 p-1 animate-slide-up">
      
      {/* Left side: Displays & Tactile Keypad */}
      <div className="flex-1 flex flex-col gap-5">
        
        {/* Visual Double Display Card */}
        <div className="glass-panel rounded-3xl p-6 relative overflow-hidden flex flex-col justify-end min-h-[140px] shadow-glass-sm border-white/5">
          {/* Active Preset indicator overlay */}
          <div className="absolute top-4 left-6 flex items-center gap-2 text-xs font-semibold text-indigo-400">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
            <span>ACTIVE TERMINAL</span>
          </div>

          <div className="absolute top-4 right-6 text-right">
            {activeOperation && (
              <span className="bg-indigo-500/10 text-indigo-400 font-bold border border-indigo-500/20 px-2 py-0.5 rounded-md text-xs">
                {activeOperation === 'ADD' ? 'ADDING AMOUNT' : 'SUBTRACTING AMOUNT'}
              </span>
            )}
          </div>

          {/* Running Balance */}
          <div className="text-gray-400 text-xs font-medium uppercase tracking-wider text-right mb-1">
            Running Invoice Balance
          </div>
          <div className="text-right text-gray-300 text-xl font-medium tracking-tight mb-2">
            {formatRupee(total)}
          </div>

          {/* Input entry display */}
          <div className="flex justify-between items-baseline mt-2 pt-3 border-t border-white/5">
            <span className="text-3xl text-gray-500 font-semibold font-mono">₹</span>
            <span className="text-5xl font-extrabold tracking-tight text-white font-mono transition-all">
              {currentInput || '0'}
            </span>
          </div>
        </div>

        {/* Speed presets panel */}
        <div className="grid grid-cols-5 gap-2.5">
          {[10, 50, 100, 500, 1000].map((preset) => (
            <button
              key={preset}
              onClick={() => addPreset(preset)}
              className="py-3 px-1.5 rounded-2xl glass-panel-light hover:bg-white/5 text-sm font-semibold tracking-tight text-indigo-400 hover:text-white border-white/5 active:scale-95 transition-all text-center"
            >
              +{preset}
            </button>
          ))}
        </div>

        {/* Dynamic Keypad Layout */}
        <div className="grid grid-cols-4 gap-3">
          {/* Row 1 */}
          <button onClick={() => handleNumClick('7')} className="keypad-btn">7</button>
          <button onClick={() => handleNumClick('8')} className="keypad-btn">8</button>
          <button onClick={() => handleNumClick('9')} className="keypad-btn">9</button>
          <button onClick={() => applyOperation('ADD')} className={`keypad-btn font-bold text-indigo-400 ${activeOperation === 'ADD' ? 'bg-indigo-500/20 border-indigo-500/35 shadow-glow-indigo text-white' : ''}`}>
            +
          </button>

          {/* Row 2 */}
          <button onClick={() => handleNumClick('4')} className="keypad-btn">4</button>
          <button onClick={() => handleNumClick('5')} className="keypad-btn">5</button>
          <button onClick={() => handleNumClick('6')} className="keypad-btn">6</button>
          <button onClick={() => applyOperation('SUBTRACT')} className={`keypad-btn font-bold text-rose-400 ${activeOperation === 'SUBTRACT' ? 'bg-rose-500/20 border-rose-500/35 text-white' : ''}`}>
            -
          </button>

          {/* Row 3 */}
          <button onClick={() => handleNumClick('1')} className="keypad-btn">1</button>
          <button onClick={() => handleNumClick('2')} className="keypad-btn">2</button>
          <button onClick={() => handleNumClick('3')} className="keypad-btn">3</button>
          <button onClick={handleEquals} className="keypad-btn text-indigo-400 hover:text-white">
            <CornerDownLeft className="w-6 h-6" />
          </button>

          {/* Row 4 */}
          <button onClick={handleClear} className="keypad-btn text-rose-400 font-bold hover:bg-rose-500/10">C</button>
          <button onClick={() => handleNumClick('0')} className="keypad-btn">0</button>
          <button onClick={() => handleNumClick('.')} className="keypad-btn font-mono">.</button>
          <button onClick={handleBackspace} className="keypad-btn text-gray-400 hover:text-white">
            <RefreshCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Right side: Customer Meta & Microphone Speech Controls */}
      <div className="w-full lg:w-[320px] flex flex-col gap-5">
        
        {/* Customer Detail Input Panel */}
        <div className="glass-panel rounded-3xl p-6 shadow-glass-sm border-white/5 flex flex-col gap-4">
          <h2 className="text-base font-bold text-gray-200 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Customer Account</span>
          </h2>
          
          <div className="relative">
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Walk-in Customer"
              className="w-full glass-input pl-10 pr-4 text-sm"
            />
            <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Voice Command panel */}
        {speechSupported && (
          <div className="glass-panel rounded-3xl p-6 shadow-glass-sm border-white/5 flex flex-col items-center text-center gap-4 relative overflow-hidden">
            <div className="absolute top-3 right-4 flex items-center gap-1 text-[10px] font-bold text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded-full border border-indigo-500/10">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span>VOICE ENABLED</span>
            </div>
            
            <h3 className="text-sm font-bold text-gray-200 mt-2">Speech Billing Assistant</h3>
            
            {/* Glowing mic visualizer */}
            <button
              onClick={toggleVoiceInput}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                isListening
                  ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 shadow-glow-indigo scale-105'
                  : 'bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {isListening ? (
                <>
                  <Mic className="w-8 h-8 text-white z-10 animate-bounce" />
                  <span className="absolute inset-0 rounded-full bg-indigo-500/30 animate-ping" />
                  <span className="absolute -inset-2 rounded-full bg-indigo-500/10 animate-pulse" />
                </>
              ) : (
                <MicOff className="w-8 h-8" />
              )}
            </button>

            {isListening ? (
              <div className="flex flex-col gap-1 items-center">
                <p className="text-indigo-400 font-semibold text-xs tracking-tight animate-pulse">Listening for voice instructions...</p>
                <div className="flex items-center gap-1.5 mt-1.5">
                  <span className="w-1.5 h-3 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <span className="w-1.5 h-5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                  <span className="w-1.5 h-4 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
                  <span className="w-1.5 h-6 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-xs leading-relaxed px-2">
                Click microphone to issue verbal commands: <br />
                <span className="font-semibold text-indigo-400">"Add 150"</span>, 
                <span className="font-semibold text-indigo-400"> "Minus 50"</span>, or 
                <span className="font-semibold text-indigo-400"> "Clear"</span>.
              </p>
            )}
          </div>
        )}

        {/* Checkout panel */}
        <button
          onClick={handleCheckout}
          disabled={total === 0 && !currentInput}
          className="w-full py-4.5 rounded-3xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 font-extrabold text-white text-sm tracking-wide shadow-glow-indigo active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none mt-auto"
          style={{ height: '64px' }}
        >
          <CreditCard className="w-5 h-5" />
          <span>GENERATE QR PAYMENT</span>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
}
