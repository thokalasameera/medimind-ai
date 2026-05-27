import React, { useState, useEffect } from 'react';
import { Mic, MicOff, AlertCircle } from 'lucide-react';

const VoiceInput = ({ onTranscript, placeholder = "Press mic to speak..." }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    // Initialize Web Speech Recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false; // Stop listening after user stops speaking
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
        setErrorMsg('');
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        if (onTranscript) {
          onTranscript(transcript);
        }
      };

      rec.onerror = (event) => {
        console.error("Speech Recognition Error:", event.error);
        if (event.error === 'not-allowed') {
          setErrorMsg('Microphone access blocked. Enable permissions.');
        } else {
          setErrorMsg('Could not process speech. Speak clearly.');
        }
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      setRecognition(rec);
    } else {
      console.warn("Web Speech API is not supported in this browser.");
    }
  }, [onTranscript]);

  const toggleListen = () => {
    if (!recognition) {
      setErrorMsg("Voice input is not supported in this browser. Please use Chrome/Edge.");
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      try {
        recognition.start();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="flex flex-col items-center space-y-3 w-full">
      <div className="flex items-center space-x-4 w-full">
        {/* Pulsing mic button */}
        <button
          type="button"
          onClick={toggleListen}
          className={`
            relative w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm
            ${isListening 
              ? 'bg-neon-crimson text-white animate-pulse shadow-neon-crimson' 
              : 'bg-slate-200/10 hover:bg-slate-200/20 text-neon-cyan hover:text-white border border-neon-cyan/20 hover:shadow-neon-cyan'
            }
          `}
          title={isListening ? "Deactivate voice sensor" : "Activate voice sensor"}
        >
          {isListening ? (
            <>
              <MicOff className="w-5 h-5 z-10" />
              {/* Double wave rings for sci-fi look */}
              <span className="absolute inset-0 rounded-xl bg-neon-crimson/30 animate-ping"></span>
            </>
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </button>

        {/* Live Audio Visualizer Lines (Mocked when active) */}
        <div className="flex-1 h-12 bg-slate-900/40 rounded-xl border border-slate-200/10 flex items-center px-4 overflow-hidden relative">
          {isListening ? (
            <div className="flex items-center space-x-1.5 w-full justify-center">
              <span className="text-[10px] text-neon-crimson uppercase tracking-widest mr-2 font-mono animate-pulse">Sensors Logged:</span>
              <span className="w-1.5 h-6 bg-neon-crimson rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
              <span className="w-1.5 h-4 bg-neon-crimson rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
              <span className="w-1.5 h-8 bg-neon-crimson rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></span>
              <span className="w-1.5 h-5 bg-neon-crimson rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-7 bg-neon-crimson rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              <span className="w-1.5 h-3 bg-neon-crimson rounded-full animate-bounce" style={{ animationDelay: '0.6s' }}></span>
            </div>
          ) : (
            <span className="text-xs text-slate-400 truncate font-mono">
              {placeholder}
            </span>
          )}
        </div>
      </div>
      
      {/* Alert banner if browser is incompatible */}
      {errorMsg && (
        <div className="flex items-center space-x-2 text-[11px] text-neon-crimson/90 bg-neon-crimson/10 border border-neon-crimson/25 px-3 py-1.5 rounded-lg w-full">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
