import React, { useState, useEffect } from 'react';
import {
  Lock, Mail, Eye, EyeOff, ShieldAlert, Check,
  X, Users, Settings, ArrowRight,
  Smartphone, User, TrendingUp, Handshake, PieChart, Home,
  ShoppingBag, FileText
} from 'lucide-react';
import { AccessRole } from '../types';

export interface UserSession {
  name: string;
  email: string;
  role: AccessRole;
  avatar: string;
  tenantId?: string;
  tenantWorkspaceName?: string;
  tenantPlanId?: string;
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
    description: 'Monitor call agents live, manage campaigns, audit recordings & auto-synced data.'
  },
  {
    name: 'Rohan Sharma',
    email: 'rohan@expertcrm.com',
    password: 'callagent123',
    role: 'Call Agent' as AccessRole,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    badgeColor: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    description: 'Authorized Call Agent with paired Android App (Samsung Galaxy S24 Ultra).'
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

const LaptopDashboardShowcase = () => (
  <div className="relative w-full max-w-[430px] select-none">
    {/* Soft ambient glow behind laptop */}
    <div className="absolute -inset-4 bg-cyan-400/15 blur-2xl rounded-3xl pointer-events-none" />

    {/* Laptop Screen Frame */}
    <div
      className="relative rounded-t-2xl p-[7px] bg-gradient-to-b from-[#1e293b] via-[#0f172a] to-[#090d16] shadow-[0_24px_50px_rgba(2,12,38,0.65)] border border-white/20"
      style={{ transform: 'perspective(1100px) rotateY(-6deg) rotateX(2deg)' }}
    >
      {/* Webcam bezel dot */}
      <div className="flex justify-center pb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-600 border border-slate-500/40" />
      </div>

      {/* Inner Display */}
      <div className="rounded-lg overflow-hidden bg-[#f1f5f9] grid grid-cols-12 h-[225px] sm:h-[245px]">
        {/* Dark Left Sidebar */}
        <div className="col-span-3 bg-gradient-to-b from-[#0b2046] to-[#071530] text-slate-300 py-3 px-1.5 flex flex-col gap-1 border-r border-slate-800/80">
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-[#1173f2] text-white font-semibold text-[9px] shadow-sm">
            <Home className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">Dashboard</span>
          </div>
          {[
            { icon: User, label: 'Leads' },
            { icon: Users, label: 'Customers' },
            { icon: ShoppingBag, label: 'Sales' },
            { icon: FileText, label: 'Reports' },
            { icon: Settings, label: 'Settings' },
          ].map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="flex items-center gap-1.5 px-2 py-1.5 rounded-md text-slate-300/85 text-[9px] font-medium"
            >
              <Icon className="w-2.5 h-2.5 shrink-0 text-sky-300/80" />
              <span className="truncate">{label}</span>
            </div>
          ))}
        </div>

        {/* Main Screen Workspace */}
        <div className="col-span-9 p-2.5 flex flex-col gap-2 bg-[#eef4fb]">
          {/* Top 3 KPI Cards */}
          <div className="grid grid-cols-3 gap-2">
            {/* Total Clients */}
            <div className="rounded-lg p-2 bg-gradient-to-br from-[#2393f8] to-[#0a66e0] text-white shadow-sm">
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center mb-1">
                <User className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="text-[8px] text-white/85 font-medium leading-none">Total Clients</div>
              <div className="text-[13px] font-extrabold tracking-tight mt-0.5 tabular-nums leading-tight">
                1,250
              </div>
            </div>

            {/* Total Deals */}
            <div className="rounded-lg p-2 bg-gradient-to-br from-[#14b886] to-[#069468] text-white shadow-sm">
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center mb-1">
                <TrendingUp className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="text-[8px] text-white/85 font-medium leading-none">Total Deals</div>
              <div className="text-[13px] font-extrabold tracking-tight mt-0.5 tabular-nums leading-tight">
                $85,750
              </div>
            </div>

            {/* Conversion Rate */}
            <div className="rounded-lg p-2 bg-gradient-to-br from-[#8a5cf5] to-[#692be0] text-white shadow-sm">
              <div className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center mb-1">
                <Check className="w-2.5 h-2.5 text-white" />
              </div>
              <div className="text-[8px] text-white/85 font-medium leading-none">Conversion Rate</div>
              <div className="text-[13px] font-extrabold tracking-tight mt-0.5 tabular-nums leading-tight">
                78%
              </div>
            </div>
          </div>

          {/* Bottom 2 Charts */}
          <div className="grid grid-cols-12 gap-2 flex-1 min-h-0">
            {/* Sales Overview Chart */}
            <div className="col-span-7 bg-white rounded-lg p-2 shadow-xs border border-slate-200/70 flex flex-col justify-between">
              <div className="text-[9px] font-bold text-slate-800">Sales Overview</div>
              <div className="flex-1 flex items-center py-0.5">
                <svg viewBox="0 0 180 76" className="w-full h-full overflow-visible">
                  <defs>
                    <linearGradient id="salesAreaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1d8cf8" stopOpacity="0.28" />
                      <stop offset="100%" stopColor="#1d8cf8" stopOpacity="0.02" />
                    </linearGradient>
                  </defs>
                  {/* Grid lines */}
                  <line x1="16" y1="12" x2="174" y2="12" stroke="#e2e8f0" strokeWidth="0.8" />
                  <line x1="16" y1="32" x2="174" y2="32" stroke="#e2e8f0" strokeWidth="0.8" />
                  <line x1="16" y1="52" x2="174" y2="52" stroke="#e2e8f0" strokeWidth="0.8" />
                  {/* Y axis labels */}
                  <text x="2" y="14" fontSize="6" fill="#94a3b8">90</text>
                  <text x="2" y="34" fontSize="6" fill="#94a3b8">60</text>
                  <text x="2" y="54" fontSize="6" fill="#94a3b8">30</text>
                  {/* Area */}
                  <path
                    d="M22,50 L50,42 L78,34 L106,40 L134,27 L168,14 L168,60 L22,60 Z"
                    fill="url(#salesAreaGrad)"
                  />
                  {/* Line */}
                  <polyline
                    fill="none"
                    stroke="#0b74f0"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="22,50 50,42 78,34 106,40 134,27 168,14"
                  />
                  {/* Nodes */}
                  {[
                    [22, 50],
                    [50, 42],
                    [78, 34],
                    [106, 40],
                    [134, 27],
                    [168, 14]
                  ].map(([cx, cy], idx) => (
                    <circle key={idx} cx={cx} cy={cy} r="2.6" fill="#0b74f0" stroke="#ffffff" strokeWidth="1" />
                  ))}
                  {/* X labels */}
                  <text x="16" y="70" fontSize="6.5" fill="#64748b">Jan</text>
                  <text x="43" y="70" fontSize="6.5" fill="#64748b">Feb</text>
                  <text x="71" y="70" fontSize="6.5" fill="#64748b">Mar</text>
                  <text x="99" y="70" fontSize="6.5" fill="#64748b">Apr</text>
                  <text x="127" y="70" fontSize="6.5" fill="#64748b">May</text>
                  <text x="159" y="70" fontSize="6.5" fill="#64748b">Jun</text>
                </svg>
              </div>
            </div>

            {/* Lead Sources Donut Chart */}
            <div className="col-span-5 bg-white rounded-lg p-2 shadow-xs border border-slate-200/70 flex flex-col justify-between">
              <div className="text-[9px] font-bold text-slate-800">Lead Sources</div>
              <div className="flex justify-center py-0.5">
                <svg viewBox="0 0 64 64" className="w-12 h-12">
                  <circle cx="32" cy="32" r="20" fill="none" stroke="#e2e8f0" strokeWidth="11" />
                  {/* Blue segment */}
                  <circle
                    cx="32" cy="32" r="20" fill="none" stroke="#1d8cf8" strokeWidth="11"
                    strokeDasharray="44 126" strokeDashoffset="0" transform="rotate(-90 32 32)"
                  />
                  {/* Green segment */}
                  <circle
                    cx="32" cy="32" r="20" fill="none" stroke="#10b981" strokeWidth="11"
                    strokeDasharray="34 126" strokeDashoffset="-44" transform="rotate(-90 32 32)"
                  />
                  {/* Amber segment */}
                  <circle
                    cx="32" cy="32" r="20" fill="none" stroke="#f59e0b" strokeWidth="11"
                    strokeDasharray="28 126" strokeDashoffset="-78" transform="rotate(-90 32 32)"
                  />
                  {/* Rose/Purple segment */}
                  <circle
                    cx="32" cy="32" r="20" fill="none" stroke="#ef4444" strokeWidth="11"
                    strokeDasharray="20 126" strokeDashoffset="-106" transform="rotate(-90 32 32)"
                  />
                </svg>
              </div>
              <div className="space-y-0.5 text-[7px] text-slate-600 font-medium">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1d8cf8]" /> Website
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10b981]" /> Referral
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]" /> Social Media
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444]" /> Others
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    {/* Laptop Metallic Base Deck */}
    <div
      className="h-3.5 mx-[-14px] rounded-b-xl bg-gradient-to-b from-[#cbd5e1] via-[#94a3b8] to-[#475569] shadow-[0_14px_30px_rgba(2,10,30,0.65)] relative flex justify-center"
      style={{ transform: 'perspective(1100px) rotateY(-4deg)' }}
    >
      <div className="w-16 h-1 rounded-b-md bg-slate-600/70" />
    </div>
  </div>
);

