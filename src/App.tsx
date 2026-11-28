import React, { useState, useEffect } from 'react';
import { 
  Users, Target, Phone, Headphones, MapPin, CheckSquare, 
  CreditCard, MessageSquare, Lock, LayoutDashboard, ChevronRight, 
  Menu, Search, Bell, Settings, ChevronDown, LogOut, Sparkles,
  PhoneCall, PhoneOff, Home, UserPlus
} from 'lucide-react';

// Subcomponents import
import Dashboard from './components/Dashboard';
import LeadsManager from './components/LeadsManager';
import CallingManager from './components/CallingManager';
import CustomerSupport from './components/CustomerSupport';
import FieldStaffManager from './components/FieldStaffManager';
import TaskManager from './components/TaskManager';
import PayrollManager from './components/PayrollManager';
import CommunicationManager from './components/CommunicationManager';
import SecurityAccess from './components/SecurityAccess';
import Login, { UserSession, PRESET_CREDENTIALS } from './components/Login';
import PrintAndExportCenter from './components/PrintAndExportCenter';
import SaaSWorkspacePanel from './components/SaaSWorkspacePanel';
import CRMLogo from './components/CRMLogo';
import CallAgentMobileApp from './components/CallAgentMobileApp';
import { PWAInstallButton } from './components/PWAInstallButton';

// Initial Mock data
import { 
  INITIAL_LEADS, INITIAL_CALL_LOGS, INITIAL_TICKETS, 
  INITIAL_STAFF, INITIAL_TASKS, INITIAL_EMPLOYEES, 
  INITIAL_COMMS, INITIAL_SECURITY, INITIAL_CALL_AGENTS
} from './initialData';

import { Lead, CallLog, SupportTicket, FieldStaff, Task, Employee, CommsLog, AccessControl, AccessRole } from './types';

function safeJsonParse<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : fallback;
  } catch {
    return fallback;
  }
}

