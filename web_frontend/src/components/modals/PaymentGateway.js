import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from '../../utils/icons';
import { API_BASE_URL } from '../../utils/api';

const PaymentGateway = ({ isOpen, onClose, onSubmit, amount, orderId, showNotify }) => {
  const [timeLeft, setTimeLeft] = useState(300);
  const [utr, setUtr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('UPI');
  const [qrKey, setQrKey] = useState(Date.now());
  const [qrBlobUrl, setQrBlobUrl] = useState(null);
  const [qrError, setQrError] = useState(false);

  useEffect(() => {
    const fetchQR = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/qr.png?v=${qrKey}`, {
          headers: {
            'ngrok-skip-browser-warning': 'true'
          }
        });
        if (response.ok) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          setQrBlobUrl(url);
          setQrError(false);
        } else {
          setQrError(true);
        }
      } catch (err) {
        console.error("QR Fetch Error:", err);
        setQrError(true);
      }
    };

    if (isOpen) {
      fetchQR();
    }

    return () => {
      if (qrBlobUrl) URL.revokeObjectURL(qrBlobUrl);
    };
  }, [isOpen, qrKey]);

  useEffect(() => {
    let timer;
    if (isOpen && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft === 0) {
      onClose();
      if (showNotify) showNotify("SESSION_EXPIRED", "error");
    }
    return () => clearInterval(timer);
  }, [isOpen, timeLeft]);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  const paymentMethods = [
    { id: 'UPI', label: 'UPI / QR', icon: 'Zap' },
    { id: 'CARD', label: 'Cards', icon: 'Lock' },
    { id: 'NET', label: 'NetBank', icon: 'Database' }
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 bg-black/95 backdrop-blur-sm">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="relative w-full max-w-[550px] bg-[#0A0A0A] rounded-[1rem] sm:rounded-[1.5rem] overflow-hidden flex flex-col shadow-[0_0_80px_rgba(239,68,68,0.15)] border border-white/10">

        {/* Compact Header */}
        <div className="bg-red-600 px-4 sm:px-6 py-2 sm:py-3 flex justify-between items-center relative overflow-hidden">
           <div className="flex items-center gap-2 sm:gap-3 relative z-10">
              <Icons.Shield className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              <div className="flex flex-col">
                 <h2 className="text-white font-black text-[8px] sm:text-[10px] tracking-widest uppercase italic leading-tight">Secure Node Gateway</h2>
                 <p className="text-white/80 text-[7px] sm:text-[8px] font-mono font-bold tracking-widest uppercase">Tr ID: {orderId}</p>
              </div>
           </div>
           <div className="flex items-center gap-3 sm:gap-4 relative z-10">
              <span className="text-[9px] sm:text-[10px] text-white font-black">{formatTime(timeLeft)}</span>
              <button onClick={onClose} className="text-white/60 hover:text-white transition-colors"><Icons.X className="w-4 h-4" /></button>
           </div>
        </div>

        <div className="flex flex-col sm:flex-row overflow-hidden max-h-[85vh] sm:max-h-none overflow-y-auto">
          {/* Sidebar / Tabs - Horizontal on Mobile */}
          <div className="w-full sm:w-[140px] bg-[#080808] border-b sm:border-b-0 sm:border-r border-white/5 p-2 sm:p-4 flex flex-row sm:flex-col gap-2 overflow-x-auto">
             <p className="hidden sm:block text-[7px] text-zinc-600 font-black uppercase tracking-widest mb-2">Methods</p>
             {paymentMethods.map(method => (
                <button
                  key={method.id}
                  onClick={() => setSelectedMethod(method.id)}
                  className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-lg sm:rounded-xl transition-all border shrink-0 ${selectedMethod === method.id ? 'bg-red-600/10 border-red-600/30' : 'hover:bg-white/5 border-transparent opacity-60'}`}
                >
                   <div className={`${selectedMethod === method.id ? 'text-red-500' : 'text-zinc-500'}`}>
                      {Icons[method.icon] ? React.createElement(Icons[method.icon], { className: "w-3 h-3 sm:w-4 sm:h-4" }) : <Icons.Zap className="w-3 h-3 sm:w-4 sm:h-4" />}
                   </div>
                   <p className={`text-[8px] sm:text-[9px] font-black uppercase tracking-tighter ${selectedMethod === method.id ? 'text-white' : 'text-zinc-500'}`}>{method.label}</p>
                </button>
             ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-[#0A0A0A] p-4 sm:p-6 flex flex-col items-center justify-center">
             {selectedMethod === 'UPI' ? (
                <div className="w-full max-w-[280px] space-y-4 sm:space-y-6">

                   {/* QR Code Container */}
                   <div className="relative mx-auto w-fit">
                      <div className="absolute -inset-8 bg-red-600/10 blur-[40px] opacity-30 transition-opacity" />
                      <div className="relative bg-white p-1.5 rounded-lg shadow-2xl mx-auto flex items-center justify-center overflow-hidden w-48 h-48 sm:w-64 sm:h-64">
                         {qrError ? (
                           <div className="flex flex-col items-center justify-center text-zinc-400 gap-1">
                             <Icons.AlertTriangle className="w-6 h-6 text-red-500" />
                             <p className="text-[8px] font-black uppercase">QR_NOT_FOUND</p>
                           </div>
                         ) : qrBlobUrl ? (
                           <img
                            src={qrBlobUrl}
                            alt="PAYMENT_QR"
                            style={{ imageRendering: 'pixelated' }}
                            className="w-full h-full object-contain block transition-all"
                           />
                         ) : (
                           <div className="animate-pulse flex items-center justify-center">
                             <Icons.Activity className="w-6 h-6 text-zinc-200 animate-spin" />
                           </div>
                         )}
                      </div>
                      <p className="text-center mt-4 text-[8px] font-black text-zinc-500 uppercase tracking-[0.3em] italic">Scan using any UPI application</p>
                   </div>

                   <div className="space-y-3 sm:space-y-4">
                      <div className="bg-[#111] border border-white/5 rounded-xl sm:rounded-2xl p-3 sm:p-4 text-center">
                         <p className="text-[7px] sm:text-[8px] text-zinc-500 font-black uppercase mb-1">Payable Amount</p>
                         <p className="text-2xl sm:text-3xl font-black text-white italic tracking-tighter">₹{parseFloat(amount).toLocaleString('en-IN')}</p>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); setIsSubmitting(true); onSubmit(utr); }} className="space-y-3 sm:space-y-4">
                         <div className="space-y-1 sm:space-y-2">
                            <label className="text-[7px] sm:text-[8px] font-black text-zinc-600 uppercase tracking-widest text-center block">12-Digit Transaction UTR</label>
                            <input
                             required
                             type="text"
                             maxLength={12}
                             placeholder="UTR NUMBER"
                             value={utr}
                             onChange={(e) => setUtr(e.target.value.replace(/\D/g, ''))}
                             className="w-full bg-black border border-zinc-800 py-2 sm:py-3 px-4 text-center text-base sm:text-lg font-mono tracking-[0.2em] sm:tracking-[0.3em] text-red-500 outline-none focus:border-red-600 rounded-lg sm:rounded-xl"
                            />
                         </div>

                         <button
                           type="submit"
                           disabled={utr.length !== 12 || isSubmitting}
                           className="w-full bg-red-600 h-10 sm:h-12 rounded-lg sm:rounded-xl font-black uppercase text-[9px] sm:text-[10px] tracking-widest shadow-lg shadow-red-900/20 hover:bg-red-700 disabled:opacity-30 transition-all flex items-center justify-center gap-2 text-white"
                         >
                            {isSubmitting ? <Icons.Activity className="w-4 h-4 animate-spin" /> : <>Finalize Settlement <Icons.ShieldCheck className="w-4 h-4" /></>}
                         </button>
                      </form>
                   </div>
                </div>
             ) : (
                <div className="text-center opacity-20">
                   <Icons.Lock className="w-10 h-10 mx-auto mb-2" />
                   <p className="text-[9px] font-black uppercase">MAINTENANCE</p>
                </div>
             )}
          </div>
        </div>

        {/* Minimal Footer */}
        <div className="bg-[#080808] border-t border-white/5 px-6 py-2 flex justify-between items-center opacity-30">
           <p className="text-[7px] font-black text-zinc-600 uppercase tracking-widest italic">SECURE_GATEWAY_V4.2</p>
           <Icons.ShieldCheck className="w-3 h-3 text-green-500" />
        </div>

      </motion.div>
    </motion.div>
  );
};

export default PaymentGateway;
