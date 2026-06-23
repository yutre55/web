import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../utils/icons';

const StatsTab = ({ liveStats, graphSeeds, telemetry }) => {
  return (
    <>
      <header className="mb-12"><motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}><div className="flex items-center gap-2 text-red-500 mb-2"><Icons.Cpu className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Global Relay Analytics</span></div><h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase">Network <span className="text-red-600">Stats</span></h2></motion.div></header>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md"><div className="flex justify-between items-center mb-8"><div><h3 className="text-lg font-black uppercase tracking-tight">Bandwidth Utilization</h3><p className="text-[9px] text-zinc-500 font-mono tracking-widest uppercase">Realtime_Traffic_Flux</p></div><div className="flex items-center gap-4 text-right"><div><p className="text-[8px] text-zinc-600 font-black uppercase">Current Flow</p><p className="text-xl font-black text-red-600 italic">{liveStats.bandwidth} GB/s</p></div><Icons.Activity className="w-6 h-6 text-red-600" /></div></div>
          <div className="h-48 flex items-end gap-1 sm:gap-2">{graphSeeds.map((s, i) => <motion.div key={i} animate={{ height: [s.h1, s.h2, s.h3], opacity: [0.3, 0.8, 0.3] }} transition={{ duration: s.d, repeat: Infinity, delay: s.delay }} className="flex-1 bg-gradient-to-t from-red-600 to-red-400 rounded-t-md" />)}</div></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
             <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 text-center"><p className="text-[9px] text-zinc-600 font-black uppercase mb-2">Active Relays</p><p className="text-2xl font-black italic">{liveStats.relays.toLocaleString()}</p><div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden"><motion.div animate={{ width: '82%' }} className="h-full bg-red-600" /></div></div>
             <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 text-center"><p className="text-[9px] text-zinc-600 font-black uppercase mb-2">Network Latency</p><p className="text-2xl font-black italic text-green-500">{liveStats.latency}ms</p><div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden"><motion.div animate={{ width: '12%' }} className="h-full bg-green-500" /></div></div>
             <div className="bg-zinc-900/40 border border-white/5 rounded-[2rem] p-6 text-center"><p className="text-[9px] text-zinc-600 font-black uppercase mb-2">Core Health</p><p className="text-2xl font-black italic text-blue-500">{telemetry.health}%</p><div className="mt-4 h-1 w-full bg-white/5 rounded-full overflow-hidden"><motion.div animate={{ width: `${telemetry.health}%` }} className="h-full bg-blue-500" /></div></div>
          </div>
        </div>
        {/* Note: Terminal logs were also here in App.js, but I'll move them to StatsTab if needed or pass them as prop */}
      </div>
    </>
  );
};

export default StatsTab;
