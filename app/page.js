'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  FileText, Plus, Trash2, RefreshCcw, ChevronDown, Wand2, GripVertical, 
  ImageIcon, Eye, AlignLeft, AlignCenter, AlignRight, ChevronUp, 
  ChevronRight, Sparkles 
} from 'lucide-react';

// --- DATABASE ENCICLOPEDIA ---
const fileEncyclopedia = {
  "AI (Adobe Illustrator)": {
    desc: "Il formato AI è un tipo di file vettoriale proprietario sviluppato da Adobe. A differenza delle immagini composte da pixel, i file AI si basano su percorsi matematici definiti da punti.",
    curiosity: "Sapevi che internamente un file AI è basato su una versione semplificata del formato PDF? Infatti, se salvato correttamente, puoi spesso visualizzarne l'anteprima anche senza avere Illustrator installato.",
    type: "Immagine Vettoriale"
  },
  "BMP (Bitmap Image)": {
    desc: "Il Bitmap (BMP) è uno dei formati grafici più puri e datati. Memorizza i dati dei pixel in modo diretto e non compresso.",
    curiosity: "Negli anni '90, i file BMP erano l'incubo dei floppy disk: una sola immagine ad alta risoluzione poteva occupare più spazio di un intero pacchetto software.",
    type: "Immagine Raster"
  },
  "CSV (Comma Separated Values)": {
    desc: "Il CSV è il ponte universale dei dati. Si tratta di un file di puro testo dove ogni riga rappresenta un record e i dati sono separati da una virgola.",
    curiosity: "Nonostante sembri un formato moderno, le sue origini risalgono al 1972, ben prima della nascita dei PC IBM.",
    type: "Documento Dati"
  },
  "DOC / DOCX (Microsoft Word)": {
    desc: "Il DOCX è l'evoluzione del vecchio formato DOC. La 'X' finale sta per XML, indicando che il file è in realtà un archivio compresso.",
    curiosity: "Se provi a rinominare un file .docx cambiando l'estensione in .zip, potrai aprirlo come una normale cartella e navigare tra le immagini contenute.",
    type: "Documento di Testo"
  },
  "EPS (Encapsulated PostScript)": {
    desc: "L'EPS è il pilastro dell'industria della stampa professionale. È un formato vettoriale che contiene istruzioni matematiche.",
    curiosity: "Sebbene sia un formato vettoriale, un file EPS può contenere al suo interno anche un'anteprima in bassa risoluzione per i vecchi computer.",
    type: "Vettoriale Professionale"
  },
  "EPUB (Electronic Publication)": {
    desc: "L'EPUB è lo standard aperto per gli eBook. La sua caratteristica principale è il layout 'refluibile'.",
    curiosity: "Un file EPUB è tecnicamente un piccolo sito web compresso; dentro ci sono file HTML, CSS e immagini interpretabili come un browser.",
    type: "Libro Digitale"
  },
  "GIF (Graphics Interchange Format)": {
    desc: "Il GIF è una reliquia degli albori del web. Supporta un massimo di 256 colori e la trasparenza binaria.",
    curiosity: "L'inventore del formato, Steve Wilhite, ha dichiarato ufficialmente che la pronuncia corretta è 'Jif', come il noto burro d'arachidi.",
    type: "Immagine Animata"
  },
  "HEIC (High Efficiency Image)": {
    desc: "Adottato da Apple, l'HEIC usa una compressione molto avanzata per risparmiare spazio senza perdere qualità.",
    curiosity: "HEIC non è solo un'immagine, ma un 'contenitore'. Può memorizzare intere sequenze di foto, come le 'Live Photos'.",
    type: "Immagine Moderna"
  },
  "JPG / JPEG (Joint Photographic)": {
    desc: "Il JPG è il formato fotografico più usato al mondo. Utilizza una compressione 'lossy' per ridurre il peso del file.",
    curiosity: "Ogni volta che salvi e risalvi un file JPG, l'algoritmo ricomprime l'immagine causando una perdita progressiva di dettaglio chiamata 'marciume digitale'.",
    type: "Immagine Standard"
  },
  "PDF (Portable Document Format)": {
    desc: "Creato da Adobe nel 1993, il PDF nasce per apparire identico su qualsiasi dispositivo.",
    curiosity: "Nei primi anni '90, il software per visualizzare i PDF costava 50 dollari. Solo quando divenne gratuito Acrobat Reader il formato divenne standard.",
    type: "Documento Universale"
  },
  "PNG (Portable Network Graphics)": {
    desc: "Il PNG è nato per migliorare il formato GIF. Supporta la trasparenza alfa per bordi sfumati perfetti.",
    curiosity: "Il formato PNG è stato creato d'urgenza nel 1995 perché il formato GIF utilizzava un algoritmo coperto da brevetto che richiedeva royalty.",
    type: "Immagine Trasparente"
  },
  "PSD (Adobe Photoshop)": {
    desc: "Il PSD è il formato di lavoro preferito dai designer. La sua magia risiede nella gestione dei livelli (layers).",
    curiosity: "Un singolo file PSD può superare i 2 Gigabyte. Per file ancora più grandi, esiste il formato PSB (Photoshop Big).",
    type: "Progetto Grafico"
  },
  "SVG (Scalable Vector Graphics)": {
    desc: "L'SVG è il linguaggio vettoriale del web moderno. È scritto interamente in codice XML.",
    curiosity: "Poiché è tecnicamente 'testo', puoi aprire un file SVG con il Blocco Note e cambiare un colore scrivendo il codice a mano.",
    type: "Immagine Web Vettoriale"
  },
  "TXT (Plain Text)": {
    desc: "Il TXT è la base atomica dell'informatica. Non contiene formattazione, solo caratteri puri.",
    curiosity: "Tutto il codice sorgente di internet e delle app che usi ogni giorno è scritto originariamente in semplici file .txt.",
    type: "Testo Puro"
  }
};

