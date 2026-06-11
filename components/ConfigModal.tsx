/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { motion, AnimatePresence } from 'motion/react';
import { X, Server } from 'lucide-react';

export function ConfigModal() {
  const { 
    isConfigModalOpen, 
    closeConfigModal, 
    setConfig,
    supabaseUrl: currentUrl,
    supabaseKey: currentKey,
    macrodroidUrl: currentMacro
  } = useStore();

  const [url, setUrl] = useState('');
  const [key, setKey] = useState('');
  const [macro, setMacro] = useState('');

  useEffect(() => {
    if (isConfigModalOpen) {
      setUrl(currentUrl);
      setKey(currentKey);
      setMacro(currentMacro || 'https://trigger.macrodroid.com/be1f65a9-f9aa-41be-8458-dfbc026d2fc2/send_sms');
    }
  }, [isConfigModalOpen, currentUrl, currentKey, currentMacro]);

  const handleSave = () => {
    setConfig(url.trim(), key.trim(), macro.trim());
  };

  return (
    <AnimatePresence>
      {isConfigModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-md"
            onClick={closeConfigModal}
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative w-full max-w-md bg-surface border border-border rounded-2xl p-6 shadow-2xl"
          >
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-medium text-primary tracking-tight flex items-center gap-2">
                  <Server className="w-5 h-5 text-secondary" /> Конфигурация API
                </h3>
                <p className="text-xs text-secondary mt-1">Подключение к Supabase и MacroDroid</p>
              </div>
              <button onClick={closeConfigModal} className="text-secondary hover:text-primary transition-colors p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest mb-1.5">Supabase URL</label>
                <input 
                  type="text" 
                  value={url}
                  onChange={e => setUrl(e.target.value)}
                  placeholder="https://your-project.supabase.co" 
                  className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary font-mono placeholder:font-sans"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest mb-1.5">Supabase Anon Key</label>
                <input 
                  type="password" 
                  value={key}
                  onChange={e => setKey(e.target.value)}
                  placeholder="eyJhbGciOi..." 
                  className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary font-mono placeholder:font-sans"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-secondary uppercase tracking-widest mb-1.5">MacroDroid Webhook URL</label>
                <input 
                  type="text" 
                  value={macro}
                  onChange={e => setMacro(e.target.value)}
                  placeholder="https://trigger.macrodroid.com/..." 
                  className="w-full bg-background border border-border hover:border-border-hover focus:border-secondary focus:outline-none rounded-lg px-4 py-3 text-sm transition-colors text-primary font-mono placeholder:font-sans"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={closeConfigModal} 
                className="w-1/2 bg-background hover:bg-border text-primary text-sm font-medium py-3 rounded-full border border-border transition-colors"
              >
                Отмена
              </button>
              <button 
                onClick={handleSave} 
                className="w-1/2 bg-accent hover:bg-accent-hover text-background text-sm font-medium py-3 rounded-full transition-colors"
              >
                Сохранить
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
