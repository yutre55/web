import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../utils/icons';

const EnlistAssetModal = ({ isOpen, onClose, onSubmit, newProduct, setNewProduct }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }} className="bg-zinc-900 border border-white/10 p-8 rounded-[2.5rem] w-full max-w-lg relative">
        <button onClick={onClose} className="absolute top-6 right-6 p-2 text-zinc-500 hover:text-white transition-colors"><Icons.X className="w-6 h-6" /></button>
        <h3 className="text-2xl font-black uppercase tracking-tighter mb-8 italic text-red-600">Enlist Asset</h3>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Asset Name</label><input required type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all" placeholder="Enter name..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Price (₹)</label><input required type="text" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all" placeholder="₹4,500" /></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Category</label><select value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all appearance-none text-white"><option value="Tools">Tools</option><option value="Exploits">Exploits</option><option value="Data">Data</option><option value="Scripts">Scripts</option></select></div>
          </div>
          <div className="space-y-2"><label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest ml-2">Description</label><textarea required value={newProduct.desc} onChange={(e) => setNewProduct({ ...newProduct, desc: e.target.value })} className="w-full bg-black/40 border border-white/5 rounded-2xl py-4 px-6 text-sm focus:border-red-600 outline-none transition-all min-h-[100px]" placeholder="Technical breakdown..." /></div>
          <button type="submit" className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-lg shadow-red-900/40 hover:bg-red-700 transition-all text-white">Deploy to Market</button>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EnlistAssetModal;
