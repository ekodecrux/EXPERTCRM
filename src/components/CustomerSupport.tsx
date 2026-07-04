import React, { useState, useEffect } from 'react';
import { 
  Users, Contact, Headphones, Ticket, Plus, Search, Loader2, Sparkles, 
  Send, CheckCircle2, AlertTriangle, ShieldCheck, RefreshCw, Eye, 
  Trash2, Edit, Save, PlusCircle, Wrench, AlertOctagon, HelpCircle, 
  Clock, MapPin, Mail, Phone, ChevronRight, Check, UserCheck, Calendar, Printer
} from 'lucide-react';
import { SupportTicket, Lead } from '../types';

interface CustomerSupportProps {
  tickets: SupportTicket[];
  leads: Lead[];
  onAddTicket: (ticket: Omit<SupportTicket, 'id' | 'createdTime'>) => void;
  onUpdateTicketStatus: (id: string, newStatus: SupportTicket['status']) => void;
  onAddAiResponse: (id: string, draft: string) => void;
}

// Sub-Tab types for support workflow
type SupportSubTab = 'customers' | 'customer_contacts' | 'complaints' | 'tickets' | 'services';

interface SecondaryContact {
  name: string;
  phone: string;
  role: string;
}

interface Customer {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  skypeExtension: string;
  address: string;
  decisionMaker: string;
  decisionMakerRole: string;
  slaTier: 'VIP Platinum' | 'Gold Tier' | 'Silver Regular';
  accountStatus: 'Active' | 'On Hold' | 'Pending Activation';
  lifetimeValue: string;
  dateEnrolled: string;
  secondaryContacts: SecondaryContact[];
  historyTimeline: { date: string; type: 'Complaints' | 'Ticket' | 'Service'; action: string; agent: string }[];
}

interface Complaint {
  id: string;
  customerId: string;
  customerName: string;
  companyName: string;
  category: 'Service Disruption' | 'Overbilling/Invoice Error' | 'Delayed Support Match' | 'Hardware Defect' | 'SLA Violation';
  priority: 'Critical' | 'Major' | 'Minor';
  assignedAgent: string;
  status: 'Unresolved' | 'Under Investigation' | 'Resolved';
  dateReceived: string;
  slaDue: string;
  notes: string;
  resolutionSummary?: string;
}

interface ServiceRequest {
  id: string;
  customerId: string;
  customerName: string;
  companyName: string;
  serviceType: 'System Onboarding & Sync' | 'Hardware Gateway Installation' | 'SLA Router Diagnostic' | 'Custom API Webhook Bridging';
  scheduledDate: string;
  assignedTech: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Scheduled' | 'In Progress' | 'Fulfilled' | 'Cancelled';
  details: string;
  materialsNeeded?: string;
}

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: "CUST-101",
    name: "Amit Patel",
    company: "Hindustan Logistics",
    email: "amit@hindustanlogistics.in",
    phone: "+91 98450 12356",
    skypeExtension: "Ext 401",
    address: "Kalamboli Warehousing Zone, Navi Mumbai MH 410218",
    decisionMaker: "Amit Patel",
    decisionMakerRole: "Director of Operations",
    slaTier: "VIP Platinum",
    accountStatus: "Active",
    lifetimeValue: "₹4,25,000",
    dateEnrolled: "2025-02-12",
    secondaryContacts: [
      { name: "Suresh Sharma", phone: "+91 98450 99881", role: "Fleet Supervisor" }
    ],
    historyTimeline: [
      { date: "2026-06-15", type: "Service", action: "VoIP Gateway setup and trunk line linking completed.", agent: "Pooja" },
      { date: "2026-06-14", type: "Complaints", action: "API telemetry lag registered under CMP-601.", agent: "Rajesh" }
    ]
  },
  {
    id: "CUST-102",
    name: "David Miller",
    company: "Quantum Tech Inc",
    email: "d.miller@quantumtech.com",
    phone: "+1 912 654 3940",
    skypeExtension: "Ext 915",
    address: "ORR Central Tech Park, Bangalore KA 560103",
    decisionMaker: "David Miller",
    decisionMakerRole: "Chief Tech Officer",
    slaTier: "VIP Platinum",
    accountStatus: "Active",
    lifetimeValue: "₹8,50,000",
    dateEnrolled: "2024-03-24",
    secondaryContacts: [
      { name: "Aditi Roy", phone: "+1 912 331 4455", role: "Sr. Architect" }
    ],
    historyTimeline: [
      { date: "2026-06-16", type: "Complaints", action: "Billing mismatch on INV-901 resolved under CMP-602.", agent: "Aman" }
    ]
  },
  {
    id: "CUST-103",
    name: "Preeti Sharma",
    company: "Apex Retail Group",
    email: "preeti@apexretail.co",
    phone: "+91 95341 20915",
    skypeExtension: "Ext 221",
    address: "Block-9, Sector-18, Noida UP 201301",
    decisionMaker: "Preeti Sharma",
    decisionMakerRole: "Procurement Lead",
    slaTier: "Gold Tier",
    accountStatus: "Active",
    lifetimeValue: "₹2,10,000",
    dateEnrolled: "2025-01-15",
    secondaryContacts: [],
    historyTimeline: [
      { date: "2026-06-15", type: "Ticket", action: "TCK-105: Automated dispatch routes initialized.", agent: "Pooja" }
    ]
  }
];

const DEFAULT_COMPLAINTS: Complaint[] = [
  {
    id: "CMP-601",
    customerId: "CUST-101",
    customerName: "Amit Patel",
    companyName: "Hindustan Logistics",
    category: "Service Disruption",
    priority: "Critical",
    assignedAgent: "Agent Rajesh",
    status: "Under Investigation",
    dateReceived: "2026-06-14",
    slaDue: "24h Target Limit",
    notes: "Total failure in linking real-time driver GPS coordinates to lead pipeline webhooks."
  },
  {
    id: "CMP-602",
    customerId: "CUST-102",
    customerName: "David Miller",
    companyName: "Quantum Tech Inc",
    category: "Overbilling/Invoice Error",
    priority: "Major",
    assignedAgent: "Agent Aman",
    status: "Resolved",
    dateReceived: "2026-06-16",
    slaDue: "48h Target Limit",
    notes: "Platform surcharge mismatch detected on invoice voucher QR sequence.",
    resolutionSummary: "Re-calculated workspace units and credited difference. Waived ₹15,500 via CRM credit voucher."
  }
];

const DEFAULT_SERVICES: ServiceRequest[] = [
  {
    id: "SRQ-801",
    customerId: "CUST-101",
    customerName: "Amit Patel",
    companyName: "Hindustan Logistics",
    serviceType: "Hardware Gateway Installation",
    scheduledDate: "2026-06-18, 11:00 AM",
    assignedTech: "Tech Advisor Rajesh",
    priority: "High",
    status: "Scheduled",
    details: "Install physical SIP Trunking bridge and connect 4 enterprise IP phones inside central fleet room.",
    materialsNeeded: "SIP Trunk Server Gateway, RJ-45 cat6 bundles, 4 VoIP sets"
  },
  {
    id: "SRQ-802",
    customerId: "CUST-103",
    customerName: "Preeti Sharma",
    companyName: "Apex Retail Group",
    serviceType: "SLA Router Diagnostic",
    scheduledDate: "2026-06-15",
    assignedTech: "Representative Pooja",
    priority: "Medium",
    status: "Fulfilled",
    details: "Conduct full packet trace diagnostic and update firewall ports to allow secure webhook delivery.",
    materialsNeeded: "Network Profiler software token"
  }
];

