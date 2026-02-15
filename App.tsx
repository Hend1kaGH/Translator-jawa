
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Context, TranslationResult, JavaneseLevel, SITUATIONS, Situation, DEFAULT_CONTEXTS } from './types';
import { translateToJavanese, generateSituationalText } from './geminiService';

const MicrophoneIcon = ({ isRecording }: { isRecording: boolean }) => (
  <svg 
    width="24" 
    height="24" 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
    className={`transition-all duration-300 ${isRecording ? 'scale-110' : ''}`}
  >
    <path 
      d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" 
      fill="currentColor" 
      className={isRecording ? 'animate-pulse' : ''}
    />
    <path 
      d="M19 10v2a7 7 0 0 1-14 0v-2" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <line 
      x1="12" y1="19" x2="12" y2="23" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
    <line 
      x1="8" y1="23" x2="16" y2="23" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
    />
  </svg>
);

const AddIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [availableContexts, setAvailableContexts] = useState<Context[]>(DEFAULT_CONTEXTS);
  const [selectedContext, setSelectedContext] = useState<Context>(DEFAULT_CONTEXTS[1]); 
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isGeneratingSituation, setIsGeneratingSituation] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAddingContext, setIsAddingContext] = useState(false);
  const [newContextName, setNewContextName] = useState('');

  const recognitionRef = useRef<any>(null);

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Silakan masukkan teks terlebih dahulu.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const translation = await translateToJavanese(inputText, selectedContext);
      setResult(translation);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menerjemahkan.');
    } finally {
      setIsLoading(false);
    }
  }, [inputText, selectedContext]);

  const handleSituationClick = async (situation: Situation) => {
    setIsGeneratingSituation(true);
    setError(null);
    try {
      const text = await generateSituationalText(situation.prompt, selectedContext);
      setInputText(text);
    } catch (err) {
      setError('Gagal membuat inspirasi kalimat.');
    } finally {
      setIsGeneratingSituation(false);
    }
  };

  const handleAddContext = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (newContextName.trim()) {
      const name = newContextName.trim();
      if (!availableContexts.includes(name)) {
        setAvailableContexts([...availableContexts, name]);
      }
      setSelectedContext(name);
      setNewContextName('');
      setIsAddingContext(false);
    }
  };

  const handleClearInput = () => {
    setInputText('');
    setError(null);
    setResult(null);
  };

  // Added handleCopy to allow users to copy the translation to clipboard
  const handleCopy = useCallback(() => {
    if (result?.translatedText) {
      navigator.clipboard.writeText(result.translatedText);
      alert('Teks berhasil disalin ke papan klip.');
    }
  }, [result?.translatedText]);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.lang = 'id-ID';
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.onstart = () => { setIsRecording(true); setError(null); };
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev.trim()} ${transcript}` : transcript));
      };
      recognition.onerror = (event: any) => {
        if (event.error !== 'no-speech') setError('Gagal mendengarkan suara.');
        setIsRecording(false);
      };
      recognition.onend = () => { setIsRecording(false); };
      recognitionRef.current = recognition;
    }
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return alert('Peramban tidak mendukung fitur suara.');
    isRecording ? recognitionRef.current.stop() : recognitionRef.current.start();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center bg-background-light overflow-x-hidden">
      <div className="w-full max-w-[1200px] px-6 py-4 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between py-8">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-primary">Krama.In</h1>
            <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-primary/30 mt-1">mbangun rasa mbangun basa</p>
          </div>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col items-center py-4">
          <div className="w-full max-w-3xl bg-white rounded-3xl shadow-[0_4px_25px_rgba(93,64,55,0.04)] border border-primary/5 p-8 md:p-12 flex flex-col gap-10">
            
            {/* Situational Inspiration - Clean Text Version */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-3 overflow-x-auto no-scrollbar -mx-2 px-2 pb-1">
                {SITUATIONS.map((situation) => (
                  <button
                    key={situation.id}
                    onClick={() => handleSituationClick(situation)}
                    disabled={isGeneratingSituation || isLoading}
                    className="flex-shrink-0 px-5 py-2.5 rounded-full border border-primary/10 bg-background-light/40 hover:bg-secondary/5 hover:border-secondary/40 hover:text-secondary transition-all text-xs font-bold text-primary/60 disabled:opacity-50 shadow-sm"
                  >
                    {situation.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Section */}
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end px-1">
                <label className="text-[11px] font-bold text-primary/40 uppercase tracking-[0.15em]">Input Bahasa Indonesia</label>
                {inputText && (
                  <button 
                    onClick={handleClearInput}
                    className="text-[10px] text-red-400 font-bold uppercase tracking-widest hover:text-red-600 transition-colors flex items-center gap-1.5"
                  >
                    <TrashIcon />
                    HAPUS INPUT
                  </button>
                )}
              </div>
              <div className="relative">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className={`w-full min-h-[200px] p-8 text-xl border border-primary/5 rounded-2xl focus:ring-0 focus:border-secondary/30 outline-none transition-all placeholder:text-primary/10 bg-[#FDFCF9] shadow-inner resize-none leading-relaxed ${isGeneratingSituation ? 'opacity-50' : ''}`}
                  placeholder={isGeneratingSituation ? "Sedang merangkai kalimat..." : "Tulis atau ucapkan kalimat..."}
                  disabled={isGeneratingSituation || isLoading}
                ></textarea>
                <button
                  onClick={toggleRecording}
                  className={`absolute right-6 bottom-6 w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-xl active:scale-95 ${
                    isRecording 
                      ? 'bg-red-500 text-white ring-8 ring-red-50' 
                      : 'bg-white text-primary/40 hover:text-secondary shadow-[0_10px_20px_rgba(0,0,0,0.05)] border border-primary/5'
                  }`}
                >
                  <MicrophoneIcon isRecording={isRecording} />
                </button>
              </div>
            </div>

            {/* Context Selection - Matches Screenshot */}
            <div className="flex flex-col gap-6">
              <div className="flex justify-between items-center px-1">
                <label className="text-[11px] font-bold text-primary/40 uppercase tracking-[0.15em]">Bicara dengan siapa?</label>
                <button 
                  onClick={() => setIsAddingContext(true)}
                  className="text-[11px] font-bold text-secondary flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <AddIcon />
                  TAMBAH KONTEKS
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableContexts.map((ctx) => (
                  <ContextPill 
                    key={ctx}
                    label={ctx} 
                    isActive={selectedContext === ctx}
                    onClick={() => setSelectedContext(ctx)}
                  />
                ))}
              </div>
            </div>

            {/* Manual Translate Button - Matches Screenshot Styling */}
            <div className="pt-4 flex flex-col items-center gap-6">
              <button
                onClick={handleTranslate}
                disabled={isLoading || isGeneratingSituation || !inputText.trim()}
                className="w-full py-6 rounded-2xl bg-[#A89D91] text-white font-bold text-lg flex items-center justify-center gap-4 shadow-lg hover:brightness-95 transition-all active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="tracking-wide">Terjemahkan</span>
                    <ArrowRightIcon />
                  </>
                )}
              </button>
              <p className="text-[10px] text-primary/20 font-bold uppercase tracking-[0.2em]">
                {isRecording ? "Sedang mendengarkan..." : isGeneratingSituation ? "Menyiapkan inspirasi..." : "Klik tombol untuk mulai menterjemahkan"}
              </p>
            </div>

            {error && (
              <div className="bg-red-50 text-red-500 p-4 rounded-xl text-xs font-bold border border-red-100 text-center uppercase tracking-wider">
                {error}
              </div>
            )}
          </div>
        </main>

        <footer className="py-12 flex flex-col md:flex-row items-center justify-between border-t border-primary/5 text-[10px] text-primary/30 font-bold uppercase tracking-[0.2em]">
          <div>© 2024 Krama.In — Aksara Digital Nusantara</div>
          <div className="flex gap-10 mt-6 md:mt-0">
            <a className="hover:text-primary transition-colors" href="#">Kebijakan Privasi</a>
            <a className="hover:text-primary transition-colors" href="#">API Dokumentasi</a>
            <a className="hover:text-primary transition-colors" href="#">Kontak</a>
          </div>
        </footer>
      </div>

      {/* New Context Modal */}
      {isAddingContext && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-sm z-[60] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
            <h3 className="text-xl font-bold text-primary mb-2">Tambah Konteks</h3>
            <p className="text-xs text-primary/40 font-bold uppercase tracking-wider mb-8">Siapa lawan bicara Anda?</p>
            <form onSubmit={handleAddContext}>
              <input 
                autoFocus
                type="text" 
                value={newContextName}
                onChange={(e) => setNewContextName(e.target.value)}
                placeholder="Misal: Kyai, Mertua..."
                className="w-full p-5 border border-primary/10 rounded-2xl focus:ring-0 focus:border-secondary/50 outline-none mb-8 text-primary font-medium"
              />
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => { setIsAddingContext(false); setNewContextName(''); }}
                  className="flex-1 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest text-primary/40 hover:bg-primary/5 transition-colors"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="flex-1 py-4 rounded-2xl bg-secondary text-white font-bold text-xs uppercase tracking-widest shadow-xl shadow-secondary/20 hover:brightness-105"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Result Modal Overlay */}
      {result && (
        <div className="fixed inset-0 bg-primary/10 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-primary/5 p-10 md:p-14 relative overflow-hidden animate-in zoom-in-95 duration-300">
            <div className="absolute top-0 left-0 w-full h-2 bg-secondary/80"></div>
            
            <div className="flex justify-between items-start mb-10">
              <div className="flex flex-col gap-2">
                <span className="text-[10px] font-bold text-secondary uppercase tracking-[0.25em]">
                  {result.level} • {selectedContext}
                </span>
                <h3 className="text-xs font-bold text-primary/30 uppercase tracking-[0.2em]">Hasil Terjemahan</h3>
              </div>
              <button 
                // Updated to use an inline function to close the result modal
                onClick={() => setResult(null)}
                className="text-[10px] font-black text-primary/20 hover:text-primary uppercase tracking-[0.2em] transition-all"
              >
                Close
              </button>
            </div>

            <div className="mb-10 text-center">
              <p className="serif-title text-3xl md:text-5xl text-primary leading-tight italic">
                "{result.translatedText}"
              </p>
            </div>

            <div className="flex flex-col gap-8 pt-8 border-t border-primary/5">
              <p className="text-sm text-primary/40 leading-relaxed font-medium italic">
                {result.explanation}
              </p>
              <button 
                // Added handleCopy function reference here
                onClick={handleCopy}
                className="w-full py-5 rounded-2xl bg-primary text-white font-bold text-xs uppercase tracking-[0.3em] hover:shadow-2xl transition-all active:scale-95"
              >
                Salin Teks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ContextPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ContextPill: React.FC<ContextPillProps> = ({ label, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`group flex items-center justify-center p-5 rounded-2xl border-2 transition-all active:scale-[0.97] ${
        isActive 
        ? 'border-secondary bg-white ring-4 ring-secondary/5 shadow-xl shadow-secondary/5' 
        : 'border-primary/5 hover:border-secondary/20 bg-white shadow-sm'
      }`}
    >
      <span className={`text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap overflow-hidden text-ellipsis ${
        isActive ? 'text-secondary' : 'text-primary/30 group-hover:text-primary/60'
      }`}>
        {label}
      </span>
    </button>
  );
};

export default App;
