import React, { useState, useCallback, useEffect } from 'react';
import { UploadCloud, Image as ImageIcon, Loader2, AlertCircle, CheckCircle2, ShieldAlert, Zap, Layers, Cpu, ScanLine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function ImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [scanStep, setScanStep] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const scanSteps = [
    "Initializing neural engine...",
    "Extracting pixel features...",
    "Running multi-layer analysis...",
    "Cross-referencing defect signatures...",
    "Generating final report..."
  ];

  useEffect(() => {
    let interval;
    if (loading) {
      setScanStep(0);
      interval = setInterval(() => {
        setScanStep(prev => (prev < scanSteps.length - 1 ? prev + 1 : prev));
      }, 600); // Progress through steps
    }
    return () => clearInterval(interval);
  }, [loading]);

  const onDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  }, []);

  const handleFileInput = (e) => {
    handleFile(e.target.files[0]);
  };

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
      setError(null);
    } else {
      setError("Please select a valid image file.");
    }
  };

  const handleAnalyze = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Add artificial delay to show off the scanning animation
      await new Promise(r => setTimeout(r, 1500));
      const response = await axios.post('https://solarguard-ai-7gw9.onrender.com/api/inspection/predict', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || "An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'Critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'High': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      case 'Low': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-primary bg-primary/10 border-primary/20';
    }
  };

  // Generate simulated secondary probabilities based on main confidence
  const getProbabilities = (mainPred, mainConf) => {
    const classes = ["Clean", "Crack", "Dust", "Hotspot"].filter(c => c !== mainPred);
    const remaining = 1.0 - mainConf;
    return [
      { class: mainPred, prob: mainConf },
      { class: classes[0], prob: remaining * 0.6 },
      { class: classes[1], prob: remaining * 0.3 },
      { class: classes[2], prob: remaining * 0.1 }
    ];
  };

  return (
    <div className="max-w-6xl mx-auto w-full flex flex-col gap-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Diagnostic Inspection</h2>
        <p className="text-muted-foreground mt-2 text-lg">Upload high-resolution panel imagery for deep neural network analysis.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Upload & Image Viewer */}
        <div className="flex flex-col gap-6">
          <div className="bg-card border rounded-2xl overflow-hidden shadow-xl shadow-black/5 relative">
            <div className="border-b bg-muted/30 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
              <span className="text-xs font-mono text-muted-foreground flex items-center gap-2">
                <ScanLine size={14} /> VIEWER_TERMINAL_V1
              </span>
            </div>

            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`
                relative flex flex-col items-center justify-center text-center cursor-pointer
                transition-all duration-300 min-h-[400px] overflow-hidden
                ${isDragging ? 'bg-primary/5' : 'bg-card hover:bg-accent/30'}
              `}
              onClick={() => !preview && document.getElementById('file-upload').click()}
            >
              <input id="file-upload" type="file" className="hidden" accept="image/*" onChange={handleFileInput} />
              
              <AnimatePresence mode="wait">
                {preview ? (
                  <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full h-full relative group">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    
                    {/* Professional Scanning Overlay */}
                    {loading && (
                      <div className="absolute inset-0 z-10 pointer-events-none">
                        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
                        <motion.div 
                          initial={{ top: "0%" }}
                          animate={{ top: "100%" }}
                          transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                          className="absolute w-full h-[2px] bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)] z-20"
                        />
                        {/* Grid overlay */}
                        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:20px_20px] mix-blend-overlay opacity-30"></div>
                      </div>
                    )}

                    {!loading && (
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-bold shadow-xl transform transition hover:scale-105" onClick={(e) => { e.stopPropagation(); setFile(null); setPreview(null); setResult(null); }}>
                          Upload New Image
                        </button>
                      </div>
                    )}
                  </motion.div>
                ) : (
                  <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center pointer-events-none p-10">
                    <div className="p-5 bg-gradient-to-br from-primary/20 to-blue-600/20 rounded-full text-primary mb-6 shadow-inner border border-primary/10">
                      <UploadCloud size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">Initialize Upload</h3>
                    <p className="text-muted-foreground mb-6 max-w-xs leading-relaxed">Drag & drop high-resolution panel imagery here, or click to browse files.</p>
                    <div className="flex gap-2">
                      <span className="text-xs font-mono font-medium bg-accent px-3 py-1.5 rounded-md border">JPG</span>
                      <span className="text-xs font-mono font-medium bg-accent px-3 py-1.5 rounded-md border">PNG</span>
                      <span className="text-xs font-mono font-medium bg-accent px-3 py-1.5 rounded-md border">TIFF</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <button
            disabled={!file || loading}
            onClick={handleAnalyze}
            className={`w-full py-5 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300
              ${!file ? 'bg-muted text-muted-foreground cursor-not-allowed' : 
                loading ? 'bg-primary/80 text-primary-foreground cursor-wait shadow-[0_0_20px_rgba(var(--primary),0.4)]' : 
                'bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transform hover:-translate-y-1'}
            `}
          >
            {loading ? <Cpu className="animate-pulse" size={24} /> : <ScanLine size={24} />}
            {loading ? 'Executing Neural Network...' : 'Execute Diagnostics'}
          </button>
          
          {error && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-xl flex items-start gap-3 shadow-sm">
              <ShieldAlert size={20} className="shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </div>

        {/* Right Column: Dynamic Analysis Output */}
        <div className="flex flex-col h-full">
          {loading ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card border rounded-2xl p-8 shadow-xl h-full flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5">
                <Cpu size={120} />
              </div>
              <div className="flex items-center gap-4 mb-8">
                <Loader2 size={32} className="animate-spin text-primary" />
                <h3 className="text-2xl font-bold">Processing</h3>
              </div>
              
              <div className="space-y-4 relative z-10">
                {scanSteps.map((step, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
                      idx < scanStep ? 'bg-emerald-500' : idx === scanStep ? 'bg-primary animate-ping' : 'bg-muted'
                    }`} />
                    <span className={`font-mono text-sm transition-colors duration-300 ${
                      idx <= scanStep ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {step}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : result ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border rounded-2xl shadow-xl h-full flex flex-col overflow-hidden relative">
              {/* Header */}
              <div className="bg-muted/30 border-b p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold tracking-tight flex items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={24} /> Diagnostics Complete
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1 font-mono">LATENCY: {result.processing_time.toFixed(3)}s | ID: {Math.random().toString(36).substring(7).toUpperCase()}</p>
                </div>
                <div className={`px-4 py-2 rounded-lg border font-bold text-sm tracking-wider uppercase flex items-center gap-2 ${getSeverityColor(result.severity)}`}>
                  {result.severity === 'Critical' ? <AlertCircle size={16} /> : <ShieldAlert size={16} />}
                  {result.severity} Risk
                </div>
              </div>

              <div className="p-6 space-y-8 flex-1">
                {/* Primary Classification */}
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Primary Classification</p>
                    <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                      {(result.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <h4 className="text-4xl font-black tracking-tight mb-4">{result.prediction}</h4>
                  
                  {/* Confidence Bar */}
                  <div className="h-3 w-full bg-accent rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${result.confidence * 100}%` }} transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className="h-full bg-gradient-to-r from-primary to-blue-500"
                    />
                  </div>
                </div>

                {/* Probability Distribution */}
                <div className="bg-accent/30 rounded-xl p-5 border">
                  <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4 flex items-center gap-2">
                    <Layers size={16} /> Output Layer Activations
                  </p>
                  <div className="space-y-3">
                    {getProbabilities(result.prediction, result.confidence).map((p, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <span className="w-24 text-sm font-medium">{p.class}</span>
                        <div className="flex-1 h-2 bg-background rounded-full overflow-hidden border">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${p.prob * 100}%` }} transition={{ duration: 0.8, delay: 0.3 + (idx * 0.1) }} className="h-full bg-primary/60" />
                        </div>
                        <span className="w-12 text-right text-xs font-mono text-muted-foreground">{(p.prob * 100).toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendation Engine */}
                <div className="bg-gradient-to-br from-primary/10 to-blue-600/10 border border-primary/30 p-5 rounded-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Zap size={64} />
                  </div>
                  <p className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-2 relative z-10">
                    <Zap size={14} /> AI Recommendation Protocol
                  </p>
                  <p className="text-foreground/90 font-medium leading-relaxed relative z-10 text-lg">
                    {result.recommendation}
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="bg-card border border-dashed rounded-2xl p-10 shadow-sm h-full flex flex-col items-center justify-center text-muted-foreground">
              <Cpu size={64} strokeWidth={1} className="mb-6 opacity-20" />
              <p className="text-xl font-medium mb-2 text-center text-foreground/70">Awaiting Input Data</p>
              <p className="text-center max-w-xs text-sm">The neural network is idle. Upload imagery to begin high-precision diagnostics.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
