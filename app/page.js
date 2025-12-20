"use client";

import React, { useState, useCallback } from 'react';
import { 
  Upload, FileText, X, MoveVertical, 
  Download, FilePlus, Shield, Zap, 
  ChevronRight, AlertCircle, CheckCircle2,
  Settings2, Info
} from 'lucide-react';
import { PDFDocument } from 'pdf-lib';

export default function Workstation() {
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [dragActive, setDragActive] = useState(false);

  // Gestione caricamento file
  const handleFiles = (newFiles) => {
    const validFiles = Array.from(newFiles).filter(file => 
      file.type === 'application/pdf' || file.type.startsWith('image/')
    ).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file: file,
      name: file.name,
      size: (file.size / (1024 * 1024)).toFixed(2) + ' MB',
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : null
    }));

    setFiles(prev => [...prev, ...validFiles]);
    setStatus('idle');
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const removeFile = (id) => {
    setFiles(prev => {
      const filtered = prev.filter(f => f.id !== id);
      const removed = prev.find(f => f.id === id);
      if (removed?.preview) URL.revokeObjectURL(removed.preview);
      return filtered;
    });
  };

  // LOGICA "TRICK" (PDF MERGE)
  const executeTrick = async () => {
    if (files.length === 0) return;
    
    setIsProcessing(true);
    setStatus('processing');

    try {
      const mergedPdf = await PDFDocument.create();
      
      for (const fileObj of files) {
        const fileBytes = await fileObj.file.arrayBuffer();
        
        if (fileObj.type === 'application/pdf') {
          const pdf = await PDFDocument.load(fileBytes);
          const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          copiedPages.forEach((page) => mergedPdf.addPage(page));
        } else if (fileObj.type.startsWith('image/')) {
          const image = fileObj.type === 'image/png' 
            ? await mergedPdf.embedPng(fileBytes)
            : await mergedPdf.embedJpg(fileBytes);
          
          const page = mergedPdf.addPage([image.width, image.height]);
          page.drawImage(image, {
            x: 0,
            y: 0,
            width: image.width,
            height: image.height,
          });
        }
      }

      const pdfBytes = await mergedPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `digitrik_result_${Date.now()}.pdf`;
      link.click();
      
      setStatus('success');
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] text-gray-100 p-4 md:p-8 font-sans selection:bg-blue-500/30">
      
      {/* BACKGROUND DECORATION */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] pointer-events-none -z-10" />

      {/* HEADER ELETTRONICO */}
      <div className="max-w-6xl mx-auto mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="relative">
          <div className="absolute -left-4 top-0 w-1 h-full bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
          <h1 className="text-4xl font-black tracking-tighter text-white italic leading-none">
            DIGITRIK <span className="text-blue-600 not-italic">WS</span>
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-[1px] w-8 bg-gray-800" />
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-bold">Terminal v4.0.1_Stable</p>
          </div>
        </div>

        <div className="flex gap-4 w-full md:w-auto">
          <div className="flex-1 md:flex-none bg-[#0c0c0c] border border-gray-800 rounded-xl px-4 py-2 flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full animate-pulse ${status === 'error' ? 'bg-red-500' : 'bg-blue-500'}`} />
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">System Status</div>
              <div className="text-xs font-mono text-gray-300">{status.toUpperCase()}</div>
            </div>
          </div>
          <div className="hidden lg:flex bg-[#0c0c0c] border border-gray-800 rounded-xl px-4 py-2 items-center gap-3">
            <Shield className="text-gray-600" size={16} />
            <div>
              <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">Security</div>
              <div className="text-xs font-mono text-gray-300">SSL-LOCAL</div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLONNA SINISTRA: INPUT & LISTA */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* DROPZONE */}
          <div 
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`relative group transition-all duration-500 rounded-3xl border-2 border-dashed 
              ${dragActive ? 'border-blue-500 bg-blue-500/5 scale-[0.99]' : 'border-gray-800 bg-[#0c0c0c] hover:border-gray-700'}`}
          >
            <input
              type="file"
              multiple
              accept="application/pdf,image/*"
              onChange={(e) => handleFiles(e.target.files)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            />
            <div className="p-12 text-center">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 transition-all duration-500
                ${dragActive ? 'bg-blue-600 text-white rotate-180' : 'bg-gray-900 text-blue-500 group-hover:scale-110 group-hover:bg-blue-600/10'}`}>
                <Upload size={32} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Ingresso Documenti</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                Trascina qui PDF o immagini. Il sistema li elaborerà in sequenza.
              </p>
              
              <div className="mt-8 flex justify-center gap-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase">
                  <CheckCircle2 size={12} className="text-blue-900" /> PDF Support
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase">
                  <CheckCircle2 size={12} className="text-blue-900" /> Image Embed
                </div>
              </div>
            </div>
          </div>

          {/* LISTA FILE DINAMICA */}
          <div className="space-y-3">
            {files.length > 0 && (
              <div className="flex items-center justify-between px-2">
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">
                  Coda di elaborazione ({files.length})
                </span>
                <button onClick={() => setFiles([])} className="text-[10px] text-red-500 font-bold hover:underline">
                  CLEAR ALL
                </button>
              </div>
            )}
            
            {files.map((file, index) => (
              <div 
                key={file.id} 
                className="bg-[#111111] border border-gray-800/50 rounded-2xl p-4 flex items-center gap-4 group hover:border-blue-500/30 transition-all hover:translate-x-1"
              >
                <div className="text-[10px] font-mono text-gray-700 w-4">{index + 1}</div>
                <div className="p-3 bg-gray-900 rounded-xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <FileText size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-gray-200 truncate">{file.name}</div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-[10px] text-gray-600 font-mono uppercase">{file.size}</span>
                    <span className="h-1 w-1 bg-gray-800 rounded-full" />
                    <span className="text-[10px] text-blue-500/70 font-bold uppercase">{file.type.split('/')[1]}</span>
                  </div>
                </div>
                <button 
                  onClick={() => removeFile(file.id)}
                  className="p-2.5 bg-gray-900/50 hover:bg-red-500/10 hover:text-red-500 text-gray-700 transition-all rounded-xl border border-gray-800 group-hover:border-red-500/20"
                >
                  <X size={16} />
                </button>
              </div>
            ))}

            {files.length === 0 && (
              <div className="py-20 text-center border border-gray-900 rounded-3xl border-dashed">
                <Info size={24} className="mx-auto text-gray-800 mb-3" />
                <p className="text-gray-700 text-xs font-bold uppercase tracking-widest">Nessun file in attesa</p>
              </div>
            )}
          </div>
        </div>

        {/* COLONNA DESTRA: CONTROLLI E PUBBLICITÀ */}
        <div className="lg:col-span-5">
          <div className="bg-[#0c0c0c] border border-gray-800 rounded-[2rem] p-8 sticky top-8 shadow-2xl shadow-blue-900/5">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black flex items-center gap-3">
                <Settings2 size={24} className="text-blue-600" />
                CONSOLE
              </h2>
              <div className="px-2 py-1 bg-blue-600/10 border border-blue-500/20 rounded-md text-[9px] font-bold text-blue-500 tracking-tighter uppercase">
                Ready
              </div>
            </div>
            
            <div className="space-y-4 mb-8">
              <div className="p-4 bg-gray-900/30 rounded-2xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                <div className="text-[10px] text-gray-600 font-black uppercase mb-1 tracking-widest">Algoritmo</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-300">PDF Smart Merge</span>
                  <Zap size={14} className="text-yellow-500" />
                </div>
              </div>
              <div className="p-4 bg-gray-900/30 rounded-2xl border border-gray-800/50 hover:border-gray-700 transition-colors">
                <div className="text-[10px] text-gray-600 font-black uppercase mb-1 tracking-widest">Compressione</div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-300">Lossless Engine</span>
                  <div className="text-[10px] font-mono text-green-500 underline">ACTIVE</div>
                </div>
              </div>
            </div>

            {/* BANNER PUBBLICITARIO INTEGRATO - STESSA LARGHEZZA PULSANTE */}
            <div className="w-full mb-6 group">
              <div className="bg-[#121212] border border-blue-500/20 rounded-2xl p-4 flex items-center justify-between group-hover:border-blue-500/40 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-2xl -mr-10 -mt-10 group-hover:bg-blue-600/10 transition-colors" />
                
                <div className="flex items-center gap-4 relative z-10">
                  <div className="w-12 h-12 bg-blue-600/20 rounded-xl flex items-center justify-center border border-blue-500/30 shadow-inner">
                    <span className="text-blue-400 text-xs font-black italic tracking-tighter">DT</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">
                      Digitrik <span className="text-blue-600 text-[10px] font-bold ml-1">PRO</span>
                    </h4>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tight mt-0.5">
                      Processi illimitati e cloud storage
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
              </div>
            </div>

            <button 
              onClick={executeTrick}
              disabled={files.length === 0 || isProcessing}
              className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.2em] text-sm transition-all relative overflow-hidden group
                ${files.length > 0 && !isProcessing
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-[0_10px_30px_rgba(37,99,235,0.3)] scale-100 hover:scale-[1.02]' 
                : 'bg-gray-900 text-gray-700 cursor-not-allowed opacity-50'
              }`}
            >
              <div className="relative z-10 flex items-center justify-center gap-3">
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Zap size={18} fill="currentColor" />
                    <span>Esegui Trick</span>
                  </>
                )}
              </div>
              {/* Effetto luce al passaggio */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />
            </button>
            
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex items-center gap-2 text-[9px] text-gray-600 font-bold uppercase tracking-widest justify-center">
                <AlertCircle size={12} /> Privacy: I file non lasciano il browser
              </div>
              <div className="h-[1px] w-full bg-gray-900" />
              <p className="text-[10px] text-center text-gray-700 px-4 leading-relaxed font-medium">
                Sviluppato per professionisti del digitale. Crittografia end-to-end garantita dalla logica client-side.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="max-w-6xl mx-auto mt-20 pb-8 text-center">
        <div className="text-[10px] font-black text-gray-800 uppercase tracking-[0.5em]">
          &copy; 2025 DIGITRIK WS // ALL RIGHTS RESERVED
        </div>
      </footer>

      <style jsx global>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
