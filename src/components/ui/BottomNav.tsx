'use client';

import React from 'react';
import { Home, Sparkles, Trophy, ShoppingBag, Shield, Zap, BookOpen } from 'lucide-react';

interface BottomNavProps {
  currentView: string;
  setCurrentView: (view: any) => void;
}

export default function BottomNav({ currentView, setCurrentView }: BottomNavProps) {
  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'journey', label: 'Journey', icon: Sparkles },
    { id: 'relics', label: 'Relics', icon: Shield },
    { id: 'arcade', label: 'Speed Rush', icon: Zap },
    { id: 'codex', label: 'Codex', icon: BookOpen },
    { id: 'shop', label: 'Sanctuary', icon: ShoppingBag },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0b1224]/95 backdrop-blur-lg border-t border-amber-500/20 py-1.5 px-2 shadow-2xl flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentView === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentView(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all ${
              isActive
                ? 'text-amber-400 font-extrabold scale-105'
                : 'text-slate-400 hover:text-slate-200 font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5] text-amber-400 animate-pop' : 'stroke-[1.8]'}`} />
            <span className="text-[9px] mt-0.5 tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