interface LoginProps {
  onLoginSuccess: (session: UserSession) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState(() => {
    const remembered = localStorage.getItem('crm_remember_identifier');
    return remembered || 'admin@expertcrm.com';
  });
  const [password, setPassword] = useState('adminpassword123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [tenants] = useState(() => {
    const defaultTenants = [
      { id: 'ten-1', name: 'Expert CRM HQ', subdomain: 'expert', planId: 'enterprise', status: 'Active', createdAt: '2026-01-10', seatCount: 42, domainProvider: 'expertcrm.in', clientContactName: 'Super Admin Operational', clientOnboardEmail: 'expertaidtech@gmail.com', adminPassword: 'AdminSecureKey#1' },
      { id: 'ten-2', name: 'Mehta Logistics', subdomain: 'mehtalog', planId: 'pro', status: 'Active', createdAt: '2026-03-15', seatCount: 8, domainProvider: 'expertaidtech.in', clientContactName: 'Rohan Mehta', clientOnboardEmail: 'rohan@mehtalogistics.in', adminPassword: 'MehtaLogSecure88' },
      { id: 'ten-3', name: 'Indus Dynamics Trial', subdomain: 'indusdyn', planId: 'free', status: 'Trialing', createdAt: '2026-06-01', seatCount: 2, domainProvider: 'custom', customDomain: 'crm.indusdynamics.in', clientContactName: 'Nikhil Sen', clientOnboardEmail: 'nikhil@indusdynamics.in', adminPassword: 'IndusTrialPower99' }
    ];
    try {
      const saved = localStorage.getItem('saas_tenants');
      const parsed = saved ? JSON.parse(saved) : null;
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultTenants;
    } catch {
      return defaultTenants;
    }
  });

  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStatus, setForgotStatus] = useState<{ success: boolean; message: string; presetMatch?: typeof PRESET_CREDENTIALS[0] } | null>(null);
  const [isForgotSubmitting, setIsForgotSubmitting] = useState(false);

  useEffect(() => {
    if (rememberMe && email.trim()) {
      localStorage.setItem('crm_remember_identifier', email.trim());
    } else if (!rememberMe) {
      localStorage.removeItem('crm_remember_identifier');
    }
  }, [rememberMe, email]);

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotStatus(null);

    const cleanInput = forgotEmail.trim().toLowerCase();
    if (!cleanInput) {
      setForgotStatus({ success: false, message: 'Please provide your registered email or username.' });
      return;
    }

    setIsForgotSubmitting(true);
    setTimeout(() => {
      setIsForgotSubmitting(false);
      const match = PRESET_CREDENTIALS.find((p) => {
        const em = p.email.toLowerCase().trim();
        const local = em.split('@')[0];
        return em === cleanInput || local === cleanInput || p.name.toLowerCase().trim() === cleanInput;
      });
      if (match) {
        setForgotStatus({
          success: true,
          message: 'Account verified.',
          presetMatch: match
        });
      } else {
        setForgotStatus({
          success: false,
          message: 'No matching user directory record found for this identifier.'
        });
      }
    }, 450);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const cleanIdentifier = email.trim().toLowerCase();
    const cleanPass = password.trim();

    setTimeout(() => {
      // 1. Check preset staff by email, email username prefix, or full name
      const match = PRESET_CREDENTIALS.find((p) => {
        const em = p.email.toLowerCase().trim();
        const usernamePrefix = em.split('@')[0];
        const fullName = p.name.toLowerCase().trim();
        return (
          (em === cleanIdentifier || usernamePrefix === cleanIdentifier || fullName === cleanIdentifier) &&
          p.password === cleanPass
        );
      });

      // 2. Check multi-tenant accounts by email, subdomain, or contact name
      const tenantMatch = tenants.find((t: any) => {
        const em = (t.clientOnboardEmail || '').toLowerCase().trim();
        const sub = (t.subdomain || '').toLowerCase().trim();
        const contact = (t.clientContactName || '').toLowerCase().trim();
        return (
          (em === cleanIdentifier || sub === cleanIdentifier || contact === cleanIdentifier) &&
          t.adminPassword === cleanPass
        );
      });

      if (match) {
        onLoginSuccess({
          name: match.name,
          email: match.email,
          role: match.role,
          avatar: match.avatar
        });
      } else if (tenantMatch) {
        if (tenantMatch.status === 'Suspended') {
          setError('Access denied. Your tenant workspace subscription has been suspended.');
          setIsSubmitting(false);
          return;
        }
        const isExpertCrm =
          tenantMatch.name.toUpperCase().includes('EXPERT CRM') ||
          tenantMatch.id === 'ten-1' ||
          tenantMatch.subdomain === 'expert';
        const assignedRole = isExpertCrm ? 'Super Admin' : 'Admin';
        onLoginSuccess({
          name: tenantMatch.clientContactName || 'Tenant Administrator',
          email: tenantMatch.clientOnboardEmail || '',
          role: assignedRole,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
          tenantId: tenantMatch.id,
          tenantWorkspaceName: tenantMatch.name,
          tenantPlanId: tenantMatch.planId
        });
      } else {
        setError('Invalid Email / Username or Password. Please verify your credentials.');
        setIsSubmitting(false);
      }
    }, 450);
  };

  const featureHighlights = [
    { icon: TrendingUp, label: 'Track Leads & Opportunities' },
    { icon: Handshake, label: 'Manage Customers Efficiently' },
    { icon: PieChart, label: 'Get Powerful Insights & Reports' },
    { icon: Settings, label: 'Automate Your Workflow' }
  ];

  return (
    <div
      id="login-module-container"
      className="min-h-screen w-full relative overflow-hidden flex items-center justify-center font-sans bg-[#041845]"
    >
      {/* ==================== ATMOSPHERIC BACKGROUND LAYERS ==================== */}
      {/* Deep navy-to-bright sunlit glass office gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 68% 35%, rgba(164, 214, 255, 0.72) 0%, rgba(56, 132, 232, 0.55) 36%, rgba(8, 37, 98, 0.94) 76%, #031338 100%)'
        }}
      />

      {/* Subtle blurred architectural office window frames in center-right */}
      <div className="absolute inset-0 pointer-events-none opacity-35 overflow-hidden">
        <div className="absolute top-0 left-[46%] w-2 h-[75%] bg-slate-900/40 blur-[2px]" />
        <div className="absolute top-0 left-[61%] w-2 h-[75%] bg-slate-900/35 blur-[2px]" />
        <div className="absolute top-[28%] left-[38%] right-[12%] h-2 bg-slate-900/30 blur-[2px]" />
        <div className="absolute bottom-0 left-0 right-0 h-[26%] bg-gradient-to-t from-[#031338]/90 via-[#0b2b6b]/60 to-transparent" />
      </div>

      {/* Top-left curved wave ribbon SVG */}
      <svg
        viewBox="0 0 520 260"
        className="absolute top-0 left-0 w-[300px] sm:w-[440px] pointer-events-none select-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="topLeftWave" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#1e88ff" stopOpacity="0.92" />
            <stop offset="100%" stopColor="#083a9b" stopOpacity="0.15" />
          </linearGradient>
        </defs>
        <path d="M0,0 L390,0 C250,42 125,105 0,210 Z" fill="url(#topLeftWave)" />
        <path d="M0,0 L260,0 C165,36 85,84 0,152 Z" fill="#0d6efd" fillOpacity="0.45" />
      </svg>

      {/* Bottom-right vibrant blue sweeping curve SVG */}
      <svg
        viewBox="0 0 1200 220"
        className="absolute bottom-0 right-0 w-full max-w-[1200px] h-[110px] sm:h-[160px] pointer-events-none select-none"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="bottomRightWave" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="#0a58ca" stopOpacity="0" />
            <stop offset="45%" stopColor="#0b6ef6" stopOpacity="0.72" />
            <stop offset="100%" stopColor="#004fc9" stopOpacity="0.96" />
          </linearGradient>
        </defs>
        <path
          d="M140,220 C480,195 830,135 1200,35 L1200,220 Z"
          fill="url(#bottomRightWave)"
        />
        <path
          d="M360,220 C680,188 960,140 1200,88 L1200,220 Z"
          fill="#0ea5e9"
          fillOpacity="0.24"
        />
      </svg>

      {/* ==================== MAIN TWO-COLUMN STAGE ==================== */}
      <div className="relative z-10 w-full max-w-[1260px] mx-auto px-5 sm:px-8 lg:px-10 py-14 lg:py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* ==================== LEFT HERO SHOWCASE ==================== */}
        <div className="lg:col-span-7 flex flex-col justify-between text-white space-y-6 lg:space-y-7">
          {/* Top Brand Headline */}
          <div className="space-y-1.5 text-center lg:text-left lg:pl-4">
            <h1 className="text-4xl sm:text-5xl xl:text-[56px] font-extrabold tracking-tight leading-none">
              <span className="text-white">Expert </span>
              <span className="text-[#16c2ff]">CRM</span>
            </h1>

            <div className="inline-flex flex-col items-center lg:items-center pt-1">
              <p className="text-base sm:text-xl italic font-light tracking-wide text-white/95 flex items-center gap-2.5 sm:gap-3.5">
                <span>Manage</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#16c2ff] inline-block" />
                <span>Grow</span>
                <span className="w-1.5 h-1.5 rounded-full bg-[#16c2ff] inline-block" />
                <span>Succeed</span>
              </p>
              {/* Glowing cyan light streak */}
              <div className="mt-2 h-[2px] w-56 sm:w-72 bg-gradient-to-r from-transparent via-[#22d3ee] to-transparent shadow-[0_0_14px_rgba(34,211,238,0.85)]" />
            </div>
          </div>

          {/* Middle Row: Feature Highlights + Laptop Mockup */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            {/* Value Prop & 4 Feature Items */}
            <div className="md:col-span-5 space-y-5">
              <h2 className="text-2xl sm:text-[27px] font-bold leading-[1.18] tracking-tight text-white">
                Your Business.
                <br />
                Our <span className="text-[#16c2ff]">CRM</span> Power.
              </h2>

              <div className="relative space-y-3.5 pl-1">
                {/* Vertical cyan hairline divider between icon circles and labels */}
                <div className="absolute left-[42px] top-2 bottom-2 w-px bg-cyan-300/45 pointer-events-none" />

                {featureHighlights.map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-5 relative">
                    <div className="w-9 h-9 rounded-full bg-white/95 text-[#0844a4] flex items-center justify-center shrink-0 shadow-[0_6px_18px_rgba(3,18,56,0.35)]">
                      <Icon className="w-4 h-4 stroke-[2.2]" />
                    </div>
                    <span className="text-[13px] sm:text-sm font-medium text-white/95 leading-snug">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Laptop Mockup */}
            <div className="md:col-span-7 flex justify-center md:justify-end">
              <LaptopDashboardShowcase />
            </div>
          </div>

          {/* Bottom-Left Handwritten Script Tagline */}
          <div className="pt-1 hidden sm:block lg:pl-2">
            <div className="inline-block -rotate-2">
              <p
                className="text-2xl sm:text-[30px] text-white/95 leading-[1.02] tracking-wide"
                style={{ fontFamily: 'var(--font-script)' }}
              >
                Smarter CRM.
                <br />
                Greater Growth.
              </p>
              <svg viewBox="0 0 210 18" className="w-44 sm:w-52 h-3.5 mt-0.5 overflow-visible">
                <path
                  d="M2,13 Q95,2 206,5"
                  fill="none"
                  stroke="#18c4ff"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT FLOATING WHITE LOGIN CARD ==================== */}
        <div className="lg:col-span-5 flex justify-center lg:justify-end">
          <div className="w-full max-w-[420px] bg-white rounded-[26px] shadow-[0_28px_75px_rgba(3,16,52,0.48)] px-6 py-8 sm:px-9 sm:py-10 text-slate-900 relative">
            {/* Card Brand Wordmark */}
            <div className="text-center">
              <div className="text-3xl sm:text-[36px] font-extrabold tracking-tight leading-none">
                <span className="text-[#082458]">Expert </span>
                <span className="text-[#0b74f0]">CRM</span>
              </div>
              <div className="mt-4 h-[1.5px] w-full bg-gradient-to-r from-[#38bdf8]/25 via-[#0b74f0]/70 to-[#38bdf8]/25" />
            </div>

            {/* Login Prompt Header */}
            <div className="text-center mt-5 mb-6 space-y-1">
              <h2 className="text-xl sm:text-[22px] font-extrabold text-[#082458] tracking-tight">
                Login to Your Account
              </h2>
              <p className="text-xs sm:text-[13px] font-medium text-slate-600">
                Enter your credentials to continue
              </p>
            </div>

            {/* Error Alert */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 flex items-center gap-2 text-xs font-semibold">
                <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              {/* Email / Username */}
              <div className="relative">
                <User className="w-4 h-4 text-[#1e3a8a]/75 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  aria-label="Email or Username"
                  placeholder="Email / Username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-[#f8fafc] focus:bg-white focus:border-[#0b74f0] focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition"
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="w-4 h-4 text-[#1e3a8a]/75 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  aria-label="Password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(null);
                  }}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-[#f8fafc] focus:bg-white focus:border-[#0b74f0] focus:ring-2 focus:ring-blue-100 text-sm font-medium text-slate-800 placeholder:text-slate-400 outline-none transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-slate-700 transition cursor-pointer"
                >
                  {showPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between pt-1 text-xs sm:text-[13px]">
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#0b74f0] focus:ring-[#0b74f0] cursor-pointer"
                  />
                  <span className="font-medium text-[#082458]">Remember Me</span>
                </label>

                <button
                  type="button"
                  onClick={() => {
                    setForgotEmail(email);
                    setForgotStatus(null);
                    setIsForgotOpen(true);
                  }}
                  className="font-semibold text-[#0b74f0] hover:underline cursor-pointer whitespace-nowrap shrink-0"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-2 py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#0b78f4] to-[#005be0] hover:from-[#0768d8] hover:to-[#004ec4] active:scale-[0.99] disabled:opacity-65 text-white font-bold text-base shadow-[0_10px_24px_rgba(11,116,240,0.34)] transition flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap shrink-0"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                  </>
                )}
              </button>
            </form>

            {/* OR Divider */}
            <div className="flex items-center gap-3 my-5">
              <span className="h-px flex-1 bg-slate-200" />
              <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">OR</span>
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            {/* Footer Tagline */}
            <p className="text-center italic font-medium text-[13px] sm:text-sm text-[#08357a]">
              A Powerful CRM Solution for Your Business
            </p>

            {/* Subtle Secondary Utility Link */}
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-center text-[11px] text-slate-500">
              <a
                href="/?mode=mobile-agent&agent=AGT-101"
                className="font-semibold text-slate-600 hover:text-[#082458] inline-flex items-center gap-1.5 transition whitespace-nowrap shrink-0"
              >
                <Smartphone className="w-3.5 h-3.5 text-[#0b74f0]" />
                <span>Mobile Companion App</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ==================== FORGOT PASSWORD MODAL ==================== */}
      {isForgotOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 to-[#0b74f0]" />

            <button
              type="button"
              onClick={() => setIsForgotOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 transition p-1 bg-slate-50 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#0b74f0]">
                Password Recovery
              </span>
              <h3 className="text-base font-extrabold text-[#082458] tracking-tight mt-1 flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-[#0b74f0]" /> Reset Account Password
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Enter your registered email or username to recover access.
              </p>
            </div>

            {forgotStatus?.success && forgotStatus.presetMatch ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-semibold space-y-1">
                  <p className="font-bold flex items-center gap-1">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" /> Identity Verified!
                  </p>
                  <p className="text-slate-600 font-medium text-[11px]">
                    Account credentials found. Auto-fill to sign in:
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={forgotStatus.presetMatch.avatar}
                      alt={forgotStatus.presetMatch.name}
                      className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                    />
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase">
                        {forgotStatus.presetMatch.name}
                      </h4>
                      <p className="text-[11px] text-[#0b74f0] font-bold">
                        {forgotStatus.presetMatch.role}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs font-mono">
                    <div className="flex justify-between items-center bg-white px-3 py-1.5 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Email</span>
                      <span className="font-semibold text-slate-800">{forgotStatus.presetMatch.email}</span>
                    </div>
                    <div className="flex justify-between items-center bg-white px-3 py-1.5 border border-slate-200 rounded-lg">
                      <span className="text-slate-400 font-bold text-[10px] uppercase">Password</span>
                      <span className="font-bold text-slate-900">{forgotStatus.presetMatch.password}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (forgotStatus.presetMatch) {
                      setEmail(forgotStatus.presetMatch.email);
                      setPassword(forgotStatus.presetMatch.password);
                      setError(null);
                      setIsForgotOpen(false);
                    }
                  }}
                  className="w-full py-2.5 bg-[#0b74f0] hover:bg-[#005be0] text-white font-bold text-xs rounded-xl shadow-sm transition uppercase tracking-wider cursor-pointer"
                >
                  Auto-Fill & Continue
                </button>
              </div>
            ) : (
              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4">
                {forgotStatus?.message && !forgotStatus.presetMatch && (
                  <div className="p-3 rounded-2xl text-xs font-semibold flex gap-2 bg-rose-50 border border-rose-200 text-rose-700">
                    <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{forgotStatus.message}</span>
                  </div>
                )}

                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">Email / Username</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. admin@expertcrm.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs rounded-xl border border-slate-200 focus:border-[#0b74f0] bg-slate-50 focus:bg-white transition outline-none font-medium text-slate-800 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotSubmitting}
                    className="flex-1 py-2.5 bg-[#0b74f0] hover:bg-[#005be0] text-white font-bold text-xs rounded-xl shadow-md transition disabled:opacity-50 cursor-pointer"
                  >
                    {isForgotSubmitting ? 'Verifying...' : 'Verify Account'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
