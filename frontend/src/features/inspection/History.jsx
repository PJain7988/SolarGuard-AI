import React, { useState, useEffect } from 'react';
import { Search, Filter, Calendar, ChevronRight, AlertTriangle, ShieldCheck, Zap, ServerCrash, Eye, ArrowUpDown, X, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function History() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [sortOrder, setSortOrder] = useState('newest'); // newest, oldest
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch(`http://localhost:8000/api/inspection/history?t=${Date.now()}`);
        const data = await response.json();
        if (Array.isArray(data)) {
          setHistory(data);
        }
      } catch (error) {
        console.error("Error fetching inspection history:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchHistory();
  }, []);

  // Compute filtered and sorted history
  const processedHistory = history
    .filter(item => {
      // 1. Filter by Search
      const matchesSearch = 
        (item._id && item._id.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (item.prediction && item.prediction.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.severity && item.severity.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // 2. Filter by Type Dropdown
      const matchesType = filterType === 'All' || item.prediction === filterType;
      
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      // 3. Sort by Date
      const dateA = new Date(a.timestamp).getTime();
      const dateB = new Date(b.timestamp).getTime();
      return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
    });

  const getDefectIcon = (prediction) => {
    switch (prediction) {
      case 'Clean': return <ShieldCheck size={16} className="text-emerald-500" />;
      case 'Crack': return <Zap size={16} className="text-red-500" />;
      case 'Hotspot': return <AlertTriangle size={16} className="text-orange-500" />;
      case 'Dust': return <ServerCrash size={16} className="text-yellow-500" />;
      default: return <AlertTriangle size={16} className="text-primary" />;
    }
  };

  const getSeverityBadge = (severity) => {
    let classes = "";
    if (severity === 'Critical') classes = 'bg-red-500/10 text-red-500 border-red-500/20';
    else if (severity === 'High') classes = 'bg-orange-500/10 text-orange-500 border-orange-500/20';
    else if (severity === 'Medium') classes = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
    else classes = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
    
    return <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase border ${classes}`}>{severity}</span>;
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-7xl mx-auto relative">
      <div>
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Inspection History</h1>
        <p className="text-muted-foreground mt-2 text-lg">Review past neural network analyses and track defect progression over time.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-card p-5 rounded-2xl border shadow-lg relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-blue-500 to-indigo-500"></div>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
          <input 
            type="text" 
            placeholder="Search ID, defect, severity..." 
            className="w-full pl-10 pr-4 py-2.5 bg-background border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <div className="relative flex items-center bg-background border rounded-xl px-2 shadow-inner h-11">
            <Filter size={16} className="text-muted-foreground ml-2" />
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none focus:outline-none text-sm font-medium py-2 pl-2 pr-6 appearance-none cursor-pointer"
            >
              <option value="All" className="bg-background text-foreground">All Defects</option>
              <option value="Clean" className="bg-background text-foreground">Clean</option>
              <option value="Crack" className="bg-background text-foreground">Crack</option>
              <option value="Hotspot" className="bg-background text-foreground">Hotspot</option>
              <option value="Dust" className="bg-background text-foreground">Dust</option>
            </select>
          </div>
          
          <button 
            onClick={() => setSortOrder(prev => prev === 'newest' ? 'oldest' : 'newest')}
            className="flex shrink-0 items-center gap-2 px-5 h-11 border rounded-xl hover:bg-accent hover:shadow-md transition-all font-medium text-sm bg-background"
          >
            <Calendar size={16} /> 
            {sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}
          </button>
        </div>
      </div>

      <div className="bg-card border rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-muted/40 text-muted-foreground border-b text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-bold">Inspection ID</th>
                <th className="px-6 py-4 font-bold">Date & Time</th>
                <th className="px-6 py-4 font-bold">Primary Defect</th>
                <th className="px-6 py-4 font-bold">Severity</th>
                <th className="px-6 py-4 font-bold">Confidence Matrix</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr><td colSpan="6" className="text-center py-16 text-muted-foreground font-mono">Fetching telemetry data...</td></tr>
              ) : processedHistory.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-2">
                      <Search size={32} className="opacity-20" />
                      <p>No records match your filters.</p>
                      <button onClick={() => {setSearchTerm(''); setFilterType('All');}} className="text-primary hover:underline text-sm mt-2">Clear Filters</button>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence>
                  {processedHistory.map((item, index) => (
                    <motion.tr 
                      key={item._id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index * 0.05, 0.5) }} // Cap delay
                      className="hover:bg-accent/30 transition-colors group cursor-pointer"
                      onClick={() => setSelectedItem(item)}
                    >
                      <td className="px-6 py-5">
                        <span className="font-mono text-xs font-semibold bg-background px-2 py-1 rounded border shadow-sm text-foreground/80">
                          {item._id.substring(0, 8).toUpperCase()}...
                        </span>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-muted-foreground">
                        {new Date(item.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2 font-bold">
                          {getDefectIcon(item.prediction)}
                          {item.prediction}
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {getSeverityBadge(item.severity)}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3 w-40">
                          <span className="text-sm font-mono font-bold w-12">{(item.confidence * 100).toFixed(1)}%</span>
                          <div className="flex-1 h-2 bg-background rounded-full overflow-hidden border shadow-inner">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-blue-500"
                              style={{ width: `${item.confidence * 100}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <button 
                          onClick={(e) => { e.stopPropagation(); setSelectedItem(item); }}
                          className="p-2 rounded-lg hover:bg-background border border-transparent hover:border-border text-primary transition-all shadow-sm bg-primary/5"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-card border rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b bg-muted/30 flex justify-between items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><Activity size={100} /></div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Diagnostic Report</h3>
                  <p className="font-mono text-sm text-muted-foreground mt-1">ID: {selectedItem._id}</p>
                </div>
                <button onClick={() => setSelectedItem(null)} className="p-2 rounded-full hover:bg-background transition-colors border shadow-sm">
                  <X size={20} />
                </button>
              </div>
              
              <div className="p-6 flex flex-col gap-6 relative z-10">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">Detected Anomaly</p>
                    <div className="flex items-center gap-2 text-3xl font-black">
                      {getDefectIcon(selectedItem.prediction)} {selectedItem.prediction}
                    </div>
                  </div>
                  {getSeverityBadge(selectedItem.severity)}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-accent/40 border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Confidence Score</p>
                    <p className="text-xl font-bold text-primary">{(selectedItem.confidence * 100).toFixed(2)}%</p>
                  </div>
                  <div className="bg-accent/40 border rounded-xl p-4">
                    <p className="text-sm text-muted-foreground mb-1">Timestamp</p>
                    <p className="text-md font-bold">{new Date(selectedItem.timestamp).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}</p>
                  </div>
                </div>

                {selectedItem.recommendation && (
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 mt-2">
                    <p className="text-sm font-bold uppercase tracking-wider text-primary mb-2">Recommended Action</p>
                    <p className="font-medium text-foreground/90">{selectedItem.recommendation}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
