import React, { useState, useEffect, useRef } from 'react';
import { 
  Phone, PhoneCall, PhoneOff, Play, Pause, Search, Clock, 
  HelpCircle, Sparkles, Volume2, UserCheck, CheckCircle2, Mic,
  AlertCircle, ChevronRight, BarChart3, Database, Shuffle, AlertOctagon,
  TrendingUp, Settings, Trash2, ArrowRightLeft, Radio, Check, RefreshCw,
  Upload, FileText, Download, X, Printer, Copy, Lock, Shield, Mail
} from 'lucide-react';
import { CallLog } from '../types';

interface CallingManagerProps {
  callLogs: CallLog[];
  onLogCall: (log: Omit<CallLog, 'id'>) => void;
  onBulkLogCalls?: (logs: Omit<CallLog, 'id'>[]) => void;
  onClearLogs?: () => void;
  onDeleteLog?: (id: string) => void;
}

// 4 Main sub-panes for Calling Manager
type PanelSubTab = 'dialer' | 'ivr' | 'reports' | 'settings';

export default function CallingManager({ 
  callLogs, 
  onLogCall, 
  onBulkLogCalls,
  onClearLogs,
  onDeleteLog
}: CallingManagerProps) {
  const [activeTab, setActiveTab] = useState<PanelSubTab>('dialer');

  // Twilio/VoIP/Gateway Account configuration
  const [gatewayConfig, setGatewayConfig] = useState(() => {
    const saved = localStorage.getItem('calling_gateway_config');
    if (saved) return JSON.parse(saved);
    return {
      accountSid: '',
      authToken: '',
      serviceSid: '',
      phoneNumber: '',
      whatsappNumber: '',
      groqApiKey: '',
      razorpayKeyId: '',
      razorpaySecret: '',
      cloudflareToken: '',
      cloudflareAccountId: '',
      smtpUser: '',
      smtpPass: '',
      activeTrunk: 'Mumbai SSL proxy Gateway',
      channelStatus: 'Inactive' as 'Active' | 'Inactive'
    };
  });

  useEffect(() => {
    localStorage.setItem('calling_gateway_config', JSON.stringify(gatewayConfig));
  }, [gatewayConfig]);

  const [saveAlert, setSaveAlert] = useState<string | null>(null);
  
  // Bulk CSV Upload States
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [csvFileName, setCsvFileName] = useState('');
  const [parsedRows, setParsedRows] = useState<{
    clientName: string;
    clientPhone: string;
    type: 'Answered' | 'Missed';
    duration: string;
    notes: string;
    agentName: string;
    direction: 'Incoming' | 'Outgoing';
    status: 'Valid' | 'Warning' | 'Error';
    message?: string;
  }[]>([]);
  const [bulkUploadError, setBulkUploadError] = useState<string | null>(null);
  const [bulkUploadSuccessCount, setBulkUploadSuccessCount] = useState<number | null>(null);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [directionFilter, setDirectionFilter] = useState<'All' | 'Incoming' | 'Outgoing' | 'Missed' | 'Answered'>('All');

  // Interactive Dialer States
  const [dialNumber, setDialNumber] = useState('');
  const [dialName, setDialName] = useState('Unknown Client');
  const [activeCallStatus, setActiveCallStatus] = useState<'idle' | 'calling' | 'ringing' | 'connected'>('idle');
  const [callDuration, setCallDuration] = useState(0);
  const [callDirection, setCallDirection] = useState<'Incoming' | 'Outgoing'>('Outgoing');
  const [recordingActive, setRecordingActive] = useState(false);
  const [recordingDur, setRecordingDur] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState<string[]>([]);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time Voice & Audio Synthesis states & refs
  const [micLevel, setMicLevel] = useState<number>(0);
  const [voiceBars, setVoiceBars] = useState<number[]>([4, 4, 4, 4, 4, 4, 4, 4, 4]);
  const [realVoiceConnected, setRealVoiceConnected] = useState<boolean>(false);
  const [micPermission, setMicPermission] = useState<'idle' | 'prompting' | 'granted' | 'denied'>('idle');

  const audioCtxRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const ringerOscRef = useRef<OscillatorNode | null>(null);
  const ringerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const micAnimationRef = useRef<number | null>(null);
  const outgoingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Automated background incoming calls setting
  const [autoIncomingActive, setAutoIncomingActive] = useState(() => {
    // Stop all incoming calls at present as requested by the user
    localStorage.setItem('calling_auto_incoming_active', 'false');
    return false;
  });

  // End of transcript reference for automatic scroll
  const transcriptEndRef = useRef<HTMLDivElement | null>(null);

  const startAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtxRef.current = new AudioContextClass();
      }
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
  };

  const stopActiveRingers = () => {
    if (ringerIntervalRef.current) {
      clearInterval(ringerIntervalRef.current);
      ringerIntervalRef.current = null;
    }
    try {
      if (ringerOscRef.current) {
        ringerOscRef.current.stop();
        ringerOscRef.current.disconnect();
        ringerOscRef.current = null;
      }
    } catch (e) {}
  };

  const playSystemSound = (type: 'ringing_dial' | 'ringing_inbound' | 'connect' | 'hangup') => {
    try {
      startAudioContext();
      const ctx = audioCtxRef.current;
      if (!ctx) return;

      stopActiveRingers();

      if (type === 'ringing_dial') {
        const playRingCycle = () => {
          try {
            const osc1 = ctx.createOscillator();
            const osc2 = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc1.type = 'sine';
            osc2.type = 'sine';
            osc1.frequency.setValueAtTime(440, ctx.currentTime);
            osc2.frequency.setValueAtTime(480, ctx.currentTime);

            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.04, ctx.currentTime + 0.1);
            gainNode.gain.setValueAtTime(0.04, ctx.currentTime + 1.8);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 2.0);

            osc1.connect(gainNode);
            osc2.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc1.start();
            osc2.start();

            ringerOscRef.current = osc1;

            setTimeout(() => {
              try {
                osc1.stop();
                osc2.stop();
                osc1.disconnect();
                osc2.disconnect();
                gainNode.disconnect();
              } catch (err) {}
            }, 2000);
          } catch (err) {}
        };

        playRingCycle();
        ringerIntervalRef.current = setInterval(playRingCycle, 4000);

      } else if (type === 'ringing_inbound') {
        const playInboundCycle = () => {
          try {
            const osc = ctx.createOscillator();
            const gainNode = ctx.createGain();

            osc.type = 'square';
            osc.frequency.setValueAtTime(550, ctx.currentTime);
            osc.frequency.setValueAtTime(650, ctx.currentTime + 0.15);
            osc.frequency.setValueAtTime(550, ctx.currentTime + 0.3);
            osc.frequency.setValueAtTime(650, ctx.currentTime + 0.45);

            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.05);
            gainNode.gain.setValueAtTime(0.03, ctx.currentTime + 0.6);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.7);

            osc.connect(gainNode);
            gainNode.connect(ctx.destination);

            osc.start();
            setTimeout(() => {
              try {
                osc.stop();
                osc.disconnect();
                gainNode.disconnect();
              } catch (err) {}
            }, 850);
          } catch (err) {}
        };

        playInboundCycle();
        ringerIntervalRef.current = setInterval(playInboundCycle, 2500);

      } else if (type === 'connect') {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
        osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.24);

        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.05);
        gainNode.gain.setValueAtTime(0.05, ctx.currentTime + 0.3);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.45);

        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.start();
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
            gainNode.disconnect();
          } catch (err) {}
        }, 500);

      } else if (type === 'hangup') {
        const playBeep = (delay: number) => {
          setTimeout(() => {
            try {
              const osc = ctx.createOscillator();
              const gainNode = ctx.createGain();
              osc.type = 'sine';
              osc.frequency.setValueAtTime(425, ctx.currentTime);
              gainNode.gain.setValueAtTime(0.03, ctx.currentTime);
              gainNode.gain.setValueAtTime(0.03, ctx.currentTime + 0.15);
              gainNode.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.2);

              osc.connect(gainNode);
              gainNode.connect(ctx.destination);
              osc.start();
              setTimeout(() => {
                try { osc.stop(); osc.disconnect(); gainNode.disconnect(); } catch (e) {}
              }, 250);
            } catch (e) {}
          }, delay);
        };
        playBeep(0);
        playBeep(300);
        playBeep(600);
      }
    } catch (e) {
      console.warn("Audio feedback error", e);
    }
  };

  const startRealVoiceCapture = async () => {
    try {
      startAudioContext();
      const ctx = audioCtxRef.current;
      if (!ctx) {
        console.warn("AudioContext unavailable, starting simulated wave.");
        setMicPermission('denied');
        setRealVoiceConnected(false);
        startSimulatedWave();
        return;
      }

      setMicPermission('prompting');
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.warn("navigator.mediaDevices or getUserMedia is undefined, falling back to dynamic simulated wave.");
        setMicPermission('denied');
        setRealVoiceConnected(false);
        startSimulatedWave();
        return;
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      setMicPermission('granted');
      setRealVoiceConnected(true);

      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 32;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        
        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }
        const average = sum / dataArray.length;
        setMicLevel(average);

        const heights = Array.from({ length: 9 }).map((_, i) => {
          const base = 4 + Math.random() * 4;
          const micAdd = (average / 255) * 32;
          return Math.min(36, Math.max(4, base + micAdd * (1 - Math.abs(i - 4) / 5)));
        });
        setVoiceBars(heights);

        micAnimationRef.current = requestAnimationFrame(updateVolume);
      };

      updateVolume();
    } catch (err) {
      console.warn("Microphone access denied, falling back to dynamic simulated wave.", err);
      setMicPermission('denied');
      setRealVoiceConnected(false);
      startSimulatedWave();
    }
  };

  const startSimulatedWave = () => {
    let step = 0;
    const animateSimulated = () => {
      step += 0.25;
      const heights = Array.from({ length: 9 }).map((_, i) => {
        const factor = Math.sin(step + i * 0.6) * 0.5 + 0.5;
        const height = 4 + factor * 22 + Math.random() * 5;
        return Math.min(36, Math.max(4, height));
      });
      setVoiceBars(heights);
      micAnimationRef.current = requestAnimationFrame(animateSimulated);
    };
    animateSimulated();
  };

  const stopVoiceCapture = () => {
    if (micAnimationRef.current) {
      cancelAnimationFrame(micAnimationRef.current);
      micAnimationRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setRealVoiceConnected(false);
    setVoiceBars([4, 4, 4, 4, 4, 4, 4, 4, 4]);
  };

  // Sound system unmount cleanup
  useEffect(() => {
    return () => {
      stopActiveRingers();
      stopVoiceCapture();
      if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current);
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  // Synced extra log info stored in localStorage (direction, audio recordings length, recording state)
  const [enrichedMeta, setEnrichedMeta] = useState<Record<string, {
    direction: 'Incoming' | 'Outgoing';
    recorded: boolean;
    recordingLength?: string;
    ivrPath?: string;
  }>>(() => {
    const saved = localStorage.getItem('calling_enriched_meta');
    if (saved) return JSON.parse(saved);
    return {};
  });

  // Missed Call alerts queue
  const [missedCallAlerts, setMissedCallAlerts] = useState<{
    id: string;
    clientName: string;
    phone: string;
    time: string;
    tier: 'VIP' | 'Regular';
    isUnread: boolean;
    reason?: string;
  }[]>(() => {
    const saved = localStorage.getItem('calling_missed_alerts');
    if (saved) return JSON.parse(saved);
    return [];
  });

  // Simple Audio Wave Player state for logged recordings
  const [playingAudioId, setPlayingAudioId] = useState<string | null>(null);
  const [playbackProgress, setPlaybackProgress] = useState<Record<string, number>>({});
  const playbackIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // IVR Interactive Config States
  const [ivrNode, setIvrNode] = useState<'welcome' | 'routing_sales' | 'routing_support' | 'routing_billing' | 'disconnected'>('welcome');
  const [ivrSimulatorActive, setIvrSimulatorActive] = useState(false);
  const [ivrKeyInput, setIvrKeyInput] = useState('');
  const [ivrTranscript, setIvrTranscript] = useState<string[]>([]);
  const [ivrGreeting, setIvrGreeting] = useState("Welcome to Expert CRM routing gateway. Tap 1 for Corporate Sales, 2 for client SLA technical support, or 3 for billing invoices. Tap * to speak to an operator.");

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('calling_enriched_meta', JSON.stringify(enrichedMeta));
  }, [enrichedMeta]);

  useEffect(() => {
    localStorage.setItem('calling_missed_alerts', JSON.stringify(missedCallAlerts));
  }, [missedCallAlerts]);

  // Handle active countdown / call duration timer
  useEffect(() => {
    if (activeCallStatus === 'connected') {
      timerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeCallStatus]);

  // Handle call recording timer
  useEffect(() => {
    if (recordingActive) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDur(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [recordingActive]);

  // Clean playback timers
  useEffect(() => {
    return () => {
      if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
    };
  }, []);

  const formatTime = (secs: number) => {
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Clients list for fast dialer clicks - supports entering fresh data
  const [quickContacts, setQuickContacts] = useState<{ name: string; phone: string; company: string }[]>(() => {
    const saved = localStorage.getItem('calling_quick_contacts');
    if (saved) return JSON.parse(saved);
    return [
      { name: "John Doe", phone: "9876543210", company: "Bluestone Biotech" },
      { name: "Preeti Sharma", phone: "9123456789", company: "Apex Retail" },
      { name: "David Miller", phone: "8765432109", company: "Quantum Tech Inc" },
      { name: "Amit Patel", phone: "9456712390", company: "Hindustan Logistics" }
    ];
  });

  useEffect(() => {
    localStorage.setItem('calling_quick_contacts', JSON.stringify(quickContacts));
  }, [quickContacts]);

  // Simulated live voice dialogues
  const dialogScript = [
    { time: 1, text: "System Proxy Connection established securely." },
    { time: 3, text: "Customer: Hello! Yes, this is regarding our CRM license setup." },
    { time: 7, text: "Agent: Appreciate you taking the call. We can align your team parameters." },
    { time: 11, text: "Customer: Great, is there support for live field GPS localization?" },
    { time: 15, text: "Agent: Yes, we support real-time visits sync and online telemetry nodes." },
    { time: 19, text: "Customer: Fantastic, please add that into our contract billing schedule." },
    { time: 24, text: "Agent: Drafted and logged! Sending over the revised quotation." },
    { time: 28, text: "System Audio recording synced securely." }
  ];

  // Feed dialogue text based on tick
  useEffect(() => {
    if (activeCallStatus === 'connected') {
      const match = dialogScript.find(d => d.time === callDuration);
      if (match) {
        setLiveTranscript(prev => [...prev, match.text]);
      }
    }
  }, [callDuration, activeCallStatus]);

  // Click-to-Call Handlers
  const handleInitiateCall = (targetNum: string, targetName?: string) => {
    if (!targetNum) return;
    const nameFound = targetName || quickContacts.find(c => c.phone === targetNum)?.name || 'Outbound Client';
    
    // Auto-activate channel trunk if inactive so they can always try calls
    if (gatewayConfig.channelStatus === 'Inactive') {
      setGatewayConfig(prev => ({ ...prev, channelStatus: 'Active' }));
    }

    // Auto switch to Dialer workspace view so call console is displayed
    setActiveTab('dialer');

    setDialNumber(targetNum);
    setDialName(nameFound);
    setCallDirection('Outgoing');
    setActiveCallStatus('ringing');
    setCallDuration(0);
    setRecordingActive(false);
    setRecordingDur(0);
    setLiveTranscript([
      "[System Dial] Signaling terminal...", 
      "[System Dial] Caller-ID spoof verification completed.",
      "[System Dial] Ringing peer... Tap ANSWERED below to simulate customer picking up."
    ]);

    playSystemSound('ringing_dial');

    if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current);
    outgoingTimeoutRef.current = setTimeout(() => {
      stopActiveRingers();
      setActiveCallStatus('connected');
      playSystemSound('connect');
      startRealVoiceCapture();
      setLiveTranscript(l => [...l, "[System Call] Line connected automatically. Encryption active."]);
    }, 12000); // Prolonged to 12 seconds to give the user time to interact with manual answer options
  };

  // Simulate Inbound VIP Call
  const simulateIncomingCall = () => {
    const randomCon = quickContacts.length > 0 
      ? quickContacts[Math.floor(Math.random() * quickContacts.length)]
      : { name: 'Pooja Aggarwal', phone: '9888877777', company: 'Vibrant Agencies' };

    // Auto-activate channel trunk if inactive so incoming call response and connection succeed
    if (gatewayConfig.channelStatus === 'Inactive') {
      setGatewayConfig(prev => ({ ...prev, channelStatus: 'Active' }));
    }

    // Auto switch to Dialer workspace view so incoming call HUD/console displays
    setActiveTab('dialer');

    setDialNumber(randomCon.phone);
    setDialName(randomCon.name);
    setCallDirection('Incoming');
    setActiveCallStatus('ringing');
    setCallDuration(0);
    setRecordingActive(false);
    setRecordingDur(0);
    setLiveTranscript([
      "[Inbound Alert] Ringing trunk line...", 
      "[Inbound Alert] Routing priority: VIP customer priority.",
      "[Action Required] Tap ANSWER below to connect real-time stream."
    ]);

    playSystemSound('ringing_inbound');
  };

  // Answer Incoming Call
  const handleAnswerCall = () => {
    if (activeCallStatus !== 'ringing') return;
    stopActiveRingers();
    setActiveTab('dialer');
    setActiveCallStatus('connected');
    playSystemSound('connect');
    startRealVoiceCapture();
    setLiveTranscript(prev => [
      ...prev, 
      "[System Call] Line connected. Real-time audio handshake completed.",
      "[System Call] Encryption active. Voice visualizer synched.",
      "Customer: Hello! Yes, this is regarding our CRM license setup."
    ]);
  };

  // Decline Incoming Call / Cancel Outgoing Call
  const handleDeclineCall = () => {
    stopActiveRingers();
    stopVoiceCapture();
    if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current);
    playSystemSound('hangup');
    setActiveCallStatus('idle');
  };

  // Disconnect & auto log call
  const handleEndCall = () => {
    if (activeCallStatus === 'idle') return;

    stopActiveRingers();
    stopVoiceCapture();
    if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current);
    playSystemSound('hangup');

    const formattedDur = formatTime(callDuration);
    const notesSummary = recordingActive 
      ? `Auto CRM Log containing transcripts. Conversation summary: Discussed pricing models, field staff tracking. Digital audio recording saved (${formatTime(recordingDur)}).`
      : `Auto CRM Log containing transcripts. Conversation summary: System call verified. Recommended next follow-up call.`;

    const randomAgents = ['Agent Aman', 'Agent Rajesh', 'Agent Pooja', 'Agent Vikram'];
    const chosenAgent = randomAgents[Math.floor(Math.random() * randomAgents.length)];

    // 1. Auto Call Logging (Add to parents and local tracking)
    onLogCall({
      clientName: dialName,
      clientPhone: dialNumber,
      time: 'Just Now',
      duration: formattedDur === '00:00' ? '1m 24s' : formattedDur,
      type: 'Answered',
      notes: notesSummary,
      agentName: chosenAgent
    });

    // 2. Track Enriched properties
    // Generate next theoretical ID in background list
    const nextCallId = `CALL-${500 + callLogs.length + 1}`;
    setEnrichedMeta(prev => ({
      ...prev,
      [nextCallId]: {
        direction: callDirection,
        recorded: recordingActive,
        recordingLength: formattedDur === '00:00' ? '01:24' : formattedDur
      }
    }));

    // Reset States
    setActiveCallStatus('idle');
    setRecordingActive(false);
  };

  // Sync auto-incoming setting to local storage
  useEffect(() => {
    localStorage.setItem('calling_auto_incoming_active', String(autoIncomingActive));
  }, [autoIncomingActive]);

  // Synchronize state changes to window for the global HUD in App.tsx
  useEffect(() => {
    const detail = {
      activeCallStatus,
      callDirection,
      dialName,
      dialNumber,
      callDuration,
      realVoiceConnected,
      voiceBars,
      recordingActive,
      recordingDur
    };
    (window as any).__crmCallState = detail;

    // Dispatch custom event so App.tsx is notified immediately
    window.dispatchEvent(new CustomEvent('crm-call-state-change', { detail }));
  }, [activeCallStatus, callDirection, dialName, dialNumber, callDuration, realVoiceConnected, voiceBars, recordingActive, recordingDur]);

  // Use a mutable ref to store the latest states & functions to avoid stale closures in window registry
  const stateRef = useRef({
    activeCallStatus,
    callDirection,
    dialName,
    dialNumber,
    callDuration,
    realVoiceConnected,
    handleAnswerCall,
    handleDeclineCall,
    handleEndCall,
    handleInitiateCall,
    simulateIncomingCall
  });

  useEffect(() => {
    stateRef.current = {
      activeCallStatus,
      callDirection,
      dialName,
      dialNumber,
      callDuration,
      realVoiceConnected,
      handleAnswerCall,
      handleDeclineCall,
      handleEndCall,
      handleInitiateCall,
      simulateIncomingCall
    };
  });

  // Register calling methods to window so App.tsx HUD buttons can invoke them - RUNS ONCE ON MOUNT
  useEffect(() => {
    // Clear out any stale ringing states and stop sound oscillators immediately on load
    stopActiveRingers();
    setActiveCallStatus('idle');

    (window as any).__crmAnswerCall = () => {
      stateRef.current.handleAnswerCall();
    };
    (window as any).__crmDeclineCall = () => {
      stateRef.current.handleDeclineCall();
    };
    (window as any).__crmEndCall = () => {
      stateRef.current.handleEndCall();
    };
    (window as any).__crmStartCall = (num: string, name?: string) => {
      stateRef.current.handleInitiateCall(num, name);
    };
    (window as any).__crmTriggerIncoming = () => {
      stateRef.current.simulateIncomingCall();
    };

    return () => {
      delete (window as any).__crmAnswerCall;
      delete (window as any).__crmDeclineCall;
      delete (window as any).__crmEndCall;
      delete (window as any).__crmStartCall;
      delete (window as any).__crmTriggerIncoming;
      delete (window as any).__crmCallState;
    };
  }, []);

  // Auto scroll transcript to bottom on new line
  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollTop = transcriptEndRef.current.scrollHeight;
    }
  }, [liveTranscript]);

  // Handle auto-simulating live inbound client calls every 45s when idle
  useEffect(() => {
    if (!autoIncomingActive) return;

    const interval = setInterval(() => {
      if (activeCallStatus === 'idle') {
        simulateIncomingCall();
      }
    }, 45000);

    return () => clearInterval(interval);
  }, [autoIncomingActive, activeCallStatus]);

  // --- Bulk CSV Parser and Processors ---
  const parseCSVContent = (text: string) => {
    try {
      setBulkUploadError(null);
      setBulkUploadSuccessCount(null);
      
      const lines = text.split(/\r?\n/);
      if (lines.length < 2) {
        setBulkUploadError("The file does not contain sufficient lines. At least one header and one data row are required.");
        return;
      }

      // Safe splitter for CSV line supporting quoted cells with commas
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let curVal = '';
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          if (char === '"' || char === "'") {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            result.push(curVal.trim());
            curVal = '';
          } else {
            curVal += char;
          }
        }
        result.push(curVal.trim());
        return result;
      };

      const originalHeaders = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/["']/g, '').trim());
      
      const nameIdx = originalHeaders.findIndex(h => h.includes('name') || h.includes('recipient') || h.includes('client'));
      const phoneIdx = originalHeaders.findIndex(h => h.includes('phone') || h.includes('number') || h.includes('mobile'));
      const typeIdx = originalHeaders.findIndex(h => h.includes('type') || h.includes('status'));
      const durationIdx = originalHeaders.findIndex(h => h.includes('duration') || h.includes('length') || h.includes('time'));
      const notesIdx = originalHeaders.findIndex(h => h.includes('notes') || h.includes('summary') || h.includes('interaction') || h.includes('details') || h.includes('description'));
      const agentIdx = originalHeaders.findIndex(h => h.includes('agent') || h.includes('caller') || h.includes('representative'));
      const directionIdx = originalHeaders.findIndex(h => h.includes('direction') || h.includes('flow') || h.includes('way'));

      const results: {
        clientName: string;
        clientPhone: string;
        type: 'Answered' | 'Missed';
        duration: string;
        notes: string;
        agentName: string;
        direction: 'Incoming' | 'Outgoing';
        status: 'Valid' | 'Warning' | 'Error';
        message?: string;
      }[] = [];

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cells = parseCSVLine(line);
        if (cells.length === 0 || (cells.length === 1 && !cells[0])) continue;

        const clientNameRaw = nameIdx !== -1 && cells[nameIdx] ? cells[nameIdx] : '';
        const clientPhoneRaw = phoneIdx !== -1 && cells[phoneIdx] ? cells[phoneIdx] : '';
        const typeRaw = typeIdx !== -1 && cells[typeIdx] ? cells[typeIdx] : 'Answered';
        const durationRaw = durationIdx !== -1 && cells[durationIdx] ? cells[durationIdx] : '2m 15s';
        const notesRaw = notesIdx !== -1 && cells[notesIdx] ? cells[notesIdx] : 'Telephony interaction logged via CSV bulk importer.';
        const agentNameRaw = agentIdx !== -1 && cells[agentIdx] ? cells[agentIdx] : 'Aman Varma';
        const directionRaw = directionIdx !== -1 && cells[directionIdx] ? cells[directionIdx] : 'Outgoing';

        const clientName = clientNameRaw.replace(/["']/g, '').trim() || 'Valued Corporate Prospect';
        const clientPhone = clientPhoneRaw.replace(/[^0-9+]/g, '').trim() || '9999912345';
        
        let type: 'Answered' | 'Missed' = 'Answered';
        if (typeRaw.toLowerCase().includes('miss') || typeRaw.toLowerCase().includes('drop')) {
          type = 'Missed';
        }

        const duration = durationRaw.replace(/["']/g, '').trim() || (type === 'Missed' ? '0m 0s' : '1m 30s');
        const notes = notesRaw.replace(/["']/g, '').trim() || 'No audio recording remarks.';
        const agentName = agentNameRaw.replace(/["']/g, '').trim() || 'Siddharth Sen';
        
        let direction: 'Incoming' | 'Outgoing' = 'Outgoing';
        if (directionRaw.toLowerCase().includes('in') || directionRaw.toLowerCase().includes('recv')) {
          direction = 'Incoming';
        }

        let rowStatus: 'Valid' | 'Warning' | 'Error' = 'Valid';
        let rowMessage = 'Parameters verified.';

        if (!clientPhoneRaw) {
          rowStatus = 'Warning';
          rowMessage = 'Missing phone; default trunk proxy mapped.';
        } else if (clientPhone.length < 5) {
          rowStatus = 'Warning';
          rowMessage = 'Short dial routing (internal line).';
        }

        results.push({
          clientName,
          clientPhone,
          type,
          duration,
          notes,
          agentName,
          direction,
          status: rowStatus,
          message: rowMessage
        });
      }

      if (results.length === 0) {
        setBulkUploadError("No valid rows found to stage.");
      } else {
        setParsedRows(results);
      }
    } catch (err: any) {
      setBulkUploadError(`Parsing error: ${err.message || 'Check CSV structure'}`);
    }
  };

  const handleDownloadTemplate = () => {
    const headers = "clientName,clientPhone,type,duration,notes,agentName,direction";
    const row1 = "Vikram Singh,9555666777,Answered,2m 10s,Inquired about localized hosting packages,Aman Varma,Outgoing";
    const row2 = "Anjali Desai,9122334455,Missed,0m 0s,Scheduled discovery call. Client missed,Deepa Rao,Incoming";
    const row3 = "ABC Pvt Ltd (Rohan),8811223344,Answered,11m 45s,Conducted live product walkthrough showing dashboard,Siddharth Sen,Incoming";
    const row4 = "Global Retailers,9823102930,Answered,4m 12s,Discussed global delivery dispatches,Ketan Patel,Outgoing";
    
    const csvContent = [headers, row1, row2, row3, row4].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "expert_crm_telephony_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLoadMockCSVRows = () => {
    setBulkUploadError(null);
    setBulkUploadSuccessCount(null);
    setCsvFileName("syndicated_telephony_import.csv");
    const mockDataStr = 
`clientName,clientPhone,type,duration,notes,agentName,direction
"Mehta Exports","9820033445","Answered","3m 25s","Discussed logistics shipping integration pipelines","Aman Varma","Outgoing"
"Deepak Nair (Apex)","9004123500","Missed","0m 0s","Inbound customer dropped before agent pickup","Deepa Rao","Incoming"
"Kaira Industries","9112233445","Answered","12m 40s","Conducted field dispatcher dispatch walkthrough","Ketan Patel","Outgoing"
"Secure Solutions","8877665544","Answered","1m 15s","Confirmed payroll dashboard access handshake","Deepa Rao","Incoming"`;
    parseCSVContent(mockDataStr);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setCsvFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSVContent(text);
      };
      reader.readAsText(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCsvFileName(file.name);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        parseCSVContent(text);
      };
      reader.readAsText(file);
    }
  };

  const handleExecuteBulkImport = () => {
    if (parsedRows.length === 0) return;

    // Convert into correct format
    const cleanedLogs: Omit<CallLog, 'id'>[] = parsedRows.map(row => ({
      clientName: row.clientName,
      clientPhone: row.clientPhone,
      time: 'Just Now',
      duration: row.duration,
      type: row.type,
      notes: row.notes,
      agentName: row.agentName
    }));

    // Trigger parent import
    if (onBulkLogCalls) {
      onBulkLogCalls(cleanedLogs);
    } else {
      cleanedLogs.forEach(onLogCall);
    }

    // Set updated enrichedMeta direction fields for matching call item displays
    const startIdx = 500 + callLogs.length + 1;
    const nextEnriched = { ...enrichedMeta };
    parsedRows.forEach((row, i) => {
      const id = `CALL-${startIdx + i}`;
      nextEnriched[id] = {
        direction: row.direction,
        recorded: false,
        recordingLength: row.duration
      };
    });
    setEnrichedMeta(nextEnriched);

    setBulkUploadSuccessCount(parsedRows.length);
    setParsedRows([]);
    setCsvFileName('');
    setTimeout(() => {
      setShowBulkUpload(false);
      setBulkUploadSuccessCount(null);
    }, 2500);
  };

  const handleRemoveStagedRow = (idx: number) => {
    setParsedRows(prev => prev.filter((_, i) => i !== idx));
  };

  const handleEditStagedRow = (idx: number, field: string, value: string) => {
    setParsedRows(prev => prev.map((row, i) => {
      if (i !== idx) return row;
      const updated = { ...row, [field]: value };
      if (field === 'clientPhone') {
        const cleaned = value.replace(/[^0-9+]/g, '').trim();
        updated.status = cleaned ? 'Valid' : 'Warning';
        updated.clientPhone = cleaned;
      }
      return updated;
    }));
  };

  // Trigger missed call manually
  const triggerMissedCallAlert = () => {
    const randomCon = quickContacts[Math.floor(Math.random() * quickContacts.length)];
    const newAlert = {
      id: `MCA-${Date.now()}`,
      clientName: `${randomCon.name} (${randomCon.company})`,
      phone: randomCon.phone,
      time: 'Just Now',
      tier: Math.random() > 0.4 ? 'VIP' as const : 'Regular' as const,
      isUnread: true,
      reason: 'Ring Timeout after 25s'
    };
    setMissedCallAlerts(prev => [newAlert, ...prev]);
  };

  // Call Back Quick action
  const handleCallBack = (alertId: string, phone: string, name: string) => {
    // Dismiss/acknowledge alert
    setMissedCallAlerts(prev => prev.map(m => m.id === alertId ? { ...m, isUnread: false } : m));
    // Click-to-Call
    setActiveTab('dialer');
    handleInitiateCall(phone, name.split(' (')[0]);
  };

  // Clear or acknowledge alert
  const acknowledgeAlert = (alertId: string) => {
    setMissedCallAlerts(prev => prev.filter(m => m.id !== alertId));
  };

  // Simulated audioplayer progress
  const handlePlayAudio = (logId: string, maxDur: string) => {
    if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);

    if (playingAudioId === logId) {
      setPlayingAudioId(null);
      return;
    }

    setPlayingAudioId(logId);
    setPlaybackProgress(prev => ({ ...prev, [logId]: 0 }));

    let current = 0;
    playbackIntervalRef.current = setInterval(() => {
      current += 6;
      setPlaybackProgress(prev => {
        if (current >= 100) {
          if (playbackIntervalRef.current) clearInterval(playbackIntervalRef.current);
          setPlayingAudioId(null);
          return { ...prev, [logId]: 100 };
        }
        return { ...prev, [logId]: current };
      });
    }, 280);
  };

  // --- IVR simulator logic ---
  const handleStartIvrSimulator = () => {
    setIvrSimulatorActive(true);
    setIvrNode('welcome');
    setIvrKeyInput('');
    setIvrTranscript([
      "[IVR Call] Handshake complete. Playing response greeting...",
      `System Text-to-Speech: "${ivrGreeting}"`
    ]);
  };

  const handleIvrKeyPress = (digit: string) => {
    if (!ivrSimulatorActive) return;
    setIvrKeyInput(prev => prev + digit);

    if (digit === '1') {
      setIvrNode('routing_sales');
      setIvrTranscript(prev => [
        ...prev,
        "User Key: [1]",
        "System: Directing call trunk to Outbound Sales Desk.",
        "Agent Rajesh: 'Hello, Rajesh here! Looking to evaluate pricing tiers?'"
      ]);
    } else if (digit === '2') {
      setIvrNode('routing_support');
      setIvrTranscript(prev => [
        ...prev,
        "User Key: [2]",
        "System: Route to client SLA emergency technical queue.",
        "Agent Pooja: 'Hi, you have reached Premium SLA response. How can we serve you?'"
      ]);
    } else if (digit === '3') {
      setIvrNode('routing_billing');
      setIvrTranscript(prev => [
        ...prev,
        "User Key: [3]",
        "System: Relaying call connection to Accounts department.",
        "Agent Aman: 'Aman here. I can update details on your pending invoices or vouchers.'"
      ]);
    } else if (digit === '*') {
      setIvrTranscript(prev => [
        ...prev,
        "User Key: [*]",
        "System: Dispatch operator backup. Ringing core system queue..."
      ]);
    } else {
      setIvrTranscript(prev => [
        ...prev,
        `User Key: [${digit}]`,
        "System Sound: Option not matched. Repeating greeting menu instructions..."
      ]);
    }
  };

  const closeIvrSimulator = (logIt: boolean) => {
    if (logIt) {
      // Auto Log Call for IVR
      let assignedAgent = 'Agent Pooja';
      let interactionNotes = 'IVR System route. User input simulated. Connected on SLA Support.';
      if (ivrNode === 'routing_sales') {
        assignedAgent = 'Agent Rajesh';
        interactionNotes = 'IVR System route to Sales Trunk. Discussed license pricing.';
      } else if (ivrNode === 'routing_billing') {
        assignedAgent = 'Agent Aman';
        interactionNotes = 'IVR System route to Billing. Discussed pending invoice INV-901.';
      }

      onLogCall({
        clientName: `IVR Inbound Node`,
        clientPhone: '011-IVR-CRM',
        time: 'Just Now',
        duration: '1m 10s',
        type: 'Answered',
        notes: interactionNotes,
        agentName: assignedAgent
      });
    }

    setIvrSimulatorActive(false);
  };

  // Filter logs list
  const filteredLogs = callLogs.filter(log => {
    const matchesSearch = 
      log.clientName.toLowerCase().includes(searchTerm.toLowerCase()) || 
      log.notes.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.clientPhone.includes(searchTerm);

    const logExtra = enrichedMeta[log.id];
    const direction = logExtra?.direction || 'Outgoing';

    if (directionFilter === 'All') return matchesSearch;
    if (directionFilter === 'Incoming') return matchesSearch && direction === 'Incoming';
    if (directionFilter === 'Outgoing') return matchesSearch && direction === 'Outgoing';
    if (directionFilter === 'Missed') return matchesSearch && log.type === 'Missed';
    if (directionFilter === 'Answered') return matchesSearch && log.type === 'Answered';
    return matchesSearch;
  });

  return (
    <div id="calling-manager-panel" className="space-y-4">
      
      {/* Dynamic Missed Call Notification Banner ticker */}
      {missedCallAlerts.filter(m => m.isUnread).length > 0 && (
        <div className="bg-red-50 border-l-4 border-red-500 p-2.5 rounded shadow-sm">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-650 animate-pulse shrink-0" />
              <div>
                <span className="text-[11px] font-extrabold text-red-800 uppercase tracking-tight">VIP Missed Call Alerts ({missedCallAlerts.filter(m => m.isUnread).length} Unaddressed)</span>
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-[10.5px] text-slate-700">
                  {missedCallAlerts.filter(m => m.isUnread).slice(0, 2).map(alert => (
                    <div key={alert.id} className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded border border-red-150">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></span>
                      <strong>{alert.clientName}</strong>
                      <span className="text-slate-400 text-[9px] font-mono">({alert.time})</span>
                      <button 
                        onClick={() => handleCallBack(alert.id, alert.phone, alert.clientName)}
                        className="text-indigo-600 hover:text-indigo-800 font-bold ml-1 text-[10px] hover:underline"
                      >
                        [☎️ Dial Back]
                      </button>
                      <button 
                        onClick={() => acknowledgeAlert(alert.id)}
                        className="text-slate-400 hover:text-slate-600 font-bold ml-1 text-[9px]"
                      >
                        Dismiss
                      </button>
                    </div>
                  ))}
                  {missedCallAlerts.filter(m => m.isUnread).length > 2 && (
                    <span className="text-slate-400 font-medium self-center text-[10px]">+{missedCallAlerts.filter(m => m.isUnread).length - 2} more...</span>
                  )}
                </div>
              </div>
            </div>

            <button 
              onClick={triggerMissedCallAlert}
              className="text-[10px] bg-white hover:bg-neutral-50 px-2 py-0.5 text-slate-600 font-bold border border-red-250 rounded shadow-none shrink-0"
            >
              Simulate Fresh Missed Alert
            </button>
          </div>
        </div>
      )}

      {/* Header operations bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-3 rounded border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
            <Volume2 className="w-5 h-5 text-indigo-600 shadow-sm animate-pulse" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Calling Telephony Workspace</h2>
            <p className="text-[10px] text-slate-400">Execute click-to-call, capture incoming trails, toggle call recording syncs, and audit agent reports.</p>
          </div>
        </div>

        {/* Corporate Level Tab Selectors */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('dialer')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
              activeTab === 'dialer' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Phone className="w-3.5 h-3.5 inline mr-1" /> Call Desk
          </button>
          <button
            onClick={() => setActiveTab('ivr')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
              activeTab === 'ivr' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5 inline mr-1" /> IVR Tree
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
              activeTab === 'reports' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 inline mr-1" /> Agent Stats
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition ${
              activeTab === 'settings' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Settings className="w-3.5 h-3.5 inline mr-1" /> Gateway Config
          </button>
        </div>
      </div>

      {/* ==================== SUBPANEL 1: DIALER & ACTIVE DIAL LIFE ==================== */}
      {activeTab === 'dialer' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          
          {/* Active Call Dialer Terminal */}
          <div className="bg-slate-950 text-slate-100 p-3 rounded border border-slate-900 lg:col-span-4 flex flex-col justify-between min-h-[580px] lg:min-h-[640px] relative overflow-y-auto">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl"></div>
            
            <div className="flex justify-between items-center z-15">
              <div>
                <span className="text-[9px] uppercase font-bold tracking-widest text-indigo-400">VoIP Network Link</span>
                <h3 className="text-[11px] font-bold text-slate-300">Workspace Phone Console</h3>
              </div>
              <span className="text-[8px] font-mono tracking-widest bg-emerald-950 text-emerald-450 px-1.5 py-0.2 rounded border border-emerald-900 uppercase">
                {activeCallStatus === 'connected' ? 'Connected' : activeCallStatus === 'ringing' ? 'Alerting' : 'Secure Trunk'}
              </span>
            </div>

            {/* CALL STATUS VIEWS */}
            {activeCallStatus === 'idle' ? (
              <div className="my-auto space-y-4">
                
                {/* Dial Entry input */}
                <div className="bg-slate-900 border border-slate-800 rounded p-2 text-center relative">
                  <span className="text-[9px] block text-slate-500 text-left font-mono">Dial Input Line:</span>
                  <input 
                    type="text" 
                    placeholder="Enter phone or select partner..."
                    className="bg-transparent text-center font-mono text-base font-extrabold text-white mt-1 w-full focus:outline-none placeholder-slate-600"
                    value={dialNumber}
                    onChange={(e) => {
                      setDialNumber(e.target.value);
                      setDialName('Manual Input Contact');
                    }}
                  />
                  <span className="text-[10px] block text-slate-400 mt-1 font-semibold italic">{dialName}</span>
                </div>

                {/* Grid Pad 0-9 */}
                <div className="grid grid-cols-3 gap-1.5 max-w-[200px] mx-auto text-center font-mono">
                  {['1','2','3','4','5','6','7','8','9','*','0','#'].map(key => (
                    <button
                      key={key}
                      onClick={() => {
                        setDialNumber(prev => prev + key);
                        setDialName('Direct Keypad Dial');
                      }}
                      className="h-8 rounded bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center justify-center text-xs font-bold text-slate-300 hover:text-white"
                    >
                      {key}
                    </button>
                  ))}
                </div>

                {/* Instant Quick Dial dropdown */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[9px] font-mono text-slate-500 uppercase tracking-wider block text-left">Quick Call-list Target</label>
                    {quickContacts.length > 0 && (
                      <button 
                        onClick={() => {
                          setQuickContacts([]);
                        }}
                        className="text-[8px] text-red-450 hover:text-red-400 font-mono uppercase tracking-wider underline bg-transparent border-none cursor-pointer"
                        title="Wipe all quick contacts"
                      >
                        Wipe List
                      </button>
                    )}
                  </div>
                  {quickContacts.length === 0 ? (
                    <div className="text-[9.5px] text-slate-550 italic bg-slate-900/40 p-2 rounded text-center border border-slate-900">
                      No contacts. Add fresh contacts below.
                    </div>
                  ) : (
                    <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
                      {quickContacts.map((qc, idx) => (
                        <div key={qc.phone + '-' + idx} className="flex items-center shrink-0 gap-0.5 bg-slate-900 rounded border border-slate-800">
                          <button
                            onClick={() => {
                              setDialNumber(qc.phone);
                              setDialName(qc.name);
                            }}
                            className={`px-2 py-1 text-[10px] rounded-l font-medium transition ${
                              dialNumber === qc.phone ? 'bg-indigo-900/40 text-indigo-250 border-r border-indigo-500 font-extrabold' : 'text-slate-350 hover:bg-slate-800'
                            }`}
                          >
                            {qc.name}
                          </button>
                          <button
                            onClick={() => {
                              setQuickContacts(prev => prev.filter((_, i) => i !== idx));
                              if (dialNumber === qc.phone) {
                                setDialNumber('');
                                setDialName('Manual Input Contact');
                              }
                            }}
                            className="p-1 px-1.5 text-slate-500 hover:text-red-400 font-bold text-[9px] transition-all border-l border-slate-800 hover:bg-slate-800"
                            title="Delete Contact"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add Fresh Contact inline block */}
                <div className="bg-slate-900/40 p-2 rounded border border-slate-900/80 space-y-1.5">
                  <span className="text-[8.5px] font-mono text-indigo-400 uppercase tracking-widest block text-left">Add Fresh Dial Contact</span>
                  <div className="grid grid-cols-2 gap-1">
                    <input 
                      type="text"
                      id="fresh-contact-name"
                      placeholder="Name (e.g. Amit)"
                      className="bg-slate-950 text-slate-200 p-1 px-1.5 rounded font-sans text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-slate-800"
                    />
                    <input 
                      type="text"
                      id="fresh-contact-phone"
                      placeholder="Phone (e.g. 984501)"
                      className="bg-slate-950 text-slate-200 p-1 px-1.5 rounded font-mono text-[10px] focus:outline-none focus:ring-1 focus:ring-indigo-500 border border-slate-800"
                    />
                  </div>
                  <button
                    onClick={() => {
                      const nameInput = document.getElementById('fresh-contact-name') as HTMLInputElement;
                      const phoneInput = document.getElementById('fresh-contact-phone') as HTMLInputElement;
                      if (nameInput && phoneInput && nameInput.value.trim() && phoneInput.value.trim()) {
                        const newC = {
                          name: nameInput.value.trim(),
                          phone: phoneInput.value.trim(),
                          company: 'Fresh Contact Corp'
                        };
                        setQuickContacts(prev => [...prev, newC]);
                        setDialNumber(newC.phone);
                        setDialName(newC.name);
                        nameInput.value = '';
                        phoneInput.value = '';
                      }
                    }}
                    className="w-full py-1 bg-indigo-650 hover:bg-indigo-700 text-white rounded text-[9.5px] font-bold uppercase tracking-wider transition cursor-pointer"
                  >
                    + Add Fresh Contact
                  </button>
                </div>

                <div className="flex gap-2">
                  <button 
                    onClick={() => handleInitiateCall(dialNumber, dialName)}
                    disabled={!dialNumber}
                    className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-750 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-indigo-500 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" /> Start Call
                  </button>
                  <button 
                    onClick={simulateIncomingCall}
                    className="flex-1 py-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 rounded text-[10px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-slate-800 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 animate-spin-slow" /> Simulate Inbound
                  </button>
                </div>

                {/* Auto incoming calls controller toggle */}
                <div className="bg-slate-900/60 p-2 rounded border border-slate-800/80 mt-1.5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${autoIncomingActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-550'}`} />
                    <span className="text-[9.5px] uppercase font-bold text-slate-400">Background Inbound Stream</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer select-none">
                    <input 
                      type="checkbox" 
                      checked={autoIncomingActive}
                      onChange={(e) => setAutoIncomingActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-7 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-400 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-indigo-600 peer-checked:after:bg-white peer-checked:after:border-white"></div>
                  </label>
                </div>
              </div>
            ) : (
              // ACTIVE CALL STREAM PANEL
              <div className="my-auto space-y-4">
                <div className="text-center relative">
                  <span className="text-[10px] font-black text-indigo-400 tracking-widest uppercase block">
                    {activeCallStatus === 'ringing' ? '☎️ AWAITING ESTABLISHMENT' : `${callDirection} CALL ESTABLISHED`}
                  </span>
                  <p className="text-xs font-black text-white px-2 py-1 truncate bg-slate-900 border border-slate-850 rounded mt-2">{dialName}</p>
                  <p className="text-[10px] text-slate-400 font-mono mt-1">Number: {dialNumber}</p>
                  {activeCallStatus === 'connected' ? (
                    <p className="text-xl font-bold font-mono text-indigo-400 mt-2">{formatTime(callDuration)}</p>
                  ) : (
                    <p className="text-xs font-bold text-amber-400 animate-pulse mt-2 uppercase tracking-wide">
                      {callDirection === 'Incoming' ? 'Incoming Ringing...' : 'Dialing Trunk Proxy...'}
                    </p>
                  )}
                </div>

                {/* Soundwave Visualizer / Ringing Pulsar */}
                {activeCallStatus === 'connected' ? (
                  <div className="h-8 flex items-center justify-center gap-1 bg-slate-900 rounded border border-slate-850/60 overflow-hidden relative px-1">
                    <span className="absolute left-1.5 text-[8px] font-mono uppercase tracking-widest text-slate-500 z-10 font-bold">Line Feed</span>
                    <span className="absolute right-1.5 text-[8px] font-mono uppercase text-teal-400 bg-teal-950 px-1 py-0.2 rounded border border-teal-900 z-10 font-bold animate-pulse">
                      {realVoiceConnected ? '🎙️ Mic Active' : '🎙️ Fallback Voice'}
                    </span>
                    {voiceBars.map((barHeight, idx) => (
                      <div 
                        key={idx} 
                        className={`w-1 bg-indigo-450 rounded transition-all duration-75`} 
                        style={{ height: `${barHeight}px` }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="h-8 flex items-center justify-center gap-1 bg-slate-900 rounded border border-slate-850/60 overflow-hidden relative">
                    <span className="absolute left-1.5 text-[8px] font-mono uppercase tracking-widest text-slate-500 z-10 font-bold">Line Feed</span>
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest animate-pulse flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping"></span>
                      {callDirection === 'Incoming' ? 'Ringing Inbound...' : 'Awaiting Peer Handshake...'}
                    </span>
                  </div>
                )}

                {/* Call Recording Simulation Controller (only shown when connected) */}
                {activeCallStatus === 'connected' && (
                  <div className="bg-slate-900/60 p-2 rounded border border-slate-850 flex items-center justify-between">
                    <div>
                      <span className="text-[8.5px] uppercase font-bold text-slate-500 block">Digital Recording Sync</span>
                      <span className="text-[10px] text-slate-350 font-mono">
                        {recordingActive ? `Recording Call... (${formatTime(recordingDur)})` : 'Recording Stopped'}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (!recordingActive) {
                          setRecordingActive(true);
                          setRecordingDur(0);
                        } else {
                          setRecordingActive(false);
                        }
                      }}
                      className={`p-1.5 rounded flex items-center gap-1 text-[10px] font-bold uppercase transition ${
                        recordingActive ? 'bg-red-950 text-red-400 border border-red-900 animate-pulse' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      <Mic className="w-3.5 h-3.5" />
                      {recordingActive ? 'Stop REC' : 'Record Call'}
                    </button>
                  </div>
                )}

                {/* Active Dynamic Voice Transcript Logs */}
                <div ref={transcriptEndRef} className="bg-slate-900 border border-slate-855 rounded p-2 h-24 overflow-y-auto space-y-1 text-left font-mono text-[9.5px] text-slate-300 select-all">
                  {liveTranscript.map((txt, index) => (
                    <p key={index} className={txt.startsWith('Agent:') ? 'text-indigo-300' : txt.startsWith('Customer:') ? 'text-teal-300' : 'text-slate-500 font-bold'}>
                      {txt}
                    </p>
                  ))}
                </div>

                {/* Interactive Connection Buttons based on call direction & status */}
                <div className="flex flex-col gap-1.5 pt-1">
                  {activeCallStatus === 'ringing' ? (
                    callDirection === 'Incoming' ? (
                      <div className="flex gap-2 w-full">
                        <button 
                          onClick={handleAnswerCall}
                          className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-emerald-500 animate-bounce"
                        >
                          <Phone className="w-3.5 h-3.5" /> Answer & Stream
                        </button>
                        <button 
                          onClick={handleDeclineCall}
                          className="flex-1 py-1.5 bg-red-650 hover:bg-red-700 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-red-700"
                        >
                          <PhoneOff className="w-3.5 h-3.5" /> Decline
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2 w-full">
                        <div className="bg-slate-900 p-2 rounded border border-slate-850 space-y-1.5">
                          <span className="text-[8.5px] uppercase font-black text-indigo-400 block tracking-widest text-center">Simulate Customer Action</span>
                          <div className="grid grid-cols-2 gap-1.5">
                            <button 
                              onClick={() => {
                                if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current);
                                stopActiveRingers();
                                setActiveCallStatus('connected');
                                playSystemSound('connect');
                                startRealVoiceCapture();
                                setLiveTranscript(l => [
                                  ...l, 
                                  "[System Call] Line connected. Customer picked up.",
                                  "Customer: Hello! Yes, this is " + dialName + " speaking. How can I help you today?"
                                ]);
                              }}
                              className="py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-1 border border-emerald-500 animate-pulse cursor-pointer"
                            >
                              <Phone className="w-3 h-3 animate-bounce" /> Answered
                            </button>
                            <button 
                              onClick={() => {
                                if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current);
                                stopActiveRingers();
                                playSystemSound('hangup');
                                
                                // Auto-log busy/decline attempt
                                onLogCall({
                                  clientName: dialName,
                                  clientPhone: dialNumber,
                                  time: 'Just Now',
                                  duration: '00:00',
                                  type: 'Missed',
                                  notes: `Outgoing call to ${dialName} returned busy/rejected signal.`,
                                  agentName: 'Agent System'
                                });
                                
                                setActiveCallStatus('idle');
                              }}
                              className="py-1 bg-amber-600 hover:bg-amber-700 text-white rounded text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-1 border border-amber-500 cursor-pointer"
                            >
                              <PhoneOff className="w-3 h-3" /> Busy / Reject
                            </button>
                          </div>
                          
                          <button 
                            onClick={() => {
                              if (outgoingTimeoutRef.current) clearTimeout(outgoingTimeoutRef.current);
                              stopActiveRingers();
                              playSystemSound('connect');
                              setActiveCallStatus('connected');
                              startRealVoiceCapture();
                              setLiveTranscript(l => [
                                ...l, 
                                "[System Call] Call forwarded to Digital Voice Mailbox.",
                                "Voicemail: The subscriber you are trying to reach is unavailable. Please leave a message after the tone. [BEEP]"
                              ]);
                              setRecordingActive(true);
                              setRecordingDur(0);
                            }}
                            className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold uppercase tracking-wide flex items-center justify-center gap-1 border border-indigo-500 cursor-pointer"
                          >
                            <Mic className="w-3 h-3" /> Route to Voicemail
                          </button>
                        </div>

                        <button 
                          onClick={handleDeclineCall}
                          className="w-full py-1.5 bg-red-650 hover:bg-red-700 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-red-700 cursor-pointer"
                        >
                          <PhoneOff className="w-3.5 h-3.5" /> Cancel Dial
                        </button>
                      </div>
                    )
                  ) : (
                    <button 
                      onClick={handleEndCall}
                      className="w-full py-1.5 bg-red-650 hover:bg-red-700 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-red-700"
                    >
                      <PhoneOff className="w-3.5 h-3.5" /> Disconnect Call & Auto-Log
                    </button>
                  )}
                </div>
              </div>
            )}

            <div className="text-[9px] text-slate-500 border-t border-slate-850 pt-1.5 flex items-center justify-between font-mono">
              <span>Trunks: Mumbai SSL proxy Gateway</span>
              <span>Proxy spoofing IP SEC</span>
            </div>
          </div>

          {/* Interactive Logs spreadsheet area */}
          <div className="bg-white p-3 rounded border border-slate-200 lg:col-span-8 flex flex-col justify-between">
            <div>
              
              {/* Filter tools row */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight font-sans">Call Inbound & Outbound History</h3>
                  <p className="text-[10px] text-slate-400">Total index of verified proxy calls and recording playback vaults</p>
                </div>
                
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {onClearLogs && callLogs.length > 0 && (
                    <button
                      onClick={onClearLogs}
                      className="px-2.5 py-1 bg-white hover:bg-red-50 text-red-600 hover:text-red-750 border-red-200 border rounded text-[11px] font-bold flex items-center gap-1.5 transition whitespace-nowrap shadow-xxs cursor-pointer"
                      title="Wipe All Call History Logs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Wipe Call Logs
                    </button>
                  )}

                  <button
                    onClick={() => setShowBulkUpload(!showBulkUpload)}
                    className={`px-2.5 py-1 bg-white hover:bg-slate-50 text-indigo-600 hover:text-indigo-850 border-indigo-200 border rounded text-[11px] font-bold flex items-center gap-1.5 transition whitespace-nowrap shadow-xxs ${showBulkUpload ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500' : ''}`}
                    title="Toggle Bulk CSV Importer Workspace"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    {showBulkUpload ? 'Hide Importer' : 'Bulk Import CSV'}
                  </button>

                  <div className="relative w-full sm:w-52">
                    <Search className="absolute left-2 top-1.5 w-3 h-3 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search logs..."
                      className="w-full text-[10.5px] p-1 pl-6.5 border border-slate-200 bg-slate-50 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white font-sans"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* Collapsible CSV Bulk Upload Desk */}
              {showBulkUpload && (
                <div className="mb-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 shadow-inner relative overflow-hidden transition-all duration-300">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
                  
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-[11.5px] font-black text-slate-800 uppercase tracking-tight flex items-center gap-1.5">
                        <Database className="w-4 h-4 text-indigo-600 shadow-sm" />
                        CSV Telephony Bulk Importer
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Inject multiple telephonic registries into live CRM streams. Auto-schedules follow up logs on the dashboard.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowBulkUpload(false)}
                      className="text-slate-400 hover:text-slate-650 p-1 rounded-full hover:bg-slate-200/50"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Drop zone / Template guides */}
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                    
                    {/* LEFT 3 COLS: The Drop Zone */}
                    <div className="md:col-span-3">
                      <div 
                        onDragEnter={handleDrag}
                        onDragOver={handleDrag}
                        onDragLeave={handleDrag}
                        onDrop={handleDrop}
                        className={`border-2 border-dashed rounded-xl p-5 text-center transition-all cursor-pointer relative ${
                          dragActive 
                            ? "border-indigo-550 bg-indigo-50" 
                            : "border-slate-250 bg-white hover:border-slate-400 hover:bg-neutral-50/40"
                        }`}
                      >
                        <input 
                          type="file" 
                          id="csv-file-input" 
                          accept=".csv"
                          onChange={handleFileInputChange}
                          className="hidden"
                        />
                        <label htmlFor="csv-file-input" className="cursor-pointer space-y-2 block">
                          <div className="mx-auto w-9 h-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shadow-xxs">
                            <Upload className="w-4.5 h-4.5" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-slate-700">
                              {csvFileName ? `Import target: ${csvFileName}` : "Drag & Drop CSV File here"}
                            </p>
                            <p className="text-[9.5px] text-slate-400 mt-0.5">
                              {csvFileName ? "Click to pick a different document" : "or click to search system folders"}
                            </p>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* RIGHT 2 COLS: Helper guides */}
                    <div className="md:col-span-2 space-y-2 flex flex-col justify-between">
                      <div className="bg-white p-2.5 rounded-xl border border-slate-200 text-[9.5px] text-slate-500 leading-normal font-medium">
                        <p className="text-slate-700 font-extrabold mb-1 uppercase tracking-tight text-[8.5px]">Expected Schema Headers:</p>
                        <div className="grid grid-cols-2 gap-1 font-mono text-[8.5px]">
                          <span className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">clientName</span>
                          <span className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">clientPhone</span>
                          <span className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600">type (status)</span>
                          <span className="bg-slate-100 px-1 py-0.5 rounded text-emerald-600">direction</span>
                          <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">duration</span>
                          <span className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">agentName</span>
                        </div>
                      </div>

                      <div className="flex gap-1.5">
                        <button
                          onClick={handleDownloadTemplate}
                          type="button"
                          className="flex-1 py-1.5 bg-white hover:bg-neutral-50 text-slate-700 border border-slate-250 hover:border-slate-350 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition shadow-xxs"
                        >
                          <Download className="w-3 h-3 text-slate-500 placeholder-lucide" />
                          Save Template
                        </button>
                        <button
                          onClick={handleLoadMockCSVRows}
                          type="button"
                          className="flex-1 py-1.5 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-750 border border-indigo-150 rounded-lg text-[10px] font-extrabold flex items-center justify-center gap-1 transition"
                        >
                          <Sparkles className="w-3 h-3 text-indigo-500 shrink-0" />
                          Load Mock CRM
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Feedback states: upload error */}
                  {bulkUploadError && (
                    <div className="bg-red-50 border border-red-150 p-2.5 rounded-xl flex items-center gap-2 text-[10.5px] text-red-750 font-semibold shadow-xxs">
                      <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                      <span>{bulkUploadError}</span>
                    </div>
                  )}

                  {/* Feedback states: upload success countdown */}
                  {bulkUploadSuccessCount !== null && (
                    <div className="bg-emerald-50 border border-emerald-150 p-3 rounded-xl flex items-center gap-2.5 text-[11px] text-emerald-800 font-extrabold shadow-xxs animate-pulse">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 bg-white rounded-full p-0.5 shadow-sm shrink-0" />
                      <span>SUCCESS: Bulk imported {bulkUploadSuccessCount} verified call interactions! Syncing logs list and auto-generating Follow Up tasks...</span>
                    </div>
                  )}

                  {/* Staging Area rows preview table */}
                  {parsedRows.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">
                          STAGED ITEMS READY FOR AUDIT ({parsedRows.length} ROWS DETECTED)
                        </span>
                        <button 
                          onClick={() => setParsedRows([])}
                          className="text-[9.5px] font-bold text-slate-400 hover:text-red-500 hover:underline"
                        >
                          Clear Staged
                        </button>
                      </div>

                      {/* Spreadsheet layout staging table */}
                      <div className="border border-slate-200 rounded-xl bg-white overflow-hidden max-h-48 overflow-y-auto shadow-inner">
                        <table className="w-full text-left text-[10.5px]">
                          <thead className="bg-slate-100 text-slate-500 text-[8px] uppercase tracking-wider font-extrabold border-b border-slate-150 sticky top-0 z-10">
                            <tr>
                              <th className="px-2.5 py-1.5">Recipient</th>
                              <th className="px-2.5 py-1.5">Direct Line</th>
                              <th className="px-2 py-1.5">Direction</th>
                              <th className="px-2 py-1.5">Type</th>
                              <th className="px-2 py-1.5">Duration</th>
                              <th className="px-2.5 py-1.5">Assigned Agent</th>
                              <th className="px-2.5 py-1.5">Interaction Summary Notes</th>
                              <th className="px-2 py-1.5">Integrity</th>
                              <th className="px-2 py-1.5 text-center">Action</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-sans">
                            {parsedRows.map((row, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/40 select-none">
                                <td className="px-2.5 py-1">
                                  <input 
                                    type="text" 
                                    value={row.clientName}
                                    onChange={(e) => handleEditStagedRow(idx, 'clientName', e.target.value)}
                                    className="font-bold text-slate-800 bg-transparent border-b border-transparent focus:border-indigo-400 focus:bg-white focus:outline-none py-0.5 w-[110px]"
                                  />
                                </td>
                                <td className="px-2.5 py-1">
                                  <input 
                                    type="text" 
                                    value={row.clientPhone}
                                    onChange={(e) => handleEditStagedRow(idx, 'clientPhone', e.target.value)}
                                    className="font-mono text-slate-500 bg-transparent border-b border-transparent focus:border-indigo-400 focus:bg-white focus:outline-none py-0.5 w-[90px]"
                                  />
                                </td>
                                <td className="px-2 py-1">
                                  <select 
                                    value={row.direction}
                                    onChange={(e) => handleEditStagedRow(idx, 'direction', e.target.value as any)}
                                    className="bg-transparent border-none focus:outline-none py-0.5 text-slate-600 font-medium"
                                  >
                                    <option value="Incoming">➔ Inbound</option>
                                    <option value="Outgoing">➔ Outbound</option>
                                  </select>
                                </td>
                                <td className="px-2 py-1">
                                  <select 
                                    value={row.type}
                                    onChange={(e) => handleEditStagedRow(idx, 'type', e.target.value as any)}
                                    className="bg-transparent border-none focus:outline-none py-0.5 text-slate-600 font-medium"
                                  >
                                    <option value="Answered">Answered</option>
                                    <option value="Missed">Missed</option>
                                  </select>
                                </td>
                                <td className="px-2 py-1">
                                  <input 
                                    type="text" 
                                    value={row.duration}
                                    onChange={(e) => handleEditStagedRow(idx, 'duration', e.target.value)}
                                    className="font-mono bg-transparent border-b border-transparent focus:border-indigo-400 focus:bg-white focus:outline-none py-0.5 w-[55px]"
                                  />
                                </td>
                                <td className="px-2.5 py-1">
                                  <input 
                                    type="text" 
                                    value={row.agentName}
                                    onChange={(e) => handleEditStagedRow(idx, 'agentName', e.target.value)}
                                    className="bg-transparent border-b border-transparent focus:border-indigo-400 focus:bg-white focus:outline-none py-0.5 w-[90px]"
                                  />
                                </td>
                                <td className="px-2.5 py-1">
                                  <input 
                                    type="text" 
                                    value={row.notes}
                                    onChange={(e) => handleEditStagedRow(idx, 'notes', e.target.value)}
                                    className="text-slate-550 bg-transparent border-b border-transparent focus:border-indigo-400 focus:bg-white focus:outline-none py-0.5 w-[150px] truncate"
                                    title={row.notes}
                                  />
                                </td>
                                <td className="px-2 py-1">
                                  <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[8px] font-black uppercase shadow-xxs ${
                                    row.status === 'Valid' 
                                      ? 'bg-emerald-50 text-emerald-700' 
                                      : 'bg-amber-50 text-amber-700'
                                  }`} title={row.message}>
                                    <span className={`w-1 h-1 rounded-full ${row.status === 'Valid' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                                    {row.status}
                                  </span>
                                </td>
                                <td className="px-2 py-1 text-center">
                                  <button 
                                    onClick={() => handleRemoveStagedRow(idx)}
                                    className="text-red-400 hover:text-red-650 p-1 rounded hover:bg-red-50"
                                    type="button"
                                    title="Exclude row"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Staged Execution trigger bar */}
                      <div className="flex items-center justify-between border-t border-slate-200/80 pt-2.5">
                        <div className="text-[10px] text-slate-500 font-semibold">
                          All <span className="font-extrabold text-slate-800">{parsedRows.filter(r => r.status === 'Valid').length} valid</span> records will immediately sync into your dashboards.
                        </div>
                        <button
                          onClick={handleExecuteBulkImport}
                          type="button"
                          className="px-4 py-1.5 bg-indigo-650 hover:bg-indigo-750 text-white rounded-lg text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5 transition shadow"
                        >
                          <CheckCircle2 className="w-4 h-4 text-white" />
                          Execute Bulk Handshake
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Pill Button Directions Tracking Filter */}
              <div className="flex flex-wrap gap-1 mb-3">
                <span className="text-[10px] text-slate-400 font-bold self-center uppercase mr-1">Search Type:</span>
                {(['All', 'Incoming', 'Outgoing', 'Answered', 'Missed'] as const).map(dir => (
                  <button
                    key={dir}
                    onClick={() => setDirectionFilter(dir)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold border transition ${
                      directionFilter === dir 
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-200 font-black' 
                        : 'bg-white hover:bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {dir}
                  </button>
                ))}
                
                <span className="text-slate-400 text-[10px] font-bold ml-auto self-center">
                  Total matches: <span className="text-slate-700 font-extrabold">{filteredLogs.length}</span>
                </span>
              </div>

              {/* Clean Table list */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-600 text-[11px]">
                  <thead className="bg-slate-50 text-slate-550 border-b border-slate-202 uppercase tracking-wide text-[8.5px] font-black">
                    <tr>
                      <th className="px-2 py-1.5">Recipient</th>
                      <th className="px-2 py-1.5">Direct</th>
                      <th className="px-1 py-1.5">Type</th>
                      <th className="px-2 py-1.5">Caller assigned</th>
                      <th className="px-2 py-1.5">Duration</th>
                      <th className="px-2 py-1.5">Timeline</th>
                      <th className="px-2 py-1.5">Interaction Summary Details</th>
                      <th className="px-2 py-1.5 text-center">Audio Link</th>
                      <th className="px-2 py-1.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {filteredLogs.map(log => {
                      const meta = enrichedMeta[log.id];
                      const direction = meta?.direction || 'Outgoing';
                      const recordSaved = meta?.recorded || false;

                      return (
                        <tr key={log.id} className="hover:bg-slate-50/50 transition">
                          <td className="px-2 py-2">
                            <div className="font-bold text-slate-900 text-[11px] leading-tight">{log.clientName}</div>
                            <div className="text-[10px] font-mono text-slate-400">{log.clientPhone}</div>
                          </td>
                          <td className="px-2 py-2">
                            <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase ${
                              direction === 'Incoming' ? 'bg-sky-50 text-sky-700 border border-sky-200' : 'bg-purple-50 text-purple-700 border border-purple-200'
                            }`}>
                              {direction === 'Incoming' ? '➔ In' : '➔ Out'}
                            </span>
                          </td>
                          <td className="px-1 py-2">
                            <span className={`px-1.2 py-0.2 rounded text-[8px] font-bold uppercase ${
                              log.type === 'Answered' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-650'
                            }`}>
                              {log.type}
                            </span>
                          </td>
                          <td className="px-2 py-2 font-semibold text-slate-600">{log.agentName}</td>
                          <td className="px-2 py-2 font-mono font-bold text-slate-600">{log.duration}</td>
                          <td className="px-2 py-2 text-slate-450">{log.time}</td>
                          <td className="px-2 py-2 text-slate-500 max-w-xs truncate" title={log.notes}>
                            {log.notes}
                          </td>
                          <td className="px-2 py-2 text-center">
                            {recordSaved ? (
                              <div className="inline-flex flex-col items-center gap-1">
                                <button 
                                  onClick={() => handlePlayAudio(log.id, log.duration)}
                                  className={`p-1 rounded-full border transition ${
                                    playingAudioId === log.id 
                                      ? 'bg-indigo-100 text-indigo-700 border-indigo-300' 
                                      : 'bg-indigo-50 text-indigo-600 border-indigo-150 hover:bg-indigo-100'
                                  }`}
                                  title="Playback Recording"
                                >
                                  {playingAudioId === log.id ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                                </button>
                                {playingAudioId === log.id && (
                                  <div className="w-8 h-1 bg-slate-250 rounded overflow-hidden">
                                    <div 
                                      className="bg-indigo-650 h-full transition-all duration-300"
                                      style={{ width: `${playbackProgress[log.id] || 0}%` }}
                                    />
                                  </div>
                                )}
                                <span className="text-[7.5px] text-indigo-600 font-bold uppercase tracking-wider">
                                  {meta.recordingLength || 'REC'}
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-350 text-[9px] italic">-</span>
                            )}
                          </td>
                          <td className="px-2 py-2 text-right">
                            <div className="flex gap-1 justify-end items-center">
                              <button 
                                onClick={() => {
                                  if ((window as any).__triggerGlobalPrint) {
                                    (window as any).__triggerGlobalPrint(
                                      `Call Log: ${log.clientName}`, 
                                      'call_log', 
                                      {
                                        ...log,
                                        direction: direction
                                      }
                                    );
                                  }
                                }}
                                className="px-2 py-1 text-[9px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded flex items-center gap-1 shrink-0 cursor-pointer"
                                title="Print log transcript"
                              >
                                <Printer className="w-3 h-3" /> Print
                              </button>
                              {onDeleteLog && (
                                <button 
                                  onClick={() => onDeleteLog(log.id)}
                                  className="px-2 py-1 text-[9px] bg-red-50 hover:bg-red-100 text-red-650 hover:text-red-700 font-bold rounded flex items-center gap-1 shrink-0 cursor-pointer"
                                  title="Delete this call log"
                                >
                                  <Trash2 className="w-3 h-3" /> Delete
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400">
              <span>Automatic dynamic telemetry logger active.</span>
              <span>All recorded files encrypted via 256-AES guidelines.</span>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUBPANEL 2: IVR INTEGRATION FLOW DESIGNER ==================== */}
      {activeTab === 'ivr' && (
        <div className="space-y-4">
          
          {/* Main prompt view and controller */}
          <div className="bg-white p-3 rounded border border-slate-200 grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center gap-2">
                <Shuffle className="w-5 h-5 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Interactive Voice Response (IVR) Logic Flow</h3>
              </div>
              <p className="text-[10px] text-slate-400 leading-relaxed">
                Design the automated voice gateway. Inbound customers dial onto the proxy server and traverse nodes 
                by feeding DTMF tones through their keypad. Connect routes directly to specialist agent departments.
              </p>

              {/* Editing greeting text */}
              <div className="space-y-1">
                <label className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500">Edit Main Voice Welcome prompt greeting</label>
                <div className="flex gap-2">
                  <textarea
                    className="w-full font-mono text-[10.5px] p-2 border border-slate-202 rounded bg-neutral-50 focus:bg-white focus:outline-none"
                    rows={3}
                    value={ivrGreeting}
                    onChange={(e) => setIvrGreeting(e.target.value)}
                  />
                </div>
              </div>

              {/* Graphic Flow Layout */}
              <div className="border border-slate-200 rounded p-3 bg-slate-50 space-y-3 font-sans">
                <span className="text-[8.5px] font-mono uppercase bg-indigo-100 text-indigo-750 px-1.5 py-0.2 rounded font-bold">Flow chart Architecture</span>
                
                {/* Visual flowchart graph layout */}
                <div className="flex flex-col gap-2 font-mono text-[10px] font-semibold text-slate-700">
                  <div className="p-2 border border-dashed border-slate-350 bg-white rounded text-center">
                    📞 Inbound Call Detected
                  </div>
                  <div className="flex justify-center">↓</div>
                  <div className="p-2 border border-slate-250 bg-indigo-50/50 rounded flex flex-col items-center">
                    <span className="text-[8px] uppercase tracking-widest text-slate-400 font-extrabold">Welcome Greeting Node</span>
                    <p className="text-center italic text-slate-600 text-[9.5px]">"Thank you for calling Expert CRM..."</p>
                  </div>
                  <div className="flex justify-center">↓</div>

                  <div className="grid grid-cols-3 gap-2 text-center text-[9.5px]">
                    <div className="p-2 border rounded bg-indigo-600/5 hover:bg-indigo-600/10 border-indigo-300">
                      <div className="font-extrabold text-indigo-700">[KEY 1]</div>
                      <div className="text-slate-500 mt-0.5">Corporate Sales</div>
                      <div className="text-[8.5px] font-mono text-indigo-500 mt-1 font-bold">→ Rep Rajesh</div>
                    </div>
                    <div className="p-2 border rounded bg-[#10b981]/5 hover:bg-[#10b981]/15 border-emerald-300">
                      <div className="font-extrabold text-emerald-700">[KEY 2]</div>
                      <div className="text-slate-500 mt-0.5">SLA Support Help</div>
                      <div className="text-[8.5px] font-mono text-emerald-500 mt-1 font-bold">→ Rep Pooja</div>
                    </div>
                    <div className="p-2 border rounded bg-purple-50 hover:bg-purple-100 border-purple-250">
                      <div className="font-extrabold text-purple-700">[KEY 3]</div>
                      <div className="text-slate-500 mt-0.5">Billing Invoices</div>
                      <div className="text-[8.5px] font-mono text-purple-400 mt-1 font-bold">→ Rep Aman</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Interactive simulator pad */}
            <div className="lg:col-span-5 bg-slate-950 text-white p-3 rounded border border-slate-900 flex flex-col justify-between h-[450px]">
              <div>
                <span className="text-[9px] uppercase font-bold text-indigo-400 block tracking-wider">Live Sandbox Sandbox</span>
                <h4 className="text-[12px] font-bold text-slate-100">Interactive IVR Keypad Simulator</h4>
                <p className="text-[9.5px] text-slate-400 mt-0.5">Mock dialing client side to review audio menu sequences.</p>
              </div>

              {!ivrSimulatorActive ? (
                <div className="my-auto text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto animate-pulse">
                    <Shuffle className="w-5 h-5 text-indigo-400" />
                  </div>
                  <button
                    onClick={handleStartIvrSimulator}
                    className="px-3.5 py-1.5 bg-indigo-650 hover:bg-indigo-700 text-white rounded font-bold text-[10.5px] uppercase tracking-wider"
                  >
                    Initiate IVR Call Simulator
                  </button>
                </div>
              ) : (
                <div className="my-auto space-y-3.5">
                  <div className="text-center">
                    <div className="inline-block bg-indigo-950 text-indigo-350 border border-indigo-850 px-2.5 py-0.5 rounded font-mono text-[9px] uppercase tracking-widest animate-pulse">
                      Playing Node Greeting...
                    </div>
                    
                    {/* Live tree state tags */}
                    <div className="mt-2 flex justify-center gap-1.5 text-[9px] font-mono font-bold">
                      <span className={`px-1.5 py-0.2 rounded ${ivrNode === 'welcome' ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-400'}`}>Welcome</span>
                      <span className={`px-1.5 py-0.2 rounded ${ivrNode === 'routing_sales' ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-400'}`}>Sales Desk</span>
                      <span className={`px-1.5 py-0.2 rounded ${ivrNode === 'routing_support' ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-400'}`}>SLA Support</span>
                      <span className={`px-1.5 py-0.2 rounded ${ivrNode === 'routing_billing' ? 'bg-indigo-500 text-white' : 'bg-slate-900 text-slate-400'}`}>Billing</span>
                    </div>
                  </div>

                  {/* Scrolled IVR Transcripts */}
                  <div className="bg-slate-900 rounded p-2 h-26 overflow-y-auto space-y-1.5 font-mono text-[9px] text-slate-350 text-left border border-slate-850">
                    {ivrTranscript.map((t, idx) => (
                      <p key={idx} className={t.includes('User Key:') ? 'text-indigo-400' : 'text-slate-300'}>
                        {t}
                      </p>
                    ))}
                  </div>

                  {/* Simulator Numeric Inputs Dialpad */}
                  <div className="grid grid-cols-3 gap-1 max-w-[150px] mx-auto text-center font-mono select-none">
                    {['1','2','3','4','5','6','7','8','9','*','0','#'].map(key => (
                      <button
                        key={key}
                        onClick={() => handleIvrKeyPress(key)}
                        className="h-6 rounded bg-slate-900 hover:bg-slate-800 border border-slate-850 text-[10px] font-bold text-slate-300"
                      >
                        {key}
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-1">
                    <button
                      onClick={() => closeIvrSimulator(true)}
                      className="flex-1 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold uppercase"
                    >
                      Answered (Disconnect & Logs)
                    </button>
                    <button
                      onClick={() => closeIvrSimulator(false)}
                      className="flex-1 py-1 bg-red-650 hover:bg-red-700 text-white rounded text-[10px] font-bold uppercase"
                    >
                      Decline Inbound
                    </button>
                  </div>
                </div>
              )}

              <div className="text-[8.5px] text-slate-500 flex justify-between uppercase font-mono">
                <span>IVR Version 1.4-Corporate</span>
                <span>Active Channels: 6 free</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ==================== SUBPANEL 3: AGENT PERFORMANCE REPORTS ==================== */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          
          {/* Key Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-3 bg-white rounded border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-450 block">Aggregated Calls Vol</span>
              <h4 className="text-base font-extrabold text-slate-800 mt-0.5">{callLogs.length + 152} Total</h4>
              <p className="text-[9px] text-[#10b981] font-bold mt-1">▲ 14% vs last week campaign</p>
            </div>
            <div className="p-3 bg-white rounded border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-450 block">Average Handling Time</span>
              <h4 className="text-base font-extrabold text-slate-800 mt-0.5">3m 48s</h4>
              <p className="text-[9px] text-slate-450 mt-1 font-mono">Target benchmark AHT &lt; 4m</p>
            </div>
            <div className="p-3 bg-white rounded border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-450 block">Inbound SLA Recovery</span>
              <h4 className="text-base font-extrabold text-[#10b981] mt-0.5">94.8%</h4>
              <p className="text-[9px] text-[#10b981] font-bold mt-1">▲ Over target buffer index</p>
            </div>
            <div className="p-3 bg-white rounded border border-slate-200">
              <span className="text-[10px] uppercase font-bold text-slate-450 block">Missed call speed back</span>
              <h4 className="text-base font-extrabold text-indigo-655 mt-0.5">&lt; 15 mins</h4>
              <p className="text-[9px] text-slate-400 mt-1">VIP callouts flagged immediately</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            
            {/* Core Agent Stats list */}
            <div className="md:col-span-8 bg-white p-3 rounded border border-slate-200">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight mb-2 flex items-center gap-1">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Active Agent Call Metrics Benchmarking (Daily)
              </h3>
              <p className="text-[10px] text-slate-400 mb-4">
                Operational KPIs comparing outbound dial campaigns, response answer ratios, and satisfaction ratings.
              </p>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-slate-650 text-[11px]">
                  <thead className="bg-slate-50 text-slate-450 border-b border-slate-200 text-[8.5px] font-black uppercase tracking-wider">
                    <tr>
                      <th className="px-2 py-1.5">Agent Officer Profiles</th>
                      <th className="px-2 py-1.5">Dials Initiated</th>
                      <th className="px-2 py-1.5">Answer Rate (%)</th>
                      <th className="px-2 py-1.5">Avg Talk Time (AHT)</th>
                      <th className="px-2 py-1.5">Cust CSAT</th>
                      <th className="px-2 py-1.5">Performance Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {[
                      { name: 'Agent Aman Varma', dials: 42, rate: 92, aht: '4m 32s', csat: 4.8 },
                      { name: 'Agent Rajesh Sen', dials: 38, rate: 78, aht: '5m 12s', csat: 4.2 },
                      { name: 'Agent Pooja Sharma', dials: 56, rate: 95, aht: '3m 45s', csat: 4.9 },
                      { name: 'Agent Vikram Birla', dials: 29, rate: 84, aht: '6m 10s', csat: 4.5 }
                    ].map(agent => (
                      <tr key={agent.name} className="hover:bg-slate-50/50">
                        <td className="px-2 py-2.5 font-bold text-slate-800">{agent.name}</td>
                        <td className="px-2 py-2.5 font-bold text-slate-600">{agent.dials} calls</td>
                        <td className="px-2 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700">{agent.rate}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded overflow-hidden">
                              <div className="bg-indigo-600 h-full" style={{ width: `${agent.rate}%` }} />
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 font-mono text-slate-600">{agent.aht}</td>
                        <td className="px-2 py-2.5 font-black text-amber-600">★ {agent.csat} / 5.0</td>
                        <td className="px-2 py-2.5">
                          <span className={`px-1.5 py-0.2 rounded text-[8.5px] font-bold uppercase border ${
                            agent.csat >= 4.7 ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                            {agent.csat >= 4.7 ? 'Outstanding' : 'Strong'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Inbound Call Categories chart mockup */}
            <div className="md:col-span-4 bg-white p-3 rounded border border-slate-200 space-y-3.5">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Call Volume Breakdown</h3>
              <p className="text-[10px] text-slate-400">Campaign category analytics on active inbound trunks.</p>

              <div className="space-y-2 pt-1">
                {[
                  { label: 'Outbound sales follow-up', count: 68, pct: 45, color: 'bg-indigo-600' },
                  { label: 'SLA priority tickets callback', count: 42, pct: 28, color: 'bg-green-500' },
                  { label: 'Quotation pricing negotiation', count: 26, pct: 17, color: 'bg-purple-500' },
                  { label: 'Billing Invoices inquiry', count: 16, pct: 10, color: 'bg-amber-500' }
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="text-slate-650 font-bold truncate max-w-[150px]">{item.label}</span>
                      <span className="font-mono text-slate-400">({item.count} calls) <strong>{item.pct}%</strong></span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded overflow-hidden">
                      <div className={`${item.color} h-full`} style={{ width: `${item.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3 relative text-center">
                <p className="text-[10.5px] font-bold text-slate-600">Peak hour calling high performance bands</p>
                <div className="flex justify-between text-[9px] mt-2 font-semibold text-slate-400 font-mono">
                  <span>10:00 - 13:00 (Prime)</span>
                  <span>15:00 - 17:30 (Sustained)</span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ==================== SUBPANEL 4: ADMINISTRATIVE SETTINGS & GATEWAY CREDENTIALS ==================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded border border-slate-200">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <Shield className="w-5 h-5 text-indigo-600 animate-pulse" />
                  Credentials & Gateway Configuration
                </h3>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Update active Twilio, Razorpay, Groq, Cloudflare, and SMTP server credentials for incoming and outgoing operations.
                </p>
              </div>
              {saveAlert && (
                <div className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold rounded animate-bounce">
                  {saveAlert}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              
              {/* Card 1: Twilio Telephony Node */}
              <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3.5">
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-1">
                  <PhoneCall className="w-4 h-4" /> Twilio Telephony & Channels Config
                </span>
                <div className="space-y-2.5 text-xs font-medium">
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">Twilio Account SID (incoming/outgoing calls)</label>
                    <input 
                      type="text" 
                      value={gatewayConfig.accountSid} 
                      onChange={(e) => setGatewayConfig(prev => ({ ...prev, accountSid: e.target.value }))}
                      className="w-full p-2 border border-slate-200 rounded bg-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">Twilio Auth Token</label>
                    <input 
                      type="password" 
                      value={gatewayConfig.authToken} 
                      onChange={(e) => setGatewayConfig(prev => ({ ...prev, authToken: e.target.value }))}
                      className="w-full p-2 border border-slate-200 rounded bg-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">Twilio Service SID (Verify/IVR)</label>
                    <input 
                      type="text" 
                      value={gatewayConfig.serviceSid} 
                      onChange={(e) => setGatewayConfig(prev => ({ ...prev, serviceSid: e.target.value }))}
                      className="w-full p-2 border border-slate-200 rounded bg-white font-mono text-[11px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">Twilio VoIP Phone</label>
                      <input 
                        type="text" 
                        value={gatewayConfig.phoneNumber} 
                        onChange={(e) => setGatewayConfig(prev => ({ ...prev, phoneNumber: e.target.value }))}
                        className="w-full p-2 border border-slate-200 rounded bg-white font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase text-slate-455 mb-1">Meta WhatsApp Phone</label>
                      <input 
                        type="text" 
                        value={gatewayConfig.whatsappNumber} 
                        onChange={(e) => setGatewayConfig(prev => ({ ...prev, whatsappNumber: e.target.value }))}
                        className="w-full p-2 border border-slate-200 rounded bg-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Corporate Outbound SMTP Settings */}
              <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3.5">
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-1">
                  <Mail className="w-4 h-4" /> Corporate SMTP Email Relays
                </span>
                <div className="space-y-2.5 text-xs font-medium">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">SMTP Outbound Host</label>
                      <input 
                        type="text" 
                        value="smtp.gmail.com" 
                        disabled
                        className="w-full p-2 border border-slate-200 rounded bg-slate-100 font-mono text-[11px] text-slate-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">SMTP Port</label>
                      <input 
                        type="text" 
                        value="587" 
                        disabled
                        className="w-full p-2 border border-slate-200 rounded bg-slate-100 font-mono text-[11px] text-slate-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">Authenticated SMTP Username</label>
                    <input 
                      type="text" 
                      value={gatewayConfig.smtpUser} 
                      onChange={(e) => setGatewayConfig(prev => ({ ...prev, smtpUser: e.target.value }))}
                      className="w-full p-2 border border-slate-200 rounded bg-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">App Specific Password</label>
                    <input 
                      type="password" 
                      value={gatewayConfig.smtpPass} 
                      onChange={(e) => setGatewayConfig(prev => ({ ...prev, smtpPass: e.target.value }))}
                      className="w-full p-2 border border-slate-200 rounded bg-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Razorpay & Groq AI keys */}
              <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3.5">
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-1">
                  <Lock className="w-4 h-4" /> Razorpay & AI Copilot Integrations
                </span>
                <div className="space-y-2.5 text-xs font-medium">
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">Groq Copilot API Key</label>
                    <input 
                      type="password" 
                      value={gatewayConfig.groqApiKey} 
                      onChange={(e) => setGatewayConfig(prev => ({ ...prev, groqApiKey: e.target.value }))}
                      className="w-full p-2 border border-slate-200 rounded bg-white font-mono text-[11px]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">Razorpay Key ID</label>
                      <input 
                        type="text" 
                        value={gatewayConfig.razorpayKeyId} 
                        onChange={(e) => setGatewayConfig(prev => ({ ...prev, razorpayKeyId: e.target.value }))}
                        className="w-full p-2 border border-slate-200 rounded bg-white font-mono text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] font-extrabold uppercase text-slate-455 mb-1">Razorpay Key Secret</label>
                      <input 
                        type="password" 
                        value={gatewayConfig.razorpaySecret} 
                        onChange={(e) => setGatewayConfig(prev => ({ ...prev, razorpaySecret: e.target.value }))}
                        className="w-full p-2 border border-slate-200 rounded bg-white font-mono text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4: Cloudflare Security Shield */}
              <div className="p-4 bg-slate-50 rounded border border-slate-200 space-y-3.5">
                <span className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider flex items-center gap-1">
                  <Shield className="w-4 h-4" /> Cloudflare Security Shield
                </span>
                <div className="space-y-2.5 text-xs font-medium">
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">Cloudflare API Token</label>
                    <input 
                      type="password" 
                      value={gatewayConfig.cloudflareToken} 
                      onChange={(e) => setGatewayConfig(prev => ({ ...prev, cloudflareToken: e.target.value }))}
                      className="w-full p-2 border border-slate-200 rounded bg-white font-mono text-[11px]"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-extrabold uppercase text-slate-450 mb-1">Cloudflare Account ID</label>
                    <input 
                      type="text" 
                      value={gatewayConfig.cloudflareAccountId} 
                      onChange={(e) => setGatewayConfig(prev => ({ ...prev, cloudflareAccountId: e.target.value }))}
                      className="w-full p-2 border border-slate-200 rounded bg-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-5 pt-4 border-t border-slate-200 flex justify-between items-center">
              <button 
                onClick={() => {
                  const emptyConfig = {
                    accountSid: '',
                    authToken: '',
                    serviceSid: '',
                    phoneNumber: '',
                    whatsappNumber: '',
                    groqApiKey: '',
                    razorpayKeyId: '',
                    razorpaySecret: '',
                    cloudflareToken: '',
                    cloudflareAccountId: '',
                    smtpUser: '',
                    smtpPass: '',
                    activeTrunk: 'Mumbai SSL proxy Gateway',
                    channelStatus: 'Inactive' as 'Active' | 'Inactive'
                  };
                  setGatewayConfig(emptyConfig);
                  localStorage.setItem('calling_gateway_config', JSON.stringify(emptyConfig));
                  setSaveAlert('All present system user credentials wiped.');
                  setTimeout(() => setSaveAlert(null), 3000);
                }}
                className="px-4 py-2 border border-red-200 text-red-650 rounded text-xs font-bold hover:bg-red-50 transition cursor-pointer"
              >
                Wipe All Credentials
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const mockConfig = {
                      accountSid: 'AC_MOCK_TWILIO_SID_FOR_DEMO_PURPOSES',
                      authToken: 'MOCK_AUTH_TOKEN_FOR_DEMO_PURPOSES',
                      serviceSid: 'VA_MOCK_SERVICE_SID_FOR_DEMO_PURPOSES',
                      phoneNumber: '+1 (555) 019-2831',
                      whatsappNumber: '+1 (555) 019-2831',
                      groqApiKey: 'gsk_MOCK_GROQ_API_KEY_DEMO_CREDENTIALS',
                      razorpayKeyId: 'rzp_test_MOCK_RAZORPAY_KEY_ID',
                      razorpaySecret: 'MOCK_RAZORPAY_SECRET_VALUE',
                      cloudflareToken: 'cfut_MOCK_CLOUDFLARE_TOKEN_VALUE',
                      cloudflareAccountId: 'MOCK_CLOUDFLARE_ACCOUNT_ID',
                      smtpUser: 'demo@expert-crm-telephony.com',
                      smtpPass: 'MOCK_SMTP_PASSWORD_DEMO',
                      activeTrunk: 'Mumbai SSL proxy Gateway',
                      channelStatus: 'Active' as 'Active' | 'Inactive'
                    };
                    setGatewayConfig(mockConfig);
                    localStorage.setItem('calling_gateway_config', JSON.stringify(mockConfig));
                    setSaveAlert('Restored demo credentials.');
                    setTimeout(() => setSaveAlert(null), 3000);
                  }}
                  className="px-4 py-2 border border-slate-250 text-slate-600 rounded text-xs font-bold hover:bg-slate-50 transition cursor-pointer"
                >
                  Load Demo Credentials
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    localStorage.setItem('calling_gateway_config', JSON.stringify(gatewayConfig));
                    setSaveAlert('Credentials updated successfully!');
                    setTimeout(() => setSaveAlert(null), 3000);
                  }}
                  className="px-5 py-2 bg-indigo-650 hover:bg-indigo-700 text-white rounded text-xs font-bold transition shadow-sm cursor-pointer"
                >
                  Save Credentials Configuration
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
