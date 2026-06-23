import React from 'react';
import { Icons } from '../../utils/icons';

const TelemetryUI = ({ telemetry }) => (
  <div className="fixed inset-0 z-10 pointer-events-none">
    <div className="absolute top-4 left-4 sm:top-10 sm:left-10 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-zinc-700">
        <Icons.Radio className="w-2 h-2 text-red-600 animate-pulse" />
        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Node_Active: {telemetry.hex}</span>
      </div>
      <div className="w-32 h-[1px] bg-white/5" />
      <span className="text-[8px] text-zinc-800 font-mono tracking-widest">S_ID: 994.SHDW_MKT</span>
    </div>
  </div>
);

export default TelemetryUI;
