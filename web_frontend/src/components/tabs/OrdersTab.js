import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from '../../utils/icons';

const OrdersTab = ({ orders }) => {
  return (
    <>
      <header className="mb-12"><motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}><div className="flex items-center gap-2 text-red-500 mb-2"><Icons.Package className="w-4 h-4" /><span className="text-[10px] font-black uppercase tracking-[0.4em]">Encrypted Order History</span></div><h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase">Order <span className="text-red-600">History</span></h2></motion.div></header>
      {orders.length === 0 ? <div className="h-[50vh] flex flex-col items-center justify-center text-zinc-600 opacity-20"><Icons.Activity className="w-16 h-16 mb-4" /><p className="font-mono text-sm tracking-widest uppercase">NO_ACTIVE_ORDERS</p></div> : (
        <div className="space-y-6">
          {orders.map(order => (
            <div key={order.order_id} className="bg-zinc-900/40 border border-white/5 rounded-3xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden group">
              <div className="flex flex-col lg:flex-row justify-between gap-6 relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3"><span className="text-[10px] font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">{order.order_id}</span><span className="text-[10px] font-mono text-zinc-500">{order.timestamp}</span></div>
                  <h3 className="text-xl font-bold uppercase tracking-tight">Acquisition of {order.items.length} Asset{order.items.length > 1 ? 's' : ''}</h3>
                  <div className="flex flex-wrap gap-2">{order.items.map((item, idx) => <span key={idx} className="text-[8px] font-black text-zinc-400 bg-white/5 px-2 py-1 rounded uppercase tracking-widest border border-white/5">{item.name}</span>)}</div>
                </div>
                <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-4 border-t lg:border-t-0 lg:border-l border-white/10 pt-4 lg:pt-0 lg:pl-8">
                  <div className="text-left lg:text-right"><p className="text-[9px] text-zinc-600 font-black uppercase tracking-widest">Transaction Value</p><p className="text-2xl font-black text-white italic">₹{order.total}</p></div>
                  <div className="flex items-center gap-2"><div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /><span className="text-[10px] font-black text-green-500 uppercase tracking-widest">{order.status}</span></div>
                </div>
              </div>
              <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity"><Icons.Shield className="w-32 h-32 rotate-12" /></div>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default OrdersTab;