export default function CustomerSupport({
  tickets,
  leads,
  onAddTicket,
  onUpdateTicketStatus,
  onAddAiResponse
}: CustomerSupportProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<SupportSubTab>('customers');

  // Customer State
  const [customers, setCustomers] = useState<Customer[]>(() => {
    const saved = localStorage.getItem('crm_support_customers');
    return saved ? JSON.parse(saved) : DEFAULT_CUSTOMERS;
  });
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("CUST-101");
  const [customerSearch, setCustomerSearch] = useState('');

  // Complaint State
  const [complaints, setComplaints] = useState<Complaint[]>(() => {
    const saved = localStorage.getItem('crm_support_complaints');
    return saved ? JSON.parse(saved) : DEFAULT_COMPLAINTS;
  });
  const [complaintFilter, setComplaintFilter] = useState<'All' | 'Unresolved' | 'Resolved'>('All');
  const [complaintSearch, setComplaintSearch] = useState('');

  // Service Request State
  const [services, setServices] = useState<ServiceRequest[]>(() => {
    const saved = localStorage.getItem('crm_support_services');
    return saved ? JSON.parse(saved) : DEFAULT_SERVICES;
  });
  const [serviceSearch, setServiceSearch] = useState('');

  // Ticket Search State
  const [ticketSearch, setTicketSearch] = useState('');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('All');

  // Dialog & Creation Form State
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);

  // Forms Variables
  // 1. Customer
  const [custName, setCustName] = useState('');
  const [custComp, setCustComp] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custExt, setCustExt] = useState('');
  const [custAddr, setCustAddr] = useState('');
  const [custDM, setCustDM] = useState('');
  const [custDMRole, setCustDMRole] = useState('');
  const [custSla, setCustSla] = useState<'VIP Platinum' | 'Gold Tier' | 'Silver Regular'>('Gold Tier');
  const [custVal, setCustVal] = useState('₹1,50,000');

  // 2. Complaint
  const [compCustId, setCompCustId] = useState('CUST-101');
  const [compCat, setCompCat] = useState<Complaint['category']>('Service Disruption');
  const [compPrior, setCompPrior] = useState<Complaint['priority']>('Major');
  const [compAgent, setCompAgent] = useState('Agent Rajesh');
  const [compNotes, setCompNotes] = useState('');

  // 3. Service
  const [srvCustId, setSrvCustId] = useState('CUST-101');
  const [srvType, setSrvType] = useState<ServiceRequest['serviceType']>('System Onboarding & Sync');
  const [srvDate, setSrvDate] = useState('');
  const [srvTech, setSrvTech] = useState('Agent Pooja');
  const [srvPrior, setSrvPrior] = useState<ServiceRequest['priority']>('Medium');
  const [srvDetails, setSrvDetails] = useState('');
  const [srvMat, setSrvMat] = useState('');

  // 4. Ticket
  const [tktSubject, setTktSubject] = useState('');
  const [tktCustName, setTktCustName] = useState('Amit Patel');
  const [tktCat, setTktCat] = useState<'Technical' | 'Billing' | 'General Inquiry' | 'Account Access'>('Technical');
  const [tktPrior, setTktPrior] = useState<'High' | 'Medium' | 'Low'>('High');
  const [tktDesc, setTktDesc] = useState('');

  // Contact list management state inside selected customer
  const [newSecName, setNewSecName] = useState('');
  const [newSecPhone, setNewSecPhone] = useState('');
  const [newSecRole, setNewSecRole] = useState('');

  // AI Response View Overlay state
  const [solvingTicketId, setSolvingTicketId] = useState<string | null>(null);
  const [activeTicketSolving, setActiveTicketSolving] = useState<SupportTicket | null>(null);

  // Moved Customer & Contact state (Reminders database)
  const [reminders, setReminders] = useState<{
    id: string;
    leadId: string;
    clientName: string;
    reminderText: string;
    dateTime: string;
    priority: 'High' | 'Medium' | 'Low';
    isCompleted: boolean;
  }[]>(() => {
    const saved = localStorage.getItem('crm_leads_reminders');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'REM-1', leadId: 'L-101', clientName: 'John Doe', reminderText: 'Draft security whitelist specifications document', dateTime: '2026-06-18T14:30', priority: 'Medium', isCompleted: false },
      { id: 'REM-2', leadId: 'L-103', clientName: 'David Miller', reminderText: 'Call with legal counsel regarding data sharing terms', dateTime: '2026-06-17T17:00', priority: 'High', isCompleted: false }
    ];
  });

  const [isRemFormOpen, setIsRemFormOpen] = useState(false);
  const [remLeadId, setRemLeadId] = useState('');
  const [remText, setRemText] = useState('');
  const [remTime, setRemTime] = useState('');
  const [remPriority, setRemPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  useEffect(() => {
    localStorage.setItem('crm_leads_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const handleCreateReminder = (e: React.FormEvent) => {
    e.preventDefault();
    const targetLead = leads.find(l => l.id === remLeadId);
    if (!targetLead) return;

    const newRem = {
      id: `REM-${reminders.length + 12}`,
      leadId: targetLead.id,
      clientName: targetLead.name,
      reminderText: remText,
      dateTime: remTime || new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString().substring(0, 16),
      priority: remPriority,
      isCompleted: false
    };

    setReminders(prev => [newRem, ...prev]);
    setRemText('');
    setIsRemFormOpen(false);
  };

  // Sync state to local storage
  useEffect(() => {
    localStorage.setItem('crm_support_customers', JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem('crm_support_complaints', JSON.stringify(complaints));
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('crm_support_services', JSON.stringify(services));
  }, [services]);

  // Handle active customer profile helper
  const selectedCustomer = customers.find(c => c.id === selectedCustomerId) || customers[0] || null;

  // Add Customer
  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custComp) return;

    const newCust: Customer = {
      id: `CUST-${Date.now().toString().slice(-3)}`,
      name: custName,
      company: custComp,
      email: custEmail || 'info@company.com',
      phone: custPhone || '+91 99999 88888',
      skypeExtension: custExt || 'Ext 101',
      address: custAddr || 'HQ Business Suite',
      decisionMaker: custDM || custName,
      decisionMakerRole: custDMRole || 'Representative',
      slaTier: custSla,
      accountStatus: 'Active',
      lifetimeValue: custVal || '₹0',
      dateEnrolled: new Date().toISOString().split('T')[0],
      secondaryContacts: [],
      historyTimeline: [
        { date: new Date().toISOString().split('T')[0], type: 'Service', action: 'Customer Account Created inside Master CRM.', agent: 'System Administrator' }
      ]
    };

    setCustomers(prev => [...prev, newCust]);
    setSelectedCustomerId(newCust.id);
    setIsCustomerModalOpen(false);

    // Reset
    setCustName('');
    setCustComp('');
    setCustEmail('');
    setCustPhone('');
    setCustExt('');
    setCustAddr('');
    setCustDM('');
    setCustDMRole('');
  };

  // Add secondary contact
  const handleAddSecondaryContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSecName || !selectedCustomerId) return;

    setCustomers(prev => prev.map(c => {
      if (c.id === selectedCustomerId) {
        return {
          ...c,
          secondaryContacts: [...c.secondaryContacts, { name: newSecName, phone: newSecPhone, role: newSecRole }],
          historyTimeline: [
            {
              date: new Date().toISOString().split('T')[0],
              type: 'Service',
              action: `Added secondary contact: ${newSecName} (${newSecRole})`,
              agent: 'System'
            },
            ...c.historyTimeline
          ]
        };
      }
      return c;
    }));

    setNewSecName('');
    setNewSecPhone('');
    setNewSecRole('');
  };

  // Add Complaint
  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const client = customers.find(c => c.id === compCustId);
    if (!client) return;

    const newComp: Complaint = {
      id: `CMP-${Date.now().toString().slice(-3)}`,
      customerId: client.id,
      customerName: client.name,
      companyName: client.company,
      category: compCat,
      priority: compPrior,
      assignedAgent: compAgent,
      status: 'Unresolved',
      dateReceived: new Date().toISOString().split('T')[0],
      slaDue: compPrior === 'Critical' ? '24 Hours Limit' : compPrior === 'Major' ? '48 Hours Limit' : '72 Hours Limit',
      notes: compNotes
    };

    setComplaints(prev => [newComp, ...prev]);
    setIsComplaintModalOpen(false);
    setCompNotes('');

    // Append to customer's history timeline
    setCustomers(prev => prev.map(c => {
      if (c.id === client.id) {
        return {
          ...c,
          historyTimeline: [
            {
              date: new Date().toISOString().split('T')[0],
              type: 'Complaints',
              action: `Logged Complaint: ${newComp.id} - ${compCat} (${compPrior})`,
              agent: compAgent
            },
            ...c.historyTimeline
          ]
        };
      }
      return c;
    }));
  };

  // Resolve Complaint
  const handleResolveComplaint = (id: string, solution: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === id) {
        return { 
          ...c, 
          status: 'Resolved',
          resolutionSummary: solution || 'Resolved after troubleshooting backend API triggers.'
        };
      }
      return c;
    }));

    const compRef = complaints.find(c => c.id === id);
    if (compRef) {
      setCustomers(prev => prev.map(cust => {
        if (cust.id === compRef.customerId) {
          return {
            ...cust,
            historyTimeline: [
              {
                date: new Date().toISOString().split('T')[0],
                type: 'Complaints',
                action: `Resolved complaint ${id}: ${solution.slice(0, 50)}...`,
                agent: compRef.assignedAgent
              },
              ...cust.historyTimeline
            ]
          };
        }
        return cust;
      }));
    }
  };

  // Add Service Request
  const handleCreateService = (e: React.FormEvent) => {
    e.preventDefault();
    const client = customers.find(c => c.id === srvCustId);
    if (!client) return;

    const newSrv: ServiceRequest = {
      id: `SRQ-${Date.now().toString().slice(-3)}`,
      customerId: client.id,
      customerName: client.name,
      companyName: client.company,
      serviceType: srvType,
      scheduledDate: srvDate || 'Immediate Scheduled',
      assignedTech: srvTech,
      priority: srvPrior,
      status: 'Scheduled',
      details: srvDetails,
      materialsNeeded: srvMat || 'Software Access Key'
    };

    setServices(prev => [newSrv, ...prev]);
    setIsServiceModalOpen(false);
    setSrvDetails('');
    setSrvMat('');

    // Append to customer's history
    setCustomers(prev => prev.map(c => {
      if (c.id === client.id) {
        return {
          ...c,
          historyTimeline: [
            {
              date: new Date().toISOString().split('T')[0],
              type: 'Service',
              action: `Scheduled Maintenance / Setup Service: ${newSrv.id} (${srvType})`,
              agent: srvTech
            },
            ...c.historyTimeline
          ]
        };
      }
      return c;
    }));
  };

  // Update Service Status
  const handleUpdateServiceStatus = (id: string, newStatus: ServiceRequest['status']) => {
    setServices(prev => prev.map(s => {
      if (s.id === id) {
        return { ...s, status: newStatus };
      }
      return s;
    }));

    const srvRef = services.find(s => s.id === id);
    if (srvRef) {
      setCustomers(prev => prev.map(c => {
        if (c.id === srvRef.customerId) {
          return {
            ...c,
            historyTimeline: [
              {
                date: new Date().toISOString().split('T')[0],
                type: 'Service',
                action: `Updated Service Request ${id} status to ${newStatus}`,
                agent: srvRef.assignedTech
              },
              ...c.historyTimeline
            ]
          };
        }
        return c;
      }));
    }
  };

  // Dispatch Support Ticket creation to global state App.tsx
  const handleCreateTicketEx = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tktSubject) return;

    onAddTicket({
      subject: tktSubject,
      clientName: tktCustName,
      category: tktCat,
      priority: tktPrior,
      status: 'Open',
      description: tktDesc || 'Customer reported a general telemetry issue.'
    });

    // Enqueue in current selected customer if matching
    const matchingCust = customers.find(c => c.name.toLowerCase().includes(tktCustName.toLowerCase()));
    if (matchingCust) {
      setCustomers(prev => prev.map(c => {
        if (c.id === matchingCust.id) {
          return {
            ...c,
            historyTimeline: [
              {
                date: new Date().toISOString().split('T')[0],
                type: 'Ticket',
                action: `Opened Support Ticket: ${tktSubject} (${tktCat})`,
                agent: 'Online Dispatcher'
              },
              ...c.historyTimeline
            ]
          };
        }
        return c;
      }));
    }

    setIsTicketModalOpen(false);
    setTktSubject('');
    setTktDesc('');
  };

  // Solve Ticket with Gemini
  const handleSolveWithAI = async (ticket: SupportTicket) => {
    setSolvingTicketId(ticket.id);
    setActiveTicketSolving(ticket);

    try {
      const response = await fetch('/api/support-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticket),
      });

      if (!response.ok) throw new Error('AI assistant failed');
      const data = await response.json();
      onAddAiResponse(ticket.id, data.response);

      // Save to customer timeline if possible
      const matchingCust = customers.find(c => c.name.toLowerCase().includes(ticket.clientName.toLowerCase()));
      if (matchingCust) {
        setCustomers(prev => prev.map(c => {
          if (c.id === matchingCust.id) {
            return {
              ...c,
              historyTimeline: [
                {
                  date: new Date().toISOString().split('T')[0],
                  type: 'Ticket',
                  action: `AI drafted resolution for ticket: ${ticket.id}`,
                  agent: 'Gemini Assistant'
                },
                ...c.historyTimeline
              ]
            };
          }
          return c;
        }));
      }

      setActiveTicketSolving(prev => prev ? { ...prev, aiResponseDraft: data.response } : null);
    } catch (err) {
      console.error(err);
      const fallbackMsg = `Dear ${ticket.clientName}, Thank you for reporting this issue regarding your ${ticket.category}. Our tech desk has initiated diagnostic steps on this reference. We suggest verifying the local SIP Trunking gateway status or clearing the browser session cache. Warm regards, Support Desk.`;
      onAddAiResponse(ticket.id, fallbackMsg);
      setActiveTicketSolving(prev => prev ? { ...prev, aiResponseDraft: fallbackMsg } : null);
    } finally {
      setSolvingTicketId(null);
    }
  };

  // Filters
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.company.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.email.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  const filteredComplaints = complaints.filter(c => {
    const matchesSearch = 
      c.customerName.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.companyName.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.notes.toLowerCase().includes(complaintSearch.toLowerCase()) ||
      c.id.toLowerCase().includes(complaintSearch.toLowerCase());
    const matchesFilter = 
      complaintFilter === 'All' ? true :
      complaintFilter === 'Resolved' ? c.status === 'Resolved' : c.status !== 'Resolved';
    return matchesSearch && matchesFilter;
  });

  const filteredServices = services.filter(s => 
    s.customerName.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.companyName.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.serviceType.toLowerCase().includes(serviceSearch.toLowerCase()) ||
    s.id.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  const filteredTickets = tickets.filter(t => {
    const matchesSearch = 
      t.subject.toLowerCase().includes(ticketSearch.toLowerCase()) || 
      t.clientName.toLowerCase().includes(ticketSearch.toLowerCase()) || 
      t.category.toLowerCase().includes(ticketSearch.toLowerCase());
    const matchesStatus = ticketStatusFilter === 'All' || t.status === ticketStatusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div id="customer-support-view" className="space-y-4">
      
      {/* Module Title Header Operations Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded border border-slate-200">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded">
            <Headphones className="w-5 h-5 text-indigo-600 shadow-sm" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-tight">Enterprise Client Care Desk</h2>
            <p className="text-[10px] text-slate-400">Integrated support console featuring unified account profiles, complaint logging, service dispatches, and SLA ticket monitoring.</p>
          </div>
        </div>

        {/* 5 Feature Subsystem Tab Controller */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('customers')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition flex items-center gap-1.5 ${
              activeTab === 'customers' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-indigo-505" /> CRM Accounts
          </button>
          <button
            onClick={() => setActiveTab('customer_contacts')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition flex items-center gap-1.5 ${
              activeTab === 'customer_contacts' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" /> Customers & Contacts
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition flex items-center gap-1.5 ${
              activeTab === 'complaints' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <AlertOctagon className="w-3.5 h-3.5 text-red-500" /> Complaints ({complaints.filter(c => c.status !== 'Resolved').length})
          </button>
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition flex items-center gap-1.5 ${
              activeTab === 'tickets' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Ticket className="w-3.5 h-3.5 text-amber-500" /> SLA Tickets ({tickets.filter(t => t.status !== 'Resolved').length})
          </button>
          <button
            onClick={() => setActiveTab('services')}
            className={`px-3 py-1 rounded text-[11px] font-bold transition flex items-center gap-1.5 ${
              activeTab === 'services' ? 'bg-white text-slate-900 shadow-xs border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="w-3.5 h-3.5 text-sky-500" /> Service Orders ({services.filter(s => s.status !== 'Fulfilled').length})
          </button>
        </div>
      </div>

      {/* ==================== SUBPANEL 1: CUSTOMERS DATABASE & CONTACTS ==================== */}
      {activeTab === 'customers' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Customer list section left */}
          <div className="lg:col-span-5 bg-white p-3 rounded border border-slate-200 space-y-3 flex flex-col justify-between min-h-[480px]">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Customer Directory Database</h3>
                  <p className="text-[10px] text-slate-400">Search and navigate enrolled accounts</p>
                </div>
                <button
                  onClick={() => setIsCustomerModalOpen(true)}
                  className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-xs transition"
                >
                  <Plus className="w-3 h-3" /> Add Account
                </button>
              </div>

              {/* Directory search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search name, company, email..."
                  value={customerSearch}
                  onChange={(e) => setCustomerSearch(e.target.value)}
                  className="w-full text-xs p-1.5 pl-8 border border-slate-200 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              {/* Scroll list */}
              <div className="space-y-1.5 overflow-y-auto max-h-[350px] pr-1">
                {filteredCustomers.length === 0 ? (
                  <div className="text-center py-8 text-slate-450 border border-dashed rounded text-xs bg-slate-50">
                    No customers found matching criteria
                  </div>
                ) : (
                  filteredCustomers.map(cust => (
                    <div
                      key={cust.id}
                      onClick={() => setSelectedCustomerId(cust.id)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition ${
                        selectedCustomerId === cust.id 
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs font-extrabold">{cust.company}</div>
                          <div className={`text-[9.5px] font-medium leading-none mt-0.5 ${selectedCustomerId === cust.id ? 'text-slate-300' : 'text-slate-500'}`}>
                            {cust.name} &bull; {cust.decisionMakerRole}
                          </div>
                        </div>
                        <span className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded font-mono ${
                          cust.slaTier === 'VIP Platinum' ? 'bg-indigo-950 text-indigo-400 border border-indigo-900' :
                          cust.slaTier === 'Gold Tier' ? 'bg-amber-100 text-amber-800' : 'bg-slate-150 text-slate-700'
                        }`}>
                          {cust.slaTier}
                        </span>
                      </div>
                      <div className="mt-2 flex justify-between items-center text-[9px] text-slate-400 border-t border-slate-200/10 pt-1.5">
                        <span>LTV: <strong className="text-emerald-500">{cust.lifetimeValue}</strong></span>
                        <span>SLA Status: <strong className="uppercase text-slate-100">{cust.accountStatus}</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="text-[9px] text-slate-400 border-t border-slate-100 pt-2 flex justify-between">
              <span>Primary index of won CRM leads.</span>
              <span>Count: {customers.length} Accounts</span>
            </div>
          </div>

          {/* Customer Profile & History split-pane right */}
          <div className="lg:col-span-7 space-y-3.5 bg-slate-50/50 p-3.5 rounded-xl border border-slate-200">
            {selectedCustomer ? (
              <div className="space-y-4">
                
                {/* Account card layout / Profile header */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-150">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-800 border border-slate-200">
                        {selectedCustomer.company.slice(0,2).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-xs font-extrabold text-slate-900">{selectedCustomer.company}</h3>
                          <span className="text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-150 px-1 py-0.1 rounded font-bold uppercase">
                            {selectedCustomer.accountStatus}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-mono">ID: {selectedCustomer.id} &bull; Enrolled: {selectedCustomer.dateEnrolled}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[9px] uppercase tracking-wider font-extrabold text-slate-400 block">SLA Priority Tier</span>
                      <span className={`inline-block text-[10.5px] font-mono font-black border uppercase px-2 py-0.5 rounded ${
                        selectedCustomer.slaTier === 'VIP Platinum' ? 'bg-indigo-50 text-indigo-800 border-indigo-200 font-black' :
                        selectedCustomer.slaTier === 'Gold Tier' ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}>
                        {selectedCustomer.slaTier}
                      </span>
                    </div>
                  </div>

                  {/* Primary Contact Details */}
                  <div>
                    <h4 className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider mb-2">Primary Decision-Maker Contacts</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-150 text-[11px]">
                          <Contact className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-slate-400 block text-[9px] uppercase font-medium leading-none">Decision-Maker</span>
                            <strong>{selectedCustomer.decisionMaker}</strong>
                            <span className="text-slate-400 block text-[9px] truncate">{selectedCustomer.decisionMakerRole}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-150 text-[11px]">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-slate-400 block text-[9px] uppercase font-medium leading-none">Primary Email</span>
                            <a href={`mailto:${selectedCustomer.email}`} className="text-indigo-600 hover:underline hover:font-semibold">{selectedCustomer.email}</a>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button 
                          onClick={() => {
                            if ((window as any).__triggerGlobalDial) {
                              (window as any).__triggerGlobalDial(selectedCustomer.phone, selectedCustomer.name);
                            }
                          }}
                          className="flex items-center text-left gap-2 bg-slate-50 p-2 rounded-lg border border-slate-150 hover:bg-slate-100 hover:border-indigo-200 text-[11px] w-full transition cursor-pointer"
                          title="Click to dial customer via gateway"
                        >
                          <Phone className="w-3.5 h-3.5 text-indigo-500 shrink-0 animate-pulse" />
                          <div className="truncate">
                            <span className="text-slate-400 block text-[9px] uppercase font-medium leading-none">Direct Call Number (Click to Dial)</span>
                            <strong className="text-indigo-600 hover:underline font-bold">{selectedCustomer.phone}</strong>
                            <span className="text-slate-400 block text-[9px] italic font-mono">{selectedCustomer.skypeExtension}</span>
                          </div>
                        </button>
                        <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-150 text-[11px]">
                          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <div className="truncate">
                            <span className="text-slate-400 block text-[9px] uppercase font-medium leading-none">Main Address</span>
                            <span className="text-slate-700 block text-[9.5px] truncate" title={selectedCustomer.address}>{selectedCustomer.address}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Secondary Contacts Desk cards */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                    <span>Secondary Operational Stakeholders Contacts</span>
                    <span className="text-[9.5px] text-slate-450">({selectedCustomer.secondaryContacts.length} Assigned)</span>
                  </h4>

                  {selectedCustomer.secondaryContacts.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No secondary back-up contacts assigned. Register one below.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {selectedCustomer.secondaryContacts.map((sec, idx) => (
                        <div key={idx} className="p-2 border border-slate-150 rounded-lg bg-neutral-50 flex flex-col justify-between">
                          <div>
                            <span className="text-slate-500 font-mono text-[9px] uppercase font-bold tracking-widest">{sec.role}</span>
                            <p className="font-extrabold text-slate-800 text-[11px] mt-0.5">{sec.name}</p>
                          </div>
                          <span className="text-[10px] text-slate-500 font-semibold mt-1 font-mono">☎️ {sec.phone}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add secondary contact helper inline form */}
                  <form onSubmit={handleAddSecondaryContact} className="bg-slate-50 p-2.5 rounded-xl border border-dashed border-slate-250 flex flex-col sm:flex-row gap-2 items-end">
                    <div className="w-full">
                      <label className="text-[8.5px] font-bold text-slate-450 uppercase block mb-1">Contact Name</label>
                      <input 
                        type="text" required
                        placeholder="John Doe"
                        value={newSecName}
                        onChange={(e) => setNewSecName(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1 text-[10px] focus:outline-none"
                      />
                    </div>
                    <div className="w-full">
                      <label className="text-[8.5px] font-bold text-slate-450 uppercase block mb-1">Phone</label>
                      <input 
                        type="text" required
                        placeholder="+91 99000-xxxxx"
                        value={newSecPhone}
                        onChange={(e) => setNewSecPhone(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1 text-[10px] focus:outline-none"
                      />
                    </div>
                    <div className="w-full">
                      <label className="text-[8.5px] font-bold text-slate-450 uppercase block mb-1">Role</label>
                      <input 
                        type="text" required
                        placeholder="Fleet Operator"
                        value={newSecRole}
                        onChange={(e) => setNewSecRole(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded p-1 text-[10px] focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-750 text-white rounded text-[10px] font-bold shrink-0 shadow-xs"
                    >
                      Log Link
                    </button>
                  </form>
                </div>

                {/* Chronological CRM profile history timeline */}
                <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-3">
                  <h4 className="text-[9.5px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                    <span>Account Chronological Activity Timeline History</span>
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                  </h4>

                  <div className="relative border-l-2 border-slate-100 pl-4 ml-2.5 space-y-3">
                    {selectedCustomer.historyTimeline.map((item, idx) => (
                      <div key={idx} className="relative">
                        {/* Event marker dot */}
                        <div className={`absolute -left-6 top-1 w-2.5 h-2.5 rounded-full border-2 border-white ${
                          item.type === 'Complaints' ? 'bg-red-500' :
                          item.type === 'Ticket' ? 'bg-amber-400' : 'bg-sky-500'
                        }`} />
                        <div className="text-[10px]">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-slate-400 font-bold">{item.date}</span>
                            <span className={`px-1 rounded text-[8px] font-bold uppercase leading-none ${
                              item.type === 'Complaints' ? 'bg-red-50 text-red-700 border border-red-150' :
                              item.type === 'Ticket' ? 'bg-amber-50 text-amber-700 border border-amber-150' :
                              'bg-sky-50 text-sky-700 border border-sky-150'
                            }`}>
                              {item.type}
                            </span>
                            <span className="text-slate-400 text-[9px]">Assigned: {item.agent}</span>
                          </div>
                          <p className="text-slate-700 font-sans mt-0.5 text-[10.5px] leading-relaxed">
                            {item.action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 text-slate-400">
                Select a customer core template to inspect details.
              </div>
            )}
          </div>

        </div>
      )}

      {/* ==================== SUBPANEL: CUSTOMER & CONTACTS (MOVED FROM LEADS) ==================== */}
      {activeTab === 'customer_contacts' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Customer CRM Database */}
          <div className="lg:col-span-7 bg-white p-3 rounded border border-slate-205 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="w-4 h-4 text-emerald-600" />
              Customer Corporate Database
            </h3>
            <p className="text-[10px] text-slate-400">
              Only includes deals that are successfully sealed/won. These entities have associated contract terms.
            </p>

            <div className="space-y-2 max-h-[500px] overflow-y-auto">
              {leads && leads.filter(l => l.status === 'Won').length === 0 ? (
                <div className="h-28 border border-dashed border-slate-200 rounded flex flex-col items-center justify-center text-slate-400">
                  <UserCheck className="w-6 h-6 opacity-40 mb-1" />
                  <span className="text-[10px]">No Converted Customers Yet</span>
                </div>
              ) : (
                leads && leads.filter(l => l.status === 'Won').map(cust => {
                  return (
                    <div key={cust.id} className="p-3 bg-slate-50 border border-slate-200 rounded grid grid-cols-2 gap-2 relative">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{cust.name}</h4>
                        <p className="text-[10px] font-medium text-slate-500 uppercase">{cust.company}</p>
                        <p className="text-[9.5px] text-slate-400">Status: Account Active</p>
                      </div>

                      <div className="text-right flex flex-col justify-between items-end">
                        <span className="text-xs font-extrabold text-emerald-600">LTV: ₹{cust.value.toLocaleString('en-IN')}</span>
                        <div className="text-[9px] bg-emerald-110 text-emerald-800 px-1.5 py-0.2 rounded font-bold uppercase mt-1 border border-emerald-200">
                          Active Lead Won
                        </div>
                      </div>

                      <div className="col-span-2 border-t border-slate-200 pt-2 flex justify-between items-center">
                        <span className="text-[9.5px] text-slate-400">Assigned Account Representative: <strong>Manager Aman</strong></span>
                        <a 
                          href={`https://wa.me/${cust.phone}?text=Hello%20${cust.name},%20we%20are%20pleased%20to%20connect%20regarding%20your%2520services%2520with%2520our%2520enterprise%252520CRM!`}
                          className="px-2 py-0.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[9.5px] font-bold flex items-center gap-1 transition"
                          target="_blank" rel="noopener noreferrer"
                        >
                          <Phone className="w-3 h-3 text-emerald-200" /> WhatsApp Direct Link
                        </a>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Contact Management & Follow-up reminders desk */}
          <div className="lg:col-span-5 bg-white p-3 rounded border border-slate-200 space-y-4 shadow-xs">
            
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-4 h-4 text-indigo-600" />
                Follow-up Reminders Schedule
              </h3>
              <button 
                onClick={() => setIsRemFormOpen(true)}
                className="px-2 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded border border-indigo-150 hover:bg-indigo-110 transition"
              >
                Create Reminder
              </button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {reminders.length === 0 ? (
                <div className="text-center p-4 text-slate-500 text-[11px]">No active remind schedules</div>
              ) : (
                reminders.map(rem => (
                  <div key={rem.id} className={`p-2.5 rounded border ${rem.isCompleted ? 'bg-slate-50 opacity-60 border-slate-200' : 'bg-amber-50/50 border-amber-200'} relative`}>
                    <div className="flex justify-between items-start gap-1">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <input 
                            type="checkbox" 
                            checked={rem.isCompleted} 
                            onChange={() => setReminders(prev => prev.map(r => r.id === rem.id ? { ...r, isCompleted: !r.isCompleted } : r))}
                            className="rounded border-slate-300"
                          />
                          <h4 className={`text-xs font-bold ${rem.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'}`}>{rem.clientName}</h4>
                        </div>
                        <p className="text-[10px] text-slate-600 font-medium mt-1">"{rem.reminderText}"</p>
                      </div>

                      <span className={`text-[8px] font-bold px-1 rounded uppercase ${rem.priority === 'High' ? 'bg-red-100 text-red-700' : 'bg-slate-100'}`}>
                        {rem.priority}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-100 mt-2 pt-1 text-[9px] text-slate-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {rem.dateTime.replace('T', ' ')}</span>
                      <button 
                        onClick={() => setReminders(prev => prev.filter(r => r.id !== rem.id))}
                        className="text-slate-400 hover:text-red-500"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUBPANEL 2: COMPLAINT MANAGEMENT ==================== */}
      {activeTab === 'complaints' && (
        <div className="space-y-4">
          
          {/* Action and statistics operations bar */}
          <div className="bg-white p-3 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Enterprise Complaint Ledger</h3>
              <p className="text-[10px] text-slate-400">Log, triage, investigate and verify critical SLA customer grievances</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 text-[10.5px] bg-slate-150 p-0.5 rounded border border-slate-200">
                {(['All', 'Unresolved', 'Resolved'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setComplaintFilter(f)}
                    className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                      complaintFilter === f ? 'bg-white text-slate-900 shadow-xxs' : 'text-slate-500 hover:text-slate-850'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setIsComplaintModalOpen(true)}
                className="px-2.5 py-1 bg-red-650 hover:bg-red-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" /> Log Customer Complaint
              </button>
            </div>
          </div>

          <div className="bg-white p-3 rounded border border-slate-200 space-y-3">
            {/* Search row */}
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search complaint text, IDs, or accounts..."
                value={complaintSearch}
                onChange={(e) => setComplaintSearch(e.target.value)}
                className="w-full text-xs p-1.5 pl-8 border border-slate-200 bg-slate-50 rounded focus:bg-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>

            {/* Complaint spreadsheet index table */}
            <div className="overflow-x-auto border border-slate-150 rounded-lg">
              <table className="w-full text-left font-sans text-slate-700 text-xs">
                <thead className="bg-slate-100 text-slate-500 text-[8.5px] uppercase tracking-wider font-extrabold border-b border-slate-200">
                  <tr>
                    <th className="px-3 py-2">ID</th>
                    <th className="px-3 py-2">Account Company</th>
                    <th className="px-3 py-2">Category</th>
                    <th className="px-3 py-2">Triage Priority</th>
                    <th className="px-3 py-2">Assigned Agent</th>
                    <th className="px-3 py-2">SLA Matrix Target</th>
                    <th className="px-3 py-2">State</th>
                    <th className="px-3 py-2">Grievance Note & Resolution</th>
                    <th className="px-3 py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans text-[11px]">
                  {filteredComplaints.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-450 italic bg-slate-50">
                        No customer complaints found matching search.
                      </td>
                    </tr>
                  ) : (
                    filteredComplaints.map(comp => (
                      <tr key={comp.id} className="hover:bg-slate-50/50 transition">
                        <td className="px-3 py-2.5 font-mono font-bold text-red-650">{comp.id}</td>
                        <td className="px-3 py-2.5">
                          <strong>{comp.companyName}</strong>
                          <span className="block text-[9.5px] text-slate-400">{comp.customerName}</span>
                        </td>
                        <td className="px-3 py-2.5 font-semibold text-slate-650">{comp.category}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase ${
                            comp.priority === 'Critical' ? 'bg-red-950 text-red-400 border border-red-900 animate-pulse' :
                            comp.priority === 'Major' ? 'bg-amber-100 text-amber-800' : 'bg-slate-150 text-slate-700'
                          }`}>
                            {comp.priority}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 font-medium">{comp.assignedAgent}</td>
                        <td className="px-3 py-2.5 text-slate-450 font-mono text-[10px]">{comp.slaDue}</td>
                        <td className="px-3 py-2.5">
                          <span className={`px-1.5 py-0.2 rounded-sm text-[9px] font-bold ${
                            comp.status === 'Resolved' ? 'bg-emerald-50 text-emerald-800 border border-emerald-150' :
                            comp.status === 'Under Investigation' ? 'bg-amber-50 text-amber-850' : 'bg-red-50 text-red-650'
                          }`}>
                            {comp.status}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 max-w-xs leading-relaxed font-sans">
                          <p className="text-slate-700 font-medium">"{comp.notes}"</p>
                          {comp.resolutionSummary && (
                            <div className="mt-1 bg-emerald-50/50 p-1.5 rounded border border-emerald-150 text-emerald-800 text-[10px]">
                              <strong>Resolution:</strong> {comp.resolutionSummary}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-right font-medium">
                          {comp.status !== 'Resolved' ? (
                            <button
                              onClick={() => {
                                const solution = prompt("Kindly enter formal complaint resolution summary notes:");
                                if (solution !== null) {
                                  handleResolveComplaint(comp.id, solution);
                                }
                              }}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-xs ml-auto"
                            >
                              <Check className="w-3 h-3" /> Mark Resolved
                            </button>
                          ) : (
                            <span className="text-slate-400 font-mono text-[9px] italic">No further action</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUBPANEL 3: TICKET TRACKING ==================== */}
      {activeTab === 'tickets' && (
        <div className="space-y-4">
          <div className="bg-white p-3 rounded border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-none">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">SLA Support Ticket Tracking</h3>
              <p className="text-[10px] text-slate-400 font-medium">Conventional support tickets dispatch list with state controls and Gemini auto-resolution draft generation.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select 
                className="text-[10.5px] p-1 font-bold border border-slate-200 rounded bg-slate-50 focus:outline-none"
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value)}
              >
                <option value="All">All Tickets</option>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>

              <button
                onClick={() => setIsTicketModalOpen(true)}
                className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded text-[10px] font-bold flex items-center gap-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" /> Raise Ticket
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            {/* Ticket spreadsheet filter & list left */}
            <div className="md:col-span-12 bg-white p-3 rounded border border-slate-200 space-y-3">
              <div className="relative max-w-sm">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Filter tickets..."
                  value={ticketSearch}
                  onChange={(e) => setTicketSearch(e.target.value)}
                  className="w-full text-xs p-1.5 pl-8 border border-slate-200 bg-slate-50 rounded focus:bg-white focus:outline-none"
                />
              </div>

              {/* Staggered ticket list view */}
              <div className="space-y-2.5">
                {filteredTickets.length === 0 ? (
                  <div className="h-28 border border-dashed border-slate-200 rounded flex flex-col items-center justify-center text-slate-400">
                    <Ticket className="w-6 h-6 opacity-40 mb-1" />
                    <span className="text-[10px]">No SLA support tickets enqueued</span>
                  </div>
                ) : (
                  filteredTickets.map(ticket => (
                    <div 
                      key={ticket.id}
                      className="p-3 border border-slate-180 bg-white hover:border-slate-350 rounded-xl space-y-2.5 transition"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            ticket.priority === 'High' ? 'bg-red-500 text-white' :
                            ticket.priority === 'Medium' ? 'bg-amber-400 text-amber-950' : 'bg-slate-150 text-slate-700'
                          }`}>
                            {ticket.priority} SLA
                          </span>
                          <span className="font-mono text-[10px] font-bold text-slate-400">{ticket.id}</span>
                          <h4 className="text-[11.5px] font-bold text-slate-900">{ticket.subject}</h4>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-400 font-mono">Status:</span>
                          <select
                            className="bg-slate-50 text-[10.5px] font-bold border border-slate-200 rounded p-0.5"
                            value={ticket.status}
                            onChange={(e) => onUpdateTicketStatus(ticket.id, e.target.value as any)}
                          >
                            <option value="Open">Open</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                          </select>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-600 bg-slate-50 p-2 border border-slate-200/50 rounded-lg">
                        "{ticket.description}"
                      </p>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] text-slate-400">
                        <div>
                          Company Account Recipient: <strong className="text-slate-800">{ticket.clientName}</strong> &bull; Category: <strong className="text-slate-800">{ticket.category}</strong>
                          <button
                            onClick={() => {
                              if ((window as any).__triggerGlobalPrint) {
                                (window as any).__triggerGlobalPrint(
                                  `Support Ticket: ${ticket.id}`,
                                  'support_ticket',
                                  ticket
                                );
                              }
                            }}
                            className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-750 border border-slate-200 rounded text-[9px] font-black cursor-pointer transition ml-2 inline-block align-middle"
                            title="Print ticket ledger sheet"
                          >
                            <Printer className="w-2.5 h-2.5 inline mr-0.5" /> Print Copy
                          </button>
                        </div>

                        {ticket.aiResponseDraft ? (
                          <button
                            onClick={() => setActiveTicketSolving(ticket)}
                            className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded text-[9.5px] font-bold flex items-center gap-1 hover:bg-emerald-100"
                          >
                            <Eye className="w-3 h-3" /> View Gemini Resolution
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSolveWithAI(ticket)}
                            disabled={solvingTicketId === ticket.id}
                            className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-750 border border-indigo-150 rounded text-[9.5px] font-bold flex items-center gap-1 shadow-xxs transition disabled:opacity-50"
                          >
                            {solvingTicketId === ticket.id ? (
                              <>
                                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" /> Computing Options...
                              </>
                            ) : (
                              <>
                                <Sparkles className="w-3 h-3 text-indigo-500" /> Draft Resolution with Gemini AI
                              </>
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== SUBPANEL 4: SERVICE REQUEST MANAGEMENT ==================== */}
      {activeTab === 'services' && (
        <div className="space-y-4">
          
          <div className="bg-white p-3 rounded border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-none">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Enterprise Field Service Orders</h3>
              <p className="text-[10px] text-slate-400">Coordinate deployments, gateway sync processes, diagnosing and physical visits checklists.</p>
            </div>

            <button
              onClick={() => setIsServiceModalOpen(true)}
              className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white border border-sky-700 rounded text-[10px] font-bold flex items-center gap-1 shadow-xs transition"
            >
              <Plus className="w-3.5 h-3.5" /> Book Service Dispatch
            </button>
          </div>

          <div className="bg-white p-3 rounded border border-slate-200 space-y-3">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text"
                placeholder="Search service type or client accounts..."
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                className="w-full text-xs p-1.5 pl-8 border border-slate-200 bg-slate-50 rounded focus:bg-white"
              />
            </div>

            {/* Service grid/cards layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 font-sans">
              {filteredServices.length === 0 ? (
                <div className="col-span-2 text-center py-10 text-slate-400 border border-dashed rounded-lg bg-slate-50">
                  No service Orders found.
                </div>
              ) : (
                filteredServices.map(srv => (
                  <div key={srv.id} className="p-3 bg-white border border-slate-180 hover:border-slate-350 rounded-xl space-y-3 transition">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[9px] font-mono text-slate-450 tracking-wider">ORDER ID: {srv.id}</span>
                        <h4 className="text-[11.5px] font-bold text-slate-950 mt-0.5">{srv.serviceType}</h4>
                        <p className="text-[10px] text-slate-400 font-medium leading-none">{srv.companyName} &bull; {srv.customerName}</p>
                      </div>

                      <select
                        className="p-1 text-[10px] font-bold border border-slate-200 rounded bg-slate-50 focus:outline-none"
                        value={srv.status}
                        onChange={(e) => handleUpdateServiceStatus(srv.id, e.target.value as any)}
                      >
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Fulfilled">Fulfilled</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div className="bg-slate-50 p-2 border border-slate-150 rounded-md text-[10.5px] font-sans text-slate-650 leading-relaxed">
                      <strong>Specific SLA Details:</strong> "{srv.details}"
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500 border-t border-slate-150/60 pt-2.5">
                      <div>
                        <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-none">Schedule Target</span>
                        <strong className="text-slate-800">{srv.scheduledDate}</strong>
                      </div>
                      <div>
                        <span className="text-[8.5px] uppercase font-bold text-slate-400 block leading-none">Assigned Technician</span>
                        <strong className="text-slate-800">{srv.assignedTech}</strong>
                      </div>
                    </div>

                    {srv.materialsNeeded && (
                      <div className="text-[9.5px] text-slate-450 bg-neutral-50 px-2.5 py-1 rounded flex items-center justify-between border border-dashed border-slate-200 leading-none">
                        <span>Required Gear: <strong className="text-slate-700">{srv.materialsNeeded}</strong></span>
                        <span className={`text-[8px] uppercase font-bold px-1 py-0.2 rounded font-mono ${
                          srv.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-150' : 'bg-slate-100 text-slate-600'
                        }`}>{srv.priority}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== AI RESOLUTION COMPILER OVERLAY DIALOG ==================== */}
      {activeTicketSolving && (
        <div className="bg-[#0b1329] text-slate-200 p-5 rounded-2xl border border-slate-800 shadow-2xl space-y-4 font-sans">
          <div className="flex justify-between items-start pb-2.5 border-b border-slate-800">
            <div>
              <span className="text-[8.5px] uppercase tracking-widest font-black text-amber-400 block">Gemini Ticket Desk Assistant</span>
              <h3 className="text-sm font-extrabold text-white mt-1">Ticket Resolution Diagnostics Panel ({activeTicketSolving.id})</h3>
            </div>
            <button 
              onClick={() => setActiveTicketSolving(null)}
              className="px-3 py-1 text-[10px] font-semibold text-slate-400 hover:text-white bg-slate-800 rounded-md transition"
            >
              Dismiss Panel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-widest block">Original Ticket Transcript</span>
              <div className="bg-slate-900 p-3 h-32 overflow-y-auto rounded-xl border border-slate-850 text-[10.5px] text-slate-300 font-sans leading-relaxed">
                <p><strong>Customer:</strong> {activeTicketSolving.clientName}</p>
                <p className="mt-1"><strong>Subject:</strong> {activeTicketSolving.subject}</p>
                <p className="mt-2 text-slate-400 italic">" {activeTicketSolving.description} "</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[9px] font-extrabold text-amber-400 tracking-widest block uppercase">Gemini Formulated Resolution Proposal</span>
              <div className="bg-slate-900 p-3 h-32 overflow-y-auto rounded-xl border border-slate-850 text-[10.5px] text-slate-350 font-sans leading-relaxed">
                {activeTicketSolving.aiResponseDraft ? (
                  <p>{activeTicketSolving.aiResponseDraft}</p>
                ) : (
                  <p className="italic text-slate-500">Formulating resolution sequence. Trigger Gemini compilation in the previous module queue.</p>
                )}
              </div>
            </div>
          </div>

          {activeTicketSolving.aiResponseDraft && (
            <div className="flex justify-end gap-2 pt-1 border-t border-slate-850">
              <button 
                onClick={() => {
                  onUpdateTicketStatus(activeTicketSolving.id, 'Resolved');
                  setActiveTicketSolving(null);
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xxs font-extrabold flex items-center gap-1.5 shadow-md transition"
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Direct Approve, Notify Client & Close Ticket
              </button>
            </div>
          )}
        </div>
      )}

      {/* ==================== CREATION FORM DIALOGS MODALS ==================== */}
      
      {/* 1. Customer Modal */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-150 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">Enlist New Customer Account</h3>
            
            <form onSubmit={handleCreateCustomer} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3 text-xs font-medium text-slate-600">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Company Corporate Name *</label>
                  <input type="text" required placeholder="Hindustan Logistix" value={custComp} onChange={(e)=>setCustComp(e.target.value)} className="w-full border rounded p-1.5"/>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Primary Contact Name *</label>
                  <input type="text" required placeholder="Sanjay Kumar" value={custName} onChange={(e)=>setCustName(e.target.value)} className="w-full border rounded p-1.5"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Direct Contact Email</label>
                  <input type="email" placeholder="contact@company.com" value={custEmail} onChange={(e)=>setCustEmail(e.target.value)} className="w-full border rounded p-1.5"/>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Primary Direct Phone</label>
                  <input type="text" placeholder="+91 99000-xxxxx" value={custPhone} onChange={(e)=>setCustPhone(e.target.value)} className="w-full border rounded p-1.5"/>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Direct Extension / Skype</label>
                  <input type="text" placeholder="Ext 405" value={custExt} onChange={(e)=>setCustExt(e.target.value)} className="w-full border rounded p-1.5"/>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Decision-Maker Designation</label>
                  <input type="text" placeholder="VP Fleet Logistics" value={custDMRole} onChange={(e)=>setCustDMRole(e.target.value)} className="w-full border rounded p-1.5"/>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">SLA Contract Value (LTV)</label>
                  <input type="text" placeholder="₹3,20,000" value={custVal} onChange={(e)=>setCustVal(e.target.value)} className="w-full border rounded p-1.5"/>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">SLA Tier Option</label>
                  <select value={custSla} onChange={(e)=>setCustSla(e.target.value as any)} className="w-full border rounded p-1.5 bg-white">
                    <option value="VIP Platinum">VIP Platinum</option>
                    <option value="Gold Tier">Gold Tier</option>
                    <option value="Silver Regular">Silver Regular</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Workspace Full Address Office</label>
                <input type="text" placeholder="Block-D Sector-4, Kalamboli, Navi Mumbai" value={custAddr} onChange={(e)=>setCustAddr(e.target.value)} className="w-full border rounded p-1.5"/>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t text-xs">
                <button type="button" onClick={()=>setIsCustomerModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-md font-bold">Register Account</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Complaint Modal */}
      {isComplaintModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-205 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1">
              <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" /> Create Customer Resolution Complaint
            </h3>

            <form onSubmit={handleCreateComplaint} className="space-y-3.5">
              <div className="text-xs text-slate-600">
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Target Account Company *</label>
                <select value={compCustId} onChange={(e)=>setCompCustId(e.target.value)} className="w-full border rounded p-1.5 bg-white">
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Complaint Category</label>
                  <select value={compCat} onChange={(e)=>setCompCat(e.target.value as any)} className="w-full border rounded p-1.5 bg-white">
                    <option value="Service Disruption">Service Disruption</option>
                    <option value="Overbilling/Invoice Error">Overbilling/Invoice Error</option>
                    <option value="Delayed Support Match">Delayed Support Match</option>
                    <option value="Hardware Defect">Hardware Defect</option>
                    <option value="SLA Violation">SLA Violation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 font-extrabold text-red-550">Triage Priority</label>
                  <select value={compPrior} onChange={(e)=>setCompPrior(e.target.value as any)} className="w-full border rounded p-1.5 bg-white font-bold text-red-650">
                    <option value="Critical">🚨 Critical</option>
                    <option value="Major">⚡ Major</option>
                    <option value="Minor">💤 Minor</option>
                  </select>
                </div>
              </div>

              <div className="text-xs text-slate-600">
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Assigned Support Agent *</label>
                <select value={compAgent} onChange={(e)=>setCompAgent(e.target.value)} className="w-full border rounded p-1.5 bg-white">
                  <option value="Agent Rajesh">Agent Rajesh</option>
                  <option value="Agent Aman">Agent Aman</option>
                  <option value="Agent Pooja">Agent Pooja</option>
                  <option value="Agent Vikram">Agent Vikram</option>
                </select>
              </div>

              <div className="text-xs text-slate-600">
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Grievance / Incident Descrepancy Log Details *</label>
                <textarea rows={3} required placeholder="Feed specifics of the issue, SLA impact, or invoice amounts..." value={compNotes} onChange={(e)=>setCompNotes(e.target.value)} className="w-full border rounded p-1.5" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t text-xs">
                <button type="button" onClick={()=>setIsComplaintModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-red-655 hover:bg-red-700 text-white font-bold rounded-md">Log Complaint</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 3. Service Request Modal */}
      {isServiceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-205 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1">
              <Wrench className="w-4 h-4 text-sky-550 animate-pulse" /> Dispatch Field / Technical Service Order
            </h3>

            <form onSubmit={handleCreateService} className="space-y-3.5 bg-white">
              <div className="text-xs">
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Target Account Company *</label>
                <select value={srvCustId} onChange={(e)=>setSrvCustId(e.target.value)} className="w-full border rounded p-1.5 bg-white">
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.company} ({c.name})</option>
                  ))}
                </select>
              </div>

              <div className="text-xs">
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Required Service Type</label>
                <select value={srvType} onChange={(e)=>setSrvType(e.target.value as any)} className="w-full border rounded p-1.5 bg-white">
                  <option value="System Onboarding & Sync">System Onboarding & Sync</option>
                  <option value="Hardware Gateway Installation">Hardware Gateway Installation</option>
                  <option value="SLA Router Diagnostic">SLA Router Diagnostic</option>
                  <option value="Custom API Webhook Bridging">Custom API Webhook Bridging</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Appointment Schedule Target *</label>
                  <input type="text" required placeholder="e.g. 2026-06-22, 10:30 AM" value={srvDate} onChange={(e)=>setSrvDate(e.target.value)} className="w-full border rounded p-1.5 bg-white" />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Assigned Technician</label>
                  <select value={srvTech} onChange={(e)=>setSrvTech(e.target.value)} className="w-full border rounded p-1.5 bg-white">
                    <option value="Tech Advisor Rajesh">Tech Advisor Rajesh</option>
                    <option value="Representative Pooja">Representative Pooja</option>
                    <option value="Aman Security Specialist">Aman Security Specialist</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-xs text-slate-600">
                <div className="col-span-2">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Required Tools & Materials</label>
                  <input type="text" placeholder="SIP trunk terminal, Router cat6, Software key" value={srvMat} onChange={(e)=>setSrvMat(e.target.value)} className="w-full border rounded p-1.5" />
                </div>
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">SLA Level</label>
                  <select value={srvPrior} onChange={(e)=>setSrvPrior(e.target.value as any)} className="w-full border rounded p-1.5 bg-white">
                    <option value="High">🚨 High</option>
                    <option value="Medium">⚡ Medium</option>
                    <option value="Low">💤 Low</option>
                  </select>
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Specific Diagnostic / Dispatch Details *</label>
                <textarea rows={3} required placeholder="State exact on-route instructions, diagnostic steps, or custom webhook URLs." value={srvDetails} onChange={(e)=>setSrvDetails(e.target.value)} className="w-full border rounded p-1.5" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t text-xs">
                <button type="button" onClick={()=>setIsServiceModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-md shadow-xs">Book Dispatch</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 4. Ticket Modal */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 font-sans">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-205 shadow-2xl space-y-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-1">
              <Ticket className="w-4 h-4 text-amber-500" /> Raise SLA Customer Technical Ticket
            </h3>

            <form onSubmit={handleCreateTicketEx} className="space-y-3.5 text-slate-600 font-sans">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Ticket Subject Header *</label>
                  <input type="text" required placeholder="e.g. DNS resolution failure" value={tktSubject} onChange={(e)=>setTktSubject(e.target.value)} className="w-full border rounded p-1.5" />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Recipient Account Title *</label>
                  <select value={tktCustName} onChange={(e)=>setTktCustName(e.target.value)} className="w-full border rounded p-1.5 bg-white text-xs">
                    {customers.map(c => (
                      <option key={c.id} value={c.name}>{c.company} ({c.name})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Issue Category</label>
                  <select value={tktCat} onChange={(e)=>setTktCat(e.target.value as any)} className="w-full border rounded p-1.5 bg-white text-xs">
                    <option value="Technical">Technical Defect</option>
                    <option value="Billing">Billing Dispute</option>
                    <option value="Account Access">Account Access Loss</option>
                    <option value="General Inquiry">General SLA Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1 font-bold">Priority Speed</label>
                  <select value={tktPrior} onChange={(e)=>setTktPrior(e.target.value as any)} className="w-full border rounded p-1.5 bg-white text-xs font-bold">
                    <option value="High">🚨 High SLA Speed</option>
                    <option value="Medium">⚡ Medium SLA Speed</option>
                    <option value="Low">💤 Low SLA Speed</option>
                  </select>
                </div>
              </div>

              <div className="text-xs">
                <label className="block text-[9px] font-bold text-slate-400 uppercase mb-1">Grievosity Details *</label>
                <textarea rows={3} required placeholder="Detailed diagnostics transcripts logged..." value={tktDesc} onChange={(e)=>setTktDesc(e.target.value)} className="w-full border rounded p-1.5 text-xs" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t text-xs">
                <button type="button" onClick={()=>setIsTicketModalOpen(false)} className="px-4 py-2 border rounded-md hover:bg-slate-50">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-md shadow-xs">Enqueue Ticket</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. REMINDER ADD MODAL */}
      {isRemFormOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn font-sans">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 border border-slate-200 shadow-2xl relative space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 uppercase">Schedule New Follow-up Alert</h3>
            <form onSubmit={handleCreateReminder} className="space-y-3 text-xs text-slate-600">
              <div>
                <label className="block text-slate-400 font-bold text-[9px] uppercase mb-1">Target Account *</label>
                <select 
                  required className="w-full border p-1.5 text-xs bg-white rounded bg-slate-55"
                  value={remLeadId} onChange={(e) => setRemLeadId(e.target.value)}
                >
                  <option value="">-- Choose Account --</option>
                  {leads && leads.map(l => (
                    <option key={l.id} value={l.id}>{l.name} - {l.company}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-slate-400 font-bold text-[9px] uppercase mb-1">Interaction Reminder notes *</label>
                <input 
                  type="text" required placeholder="e.g. Discuss onboarding license contract parameters"
                  className="w-full border p-1.5 text-xs rounded"
                  value={remText} onChange={(e) => setRemText(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold text-[9px] uppercase mb-1">Alert Time trigger</label>
                <input 
                  type="datetime-local" className="w-full border p-1.5 text-xs rounded bg-slate-50"
                  value={remTime} onChange={(e) => setRemTime(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-slate-400 font-bold text-[9px] uppercase mb-1">Priority</label>
                <select className="w-full border p-1.5 text-xs bg-white rounded" value={remPriority} onChange={(e) => setRemPriority(e.target.value as any)}>
                  <option value="High">🔴 High</option>
                  <option value="Medium">🟡 Medium</option>
                  <option value="Low">🔵 Low</option>
                </select>
              </div>

              <div className="flex justify-end gap-1.5 pt-2 border-t">
                <button type="button" onClick={() => setIsRemFormOpen(false)} className="px-2.5 py-1 text-slate-500 hover:bg-slate-50 border rounded-md">Cancel</button>
                <button type="submit" className="px-3.5 py-1 bg-indigo-650 text-white rounded-md font-bold hover:bg-indigo-750 transition">Schedule Reminder</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
