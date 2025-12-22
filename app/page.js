'use client';

import React, { useCallback, useState, useEffect } from 'react';
import Script from 'next/script'; 
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  FileText, Plus, Trash2, RefreshCcw, Wand2, 
  ImageIcon, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, 
  Sparkles, X, Check, RotateCw, Tag, Activity, ShieldAlert, 
  Feather, Layers, Printer, Ghost, Lock, Settings, LayoutTemplate, 
  Image as IconImage, Shield, FileOutput, UploadCloud, Grid3X3, List
} from 'lucide-react';

// --- UTILS & DATA ---
const fileEncyclopedia = {
  "AI": { desc: "Vettoriale Adobe.", curiosity: "Rinominabile in PDF.", type: "Vettoriale" },
  "CSV": { desc: "Dati testuali.", curiosity: "Supportato: convertito in tabulato.", type: "Dati" },
  "DOCX": { desc: "Word XML.", curiosity: "È uno ZIP rinominato.", type: "Documento" },
  "JPG": { desc: "Foto compressa.", curiosity: "Soggetto a degrado digitale.", type: "Immagine" },
  "PDF": { desc: "Portable Document.", curiosity: "Standard ISO dal 2008.", type: "Universale" },
  "PNG": { desc: "Web Lossless.", curiosity: "Supporta trasparenza alpha.", type: "Immagine" },
  "TXT": { desc: "Testo puro.", curiosity: "Renderizzato con font Courier.", type: "Testo" }
};

const compressImage = (file, quality = 0.7, scale = 1) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob((blob) => resolve(blob), 'image/jpeg', quality);
      };
    };
  });
};

// --- UI COMPONENTS ---
const SectionTitle = ({ icon: Icon, title }) => (
  <div className="flex items-center gap-2 mb-4 text-zinc-400 uppercase tracking-widest text-[10px] font-bold">
    <Icon size={14} className="text-blue-500" />
    {title}
  </div>
);

const SmartSlider = ({ label, value, min, max, step = 1, unit = "", onChange }) => {
  return (
    <div className="group">
      <div className="flex justify-between text-[11px] font-medium mb-2 text-zinc-400 group-hover:text-zinc-200 transition-colors">
        <span>{label}</span>
        <span className="text-blue-400 font-mono">{value}{unit}</span>
      </div>
      <input 
        type="range" min={min} max={max} step={step} value={value} 
        onChange={(e) => onChange(e.target.value)} 
        className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400 transition-all" 
      />
    </div>
  );
};

const AlignSelector = ({ value, onChange }) => (
  <div className="flex bg-zinc-950 p-1 rounded-lg border border-zinc-800 mt-2">
    {[
      { id: 'left', icon: AlignLeft },
      { id: 'center', icon: AlignCenter },
      { id: 'right', icon: AlignRight }
    ].map((opt) => (
      <button
        key={opt.id}
        onClick={() => onChange(opt.id)}
        className={`flex-1 flex items-center justify-center py-1.5 rounded-md transition-all ${
          value === opt.id 
            ? 'bg-zinc-800 text-blue-400 shadow-sm' 
            : 'text-zinc-600 hover:text-zinc-400'
        }`}
      >
        <opt.icon size={14} />
      </button>
    ))}
  </div>
);

const Toggle = ({ label, checked, onChange, icon: Icon, subLabel }) => (
  <div 
    onClick={() => onChange(!checked)}
    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-300 group ${checked ? 'bg-blue-500/10 border-blue-500/50' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}`}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${checked ? 'bg-blue-500 text-white' : 'bg-zinc-800 text-zinc-500 group-hover:text-zinc-300'}`}>
        {Icon ? <Icon size={16} /> : <Check size={16} />}
      </div>
      <div>
        <span className={`block text-xs font-bold ${checked ? 'text-blue-400' : 'text-zinc-300'}`}>{label}</span>
        {subLabel && <span className="text-[10px] text-zinc-500 block">{subLabel}</span>}
      </div>
    </div>
    
    {/* SWITCH CONTAINER FIX */}
    <div className={`w-8 h-4 rounded-full relative transition-colors duration-300 ${checked ? 'bg-blue-500' : 'bg-zinc-700'}`}>
      <div className={`absolute top-0.5 left-0.5 w-3 h-3 bg-white rounded-full transition-transform duration-300 ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  </div>
);

const Toast = ({ message, type, onClose }) => (
  <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border animate-in slide-in-from-bottom-5 fade-in duration-300 ${type === 'error' ? 'bg-red-950/80 border-red-500/30 text-red-200' : 'bg-zinc-900/90 border-blue-500/30 text-zinc-100'}`}>
    {type === 'error' ? <ShieldAlert size={20} className="text-red-500" /> : <Check size={20} className="text-blue-500" />}
    <div className="text-sm font-medium">{message}</div>
    <button onClick={onClose}><X size={14} className="opacity-50 hover:opacity-100" /></button>
  </div>
);

