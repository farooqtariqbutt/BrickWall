import React, { useState, useEffect, useCallback } from 'react';
import { BOARD_WIDTH, BOARD_HEIGHT } from '../constants.ts';
import { Controls } from '../types.ts';

interface SettingsScreenProps {
  currentControls: Controls;
  onSave: (newControls: Controls) => void;
  onCancel: () => void;
}

type ControlKey = keyof Controls;

const SettingsScreen: React.FC<SettingsScreenProps> = ({ currentControls, onSave, onCancel }) => {
  const [localControls, setLocalControls] = useState<Controls>(currentControls);
  const [editingKey, setEditingKey] = useState<ControlKey | null>(null);

  const displayKey = (key: string): string => {
    if (key === ' ') return 'Space';
    return key;
  };

  const handleSetKey = (key: ControlKey) => {
    setEditingKey(key);
  };
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!editingKey) return;
    
    e.preventDefault();
    setLocalControls(prev => ({ ...prev, [editingKey]: e.key }));
    setEditingKey(null);
  }, [editingKey]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
  
  const controlLabels: Record<ControlKey, string> = {
      left: 'Move Left',
      right: 'Move Right',
      launch: 'Launch Ball'
  };

  return (
    <div
      className="bg-slate-800/80 backdrop-blur-sm border-2 border-slate-700 rounded-lg flex flex-col items-center justify-center text-center p-10 shadow-2xl"
      style={{ width: BOARD_WIDTH, height: BOARD_HEIGHT }}
    >
      <h2 className="text-4xl font-bold mb-8 text-white">Settings</h2>
      
      <div className="w-full max-w-sm space-y-4">
        {(Object.keys(localControls) as ControlKey[]).map((key) => (
             <div key={key} className="flex items-center justify-between">
                <span className="text-xl text-slate-300">{controlLabels[key]}:</span>
                <button
                    onClick={() => handleSetKey(key)}
                    className="w-48 text-center px-4 py-2 bg-slate-700 text-cyan-400 font-mono text-lg rounded-md hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-colors"
                >
                    {editingKey === key ? 'Press any key...' : displayKey(localControls[key])}
                </button>
            </div>
        ))}
      </div>

      <div className="flex space-x-4 mt-12">
        <button
          onClick={onCancel}
          className="px-8 py-3 bg-slate-600 text-white font-bold text-lg rounded-lg hover:bg-slate-500 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-slate-400 shadow-lg"
        >
          Back to Menu
        </button>
        <button
          onClick={() => onSave(localControls)}
          className="px-10 py-4 bg-cyan-500 text-slate-900 font-bold text-xl rounded-lg hover:bg-cyan-400 transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300 shadow-lg"
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
