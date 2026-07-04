import React, { useState } from 'react';
import { 
  Users, Target, Phone, Headphones, MapPin, CheckSquare, 
  CreditCard, MessageSquare, Lock, Plus, ArrowUpRight, ChevronRight,
  TrendingUp, CircleDollarSign, Shield, Calendar, Users2, HelpCircle
} from 'lucide-react';
import { Lead, CallLog, SupportTicket, FieldStaff, Task, Employee, CommsLog } from '../types';

interface DashboardProps {
  leads: Lead[];
  callLogs: CallLog[];
  supportTickets: SupportTicket[];
  fieldStaff: FieldStaff[];
  tasks: Task[];
  employees: Employee[];
  commsLogs: CommsLog[];
  onNavigate: (tab: string) => void;
  onAddLeadOpen: () => void;
  onAddCustomerOpen: () => void;
  onLogCallOpen: () => void;
  onCreateTaskOpen: () => void;
  onAddEmployeeOpen: () => void;
  onProcessPayroll: () => void;
}

export default function Dashboard({
  leads,
  callLogs,
  supportTickets,
  fieldStaff,
  tasks,
  employees,
  commsLogs,
  onNavigate,
  onAddLeadOpen,
  onAddCustomerOpen,
  onLogCallOpen,
  onCreateTaskOpen,
  onAddEmployeeOpen,
  onProcessPayroll
}: DashboardProps) {
  // Analytical graph interactive coordinates
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; day: number; leads: number; revenue: number } | null>(null);
  const [hoveredSource, setHoveredSource] = useState<string | null>(null);

  // Derive counts dynamically
  const activeLeadsCount = leads.length + 1249; // Offset to match image mockup base
  const openOppsCount = leads.filter(l => l.status !== 'Won').length + 673;
  const customersCount = leads.filter(l => l.status === 'Won').length + 979;
  
  // Calculate dynamic revenue
  const totalRevenueBase = 2568450;
  const newWonValue = leads.filter(l => l.status === 'Won').reduce((acc, lead) => acc + lead.value, 0);
  const totalRevenue = totalRevenueBase + (newWonValue > 0 ? newWonValue : 0);

  // Group Pipeline counts
  const pipelineCounts = {
    'New Leads': leads.filter(l => l.status === 'New Leads').length + 1251,
    'Qualification': leads.filter(l => l.status === 'Qualification').length + 848,
    'Proposal': leads.filter(l => l.status === 'Proposal').length + 618,
    'Negotiation': leads.filter(l => l.status === 'Negotiation').length + 318,
    'Won': leads.filter(l => l.status === 'Won').length + 209,
  };

  // Leads Source Distribution
  const leadSources = [
    { name: 'Website', pct: 30, count: Math.round(activeLeadsCount * 0.30), color: '#4f46e5' },
    { name: 'Referral', pct: 20, count: Math.round(activeLeadsCount * 0.20), color: '#10b981' },
    { name: 'Social Media', pct: 15, count: Math.round(activeLeadsCount * 0.15), color: '#f59e0b' },
    { name: 'Calling', pct: 15, count: Math.round(activeLeadsCount * 0.15), color: '#ec4899' },
    { name: 'Walk-in', pct: 10, count: Math.round(activeLeadsCount * 0.10), color: '#f97316' },
    { name: 'Others', pct: 10, count: Math.round(activeLeadsCount * 0.10), color: '#84cc16' }
  ];

  // Mock graph points for 30 days revenue & leads comparison
  const graphPoints = [
    { day: 1, leads: 280, revenue: 15 },
    { day: 5, leads: 420, revenue: 22 },
    { day: 10, leads: 310, revenue: 18 },
    { day: 15, leads: 510, revenue: 28 },
    { day: 20, leads: 430, revenue: 20 },
    { day: 25, leads: 560, revenue: 31 },
    { day: 30, leads: 780, revenue: 40 }
  ];

  // Helper for generating dynamic chart curves
  const getLinePath = (data: typeof graphPoints, key: 'leads' | 'revenue', maxVal: number, height: number): string => {
    const width = 500;
    const points = data.map((d, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - (d[key] / maxVal) * height;
      return `${x},${y}`;
    });
    return `M ${points.join(' L ')}`;
  };

  // KPI Mini charts data paths
  const l1Path = "M 0 25 Q 15 15 30 22 T 60 12 T 90 28 T 120 10 T 150 18 T 180 5 T 210 20 T 240 12";
  const l2Path = "M 0 28 Q 15 25 30 18 T 60 22 T 90 10 T 120 25 T 150 14 T 180 20 T 210 12 T 240 8";
  const l3Path = "M 0 20 Q 15 28 30 15 T 60 25 T 90 12 T 120 18 T 150 8 T 180 15 T 210 5 T 240 10";
  const l4Path = "M 0 15 Q 15 18 30 10 T 60 26 T 90 15 T 120 22 T 150 12 T 180 25 T 210 18 T 240 5";

  return (
    <div id="dashboard-container" className="space-y-3">
      
      {/* Metrics Row (KPIs Matching image) - High Density Styled */}
      <div id="widget-kpi-row" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Card 1: Total Leads */}
        <div id="kpi-leads" className="bg-white p-3.5 rounded border border-slate-200 shadow-none flex flex-col justify-between h-28 relative overflow-hidden group hover:bg-slate-50/30 transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Leads</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{activeLeadsCount.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-1.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users className="w-4 h-4" id="icon-total-leads" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 z-10">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150 flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> 18.5%
              <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
            </span>
          </div>
          {/* Wave chart overlay */}
          <div className="absolute bottom-0 left-0 w-full opacity-30">
            <svg viewBox="0 0 240 35" className="w-full h-6 text-indigo-500 fill-none stroke-current stroke-1">
              <path d={l1Path} />
            </svg>
          </div>
        </div>

        {/* Card 2: Open Opportunities */}
        <div id="kpi-opportunities" className="bg-white p-3.5 rounded border border-slate-200 shadow-none flex flex-col justify-between h-28 relative overflow-hidden group hover:bg-slate-50/30 transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Open Opportunities</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{openOppsCount}</h3>
            </div>
            <div className="p-1.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
              <Target className="w-4 h-4" id="icon-open-opps" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 z-10">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150 flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> 12.4%
              <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full opacity-30">
            <svg viewBox="0 0 240 35" className="w-full h-6 text-amber-500 fill-none stroke-current stroke-1">
              <path d={l2Path} />
            </svg>
          </div>
        </div>

        {/* Card 3: Total Customers */}
        <div id="kpi-customers" className="bg-white p-3.5 rounded border border-slate-200 shadow-none flex flex-col justify-between h-28 relative overflow-hidden group hover:bg-slate-50/30 transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Customers</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">{customersCount}</h3>
            </div>
            <div className="p-1.5 rounded bg-indigo-50 text-indigo-600 border border-indigo-100">
              <Users2 className="w-4 h-4" id="icon-total-customers" />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 z-10">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150 flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> 15.8%
              <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full opacity-30">
            <svg viewBox="0 0 240 35" className="w-full h-6 text-indigo-500 fill-none stroke-current stroke-1">
              <path d={l3Path} />
            </svg>
          </div>
        </div>

        {/* Card 4: Revenue This Month */}
        <div id="kpi-revenue" className="bg-white p-3.5 rounded border border-slate-200 shadow-none flex flex-col justify-between h-28 relative overflow-hidden group hover:bg-slate-50/30 transition duration-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue This Month</p>
              <h3 className="text-xl font-black text-slate-900 mt-1">₹ {totalRevenue.toLocaleString('en-IN')}</h3>
            </div>
            <div className="p-1.5 px-3 rounded bg-emerald-50 text-emerald-700 font-black border border-emerald-100 text-sm">
              ₹
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 z-10">
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150 flex items-center gap-0.5">
              <TrendingUp className="w-2.5 h-2.5" /> 20.6%
              <span className="text-slate-400 font-normal ml-0.5">vs last month</span>
            </span>
          </div>
          <div className="absolute bottom-0 left-0 w-full opacity-30">
            <svg viewBox="0 0 240 35" className="w-full h-6 text-emerald-500 fill-none stroke-current stroke-1">
              <path d={l4Path} />
            </svg>
          </div>
        </div>
      </div>

      {/* Primary Analytics Row */}
      <div id="middle-core-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-3">
        
        {/* Sales Pipeline (Pixel-perfect Funnel Mockup) */}
        <div id="pipeline-panel" className="bg-white p-3.5 rounded border border-slate-200 shadow-none lg:col-span-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Sales Pipeline</h3>
            <p className="text-[10px] text-slate-400">Distribution across primary CRM funnel stages</p>
          </div>
          
          {/* Graphic Horizontal Funnel layout */}
          <div className="flex items-center gap-3 my-auto pt-1 pb-1">
            <div className="relative w-36 h-40 flex flex-col justify-between items-center pr-1 shrink-0">
              {/* Funnel Slices */}
              {/* Stage 1 Blue */}
              <div className="w-32 h-6.5 bg-indigo-500 rounded-sm shadow-none transform hover:scale-[1.02] transition flex items-center justify-center text-[9px] font-bold text-white tracking-wide">
                100% Volume
              </div>
              
              <div className="w-0.5 h-1.5 bg-slate-200"></div>

              {/* Stage 2 Green */}
              <div className="w-24 h-6.5 bg-emerald-500 rounded-sm shadow-none transform hover:scale-[1.02] transition flex items-center justify-center text-[9px] font-bold text-white tracking-wide">
                Qualification
              </div>

              <div className="w-0.5 h-1.5 bg-slate-200"></div>

              {/* Stage 3 Yellow */}
              <div className="w-18 h-6.5 bg-amber-400 rounded-sm shadow-none transform hover:scale-[1.02] transition flex items-center justify-center text-[9px] font-bold text-white tracking-wide">
                Proposal
              </div>

              <div className="w-0.5 h-1.5 bg-slate-200"></div>

              {/* Stage 4 Purple */}
              <div className="w-12 h-6.5 bg-purple-500 rounded-sm shadow-none transform hover:scale-[1.02] transition flex items-center justify-center text-[9px] font-bold text-white tracking-wide">
                Negotiation
              </div>

              <div className="w-0.5 h-1.5 bg-slate-200"></div>

              {/* Stage 5 Red */}
              <div className="w-8 h-6.5 bg-rose-500 rounded-sm shadow-none transform hover:scale-[1.02] transition flex items-center justify-center text-[9px] font-bold text-white tracking-wide">
                Won
              </div>
            </div>

            {/* Pipeline Stage Labels & Values */}
            <div className="flex-1 space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between pb-0.5 border-b border-slate-100">
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 block"></span> New Leads
                </span>
                <span className="font-extrabold text-slate-800 text-right">{pipelineCounts['New Leads']}</span>
              </div>
              <div className="flex items-center justify-between pb-0.5 border-b border-slate-100">
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 block"></span> Qualification
                </span>
                <span className="font-extrabold text-slate-800 text-right">{pipelineCounts['Qualification']}</span>
              </div>
              <div className="flex items-center justify-between pb-0.5 border-b border-slate-100">
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-amber-400 block"></span> Proposal
                </span>
                <span className="font-extrabold text-slate-800 text-right">{pipelineCounts['Proposal']}</span>
              </div>
              <div className="flex items-center justify-between pb-0.5 border-b border-slate-100">
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-purple-500 block"></span> Negotiation
                </span>
                <span className="font-extrabold text-slate-800 text-right">{pipelineCounts['Negotiation']}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1 font-medium text-slate-500">
                  <span className="w-2 h-2 rounded-full bg-rose-500 block"></span> Won
                </span>
                <span className="font-extrabold text-slate-800 text-right">{pipelineCounts['Won']}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Lead Source Distribution */}
        <div id="source-panel" className="bg-white p-3.5 rounded border border-slate-200 shadow-none lg:col-span-4 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Leads Source</h3>
            <p className="text-[10px] text-slate-400">Traffic classification and capture stats</p>
          </div>

          <div className="flex flex-col items-center justify-center my-auto pb-1">
            {/* SVG Interactive Donut Chart */}
            <div className="relative w-28 h-28 flex items-center justify-center mb-2.5">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="56" cy="56" r="40" fill="transparent" stroke="#e2e8f0" strokeWidth="12" />
                {(() => {
                  let cumulativePercent = 0;
                  return leadSources.map((source) => {
                    const r = 40;
                    const circumference = 2 * Math.PI * r;
                    const strokeDasharray = `${circumference * (source.pct / 100)} ${circumference * (1 - source.pct / 100)}`;
                    const strokeDashoffset = -circumference * (cumulativePercent / 100);
                    cumulativePercent += source.pct;
                    return (
                      <circle 
                        key={source.name}
                        cx="56" 
                        cy="56" 
                        r={r} 
                        fill="transparent" 
                        stroke={source.color} 
                        strokeWidth="12" 
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                        className="cursor-pointer hover:stroke-[14px] transition-all"
                        onMouseEnter={() => setHoveredSource(source.name)}
                        onMouseLeave={() => setHoveredSource(null)}
                      />
                    );
                  });
                })()}
              </svg>

              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-md font-black text-slate-800">{activeLeadsCount}</span>
                <span className="text-[8px] text-slate-400 uppercase tracking-widest font-bold">Total</span>
              </div>
            </div>

            {/* Source items lists */}
            <div className="w-full grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
              {leadSources.map((source) => (
                <div 
                  key={source.name} 
                  className={`flex items-center justify-between p-0.5 rounded transition ${hoveredSource === source.name ? 'bg-slate-50' : ''}`}
                >
                  <span className="flex items-center gap-1 text-slate-500 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full block" style={{ backgroundColor: source.color }}></span>
                    {source.name}
                  </span>
                  <span className="font-extrabold text-slate-800">
                    {source.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div id="quick-actions-panel" className="bg-white p-3.5 rounded border border-slate-200 shadow-none lg:col-span-3 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Quick Actions</h3>
            <p className="text-[10px] text-slate-400">Fast-track direct CRM triggers</p>
          </div>

          <div className="grid grid-cols-2 gap-1.5 my-auto">
            <button 
              id="action-add-lead" 
              onClick={onAddLeadOpen}
              className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50/50 text-indigo-600 rounded border border-slate-200 hover:border-indigo-200 transition"
            >
              <Users className="w-4 h-4 mb-1 text-indigo-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Add Lead</span>
            </button>
            <button 
              id="action-add-customer" 
              onClick={onAddCustomerOpen}
              className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50/50 text-indigo-600 rounded border border-slate-200 hover:border-indigo-200 transition"
            >
              <Users2 className="w-4 h-4 mb-1 text-emerald-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Add Client</span>
            </button>
            <button 
              id="action-log-call" 
              onClick={onLogCallOpen}
              className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50/50 text-indigo-600 rounded border border-slate-200 hover:border-indigo-200 transition"
            >
              <Phone className="w-4 h-4 mb-1 text-amber-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Log Call</span>
            </button>
            <button 
              id="action-create-task" 
              onClick={onCreateTaskOpen}
              className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50/50 text-indigo-600 rounded border border-slate-200 hover:border-indigo-200 transition"
            >
              <CheckSquare className="w-4 h-4 mb-1 text-purple-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Schedule</span>
            </button>
            <button 
              id="action-add-employee" 
              onClick={onAddEmployeeOpen}
              className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50/50 text-indigo-600 rounded border border-slate-200 hover:border-indigo-200 transition"
            >
              <Users className="w-4 h-4 mb-1 text-rose-500" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Staff hr</span>
            </button>
            <button 
              id="action-process-payroll" 
              onClick={onProcessPayroll}
              className="flex flex-col items-center justify-center p-2 bg-slate-50 hover:bg-indigo-50/50 text-indigo-600 rounded border border-slate-200 hover:border-indigo-200 transition"
            >
              <CreditCard className="w-4 h-4 mb-1 text-[#10b981]" />
              <span className="text-[9px] font-bold uppercase tracking-wider text-slate-600">Disburse</span>
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row 2: Today's Activities + Analytics Overview Graph */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3" id="row-activities-analytics">
        
        {/* Today's Activities (Matches Mockup) */}
        <div id="activities-panel" className="bg-white p-3.5 rounded border border-slate-200 shadow-none lg:col-span-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2.5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Today's Activities</h3>
              <p className="text-[10px] text-slate-400">Chronological interaction timeline</p>
            </div>
            <button 
              id="btn-all-activities" 
              onClick={() => onNavigate('tasks')}
              className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5 my-auto">
            {tasks.slice(0, 4).map((task, index) => (
              <div key={task.id} className="flex gap-2.5 items-start pb-2.5 border-b border-slate-100 last:border-0 last:pb-0">
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-100 w-16 text-center shrink-0">
                  {task.time || "10:00 AM"}
                </span>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-[11px] font-bold text-slate-800 truncate">{task.title}</h4>
                  <p className="text-[9px] text-slate-400 line-clamp-1">{task.description}</p>
                </div>

                <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-wide ${
                  task.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  task.status === 'In Progress' ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-slate-100 text-slate-500 border border-slate-200'
                }`}>
                  {task.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Analytics Overview Line Chart */}
        <div id="analytics-overview-panel" className="bg-white p-3.5 rounded border border-slate-200 shadow-none lg:col-span-8 flex flex-col justify-between relative">
          <div className="flex justify-between items-start mb-1.5">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Analytics Overview</h3>
              <p className="text-[10px] text-slate-400">Consolidated progression of capture triggers and net volume</p>
            </div>
            
            <div className="flex items-center gap-3 text-[10px] font-bold">
              <span className="flex items-center gap-1 text-indigo-600">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Leads Volume
              </span>
              <span className="flex items-center gap-1 text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Revenue (Lakhs)
              </span>
            </div>
          </div>

          {/* Interactive SVG Line Graph with Shading */}
          <div className="relative w-full h-40 pt-1 pb-1">
            <svg viewBox="0 0 500 120" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="leadsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              <line x1="0" y1="12" x2="500" y2="12" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="36" x2="500" y2="36" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="60" x2="500" y2="60" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="84" x2="500" y2="84" stroke="#f1f5f9" strokeWidth="1" />
              <line x1="0" y1="108" x2="500" y2="108" stroke="#cbd5e1" strokeWidth="1.5" />

              {/* Shaded Areas */}
              <path d={`${getLinePath(graphPoints, 'leads', 800, 100)} L 500,108 L 0,108 Z`} fill="url(#leadsGrad)" />
              <path d={`${getLinePath(graphPoints, 'revenue', 50, 100)} L 500,108 L 0,108 Z`} fill="url(#revGrad)" />

              {/* Trailing Curves */}
              <path d={getLinePath(graphPoints, 'leads', 800, 100)} fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
              <path d={getLinePath(graphPoints, 'revenue', 50, 100)} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

              {/* Graph Interactive Circles */}
              {graphPoints.map((pt, idx) => {
                const x = (idx / (graphPoints.length - 1)) * 500;
                const yLeads = 100 - (pt.leads / 800) * 100;
                const yRev = 100 - (pt.revenue / 50) * 100;

                return (
                  <g key={pt.day} className="group/node">
                    {/* Leads Node */}
                    <circle 
                      cx={x} cy={yLeads} r="3.5" 
                      fill="#4f46e5" stroke="#ffffff" strokeWidth="1"
                      className="cursor-pointer hover:r-5 transition"
                      onMouseEnter={(e) => setHoveredPoint({ x, y: yLeads, day: pt.day, leads: pt.leads, revenue: pt.revenue })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                    {/* Revenue Node */}
                    <circle 
                      cx={x} cy={yRev} r="3.5" 
                      fill="#10b981" stroke="#ffffff" strokeWidth="1"
                      className="cursor-pointer hover:r-5 transition"
                      onMouseEnter={(e) => setHoveredPoint({ x, y: yRev, day: pt.day, leads: pt.leads, revenue: pt.revenue })}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Custom Tooltip Overlay */}
            {hoveredPoint && (
              <div 
                className="absolute bg-slate-900 text-white rounded p-1.5 shadow-xl text-[10px] space-y-0.5 z-30 pointer-events-none"
                style={{ 
                  left: `${(hoveredPoint.x / 500) * 88}%`, 
                  top: `${Math.min(70, hoveredPoint.y - 10)}px` 
                }}
              >
                <p className="font-extrabold text-slate-300">Day {hoveredPoint.day}</p>
                <div className="flex gap-2">
                  <span className="text-indigo-300">Leads: <strong>{hoveredPoint.leads}</strong></span>
                  <span className="text-emerald-300">Revenue: <strong>₹{hoveredPoint.revenue}L</strong></span>
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between text-[9px] font-bold text-slate-400 px-1 mt-1">
            <span>Day 01</span>
            <span>Day 05</span>
            <span>Day 10</span>
            <span>Day 15</span>
            <span>Day 20</span>
            <span>Day 21</span>
            <span>Day 30</span>
          </div>
        </div>
      </div>

      {/* Dynamic Summary Modules Grid (Matches other items from image) */}
      <div id="summary-modules-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Calling Management */}
        <div id="sum-calling" className="bg-white p-3 rounded border border-slate-200 shadow-none flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-150">
              <Phone className="w-3 h-3" /> Calling Management
            </span>
          </div>
          <div className="space-y-1 my-2 text-[11px]">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Total Calls Today</span>
              <span className="font-extrabold text-slate-800">{(callLogs.length + 1021).toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Answered Calls</span>
              <span className="font-extrabold text-emerald-600">{callLogs.filter(c => c.type === 'Answered').length + 809}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Missed Calls</span>
              <span className="font-extrabold text-rose-500">{callLogs.filter(c => c.type === 'Missed').length + 211}</span>
            </div>
          </div>
          <button 
            id="nav-calling"
            onClick={() => onNavigate('calling')}
            className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center justify-between"
          >
            <span>View Call Logs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Customer Support */}
        <div id="sum-support" className="bg-white p-3 rounded border border-slate-200 shadow-none flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-150">
              <Headphones className="w-3 h-3" /> Customer Support
            </span>
          </div>
          <div className="space-y-1 my-2 text-[11px]">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Open Tickets</span>
              <span className="font-extrabold text-rose-600">{supportTickets.filter(t => t.status === 'Open').length + 54}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>In Progress</span>
              <span className="font-extrabold text-amber-600">{supportTickets.filter(t => t.status === 'In Progress').length + 27}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Resolved Logs</span>
              <span className="font-extrabold text-emerald-600">{supportTickets.filter(t => t.status === 'Resolved').length + 127}</span>
            </div>
          </div>
          <button 
            id="nav-support"
            onClick={() => onNavigate('support')}
            className="text-[10px] font-bold text-amber-600 hover:underline flex items-center justify-between"
          >
            <span>View All Tickets</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Field & Staff */}
        <div id="sum-staff" className="bg-white p-3 rounded border border-slate-200 shadow-none flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-150">
              <MapPin className="w-3 h-3" /> Field & Staff
            </span>
          </div>
          <div className="space-y-1 my-2 text-[11px]">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Active Field Employees</span>
              <span className="font-extrabold text-slate-800">{fieldStaff.length + 39}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Live Tracking Staff</span>
              <span className="font-extrabold text-indigo-500">{fieldStaff.filter(s => s.status !== 'Offline').length + 16}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Visits Scheduled Today</span>
              <span className="font-extrabold text-emerald-600">36</span>
            </div>
          </div>
          <button 
            id="nav-staff"
            onClick={() => onNavigate('staff')}
            className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center justify-between"
          >
            <span>View on Map</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Tasks & Activities */}
        <div id="sum-tasks" className="bg-white p-3 rounded border border-slate-200 shadow-none flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="flex items-center gap-1 text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-150">
              <CheckSquare className="w-3 h-3" /> Tasks & Activities
            </span>
          </div>
          <div className="space-y-1 my-2 text-[11px]">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Pending Tasks</span>
              <span className="font-extrabold text-amber-600">{tasks.filter(t => t.status === 'Pending').length + 32}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>In Progress Stages</span>
              <span className="font-extrabold text-indigo-500">{tasks.filter(t => t.status === 'In Progress').length + 17}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Completed Tasks</span>
              <span className="font-extrabold text-emerald-600">{tasks.filter(t => t.status === 'Completed').length + 26}</span>
            </div>
          </div>
          <button 
            id="nav-tasks"
            onClick={() => onNavigate('tasks')}
            className="text-[10px] font-bold text-purple-600 hover:underline flex items-center justify-between"
          >
            <span>View All Tasks</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Payroll & HR (Added 2nd row) */}
        <div id="sum-payroll" className="bg-white p-3 rounded border border-slate-200 shadow-none flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="flex items-center gap-1 text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-150">
              <CreditCard className="w-3 h-3" /> Payroll & HR
            </span>
          </div>
          <div className="space-y-1 my-2 text-[11px]">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Total Employees</span>
              <span className="font-extrabold text-slate-800">{employees.length + 121}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Present Today</span>
              <span className="font-extrabold text-emerald-600">98</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Monthly Directs</span>
              <span className="font-extrabold text-slate-800">₹18.75 L</span>
            </div>
          </div>
          <button 
            id="nav-payroll"
            onClick={() => onNavigate('payroll')}
            className="text-[10px] font-bold text-rose-600 hover:underline flex items-center justify-between"
          >
            <span>View Payroll logs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Communication Management */}
        <div id="sum-comms" className="bg-white p-3 rounded border border-slate-200 shadow-none flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-150">
              <MessageSquare className="w-3 h-3" /> Communication
            </span>
          </div>
          <div className="space-y-1 my-2 text-[11px]">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Emails Sent Today</span>
              <span className="font-extrabold text-slate-800">{commsLogs.filter(c => c.type === 'Email').length + 1249}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>SMS Dispatched</span>
              <span className="font-extrabold text-indigo-500">{commsLogs.filter(c => c.type === 'SMS').length + 2339}</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>WhatsApp Alerts</span>
              <span className="font-extrabold text-emerald-500">{commsLogs.filter(c => c.type === 'WhatsApp').length + 1119}</span>
            </div>
          </div>
          <button 
            id="nav-comms"
            onClick={() => onNavigate('comms')}
            className="text-[10px] font-bold text-indigo-600 hover:underline flex items-center justify-between"
          >
            <span>View All Logs</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Security & Access */}
        <div id="sum-security" className="bg-white p-3 rounded border border-slate-200 shadow-none flex flex-col justify-between h-36">
          <div className="flex justify-between items-start">
            <span className="flex items-center gap-1 text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              <Lock className="w-3 h-3" /> Security & Access
            </span>
          </div>
          <div className="space-y-1 my-2 text-[11px]">
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Total System Users</span>
              <span className="font-extrabold text-slate-800">25</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Active Operators</span>
              <span className="font-extrabold text-emerald-600">22</span>
            </div>
            <div className="flex justify-between text-slate-500 font-medium">
              <span>Defined User Roles</span>
              <span className="font-extrabold text-indigo-600">6</span>
            </div>
          </div>
          <button 
            id="nav-security"
            onClick={() => onNavigate('security')}
            className="text-[10px] font-bold text-slate-800 hover:underline flex items-center justify-between"
          >
            <span>Manage Access Panel</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Informative Value Addition Panel */}
        <div id="sum-about-pro" className="bg-[#1E293B] text-slate-100 p-3 rounded border border-slate-800 shadow-none flex flex-col justify-between h-36">
          <div>
            <h4 className="text-[9px] font-black uppercase tracking-widest text-emerald-400">Smart Core Engine</h4>
            <p className="text-[10px] text-slate-400 mt-1 line-clamp-3 leading-snug">
              Google Gemini intelligence pipelines provide real-time pitch suggestions, communication composing, and response drafting for efficient capacity.
            </p>
          </div>
          <div className="text-[9px] text-slate-400 flex items-center gap-1 pt-1 border-t border-slate-800 select-none">
            <Shield className="w-3 h-3 text-emerald-400" /> Enterprise secure architecture
          </div>
        </div>
      </div>
    </div>
  );
}