// --- MAIN APP ---
export default function DigitrikPro() {
  // CORE STATE
  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('files'); 
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
   
  // SDK STATE (Load from CDN)
  const [isSdkReady, setIsSdkReady] = useState(false);

  // UI STATE
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [tempFilename, setTempFilename] = useState("Digitrik_Result");
  const [trickCuriosity, setTrickCuriosity] = useState({ key: 'PDF', text: 'Il formato PDF è nato nel 1993.' });
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  // CONFIGURATION STATE
  const [config, setConfig] = useState({
    // Layout
    useHeader: false, headerText: '', headerAlign: 'center',
    useFooter: false, footerText: '', footerAlign: 'center',
    usePagination: false, paginationAlign: 'right', // Default a destra
    rotation: 0,
    // Matrix
    watermarkText: '', textOpacity: 0.25, textSize: 30,
    useWatermark: false, useGrid: false, useSecurity: false,
    // Logo
    useLogo: false, logoFile: null, logoOpacity: 0.15, logoSize: 150,
    // Security
    ghostMode: false, metaTitle: '', metaAuthor: '',
    // Performance
    compression: 'balanced', action: 'conversione', extractRange: ''
  });

  // HEALTH MONITOR
  const [health, setHealth] = useState({ size: 0, status: 'ok', score: 100 });

  // --- CDN LOADER ---
  useEffect(() => {
    if (window.PDFLib) {
      setIsSdkReady(true);
    }
  }, []);

  useEffect(() => {
    let size = 0;
    files.forEach(f => size += f.file.size);
    if (config.logoFile) size += config.logoFile.size;
    const mb = size / (1024 * 1024);
    let score = 100;
    if (mb > 20) score -= 20;
    if ((config.useWatermark || config.useGrid) && config.textOpacity > 0.5) score -= 10;
    setHealth({ size: mb.toFixed(2), status: score > 80 ? 'ok' : score > 50 ? 'warn' : 'crit', score });
  }, [files, config]);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  const onDrop = useCallback(accepted => {
    const valid = accepted.filter(f => ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain', 'text/csv'].includes(f.type) || f.name.endsWith('.csv'));
    if (valid.length < accepted.length) showToast("File non supportati ignorati.", "error");
    setFiles(prev => [...prev, ...valid.map(f => ({ id: Math.random().toString(36), file: f }))]);
    if (valid.length > 0) showToast(`${valid.length} file aggiunti.`);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  const onLogoDrop = useCallback(accepted => {
    if (accepted[0]) {
      setConfig(prev => ({ ...prev, logoFile: accepted[0], useLogo: true }));
      showToast("Logo caricato.");
    }
  }, []);
  const { getRootProps: getLogoProps, getInputProps: getLogoInput } = useDropzone({ onDrop: onLogoDrop, accept: {'image/*': []}, multiple: false });

  // --- LOGIC: PDF ENGINE (PURE WINDOW ACCESS) ---
  const generatePdf = async (isPreview = false) => {
    if (files.length === 0 || !window.PDFLib) return null;
    
    // ACCESS GLOBAL WINDOW OBJECT FROM CDN
    const { PDFDocument, StandardFonts, rgb, degrees } = window.PDFLib;

    try {
      const doc = await PDFDocument.create();
      
      // Metadata
      if (!isPreview) {
        if (config.ghostMode) {
          doc.setTitle(""); doc.setAuthor(""); doc.setCreator("Ghost"); doc.setProducer("");
          doc.setCreationDate(new Date('1999-01-01'));
        } else {
          if (config.metaTitle) doc.setTitle(config.metaTitle);
          if (config.metaAuthor) doc.setAuthor(config.metaAuthor);
          doc.setCreator("Digitrik Pro");
        }
      }

      const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
      const fontNormal = await doc.embedFont(StandardFonts.Helvetica);
      const fontMono = await doc.embedFont(StandardFonts.Courier);

      // Processing
      for (const f of files) {
        let buffer;
        if (f.file.type.startsWith('image/') && !isPreview) {
          if (config.compression === 'web') buffer = await (await compressImage(f.file, 0.6, 0.6)).arrayBuffer();
          else if (config.compression === 'balanced') buffer = await (await compressImage(f.file, 0.8, 0.8)).arrayBuffer();
          else buffer = await f.file.arrayBuffer();
        } else {
          buffer = await f.file.arrayBuffer();
        }

        if (f.file.type === 'application/pdf') {
          const srcDoc = await PDFDocument.load(buffer);
          let indices = srcDoc.getPageIndices();
          if (config.action === 'estrai' && config.extractRange) {
             const parts = config.extractRange.split(',');
             const targets = [];
             parts.forEach(p => {
               if (p.includes('-')) {
                 const [s, e] = p.split('-').map(Number);
                 for (let i=s; i<=e; i++) targets.push(i-1);
               } else targets.push(Number(p)-1);
             });
             indices = targets.filter(i => i >= 0 && i < srcDoc.getPageCount());
          }
          const pages = await doc.copyPages(srcDoc, indices);
          pages.forEach(p => doc.addPage(p));
        } else if (f.file.type.startsWith('image/')) {
          const page = doc.addPage();
          let img;
          try { img = await doc.embedJpg(buffer); } catch { img = await doc.embedPng(buffer); }
          const dims = img.scaleToFit(page.getWidth() - 40, page.getHeight() - 40);
          page.drawImage(img, { x: page.getWidth()/2 - dims.width/2, y: page.getHeight()/2 - dims.height/2, width: dims.width, height: dims.height });
        } else if (f.file.type.includes('text')) {
          const txt = await f.file.text();
          let page = doc.addPage();
          const fontSize = 10;
          const lineHeight = 12;
          const lines = txt.split(/\r\n|\r|\n/);
          let y = 800;
          let x = 50;
           
          const maxLines = isPreview ? 60 : lines.length;
           
          for (let i = 0; i < maxLines; i++) {
             if (y < 50 && !isPreview) { page = doc.addPage(); y = 800; }
             page.drawText(lines[i].replace(/[^\x00-\x7F]/g, "?"), { x, y, size: fontSize, font: fontMono, color: rgb(0,0,0) });
             y -= lineHeight;
          }
        }
      }

      // Embed Logo
      let logoImg = null;
      if (config.useLogo && config.logoFile) {
        const logoBuf = await config.logoFile.arrayBuffer();
        logoImg = config.logoFile.type.includes('png') ? await doc.embedPng(logoBuf) : await doc.embedJpg(logoBuf);
      }

      // --- APPLICAZIONE OVERLAY E ROTAZIONE (SMART SYSTEM) ---
      const pages = doc.getPages();
      pages.forEach((p, idx) => {
        const { width, height } = p.getSize();
        
        // Applica rotazione alla pagina
        const rotation = config.rotation;
        p.setRotation(degrees(rotation));

        // --- Funzione Helper per disegnare testo che rispetta la rotazione visiva ---
        const drawSmartText = (text, type, alignment) => {
          if (!text) return;
          
          const size = 9;
          const fontToUse = type === 'header' ? fontBold : fontNormal;
          const textWidth = fontToUse.widthOfTextAtSize(text, size);
          const margin = 30; // Margine dal bordo

          let x, y, textRotate;

          // Calcolo coordinate in base alla rotazione della pagina
          switch (rotation) {
            case 0: // Standard
              textRotate = 0;
              y = type === 'header' ? height - margin : margin;
              if (alignment === 'left') x = 40;
              else if (alignment === 'right') x = width - 40 - textWidth;
              else x = (width / 2) - (textWidth / 2);
              break;

            case 90: // Ruotato 90° orario (Il "Top" visivo è il lato sinistro originale)
              textRotate = 90;
              x = type === 'header' ? margin : width - margin;
              // In 90°, l'asse Y visivo corre lungo l'asse X originale
              if (alignment === 'left') y = 40; 
              else if (alignment === 'right') y = height - 40 - textWidth;
              else y = (height / 2) - (textWidth / 2);
              break;

            case 180: // Capovolto
              textRotate = 180;
              y = type === 'header' ? margin : height - margin;
              // A 180°, destra e sinistra si invertono matematicamente
              if (alignment === 'left') x = width - 40; 
              else if (alignment === 'right') x = 40 + textWidth;
              else x = (width / 2) + (textWidth / 2);
              break;

            case 270: // Ruotato 270° (o -90°)
              textRotate = 270;
              x = type === 'header' ? width - margin : margin;
              if (alignment === 'left') y = height - 40;
              else if (alignment === 'right') y = 40 + textWidth;
              else y = (height / 2) + (textWidth / 2);
              break;
            
            default: break;
          }

          p.drawText(text, {
            x, y, size,
            font: fontToUse,
            color: rgb(0.2, 0.2, 0.2),
            rotate: degrees(textRotate),
          });
        };

        // Disegna Header & Footer usando il sistema Smart
        if (config.useHeader) drawSmartText(config.headerText.toUpperCase(), 'header', config.headerAlign);
        if (config.useFooter) drawSmartText(config.footerText, 'footer', config.footerAlign);
        // Paginazione ora usa l'allineamento dinamico
        if (config.usePagination) drawSmartText(`${idx + 1} / ${pages.length}`, 'footer', config.paginationAlign);

        // --- Watermark (Coordinate relative standard) ---
        if (config.watermarkText) {
          const textW = fontBold.widthOfTextAtSize(config.watermarkText, config.textSize);
          if (config.useWatermark) {
             for (let x = -width; x < width * 2; x += (textW / 2) + 100) {
               for (let y = -height; y < height * 2; y += 150) {
                 p.drawText(config.watermarkText, { x, y, size: config.textSize, font: fontBold, opacity: config.textOpacity, rotate: degrees(45), color: rgb(0.5,0.5,0.5) });
               }
             }
          }
          if (config.useGrid) {
             for (let x = 30; x < width; x += 150) {
               for (let y = 30; y < height; y += 100) {
                 p.drawText(config.watermarkText.substring(0, 15), { x, y, size: config.textSize * 0.6, font: fontBold, opacity: config.textOpacity, color: rgb(0.4,0.4,0.4) });
               }
             }
          }
          if (config.useSecurity) {
             p.drawText(config.watermarkText, { x: width/2 - 50, y: height/2, size: config.textSize * 1.5, font: fontBold, opacity: config.textOpacity, rotate: degrees(45), color: rgb(0.8,0.2,0.2) });
          }
        }

        if (logoImg && config.useLogo) {
          const dims = logoImg.scaleToFit(config.logoSize, config.logoSize);
          p.drawImage(logoImg, { x: width/2 - dims.width/2, y: height/2 - dims.height/2, width: dims.width, height: dims.height, opacity: config.logoOpacity });
        }
      });

      return await doc.save();
    } catch (e) {
      console.error(e);
      if(!isPreview) showToast("Errore: " + e.message, "error");
      return null;
    }
  };

  useEffect(() => {
    let t;
    const updatePreview = async () => {
      if (!isSdkReady || !window.PDFLib) return;
      const pdfBytes = await generatePdf(true);
      if (pdfBytes) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        setPreviewUrl(URL.createObjectURL(blob));
      } else {
        setPreviewUrl(null);
      }
    };
    t = setTimeout(updatePreview, 800);
    return () => clearTimeout(t);
  }, [files, config, isSdkReady]);

  const handleExportClick = () => {
    if (files.length === 0) {
      showToast("Nessun file da esportare!", "error");
      return;
    }
    const keys = Object.keys(fileEncyclopedia);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setTrickCuriosity({ key: randomKey, text: fileEncyclopedia[randomKey].curiosity });
    setTempFilename("Digitrik_Result");
    setShowRenameModal(true);
  };

  const handleConfirmDownload = async () => {
    setShowRenameModal(false);
    setIsProcessing(true);
    const pdfBytes = await generatePdf(false);
    if (pdfBytes) {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tempFilename}.pdf`;
      link.click();
      showToast("Download completato con successo!");
    }
    setIsProcessing(false);
  };

  const NavItem = ({ id, icon: Icon, label }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all mb-1 ${activeTab === id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'}`}
    >
      <Icon size={18} />
      <span className="text-xs font-bold tracking-wide uppercase">{label}</span>
    </button>
  );

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 font-sans flex overflow-hidden selection:bg-blue-500/30">
      {/* CDN LOADER */}
      <Script 
        src="https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js" 
        strategy="afterInteractive" 
        onLoad={() => setIsSdkReady(true)}
      />

      {/* MODAL */}
      {showRenameModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-[#0a0a0a] border border-blue-600/30 rounded-[2rem] w-[90%] max-w-lg p-8 shadow-[0_0_50px_rgba(37,99,235,0.1)] relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600/10 p-3 rounded-full text-blue-500"><Wand2 size={24} /></div>
              <div><h3 className="text-xl font-black italic text-white uppercase tracking-wider">Finalizza Trick</h3><p className="text-[11px] text-gray-500 font-bold uppercase">Scegli il nome del tuo file</p></div>
              <button onClick={() => setShowRenameModal(false)} className="absolute top-6 right-6 text-gray-600 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-2 mb-8">
              <label className="text-xs font-bold text-gray-400 uppercase ml-2">Nome File</label>
              <div className="relative">
                <input type="text" value={tempFilename} onChange={(e) => setTempFilename(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleConfirmDownload()} autoFocus className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white font-medium outline-none focus:border-blue-600 transition-all shadow-inner" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-xs font-bold pointer-events-none">.PDF</span>
              </div>
            </div>
            <div className="bg-blue-900/10 border border-blue-600/10 rounded-2xl p-5 mb-8 flex gap-4">
              <Sparkles className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">Lo sapevi? ({trickCuriosity.key})</span>
                <p className="text-xs text-gray-300 italic leading-relaxed">{trickCuriosity.text}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRenameModal(false)} className="flex-1 py-4 rounded-xl border border-white/5 hover:bg-white/5 text-gray-400 font-bold text-xs uppercase tracking-widest transition-all">Annulla</button>
              <button onClick={handleConfirmDownload} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"><Check size={16} /> Conferma & Scarica</button>
            </div>
          </div>
        </div>
      )}

      {/* LEFT SIDEBAR */}
      <aside className="w-64 border-r border-white/5 bg-zinc-950 flex flex-col p-4 z-20">
        <div className="mb-8 px-2 flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Wand2 size={18} className="text-white" />
          </div>
          <div><h1 className="text-lg font-black italic tracking-tighter leading-none">DIGITRIK</h1><span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">Pro Suite</span></div>
        </div>
        <nav className="flex-1">
          <SectionTitle icon={LayoutTemplate} title="Workspace" />
          <NavItem id="files" icon={FileText} label="Gestione File" />
          <NavItem id="layout" icon={Settings} label="Layout & Export" />
          <div className="h-6" />
          <SectionTitle icon={Shield} title="Security & Brand" />
          <NavItem id="watermark" icon={ImageIcon} label="Watermark & Logo" />
          <NavItem id="security" icon={Lock} label="Ghost Mode" />
        </nav>
        <div className={`mt-auto p-4 rounded-2xl border ${health.status === 'crit' ? 'bg-red-950/20 border-red-500/20' : 'bg-zinc-900 border-white/5'}`}>
          <div className="flex justify-between items-end mb-2"><span className="text-[10px] font-bold text-zinc-500 uppercase">System Health</span><span className={`text-xs font-black ${health.status === 'ok' ? 'text-green-500' : 'text-yellow-500'}`}>{health.score}%</span></div>
          <div className="w-full h-1 bg-zinc-800 rounded-full mb-3 overflow-hidden"><div className={`h-full transition-all duration-500 ${health.status === 'ok' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${health.score}%`}} /></div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400"><Activity size={12} /> Peso Stimato: <span className="text-zinc-200">{health.size} MB</span></div>
        </div>
      </aside>

      {/* CENTER */}
      <main className="flex-1 flex flex-col relative bg-zinc-900/50">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4"><h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">{activeTab === 'files' ? 'File Manager' : activeTab === 'layout' ? 'Layout Config' : activeTab === 'watermark' ? 'Branding' : 'Security'}</h2></div>
          <div className="flex items-center gap-3"><div className="text-[10px] font-bold text-zinc-500 uppercase px-3 py-1 bg-zinc-900 rounded-full border border-white/5">{files.length} File Caricati</div></div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div {...getRootProps()} className={`relative border-2 border-dashed rounded-[2rem] transition-all duration-300 group ${isDragActive ? 'border-blue-500 bg-blue-500/5 scale-[0.99]' : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'}`}>
            <input {...getInputProps()} />
            {files.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-10 cursor-pointer">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xl"><UploadCloud size={32} className="text-zinc-600 group-hover:text-blue-500 transition-colors" /></div>
                <h3 className="text-lg font-bold text-zinc-300">Trascina qui i tuoi documenti</h3>
                <p className="text-sm text-zinc-500 mt-2 max-w-xs">Supportiamo PDF, Immagini HQ e file di testo. Il motore Digitrik si occuperà del resto.</p>
              </div>
            ) : (
              <div className="p-8">
                <DragDropContext onDragEnd={(res) => { if(!res.destination) return; const items = Array.from(files); const [reordered] = items.splice(res.source.index, 1); items.splice(res.destination.index, 0, reordered); setFiles(items); }}>
                  <Droppable droppableId="list" direction="horizontal">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {files.map((f, i) => (
                          <Draggable key={f.id} draggableId={f.id} index={i}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-zinc-950 border border-white/5 p-4 rounded-xl flex items-center gap-4 group hover:border-blue-500/30 transition-all ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500 rotate-2' : ''}`}>
                                <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center shrink-0"><FileText size={20} className="text-blue-500" /></div>
                                <div className="min-w-0 flex-1"><p className="text-xs font-bold text-zinc-200 truncate">{f.file.name}</p><p className="text-[10px] text-zinc-500 font-mono">{(f.file.size/1024).toFixed(1)} KB</p></div>
                                <button onClick={(e) => { e.stopPropagation(); setFiles(files.filter(x => x.id !== f.id)); }} className="p-2 hover:text-red-500 text-zinc-600 transition-colors"><Trash2 size={16} /></button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        <div className="border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center p-4 hover:bg-zinc-900/50 transition-colors cursor-pointer text-zinc-600 hover:text-zinc-400"><Plus size={24} /><span className="text-[10px] font-bold mt-2 uppercase">Aggiungi</span></div>
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </div>
            )}
          </div>
          {previewUrl && (
            <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <button onClick={() => setIsPreviewOpen(!isPreviewOpen)} className="w-full flex justify-between items-center mb-4 px-2 group">
                <div className="flex items-center gap-2"><div className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2 group-hover:text-blue-500 transition-colors">{isPreviewOpen ? <Eye size={14} /> : <EyeOff size={14} />} Live Output Preview {isPreviewOpen ? '' : '(Hidden)'}</div></div>
                <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-1 rounded">Rendering Real-time</span>
              </button>
              {isPreviewOpen && (
                <div className="bg-zinc-950 rounded-2xl border border-white/5 overflow-hidden shadow-2xl relative h-[500px]">
                  <iframe src={`${previewUrl}#toolbar=0&navpanes=0`} className="w-full h-full opacity-90 hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* RIGHT SIDEBAR */}
      <aside className="w-80 border-l border-white/5 bg-zinc-950 p-6 flex flex-col overflow-y-auto">
        <div className="flex-1 space-y-8">
          {activeTab === 'files' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
              <div>
                <h3 className="text-sm font-bold text-white mb-1">Azione Principale</h3>
                <p className="text-xs text-zinc-500 mb-4">Cosa vuoi fare con i file caricati?</p>
                <div className="space-y-2">
                  {[
                    { id: 'conversione', label: 'Converti in PDF', icon: RefreshCcw },
                    { id: 'unisci', label: 'Unisci File (Merge)', icon: Layers },
                    { id: 'estrai', label: 'Estrai Pagine', icon: FileOutput }
                  ].map(act => (
                    <button key={act.id} onClick={() => setConfig({ ...config, action: act.id })} className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all ${config.action === act.id ? 'bg-zinc-100 border-zinc-100 text-zinc-950' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:border-zinc-700'}`}>
                      <div className="flex items-center gap-3"><act.icon size={16} /><span className="text-xs font-bold">{act.label}</span></div>
                      {config.action === act.id && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>
              {config.action === 'estrai' && (
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">Range Pagine (es. 1-3, 5)</label>
                  <input type="text" placeholder="E.g. 1, 3-5" value={config.extractRange} onChange={e => setConfig({...config, extractRange: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
              <SectionTitle icon={LayoutTemplate} title="Struttura Pagina" />
              <div className="space-y-4">
                
                {/* HEADER SECTION */}
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <Toggle label="Intestazione" checked={config.useHeader} onChange={v => setConfig({...config, useHeader: v})} icon={AlignLeft} />
                  {config.useHeader && (
                    <div className="animate-in slide-in-from-top-2 fade-in">
                      <input 
                        type="text" 
                        placeholder="Testo Header..." 
                        value={config.headerText} 
                        onChange={e => setConfig({...config, headerText: e.target.value})} 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none mb-1" 
                      />
                      <AlignSelector 
                        value={config.headerAlign} 
                        onChange={(v) => setConfig({...config, headerAlign: v})} 
                      />
                    </div>
                  )}
                </div>

                {/* FOOTER SECTION */}
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <Toggle label="Piè di Pagina" checked={config.useFooter} onChange={v => setConfig({...config, useFooter: v})} icon={AlignRight} />
                  {config.useFooter && (
                    <div className="animate-in slide-in-from-top-2 fade-in">
                      <input 
                        type="text" 
                        placeholder="Testo Footer..." 
                        value={config.footerText} 
                        onChange={e => setConfig({...config, footerText: e.target.value})} 
                        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none mb-1" 
                      />
                      <AlignSelector 
                        value={config.footerAlign} 
                        onChange={(v) => setConfig({...config, footerAlign: v})} 
                      />
                    </div>
                  )}
                </div>

                {/* PAGINATION SECTION */}
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <Toggle label="Numerazione Pagine" checked={config.usePagination} onChange={v => setConfig({...config, usePagination: v})} icon={List} />
                  {config.usePagination && (
                    <div className="animate-in slide-in-from-top-2 fade-in">
                      <div className="flex justify-between items-center mb-1 px-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">Posizione</span>
                      </div>
                      <AlignSelector 
                        value={config.paginationAlign} 
                        onChange={(v) => setConfig({...config, paginationAlign: v})} 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <SectionTitle icon={RotateCw} title="Rotazione Pagine" />
              <div className="grid grid-cols-4 gap-2">
                {[0, 90, 180, 270].map(deg => (
                  <button key={deg} onClick={() => setConfig({...config, rotation: deg})} className={`py-2 rounded-lg text-xs font-bold border transition-all ${config.rotation === deg ? 'bg-blue-600 border-blue-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>{deg}°</button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'watermark' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
              <SectionTitle icon={Tag} title="Filigrana Testuale" />
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-4">
                <input type="text" placeholder="Testo filigrana (es. BOZZA)" value={config.watermarkText} onChange={e => setConfig({...config, watermarkText: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-blue-500" />
                <div className="space-y-2">
                  <Toggle label="Nastro (Diagonale)" checked={config.useWatermark} onChange={v => setConfig({...config, useWatermark: v})} icon={Sparkles} />
                  <Toggle label="Griglia Fitta" checked={config.useGrid} onChange={v => setConfig({...config, useGrid: v})} icon={Grid3X3} />
                  <Toggle label="Security Alert" checked={config.useSecurity} onChange={v => setConfig({...config, useSecurity: v})} icon={ShieldAlert} />
                </div>
                <SmartSlider label="Opacità" value={Math.round(config.textOpacity*100)} min={5} max={100} onChange={v => setConfig({...config, textOpacity: v/100})} unit="%" />
                <SmartSlider label="Grandezza" value={config.textSize} min={10} max={100} onChange={v => setConfig({...config, textSize: parseInt(v)})} unit="px" />
              </div>
              <SectionTitle icon={IconImage} title="Logo Aziendale" />
              <div {...getLogoProps()} className="border border-dashed border-zinc-700 rounded-xl p-6 text-center hover:bg-zinc-900/50 cursor-pointer transition-all">
                <input {...getLogoInput()} />
                <div className="flex flex-col items-center gap-2">
                  {config.logoFile ? (
                    <>
                      <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-500"><Check size={20}/></div>
                      <span className="text-xs font-bold text-white">{config.logoFile.name}</span>
                    </>
                  ) : (
                    <>
                      <ImageIcon size={24} className="text-zinc-600 mb-2" />
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">Trascina Logo Qui</span>
                    </>
                  )}
                </div>
              </div>
              {config.logoFile && (
                <div className="space-y-4 pt-2">
                    <Toggle label="Attiva Logo" checked={config.useLogo} onChange={v => setConfig({...config, useLogo: v})} />
                    <SmartSlider label="Dimensione Logo" value={config.logoSize} min={50} max={300} onChange={v => setConfig({...config, logoSize: parseInt(v)})} unit="px" />
                    <SmartSlider label="Opacità Logo" value={Math.round(config.logoOpacity*100)} min={5} max={100} onChange={v => setConfig({...config, logoOpacity: v/100})} unit="%" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
              <div className={`p-4 rounded-xl border transition-all ${config.ghostMode ? 'bg-red-950/20 border-red-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-red-500 font-bold uppercase text-xs"><Ghost size={14} /> Ghost Protocol</div>
                  <input type="checkbox" checked={config.ghostMode} onChange={e => setConfig({...config, ghostMode: e.target.checked})} className="accent-red-500 w-4 h-4" />
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">Rimuove metadati, autore e data creazione per l'anonimato.</p>
              </div>
              {!config.ghostMode && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <SectionTitle icon={Tag} title="Metadati Pubblici" />
                  <input type="text" placeholder="Titolo Documento" value={config.metaTitle} onChange={e => setConfig({...config, metaTitle: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none" />
                  <input type="text" placeholder="Autore" value={config.metaAuthor} onChange={e => setConfig({...config, metaAuthor: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none" />
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-6 border-t border-white/5 mt-auto">
          <div className="flex bg-zinc-900 p-1 rounded-lg mb-4">
            {[{id:'web', l:'Web', i:Feather}, {id:'balanced', l:'Std', i:Layers}, {id:'print', l:'Pro', i:Printer}].map(c => (
              <button key={c.id} onClick={() => setConfig({...config, compression: c.id})} className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-[10px] font-bold uppercase transition-all ${config.compression === c.id ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}><c.i size={12} /> {c.l}</button>
            ))}
          </div>
          <button 
            onClick={handleExportClick} 
            disabled={!isSdkReady || isProcessing || files.length === 0} 
            className="w-full py-4 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {!isSdkReady ? (
              <span className="flex items-center gap-2 text-zinc-500"><RefreshCcw className="animate-spin" size={16} /> Caricamento Core...</span>
            ) : isProcessing ? (
              <span className="flex items-center gap-2"><RefreshCcw className="animate-spin" size={16} /> Elaborazione...</span>
            ) : (
              <span className="flex items-center gap-2"><Wand2 size={16} /> Esporta Documento</span>
            )}
          </button>
        </div>
      </aside>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
