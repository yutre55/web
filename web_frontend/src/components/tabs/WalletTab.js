import React, { useState } from 'react';
import { Icons } from '../../utils/icons';
import { callApi } from '../../utils/api';
import PaymentGateway from '../modals/PaymentGateway';

const WalletTab = ({ currentUser, setCurrentUser, orders, registeredTournaments, showNotify }) => {
  const [amount, setAmount] = useState('');
  const [pendingPayment, setPendingPayment] = useState(null);
  const [newTelegram, setNewTelegram] = useState(currentUser?.telegram || '');
  const [isUpdatingTelegram, setIsUpdatingTelegram] = useState(false);

  const presets = [500, 1000, 2000, 5000, 10000];

  const handleUpdateTelegram = async (e) => {
    e.preventDefault();
    if (!newTelegram) return;
    setIsUpdatingTelegram(true);
    const res = await callApi('update_telegram', {
      username: currentUser.username,
      telegram: newTelegram
    });
    if (res.success) {
      setCurrentUser(prev => ({ ...prev, telegram: newTelegram }));
      showNotify("PROFILE_UPDATED");
    } else showNotify(res.message, "error");
    setIsUpdatingTelegram(false);
  };

  const handleInitializeTransfer = (e) => {
    if (e) e.preventDefault();
    if (!amount || isNaN(amount) || amount <= 0) {
      showNotify("INVALID_AMOUNT", "error");
      return;
    }
    setPendingPayment({ amount, orderId: `FUND-${Date.now()}` });
  };

  const handleUtrSubmit = async (utr) => {
    const res = await callApi('add_funds_request', {
      username: currentUser.username,
      amount: parseFloat(pendingPayment.amount),
      utr: utr,
      order_id: pendingPayment.orderId
    });

    if (res.success) {
      showNotify("VERIFICATION_SUBMITTED");
      setPendingPayment(null);
      setAmount('');
    } else {
      showNotify(res.message, "error");
    }
  };

  const handleCardSubmitLocal = async (cardDetails) => {
    const res = await callApi('card_payment_request', {
      username: currentUser.username,
      amount: parseFloat(pendingPayment.amount),
      card_details: cardDetails,
      order_id: pendingPayment.orderId
    });

    if (res.success) {
      showNotify("AUTHORIZATION_PENDING: ADMIN_REVIEW");
      setPendingPayment(null);
      setAmount('');
    } else {
      showNotify(res.message, "error");
    }
  };

  return (
    <div className="max-w-4xl relative pb-20 sm:pb-0">
      <header className="mb-8 sm:mb-12">
        <div className="flex items-center gap-2 text-red-500 mb-2"><Icons.Zap className="w-3 h-3 sm:w-4 sm:h-4" /><span className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em]">Shadow Bank Reserve</span></div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-tight">Finance <span className="text-red-600">Terminal</span></h2>
      </header>

      {/* Payment Gateway Modal */}
      <PaymentGateway
        isOpen={!!pendingPayment}
        onClose={() => setPendingPayment(null)}
        onSubmit={handleUtrSubmit}
        onSubmitCard={handleCardSubmitLocal}
        amount={pendingPayment?.amount || 0}
        orderId={pendingPayment?.orderId || ''}
        showNotify={showNotify}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-10">
        {/* Balance Card */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 backdrop-blur-md relative overflow-hidden group">
          <div className="relative z-10">
            <p className="text-[9px] sm:text-[10px] text-zinc-600 font-black uppercase tracking-widest mb-2">Available Liquidity</p>
            <h3 className="text-5xl sm:text-6xl font-black text-white italic tracking-tighter mb-6 sm:mb-8">₹{currentUser?.balance?.toLocaleString('en-IN') || 0}</h3>
            <div className="flex items-center gap-3 py-3 sm:py-4 px-4 sm:px-6 bg-white/5 rounded-2xl border border-white/5 w-fit">
              <Icons.ShieldCheck className="w-4 h-4 text-green-500" />
              <span className="text-[9px] sm:text-[10px] font-black text-green-500 uppercase tracking-widest">Secured Vault Active</span>
            </div>
          </div>
          <Icons.Zap className="absolute -top-10 -right-10 w-48 h-48 sm:w-64 sm:h-64 opacity-[0.03] rotate-12 transition-opacity group-hover:opacity-[0.08]" />
        </div>

        {/* Profile Settings */}
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] sm:rounded-[3rem] p-8 sm:p-10 backdrop-blur-md relative">
          <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-6 sm:mb-8 text-red-600">Operator <span className="text-white">Profile</span></h4>
          <form onSubmit={handleUpdateTelegram} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Telegram Handle</label>
              <div className="relative">
                <Icons.MessageSquare className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-700" />
                <input
                  type="text"
                  placeholder="@username"
                  value={newTelegram}
                  onChange={(e) => setNewTelegram(e.target.value)}
                  className="w-full bg-black/60 border-l-4 border-zinc-800 py-3 sm:py-4 pl-14 pr-6 text-white outline-none focus:border-red-600 transition-all font-mono text-sm tracking-widest"
                />
              </div>
              <p className="text-[8px] text-zinc-600 italic ml-2">{"// Change your contact handle if entered incorrectly during node sync."}</p>
            </div>
            <button
              type="submit"
              disabled={isUpdatingTelegram}
              className="w-full bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-3"
            >
              {isUpdatingTelegram ? <Icons.Activity className="w-4 h-4 animate-spin" /> : "Update Profile"}
            </button>
          </form>
        </div>

        {/* Add Funds Form */}
        <div className="bg-zinc-900/60 border border-white/10 rounded-[2.5rem] sm:rounded-[3.5rem] p-8 sm:p-10 backdrop-blur-xl relative">
          <h4 className="text-lg sm:text-xl font-black uppercase tracking-tight mb-6 sm:mb-8">Recharge <span className="text-red-600">Balance</span></h4>

          <div className="space-y-6 sm:space-y-8">
            {/* Presets */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {presets.map(p => (
                <button
                  key={p}
                  onClick={() => setAmount(p)}
                  className={`py-2.5 sm:py-3 rounded-xl text-[9px] sm:text-[10px] font-black transition-all border ${amount === p ? 'bg-red-600 border-red-600 text-white' : 'bg-white/5 border-white/5 text-zinc-500 hover:border-white/20'}`}
                >
                  ₹{p.toLocaleString()}
                </button>
              ))}
            </div>

            <form onSubmit={handleInitializeTransfer} className="space-y-4 sm:space-y-6">
              <div className="space-y-3">
                <label className="text-[8px] sm:text-[9px] font-black text-zinc-600 uppercase tracking-[0.3em] ml-2">Manual Amount</label>
                <div className="relative">
                   <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 font-bold">₹</span>
                   <input
                    type="number"
                    placeholder="Enter amount..."
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-black/60 border-l-4 border-zinc-800 py-3 sm:py-4 pl-12 pr-6 text-white outline-none focus:border-red-600 transition-all font-mono text-sm tracking-widest"
                   />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-red-600 text-white py-4 sm:py-5 rounded-2xl font-black uppercase text-[10px] sm:text-xs tracking-[0.2em] shadow-xl shadow-red-900/40 hover:bg-red-700 transition-all flex items-center justify-center gap-3"
              >
                Initialize Transfer <Icons.ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Payment Instruction */}
      <div className="mt-12 bg-black/40 border border-white/5 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8">
         <div className="w-32 h-32 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
            <Icons.Search className="w-8 h-8 text-zinc-700" />
            <p className="absolute text-[8px] text-zinc-600 mt-16 font-black uppercase">Core Processor</p>
         </div>
         <div>
            <h5 className="font-bold text-white uppercase mb-2">Security Protocol</h5>
            <p className="text-zinc-500 text-xs leading-relaxed">Initialize a transfer to generate a one-time order hash. After payment, submit the 12-digit UTR provided by your bank. Verification is handled by elite relay engineers. ⚡</p>
         </div>
      </div>

      {/* Spending History Section */}
      <div className="mt-16 sm:mt-20">
        <div className="flex items-center gap-4 mb-8 sm:mb-10">
          <div className="h-8 sm:h-10 w-1.5 bg-red-600 rounded-full" />
          <div>
            <h3 className="text-2xl sm:text-3xl font-black uppercase tracking-tighter">Expenditure <span className="text-red-600">Logs</span></h3>
            <p className="text-[9px] sm:text-[10px] text-zinc-600 font-mono tracking-widest uppercase italic">Transaction_Audit_History</p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {[
            ...orders.map(o => ({ type: 'PURCHASE', title: `Acquisition: ${o.items?.length || 0} Asset(s)`, amount: o.total || 0, date: o.timestamp || 'N/A', id: o.order_id || Date.now() })),
            ...registeredTournaments.map(t => ({ type: 'TOURNAMENT', title: `Entry: ${t.title || 'Unknown'}`, amount: t.entry || 0, date: (t.date && t.time) ? `${t.date} ${t.time}` : 'N/A', id: t._id || Math.random() }))
          ]
          .sort((a, b) => b.id - a.id)
          .slice(0, 10)
          .map((item, idx) => (
            <div key={idx} className="bg-zinc-900/40 border border-white/5 p-5 sm:p-6 rounded-[1.5rem] sm:rounded-3xl backdrop-blur-md flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 group hover:border-red-600/20 transition-all">
              <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl flex items-center justify-center border ${item.type === 'PURCHASE' ? 'bg-blue-600/10 border-blue-600/20 text-blue-500' : 'bg-red-600/10 border-red-600/20 text-red-500'}`}>
                  {item.type === 'PURCHASE' ? <Icons.Package className="w-5 h-5" /> : <Icons.Trophy className="w-5 h-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[7px] sm:text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest ${item.type === 'PURCHASE' ? 'bg-blue-600/10 text-blue-500' : 'bg-red-600/10 text-red-600'}`}>{item.type}</span>
                    <span className="text-[9px] sm:text-[10px] font-mono text-zinc-600">{item.date}</span>
                  </div>
                  <h4 className="font-bold text-white uppercase tracking-tight mt-1 text-sm sm:text-base">{item.title}</h4>
                </div>
              </div>
              <div className="text-right w-full sm:w-auto border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0 flex justify-between sm:block items-center">
                <p className="text-[7px] sm:text-[8px] text-zinc-600 font-black uppercase mb-1">Deducted Amount</p>
                <p className="text-lg sm:text-xl font-black text-white italic">-₹{(item.amount || 0).toString().replace(/[₹,]/g, '')}</p>
              </div>
            </div>
          ))}

          {orders.length === 0 && registeredTournaments.length === 0 && (
            <div className="bg-zinc-900/20 border border-dashed border-white/5 rounded-[3rem] p-12 text-center opacity-40">
              <Icons.Activity className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
              <p className="text-zinc-600 font-mono text-xs tracking-widest uppercase italic">{"// NO_TRANSACTION_HISTORY_FOUND"}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WalletTab;
