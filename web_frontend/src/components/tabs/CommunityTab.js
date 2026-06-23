import React from 'react';
import { Icons } from '../../utils/icons';

const CommunityTab = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl">
      <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md relative overflow-hidden group"><div className="relative z-10"><div className="w-16 h-16 bg-blue-500/10 rounded-[2rem] flex items-center justify-center mb-8 border border-blue-500/20 group-hover:scale-110 transition-transform"><Icons.Send className="w-8 h-8 text-blue-500" /></div><h3 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">Shadow <span className="text-blue-500">Relay</span></h3><p className="text-zinc-500 text-sm leading-relaxed mb-10">Access our main encrypted channel for global tool updates, zero-day announcements, and network alerts.</p>
      <a href="https://t.me/+RVFqQeSF-a43YTY9" target="_blank" rel="noopener noreferrer"><button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-blue-700 transition-all shadow-xl shadow-blue-900/20">Join Channel</button></a></div><div className="absolute -top-10 -right-10 opacity-[0.03] rotate-12 transition-opacity group-hover:opacity-[0.08]"><Icons.Send className="w-64 h-64" /></div></div>
      <div className="bg-zinc-900/40 border border-white/5 rounded-[3rem] p-10 backdrop-blur-md relative overflow-hidden group"><div className="relative z-10"><div className="w-16 h-16 bg-red-600/10 rounded-[2rem] flex items-center justify-center mb-8 border border-red-600/20 group-hover:scale-110 transition-transform"><Icons.MessageSquare className="w-8 h-8 text-red-600" /></div><h3 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">Elite <span className="text-red-600">Chat</span></h3><p className="text-zinc-500 text-sm leading-relaxed mb-10">Peer-to-peer discussion hub for verified operators. Requires active subscription or Level 5 clearance.</p>
      <a href="https://t.me/+NsxR65wYx5Y3OGQ9" target="_blank" rel="noopener noreferrer"><button className="w-full bg-zinc-800 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-zinc-700 transition-all border border-white/10">Join Chat</button></a></div><div className="absolute -top-10 -right-10 opacity-[0.03] -rotate-12 transition-opacity group-hover:opacity-[0.08]"><Icons.MessageSquare className="w-64 h-64" /></div></div>
    </div>
  );
};

export default CommunityTab;
