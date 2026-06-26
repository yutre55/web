import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../utils/icons';
import { API_BASE_URL } from '../../utils/api';

const CartTab = ({ cart, setCart, calculateTotal, handleOrder }) => {
  return (
    <>
      <header className="mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <div className="flex items-center gap-2 text-red-500 mb-2"><Icons.ShoppingCart className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Secured Asset Cart</span></div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase">Cart <span className="text-red-600">Assets</span></h2>
        </motion.div>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="bg-zinc-900/60 border border-white/10 rounded-2xl px-6 py-4 backdrop-blur-xl flex flex-col items-center sm:items-end"><span className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Total Valuation</span><span className="text-2xl font-black text-green-500">₹{calculateTotal()}</span></div>
          <button onClick={handleOrder} disabled={cart.length === 0} className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-[12px] font-black px-10 py-5 rounded-2xl transition-all uppercase tracking-[0.2em] shadow-lg shadow-red-900/40">Order Now</button>
        </div>
      </header>
      {cart.length === 0 ? <div className="h-[50vh] flex flex-col items-center justify-center text-zinc-600 opacity-20"><Icons.Package className="w-16 h-16 mb-4" /><p className="font-mono text-sm tracking-widest uppercase">CART_EMPTY</p></div> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {cart.map((p, idx) => (
            <div key={`${p._id}-${idx}`} className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 hover:border-red-500/30 transition-all group relative overflow-hidden backdrop-blur-md">
              <div className="flex justify-between items-start mb-6">
                <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-red-500/20">{p.category}</span>
                <button onClick={() => setCart(cart.filter((_, i) => i !== idx))} className="p-2 hover:bg-white/5 rounded-full text-zinc-600 hover:text-red-500 transition-colors"><Icons.X className="w-4 h-4" /></button>
              </div>

              {/* Small Product Image Preview in Cart */}
              {p.image_url && (
                <div className="w-full h-32 mb-6 rounded-2xl overflow-hidden bg-black/40 border border-white/5">
                  <img src={`${API_BASE_URL}${p.image_url}`} alt={p.name} className="w-full h-full object-cover" />
                </div>
              )}

              <h3 className="text-xl font-bold mb-3 uppercase tracking-tight line-clamp-1">{p.name}</h3><p className="text-zinc-500 text-xs leading-relaxed mb-8 font-medium min-h-[3rem] line-clamp-2">{p.desc}</p>
              <div className="flex items-center justify-between pt-6 border-t border-white/10"><div className="flex flex-col"><span className="text-[9px] text-zinc-600 font-black uppercase">Asset Value</span><span className="font-black text-white text-lg">{p.price}</span></div></div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default CartTab;
