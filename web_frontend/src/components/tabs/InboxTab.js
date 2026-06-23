import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../utils/icons';

const InboxTab = ({ messages }) => {
  return (
    <>
      <header className="mb-12"><motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}><div className="flex items-center gap-2 text-red-500 mb-2"><Icons.Mail className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Encrypted Communications</span></div><h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase">Operator <span className="text-red-600">Inbox</span></h2></motion.div></header>
      <div className="max-w-4xl space-y-4">
        {messages.map(msg => (
          <div key={msg._id} className="bg-zinc-900/40 border border-white/5 p-6 sm:p-8 rounded-[2rem] backdrop-blur-md group hover:border-red-600/20 transition-all">
             <div className="flex justify-between items-start mb-4"><div className="flex items-center gap-3"><div className={`w-2 h-2 rounded-full ${msg.read ? 'bg-zinc-700' : 'bg-red-600 animate-pulse'}`} /><span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">FROM: {msg.sender}</span></div><span className="text-[10px] font-mono text-zinc-600">{msg.time}</span></div>
             <h3 className="text-lg font-bold uppercase tracking-tight mb-2 group-hover:text-red-500 transition-colors">{msg.subject}</h3>
             <p className="text-zinc-500 text-sm leading-relaxed">{msg.body}</p>
          </div>
        ))}
      </div>
    </>
  );
};

export default InboxTab;
