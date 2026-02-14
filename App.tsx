
import React, { useState, useCallback } from 'react';
import { Context, TranslationResult, JavaneseLevel } from './types';
import { QUICK_SCENARIOS } from './constants';
import { translateToJavanese } from './geminiService';

const App: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [selectedContext, setSelectedContext] = useState<Context>(Context.ELDER);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleTranslate = useCallback(async () => {
    if (!inputText.trim()) return;

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

  const handleQuickScenario = (text: string) => {
    setInputText(text);
    setError(null);
  };

  const closeResult = () => {
    setResult(null);
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result.translatedText);
      alert('Teks berhasil disalin!');
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center overflow-x-hidden pb-10">
      {/* Decorative Gradients */}
      <div className="fixed top-[-10%] right-[-5%] w-[40%] h-[40%] bg-secondary/5 rounded-full blur-[120px] -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px] -z-10"></div>

      <div className="w-full max-w-[1200px] px-6 py-4 flex flex-col h-full">
        {/* Header */}
        <header className="flex items-center justify-between py-6 border-b border-primary/10">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <div className="bg-primary text-white p-1 rounded-lg">
                <span className="material-symbols-outlined text-2xl">translate</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-primary">Krama.In</h1>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] font-medium text-primary/60 mt-0.5">Sopan itu Mudah</p>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a className="text-sm font-semibold hover:text-secondary transition-colors" href="#">Panduan</a>
            <a className="text-sm font-semibold hover:text-secondary transition-colors" href="#">Tentang Kami</a>
            <button className="bg-primary text-white px-6 py-2 rounded-full text-sm font-bold hover:shadow-lg transition-all active:scale-95">
              Masuk
            </button>
          </nav>
        </header>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col items-center justify-center py-12 md:py-20">
          {/* Hero Text */}
          <div className="text-center mb-12">
            <h2 className="serif-title text-4xl md:text-6xl text-primary mb-4">Ngomong Jawa dadi luwih gampang</h2>
            <p className="text-primary/70 text-lg md:text-xl">Terjemahkan bahasa Indonesia ke tingkatan bahasa Jawa dengan tepat.</p>
          </div>

          {/* Interaction Box */}
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-[0_20px_50px_rgba(93,64,55,0.06)] border border-primary/5 p-6 md:p-10 flex flex-col gap-8 transition-all">
            {/* Input Section */}
            <div className="flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-primary/80 uppercase tracking-widest">Input Bahasa Indonesia</label>
                <span className="text-[10px] bg-secondary/10 text-secondary px-2.5 py-1 rounded-md font-bold">DETEKSI OTOMATIS</span>
              </div>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                className="w-full min-h-[160px] p-5 text-lg border border-primary/10 rounded-xl focus:ring-2 focus:ring-secondary/40 focus:border-secondary outline-none transition-all placeholder:text-primary/20 bg-background-light/30 resize-none"
                placeholder="Tulis kalimat yang ingin diterjemahkan di sini... Contoh: Saya ingin pergi ke rumah nenek besok pagi."
              ></textarea>
            </div>

            {/* Context Selection */}
            <div className="flex flex-col gap-4">
              <label className="text-xs font-bold text-primary/80 uppercase tracking-widest">Bicara dengan siapa?</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <ContextPill 
                  icon="person" 
                  label={Context.PEER} 
                  isActive={selectedContext === Context.PEER}
                  onClick={() => setSelectedContext(Context.PEER)}
                />
                <ContextPill 
                  icon="groups" 
                  label={Context.ELDER} 
                  isActive={selectedContext === Context.ELDER}
                  onClick={() => setSelectedContext(Context.ELDER)}
                />
                <ContextPill 
                  icon="child_care" 
                  label={Context.CHILD} 
                  isActive={selectedContext === Context.CHILD}
                  onClick={() => setSelectedContext(Context.CHILD)}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            {/* Convert Action */}
            <div className="pt-2">
              <button
                onClick={handleTranslate}
                disabled={isLoading || !inputText.trim()}
                className={`w-full py-4.5 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all group shadow-xl ${
                  isLoading || !inputText.trim() 
                  ? 'bg-primary/50 cursor-not-allowed text-white/70' 
                  : 'bg-primary hover:bg-primary/95 text-white shadow-primary/20 hover:shadow-primary/30 active:scale-[0.98]'
                }`}
              >
                {isLoading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Memproses Bahasa...</span>
                  </>
                ) : (
                  <>
                    <span>Convert to Javanese</span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Scenarios */}
          <div className="w-full max-w-3xl mt-16">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-px flex-1 bg-primary/10"></div>
              <span className="text-[10px] font-bold text-primary/30 uppercase tracking-[0.3em]">Atau gunakan skenario cepat</span>
              <div className="h-px flex-1 bg-primary/10"></div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {QUICK_SCENARIOS.map((scenario) => (
                <button
                  key={scenario.id}
                  onClick={() => handleQuickScenario(scenario.text)}
                  className="group flex flex-col items-center gap-3 p-5 bg-white/40 border border-primary/5 rounded-xl hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all"
                >
                  <span className="material-symbols-outlined text-secondary text-3xl group-hover:scale-110 transition-transform">{scenario.icon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider">{scenario.label}</span>
                </button>
              ))}
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="py-10 flex flex-col md:flex-row items-center justify-between border-t border-primary/10 text-[10px] text-primary/40 font-bold uppercase tracking-[0.2em]">
          <div>© 2024 Krama.In — Aksara Digital Nusantara</div>
          <div className="flex gap-8 mt-6 md:mt-0">
            <a className="hover:text-primary transition-colors" href="#">Kebijakan Privasi</a>
            <a className="hover:text-primary transition-colors" href="#">API Dokumentasi</a>
            <a className="hover:text-primary transition-colors" href="#">Kontak</a>
          </div>
        </footer>
      </div>

      {/* Result Modal Overlay */}
      {result && (
        <div className="fixed inset-0 bg-primary/20 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-secondary/20 p-8 md:p-12 relative overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            <div className="absolute top-0 left-0 w-full h-2.5 bg-secondary"></div>
            
            <div className="flex justify-between items-start mb-8">
              <div>
                <span className="inline-flex items-center px-4 py-1.5 rounded-full text-[10px] font-bold bg-secondary/10 text-secondary uppercase tracking-widest mb-3 border border-secondary/20 shadow-sm">
                  <span className="material-symbols-outlined text-sm mr-1.5 fill-1">verified</span> 
                  {result.level}
                </span>
                <h3 className="text-xs font-bold text-primary/40 uppercase tracking-[0.2em]">Hasil Terjemahan</h3>
              </div>
              <button 
                onClick={closeResult}
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-primary/5 text-primary/30 hover:text-primary transition-all active:scale-90"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-background-light rounded-2xl p-8 mb-8 border border-primary/5 shadow-inner">
              <p className="serif-title text-2xl md:text-4xl text-primary leading-relaxed text-center">
                "{result.translatedText}"
              </p>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-3 text-primary/60 italic text-sm max-w-md">
                <span className="material-symbols-outlined text-secondary shrink-0">info</span>
                <span>{result.explanation}</span>
              </div>
              <div className="flex gap-3">
                <button 
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-primary/10 font-bold hover:bg-primary/5 transition-all active:scale-95 text-sm"
                >
                  <span className="material-symbols-outlined text-xl">share</span>
                  Bagikan
                </button>
                <button 
                  onClick={handleCopy}
                  className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-primary text-white font-bold hover:shadow-xl hover:shadow-primary/20 transition-all active:scale-95 text-sm"
                >
                  <span className="material-symbols-outlined text-xl">content_copy</span>
                  Salin Teks
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ContextPillProps {
  icon: string;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const ContextPill: React.FC<ContextPillProps> = ({ icon, label, isActive, onClick }) => {
  return (
    <button 
      onClick={onClick}
      className={`group flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all active:scale-[0.97] ${
        isActive 
        ? 'border-secondary bg-secondary/5 ring-4 ring-secondary/5 shadow-lg shadow-secondary/5' 
        : 'border-primary/5 hover:border-secondary/40 bg-white'
      }`}
    >
      <span className={`material-symbols-outlined text-xl transition-colors ${
        isActive ? 'text-secondary fill-1' : 'text-primary/40 group-hover:text-secondary'
      }`}>
        {icon}
      </span>
      <span className={`text-sm font-bold transition-colors ${
        isActive ? 'text-primary' : 'text-primary/60'
      }`}>
        {label}
      </span>
    </button>
  );
};

export default App;
