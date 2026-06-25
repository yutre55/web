import React, { useState, useEffect } from 'react';
import { Icons } from '../../utils/icons';

const InstallTab = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert("Installation is only supported on Chrome, Edge, and mobile browsers. If you are on Android, look for 'Add to Home Screen' in your browser menu.");
      return;
    }
    // Show the prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
    } else {
      console.log('User dismissed the install prompt');
    }
    // We've used the prompt, and can't use it again, throw it away
    setDeferredPrompt(null);
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <header className="mb-12">
        <div className="flex items-center gap-2 text-red-500 mb-2">
          <Icons.Shield className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Native Deployment v1.0</span>
        </div>
        <h2 className="text-4xl lg:text-5xl font-black tracking-tighter uppercase leading-tight">
          Install <span className="text-red-600">Shadow Market</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 backdrop-blur-md relative overflow-hidden group">
          <div className="relative z-10">
            <h3 className="text-2xl font-black uppercase mb-4 italic">Web-to-APK <span className="text-red-600">Sync</span></h3>
            <p className="text-zinc-500 text-sm leading-relaxed mb-8">
              Convert this web interface into a standalone application. Installing the PWA (Progressive Web App) allows you to bypass browser address bars and stay connected with native speed.
            </p>

            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Full Screen Immersion
              </li>
              <li className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Home Screen Icon Access
              </li>
              <li className="flex items-center gap-3 text-xs font-bold text-zinc-400">
                <div className="w-1.5 h-1.5 bg-red-600 rounded-full" /> Secure Sandbox Environment
              </li>
            </ul>

            <button
              onClick={handleInstallClick}
              disabled={isInstalled}
              className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center justify-center gap-3 ${
                isInstalled
                ? 'bg-green-600/20 text-green-500 border border-green-600/20'
                : 'bg-red-600 text-white shadow-xl shadow-red-900/40 hover:bg-red-700'
              }`}
            >
              {isInstalled ? (
                <><Icons.ShieldCheck className="w-5 h-5" /> Already Installed</>
              ) : (
                <><Icons.Zap className="w-5 h-5" /> Deploy as APK</>
              )}
            </button>
          </div>
          <Icons.Cpu className="absolute -bottom-10 -right-10 w-48 h-48 opacity-[0.03] rotate-12" />
        </div>

        <div className="space-y-6">
          <div className="bg-zinc-900/60 border border-white/10 rounded-[2rem] p-8">
            <h4 className="text-sm font-black uppercase tracking-widest text-zinc-500 mb-6 flex items-center gap-2">
              <Icons.Info className="w-4 h-4" /> Installation Guide
            </h4>
            <div className="space-y-6">
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-red-600">01</span>
                <div>
                  <p className="text-xs font-bold uppercase text-white mb-1">Android / Chrome</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed italic">Click the 'Deploy as APK' button or tap the three dots in your browser and select 'Install App' or 'Add to Home Screen'.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-red-600">02</span>
                <div>
                  <p className="text-xs font-bold uppercase text-white mb-1">iOS (iPhone/iPad)</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed italic">Tap the 'Share' icon (square with arrow up) at the bottom, scroll down, and tap 'Add to Home Screen'.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <span className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-red-600">03</span>
                <div>
                  <p className="text-xs font-bold uppercase text-white mb-1">Desktop</p>
                  <p className="text-[10px] text-zinc-500 leading-relaxed italic">Click the install icon in the right side of the address bar to run Shadow Market as a separate window.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 p-8 border border-red-600/10 bg-red-600/5 rounded-3xl flex items-center gap-6">
        <Icons.Activity className="w-10 h-10 text-red-600/30" />
        <p className="text-[10px] text-zinc-500 font-mono leading-relaxed uppercase tracking-widest italic">
          {"// System Note: Progressive Web Apps (PWA) act exactly like native APKs but are more secure and always up-to-date with the core server."}
        </p>
      </div>
    </div>
  );
};

export default InstallTab;
