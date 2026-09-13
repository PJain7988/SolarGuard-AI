import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Activity, ShieldCheck, AlertTriangle, AlertOctagon, TrendingUp, Cpu, Database } from 'lucide-react';
import { motion } from 'framer-motion';

const COLORS = ['#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']; // Blue, Yellow, Red, Purple

const StatCard = ({ title, value, icon: Icon, description, delay, gradient }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className={`relative overflow-hidden bg-card text-card-foreground p-6 rounded-2xl border shadow-lg hover:shadow-xl transition-all`}
  >
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${gradient} opacity-10 rounded-full blur-2xl -mr-10 -mt-10`}></div>
    <div className="flex items-center justify-between mb-4 relative z-10">
      <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
      <div className={`p-2.5 bg-gradient-to-br ${gradient} rounded-xl text-white shadow-md`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>
    </div>
    <div className="flex flex-col gap-1 relative z-10">
      <span className="text-4xl font-black tracking-tight">{value}</span>
      <span className="text-xs font-medium text-muted-foreground mt-1">
        {description}
      </span>
    </div>
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    total: 0,
    healthy: 0,
    defective: 0,
    critical: 0,
    confidence: "0.0%",
    trends: [],
    distribution: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // Add timestamp to prevent browser caching so data is always fresh
        const response = await fetch(`https://solarguard-ai-7gw9.onrender.com/api/dashboard/stats?t=${Date.now()}`);
        const data = await response.json();
        if (data && !data.error) {
          setStats({
            total: data.total_inspections || 0,
            healthy: data.healthy_panels || 0,
            defective: data.defective_panels || 0,
            critical: data.critical_defects || 0,
            confidence: "0.0%",
            trends: data.trends || [],
            distribution: data.distribution || []
          });
        }
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card/95 backdrop-blur-md border p-4 rounded-xl shadow-xl">
          <p className="text-sm font-bold mb-2 uppercase tracking-wider">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-4 text-sm font-medium mb-1">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-muted-foreground capitalize">{entry.name}</span>
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
      <div>
        <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Analytics Overview</h1>
        <p className="text-muted-foreground mt-2 text-lg">Real-time telemetrics and defect progression across the solar array.</p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Inspections" value={stats.total.toLocaleString()} icon={Database} description="Total images processed" gradient="from-blue-500 to-indigo-600" delay={0.1} />
        <StatCard title="Healthy Panels" value={stats.healthy.toLocaleString()} icon={ShieldCheck} description="Operating optimally" gradient="from-emerald-400 to-teal-500" delay={0.2} />
        <StatCard title="Defective Panels" value={stats.defective.toLocaleString()} icon={AlertTriangle} description="Require maintenance" gradient="from-orange-400 to-red-500" delay={0.3} />
        <StatCard title="Critical Anomalies" value={stats.critical} icon={AlertOctagon} description="Immediate action required" gradient="from-red-500 to-rose-700" delay={0.4} />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Trend Area Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="lg:col-span-2 bg-card border rounded-2xl p-6 shadow-lg flex flex-col relative overflow-hidden"
        >
          <div className="flex justify-between items-center mb-6 relative z-10">
            <h3 className="font-bold text-xl flex items-center gap-2 tracking-tight">
              <TrendingUp className="text-primary" size={24}/> Inspection Trajectory
            </h3>
          </div>
          
          <div className="h-[350px] w-full relative z-10">
            {stats.trends.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.trends} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                  <defs>
                    <linearGradient id="colorHealthy" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDefects" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} opacity={0.5} />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                  <RechartsTooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--border))', strokeWidth: 1, strokeDasharray: '4 4' }} />
                  <Area type="monotone" dataKey="healthy" name="Healthy" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHealthy)" activeDot={{ r: 6, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="defects" name="Defects" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorDefects)" activeDot={{ r: 6, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl">
                <TrendingUp size={48} className="opacity-20 mb-4" />
                <p>No trend data available yet.</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Defect Distribution Donut Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="bg-card border rounded-2xl p-6 shadow-lg flex flex-col"
        >
          <div className="mb-2">
            <h3 className="font-bold text-xl flex items-center gap-2 tracking-tight">
              <Cpu className="text-blue-500" size={24}/> Defect Topology
            </h3>
          </div>
          
          <div className="h-[250px] w-full flex-1 relative">
            {stats.distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={6}
                  >
                    {stats.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed rounded-xl mt-4">
                <PieChart size={48} className="opacity-20 mb-4" />
                <p>No distribution data.</p>
              </div>
            )}
            
            {/* Center Label for Donut */}
            {stats.distribution.length > 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-black">{stats.defective}</span>
                <span className="text-xs uppercase tracking-widest text-muted-foreground">Anomalies</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap gap-x-4 gap-y-3 justify-center mt-6">
            {stats.distribution.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-2 text-sm bg-accent/50 px-3 py-1.5 rounded-full border">
                <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span className="font-medium">{entry.name}</span>
                <span className="text-muted-foreground ml-1">({entry.value})</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
