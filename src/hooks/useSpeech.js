import { useState, useEffect, useRef } from 'react';

export const useSpeech = (onCommand) => {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Check speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-IN'; // Set to Indian English for optimal numerical/UPI accents

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        console.log('Voice Command Received:', transcript);
        processVoiceCommand(transcript);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const startListening = () => {
    if (!speechSupported || isListening) return;
    try {
      recognitionRef.current.start();
    } catch (e) {
      console.error('Speech activation failed:', e);
    }
  };

  const stopListening = () => {
    if (!speechSupported || !isListening) return;
    try {
      recognitionRef.current.stop();
    } catch (e) {
      console.error('Speech termination failed:', e);
    }
  };

  // Sound broadcaster / TTS
  const speakAmount = (amount, shopName = "the shop") => {
    if (!window.speechSynthesis) return;
    
    // Cancel existing announcements
    window.speechSynthesis.cancel();
    
    const text = `Received rupees ${amount} on ${shopName}`;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Fetch a warm, premium localized English/Hindi voice if available
    const voices = window.speechSynthesis.getVoices();
    const localizedVoice = voices.find(v => v.lang.includes('en-IN') || v.lang.includes('hi-IN')) || voices[0];
    if (localizedVoice) {
      utterance.voice = localizedVoice;
    }
    
    utterance.rate = 0.95; // Slightly slower for crisp retail comprehension
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const processVoiceCommand = (text) => {
    if (!onCommand) return;

    // Command patterns:
    // "add 500", "plus 100"
    // "subtract 50", "minus 20"
    // "clear", "reset"
    // "pay", "generate qr", "checkout"
    
    if (text.includes('clear') || text.includes('reset')) {
      onCommand({ type: 'CLEAR' });
      return;
    }

    if (text.includes('pay') || text.includes('generate') || text.includes('qr') || text.includes('checkout')) {
      onCommand({ type: 'GENERATE_QR' });
      return;
    }

    // Number extractor regex
    const numberMatch = text.match(/\d+/);
    if (numberMatch) {
      const value = parseFloat(numberMatch[0]);
      if (text.includes('add') || text.includes('plus') || text.includes('and')) {
        onCommand({ type: 'ADD', value });
      } else if (text.includes('subtract') || text.includes('minus') || text.includes('remove')) {
        onCommand({ type: 'SUBTRACT', value });
      } else {
        // Default to set if no operation is explicitly mentioned
        onCommand({ type: 'SET', value });
      }
    }
  };

  return {
    isListening,
    speechSupported,
    startListening,
    stopListening,
    speakAmount
  };
};
