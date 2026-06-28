import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../utils/icons';

const ImageZoomModal = ({ isOpen, onClose, imageUrl, altText }) => {
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });

  if (!isOpen) return null;

  // Desktop Hover Zoom Logic
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${imageUrl})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%' // Zoom level
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ display: 'none' });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-2xl overflow-hidden"
      >
        <motion.div
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "100%", opacity: 0 }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative bg-zinc-900 border-t sm:border border-white/10 w-full max-w-5xl h-full sm:h-auto sm:rounded-[2.5rem] flex flex-col lg:flex-row shadow-2xl overflow-y-auto sm:overflow-hidden"
        >
          {/* Mobile Handle / Close Button */}
          <div className="flex items-center justify-between p-6 sm:hidden border-b border-white/5 sticky top-0 bg-zinc-900 z-20">
             <h3 className="text-sm font-black uppercase tracking-widest text-white">Asset Preview</h3>
             <button onClick={onClose} className="p-2 bg-white/5 rounded-full text-zinc-400">
               <Icons.X className="w-5 h-5" />
             </button>
          </div>

          {/* Desktop Close Button */}
          <button
            onClick={onClose}
            className="absolute top-8 right-8 p-2.5 bg-black/40 hover:bg-red-600 rounded-full text-white/50 hover:text-white transition-all z-30 hidden sm:block border border-white/5"
          >
            <Icons.X className="w-6 h-6" />
          </button>

          {/* Left: Image Section (Mobile: Top) */}
          <div className="flex-1 bg-black/20 relative group overflow-hidden flex flex-col">
             <div
               className="relative flex-1 min-h-[50vh] sm:min-h-[600px] flex items-center justify-center cursor-zoom-in sm:cursor-crosshair"
               onMouseMove={handleMouseMove}
               onMouseLeave={handleMouseLeave}
             >
                {/* Mobile: Pinch-to-Zoom enabled image */}
                <motion.img
                  drag
                  dragConstraints={{ left: -300, right: 300, top: -300, bottom: 300 }}
                  whileTap={{ scale: 1.2 }}
                  src={imageUrl}
                  alt={altText}
                  className="w-full h-full object-contain p-4 sm:p-12 transition-transform duration-200"
                />

                {/* Desktop: Zoom Glass Overlay */}
                <div
                  className="absolute inset-0 pointer-events-none hidden lg:block"
                  style={{
                    ...zoomStyle,
                    backgroundColor: '#09090b',
                    zIndex: 10
                  }}
                />
             </div>

             {/* Interaction Hint */}
             <div className="p-4 bg-black/40 border-t border-white/5 text-center">
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em] block sm:hidden">
                  Tap & Hold to Zoom | Drag to Pan
                </p>
                <p className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em] hidden sm:block">
                  Hover to Magnify | Drag to Pan Detail
                </p>
             </div>
          </div>

          {/* Right: Product Info (Mobile: Bottom) */}
          <div className="w-full lg:w-[400px] p-8 sm:p-12 flex flex-col bg-zinc-900 border-l border-white/5 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-[9px] font-black text-red-500 bg-red-600/10 px-3 py-1.5 rounded-full uppercase tracking-widest border border-red-500/20">Security_Verified</span>
                <span className="text-[9px] font-black text-zinc-500 bg-white/5 px-3 py-1.5 rounded-full uppercase tracking-widest border border-white/10">v4.2</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter text-white mb-4 leading-none">{altText}</h2>
              <div className="h-1.5 w-16 bg-red-600 mb-8 rounded-full" />

              <div className="space-y-6">
                 <div>
                    <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-2">Technical Summary</h4>
                    <p className="text-zinc-400 text-sm leading-relaxed font-medium">
                      High-integrity cryptographic asset optimized for multi-node deployments. Features advanced stealth protocols and real-time telemetry monitoring.
                    </p>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-[8px] text-zinc-500 font-black uppercase mb-1">Status</p>
                       <p className="text-xs font-bold text-green-500 uppercase">Operational</p>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                       <p className="text-[8px] text-zinc-500 font-black uppercase mb-1">Origin</p>
                       <p className="text-xs font-bold text-white uppercase">Shadow_V4</p>
                    </div>
                 </div>
              </div>
            </div>

            <div className="mt-12 space-y-3">
                <button
                  onClick={onClose}
                  className="w-full bg-red-600 hover:bg-red-700 text-white py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-xl shadow-red-900/20"
                >
                  Confirm Asset Details
                </button>
                <button
                  onClick={onClose}
                  className="w-full bg-white/5 hover:bg-white/10 text-zinc-400 py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all"
                >
                  Close Terminal
                </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageZoomModal;
