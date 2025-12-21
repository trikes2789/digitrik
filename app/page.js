'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  FileText, Plus, Trash2, RefreshCcw, ChevronDown, Wand2, GripVertical, 
  ImageIcon, Eye, EyeOff, AlignLeft, AlignCenter, AlignRight, ChevronUp, Sparkles, X, Check, RotateCw, Tag, 
  Activity, ShieldAlert, Feather, Layers, Printer, Ghost, Lock
} from 'lucide-react';

// --- DATABASE: FILE ENCYCLOPEDIA ---
const fileEncyclopedia = {
  "AI (Adobe Illustrator)": { desc: "File vettoriale Adobe. Basato su percorsi matematici.", curiosity: "Spesso rinominabile in .pdf per vederne il contenuto.", type: "Vettoriale" },
  "CSV (Comma Separated Values)": { desc: "File di dati puro testo separati da virgole.", curiosity: "Formato supportato da Digitrik: verrà stampato come tabulato.", type: "Dati Testuali" },
  "DOCX (Microsoft Word)": { desc: "Documento Office moderno XML.", curiosity: "È in realtà un file .zip rinominato.", type: "Documento" },
  "JPG (Joint Photographic)": { desc: "Standard fotografico compresso.", curiosity: "Soggetto a 'digital rot' se salvato troppe volte.", type: "Immagine" },
  "PDF (Portable Document Format)": { desc: "Standard mondiale per documenti.", curiosity: "Nato nel 1993, diventato standard grazie ad Acrobat Reader gratuito.", type: "Universale" },
  "PNG (Portable Network Graphics)": { desc: "Supporta trasparenza senza perdita.", curiosity: "Creato per sostituire il GIF negli anni '90.", type: "Immagine Trasparente" },
  "TXT (Plain Text)": { desc: "Testo puro senza formattazione.", curiosity: "Formato supportato da Digitrik: verrà renderizzato con font monospaziato.", type: "Testo Puro" },
  "XLSX (Microsoft Excel)": { desc: "Foglio di calcolo moderno.", curiosity: "Supporta oltre 1 milione di righe.", type: "Foglio di Calcolo" }
};

// --- UTILS: COMPRESSION ENGINE ---
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

// --- COMPONENTI UI ---
const SmartSlider = ({ label, value, min, max, step = 1, unit = "", onChange }) => {
  const [localValue, setLocalValue] = useState(value);
  useEffect(() => setLocalValue(value), [value]);
  const handleChange = (e) => setLocalValue(e.target.value);
  const handleCommit = () => onChange(localValue);
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between text-[11px] font-black uppercase">
        <span className="text-gray-500">{label}</span>
        <span className="text-blue-500">{localValue}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={localValue} onChange={handleChange} onMouseUp={handleCommit} onTouchEnd={handleCommit} className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-blue-600" />
    </div>
  );
};

