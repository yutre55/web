import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../utils/icons';
import { API_BASE_URL } from '../../utils/api';

const MarketTab = ({ products, searchQuery, setSearchQuery, handleAcquire }) => {
  return (
    <>
      <header className="mb-8 sm:mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 text-red-500 mb-2"><Icons.Terminal className="w-3 h-3 sm:w-4 sm:h-4" /><span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em]">Secure Protocol v4.2.0</span></div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter uppercase">Market <span className="text-red-600">Inventory</span></h2>
        </motion.div>
        <div className="relative"><Icons.Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" /><input type="text" placeholder="Scan directory..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-zinc-900/60 border border-white/10 rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-12 pr-6 w-full lg:w-80 text-sm focus:outline-none focus:border-red-500/50 transition-all backdrop-blur-xl" /></div>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6">
        {products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).map((p) => (
          <div key={p._id} className="bg-zinc-900/40 border border-white/5 rounded-[2rem] sm:rounded-[2.5rem] p-6 sm:p-8 hover:border-red-500/30 transition-all group relative overflow-hidden backdrop-blur-md">
            {/* Product Image or Icon */}
            <div className="relative h-40 sm:h-48 mb-6 rounded-2xl overflow-hidden bg-black/40 flex items-center justify-center border border-white/5">
              {p.image_url ? (
                <img src={`${API_BASE_URL}${p.image_url}`} alt={p.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              ) : (
                <Icons.Zap className="w-12 h-12 text-red-600/20 group-hover:text-red-600 transition-colors" />
              )}
              <div className="absolute top-4 left-4">
                <span className="text-[8px] sm:text-[9px] font-black text-red-500 bg-red-600/10 px-2.5 py-1.5 rounded-full uppercase tracking-widest border border-red-500/20 backdrop-blur-md">{p.category}</span>
              </div>
            </div>

            <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 group-hover:text-red-500 transition-colors uppercase tracking-tight line-clamp-1">{p.name}</h3>
            <p className="text-zinc-500 text-[11px] sm:text-xs leading-relaxed mb-6 sm:mb-8 font-medium min-h-[3rem] line-clamp-3">{p.desc}</p>
            <div className="flex items-center justify-between pt-4 sm:pt-6 border-t border-white/10">
              <div><p className="text-[8px] sm:text-[9px] text-zinc-600 font-black uppercase">Contract Value</p><p className="font-black text-white text-base sm:text-lg">{p.price}</p></div>
              <button onClick={() => handleAcquire(p)} className="bg-white text-black hover:bg-red-600 hover:text-white text-[9px] sm:text-[10px] font-black px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl transition-all uppercase tracking-widest">Acquire</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default MarketTab;
