import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2, VolumeX, Pause, Play, 
  RotateCcw, Check, CheckCircle2, AlertTriangle, ShieldCheck, ShieldAlert,
  Smartphone, Wifi, Battery, Clock, Users, History, Settings, Sparkles, 
  ArrowLeft, Download, QrCode, RefreshCw, Send, Radio, Lock, Zap, FileText,
  UserCheck, ExternalLink, X, ChevronRight, MessageSquare
} from 'lucide-react';
import { CallAgent, CallLog, Lead } from '../types';
import { downloadExpertCallAgentApk } from '../utils/apkDownloader';
import { PWAInstallButton } from './PWAInstallButton';

interface CallAgentMobileAppProps {
  agents: CallAgent[];
  activeAgentId: string;
  onSelectAgent?: (agentId: string) => void;
  leads: Lead[];
  onCallSynced: (newLog: Omit<CallLog, 'id'>) => void;
  onClose?: () => void;
  isStandalone?: boolean;
}

export default function CallAgentMobileApp({
  agents,
  activeAgentId,
  onSelectAgent,
  leads,
  onCallSynced,
  onClose,
  isStandalone = false
}: CallAgentMobileAppProps) {
  // Current active agent
  const currentAgent = agents.find(a => a.id === activeAgentId) || agents[0] || {
    id: 'AGT-101',
    name: 'Rohan Sharma',
    email: 'rohan@expertcrm.com',
    phone: '+91 98201 55678',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    device: 'Samsung Galaxy S24 Ultra (Android 14)',
    deviceId: 'AND-SM-S928B-01',
    appVersion: 'v2.4.2 (Production)',
    pairingToken: 'EXP-88219',
    isAuthorized: true,
    status: 'Available' as const,
    metrics: { totalCalls: 28, connectedCalls: 22, talkTimeMinutes: 84, missedCalls: 6, avgDurationSecs: 229 },
    lastSyncTime: 'Just now',
    batteryLevel: 91,
    assignedCampaign: 'Enterprise Inbound & Outbound Key Deals'
  };

  // Mobile App Navigation tabs
  const [mobileTab, setMobileTab] = useState<'dialer' | 'leads' | 'history' | 'settings'>('dialer');
  
  // Call States
  const [dialNumber, setDialNumber] = useState('');
  const [dialContactName, setDialContactName] = useState('');
  const [callState, setCallState] = useState<'idle' | 'calling' | 'connected' | 'disposition'>('idle');
  const [callSeconds, setCallSeconds] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  const [isOnHold, setIsOnHold] = useState(false);
  const [isRecording, setIsRecording] = useState(true);

  // Disposition & Wrap-up
  const [disposition, setDisposition] = useState<'Interested' | 'Follow Up' | 'Meeting Demo Booked' | 'Not Interested' | 'Left Voicemail' | 'Wrong Number' | 'Deal Closed'>('Interested');
  const [callNotes, setCallNotes] = useState('');
  const [syncingState, setSyncingState] = useState<'idle' | 'syncing' | 'synced'>('idle');

  // Agent Status Switcher
  const [agentStatus, setAgentStatus] = useState<CallAgent['status']>(currentAgent.status || 'Available');
  
  // Manager Live Whisper Banner (if manager sent guidance)
  const [incomingWhisper, setIncomingWhisper] = useState<string | null>(null);
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);
  const [authAlert, setAuthAlert] = useState<string | null>(null);

  // Local call history in mobile app
  const [mobileCallHistory, setMobileCallHistory] = useState<{
    id: string;
    clientName: string;
    phone: string;
    duration: string;
    time: string;
    type: 'Answered' | 'Missed';
    disposition: string;
    synced: boolean;
  }[]>([
    { id: 'MC-1', clientName: 'John Doe (Bluestone)', phone: '9876543210', duration: '2m 15s', time: '10:15 AM', type: 'Answered', disposition: 'Interested', synced: true },
    { id: 'MC-2', clientName: 'Preeti Sharma (Apex)', phone: '9123456789', duration: '0m 0s', time: '09:40 AM', type: 'Missed', disposition: 'Callback Requested', synced: true },
    { id: 'MC-3', clientName: 'Amit Patel (Hindustan Logs)', phone: '9456712390', duration: '5m 12s', time: 'Yesterday', type: 'Answered', disposition: 'Deal Closed', synced: true },
  ]);

  // Audio Context Ref for Real phone call sound effects
  const audioCtxRef = useRef<AudioContext | null>(null);
  const ringOscRef = useRef<OscillatorNode | null>(null);
  const ringIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Clock for phone status bar
  const [currentTimeStr, setCurrentTimeStr] = useState(() => {
    const d = new Date();
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  });

  useEffect(() => {
    const t = setInterval(() => {
      const d = new Date();
      setCurrentTimeStr(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }, 10000);
    return () => clearInterval(t);
  }, []);

  // Sync agent status when prop changes
  useEffect(() => {
    if (currentAgent.status) {
      setAgentStatus(currentAgent.status);
    }
  }, [currentAgent.status]);

  // Listen for manager whisper messages
  useEffect(() => {
    const handleWhisper = (e: any) => {
      if (e.detail?.agentId === currentAgent.id) {
        setIncomingWhisper(e.detail.message);
        setTimeout(() => setIncomingWhisper(null), 8000);
      }
    };
    window.addEventListener('crm-manager-whisper', handleWhisper);
    return () => window.removeEventListener('crm-manager-whisper', handleWhisper);
  }, [currentAgent.id]);

  // Sound Engine
  const startAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current?.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const stopRingSound = () => {
    if (ringIntervalRef.current) {
      clearInterval(ringIntervalRef.current);
      ringIntervalRef.current = null;
    }
    try {
      if (ringOscRef.current) {
        ringOscRef.current.stop();
        ringOscRef.current.disconnect();
        ringOscRef.current = null;
      }
    } catch (e) {}
  };

  const playRingTone = () => {
    try {
      startAudioContext();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      stopRingSound();

      const ringCycle = () => {
        try {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'sine';
          osc2.type = 'sine';
          osc1.frequency.setValueAtTime(440, ctx.currentTime);
          osc2.frequency.setValueAtTime(480, ctx.currentTime);

          gain.gain.setValueAtTime(0, ctx.currentTime);
          gain.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.1);
          gain.gain.setValueAtTime(0.04, ctx.currentTime + 1.6);
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start();
          osc2.start();
          ringOscRef.current = osc1;

          setTimeout(() => {
            try {
              osc1.stop();
              osc2.stop();
              osc1.disconnect();
              osc2.disconnect();
              gain.disconnect();
            } catch (err) {}
          }, 1800);
        } catch (err) {}
      };

      ringCycle();
      ringIntervalRef.current = setInterval(ringCycle, 3500);
    } catch (e) {}
  };

  const playChime = (freq: number) => {
    try {
      startAudioContext();
      const ctx = audioCtxRef.current;
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        try {
          osc.stop();
          osc.disconnect();
          gain.disconnect();
        } catch (e) {}
      }, 350);
    } catch (e) {}
  };

  // Broadcast Real-time Status Update to Manager Desktop
  const broadcastLiveStatus = (status: CallAgent['status'], currentCallData?: any) => {
    // 1. Dispatch custom event for Desktop UI in same tab
    const event = new CustomEvent('crm-mobile-agent-status-change', {
      detail: {
        agentId: currentAgent.id,
        status,
        currentCall: currentCallData,
        timestamp: Date.now()
      }
    });
    window.dispatchEvent(event);

    // 2. BroadcastChannel & LocalStorage for multi-window / multi-tab synchronization
    try {
      localStorage.setItem('crm_active_agent_live_sync', JSON.stringify({
        agentId: currentAgent.id,
        status,
        currentCall: currentCallData,
        timestamp: Date.now()
      }));
    } catch (e) {}

    // 3. Post to backend server endpoint for server-level sync
    fetch('/api/call-agents/status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: currentAgent.id,
        status,
        currentCall: currentCallData
      })
    }).catch(() => {});
  };

  // Start Call Handler
  const handleStartCall = (targetNum?: string, targetName?: string) => {
    if (!currentAgent.isAuthorized) {
      setAuthAlert("Authorization Revoked: Contact your CRM Manager to re-enable mobile calling permissions.");
      setTimeout(() => setAuthAlert(null), 5000);
      return;
    }

    const num = targetNum || dialNumber.trim();
    if (!num) return;

    const contact = targetName || dialContactName || 'Prospect Client';
    setDialNumber(num);
    setDialContactName(contact);
    setCallState('calling');
    setCallSeconds(0);
    setIsMuted(false);
    setIsOnHold(false);
    setIsSpeaker(false);

    playRingTone();

    // Trigger Desktop Notification: "Agent is calling..."
    broadcastLiveStatus('On Call', {
      clientName: contact,
      clientPhone: num,
      duration: 0,
      startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      direction: 'Outgoing',
      isRecording: true
    });

    // Simulate remote party answering in 3.5 seconds
    setTimeout(() => {
      stopRingSound();
      playChime(660);
      setCallState('connected');

      // Start elapsed timer
      if (callTimerRef.current) clearInterval(callTimerRef.current);
      let sec = 0;
      callTimerRef.current = setInterval(() => {
        sec += 1;
        setCallSeconds(sec);

        // Periodically sync live duration ticks to desktop
        if (sec % 2 === 0) {
          broadcastLiveStatus('On Call', {
            clientName: contact,
            clientPhone: num,
            duration: sec,
            startTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            direction: 'Outgoing',
            isRecording: true
          });
        }
      }, 1000);
    }, 3500);
  };

  // End Call Handler
  const handleEndCall = () => {
    stopRingSound();
    playChime(320);

    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }

    setCallState('disposition');
    setSyncingState('idle');

    // Notify Desktop: Agent is now wrapping up
    broadcastLiveStatus('Wrap-up', undefined);
  };

  // Trigger Automatic Synchronization with Desktop CRM
  const handleTriggerSync = () => {
    setSyncingState('syncing');

    const mm = Math.floor(callSeconds / 60);
    const ss = callSeconds % 60;
    const formattedDuration = `${mm}m ${ss}s`;

    const newCallLog: Omit<CallLog, 'id'> = {
      clientName: dialContactName || 'Prospect Client',
      clientPhone: dialNumber || '9999912345',
      time: 'Just now',
      duration: formattedDuration,
      type: callSeconds > 0 ? 'Answered' : 'Missed',
      notes: callNotes.trim() || `Mobile app call handled by ${currentAgent.name}. Outcome: ${disposition}.`,
      agentName: currentAgent.name,
      agentId: currentAgent.id,
      agentDevice: currentAgent.device,
      syncSource: 'Mobile App',
      disposition,
      direction: 'Outgoing',
      syncedAt: new Date().toLocaleString()
    };

    // 1. Post to Server API endpoint
    fetch('/api/call-agents/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agentId: currentAgent.id,
        callLog: {
          ...newCallLog,
          durationSeconds: callSeconds
        },
        agentStatus: 'Available'
      })
    })
      .then(res => res.json())
      .catch(() => {});

    // 2. Dispatch Local Sync callback to parent App
    setTimeout(() => {
      onCallSynced(newCallLog);

      // Add to mobile history
      setMobileCallHistory(prev => [
        {
          id: `MC-${Date.now()}`,
          clientName: dialContactName || 'Prospect Client',
          phone: dialNumber,
          duration: formattedDuration,
          time: 'Just now',
          type: callSeconds > 0 ? 'Answered' : 'Missed',
          disposition,
          synced: true
        },
        ...prev
      ]);

      setSyncingState('synced');
      broadcastLiveStatus('Available', undefined);

      setTimeout(() => {
        setCallState('idle');
        setDialNumber('');
        setDialContactName('');
        setCallNotes('');
        setCallSeconds(0);
        setSyncingState('idle');
      }, 1500);
    }, 800);
  };

  // Format Timer
  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col items-center justify-center ${isStandalone ? 'w-full h-full p-2' : ''}`}>
      
      {/* Phone Mockup Frame */}
      <div className="w-[360px] sm:w-[380px] h-[720px] bg-slate-950 rounded-[44px] p-3 shadow-2xl border-4 border-slate-800 relative flex flex-col overflow-hidden select-none">
        
        {/* Dynamic Island / Bezel Top Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-5 bg-black rounded-full z-40 flex items-center justify-between px-3">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-700"></div>
          <div className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[8px] font-mono text-emerald-450 font-bold">5G</span>
          </div>
        </div>

        {/* Phone Glass Inner Screen */}
        <div className="flex-1 bg-slate-900 rounded-[36px] overflow-hidden flex flex-col relative text-white border border-slate-800/80">
          
          {/* Top Mobile Status Bar */}
          <div className="h-10 pt-2 px-5 flex items-center justify-between text-[11px] font-semibold text-slate-300 z-30 shrink-0">
            <span>{currentTimeStr}</span>
            <div className="flex items-center gap-1.5 text-slate-300">
              <span className="text-[9px] font-extrabold text-sky-400">ExpertVoLTE</span>
              <Wifi className="w-3.5 h-3.5" />
              <div className="flex items-center gap-0.5">
                <span className="text-[9px]">{currentAgent.batteryLevel || 91}%</span>
                <Battery className="w-3.5 h-3.5 text-emerald-450" />
              </div>
            </div>
          </div>

          {/* Manager Whisper Alert (If received) */}
          {incomingWhisper && (
            <div className="mx-3 mt-1 p-2 rounded-xl bg-amber-500/20 border border-amber-500 text-amber-200 text-[10px] flex items-center gap-2 animate-bounce z-50">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="font-bold block">Manager Guidance:</span>
                <span>{incomingWhisper}</span>
              </div>
            </div>
          )}

          {/* Auth Alert Banner */}
          {authAlert && (
            <div className="mx-3 mt-1 p-2 rounded-xl bg-rose-500/20 border border-rose-500 text-rose-200 text-[10px] flex items-center gap-2 animate-pulse z-50">
              <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authAlert}</span>
            </div>
          )}

          {/* Agent Authorization Status Banner */}
          <div className="px-3.5 py-1.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <img 
                src={currentAgent.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face"} 
                alt={currentAgent.name} 
                className="w-6 h-6 rounded-full border border-indigo-400 object-cover shrink-0"
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="text-[11px] font-bold text-white truncate">{currentAgent.name}</h4>
                  {currentAgent.isAuthorized ? (
                    <ShieldCheck className="w-3 h-3 text-emerald-450 shrink-0" title="Authorized Call Agent" />
                  ) : (
                    <ShieldAlert className="w-3 h-3 text-rose-400 shrink-0" title="Unauthorized / Revoked" />
                  )}
                </div>
                <p className="text-[8.5px] text-slate-400 truncate">{currentAgent.device.split(' (')[0]}</p>
              </div>
            </div>

            {/* Agent Status Selector */}
            <select
              value={agentStatus}
              onChange={(e) => {
                const s = e.target.value as CallAgent['status'];
                setAgentStatus(s);
                broadcastLiveStatus(s, undefined);
              }}
              className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full border focus:outline-none cursor-pointer ${
                agentStatus === 'Available' ? 'bg-emerald-950 text-emerald-300 border-emerald-600' :
                agentStatus === 'On Call' ? 'bg-indigo-950 text-indigo-300 border-indigo-600' :
                agentStatus === 'Wrap-up' ? 'bg-amber-950 text-amber-300 border-amber-600' :
                agentStatus === 'Break' ? 'bg-purple-950 text-purple-300 border-purple-600' :
                'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              <option value="Available">🟢 Available</option>
              <option value="Break">🟡 On Break</option>
              <option value="Wrap-up">🔴 Wrap-up</option>
              <option value="Offline">⚪ Offline</option>
            </select>
          </div>

          {/* Auto-Sync Pulse Bar */}
          <div className="px-3.5 py-1 bg-indigo-950/40 border-b border-indigo-900/40 flex items-center justify-between text-[8.5px] text-indigo-300">
            <span className="flex items-center gap-1">
              <Zap className="w-2.5 h-2.5 text-amber-400 animate-pulse" />
              <span>Auto-Sync to Manager Desktop:</span>
              <strong className="text-emerald-400">ACTIVE</strong>
            </span>
            <span className="font-mono text-slate-400">Pair: {currentAgent.pairingToken}</span>
          </div>

          {/* MAIN SCREEN CONTENTS BASED ON CALL STATE */}
          
          {/* 1. ACTIVE CALLING OR CONNECTED VIEW */}
          {callState === 'calling' || callState === 'connected' ? (
            <div className="flex-1 p-5 flex flex-col justify-between items-center text-center bg-gradient-to-b from-slate-900 via-indigo-950/40 to-slate-950 relative overflow-hidden">
              
              {/* Pulsing waves */}
              <div className="w-28 h-28 rounded-full bg-indigo-600/20 absolute -top-8 -right-8 blur-2xl animate-pulse"></div>
              
              {/* Target info */}
              <div className="mt-4 space-y-1.5 z-10">
                <span className="px-2 py-0.5 rounded-full bg-slate-800/90 border border-slate-700 text-[9.5px] font-mono text-indigo-300 inline-block uppercase tracking-wider">
                  {callState === 'calling' ? 'Ringing Remote Line...' : 'Call Active & Encrypted'}
                </span>
                <h3 className="text-lg font-black text-white">{dialContactName || 'Client Prospect'}</h3>
                <p className="text-xs font-mono text-slate-400">{dialNumber}</p>
                
                {/* Live Duration */}
                <div className="mt-3">
                  <span className="text-2xl font-mono font-extrabold tracking-widest text-emerald-450 drop-shadow">
                    {callState === 'calling' ? 'Calling...' : formatTime(callSeconds)}
                  </span>
                </div>

                {/* Auto Recording Indicator */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-rose-400 font-semibold mt-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  <span>REC • High-Definition Voice Sync</span>
                </div>
              </div>

              {/* In-Call Live Audio Waveform Simulation */}
              <div className="flex items-center justify-center gap-1 h-12 w-full my-auto px-6">
                {[12, 28, 45, 18, 55, 30, 48, 22, 38, 14, 50, 20].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-gradient-to-t from-indigo-500 to-sky-400 rounded-full transition-all duration-150"
                    style={{ 
                      height: callState === 'connected' ? `${Math.max(6, (h * (0.4 + (i % 3) * 0.3)))}px` : '6px',
                      opacity: isOnHold ? 0.3 : 1
                    }}
                  />
                ))}
              </div>

              {/* Call Control Buttons */}
              <div className="w-full space-y-5 z-10">
                <div className="grid grid-cols-3 gap-3 px-4">
                  <button
                    onClick={() => setIsMuted(!isMuted)}
                    className={`h-11 rounded-full flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium transition ${
                      isMuted ? 'bg-rose-500 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    <span>{isMuted ? 'Muted' : 'Mute'}</span>
                  </button>

                  <button
                    onClick={() => setIsSpeaker(!isSpeaker)}
                    className={`h-11 rounded-full flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium transition ${
                      isSpeaker ? 'bg-sky-500 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {isSpeaker ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    <span>Speaker</span>
                  </button>

                  <button
                    onClick={() => setIsOnHold(!isOnHold)}
                    className={`h-11 rounded-full flex flex-col items-center justify-center gap-0.5 text-[9px] font-medium transition ${
                      isOnHold ? 'bg-amber-500 text-white' : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Pause className="w-4 h-4" />
                    <span>{isOnHold ? 'On Hold' : 'Hold'}</span>
                  </button>
                </div>

                {/* Big Hangup Button */}
                <button
                  onClick={handleEndCall}
                  className="w-16 h-16 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-900/50 flex items-center justify-center mx-auto transition-transform active:scale-95 cursor-pointer"
                  title="End Call & Log Disposition"
                >
                  <PhoneOff className="w-7 h-7" />
                </button>
              </div>

            </div>
          ) : callState === 'disposition' ? (
            /* 2. POST-CALL DISPOSITION & AUTO-SYNC VIEW */
            <div className="flex-1 p-4 flex flex-col justify-between overflow-y-auto bg-slate-900">
              <div className="space-y-3">
                
                {/* Header Summary */}
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-center">
                  <span className="text-[9px] uppercase font-bold tracking-wider text-emerald-450 block">Call Concluded</span>
                  <h4 className="text-sm font-bold text-white mt-0.5">{dialContactName || 'Client Prospect'}</h4>
                  <p className="text-[10px] font-mono text-slate-400">{dialNumber} • Duration: {formatTime(callSeconds)}</p>
                </div>

                {/* Mandatory Disposition */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1.5">
                    Select Call Disposition:
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    {[
                      'Interested',
                      'Meeting Demo Booked',
                      'Follow Up',
                      'Deal Closed',
                      'Left Voicemail',
                      'Not Interested',
                      'Wrong Number'
                    ].map((disp) => (
                      <button
                        key={disp}
                        onClick={() => setDisposition(disp as any)}
                        className={`p-2 rounded-xl text-left font-medium border transition ${
                          disposition === disp 
                            ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow' 
                            : 'bg-slate-800/60 text-slate-300 border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        {disp}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block mb-1">
                    Interaction Notes for CRM:
                  </label>
                  <textarea
                    rows={2}
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="E.g., Client wants custom proposal sent by tomorrow..."
                    className="w-full text-[11px] p-2 rounded-xl bg-slate-950 border border-slate-700 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-500"
                  />
                  
                  {/* Quick Note Chips */}
                  <div className="flex flex-wrap gap-1 mt-1">
                    {[
                      'Requested pricing sheet',
                      'Schedule demo 3 PM',
                      'Positive reaction'
                    ].map((chip) => (
                      <button
                        key={chip}
                        onClick={() => setCallNotes(prev => prev ? `${prev}. ${chip}` : chip)}
                        className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                      >
                        +{chip}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Automatic Trigger Sync Button */}
              <div className="pt-2">
                <button
                  disabled={syncingState === 'syncing'}
                  onClick={handleTriggerSync}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-98 ${
                    syncingState === 'synced'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/40'
                  }`}
                >
                  {syncingState === 'syncing' ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Syncing Data to Desktop CRM...</span>
                    </>
                  ) : syncingState === 'synced' ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-white" />
                      <span>Synchronized Successfully!</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 text-amber-300" />
                      <span>Trigger Cloud Sync to Desktop CRM</span>
                    </>
                  )}
                </button>
                <p className="text-[8.5px] text-center text-slate-400 mt-1">
                  Automatically logs call record, updates lead status, & alerts manager.
                </p>
              </div>

            </div>
          ) : (
            /* 3. STANDARD MOBILE APPLICATION TABS (DIALER / LEADS / HISTORY / SETTINGS) */
            <div className="flex-1 flex flex-col overflow-hidden">
              
              {/* TAB 1: DIALER */}
              {mobileTab === 'dialer' && (
                <div className="flex-1 p-3 flex flex-col justify-between overflow-y-auto">
                  
                  {/* Display Field */}
                  <div className="bg-slate-950 p-2.5 rounded-2xl border border-slate-800 text-center relative">
                    <span className="text-[8px] font-mono text-slate-400 block text-left">DIAL TARGET:</span>
                    <input 
                      type="text" 
                      placeholder="Enter phone or pick lead..."
                      value={dialNumber}
                      onChange={(e) => {
                        setDialNumber(e.target.value);
                        setDialContactName('Manual Keypad Input');
                      }}
                      className="w-full bg-transparent text-center text-lg font-mono font-bold text-white focus:outline-none placeholder-slate-600 tracking-wider"
                    />
                    <span className="text-[9.5px] text-indigo-400 font-semibold block truncate">
                      {dialContactName || 'Direct Dial Number'}
                    </span>
                    {dialNumber && (
                      <button 
                        onClick={() => { setDialNumber(''); setDialContactName(''); }}
                        className="absolute right-2 top-2 p-1 text-slate-400 hover:text-white"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* 12-Key Pad */}
                  <div className="grid grid-cols-3 gap-2 px-3 my-1">
                    {[
                      { k: '1', sub: '' },
                      { k: '2', sub: 'ABC' },
                      { k: '3', sub: 'DEF' },
                      { k: '4', sub: 'GHI' },
                      { k: '5', sub: 'JKL' },
                      { k: '6', sub: 'MNO' },
                      { k: '7', sub: 'PQRS' },
                      { k: '8', sub: 'TUV' },
                      { k: '9', sub: 'WXYZ' },
                      { k: '*', sub: '' },
                      { k: '0', sub: '+' },
                      { k: '#', sub: '' }
                    ].map(({ k, sub }) => (
                      <button
                        key={k}
                        onClick={() => {
                          setDialNumber(prev => prev + k);
                          if (!dialContactName) setDialContactName('Manual Keypad Input');
                        }}
                        className="h-11 rounded-2xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/60 flex flex-col items-center justify-center transition active:scale-95"
                      >
                        <span className="text-sm font-bold text-white">{k}</span>
                        {sub && <span className="text-[7px] text-slate-400 font-bold tracking-widest">{sub}</span>}
                      </button>
                    ))}
                  </div>

                  {/* Call Button & Backspace */}
                  <div className="flex items-center justify-center gap-4 px-4 pt-1">
                    <div className="w-10"></div>
                    <button
                      onClick={() => handleStartCall()}
                      disabled={!dialNumber}
                      className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-xl transition-transform active:scale-95 ${
                        dialNumber 
                          ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-900/50 cursor-pointer' 
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                      title="Initiate Outbound Call"
                    >
                      <Phone className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setDialNumber(prev => prev.slice(0, -1))}
                      className="w-10 h-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white"
                      title="Backspace"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              )}

              {/* TAB 2: ASSIGNED CRM LEADS TO CALL */}
              {mobileTab === 'leads' && (
                <div className="flex-1 p-3 overflow-y-auto space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      Assigned Calling Roster ({leads.length})
                    </span>
                    <span className="text-[9px] text-sky-400 font-semibold">1-Tap Dial</span>
                  </div>

                  <div className="space-y-1.5">
                    {leads.map((lead) => (
                      <div 
                        key={lead.id} 
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-indigo-500/50 transition flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <h5 className="text-[11px] font-bold text-white truncate">{lead.name}</h5>
                          <p className="text-[9.5px] text-slate-400 truncate">{lead.company} • {lead.phone}</p>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[8px] px-1.5 py-0.2 rounded bg-indigo-950 text-indigo-300 font-bold border border-indigo-800">
                              {lead.status}
                            </span>
                            <span className="text-[8px] text-emerald-400 font-mono">₹{lead.value.toLocaleString()}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleStartCall(lead.phone, `${lead.name} (${lead.company})`)}
                          className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow transition active:scale-95"
                          title={`Call ${lead.name}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: MOBILE APP CALL HISTORY */}
              {mobileTab === 'history' && (
                <div className="flex-1 p-3 overflow-y-auto space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      Mobile Call Logs ({mobileCallHistory.length})
                    </span>
                    <span className="text-[8.5px] text-emerald-450 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Auto-Synced
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {mobileCallHistory.map((log) => (
                      <div 
                        key={log.id} 
                        className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h5 className="text-[11px] font-bold text-white truncate">{log.clientName}</h5>
                            <span className={`text-[8px] px-1 rounded font-bold ${
                              log.type === 'Answered' ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                            }`}>
                              {log.duration}
                            </span>
                          </div>
                          <p className="text-[9px] text-slate-400 font-mono">{log.phone} • {log.time}</p>
                          <span className="text-[8px] text-indigo-300 bg-indigo-950/60 px-1.5 py-0.2 rounded border border-indigo-900 inline-block mt-0.5">
                            {log.disposition}
                          </span>
                        </div>

                        <button
                          onClick={() => handleStartCall(log.phone, log.clientName)}
                          className="w-7 h-7 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center shrink-0"
                          title="Call back"
                        >
                          <Phone className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 4: MOBILE SETTINGS & PAIRING DETAILS */}
              {mobileTab === 'settings' && (
                <div className="flex-1 p-3 overflow-y-auto space-y-3 text-[10px]">
                  
                  {/* Switch Agent for testing */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <span className="font-bold text-slate-300 uppercase tracking-wider block text-[9px]">
                      Switch Active Mobile Agent (Testing):
                    </span>
                    <div className="space-y-1">
                      {agents.map((ag) => (
                        <button
                          key={ag.id}
                          onClick={() => onSelectAgent && onSelectAgent(ag.id)}
                          className={`w-full p-1.5 rounded-xl text-left flex items-center justify-between border transition ${
                            ag.id === currentAgent.id 
                              ? 'bg-indigo-900/50 border-indigo-500 text-white font-bold' 
                              : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="min-w-0">
                            <div className="truncate">{ag.name} ({ag.device.split(' ')[0]})</div>
                            <span className={`text-[8px] font-bold ${ag.isAuthorized ? 'text-emerald-450' : 'text-rose-400'}`}>
                              {ag.isAuthorized ? '✓ Authorized' : '✗ Revoked'}
                            </span>
                          </div>
                          {ag.id === currentAgent.id && <Check className="w-3.5 h-3.5 text-indigo-400" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Device Specification Card */}
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400">Mobile Device Specs</span>
                      <span className="text-[8px] font-mono text-emerald-450 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800">CONNECTED</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1">
                      <span className="text-slate-400">Model:</span>
                      <strong className="text-white">{currentAgent.device}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1">
                      <span className="text-slate-400">Device ID:</span>
                      <strong className="font-mono text-slate-300">{currentAgent.deviceId}</strong>
                    </div>
                    <div className="flex justify-between border-b border-slate-800/80 pb-1">
                      <span className="text-slate-400">Mobile App Build:</span>
                      <strong className="text-sky-400">{currentAgent.appVersion}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pairing Token:</span>
                      <strong className="font-mono text-amber-400">{currentAgent.pairingToken}</strong>
                    </div>
                  </div>

                  {/* Install PWA / APK / HTML release center */}
                  <div className="p-3 rounded-2xl bg-indigo-950/40 border border-indigo-900/60 text-center space-y-2">
                    <div className="flex items-center justify-center gap-1.5 text-indigo-300">
                      <Smartphone className="w-4 h-4" />
                      <h5 className="font-bold text-white text-xs">Install On Your Smartphone</h5>
                    </div>
                    <p className="text-[9.5px] text-slate-300 leading-tight">
                      Choose your preferred method to install the mobile dialer app:
                    </p>

                    {/* Method 1: 1-Click PWA Install */}
                    <div className="pt-0.5">
                      <PWAInstallButton 
                        variant="primary" 
                        label="1-Click Install to Phone (PWA)" 
                        className="w-full justify-center text-[11px] py-2" 
                      />
                    </div>

                    {/* Method 2 & 3: Direct Downloads */}
                    <div className="grid grid-cols-2 gap-1.5 pt-1">
                      <button 
                        onClick={() => {
                          const res = downloadExpertCallAgentApk(currentAgent.name, currentAgent.pairingToken, 'apk');
                          setDownloadStatus(res.message);
                          setTimeout(() => setDownloadStatus(null), 4000);
                        }}
                        className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[9px] flex items-center justify-center gap-1 border border-slate-700 transition active:scale-95 cursor-pointer"
                        title="Download Android APK package"
                      >
                        <Download className="w-3 h-3 text-emerald-400" /> 
                        <span>Download APK</span>
                      </button>

                      <button 
                        onClick={() => {
                          const res = downloadExpertCallAgentApk(currentAgent.name, currentAgent.pairingToken, 'html');
                          setDownloadStatus(res.message);
                          setTimeout(() => setDownloadStatus(null), 4000);
                        }}
                        className="py-1.5 px-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-[9px] flex items-center justify-center gap-1 border border-slate-700 transition active:scale-95 cursor-pointer"
                        title="Download standalone offline HTML web app"
                      >
                        <FileText className="w-3 h-3 text-sky-400" /> 
                        <span>Offline Web App</span>
                      </button>
                    </div>

                    {downloadStatus && (
                      <div className="p-1.5 rounded-lg bg-emerald-500/20 border border-emerald-500 text-emerald-300 text-[9px] font-semibold animate-fadeIn">
                        ✓ {downloadStatus}
                      </div>
                    )}
                  </div>

                </div>
              )}

              {/* Bottom Mobile Tab Navigation Bar */}
              <div className="h-14 bg-slate-950 border-t border-slate-800 flex items-center justify-around px-2 shrink-0">
                <button
                  onClick={() => setMobileTab('dialer')}
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition ${
                    mobileTab === 'dialer' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Phone className="w-4 h-4" />
                  <span>Dialer</span>
                </button>

                <button
                  onClick={() => setMobileTab('leads')}
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition ${
                    mobileTab === 'leads' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Leads Queue</span>
                </button>

                <button
                  onClick={() => setMobileTab('history')}
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition ${
                    mobileTab === 'history' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>Call Logs</span>
                </button>

                <button
                  onClick={() => setMobileTab('settings')}
                  className={`flex flex-col items-center gap-0.5 text-[9px] font-bold transition ${
                    mobileTab === 'settings' ? 'text-indigo-400' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>Device</span>
                </button>
              </div>

            </div>
          )}

          {/* Android / iPhone Bottom Home Bar Indicator */}
          <div className="h-4 bg-slate-950 flex items-center justify-center shrink-0">
            <div className="w-24 h-1 bg-slate-700 rounded-full"></div>
          </div>

        </div>

      </div>

    </div>
  );
}
