import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../utils/icons';

const DeployRoomModal = ({ isOpen, onClose, onSubmit, newRoom, setNewRoom }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"><Icons.X className="w-6 h-6" /></button>
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 italic text-red-600">Deploy Simulation</h3>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Match Title</label><input required type="text" value={newRoom.title} onChange={(e) => setNewRoom({ ...newRoom, title: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all" placeholder="e.g. Midnight Scrims" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Prize Pool</label><input required type="text" value={newRoom.prize} onChange={(e) => setNewRoom({ ...newRoom, prize: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all" placeholder="₹10,000" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Entry Fee</label><input required type="text" value={newRoom.entry} onChange={(e) => setNewRoom({ ...newRoom, entry: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all" placeholder="FREE / ₹500" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Date</label><input required type="text" value={newRoom.date} onChange={(e) => setNewRoom({ ...newRoom, date: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all" placeholder="24 OCT / TONIGHT" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Time (IST)</label><input required type="text" value={newRoom.time} onChange={(e) => setNewRoom({ ...newRoom, time: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all" placeholder="20:00" /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Map</label><select value={newRoom.map} onChange={(e) => setNewRoom({ ...newRoom, map: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all appearance-none text-white"><option value="Erangel">Erangel</option><option value="Miramar">Miramar</option><option value="Sanhok">Sanhok</option><option value="Vikendi">Vikendi</option><option value="TDM">TDM</option></select></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Mode</label><select value={newRoom.mode} onChange={(e) => setNewRoom({ ...newRoom, mode: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all appearance-none text-white"><option value="Squad">Squad</option><option value="Duo">Duo</option><option value="Solo">Solo</option></select></div>
          </div>
          <button type="submit" className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-red-900/40 hover:bg-red-700 transition-all text-white">Deploy Simulation</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default DeployRoomModal;
