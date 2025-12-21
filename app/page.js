'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  FileText, Plus, Trash2, RefreshCcw, ChevronDown, Wand2, GripVertical, 
  ImageIcon, Eye, AlignLeft, AlignCenter, AlignRight, ChevronUp, 
  ChevronRight 
} from 'lucide-react';

export default function DigitrikWorkstation() {
  const [files, setFiles] = useState([]);
  const [action, setAction] = useState('conversione'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // --- STATI PER MENU A SCOMPARSA ---
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  // --- STATI LAYOUT ---
  const [useHeader, setUseHeader] = useState(false);
  const [headerText, setHeaderText] = useState('');
  const [headerAlign, setHeaderAlign] = useState('left');

  const [useFooter, setUseFooter] = useState(false);
  const [footerText, setFooterText] = useState('');
  const [footerAlign, setFooterAlign] = useState('left');

  const [usePagination, setUsePagination] = useState(false);
  const [paginationAlign, setPaginationAlign] = useState('right');

  // Stati Filigrane Testuali
  const [useWatermark, setUseWatermark] = useState(false);
  const [useGridWatermark, setUseGridWatermark] = useState(false);
  const [useSecurityWatermark, setUseSecurityWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [textOpacity, setTextOpacity] = useState(0.25);
  const [textSize, setTextSize] = useState(30);
  
  // Stato Logo Filigrana
  const [useLogoWatermark, setUseLogoWatermark] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoOpacity, setLogoOpacity] = useState(0.15);
  const [logoSize, setLogoSize] = useState(150);

  // --- LOGICA DI CALCOLO POSIZIONE ---
  const getXPos = (align, textWidth, pageWidth) => {
    if (align === 'center') return (pageWidth / 2) - (textWidth / 2);
    if (align === 'right') return pageWidth - textWidth - 40;
    return 40; // left
  };

  // --- LIVE PREVIEW ---
  const generatePreview = useCallback(async () => {
    if (files.length === 0) {
      setPreviewUrl(null);
      return;
    }

    try {
      const firstFile = files[0].file;
      const arrayBuffer = await firstFile.arrayBuffer();
      const previewPdf = await PDFDocument.create();
      const fontBold = await previewPdf.embedFont(StandardFonts.HelveticaBold);
      const fontNormal = await previewPdf.embedFont(StandardFonts.Helvetica);
      
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
      } else { return; }

      const { width, height } = page.getSize();

      if (useHeader && headerText.trim() !== '') {
        const text = headerText.toUpperCase();
        const fSize = 9;
        const tWidth = fontBold.widthOfTextAtSize(text, fSize);
        page.drawText(text, { x: getXPos(headerAlign, tWidth, width), y: height - 40, size: fSize, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
      }

      if (useFooter && footerText.trim() !== '') {
        const fSize = 9;
        const tWidth = fontNormal.widthOfTextAtSize(footerText, fSize);
        page.drawText(footerText, { x: getXPos(footerAlign, tWidth, width), y: 30, size: fSize, font: fontNormal, color: rgb(0.3, 0.3, 0.3) });
      }

      if (usePagination) {
        const text = `Pag. 1 / ${files.length}`;
        const fSize = 9;
        const tWidth = fontNormal.widthOfTextAtSize(text, fSize);
        page.drawText(text, { x: getXPos(paginationAlign, tWidth, width), y: 30, size: fSize, font: fontNormal, color: rgb(0.4, 0.4, 0.4) });
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
  }, [files, useWatermark, useGridWatermark, useSecurityWatermark, useLogoWatermark, logoFile, watermarkText, logoOpacity, textOpacity, textSize, logoSize, useHeader, headerText, headerAlign, useFooter, footerText, footerAlign, usePagination, paginationAlign]);

  useEffect(() => {
    const timer = setTimeout(generatePreview, 500);
    return () => clearTimeout(timer);
  }, [generatePreview]);

  const onDrop = useCallback(acceptedFiles => {
    const newFiles = acceptedFiles.map(file => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file: file
    }));
    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const onDropLogo = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) setLogoFile(acceptedFiles[0]);
  }, []);

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

  const executeTrick = async () => {
    if (files.length === 0) return alert("Coda vuota.");
    const customName = prompt("Come vuoi battezzare il file finale?", "Digitrik_Result");
    if (!customName) return; 

    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
      const fontNormal = await mergedPdf.embedFont(StandardFonts.Helvetica);
      
      if (action === 'conversione') {
        for (const f of files) {
          const arrayBuffer = await f.file.arrayBuffer();
          if (f.file.type === 'application/pdf') {
            const pdf = await PDFDocument.load(arrayBuffer);
            const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
            pages.forEach(p => mergedPdf.addPage(p));
          } else if (f.file.type.startsWith('image/')) {
            const page = mergedPdf.addPage();
            const { width, height } = page.getSize();
            let image = f.file.type === 'image/png' ? await mergedPdf.embedPng(arrayBuffer) : await mergedPdf.embedJpg(arrayBuffer);
            const dims = image.scaleToFit(width - 40, height - 40);
            page.drawImage(image, { x: width / 2 - dims.width / 2, y: height / 2 - dims.height / 2, width: dims.width, height: dims.height });
          }
        }
      } else if (action === 'unisci') {
        for (const f of files) {
          const pdf = await PDFDocument.load(await f.file.arrayBuffer());
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          pages.forEach(p => mergedPdf.addPage(p));
        }
      } else if (action === 'estrai') {
        const range = prompt("Pagine da estrarre (es: 1, 3-5):", "1");
        if (!range) { setIsProcessing(false); return; }
        const targetPages = range.split(',').flatMap(part => {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            return Array.from({length: end - start + 1}, (_, i) => start + i - 1);
          }
          return [Number(part) - 1];
        });
        for (const f of files) {
          const pdf = await PDFDocument.load(await f.file.arrayBuffer());
          const pages = await mergedPdf.copyPages(pdf, targetPages.filter(idx => idx >= 0 && idx < pdf.getPageCount()));
          pages.forEach(p => mergedPdf.addPage(p));
        }
      }

      let embeddedLogo = null;
      if (useLogoWatermark && logoFile) {
        const logoBuffer = await logoFile.arrayBuffer();
        embeddedLogo = logoFile.type === 'image/png' ? await mergedPdf.embedPng(logoBuffer) : await mergedPdf.embedJpg(logoBuffer);
      }

      const pages = mergedPdf.getPages();
      const totalPages = pages.length;

      pages.forEach((page, index) => {
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
          const text = `Pag. ${index + 1} / ${totalPages}`;
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
      link.href = url; link.download = `${customName}.pdf`; link.click();
    } catch (e) { alert("Errore nel processo."); } finally { setIsProcessing(false); }
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

  return (
    <main className="min-h-screen bg-[#080808] text-[#e0e0e0] font-sans">
      <nav className="h-14 border-b border-white/5 flex items-center px-8 bg-[#0a0a0a] sticky top-0 z-50">
        <h1 className="text-xl font-black italic tracking-tighter text-white uppercase">Digitrik <span className="text-blue-600 font-normal">Core</span></h1>
      </nav>

      <div className="grid grid-cols-12">
        <div className="col-span-8 p-8 space-y-6 border-r border-white/5">
          {previewUrl && (
            <div className="space-y-2 sticky top-20 z-40">
              <div className="flex items-center gap-2 text-blue-500 font-black italic text-[10px] uppercase"><Eye size={14} /> Live Matrix Preview</div>
              <div className="w-full h-80 bg-[#111] rounded-[2rem] border border-blue-600/20 overflow-hidden shadow-2xl relative">
                <iframe src={`${previewUrl}#toolbar=0&navpanes=0`} className="w-full h-full border-none opacity-80" />
              </div>
            </div>
          )}
          <div {...getRootProps()} className={`border-2 border-dashed rounded-[2rem] p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-600 bg-blue-600/5' : 'border-white/10 hover:bg-white/[0.02]'}`}>
            <input {...getInputProps()} />
            <Plus className="mx-auto mb-4 text-gray-700" size={32} />
            <p className="font-bold italic text-gray-500 text-sm">Trascina qui i tuoi file</p>
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
        </div>

        <div className="col-span-4 bg-[#0a0a0a] p-8 space-y-6 relative overflow-y-auto max-h-screen">
          
          {/* BANNER PUBBLICITARIO POSIZIONATO IN ALTO PER MASSIMA VISIBILITÀ */}
          <div className="w-full group">
            <a 
              href="#" 
              onClick={(e) => e.preventDefault()} 
              className="block bg-[#1a1a1a] border border-blue-500/40 rounded-[2rem] p-5 flex items-center justify-between group-hover:border-blue-500 group-hover:bg-[#222] transition-all cursor-pointer relative overflow-hidden shadow-2xl shadow-blue-900/10 z-10"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -mr-10 -mt-10" />
              <div className="flex items-center gap-4 relative z-20">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center border border-blue-400/30 shadow-[0_0_15px_rgba(37,99,235,0.4)] relative">
                  {/* ICONA FULMINE IN SVG PURO (per evitare problemi di caricamento librerie) */}
                  <svg 
                    width="20" 
                    height="20" 
                    viewBox="0 0 24 24" 
                    fill="white" 
                    stroke="white" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="relative z-30"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-black text-white tracking-tight flex items-center gap-2">
                    DIGITRIK PREMIUM <span className="bg-blue-500 text-[9px] px-1.5 py-0.5 rounded italic">NEW</span>
                  </h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tight mt-1">
                    Velocità 2x e processi illimitati
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-blue-500 group-hover:translate-x-1 transition-transform relative z-20" />
            </a>
          </div>

          <button onClick={executeTrick} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white py-8 rounded-[2rem] font-black italic uppercase tracking-widest text-xl transition-all flex flex-col items-center justify-center gap-2 shadow-2xl">
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

          {/* LAYOUT TOOLS A SCOMPARSA */}
          <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
            <button 
              onClick={() => setIsLayoutOpen(!isLayoutOpen)}
              className="w-full p-5 flex items-center justify-between text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors italic"
            >
              <span>Layout & Info</span>
              {isLayoutOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            
            {isLayoutOpen && (
              <div className="p-5 pt-0 space-y-5 border-t border-white/5 mt-2 animate-in fade-in slide-in-from-top-1">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={useHeader} onChange={e => setUseHeader(e.target.checked)} className="w-3.5 h-3.5 rounded bg-black border-white/10" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Intestazione</span>
                    </label>
                    <AlignmentPicker current={headerAlign} set={setHeaderAlign} />
                  </div>
                  <input type="text" placeholder="Testo intestazione..." value={headerText} onChange={e => setHeaderText(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-600/50" />
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={useFooter} onChange={e => setUseFooter(e.target.checked)} className="w-3.5 h-3.5 rounded bg-black border-white/10" />
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Piè di Pagina</span>
                    </label>
                    <AlignmentPicker current={footerAlign} set={setFooterAlign} />
                  </div>
                  <input type="text" placeholder="Testo piè di pagina..." value={footerText} onChange={e => setFooterText(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl p-3 text-xs text-white outline-none focus:border-blue-600/50" />
                </div>

                <div className="flex justify-between items-center pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={usePagination} onChange={e => setUsePagination(e.target.checked)} className="w-3.5 h-3.5 rounded bg-black border-white/10" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Numerazione Pagine</span>
                  </label>
                  <AlignmentPicker current={paginationAlign} set={setPaginationAlign} />
                </div>
              </div>
            )}
          </div>

          {/* PROTEZIONE MATRIX A SCOMPARSA */}
          <div className="bg-[#111] rounded-2xl border border-white/5 overflow-hidden">
            <button 
              onClick={() => setIsMatrixOpen(!isMatrixOpen)}
              className="w-full p-5 flex items-center justify-between text-[10px] font-black uppercase text-gray-400 hover:text-white transition-colors italic"
            >
              <span>Protezione Matrix</span>
              {isMatrixOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>

            {isMatrixOpen && (
              <div className="p-5 pt-0 space-y-6 border-t border-white/5 mt-2 animate-in fade-in slide-in-from-top-1">
                <input type="text" placeholder="Testo filigrana..." value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl p-4 text-xs font-bold italic text-white outline-none focus:border-blue-600/50" />

                <div className="grid grid-cols-1 gap-3">
                  {[ {s:useWatermark, f:setUseWatermark, t:'Nastro'}, {s:useGridWatermark, f:setUseGridWatermark, t:'Griglia'}, {s:useSecurityWatermark, f:setUseSecurityWatermark, t:'Security'} ].map(item => (
                    <label key={item.t} className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={item.s} onChange={(e) => item.f(e.target.checked)} className="w-4 h-4 text-blue-600 bg-black border-white/10 rounded" />
                      <span className="text-[10px] font-black uppercase text-gray-400 italic">{item.t}</span>
                    </label>
                  ))}
                </div>

                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[9px] font-black uppercase"><span className="text-gray-500">Dimensione Testo</span><span className="text-blue-500">{textSize}px</span></div>
                    <input type="range" min="10" max="150" value={textSize} onChange={(e) => setTextSize(parseInt(e.target.value))} className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between text-[9px] font-black uppercase"><span className="text-gray-500">Opacità Testo</span><span className="text-blue-500">{Math.round(textOpacity * 100)}%</span></div>
                    <input type="range" min="0.05" max="1" step="0.05" value={textOpacity} onChange={(e) => setTextOpacity(parseFloat(e.target.value))} className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                </div>

                <div className="pt-4 space-y-4 border-t border-white/5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" checked={useLogoWatermark} onChange={(e) => setUseLogoWatermark(e.target.checked)} className="w-4 h-4 text-blue-600 bg-black border-white/10 rounded" />
                    <span className="text-[10px] font-black uppercase text-blue-500 italic">Logo come Griglia</span>
                  </label>

                  <div {...getLogoRootProps()} className={`border border-dashed rounded-xl p-4 text-center cursor-pointer transition-all ${isLogoDragActive ? 'border-blue-600 bg-blue-600/5' : 'border-white/10 hover:bg-white/[0.02]'}`}>
                    <input {...getLogoInputProps()} />
                    <ImageIcon className={`mx-auto mb-2 ${logoFile ? 'text-blue-500' : 'text-gray-700'}`} size={20} />
                    <p className="text-[9px] font-bold text-gray-500 uppercase">{logoFile ? logoFile.name : "Carica Logo"}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-[9px] font-black uppercase"><span className="text-gray-500">Dimensione Logo</span><span className="text-blue-500">{logoSize}px</span></div>
                      <input type="range" min="20" max="400" step="5" value={logoSize} onChange={(e) => setLogoSize(parseInt(e.target.value))} className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex justify-between text-[9px] font-black uppercase"><span className="text-gray-500">Opacità Logo</span><span className="text-blue-500">{Math.round(logoOpacity * 100)}%</span></div>
                      <input type="range" min="0.05" max="1" step="0.05" value={logoOpacity} onChange={(e) => setLogoOpacity(parseFloat(e.target.value))} className="w-full h-1 bg-black rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
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
