import React, { useState, useEffect } from 'react';
import { 
  CheckSquare, Calendar, Plus, Search, Filter, Clock, 
  Trash2, Play, CheckCircle2, AlertCircle, Bookmark,
  User, Users, Video, MapPin, ExternalLink, HelpCircle,
  Activity, ArrowRight, Shield, UserPlus, Check, Sliders, ChevronRight, Lock, 
  Sparkles, Trash, VideoOff, Info, CheckCircle, Printer
} from 'lucide-react';
import { Task, Lead, FieldStaff, Employee, AccessControl, ActivityHistoryLog } from '../types';

interface TaskManagerProps {
  tasks: Task[];
  leads: Lead[];
  fieldStaff: FieldStaff[];
  employees: Employee[];
  accessControl?: AccessControl;
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTaskStatus: (id: string, newStatus: Task['status']) => void;
  onDeleteTask: (id: string) => void;
  onTasksUpdate?: React.Dispatch<React.SetStateAction<Task[]>>;
}

type TaskTab = 'tasks' | 'schedule' | 'followup' | 'history';

export default function TaskManager({
  tasks,
  leads,
  fieldStaff,
  employees,
  accessControl,
  onAddTask,
  onUpdateTaskStatus,
  onDeleteTask,
  onTasksUpdate
}: TaskManagerProps) {
  // Extract permissions
  const activeRole = accessControl?.role || 'Super Admin';
  const hasManagePermission = accessControl?.permissions?.manageTasks !== false || activeRole === 'Super Admin';

  const [activeTab, setActiveTab] = useState<TaskTab>('tasks');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('All');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('All');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Assignment states
  const [activeAssigneeDropdownTaskId, setActiveAssigneeDropdownTaskId] = useState<string | null>(null);

  // Task Creation States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [clientName, setClientName] = useState('');
  const [time, setTime] = useState('10:00 AM');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('High');
  const [assignedTo, setAssignedTo] = useState('');
  const [taskType, setTaskType] = useState<'Task' | 'Meeting' | 'Follow-up'>('Task');
  const [description, setDescription] = useState('');

  // Meeting Scheduling States
  const [meetingLeadId, setMeetingLeadId] = useState('');
  const [meetingTitle, setMeetingTitle] = useState('');
  const [meetingDate, setMeetingDate] = useState('2026-06-18');
  const [meetingTime, setMeetingTime] = useState('02:00 PM');
  const [meetingDuration, setMeetingDuration] = useState('45 mins');
  const [meetingType, setMeetingType] = useState<'Virtual' | 'Physical'>('Virtual');
  const [meetingLocation, setMeetingLocation] = useState('');
  const [meetingAgenda, setMeetingAgenda] = useState('');
  const [meetingAssignee, setMeetingAssignee] = useState('');

  // Search filter for Lead Follow-ups
  const [followupSearch, setFollowupSearch] = useState('');

  // 1. Activity History Persistence Setup
  const [activityHistory, setActivityHistory] = useState<ActivityHistoryLog[]>(() => {
    const saved = localStorage.getItem('crm_activity_history');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'ACT-3021',
        timestamp: new Date(Date.now() - 4 * 3600000).toLocaleString(),
        type: 'Task',
        action: 'Task Scheduled',
        details: 'Initial introduction call with Siddharth Sen scheduled.',
        performedBy: 'Super Admin'
      },
      {
        id: 'ACT-3022',
        timestamp: new Date(Date.now() - 3 * 3600000).toLocaleString(),
        type: 'Assignment',
        action: 'Representative Assigned',
        details: 'Task "Site Inspection & Audit" assigned to Amit Kumar.',
        performedBy: 'Sales Manager'
      },
      {
        id: 'ACT-3023',
        timestamp: new Date(Date.now() - 1 * 3600000).toLocaleString(),
        type: 'Follow-up',
        action: 'Lead Follow-up Set',
        details: 'Prompt follow-up logged for Aman Varma under stage Proposal.',
        performedBy: 'Super Admin'
      }
    ];
  });

  useEffect(() => {
    localStorage.setItem('crm_activity_history', JSON.stringify(activityHistory));
  }, [activityHistory]);

  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const logActivity = (type: ActivityHistoryLog['type'], action: string, details: string) => {
    const newLog: ActivityHistoryLog = {
      id: `ACT-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toLocaleString(),
      type,
      action,
      details,
      performedBy: activeRole
    };
    setActivityHistory(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('crm_activity_history', JSON.stringify(updated));
      return updated;
    });
  };

  // Merge Field Staff & Employees for the Assignee options
  const assigneesList = [
    ...fieldStaff.map(s => ({ id: s.id, name: s.name, role: `Field Staff (${s.status})`, type: 'Staff' as const })),
    ...employees.map(e => ({ id: e.id, name: e.name, role: `${e.role} (${e.department})`, type: 'Employee' as const }))
  ];

  // Helper validation guard for permissions
  const checkPermission = (actionName: string): boolean => {
    if (!hasManagePermission) {
      triggerToast(`Permission Restricted: "${activeRole}" does not have privileges to execute: ${actionName}`, 'error');
      logActivity('StatusUpdate', 'Security Override Triggers Denied', `Unauthorized attempt by role "${activeRole}" to perform: "${actionName}"`);
      return false;
    }
    return true;
  };

  // Handle General Task Submission
  const handleTaskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    if (!checkPermission('Create Task')) return;

    const taskData: Omit<Task, 'id'> = {
      title,
      clientName: clientName || undefined,
      time,
      status: 'Pending',
      priority,
      description,
      assignedTo: assignedTo || undefined,
      type: taskType,
      createdAt: new Date().toLocaleDateString()
    };

    onAddTask(taskData);
    
    // Log Activity
    logActivity('Task', 'Task Scheduled', `Created task "${title}"${assignedTo ? ` assigned to ${assignedTo}` : ''}.`);
    triggerToast(`Task "${title}" created successfully!`, 'success');

    // Reset Form
    setTitle('');
    setClientName('');
    setTime('10:00 AM');
    setPriority('High');
    setAssignedTo('');
    setTaskType('Task');
    setDescription('');
    setIsFormOpen(false);
  };

  // Handle inline assignment selection change
  const handleAssignTask = (taskId: string, assigneeName: string) => {
    if (!checkPermission('Assign Task')) return;

    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    if (onTasksUpdate) {
      onTasksUpdate(prev => prev.map(t => {
        if (t.id === taskId) {
          return { ...t, assignedTo: assigneeName };
        }
        return t;
      }));
      logActivity('Assignment', 'Representative Assigned', `Reassigned task "${targetTask.title}" to ${assigneeName}.`);
      triggerToast(`Assigned task to ${assigneeName}`, 'success');
    }
    setActiveAssigneeDropdownTaskId(null);
  };

  // Handle dynamic status update
  const handleTaskStatusChange = (taskId: string, currentStatus: Task['status'], nextStatus: Task['status']) => {
    if (!checkPermission('Update Task Status')) return;

    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    onUpdateTaskStatus(taskId, nextStatus);
    logActivity(
      'StatusUpdate', 
      'Task Status Advanced', 
      `Changed task "${targetTask.title}" from "${currentStatus}" to "${nextStatus}".`
    );
    triggerToast(`Advanced status to "${nextStatus}"`, 'success');
  };

  // Handle task removal
  const handleTaskDeletion = (taskId: string) => {
    if (!checkPermission('Delete Task')) return;

    const targetTask = tasks.find(t => t.id === taskId);
    const titleVal = targetTask ? targetTask.title : 'Task';

    onDeleteTask(taskId);
    logActivity('Deletion', 'Task Purged', `Deleted scheduled activity "${titleVal}" from systems.`);
    triggerToast(`Activity purged from system`, 'warning');
  };

  // 2. MEETING SCHEDULER SUBMITTER
  const handleMeetingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!meetingTitle || !meetingLeadId) {
      triggerToast('Provide all required variables for meeting scheduling', 'error');
      return;
    }

    if (!checkPermission('Schedule Meeting')) return;

    const targetLead = leads.find(l => l.id === meetingLeadId);
    if (!targetLead) return;

    const meetingLink = meetingType === 'Virtual' ? `https://meet.google.com/crm-${Date.now().toString().slice(-4)}-lzk` : undefined;
    const meetingLocInfo = meetingType === 'Physical' ? (meetingLocation || 'Client Corporate OfficeHQ') : undefined;

    const scheduledTime = `${meetingDate} at ${meetingTime}`;

    // Add as a task
    const meetingTask: Omit<Task, 'id'> = {
      title: `[Meeting] ${meetingTitle}`,
      clientName: targetLead.name,
      time: scheduledTime,
      status: 'Pending',
      priority: 'High',
      type: 'Meeting',
      assignedTo: meetingAssignee || undefined,
      description: meetingAgenda || `Standard synchronization agenda with executive team regarding SLA and pricing scope.`,
      meetingDetails: {
        link: meetingLink,
        location: meetingLocInfo,
        date: meetingDate,
        duration: meetingDuration,
        type: meetingType,
        agenda: meetingAgenda
      },
      createdAt: new Date().toLocaleDateString()
    };

    onAddTask(meetingTask);
    
    // Log action
    logActivity(
      'Meeting', 
      'Meeting Scheduled', 
      `Scheduled ${meetingType.toLowerCase()} meeting "${meetingTitle}" with lead ${targetLead.name} (${targetLead.company}) for ${scheduledTime}.`
    );
    
    triggerToast(`Meeting scheduled with ${targetLead.name}!`, 'success');

    // Reset Meeting Fields
    setMeetingTitle('');
    setMeetingLeadId('');
    setMeetingAgenda('');
    setMeetingLocation('');
    setMeetingAssignee('');
    setActiveTab('tasks');
  };

  // 3. LEAD QUICK FOLLOW-UP DISPATCHER
  const handleQuickFollowup = (lead: Lead) => {
    if (!checkPermission('Schedule Follow-Up')) return;

    const nextContact = new Date(Date.now() + 2 * 24 * 3600000).toLocaleDateString();

    const followupTask: Omit<Task, 'id'> = {
      title: `[Follow-up] Nurture Outreach: ${lead.name}`,
      clientName: lead.name,
      time: 'In 48 hours',
      status: 'Pending',
      priority: 'Medium',
      type: 'Follow-up',
      description: `Target lead in stage "${lead.status}" for ${lead.company}. Trigger immediate callback regarding proposed budget: $${lead.value.toLocaleString()}.`,
      followUpDetails: {
        stage: lead.status,
        nextContactDate: nextContact,
        leadId: lead.id,
        lastResponse: lead.notes || 'Inbound interest logged.'
      },
      createdAt: new Date().toLocaleDateString()
    };

    onAddTask(followupTask);

    logActivity('Follow-up', 'Lead Follow-up Set', `Set automatic touchpoint for ${lead.name} (${lead.company}) currently in ${lead.status} pipeline.`);
    triggerToast(`Follow-up scheduled with ${lead.name}!`, 'success');
  };

  const handleClearHistory = () => {
    if (!checkPermission('Purge Activity Audits')) return;
    setActivityHistory([]);
    triggerToast('System audit timeline cleared.', 'warning');
  };

  // Filtrations for the list
  const filteredTasks = tasks.filter(t => {
    const matchesSearch = 
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (t.clientName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.assignedTo || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = selectedStatusFilter === 'All' || t.status === selectedStatusFilter;
    
    const taskTypeMapped = t.type || 'Task';
    const matchesType = selectedTypeFilter === 'All' || taskTypeMapped === selectedTypeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div id="company-activity-management-system" className="space-y-6 font-sans">
      
      {/* Toast Alert Widget */}
      {toast && (
        <div className={`fixed bottom-5 right-5 border p-4 rounded-xl text-white flex items-start gap-3 shadow-2xl z-55 animate-fadeIn max-w-sm ${
          toast.type === 'success' ? 'bg-slate-900 border-indigo-500' :
          toast.type === 'error' ? 'bg-rose-950 border-rose-500' : 'bg-slate-900 border-amber-500'
        }`}>
          <div>
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-indigo-400 shrink-0" /> :
             toast.type === 'error' ? <Lock className="w-5 h-5 text-rose-400 shrink-0" /> :
             <AlertCircle className="w-5 h-5 text-amber-400 shrink-0" />}
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider font-mono">
              {toast.type === 'success' ? 'Scheduler Action Approved' :
               toast.type === 'error' ? 'Security Gate Guarded' : 'System Diagnostic Alert'}
            </span>
            <p className="text-xs font-semibold leading-normal">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white shrink-0 text-xs font-bold font-mono">×</button>
        </div>
      )}

      {/* Header operations bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl shadow-sm">
            <CheckSquare className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <h2 className="text-md font-black text-slate-900 tracking-tight">Activities & Scheduler Workspace</h2>
            <p className="text-xs text-slate-400">Manage task assignments, schedule Zoom/physical client meetings, trigger auto follow-ups, and audit activity feeds.</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Security Scope dynamic status */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 font-mono text-[10px] bg-slate-50 text-slate-550 border border-slate-200/60 rounded-lg">
            <Shield className="w-3.5 h-3.5 text-indigo-505" />
            <span className="font-bold">{activeRole} Level</span>
          </div>

          <button 
            onClick={() => {
              if ((window as any).__triggerGlobalPrint) {
                (window as any).__triggerGlobalPrint(
                  "Operational Active Tasks Status Report",
                  "task_report",
                  {
                    tasks: tasks,
                    timestamp: new Date().toLocaleString(),
                    statusFilter: selectedStatusFilter || 'All',
                    typeFilter: selectedTypeFilter || 'All'
                  }
                );
              }
            }}
            className="px-3 py-2 rounded-xl text-xs font-bold bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm"
          >
            <Printer className="w-4 h-4 text-slate-500" /> Print Summary
          </button>

          <button 
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white transition flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Create Activity Task
          </button>
        </div>
      </div>

      {/* Primary Navigation System Menu in standard design */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
        <button
          onClick={() => setActiveTab('tasks')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'tasks' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-500" /> Active Tasks & Assignment
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'schedule' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Calendar className="w-4 h-4 text-sky-500" /> Meeting Scheduler Center
        </button>

        <button
          onClick={() => setActiveTab('followup')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'followup' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <UserPlus className="w-4 h-4 text-emerald-500" /> Lead Follow-up Tracking
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'history' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Activity className="w-4 h-4 text-rose-500 animate-pulse" /> Activity History Feed
        </button>
      </div>


      {/* ===================== TAB: TASKS BOARD WITH ASSIGNMENTS ===================== */}
      {activeTab === 'tasks' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Filters column on the Left */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Summary Numbers */}
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-5 rounded-2xl text-white space-y-4">
              <span className="text-[10px] font-black uppercase text-indigo-250 tracking-wider font-mono">Operations Tracker</span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-1 px-1.5 bg-white/10 rounded-xl">
                  <span className="text-sm font-black block">{tasks.length}</span>
                  <span className="text-[9px] text-indigo-200">Total</span>
                </div>
                <div className="p-1 px-1.5 bg-amber-500/15 border border-amber-500/20 rounded-xl">
                  <span className="text-sm font-black text-amber-305 block">{tasks.filter(t=>t.status==='Pending').length}</span>
                  <span className="text-[9px] text-amber-250">Pending</span>
                </div>
                <div className="p-1 px-1.5 bg-emerald-500/15 border border-emerald-500/20 rounded-xl">
                  <span className="text-sm font-black text-emerald-305 block">{tasks.filter(t=>t.status==='Completed').length}</span>
                  <span className="text-[9px] text-emerald-250">Done</span>
                </div>
              </div>
              <div className="pt-2 border-t border-indigo-850 flex justify-between items-center text-[10px] text-indigo-200">
                <span className="font-semibold">Assignment fillrate:</span>
                <span className="font-bold underline">{Math.round((tasks.filter(t=>t.assignedTo).length / (tasks.length || 1)) * 100)}%</span>
              </div>
            </div>

            {/* Dynamic filter panel cards */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150/70 shadow-xxs space-y-5">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">SLA Dispatch Filters</h3>
              
              {/* Text Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Query task indices, clients, staff..."
                  className="w-full text-xs p-2 pl-8 border border-slate-205 rounded-lg bg-slate-50 focus:bg-white focus:ring-1 focus:ring-purple-400 outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {/* Status Select list */}
              <div className="space-y-1.5 text-xs">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Filter Status</label>
                <div className="flex flex-col gap-1">
                  {['All', 'Pending', 'In Progress', 'Completed'].map(st => (
                    <button
                      key={st}
                      onClick={() => setSelectedStatusFilter(st)}
                      className={`flex justify-between items-center px-3 py-1.5 rounded-lg font-medium transition ${
                        selectedStatusFilter === st ? 'bg-purple-50 text-purple-700 font-extrabold' : 'text-slate-650 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${st === 'Pending' ? 'bg-amber-400' : st === 'In Progress' ? 'bg-sky-500' : st === 'Completed' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                        {st} Queue
                      </span>
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded-full font-bold text-slate-505">
                        {st === 'All' ? tasks.length : tasks.filter(t => t.status === st).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Task Type Filters */}
              <div className="space-y-1.5 text-xs pt-3 border-t border-slate-100">
                <label className="block text-[10px] text-slate-400 font-extrabold uppercase tracking-wide">Category Filters</label>
                <div className="flex flex-wrap gap-1">
                  {['All', 'Task', 'Meeting', 'Follow-up'].map(tp => (
                    <button
                      key={tp}
                      onClick={() => setSelectedTypeFilter(tp)}
                      className={`px-3 py-1.5 rounded-lg text-xxs font-extrabold border transition ${
                        selectedTypeFilter === tp ? 'bg-slate-900 border-slate-900 text-white shadow-xs' : 'bg-white border-slate-200 text-slate-655 hover:bg-slate-50'
                      }`}
                    >
                      {tp === 'Task' ? '🛠️ Tasks' : tp === 'Meeting' ? '🤝 Meetings' : tp === 'Follow-up' ? '📈 Follow-ups' : '🗂️ All Categories'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-405 space-y-2">
                <span className="font-bold text-slate-600 block">Priority Indicators:</span>
                <div className="flex gap-3">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> High Priority</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Medium</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span> Low</span>
                </div>
              </div>

            </div>

            <div className="bg-slate-50 p-4.5 rounded-2xl border border-slate-200 text-xs text-slate-500 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-slate-700">
                <Info className="w-4 h-4 text-purple-600" />
                <span>Task Allocation Guide</span>
              </div>
              <p className="leading-relaxed">To delegate an ongoing task to an employee or field technician offline, click directly on the assigned badge in the task card's metadata area.</p>
            </div>

          </div>

          {/* Active tasks core dispatcher panel on the Right */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="bg-white p-5 rounded-2xl border border-slate-150/70 shadow-xxs">
              <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-50">
                <div>
                  <h3 className="text-xs font-black text-slate-450 uppercase tracking-widest block">Active Tasks Matrix</h3>
                  <p className="text-[10px] text-slate-400">Manage real-time execution pipelines configured for field agents and staff representatives.</p>
                </div>
                <span className="text-[10px] font-mono bg-purple-50 text-purple-700 font-extrabold px-2 py-0.5 rounded border border-purple-150 shadow-xxs">
                  Showing {filteredTasks.length} elements
                </span>
              </div>

              {filteredTasks.length === 0 ? (
                <div className="h-64 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
                  <CheckSquare className="w-12 h-12 mb-3 text-slate-300 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">No matching activities matching criteria</span>
                  <p className="text-xxs text-slate-400 mt-1">Try resetting filters to show complete operational database.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {filteredTasks.map(task => {
                    const mappedType = task.type || 'Task';
                    return (
                      <div 
                        key={task.id}
                        className="p-4.5 rounded-2xl border border-slate-150 hover:border-slate-300 bg-white hover:shadow-xs transition flex flex-col gap-3.5 relative"
                      >
                        {/* Upper metadata row */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex gap-3">
                            {/* Color indication square */}
                            <div className={`w-3 h-3 rounded-full mt-1 shrink-0 ${
                              task.priority === 'High' ? 'bg-rose-500 ring-4 ring-rose-50' :
                              task.priority === 'Medium' ? 'bg-amber-400 ring-4 ring-amber-50' : 
                              'bg-slate-400 ring-4 ring-slate-50'
                            }`} title={`${task.priority} Priority`} />

                            <div>
                              <div className="flex flex-wrap items-center gap-1.5">
                                <h4 className={`text-xs font-extrabold text-slate-900 ${task.status === 'Completed' ? 'line-through text-slate-400' : ''}`}>
                                  {task.title}
                                </h4>
                                
                                <span className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase font-mono border ${
                                  mappedType === 'Meeting' ? 'bg-sky-50 text-sky-700 border-sky-150' :
                                  mappedType === 'Follow-up' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                                  'bg-slate-50 text-slate-600 border-slate-200'
                                }`}>
                                  {mappedType === 'Meeting' ? '🤝 Meeting' : mappedType === 'Follow-up' ? '📈 Follow-up' : '🛠️ Task'}
                                </span>
                              </div>

                              {task.clientName && (
                                <p className="text-[10px] text-slate-400 font-extrabold mt-0.5 flex items-center gap-1">
                                  <User className="w-3 h-3 mt-0.5 text-slate-450" /> Client: {task.clientName}
                                </p>
                              )}
                              
                              <p className="text-xxs text-slate-500 font-medium leading-relaxed mt-1.5 bg-slate-50/80 p-2 rounded-lg border border-slate-150/40">{task.description}</p>
                            </div>
                          </div>

                          {/* Top corner status bubble */}
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase font-mono ${
                            task.status === 'Pending' ? 'bg-amber-50 text-amber-705 border border-amber-100' :
                            task.status === 'In Progress' ? 'bg-blue-50 text-blue-705 border border-blue-101' :
                            'bg-emerald-50 text-emerald-705 border border-emerald-101'
                          }`}>
                            {task.status}
                          </span>
                        </div>

                        {/* Meeting virtual triggers */}
                        {mappedType === 'Meeting' && task.meetingDetails && (
                          <div className="bg-sky-50/50 p-2.5 rounded-xl border border-sky-150/50 flex flex-wrap items-center justify-between gap-2.5 text-xs">
                            <div className="flex items-center gap-1.5 text-sky-850 font-bold">
                              {task.meetingDetails.type === 'Virtual' ? (
                                <>
                                  <Video className="w-4 h-4 text-sky-600 animate-pulse" />
                                  <span>Google Meet Integration Bridge Ready</span>
                                </>
                              ) : (
                                <>
                                  <MapPin className="w-4 h-4 text-sky-600" />
                                  <span>On Site Location: <span className="font-mono text-slate-600">{task.meetingDetails.location}</span></span>
                                </>
                              )}
                            </div>

                            <div className="flex gap-2">
                              {task.meetingDetails.link ? (
                                <a 
                                  href={task.meetingDetails.link} 
                                  target="_blank" 
                                  rel="noreferrer"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    triggerToast('Simulating secure virtual meeting handshake. Google Meet Node routing active.', 'info');
                                  }}
                                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-[10.5px] font-black flex items-center gap-1 transition"
                                >
                                  <ExternalLink className="w-3 h-3" /> Connect Live
                                </a>
                              ) : (
                                <button 
                                  onClick={() => triggerToast(`Navigating details via coordinates: ${task.meetingDetails?.location}`, 'info')}
                                  className="px-2.5 py-1 bg-white border border-sky-200 text-sky-700 hover:bg-sky-50 rounded-lg text-[10.5px] font-black flex items-center gap-1 transition"
                                >
                                  <MapPin className="w-3 h-3" /> View Route
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Low-tier controls & assignment details */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100 mt-1">
                          
                          {/* Assignment Pill selector trigger */}
                          <div id={`assign-parent-${task.id}`} className="relative">
                            <span className="text-[9px] uppercase font-black tracking-wider text-slate-400 block mb-1">Delegated Assignee</span>
                            {task.assignedTo ? (
                              <button 
                                onClick={() => setActiveAssigneeDropdownTaskId(activeAssigneeDropdownTaskId === task.id ? null : task.id)}
                                className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-50 hover:bg-slate-100 border border-slate-200/70 text-slate-800 transition"
                              >
                                <div className="w-4.5 h-4.5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-[10px] font-mono uppercase font-black">
                                  {task.assignedTo.slice(0, 2)}
                                </div>
                                <span className="font-extrabold">{task.assignedTo}</span>
                                <ChevronRight className="w-3.5 h-3.5 text-slate-400 rotate-90" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => setActiveAssigneeDropdownTaskId(activeAssigneeDropdownTaskId === task.id ? null : task.id)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-purple-700 hover:bg-purple-100 border border-dashed border-purple-200 transition"
                              >
                                <UserPlus className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                                <span>No Representative Assigned</span>
                              </button>
                            )}

                            {/* Inline popover selector floating */}
                            {activeAssigneeDropdownTaskId === task.id && (
                              <div className="absolute left-0 bottom-full mb-1.5 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-40 p-2.5 space-y-1.5 animate-fadeIn">
                                <div className="flex justify-between items-center text-[10px] text-slate-400 pb-1.5 border-b border-slate-800 px-1">
                                  <span className="font-extrabold uppercase font-mono tracking-wider">Select Corporate Assignee</span>
                                  <button onClick={() => setActiveAssigneeDropdownTaskId(null)} className="text-white">×</button>
                                </div>
                                <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                                  {assigneesList.map(item => (
                                    <button
                                      key={item.id}
                                      onClick={() => handleAssignTask(task.id, item.name)}
                                      className="w-full text-left p-1.5 hover:bg-slate-800 rounded-lg text-xs font-extrabold text-white flex justify-between items-center transition"
                                    >
                                      <span>{item.name}</span>
                                      <span className="text-[9px] text-indigo-350 font-medium font-mono block max-w-28 truncate">{item.role}</span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 self-stretch sm:self-auto pt-2 sm:pt-0">
                            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold text-slate-400">
                              <Clock className="w-3.5 h-3.5 text-slate-450 shrink-0" /> 
                              <span>Timeframe: <span className="text-slate-700 font-extrabold">{task.time}</span></span>
                            </div>

                            <div className="flex items-center gap-1.5 font-bold">
                              {task.status !== 'Completed' ? (
                                <>
                                  {task.status === 'Pending' ? (
                                    <button 
                                      onClick={() => handleTaskStatusChange(task.id, 'Pending', 'In Progress')}
                                      className="px-3 py-1.5 text-xxs bg-indigo-50 border border-indigo-150 text-indigo-700 hover:bg-indigo-100 rounded-xl flex items-center gap-1 shadow-xxs transition font-extrabold"
                                    >
                                      <Play className="w-3.5 h-3.5 text-indigo-650" /> Start Task
                                    </button>
                                  ) : (
                                    <button 
                                      onClick={() => handleTaskStatusChange(task.id, 'In Progress', 'Completed')}
                                      className="px-3 py-1.5 text-xxs bg-emerald-50 border border-emerald-150 text-emerald-700 hover:bg-emerald-100 rounded-xl flex items-center gap-1 shadow-xxs transition font-extrabold"
                                    >
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-650" /> Mark Complete
                                    </button>
                                  )}
                                </>
                              ) : (
                                <span className="px-3 py-1.5 text-xxs bg-slate-50 border border-slate-200 text-slate-440 rounded-xl font-black uppercase font-mono tracking-wider flex items-center gap-1 shadow-inner select-none text-[10px]">
                                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Finished
                                </span>
                              )}

                              <button 
                                onClick={() => handleTaskDeletion(task.id)}
                                className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                                title="Delete task log"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>

        </div>
      )}


      {/* ===================== TAB: MEETING SCHEDULER CENTER ===================== */}
      {activeTab === 'schedule' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Scheduling form inside */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-150/70 shadow-xxs">
            <div className="pb-3 border-b border-slate-100 mb-5">
              <h3 className="text-xs font-black text-slate-900 uppercase">Interactive Meeting Planner</h3>
              <p className="text-xs text-slate-400">Schedule physical walk-ins or virtual customer support / billing negotiation calls seamlessly.</p>
            </div>

            <form onSubmit={handleMeetingSubmit} className="space-y-4 text-xs font-semibold">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Target Client Lead *</label>
                  <select 
                    required
                    value={meetingLeadId}
                    onChange={(e) => {
                      setMeetingLeadId(e.target.value);
                      const selected = leads.find(l=>l.id === e.target.value);
                      if (selected) {
                        setMeetingTitle(`Technical Review: ${selected.company}`);
                        setMeetingAgenda(`Corporate onboarding discussion aligning technical requirements & support SLA timelines for ${selected.name}'s fleet.`);
                      }
                    }}
                    className="w-full border border-slate-205 rounded-xl p-2.5 bg-white text-slate-800"
                  >
                    <option value="">-- Choose Active Client Lead --</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.id}>
                        👤 {lead.name} ({lead.company}) - Stage: {lead.status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-455 tracking-wider mb-1">Meeting Title *</label>
                  <input 
                    type="text" required
                    placeholder="e.g. Technical onboarding specs review"
                    value={meetingTitle}
                    onChange={(e) => setMeetingTitle(e.target.value)}
                    className="w-full border border-slate-205 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-sky-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Meeting Date</label>
                  <input 
                    type="date"
                    value={meetingDate}
                    onChange={(e) => setMeetingDate(e.target.value)}
                    className="w-full border border-slate-205 rounded-xl p-2.5 bg-white text-slate-800"
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Timeslot</label>
                  <input 
                    type="text"
                    placeholder="e.g. 02:30 PM"
                    value={meetingTime}
                    onChange={(e) => setMeetingTime(e.target.value)}
                    className="w-full border border-slate-205 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Duration Block</label>
                  <select 
                    value={meetingDuration}
                    onChange={(e) => setMeetingDuration(e.target.value)}
                    className="w-full border border-slate-205 rounded-xl p-2.5 bg-white text-slate-800"
                  >
                    <option value="15 mins">15 mins checkin</option>
                    <option value="30 mins">30 mins briefing</option>
                    <option value="45 mins">45 mins core review</option>
                    <option value="60 mins">60 mins pitch walk-through</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Assigned Support Staff / Facilitator</label>
                  <select 
                    value={meetingAssignee}
                    onChange={(e) => setMeetingAssignee(e.target.value)}
                    className="w-full border border-slate-205 rounded-xl p-2.5 bg-white text-slate-800"
                  >
                    <option value="">-- Let System Select (Self) --</option>
                    {assigneesList.map(staff => (
                      <option key={staff.id} value={staff.name}>{staff.name} ({staff.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Meeting Venue/Medium</label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMeetingType('Virtual');
                        setMeetingLocation('');
                      }}
                      className={`flex-1 py-2.5 rounded-xl border text-center transition flex justify-center items-center gap-1 ${
                        meetingType === 'Virtual' ? 'bg-sky-50 border-sky-400 text-sky-700 font-extrabold' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <Video className="w-4 h-4 shrink-0" /> virtual Google Meet
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMeetingType('Physical');
                        setMeetingLocation('Aman Varma Corp Hub, Delhi');
                      }}
                      className={`flex-1 py-2.5 rounded-xl border text-center transition flex justify-center items-center gap-1 ${
                        meetingType === 'Physical' ? 'bg-indigo-50 border-indigo-400 text-indigo-700 font-extrabold' : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      <MapPin className="w-4 h-4 shrink-0" /> physical Office Visit
                    </button>
                  </div>
                </div>
              </div>

              {meetingType === 'Physical' && (
                <div className="animate-fadeIn">
                  <label className="block text-[9.5px] font-black uppercase text-slate-400 tracking-wider mb-1">Meeting Location Address</label>
                  <input 
                    type="text" 
                    value={meetingLocation}
                    onChange={(e) => setMeetingLocation(e.target.value)}
                    placeholder="e.g. Ground Floor, Cyber Park Sector-15 Gurgaon"
                    className="w-full border border-slate-205 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">SLA Meeting Agenda & Objectives</label>
                <textarea 
                  rows={3}
                  value={meetingAgenda}
                  onChange={(e) => setMeetingAgenda(e.target.value)}
                  placeholder="Outline core discussion objectives, required materials, and compliance standards to preview..."
                  className="w-full border border-slate-205 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setMeetingTitle('');
                    setMeetingLeadId('');
                  }}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition"
                >
                  Clear Fields
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-black shadow-md flex items-center gap-1.5 transition"
                >
                  <Calendar className="w-4 h-4" /> Book & Auto-schedule Event
                </button>
              </div>

            </form>
          </div>

          {/* Quick info panel on Right */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Real-time calendar mockup list */}
            <div className="bg-white p-5 rounded-2xl border border-slate-150/70 shadow-xxs">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-3 font-mono">Today's Meeting Calendar</span>
              
              <div className="space-y-3">
                {tasks.filter(t => t.type === 'Meeting').length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <VideoOff className="w-10 h-10 mx-auto text-slate-300 opacity-60 mb-2" />
                    <p className="text-xs font-bold text-slate-500">No scheduled meetings</p>
                    <p className="text-xxs text-slate-400 mt-0.5">Use the planner on the left to initiate client booking pipelines.</p>
                  </div>
                ) : (
                  tasks.filter(t => t.type === 'Meeting').map(m => (
                    <div key={m.id} className="p-3 border border-slate-150 rounded-xl bg-slate-50/50 hover:bg-white hover:border-slate-350 transition space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{m.title}</h4>
                          <span className="text-[9.5px] text-slate-400 font-extrabold block">With {m.clientName || 'General Client'}</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 font-bold shrink-0">{m.time}</span>
                      </div>
                      
                      <div className="flex items-center justify-between gap-2.5 pt-2 border-t border-slate-150/50 text-[11px] text-slate-500">
                        <span className="font-semibold text-slate-600">Assignee: <span className="font-extrabold text-indigo-650">{m.assignedTo || 'Unassigned'}</span></span>
                        
                        {m.meetingDetails?.type === 'Virtual' ? (
                          <span className="text-sky-600 font-bold flex items-center gap-1">
                            <Video className="w-3.5 h-3.5" /> Virtual Meet
                          </span>
                        ) : (
                          <span className="text-indigo-600 font-bold flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> Office Venue
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Simulated Zoom Video Bridge Promo Card */}
            <div className="bg-slate-950 p-6 rounded-2xl text-white relative overflow-hidden">
              <div className="absolute right-0 bottom-0 opacity-10">
                <Calendar className="w-48 h-48" />
              </div>

              <div className="space-y-3.5 relative z-10">
                <div className="px-2.5 py-0.5 bg-sky-500/10 border border-sky-400/25 rounded-md text-[9px] font-black uppercase tracking-widest text-sky-400 font-mono w-max">
                  Enterprise Integration Ready
                </div>
                
                <h3 className="text-md font-black tracking-tight leading-snug">Google Meet & Zoom Telephony Handshake</h3>
                <p className="text-[11px] text-slate-400 leading-relaxed">Schedule a virtual walkthrough. The system will automatically instantiate a sandbox bridging terminal and mail credentials to attendees.</p>

                <div className="flex items-center gap-1.5 pt-1.5 text-[10.5px] text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>Interactive routing server: ONLINE</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}


      {/* ===================== TAB: LEAD FOLLOW-UP TRACKING ===================== */}
      {activeTab === 'followup' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-150/70 shadow-xxs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase">Leads Pipeline Follow-up Core</h3>
              <p className="text-xs text-slate-400">Track contact reminders, outstanding proposals, and nudge qualification stages to prevent deals from getting cold.</p>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search leads search indices..."
                className="text-xs p-1.5 pl-8 border border-slate-205 rounded-lg bg-slate-50 focus:bg-white outline-none w-52 sm:w-64"
                value={followupSearch}
                onChange={(e) => setFollowupSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-650">
              <thead>
                <tr className="bg-slate-50 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="p-3">Client Contact / Company</th>
                  <th className="p-3 text-center">Pipeline Status</th>
                  <th className="p-3 text-right">Proposed Value</th>
                  <th className="p-3 text-center">Touchpoint Audit</th>
                  <th className="p-3 text-center">Action Tracker</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {leads
                  .filter(l => l.name.toLowerCase().includes(followupSearch.toLowerCase()) || l.company.toLowerCase().includes(followupSearch.toLowerCase()))
                  .map(lead => {
                    // Check if there is already a future follow-up task scheduled
                    const existingFollowTask = tasks.some(t => {
                      const lowerTitle = t.title.toLowerCase();
                      return t.clientName?.toLowerCase() === lead.name.toLowerCase() && 
                             (lowerTitle.includes('follow-up') || lowerTitle.includes('meeting'));
                    });

                    return (
                      <tr key={lead.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-3">
                          <div className="font-extrabold text-slate-900 text-xs">{lead.name}</div>
                          <div className="text-[10px] text-slate-400">{lead.company} • {lead.email}</div>
                        </td>

                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase select-none ${
                            lead.status === 'Won' ? 'bg-emerald-50 text-emerald-705 border border-emerald-100' :
                            lead.status === 'Proposal' ? 'bg-sky-50 text-sky-705 border border-sky-101' :
                            lead.status === 'Negotiation' ? 'bg-purple-50 text-purple-705 border border-purple-101' : 
                            'bg-slate-100 text-slate-600'
                          }`}>
                            {lead.status}
                          </span>
                        </td>

                        <td className="p-3 text-right font-bold text-slate-800">
                          ${lead.value.toLocaleString()}
                        </td>

                        <td className="p-3 text-center">
                          {existingFollowTask ? (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-150 px-2.5 py-0.5 rounded-lg font-bold">
                              <Check className="w-3 h-3 text-indigo-600" /> Touchpoint Scheduled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] bg-rose-50 text-rose-700 border border-rose-150 px-2.5 py-0.5 rounded-lg font-bold">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" /> Attention Overdue
                            </span>
                          )}
                        </td>

                        <td className="p-3 text-center">
                          {existingFollowTask ? (
                            <button
                              disabled
                              className="px-3 py-1 bg-slate-100 text-slate-400 cursor-not-allowed rounded-lg text-xxs font-black transition"
                            >
                              Ready & Tracked
                            </button>
                          ) : (
                            <button
                              onClick={() => handleQuickFollowup(lead)}
                              className="px-3 py-1 bg-indigo-600 hover:bg-slate-900 text-white rounded-lg text-xxs font-black transition shadow-xxs flex items-center gap-1 mx-auto"
                            >
                              <Plus className="w-3 h-3" /> Schedule Follow-up
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          <div className="bg-slate-50 p-3 rounded-xl border border-slate-205 flex items-start gap-2 text-xxs text-slate-500 leading-relaxed">
            <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5 animate-pulse" />
            <p><strong>Auto-Nurturer Recommendation:</strong> Leads in "Negotiation" and "Proposal" stages without scheduled meetings or follow-ups for more than 4 days are highlighted above as "Attention Overdue". Execute follow-up outreach with one-click triggers to secure close probabilities.</p>
          </div>

        </div>
      )}


      {/* ===================== TAB: SYSTEM AUDIT FEED ACTIVITY HISTORY ===================== */}
      {activeTab === 'history' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-150/70 shadow-xxs space-y-4">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-xs font-black text-slate-900 uppercase">Operational Audit Activity Log</h3>
              <p className="text-xs text-slate-400">Chronological history record of all employee tasks assigned, meetings booked, and stage actions completed.</p>
            </div>
            
            <button 
              onClick={handleClearHistory}
              className="px-3.5 py-1.5 border border-slate-205 text-xs font-extrabold hover:bg-rose-50 hover:text-rose-600 rounded-xl transition flex items-center gap-1 bg-slate-50"
            >
              <Trash className="w-3.5 h-3.5" /> Purge Audit Trail
            </button>
          </div>

          <div className="space-y-4 relative py-2 pl-4 border-l border-slate-200">
            
            {activityHistory.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Bookmark className="w-10 h-10 mx-auto text-slate-300 opacity-60 mb-2" />
                <p className="text-xs font-bold">Audit timeline is currently blank</p>
                <p className="text-xxs mt-0.5">As personnel complete or allocate CRM activities, logs compile automatically here.</p>
              </div>
            ) : (
              activityHistory.map(log => (
                <div key={log.id} className="relative group pl-5">
                  
                  {/* Circle locator bullet point */}
                  <div className={`absolute -left-[24.5px] top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    log.type === 'Task' ? 'bg-purple-600 shadow-[0_0_0_4px_rgba(147,51,234,0.1)]' :
                    log.type === 'Meeting' ? 'bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.1)]' :
                    log.type === 'Follow-up' ? 'bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]' :
                    log.type === 'Assignment' ? 'bg-indigo-600 shadow-[0_0_0_4px_rgba(79,70,229,0.1)]' :
                    log.type === 'Deletion' ? 'bg-rose-600 shadow-[0_0_0_4px_rgba(220,38,38,0.1)]' :
                    'bg-slate-450'
                  }`}>
                    {/* Tiny visual marker */}
                  </div>

                  {/* Information block */}
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-xs font-black text-slate-900">{log.action}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[8.5px] uppercase font-mono font-black border ${
                        log.type === 'Task' ? 'bg-purple-50 text-purple-700 border-purple-150' :
                        log.type === 'Meeting' ? 'bg-sky-50 text-sky-700 border-sky-150' :
                        log.type === 'Follow-up' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                        log.type === 'Assignment' ? 'bg-indigo-50 text-indigo-700 border-indigo-150' :
                        'bg-slate-50 text-slate-655 border-slate-200'
                      }`}>
                        {log.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono font-medium ml-auto">{log.timestamp}</span>
                    </div>
                    
                    <p className="text-[11.5px] text-slate-600 font-medium leading-relaxed">{log.details}</p>
                    
                    <div className="text-[10px] text-slate-400 font-semibold">
                      Executed by signature: <span className="text-slate-600 font-extrabold">{log.performedBy}</span>
                    </div>
                  </div>

                </div>
              ))
            )}

          </div>

        </div>
      )}


      {/* Generic Task Creation Form Modal on overlay */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-55 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-150 shadow-2xl relative">
            <div className="pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-sm font-black text-slate-900 uppercase">Create Operational Task</h3>
              <p className="text-xs text-slate-400">Complete the coordinates to seed details into scheduling workspaces.</p>
            </div>

            <form onSubmit={handleTaskSubmit} className="space-y-4 text-xs font-semibold">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Task Title / Name *</label>
                  <input 
                    type="text" required
                    className="w-full border border-slate-205 rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-purple-500 outline-none"
                    placeholder="e.g. Conduct follow up demo"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Client/Company Name</label>
                  <select
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full border border-slate-205 rounded-xl p-2.5 bg-white text-slate-850"
                  >
                    <option value="">-- Let Blank / Choose from CRM --</option>
                    {leads.map(lead => (
                      <option key={lead.id} value={lead.name}>{lead.name} ({lead.company})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Due Duration / Time</label>
                  <input 
                    type="text"
                    className="w-full border border-slate-205 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none font-mono"
                    placeholder="e.g. In 48h / Today 3:00 PM"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Activity Category</label>
                  <select 
                    className="w-full border border-slate-205 rounded-xl p-2.5 bg-white text-slate-800"
                    value={taskType}
                    onChange={(e) => setTaskType(e.target.value as any)}
                  >
                    <option value="Task">🛠️ Standard Task</option>
                    <option value="Meeting">🤝 Business Meeting</option>
                    <option value="Follow-up">📈 Client Follow-up</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Priority Level</label>
                  <select 
                    className="w-full border border-slate-205 rounded-xl p-2.5 bg-white text-slate-800"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                  >
                    <option value="High">🚨 High Severity</option>
                    <option value="Medium">⚡ Medium Level</option>
                    <option value="Low">💤 Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Corporate Representative Assignee</label>
                <select 
                  className="w-full border border-slate-205 rounded-xl p-2.5 bg-white text-slate-800 font-extrabold"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                >
                  <option value="">-- Choose Assigned Staff member --</option>
                  {assigneesList.map(st => (
                    <option key={st.id} value={st.name}>{st.name} ({st.role})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-450 tracking-wider mb-1">Aesthetic Description / Instructions</label>
                <textarea 
                  rows={2}
                  className="w-full border border-slate-205 rounded-xl p-2.5 bg-slate-50 focus:bg-white outline-none"
                  placeholder="Primary objective milestones, reference notes, or required diagnostic protocols..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-md transition"
                >
                  Assign & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
