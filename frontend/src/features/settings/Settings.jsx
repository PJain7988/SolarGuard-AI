import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Bell, Shield, Camera, SlidersHorizontal, Monitor, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

export default function Settings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/settings');
      setSettings(response.data.settings);
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await axios.put('http://localhost:8000/api/settings', settings);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="flex justify-center items-center h-full w-full">
        <RefreshCw className="animate-spin text-primary w-10 h-10" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8 w-full max-w-4xl mx-auto pb-12 relative">
      
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-8 right-8 z-50 bg-emerald-500 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <Check size={20} /> Settings Saved Successfully
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">System Settings</h1>
          <p className="text-muted-foreground mt-2 text-lg">Configure global application preferences and hardware thresholds.</p>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:opacity-90 shadow-lg shadow-primary/20 transform transition hover:-translate-y-0.5 disabled:opacity-70"
        >
          {saving ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
          Save Changes
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        
        {/* Hardware & Inference */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border rounded-2xl overflow-hidden shadow-lg">
          <div className="p-6 border-b bg-muted/20 flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg"><SlidersHorizontal size={20} /></div>
            <h3 className="font-bold text-xl">Inference & Hardware Engine</h3>
          </div>
          <div className="p-6 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Active ML Engine</label>
              <select 
                value={settings.ml_engine}
                onChange={(e) => setSettings({...settings, ml_engine: e.target.value})}
                className="w-full bg-background border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 text-foreground font-medium"
              >
                <option value="MobileNetV2">MobileNetV2 (High Speed, Good Accuracy)</option>
                <option value="EfficientNetB0">EfficientNetB0 (High Accuracy, Moderate Speed)</option>
                <option value="ResNet50">ResNet50 (Legacy Heavyweight)</option>
              </select>
              <p className="text-xs text-muted-foreground mt-1">Changes the active neural network used in the "Run Inspection" module.</p>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-bold tracking-wide uppercase text-muted-foreground">Anomaly Confidence Threshold: {Math.round(settings.detection_threshold * 100)}%</label>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="0.99" 
                step="0.01"
                value={settings.detection_threshold}
                onChange={(e) => setSettings({...settings, detection_threshold: parseFloat(e.target.value)})}
                className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <p className="text-xs text-muted-foreground mt-1">Minimum confidence required before the AI classifies a panel as defective.</p>
            </div>

          </div>
        </motion.div>

        {/* Global Preferences */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border rounded-2xl overflow-hidden shadow-lg">
          <div className="p-6 border-b bg-muted/20 flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 text-purple-500 rounded-lg"><Monitor size={20} /></div>
            <h3 className="font-bold text-xl">Global Preferences</h3>
          </div>
          <div className="p-6 flex flex-col gap-6">
            
            <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 text-emerald-500 rounded-lg"><Camera size={24} /></div>
                <div>
                  <h4 className="font-bold text-lg">Auto-save Inspection Images</h4>
                  <p className="text-sm text-muted-foreground">Automatically save uploaded telemetry to the Dataset Repository</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.auto_save_images} onChange={(e) => setSettings({...settings, auto_save_images: e.target.checked})} />
                <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-xl hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-orange-500/10 text-orange-500 rounded-lg"><Bell size={24} /></div>
                <div>
                  <h4 className="font-bold text-lg">Critical Anomaly Alerts</h4>
                  <p className="text-sm text-muted-foreground">Push notifications for high-risk defect classifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={settings.alert_notifications} onChange={(e) => setSettings({...settings, alert_notifications: e.target.checked})} />
                <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-500"></div>
              </label>
            </div>

          </div>
        </motion.div>

        {/* Security & Access */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-card border rounded-2xl overflow-hidden shadow-lg opacity-60">
          <div className="p-6 border-b bg-muted/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 text-primary rounded-lg"><Shield size={20} /></div>
              <h3 className="font-bold text-xl">Security & Authentication</h3>
            </div>
            <span className="text-xs font-bold uppercase tracking-wide bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/20">Enterprise Tier</span>
          </div>
          <div className="p-6">
            <p className="text-muted-foreground font-medium">RBAC (Role-Based Access Control) and SSO integration are disabled in this evaluation deployment.</p>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
