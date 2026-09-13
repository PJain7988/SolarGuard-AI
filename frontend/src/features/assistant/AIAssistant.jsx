import React, { useState } from 'react';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import axios from 'axios';

export default function AIAssistant() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am the SolarGuard AI Assistant. Ask me anything about defect types, severity analysis, or your recent inspections.' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/api/assistant/query', {
        query: userMessage.content
      });
      
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I am currently unable to connect to the backend server. Please ensure the FastAPI server is running.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full border rounded-xl bg-card shadow-sm overflow-hidden">
      <div className="p-4 border-b bg-accent/30 flex items-center gap-3">
        <div className="p-2 bg-primary/10 text-primary rounded-lg">
          <Bot size={24} />
        </div>
        <div>
          <h2 className="font-bold text-lg">SolarGuard Assistant</h2>
          <p className="text-xs text-muted-foreground">AI-powered analytics insights</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 max-w-[80%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}>
            <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-accent text-foreground border'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-3 rounded-2xl ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-accent/50 border rounded-tl-none'}`}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%] mr-auto">
             <div className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-accent text-foreground border">
              <Bot size={16} />
            </div>
            <div className="p-4 rounded-2xl bg-accent/50 border rounded-tl-none flex items-center">
              <Loader2 size={16} className="animate-spin text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t bg-card">
        <form 
          className="relative flex items-center"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <input 
            type="text" 
            placeholder="Ask about defect severity..." 
            className="w-full pl-4 pr-12 py-3 bg-background border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/50 transition-shadow"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button 
            type="submit" 
            disabled={!input.trim() || isLoading}
            className="absolute right-2 p-2 bg-primary text-primary-foreground rounded-full hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
