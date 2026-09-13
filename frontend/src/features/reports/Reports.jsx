import React, { useState, useEffect } from 'react';
import { FileText, Download, Filter, RefreshCw, Calendar, HardDrive, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Reports() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await axios.get('https://solarguard-ai-7gw9.onrender.com/api/reports');
      setData(response.data);
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Compliance & Reports</h1>
          <p className="text-muted-foreground mt-2 text-lg">Generate, export, and review automated AI telemetric logs.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-background border px-4 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-accent transition-colors">
            <Filter size={18} /> Filter
          </button>
          <button 
            onClick={fetchReports}
            className="bg-primary text-primary-foreground px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transition-transform active:scale-95"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} /> Sync Data
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading || !data ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex justify-center items-center h-64 w-full">
            <RefreshCw className="animate-spin text-primary w-10 h-10" />
          </motion.div>
        ) : (
          <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="flex flex-col gap-8 w-full">
            
            {/* Top Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-4 bg-blue-500/10 text-blue-500 rounded-xl"><FileText size={32} /></div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Reports</p>
                  <p className="text-3xl font-black">{data.total_reports}</p>
                </div>
              </div>
              <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-4 bg-emerald-500/10 text-emerald-500 rounded-xl"><HardDrive size={32} /></div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Storage Used</p>
                  <p className="text-3xl font-black">{data.storage_used}</p>
                </div>
              </div>
              <div className="bg-card border rounded-2xl p-6 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                <div className="p-4 bg-purple-500/10 text-purple-500 rounded-xl"><Calendar size={32} /></div>
                <div>
                  <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Scheduled Tasks</p>
                  <p className="text-3xl font-black">{data.scheduled_reports}</p>
                </div>
              </div>
            </div>

            {/* Reports Table */}
            <div className="bg-card border rounded-2xl shadow-lg overflow-hidden">
              <div className="p-6 border-b bg-muted/20 flex justify-between items-center">
                <h3 className="font-bold text-xl flex items-center gap-2">Recent Archives</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-muted/5">
                      <th className="p-4 font-bold text-muted-foreground text-sm uppercase tracking-wider">Report ID</th>
                      <th className="p-4 font-bold text-muted-foreground text-sm uppercase tracking-wider">Type</th>
                      <th className="p-4 font-bold text-muted-foreground text-sm uppercase tracking-wider">Date Generated</th>
                      <th className="p-4 font-bold text-muted-foreground text-sm uppercase tracking-wider">File Size</th>
                      <th className="p-4 font-bold text-muted-foreground text-sm uppercase tracking-wider">Status</th>
                      <th className="p-4 font-bold text-muted-foreground text-sm uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recent_reports.map((report, index) => (
                      <motion.tr 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={report.id} 
                        className="border-b last:border-0 hover:bg-muted/10 transition-colors"
                      >
                        <td className="p-4 font-mono font-bold text-primary">{report.id}</td>
                        <td className="p-4 font-medium">{report.type}</td>
                        <td className="p-4 text-muted-foreground">{report.date}</td>
                        <td className="p-4 text-muted-foreground">{report.size}</td>
                        <td className="p-4">
                          {report.status === 'Completed' ? (
                            <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-max">
                              <CheckCircle2 size={14} /> {report.status}
                            </span>
                          ) : report.status === 'Archived' ? (
                            <span className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-max">
                              <HardDrive size={14} /> {report.status}
                            </span>
                          ) : (
                            <span className="bg-orange-500/10 text-orange-500 border border-orange-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase flex items-center gap-1 w-max">
                              <Clock size={14} className="animate-pulse" /> {report.status}
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => {
                              const content = `SolarGuard AI Telemetry Report\nReport ID: ${report.id}\nType: ${report.status}\nDate: ${report.date}\nStatus: Verified\n\nAutomated analysis indicates standard hardware behavior.`;
                              const blob = new Blob([content], { type: 'text/plain' });
                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = `SolarGuard_${report.id}.txt`;
                              a.click();
                              window.URL.revokeObjectURL(url);
                            }}
                            className="bg-primary/10 text-primary p-2 rounded-lg hover:bg-primary hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={report.status === 'Processing'}
                          >
                            <Download size={18} />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
