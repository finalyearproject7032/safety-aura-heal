import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '@/context/AppContext';

const FakeCalculator: React.FC = () => {
  const navigate = useNavigate();
  const { triggerSOS } = useApp();
  const [display, setDisplay] = useState('0');
  const [secretInput, setSecretInput] = useState('');

  const buttons = ['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','=','+'];

  const handlePress = (val: string) => {
    const newSecret = secretInput + val;
    setSecretInput(newSecret);

    // Silent SOS trigger
    if (newSecret === '123=') {
      triggerSOS();
      return;
    }

    if (val === '=') {
      try {
        const expr = display.replace('×','*').replace('÷','/').replace('−','-');
        const result = Function(`"use strict"; return (${expr})`)();
        setDisplay(String(parseFloat(result.toFixed(8))));
      } catch { setDisplay('Error'); }
    } else if (['+','−','×','÷'].includes(val)) {
      setDisplay(prev => prev + val);
    } else if (val === '.') {
      const parts = display.split(/[+\-×÷]/);
      const last = parts[parts.length - 1];
      if (!last.includes('.')) setDisplay(prev => prev + '.');
    } else {
      setDisplay(prev => prev === '0' ? val : prev + val);
    }
  };

  const clear = () => { setDisplay('0'); setSecretInput(''); };

  const btnStyle = (val: string) => {
    if (['+','−','×','÷','='].includes(val)) return 'bg-primary/20 text-primary border-primary/20';
    if (val === 'C') return 'bg-emergency/20 text-emergency border-emergency/20';
    return 'bg-surface-2 text-foreground border-border hover:bg-surface-3';
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex items-center gap-3 p-4 border-b border-border">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl glass-card flex items-center justify-center">
          <ArrowLeft size={16} />
        </button>
        <span className="font-display font-semibold">Calculator</span>
        <span className="ml-auto text-[10px] text-muted-foreground opacity-30">v2.1</span>
      </div>

      {/* Display */}
      <div className="flex-1 flex items-end justify-end px-6 py-8">
        <div className="text-right">
          <div className="text-5xl font-mono font-bold text-foreground break-all">{display}</div>
          <div className="text-xs text-muted-foreground mt-2 opacity-30">Enter 123= for advanced mode</div>
        </div>
      </div>

      {/* Keypad */}
      <div className="p-4 pb-8">
        {/* Clear row */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <motion.button onClick={clear} whileTap={{ scale: 0.9 }}
            className="col-span-2 py-4 rounded-2xl text-lg font-bold border bg-emergency/20 text-emergency border-emergency/20">
            C
          </motion.button>
          <motion.button onClick={() => setDisplay(prev => prev.slice(0, -1) || '0')} whileTap={{ scale: 0.9 }}
            className="py-4 rounded-2xl text-lg font-bold border bg-surface-2 text-foreground border-border">
            ⌫
          </motion.button>
          <motion.button onClick={() => handlePress('÷')} whileTap={{ scale: 0.9 }}
            className="py-4 rounded-2xl text-lg font-bold border bg-primary/20 text-primary border-primary/20">
            ÷
          </motion.button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {buttons.map(btn => (
            <motion.button key={btn} onClick={() => handlePress(btn)} whileTap={{ scale: 0.88 }}
              className={`py-5 rounded-2xl text-xl font-bold border transition-all duration-150 ${btnStyle(btn)} ${btn === '0' ? '' : ''}`}>
              {btn}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FakeCalculator;
