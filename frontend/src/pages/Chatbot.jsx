import React, { useState, useRef, useEffect } from 'react';
import { ML_API_URL } from '../context/AuthContext';
import GlassCard from '../components/GlassCard';
import VoiceInput from '../components/VoiceInput';
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User, 
  Cpu, 
  Sparkles,
  Activity
} from 'lucide-react';
import { localChatbot } from '../utils/localPredictors';

const Chatbot = () => {
  const [messages, setMessages] = useState([
    {
      sender: 'bot',
      text: "System terminal initialized. I am MediMind NLP assistant, connected to our local medical knowledge matrix. Ask me any health questions, symptoms, or diagnostic queries!"
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const threadEndRef = useRef(null);

  // Auto-scroll messaging thread
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText.trim();
    if (!text) return;

    if (!textToSend) {
      setInputText('');
    }

    // Add user message to stack
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setLoading(true);

    try {
      const res = await fetch(`${ML_API_URL}/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      if (!res.ok) throw new Error("Flask service returned non-OK status");
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
        setIsDemoMode(false);
      } else {
        throw new Error(data.reply || "Chatbot returned unsuccessful status");
      }
    } catch (err) {
      console.warn("Flask ML service offline, running local fallback chatbot.", err);
      setIsDemoMode(true);
      const data = localChatbot(text);
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } finally {
      setLoading(false);
    }
  };

  // Voice transcript receiver
  const handleVoiceTranscript = (text) => {
    handleSendMessage(text);
  };

  return (
    <div className="space-y-6">
      
      {/* HEADER */}
      <div>
        <div className="flex items-center space-x-3">
          <h2 className="text-2xl font-black font-cyber-title text-white">AI Clinical Chatbot Console</h2>
          {isDemoMode && (
            <span className="px-2.5 py-0.5 rounded-lg text-[9px] font-mono font-bold uppercase tracking-widest bg-amber-500/10 border border-amber-500/25 text-amber-400 shadow-sm animate-pulse flex items-center space-x-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block animate-ping mr-1"></span>
              <span>Demo Mode</span>
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500 font-mono mt-1">
          Interface with our custom natural language processor to resolve diagnostic queries in real-time.
        </p>
      </div>

      {/* MESSENGER INTERFACE GLASS GRID */}
      <div className="max-w-4xl mx-auto">
        <GlassCard glowColor="purple" className="h-[75vh] flex flex-col justify-between p-0 overflow-hidden shadow-2xl relative">
          
          {/* TOP CONSOLE STATUS BAR */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200/10 dark:border-slate-800/15 bg-slate-900/40 z-10 flex-shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-neon-purple to-neon-indigo flex items-center justify-center shadow-neon-purple animate-pulse-slow">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider font-cyber-title flex items-center">
                  MediMind Companion <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block ml-2 animate-ping"></span>
                </h3>
                <p className="text-[9px] text-slate-500 uppercase tracking-widest font-mono">NLP Knowledge Engine v1.0</p>
              </div>
            </div>

            <div className="flex items-center space-x-1.5 text-[9px] font-mono text-neon-purple bg-neon-purple/5 border border-neon-purple/10 px-2.5 py-1 rounded-lg uppercase tracking-wider">
              <Cpu className="w-3 h-3 animate-spin" />
              <span>{isDemoMode ? 'Local AI Fallback Active' : 'TF-IDF Context Sync'}</span>
            </div>
          </div>

          {/* DYNAMIC SCROLLING MESSAGE BOX */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 min-h-0 bg-slate-950/20">
            {messages.map((msg, idx) => (
              <div 
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div className={`flex items-start space-x-3 max-w-[80%] ${msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                  
                  {/* Avatar */}
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm mt-0.5
                    ${msg.sender === 'user' 
                      ? 'bg-gradient-to-br from-neon-cyan to-neon-indigo text-cyber-dark font-black text-xs font-mono' 
                      : 'bg-slate-800 border border-slate-200/10 text-neon-purple'
                    }
                  `}>
                    {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  {/* Message bubble */}
                  <div className={`
                    p-4 rounded-2xl text-xs font-mono leading-relaxed border shadow-sm
                    ${msg.sender === 'user'
                      ? 'bg-neon-cyan/10 border-neon-cyan/20 text-white rounded-tr-none'
                      : 'bg-slate-900/60 border-slate-200/5 text-slate-300 rounded-tl-none'
                    }
                  `}>
                    {msg.text}
                  </div>

                </div>
              </div>
            ))}

            {/* MESSAGE LOADING PLACEHOLDER */}
            {loading && (
              <div className="flex justify-start">
                <div className="flex items-start space-x-3 max-w-[80%]">
                  <div className="w-8 h-8 rounded-lg bg-slate-850 border border-slate-250/10 text-neon-purple flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="p-4 bg-slate-900/40 border border-slate-200/5 rounded-2xl rounded-tl-none text-xs font-mono text-slate-400 flex items-center space-x-2">
                    <Activity className="w-4.5 h-4.5 text-neon-purple animate-spin" />
                    <span>Searching medical dictionary indices...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={threadEndRef} />
          </div>

          {/* LOWER INPUT BAR (z-10) */}
          <div className="p-4 border-t border-slate-200/10 dark:border-slate-800/15 bg-slate-900/40 flex flex-col space-y-3 z-10 flex-shrink-0">
            
            {/* Embedded voice input sensor trigger */}
            <div className="w-full">
              <VoiceInput 
                onTranscript={handleVoiceTranscript}
                placeholder="Talk to clinical companion... (Microphone enabled)"
              />
            </div>

            {/* Standard keyboard message typing */}
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="flex space-x-2 w-full"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Or type standard medical question here..."
                className="flex-1 bg-slate-950/60 border border-slate-200/10 dark:border-slate-800/30 rounded-xl px-4 py-3.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-neon-purple/50 font-mono"
              />
              <button
                type="submit"
                className="px-5 bg-gradient-to-r from-neon-purple to-neon-indigo hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl flex items-center justify-center transition-all duration-300 shadow-md shadow-neon-purple/15 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </GlassCard>
      </div>

    </div>
  );
};

export default Chatbot;
