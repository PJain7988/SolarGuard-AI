import React, { useState, useEffect } from 'react';
import { Database, UploadCloud, PieChart as PieChartIcon, FileImage, ShieldCheck, Zap, AlertTriangle, ServerCrash, Folders, Settings2, RefreshCw } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

// Map icon names/classes to Lucide components on the frontend
const ICON_MAP = {
  'Clean / Normal': ShieldCheck,
  'Dust / Dirt': ServerCrash,
  'Crack': Zap,
  'Hotspot': AlertTriangle,
  'Delamination': Folders
};

export default function DatasetManager() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDatasetStats = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:8000/api/datasets/stats?t=${Date.now()}`);
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch dataset stats:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatasetStats();
    const interval = setInterval(fetchDatasetStats, 15000); // Simulate incoming telemetry data periodically
    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-md border p-3 rounded-xl shadow-xl flex items-center gap-3 z-50">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: payload[0].payload.color }}></div>
          <span className="font-bold">{payload[0].payload.name}:</span>
          <span>{payload[0].value.toLocaleString()} images</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Dataset Repository</h1>
          <p className="text-muted-foreground mt-2 text-lg">Manage training data, validate class distributions, and monitor live data ingestion.</p>
        </div>
        <button 
          onClick={fetchDatasetStats}
          disabled={loading}
          className="bg-primary/10 text-primary border border-primary/20 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-primary/20 transition-all disabled:opacity-50"
        >
          <RefreshCw size={20} className={loading ? "animate-spin" : ""} /> Sync Datasets
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
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card p-6 rounded-2xl border shadow-lg relative overflow-hidden md:col-span-1">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Database size={80} /></div>
                <div className="p-3 bg-blue-500/10 text-blue-500 rounded-xl w-max mb-4 shadow-sm"><Database size={24} /></div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Total Volume</p>
                <p className="text-4xl font-black">{data.total_volume.toLocaleString()}</p>
                <p className="text-xs text-blue-500 mt-2 font-medium">High-Res Annotated Images</p>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card p-6 rounded-2xl border shadow-lg relative overflow-hidden md:col-span-1">
                <div className="absolute top-0 right-0 p-4 opacity-5"><FileImage size={80} /></div>
                <div className="p-3 bg-purple-500/10 text-purple-500 rounded-xl w-max mb-4 shadow-sm"><FileImage size={24} /></div>
                <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Defect Classes</p>
                <p className="text-4xl font-black">{data.classes}</p>
                <p className="text-xs text-purple-500 mt-2 font-medium">Distinct Categorizations</p>
              </motion.div>
              
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border rounded-2xl p-6 shadow-lg md:col-span-2 flex flex-col relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Settings2 size={120} /></div>
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <h3 className="font-bold text-xl flex items-center gap-2"><PieChartIcon className="text-primary"/> Class Imbalance Overview</h3>
                  <span className="bg-green-500/10 text-green-500 border border-green-500/20 px-2 py-1 rounded-md text-xs font-bold uppercase flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> Live Ingestion
                  </span>
                </div>
                
                <div className="flex-1 flex flex-col sm:flex-row items-center gap-8 relative z-10">
                  <div className="h-[200px] w-full sm:w-1/2 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={data.distribution}
                          cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={8}
                          isAnimationActive={false}
                        >
                          {data.distribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip content={<CustomTooltip />} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-2xl font-black">{Math.round(data.total_volume / 1000)}K</span>
                    </div>
                  </div>
                  
                  <div className="w-full sm:w-1/2 flex flex-col gap-3 justify-center">
                    {data.distribution.map((entry) => {
                      const IconComponent = ICON_MAP[entry.name] || Database;
                      return (
                        <div key={entry.name} className="flex items-center justify-between text-sm bg-background p-2 rounded-lg border shadow-sm">
                          <div className="flex items-center gap-3">
                            <div className="p-1.5 rounded-md text-white shadow-sm" style={{ backgroundColor: entry.color }}>
                              <IconComponent size={14} strokeWidth={3} />
                            </div>
                            <span className="font-bold">{entry.name}</span>
                          </div>
                          <span className="font-mono font-medium text-muted-foreground">{entry.value.toLocaleString()}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-card border rounded-2xl p-6 shadow-lg">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2 tracking-tight">Data Augmentation Impact</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.distribution} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={true} vertical={false} opacity={0.5} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="hsl(var(--muted-foreground))" tickLine={false} axisLine={false} fontSize={12} width={120} />
                    <RechartsTooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--accent))'}} />
                    <Bar dataKey="value" name="Images" radius={[0, 4, 4, 0]} barSize={24} isAnimationActive={false}>
                      {data.distribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
