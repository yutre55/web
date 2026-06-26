import React from 'react';
import { Icons } from '../../utils/icons';

const InstallTab = () => {
  return (
    <div className="max-w-4xl mx-auto py-10">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-red-500 mb-2">
          <Icons.Shield className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Development Phase v1.0</span>
        </div>
        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-tight">
          Android <span className="text-red-600">APK System</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase mb-4 italic">Shadow <span className="text-red-600">Mobile</span></h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
              We are finalizing the dedicated Android APK. Once deployed, you will be able to download the native terminal directly from this hub.
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                <Icons.Activity className="w-4 h-4 text-red-600 animate-pulse" /> Compilation in progress
              </li>
              <li className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                <Icons.Zap className="w-4 h-4 text-zinc-600" /> Native Node Sync Pending
              </li>
            </ul>

            <button
              disabled
              className="w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 bg-zinc-800 text-zinc-500 border border-white/5 cursor-not-allowed"
            >
              <Icons.Activity className="w-5 h-5" /> COMING SOON
            </button>
          </div>
          <Icons.Cpu className="absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] rotate-12" />
        </div>

        <div className="bg-zinc-900/60 border border-white/10 rounded-[2rem] p-8">
          <h4 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
            <Icons.Info className="w-4 h-4" /> Next Steps
          </h4>
          <div className="space-y-6">
            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-red-600">01</span>
              <div>
                <p className="text-xs font-bold uppercase text-white mb-1">APK Packaging</p>
                <p className="text-[10px] text-zinc-500 leading-relaxed italic">Our team is integrating the web-to-native sync protocol into the final build.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-red-600">02</span>
              <div>
                <p className="text-xs font-bold uppercase text-white mb-1">Security Audit</p>
                <p className="text-[10px] text-zinc-500 leading-relaxed italic">Testing secure credential storage within the standalone APK sandbox.</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-red-600">03</span>
              <div>
                <p className="text-xs font-bold uppercase text-white mb-1">Deployment</p>
                <p className="text-[10px] text-zinc-500 leading-relaxed italic">Download links will be activated automatically once the build passes all relay checks.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 p-8 border border-red-600/10 bg-red-600/5 rounded-3xl flex items-center gap-6">
        <Icons.Activity className="w-10 h-10 text-red-600/30" />
        <p className="text-[10px] text-zinc-500 font-mono leading-relaxed uppercase tracking-widest italic">
          {"// System Note: Native Android support is currently under active development. Standby for deployment signals."}
        </p>
      </div>
    </div>
  );
};

export default InstallTab;
