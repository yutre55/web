import React from 'react';
import { Icons } from '../../utils/icons';

const BgmiArenaTab = ({ tournaments, registeredTournaments, handleRegisterTournament, currentUser }) => {
  return (
    <>
      <header className="mb-12">
        <h2 className="text-4xl lg:text-5xl font-black uppercase tracking-tighter">BGMI <span className="text-red-600">Arena</span></h2>
      </header>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tournaments.map((t) => (
          <div key={t._id} className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md relative overflow-hidden group">
            <div className="flex justify-between items-start mb-6">
              <div className="px-3 py-1 bg-red-600/10 border border-red-600/20 rounded-full"><span className="text-[9px] font-black text-red-600 uppercase tracking-widest">{t.mode} // {t.map}</span></div>
              <div className="text-right"><p className="text-[8px] text-zinc-600 font-black uppercase">Prize Pool</p><p className="text-lg font-black text-green-500 italic">{t.prize}</p></div>
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-6 group-hover:text-red-600 transition-colors">{t.title}</h3>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center"><p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Entry Fee</p><p className="text-sm font-bold">{t.entry}</p></div>
              <div className="bg-black/40 p-4 rounded-2xl border border-white/5 text-center"><p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Time (IST)</p><p className="text-sm font-bold">{t.time}</p></div>
            </div>
            <div className="flex items-center justify-between mb-8 px-2">
              <div className="flex items-center gap-2"><Icons.Users className="w-4 h-4 text-zinc-600" /><span className="text-xs font-bold text-zinc-400">{t.slots || "0/100"} Slots</span></div>
              <div className="flex items-center gap-2"><Icons.Target className="w-4 h-4 text-zinc-600" /><span className="text-xs font-bold text-zinc-400">{t.date}</span></div>
            </div>
            <button onClick={() => handleRegisterTournament(t)} disabled={registeredTournaments.some(reg => reg._id === t._id)} className={`w-full py-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${registeredTournaments.some(reg => reg._id === t._id) ? 'bg-green-500/10 text-green-500 border border-green-500/20 cursor-not-allowed' : 'bg-white text-black hover:bg-red-600 hover:text-white'}`}>
              {registeredTournaments.some(reg => reg._id === t._id) ? 'Squad Deployed' : 'Register Squad'}
            </button>
            <p className="text-[7px] text-zinc-600 font-mono mt-4 text-center uppercase tracking-widest">Room ID/Pass will be sent 30m before match</p>
          </div>
        ))}
      </div>
      <div className="mt-20">
        <div className="flex items-center gap-4 mb-10"><div className="h-10 w-1.5 bg-red-600 rounded-full" /><div><h3 className="text-3xl font-black uppercase tracking-tighter">Combat <span className="text-red-600">History</span></h3><p className="text-[10px] text-zinc-600 font-mono tracking-widest">LOGGED_FOR: @{currentUser?.username}</p></div></div>
        {registeredTournaments.length === 0 ? <div className="bg-zinc-900/20 border border-dashed border-white/5 rounded-[3rem] p-12 text-center opacity-40"><Icons.Target className="w-12 h-12 text-zinc-800 mx-auto mb-4" /><p className="text-zinc-600 font-mono text-xs tracking-widest uppercase italic">// NO_COMBAT_HISTORY_FOUND</p></div> : (
          <div className="space-y-4">
            {registeredTournaments.map(reg => (
              <div key={`reg-${reg._id}`} className="bg-zinc-900/60 border-l-4 border-red-600 p-6 sm:p-8 rounded-r-3xl backdrop-blur-md flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 group hover:bg-zinc-900/80 transition-all">
                <div className="space-y-2"><div className="flex items-center gap-3"><span className="text-[10px] font-black text-red-500 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">CONFIRMED</span><span className="text-[10px] font-mono text-zinc-600">OPERATOR: @{currentUser?.username}</span></div><h4 className="text-xl font-bold uppercase tracking-tight">{reg.title}</h4><p className="text-xs text-zinc-500">Scheduled for {reg.date} @ {reg.time} IST • {reg.map} ({reg.mode})</p></div>
                <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/10"><p className="text-[8px] text-zinc-600 font-black uppercase mb-1">Status</p><p className="text-[10px] font-black text-green-500 uppercase tracking-widest">Waiting for Credentials</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default BgmiArenaTab;
