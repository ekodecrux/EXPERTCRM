import React, { useState } from 'react';
import { 
  Sparkles, Globe, Shield, CreditCard, Users, Zap, Check, CheckCircle2, 
  HelpCircle, Trash2, Plus, ArrowUpRight, DollarSign, RefreshCw, Layers, 
  FileText, Activity, Server, Sliders, AlertCircle, X, Mail, Link, Building,
  Edit
} from 'lucide-react';

export interface SaaSPlan {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  seatsLimit: number;
  apiLimit: number; // requests/month
  aiEnabled: boolean;
  color: string;
  badge: string;
  features: string[];
}

export interface TenantWorkspace {
  id: string;
  name: string;
  subdomain: string;
  planId: string;
  status: 'Active' | 'Suspended' | 'Trialing';
  createdAt: string;
  seatCount: number;
  customDomain?: string;
  clientContactName?: string;
  clientOnboardEmail?: string;
  adminPassword?: string;
  domainProvider?: 'expertcrm.in' | 'expertaidtech.in' | 'custom';
}

export const SAAS_PLANS: SaaSPlan[] = [
  {
    id: 'free',
    name: 'Starter Sandbox',
    price: 0,
    interval: 'month',
    seatsLimit: 3,
    apiLimit: 500,
    aiEnabled: false,
    color: 'from-slate-500 to-slate-700',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    features: [
      'Basic Lead CRM Management',
      'Unified Tasks Planner Desk',
      'Max 3 Active Staff seat licenses',
      'Standard SSL domain directory',
      'No automated Gemini Support draft replies'
    ]
  },
  {
    id: 'pro',
    name: 'Professional Team',
    price: 3999,
    interval: 'month',
    seatsLimit: 15,
    apiLimit: 5000,
    aiEnabled: true,
    color: 'from-indigo-500 to-indigo-700',
    badge: 'bg-indigo-50 border-indigo-200 text-indigo-700',
    features: [
      'All Lead & Outbound Dial queues',
      'Dynamic Field Dispatch operations',
      'Advanced Payroll & HR Ledger sheets',
      'Up to 15 Seat licences included',
      '5,000 API transactions/month limits',
      'Dynamic security credentials & IP tracking'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise Shield',
    price: 14999,
    interval: 'month',
    seatsLimit: 100,
    apiLimit: 100000,
    aiEnabled: true,
    color: 'from-purple-600 to-indigo-800',
    badge: 'bg-purple-100 border-purple-200 text-purple-700',
    features: [
      'Infinite Leads & Call center logs',
      'Global Dispatch timelines with maps tracking',
      'Up to 100 User seats dynamically assigned',
      'Gemini-powered priority ticket suggestions',
      '100,000 SLA API calls metrics capacity',
      'Dedicated backup mirror nodes'
    ]
  }
];

interface SaaSWorkspacePanelProps {
  currentPlanId: string;
  onUpdatePlan: (planId: string) => void;
  onWorkspaceChange: (workspaceName: string) => void;
  activeWorkspace: string;
  showToast: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export default function SaaSWorkspacePanel({
  currentPlanId,
  onUpdatePlan,
  onWorkspaceChange,
  activeWorkspace,
  showToast
}: SaaSWorkspacePanelProps) {
  // SaaS Storage
  const [tenants, setTenants] = useState<TenantWorkspace[]>(() => {
    const saved = localStorage.getItem('saas_tenants');
    return saved ? JSON.parse(saved) : [
      { id: 'ten-1', name: 'Expert CRM HQ', subdomain: 'expert', planId: 'enterprise', status: 'Active', createdAt: '2026-01-10', seatCount: 42, domainProvider: 'expertcrm.in', clientContactName: 'Super Admin Operational', clientOnboardEmail: 'expertaidtech@gmail.com', adminPassword: 'AdminSecureKey#1' },
      { id: 'ten-2', name: 'Mehta Logistics', subdomain: 'mehtalog', planId: 'pro', status: 'Active', createdAt: '2026-03-15', seatCount: 8, domainProvider: 'expertaidtech.in', clientContactName: 'Rohan Mehta', clientOnboardEmail: 'rohan@mehtalogistics.in', adminPassword: 'MehtaLogSecure88' },
      { id: 'ten-3', name: 'Indus Dynamics Trial', subdomain: 'indusdyn', planId: 'free', status: 'Trialing', createdAt: '2026-06-01', seatCount: 2, domainProvider: 'custom', customDomain: 'crm.indusdynamics.in', clientContactName: 'Nikhil Sen', clientOnboardEmail: 'nikhil@indusdynamics.in', adminPassword: 'IndusTrialPower99' }
    ];
  });

  const [simulatedUsage, setSimulatedUsage] = useState(() => ({
    apiCallsThisMonth: 3412,
    leadConversionRate: 85.4,
    uptimeSimulated: '99.99%',
    lastInvoicedAmount: 199,
    nextBillingDate: '2026-07-15'
  }));

  // Form states
  const [newTenantName, setNewTenantName] = useState('');
  const [newSubdomain, setNewSubdomain] = useState('');
  const [newPlan, setNewPlan] = useState('free');
  const [isAddingTenant, setIsAddingTenant] = useState(false);
  const [apiMultiplier, setApiMultiplier] = useState(1);
  const [onboardEmail, setOnboardEmail] = useState('');
  const [contactName, setContactName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [domainProvider, setDomainProvider] = useState<'expertcrm.in' | 'expertaidtech.in' | 'custom'>('expertcrm.in');
  const [customDomain, setCustomDomain] = useState('');
  const [editingTenant, setEditingTenant] = useState<TenantWorkspace | null>(null);

  const activePlan = SAAS_PLANS.find(p => p.id === currentPlanId) || SAAS_PLANS[1];

  const persistTenants = (updated: TenantWorkspace[]) => {
    setTenants(updated);
    localStorage.setItem('saas_tenants', JSON.stringify(updated));
  };

  const handleAddTenant = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanedSub = newSubdomain.toLowerCase().replace(/[^a-z0-9]/g, '') || newTenantName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    if (!newTenantName.trim() || !cleanedSub) {
      showToast('Please provide a valid client/organization name.', 'warning');
      return;
    }

    if (!newPassword.trim()) {
      showToast('Please specify an initial administrator credentials password.', 'warning');
      return;
    }

    if (tenants.find(t => t.subdomain === cleanedSub && t.domainProvider === domainProvider)) {
      showToast('This subdomain layout is already provisioned on the selected cluster domain.', 'warning');
      return;
    }

    const targetPlan = SAAS_PLANS.find(p => p.id === newPlan) || SAAS_PLANS[0];

    const newTen: TenantWorkspace = {
      id: `ten-${100 + tenants.length + 1}`,
      name: newTenantName.trim(),
      subdomain: cleanedSub,
      planId: newPlan,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0],
      seatCount: 1,
      clientContactName: contactName.trim() || 'General Admin',
      clientOnboardEmail: onboardEmail.trim() || 'onboard@client.com',
      adminPassword: newPassword.trim(),
      domainProvider: domainProvider,
      customDomain: domainProvider === 'custom' ? (customDomain.trim() || `${cleanedSub}.custom-mapped.in`) : undefined
    };

    const updated = [...tenants, newTen];
    persistTenants(updated);
    
    // Switch to it automatically to show SaaS multi-tenant feedback trigger
    onWorkspaceChange(newTen.name);
    onUpdatePlan(newTen.planId);

    setNewTenantName('');
    setNewSubdomain('');
    setOnboardEmail('');
    setContactName('');
    setNewPassword('');
    setDomainProvider('expertcrm.in');
    setCustomDomain('');
    setIsAddingTenant(false);

    const configuredURL = newTen.domainProvider === 'custom' 
      ? `https://${newTen.customDomain}` 
      : `https://${newTen.subdomain}.${newTen.domainProvider}`;

    showToast(`Onboarded client "${newTen.name}" successfully on cluster node: ${configuredURL}!`, 'success');
  };

  const deleteTenant = (id: string, name: string) => {
    if (tenants.length <= 1) {
      showToast('Cannot delete the root tenant. Must have at least one valid CRM namespace.', 'warning');
      return;
    }
    const updated = tenants.filter(t => t.id !== id);
    persistTenants(updated);
    showToast(`Workspace "${name}" cluster resources released.`, 'info');
    if (activeWorkspace === name) {
      const fallback = updated[0];
      onWorkspaceChange(fallback.name);
      onUpdatePlan(fallback.planId);
    }
  };

  const selectTenant = (tenant: TenantWorkspace) => {
    onWorkspaceChange(tenant.name);
    onUpdatePlan(tenant.planId);
    const domainText = tenant.domainProvider === 'custom' 
      ? tenant.customDomain 
      : `${tenant.subdomain}.${tenant.domainProvider || 'expertcrm.in'}`;
    showToast(`Switched workspace environment to ${tenant.name} (${domainText})`, 'info');
  };

  const triggerSimulateCharge = () => {
    showToast("Simulating SaaS webhook invoice generated. Verification dispatch logged.", "success");
    if ((window as any).__triggerGlobalPrint) {
      (window as any).__triggerGlobalPrint(
        `SaaS Invoice: ${activeWorkspace}`,
        'invoice',
        {
          id: `INV-SAAS-${Math.floor(1000 + Math.random() * 9000)}`,
          clientName: activeWorkspace,
          createdDate: new Date().toLocaleDateString(),
          pricingPlanName: activePlan.name,
          apiCallsLimit: activePlan.apiLimit,
          billingRate: activePlan.price,
          currency: 'INR',
          seatsProvisioned: tenants.find(t => t.name === activeWorkspace)?.seatCount || 5
        }
      );
    }
  };

  return (
    <div id="saas-features-panel" className="space-y-8 animate-fadeIn">
      
      {/* Visual SaaS Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 md:p-8 text-white relative border border-slate-800 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-500/20 to-purple-600/5 rounded-full filter blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 text-[10px] uppercase font-black tracking-widest text-indigo-300 bg-indigo-500/20 backdrop-blur rounded-full border border-indigo-500/30">
              <Zap className="w-3 h-3 text-indigo-400" /> Multi-Tenant SaaS Roster
            </span>
            <h3 className="text-xl md:text-2xl font-black tracking-tight leading-none text-white">
              Tenant Hub & Subscription Control Center
            </h3>
            <p className="text-[11.5px] text-slate-350 leading-relaxed font-semibold">
              You are viewing the SaaS architecture dashboard. Provision isolated workspaces, allocate seat quotas, toggle active subdomains, and simulate secure Stripe subscription ledger reconciliations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center sm:text-left min-w-[140px]">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Active Workspace</span>
              <h4 className="text-sm font-black text-emerald-400 uppercase truncate mt-0.5">{activeWorkspace}</h4>
              <p className="text-[9.5px] font-bold text-indigo-300 mt-1 flex items-center justify-center sm:justify-start gap-1">
                <Globe className="w-3 h-3" />
                {activeWorkspace.toLowerCase().replace(/[^a-z0-9]/g, '')}.expertcrm.com
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center sm:text-left min-w-[140px]">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Plan Tier</span>
              <h4 className="text-sm font-black text-indigo-300 uppercase truncate mt-0.5">{activePlan.name}</h4>
              <p className="text-[9.5px] font-mono font-bold text-slate-300 mt-1">
                ₹{activePlan.price.toLocaleString('en-IN')} / {activePlan.interval}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* SaaS Live Metrics Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Simulated Monthly API Usage</span>
            <div className="p-1 px-2 rounded-md bg-indigo-50 border border-indigo-100 text-indigo-700 text-[9px] font-black">
              {Math.round((simulatedUsage.apiCallsThisMonth / activePlan.apiLimit) * 100)}% Used
            </div>
          </div>
          <p className="text-lg font-black text-slate-900">{simulatedUsage.apiCallsThisMonth.toLocaleString()} / {activePlan.apiLimit.toLocaleString()}</p>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
              style={{ width: `${Math.min(100, (simulatedUsage.apiCallsThisMonth / activePlan.apiLimit) * 100)}%` }}
            ></div>
          </div>
          <p className="text-[9px] text-slate-400">SLA quota resets on {simulatedUsage.nextBillingDate}</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Dynamic Seat Quotas</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-lg font-black text-slate-900">
            {tenants.find(t => t.name === activeWorkspace)?.seatCount || 5} of {activePlan.seatsLimit} Seats
          </p>
          <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all" 
              style={{ width: `${Math.min(100, (((tenants.find(t => t.name === activeWorkspace)?.seatCount || 5) / activePlan.seatsLimit) * 100))}%` }}
            ></div>
          </div>
          <p className="text-[9px] text-slate-400">Allocated user credentials verified on identity database.</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Node Status</span>
            <span className="inline-flex w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span>
          </div>
          <p className="text-lg font-black text-slate-900">Provisioned</p>
          <div className="flex items-center gap-1.5 text-[9.5px] text-slate-500">
            <Server className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono bg-slate-50 border border-slate-150 px-1 py-0.5 rounded text-indigo-750 font-extrabold truncate">cluster-in-asia-east-ssl</span>
          </div>
          <p className="text-[9px] text-slate-405">Distributed tenancy load auto-balanced.</p>
        </div>

        <div className="p-4 bg-white border border-slate-200 rounded-2xl space-y-2 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Billing Handshake</span>
            <CreditCard className="w-4 h-4 text-indigo-600" />
          </div>
          <div>
            <p className="text-lg font-black text-slate-900">₹{activePlan.price.toLocaleString('en-IN')} / mo</p>
            <p className="text-[9px] text-slate-400">Next billing transaction: {simulatedUsage.nextBillingDate}</p>
          </div>
          <button 
            onClick={triggerSimulateCharge}
            className="w-full py-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 border border-slate-200 hover:border-indigo-200 text-slate-700 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 cursor-pointer transition uppercase"
          >
            <FileText className="w-3 h-3" /> Simulate & Print Invoice
          </button>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COMPONENT: Tenant Workspaces Directory */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-4.5 h-4.5 text-indigo-600" /> SaaS Multi-Tenant Clusters
              </h3>
              <p className="text-[10.5px] text-slate-400 mt-0.5">Define separate sandbox organization portals with unique system constraints.</p>
            </div>
            
            <button
              onClick={() => setIsAddingTenant(!isAddingTenant)}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-slate-900 text-white text-[10.5px] font-bold rounded-xl shadow-xs transition flex items-center gap-1 cursor-pointer select-none uppercase tracking-wider"
            >
              <Plus className="w-3.5 h-3.5" /> Workspace
            </button>
          </div>

          {/* New Tenant Provisioner Drawer */}
          {isAddingTenant && (
            <form onSubmit={handleAddTenant} className="p-5 bg-slate-50 border border-indigo-100 rounded-3xl space-y-4 animate-slideDown shadow-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <h4 className="text-[11px] font-black uppercase text-indigo-800 flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-indigo-600" /> Client Onboarding & Custom Domain Provisioner
                </h4>
                <button 
                  type="button" 
                  onClick={() => setIsAddingTenant(false)}
                  className="text-slate-450 hover:text-slate-700 p-0.5 rounded-full hover:bg-slate-200 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Client Profile Section */}
              <div className="bg-slate-100/50 p-3 rounded-2xl border border-slate-200/50 grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Client / Org Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Biotech Ltd"
                    value={newTenantName}
                    onChange={(e) => {
                      setNewTenantName(e.target.value);
                      // Auto populate subdomain fallback
                      setNewSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''));
                    }}
                    className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Primary Contact Person</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Satish Sharma"
                    value={contactName}
                    onChange={(e) => setContactName(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Client Executive Email</label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. contact@apexbiotech.com"
                    value={onboardEmail}
                    onChange={(e) => setOnboardEmail(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Administrator Password Setup</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. InitialSecureKey123"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold text-slate-800"
                  />
                </div>
              </div>

              {/* Network Domain Configuration & Mapping Router */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-[9.5px] font-black text-indigo-900 uppercase tracking-widest flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-indigo-500" /> Onboard Network Domain Option
                  </label>
                  <span className="text-[9px] text-slate-400 font-semibold">Choose portal address type</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setDomainProvider('expertcrm.in');
                    }}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                      domainProvider === 'expertcrm.in'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] font-black tracking-tight">expertcrm.in</span>
                    <span className={`text-[8px] uppercase tracking-wider font-extrabold ${domainProvider === 'expertcrm.in' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      Our Domain
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDomainProvider('expertaidtech.in');
                    }}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                      domainProvider === 'expertaidtech.in'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] font-black tracking-tight font-sans">expertaidtech.in</span>
                    <span className={`text-[8px] uppercase tracking-wider font-extrabold ${domainProvider === 'expertaidtech.in' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      Our Domain
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDomainProvider('custom');
                    }}
                    className={`p-2.5 rounded-xl border text-center cursor-pointer transition flex flex-col items-center justify-center gap-1 ${
                      domainProvider === 'custom'
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-[10px] font-black tracking-tight">Private Domain</span>
                    <span className={`text-[8px] uppercase tracking-wider font-extrabold ${domainProvider === 'custom' ? 'text-indigo-200' : 'text-slate-400'}`}>
                      CNAME Map
                    </span>
                  </button>
                </div>

                {domainProvider === 'custom' ? (
                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl space-y-2 animate-fadeIn">
                    <div className="space-y-1">
                      <label className="block text-[9px] font-black text-indigo-950 uppercase tracking-widest">Private Custom Domain (CNAME target)</label>
                      <input
                        type="text"
                        required
                        placeholder="crm.apexbiotech.com"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value.toLowerCase().trim())}
                        className="w-full text-xs p-2.5 bg-white border border-indigo-250 rounded-xl focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono font-bold text-indigo-950"
                      />
                    </div>
                    <div className="text-[8.5px] text-slate-500 font-medium leading-relaxed bg-white p-2 rounded-lg border border-slate-200">
                      <span className="font-extrabold text-indigo-900 uppercase">DNS Configure Step:</span> Create a CNAME record at your domain registrar pointing <code className="bg-indigo-50 text-indigo-700 px-1 rounded font-bold font-mono text-[8px]">{customDomain || 'custom-domain'}</code> to target cluster gateway alias: <strong className="font-mono text-indigo-950">gateway.expertaidtech.in</strong>. SSL certificates renew automatically within 15 minutes.
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-100 rounded-2xl space-y-2 animate-fadeIn">
                    <span className="block text-[9px] font-black text-emerald-800 uppercase tracking-widest flex items-center gap-1 font-sans">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Automated Portal Allocation
                    </span>
                    <div className="flex flex-col gap-1 bg-white p-2.5 rounded-xl border border-emerald-200/60">
                      <span className="text-[8.5px] text-slate-400 font-black uppercase tracking-widest">Dynamic Sandbox Address</span>
                      <strong className="font-mono text-[11px] text-emerald-950 truncate select-all">
                        https://{newSubdomain || '[auto-generated]'}.{domainProvider}
                      </strong>
                    </div>
                    <p className="text-[8.5px] text-emerald-650 font-medium leading-relaxed">
                      To ensure security standard namespace isolation, the tenant portal address will automatically map to your designated domain node above.
                    </p>
                  </div>
                )}
              </div>

              {/* Plan Selection list */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 col-span-2">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Select Plan Provision Quota & Seats</label>
                  <div className="grid grid-cols-3 gap-2 mt-1">
                    {SAAS_PLANS.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setNewPlan(p.id)}
                        className={`p-2.5 border rounded-xl text-left transition cursor-pointer flex flex-col justify-between ${
                          newPlan === p.id 
                            ? 'bg-indigo-50 border-indigo-400 shadow-xs' 
                            : 'bg-white border-slate-200 hover:bg-slate-55'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase text-indigo-900 block">{p.name}</span>
                        <span className="text-[9.5px] text-slate-500 mt-1 font-mono">₹{p.price.toLocaleString('en-IN')}/mo &bull; {p.seatsLimit} seats</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddingTenant(false)}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Configure Sandbox Database Node
                </button>
              </div>
            </form>
          )}

          {/* Tenants Grid list */}
          <div className="space-y-3">
            {tenants.map(t => {
              const worksPlan = SAAS_PLANS.find(p => p.id === t.planId) || SAAS_PLANS[0];
              const isSelected = activeWorkspace === t.name;

              return (
                <div 
                  key={t.id}
                  className={`p-4 border rounded-2xl transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                    isSelected 
                      ? 'bg-slate-50/70 border-indigo-500 ring-2 ring-indigo-500/15' 
                      : 'bg-white border-slate-180 hover:border-slate-300'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-indigo-600 animate-pulse' : 'bg-slate-300'}`}></span>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wide">{t.name}</h4>
                      {isSelected && (
                        <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 tracking-wider">
                          Active Selection
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[10px] text-slate-450 tracking-wide font-medium flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Portal Interface:</span>
                      <strong className="font-mono text-indigo-700 bg-indigo-50/40 px-1.5 py-0.5 rounded border border-indigo-100/60 select-all">
                        {t.domainProvider === 'custom' 
                          ? `https://${t.customDomain}` 
                          : `https://${t.subdomain}.${t.domainProvider || 'expertcrm.in'}`}
                      </strong>
                    </p>

                    {/* Client Onboarding Contact Metadata */}
                    {(t.clientContactName || t.clientOnboardEmail) && (
                      <div className="text-[9.5px] text-slate-500 flex flex-wrap items-center gap-x-2.5 gap-y-1 bg-slate-50 rounded-lg px-2.5 py-1.5 border border-slate-200/40 mt-1.5">
                        {t.clientContactName && (
                          <div className="flex items-center gap-1">
                            <span className="font-extrabold text-slate-600">Client Contact:</span>
                            <span className="font-semibold text-slate-700">{t.clientContactName}</span>
                          </div>
                        )}
                        {t.clientOnboardEmail && (
                          <div className="flex items-center gap-1">
                            <span className="text-slate-300 font-normal">|</span>
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span className="font-mono text-slate-600 font-semibold">{t.clientOnboardEmail}</span>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap gap-2 pt-1 font-mono text-[9px]">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                        PLAN: {worksPlan.name}
                      </span>
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-bold">
                        SEATS: {t.seatCount} / {worksPlan.seatsLimit} Active
                      </span>
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/65 font-bold px-2 py-0.5 rounded-md">
                        STATUS: {t.status}
                      </span>
                      {t.adminPassword && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200/60 font-bold px-2 py-0.5 rounded-md flex items-center gap-1 select-all font-mono" title="Administrative Access Password">
                          <Shield className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          <span>PASS: {t.adminPassword}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto shrink-0 justify-end">
                    {!isSelected ? (
                      <button
                        onClick={() => selectTenant(t)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-120 text-indigo-700 border border-indigo-200 rounded-xl text-[10px] font-extrabold uppercase tracking-wider cursor-pointer transition shadow-xs"
                      >
                        Enter Portal
                      </button>
                    ) : (
                      <div className="text-[10px] text-slate-400 font-bold bg-slate-150 px-2.5 py-1 rounded-xl">
                        Logged in Cluster
                      </div>
                    )}

                    <button
                      onClick={() => setEditingTenant(t)}
                      className="p-2 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition cursor-pointer"
                      title="Edit Tenant Details"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => deleteTenant(t.id, t.name)}
                      className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 border border-transparent hover:border-rose-100 transition cursor-pointer"
                      title="Decommission Tenant Domain Cluster"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* SLA Alert block */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-[10px] text-slate-500 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-amber-850">Multi-Tenancy Note:</span>
              <p className="text-slate-455 text-[9.5px] mt-0.5">Switching workspaces automatically updates database sandbox state configurations as well as individual tenant user-role profiles across all administration CRM tabs dynamically.</p>
            </div>
          </div>

        </div>

        {/* RIGHT COMPONENT: Interactive Subscription Level Selector */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-6">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Shield className="w-4.5 h-4.5 text-indigo-600" /> SaaS Billing Level Selector
            </h3>
            <p className="text-[10.5px] text-slate-400 mt-0.5">Scale resources, seats licenses, and query thresholds in real-time.</p>
          </div>

          <div className="space-y-4">
            {SAAS_PLANS.map(plan => {
              const isSelected = plan.id === currentPlanId;
              
              return (
                <div
                  key={plan.id}
                  onClick={() => {
                    onUpdatePlan(plan.id);
                    // Dynamically mock update our tenant workspace plan as well!
                    const updated = tenants.map(t => t.name === activeWorkspace ? { ...t, planId: plan.id } : t);
                    persistTenants(updated);
                    showToast(`SaaS level optimized to "${plan.name}"! Resource parameters adjusted.`, 'success');
                  }}
                  className={`p-4 border rounded-2xl text-left cursor-pointer transition relative overflow-hidden ${
                    isSelected 
                      ? 'bg-slate-50/70 border-indigo-500 ring-2 ring-indigo-500/15' 
                      : 'bg-white border-slate-180 hover:border-slate-350 hover:bg-slate-50/30'
                  }`}
                >
                  {/* Selected check */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 text-indigo-600">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded-md border ${plan.badge}`}>
                        {plan.id === 'free' ? 'Sandbox' : plan.id === 'pro' ? 'Corporate' : 'Custom Shield'}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">{plan.name}</h4>
                      <div className="flex items-baseline mt-1 gap-1">
                        <span className="text-md sm:text-xl font-black text-indigo-950">₹{plan.price.toLocaleString('en-IN')}</span>
                        <span className="text-[10px] text-slate-450 font-semibold">/ {plan.interval}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 border-t border-slate-100 pt-2.5">
                      {plan.features.map((feat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-[10px] text-slate-500">
                          <Check className="w-3 h-3 text-indigo-600 shrink-0" />
                          <span className="truncate">{feat}</span>
                        </div>
                      ))}
                    </div>

                    {isSelected && (
                      <div className="p-2 bg-indigo-50/60 rounded-xl text-[9px] text-indigo-750 font-black flex items-center gap-1">
                        <Sparkles className="w-3 h-3 shrink-0" /> Level Limits Enforced in All CRM Views
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick billing simulator logs list */}
          <div className="space-y-2 bg-slate-50 p-4 rounded-2xl border border-slate-180">
            <span className="text-[9px] font-black uppercase text-slate-450 tracking-wider">Simulated Invoicing Desk</span>
            <div className="space-y-1.5 text-[10px]">
              <div className="flex justify-between items-center text-slate-500 font-semibold font-mono">
                <span>Active Ledger ID:</span>
                <span className="text-slate-800 font-black uppercase">LDR-SAAS-2026-HQ</span>
              </div>
              <div className="flex justify-between items-center text-slate-500 font-semibold font-mono">
                <span>Total tenants cluster billing:</span>
                <span className="text-indigo-600 font-bold">
                  ₹{tenants.reduce((accum, ten) => {
                    const plan = SAAS_PLANS.find(p => p.id === ten.planId);
                    return accum + (plan?.price || 0);
                  }, 0).toLocaleString('en-IN')}/mo
                </span>
              </div>
            </div>
          </div>

          </div>
        </div>

      {/* Edit Tenant Modal Overlay */}
      {editingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full p-6 space-y-4 animate-scaleUp max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black uppercase text-slate-900 tracking-wider flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-indigo-600" /> Edit Tenant Details: {editingTenant.name}
              </h3>
              <button 
                type="button"
                onClick={() => setEditingTenant(null)}
                className="text-slate-400 hover:text-slate-700 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              // Update tenant in local state & persist
              const updated = tenants.map(t => t.id === editingTenant.id ? editingTenant : t);
              persistTenants(updated);
              
              // If active workspace changed its name, update it
              if (activeWorkspace === tenants.find(t => t.id === editingTenant.id)?.name) {
                onWorkspaceChange(editingTenant.name);
                onUpdatePlan(editingTenant.planId);
              }
              
              showToast(`Tenant "${editingTenant.name}" updated successfully!`, 'success');
              setEditingTenant(null);
            }} className="space-y-4 text-slate-800">
              
              {/* Core Profile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Client / Org Name</label>
                  <input
                    type="text"
                    required
                    value={editingTenant.name}
                    onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Subdomain (slug)</label>
                  <input
                    type="text"
                    required
                    value={editingTenant.subdomain}
                    onChange={(e) => setEditingTenant({ ...editingTenant, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '') })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Contact Person</label>
                  <input
                    type="text"
                    required
                    value={editingTenant.clientContactName || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, clientContactName: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Client Email</label>
                  <input
                    type="email"
                    required
                    value={editingTenant.clientOnboardEmail || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, clientOnboardEmail: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Admin Password</label>
                  <input
                    type="text"
                    required
                    value={editingTenant.adminPassword || ''}
                    onChange={(e) => setEditingTenant({ ...editingTenant, adminPassword: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-mono font-bold text-slate-800"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Active Seat Count</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={editingTenant.seatCount}
                    onChange={(e) => setEditingTenant({ ...editingTenant, seatCount: parseInt(e.target.value) || 1 })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold text-slate-800"
                  />
                </div>
              </div>

              {/* Subscription level and status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Subscription Plan</label>
                  <select
                    value={editingTenant.planId}
                    onChange={(e) => setEditingTenant({ ...editingTenant, planId: e.target.value })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-800"
                  >
                    {SAAS_PLANS.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (₹{p.price.toLocaleString('en-IN')}/mo)</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Tenant Status</label>
                  <select
                    value={editingTenant.status}
                    onChange={(e) => setEditingTenant({ ...editingTenant, status: e.target.value as any })}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-250 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-bold text-slate-800"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                    <option value="Trialing">Trialing</option>
                  </select>
                </div>
              </div>

              {/* Domain Provider and Mapping */}
              <div className="space-y-3 border-t border-slate-100 pt-3">
                <label className="block text-[9.5px] font-black text-slate-500 uppercase tracking-widest">Domain & DNS Setup</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['expertcrm.in', 'expertaidtech.in', 'custom'] as const).map(provider => (
                    <button
                      type="button"
                      key={provider}
                      onClick={() => setEditingTenant({ 
                        ...editingTenant, 
                        domainProvider: provider,
                        customDomain: provider === 'custom' ? (editingTenant.customDomain || `${editingTenant.subdomain}.custom-mapped.in`) : undefined
                      })}
                      className={`p-2 rounded-xl border text-center cursor-pointer text-[10px] font-extrabold transition flex flex-col justify-center items-center gap-1 ${
                        editingTenant.domainProvider === provider
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-white border-slate-250 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span>{provider}</span>
                    </button>
                  ))}
                </div>

                {editingTenant.domainProvider === 'custom' && (
                  <div className="space-y-1 pt-1.5 animate-fadeIn">
                    <label className="block text-[9px] font-black text-indigo-950 uppercase tracking-widest">Private Custom Domain (CNAME target)</label>
                    <input
                      type="text"
                      required
                      placeholder="crm.clientdomain.com"
                      value={editingTenant.customDomain || ''}
                      onChange={(e) => setEditingTenant({ ...editingTenant, customDomain: e.target.value.toLowerCase().trim() })}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-indigo-250 rounded-xl focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono font-bold text-indigo-950"
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingTenant(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition cursor-pointer"
                >
                  Save Tenant Configuration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
