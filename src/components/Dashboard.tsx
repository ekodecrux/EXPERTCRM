import React, { useMemo, useState } from 'react';
import {
  Users,
  FileText,
  TrendingUp,
  BarChart3,
  PieChart,
  Zap,
  UserPlus,
  Headphones,
  CheckSquare,
  Settings,
  ArrowRight,
  CheckCircle2,
  Award,
  Activity,
  Receipt,
  UserCheck,
} from 'lucide-react';
import {
  Lead,
  CallLog,
  SupportTicket,
  FieldStaff,
  Task,
  Employee,
  CommsLog,
} from '../types';

interface DashboardProps {
  leads: Lead[];
  callLogs: CallLog[];
  supportTickets: SupportTicket[];
  fieldStaff: FieldStaff[];
  tasks: Task[];
  employees: Employee[];
  commsLogs: CommsLog[];
  userRole?: string;
  onNavigate: (tab: string) => void;
  onAddLeadOpen: () => void;
  onAddCustomerOpen: () => void;
  onLogCallOpen: () => void;
  onCreateTaskOpen: () => void;
  onAddEmployeeOpen: () => void;
  onProcessPayroll: () => void;
  onClientOnboardingOpen?: () => void;
}

interface StoredTenant {
  id: string;
  name: string;
  status: 'Active' | 'Trialing' | 'Suspended';
  createdAt?: string;
}

interface StoredInvoice {
  id: string;
  clientName: string;
  companyName: string;
  totalAmount: number;
  status: 'Paid' | 'Unpaid' | 'Overdue';
  dateIssued: string;
}

type TimeframeOption = 'Last 6 Months' | 'Last 12 Months' | 'This Quarter';

const SALES_SERIES_BY_TIMEFRAME: Record<
  TimeframeOption,
  { label: string; sales: number; invoices: number; revenue: number }[]
> = {
  'Last 6 Months': [
    { label: 'Jun', sales: 6.1, invoices: 4.3, revenue: 2.7 },
    { label: 'Jul', sales: 10.6, invoices: 8.6, revenue: 7.2 },
    { label: 'Aug', sales: 13.4, invoices: 11.2, revenue: 9.7 },
    { label: 'Sep', sales: 12.3, invoices: 10.2, revenue: 8.1 },
    { label: 'Oct', sales: 15.6, invoices: 13.0, revenue: 10.1 },
    { label: 'Nov', sales: 20.0, invoices: 17.6, revenue: 14.9 },
  ],
  'Last 12 Months': [
    { label: 'Dec', sales: 4.2, invoices: 3.1, revenue: 2.2 },
    { label: 'Feb', sales: 7.4, invoices: 5.9, revenue: 4.3 },
    { label: 'Apr', sales: 9.8, invoices: 7.7, revenue: 6.1 },
    { label: 'Jun', sales: 12.1, invoices: 9.6, revenue: 7.8 },
    { label: 'Aug', sales: 15.8, invoices: 13.2, revenue: 10.6 },
    { label: 'Nov', sales: 20.0, invoices: 17.6, revenue: 14.9 },
  ],
  'This Quarter': [
    { label: 'W1', sales: 8.2, invoices: 6.5, revenue: 4.9 },
    { label: 'W3', sales: 11.4, invoices: 9.1, revenue: 7.2 },
    { label: 'W5', sales: 13.8, invoices: 11.6, revenue: 9.1 },
    { label: 'W7', sales: 15.1, invoices: 12.4, revenue: 10.3 },
    { label: 'W9', sales: 17.5, invoices: 15.0, revenue: 12.6 },
    { label: 'W12', sales: 19.6, invoices: 17.1, revenue: 14.5 },
  ],
};

const DEFAULT_RECENT_INVOICES = [
  { id: 'INV-10256', customer: 'ABC Traders', amount: 12500, status: 'Paid', date: '28 Nov 2025' },
  { id: 'INV-10255', customer: 'Global Tech', amount: 18750, status: 'Paid', date: '27 Nov 2025' },
  { id: 'INV-10254', customer: 'Sunrise Pvt Ltd', amount: 25000, status: 'Pending', date: '26 Nov 2025' },
  { id: 'INV-10253', customer: 'Bright India', amount: 15200, status: 'Paid', date: '25 Nov 2025' },
  { id: 'INV-10252', customer: 'Mega Stores', amount: 20000, status: 'Paid', date: '24 Nov 2025' },
];

