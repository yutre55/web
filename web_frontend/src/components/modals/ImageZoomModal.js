import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../utils/icons';

const ImageZoomModal = ({ isOpen, onClose, imageUrl, altText }) => {
  const [zoomStyle, setZoomStyle] = useState({ display: 'none' });
  const constraintsRef = useRef(null);

  if (!isOpen) return null;

  // Desktop-Only Hover Zoom Logic
  const handleMouseMove = (e) => {
    // Only trigger if screen is large (lg breakpoint)
    if (window.innerWidth < 1024) return;

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left) / width) * 100;
    const y = ((e.pageY - top) / height) * 100;
    setZoomStyle({
      display: 'block',
      backgroundImage: `url(${imageUrl})`,
      backgroundPosition: `${x}% ${y}%`,
      backgroundSize: '250%'
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
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-2xl overflow-hidden"
      >
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="relative bg-zinc-900 w-full h-full sm:h-[90vh] sm:max-w-6xl sm:rounded-[2.5rem] flex flex-col lg:flex-row shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 sm:p-8 border-b border-white/5 bg-zinc-900/80 backdrop-blur-md z-30">
             <div className="flex flex-col">
                <span className="text-[8px] font-black text-red-500 uppercase tracking-[0.3em] mb-1">Asset_Viewer</span>
                <h3 className="text-xs sm:text-lg font-black uppercase tracking-widest text-white truncate max-w-[200px] sm:max-w-none">{altText}</h3>
             </div>
             <button onClick={onClose} className="p-3 bg-white/5 hover:bg-red-600 rounded-xl text-zinc-400 hover:text-white transition-all border border-white/5">
               <Icons.X className="w-5 h-5" />
             </button>
          </div>

          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Image Display Area */}
            <div className="flex-1 relative bg-black/40 flex items-center justify-center p-4 sm:p-0 overflow-hidden" ref={constraintsRef}>

                {/* Desktop-ONLY Magnifying Glass (Hidden on mobile via 'hidden lg:block') */}
                <div
                  className="absolute inset-0 pointer-events-none hidden lg:block z-20"
                  style={zoomStyle}
                />

                {/* Interaction Area */}
                <div
                  className="relative w-full h-full flex items-center justify-center cursor-default lg:cursor-crosshair"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                >
                    <motion.img
                      drag
                      dragConstraints={constraintsRef}
                      dragElastic={0.1}
                      whileTap={{ scale: 1.1 }}
                      src={imageUrl}
                      alt={altText}
                      className="max-w-full max-h-full object-contain pointer-events-auto shadow-2xl"
                      style={{ touchAction: 'none' }}
                    />
                </div>

                {/* Interaction Instruction Overlay */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/60 backdrop-blur-md border border-white/5 rounded-full z-10 pointer-events-none">
                    <p className="text-[8px] font-black text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                        <span className="lg:hidden">Drag to Pan Asset</span>
                        <span className="hidden lg:inline">Hover to Magnify | Drag to Pan</span>
                    </p>
                </div>
            </div>

            {/* Details Section */}
            <div className="w-full lg:w-[380px] bg-zinc-900 border-t lg:border-t-0 lg:border-l border-white/10 p-6 sm:p-10 flex flex-col overflow-y-auto max-h-[40vh] lg:max-h-none">
                <div className="flex-1 space-y-8">
                    <div className="space-y-4">
                        <div className="h-1 w-12 bg-red-600 rounded-full" />
                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Encrypted Technical Specs</h4>
                        <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed font-medium">
                            This asset is verified for high-stakes operations. Optimized for speed and stealth in shadow market environments.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[7px] text-zinc-500 font-black uppercase block mb-1">Integrity</span>
                            <span className="text-[10px] font-bold text-white">100% SECURE</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                            <span className="text-[7px] text-zinc-500 font-black uppercase block mb-1">Network</span>
                            <span className="text-[10px] font-bold text-white">V4 PROTOCOL</span>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/5">
                    <button
                        onClick={onClose}
                        className="w-full bg-white text-black py-4 rounded-xl font-black uppercase text-[10px] tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all shadow-xl shadow-white/5"
                    >
                        Return to Terminal
                    </button>
                </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ImageZoomModal;
