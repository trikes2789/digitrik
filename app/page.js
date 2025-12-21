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

// --- DATABASE ENCICLOPEDIA COMPLETO ---
const fileEncyclopedia = {
  "AI (Adobe Illustrator)": {
    desc: "Il formato AI è un tipo di file vettoriale proprietario sviluppato da Adobe. A differenza delle immagini composte da pixel, i file AI si basano su percorsi matematici definiti da punti. Questo permette di ridimensionare il contenuto all'infinito senza alcuna perdita di qualità, rendendolo lo standard per la creazione di loghi professionali che devono essere stampati su superfici di ogni dimensione.",
    curiosity: "Sapevi che internamente un file AI è basato su una versione semplificata del formato PDF? Infatti, se salvato correttamente, puoi spesso visualizzarne l'anteprima anche senza avere Illustrator installato.",
    type: "Immagine Vettoriale"
  },
  "BMP (Bitmap Image)": {
    desc: "Il Bitmap (BMP) è uno dei formati grafici più puri e datati. A differenza dei formati compressi, il BMP memorizza i dati dei pixel in modo diretto e non compresso, garantendo una fedeltà assoluta ma generando file dalle dimensioni mastodontiche. È il linguaggio nativo di Windows per la grafica semplice sin dagli albori del sistema operativo.",
    curiosity: "Negli anni '90, i file BMP erano l'incubo dei floppy disk: una sola immagine ad alta risoluzione poteva occupare più spazio di un intero pacchetto software a causa della totale assenza di compressione.",
    type: "Immagine Raster"
  },
  "CSV (Comma Separated Values)": {
    desc: "Il CSV è il ponte universale dei dati. Si tratta di un file di puro testo dove ogni riga rappresenta un record e i dati sono separati da una virgola. È il formato preferito dai data scientist perché permette di spostare database enormi tra software diversi come Excel, database SQL e sistemi di analisi complessi in modo ultra-veloce.",
    curiosity: "Nonostante sembri un formato moderno, le sue origini risalgono al 1972, ben prima della nascita dei PC IBM, rendendolo uno dei formati più longevi e resistenti della storia dell'informatica.",
    type: "Documento Dati"
  },
  "DOC / DOCX (Microsoft Word)": {
    desc: "Il DOCX è l'evoluzione del vecchio formato DOC, introdotto nel 2007. La 'X' finale sta per XML, indicando che il file è in realtà un archivio compresso di file testuali e grafici strutturati. Questo approccio rende i documenti più leggeri, meno soggetti a corruzione dei dati e più facili da aprire per software di terze parti.",
    curiosity: "Se provi a rinominare un file .docx cambiando l'estensione in .zip, potrai aprirlo come una normale cartella e navigare tra le immagini e il testo XML contenuti al suo interno.",
    type: "Documento di Testo"
  },
  "EPS (Encapsulated PostScript)": {
    desc: "L'EPS è il pilastro dell'industria della stampa professionale. È un formato vettoriale che contiene istruzioni matematiche per descrivere immagini e testi, garantendo una precisione millimetrica nelle macchine tipografiche ad alta definizione. È stato per decenni lo standard per l'invio di grafica pronta per la stampa.",
    curiosity: "Sebbene sia un formato vettoriale, un file EPS può contenere al suo interno anche un'anteprima in bassa risoluzione per permettere ai vecchi computer di visualizzarlo senza dover processare complessi calcoli matematici.",
    type: "Vettoriale Professionale"
  },
  "EPUB (Electronic Publication)": {
    desc: "L'EPUB è lo standard aperto per gli eBook. La sua caratteristica principale è il layout 'refluibile': il testo si adatta automaticamente allo schermo del dispositivo, permettendo di cambiare font e dimensioni senza rompere l'impaginazione. È il formato più diffuso al mondo per la lettura digitale su e-reader.",
    curiosity: "Un file EPUB è tecnicamente un piccolo sito web compresso; dentro ci sono file HTML, CSS e immagini che il tuo lettore interpreta esattamente come farebbe un browser internet offline.",
    type: "Libro Digitale"
  },
  "GIF (Graphics Interchange Format)": {
    desc: "Il GIF è una reliquia degli albori del web che non accenna a sparire. Supporta un massimo di 256 colori e la trasparenza binaria. La sua fama mondiale è dovuta alla capacità di memorizzare brevi sequenze animate in loop continuo senza la necessità di un lettore video dedicato.",
    curiosity: "L'inventore del formato, Steve Wilhite, ha dichiarato ufficialmente che la pronuncia corretta è 'Jif' (come il burro d'arachidi), scatenando una guerra linguistica su internet che dura da oltre 30 anni.",
    type: "Immagine Animata"
  },
  "HEIC (High Efficiency Image)": {
    desc: "Adottato da Apple per risolvere il problema dello spazio su iPhone, l'HEIC usa una compressione molto avanzata. Permette di mantenere una fedeltà cromatica a 16 bit in file che occupano la metà dello spazio di un JPG. È ideale per la fotografia mobile dove la qualità dei sensori supera i vecchi formati.",
    curiosity: "HEIC non è solo un'immagine, ma un 'contenitore'. Può memorizzare interere sequenze di foto, motivo per cui viene usato per le 'Live Photos' che si animano quando le tocchi sullo schermo dello smartphone.",
    type: "Immagine Moderna"
  },
  "JPG / JPEG (Joint Photographic)": {
    desc: "Il JPG è il formato fotografico più usato al mondo. Utilizza una compressione 'lossy', scartando le informazioni visive che l'occhio umano fatica a percepire per ridurre il peso del file. È il compromesso perfetto tra qualità visiva e spazio occupato, standard per web e social media.",
    curiosity: "Ogni volta che salvi e risalvi un file JPG, l'algoritmo ricomprime l'immagine causando una perdita progressiva di dettaglio. È un fenomeno noto come 'marciume digitale' o generazione degradata.",
    type: "Immagine Standard"
  },
  "ODT (OpenDocument Text)": {
    desc: "L'ODT è l'alternativa libera e open-source ai formati proprietari. È nato per garantire che i documenti creati oggi siano leggibili tra 100 anni, indipendentemente dal software utilizzato. È uno standard ISO che protegge i dati dal controllo di singole aziende private.",
    curiosity: "Il formato ODT è obbligatorio in molti governi europei per legge, al fine di evitare che la pubblica amministrazione sia vincolata all'acquisto perpetuo di licenze software specifiche.",
    type: "Documento Libero"
  },
  "PDF (Portable Document Format)": {
    desc: "Creato da Adobe nel 1993, il PDF nasce per apparire identico su qualsiasi dispositivo. Incapsula testi, immagini e grafica vettoriale in un layout fisso. È diventato lo standard mondiale per la pubblica amministrazione e i contratti legali grazie alla sua natura non modificabile accidentalmente.",
    curiosity: "Nei primi anni '90, il software per visualizzare i PDF costava 50 dollari. Solo quando Adobe decise di rendere Acrobat Reader gratuito, il PDF sconfisse i formati concorrenti diventando lo standard mondiale.",
    type: "Documento Universale"
  },
  "PNG (Portable Network Graphics)": {
    desc: "Il PNG è nato per migliorare il formato GIF nel trasferimento di immagini sul web. Il suo punto di forza è la compressione senza perdita di qualità e il supporto alla trasparenza alfa, che permette bordi sfumati perfetti su qualsiasi sfondo. È essenziale per loghi web e icone di sistema.",
    curiosity: "Il formato PNG è stato creato d'urgenza nel 1995 perché il formato GIF utilizzava un algoritmo coperto da brevetto, e i proprietari iniziarono a chiedere royalty a chiunque lo usasse online.",
    type: "Immagine Trasparente"
  },
  "PPT / PPTX (PowerPoint)": {
    desc: "Il formato PPTX è lo standard per le presentazioni multimediali. Basato su architettura XML, organizza slide, animazioni e grafici. È progettato per gestire flussi di lavoro collaborativi e complessi contenuti visivi, permettendo l'integrazione di video e audio in un unico pacchetto.",
    curiosity: "Prima che diventasse un gigante, il programma si chiamava 'Presenter'. Microsoft lo acquistò nel 1987 per soli 14 milioni di dollari, uno degli affari più redditizi della storia del software mondiale.",
    type: "Presentazione"
  },
  "PSD (Adobe Photoshop)": {
    desc: "Il PSD è il formato di lavoro preferito dai designer. La sua magia risiede nella gestione dei livelli (layers), che permette di modificare ogni singolo elemento dell'immagine separatamente. Supporta maschere, canali alfa e oggetti avanzati con una profondità di bit elevatissima per il fotoritocco.",
    curiosity: "Un singolo file PSD può superare i 2 Gigabyte. Per file ancora più grandi, esiste il formato PSB (Photoshop Big), capace di supportare immagini fino a 300.000 pixel per lato.",
    type: "Progetto Grafico"
  },
  "RAW (Digital Negative)": {
    desc: "Il formato RAW è il negativo digitale della fotografia professionale. Contiene tutti i dati non elaborati catturati dal sensore della fotocamera. Non è un'immagine 'finita', ma un insieme di istruzioni che devono essere sviluppate via software per ottenere il massimo della gamma dinamica.",
    curiosity: "Poiché i dati RAW non vengono elaborati dalla fotocamera, puoi cambiare il bilanciamento del bianco di una foto dopo averla scattata senza perdere qualità, come se tornassi indietro nel tempo al momento dello scatto.",
    type: "Dati Sensore"
  },
  "RTF (Rich Text Format)": {
    desc: "L'RTF è stato creato da Microsoft nel 1987 come formato universale. Offre formattazione base (grassetto, font, tabelle) ma rimane leggibile da quasi ogni editor di testo esistente. È molto più leggero e sicuro di un documento Word moderno, ideale per lo scambio rapido di testi formattati.",
    curiosity: "Nonostante l'età, l'RTF è considerato estremamente sicuro perché non può contenere macro o virus eseguibili, rendendolo un formato preferito in ambienti dove la sicurezza informatica è prioritaria.",
    type: "Testo Formattato"
  },
  "SVG (Scalable Vector Graphics)": {
    desc: "L'SVG è il linguaggio vettoriale del web moderno. A differenza di altri formati, l'SVG è scritto in codice XML. Questo significa che l'immagine può essere letta dai motori di ricerca e animata con codice. Rimane perfettamente nitido su schermi 4K indipendentemente da quanto lo si ingrandisca.",
    curiosity: "Poiché è tecnicamente 'testo', puoi aprire un file SVG con il Blocco Note, cambiare un colore scrivendo il codice a mano, e l'immagine cambierà istantaneamente quando la riaprirai nel browser.",
    type: "Immagine Web Vettoriale"
  },
  "TIFF (Tagged Image File)": {
    desc: "Il TIFF è il cavallo di battaglia dell'industria della stampa e dell'archiviazione digitale. Supporta la compressione senza perdita e spazi colore complessi. È il formato scelto dai musei per scansionare opere d'arte che devono essere preservate in altissima qualità per l'eternità.",
    curiosity: "Un file TIFF può contenere più pagine al suo interno. Questa funzione veniva usata massicciamente dai vecchi fax digitali per inviare documenti di più fogli in un unico invio telefonico.",
    type: "Archiviazione Qualità"
  },
  "TXT (Plain Text)": {
    desc: "Il TXT è la base atomica dell'informatica. Non contiene formattazione, né stili, né immagini: solo caratteri puri. È il formato più leggero e duraturo mai creato, leggibile da qualsiasi dispositivo, dal più moderno smartphone al computer di una vecchia sonda spaziale.",
    curiosity: "Tutto il codice sorgente di internet e delle app che usi ogni giorno è scritto originariamente in semplici file .txt prima di essere 'tradotto' dai processori in software funzionante.",
    type: "Testo Puro"
  },
  "WEBP (Google Web Picture)": {
    desc: "Sviluppato da Google, il WebP è il formato definitivo per la velocità dei siti web. Combina il meglio di JPG e PNG, ma con file che sono mediamente il 30% più leggeri. Supporta trasparenza e animazioni, puntando a sostituire tutti i vecchi formati grafici della rete.",
    curiosity: "Anche se sembra un formato nuovo, WebP si basa sulla tecnologia di compressione video VP8. In pratica, un'immagine WebP è come un singolo fotogramma di un video ad alta definizione ottimizzato.",
    type: "Immagine Web"
  },
  "XLS / XLSX (Microsoft Excel)": {
    desc: "L'XLSX è il re dei fogli di calcolo. È in grado di gestire milioni di righe di calcoli, tabelle pivot e macro complesse. La sua struttura XML lo rende robusto e capace di integrarsi con sistemi esterni di contabilità e analisi finanziaria professionale in tempo reale.",
    curiosity: "Fino alla versione 2003, Excel aveva un limite di 65.536 righe. Con il passaggio al formato .xlsx, il limite è esploso a oltre 1 milione di righe per ogni singolo foglio di lavoro.",
    type: "Foglio di Calcolo"
  }
};

