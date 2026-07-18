import React, { useState } from 'react';
import { 
  Lock, Mail, Eye, EyeOff, ShieldAlert, Sparkles, LogIn, Check, 
  Info, ShieldCheck, X, Fingerprint, Activity, ArrowRight, 
  ShieldAlert as ShieldIcon, Compass, Users, CheckCircle2,
  Building, Shield, Cloud, Clock, Smartphone, ChevronRight, HelpCircle,
  Paintbrush
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

const GoogleIcon = () => (
  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" width="24" height="24">
    <path fill="#EA4335" d="M12.24 10.285V14.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l3.253-3.133C18.29 1.71 15.538 1 12.24 1 5.92 1 12.2 5.92 12.2 12.2s4.92 11.2 11.24 11.2c6.6 0 11-4.64 11-11.2 0-.756-.08-1.332-.18-1.915H12.24z" />
  </svg>
);

const MicrosoftIcon = () => (
  <svg className="w-4.5 h-4.5 shrink-0" viewBox="0 0 23 23" width="23" height="23">
    <path fill="#F25022" d="M0 0h10.5v10.5H0z" />
    <path fill="#7FBA00" d="M11.5 0h10.5v10.5H11.5z" />
    <path fill="#01A6F0" d="M0 11.5h10.5v10.5H0z" />
    <path fill="#FFB900" d="M11.5 11.5h10.5v10.5H11.5z" />
  </svg>
);

const CRMBadgeLogo = ({ darkTheme = false }: { darkTheme?: boolean }) => {
  // Theme-aware dynamic colors to maintain high contrast and exact brand matching
  const primaryNavy = darkTheme ? '#FFFFFF' : '#1E1265';
  const secondaryNavy = darkTheme ? '#E2E8F0' : '#271776';
  const accentBlue = darkTheme ? '#38BDF8' : '#0084FF'; // Bright sky blue / brand blue
  const bracketCyan = darkTheme ? '#00E0FF' : '#00A3FF'; // Glowing cyan / brand cyan

  const idSuffix = darkTheme ? 'dark' : 'light';

  return (
    <div className="flex flex-col items-center select-none animate-fadeIn">
      <svg 
        id={`crm-badge-logo-svg-${idSuffix}`}
        viewBox="0 0 500 500" 
        className="w-48 h-48 sm:w-56 sm:h-56 transition-all duration-300"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradients */}
          <linearGradient id={`bracketLeftGrad_${idSuffix}`} x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={bracketCyan} />
            <stop offset="100%" stopColor={secondaryNavy} />
          </linearGradient>
          <linearGradient id={`bracketRightGrad_${idSuffix}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={secondaryNavy} />
            <stop offset="100%" stopColor={bracketCyan} />
          </linearGradient>
          <linearGradient id={`hexagonLeftGrad_${idSuffix}`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor={primaryNavy} />
            <stop offset="100%" stopColor={secondaryNavy} />
          </linearGradient>
          <linearGradient id={`hexagonRightGrad_${idSuffix}`} x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor={accentBlue} />
            <stop offset="100%" stopColor={bracketCyan} />
          </linearGradient>
          <linearGradient id={`middlePersonGrad_${idSuffix}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00A3FF" />
            <stop offset="100%" stopColor="#005EFF" />
          </linearGradient>
        </defs>

        {/* 1. TOP BRACKETS (SEAMLESS COLORED JUNCTIONS) */}
        {/* Left Chevron < */}
        <line x1="238" y1="30" x2="198" y2="55" stroke={accentBlue} strokeWidth="12" strokeLinecap="round" />
        <line x1="198" y1="55" x2="238" y2="80" stroke={secondaryNavy} strokeWidth="12" strokeLinecap="round" />
        
        {/* Right Chevron > */}
        <line x1="262" y1="30" x2="302" y2="55" stroke={secondaryNavy} strokeWidth="12" strokeLinecap="round" />
        <line x1="302" y1="55" x2="262" y2="80" stroke={accentBlue} strokeWidth="12" strokeLinecap="round" />

        {/* 2. HEXAGON LEFT SIDE (SEAMLESS CONNECTED CIRCUIT BOARD TRACE) */}
        <path 
          d="M 235,73 L 75,165 L 75,290 L 55,290 L 55,350 L 200,445" 
          fill="none" 
          stroke={`url(#hexagonLeftGrad_${idSuffix})`} 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        {/* Left-most outer joint circle */}
        <circle cx="55" cy="290" r="6" fill={secondaryNavy} />
        {/* Bottom-left end joint circle */}
        <circle cx="200" cy="445" r="9" fill={secondaryNavy} />

        {/* 4. HEXAGON RIGHT SIDE */}
        <path 
          d="M 265,73 L 425,165 L 425,270" 
          fill="none" 
          stroke={`url(#hexagonRightGrad_${idSuffix})`} 
          strokeWidth="10" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />

        {/* 5. HEXAGON BOTTOM-RIGHT SWOOPING ARROW & RISING BARS */}
        {/* Rising Bars */}
        <path d="M 275,415 L 305,400 L 305,465 L 275,465 Z" fill={primaryNavy} />
        <path d="M 320,390 L 350,370 L 350,465 L 320,465 Z" fill={`url(#middlePersonGrad_${idSuffix})`} />
        <path d="M 365,355 L 395,330 L 395,465 L 365,465 Z" fill={`url(#hexagonRightGrad_${idSuffix})`} />
        <path d="M 410,310 L 440,280 L 440,465 L 410,465 Z" fill={`url(#bracketRightGrad_${idSuffix})`} />

        {/* Swooping Arrow Curve */}
        <path 
          d="M 245,410 Q 365,400 440,278" 
          fill="none" 
          stroke={accentBlue} 
          strokeWidth="8" 
          strokeLinecap="round" 
        />
        {/* Arrow Head (Sharper, perfectly aligned) */}
        <path 
          d="M 440,278 L 415,295 L 430,305 Z" 
          fill={accentBlue} 
        />

        {/* 6. CENTER TEAM USER SILHOUETTES */}
        {/* Team crescent support */}
        <path d="M 160,155 Q 250,195 340,155 Q 250,178 160,155 Z" fill={secondaryNavy} />

        {/* Left Side Silhouette */}
        <circle cx="195" cy="122" r="14" fill={secondaryNavy} />
        <path d="M170,165 C170,145 182,138 195,138 C208,138 220,145 220,165 Z" fill={secondaryNavy} />

        {/* Right Side Silhouette */}
        <circle cx="305" cy="122" r="14" fill={secondaryNavy} />
        <path d="M280,165 C280,145 292,138 305,138 C318,138 330,145 330,165 Z" fill={secondaryNavy} />

        {/* Middle Big Silhouette */}
        <circle cx="250" cy="110" r="20" fill={`url(#middlePersonGrad_${idSuffix})`} />
        <path d="M215,165 C215,138 230,130 250,130 C270,130 285,138 285,165 Z" fill={`url(#middlePersonGrad_${idSuffix})`} />

        {/* 7. LARGE CRM TEXT */}
        <text 
          x="250" 
          y="310" 
          textAnchor="middle" 
          fontFamily="'Inter', 'Space Grotesk', system-ui, sans-serif" 
          fontWeight="900" 
          fontSize="120" 
          letterSpacing="-3"
        >
          <tspan fill={primaryNavy}>CR</tspan>
          <tspan fill={accentBlue}>M</tspan>
        </text>

        {/* 8. SUBTITLE WITH DOTS AND LINES */}
        <text 
          x="250" 
          y="348" 
          textAnchor="middle" 
          fill={primaryNavy} 
          fontFamily="'Inter', 'Space Grotesk', system-ui, sans-serif" 
          fontWeight="800" 
          fontSize="13" 
          letterSpacing="1"
        >
          CUSTOMER RELATIONSHIP MANAGEMENT
        </text>
        
        {/* Left Line & Dot */}
        <line x1="85" y1="344" x2="110" y2="344" stroke={primaryNavy} strokeWidth="2" strokeLinecap="round" />
        <circle cx="85" cy="344" r="3.5" fill={primaryNavy} />

        {/* Right Line & Dot */}
        <line x1="390" y1="344" x2="415" y2="344" stroke={primaryNavy} strokeWidth="2" strokeLinecap="round" />
        <circle cx="415" cy="344" r="3.5" fill={primaryNavy} />

        {/* 9. FOUR COLUMNS (LEADS, SALES, SUPPORT, ANALYTICS - PERFECTLY CENTERED) */}
        {/* Dividers */}
        <line x1="176" y1="375" x2="176" y2="415" stroke={primaryNavy} strokeWidth="1" opacity="0.3" />
        <line x1="250" y1="375" x2="250" y2="415" stroke={primaryNavy} strokeWidth="1" opacity="0.3" />
        <line x1="324" y1="375" x2="324" y2="415" stroke={primaryNavy} strokeWidth="1" opacity="0.3" />

        {/* Col 1: LEADS */}
        <g transform="translate(139, 380)">
          <circle cx="0" cy="-10" r="11" fill={accentBlue} />
          {/* White Silhouette inside Leads */}
          <circle cx="0" cy="-13" r="3" fill="#FFFFFF" />
          <path d="M-5,-5 C-5,-8 -2,-9 0,-9 C2,-9 5,-8 5,-5 Z" fill="#FFFFFF" />
          
          <text 
            x="0" 
            y="17" 
            textAnchor="middle" 
            fill={primaryNavy} 
            fontFamily="'Inter', 'Space Grotesk', sans-serif" 
            fontWeight="900" 
            fontSize="8.5" 
            letterSpacing="0.5"
          >
            LEADS
          </text>
        </g>

        {/* Col 2: SALES */}
        <g transform="translate(213, 380)">
          {/* Target Target Icon */}
          <circle cx="0" cy="-10" r="11" fill="none" stroke={accentBlue} strokeWidth="2.2" />
          <circle cx="0" cy="-10" r="6" fill="none" stroke={accentBlue} strokeWidth="1.5" />
          <circle cx="0" cy="-10" r="2.2" fill={accentBlue} />
          {/* Dart feathers */}
          <path d="M8,-18 L2,-12" stroke={accentBlue} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M10,-15 L7,-12" stroke={accentBlue} strokeWidth="1.2" />
          <path d="M6,-19 L3,-16" stroke={accentBlue} strokeWidth="1.2" />
          
          <text 
            x="0" 
            y="17" 
            textAnchor="middle" 
            fill={primaryNavy} 
            fontFamily="'Inter', 'Space Grotesk', sans-serif" 
            fontWeight="900" 
            fontSize="8.5" 
            letterSpacing="0.5"
          >
            SALES
          </text>
        </g>

        {/* Col 3: SUPPORT */}
        <g transform="translate(287, 380)">
          {/* Headphones */}
          <path d="M-9,-6 A9,9 0 0,1 9,-6" fill="none" stroke={accentBlue} strokeWidth="2.2" strokeLinecap="round" />
          <rect x="-11" y="-8" width="3.5" height="6.5" rx="1" fill={accentBlue} />
          <rect x="7.5" y="-8" width="3.5" height="6.5" rx="1" fill={accentBlue} />
          <path d="M-8,-2 Q-4,1.5 0,1.5" fill="none" stroke={accentBlue} strokeWidth="1.5" strokeLinecap="round" />
          
          <text 
            x="0" 
            y="17" 
            textAnchor="middle" 
            fill={primaryNavy} 
            fontFamily="'Inter', 'Space Grotesk', sans-serif" 
            fontWeight="900" 
            fontSize="8.5" 
            letterSpacing="0.5"
          >
            SUPPORT
          </text>
        </g>

        {/* Col 4: ANALYTICS */}
        <g transform="translate(361, 380)">
          {/* Rising bars */}
          <rect x="-8" y="-4" width="3.2" height="7" rx="0.8" fill={accentBlue} />
          <rect x="-2.2" y="-10" width="3.2" height="13" rx="0.8" fill={accentBlue} />
          <rect x="3.5" y="-15" width="3.2" height="18" rx="0.8" fill={accentBlue} />
          
          <text 
            x="0" 
            y="17" 
            textAnchor="middle" 
            fill={primaryNavy} 
            fontFamily="'Inter', 'Space Grotesk', sans-serif" 
            fontWeight="900" 
            fontSize="8.5" 
            letterSpacing="0.5"
          >
            ANALYTICS
          </text>
        </g>
      </svg>
    </div>
  );
};

const LaptopDashboardIllustration = () => {
  return (
    <div className="relative w-full h-[300px] flex items-center justify-center overflow-visible mt-8 animate-fadeIn">
      {/* Decorative Blur Background circles */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-blue-500/10 rounded-full filter blur-3xl pointer-events-none" />

      {/* Floating Widget 1: Bar Chart (Left) */}
      <div className="absolute left-4 top-4 z-20 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-xl hover:translate-y-[-4px] transition duration-300 w-28">
        <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest block mb-1">Weekly Leads</span>
        <div className="flex items-end gap-1.5 h-10 pt-2">
          <div className="w-2.5 h-4 bg-sky-400 rounded-sm animate-pulse" />
          <div className="w-2.5 h-7 bg-blue-400 rounded-sm" />
          <div className="w-2.5 h-10 bg-indigo-500 rounded-sm animate-pulse" />
          <div className="w-2.5 h-5 bg-sky-300 rounded-sm" />
          <div className="w-2.5 h-8 bg-blue-500 rounded-sm" />
        </div>
        <div className="flex justify-between text-[7px] text-slate-400 mt-1 font-mono">
          <span>Mon</span>
          <span>Fri</span>
        </div>
      </div>

      {/* Floating Widget 2: Stats Badge (Right-top) */}
      <div className="absolute right-4 top-8 z-20 bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3 shadow-xl hover:translate-y-[-4px] transition duration-300 flex items-center gap-2">
        <div className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded-xl">
          <Activity className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <span className="text-[7px] font-black text-slate-350 uppercase tracking-wider block">Real-time Sync</span>
          <span className="text-xs font-black text-white">99.98% SLA</span>
        </div>
      </div>

      {/* The Laptop 3D mockup */}
      <div className="relative w-80 flex flex-col items-center">
        {/* Laptop Screen */}
        <div className="relative w-64 h-40 bg-slate-900 border-4 border-slate-700 rounded-t-xl overflow-hidden shadow-2xl">
          {/* Inner Screen Dashboard */}
          <div className="absolute inset-0 bg-slate-950 p-2 flex flex-col justify-between">
            {/* Header bar of screen */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-1">
              <div className="flex gap-1">
                <span className="w-1 h-1 rounded-full bg-rose-500" />
                <span className="w-1 h-1 rounded-full bg-amber-500" />
                <span className="w-1 h-1 rounded-full bg-emerald-500" />
              </div>
              <span className="text-[6px] font-mono text-slate-500">expert-crm-nodes://live</span>
              <span className="w-2 h-1 bg-blue-500 rounded-xxs" />
            </div>

            {/* Dashboard grid */}
            <div className="flex-1 grid grid-cols-12 gap-1.5 mt-1.5">
              {/* Left sidebar of screen */}
              <div className="col-span-3 border-r border-slate-900 pr-1 flex flex-col gap-1">
                <div className="w-full h-2 bg-blue-600/30 rounded-xxs animate-pulse" />
                <div className="w-full h-1.5 bg-slate-800 rounded-xxs" />
                <div className="w-full h-1.5 bg-slate-800 rounded-xxs" />
                <div className="w-full h-1.5 bg-slate-800 rounded-xxs" />
              </div>

              {/* Main panel of screen */}
              <div className="col-span-9 flex flex-col gap-1.5">
                {/* 2 stat boxes */}
                <div className="grid grid-cols-2 gap-1">
                  <div className="bg-slate-900 p-1 rounded border border-slate-800">
                    <span className="text-[5px] text-slate-400 block font-bold">Conversion</span>
                    <span className="text-[7px] text-emerald-400 font-extrabold">+24.5%</span>
                  </div>
                  <div className="bg-slate-900 p-1 rounded border border-slate-800">
                    <span className="text-[5px] text-slate-400 block font-bold">Active Calls</span>
                    <span className="text-[7px] text-blue-400 font-extrabold">12 Live</span>
                  </div>
                </div>

                {/* Main line chart area */}
                <div className="flex-1 bg-slate-900 rounded p-1 border border-slate-800 flex flex-col justify-between">
                  <span className="text-[5px] text-slate-500 font-bold">Sales Growth Trend</span>
                  {/* SVG line chart */}
                  <svg className="w-full h-10 mt-1" viewBox="0 0 100 40">
                    <path
                      d="M0,35 Q15,20 30,28 T60,10 T90,5 L100,5"
                      fill="none"
                      stroke="url(#chartGradient)"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M0,35 Q15,20 30,28 T60,10 T90,5 L100,5 L100,40 L0,40 Z"
                      fill="url(#areaGradient)"
                      opacity="0.15"
                    />
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#38bdf8" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Laptop Keyboard Base */}
        <div className="relative w-76 h-3.5 bg-slate-700 border-t border-slate-500 rounded-b-lg shadow-xl flex justify-center">
          {/* Trackpad */}
          <div className="w-12 h-1.5 bg-slate-800 border-x border-b border-slate-750 rounded-b-xs mt-0.5" />
        </div>
        
        {/* Laptop Bottom Shadow line */}
        <div className="w-68 h-1 bg-slate-950/60 blur-xs rounded-full mt-0.5" />
      </div>

      {/* Decorative Potted Plant (Right-bottom) */}
      <div className="absolute right-6 bottom-2 z-10 flex flex-col items-center">
        {/* Plant Leaves */}
        <div className="flex justify-center -space-x-1.5">
          <div className="w-3.5 h-6 bg-emerald-500 rounded-full rotate-[-25deg] origin-bottom shadow-xs border border-emerald-600" />
          <div className="w-3.5 h-7 bg-emerald-400 rounded-full rotate-[5deg] origin-bottom shadow-xs border border-emerald-500" />
          <div className="w-3.5 h-5.5 bg-emerald-500 rounded-full rotate-[35deg] origin-bottom shadow-xs border border-emerald-600" />
        </div>
        {/* Plant Pot */}
        <div className="w-6 h-6 bg-amber-500/20 border border-amber-500/35 rounded-b-lg rounded-t-xs flex items-center justify-center shadow-md">
          <div className="w-5 h-[1.5px] bg-amber-500/40 absolute top-[1px]" />
        </div>
      </div>
    </div>
  );
};

interface BackgroundTheme {
  id: string;
  name: string;
  gradientClass: string;
  circle1Class: string;
  circle2Class: string;
  previewColor: string;
}

const BG_THEMES: BackgroundTheme[] = [
  {
    id: 'midnight',
    name: 'Cosmic Midnight',
    gradientClass: 'from-[#02132b] via-[#09264c] to-[#041d3b]',
    circle1Class: 'bg-blue-600/10',
    circle2Class: 'bg-indigo-500/10',
    previewColor: 'bg-blue-600'
  },
  {
    id: 'aurora',
    name: 'Emerald Aurora',
    gradientClass: 'from-[#011710] via-[#043325] to-[#011a12]',
    circle1Class: 'bg-emerald-500/10',
    circle2Class: 'bg-teal-400/10',
    previewColor: 'bg-emerald-500'
  },
  {
    id: 'amethyst',
    name: 'Royal Amethyst',
    gradientClass: 'from-[#100221] via-[#240542] to-[#140226]',
    circle1Class: 'bg-purple-600/10',
    circle2Class: 'bg-fuchsia-500/10',
    previewColor: 'bg-purple-600'
  },
  {
    id: 'sunset',
    name: 'Sunset Horizon',
    gradientClass: 'from-[#1c0206] via-[#38040d] to-[#210206]',
    circle1Class: 'bg-rose-600/10',
    circle2Class: 'bg-amber-500/10',
    previewColor: 'bg-rose-600'
  },
  {
    id: 'obsidian',
    name: 'Obsidian Coal',
    gradientClass: 'from-[#060608] via-[#121217] to-[#0b0b0f]',
    circle1Class: 'bg-slate-600/10',
    circle2Class: 'bg-zinc-500/10',
    previewColor: 'bg-zinc-700'
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
  const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);
  const [activePresetTab, setActivePresetTab] = useState<'staff' | 'tenant'>('tenant');
  
  // Custom states to support Quick credentials drawer beautifully
  const [isQuickDrawerOpen, setIsQuickDrawerOpen] = useState(false);
  
  // Multi background color/theme configuration
  const [bgTheme, setBgTheme] = useState(() => {
    return localStorage.getItem('login_bg_theme') || 'midnight';
  });

  // Load existing tenant directory to support multi-tenant logins dynamically
  const [tenants] = useState(() => {
    const saved = localStorage.getItem('saas_tenants');
    return saved ? JSON.parse(saved) : [
      { id: 'ten-1', name: 'Expert CRM HQ', subdomain: 'expert', planId: 'enterprise', status: 'Active', createdAt: '2026-01-10', seatCount: 42, domainProvider: 'expertcrm.in', clientContactName: 'Super Admin Operational', clientOnboardEmail: 'expertaidtech@gmail.com', adminPassword: 'AdminSecureKey#1' },
      { id: 'ten-2', name: 'Mehta Logistics', subdomain: 'mehtalog', planId: 'pro', status: 'Active', createdAt: '2026-03-15', seatCount: 8, domainProvider: 'expertaidtech.in', clientContactName: 'Rohan Mehta', clientOnboardEmail: 'rohan@mehtalogistics.in', adminPassword: 'MehtaLogSecure88' },
      { id: 'ten-3', name: 'Indus Dynamics Trial', subdomain: 'indusdyn', planId: 'free', status: 'Trialing', createdAt: '2026-06-01', seatCount: 2, domainProvider: 'custom', customDomain: 'crm.indusdynamics.in', clientContactName: 'Nikhil Sen', clientOnboardEmail: 'nikhil@indusdynamics.in', adminPassword: 'IndusTrialPower99' }
    ];
  });

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
      const tenantMatch = tenants.find((t: any) => t.clientOnboardEmail && t.clientOnboardEmail.toLowerCase().trim() === cleanEmail);

      if (match) {
        setForgotStatus({
          success: true,
          message: `Security authentication record decrypted! We verified identity directory for ${match.name}.`,
          presetMatch: match
        });
      } else if (tenantMatch) {
        const isExpertCrm = tenantMatch.name.toUpperCase().includes('EXPERT CRM') || tenantMatch.id === 'ten-1' || tenantMatch.subdomain === 'expert';
        const tenantRole = isExpertCrm ? 'Super Admin' : 'Admin';
        setForgotStatus({
          success: true,
          message: `Tenant Security Profile Decrypted! We verified tenant admin directory for ${tenantMatch.name}.`,
          presetMatch: {
            name: tenantMatch.clientContactName || 'Tenant Administrator',
            email: tenantMatch.clientOnboardEmail || '',
            password: tenantMatch.adminPassword || '',
            role: tenantRole,
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
            badgeColor: isExpertCrm ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-teal-50 border-teal-200 text-teal-700',
            description: `Workspace: ${tenantMatch.name} (${tenantMatch.subdomain}.${tenantMatch.domainProvider || 'expertcrm.in'}) - Clearance: ${tenantRole}`
          }
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
    setSelectedTenantId(null);
    setError(null);
    setIsQuickDrawerOpen(false); // Auto close quick drawer on selection
  };

  const handleTenantSelect = (tenant: any) => {
    setEmail(tenant.clientOnboardEmail || '');
    setPassword(tenant.adminPassword || '');
    setSelectedTenantId(tenant.id);
    setSelectedPresetIndex(null);
    setError(null);
    setIsQuickDrawerOpen(false); // Auto close quick drawer on selection
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

      const tenantMatch = tenants.find(
        (t: any) => t.clientOnboardEmail && t.clientOnboardEmail.toLowerCase().trim() === email.toLowerCase().trim() && t.adminPassword === password
      );

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
        const isExpertCrm = tenantMatch.name.toUpperCase().includes('EXPERT CRM') || tenantMatch.id === 'ten-1' || tenantMatch.subdomain === 'expert';
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
        setError('Access authorization denied. Invalid credentials or tenant password.');
        setIsSubmitting(false);
      }
    }, 750);
  };

  const currentTheme = BG_THEMES.find(t => t.id === bgTheme) || BG_THEMES[0];

  return (
    <div id="login-module-container" className={`min-h-screen w-screen bg-gradient-to-tr ${currentTheme.gradientClass} flex items-center justify-center p-4 md:p-10 lg:p-12 font-sans relative overflow-x-hidden select-none transition-all duration-1000`}>
      
      {/* Background Theme Selector Option */}
      <div className="absolute top-4 left-4 z-40 flex items-center gap-2 bg-slate-950/40 backdrop-blur-md border border-white/10 px-3 py-1.5 rounded-2xl shadow-xl transition-all">
        <span className="text-[10px] font-black uppercase text-slate-300 tracking-wider flex items-center gap-1">
          <Paintbrush className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Theme:</span>
        </span>
        <div className="flex items-center gap-1.5 ml-1">
          {BG_THEMES.map((theme) => (
            <button
              key={theme.id}
              type="button"
              onClick={() => {
                setBgTheme(theme.id);
                localStorage.setItem('login_bg_theme', theme.id);
              }}
              title={theme.name}
              className={`w-5 h-5 rounded-full ${theme.previewColor} border-2 transition-all cursor-pointer hover:scale-110 active:scale-95 ${
                bgTheme === theme.id ? 'border-white ring-2 ring-sky-400/50 scale-110' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Dynamic Background Glowing Mesh circles */}
      <div className={`absolute top-0 left-0 w-[450px] h-[450px] ${currentTheme.circle1Class} rounded-full filter blur-3xl -ml-24 -mt-24 pointer-events-none transition-all duration-1000`} />
      <div className={`absolute bottom-0 right-0 w-[450px] h-[450px] ${currentTheme.circle2Class} rounded-full filter blur-3xl -mr-24 -mb-24 pointer-events-none transition-all duration-1000`} />
      
      {/* Floating Demo Credentials Handle */}
      <div className="absolute top-4 right-4 z-40">
        <button
          type="button"
          onClick={() => setIsQuickDrawerOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg hover:shadow-amber-400/20 active:scale-95 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-slate-950" />
          <span>Quick Login Directory</span>
        </button>
      </div>

      {/* Main Split Screen Container */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-950/20 backdrop-blur-md rounded-[40px] border border-white/5 p-6 md:p-8 relative z-10 shadow-2xl">
        
        {/* ==================== LEFT COLUMN: Enterprise Presentation ==================== */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-8 p-4 text-white relative">
          
          {/* Logo Badge (Light/White version on Dark Background) */}
          <div className="flex justify-start">
            <CRMBadgeLogo darkTheme={true} />
          </div>

          {/* Heading Lines */}
          <div className="space-y-2 mt-2">
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none text-white">
              Manage Relationships.
            </h2>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none text-white">
              Boost Sales.
            </h2>
            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight leading-none text-sky-400">
              Grow Your Business.
            </h2>
          </div>

          {/* Clean minimal line divider */}
          <div className="w-14 h-[3px] bg-sky-400 rounded-full" />

          {/* Description Paragraph */}
          <p className="text-sm text-slate-300 leading-relaxed max-w-md font-medium">
            Expert CRM helps you manage leads, track sales, support customers and grow your business efficiently.
          </p>

          {/* Gorgeous CSS Laptop Illustration Scene */}
          <LaptopDashboardIllustration />

          {/* Inline bottom feature items */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            <div className="flex flex-col items-center text-center p-2 bg-white/5 rounded-xl border border-white/5">
              <div className="p-2 bg-blue-500/10 text-sky-400 rounded-full mb-1">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-200 block tracking-wider leading-tight">Secure</span>
              <span className="text-[9px] text-slate-400 font-bold block">Platform</span>
            </div>

            <div className="flex flex-col items-center text-center p-2 bg-white/5 rounded-xl border border-white/5">
              <div className="p-2 bg-blue-500/10 text-sky-400 rounded-full mb-1">
                <Cloud className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-200 block tracking-wider leading-tight">Cloud</span>
              <span className="text-[9px] text-slate-400 font-bold block">Based</span>
            </div>

            <div className="flex flex-col items-center text-center p-2 bg-white/5 rounded-xl border border-white/5">
              <div className="p-2 bg-blue-500/10 text-sky-400 rounded-full mb-1">
                <Clock className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-200 block tracking-wider leading-tight">Real-time</span>
              <span className="text-[9px] text-slate-400 font-bold block">Analytics</span>
            </div>

            <div className="flex flex-col items-center text-center p-2 bg-white/5 rounded-xl border border-white/5">
              <div className="p-2 bg-blue-500/10 text-sky-400 rounded-full mb-1">
                <Smartphone className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black uppercase text-slate-200 block tracking-wider leading-tight">Mobile</span>
              <span className="text-[9px] text-slate-400 font-bold block">Access</span>
            </div>
          </div>

          {/* Side Footer */}
          <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-slate-405 font-medium gap-2">
            <span>© 2024 Expert CRM. All rights reserved.</span>
            <div className="flex gap-4">
              <span className="hover:underline cursor-pointer hover:text-white transition">Privacy Policy</span>
              <span className="hover:underline cursor-pointer hover:text-white transition">Terms of Service</span>
              <span className="hover:underline cursor-pointer hover:text-white transition">Support</span>
            </div>
          </div>
        </div>

        {/* ==================== RIGHT COLUMN: White Rounded Login Card ==================== */}
        <div className="lg:col-span-6 flex justify-center p-2">
          
          <div className="bg-white rounded-[32px] md:rounded-[40px] shadow-2xl p-6 sm:p-8 md:p-10 lg:p-12 w-full max-w-md border border-slate-100 flex flex-col justify-between space-y-6 relative overflow-hidden animate-fadeIn">
            {/* Soft accent glow header strip */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600"></div>

            {/* Content Top */}
            <div className="space-y-6">
              {/* Colored Badge Logo (Dark/Light background version) */}
              <div className="flex justify-center">
                <CRMBadgeLogo darkTheme={false} />
              </div>

              {/* Headers */}
              <div className="text-center">
                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                  Welcome Back!
                </h3>
                <p className="text-slate-500 text-sm font-semibold tracking-wide mt-2">
                  Login to your Expert CRM account
                </p>
              </div>

              {/* Direct Error Alerts */}
              {error && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start gap-3 text-xs font-semibold animate-pulse">
                  <ShieldIcon className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="leading-snug">{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {/* Email Address */}
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold text-xs">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError(null);
                        setSelectedPresetIndex(null);
                      }}
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-all focus:ring-1 focus:ring-blue-500 outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400/80"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-1">
                  <label className="block text-slate-700 font-bold text-xs">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError(null);
                        setSelectedPresetIndex(null);
                      }}
                      className="w-full pl-11 pr-11 py-3 rounded-xl border border-slate-200 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition-all focus:ring-1 focus:ring-blue-500 outline-none text-xs font-semibold text-slate-800 placeholder:text-slate-400/80"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600 transition p-0.5 rounded"
                    >
                      {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember and Forgot options */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer"
                    />
                    <span className="text-xs font-bold text-slate-650">Remember Me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotStatus(null);
                      setIsForgotOpen(true);
                    }}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline transition-all"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Royal blue Primary Submit Button with lock icon inside */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/60 text-white font-extrabold text-xs rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-3 shadow-blue-200 active:scale-98"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin h-4 w-4 text-white shrink-0" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-white/80 shrink-0" />
                      <span>Login</span>
                    </>
                  )}
                </button>
              </form>

              {/* Or Divider */}
              <div className="flex items-center justify-center my-4 gap-3">
                <span className="h-[1px] flex-1 bg-slate-200" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">OR</span>
                <span className="h-[1px] flex-1 bg-slate-200" />
              </div>

              {/* OAuth Handshakes */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => {
                    setEmail('admin@expertcrm.com');
                    setPassword('adminpassword123');
                    setError(null);
                  }}
                  className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition active:scale-98"
                >
                  <GoogleIcon />
                  <span>Login with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setEmail('aman@expertcrm.com');
                    setPassword('salesmanager123');
                    setError(null);
                  }}
                  className="w-full py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 transition active:scale-98"
                >
                  <MicrosoftIcon />
                  <span>Login with Microsoft</span>
                </button>
              </div>

            </div>

            {/* Footer Bottom Sign-Up Info inside white card */}
            <div className="text-center pt-2 border-t border-slate-100">
              <p className="text-slate-500 font-semibold text-xs leading-none">
                Don't have an account?{' '}
                <button
                  onClick={() => {
                    setEmail('guest@expertcrm.com');
                    setPassword('guestuser123');
                    setError(null);
                  }}
                  className="text-blue-600 font-extrabold hover:underline"
                >
                  Sign Up
                </button>
              </p>
            </div>

          </div>
        </div>

      </div>

      {/* ==================== DRAWER PANEL: Quick Credentials Selector ==================== */}
      {isQuickDrawerOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex justify-end z-50 animate-fadeIn">
          {/* Backdrop closer clicker */}
          <div className="absolute inset-0" onClick={() => setIsQuickDrawerOpen(false)} />

          {/* Drawer content card */}
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl p-6 border-l border-slate-100 flex flex-col justify-between overflow-y-auto animate-slideLeft">
            
            <div>
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-amber-100 text-amber-700 rounded-xl">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-tight">
                      Quick Access Directory
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold uppercase mt-0.5">
                      Bypass typing to test security roles
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickDrawerOpen(false)}
                  className="p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-slate-950 rounded-full transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Tabs selector */}
              <div className="flex gap-1.5 bg-slate-100 p-1 rounded-xl mb-4">
                <button
                  type="button"
                  onClick={() => setActivePresetTab('tenant')}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-extrabold uppercase tracking-wider transition ${
                    activePresetTab === 'tenant'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-950'
                  }`}
                >
                  🏢 Tenant Accounts
                </button>
                <button
                  type="button"
                  onClick={() => setActivePresetTab('staff')}
                  className={`flex-1 py-2 text-center rounded-lg text-xs font-extrabold uppercase tracking-wider transition ${
                    activePresetTab === 'staff'
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-950'
                  }`}
                >
                  👥 Corporate Staff
                </button>
              </div>

              {/* Help tip */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-[10.5px] text-slate-650 mb-4 flex gap-2">
                <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <span>
                  {activePresetTab === 'tenant' 
                    ? "Log in as SaaS subscribers to verify subdomain tenant routers, billing templates and localized admin portals."
                    : "Log in as corporate staff employees to examine role-based tab restrictions, call routers and secure audit spaces."}
                </span>
              </div>

              {/* Render Presets List */}
              {activePresetTab === 'tenant' ? (
                <div className="space-y-2.5">
                  {tenants.map((ten: any) => {
                    const isSelected = selectedTenantId === ten.id;
                    return (
                      <div
                        key={ten.id}
                        onClick={() => handleTenantSelect(ten)}
                        className={`p-3.5 rounded-2xl border transition text-left cursor-pointer hover:border-blue-400 group relative ${
                          isSelected ? 'border-blue-500 bg-blue-50/10' : 'border-slate-150 bg-slate-50/40 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-start gap-2.5 min-w-0">
                            <div className="p-2 bg-slate-100 text-slate-500 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition shrink-0">
                              <Building className="w-4 h-4" />
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide group-hover:text-blue-700 transition truncate">
                                {ten.name}
                              </h5>
                              <p className="text-[10px] text-slate-500 font-semibold mt-0.5 truncate">
                                Subdomain: <span className="font-bold text-slate-700 font-mono">{ten.subdomain}.{ten.domainProvider || 'expertcrm.in'}</span>
                              </p>
                              
                              <div className="mt-2 flex flex-col gap-1 text-[9.5px] bg-white border border-slate-150 p-2 rounded-xl">
                                <span className="font-mono text-slate-500 truncate block">
                                  ✉️ <span className="text-slate-800 font-bold">{ten.clientOnboardEmail}</span>
                                </span>
                                <span className="font-mono text-slate-500 truncate block">
                                  🔑 <span className="text-slate-800 font-bold">{ten.adminPassword}</span>
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="text-right flex flex-col items-end gap-1.5 shrink-0">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${
                              ten.name.toUpperCase().includes('EXPERT CRM') || ten.id === 'ten-1' || ten.subdomain === 'expert'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-teal-50 text-teal-700 border-teal-200'
                            }`}>
                              {ten.name.toUpperCase().includes('EXPERT CRM') || ten.id === 'ten-1' || ten.subdomain === 'expert' ? 'Super Admin' : 'Admin'}
                            </span>
                            <span className="text-[9px] text-slate-400 font-bold">{ten.clientContactName}</span>
                          </div>
                        </div>

                        <div className="mt-2 pt-2 border-t border-dashed border-slate-150 flex items-center justify-between text-[10px] text-blue-600 font-bold">
                          <span>Click to auto-fill & login</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {PRESET_CREDENTIALS.map((preset, index) => {
                    const isSelected = selectedPresetIndex === index;
                    return (
                      <div
                        key={index}
                        onClick={() => handlePresetSelect(index)}
                        className={`p-3.5 rounded-2xl border transition text-left cursor-pointer hover:border-blue-400 group ${
                          isSelected ? 'border-blue-500 bg-blue-50/10' : 'border-slate-150 bg-slate-50/40 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={preset.avatar}
                            alt={preset.name}
                            className="w-10 h-10 rounded-full border border-slate-200 object-cover shrink-0 shadow-xxs"
                          />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center justify-between gap-1">
                              <h5 className="text-xs font-extrabold text-slate-800 uppercase tracking-wide group-hover:text-blue-700 transition">
                                {preset.name}
                              </h5>
                              <span className={`text-[8.5px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md border ${
                                preset.role === 'Super Admin' 
                                  ? 'bg-rose-50 border-rose-200 text-rose-700' 
                                  : preset.role === 'Sales Manager' 
                                    ? 'bg-amber-50 border-amber-200 text-amber-700' 
                                    : preset.role === 'Support Agent' 
                                      ? 'bg-sky-50 border-sky-200 text-sky-700' 
                                      : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              }`}>
                                {preset.role}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">{preset.description}</p>
                            
                            <div className="mt-2 flex flex-col gap-1 text-[9.5px] bg-white border border-slate-150 p-2 rounded-xl">
                              <span className="font-mono text-slate-500 truncate block">✉️ <span className="text-slate-800 font-bold">{preset.email}</span></span>
                              <span className="font-mono text-slate-500 truncate block">🔑 <span className="text-slate-800 font-bold">{preset.password}</span></span>
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2.5 border-t border-dashed border-slate-150 flex items-center justify-between text-[10px] text-blue-600 font-bold">
                          <span>Click to auto-fill & login</span>
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>

            {/* Bottom Closer action */}
            <div className="border-t border-slate-100 pt-4 mt-6">
              <button
                type="button"
                onClick={() => setIsQuickDrawerOpen(false)}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Close Directory
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Forgot Password Modal Overlay */}
      {isForgotOpen && (
        <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl relative overflow-hidden">
            {/* Accent background line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600"></div>
            
            <button
              onClick={() => setIsForgotOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-slate-650 transition p-1 bg-slate-50 hover:bg-slate-100 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4">
              <span className="text-[9px] uppercase tracking-widest font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">Directory Recovery Desk</span>
              <h3 className="text-md font-black text-slate-900 tracking-tight mt-2 flex items-center gap-1.5">
                <Lock className="w-4.5 h-4.5 text-blue-600" /> Account Access Password Recovery
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
                      <p className="text-[9.5px] text-blue-600 font-bold">{forgotStatus.presetMatch.role}</p>
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
                    className="flex-1 py-2 bg-blue-650 hover:bg-blue-700 text-white font-bold text-xxs rounded-xl shadow-sm transition uppercase tracking-wider cursor-pointer"
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
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:border-blue-500 bg-slate-50/50 focus:bg-white transition outline-none font-semibold text-slate-800 focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-2xl text-[10px] text-slate-405 space-y-1.5 text-left">
                  <p className="font-bold text-slate-650 flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-blue-500" /> Directory Notice:
                  </p>
                  <p className="text-slate-500 leading-normal text-[9.5px]">
                    If you forget your password, please contact the workspace Super Administrator or file a security ticket through active support logs. Presets or bypass tools are restricted on production instances.
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotOpen(false)}
                    className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-650 font-bold text-xxs rounded-xl transition uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isForgotSubmitting}
                    className="flex-1 py-2 bg-blue-650 hover:bg-blue-750 text-white font-bold text-xxs rounded-xl shadow-md transition uppercase tracking-wider disabled:opacity-50 cursor-pointer"
                  >
                    {isForgotSubmitting ? 'Verifying...' : 'Retrieve Workspace Key'}
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