const DEFAULT_TOP_CUSTOMERS = [
  { customer: 'ABC Traders', invoices: 320, revenue: 850000 },
  { customer: 'Global Tech', invoices: 280, revenue: 720000 },
  { customer: 'Sunrise Pvt Ltd', invoices: 210, revenue: 580000 },
  { customer: 'Bright India', invoices: 190, revenue: 450000 },
  { customer: 'Mega Stores', invoices: 150, revenue: 320000 },
];

function safeParseLocalArray<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatDateLabel(rawDate: string): string {
  const parsed = new Date(rawDate);
  if (Number.isNaN(parsed.getTime())) return rawDate;
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export default function Dashboard({
  leads,
  supportTickets,
  tasks,
  commsLogs,
  userRole = 'Super Admin',
  onNavigate,
  onAddCustomerOpen,
  onCreateTaskOpen,
  onAddEmployeeOpen,
  onClientOnboardingOpen,
}: DashboardProps) {
  const [timeframe, setTimeframe] = useState<TimeframeOption>('Last 6 Months');
  const [hoveredChartIdx, setHoveredChartIdx] = useState<number | null>(null);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);

  const storedTenants = useMemo(
    () => safeParseLocalArray<StoredTenant>('saas_tenants'),
    []
  );
  const storedInvoices = useMemo(
    () => safeParseLocalArray<StoredInvoice>('crm_leads_invoices'),
    []
  );

  // KPI Metrics (reflecting live tenant & invoice changes on top of baseline)
  const totalTenantsCount = 1245 + (storedTenants.length || 3);
  const totalInvoicesCount = 8764 + (storedInvoices.length || 1);
  const wonRevenueDelta = leads
    .filter((l) => l.status === 'Won')
    .reduce((sum, l) => sum + (Number(l.value) || 0), 0);
  const paidInvoiceDelta = storedInvoices
    .filter((inv) => inv.status === 'Paid')
    .reduce((sum, inv) => sum + (Number(inv.totalAmount) || 0), 0);
  const totalRevenue =
    2450000 +
    (wonRevenueDelta > 1500000 ? wonRevenueDelta - 1500000 : 0) +
    (paidInvoiceDelta > 350000 ? paidInvoiceDelta - 350000 : 0);
  const activeTenantsDelta = storedTenants.filter((t) => t.status === 'Active').length;
  const activeSubscriptionsCount = 1118 + (activeTenantsDelta || 2);

  // Sales Overview series
  const chartData = SALES_SERIES_BY_TIMEFRAME[timeframe];
  const chartWidth = 460;
  const chartHeight = 148;
  const padLeft = 36;
  const padRight = 14;
  const padTop = 12;
  const padBottom = 10;
  const innerW = chartWidth - padLeft - padRight;
  const innerH = chartHeight - padTop - padBottom;

  const getChartCoords = (key: 'sales' | 'invoices' | 'revenue') =>
    chartData.map((pt, idx) => {
      const x = padLeft + (idx / Math.max(1, chartData.length - 1)) * innerW;
      const y = padTop + innerH - (pt[key] / 20) * innerH;
      return { x, y, val: pt[key], label: pt.label };
    });

  const buildSmoothLinePath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, idx, arr) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = arr[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  };

  const salesCoords = getChartCoords('sales');
  const invoicesCoords = getChartCoords('invoices');
  const revenueCoords = getChartCoords('revenue');

  // Subscription Status Donut segments
  const subscriptionBreakdown = useMemo(() => {
    const activeExtra = storedTenants.filter((t) => t.status === 'Active').length;
    const pendingExtra = storedTenants.filter((t) => t.status === 'Trialing').length;
    const suspendedExtra = storedTenants.filter((t) => t.status === 'Suspended').length;

    if (storedTenants.length >= 6) {
      const total = storedTenants.length;
      const activePct = Math.round((activeExtra / total) * 100);
      const expiredPct = Math.round((suspendedExtra / total) * 100);
      const pendingPct = Math.max(0, 100 - activePct - expiredPct);
      return [
        { name: 'Active', pct: activePct, color: '#10b981' },
        { name: 'Expired', pct: expiredPct, color: '#157cf3' },
        { name: 'Pending', pct: pendingPct, color: '#f59e0b' },
      ];
    }

    return [
      { name: 'Active', pct: 72, color: '#10b981' },
      { name: 'Expired', pct: 16, color: '#157cf3' },
      { name: 'Pending', pct: 12 + (pendingExtra > 1 ? 0 : 0), color: '#f59e0b' },
    ];
  }, [storedTenants]);

  // Recent Invoices (merged with live crm_leads_invoices)
  const recentInvoicesRows = useMemo(() => {
    const liveRows = storedInvoices.slice(0, 3).map((inv) => ({
      id: inv.id,
      customer: inv.companyName || inv.clientName,
      amount: inv.totalAmount,
      status: inv.status === 'Paid' ? 'Paid' : inv.status === 'Overdue' ? 'Overdue' : 'Pending',
      date: formatDateLabel(inv.dateIssued),
    }));
    const seen = new Set(liveRows.map((r) => r.id));
    const merged = [
      ...liveRows,
      ...DEFAULT_RECENT_INVOICES.filter((d) => !seen.has(d.id)),
    ];
    return merged.slice(0, 5);
  }, [storedInvoices]);

  // Top Customers (merged with live Won/high-value leads)
  const topCustomerRows = useMemo(() => {
    const liveTop = [...leads]
      .sort((a, b) => b.value - a.value)
      .slice(0, 2)
      .map((lead, idx) => ({
        customer: lead.company || lead.name,
        invoices: 340 - idx * 25,
        revenue: lead.value,
      }));
    const seen = new Set(liveTop.map((r) => r.customer.toLowerCase()));
    const merged = [
      ...liveTop,
      ...DEFAULT_TOP_CUSTOMERS.filter((c) => !seen.has(c.customer.toLowerCase())),
    ];
    return merged.slice(0, 5);
  }, [leads]);

  // Recent Activities timeline (synthesizing live tasks, tickets, comms, invoices)
  const recentActivityRows = useMemo(() => {
    const items: {
      id: string;
      text: string;
      time: string;
      tone: 'green' | 'blue' | 'purple' | 'amber' | 'indigo';
      icon: 'check' | 'tenant' | 'ticket' | 'task' | 'user';
    }[] = [];

    if (recentInvoicesRows[0]) {
      items.push({
        id: 'act-inv',
        text: `Invoice ${recentInvoicesRows[0].id} ${
          recentInvoicesRows[0].status === 'Paid' ? 'paid successfully' : 'generated for client'
        }`,
        time: '2 mins ago',
        tone: 'green',
        icon: 'check',
      });
    }

    if (storedTenants[0]) {
      items.push({
        id: 'act-ten',
        text: `Tenant ${storedTenants[storedTenants.length - 1].name} active in cluster`,
        time: '15 mins ago',
        tone: 'blue',
        icon: 'tenant',
      });
    } else {
      items.push({
        id: 'act-ten-default',
        text: 'New tenant ABC Traders onboarded',
        time: '15 mins ago',
        tone: 'blue',
        icon: 'tenant',
      });
    }

    const latestTicket = supportTickets[0];
    items.push({
      id: 'act-tkt',
      text: latestTicket
        ? `Support ticket #${latestTicket.id} ${latestTicket.status.toLowerCase()}`
        : 'Support ticket #ST-1045 resolved',
      time: '1 hour ago',
      tone: 'purple',
      icon: 'ticket',
    });

    const latestTask = tasks[0];
    items.push({
      id: 'act-tsk',
      text: latestTask
        ? `${latestTask.title} (${latestTask.assignedTo || 'Assigned'})`
        : 'New task assigned to Rahul Sharma',
      time: '2 hours ago',
      tone: 'amber',
      icon: 'task',
    });

    const latestComm = commsLogs[0];
    items.push({
      id: 'act-usr',
      text: latestComm
        ? `${latestComm.type} dispatched to ${latestComm.recipient}`
        : 'New user registered: rohit.kumar',
      time: '3 hours ago',
      tone: 'indigo',
      icon: 'user',
    });

    return items.slice(0, 5);
  }, [recentInvoicesRows, storedTenants, supportTickets, tasks, commsLogs]);

  const quickActionItems = [
    {
      id: 'qa-create-invoice',
      label: 'Create Invoice',
      icon: FileText,
      onClick: () => onNavigate('leads'),
    },
    {
      id: 'qa-add-tenant',
      label: userRole === 'Super Admin' ? 'Client Onboarding' : 'Add Lead',
      icon: UserPlus,
      onClick: () => {
        if (userRole === 'Super Admin') {
          if (onClientOnboardingOpen) {
            onClientOnboardingOpen();
          } else {
            onNavigate('saas');
          }
        } else {
          onNavigate('leads');
        }
      },
    },
    {
      id: 'qa-support-ticket',
      label: 'Support Ticket',
      icon: Headphones,
      onClick: onAddCustomerOpen,
    },
    {
      id: 'qa-create-task',
      label: 'Create Task',
      icon: CheckSquare,
      onClick: onCreateTaskOpen,
    },
    {
      id: 'qa-add-staff',
      label: 'Add Staff',
      icon: Users,
      onClick: onAddEmployeeOpen,
    },
    {
      id: 'qa-settings',
      label: 'Settings',
      icon: Settings,
      onClick: () => onNavigate('security'),
    },
  ];

  return (
    <div id="dashboard-container" className="space-y-4">
      {/* Row 1: 4 Elevated KPI Cards with Wave Sparklines */}
      <div
        id="widget-kpi-row"
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {/* KPI 1: Total Tenants */}
        <div
          id="kpi-tenants"
          onClick={() => onNavigate(userRole === 'Super Admin' ? 'saas' : 'leads')}
          className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_18px_rgba(8,36,88,0.05)] p-4 relative overflow-hidden flex flex-col justify-between min-h-[116px] cursor-pointer hover:shadow-[0_8px_24px_rgba(11,116,240,0.12)] transition"
        >
          <div className="flex items-start gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#eef4fb] text-[#0b74f0] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" id="icon-total-tenants" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-slate-500 truncate">
                Total Tenants
              </p>
              <h3 className="text-2xl font-extrabold text-[#082458] tracking-tight tabular-nums mt-0.5">
                {totalTenantsCount.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>

          <div className="mt-3 relative z-10">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10b981] tabular-nums">
              <span>↑</span> 12%
            </span>
          </div>

          <svg
            viewBox="0 0 180 56"
            preserveAspectRatio="none"
            className="absolute right-0 bottom-0 w-40 h-14 pointer-events-none"
          >
            <defs>
              <linearGradient id="kpiWaveBlue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0b74f0" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#0b74f0" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d="M 10 48 Q 32 42 52 24 T 95 28 T 135 16 T 180 26 L 180 56 L 10 56 Z"
              fill="url(#kpiWaveBlue)"
            />
            <path
              d="M 10 48 Q 32 42 52 24 T 95 28 T 135 16 T 180 26"
              fill="none"
              stroke="#0b74f0"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* KPI 2: Total Invoices */}
        <div
          id="kpi-invoices"
          onClick={() => onNavigate('leads')}
          className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_18px_rgba(8,36,88,0.05)] p-4 relative overflow-hidden flex flex-col justify-between min-h-[116px] cursor-pointer hover:shadow-[0_8px_24px_rgba(20,184,134,0.12)] transition"
        >
          <div className="flex items-start gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#e6f9f0] text-[#069468] flex items-center justify-center shrink-0">
              <FileText className="w-6 h-6" id="icon-total-invoices" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-slate-500 truncate">
                Total Invoices
              </p>
              <h3 className="text-2xl font-extrabold text-[#082458] tracking-tight tabular-nums mt-0.5">
                {totalInvoicesCount.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>

          <div className="mt-3 relative z-10">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10b981] tabular-nums">
              <span>↑</span> 15%
            </span>
          </div>

          <svg
            viewBox="0 0 180 56"
            preserveAspectRatio="none"
            className="absolute right-0 bottom-0 w-40 h-14 pointer-events-none"
          >
            <defs>
              <linearGradient id="kpiWaveGreen" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#14b886" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#14b886" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d="M 10 49 Q 35 40 58 30 T 100 32 T 140 18 T 180 22 L 180 56 L 10 56 Z"
              fill="url(#kpiWaveGreen)"
            />
            <path
              d="M 10 49 Q 35 40 58 30 T 100 32 T 140 18 T 180 22"
              fill="none"
              stroke="#14b886"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* KPI 3: Total Revenue */}
        <div
          id="kpi-revenue"
          onClick={() => onNavigate('leads')}
          className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_18px_rgba(8,36,88,0.05)] p-4 relative overflow-hidden flex flex-col justify-between min-h-[116px] cursor-pointer hover:shadow-[0_8px_24px_rgba(245,158,11,0.12)] transition"
        >
          <div className="flex items-start gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#fef4e2] text-[#f59e0b] flex items-center justify-center shrink-0">
              <span className="w-7 h-7 rounded-md bg-[#f59e0b] text-white font-extrabold text-sm flex items-center justify-center">
                ₹
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-slate-500 truncate">
                Total Revenue
              </p>
              <h3 className="text-2xl font-extrabold text-[#082458] tracking-tight tabular-nums mt-0.5 truncate">
                ₹ {totalRevenue.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>

          <div className="mt-3 relative z-10">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10b981] tabular-nums">
              <span>↑</span> 18%
            </span>
          </div>

          <svg
            viewBox="0 0 180 56"
            preserveAspectRatio="none"
            className="absolute right-0 bottom-0 w-40 h-14 pointer-events-none"
          >
            <defs>
              <linearGradient id="kpiWaveAmber" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d="M 10 50 Q 34 38 62 34 T 104 26 T 144 19 T 180 12 L 180 56 L 10 56 Z"
              fill="url(#kpiWaveAmber)"
            />
            <path
              d="M 10 50 Q 34 38 62 34 T 104 26 T 144 19 T 180 12"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* KPI 4: Active Subscriptions */}
        <div
          id="kpi-subscriptions"
          onClick={() => onNavigate(userRole === 'Super Admin' ? 'saas' : 'leads')}
          className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_18px_rgba(8,36,88,0.05)] p-4 relative overflow-hidden flex flex-col justify-between min-h-[116px] cursor-pointer hover:shadow-[0_8px_24px_rgba(105,43,224,0.12)] transition"
        >
          <div className="flex items-start gap-3.5 relative z-10">
            <div className="w-12 h-12 rounded-xl bg-[#f1eaff] text-[#692be0] flex items-center justify-center shrink-0">
              <TrendingUp className="w-6 h-6" id="icon-active-subs" />
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-slate-500 truncate">
                Active Subscriptions
              </p>
              <h3 className="text-2xl font-extrabold text-[#082458] tracking-tight tabular-nums mt-0.5">
                {activeSubscriptionsCount.toLocaleString('en-IN')}
              </h3>
            </div>
          </div>

          <div className="mt-3 relative z-10">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-[#10b981] tabular-nums">
              <span>↑</span> 10%
            </span>
          </div>

          <svg
            viewBox="0 0 180 56"
            preserveAspectRatio="none"
            className="absolute right-0 bottom-0 w-40 h-14 pointer-events-none"
          >
            <defs>
              <linearGradient id="kpiWavePurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8a5cf5" stopOpacity="0.32" />
                <stop offset="100%" stopColor="#692be0" stopOpacity="0.02" />
              </linearGradient>
            </defs>
            <path
              d="M 10 46 Q 36 42 58 29 T 102 31 T 142 15 T 180 20 L 180 56 L 10 56 Z"
              fill="url(#kpiWavePurple)"
            />
            <path
              d="M 10 46 Q 36 42 58 29 T 102 31 T 142 15 T 180 20"
              fill="none"
              stroke="#692be0"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Row 2: Sales Overview + Subscription Status + Quick Actions */}
      <div
        id="middle-core-grid"
        className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr_1.05fr] gap-4"
      >
        {/* Panel 1: Sales Overview */}
        <div
          id="analytics-overview-panel"
          className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_18px_rgba(8,36,88,0.05)] overflow-hidden flex flex-col"
        >
          <div className="bg-gradient-to-r from-[#041845] to-[#082458] text-white px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <BarChart3 className="w-4 h-4 text-[#16c2ff] shrink-0" />
              <h3 className="text-sm font-bold tracking-tight truncate">
                Sales Overview
              </h3>
            </div>
            <select
              aria-label="Sales overview timeframe"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value as TimeframeOption)}
              className="bg-[#0b74f0] hover:bg-[#005be0] text-white text-xs font-semibold rounded-full px-3 py-1 border border-[#16c2ff]/40 focus:outline-none cursor-pointer shrink-0"
            >
              <option value="Last 6 Months">Last 6 Months</option>
              <option value="Last 12 Months">Last 12 Months</option>
              <option value="This Quarter">This Quarter</option>
            </select>
          </div>

          <div className="p-4 flex-1 flex flex-col justify-between">
            {/* Series Legend */}
            <div className="flex items-center justify-center gap-5 text-xs font-semibold text-slate-600 mb-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0b74f0]" />
                Sales
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#14b886]" />
                Invoices
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#8a5cf5]" />
                Revenue
              </span>
            </div>

            {/* SVG Multi-Series Smooth Line Chart */}
            <div className="relative w-full">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight + 24}`}
                className="w-full h-48 overflow-visible"
              >
                <defs>
                  <linearGradient id="salesFillGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#0b74f0" stopOpacity="0.16" />
                    <stop offset="100%" stopColor="#0b74f0" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid & Y-Axis Labels */}
                {[
                  { val: 20, label: '20K' },
                  { val: 15, label: '15K' },
                  { val: 10, label: '10K' },
                  { val: 5, label: '5K' },
                  { val: 0, label: '0' },
                ].map((tick) => {
                  const y = padTop + innerH - (tick.val / 20) * innerH;
                  return (
                    <g key={tick.label}>
                      <line
                        x1={padLeft}
                        y1={y}
                        x2={chartWidth - padRight}
                        y2={y}
                        stroke={tick.val === 0 ? '#cbd5e1' : '#e2e8f0'}
                        strokeWidth="1"
                      />
                      <text
                        x={padLeft - 8}
                        y={y + 3.5}
                        textAnchor="end"
                        className="fill-slate-500 text-[10px] font-semibold tabular-nums"
                      >
                        {tick.label}
                      </text>
                    </g>
                  );
                })}

                {/* Soft Fill under Top Line */}
                <path
                  d={`${buildSmoothLinePath(salesCoords)} L ${
                    salesCoords[salesCoords.length - 1].x
                  } ${padTop + innerH} L ${salesCoords[0].x} ${padTop + innerH} Z`}
                  fill="url(#salesFillGrad)"
                />

                {/* Smooth Curves */}
                <path
                  d={buildSmoothLinePath(revenueCoords)}
                  fill="none"
                  stroke="#8a5cf5"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d={buildSmoothLinePath(invoicesCoords)}
                  fill="none"
                  stroke="#14b886"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d={buildSmoothLinePath(salesCoords)}
                  fill="none"
                  stroke="#0b74f0"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Hover Guide Line & Dots */}
                {hoveredChartIdx !== null && (
                  <line
                    x1={salesCoords[hoveredChartIdx].x}
                    y1={padTop}
                    x2={salesCoords[hoveredChartIdx].x}
                    y2={padTop + innerH}
                    stroke="#94a3b8"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                )}

                {chartData.map((pt, idx) => {
                  const sx = salesCoords[idx].x;
                  return (
                    <g
                      key={pt.label}
                      className="cursor-pointer"
                      onMouseEnter={() => setHoveredChartIdx(idx)}
                      onMouseLeave={() => setHoveredChartIdx(null)}
                    >
                      <rect
                        x={sx - 24}
                        y={padTop}
                        width={48}
                        height={innerH}
                        fill="transparent"
                      />
                      <circle
                        cx={sx}
                        cy={salesCoords[idx].y}
                        r={hoveredChartIdx === idx ? 5.5 : 4}
                        fill="#0b74f0"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={sx}
                        cy={invoicesCoords[idx].y}
                        r={hoveredChartIdx === idx ? 5.5 : 4}
                        fill="#14b886"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={sx}
                        cy={revenueCoords[idx].y}
                        r={hoveredChartIdx === idx ? 5.5 : 4}
                        fill="#8a5cf5"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                      <text
                        x={sx}
                        y={padTop + innerH + 18}
                        textAnchor="middle"
                        className="fill-slate-600 text-[11px] font-semibold"
                      >
                        {pt.label}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {hoveredChartIdx !== null && (
                <div
                  className="absolute top-1 bg-[#082458] text-white rounded-lg px-2.5 py-1.5 shadow-lg text-[11px] pointer-events-none z-20 space-y-0.5 tabular-nums border border-[#16c2ff]/30"
                  style={{
                    left: `${Math.min(
                      72,
                      Math.max(8, (hoveredChartIdx / Math.max(1, chartData.length - 1)) * 72 + 6)
                    )}%`,
                  }}
                >
                  <p className="font-bold text-[#16c2ff]">{chartData[hoveredChartIdx].label}</p>
                  <p>Sales: ₹{chartData[hoveredChartIdx].sales.toFixed(1)}K</p>
                  <p>Invoices: {Math.round(chartData[hoveredChartIdx].invoices * 100)}</p>
                  <p>Revenue: ₹{chartData[hoveredChartIdx].revenue.toFixed(1)}K</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Panel 2: Subscription Status Donut */}
        <div
          id="source-panel"
          className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_18px_rgba(8,36,88,0.05)] overflow-hidden flex flex-col"
        >
          <div className="bg-gradient-to-r from-[#041845] to-[#082458] text-white px-4 py-3 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-[#16c2ff] shrink-0" />
            <h3 className="text-sm font-bold tracking-tight">Subscription Status</h3>
          </div>

          <div className="p-4 flex-1 flex items-center justify-center gap-4">
            {/* Donut SVG */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 132 132" className="w-full h-full -rotate-90">
                <circle
                  cx="66"
                  cy="66"
                  r="48"
                  fill="transparent"
                  stroke="#eef2f6"
                  strokeWidth="20"
                />
                {(() => {
                  let cumulative = 0;
                  const radius = 48;
                  const circumference = 2 * Math.PI * radius;
                  return subscriptionBreakdown.map((seg) => {
                    const segLength = circumference * (seg.pct / 100);
                    const gapLength = circumference - segLength;
                    const offset = -circumference * (cumulative / 100);
                    cumulative += seg.pct;
                    return (
                      <circle
                        key={seg.name}
                        cx="66"
                        cy="66"
                        r={radius}
                        fill="transparent"
                        stroke={seg.color}
                        strokeWidth={hoveredSegment === seg.name ? 22 : 20}
                        strokeDasharray={`${Math.max(0, segLength - 2)} ${gapLength + 2}`}
                        strokeDashoffset={offset}
                        className="transition-all cursor-pointer"
                        onMouseEnter={() => setHoveredSegment(seg.name)}
                        onMouseLeave={() => setHoveredSegment(null)}
                      />
                    );
                  });
                })()}
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-2xl font-extrabold text-[#082458] tabular-nums leading-none">
                  {totalTenantsCount.toLocaleString('en-IN')}
                </span>
                <span className="text-xs font-medium text-slate-500 mt-1">Total</span>
              </div>
            </div>

            {/* Right Legend */}
            <div className="space-y-3 min-w-[115px]">
              {subscriptionBreakdown.map((seg) => (
                <div
                  key={seg.name}
                  onMouseEnter={() => setHoveredSegment(seg.name)}
                  onMouseLeave={() => setHoveredSegment(null)}
                  className={`flex items-center justify-between gap-3 px-2 py-1 rounded-lg transition cursor-default ${
                    hoveredSegment === seg.name ? 'bg-[#eef4fb]' : ''
                  }`}
                >
                  <span className="flex items-center gap-2 text-xs font-medium text-[#082458]">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: seg.color }}
                    />
                    {seg.name}
                  </span>
                  <span className="text-xs font-extrabold text-[#082458] tabular-nums">
                    {seg.pct}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel 3: Quick Actions */}
        <div
          id="quick-actions-panel"
          className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_18px_rgba(8,36,88,0.05)] overflow-hidden flex flex-col"
        >
          <div className="bg-gradient-to-r from-[#041845] to-[#082458] text-white px-4 py-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#16c2ff] shrink-0" />
            <h3 className="text-sm font-bold tracking-tight">Quick Actions</h3>
          </div>

          <div className="p-4 flex-1 grid grid-cols-3 gap-2.5 content-center">
            {quickActionItems.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  id={action.id}
                  type="button"
                  onClick={action.onClick}
                  className="bg-[#eef4fb] hover:bg-[#dceafb] border border-[#0b74f0]/15 rounded-xl p-3 flex flex-col items-center justify-center gap-2 transition cursor-pointer group"
                >
                  <span className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0b78f4] to-[#005be0] group-hover:from-[#0768d8] group-hover:to-[#004ec4] text-white flex items-center justify-center shadow-sm transition">
                    <Icon className="w-4.5 h-4.5" />
                  </span>
                  <span className="text-[11px] font-semibold text-[#082458] whitespace-nowrap">
                    {action.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Row 3: Recent Invoices + Top Customers + Recent Activities */}
      <div
        id="summary-modules-grid"
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Card 1: Recent Invoices */}
        <div
          id="sum-recent-invoices"
          className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_18px_rgba(8,36,88,0.05)] overflow-hidden flex flex-col"
        >
          <div className="bg-gradient-to-r from-[#2393f8] to-[#0a66e0] text-white px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-sky-100 shrink-0" />
              <h3 className="text-sm font-bold tracking-tight">Recent Invoices</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('leads')}
              className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                  <th className="py-2 px-1.5 whitespace-nowrap">Invoice No.</th>
                  <th className="py-2 px-1.5 whitespace-nowrap">Customer</th>
                  <th className="py-2 px-1.5 whitespace-nowrap">Amount</th>
                  <th className="py-2 px-1.5 whitespace-nowrap">Status</th>
                  <th className="py-2 px-1.5 whitespace-nowrap text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {recentInvoicesRows.map((inv) => (
                  <tr
                    key={inv.id}
                    onClick={() => onNavigate('leads')}
                    className="hover:bg-[#eef4fb]/60 transition cursor-pointer"
                  >
                    <td className="py-2.5 px-1.5 font-semibold text-[#082458] whitespace-nowrap tabular-nums">
                      {inv.id}
                    </td>
                    <td className="py-2.5 px-1.5 text-slate-700 truncate max-w-[115px]">
                      {inv.customer}
                    </td>
                    <td className="py-2.5 px-1.5 font-semibold text-[#082458] whitespace-nowrap tabular-nums">
                      ₹ {inv.amount.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-1.5 whitespace-nowrap">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          inv.status === 'Paid'
                            ? 'bg-emerald-50 text-emerald-600'
                            : inv.status === 'Overdue'
                            ? 'bg-rose-50 text-rose-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-1.5 text-slate-500 whitespace-nowrap text-right tabular-nums">
                      {inv.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 2: Top Customers */}
        <div
          id="sum-top-customers"
          className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_18px_rgba(8,36,88,0.05)] overflow-hidden flex flex-col"
        >
          <div className="bg-gradient-to-r from-[#14b886] to-[#069468] text-white px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-100 shrink-0" />
              <h3 className="text-sm font-bold tracking-tight">Top Customers</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('leads')}
              className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3 overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-500">
                  <th className="py-2 px-2 whitespace-nowrap">Customer</th>
                  <th className="py-2 px-2 whitespace-nowrap text-center">Invoices</th>
                  <th className="py-2 px-2 whitespace-nowrap text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {topCustomerRows.map((row) => (
                  <tr
                    key={row.customer}
                    onClick={() => onNavigate('leads')}
                    className="hover:bg-[#eef4fb]/60 transition cursor-pointer"
                  >
                    <td className="py-2.5 px-2 font-medium text-[#082458] truncate max-w-[160px]">
                      {row.customer}
                    </td>
                    <td className="py-2.5 px-2 text-slate-700 text-center tabular-nums">
                      {row.invoices}
                    </td>
                    <td className="py-2.5 px-2 font-semibold text-[#082458] text-right whitespace-nowrap tabular-nums">
                      ₹ {row.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Card 3: Recent Activities */}
        <div
          id="sum-recent-activities"
          className="bg-white rounded-2xl border border-slate-200/70 shadow-[0_4px_18px_rgba(8,36,88,0.05)] overflow-hidden flex flex-col"
        >
          <div className="bg-gradient-to-r from-[#8a5cf5] to-[#692be0] text-white px-4 py-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-violet-100 shrink-0" />
              <h3 className="text-sm font-bold tracking-tight">Recent Activities</h3>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('tasks')}
              className="text-xs font-semibold text-white/90 hover:text-white flex items-center gap-1 whitespace-nowrap shrink-0 cursor-pointer"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-3.5 divide-y divide-slate-100 flex-1 flex flex-col justify-between">
            {recentActivityRows.map((act) => {
              const badgeClass =
                act.tone === 'green'
                  ? 'bg-emerald-50 text-emerald-600'
                  : act.tone === 'blue'
                  ? 'bg-[#eef4fb] text-[#0b74f0]'
                  : act.tone === 'purple'
                  ? 'bg-violet-50 text-[#692be0]'
                  : act.tone === 'amber'
                  ? 'bg-amber-50 text-amber-600'
                  : 'bg-[#eef4fb] text-[#082458]';

              return (
                <div
                  key={act.id}
                  onClick={() =>
                    onNavigate(
                      act.icon === 'ticket'
                        ? 'support'
                        : act.icon === 'task'
                        ? 'tasks'
                        : act.icon === 'tenant'
                        ? userRole === 'Super Admin'
                          ? 'saas'
                          : 'leads'
                        : 'leads'
                    )
                  }
                  className="py-2.5 first:pt-1 last:pb-1 flex items-center justify-between gap-2.5 cursor-pointer hover:bg-[#eef4fb]/60 rounded-lg px-1 transition"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${badgeClass}`}
                    >
                      {act.icon === 'check' && <CheckCircle2 className="w-3.5 h-3.5" />}
                      {act.icon === 'tenant' && <UserPlus className="w-3.5 h-3.5" />}
                      {act.icon === 'ticket' && <Headphones className="w-3.5 h-3.5" />}
                      {act.icon === 'task' && <CheckSquare className="w-3.5 h-3.5" />}
                      {act.icon === 'user' && <UserCheck className="w-3.5 h-3.5" />}
                    </span>
                    <span className="text-xs font-medium text-[#082458] truncate">
                      {act.text}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 tabular-nums">
                    {act.time}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
