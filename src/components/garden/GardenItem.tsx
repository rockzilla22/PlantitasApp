"use client";

import React from "react";

interface GardenItemProps {
  icon: string;
  label: string;
  type: 'plant' | 'seed' | 'inventory';
  onClick?: () => void;
  subLabel?: string;
}

export function GardenItem({ icon, label, type, onClick, subLabel }: GardenItemProps) {
  const getContainerStyle = () => {
    switch (type) {
      case 'plant': return 'bg-[var(--card-bg)] shadow-sm border border-[var(--border-light)] rounded-2xl p-4 hover:shadow-lg hover:-translate-y-1';
      case 'seed': return 'bg-[var(--warning-bg-light)]/50 border border-[var(--warning-bg-light)] rounded-xl p-3 hover:bg-[var(--warning-bg-light)]';
      case 'inventory': return 'bg-[var(--bg-faint)] border border-[var(--border)] rounded-lg p-2 text-center grayscale hover:grayscale-0';
      default: return '';
    }
  };

  const getIconSize = () => {
    switch (type) {
      case 'plant': return 'text-4xl';
      case 'seed': return 'text-2xl';
      case 'inventory': return 'text-xl';
      default: return 'text-2xl';
    }
  };

  return (
    <div 
      className={`${getContainerStyle()} cursor-pointer transition-all flex flex-col registros-center justify-center gap-2 group animate-in zoom-in duration-500`}
      onClick={onClick}
      title={label}
    >
      <span className={`${getIconSize()} group-hover:scale-110 transition-transform`}>{icon}</span>
      <span className="text-[0.65rem] font-bold text-[var(--text-gray)] uppercase tracking-wider text-center line-clamp-1 w-full">
        {label}
      </span>
      {subLabel && (
        <span className="text-[0.6rem] text-[var(--text-gray)] font-medium opacity-70">{subLabel}</span>
      )}
      
      {/* Decorative Pot for plants */}
      {type === 'plant' && (
        <div className="w-8 h-3 bg-[var(--border)] rounded-b-lg -mt-1 opacity-50 group-hover:bg-[var(--primary)] group-hover:opacity-100 transition-all"></div>
      )}
    </div>
  );
}