const AlignmentPicker = ({ current, set }) => (
  <div className="flex gap-1 bg-black p-1 rounded-lg">
    {[ {id:'left', icon:<AlignLeft size={14}/>}, {id:'center', icon:<AlignCenter size={14}/>}, {id:'right', icon:<AlignRight size={14}/>} ].map(b => (
      <button key={b.id} onClick={() => set(b.id)} className={`p-1.5 rounded transition-all ${current === b.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}>
        {b.icon}
      </button>
    ))}
  </div>
);

// --- MAIN COMPONENT ---
export default function DigitrikWorkstation() {
  const [files, setFiles] = useState([]);
  const [action, setAction] = useState('conversione'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  
  // UI Toggles
  const [isPreviewOpen, setIsPreviewOpen] = useState(true); // Toggle Anteprima
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [tempFilename, setTempFilename] = useState("Digitrik_Result");
  const [trickCuriosity, setTrickCuriosity] = useState({ key: '', text: '' });

  // Menu Toggles (Sidebar Destra)
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [isGhostMenuOpen, setIsGhostMenuOpen] = useState(false); // Nuovo menu Ghost
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  // Layout State
  const [useHeader, setUseHeader] = useState(false);
  const [headerText, setHeaderText] = useState('');
  const [headerAlign, setHeaderAlign] = useState('left');
  const [useFooter, setUseFooter] = useState(false);
  const [footerText, setFooterText] = useState('');
  const [footerAlign, setFooterAlign] = useState('left');
  const [usePagination, setUsePagination] = useState(false);
  const [paginationAlign, setPaginationAlign] = useState('right');
  
  // Advanced Features State
  const [rotation, setRotation] = useState(0); 
  const [metaTitle, setMetaTitle] = useState('');
  const [metaAuthor, setMetaAuthor] = useState('');
  const [ghostMode, setGhostMode] = useState(false); 
  const [compressionProfile, setCompressionProfile] = useState('balanced');

  // Matrix/Watermark State
  const [useWatermark, setUseWatermark] = useState(false);
  const [useGridWatermark, setUseGridWatermark] = useState(false);
  const [useSecurityWatermark, setUseSecurityWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [textOpacity, setTextOpacity] = useState(0.25);
  const [textSize, setTextSize] = useState(30);
  
  // Logo State
  const [useLogoWatermark, setUseLogoWatermark] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoOpacity, setLogoOpacity] = useState(0.15);
  const [logoSize, setLogoSize] = useState(150);

  // Health Stats
  const [healthStats, setHealthStats] = useState({ weight: '0 MB', status: 'optimal', alerts: [] });

  // --- HEALTH & WEIGHT ANALYZER ---
  useEffect(() => {
    let size = 0;
    let alerts = [];
    
    files.forEach(f => size += f.file.size);
    if (logoFile) size += logoFile.size;
    
    const sizeMB = (size / (1024 * 1024)).toFixed(2);
    let status = 'optimal';
    
    if (sizeMB > 50) { status = 'critical'; alerts.push("File molto pesanti: possibile lentezza."); }
    else if (sizeMB > 15) { status = 'warning'; alerts.push("Peso medio-alto."); }

    if ((useWatermark || useGridWatermark) && textOpacity > 0.5) {
      alerts.push("Spreco inchiostro: Opacità watermark alta.");
    }
    
    const hasTxt = files.some(f => f.file.type === 'text/plain' || f.file.type === 'text/csv');
    if (hasTxt) alerts.push("File TXT/CSV rilevati: Verranno stampati con font Courier.");

    setHealthStats({ weight: `${sizeMB} MB`, status, alerts });
  }, [files, logoFile, textOpacity, useWatermark, useGridWatermark]);

  const getXPos = (align, textWidth, pageWidth) => {
    if (align === 'center') return (pageWidth / 2) - (textWidth / 2);
    if (align === 'right') return pageWidth - textWidth - 40;
    return 40;
  };

  const renderTextToPdf = async (pdfDoc, textContent, font) => {
    const fontSize = 10;
    const lineHeight = 12;
    const margin = 50;
    const pageHeight = 842; 
    const pageWidth = 595;
    let page = pdfDoc.addPage([pageWidth, pageHeight]);
    let y = pageHeight - margin;
    const lines = textContent.split(/\r\n|\r|\n/);
    for (const line of lines) {
      if (y < margin) {
        page = pdfDoc.addPage([pageWidth, pageHeight]);
        y = pageHeight - margin;
      }
      const safeLine = line.replace(/[^\x00-\x7F]/g, "?"); 
      page.drawText(safeLine, { x: margin, y, size: fontSize, font: font, color: rgb(0,0,0) });
      y -= lineHeight;
    }
  };

  // --- PREVIEW GENERATOR ---
  const generatePreview = useCallback(async () => {
    // Generiamo la preview anche se il pannello è chiuso, così è pronta quando l'utente apre
    if (files.length === 0) { setPreviewUrl(null); return; }
    try {
      const firstFile = files[0].file;
      const arrayBuffer = await firstFile.arrayBuffer();
      const previewPdf = await PDFDocument.create();
      const fontBold = await previewPdf.embedFont(StandardFonts.HelveticaBold);
      const fontNormal = await previewPdf.embedFont(StandardFonts.Helvetica);
      const fontMono = await previewPdf.embedFont(StandardFonts.Courier);
      
      let page;
      if (firstFile.type === 'application/pdf') {
        const sourcePdf = await PDFDocument.load(arrayBuffer);
        const [firstPage] = await previewPdf.copyPages(sourcePdf, [0]);
        page = previewPdf.addPage(firstPage);
      } else if (firstFile.type.startsWith('image/')) {
        page = previewPdf.addPage();
        const img = firstFile.type === 'image/png' ? await previewPdf.embedPng(arrayBuffer) : await previewPdf.embedJpg(arrayBuffer);
        const dims = img.scaleToFit(page.getWidth() - 40, page.getHeight() - 40);
        page.drawImage(img, { x: page.getWidth()/2 - dims.width/2, y: page.getHeight()/2 - dims.height/2, width: dims.width, height: dims.height });
      } else if (firstFile.type === 'text/plain' || firstFile.type === 'text/csv' || firstFile.name.endsWith('.csv')) {
        const textContent = await firstFile.text();
        const snippet = textContent.substring(0, 2000) + "... (Preview limitata)";
        await renderTextToPdf(previewPdf, snippet, fontMono);
        page = previewPdf.getPages()[0]; 
      } else { return; }

      if (page && rotation !== 0) page.setRotation(degrees(rotation));
      const { width, height } = page.getSize();
      
      if (useHeader && headerText.trim() !== '') {
        const text = headerText.toUpperCase();
        const tWidth = fontBold.widthOfTextAtSize(text, 9);
        page.drawText(text, { x: getXPos(headerAlign, tWidth, width), y: height - 40, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
      }
      if (useFooter && footerText.trim() !== '') {
        const tWidth = fontNormal.widthOfTextAtSize(footerText, 9);
        page.drawText(footerText, { x: getXPos(footerAlign, tWidth, width), y: 30, size: 9, font: fontNormal, color: rgb(0.3, 0.3, 0.3) });
      }
      if (usePagination) {
        const text = `Pag. 1 / ${files.length}`;
        const tWidth = fontNormal.widthOfTextAtSize(text, 9);
        page.drawText(text, { x: getXPos(paginationAlign, tWidth, width), y: 30, size: 9, font: fontNormal, color: rgb(0.4, 0.4, 0.4) });
      }
      
      if (watermarkText.trim() !== '') {
        if (useWatermark) {
          const textW = fontBold.widthOfTextAtSize(watermarkText, textSize);
          for (let x = -width; x < width * 2; x += (textW / 2) + 7) {
            for (let y = -height; y < height * 2; y += 150) page.drawText(watermarkText, { x, y, size: textSize, font: fontBold, color: rgb(0.3, 0.3, 0.3), opacity: textOpacity, rotate: degrees(45) });
          }
        }
        if (useGridWatermark) {
          for (let x = 30; x < width; x += 120) {
            for (let y = 30; y < height; y += 80) page.drawText(watermarkText.substring(0, 10), { x, y, size: textSize * 0.6, font: fontBold, color: rgb(0.4, 0.4, 0.4), opacity: textOpacity });
          }
        }
        if (useSecurityWatermark) {
          const secText = watermarkText.substring(0, 30).padEnd(15, ' ');
          const textW = fontBold.widthOfTextAtSize(secText, textSize * 1.6);
          const angleRad = 60 * Math.PI / 180;
          page.drawText(secText, { x: width/2 - (textW/2)*Math.cos(angleRad), y: height/2 - (textW/2)*Math.sin(angleRad), size: textSize * 1.6, font: fontBold, color: rgb(0.5, 0.1, 0.1), opacity: textOpacity, rotate: degrees(60) });
        }
      }

      if (useLogoWatermark && logoFile) {
        const logoBuf = await logoFile.arrayBuffer();
        const logoImg = logoFile.type === 'image/png' ? await previewPdf.embedPng(logoBuf) : await previewPdf.embedJpg(logoBuf);
        const dims = logoImg.scaleToFit(logoSize, logoSize);
        for (let x = 30; x < width; x += logoSize * 1.3) {
          for (let y = 30; y < height; y += logoSize * 1.2) page.drawImage(logoImg, { x, y, width: dims.width, height: dims.height, opacity: logoOpacity });
        }
      }

      const pdfBytes = await previewPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (e) { console.error("Preview error", e); }
  }, [files, rotation, useWatermark, useGridWatermark, useSecurityWatermark, useLogoWatermark, logoFile, watermarkText, logoOpacity, textOpacity, textSize, logoSize, useHeader, headerText, headerAlign, useFooter, footerText, footerAlign, usePagination, paginationAlign]);

  useEffect(() => {
    const timer = setTimeout(generatePreview, 500);
    return () => clearTimeout(timer);
  }, [generatePreview]);

  // --- DROPZONE ---
  const onDrop = useCallback(acceptedFiles => {
    const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'text/plain', 'text/csv'];
    const validFiles = acceptedFiles.filter(file => validTypes.includes(file.type) || file.name.endsWith('.csv'));
    
    if (validFiles.length < acceptedFiles.length) {
      alert("⚠️ Nota: Digitrik supporta PDF, Immagini (PNG/JPG), TXT e CSV.\nI file Word/Excel non sono supportati direttamente.");
    }
    const newFiles = validFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file: file
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop, 
    accept: { 
      'application/pdf': ['.pdf'], 
      'image/png': ['.png'], 
      'image/jpeg': ['.jpg', '.jpeg'],
      'text/plain': ['.txt'],
      'text/csv': ['.csv']
    }
  });

  const onDropLogo = useCallback(acceptedFiles => { if (acceptedFiles.length > 0) setLogoFile(acceptedFiles[0]); }, []);
  const { getRootProps: getLogoRootProps, getInputProps: getLogoInputProps, isDragActive: isLogoDragActive } = useDropzone({ 
    onDrop: onDropLogo, accept: { 'image/*': ['.jpeg', '.jpg', '.png'] }, multiple: false 
  });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(files);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setFiles(items);
  };
  const removeFile = (id) => setFiles(prev => prev.filter(f => f.id !== id));

  // --- EXECUTE TRICK ---
  const openRenameModal = () => {
    if (files.length === 0) return alert("Coda vuota.");
    const keys = Object.keys(fileEncyclopedia);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    setTrickCuriosity({ key: randomKey, text: fileEncyclopedia[randomKey].curiosity });
    setTempFilename("Digitrik_Result");
    setShowRenameModal(true);
  };

  const confirmTrick = async () => {
    setShowRenameModal(false);
    setIsProcessing(true);
    
    try {
      const mergedPdf = await PDFDocument.create();
      
      // GHOST MODE & METADATA
      if (ghostMode) {
        mergedPdf.setTitle("");
        mergedPdf.setAuthor("");
        mergedPdf.setSubject("");
        mergedPdf.setKeywords([]);
        mergedPdf.setProducer("Anonymous Ghost");
        mergedPdf.setCreator("Anonymous Ghost");
        mergedPdf.setCreationDate(new Date('1999-01-01')); // Matrix era date :)
        mergedPdf.setModificationDate(new Date('1999-01-01'));
      } else {
        if (metaTitle) mergedPdf.setTitle(metaTitle);
        if (metaAuthor) mergedPdf.setAuthor(metaAuthor);
        mergedPdf.setCreator("Digitrik Core System");
      }

      const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
      const fontNormal = await mergedPdf.embedFont(StandardFonts.Helvetica);
      const fontMono = await mergedPdf.embedFont(StandardFonts.Courier);

      for (const f of files) {
        // COMPRESSION LOGIC (ONLY FOR NEW IMAGES)
        let arrayBuffer;
        if (f.file.type.startsWith('image/')) {
           // Smart Compression per immagini
           if (compressionProfile === 'web') {
             const blob = await compressImage(f.file, 0.6, 0.6); // 60% quality, 60% scale
             arrayBuffer = await blob.arrayBuffer();
           } else if (compressionProfile === 'balanced') {
             const blob = await compressImage(f.file, 0.8, 0.8); // 80% quality, 80% scale
             arrayBuffer = await blob.arrayBuffer();
           } else {
             arrayBuffer = await f.file.arrayBuffer(); // Original
           }
        } else {
           arrayBuffer = await f.file.arrayBuffer();
        }

        if (f.file.type === 'application/pdf') {
          if (action === 'estrai') {
            const range = prompt(`Pagine da estrarre per ${f.file.name} (es: 1, 3-5). Lascia vuoto per tutto:`);
            if (range) {
               const sourcePdf = await PDFDocument.load(arrayBuffer);
               const targetPages = range.split(',').flatMap(part => {
                 if (part.includes('-')) {
                   const [start, end] = part.split('-').map(Number);
                   return Array.from({length: end - start + 1}, (_, i) => start + i - 1);
                 }
                 return [Number(part) - 1];
               }).filter(idx => idx >= 0 && idx < sourcePdf.getPageCount());
               const pages = await mergedPdf.copyPages(sourcePdf, targetPages);
               pages.forEach(p => mergedPdf.addPage(p));
            } else {
               const pdf = await PDFDocument.load(arrayBuffer);
               const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
               pages.forEach(p => mergedPdf.addPage(p));
            }
          } else {
            const pdf = await PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(p => mergedPdf.addPage(p));
          }

        } else if (f.file.type.startsWith('image/')) {
          const page = mergedPdf.addPage();
          const { width, height } = page.getSize();
          // Embed always as JPG if compressed to ensure size reduction
          let image;
          try {
             image = await mergedPdf.embedJpg(arrayBuffer);
          } catch {
             image = await mergedPdf.embedPng(arrayBuffer);
          }
          const dims = image.scaleToFit(width - 40, height - 40);
          page.drawImage(image, { x: width / 2 - dims.width / 2, y: height / 2 - dims.height / 2, width: dims.width, height: dims.height });
        
        } else if (f.file.type === 'text/plain' || f.file.type === 'text/csv' || f.file.name.endsWith('.csv')) {
          const textContent = await f.file.text();
          await renderTextToPdf(mergedPdf, textContent, fontMono);
        }
      }

      let embeddedLogo = null;
      if (useLogoWatermark && logoFile) {
        const logoBuffer = await logoFile.arrayBuffer();
        embeddedLogo = logoFile.type === 'image/png' ? await mergedPdf.embedPng(logoBuffer) : await mergedPdf.embedJpg(logoBuffer);
      }

      const pages = mergedPdf.getPages();
      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        
        if (rotation !== 0) page.setRotation(degrees(rotation));

        if (useHeader && headerText.trim() !== '') {
          const text = headerText.toUpperCase();
          const tWidth = fontBold.widthOfTextAtSize(text, 9);
          page.drawText(text, { x: getXPos(headerAlign, tWidth, width), y: height - 40, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
        }
        if (useFooter && footerText.trim() !== '') {
          const tWidth = fontNormal.widthOfTextAtSize(footerText, 9);
          page.drawText(footerText, { x: getXPos(footerAlign, tWidth, width), y: 30, size: 9, font: fontNormal, color: rgb(0.3, 0.3, 0.3) });
        }
        if (usePagination) {
          const text = `Pag. ${index + 1} / ${pages.length}`;
          const tWidth = fontNormal.widthOfTextAtSize(text, 9);
          page.drawText(text, { x: getXPos(paginationAlign, tWidth, width), y: 30, size: 9, font: fontNormal, color: rgb(0.4, 0.4, 0.4) });
        }
        if (watermarkText.trim() !== '') {
          if (useWatermark) {
            const textW = fontBold.widthOfTextAtSize(watermarkText, textSize);
            for (let x = -width; x < width * 2; x += (textW / 2) + 7) {
              for (let y = -height; y < height * 2; y += 150) page.drawText(watermarkText, { x, y, size: textSize, font: fontBold, color: rgb(0.3, 0.3, 0.3), opacity: textOpacity, rotate: degrees(45) });
            }
          }
          if (useGridWatermark) {
            for (let x = 30; x < width; x += 120) {
              for (let y = 30; y < height; y += 80) page.drawText(watermarkText.substring(0, 10), { x, y, size: textSize * 0.6, font: fontBold, color: rgb(0.4, 0.4, 0.4), opacity: textOpacity });
            }
          }
          if (useSecurityWatermark) {
            const secText = watermarkText.substring(0, 30).padEnd(15, ' ');
            const textW = fontBold.widthOfTextAtSize(secText, textSize * 1.6);
            const angleRad = 60 * Math.PI / 180;
            page.drawText(secText, { x: width/2 - (textW/2)*Math.cos(angleRad), y: height/2 - (textW/2)*Math.sin(angleRad), size: textSize * 1.6, font: fontBold, color: rgb(0.5, 0.1, 0.1), opacity: textOpacity, rotate: degrees(60) });
          }
        }
        if (useLogoWatermark && embeddedLogo) {
          const logoDims = embeddedLogo.scaleToFit(logoSize, logoSize); 
          for (let x = 30; x < width; x += logoSize * 1.3) {
            for (let y = 30; y < height; y += logoSize * 1.2) page.drawImage(embeddedLogo, { x, y, width: logoDims.width, height: logoDims.height, opacity: logoOpacity });
          }
        }
      });

      const finalPdfBytes = await mergedPdf.save();
      const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `${tempFilename}.pdf`; link.click();
    } catch (e) { alert("Errore nel processo: " + e.message); } finally { setIsProcessing(false); }
  };

  return (
    <main className="min-h-screen bg-[#080808] text-[#e0e0e0] font-sans relative">
      <nav className="h-14 border-b border-white/5 flex items-center px-8 bg-[#0a0a0a] sticky top-0 z-50">
        <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">Digitrik <span className="text-blue-600 font-normal">Core</span></h1>
      </nav>

      {/* --- POPUP RINOMINA --- */}
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
                <input type="text" value={tempFilename} onChange={(e) => setTempFilename(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && confirmTrick()} autoFocus className="w-full bg-[#111] border border-white/10 rounded-xl p-4 text-white font-medium outline-none focus:border-blue-600 transition-all shadow-inner" />
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
              <button onClick={confirmTrick} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"><Check size={16} /> Conferma & Scarica</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12">
        {/* --- SIDEBAR --- */}
        <div className="col-span-8 p-8 space-y-6 border-r border-white/5">
          {previewUrl && (
            <div className="space-y-2 sticky top-20 z-40 transition-all">
              {/* HEADER ANTEPRIMA (BUTTON) */}
              <button 
                onClick={() => setIsPreviewOpen(!isPreviewOpen)}
                className="w-full flex justify-between items-center group cursor-pointer"
              >
                <div className="flex items-center gap-2 text-blue-500 font-black italic text-[11px] uppercase group-hover:text-blue-400 transition-colors">
                  {isPreviewOpen ? <Eye size={14} /> : <EyeOff size={14} />} 
                  Live Matrix Preview {isPreviewOpen ? '' : '(Hidden)'}
                </div>
                
                {/* SYSTEM HEALTH WIDGET (Sempre visibile) */}
                <div className={`flex items-center gap-3 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wide transition-all ${
                  healthStats.status === 'optimal' ? 'bg-green-500/10 border-green-500/30 text-green-500' :
                  healthStats.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500' :
                  'bg-red-500/10 border-red-500/30 text-red-500'
                }`}>
                  <Activity size={12} /> 
                  System Weight: {healthStats.weight}
                </div>
              </button>

              {/* HEALTH ALERTS */}
              {healthStats.alerts.length > 0 && isPreviewOpen && (
                <div className="bg-[#111] border border-yellow-500/20 rounded-xl p-3 space-y-1 animate-in fade-in slide-in-from-top-2">
                   {healthStats.alerts.map((alert, i) => (
                     <div key={i} className="flex items-center gap-2 text-[10px] text-yellow-500/80 font-bold uppercase"><ShieldAlert size={10} /> {alert}</div>
                   ))}
                </div>
              )}

              {/* IFRAME ANTEPRIMA (COLLASSABILE) */}
              {isPreviewOpen && (
                <div className="w-full h-80 bg-[#111] rounded-[2rem] border border-blue-600/20 overflow-hidden shadow-2xl relative animate-in fade-in zoom-in duration-300">
                  <iframe src={`${previewUrl}#toolbar=0&navpanes=0`} className="w-full h-full border-none opacity-80" />
                </div>
              )}
            </div>
          )}
          
          <div {...getRootProps()} className={`border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-600 bg-blue-600/5' : 'border-white/10 hover:bg-white/[0.02]'}`}>
            <input {...getInputProps()} />
            <Plus className="mx-auto mb-4 text-gray-700" size={32} />
            <p className="font-bold italic text-gray-500 text-sm">Trascina file PDF, IMG, TXT o CSV</p>
          </div>

          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="files-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {files.map((f, i) => (
                    <Draggable key={f.id} draggableId={f.id} index={i}>
                      {(provided, snapshot) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className={`flex justify-between items-center bg-[#111] p-4 rounded-2xl border transition-all ${snapshot.isDragging ? 'border-blue-600 bg-blue-600/10 shadow-2xl z-50' : 'border-white/5'}`}>
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps} className="text-gray-700 cursor-grab"><GripVertical size={20} /></div>
                            <span className="text-blue-600 font-black italic text-sm">{i+1}</span>
                            <FileText size={20} className="text-gray-600" />
                            <p className="text-xs font-bold truncate max-w-[250px] text-white">{f.file.name}</p>
                          </div>
                          <button onClick={() => removeFile(f.id)} className="text-gray-700 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          <div className="mt-12 p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-8">
            <div className="flex flex-col gap-2">
              <span className="text-blue-500 font-black italic text-[11px] uppercase tracking-[0.4em] ml-1">Database Digitrik</span>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Enciclopedia dei File</h2>
            </div>
            <div className="relative">
              <select onChange={(e) => setSelectedInfo(fileEncyclopedia[e.target.value])} className="w-full bg-[#111] border border-white/10 rounded-2xl p-5 appearance-none font-bold text-gray-300 focus:border-blue-600 outline-none cursor-pointer uppercase text-xs tracking-widest italic">
                <option value="">Seleziona un formato per la consultazione...</option>
                {Object.keys(fileEncyclopedia).sort().map(name => (<option key={name} value={name}>{name}</option>))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" size={20} />
            </div>
            {selectedInfo && (
              <div className="bg-blue-600/[0.03] border border-blue-600/20 rounded-[2rem] p-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-blue-600 text-white text-[11px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest italic">Info di Sistema</span>
                  <div className="flex items-center gap-2 text-[11px] text-gray-500 font-black uppercase tracking-widest"><RefreshCcw size={12} className="text-blue-500" /> Tempo di lettura stimato: 25s</div>
                </div>
                <div className="space-y-6">
                  <div>
                    <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest block mb-2">Protocollo: {selectedInfo.type}</span>
                    <p className="text-gray-300 text-sm leading-relaxed font-medium italic">{selectedInfo.desc}</p>
                  </div>
                  <div className="flex gap-4 items-start bg-black/60 p-6 rounded-2xl border border-white/5 shadow-inner">
                    <Sparkles className="text-blue-500 shrink-0 mt-1" size={20} />
                    <div>
                      <span className="text-[11px] font-black text-blue-500 uppercase italic block mb-1">Curiosità Matrix:</span>
                      <p className="text-xs text-gray-400 italic font-bold leading-relaxed">{selectedInfo.curiosity}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- CONTROLS BAR (RIGHT SIDEBAR) --- */}
        <div className="col-span-4 bg-[#0a0a0a] p-8 space-y-6 relative overflow-y-auto max-h-screen">
          <button onClick={openRenameModal} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white py-8 rounded-[2rem] font-black italic uppercase tracking-widest text-xl transition-all flex flex-col items-center justify-center gap-2 shadow-2xl">
            {isProcessing ? <RefreshCcw className="animate-spin" size={24} /> : <><Wand2 size={24} /><span>ESEGUI TRICK</span></>}
          </button>
          
          <div className="relative">
            <select value={action} onChange={(e) => setAction(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-[1.5rem] p-5 appearance-none font-bold italic text-white text-sm focus:border-blue-600 outline-none">
              <option value="conversione">'CONVERTI IN .pdf'</option>
              <option value="unisci">'UNIFICA PAGINE'</option>
              <option value="estrai">'ESTRAI PAGINE'</option>
            </select>
            <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
          </div>

          {/* MENU 1: LAYOUT TOOLS */}
          <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
            <button onClick={() => setIsLayoutOpen(!isLayoutOpen)} className="w-full p-5 flex items-center justify-between text-xs font-black uppercase text-gray-400 hover:text-white transition-colors italic">
              <span>Layout & Export</span> {isLayoutOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isLayoutOpen && (
              <div className="p-5 pt-0 space-y-5 border-t border-white/5 mt-2 animate-in fade-in slide-in-from-top-1">
                
                {/* COMPRESSION PROFILES */}
                <div className="bg-black p-3 rounded-xl border border-white/5 space-y-2">
                  <span className="text-[10px] font-black uppercase text-gray-500 flex items-center gap-2"><Layers size={12}/> Compressione Smart</span>
                  <div className="grid grid-cols-3 gap-1">
                    {[
                      { id: 'web', label: 'WEB', icon: <Feather size={12}/>, desc: '72dpi' },
                      { id: 'balanced', label: 'STD', icon: <Layers size={12}/>, desc: '150dpi' },
                      { id: 'print', label: 'PRO', icon: <Printer size={12}/>, desc: '300dpi' }
                    ].map(p => (
                      <button 
                        key={p.id} 
                        onClick={() => setCompressionProfile(p.id)}
                        className={`p-2 rounded-lg border flex flex-col items-center gap-1 transition-all ${
                          compressionProfile === p.id 
                            ? 'bg-blue-600/20 border-blue-600 text-blue-500' 
                            : 'bg-[#111] border-transparent text-gray-600 hover:bg-[#151515]'
                        }`}
                      >
                        {p.icon}
                        <span className="text-[9px] font-black">{p.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center bg-black p-3 rounded-xl border border-white/5">
                  <span className="text-[11px] font-bold text-gray-400 uppercase flex items-center gap-2"><RotateCw size={14} /> Rotazione</span>
                  <div className="flex gap-1">
                    {[0, 90, 180, 270].map(deg => (
                      <button key={deg} onClick={() => setRotation(deg)} className={`px-2 py-1 rounded text-[10px] font-bold ${rotation === deg ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}>{deg}°</button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={useHeader} onChange={e => setUseHeader(e.target.checked)} className="w-3.5 h-3.5 rounded bg-black border-white/10" />
                      <span className="text-[11px] font-bold text-gray-400 uppercase">Intestazione</span>
                    </label>
                    <AlignmentPicker current={headerAlign} set={setHeaderAlign} />
                  </div>
                  <input type="text" placeholder="Testo intestazione..." value={headerText} onChange={e => setHeaderText(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-600/50" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={useFooter} onChange={e => setUseFooter(e.target.checked)} className="w-3.5 h-3.5 rounded bg-black border-white/10" />
                      <span className="text-[11px] font-bold text-gray-400 uppercase">Piè di Pagina</span>
                    </label>
                    <AlignmentPicker current={footerAlign} set={setFooterAlign} />
                  </div>
                  <input type="text" placeholder="Testo piè di pagina..." value={footerText} onChange={e => setFooterText(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-600/50" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={usePagination} onChange={e => setUsePagination(e.target.checked)} className="w-3.5 h-3.5 rounded bg-black border-white/10" />
                    <span className="text-[11px] font-bold text-gray-400 uppercase">Numerazione Pagine</span>
                  </label>
                  <AlignmentPicker current={paginationAlign} set={setPaginationAlign} />
                </div>
              </div>
            )}
          </div>

          {/* MENU 2: GHOST SECURITY PROTOCOLS (NEW) */}
          <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
            <button onClick={() => setIsGhostMenuOpen(!isGhostMenuOpen)} className="w-full p-5 flex items-center justify-between text-xs font-black uppercase text-gray-400 hover:text-white transition-colors italic">
              <span>Ghost Security Protocols</span> {isGhostMenuOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isGhostMenuOpen && (
              <div className="p-5 pt-0 space-y-5 border-t border-white/5 mt-2 animate-in fade-in slide-in-from-top-1">
                
                {/* GHOST CLEAN */}
                <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${ghostMode ? 'bg-red-900/10 border-red-500/30' : 'bg-black border-white/5'}`}>
                   <div className="flex items-center gap-2">
                     <Ghost size={14} className={ghostMode ? 'text-red-500' : 'text-gray-500'} />
                     <div>
                       <span className={`block text-[10px] font-black uppercase ${ghostMode ? 'text-red-500' : 'text-gray-400'}`}>Ghost Mode</span>
                       <span className="text-[9px] text-gray-600 block">Sanitizza tutti i Metadati</span>
                     </div>
                   </div>
                   <input type="checkbox" checked={ghostMode} onChange={e => setGhostMode(e.target.checked)} className="accent-red-500" />
                </label>

                {/* METADATA (Hidden if Ghost Mode is ON) */}
                {!ghostMode && (
                  <div className="space-y-3 opacity-100 transition-opacity">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-500 mb-2"><Tag size={12}/> Metadati Stealth</div>
                    <input type="text" placeholder="Titolo Documento..." value={metaTitle} onChange={e => setMetaTitle(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-600/50" />
                    <input type="text" placeholder="Autore..." value={metaAuthor} onChange={e => setMetaAuthor(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-600/50" />
                  </div>
                )}
                
                {ghostMode && (
                   <div className="p-3 bg-red-900/10 border border-red-500/20 rounded-xl">
                      <p className="text-[10px] text-red-400 italic flex gap-2 items-center"><Lock size={12}/> Attenzione: Tutti i metadati originali verranno distrutti.</p>
                   </div>
                )}
              </div>
            )}
          </div>

          {/* MENU 3: PROTEZIONE MATRIX */}
          <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
            <button onClick={() => setIsMatrixOpen(!isMatrixOpen)} className="w-full p-5 flex items-center justify-between text-xs font-black uppercase text-gray-400 hover:text-white transition-colors italic">
              <span>Protezione Matrix</span> {isMatrixOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isMatrixOpen && (
              <div className="p-5 pt-0 space-y-6 border-t border-white/5 mt-2 animate-in fade-in slide-in-from-top-1">
                <input type="text" placeholder="Testo filigrana..." value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl p-4 text-xs font-bold italic text-white outline-none focus:border-blue-600/50" />
                <div className="grid grid-cols-1 gap-3">
                  {[ {s:useWatermark, f:setUseWatermark, t:'Nastro'}, {s:useGridWatermark, f:setUseGridWatermark, t:'Griglia'}, {s:useSecurityWatermark, f:setUseSecurityWatermark, t:'Security'} ].map(item => (
                    <label key={item.t} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={item.s} onChange={(e) => item.f(e.target.checked)} className="w-4 h-4 text-blue-600 bg-black border-white/10 rounded" />
                      <span className="text-[11px] font-black uppercase text-gray-400 italic">{item.t}</span>
                    </label>
                  ))}
                </div>
                
                <div className="space-y-4 pt-2 border-t border-white/5">
                  <SmartSlider label="Dimensione Testo" value={textSize} min={10} max={150} unit="px" onChange={(val) => setTextSize(parseInt(val))} />
                  <SmartSlider label="Opacità Testo" value={Math.round(textOpacity * 100)} min={5} max={100} step={5} unit="%" onChange={(val) => setTextOpacity(val / 100)} />
                </div>

                <div className="pt-4 space-y-4 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={useLogoWatermark} onChange={(e) => setUseLogoWatermark(e.target.checked)} className="w-4 h-4 text-blue-600 bg-black border-white/10 rounded" />
                    <span className="text-[11px] font-black uppercase text-blue-500 italic">Logo come Griglia</span>
                  </label>
                  <div {...getLogoRootProps()} className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${isLogoDragActive ? 'border-blue-600 bg-blue-600/5' : 'border-white/10 hover:bg-white/[0.02]'}`}>
                    <input {...getLogoInputProps()} />
                    <ImageIcon className={`mx-auto mb-2 ${logoFile ? 'text-blue-500' : 'text-gray-700'}`} size={20} />
                    <p className="text-[11px] font-bold text-gray-500 uppercase">{logoFile ? logoFile.name : "Carica Logo"}</p>
                  </div>
                  <div className="space-y-4">
                     <SmartSlider label="Dimensione Logo" value={logoSize} min={20} max={400} step={5} unit="px" onChange={(val) => setLogoSize(parseInt(val))} />
                     <SmartSlider label="Opacità Logo" value={Math.round(logoOpacity * 100)} min={5} max={100} step={5} unit="%" onChange={(val) => setLogoOpacity(val / 100)} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