export default function DigitrikWorkstation() {
  const [files, setFiles] = useState([]);
  const [action, setAction] = useState('conversione'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedInfo, setSelectedInfo] = useState(null);
  const [isLayoutOpen, setIsLayoutOpen] = useState(false);
  const [isMatrixOpen, setIsMatrixOpen] = useState(false);

  // Stati Layout
  const [useHeader, setUseHeader] = useState(false);
  const [headerText, setHeaderText] = useState('');
  const [headerAlign, setHeaderAlign] = useState('left');
  const [useFooter, setUseFooter] = useState(false);
  const [footerText, setFooterText] = useState('');
  const [footerAlign, setFooterAlign] = useState('left');
  const [usePagination, setUsePagination] = useState(false);
  const [paginationAlign, setPaginationAlign] = useState('right');

  // Stati Filigrane
  const [useWatermark, setUseWatermark] = useState(false);
  const [useGridWatermark, setUseGridWatermark] = useState(false);
  const [useSecurityWatermark, setUseSecurityWatermark] = useState(false);
  const [watermarkText, setWatermarkText] = useState('');
  const [textOpacity, setTextOpacity] = useState(0.25);
  const [textSize, setTextSize] = useState(30);
  const [useLogoWatermark, setUseLogoWatermark] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoOpacity, setLogoOpacity] = useState(0.15);
  const [logoSize, setLogoSize] = useState(150);

  const getXPos = (align, textWidth, pageWidth) => {
    if (align === 'center') return (pageWidth / 2) - (textWidth / 2);
    if (align === 'right') return pageWidth - textWidth - 40;
    return 40;
  };

  const generatePreview = useCallback(async () => {
    if (files.length === 0) { setPreviewUrl(null); return; }
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
        const tWidth = fontBold.widthOfTextAtSize(headerText.toUpperCase(), 9);
        page.drawText(headerText.toUpperCase(), { x: getXPos(headerAlign, tWidth, width), y: height - 40, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
      }
      if (useFooter && footerText.trim() !== '') {
        const tWidth = fontNormal.widthOfTextAtSize(footerText, 9);
        page.drawText(footerText, { x: getXPos(footerAlign, tWidth, width), y: 30, size: 9, font: fontNormal, color: rgb(0.3, 0.3, 0.3) });
      }
      if (usePagination) {
        const pText = `Pag. 1 / ${files.length}`;
        const tWidth = fontNormal.widthOfTextAtSize(pText, 9);
        page.drawText(pText, { x: getXPos(paginationAlign, tWidth, width), y: 30, size: 9, font: fontNormal, color: rgb(0.4, 0.4, 0.4) });
      }
      if (watermarkText.trim() !== '') {
        if (useWatermark) {
          const textW = fontBold.widthOfTextAtSize(watermarkText, textSize);
          for (let x = -width; x < width * 2; x += (textW / 2) + 7) {
            for (let y = -height; y < height * 2; y += 150) page.drawText(watermarkText, { x, y, size: textSize, font: fontBold, color: rgb(0.3, 0.3, 0.3), opacity: textOpacity, rotate: degrees(45) });
          }
        }
      }
      
      const pdfBytes = await previewPdf.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
    } catch (e) { console.error(e); }
  }, [files, useWatermark, watermarkText, textOpacity, textSize, useHeader, headerText, headerAlign, useFooter, footerText, footerAlign, usePagination, paginationAlign]);

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

  const executeTrick = async () => {
    if (files.length === 0) return alert("Coda vuota.");

    // --- LOGICA CURIOSITÀ AGGIORNATA ---
    const keys = Object.keys(fileEncyclopedia);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomCuriosity = fileEncyclopedia[randomKey].curiosity;
    
    const promptMessage = `NOME DEL FILE FINALE:\n___________________________________\n\n\n10 SECONDI DI CULTURA\n\n💡 Lo sapevi? (${randomKey})\n"${randomCuriosity}"`;
    const customName = prompt(promptMessage, "Digitrik_Result");
    
    if (!customName) return; 

    setIsProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      const fontBold = await mergedPdf.embedFont(StandardFonts.HelveticaBold);
      const fontNormal = await mergedPdf.embedFont(StandardFonts.Helvetica);
      
      for (const f of files) {
        const arrayBuffer = await f.file.arrayBuffer();
        if (f.file.type === 'application/pdf') {
          const pdf = await PDFDocument.load(arrayBuffer);
          const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
          pages.forEach(p => mergedPdf.addPage(p));
        } else if (f.file.type.startsWith('image/')) {
          const page = mergedPdf.addPage();
          const img = f.file.type === 'image/png' ? await mergedPdf.embedPng(arrayBuffer) : await mergedPdf.embedJpg(arrayBuffer);
          const dims = img.scaleToFit(page.getWidth() - 40, page.getHeight() - 40);
          page.drawImage(img, { x: page.getWidth()/2 - dims.width/2, y: page.getHeight()/2 - dims.height/2, width: dims.width, height: dims.height });
        }
      }

      const pages = mergedPdf.getPages();
      pages.forEach((page, index) => {
        const { width, height } = page.getSize();
        if (useHeader && headerText.trim() !== '') {
          const tWidth = fontBold.widthOfTextAtSize(headerText.toUpperCase(), 9);
          page.drawText(headerText.toUpperCase(), { x: getXPos(headerAlign, tWidth, width), y: height - 40, size: 9, font: fontBold, color: rgb(0.3, 0.3, 0.3) });
        }
        if (usePagination) {
          const pText = `Pag. ${index + 1} / ${pages.length}`;
          const tWidth = fontNormal.widthOfTextAtSize(pText, 9);
          page.drawText(pText, { x: getXPos(paginationAlign, tWidth, width), y: 30, size: 9, font: fontNormal, color: rgb(0.4, 0.4, 0.4) });
        }
      });

      const finalPdfBytes = await mergedPdf.save();
      const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = `${customName}.pdf`; link.click();
    } catch (e) { alert("Errore"); } finally { setIsProcessing(false); }
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

          <DragDropContext onDragEnd={(res) => {
            if (!res.destination) return;
            const items = Array.from(files);
            const [reordered] = items.splice(res.source.index, 1);
            items.splice(res.destination.index, 0, reordered);
            setFiles(items);
          }}>
            <Droppable droppableId="files-list">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                  {files.map((f, i) => (
                    <Draggable key={f.id} draggableId={f.id} index={i}>
                      {(provided) => (
                        <div ref={provided.innerRef} {...provided.draggableProps} className="flex justify-between items-center bg-[#111] p-4 rounded-2xl border border-white/5">
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps} className="text-gray-700"><GripVertical size={20} /></div>
                            <span className="text-blue-600 font-black italic text-sm">{i+1}</span>
                            <FileText size={20} className="text-gray-600" />
                            <p className="text-xs font-bold text-white">{f.file.name}</p>
                          </div>
                          <button onClick={() => setFiles(prev => prev.filter(x => x.id !== f.id))} className="text-gray-700 hover:text-red-500 p-2"><Trash2 size={18}/></button>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {/* ENCICLOPEDIA */}
          <div className="mt-12 p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-8">
            <div className="flex flex-col gap-2">
              <span className="text-blue-500 font-black italic text-[10px] uppercase tracking-[0.4em] ml-1">Database Digitrik</span>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Enciclopedia dei File</h2>
            </div>
            <select onChange={(e) => setSelectedInfo(fileEncyclopedia[e.target.value])} className="w-full bg-[#111] border border-white/10 rounded-2xl p-5 appearance-none font-bold text-gray-300 outline-none cursor-pointer uppercase text-xs tracking-widest italic">
              <option value="">Seleziona un formato...</option>
              {Object.keys(fileEncyclopedia).sort().map(name => (<option key={name} value={name}>{name}</option>))}
            </select>
            {selectedInfo && (
              <div className="bg-blue-600/[0.03] border border-blue-600/20 rounded-[2rem] p-8 animate-in fade-in zoom-in">
                <p className="text-gray-300 text-sm leading-relaxed mb-4 italic">{selectedInfo.desc}</p>
                <div className="flex gap-4 items-start bg-black/60 p-6 rounded-2xl border border-white/5">
                  <Sparkles className="text-blue-500 shrink-0 mt-1" size={20} />
                  <div>
                    <span className="text-[10px] font-black text-blue-500 uppercase italic block mb-1">Curiosità Matrix:</span>
                    <p className="text-xs text-gray-400 italic font-bold leading-relaxed">{selectedInfo.curiosity}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-4 bg-[#0a0a0a] p-8 space-y-6 relative overflow-y-auto max-h-screen">
          <button onClick={executeTrick} disabled={isProcessing} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-800 text-white py-8 rounded-[2rem] font-black italic uppercase tracking-widest text-xl transition-all flex flex-col items-center justify-center gap-2 shadow-2xl">
            {isProcessing ? <RefreshCcw className="animate-spin" size={24} /> : <><Wand2 size={24} /><span>ESEGUI TRICK</span></>}
          </button>
          
          <select value={action} onChange={(e) => setAction(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-[1.5rem] p-5 font-bold italic text-white text-sm outline-none">
            <option value="conversione">'CONVERTI IN .pdf'</option>
            <option value="unisci">'UNIFICA PAGINE'</option>
          </select>

          {/* LAYOUT TOOLS */}
          <div className="bg-[#111] rounded-2xl border border-white/5">
            <button onClick={() => setIsLayoutOpen(!isLayoutOpen)} className="w-full p-5 flex items-center justify-between text-[10px] font-black uppercase text-gray-400 italic">
              <span>Layout & Info</span> {isLayoutOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {isLayoutOpen && (
              <div className="p-5 pt-0 space-y-5 border-t border-white/5 mt-2">
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-gray-400 uppercase">Intestazione</span>
                        <AlignmentPicker current={headerAlign} set={setHeaderAlign} />
                    </div>
                    <input type="text" placeholder="Testo intestazione..." value={headerText} onChange={e => setHeaderText(e.target.value)} className="w-full bg-black border border-white/5 rounded-xl p-3 text-xs text-white outline-none" />
                </div>
                <div className="flex items-center gap-2">
                    <input type="checkbox" checked={usePagination} onChange={e => setUsePagination(e.target.checked)} className="w-4 h-4" />
                    <span className="text-[10px] font-bold text-gray-400 uppercase">Numerazione Pagine</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
