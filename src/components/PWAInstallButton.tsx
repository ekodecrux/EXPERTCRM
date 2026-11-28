import React, { useState } from 'react';
import { Smartphone, Download, Share, PlusSquare, Check, X, ShieldCheck } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'primary' | 'secondary' | 'badge';
  className?: string;
  label?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'primary',
  className = '',
  label = 'Install Mobile App'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  // If already running in standalone PWA mode, don't show prompt
  if (isInstalled) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
        <Check className="w-3 h-3 text-emerald-600" />
        <span>Installed on Device</span>
      </span>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const accepted = await install();
      if (accepted) {
        setInstallSuccess(true);
        setTimeout(() => setInstallSuccess(false), 4000);
      }
    } else {
      setShowGuide(true);
    }
  };

  const buttonStyle = variant === 'primary'
    ? 'bg-gradient-to-r from-[#14b886] to-[#069468] hover:opacity-95 text-white font-bold text-xs py-2 px-3.5 rounded-xl shadow-sm'
    : variant === 'secondary'
    ? 'bg-[#082458] hover:bg-[#0b347a] text-white font-semibold text-xs py-1.5 px-3 rounded-lg border border-[#1e3a8a]'
    : 'bg-[#eef4fb] hover:bg-[#dceafb] text-[#0b74f0] font-bold text-[10.5px] py-1 px-2.5 rounded-md border border-[#0b74f0]/25';

  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`inline-flex items-center gap-1.5 transition active:scale-95 cursor-pointer ${buttonStyle} ${className}`}
        title="Install the Expert Call Agent app directly to your home screen"
      >
        <Smartphone className="w-3.5 h-3.5" />
        <span>{installSuccess ? 'App Installed!' : label}</span>
      </button>

      {/* Installation Guide Modal (for iOS or browsers when beforeinstallprompt isn't immediately active) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 bg-[#031338]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-[#041845] border border-[#1e3a8a]/60 rounded-3xl p-6 shadow-2xl max-w-sm w-full text-white space-y-4 relative">
            <button
              onClick={() => setShowGuide(false)}
              className="absolute top-4 right-4 p-1.5 text-sky-200 hover:text-white rounded-lg bg-[#082458] transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-[#0b74f0]/25 text-[#16c2ff] border border-[#16c2ff]/30">
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Install Call Agent App</h3>
                <p className="text-[11px] text-[#16c2ff] font-mono">Standalone Home Screen App</p>
              </div>
            </div>

            {isIOS ? (
              <div className="p-3.5 bg-[#031338] rounded-2xl border border-[#1e3a8a]/50 space-y-2 text-xs text-slate-200">
                <span className="text-[10px] font-mono text-[#16c2ff] font-bold uppercase tracking-wider block">
                  Installation on iPhone / iPad:
                </span>
                <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-200">
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-white">1.</span>
                    <span>Tap the <strong className="text-white">Share</strong> button in Safari's bottom toolbar (<Share className="w-3 h-3 inline text-[#16c2ff]" />).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-white">2.</span>
                    <span>Scroll down and tap <strong className="text-white">"Add to Home Screen"</strong> (<PlusSquare className="w-3 h-3 inline text-[#16c2ff]" />).</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="font-bold text-white">3.</span>
                    <span>Tap <strong className="text-white">Add</strong> in the top-right corner to place the app on your home screen.</span>
                  </li>
                </ol>
              </div>
            ) : (
              <div className="p-3.5 bg-[#031338] rounded-2xl border border-[#1e3a8a]/50 space-y-2 text-xs text-slate-200">
                <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                  Instant Installation on Android / PC:
                </span>
                <ol className="list-decimal list-inside space-y-2 text-[11px] text-slate-200">
                  <li>In Chrome or Edge, tap the <strong>Menu (⋮)</strong> icon in the top right corner.</li>
                  <li>Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</li>
                  <li>Confirm installation. The app will launch in full-screen standalone mode with automatic desktop synchronization.</li>
                </ol>
              </div>
            )}

            <div className="p-3 bg-[#082458]/80 rounded-xl border border-[#0b74f0]/40 text-[10.5px] text-sky-100 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-[#16c2ff] shrink-0 mt-0.5" />
              <span>No Play Store download required. Works natively with offline capability, live call sync, and whisper coaching.</span>
            </div>

            <button
              onClick={() => setShowGuide(false)}
              className="w-full py-2.5 bg-gradient-to-r from-[#0b78f4] to-[#005be0] hover:from-[#0768d8] hover:to-[#004ec4] text-white rounded-xl text-xs font-bold transition cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </>
  );
};
