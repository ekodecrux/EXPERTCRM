import React, { useState, useEffect } from 'react';
import { 
  Users, Target, Phone, Headphones, MapPin, CheckSquare, 
  CreditCard, MessageSquare, Lock, LayoutDashboard, ChevronRight, 
  Menu, Search, Bell, Mail, Settings, ChevronDown, LogOut, Check, Star, Sparkles,
  PhoneCall, PhoneOff
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

// Initial Mock data
import { 
  INITIAL_LEADS, INITIAL_CALL_LOGS, INITIAL_TICKETS, 
  INITIAL_STAFF, INITIAL_TASKS, INITIAL_EMPLOYEES, 
  INITIAL_COMMS, INITIAL_SECURITY 
} from './initialData';

import { Lead, CallLog, SupportTicket, FieldStaff, Task, Employee, CommsLog, AccessControl, AccessRole } from './types';

export default function App() {
  // Authentication user session state
  const [userSession, setUserSession] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('crm_user_session');
    return saved ? JSON.parse(saved) : null;
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

  // SaaS multi-tenant states
  const [saasPlanId, setSaasPlanId] = useState<string>(() => {
    return localStorage.getItem('saas_active_plan_id') || 'enterprise';
  });
  const [workspaceName, setWorkspaceName] = useState<string>(() => {
    return localStorage.getItem('saas_active_workspace') || 'Expert CRM HQ';
  });

  // Core Datasets State utilizing standard local storage persistent fallbacks
  const [leads, setLeads] = useState<Lead[]>(() => {
    const saved = localStorage.getItem('crm_leads');
    return saved ? JSON.parse(saved) : INITIAL_LEADS;
  });

  const [callLogs, setCallLogs] = useState<CallLog[]>(() => {
    const saved = localStorage.getItem('crm_call_logs');
    return saved ? JSON.parse(saved) : INITIAL_CALL_LOGS;
  });

  const [supportTickets, setSupportTickets] = useState<SupportTicket[]>(() => {
    const saved = localStorage.getItem('crm_support_tickets');
    return saved ? JSON.parse(saved) : INITIAL_TICKETS;
  });

  const [fieldStaff, setFieldStaff] = useState<FieldStaff[]>(() => {
    const saved = localStorage.getItem('crm_field_staff');
    return saved ? JSON.parse(saved) : INITIAL_STAFF;
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('crm_tasks');
    return saved ? JSON.parse(saved) : INITIAL_TASKS;
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    const saved = localStorage.getItem('crm_employees');
    return saved ? JSON.parse(saved) : INITIAL_EMPLOYEES;
  });

  const [commsLogs, setCommsLogs] = useState<CommsLog[]>(() => {
    const saved = localStorage.getItem('crm_comms_logs');
    return saved ? JSON.parse(saved) : INITIAL_COMMS;
  });

  const [accessControl, setAccessControl] = useState<AccessControl>(() => {
    const saved = localStorage.getItem('crm_access_control');
    return saved ? JSON.parse(saved) : { role: 'Super Admin', permissions: INITIAL_SECURITY.permissions };
  });

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
    
    // Auto-update active role
    const defaultPermissionsMap = {
      'Super Admin': {
        viewDashboard: true, manageLeads: true, manageCalls: true, manageSupport: true,
        manageStaff: true, manageTasks: true, manageHR: true, manageComms: true, manageSecurity: true
      },
      'Sales Manager': {
        viewDashboard: true, manageLeads: true, manageCalls: true, manageSupport: false,
        manageStaff: false, manageTasks: true, manageHR: false, manageComms: true, manageSecurity: false
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
    { id: 'saas', label: 'SaaS Plan & Tenants', icon: Sparkles, permission: 'viewDashboard' },
    { id: 'leads', label: 'Lead & Sales Management', icon: Target, permission: 'manageLeads' },
    { id: 'calling', label: 'Calling Management', icon: Phone, permission: 'manageCalls' },
    { id: 'support', label: 'Customer Support Management', icon: Headphones, permission: 'manageSupport' },
    { id: 'staff', label: 'Field & Staff Management', icon: MapPin, permission: 'manageStaff' },
    { id: 'tasks', label: 'Task & Activity Management', icon: CheckSquare, permission: 'manageTasks' },
    { id: 'payroll', label: 'Payroll & HR Management', icon: CreditCard, permission: 'manageHR' },
    { id: 'comms', label: 'Communication Management', icon: MessageSquare, permission: 'manageComms' },
    { id: 'security', label: 'Security & Access Control', icon: Lock, permission: 'manageSecurity' },
  ];

  if (!userSession) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div id="app-root-container" className="flex h-screen w-screen bg-[#F1F5F9] overflow-hidden font-sans antialiased text-slate-800">
      
      {/* Floating System-Wide Notifications Toast */}
      {toast && (
        <div 
          className={`fixed top-4 right-4 z-50 p-3 rounded bg-slate-900 border border-slate-800 text-white shadow-xl flex items-center gap-3 animate-slideDown`}
        >
          <div className="p-0.5 px-1.5 rounded bg-indigo-500 text-white font-extrabold text-[10px] uppercase">SYSTEM</div>
          <span className="text-[11px] font-medium">{toast.message}</span>
        </div>
      )}

      {/* Primary Left Navigation Panel - High Density Slate-900 theme */}
      <aside 
        id="side-nav"
        className={`${sidebarOpen ? 'w-60' : 'w-0 lg:w-16'} bg-[#0F172A] text-slate-100 flex flex-col justify-between shrink-0 transition-all duration-300 z-40 relative h-full border-r border-[#1E293B]`}
      >
        <div>
          {/* Logo Brand Header Block */}
          <div className="p-4 border-b border-[#1E293B] flex items-center gap-2.5">
            <div className="flex gap-0.5 items-end h-6 shrink-0">
              <span className="w-1.5 h-4.5 bg-indigo-500 rounded-xs block"></span>
              <span className="w-1.5 h-6 bg-cyan-500 rounded-xs block"></span>
              <span className="w-1.5 h-3 bg-emerald-500 rounded-xs block"></span>
            </div>
            
            {sidebarOpen && (
              <div>
                <h1 className="text-md font-black tracking-wider leading-none text-white">EXPERT CRM</h1>
                <p className="text-[9px] text-cyan-400 font-extrabold uppercase tracking-widest mt-0.5 truncate max-w-[140px]" title={workspaceName}>{workspaceName}</p>
              </div>
            )}
          </div>

          {/* Navigation Links Index */}
          <nav className="p-2 space-y-1 mt-2">
            {navItems
              .filter(item => item.id !== 'saas' || accessControl.role === 'Super Admin')
              .map(item => {
                const Icon = item.icon;
              const isSelected = activeTab === item.id;
              const permitted = hasAccess(item.permission as any);

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => {
                    if (permitted) {
                      setActiveTab(item.id);
                    } else {
                      showToast(`Role "${accessControl.role}" restricted. Adjust permissions in Security panel.`, "warning");
                    }
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded text-left text-[11px] font-bold tracking-wide transition-all ${
                    isSelected 
                      ? 'bg-slate-800 text-indigo-400 border-l-2 border-indigo-500 font-extrabold shadow-sm' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                  } ${!permitted ? 'opacity-30 cursor-not-allowed justify-between' : ''}`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className="w-4 h-4 shrink-0" />
                    {sidebarOpen && <span className="truncate">{item.label}</span>}
                  </div>
                  
                  {sidebarOpen && permitted && <ChevronRight className="w-3 h-3 ml-auto text-slate-600" />}
                  {sidebarOpen && !permitted && <Lock className="w-3 h-3 text-slate-600 shrink-0" />}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Account Info Bar bottom */}
        <div className="p-3 border-t border-[#1E293B] bg-[#090D16]/40 shrink-0">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-2 min-w-0">
              <img 
                src={userSession?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"} 
                alt={userSession?.name || "Admin User"} 
                className="w-8 h-8 rounded-full border border-indigo-500/50 object-cover shrink-0"
                referrerPolicy="no-referrer"
              />
              {sidebarOpen && (
                <div className="min-w-0">
                  <h4 className="text-[11px] font-extrabold text-white truncate">{userSession?.name || "Admin User"}</h4>
                  <p className="text-[9px] text-[#10b981] font-bold truncate">{userSession?.role || "Administrator"}</p>
                </div>
              )}
            </div>
            
            {sidebarOpen && (
              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-rose-400 rounded transition shrink-0"
                title="Log Out Security Session"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* Main Workspace Frame container */}
      <main id="main-frame" className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Top Floating Dashboard Header */}
        <header id="app-header" className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 select-none z-30">
          <div className="flex items-center gap-3">
            <button 
              id="sidebar-trigger" 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1 hover:bg-slate-50 text-slate-500 rounded transition shrink-0"
            >
              <Menu className="w-4.5 h-4.5" />
            </button>
            <h2 className="text-xs font-extrabold text-slate-900 tracking-tight uppercase">
              {navItems.find(n => n.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input Box */}
            <div className="relative hidden md:block w-60">
              <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Quick lookup..." 
                className="w-full text-[11px] p-1.5 pl-8 bg-slate-50 border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:bg-white transition"
              />
            </div>

            {/* Notification Rings */}
            <div className="flex items-center gap-2.5 font-semibold text-slate-600">
              <div className="relative cursor-pointer hover:text-slate-950 transition p-1">
                <Bell className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                  5
                </span>
              </div>
              
              <div className="relative cursor-pointer hover:text-slate-950 transition p-1">
                <Mail className="w-4 h-4" />
                <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border border-white">
                  3
                </span>
              </div>

              <div className="cursor-pointer hover:text-slate-910 transition p-1 hidden sm:block">
                <Settings className="w-5 h-5" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Inner Workspace Panel scrolling viewport */}
        <section id="workspace-scroller" className="flex-1 overflow-y-auto p-6 md:p-8">
          {activeTab === 'dashboard' && (
            <Dashboard 
              leads={leads}
              callLogs={callLogs}
              supportTickets={supportTickets}
              fieldStaff={fieldStaff}
              tasks={tasks}
              employees={employees}
              commsLogs={commsLogs}
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
            />
          )}

          {activeTab === 'saas' && accessControl.role === 'Super Admin' && (
            <SaaSWorkspacePanel 
              currentPlanId={saasPlanId}
              onUpdatePlan={setSaasPlanId}
              onWorkspaceChange={setWorkspaceName}
              activeWorkspace={workspaceName}
              showToast={showToast}
            />
          )}

          {activeTab === 'leads' && (
            <LeadsManager 
              leads={leads}
              onAddLead={handleAddLead}
              onUpdateLeadStatus={handleUpdateLeadStatus}
            />
          )}

          <div className={activeTab === 'calling' ? 'block' : 'hidden'}>
            <CallingManager 
              callLogs={callLogs}
              onLogCall={handleLogCall}
              onBulkLogCalls={handleBulkLogCalls}
              onClearLogs={handleClearCallLogs}
              onDeleteLog={handleDeleteCallLog}
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

        {/* Global Footer Row (Matching layout screen bottom perfectly) */}
        <footer id="app-footer-row" className="bg-white border-t border-slate-150 p-4 px-6 text-slate-500 shrink-0 select-none hidden sm:block">
          <div className="grid grid-cols-4 gap-6 text-center divide-x divide-slate-100 max-w-7xl mx-auto">
            <div className="px-2">
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Centralized Data
              </h5>
              <p className="text-[9px] text-slate-400 mt-0.5">All your business data in one place</p>
            </div>
            <div className="px-2">
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Improve Productivity
              </h5>
              <p className="text-[9px] text-slate-400 mt-0.5">Streamline your core sales pipelines</p>
            </div>
            <div className="px-2">
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-500" /> Better Customer Relationship
              </h5>
              <p className="text-[9px] text-slate-400 mt-0.5">Enhance client engagement and SLA</p>
            </div>
            <div className="px-2">
              <h5 className="text-[10px] font-black text-slate-800 uppercase tracking-widest flex items-center justify-center gap-1">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> Data-Driven Decisions
              </h5>
              <p className="text-[9px] text-slate-400 mt-0.5">Make smarter business decisions with AI</p>
            </div>
          </div>
        </footer>
      </main>

      {/* Global Printing and Clipboard Copy/Export Center */}
      <PrintAndExportCenter 
        isOpen={!!printableDoc}
        onClose={() => setPrintableDoc(null)}
        document={printableDoc}
        userEmail={userSession?.email || 'expertaidtech@gmail.com'}
      />

      {/* Global Real-time Call Overlays */}
      {globalCall && globalCall.activeCallStatus === 'ringing' && globalCall.callDirection === 'Incoming' && (
        <div id="global-incoming-call-hud" className="fixed top-18 right-4 z-[9999] w-92 bg-slate-950/95 border border-emerald-500/80 rounded shadow-2xl p-4 text-white animate-pulse backdrop-blur-md">
          <div className="flex items-start gap-3">
            <div className="p-3 bg-emerald-950 border border-emerald-500 rounded-full text-emerald-400">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 font-bold uppercase block">
                🔔 Live Incoming CRM Call
              </span>
              <h4 className="text-sm font-extrabold tracking-tight text-slate-100">{globalCall.dialName}</h4>
              <p className="text-[10px] font-mono text-slate-400">{globalCall.dialNumber}</p>
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
              className="py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-emerald-500 shadow-sm shadow-emerald-900/50 cursor-pointer"
            >
              <Phone className="w-3.5 h-3.5" /> Answer & Stream
            </button>
            <button
              onClick={() => {
                if ((window as any).__crmDeclineCall) {
                  (window as any).__crmDeclineCall();
                }
              }}
              className="py-1.5 bg-red-650 hover:bg-red-700 text-white rounded text-[11px] font-bold uppercase tracking-wider flex items-center justify-center gap-1 border border-red-750 cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" /> Decline
            </button>
          </div>
        </div>
      )}

      {/* Global Background Active Call Status Strip */}
      {globalCall && globalCall.activeCallStatus === 'connected' && activeTab !== 'calling' && (
        <div id="global-active-call-strip" className="fixed bottom-4 right-4 z-[9998] w-80 bg-slate-950/95 border border-indigo-500/80 rounded-lg shadow-xl p-3 text-white backdrop-blur-md flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
            <div>
              <span className="text-[8px] font-mono tracking-wider text-indigo-400 font-bold uppercase block">
                ☎️ Connected
              </span>
              <h4 className="text-[11px] font-bold text-slate-200 truncate max-w-[140px]">
                {globalCall.dialName}
              </h4>
              <span className="text-[10px] font-mono text-slate-400">
                {formatCallTime(globalCall.callDuration)}
              </span>
            </div>
          </div>
          <div className="flex gap-1.5">
            <button
              onClick={() => setActiveTab('calling')}
              className="px-2.5 py-1 bg-indigo-650 hover:bg-indigo-750 text-white text-[10px] font-bold rounded uppercase tracking-wider border border-indigo-500 cursor-pointer"
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
              className="p-1 bg-red-650 hover:bg-red-750 text-white rounded border border-red-700 cursor-pointer"
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
