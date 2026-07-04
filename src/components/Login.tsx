import React, { useState } from 'react';
import { 
  Lock, Mail, Eye, EyeOff, ShieldAlert, Sparkles, LogIn, Check, 
  Info, ShieldCheck, HeartHandshake, X, Fingerprint, Activity, 
  ArrowRight, ShieldAlert as ShieldIcon, Compass, Users, CheckCircle2
} from 'lucide-react';
import { AccessRole } from '../types';

export interface UserSession {
  name: string;
  email: string;
  role: AccessRole;
  avatar: string;
}

export const PRESET_CREDENTIALS = [
  {
    name: 'M. Mehta',
    email: 'admin@expertcrm.com',
    password: 'adminpassword123',
    role: 'Super Admin' as AccessRole,
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    badgeColor: 'bg-rose-50 border-rose-200 text-rose-700',
    description: 'Full administrative control over all enterprise security & CRM logs.'
  },
  {
    name: 'Aman Varma',
    email: 'aman@expertcrm.com',
    password: 'salesmanager123',
    role: 'Sales Manager' as AccessRole,
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face',
    badgeColor: 'bg-amber-50 border-amber-200 text-amber-700',
    description: 'Corporate client roster, outbound dialer queue & invoice records.'
  },
  {
    name: 'Deepa Rao',
    email: 'deepa@expertcrm.com',
    password: 'supportagent123',
    role: 'Support Agent' as AccessRole,
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    badgeColor: 'bg-sky-50 border-sky-200 text-sky-700',
    description: 'Live service desk, SLA complaints queue & support ticket drafts.'
  },
  {
    name: 'Ketan Patel',
    email: 'ketan@expertcrm.com',
    password: 'hrspecialist123',
    role: 'HR Specialist' as AccessRole,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    badgeColor: 'bg-emerald-50 border-emerald-200 text-emerald-700',
    description: 'Staff dispatched directories, field tasks & automated payroll runs.'
  },
  {
    name: 'Guest User',
    email: 'guest@expertcrm.com',
    password: 'guestuser123',
    role: 'Guest' as AccessRole,
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face',
    badgeColor: 'bg-slate-50 border-slate-200 text-slate-700',
    description: 'Audit & observation mode with restricted write access controls.'
  }
];

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPresetIndex, setSelectedPresetIndex] = useState<number | null>(null);

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ success: boolean; message: string; presetMatch?: typeof PRESET_CREDENTIALS[0] } | null>(null);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);
    
    const cleanEmail = forgotEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setForgotStatus({ success: false, message: 'Please provide your registered security email.' });
      return;
    }

    setIsForgotSubmitting(true);
    setTimeout(() => {
      setIsForgotSubmitting(false);
      const match = PRESET_CREDENTIALS.find(p => p.email.toLowerCase().trim() === cleanEmail);
      if (match) {
        setForgotStatus({
          success: true,
          message: `Security authentication record decrypted! We verified identity directory for ${match.name}.`,
          presetMatch: match
        });
      } else {
        setForgotStatus({
          success: true,
          message: `If an account with "${forgotEmail}" is registered in our security directory, a secure recovery payload link has been dispatched to it.`
        });
      }
    }, 600);
  };

  const handlePresetSelect = (index: number) => {
    const preset = PRESET_CREDENTIALS[index];
    setEmail(preset.email);
    setPassword(preset.password);
    setSelectedPresetIndex(index);
    setError(null);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please provide a valid corporate email Address.');
      return;
    }
    if (!password) {
      setError('Please provide your secure access password.');
      return;
    }

    setIsSubmitting(true);

    // Simulate verification delay to mimic modern enterprise SSO handshake
    setTimeout(() => {
      const match = PRESET_CREDENTIALS.find(
        p => p.email.toLowerCase().trim() === email.toLowerCase().trim() && p.password === password
      );

      if (match) {
        onLoginSuccess({
          name: match.name,
          email: match.email,
          role: match.role,
          avatar: match.avatar
        });
      } else {
        setError('Access authorization denied. Invalid email credentials or password.');
        setIsSubmitting(false);
      }
    }, 750);
  };

  return (
    <div id="login-module-container" className="min-h-screen w-screen bg-slate-50 flex flex-col justify-between font-sans transition-all">
      
      {/* Upper header */}
      <header className="w-full bg-white border-b border-slate-200/80 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex gap-1 items-end h-7 shrink-0">
              <span className="w-1.5 h-4.5 bg-indigo-650 rounded-xs block"></span>
              <span className="w-1.5 h-6 bg-indigo-500 rounded-xs block"></span>
              <span className="w-1.5 h-3.5 bg-emerald-500 rounded-xs block"></span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-wider leading-none text-slate-900 uppercase">EXPERT CRM</h1>
                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 tracking-wide">v2.4</span>
              </div>
              <p className="text-[10px] text-slate-400 font-bold tracking-widest mt-0.5">Enterprise Administration Framework</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 font-mono bg-slate-50 border border-slate-200 px-3 py-1 rounded-xl">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[10px] font-bold text-slate-600">Enterprise Nodes: Secure</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main card panels container */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
          
          {/* LEFT SIDE: Immersive Brand Presentation */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
            {/* Glowing Accent Orbs in Slate Background */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/25 to-purple-600/5 rounded-full filter blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-emerald-500/10 to-indigo-500/10 rounded-full filter blur-3xl -ml-20 -mb-20 pointer-events-none"></div>
            
            <div className="relative space-y-8">
              {/* Badge */}
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] font-bold uppercase text-indigo-300 bg-indigo-500/20 backdrop-blur rounded-full border border-indigo-500/30">
                  <Fingerprint className="w-3.5 h-3.5 text-indigo-400" />
                  Enterprise Gateway
                </span>
              </div>

              {/* Pitch */}
              <div className="space-y-4">
                <h2 className="text-3xl font-black text-white tracking-tight leading-8">
                  The complete control deck for your <span className="text-indigo-400">customer ecosystem</span>.
                </h2>
                <p className="text-xs text-slate-350 leading-relaxed font-medium">
                  Expertly manage telephonic leads, dispatcher roster timelines, staff payroll sheets, customer service SLAs, and real-time support requests under a unified security architecture.
                </p>
              </div>

              {/* Interactive Features List */}
              <div className="space-y-3.5 pt-4">
                <div className="flex gap-3 items-start p-3 bg-white/5 border border-white/10 rounded-2xl">
                  <Activity className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Live Call Center Simulator & Leads Desk</h4>
                    <p className="text-[10px] text-slate-405 mt-0.5">Route dynamic IVR, track lead metrics, and sync sales interaction logs.</p>
                  </div>
                </div>

                <div className="flex gap-3 items-start p-3 bg-white/5 border border-white/10 rounded-2xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-bold text-white">Role-Based Access Safeguards</h4>
                    <p className="text-[10px] text-slate-405 mt-0.5">Enforces tailored administrative scopes for Super Admins, Sales, Support, & HR.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Micro Uptime Metrics */}
            <div className="relative mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between text-slate-400 font-mono text-[10px]">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                <span>Uptime: 99.99%</span>
              </div>
              <div>
                <span>ISO 27001 Certified Desk</span>
              </div>
            </div>
          </div>


          {/* RIGHT SIDE: High Precision Form & Fast Presets */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            
            {/* Form Container */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md relative overflow-hidden">
              {/* Rainbow Highlight Line */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <LogIn className="w-5 h-5 text-indigo-600" /> Sign In Credentials
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">Please insert your corporate identifier credentials to verify workspace session ownership.</p>
                </div>

                {error && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start gap-3 text-xs font-semibold">
                    <ShieldIcon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5 animate-bounce" />
                    <span className="leading-snug">{error}</span>
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* UID/Email Field */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest text-[9.5px]">UID(Email)*</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type="email"
                        required
                        placeholder="e.g. employee@expertcrm.com"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError(null);
                          setSelectedPresetIndex(null);
                        }}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all focus:ring-1 focus:ring-indigo-500 outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest text-[9.5px]">
                      <span>Password*</span>
                      <button
                        type="button"
                        onClick={() => {
                          setForgotEmail(email);
                          setForgotStatus(null);
                          setIsForgotOpen(true);
                        }}
                        className="text-[9.5px] font-extrabold text-indigo-600 hover:text-indigo-800 transition hover:underline lowercase"
                      >
                        forget password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setError(null);
                          setSelectedPresetIndex(null);
                        }}
                        className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition-all focus:ring-1 focus:ring-indigo-500 outline-none text-xs font-semibold text-slate-850"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition p-0.5 rounded"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Active safeguards state */}
                  <div className="p-3 bg-slate-50 border border-slate-150 rounded-2xl space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        defaultChecked 
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4 w-4 mt-0.5 cursor-pointer" 
                      />
                      <div>
                        <span className="block text-[11px] font-black text-slate-750">Enforce dynamic active IP tracking</span>
                        <p className="text-[9.5px] text-slate-450 mt-0.5">Automated geo IP matching and session lock active on login handshake.</p>
                      </div>
                    </label>
                  </div>

                  {/* Submission */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-[0.99] mt-2 shadow-indigo-100"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>AES Handshake Audit Processing...</span>
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 shrink-0 text-indigo-200" />
                        <span>Login into Secure Workspace</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

          </div>

        </div>
      </main>

      {/* Forgot Password Modal Overlay */}
      {isForgotOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl relative overflow-hidden">
            {/* Accent background line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
            
            <button
              onClick={() => setIsForgotOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 transition p-1 bg-slate-50 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-[9px] uppercase tracking-widest font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">Directory Recovery Desk</span>
              <h3 className="text-md font-black text-slate-900 tracking-tight mt-2 flex items-center gap-1.5">
                <Lock className="w-4.5 h-4.5 text-indigo-600" /> Account Access Password Recovery
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">Verify dynamic user identity with standard directory services.</p>
            </div>

            {forgotStatus?.success && forgotStatus.presetMatch ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-2xl text-emerald-850 text-[11px] font-semibold space-y-1">
                  <p className="font-bold text-xs flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Authentication Verified!
                  </p>
                  <p className="text-slate-500 font-medium">We identified your corporate account details. For local evaluation, you can instantly read or auto-fill your login credentials below:</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2">
                    <img
                      src={forgotStatus.presetMatch.avatar}
                      alt={forgotStatus.presetMatch.name}
                      className="w-8 h-8 rounded-full border border-slate-205"
                    />
                    <div>
                      <h4 className="text-xxs font-black text-slate-800 uppercase tracking-wide">{forgotStatus.presetMatch.name}</h4>
                      <p className="text-[9.5px] text-indigo-600 font-bold">{forgotStatus.presetMatch.role}</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] font-mono select-none">
                    <div className="flex justify-between items-center bg-white px-2 py-1.5 border border-slate-150 rounded-lg">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">ID (Email):</span>
                      <span className="font-semibold text-slate-800">{forgotStatus.presetMatch.email}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white px-2 py-1.5 border border-slate-150 rounded-lg">
                      <span className="text-slate-400 font-bold uppercase text-[9px]">password:</span>
                      <span className="font-bold text-slate-950 font-sans tracking-wide bg-slate-150 px-1.5 py-0.5 rounded">{forgotStatus.presetMatch.password}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (forgotStatus.presetMatch) {
                        setEmail(forgotStatus.presetMatch.email);
                        setPassword(forgotStatus.presetMatch.password);
                        setIsForgotOpen(false);
                      }
                    }}
                    className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xxs rounded-xl shadow-sm transition uppercase tracking-wider cursor-pointer"
                  >
                    Auto-Fill Credentials & Sign In
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                {forgotStatus?.message && !forgotStatus.presetMatch && (
                  <div className={`p-3 rounded-2xl text-[11px] font-semibold flex gap-2 ${
                    forgotStatus.success ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-700'
                  }`}>
                    {forgotStatus.success ? <Check className="w-4 h-4 shrink-0 mt-0.5" /> : <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />}
                    <span>{forgotStatus.message}</span>
                  </div>
                )}

                <div className="space-y-1 text-left">
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest">Registered Corporate Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="e.g. employee@expertcrm.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 bg-slate-50/50 focus:bg-white transition outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl text-[10px] text-slate-400 space-y-1.5 text-left">
                  <p className="font-bold text-slate-650 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-indigo-500" /> Directory Notice:
                  </p>
                  <p className="text-slate-500 leading-normal text-[9.5px]">
                    If you forget your password, please contact the workspace Super Administrator or file a security ticket through active support logs. Presets or bypass tools are restricted on production instances.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xxs rounded-xl transition uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotSubmitting}
                    className="flex-1 py-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xxs rounded-xl shadow-md transition uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {isForgotSubmitting ? 'Verifying...' : 'Retrieve Workspace Key'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Global Bottom Credit lines (No system PORT or container jargon) */}
      <footer className="w-full bg-white border-t border-slate-200/80 py-4 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] font-bold text-slate-400">
          <span>© 2026 EXPERT CRM Systems LLC. All rights reserved.</span>
          <div className="flex gap-4">
            <span className="hover:underline cursor-pointer">Security Compliance</span>
            <span className="hover:underline cursor-pointer">Access Policy</span>
            <span className="hover:underline cursor-pointer">Support Helpdesk</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
