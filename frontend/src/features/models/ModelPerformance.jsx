import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line } from 'recharts';
import { Network, Zap, Settings, ShieldCheck, Cpu, Database, Activity, Target, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function ModelPerformance() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchPerformanceData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/models/performance?t=${Date.now()}`);
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch model performance:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPerformanceData();
    // Refresh every 30 seconds to simulate dynamic training logs
    const interval = setInterval(fetchPerformanceData, 30000);
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-md border p-4 rounded-xl shadow-xl z-50">
          <p className="text-sm font-bold mb-2 uppercase tracking-wider">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm font-medium mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-muted-foreground">{entry.name}</span>
              </div>
              <span className="font-bold">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Model Performance</h1>
          <p className="text-muted-foreground mt-2 text-lg">Live evaluation of deep learning architectures and telemetry metrics.</p>
        </div>
        <button 
          onClick={fetchPerformanceData} 
          disabled={loading}
          className="flex items-center gap-2 bg-primary/10 text-primary hover:bg-primary/20 px-5 py-2.5 rounded-xl font-bold transition-all border border-primary/20 disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Sync Metrics
        </button>
      </div>

      <AnimatePresence mode="wait">
        {loading && !data ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center h-64 w-full">
            <RefreshCw className="animate-spin text-primary w-10 h-10" />
          </motion.div>
        ) : data ? (
          <motion.div key="content" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col gap-8 w-full">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card p-6 rounded-2xl border shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Target size={80} /></div>
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl w-max mb-4 shadow-sm"><ShieldCheck size={24} /></div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Peak Accuracy</p>
                <p className="text-4xl font-black">{data.peak_accuracy}%</p>
                <p className="text-xs text-emerald-500 mt-2 font-medium">EfficientNetB0 Architecture</p>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card p-6 rounded-2xl border shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Zap size={80} /></div>
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl w-max mb-4 shadow-sm"><Zap size={24} /></div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Inference Latency</p>
                <p className="text-4xl font-black">{data.inference_latency_ms}<span className="text-lg">ms</span></p>
                <p className="text-xs text-blue-500 mt-2 font-medium">Baseline CNN Architecture</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card p-6 rounded-2xl border shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Cpu size={80} /></div>
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl w-max mb-4 shadow-sm"><Network size={24} /></div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Active Engine</p>
                <p className="text-3xl font-black mt-1">{data.active_model}</p>
                <p className="text-xs text-purple-500 mt-2 font-medium">Optimal Speed/Accuracy Ratio</p>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card p-6 rounded-2xl border shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Database size={80} /></div>
                <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl w-max mb-4 shadow-sm"><Activity size={24} /></div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Parameters</p>
                <p className="text-4xl font-black">{data.parameters_m}<span className="text-lg">M</span></p>
                <p className="text-xs text-orange-500 mt-2 font-medium">Trainable Weights</p>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="bg-card border rounded-2xl p-6 shadow-lg">
                <h3 className="font-bold text-xl mb-6 flex items-center gap-2 tracking-tight"><Settings className="text-primary"/> Benchmark Comparison</h3>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.model_comparisons} margin={{ top: 20, right: 0, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                      <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} dy={10} fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} dx={-10} fontSize={12} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--accent))'}} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Bar dataKey="accuracy" name="Accuracy (%)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
                      <Bar dataKey="f1" name="F1-Score (%)" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                      <Bar dataKey="inference" name="Inference (ms)" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={30} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} className="bg-card border rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl flex items-center gap-2 tracking-tight"><Activity className="text-purple-500"/> Training Trajectory</h3>
                  <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded-md text-xs font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live
                  </span>
                </div>
                <div className="h-[350px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.training_trajectory} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                      <XAxis dataKey="epoch" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} dy={10} fontSize={12} />
                      <YAxis stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} dx={-10} fontSize={12} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      <Line type="monotone" dataKey="loss" name="Training Loss" stroke="#3b82f6" strokeWidth={3} dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
                      <Line type="monotone" dataKey="val_loss" name="Validation Loss" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6 }} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
