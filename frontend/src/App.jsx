import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Camera, History as HistoryIcon, FileText, Settings as SettingsIcon, LogOut, Moon, Sun, Network, FlaskConical, Database, Bot } from 'lucide-react';
import Dashboard from './features/dashboard/Dashboard';
import ImageUpload from './features/inspection/ImageUpload';
import History from './features/inspection/History';
import ModelPerformance from './features/models/ModelPerformance';
import Experiments from './features/models/Experiments';
import DatasetManager from './features/dataset/DatasetManager';
import AIAssistant from './features/assistant/AIAssistant';
import Settings from './features/settings/Settings';
import Reports from './features/reports/Reports';
import Login from './features/auth/Login';
import { ThemeProvider, useTheme } from './context/ThemeProvider';

const SidebarLink = ({ to, icon: Icon, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
        ${isActive ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
    >
      <Icon size={20} />
      <span>{children}</span>
    </Link>
  );
};

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <button onClick={toggleTheme} className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground w-full transition-colors text-left">
      {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
      <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
    </button>
  );
};

function AppContent({ onLogout }) {
  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r bg-card flex flex-col overflow-y-auto">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold tracking-tight text-primary flex items-center gap-2">
            <span className="bg-primary text-primary-foreground p-1.5 rounded-md text-sm">SG</span>
            SolarGuard AI
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-4">Core</p>
          <SidebarLink to="/" icon={LayoutDashboard}>Dashboard</SidebarLink>
          <SidebarLink to="/inspect" icon={Camera}>Run Inspection</SidebarLink>
          <SidebarLink to="/history" icon={HistoryIcon}>History & Trends</SidebarLink>
          <SidebarLink to="/assistant" icon={Bot}>AI Assistant</SidebarLink>
          
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-4">Machine Learning</p>
          <SidebarLink to="/models" icon={Network}>Model Performance</SidebarLink>
          <SidebarLink to="/experiments" icon={FlaskConical}>Experiments</SidebarLink>
          <SidebarLink to="/dataset" icon={Database}>Dataset</SidebarLink>
          
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-6 px-4">System</p>
          <SidebarLink to="/reports" icon={FileText}>Reports</SidebarLink>
        </nav>
        <div className="p-4 border-t space-y-2 mt-auto">
          <ThemeToggle />
          <SidebarLink to="/settings" icon={SettingsIcon}>Settings</SidebarLink>
          <button 
            onClick={onLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive w-full transition-colors text-left"
          >
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inspect" element={<ImageUpload />} />
          <Route path="/history" element={<History />} />
          <Route path="/assistant" element={<AIAssistant />} />
          <Route path="/models" element={<ModelPerformance />} />
          <Route path="/experiments" element={<Experiments />} />
          <Route path="/dataset" element={<DatasetManager />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if token exists on mount
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
  };

  return (
    <ThemeProvider>
      <Router>
        {!isAuthenticated ? (
          <Login onLogin={handleLogin} />
        ) : (
          <AppContent onLogout={handleLogout} />
        )}
      </Router>
    </ThemeProvider>
  );
}

export default App;