export default function App() {
  // Authentication user session state
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    return safeJsonParse<UserSession | null>('crm_user_session', null);
  });

  // Check if opened as standalone mobile companion app (e.g. via QR code, direct URL, or PWA)
  const [mobileMode, setMobileMode] = useState<{
    active: boolean;
    agentId: string;
    token: string;
  }>(() => {
    try {
      const sp = new URLSearchParams(window.location.search);
      const isMobile = sp.get('mode') === 'mobile-agent' || sp.get('mode') === 'mobile';
      return {
        active: isMobile,
        agentId: sp.get('agent') || 'AGT-101',
        token: sp.get('token') || ''
      };
    } catch (e) {
      return { active: false, agentId: 'AGT-101', token: '' };
    }
  });

  // Call agents list with local storage persistence
  const [callAgents, setCallAgents] = useState(() => {
    try {
      const saved = localStorage.getItem('crm_call_agents');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_CALL_AGENTS;
  });

  // Global synchronized real-time call state
  const [globalCall, setGlobalCall] = useState<{
    activeCallStatus: 'idle' | 'calling' | 'ringing' | 'connected';
    callDirection: 'Incoming' | 'Outgoing';
    dialName: string;
    dialNumber: string;
    callDuration: number;
    realVoiceConnected: boolean;
    voiceBars: number[];
    recordingActive: boolean;
    recordingDur: number;
  } | null>(null);

  useEffect(() => {
    const handleCallStateChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      setGlobalCall(detail);
    };

    window.addEventListener('crm-call-state-change', handleCallStateChange);

    // Global click-to-dial registry
    (window as any).__triggerGlobalDial = (phone: string, name: string) => {
      setActiveTab('calling');
      setTimeout(() => {
        if ((window as any).__crmStartCall) {
          (window as any).__crmStartCall(phone, name);
        }
      }, 200);
    };

    return () => {
      window.removeEventListener('crm-call-state-change', handleCallStateChange);
      delete (window as any).__triggerGlobalDial;
    };
  }, []);

  const formatCallTime = (secs: number) => {
    const mm = String(Math.floor(secs / 60)).padStart(2, '0');
    const ss = String(secs % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  };

  // Navigation active state
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [headerSearch, setHeaderSearch] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [openClientOnboarding, setOpenClientOnboarding] = useState(false);

  // SaaS multi-tenant states
  const [saasPlanId, setSaasPlanId] = useState<string>(() => {
    return localStorage.getItem('saas_active_plan_id') || 'enterprise';
  });
  const [workspaceName, setWorkspaceName] = useState<string>(() => {
    return localStorage.getItem('saas_active_workspace') || 'Expert CRM HQ';
  });

  // Core Datasets State utilizing standard local storage persistent fallbacks
  const [leads, setLeads] = useState<Lead[]>(() => safeJsonParse('crm_leads', INITIAL_LEADS));

  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    const parsed = safeJsonParse<CallLog[]>('crm_call_logs', []);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_CALL_LOGS;
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => safeJsonParse('crm_support_tickets', INITIAL_TICKETS));

  const [fieldStaff, setFieldStaff] = useState<FieldStaff[]>(() => safeJsonParse('crm_field_staff', INITIAL_STAFF));

  const [tasks, setTasks] = useState<Task[]>(() => safeJsonParse('crm_tasks', INITIAL_TASKS));

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('crm_employees');
    if (!saved) return INITIAL_EMPLOYEES;
    try {
      const parsed: Employee[] = JSON.parse(saved);
      if (!Array.isArray(parsed)) return INITIAL_EMPLOYEES;
      const existingNames = new Set(parsed.map(e => e.name.toLowerCase()));
      const existingIds = new Set(parsed.map(e => e.id));
      const merged = [...parsed];
      for (const defaultEmp of INITIAL_EMPLOYEES) {
        if (!existingNames.has(defaultEmp.name.toLowerCase()) && !existingIds.has(defaultEmp.id)) {
          merged.push(defaultEmp);
        }
      }
      return merged;
    } catch {
      return INITIAL_EMPLOYEES;
    }
  });

  const [commsLogs, setCommsLogs] = useState<CommsLog[]>(() => safeJsonParse('crm_comms_logs', INITIAL_COMMS));

  const [accessControl, setAccessControl] = useState<AccessControl>(() =>
    safeJsonParse('crm_access_control', { role: 'Super Admin', permissions: INITIAL_SECURITY.permissions })
  );

  // Global Toasts/feedback message triggers
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Print overlay state
  const [printableDoc, setPrintableDoc] = useState<{
    title: string;
    type: 'invoice' | 'quotation' | 'payroll_slip' | 'lead_profile' | 'support_ticket' | 'call_log' | 'task_report' | 'field_assignment' | 'security_profile' | 'general';
    data: any;
  } | null>(null);

  useEffect(() => {
    (window as any).__triggerGlobalPrint = (title: string, type: any, data: any) => {
      setPrintableDoc({ title, type, data });
    };
    return () => {
      delete (window as any).__triggerGlobalPrint;
    };
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('crm_leads', JSON.stringify(leads));
  }, [leads]);
  useEffect(() => {
    localStorage.setItem('crm_call_logs', JSON.stringify(callLogs));
  }, [callLogs]);
  useEffect(() => {
    localStorage.setItem('crm_support_tickets', JSON.stringify(supportTickets));
  }, [supportTickets]);
  useEffect(() => {
    localStorage.setItem('crm_field_staff', JSON.stringify(fieldStaff));
  }, [fieldStaff]);
  useEffect(() => {
    localStorage.setItem('crm_tasks', JSON.stringify(tasks));
  }, [tasks]);
  useEffect(() => {
    localStorage.setItem('crm_employees', JSON.stringify(employees));
  }, [employees]);
  useEffect(() => {
    localStorage.setItem('crm_comms_logs', JSON.stringify(commsLogs));
  }, [commsLogs]);
  useEffect(() => {
    localStorage.setItem('crm_access_control', JSON.stringify(accessControl));
  }, [accessControl]);

  // Sync SaaS states
  useEffect(() => {
    localStorage.setItem('saas_active_plan_id', saasPlanId);
  }, [saasPlanId]);
  useEffect(() => {
    localStorage.setItem('saas_active_workspace', workspaceName);
  }, [workspaceName]);

  // Safety tab routing for Super Admin restricted views
  useEffect(() => {
    if (activeTab === 'saas' && accessControl.role !== 'Super Admin') {
      setActiveTab('dashboard');
    }
  }, [accessControl.role, activeTab]);

  // Session storage sync effect
  useEffect(() => {
    if (userSession) {
      localStorage.setItem('crm_user_session', JSON.stringify(userSession));
    } else {
      localStorage.removeItem('crm_user_session');
    }
  }, [userSession]);

  const handleLoginSuccess = (session: UserSession) => {
    setUserSession(session);
    
    // Switch workspace name and billing plan dynamically to match the authenticated tenant's credentials
    if (session.tenantWorkspaceName) {
      setWorkspaceName(session.tenantWorkspaceName);
    }
    if (session.tenantPlanId) {
      setSaasPlanId(session.tenantPlanId);
    }
    
    // Auto-update active role
    const defaultPermissionsMap = {
      'Super Admin': {
        viewDashboard: true, manageLeads: true, manageCalls: true, manageSupport: true,
        manageStaff: true, manageTasks: true, manageHR: true, manageComms: true, manageSecurity: true
      },
      'Admin': {
        viewDashboard: true, manageLeads: true, manageCalls: true, manageSupport: true,
        manageStaff: true, manageTasks: true, manageHR: true, manageComms: true, manageSecurity: true
      },
      'Sales Manager': {
        viewDashboard: true, manageLeads: true, manageCalls: true, manageSupport: false,
        manageStaff: false, manageTasks: true, manageHR: false, manageComms: true, manageSecurity: false
      },
      'Call Agent': {
        viewDashboard: true, manageLeads: true, manageCalls: true, manageSupport: false,
        manageStaff: false, manageTasks: true, manageHR: false, manageComms: false, manageSecurity: false
      },
      'Support Agent': {
        viewDashboard: true, manageLeads: false, manageCalls: true, manageSupport: true,
        manageStaff: false, manageTasks: true, manageHR: false, manageComms: false, manageSecurity: false
      },
      'HR Specialist': {
        viewDashboard: true, manageLeads: false, manageCalls: false, manageSupport: false,
        manageStaff: true, manageTasks: true, manageHR: true, manageComms: false, manageSecurity: false
      },
      'Guest': {
        viewDashboard: true, manageLeads: false, manageCalls: false, manageSupport: false,
        manageStaff: false, manageTasks: false, manageHR: false, manageComms: false, manageSecurity: false
      }
    };
    const permissions = defaultPermissionsMap[session.role] || defaultPermissionsMap['Guest'];
    setAccessControl({ role: session.role, permissions });
    
    // Switch to first allowed tab
    if (permissions.viewDashboard) {
      setActiveTab('dashboard');
    } else {
      const allowedKey = Object.keys(permissions).find(k => k !== 'role' && permissions[k as keyof typeof permissions]);
      const tabMap: Record<string, string> = {
        viewDashboard: 'dashboard',
        manageLeads: 'leads',
        manageCalls: 'calling',
        manageSupport: 'support',
        manageStaff: 'staff',
        manageTasks: 'tasks',
        manageHR: 'payroll',
        manageComms: 'comms',
        manageSecurity: 'security'
      };
      if (allowedKey && tabMap[allowedKey]) {
        setActiveTab(tabMap[allowedKey]);
      } else {
        setActiveTab('dashboard');
      }
    }
    showToast(`Welcome back, ${session.name}!`);
  };

  const handleLogout = () => {
    setUserSession(null);
    showToast("Workspace security session terminated safely.", "info");
  };

  // Toast notifier trigger helper
  const showToast = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // State Updates handler triggers
  const handleAddLead = (newLead: Omit<Lead, 'id' | 'dateAdded'>) => {
    const lead: Lead = {
      ...newLead,
      id: `L-${100 + leads.length + 1}`,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    setLeads(prev => [lead, ...prev]);
    showToast(`Lead "${lead.name}" added to the CRM roster!`);
  };

  const handleUpdateLeadStatus = (id: string, newStatus: Lead['status']) => {
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    showToast(`Lead status advanced to "${newStatus}"`);
  };

  const handleLogCall = (newLog: Omit<CallLog, 'id'>) => {
    const log: CallLog = {
      ...newLog,
      id: `CALL-${500 + callLogs.length + 1}`
    };
    setCallLogs(prev => [log, ...prev]);
    
    // Auto-schedule an interaction task if answered
    if (newLog.type === 'Answered') {
      const associatedTask: Task = {
        id: `TSK-${900 + tasks.length + 1}`,
        title: `Follow up with ${newLog.clientName}`,
        clientName: newLog.clientName,
        time: 'In 24h',
        status: 'Pending',
        priority: 'Medium',
        description: `Triggered via call log notes reference: "${newLog.notes}"`
      };
      setTasks(prev => [associatedTask, ...prev]);
    }
    showToast(`Call logged with client "${newLog.clientName}"`);
  };

  const handleClearCallLogs = () => {
    setCallLogs([]);
    showToast("Wiped all CRM Call Log history.", "info");
  };

  const handleDeleteCallLog = (id: string) => {
    setCallLogs(prev => prev.filter(log => log.id !== id));
    showToast(`Deleted call log ${id}.`, "info");
  };

  const handleBulkLogCalls = (newLogs: Omit<CallLog, 'id'>[]) => {
    setCallLogs(prev => {
      const startCallId = 500 + prev.length + 1;
      const parsedLogs = newLogs.map((item, index) => ({
        ...item,
        id: `CALL-${startCallId + index}`
      }));
      return [...parsedLogs, ...prev];
    });

    // Bulk schedule follow-up Tasks for any "Answered" calls
    const answeredLogs = newLogs.filter(log => log.type === 'Answered');
    if (answeredLogs.length > 0) {
      setTasks(prev => {
        const startTaskId = 900 + prev.length + 1;
        const newTasks = answeredLogs.map((log, index) => ({
          id: `TSK-${startTaskId + index}`,
          title: `Follow up with ${log.clientName}`,
          clientName: log.clientName,
          time: 'In 24h',
          status: 'Pending' as const,
          priority: 'Medium' as const,
          description: `Bulk imported call follow-up. Interaction synopsis: "${log.notes}"`
        }));
        return [...newTasks, ...prev];
      });
    }

    showToast(`Bulk uploaded ${newLogs.length} call logs successfully!`);
  };

  const handleAddTicket = (newTicket: Omit<SupportTicket, 'id' | 'createdTime'>) => {
    const ticket: SupportTicket = {
      ...newTicket,
      id: `TCK-${200 + supportTickets.length + 1}`,
      createdTime: new Date().toLocaleString()
    };
    setSupportTickets(prev => [ticket, ...prev]);
    showToast(`SLA Ticket "${ticket.subject}" registered in support queue.`);
  };

  const handleUpdateTicketStatus = (id: string, newStatus: SupportTicket['status']) => {
    setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    showToast(`Ticket status advanced to "${newStatus}"`);
  };

  const handleAddAiResponse = (id: string, draft: string) => {
    setSupportTickets(prev => prev.map(t => t.id === id ? { ...t, aiResponseDraft: draft } : t));
    showToast("Gemini AI resolution compiled!", "success");
  };

  const handleDispatchTask = (staffId: string, taskTitle: string, description: string) => {
    // Generate task
    const t: Task = {
      id: `TSK-${900 + tasks.length + 1}`,
      title: `${taskTitle} (Dispatched)`,
      time: 'Immediate',
      status: 'In Progress',
      priority: 'High',
      description
    };
    setTasks(prev => [t, ...prev]);

    // Update field staff metadata
    setFieldStaff(prev => prev.map(s => s.id === staffId ? {
      ...s,
      status: 'On Route',
      visitsToday: s.visitsToday + 1
    } : s));

    showToast(`Task assigned & dispatched!`);
  };

  const handleAddTask = (newTask: Omit<Task, 'id'>) => {
    const t: Task = {
      ...newTask,
      id: `TSK-${900 + tasks.length + 1}`
    };
    setTasks(prev => [t, ...prev]);
    showToast(`Activity task "${t.title}" scheduled.`);
  };

  const handleUpdateTaskStatus = (id: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: newStatus } : t));
    showToast(`Task updated to "${newStatus}"`);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    showToast("Task deleted from scheduler", "warning");
  };

  const handleAddEmployee = (newEmp: Omit<Employee, 'id' | 'paidStatus' | 'netPay'>) => {
    const netPay = newEmp.salary + newEmp.allowance - newEmp.deduction;
    const emp: Employee = {
      ...newEmp,
      id: `EMP-${employees.length + 1}`,
      netPay,
      paidStatus: 'Unpaid'
    };
    setEmployees(prev => [emp, ...prev]);
    showToast(`Personnel "${emp.name}" registered onto workforce.`);
  };

  const handleDisburseAll = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    setEmployees(prev => prev.map(e => ({
      ...e,
      paidStatus: 'Paid',
      payoutDate: todayStr
    })));
    showToast("Salaries disbursed and payroll ledger reconciled!");
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    showToast(`Employee record for "${updatedEmp.name}" updated successfully.`);
  };

  const handleDeleteEmployee = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    showToast(`Employee deleted from roster.`, "warning");
  };

  const handleAddCommLog = (newLog: Omit<CommsLog, 'id' | 'sentTime'>) => {
    const log: CommsLog = {
      ...newLog,
      id: `COM-${300 + commsLogs.length + 1}`,
      sentTime: 'Just Now'
    };
    setCommsLogs(prev => [log, ...prev]);
    showToast("Message copy approved & simulated payout logged.");
  };

  const handleUpdateRole = (role: AccessRole) => {
    // Standard role mappings for initial simulation bindings
    let updatedPermissions = { ...INITIAL_SECURITY.permissions };
    
    // First, try to read the custom configured mappings from localStorage
    const savedMaps = localStorage.getItem('crm_security_role_maps');
    if (savedMaps) {
      try {
        const parsed = JSON.parse(savedMaps);
        if (parsed[role]) {
          updatedPermissions = { ...updatedPermissions, ...parsed[role] };
          setAccessControl({ role, permissions: updatedPermissions });
          const matchingUser = PRESET_CREDENTIALS.find(p => p.role === role);
          if (matchingUser) {
            setUserSession({
              name: matchingUser.name,
              email: matchingUser.email,
              role: matchingUser.role,
              avatar: matchingUser.avatar
            });
          } else {
            setUserSession(prev => prev ? { ...prev, role } : null);
          }
          return;
        }
      } catch (e) {
        console.error("Error reading saved maps for role", e);
      }
    }

    if (role === 'Guest') {
      updatedPermissions = {
        viewDashboard: true,
        manageLeads: false,
        manageCalls: false,
        manageSupport: false,
        manageStaff: false,
        manageTasks: false,
        manageHR: false,
        manageComms: false,
        manageSecurity: false
      };
    } else if (role === 'Support Agent') {
      updatedPermissions = {
        ...updatedPermissions,
        manageSupport: true,
        manageCalls: true,
        manageHR: false,
        manageSecurity: false
      };
    } else if (role === 'Sales Manager') {
      updatedPermissions = {
        ...updatedPermissions,
        manageLeads: true,
        manageCalls: true,
        manageComms: true,
        manageHR: false,
        manageSecurity: false
      };
    } else if (role === 'Call Agent') {
      updatedPermissions = {
        ...updatedPermissions,
        viewDashboard: true,
        manageLeads: true,
        manageCalls: true,
        manageSupport: false,
        manageStaff: false,
        manageTasks: true,
        manageHR: false,
        manageComms: false,
        manageSecurity: false
      };
    }
    
    setAccessControl({ role, permissions: updatedPermissions });

    // Synchronize active user session to match the simulated role!
    const matchingUser = PRESET_CREDENTIALS.find(p => p.role === role);
    if (matchingUser) {
      setUserSession({
        name: matchingUser.name,
        email: matchingUser.email,
        role: matchingUser.role,
        avatar: matchingUser.avatar
      });
    } else {
      setUserSession(prev => prev ? { ...prev, role } : null);
    }
  };

  const handleTogglePermission = (permissionKey: keyof AccessControl['permissions']) => {
    setAccessControl(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permissionKey]: !prev.permissions[permissionKey]
      }
    }));
  };

  // Check Permissions helper
  const hasAccess = (permission: keyof AccessControl['permissions']) => {
    return accessControl.permissions[permission] || accessControl.role === 'Super Admin';
  };

  // Master Sidebar List Items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'viewDashboard' },
    { id: 'saas', label: 'Tenants', icon: Sparkles, permission: 'viewDashboard' },
    { id: 'leads', label: 'Lead & Sales', icon: Target, permission: 'manageLeads' },
    { id: 'calling', label: 'Calling', icon: Phone, permission: 'manageCalls' },
    { id: 'support', label: 'Customer Support', icon: Headphones, permission: 'manageSupport' },
    { id: 'staff', label: 'Field & Staff', icon: MapPin, permission: 'manageStaff' },
    { id: 'tasks', label: 'Task & Activity', icon: CheckSquare, permission: 'manageTasks' },
    { id: 'payroll', label: 'Payroll & HR', icon: CreditCard, permission: 'manageHR' },
    { id: 'comms', label: 'Communication', icon: MessageSquare, permission: 'manageComms' },
    { id: 'security', label: 'Security & Access', icon: Lock, permission: 'manageSecurity' },
  ];

  // Dedicated Mobile Companion App view (e.g. agent scanned QR code, clicked direct link, or opened PWA)
  if (mobileMode.active) {
    return (
      <div className="min-h-screen w-screen bg-[#031338] text-white flex flex-col font-sans antialiased overflow-x-hidden">
        {/* Top Mobile Companion Navigation Bar */}
        <header className="h-14 bg-[#041845] border-b border-[#1e3a8a]/50 px-3 sm:px-5 flex items-center justify-between shrink-0 z-50">
          <div className="flex items-center gap-2.5">
            <CRMLogo size="xs" darkTheme={true} showBorder={false} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-wider text-white">EXPERT CALL AGENT</span>
                <span className="px-1.5 py-0.5 rounded bg-[#0b74f0]/25 border border-[#16c2ff]/40 text-[#16c2ff] font-mono text-[9px] font-bold">
                  Mobile Companion
                </span>
              </div>
              <p className="text-[10px] text-[#16c2ff] font-mono">
                Agent: {callAgents.find(a => a.id === mobileMode.agentId)?.name || 'Authorized Agent'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <PWAInstallButton variant="secondary" label="Install App (PWA)" />
            
            <button
              onClick={() => {
                const url = new URL(window.location.href);
                url.searchParams.delete('mode');
                url.searchParams.delete('agent');
                url.searchParams.delete('token');
                window.history.pushState({}, '', url.pathname);
                setMobileMode({ active: false, agentId: 'AGT-101', token: '' });
              }}
              className="text-[10.5px] font-bold py-1.5 px-3 rounded-xl bg-[#082458] hover:bg-[#0b347a] text-sky-100 border border-[#1e3a8a] transition cursor-pointer"
              title="Return to Desktop CRM"
            >
              Desktop CRM Portal
            </button>
          </div>
        </header>

        {/* Mobile View Container */}
        <div className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <CallAgentMobileApp
            agents={callAgents}
            activeAgentId={mobileMode.agentId}
            onSelectAgent={(id) => setMobileMode(prev => ({ ...prev, agentId: id }))}
            leads={leads}
            onCallSynced={(newLog) => {
              handleLogCall(newLog);
            }}
            isStandalone={true}
            onClose={() => {
              const url = new URL(window.location.href);
              url.searchParams.delete('mode');
              url.searchParams.delete('agent');
              url.searchParams.delete('token');
              window.history.pushState({}, '', url.pathname);
              setMobileMode({ active: false, agentId: 'AGT-101', token: '' });
            }}
          />
        </div>
      </div>
    );
  }

  if (!userSession) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  const visibleNavItems = navItems.filter(
    (item) => item.id !== 'saas' || accessControl.role === 'Super Admin'
  );
  const activeNavItem = visibleNavItems.find((n) => n.id === activeTab) || visibleNavItems[0];
  const ActiveHeaderIcon = activeTab === 'dashboard' ? Home : (activeNavItem?.icon || Home);

  const notificationFeed = [
    ...supportTickets
      .filter((t) => t.status !== 'Resolved')
      .slice(0, 3)
      .map((t) => ({
        id: `tkt-${t.id}`,
        title: `Ticket #${t.id}: ${t.subject}`,
        meta: `${t.clientName} • ${t.priority}`,
        targetTab: 'support',
      })),
    ...tasks
      .filter((t) => t.status !== 'Completed')
      .slice(0, 2)
      .map((t) => ({
        id: `tsk-${t.id}`,
        title: t.title,
        meta: `${t.assignedTo || 'Team'} • ${t.status}`,
        targetTab: 'tasks',
      })),
  ].slice(0, 5);

  const trimmedSearch = headerSearch.trim().toLowerCase();
  const matchedNavResults = trimmedSearch
    ? visibleNavItems.filter((item) => item.label.toLowerCase().includes(trimmedSearch))
    : [];
  const matchedLeadResults = trimmedSearch
    ? leads
        .filter(
          (l) =>
            l.name.toLowerCase().includes(trimmedSearch) ||
            l.company.toLowerCase().includes(trimmedSearch)
        )
        .slice(0, 4)
    : [];

  const avatarInitials = (() => {
    const raw = (userSession?.name || 'Admin').trim();
    if (/super\s*admin/i.test(raw) || /admin/i.test(raw)) return 'AD';
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return raw.slice(0, 2).toUpperCase();
  })();

  return (
    <div id="app-root-container" className="flex h-screen w-screen bg-[#eef4fb] overflow-hidden font-sans antialiased text-[#082458]">
      
      {/* Floating System-Wide Notifications Toast */}
      {toast && (
        <div 
          className="fixed top-4 right-4 z-50 px-3.5 py-2.5 rounded-xl bg-[#082458] border border-[#16c2ff]/35 text-white shadow-xl flex items-center gap-3 animate-slideDown"
        >
          <div className="px-2 py-0.5 rounded-md bg-gradient-to-r from-[#0b78f4] to-[#005be0] text-white font-bold text-[10px] uppercase tracking-wider">Notice</div>
          <span className="text-xs font-medium">{toast.message}</span>
        </div>
      )}

      {/* Primary Left Navigation Panel - Login Midnight Navy Gradient without Logo */}
      <aside 
        id="side-nav"
        className={`${sidebarOpen ? 'w-60' : 'w-0 lg:w-16'} bg-gradient-to-b from-[#041845] via-[#082458] to-[#031338] text-slate-100 flex flex-col justify-between shrink-0 transition-all duration-300 z-40 relative h-full border-r border-[#0b2b6b]/70 overflow-hidden`}
      >
        {/* Subtle Architectural Skyline Backdrop */}
        <svg
          viewBox="0 0 240 120"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full h-36 opacity-25 pointer-events-none select-none"
        >
          <defs>
            <linearGradient id="skylineGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#16c2ff" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#031338" stopOpacity="0.95" />
            </linearGradient>
          </defs>
          <path
            d="M0 120 L0 86 L12 86 L12 62 L24 62 L24 78 L34 78 L34 40 L48 40 L48 72 L58 72 L58 48 L74 48 L74 84 L84 84 L84 26 L98 26 L98 68 L112 68 L112 52 L126 52 L126 76 L138 76 L138 34 L154 34 L154 70 L168 70 L168 58 L182 58 L182 82 L196 82 L196 44 L212 44 L212 74 L226 74 L226 60 L240 60 L240 120 Z"
            fill="url(#skylineGlow)"
          />
        </svg>

        <div className="relative z-10 flex-1 overflow-y-auto">
          {/* Sidebar Brand Logo Slot */}
          <div className={`${sidebarOpen ? (accessControl.role === 'Super Admin' ? 'px-3 pt-3 pb-2.5' : 'px-4 py-4') : 'px-2 py-3.5'} border-b border-white/10 flex items-center justify-between min-h-[64px]`}>
            {sidebarOpen ? (
              accessControl.role === 'Super Admin' ? (
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="w-full text-left cursor-pointer group focus:outline-none"
                  title="Go to Dashboard"
                >
                  <img
                    src="/assets/aistudio/image_b9ab6578.png"
                    alt="Expert CRM — Manage • Grow • Succeed"
                    className="w-full h-auto rounded-lg object-contain transition-transform duration-200 group-hover:scale-[1.01]"
                  />
                </button>
              ) : (
                <div className="min-w-0">
                  <p className="text-xs font-extrabold tracking-wide text-white truncate">
                    {workspaceName}
                  </p>
                  <p className="text-[10px] font-medium text-[#16c2ff] truncate mt-0.5">
                    {accessControl.role}
                  </p>
                </div>
              )
            ) : (
              <div className="w-full flex justify-center">
                <span className="text-[11px] font-bold text-[#16c2ff] tracking-wider">CRM</span>
              </div>
            )}
          </div>

          {/* Navigation Links Index */}
          <nav className="p-2.5 space-y-1 mt-1">
            {visibleNavItems.map(item => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              const permitted = item.id === 'security' ? true : hasAccess(item.permission as any);

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => {
                    if (permitted) {
                      setActiveTab(item.id);
                    } else {
                      showToast(`Role "${accessControl.role}" restricted. Adjust permissions in Security panel.`, "warning");
                    }
                  }}
                  title={!sidebarOpen ? item.label : undefined}
                  className={`w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-left text-[12.5px] transition-all cursor-pointer ${
                    isSelected 
                      ? 'bg-gradient-to-r from-[#0b78f4] to-[#005be0] text-white font-semibold shadow-[0_6px_18px_rgba(11,116,240,0.38)]' 
                      : 'text-slate-200/85 hover:bg-white/10 hover:text-white font-medium'
                  } ${!permitted ? 'opacity-35 cursor-not-allowed' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-[#38bdf8]/90'}`} />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </div>
                  
                  {sidebarOpen && !permitted && <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  {sidebarOpen && permitted && (item.id === 'saas' || item.id === 'calling') && (
                    <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Clean Sidebar Footer (Version + Quick Logout) */}
        <div className="relative z-10 px-4 py-3.5 border-t border-white/10 flex items-center justify-between gap-2 shrink-0">
          {sidebarOpen ? (
            <>
              <div className="flex items-center gap-2 text-xs text-slate-300/90 font-semibold">
                <span className="w-2 h-2 rotate-45 bg-[#16c2ff] inline-block rounded-[1px]" />
                <span>v1.0.0</span>
              </div>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-100 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition cursor-pointer"
                title="Log Out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogout}
              className="mx-auto p-1.5 text-sky-100 hover:text-white hover:bg-white/15 rounded-lg transition cursor-pointer"
              title="Log Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Main Workspace Frame container */}
      <main id="main-frame" className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top White Header Bar */}
        <header id="app-header" className="h-16 bg-white border-b border-slate-200/80 shadow-[0_1px_3px_rgba(8,36,88,0.05)] flex items-center justify-between px-4 sm:px-6 shrink-0 select-none z-30">
          <div className="flex items-center gap-3 min-w-0">
            <button 
              id="sidebar-trigger" 
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-[#eef4fb] text-[#082458] rounded-lg transition shrink-0 cursor-pointer"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 min-w-0">
              <ActiveHeaderIcon className="w-4.5 h-4.5 text-[#0b74f0] shrink-0" />
              <h2 className="text-base font-bold text-[#082458] tracking-tight truncate">
                {activeNavItem?.label || 'Dashboard'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            {/* Super Admin Direct Client Onboarding CTA */}
            {accessControl.role === 'Super Admin' && (
              <button
                type="button"
                onClick={() => {
                  setOpenClientOnboarding(true);
                  setActiveTab('saas');
                }}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#0b78f4] to-[#005be0] hover:from-[#0768d8] hover:to-[#004ec4] text-white text-xs font-semibold shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Client Onboarding</span>
              </button>
            )}

            {/* Install App Quick Action */}
            <PWAInstallButton variant="secondary" label="Install App" className="hidden xl:inline-flex" />

            {/* Interactive Global Search */}
            <div className="relative hidden md:block w-56 lg:w-72">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-[#082458]/50 pointer-events-none" />
              <input 
                type="text" 
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search here..." 
                className="w-full text-xs py-2 pl-9 pr-4 bg-[#f8fafc] border border-slate-200 rounded-full text-[#082458] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0b74f0] focus:bg-white transition"
              />
              {trimmedSearch && (
                <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl py-2 z-50">
                  {matchedNavResults.length === 0 && matchedLeadResults.length === 0 ? (
                    <p className="px-3.5 py-2 text-xs text-slate-500">No matching modules or leads</p>
                  ) : (
                    <>
                      {matchedNavResults.map((nav) => (
                        <button
                          key={nav.id}
                          type="button"
                          onClick={() => {
                            if (nav.id === 'security' || hasAccess(nav.permission as any)) {
                              setActiveTab(nav.id);
                            }
                            setHeaderSearch('');
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs font-semibold text-[#082458] hover:bg-[#eef4fb] hover:text-[#0b74f0] flex items-center justify-between cursor-pointer"
                        >
                          <span>{nav.label}</span>
                          <span className="text-[10px] text-slate-400">Module</span>
                        </button>
                      ))}
                      {matchedLeadResults.map((lead) => (
                        <button
                          key={lead.id}
                          type="button"
                          onClick={() => {
                            setActiveTab('leads');
                            setHeaderSearch('');
                          }}
                          className="w-full px-3.5 py-2 text-left text-xs text-[#082458] hover:bg-[#eef4fb] flex items-center justify-between cursor-pointer"
                        >
                          <span className="font-medium truncate">{lead.company || lead.name}</span>
                          <span className="text-[10px] text-emerald-600 font-semibold ml-2 shrink-0">{lead.status}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Notification Bell with Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setUserMenuOpen(false);
                }}
                className="relative p-2 text-[#082458] hover:bg-[#eef4fb] rounded-full transition cursor-pointer"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {notificationFeed.length > 0 && (
                  <span className="absolute top-0.5 right-0.5 min-w-[17px] h-[17px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white tabular-nums">
                    {notificationFeed.length}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-2.5 bg-gradient-to-r from-[#041845] to-[#082458] text-white flex items-center justify-between">
                    <span className="text-xs font-bold">Notifications</span>
                    <span className="text-[11px] text-[#16c2ff] tabular-nums">{notificationFeed.length} active</span>
                  </div>
                  <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
                    {notificationFeed.length === 0 ? (
                      <p className="p-4 text-xs text-slate-500 text-center">All caught up</p>
                    ) : (
                      notificationFeed.map((notif) => (
                        <button
                          key={notif.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(notif.targetTab);
                            setNotificationsOpen(false);
                          }}
                          className="w-full px-4 py-2.5 text-left hover:bg-[#eef4fb]/70 transition cursor-pointer block"
                        >
                          <p className="text-xs font-semibold text-[#082458] truncate">{notif.title}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{notif.meta}</p>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User Avatar Initials Pill & Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-1.5 rounded-full p-0.5 pr-1 hover:bg-[#eef4fb] transition cursor-pointer"
                aria-label="Account menu"
              >
                <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#0b78f4] to-[#005be0] text-white font-bold text-xs flex items-center justify-center shadow-sm">
                  {avatarInitials}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-[#082458]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100 bg-[#eef4fb]/60">
                    <p className="text-xs font-bold text-[#082458] truncate">{userSession?.name || 'Super Admin'}</p>
                    <p className="text-[11px] text-slate-500 truncate">{userSession?.email}</p>
                    <span className="inline-block mt-1.5 px-2 py-0.5 rounded-md bg-[#eef4fb] text-[#0b74f0] border border-[#0b74f0]/20 text-[10px] font-bold">
                      {accessControl.role}
                    </span>
                  </div>
                  <div className="p-1.5 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => {
                        setActiveTab('security');
                        setUserMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-[#082458] hover:bg-[#eef4fb] rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5 text-[#0b74f0]" />
                      Security &amp; Access
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleLogout();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Inner Workspace Panel scrolling viewport */}
        <section id="workspace-scroller" className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6 bg-[#eef4fb]">
          {activeTab === 'dashboard' && (
            <Dashboard 
              leads={leads}
              callLogs={callLogs}
              supportTickets={supportTickets}
              fieldStaff={fieldStaff}
              tasks={tasks}
              employees={employees}
              commsLogs={commsLogs}
              userRole={accessControl.role}
              onNavigate={(tab) => {
                const navItem = navItems.find(n => n.id === tab);
                if (navItem && hasAccess(navItem.permission as any)) {
                  setActiveTab(tab);
                } else {
                  showToast(`Access Denied: Impersonating ${accessControl.role} role restricts this view`, "warning");
                }
              }}
              onAddLeadOpen={() => { setActiveTab('leads'); }}
              onAddCustomerOpen={() => { 
                setActiveTab('support'); 
                showToast("Navigate to 'Customer & Contacts' sub-tab to see won active accounts.", "info");
              }}
              onLogCallOpen={() => { setActiveTab('calling'); }}
              onCreateTaskOpen={() => { setActiveTab('tasks'); }}
              onAddEmployeeOpen={() => { setActiveTab('payroll'); }}
              onProcessPayroll={() => { setActiveTab('payroll'); }}
              onClientOnboardingOpen={() => {
                setOpenClientOnboarding(true);
                setActiveTab('saas');
              }}
            />
          )}

          {activeTab === 'saas' && accessControl.role === 'Super Admin' && (
            <SaaSWorkspacePanel 
              currentPlanId={saasPlanId}
              onUpdatePlan={setSaasPlanId}
              onWorkspaceChange={setWorkspaceName}
              activeWorkspace={workspaceName}
              showToast={showToast}
              openOnboarding={openClientOnboarding}
              onOnboardingOpened={() => setOpenClientOnboarding(false)}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsManager 
              leads={leads}
              onAddLead={handleAddLead}
              onUpdateLeadStatus={handleUpdateLeadStatus}
              onSendWhatsAppLog={handleAddCommLog}
            />
          )}

          <div className={activeTab === 'calling' ? 'block' : 'hidden'}>
            <CallingManager 
              callLogs={callLogs}
              onLogCall={handleLogCall}
              onBulkLogCalls={handleBulkLogCalls}
              onClearLogs={handleClearCallLogs}
              onDeleteLog={handleDeleteCallLog}
              userSession={userSession}
              accessControl={accessControl}
              leads={leads}
            />
          </div>

          {activeTab === 'support' && (
            <CustomerSupport 
              tickets={supportTickets}
              leads={leads}
              onAddTicket={handleAddTicket}
              onUpdateTicketStatus={handleUpdateTicketStatus}
              onAddAiResponse={handleAddAiResponse}
            />
          )}

          {activeTab === 'staff' && (
            <FieldStaffManager 
              fieldStaff={fieldStaff}
              onDispatchTask={handleDispatchTask}
            />
          )}

          {activeTab === 'tasks' && (
            <TaskManager 
              tasks={tasks}
              leads={leads}
              fieldStaff={fieldStaff}
              employees={employees}
              accessControl={accessControl}
              onAddTask={handleAddTask}
              onUpdateTaskStatus={handleUpdateTaskStatus}
              onDeleteTask={handleDeleteTask}
              onTasksUpdate={setTasks}
            />
          )}

          {activeTab === 'payroll' && (
            <PayrollManager 
              employees={employees}
              onAddEmployee={handleAddEmployee}
              onDisburseAll={handleDisburseAll}
              onUpdateEmployee={handleUpdateEmployee}
              onDeleteEmployee={handleDeleteEmployee}
            />
          )}

          {activeTab === 'comms' && (
            <CommunicationManager 
              commsLogs={commsLogs}
              leads={leads}
              onAddCommLog={handleAddCommLog}
              accessControl={accessControl}
            />
          )}

          {activeTab === 'security' && (
            <SecurityAccess 
              accessControl={accessControl}
              onUpdateRole={handleUpdateRole}
              onTogglePermission={handleTogglePermission}
            />
          )}
        </section>
      </main>

      {/* Global Printing and Clipboard Copy/Export Center */}
      <PrintAndExportCenter 
        isOpen={!!printableDoc}
        onClose={() => setPrintableDoc(null)}
        document={printableDoc}
        userEmail={userSession?.email || 'expertaidtech@gmail.com'}
        leads={leads}
        onSendWhatsAppLog={handleAddCommLog}
      />

      {/* Global Real-time Call Overlays */}
      {globalCall && globalCall.activeCallStatus === 'ringing' && globalCall.callDirection === 'Incoming' && (
        <div id="global-incoming-call-hud" className="fixed top-18 right-4 z-[9999] w-92 bg-[#041845]/95 border border-emerald-500/80 rounded-2xl shadow-2xl p-4 text-white animate-pulse backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-full text-emerald-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase block">
                🔔 Live Incoming CRM Call
              </span>
              <h4 className="text-sm font-extrabold tracking-tight text-white">{globalCall.dialName}</h4>
              <p className="text-[10px] font-mono text-sky-200">{globalCall.dialNumber}</p>
              <span className="inline-block text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-900/40 text-emerald-300 border border-emerald-800">
                VIP Incoming Trunk Proxy
              </span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={() => {
                setActiveTab('calling');
                setTimeout(() => {
                  if ((window as any).__crmAnswerCall) {
                    (window as any).__crmAnswerCall();
                  }
                }, 40);
              }}
              className="py-1.5 bg-gradient-to-r from-[#14b886] to-[#069468] hover:opacity-95 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 shadow-sm cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" /> Answer &amp; Stream
            </button>
            <button
              onClick={() => {
                if ((window as any).__crmDeclineCall) {
                  (window as any).__crmDeclineCall();
                }
              }}
              className="py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-rose-500 cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        </div>
      )}

      {/* Global Background Active Call Status Strip */}
      {globalCall && globalCall.activeCallStatus === 'connected' && activeTab !== 'calling' && (
        <div id="global-active-call-strip" className="fixed bottom-4 right-4 z-[9998] w-80 bg-[#041845]/95 border border-[#0b74f0]/80 rounded-2xl shadow-xl p-3 text-white backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <div>
              <span className="text-[8px] font-mono tracking-wider text-[#16c2ff] font-bold uppercase block">
                ☎️ Connected
              </span>
              <h4 className="text-[11px] font-bold text-white truncate max-w-[140px]">
                {globalCall.dialName}
              </h4>
              <span className="text-[10px] font-mono text-sky-200">
                {formatCallTime(globalCall.callDuration)}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('calling')}
              className="px-2.5 py-1 bg-gradient-to-r from-[#0b78f4] to-[#005be0] hover:from-[#0768d8] hover:to-[#004ec4] text-white text-[10px] font-bold rounded-lg uppercase tracking-wider cursor-pointer"
              title="Maximize calling panel"
            >
              Maximize
            </button>
            <button
              onClick={() => {
                if ((window as any).__crmEndCall) {
                  (window as any).__crmEndCall();
                }
              }}
              className="p-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg border border-rose-500 cursor-pointer"
              title="Hangup Call"
            >
              <PhoneOff className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