export default function DigitrikWorkstation() {
  const [files, setFiles] = useState([]);
  const [action, setAction] = useState('conversione'); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // --- STATO ENCICLOPEDIA ---
  const [selectedInfo, setSelectedInfo] = useState(null);

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

    // --- LOGICA CURIOSITÀ CASUALE ---
    const keys = Object.keys(fileEncyclopedia);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    const randomCuriosity = fileEncyclopedia[randomKey].curiosity;
    
    const promptMessage = `💡 LO SAPEVI? (${randomKey})\n"${randomCuriosity}"\n\n---\nCome vuoi battezzare il file finale?`;
    const customName = prompt(promptMessage, "Digitrik_Result");
    
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

          {/* --- ENCICLOPEDIA DEI FILE --- */}
          <div className="mt-12 p-10 bg-[#0a0a0a] border border-white/5 rounded-[3rem] space-y-8">
            <div className="flex flex-col gap-2">
              <span className="text-blue-500 font-black italic text-[10px] uppercase tracking-[0.4em] ml-1">Database Digitrik</span>
              <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter">Enciclopedia dei File</h2>
            </div>

            <div className="relative">
              <select 
                onChange={(e) => setSelectedInfo(fileEncyclopedia[e.target.value])}
                className="w-full bg-[#111] border border-white/10 rounded-2xl p-5 appearance-none font-bold text-gray-300 focus:border-blue-600 outline-none cursor-pointer uppercase text-xs tracking-widest italic"
              >
                <option value="">Seleziona un formato per la consultazione...</option>
                {Object.keys(fileEncyclopedia).sort().map(name => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-blue-600 pointer-events-none" size={20} />
            </div>

            {selectedInfo && (
              <div className="bg-blue-600/[0.03] border border-blue-600/20 rounded-[2rem] p-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-blue-600 text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest italic">Info di Sistema</span>
                  <div className="flex items-center gap-2 text-[9px] text-gray-500 font-black uppercase tracking-widest">
                    <RefreshCcw size={12} className="text-blue-500" /> Tempo di lettura stimato: 25s
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-2">Protocollo: {selectedInfo.type}</span>
                    <p className="text-gray-300 text-sm leading-relaxed font-medium italic">
                      {selectedInfo.desc}
                    </p>
                  </div>
                  
                  <div className="flex gap-4 items-start bg-black/60 p-6 rounded-2xl border border-white/5 shadow-inner">
                    <Sparkles className="text-blue-500 shrink-0 mt-1" size={20} />
                    <div>
                      <span className="text-[10px] font-black text-blue-500 uppercase italic block mb-1">Curiosità Matrix:</span>
                      <p className="text-xs text-gray-400 italic font-bold leading-relaxed">{selectedInfo.curiosity}</p>
                    </div>
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
