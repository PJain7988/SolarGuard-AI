import React, { useState, useEffect } from 'react';
import { FlaskConical, CheckCircle2, XCircle, Clock, RefreshCw, Settings2, PlayCircle, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Experiments() {
  const [experiments, setExperiments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const [newRun, setNewRun] = useState({
    model: 'EfficientNetB0',
    lr: '0.001',
    batch: 32,
    epochs: 50
  });

  const fetchExperiments = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/api/models/experiments?t=${Date.now()}`);
      setExperiments(response.data.experiments);
    } catch (error) {
      console.error("Failed to fetch experiments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiments();
    const interval = setInterval(fetchExperiments, 5000); // Pulse running experiments
    return () => clearInterval(interval);
  }, []);

  const handleStartRun = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post('http://localhost:8000/api/models/experiments', newRun);
      setShowModal(false);
      fetchExperiments();
    } catch (error) {
      console.error("Failed to start run:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 w-max">
            <CheckCircle2 size={14} /> COMPLETED
          </span>
        );
      case 'Failed':
        return (
          <span className="bg-destructive/10 text-destructive border border-destructive/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 w-max">
            <XCircle size={14} /> FAILED
          </span>
        );
      case 'Running':
        return (
          <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide flex items-center gap-1.5 w-max">
            <Loader2 size={14} className="animate-spin" /> RUNNING
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Model Laboratory</h1>
          <p className="text-muted-foreground mt-2 text-lg">Track automated hyperparameter tuning and model training runs in real-time.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transform transition hover:-translate-y-0.5"
        >
          <PlayCircle size={20} /> Initialize New Run
        </button>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-xl relative">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none"><FlaskConical size={200} /></div>
        
        <div className="p-6 border-b bg-muted/20 flex items-center justify-between">
          <h3 className="font-bold text-xl flex items-center gap-2 relative z-10"><Settings2 className="text-primary"/> Experiment Queue</h3>
          {loading && <RefreshCw className="animate-spin text-muted-foreground" size={18} />}
        </div>
        
        <div className="overflow-x-auto relative z-10">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-accent/30 text-muted-foreground border-b text-xs uppercase tracking-wider font-bold">
                <th className="px-6 py-4">Run ID</th>
                <th className="px-6 py-4">Architecture</th>
                <th className="px-6 py-4">Hyperparameters</th>
                <th className="px-6 py-4">Status & Progress</th>
                <th className="px-6 py-4">Validation Acc</th>
                <th className="px-6 py-4">Wall Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              <AnimatePresence>
                {experiments.map((exp, idx) => (
                  <motion.tr 
                    key={exp.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(idx * 0.05, 0.5) }}
                    className="hover:bg-accent/40 transition-colors group"
                  >
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg shadow-sm ${exp.status === 'Running' ? 'bg-blue-500/10 text-blue-500' : 'bg-primary/10 text-primary'}`}>
                          <FlaskConical size={18} />
                        </div>
                        <span className="font-mono font-bold">{exp.id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className="font-bold">{exp.model}</span>
                    </td>
                    <td className="px-6 py-5 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="bg-background border px-2 py-1 rounded shadow-sm font-mono text-muted-foreground">LR: {exp.lr}</span>
                        <span className="bg-background border px-2 py-1 rounded shadow-sm font-mono text-muted-foreground">B: {exp.batch}</span>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-col gap-2">
                        {getStatusBadge(exp.status)}
                        <div className="flex items-center gap-2">
                          <div className="w-32 h-1.5 bg-background border rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${exp.progress}%` }}
                              transition={{ duration: 0.5 }}
                              className={`h-full ${exp.status === 'Failed' ? 'bg-destructive' : exp.status === 'Running' ? 'bg-blue-500 animate-pulse' : 'bg-emerald-500'}`}
                            />
                          </div>
                          <span className="text-xs font-mono font-bold text-muted-foreground">{exp.progress}%</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span className={`font-bold ${exp.status === 'Completed' ? 'text-emerald-500' : 'text-muted-foreground'}`}>{exp.acc}</span>
                    </td>
                    <td className="px-6 py-5 text-sm font-mono text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock size={14} /> {exp.duration}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card border rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b bg-muted/30 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Settings2 size={100} /></div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Configure Execution</h3>
                  <p className="text-sm text-muted-foreground mt-1">Spin up a new neural network training run.</p>
                </div>
                <button onClick={() => setShowModal(false)} className="p-2 rounded-full hover:bg-background transition-colors border shadow-sm relative z-10">
                  <X size={20} />
                </button>
              </div>
              
              <form onSubmit={handleStartRun} className="p-6 flex flex-col gap-5 relative z-10">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Architecture</label>
                  <select 
                    value={newRun.model}
                    onChange={e => setNewRun({...newRun, model: e.target.value})}
                    className="w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium"
                  >
                    <option className="bg-background text-foreground" value="EfficientNetB0">EfficientNetB0</option>
                    <option className="bg-background text-foreground" value="MobileNetV2">MobileNetV2</option>
                    <option className="bg-background text-foreground" value="ResNet50">ResNet50</option>
                    <option className="bg-background text-foreground" value="Custom CNN">Custom CNN</option>
                  </select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Learning Rate</label>
                  <select 
                    value={newRun.lr}
                    onChange={e => setNewRun({...newRun, lr: e.target.value})}
                    className="w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium"
                  >
                    <option className="bg-background text-foreground" value="0.01">0.01 (Aggressive)</option>
                    <option className="bg-background text-foreground" value="0.005">0.005</option>
                    <option className="bg-background text-foreground" value="0.001">0.001 (Standard)</option>
                    <option className="bg-background text-foreground" value="0.0005">0.0005 (Conservative)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Batch Size</label>
                    <input 
                      type="number" 
                      value={newRun.batch}
                      onChange={e => setNewRun({...newRun, batch: parseInt(e.target.value)})}
                      className="w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium"
                      min="1" max="256"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Epochs</label>
                    <input 
                      type="number" 
                      value={newRun.epochs}
                      onChange={e => setNewRun({...newRun, epochs: parseInt(e.target.value)})}
                      className="w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium"
                      min="1" max="1000"
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-primary text-primary-foreground py-4 rounded-xl font-bold mt-4 flex items-center justify-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transform transition hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-wait"
                >
                  {submitting ? <Loader2 className="animate-spin" size={20} /> : <PlayCircle size={20} />}
                  {submitting ? "Initializing Sequence..." : "Execute Run"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
