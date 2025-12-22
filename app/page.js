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
  Image as IconImage, Shield, FileOutput, UploadCloud, Grid3X3, List,
  Info, Mail, ShieldCheck, Heart, FolderOpen, Coffee, PlayCircle, CreditCard
} from 'lucide-react';

// --- TRANSLATIONS & DATA ---
const TRANSLATIONS = {
  it: {
    // Sidebar & Nav
    appName: "Pro Suite",
    workspace: "Spazio di Lavoro",
    files: "Gestione File",
    layout: "Layout & Export",
    branding: "Brand & Security",
    watermark: "Watermark & Logo",
    security: "Ghost Mode",
    health: "Salute Sistema",
    weight: "Peso Stimato",
    infoMenu: "Info & Contatti",
    supportBtn: "Sostieni il Progetto",
    // Header
    fileManager: "Gestione File",
    layoutConfig: "Configurazione Layout",
    brandingConfig: "Personalizzazione Brand",
    securityConfig: "Sicurezza",
    filesLoaded: "File Caricati",
    // Dropzone
    dropTitle: "Trascina qui i tuoi documenti",
    dropDesc: "Supportiamo PDF, Immagini HQ e file di testo. Il motore Digitrik si occuperà del resto.",
    browse: "oppure Sfoglia File",
    add: "Aggiungi File",
    unsupported: "File non supportati ignorati.",
    added: "file aggiunti.",
    preview: "Anteprima Live Output",
    previewHidden: "(Nascosta)",
    rendering: "Rendering Real-time",
    // Actions
    mainAction: "Azione Principale",
    actionDesc: "Cosa vuoi fare con i file caricati?",
    actConvert: "Converti in PDF",
    actMerge: "Unisci File (Merge)",
    actExtract: "Estrai Pagine",
    rangeLabel: "Range Pagine (es. 1-3, 5)",
    // Layout
    pageStruct: "Struttura Pagina",
    header: "Intestazione",
    headerPlace: "Testo Header...",
    footer: "Piè di Pagina",
    footerPlace: "Testo Footer...",
    pagination: "Numerazione Pagine",
    paginationSub: "Posizione Automatica",
    position: "Posizione",
    rotation: "Rotazione Pagine",
    // Watermark
    textWatermark: "Filigrana Testuale",
    watermarkPlace: "Testo filigrana (es. BOZZA)",
    optRibbon: "Nastro (Diagonale)",
    optGrid: "Griglia Fitta",
    optSecurity: "Security Alert",
    opacity: "Opacità",
    size: "Grandezza",
    corpLogo: "Logo Aziendale",
    dragLogo: "Trascina Logo Qui",
    logoLoaded: "Logo caricato.",
    activeLogo: "Attiva Logo (Pattern)",
    logoSize: "Dimensione Loghi",
    logoOpacity: "Opacità Logo",
    // Security
    ghostProto: "Ghost Protocol",
    ghostDesc: "Rimuove metadati, autore e data creazione per l'anonimato.",
    publicMeta: "Metadati Pubblici",
    docTitle: "Titolo Documento",
    docAuthor: "Autore",
    // Export
    exportBtn: "Esporta Documento",
    processing: "Elaborazione...",
    loadingCore: "Caricamento Core...",
    noFiles: "Nessun file da esportare!",
    downloadOk: "Download completato con successo!",
    // Modal Rename
    finalTrick: "Finalizza Trick",
    chooseName: "Scegli il nome del tuo file",
    fileName: "Nome File",
    didYouKnow: "Lo sapevi?",
    cancel: "Annulla",
    confirm: "Conferma & Scarica",
    // Modal Info
    aboutTitle: "La nostra Mission",
    aboutText: "Digitrik Pro è nato dalla mia curiosità per la programmazione, e per semplificare il lavoro di migliaia di persone che trattano con i PDF. Credo nella Privacy totale: i tuoi file non lasciano MAI il tuo browser.",
    contactTitle: "Contattaci",
    privacyTitle: "Privacy First",
    privacyText: "Nessun server, nessun cloud, nessun tracciamento. L'elaborazione avviene al 100% sul tuo dispositivo.",
    rights: "Tutti i diritti riservati.",
    // Modal Support
    supportTitle: "Sostieni Digitrik",
    supportSub: "Aiutaci a mantenere il servizio gratuito e senza server.",
    donateTitle: "Offrici un caffè",
    donateDesc: "Anche 1€ fa la differenza per lo sviluppo.",
    adTitle: "Guarda uno Spot",
    adDesc: "30 secondi del tuo tempo per supportarci gratis.",
    adButton: "Guarda Video (Presto disponibile)",
    // Encyclopedia
    enc: {
      AI: { desc: "Vettoriale Adobe.", curiosity: "Il formato AI di Adobe è essenzialmente un PDF modificabile mascherato. Sorprendentemente, se cambi l'estensione da .ai a .pdf, molti visualizzatori riusciranno ad aprirlo mostrando il contenuto vettoriale intatto.", type: "Vettoriale" },
      CSV: { desc: "Dati testuali.", curiosity: "Creato nel 1972, il CSV è il formato dati più antico ancora in uso. Nonostante la sua semplicità, è la spina dorsale dello scambio dati mondiale perché leggibile da qualsiasi macchina.", type: "Dati" },
      DOCX: { desc: "Word XML.", curiosity: "Il moderno formato DOCX è in realtà un archivio compresso. Se cambi l'estensione in .zip ed estrai il contenuto, troverai cartelle piene di file XML e immagini separate.", type: "Documento" },
      JPG: { desc: "Foto compressa.", curiosity: "Il formato JPEG usa una compressione 'lossy' che elimina dati invisibili all'occhio umano. Ogni volta che salvi di nuovo una JPG, la qualità diminuisce leggermente, creando artefatti digitali.", type: "Immagine" },
      PDF: { desc: "Portable Document.", curiosity: "Inventato nel 1993 per scambiare documenti su sistemi diversi. Oggi è uno standard ISO aperto così complesso che la sua documentazione tecnica supera le mille pagine di specifiche.", type: "Universale" },
      PNG: { desc: "Web Lossless.", curiosity: "Sviluppato per sostituire le GIF, il PNG offre una compressione senza perdita. È l'unico formato web diffuso che supporta la trasparenza alpha, permettendo contorni sfumati perfetti su qualsiasi sfondo.", type: "Immagine" },
      TXT: { desc: "Testo puro.", curiosity: "Il formato più puro esistente, privo di qualsiasi formattazione o stile. Essendo composto solo da caratteri ASCII o Unicode, un file TXT sarà leggibile tra 100 anni su qualsiasi computer.", type: "Testo" }
    }
  },
  en: {
    // Sidebar & Nav
    appName: "Pro Suite",
    workspace: "Workspace",
    files: "File Manager",
    layout: "Layout & Export",
    branding: "Brand & Security",
    watermark: "Watermark & Logo",
    security: "Ghost Mode",
    health: "System Health",
    weight: "Est. Weight",
    infoMenu: "Info & Contacts",
    supportBtn: "Support Project",
    // Header
    fileManager: "File Manager",
    layoutConfig: "Layout Config",
    brandingConfig: "Brand Customization",
    securityConfig: "Security",
    filesLoaded: "Files Loaded",
    // Dropzone
    dropTitle: "Drop your documents here",
    dropDesc: "We support PDF, HQ Images, and text files. The Digitrik engine handles the rest.",
    browse: "or Browse Files",
    add: "Add File",
    unsupported: "Unsupported files ignored.",
    added: "files added.",
    // Preview
    preview: "Live Output Preview",
    previewHidden: "(Hidden)",
    rendering: "Real-time Rendering",
    // Actions
    mainAction: "Main Action",
    actionDesc: "What to do with uploaded files?",
    actConvert: "Convert to PDF",
    actMerge: "Merge Files",
    actExtract: "Extract Pages",
    rangeLabel: "Page Range (e.g., 1-3, 5)",
    // Layout
    pageStruct: "Page Structure",
    header: "Header",
    headerPlace: "Header text...",
    footer: "Footer",
    footerPlace: "Footer text...",
    pagination: "Page Numbering",
    paginationSub: "Automatic Position",
    position: "Position",
    rotation: "Page Rotation",
    // Watermark
    textWatermark: "Text Watermark",
    watermarkPlace: "Watermark text (e.g. DRAFT)",
    optRibbon: "Ribbon (Diagonal)",
    optGrid: "Dense Grid",
    optSecurity: "Security Alert",
    opacity: "Opacity",
    size: "Size",
    corpLogo: "Corporate Logo",
    dragLogo: "Drag Logo Here",
    logoLoaded: "Logo loaded.",
    activeLogo: "Enable Logo (Pattern)",
    logoSize: "Logo Size",
    logoOpacity: "Logo Opacity",
    // Security
    ghostProto: "Ghost Protocol",
    ghostDesc: "Removes metadata, author, and dates for total anonymity.",
    publicMeta: "Public Metadata",
    docTitle: "Document Title",
    docAuthor: "Author",
    // Export
    exportBtn: "Export Document",
    processing: "Processing...",
    loadingCore: "Loading Core...",
    noFiles: "No files to export!",
    downloadOk: "Download completed successfully!",
    // Modal Rename
    finalTrick: "Finalize Trick",
    chooseName: "Choose your filename",
    fileName: "File Name",
    didYouKnow: "Did you know?",
    cancel: "Cancel",
    confirm: "Confirm & Download",
    // Modal Info
    aboutTitle: "Our Mission",
    aboutText: "Digitrik Pro was born from my curiosity for programming, and to simplify the work of thousands of people dealing with PDFs. I believe in total Privacy: your files NEVER leave your browser.",
    contactTitle: "Contact Us",
    privacyTitle: "Privacy First",
    privacyText: "No servers, no cloud, no tracking. Processing happens 100% on your device.",
    rights: "All rights reserved.",
    // Modal Support
    supportTitle: "Support Digitrik",
    supportSub: "Help us keep the service free and serverless.",
    donateTitle: "Buy us a coffee",
    donateDesc: "Even 1€ makes a difference for development.",
    adTitle: "Watch an Ad",
    adDesc: "30 seconds of your time to support us for free.",
    adButton: "Watch Video (Coming Soon)",
    // Encyclopedia
    enc: {
      AI: { desc: "Adobe Vector.", curiosity: "Adobe's AI format is essentially a disguised editable PDF. Surprisingly, if you simply rename the extension from .ai to .pdf, many standard viewers can open it and display the vector content.", type: "Vector" },
      CSV: { desc: "Text Data.", curiosity: "Created way back in 1972, CSV remains the oldest data format still in wide use today. Despite its simplicity, it is the backbone of global data exchange because machines read it easily.", type: "Data" },
      DOCX: { desc: "Word XML.", curiosity: "The modern DOCX format is actually a compressed archive in disguise. If you rename the extension to .zip and extract it, you will find folders full of XML code and images.", type: "Document" },
      JPG: { desc: "Compressed Photo.", curiosity: "JPEG uses 'lossy' compression that discards data invisible to the human eye. However, every time you re-save a JPG file, quality degrades slightly, creating digital artifacts known as 'generation loss'.", type: "Image" },
      PDF: { desc: "Portable Document.", curiosity: "Invented by Adobe in 1993 to exchange documents across different systems. It is now an open ISO standard so complex that its full technical documentation exceeds one thousand pages of specifications.", type: "Universal" },
      PNG: { desc: "Web Lossless.", curiosity: "Developed to replace GIFs, PNG offers lossless compression. It is the only widely used web format supporting alpha transparency, allowing for smooth, anti-aliased edges on any background color without jagged lines.", type: "Image" },
      TXT: { desc: "Pure Text.", curiosity: "The purest format in existence, stripped of all formatting or style. Composed solely of ASCII or Unicode characters, a TXT file will remain readable one hundred years from now on any computer.", type: "Text" }
    }
  }
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
  // CORE STATE (Default to ENGLISH as requested)
  const [lang, setLang] = useState('en');
  const t = TRANSLATIONS[lang]; 

  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('files'); 
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState(null);
    
  // SDK STATE (Load from CDN)
  const [isSdkReady, setIsSdkReady] = useState(false);

  // UI STATE
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false); 
  const [showSupportModal, setShowSupportModal] = useState(false); // NEW STATE FOR SUPPORT MODAL
  const [tempFilename, setTempFilename] = useState("Digitrik_Result");
  const [trickCuriosity, setTrickCuriosity] = useState({ key: 'PDF', text: '' });
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  // CONFIGURATION STATE
  const [config, setConfig] = useState({
    // Layout
    useHeader: false, headerText: '', headerAlign: 'center',
    useFooter: false, footerText: '', footerAlign: 'center',
    usePagination: false, paginationAlign: 'right', 
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
    if (valid.length < accepted.length) showToast(t.unsupported, "error");
    setFiles(prev => [...prev, ...valid.map(f => ({ id: Math.random().toString(36), file: f }))]);
    if (valid.length > 0) showToast(`${valid.length} ${t.added}`);
  }, [lang]); 

  // CHANGED: Added 'open' from dropzone
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({ onDrop, noClick: true });

  const onLogoDrop = useCallback(accepted => {
    if (accepted[0]) {
      setConfig(prev => ({ ...prev, logoFile: accepted[0], useLogo: true }));
      showToast(t.logoLoaded);
    }
  }, [lang]);
  const { getRootProps: getLogoProps, getInputProps: getLogoInput } = useDropzone({ onDrop: onLogoDrop, accept: {'image/*': []}, multiple: false });

  // --- LOGIC: PDF ENGINE ---
  const generatePdf = async (isPreview = false) => {
    if (files.length === 0 || !window.PDFLib) return null;
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

      // Embed Logo logic
      let logoImg = null;
      if (config.useLogo && config.logoFile) {
        const logoBuf = await config.logoFile.arrayBuffer();
        logoImg = config.logoFile.type.includes('png') ? await doc.embedPng(logoBuf) : await doc.embedJpg(logoBuf);
      }

      // --- APPLICAZIONE OVERLAY E ROTAZIONE (SMART SYSTEM) ---
      const pages = doc.getPages();
      pages.forEach((p, idx) => {
        const { width, height } = p.getSize();
        const rotation = config.rotation;
        p.setRotation(degrees(rotation));

        // Helper per disegno "Smart"
        const drawSmartText = (text, type, alignment) => {
          if (!text) return;
          const size = 9;
          const fontToUse = type === 'header' ? fontBold : fontNormal;
          const textWidth = fontToUse.widthOfTextAtSize(text, size);
          const margin = 30;

          let x, y, textRotate;

          switch (rotation) {
            case 0: 
              textRotate = 0;
              y = type === 'header' ? height - margin : margin;
              if (alignment === 'left') x = 40;
              else if (alignment === 'right') x = width - 40 - textWidth;
              else x = (width / 2) - (textWidth / 2);
              break;
            case 90:
              textRotate = 90;
              x = type === 'header' ? margin : width - margin;
              if (alignment === 'left') y = 40; 
              else if (alignment === 'right') y = height - 40 - textWidth;
              else y = (height / 2) - (textWidth / 2);
              break;
            case 180:
              textRotate = 180;
              y = type === 'header' ? margin : height - margin;
              if (alignment === 'left') x = width - 40; 
              else if (alignment === 'right') x = 40 + textWidth;
              else x = (width / 2) + (textWidth / 2);
              break;
            case 270:
              textRotate = 270;
              x = type === 'header' ? width - margin : margin;
              if (alignment === 'left') y = height - 40;
              else if (alignment === 'right') y = 40 + textWidth;
              else y = (height / 2) + (textWidth / 2);
              break;
            default: break;
          }
          p.drawText(text, { x, y, size, font: fontToUse, color: rgb(0.2, 0.2, 0.2), rotate: degrees(textRotate) });
        };

        if (config.useHeader) drawSmartText(config.headerText.toUpperCase(), 'header', config.headerAlign);
        if (config.useFooter) drawSmartText(config.footerText, 'footer', config.footerAlign);
        if (config.usePagination) drawSmartText(`${idx + 1} / ${pages.length}`, 'footer', config.paginationAlign);

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

        // --- NUOVA LOGICA LOGO PATTERN (TILED) ---
        if (logoImg && config.useLogo) {
          const dims = logoImg.scaleToFit(config.logoSize, config.logoSize);
          const gap = 40; // Spazio tra i loghi
          const stepX = dims.width + gap;
          const stepY = dims.height + gap;

          // Disegna una griglia di loghi
          for (let x = 20; x < width; x += stepX) {
            for (let y = 20; y < height; y += stepY) {
              p.drawImage(logoImg, { 
                x: x, 
                y: y, 
                width: dims.width, 
                height: dims.height, 
                opacity: config.logoOpacity 
              });
            }
          }
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
  }, [files, config, isSdkReady, lang]);

  const handleExportClick = () => {
    if (files.length === 0) {
      showToast(t.noFiles, "error");
      return;
    }
    const keys = Object.keys(t.enc);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setTrickCuriosity({ key: randomKey, text: t.enc[randomKey].curiosity });
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
      showToast(t.downloadOk);
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

      {/* RENAME MODAL */}
      {showRenameModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-[#0a0a0a] border border-blue-600/30 rounded-[2rem] w-[90%] max-w-lg p-8 shadow-[0_0_50px_rgba(37,99,235,0.1)] relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-blue-600/10 p-3 rounded-full text-blue-500"><Wand2 size={24} /></div>
              <div><h3 className="text-xl font-black italic text-white uppercase tracking-wider">{t.finalTrick}</h3><p className="text-[11px] text-gray-500 font-bold uppercase">{t.chooseName}</p></div>
              <button onClick={() => setShowRenameModal(false)} className="absolute top-6 right-6 text-gray-600 hover:text-white transition-colors"><X size={20} /></button>
            </div>
            <div className="space-y-2 mb-8">
              <label className="text-xs font-bold text-gray-400 uppercase ml-2">{t.fileName}</label>
              <div className="relative">
                <input type="text" value={tempFilename} onChange={(e) => setTempFilename(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleConfirmDownload()} autoFocus className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white font-medium outline-none focus:border-blue-600 transition-all shadow-inner" />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 text-xs font-bold pointer-events-none">.PDF</span>
              </div>
            </div>
            <div className="bg-blue-900/10 border border-blue-600/10 rounded-2xl p-5 mb-8 flex gap-4">
              <Sparkles className="text-blue-500 shrink-0 mt-0.5" size={18} />
              <div className="space-y-1">
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">{t.didYouKnow} ({trickCuriosity.key})</span>
                <p className="text-xs text-gray-300 italic leading-relaxed">{trickCuriosity.text}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowRenameModal(false)} className="flex-1 py-4 rounded-xl border border-white/5 hover:bg-white/5 text-gray-400 font-bold text-xs uppercase tracking-widest transition-all">{t.cancel}</button>
              <button onClick={handleConfirmDownload} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"><Check size={16} /> {t.confirm}</button>
            </div>
          </div>
        </div>
      )}

      {/* INFO MODAL */}
      {showInfoModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-zinc-800 rounded-[2rem] w-[90%] max-w-lg overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-zinc-950/50">
                <div className="flex items-center gap-3">
                    <div className="bg-zinc-800 p-3 rounded-full text-white"><Info size={24} /></div>
                    <div>
                        <h3 className="text-xl font-black italic text-white uppercase tracking-wider">Info & Support</h3>
                        <p className="text-[11px] text-gray-500 font-bold uppercase">DigitrikPro Team</p>
                    </div>
                    <button onClick={() => setShowInfoModal(false)} className="absolute top-8 right-8 text-gray-600 hover:text-white transition-colors"><X size={20} /></button>
                </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
                
                {/* About Section */}
                <div>
                    <div className="flex items-center gap-2 mb-2 text-blue-500 font-bold uppercase text-xs tracking-wider">
                        <Heart size={14} /> {t.aboutTitle}
                    </div>
                    <p className="text-sm text-zinc-400 leading-relaxed italic border-l-2 border-blue-500/20 pl-4">
                        "{t.aboutText}"
                    </p>
                </div>

                {/* Contact Section */}
                <div className="bg-zinc-900/50 rounded-xl p-4 border border-zinc-800 hover:border-blue-500/30 transition-colors">
                     <div className="flex items-center gap-2 mb-2 text-zinc-300 font-bold uppercase text-xs tracking-wider">
                        <Mail size={14} /> {t.contactTitle}
                    </div>
                    <a href="mailto:trichesir@gmail.com" className="text-blue-400 hover:text-blue-300 font-mono text-sm block">trichesir@gmail.com</a>
                </div>

                {/* Privacy Badge */}
                <div className="bg-green-900/10 rounded-xl p-4 border border-green-500/20 flex items-start gap-4">
                    <ShieldCheck size={24} className="text-green-500 shrink-0 mt-1" />
                    <div>
                        <h4 className="text-green-500 font-bold uppercase text-xs tracking-wider mb-1">{t.privacyTitle}</h4>
                        <p className="text-[11px] text-green-200/70 leading-relaxed">{t.privacyText}</p>
                    </div>
                </div>

            </div>
            
            {/* Footer */}
            <div className="p-4 bg-zinc-950 text-center border-t border-white/5">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest">© 2024 DigitrikPro Team. {t.rights}</p>
            </div>
          </div>
        </div>
      )}

      {/* SUPPORT MODAL (NEW!) */}
      {showSupportModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity duration-300 animate-in fade-in">
          <div className="bg-[#0a0a0a] border border-green-500/30 rounded-[2rem] w-[90%] max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(34,197,94,0.1)] relative">
            
            {/* Header */}
            <div className="p-8 border-b border-white/5 bg-zinc-950/50">
                <div className="flex items-center gap-3">
                    <div className="bg-green-500/10 p-3 rounded-full text-green-500"><Coffee size={24} /></div>
                    <div>
                        <h3 className="text-xl font-black italic text-white uppercase tracking-wider">{t.supportTitle}</h3>
                        <p className="text-[11px] text-gray-500 font-bold uppercase">{t.supportSub}</p>
                    </div>
                    <button onClick={() => setShowSupportModal(false)} className="absolute top-8 right-8 text-gray-600 hover:text-white transition-colors"><X size={20} /></button>
                </div>
            </div>

            {/* Content 2 Cols */}
            <div className="grid grid-cols-1 md:grid-cols-2">
                
                {/* Left: Donate */}
                <div className="p-8 border-b md:border-b-0 md:border-r border-white/5 space-y-4">
                    <div className="mb-4">
                        <h4 className="flex items-center gap-2 text-green-400 font-bold uppercase text-xs tracking-wider mb-1"><CreditCard size={14} /> {t.donateTitle}</h4>
                        <p className="text-[11px] text-gray-400">{t.donateDesc}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        {['1€', '2€', '5€'].map(amount => (
                            <button key={amount} className="py-3 rounded-xl border border-zinc-800 bg-zinc-900/50 text-white font-black hover:border-green-500 hover:text-green-400 transition-all shadow-sm">
                                {amount}
                            </button>
                        ))}
                    </div>
                    <button className="w-full py-3 rounded-xl bg-green-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-green-500 transition-all mt-2">PayPal</button>
                </div>

                {/* Right: Ads */}
                <div className="p-8 space-y-4 bg-zinc-950/30">
                    <div className="mb-4">
                        <h4 className="flex items-center gap-2 text-blue-400 font-bold uppercase text-xs tracking-wider mb-1"><PlayCircle size={14} /> {t.adTitle}</h4>
                        <p className="text-[11px] text-gray-400">{t.adDesc}</p>
                    </div>
                    <div className="h-24 bg-black/50 border border-zinc-800 border-dashed rounded-xl flex items-center justify-center text-zinc-600 text-xs font-medium">
                        Ad Placeholder
                    </div>
                    <button disabled className="w-full py-3 rounded-xl border border-zinc-800 text-zinc-500 font-bold text-xs uppercase tracking-widest cursor-not-allowed opacity-50">{t.adButton}</button>
                </div>

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
          <div><h1 className="text-lg font-black italic tracking-tighter leading-none">DIGITRIK</h1><span className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em]">{t.appName}</span></div>
        </div>
        
        {/* LANG SWITCHER */}
        <div className="flex bg-zinc-900 rounded-lg p-1 mb-6 border border-zinc-800">
          <button onClick={() => setLang('it')} className={`flex-1 py-1 text-[10px] font-bold uppercase rounded ${lang === 'it' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>IT</button>
          <button onClick={() => setLang('en')} className={`flex-1 py-1 text-[10px] font-bold uppercase rounded ${lang === 'en' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'}`}>EN</button>
        </div>

        <nav className="flex-1">
          <SectionTitle icon={LayoutTemplate} title={t.workspace} />
          <NavItem id="files" icon={FileText} label={t.files} />
          <NavItem id="layout" icon={Settings} label={t.layout} />
          <div className="h-6" />
          <SectionTitle icon={Shield} title={t.branding} />
          <NavItem id="watermark" icon={ImageIcon} label={t.watermark} />
          <NavItem id="security" icon={Lock} label={t.security} />
        </nav>

        {/* INFO BUTTON */}
        <button 
          onClick={() => setShowInfoModal(true)}
          className="flex items-center gap-3 p-3 rounded-xl text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-all mb-1 text-xs font-bold uppercase tracking-wide border border-transparent hover:border-zinc-800"
        >
          <Info size={16} /> {t.infoMenu}
        </button>

        {/* SUPPORT BUTTON (NEW!) */}
        <button 
          onClick={() => setShowSupportModal(true)}
          className="flex items-center gap-3 p-3 rounded-xl text-green-600/80 hover:text-green-400 hover:bg-green-900/10 transition-all mb-4 text-xs font-bold uppercase tracking-wide border border-transparent hover:border-green-500/20"
        >
          <Heart size={16} /> {t.supportBtn}
        </button>

        <div className={`mt-auto p-4 rounded-2xl border ${health.status === 'crit' ? 'bg-red-950/20 border-red-500/20' : 'bg-zinc-900 border-white/5'}`}>
          <div className="flex justify-between items-end mb-2"><span className="text-[10px] font-bold text-zinc-500 uppercase">{t.health}</span><span className={`text-xs font-black ${health.status === 'ok' ? 'text-green-500' : 'text-yellow-500'}`}>{health.score}%</span></div>
          <div className="w-full h-1 bg-zinc-800 rounded-full mb-3 overflow-hidden"><div className={`h-full transition-all duration-500 ${health.status === 'ok' ? 'bg-green-500' : 'bg-yellow-500'}`} style={{width: `${health.score}%`}} /></div>
          <div className="flex items-center gap-2 text-[10px] text-zinc-400"><Activity size={12} /> {t.weight}: <span className="text-zinc-200">{health.size} MB</span></div>
        </div>
      </aside>

      {/* CENTER */}
      <main className="flex-1 flex flex-col relative bg-zinc-900/50">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-10">
          <div className="flex items-center gap-4"><h2 className="text-sm font-bold text-zinc-300 uppercase tracking-wider">{activeTab === 'files' ? t.fileManager : activeTab === 'layout' ? t.layoutConfig : activeTab === 'watermark' ? t.brandingConfig : t.securityConfig}</h2></div>
          <div className="flex items-center gap-3"><div className="text-[10px] font-bold text-zinc-500 uppercase px-3 py-1 bg-zinc-900 rounded-full border border-white/5">{files.length} {t.filesLoaded}</div></div>
        </header>
        <div className="flex-1 overflow-y-auto p-8">
          <div {...getRootProps()} onClick={files.length === 0 ? open : undefined} className={`relative border-2 border-dashed rounded-[2rem] transition-all duration-300 group ${isDragActive ? 'border-blue-500 bg-blue-500/5 scale-[0.99]' : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'}`}>
            <input {...getInputProps()} />
            {files.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-10 cursor-pointer">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xl"><UploadCloud size={32} className="text-zinc-600 group-hover:text-blue-500 transition-colors" /></div>
                <h3 className="text-lg font-bold text-zinc-300">{t.dropTitle}</h3>
                <p className="text-sm text-zinc-500 mt-2 max-w-xs">{t.dropDesc}</p>
                <div className="mt-6 flex items-center gap-2 text-xs font-bold text-blue-500 uppercase tracking-widest bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20 hover:bg-blue-500/20 transition-all"><FolderOpen size={14} /> {t.browse}</div>
              </div>
            ) : (
              <div className="p-8">
                <DragDropContext onDragEnd={(res) => { if(!res.destination) return; const items = Array.from(files); const [reordered] = items.splice(res.source.index, 1); items.splice(res.destination.index, 0, reordered); setFiles(items); }}>
                  <Droppable droppableId="list" direction="vertical">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="flex flex-col gap-3">
                        {files.map((f, i) => (
                          <Draggable key={f.id} draggableId={f.id} index={i}>
                            {(provided, snapshot) => (
                              <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps} className={`bg-zinc-950 border border-white/5 p-4 rounded-xl flex items-center gap-4 group hover:border-blue-500/30 transition-all ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500 rotate-2' : ''}`}>
                                <span className="text-zinc-500 font-mono text-xs font-bold w-6 text-center shrink-0">{i + 1}.</span>
                                <div className="w-10 h-10 bg-zinc-900 rounded-lg flex items-center justify-center shrink-0"><FileText size={20} className="text-blue-500" /></div>
                                <div className="min-w-0 flex-1 pr-2"><p className="text-xs font-bold text-zinc-200 truncate">{f.file.name}</p><p className="text-[10px] text-zinc-500 font-mono">{(f.file.size/1024).toFixed(1)} KB</p></div>
                                <button 
                                  onClick={(e) => { e.stopPropagation(); setFiles(files.filter(x => x.id !== f.id)); }} 
                                  className="p-2 hover:bg-red-500/10 hover:text-red-500 text-zinc-600 rounded-lg transition-colors shrink-0 z-10"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                        <div onClick={open} className="border border-dashed border-zinc-800 rounded-xl flex flex-row gap-3 items-center justify-center p-4 hover:bg-zinc-900/50 transition-colors cursor-pointer text-zinc-600 hover:text-zinc-400 mt-2"><Plus size={20} /><span className="text-[10px] font-bold uppercase">{t.add}</span></div>
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
                <div className="flex items-center gap-2"><div className="text-zinc-400 uppercase tracking-widest text-[10px] font-bold flex items-center gap-2 group-hover:text-blue-500 transition-colors">{isPreviewOpen ? <Eye size={14} /> : <EyeOff size={14} />} {t.preview} {isPreviewOpen ? '' : t.previewHidden}</div></div>
                <span className="text-[10px] text-zinc-500 bg-zinc-900 px-2 py-1 rounded">{t.rendering}</span>
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
                <h3 className="text-sm font-bold text-white mb-1">{t.mainAction}</h3>
                <p className="text-xs text-zinc-500 mb-4">{t.actionDesc}</p>
                <div className="space-y-2">
                  {[
                    { id: 'conversione', label: t.actConvert, icon: RefreshCcw },
                    { id: 'unisci', label: t.actMerge, icon: Layers },
                    { id: 'estrai', label: t.actExtract, icon: FileOutput }
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
                  <label className="text-[10px] font-bold text-zinc-400 uppercase mb-2 block">{t.rangeLabel}</label>
                  <input type="text" placeholder="E.g. 1, 3-5" value={config.extractRange} onChange={e => setConfig({...config, extractRange: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2 text-xs text-white focus:border-blue-500 outline-none" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'layout' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
              <SectionTitle icon={LayoutTemplate} title={t.pageStruct} />
              <div className="space-y-4">
                
                {/* HEADER SECTION */}
                <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-3">
                  <Toggle label={t.header} checked={config.useHeader} onChange={v => setConfig({...config, useHeader: v})} icon={AlignLeft} />
                  {config.useHeader && (
                    <div className="animate-in slide-in-from-top-2 fade-in">
                      <input 
                        type="text" 
                        placeholder={t.headerPlace} 
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
                  <Toggle label={t.footer} checked={config.useFooter} onChange={v => setConfig({...config, useFooter: v})} icon={AlignRight} />
                  {config.useFooter && (
                    <div className="animate-in slide-in-from-top-2 fade-in">
                      <input 
                        type="text" 
                        placeholder={t.footerPlace} 
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
                  <Toggle label={t.pagination} checked={config.usePagination} onChange={v => setConfig({...config, usePagination: v})} icon={List} />
                  {config.usePagination && (
                    <div className="animate-in slide-in-from-top-2 fade-in">
                      <div className="flex justify-between items-center mb-1 px-1">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase">{t.position}</span>
                      </div>
                      <AlignSelector 
                        value={config.paginationAlign} 
                        onChange={(v) => setConfig({...config, paginationAlign: v})} 
                      />
                    </div>
                  )}
                </div>
              </div>
              
              <SectionTitle icon={RotateCw} title={t.rotation} />
              <div className="grid grid-cols-4 gap-2">
                {[0, 90, 180, 270].map(deg => (
                  <button key={deg} onClick={() => setConfig({...config, rotation: deg})} className={`py-2 rounded-lg text-xs font-bold border transition-all ${config.rotation === deg ? 'bg-blue-600 border-blue-600 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>{deg}°</button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'watermark' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
              <SectionTitle icon={Tag} title={t.textWatermark} />
              <div className="p-4 bg-zinc-900 rounded-xl border border-zinc-800 space-y-4">
                <input type="text" placeholder={t.watermarkPlace} value={config.watermarkText} onChange={e => setConfig({...config, watermarkText: e.target.value})} className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-xs font-bold text-white outline-none focus:border-blue-500" />
                <div className="space-y-2">
                  <Toggle label={t.optRibbon} checked={config.useWatermark} onChange={v => setConfig({...config, useWatermark: v})} icon={Sparkles} />
                  <Toggle label={t.optGrid} checked={config.useGrid} onChange={v => setConfig({...config, useGrid: v})} icon={Grid3X3} />
                  <Toggle label={t.optSecurity} checked={config.useSecurity} onChange={v => setConfig({...config, useSecurity: v})} icon={ShieldAlert} />
                </div>
                <SmartSlider label={t.opacity} value={Math.round(config.textOpacity*100)} min={5} max={100} onChange={v => setConfig({...config, textOpacity: v/100})} unit="%" />
                <SmartSlider label={t.size} value={config.textSize} min={10} max={100} onChange={v => setConfig({...config, textSize: parseInt(v)})} unit="px" />
              </div>
              <SectionTitle icon={IconImage} title={t.corpLogo} />
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
                      <span className="text-[10px] font-bold text-zinc-500 uppercase">{t.dragLogo}</span>
                    </>
                  )}
                </div>
              </div>
              {config.logoFile && (
                <div className="space-y-4 pt-2">
                    <Toggle label={t.activeLogo} checked={config.useLogo} onChange={v => setConfig({...config, useLogo: v})} />
                    <SmartSlider label={t.logoSize} value={config.logoSize} min={50} max={300} onChange={v => setConfig({...config, logoSize: parseInt(v)})} unit="px" />
                    <SmartSlider label={t.logoOpacity} value={Math.round(config.logoOpacity*100)} min={5} max={100} onChange={v => setConfig({...config, logoOpacity: v/100})} unit="%" />
                </div>
              )}
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-2">
              <div className={`p-4 rounded-xl border transition-all ${config.ghostMode ? 'bg-red-950/20 border-red-500/50' : 'bg-zinc-900 border-zinc-800'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-red-500 font-bold uppercase text-xs"><Ghost size={14} /> {t.ghostProto}</div>
                  <input type="checkbox" checked={config.ghostMode} onChange={e => setConfig({...config, ghostMode: e.target.checked})} className="accent-red-500 w-4 h-4" />
                </div>
                <p className="text-[10px] text-zinc-500 leading-relaxed">{t.ghostDesc}</p>
              </div>
              {!config.ghostMode && (
                <div className="space-y-3 pt-4 border-t border-white/5">
                  <SectionTitle icon={Tag} title={t.publicMeta} />
                  <input type="text" placeholder={t.docTitle} value={config.metaTitle} onChange={e => setConfig({...config, metaTitle: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none" />
                  <input type="text" placeholder={t.docAuthor} value={config.metaAuthor} onChange={e => setConfig({...config, metaAuthor: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white outline-none" />
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
              <span className="flex items-center gap-2 text-zinc-500"><RefreshCcw className="animate-spin" size={16} /> {t.loadingCore}</span>
            ) : isProcessing ? (
              <span className="flex items-center gap-2"><RefreshCcw className="animate-spin" size={16} /> {t.processing}</span>
            ) : (
              <span className="flex items-center gap-2"><Wand2 size={16} /> {t.exportBtn}</span>
            )}
          </button>
        </div>
      </aside>

      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
