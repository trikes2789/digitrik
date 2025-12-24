import { useState } from 'react';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { compressImage } from '../utils/helpers';

export const usePdfEngine = () => {
  const [isProcessing, setIsProcessing] = useState(false);

  const generatePdf = async (files, config, isPreview = false) => {
    if (files.length === 0) return null;
    setIsProcessing(true);

    try {
      const doc = await PDFDocument.create();

      // 1. Metadata
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

      // 2. File Processing
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

      // 3. Logo Embedding
      let logoImg = null;
      if (config.useLogo && config.logoFile) {
        const logoBuf = await config.logoFile.arrayBuffer();
        logoImg = config.logoFile.type.includes('png') ? await doc.embedPng(logoBuf) : await doc.embedJpg(logoBuf);
      }

      // 4. Overlays
      const pages = doc.getPages();
      pages.forEach((p, idx) => {
        const { width, height } = p.getSize();
        const rotation = config.rotation;
        p.setRotation(degrees(rotation));

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

        if (logoImg && config.useLogo) {
          const dims = logoImg.scaleToFit(config.logoSize, config.logoSize);
          p.drawImage(logoImg, { x: width/2 - dims.width/2, y: height/2 - dims.height/2, width: dims.width, height: dims.height, opacity: config.logoOpacity });
        }
      });

      const pdfBytes = await doc.save();
      setIsProcessing(false);
      return pdfBytes;

    } catch (e) {
      console.error(e);
      setIsProcessing(false);
      return null;
    }
  };

  return { generatePdf, isProcessing };
};