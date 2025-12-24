'use client';

import React, { useCallback, useState, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { 
  FileText, Plus, Trash2, RefreshCcw, Wand2, 
  ImageIcon, Eye, EyeOff, AlignLeft, AlignRight, 
  Sparkles, X, Check, RotateCw, Tag, Activity, ShieldAlert, 
  Feather, Layers, Printer, Ghost, Lock, Settings, LayoutTemplate, 
  Image as IconImage, Shield, FileOutput, UploadCloud, Grid3X3, List
} from 'lucide-react';

// IMPORT SICURI (Percorsi relativi)
import { TRANSLATIONS } from '../constants/translations';
import { SectionTitle, SmartSlider, Toggle, AlignSelector, Toast } from '../components/ui/Components';
import { usePdfEngine } from '../hooks/usePdfEngine';

export default function DigitrikPro() {
  const [lang, setLang] = useState('it');
  const t = TRANSLATIONS[lang];
  const { generatePdf, isProcessing } = usePdfEngine(); 

  const [files, setFiles] = useState([]);
  const [activeTab, setActiveTab] = useState('files'); 
  const [previewUrl, setPreviewUrl] = useState(null);
  const [toast, setToast] = useState(null);

  const [showRenameModal, setShowRenameModal] = useState(false);
  const [tempFilename, setTempFilename] = useState("Digitrik_Result");
  const [trickCuriosity, setTrickCuriosity] = useState({ key: 'PDF', text: '' });
  const [isPreviewOpen, setIsPreviewOpen] = useState(true);

  const [config, setConfig] = useState({
    useHeader: false, headerText: '', headerAlign: 'center',
    useFooter: false, footerText: '', footerAlign: 'center',
    usePagination: false, paginationAlign: 'right', 
    rotation: 0,
    watermarkText: '', textOpacity: 0.25, textSize: 30,
    useWatermark: false, useGrid: false, useSecurity: false,
    useLogo: false, logoFile: null, logoOpacity: 0.15, logoSize: 150,
    ghostMode: false, metaTitle: '', metaAuthor: '',
    compression: 'balanced', action: 'conversione', extractRange: ''
  });

  const [health, setHealth] = useState({ size: 0, status: 'ok', score: 100 });

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, noClick: true });

  const onLogoDrop = useCallback(accepted => {
    if (accepted[0]) {
      setConfig(prev => ({ ...prev, logoFile: accepted[0], useLogo: true }));
      showToast(t.logoLoaded);
    }
  }, [lang]);
  const { getRootProps: getLogoProps, getInputProps: getLogoInput } = useDropzone({ onDrop: onLogoDrop, accept: {'image/*': []}, multiple: false });

  useEffect(() => {
    let timer;
    const updatePreview = async () => {
      const pdfBytes = await generatePdf(files, config, true);
      if (pdfBytes) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        setPreviewUrl(URL.createObjectURL(blob));
      } else {
        setPreviewUrl(null);
      }
    };
    timer = setTimeout(updatePreview, 800);
    return () => clearTimeout(timer);
  }, [files, config, lang]); 

  const handleExportClick = () => {
    if (files.length === 0) {
      showToast(t.noFiles, "error");
      return;
    }
    const keys = Object.keys(t.enc);
    const randomKey = keys[Math.floor(Math.random() * keys.length)];
    if (t.enc[randomKey]) {
      setTrickCuriosity({ key: randomKey, text: t.enc[randomKey].curiosity });
    }
    setTempFilename("Digitrik_Result");
    setShowRenameModal(true);
  };

  const handleConfirmDownload = async () => {
    setShowRenameModal(false);
    const pdfBytes = await generatePdf(files, config, false);
    if (pdfBytes) {
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${tempFilename}.pdf`;
      link.click();
      showToast(t.downloadOk);
    }
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
      
      {/* MODAL */}
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
            {trickCuriosity.text && (
              <div className="bg-blue-900/10 border border-blue-600/10 rounded-2xl p-5 mb-8 flex gap-4">
                <Sparkles className="text-blue-500 shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block">{t.didYouKnow} ({trickCuriosity.key})</span>
                  <p className="text-xs text-gray-300 italic leading-relaxed">{trickCuriosity.text}</p>
                </div>
              </div>
            )}
            <div className="flex gap-3">
              <button onClick={() => setShowRenameModal(false)} className="flex-1 py-4 rounded-xl border border-white/5 hover:bg-white/5 text-gray-400 font-bold text-xs uppercase tracking-widest transition-all">{t.cancel}</button>
              <button onClick={handleConfirmDownload} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-900/20 transition-all flex items-center justify-center gap-2"><Check size={16} /> {t.confirm}</button>
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
          <div {...getRootProps()} className={`relative border-2 border-dashed rounded-[2rem] transition-all duration-300 group ${isDragActive ? 'border-blue-500 bg-blue-500/5 scale-[0.99]' : 'border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/50'}`}>
            <input {...getInputProps()} />
            {files.length === 0 ? (
              <div className="h-64 flex flex-col items-center justify-center text-center p-10 cursor-pointer">
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-2xl"><UploadCloud size={32} className="text-zinc-600 group-hover:text-blue-500 transition-colors" /></div>
                <h3 className="text-lg font-bold text-zinc-300">{t.dropTitle}</h3>
                <p className="text-sm text-zinc-500 mt-2 max-w-xs">{t.dropDesc}</p>
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
                        <div className="border border-dashed border-zinc-800 rounded-xl flex flex-col items-center justify-center p-4 hover:bg-zinc-900/50 transition-colors cursor-pointer text-zinc-600 hover:text-zinc-400"><Plus size={24} /><span className="text-[10px] font-bold mt-2 uppercase">{t.add}</span></div>
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
            disabled={isProcessing || files.length === 0} 
            className="w-full py-4 bg-white text-black hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl font-black text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
          >
            {isProcessing ? (
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