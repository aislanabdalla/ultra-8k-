import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  Download, 
  RefreshCw, 
  Zap, 
  ShieldCheck, 
  Sparkles, 
  Settings2, 
  User, 
  Type, 
  Layers, 
  Palette,
  Maximize2,
  FileText,
  Wand2,
  History,
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { upscaleImage, type EnhancementStyle, type UpscaleConfig } from './services/geminiService';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

declare global {
  interface Window {
    aistudio: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileInfo, setFileInfo] = useState<{ name: string; type: string } | null>(null);
  const [hasKey, setHasKey] = useState(false);
  
  // Advanced Settings State
  const [upscaleFactor, setUpscaleFactor] = useState(2);
  const [sharpen, setSharpen] = useState(50);
  const [denoise, setDenoise] = useState(26);
  const [fixCompression, setFixCompression] = useState(78);
  const [faceRecovery, setFaceRecovery] = useState(true);
  const [faceRecoveryStrength, setFaceRecoveryStrength] = useState(100);
  const [faceRecoveryMode, setFaceRecoveryMode] = useState<'realistic' | 'creative'>('realistic');
  const [gammaCorrection, setGammaCorrection] = useState(true);
  const [colorize, setColorize] = useState(false);
  const [autoRestore, setAutoRestore] = useState(false);

  // Check for API Key on mount
  React.useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setFileInfo({ name: file.name, type: file.type });
      const reader = new FileReader();
      reader.onload = (e) => {
        setOriginalImage(e.target?.result as string);
        setEnhancedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    multiple: false
  } as any);

  const handleProcess = async () => {
    if (!originalImage || !fileInfo) return;

    if (!hasKey) {
      setError("Por favor, selecione sua Chave de API Pro para usar o motor Ultra 8K Supreme sem bloqueios.");
      return;
    }

    setIsProcessing(true);
    setError(null);

    const config: UpscaleConfig = {
      upscaleFactor,
      sharpen,
      denoise,
      fixCompression,
      faceRecovery,
      faceRecoveryStrength,
      faceRecoveryMode,
      gammaCorrection,
      colorize,
      autoRestore
    };

    try {
      const result = await upscaleImage(originalImage, fileInfo.type, config);
      setEnhancedImage(result);
    } catch (err: any) {
      if (err.message?.includes("Requested entity was not found")) {
        setHasKey(false);
        setError("Chave de API inválida ou não encontrada. Por favor, selecione novamente.");
      } else {
        setError(err.message || "Ocorreu um erro ao processar a imagem.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!enhancedImage) return;
    const link = document.createElement('a');
    link.href = enhancedImage;
    link.download = `enhanced-${fileInfo?.name || 'image.png'}`;
    link.click();
  };

  const reset = () => {
    setOriginalImage(null);
    setEnhancedImage(null);
    setFileInfo(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-orange-500/30">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-6"
          >
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-medium tracking-wider uppercase text-white/60">Pro Image Engine v3.0 • Gigapixel Edition</span>
          </motion.div>
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-6xl font-bold tracking-tighter mb-4 bg-gradient-to-b from-white to-white/50 bg-clip-text text-transparent"
          >
            ULTRA 8K SUPREME
          </motion.h1>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Image Area */}
          <div className="lg:col-span-8 space-y-6">
            {!originalImage ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                {...getRootProps()}
                className={cn(
                  "group relative border-2 border-dashed rounded-3xl p-20 transition-all duration-300 cursor-pointer aspect-[16/9] flex flex-col items-center justify-center",
                  isDragActive 
                    ? "border-orange-500 bg-orange-500/5" 
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/[0.07]"
                )}
              >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center gap-6 text-center">
                  <div className="w-24 h-24 rounded-3xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Upload className={cn("w-10 h-10 transition-colors", isDragActive ? "text-orange-500" : "text-white/40")} />
                  </div>
                  <div>
                    <p className="text-2xl font-medium mb-2">Importar Imagem</p>
                    <p className="text-white/40">JPG, PNG, WEBP • Motor Ultra 8K Ativo</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Original */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Original View</span>
                    </div>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative group">
                      <img 
                        src={originalImage} 
                        alt="Original" 
                        className="w-full h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>

                  {/* Enhanced */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-2">
                      <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400">Ultra 8K View</span>
                    </div>
                    <div className="aspect-square rounded-2xl overflow-hidden bg-white/5 border border-white/10 relative flex items-center justify-center">
                      <AnimatePresence mode="wait">
                        {isProcessing ? (
                          <motion.div
                            key="processing"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-4"
                          >
                            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
                            <p className="text-xs font-mono text-white/40 uppercase tracking-widest">Neural 8K Reconstruction...</p>
                          </motion.div>
                        ) : enhancedImage ? (
                          <motion.img
                            key="enhanced"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            src={enhancedImage}
                            alt="Enhanced"
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="flex flex-col items-center gap-4 text-white/10">
                            <ImageIcon className="w-16 h-16" />
                            <p className="text-xs uppercase tracking-widest">Waiting for Engine</p>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={reset}
                      className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white/40 hover:text-white"
                      title="Nova Imagem"
                    >
                      <RefreshCw className="w-5 h-5" />
                    </button>
                    <div className="h-6 w-[1px] bg-white/10" />
                    <span className="text-xs text-white/40 font-mono truncate max-w-[200px]">{fileInfo?.name}</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {enhancedImage && (
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold transition-all flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Exportar
                      </button>
                    )}
                    <button
                      onClick={handleProcess}
                      disabled={isProcessing}
                      className="px-6 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-xs font-bold transition-all flex items-center gap-2 disabled:opacity-50"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 fill-current" />}
                      {isProcessing ? "Processando..." : "Export Image"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right: Settings Panel */}
          <div className="lg:col-span-4 space-y-4">
            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
              {/* API Key Status */}
              <div className={cn(
                "p-4 rounded-2xl border transition-all space-y-3",
                hasKey ? "bg-green-500/10 border-green-500/20" : "bg-orange-500/10 border-orange-500/20"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className={cn("w-4 h-4", hasKey ? "text-green-400" : "text-orange-400")} />
                    <h3 className={cn("text-xs font-bold uppercase tracking-widest", hasKey ? "text-green-400" : "text-orange-400")}>
                      {hasKey ? "Status: Pro Unlocked" : "Status: Restricted"}
                    </h3>
                  </div>
                  {!hasKey && <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />}
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  {hasKey 
                    ? "Motor Ultra 8K Supreme operando sem filtros de segurança e com máxima fidelidade neural." 
                    : "Para remover bloqueios e usar a IA de maior qualidade, selecione sua chave de API do Google Cloud."}
                </p>
                {!hasKey && (
                  <button
                    onClick={handleSelectKey}
                    className="w-full py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-[10px] font-bold transition-all uppercase tracking-widest"
                  >
                    Selecionar Chave Pro
                  </button>
                )}
              </div>

              {/* Active Engine Info */}
              <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-orange-400">Engine: Ultra 8K Supreme</h3>
                </div>
                <p className="text-[10px] text-white/40 leading-relaxed">
                  Motor de restauração total ativo. Incorpora reconstrução de poros, vetorização de texto e super-resolução 8K simultaneamente.
                </p>
              </div>

              {/* Upscale Factor */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2">
                  <Maximize2 className="w-3 h-3 text-orange-400" />
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60">Upscale Factor</h3>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 4, 8, 16].map((factor) => (
                    <button
                      key={factor}
                      onClick={() => setUpscaleFactor(factor)}
                      className={cn(
                        "py-2 rounded-xl border text-[10px] font-bold transition-all",
                        upscaleFactor === factor 
                          ? "bg-orange-500 border-orange-500 text-white" 
                          : "bg-white/5 border-transparent text-white/40 hover:bg-white/10"
                      )}
                    >
                      {factor}x
                    </button>
                  ))}
                </div>
                <p className="text-[9px] text-white/20 italic">
                  * Fatores maiores ativam a reconstrução recursiva de detalhes para evitar pixelização.
                </p>
              </div>

              {/* Model Settings */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-3 h-3 text-orange-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60">Model Settings</h3>
                  </div>
                  <Zap className="w-3 h-3 text-white/20" />
                </div>
                
                <div className="space-y-5">
                  {/* Sharpen */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Sharpen</label>
                      <span className="text-[10px] font-mono text-orange-400">{sharpen}</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={sharpen}
                      onChange={(e) => setSharpen(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Denoise */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Denoise</label>
                      <span className="text-[10px] font-mono text-orange-400">{denoise}</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={denoise}
                      onChange={(e) => setDenoise(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>

                  {/* Fix Compression */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Fix Compression</label>
                      <span className="text-[10px] font-mono text-orange-400">{fixCompression}</span>
                    </div>
                    <input 
                      type="range" min="0" max="100" value={fixCompression}
                      onChange={(e) => setFixCompression(parseInt(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Face Recovery */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-orange-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60">Face Recovery</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={faceRecovery} onChange={(e) => setFaceRecovery(e.target.checked)} className="sr-only peer" />
                    <div className="w-7 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white"></div>
                  </label>
                </div>

                {faceRecovery && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="space-y-4">
                    {/* Mode Selector */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-white/5 rounded-lg">
                      <button 
                        onClick={() => setFaceRecoveryMode('realistic')}
                        className={cn("py-1.5 text-[9px] font-bold uppercase rounded-md transition-all", faceRecoveryMode === 'realistic' ? "bg-white/10 text-white shadow-sm" : "text-white/20 hover:text-white/40")}
                      >
                        Realistic
                      </button>
                      <button 
                        onClick={() => setFaceRecoveryMode('creative')}
                        className={cn("py-1.5 text-[9px] font-bold uppercase rounded-md transition-all", faceRecoveryMode === 'creative' ? "bg-white/10 text-white shadow-sm" : "text-white/20 hover:text-white/40")}
                      >
                        Creative
                      </button>
                    </div>

                    {/* Strength Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Recovery Strength</label>
                        <span className="text-[10px] font-mono text-orange-400">{faceRecoveryStrength}</span>
                      </div>
                      <input 
                        type="range" min="0" max="100" value={faceRecoveryStrength}
                        onChange={(e) => setFaceRecoveryStrength(parseInt(e.target.value))}
                        className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-orange-500"
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Gamma Correction */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="w-3 h-3 text-orange-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60">Gamma Correction</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={gammaCorrection} onChange={(e) => setGammaCorrection(e.target.checked)} className="sr-only peer" />
                    <div className="w-7 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white"></div>
                  </label>
                </div>
              </div>

              {/* Colorize & Restore */}
              <div className="space-y-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Palette className="w-3 h-3 text-orange-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60">Colorize (B&W to Color)</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={colorize} onChange={(e) => setColorize(e.target.checked)} className="sr-only peer" />
                    <div className="w-7 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wand2 className="w-3 h-3 text-orange-400" />
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-white/60">Auto Restore (Fix Scratches)</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={autoRestore} onChange={(e) => setAutoRestore(e.target.checked)} className="sr-only peer" />
                    <div className="w-7 h-4 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white/40 after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white"></div>
                  </label>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center"
              >
                {error}
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-white/5 text-center text-white/10 text-[10px] uppercase tracking-[0.3em]">
        <p>© 2026 Neural Upscale Laboratory • Gigapixel Pro Edition</p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
