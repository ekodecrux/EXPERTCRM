import React, { useState, useEffect } from 'react';
import { 
  Plus, Search, Filter, CircleDollarSign, Loader2, Sparkles, 
  TrendingUp, HelpCircle, Mail, Phone, Building, ArrowRight, CheckCircle2,
  Calendar, FileText, Printer, Trash2, X, Send, ArrowUpRight, UserCheck,
  AlertCircle, Clock, CreditCard, MessageSquare, BookOpen, ChevronRight, Check
} from 'lucide-react';
import { Lead } from '../types';

interface LeadsManagerProps {
  leads: Lead[];
  onAddLead: (lead: Omit<Lead, 'id' | 'dateAdded'>) => void;
  onUpdateLeadStatus: (id: string, newStatus: Lead['status']) => void;
}

// Sub-tabs representing major modules
type SubTab = 'pipeline' | 'billing' | 'forecast_support';

export default function LeadsManager({ leads, onAddLead, onUpdateLeadStatus }: LeadsManagerProps) {
  const [activeTab, setActiveTab] = useState<SubTab>('pipeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSourceFilter, setSelectedSourceFilter] = useState<string>('All');
  const [activeView, setActiveView] = useState<'kanban' | 'list'>('kanban');

  // --- LOCAL PERSISTENCE FOR COMPLEX CRM ARTIFACTS ---
  const [extraMeta, setExtraMeta] = useState<Record<string, {
    assignedTo?: string;
    opportunityTier?: 'Hot' | 'Warm' | 'Cold';
    dealType?: string;
    contractDuration?: string;
    followUpDate?: string;
  }>>(() => {
    const saved = localStorage.getItem('crm_leads_extra_meta');
    if (saved) return JSON.parse(saved);
    return {
      'L-101': { assignedTo: 'Agent Aman', opportunityTier: 'Warm', dealType: 'Monthly SaaS Subscription', contractDuration: '12 Months', followUpDate: '2026-06-18' },
      'L-102': { assignedTo: 'Agent Rajesh', opportunityTier: 'Cold', dealType: 'Annual Retainer', contractDuration: '24 Months', followUpDate: '2026-06-20' },
      'L-103': { assignedTo: 'Agent Pooja', opportunityTier: 'Hot', dealType: 'Dedicated SDK License', contractDuration: '6 Months', followUpDate: '2026-06-19' },
      'L-104': { assignedTo: 'Agent Vikram', opportunityTier: 'Hot', dealType: 'Dedicated SDK License', contractDuration: '36 Months', followUpDate: '2026-06-17' },
    };
  });



  const [quotations, setQuotations] = useState<{
    id: string;
    leadId: string;
    clientName: string;
    companyName: string;
    items: { desc: string; qty: number; cost: number; total: number }[];
    discountPct: number;
    taxPct: number;
    subtotal: number;
    total: number;
    status: 'Draft' | 'Sent' | 'Accepted' | 'Declined';
    dateCreated: string;
  }[]>(() => {
    const saved = localStorage.getItem('crm_leads_quotations');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'QT-801',
        leadId: 'L-103',
        clientName: 'David Miller',
        companyName: 'Quantum Tech Inc',
        items: [
          { desc: 'Enterprise CRM Module Core', qty: 1, cost: 150000, total: 150000 },
          { desc: 'Premium API Gateway Router integration', qty: 1, cost: 25000, total: 25000 }
        ],
        discountPct: 5,
        taxPct: 18,
        subtotal: 175000,
        total: 196350,
        status: 'Sent',
        dateCreated: '2026-06-13'
      },
      {
        id: 'QT-802',
        leadId: 'L-104',
        clientName: 'Amit Patel',
        companyName: 'Hindustan Logistics',
        items: [
          { desc: 'Enterprise Unlimited Cloud SDK', qty: 1, cost: 320000, total: 320000 }
        ],
        discountPct: 10,
        taxPct: 18,
        subtotal: 320000,
        total: 340240,
        status: 'Accepted',
        dateCreated: '2026-06-11'
      }
    ];
  });

  const [invoices, setInvoices] = useState<{
    id: string;
    quoteId: string;
    clientName: string;
    companyName: string;
    subtotal: number;
    totalAmount: number;
    taxAmount: number;
    discountAmount: number;
    status: 'Paid' | 'Unpaid' | 'Overdue';
    dateIssued: string;
    dueDate: string;
  }[]>(() => {
    const saved = localStorage.getItem('crm_leads_invoices');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'INV-901', quoteId: 'QT-802', clientName: 'Amit Patel', companyName: 'Hindustan Logistics', subtotal: 320000, totalAmount: 340240, taxAmount: 51840, discountAmount: 32000, status: 'Paid', dateIssued: '2026-06-11', dueDate: '2026-07-11' }
    ];
  });

  const [supportTickets, setSupportTickets] = useState<{
    id: string;
    clientName: string;
    subject: string;
    description: string;
    status: 'Open' | 'In Progress' | 'Resolved';
    priority: 'High' | 'Medium' | 'Low';
    createdTime: string;
  }[]>(() => {
    const saved = localStorage.getItem('crm_leads_tickets');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'STK-501', clientName: 'Amit Patel', subject: 'Inbound Webhook API Disruption', description: 'The developer sandbox is experiencing standard timeout loops when loading larger API logs.', status: 'Open', priority: 'High', createdTime: '2026-06-16T14:24' }
    ];
  });

  // Keep states in sync with localStorage
  useEffect(() => {
    localStorage.setItem('crm_leads_extra_meta', JSON.stringify(extraMeta));
  }, [extraMeta]);

  useEffect(() => {
    localStorage.setItem('crm_leads_quotations', JSON.stringify(quotations));
  }, [quotations]);
  useEffect(() => {
    localStorage.setItem('crm_leads_invoices', JSON.stringify(invoices));
  }, [invoices]);
  useEffect(() => {
    localStorage.setItem('crm_leads_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);

  // AI Insights State
  const [analyzingLeadId, setAnalyzingLeadId] = useState<string | null>(null);
  const [inspectedLeadInsight, setInspectedLeadInsight] = useState<{
    id: string;
    pitch: string;
    closeProbability: number;
    recommendedAction: string;
    sentiment: string;
  } | null>(null);

  // Forms state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formName, setFormName] = useState('');
  const [formCompany, setFormCompany] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formValue, setFormValue] = useState('100000');
  const [formStatus, setFormStatus] = useState<Lead['status']>('New Leads');
  const [formSource, setFormSource] = useState<Lead['source']>('Website');
  const [formNotes, setFormNotes] = useState('');
  const [formAssignedTo, setFormAssignedTo] = useState('Agent Aman');
  const [formTier, setFormTier] = useState<'Hot' | 'Warm' | 'Cold'>('Warm');
  const [formDealType, setFormDealType] = useState('Monthly SaaS Subscription');

  // Quotation Creator State
  const [isQuoteCreatorOpen, setIsQuoteCreatorOpen] = useState(false);
  const [qSelectedLeadId, setQSelectedLeadId] = useState('');
  const [qItems, setQItems] = useState<{ desc: string; qty: number; cost: number }[]>([
    { desc: 'CRM license access - Standard Package', qty: 1, cost: 75000 }
  ]);
  const [qDiscount, setQDiscount] = useState(5);



  // Support Ticket Form State
  const [isTicketFormOpen, setIsTicketFormOpen] = useState(false);
  const [tClientName, setTClientName] = useState('');
  const [tSubject, setTSubject] = useState('');
  const [tDesc, setTDesc] = useState('');
  const [tPriority, setTPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  // Invoice view print panel
  const [viewingInvoice, setViewingInvoice] = useState<typeof invoices[0] | null>(null);

  // --- STATS / CALCULATIONS ---
  const stages: Lead['status'][] = ['New Leads', 'Qualification', 'Proposal', 'Negotiation', 'Won'];
  const reps = ['Agent Aman', 'Agent Rajesh', 'Agent Pooja', 'Agent Vikram'];

  // --- ACTIONS ---
  const handleCreateLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName) return;
    onAddLead({
      name: formName,
      company: formCompany,
      email: formEmail,
      phone: formPhone,
      status: formStatus,
      value: Number(formValue) || 100000,
      source: formSource,
      notes: formNotes
    });

    // Save metadata locally
    const lastId = `L-${100 + leads.length + 1}`;
    setExtraMeta(prev => ({
      ...prev,
      [lastId]: {
        assignedTo: formAssignedTo,
        opportunityTier: formTier,
        dealType: formDealType,
        contractDuration: '12 Months',
        followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString().split('T')[0]
      }
    }));

    // Reset Form
    setFormName(''); setFormCompany(''); setFormEmail(''); setFormPhone('');
    setFormValue('100000'); setFormStatus('New Leads'); setFormSource('Website'); setFormNotes('');
    setIsFormOpen(false);
  };

  // WEBHOOK CAPTURE SIMULATOR
  const triggerMockWebhookCapture = () => {
    const targetNames = ['Vikram Aggarwal', 'Deepika Roy', 'Saurabh Nair', 'Naveen Jindal', 'Kavitha Rao'];
    const targetCompanies = ['Himalaya Ventures', 'Bharat Telecom', 'Deccan Logistics', 'Ganges Infrastructure', 'Sterling Paints'];
    const targetSources: Lead['source'][] = ['Website', 'Referral', 'Social Media', 'Walk-in', 'Calling'];
    const targetNotes = [
      'Requested pricing quotes for scalable user nodes.',
      'Inbound hook: wants API configuration documentation.',
      'Registered through the quick webinar registration page.',
      'Seeks multi-user roles alignment specifications.'
    ];

    const randomName = targetNames[Math.floor(Math.random() * targetNames.length)];
    const randomCompany = targetCompanies[Math.floor(Math.random() * targetCompanies.length)];
    const randomSource = targetSources[Math.floor(Math.random() * targetSources.length)];
    const randomNote = targetNotes[Math.floor(Math.random() * targetNotes.length)];
    const randomValue = Math.floor(Math.random() * 200) * 2000 + 50000;

    onAddLead({
      name: randomName,
      company: randomCompany,
      email: `${randomName.toLowerCase().replace(' ', '')}@example.in`,
      phone: `9${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: 'New Leads',
      value: randomValue,
      source: randomSource,
      notes: randomNote
    });

    const nextId = `L-${100 + leads.length + 1}`;
    const randomRep = reps[Math.floor(Math.random() * reps.length)];
    setExtraMeta(prev => ({
      ...prev,
      [nextId]: {
        assignedTo: randomRep,
        opportunityTier: 'Warm',
        dealType: 'Monthly SaaS Subscription',
        contractDuration: '12 Months',
        followUpDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0]
      }
    }));
  };

  // Convert Lead To Customer Trigger (Immediate upgrade to 'Won')
  const handleConvertToCustomer = (leadId: string) => {
    onUpdateLeadStatus(leadId, 'Won');
    setExtraMeta(prev => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        opportunityTier: 'Hot'
      }
    }));
  };

  // CRM metadata change helper
  const updateLeadMetadata = (leadId: string, updates: Partial<typeof extraMeta[string]>) => {
    setExtraMeta(prev => ({
      ...prev,
      [leadId]: { ...prev[leadId], ...updates }
    }));
  };

  // Create Quotation Handler
  const handleCreateQuotation = (e: React.FormEvent) => {
    e.preventDefault();
    const targetedLead = leads.find(l => l.id === qSelectedLeadId);
    if (!targetedLead) return;

    const subtotal = qItems.reduce((acc, current) => acc + (current.qty * current.cost), 0);
    const taxAmt = Math.round((subtotal * (100 - qDiscount)) / 100 * 0.18);
    const total = Math.round(subtotal * ((100 - qDiscount) / 100) + taxAmt);

    const newQuote = {
      id: `QT-${800 + quotations.length + 1}`,
      leadId: targetedLead.id,
      clientName: targetedLead.name,
      companyName: targetedLead.company || 'Private Corporation',
      items: qItems.map(qi => ({ ...qi, total: qi.qty * qi.cost })),
      discountPct: qDiscount,
      taxPct: 18,
      subtotal,
      total,
      status: 'Draft' as const,
      dateCreated: new Date().toISOString().split('T')[0]
    };

    setQuotations(prev => [newQuote, ...prev]);
    setIsQuoteCreatorOpen(false);
    // Reset qItems
    setQItems([{ desc: 'CRM license access - Standard Package', qty: 1, cost: 75000 }]);
  };

  // Accept Quote and Auto Generate Invoice
  const handleAcceptQuotation = (quoteId: string) => {
    setQuotations(prev => prev.map(q => q.id === quoteId ? { ...q, status: 'Accepted' as const } : q));
    const targetQuote = quotations.find(q => q.id === quoteId);
    if (targetQuote) {
      const discountAmt = Math.round((targetQuote.subtotal * targetQuote.discountPct) / 100);
      const taxAmt = Math.round((targetQuote.subtotal - discountAmt) * (targetQuote.taxPct / 100));
      
      const newInvoice = {
        id: `INV-${900 + invoices.length + 1}`,
        quoteId: targetQuote.id,
        clientName: targetQuote.clientName,
        companyName: targetQuote.companyName,
        subtotal: targetQuote.subtotal,
        totalAmount: targetQuote.total,
        taxAmount: taxAmt,
        discountAmount: discountAmt,
        status: 'Unpaid' as const,
        dateIssued: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0]
      };

      setInvoices(prev => [newInvoice, ...prev]);
      onUpdateLeadStatus(targetQuote.leadId, 'Won');
    }
  };



  // Create local support ticket for Lead
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tClientName || !tSubject) return;

    const newTicket = {
      id: `STK-${500 + supportTickets.length + 1}`,
      clientName: tClientName,
      subject: tSubject,
      description: tDesc,
      status: 'Open' as const,
      priority: tPriority,
      createdTime: new Date().toISOString().substring(0, 16)
    };

    setSupportTickets(prev => [newTicket, ...prev]);
    setTClientName(''); setTSubject(''); setTDesc('');
    setIsTicketFormOpen(false);
  };

  // Generate AI Lead Insights from server API
  const generateAIInsight = async (lead: Lead) => {
    setAnalyzingLeadId(lead.id);
    setInspectedLeadInsight(null);

    try {
      const response = await fetch('/api/lead-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lead),
      });

      if (!response.ok) throw new Error('Insight endpoint reported an error');
      const insightData = await response.json();
      setInspectedLeadInsight({
        id: lead.id,
        ...insightData
      });
    } catch (err) {
      console.error(err);
      setInspectedLeadInsight({
        id: lead.id,
        pitch: `Introduce multi-license cloud specs for standard package. Offer standard demo for ${lead.company}.`,
        closeProbability: 40,
        recommendedAction: "Arrange real-time tech demo or feature checklist verification.",
        sentiment: "Steady client evaluation."
      });
    } finally {
      setAnalyzingLeadId(null);
    }
  };

  // --- FILTERS & TRIMS ---
  const filteredLeads = leads.filter(lead => {
    const matchesSearch = 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesSource = selectedSourceFilter === 'All' || lead.source === selectedSourceFilter;
    return matchesSearch && matchesSource;
  });

  // Forecasting calculator weighted sums
  const getProbabilityPct = (tier?: string) => {
    if (tier === 'Hot') return 90;
    if (tier === 'Warm') return 55;
    return 15;
  };

  const expectedTotalValue = filteredLeads.reduce((acc, lead) => {
    const meta = extraMeta[lead.id];
    const probPct = getProbabilityPct(meta?.opportunityTier);
    return acc + Math.round((lead.value * probPct) / 100);
  }, 0);

  const rawPipelineTotalValue = filteredLeads.reduce((acc, lead) => acc + lead.value, 0);

  return (
    <div id="leads-manager-view" className="space-y-4">
      
      {/* 15 Features Top Title Hero Bar */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-4 rounded border border-indigo-950 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-widest text-indigo-400">Leads & Sales Funnel Desk</h1>
          <p className="text-[11px] text-slate-300 mt-1 max-w-2xl leading-relaxed">
            All-in-one corporate pipeline suite: Manage live leads, quotations dispatch, invoice billing pipelines, 
            opportunity tags, staff assignments, reminders schedules, and support ticketing.
          </p>
        </div>

        <button 
          onClick={triggerMockWebhookCapture}
          className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[11px] font-bold flex items-center gap-1.5 transition whitespace-nowrap border border-indigo-500 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
          Simulate Hook Capture
        </button>
      </div>

      {/* Corporate Tab Selector Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-1.5">
        <button
          onClick={() => setActiveTab('pipeline')}
          className={`px-3 py-2 rounded text-xs font-bold border transition duration-150 flex items-center justify-center gap-1.5 ${
            activeTab === 'pipeline' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Pipeline Sandbox
        </button>

        <button
          onClick={() => setActiveTab('billing')}
          className={`px-3 py-2 rounded text-xs font-bold border transition duration-150 flex items-center justify-center gap-1.5 ${
            activeTab === 'billing' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <FileText className="w-4 h-4" /> Quotes & Invoices
        </button>
        <button
          onClick={() => setActiveTab('forecast_support')}
          className={`px-3 py-2 rounded text-xs font-bold border transition duration-150 flex items-center justify-center gap-1.5 ${
            activeTab === 'forecast_support' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
          }`}
        >
          <MessageSquare className="w-4 h-4" /> Forecasts & Support
        </button>
      </div>

      {/* --- FILTER CONTROL FOR LEADS VIEWS --- */}
      {activeTab === 'pipeline' && (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 bg-white p-2 rounded border border-slate-200">
          <div className="md:col-span-6 relative">
            <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Query name, brand, or email..."
              className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 rounded bg-slate-50 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-1 border border-slate-200 rounded px-1.5 bg-slate-50">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select 
              className="w-full text-xs bg-transparent border-none p-1 focus:outline-none"
              value={selectedSourceFilter}
              onChange={(e) => setSelectedSourceFilter(e.target.value)}
            >
              <option value="All">All Inflow Sources</option>
              <option value="Website">Website Form</option>
              <option value="Referral">Partner Referral</option>
              <option value="Social Media">LinkedIn Campaign</option>
              <option value="Walk-in">Walk-in Demo</option>
              <option value="Calling">Outbound Calling / Telephony</option>
              <option value="Others">Other Traffic</option>
            </select>
          </div>

          <div className="md:col-span-3 flex gap-1">
            <button
              onClick={() => setActiveView('kanban')}
              className={`flex-1 text-[11px] font-semibold py-1 rounded border transition ${
                activeView === 'kanban' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              Kanban
            </button>
            <button
              onClick={() => setActiveView('list')}
              className={`flex-1 text-[11px] font-semibold py-1 rounded border transition ${
                activeView === 'list' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white border-slate-200'
              }`}
            >
              Spreadsheet
            </button>
            <button
              onClick={() => setIsFormOpen(true)}
              className="px-2.5 bg-indigo-600 text-white rounded text-[11px] font-bold border border-indigo-700 flex items-center justify-center hover:bg-indigo-750"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ==================== TAB 1: PIPELINE SANDBOX ==================== */}
      {activeTab === 'pipeline' && (
        <div className="space-y-4">
          
          {/* Conversion Metric Bar */}
          <div className="bg-white p-3 rounded border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Deals Size</span>
              <h4 className="text-sm font-extrabold text-slate-800 mt-0.5">₹{rawPipelineTotalValue.toLocaleString('en-IN')}</h4>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Conversion Rate (Won)</span>
              <h4 className="text-sm font-extrabold text-[#10b981] mt-0.5">
                {Math.round((leads.filter(l => l.status === 'Won').length / Math.max(1, leads.length)) * 100)}%
              </h4>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Qualified Pipeline Size</span>
              <h4 className="text-sm font-extrabold text-slate-800 mt-0.5">
                ₹{leads.filter(l => l.status !== 'New Leads' && l.status !== 'Won').reduce((acc, l) => acc + l.value, 0).toLocaleString('en-IN')}
              </h4>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Contacts Saved</span>
              <h4 className="text-sm font-extrabold text-slate-800 mt-0.5">{leads.length} Entities</h4>
            </div>
          </div>

          {activeView === 'kanban' ? (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-2.5 overflow-x-auto pb-2">
              {stages.map(stage => {
                const stageLeads = filteredLeads.filter(lead => lead.status === stage);
                const stageSum = stageLeads.reduce((acc, l) => acc + l.value, 0);

                return (
                  <div key={stage} className="bg-slate-50 p-2 rounded border border-slate-205 min-w-[210px] flex flex-col h-[520px]">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1">
                        <span className={`w-2 h-2 rounded-full ${
                          stage === 'New Leads' ? 'bg-indigo-500' :
                          stage === 'Qualification' ? 'bg-amber-400' :
                          stage === 'Proposal' ? 'bg-blue-500' :
                          stage === 'Negotiation' ? 'bg-purple-500' : 'bg-emerald-500'
                        }`} />
                        <h3 className="text-[11px] font-bold text-slate-800 truncate">{stage}</h3>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 bg-slate-200/60 px-1.5 rounded">{stageLeads.length}</span>
                    </div>

                    <div className="bg-white rounded p-1 border border-slate-200 text-[9.5px] text-slate-500 flex justify-between mb-2">
                      <span>Deal Value:</span>
                      <span className="font-bold text-slate-800">₹{stageSum.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2 pr-0.5">
                      {stageLeads.length === 0 ? (
                        <div className="h-16 border border-dashed border-slate-200 rounded flex flex-col items-center justify-center text-slate-400">
                          <HelpCircle className="w-3.5 h-3.5 opacity-50 mb-0.5" />
                          <span className="text-[9px]">Empty Stage</span>
                        </div>
                      ) : (
                        stageLeads.map(lead => {
                          const meta = extraMeta[lead.id];
                          return (
                            <div key={lead.id} className="bg-white p-2 rounded border border-slate-200 hover:border-slate-300 shadow-none transition space-y-1 relative">
                              <div className="flex justify-between items-start">
                                <span className={`text-[8px] font-bold px-1 rounded ${
                                  meta?.opportunityTier === 'Hot' ? 'bg-red-100 text-red-700' :
                                  meta?.opportunityTier === 'Warm' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
                                }`}>
                                  {meta?.opportunityTier || 'Warm'}
                                </span>
                                <span className="text-[8px] font-bold text-slate-500 bg-slate-100 px-1 py-0.2 rounded uppercase">
                                  {lead.source}
                                </span>
                              </div>

                              <h4 className="text-[11px] font-semibold text-slate-900 truncate mt-1">{lead.name}</h4>
                              <p className="text-[9.5px] text-slate-400 truncate">{lead.company}</p>

                              <div className="text-[9.5px] text-slate-400 flex items-center gap-1 border-t border-slate-100 pt-1">
                                <UserCheck className="w-3 h-3 text-indigo-400" />
                                <span className="truncate">{meta?.assignedTo || 'Unassigned'}</span>
                              </div>

                              <div className="flex justify-between items-center mt-1">
                                <span className="text-[11px] font-bold text-indigo-650">₹{lead.value.toLocaleString('en-IN')}</span>
                                <div className="flex gap-1">
                                  <button 
                                    onClick={() => {
                                      if ((window as any).__triggerGlobalPrint) {
                                        (window as any).__triggerGlobalPrint(
                                          `Lead Record: ${lead.name}`, 
                                          'lead_profile', 
                                          {
                                            ...lead,
                                            aiInsight: lead.aiInsight || {
                                              closeProbability: meta?.opportunityTier === 'Hot' ? 85 : meta?.opportunityTier === 'Cold' ? 20 : 55,
                                              sentiment: "Stable Evaluation",
                                              pitch: "Standard SaaS spec proposal presentation strategy.",
                                              recommendedAction: "Arrange real-time contact or quote demo."
                                            }
                                          }
                                        );
                                      }
                                    }}
                                    className="p-0.5 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 text-slate-500"
                                    title="Print / Copy Record"
                                  >
                                    <Printer className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if ((window as any).__triggerGlobalDial) {
                                        (window as any).__triggerGlobalDial(lead.phone, lead.name);
                                      }
                                    }}
                                    className="p-0.5 bg-indigo-50 border border-indigo-200 rounded hover:bg-indigo-100 text-indigo-600"
                                    title="Dial Lead via WebRTC Proxy"
                                  >
                                    <Phone className="w-3 h-3" />
                                  </button>
                                  <button 
                                    onClick={() => generateAIInsight(lead)} 
                                    className="p-0.5 bg-slate-50 border border-slate-200 rounded hover:bg-indigo-50"
                                    title="AI Sales Insight"
                                  >
                                    <Sparkles className="w-3 h-3 text-indigo-505" />
                                  </button>
                                  {lead.status !== 'Won' && (
                                    <button 
                                      onClick={() => handleConvertToCustomer(lead.id)}
                                      className="p-0.5 bg-emerald-50 border border-emerald-200 rounded hover:bg-emerald-100"
                                      title="Convert to Customer"
                                    >
                                      <Check className="w-3 h-3 text-emerald-600" />
                                    </button>
                                  )}
                                  {stage !== 'Won' && (
                                    <button
                                      onClick={() => {
                                        const idx = stages.indexOf(stage);
                                        onUpdateLeadStatus(lead.id, stages[idx + 1]);
                                      }}
                                      className="p-0.5 bg-slate-100 rounded hover:bg-slate-200"
                                    >
                                      <ArrowRight className="w-3 h-3 text-slate-600" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            // SPREADSHEET TABULAR MODE
            <div className="bg-white rounded border border-slate-200 overflow-hidden">
              <table className="w-full text-left text-slate-600 text-[11px]">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-200 uppercase tracking-wider text-[9px] font-bold">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Name & Company</th>
                    <th className="px-3 py-2">Communications Info</th>
                    <th className="px-3 py-2">Rep Assignment</th>
                    <th className="px-3 py-2">Interest Rating</th>
                    <th className="px-3 py-2">Stage Status</th>
                    <th className="px-3 py-2">Value</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {filteredLeads.map(lead => {
                    const meta = extraMeta[lead.id];
                    return (
                      <tr key={lead.id} className="hover:bg-slate-50 transition">
                        <td className="px-3 py-2 font-mono font-bold text-slate-400 text-[10px]">{lead.id}</td>
                        <td className="px-3 py-2">
                          <h4 className="font-bold text-slate-900 text-[11px]">{lead.name}</h4>
                          <span className="text-slate-400 text-[9.5px]">{lead.company}</span>
                        </td>
                        <td className="px-3 py-2">
                          <div className="text-[10px] text-slate-600 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-300" /> {lead.email || 'N/A'}
                          </div>
                          <button 
                            onClick={() => {
                              if ((window as any).__triggerGlobalDial) {
                                (window as any).__triggerGlobalDial(lead.phone, lead.name);
                              }
                            }}
                            className="text-[10px] text-indigo-650 hover:text-indigo-800 hover:underline flex items-center gap-1 cursor-pointer font-semibold bg-transparent border-none p-0 mt-0.5 text-left"
                            title="Dial this lead immediately"
                          >
                            <Phone className="w-3 h-3 text-indigo-500 shrink-0" /> {lead.phone || 'N/A'}
                          </button>
                        </td>
                        <td className="px-3 py-2">
                          <select 
                            className="bg-slate-50 text-[10px] border border-slate-200 p-0.5 rounded focus:outline-none"
                            value={meta?.assignedTo || 'Unassigned'}
                            onChange={(e) => updateLeadMetadata(lead.id, { assignedTo: e.target.value })}
                          >
                            <option value="">Unassigned</option>
                            {reps.map(rep => (
                              <option key={rep} value={rep}>{rep}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select 
                            className="bg-slate-50 text-[10px] border border-slate-200 p-0.5 rounded focus:outline-none font-semibold"
                            value={meta?.opportunityTier || 'Warm'}
                            onChange={(e) => updateLeadMetadata(lead.id, { opportunityTier: e.target.value as any })}
                          >
                            <option value="Hot">🔥 Hot</option>
                            <option value="Warm">⚡ Warm</option>
                            <option value="Cold">❄️ Cold</option>
                          </select>
                        </td>
                        <td className="px-3 py-2">
                          <select 
                            className="bg-slate-50 text-[10px] border border-slate-200 p-0.5 rounded focus:outline-none"
                            value={lead.status}
                            onChange={(e) => onUpdateLeadStatus(lead.id, e.target.value as Lead['status'])}
                          >
                            {stages.map(stg => (
                              <option key={stg} value={stg}>{stg}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-2 font-bold text-indigo-650">₹{lead.value.toLocaleString('en-IN')}</td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-1">
                            <button 
                              onClick={() => {
                                if ((window as any).__triggerGlobalPrint) {
                                  (window as any).__triggerGlobalPrint(
                                    `Lead Record: ${lead.name}`, 
                                    'lead_profile', 
                                    {
                                      ...lead,
                                      aiInsight: lead.aiInsight || {
                                        closeProbability: meta?.opportunityTier === 'Hot' ? 85 : meta?.opportunityTier === 'Cold' ? 20 : 55,
                                        sentiment: "Stable Evaluation",
                                        pitch: "Standard SaaS spec proposal presentation strategy.",
                                        recommendedAction: "Arrange real-time contact or quote demo."
                                      }
                                    }
                                  );
                                }
                              }}
                              className="px-2 py-0.5 text-[9px] font-bold text-slate-650 bg-slate-50 border border-slate-200 rounded hover:bg-slate-100 flex items-center gap-0.5"
                              title="Print Roster Copy"
                            >
                              <Printer className="w-3 h-3" /> Print
                            </button>
                            <button 
                              onClick={() => generateAIInsight(lead)}
                              className="px-2 py-0.5 text-[9px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-150 rounded"
                            >
                              AI Insight
                            </button>
                            {lead.status !== 'Won' && (
                              <button 
                                onClick={() => handleConvertToCustomer(lead.id)}
                                className="px-2 py-0.5 text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-150 rounded"
                              >
                                Convert
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
          )}
            </div>
      )}

      {/* ==================== TAB 3: BILLING CODES (QUOTATIONS & INVOICES) ==================== */}
      {activeTab === 'billing' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Quotes Creator & Tracker */}
          <div className="lg:col-span-6 bg-white p-3 rounded border border-slate-200 space-y-3">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <FileText className="w-4 h-4 text-indigo-600" />
                Quotation Dispatch Desk
              </h3>
              <button 
                onClick={() => setIsQuoteCreatorOpen(true)}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Compose Quote
              </button>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {quotations.map(quote => (
                <div key={quote.id} className="p-3 bg-slate-50 border border-slate-200 rounded relative space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9.5px] font-mono font-bold text-slate-400">{quote.id}</span>
                      <h4 className="text-xs font-black text-slate-800">{quote.clientName}</h4>
                      <p className="text-[10px] text-slate-400 uppercase font-medium">{quote.companyName}</p>
                    </div>

                    <span className={`text-[8.5px] font-bold uppercase px-1.5 rounded ${
                      quote.status === 'Accepted' ? 'bg-emerald-100 text-emerald-800' :
                      quote.status === 'Sent' ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {quote.status}
                    </span>
                  </div>

                  <div className="bg-white p-1.5 rounded border text-[9.5px] text-slate-600">
                    <table className="w-full">
                      <thead>
                        <tr className="text-slate-400 text-[8.5px] border-b">
                          <th>Item</th>
                          <th className="text-center">Qty</th>
                          <th className="text-right font-normal">Cost</th>
                        </tr>
                      </thead>
                      <tbody>
                        {quote.items.map((item, idx) => (
                          <tr key={idx} className="border-b border-slate-50">
                            <td>{item.desc}</td>
                            <td className="text-center font-bold">{item.qty}</td>
                            <td className="text-right">₹{item.cost.toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-between items-center text-[10px] pt-1">
                    <span className="text-slate-400">Subtotal: <span className="text-slate-600">₹{quote.subtotal.toLocaleString('en-IN')}</span></span>
                    <span className="text-slate-400">Discount: <span className="text-slate-600">{quote.discountPct}%</span></span>
                    <span className="font-bold text-indigo-750">Net Total: ₹{quote.total.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex justify-end gap-1.5">
                    {quote.status === 'Sent' && (
                      <>
                        <button 
                          onClick={() => handleAcceptQuotation(quote.id)}
                          className="px-2 py-0.5 bg-emerald-600 text-white font-bold text-[9px] rounded uppercase hover:bg-emerald-750"
                        >
                          Accept & Bill
                        </button>
                        <button 
                          onClick={() => setQuotations(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'Declined' as const } : q))}
                          className="px-2 py-0.5 bg-red-150 text-red-700 font-bold text-[9px] rounded uppercase hover:bg-red-200"
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {quote.status === 'Draft' && (
                      <button 
                        onClick={() => setQuotations(prev => prev.map(q => q.id === quote.id ? { ...q, status: 'Sent' as const } : q))}
                        className="px-2 py-0.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-150 font-bold text-[9px] rounded uppercase flex items-center gap-1"
                      >
                        <Send className="w-3 h-3" /> Send Quote
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        if ((window as any).__triggerGlobalPrint) {
                          (window as any).__triggerGlobalPrint(
                            `Corporate Quotation ${quote.id}`, 
                            'quotation', 
                            {
                              id: quote.id,
                              leadName: quote.clientName,
                              itemName: quote.items.map(i => `${i.desc} (x${i.qty})`).join(', '),
                              rawPrice: quote.subtotal,
                              discountPrice: (quote.subtotal * quote.discountPct / 100),
                              netPrice: quote.total
                            }
                          );
                        }
                      }}
                      className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[9px] rounded uppercase flex items-center gap-1 border border-slate-250 transition"
                      title="Print Quotation Copy"
                    >
                      <Printer className="w-3 h-3" /> Print Copy
                    </button>
                    <span className="text-[9px] text-slate-400 mr-auto self-center">Created: {quote.dateCreated}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Invoices Vault */}
          <div className="lg:col-span-6 bg-white p-3 rounded border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1 border-b pb-2">
              <CreditCard className="w-4 h-4 text-emerald-600" />
              Invoices Vault & General Ledger
            </h3>

            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {invoices.map(inv => (
                <div key={inv.id} className="p-3 bg-slate-50 border border-slate-200 rounded relative flex flex-col justify-between gap-1">
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="font-mono text-slate-400 font-bold">{inv.id} (Quote Ref {inv.quoteId})</span>
                    <span className={`text-[8.5px] font-bold px-1.5 rounded ${
                      inv.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {inv.status}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{inv.clientName}</h4>
                    <p className="text-[10px] text-slate-500 font-bold uppercase">{inv.companyName}</p>
                    <p className="text-[9.5px] text-slate-400">Due timeline: {inv.dueDate}</p>
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span className="text-xs font-extrabold text-slate-800">Net: ₹{inv.totalAmount.toLocaleString('en-IN')}</span>
                    <div className="flex gap-1.5">
                      {inv.status === 'Unpaid' && (
                        <button 
                          onClick={() => setInvoices(prev => prev.map(i => i.id === inv.id ? { ...i, status: 'Paid' as const } : i))}
                          className="px-2 py-0.5 bg-emerald-600 text-white rounded text-[9.5px] font-bold hover:bg-emerald-700"
                        >
                          Mark Paid
                        </button>
                      )}
                      <button 
                        onClick={() => setViewingInvoice(inv)}
                        className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[9.5px] font-bold hover:bg-slate-200 flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print/View
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ==================== TAB 4: FORECASTING & SUPPORT TICKETING ==================== */}
      {activeTab === 'forecast_support' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Sales Forecasting Weighted Model */}
          <div className="lg:col-span-6 bg-white p-3 rounded border border-slate-200 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1 border-b pb-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Corporate Sales Forecasting Calculations
            </h3>

            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded space-y-3">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400">Weighted Forecasted Revenue</span>
                <h4 className="text-lg font-black text-indigo-900 mt-0.5">₹{expectedTotalValue.toLocaleString('en-IN')}</h4>
                <p className="text-[9px] text-indigo-500 italic mt-0.5">
                  Calculated dynamically: Sum(Deal value * Probability coefficient corresponding to opportunity tier).
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-indigo-150">
                <div className="bg-white p-2 rounded text-center">
                  <span className="text-[9px] text-red-500 font-bold block">🔥 Hot Rating</span>
                  <span className="text-xs font-bold text-slate-850">90% Prob.</span>
                </div>
                <div className="bg-white p-2 rounded text-center">
                  <span className="text-[9px] text-amber-500 font-bold block">⚡ Warm Rating</span>
                  <span className="text-xs font-bold text-slate-850">55% Prob.</span>
                </div>
                <div className="bg-white p-2 rounded text-center">
                  <span className="text-[9px] text-slate-400 font-bold block">❄️ Cold Rating</span>
                  <span className="text-xs font-bold text-slate-850">15% Prob.</span>
                </div>
              </div>
            </div>

            {/* Simulated Funnel charts */}
            <div className="space-y-2">
              <h4 className="text-[10px] uppercase font-bold text-slate-400">Bottleneck Diagnostics Alert</h4>
              <div className="bg-slate-50 p-2.5 rounded border space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-slate-700">
                  <span>Proposal Bottleneck Capacity</span>
                  <span className="text-red-600">High Risk (SLA breach 32h)</span>
                </div>
                <div className="w-full bg-slate-205 h-2 rounded overflow-hidden">
                  <div className="bg-red-500 h-full w-[85%]" />
                </div>
                <p className="text-[9px] text-slate-400 mt-1">
                  * 3 deals are presently registered in the Proposal / Negotiation phase without any active billing quotation created. Generate a quotation right away to reduce SLA friction.
                </p>
              </div>
            </div>
          </div>

          {/* Customer CRM Support Ticketing Desk */}
          <div className="lg:col-span-6 bg-white p-3 rounded border border-slate-200 space-y-3">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                Linked Support Tickets Queue
              </h3>
              <button 
                onClick={() => setIsTicketFormOpen(true)}
                className="px-2 py-0.5 bg-indigo-50 border border-indigo-150 text-indigo-700 text-[10px] font-bold rounded"
              >
                Log Ticket
              </button>
            </div>

            <div className="space-y-2.5 max-h-[450px] overflow-y-auto">
              {supportTickets.map(t => (
                <div key={t.id} className="p-3 bg-slate-50 border border-slate-200 rounded relative space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold text-slate-400">{t.id}</span>
                    <span className={`text-[8.5px] font-bold uppercase px-1 rounded ${
                      t.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {t.priority} priority
                    </span>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{t.subject}</h4>
                    <p className="text-[10px] text-slate-600 italic">"Client: {t.clientName}"</p>
                    <p className="text-[10px] text-slate-505 leading-relaxed mt-1">{t.description}</p>
                  </div>

                  <div className="border-t border-slate-200 pt-1.5 flex justify-between items-center">
                    <span className="text-[9.5px] font-bold bg-[#E8F5E9] text-emerald-800 px-1.5 rounded uppercase">{t.status}</span>
                    <button 
                      onClick={() => setSupportTickets(prev => prev.map(st => st.id === t.id ? { ...st, status: 'Resolved' as const } : st))}
                      className="text-[9.5px] text-indigo-600 hover:underline font-bold"
                    >
                      Resolve Status
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* ==================== MODALS & PANEL OVERLAYS ==================== */}
      {/* ========================================================================= */}

      {/* 1. MOCK INTEGRATED PDF PRINT VIEW INVOICE */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded max-w-lg w-full p-6 border border-slate-300 shadow-2xl relative space-y-4">
            
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <span className="text-emerald-700 text-xs font-bold uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded">FORMAL CORPORATE INVOICE</span>
                <h3 className="text-md font-bold text-slate-800 mt-1">{viewingInvoice.id}</h3>
              </div>
              <button onClick={() => setViewingInvoice(null)} className="p-1 hover:bg-slate-100 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-[10px] text-slate-600 font-sans">
              <div>
                <p className="font-extrabold uppercase text-[9px] text-slate-400">ISSUED TO:</p>
                <p className="font-bold text-slate-800 text-[11px]">{viewingInvoice.clientName}</p>
                <p>{viewingInvoice.companyName}</p>
              </div>
              <div className="text-right">
                <p className="font-extrabold uppercase text-[9px] text-slate-400 font-bold text-slate-800">EXP CRM INC.</p>
                <p>Enterprise Business Suite 401B</p>
                <p>Tech Hub Sector V, Delhi</p>
              </div>
            </div>

            <div className="border border-slate-200 rounded overflow-hidden text-[10px]">
              <table className="w-full text-left">
                <thead className="bg-slate-50 font-bold border-b border-slate-150">
                  <tr>
                    <th className="px-3 py-1.5">Specified Pipeline Deliverable</th>
                    <th className="px-3 py-1.5 text-right">Sum Raw Price</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-100">
                    <td className="px-3 py-10">Advanced Enterprise Deployment Contract Pack ({viewingInvoice.quoteId})</td>
                    <td className="px-3 py-10 text-right">₹{viewingInvoice.subtotal.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-right font-bold text-slate-400">Discount Added</td>
                    <td className="px-3 py-2 text-right italic">-₹{viewingInvoice.discountAmount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr>
                    <td className="px-3 py-2 text-right font-bold text-slate-400">GST (Taxes 18%)</td>
                    <td className="px-3 py-2 text-right">+₹{viewingInvoice.taxAmount.toLocaleString('en-IN')}</td>
                  </tr>
                  <tr className="bg-slate-50 font-extrabold text-[11px] text-slate-900 border-t">
                    <td className="px-3 py-2 text-right">NET TOTAL DUE</td>
                    <td className="px-3 py-2 text-right text-indigo-700">₹{viewingInvoice.totalAmount.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if ((window as any).__triggerGlobalPrint) {
                    (window as any).__triggerGlobalPrint(
                      `Invoice ${viewingInvoice.id}`, 
                      'invoice', 
                      {
                        id: viewingInvoice.id,
                        clientName: viewingInvoice.clientName,
                        companyName: viewingInvoice.companyName,
                        itemName: "Advanced Enterprise Deployment Contract Pack Setup SKU",
                        rawPrice: viewingInvoice.subtotal,
                        discountPrice: viewingInvoice.discountAmount,
                        gstPrice: viewingInvoice.taxAmount,
                        netPrice: viewingInvoice.totalAmount
                      }
                    );
                    setViewingInvoice(null);
                  } else {
                    window.print();
                  }
                }}
                className="flex-1 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow"
              >
                <Printer className="w-4 h-4" /> Trigger Print
              </button>
              <button 
                onClick={() => setViewingInvoice(null)}
                className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-705 rounded text-xs font-bold"
              >
                Dismiss Viewer
              </button>
            </div>
            
          </div>
        </div>
      )}

      {/* 2. QUOTATION COMPOSER MODAL OVERLAY */}
      {isQuoteCreatorOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded max-w-lg w-full p-5 border border-slate-200 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">Draft Interactive Corporate Quotation</h3>
              <button onClick={() => setIsQuoteCreatorOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleCreateQuotation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-500 font-bold uppercase text-[9px] mb-1">Select Pipeline Lead Project *</label>
                <select 
                  required
                  className="w-full border p-2 rounded bg-white text-xs"
                  value={qSelectedLeadId}
                  onChange={(e) => setQSelectedLeadId(e.target.value)}
                >
                  <option value="">-- Choose active Lead --</option>
                  {leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} - {l.company} (₹{l.value.toLocaleString('en-IN')})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-slate-500 font-bold uppercase text-[9px]">Quotation Items Line Grid</label>
                  <button 
                    type="button"
                    onClick={() => setQItems(prev => [...prev, { desc: 'Premium Cloud support add-on license', qty: 1, cost: 15000 }])}
                    className="text-indigo-650 hover:underline font-bold text-[10px]"
                  >
                    + Add Item Line
                  </button>
                </div>

                <div className="space-y-1.5">
                  {qItems.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-1.5 items-center">
                      <input 
                        type="text" required
                        placeholder="Item line description" 
                        className="col-span-6 border p-1 rounded bg-slate-50 text-[11px]"
                        value={item.desc}
                        onChange={(e) => {
                          const updated = [...qItems];
                          updated[index].desc = e.target.value;
                          setQItems(updated);
                        }}
                      />
                      <input 
                        type="number" required min={1}
                        placeholder="Qty" 
                        className="col-span-2 border p-1 rounded bg-slate-50 text-[11px]"
                        value={item.qty}
                        onChange={(e) => {
                          const updated = [...qItems];
                          updated[index].qty = Number(e.target.value) || 1;
                          setQItems(updated);
                        }}
                      />
                      <input 
                        type="number" required min={0}
                        placeholder="Cost" 
                        className="col-span-3 border p-1 rounded bg-slate-50 text-[11px]"
                        value={item.cost}
                        onChange={(e) => {
                          const updated = [...qItems];
                          updated[index].cost = Number(e.target.value) || 0;
                          setQItems(updated);
                        }}
                      />
                      <button 
                        type="button" 
                        onClick={() => setQItems(prev => prev.filter((_, i) => i !== index))}
                        className="col-span-1 text-red-500 hover:text-red-700 font-bold"
                        disabled={qItems.length === 1}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-500 font-bold uppercase text-[9px] mb-1">Preferred Discount percentage: {qDiscount}%</label>
                <input 
                  type="range" min={0} max={40}
                  className="w-full accent-indigo-600"
                  value={qDiscount}
                  onChange={(e) => setQDiscount(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end gap-2 border-t pt-3">
                <button 
                  type="button" 
                  onClick={() => setIsQuoteCreatorOpen(false)}
                  className="px-3 py-1.5 border hover:bg-slate-105 rounded"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-650 text-white font-bold rounded hover:bg-indigo-750"
                >
                  Save Draft Quote
                </button>
              </div>
            </form>

          </div>
        </div>
      )}



      {/* 4. MANUAL CREATE TICKET MODAL */}
      {isTicketFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded max-w-sm w-full p-4 border border-slate-200 shadow-2xl relative space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-tight text-slate-900">Create Lead Helpdesk Ticket</h3>
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="block text-[9px] uppercase text-slate-400 font-bold mb-1">Associated Pipeline Contact *</label>
                <input 
                  type="text" required placeholder="e.g. Amit Patel"
                  className="w-full border p-1.5 rounded text-xs"
                  value={tClientName} onChange={(e) => setTClientName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase text-slate-400 font-bold mb-1">Trouble Subject *</label>
                <input 
                  type="text" required placeholder="e.g. License synchronization failure on custom server"
                  className="w-full border p-1.5 rounded text-xs"
                  value={tSubject} onChange={(e) => setTSubject(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase text-slate-400 font-bold mb-1">Ticket Brief Description *</label>
                <textarea 
                  required rows={3} placeholder="Provide details regarding the bug or general request."
                  className="w-full border p-1.5 rounded text-xs"
                  value={tDesc} onChange={(e) => setTDesc(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[9px] uppercase text-slate-400 font-bold mb-1">Priority</label>
                <select className="w-full border p-1.5 rounded bg-white text-xs" value={tPriority} onChange={(e) => setTPriority(e.target.value as any)}>
                  <option value="High">🔴 High Priority SLA</option>
                  <option value="Medium">🟡 Medium Priority SLA</option>
                  <option value="Low">🔵 Low Priority SLA</option>
                </select>
              </div>

              <div className="flex justify-end gap-1.5 pt-2">
                <button type="button" onClick={() => setIsTicketFormOpen(false)} className="px-2.5 py-1 text-slate-500 border rounded">Cancel</button>
                <button type="submit" className="px-3.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold">Lodge SLA Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. CREATE NEW SALES LEAD MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded max-w-md w-full p-5 border border-slate-200 shadow-2xl relative space-y-3">
            <h3 className="text-xs font-extrabold uppercase text-slate-900 tracking-tight">Create Manual Sales Lead</h3>
            
            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Lead Client Name *</label>
                  <input 
                    type="text" required placeholder="e.g. Anand Mahindra"
                    className="w-full border p-1.5 rounded text-xs bg-slate-50"
                    value={formName} onChange={(e) => setFormName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Company/Entity</label>
                  <input 
                    type="text" placeholder="e.g. Mahindra Group"
                    className="w-full border p-1.5 rounded text-xs bg-slate-50"
                    value={formCompany} onChange={(e) => setFormCompany(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Email Coordinates</label>
                  <input 
                    type="email" placeholder="e.g. contact@mahindra.com"
                    className="w-full border p-1.5 rounded text-xs bg-slate-50"
                    value={formEmail} onChange={(e) => setFormEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Phone Number</label>
                  <input 
                    type="tel" placeholder="e.g. 9876543210"
                    className="w-full border p-1.5 rounded text-xs bg-slate-50"
                    value={formPhone} onChange={(e) => setFormPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Deal Value (₹)</label>
                  <input 
                    type="number" placeholder="100000"
                    className="w-full border p-1 rounded text-xs bg-slate-50"
                    value={formValue} onChange={(e) => setFormValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Traffic Source</label>
                  <select 
                    className="w-full border p-1 rounded text-xs bg-white"
                    value={formSource} onChange={(e) => setFormSource(e.target.value as any)}
                  >
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Calling">Calling</option>
                    <option value="Others">Others</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Stage</label>
                  <select 
                    className="w-full border p-1 rounded text-xs bg-white"
                    value={formStatus} onChange={(e) => setFormStatus(e.target.value as any)}
                  >
                    {stages.map(stg => (
                      <option key={stg} value={stg}>{stg}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Assign Sales Rep</label>
                  <select className="w-full border p-1 rounded text-xs bg-white" value={formAssignedTo} onChange={(e) => setFormAssignedTo(e.target.value)}>
                    {reps.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Tier</label>
                  <select className="w-full border p-1 rounded text-xs bg-white" value={formTier} onChange={(e) => setFormTier(e.target.value as any)}>
                    <option value="Hot">🔥 Hot</option>
                    <option value="Warm">⚡ Warm</option>
                    <option value="Cold">❄️ Cold</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Contract Type</label>
                <select className="w-full border p-1.5 rounded text-xs bg-white" value={formDealType} onChange={(e) => setFormDealType(e.target.value)}>
                  <option value="Monthly SaaS Subscription">Monthly SaaS Subscription</option>
                  <option value="Dedicated SDK License">Dedicated SDK License</option>
                  <option value="Annual Retainer">Annual Retainer</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Additional Summary/Notes</label>
                <textarea 
                  rows={2} placeholder="Brief context metrics..."
                  className="w-full border p-1.5 rounded text-xs bg-slate-50"
                  value={formNotes} onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-1.5 border-t pt-3">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-3 py-1.5 border hover:bg-slate-50 rounded">Cancel</button>
                <button type="submit" className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded">Add CRM Lead</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- AI INSIGHT MODAL BAR FROM BOTTOM --- */}
      {inspectedLeadInsight && (
        <div className="bg-[#0f172a] text-slate-100 p-4 rounded border border-indigo-950 shadow-2xl relative select-none animate-fadeIn">
          <div className="flex justify-between items-start mb-3 border-b border-indigo-900/50 pb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400 animate-spin" />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-tight">AI Diagnostic Pipeline Insight</h3>
                <p className="text-[10px] text-slate-400">Targeting Account ID: {inspectedLeadInsight.id}</p>
              </div>
            </div>
            
            <button 
              onClick={() => setInspectedLeadInsight(null)}
              className="text-slate-400 hover:text-white font-bold text-xs bg-slate-800 px-2.5 py-1 rounded-md"
            >
              Dismiss
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            
            <div className="md:col-span-3 flex flex-col items-center justify-center bg-slate-900/50 p-2.5 rounded border border-indigo-900">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 mb-1">Close Chance</span>
              <div className="relative w-16 h-16 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="32" cy="32" r="26" stroke="#334155" strokeWidth="4" fill="transparent" />
                  <circle cx="32" cy="32" r="26" stroke="#10b981" strokeWidth="4" fill="transparent" 
                    strokeDasharray={`${2 * Math.PI * 26}`}
                    strokeDashoffset={`${2 * Math.PI * 26 * (1 - inspectedLeadInsight.closeProbability / 100)}`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-sm font-black text-white">{inspectedLeadInsight.closeProbability}%</span>
              </div>
            </div>

            <div className="md:col-span-9 space-y-3">
              <div>
                <h4 className="text-[9px] font-black uppercase text-indigo-400 tracking-wider">Tailored Sales Elevator Pitch</h4>
                <p className="text-[11px] text-slate-200 leading-relaxed mt-0.5">{inspectedLeadInsight.pitch}</p>
              </div>

              <div>
                <h4 className="text-[9px] font-black uppercase text-emerald-400 tracking-wider">Recommended Next Action</h4>
                <p className="text-[11px] text-slate-200 mt-0.5 flex items-start gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-500 mt-0.5" />
                  {inspectedLeadInsight.recommendedAction}
                </p>
              </div>

              <div>
                <h4 className="text-[9px] font-black uppercase text-amber-400 tracking-wider">Sentiment Classification</h4>
                <p className="text-[11px] text-slate-300 mt-0.5 italic">"{inspectedLeadInsight.sentiment}"</p>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
