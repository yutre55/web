import React from 'react';
import { Icons } from '../../utils/icons';

const HelpTab = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       <div className="space-y-6"><div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md"><div className="flex justify-between items-center mb-10"><h2 className="text-3xl font-black uppercase italic text-red-600 leading-none">Support Portal</h2><Icons.HelpCircle className="w-6 h-6 text-red-600" /></div><p className="text-zinc-500 text-xs leading-relaxed mb-8 italic">{"// Core relay engineers available 24/7 for technical mitigation."}</p>
       <a href="https://t.me/+NsxR65wYx5Y3OGQ9" target="_blank" rel="noopener noreferrer"><button className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3"><Icons.MessageSquare className="w-4 h-4" /> Contact for Help</button></a></div></div>
       <div className="lg:col-span-2"><div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 sm:p-12 backdrop-blur-md"><h3 className="text-2xl font-black uppercase tracking-tight mb-10">Operational <span className="text-red-600">FAQ</span></h3><div className="space-y-6">
          {[
            {q: "How to receive match Room ID and Password?", a: "Match credentials are automatically transmitted to your System Inbox 30 minutes before the simulation start time."},
            {q: "What is the policy for failed asset deployments?", a: "If a zero-day exploit fails to execute, contact Support Relay within 15 minutes for a dynamic key rotation."},
            {q: "How can I withdraw prize pool winnings?", a: "Tournament winnings are processed to your linked BTC wallet within 24 hours of combat verification."}
          ].map((item, idx) => (
            <div key={idx} className="p-6 bg-black/40 rounded-3xl border border-white/5 hover:border-red-600/20 transition-all"><div className="flex gap-4"><div className="w-6 h-6 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center shrink-0"><span className="text-[10px] font-black text-red-600">Q</span></div><p className="font-bold text-white text-sm uppercase tracking-tight">{item.q}</p></div><div className="mt-4 pl-10 flex gap-4"><div className="w-[1px] bg-zinc-800" /><p className="text-zinc-500 text-xs leading-relaxed">{item.a}</p></div></div>
          ))}</div></div></div>
    </div>
  );
};

export default HelpTab;
