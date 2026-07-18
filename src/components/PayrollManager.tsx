import React, { useState, useEffect } from 'react';
import { 
  CreditCard, ShieldCheck, Plus, Check, Search, DollarSign, 
  HelpCircle, Sparkles, Send, Coins, Users, Calendar, 
  Trash, Edit2, User, FileText, Printer, Shield, Eye, 
  TrendingUp, Wallet, ArrowUpRight, CheckCircle2, XCircle, 
  Percent, Award, Sliders, ListFilter, AlertCircle, Bookmark, Briefcase
} from 'lucide-react';
import { Employee } from '../types';

interface PayrollManagerProps {
  employees: Employee[];
  onAddEmployee: (emp: Omit<Employee, 'id' | 'paidStatus' | 'netPay'>) => void;
  onDisburseAll: () => void;
  onUpdateEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
}

// Inner Tab structure
type HRTab = 'roster' | 'attendance_leaves' | 'payroll_calc' | 'expenses' | 'performance';

// Static / Durable storage interfaces
interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Casual Leave' | 'Sick Leave' | 'Paid Leave' | 'Unpaid Leave';
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  appliedDate: string;
}

interface ExpenseClaim {
  id: string;
  employeeId: string;
  employeeName: string;
  title: string;
  category: 'Travel' | 'Client Entertainment' | 'Hardware/Assets' | 'Training/Certifications' | 'Other';
  amount: number;
  claimDate: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  receiptUrl?: string;
  notes: string;
}

interface PayrollHistoryItem {
  id: string;
  monthYear: string;
  disbursedDate: string;
  totalAmountPaid: number;
  employeesCount: number;
  payoutMethod: 'Bank Wire Direct' | 'Interbank NACH API';
  reconciledBy: string;
}

// Default Leave templates
const INITIAL_LEAVES: LeaveRequest[] = [
  {
    id: "LV-401",
    employeeId: "EMP-01",
    employeeName: "Aman Varma",
    leaveType: "Sick Leave",
    startDate: "2026-06-18",
    endDate: "2026-06-19",
    totalDays: 2,
    reason: "Doctor advised recovery down with viral flu symptoms.",
    status: "Pending",
    appliedDate: "2026-06-16"
  },
  {
    id: "LV-402",
    employeeId: "EMP-02",
    employeeName: "Siddharth Sen",
    leaveType: "Casual Leave",
    startDate: "2026-06-25",
    endDate: "2026-06-26",
    totalDays: 2,
    reason: "Attending critical family function in ancestral town.",
    status: "Approved",
    appliedDate: "2026-06-14"
  },
  {
    id: "LV-403",
    employeeId: "EMP-03",
    employeeName: "Deepa Rao",
    leaveType: "Paid Leave",
    startDate: "2026-07-01",
    endDate: "2026-07-05",
    totalDays: 5,
    reason: "Personal summer vacation with family extension.",
    status: "Approved",
    appliedDate: "2026-06-10"
  }
];

// Default Expenses templates
const INITIAL_EXPENSES: ExpenseClaim[] = [
  {
    id: "EXP-801",
    employeeId: "EMP-01",
    employeeName: "Aman Varma",
    title: "Ground Travel Noida-Gurugram SLA Meet",
    category: "Travel",
    amount: 1450,
    claimDate: "2026-06-15",
    status: "Pending",
    notes: "Onduty express cab receipt for highway toll. Customer pitching."
  },
  {
    id: "EXP-802",
    employeeId: "EMP-04",
    employeeName: "Ketan Patel",
    title: "Client High-Altitude Router Adapter",
    category: "Hardware/Assets",
    amount: 8900,
    claimDate: "2026-06-10",
    status: "Approved",
    notes: "Crucial emergency purchase of high-gigabit optical receiver."
  },
  {
    id: "EXP-803",
    employeeId: "EMP-02",
    employeeName: "Siddharth Sen",
    title: "Premium Client Strategy Lunch Pitch",
    category: "Client Entertainment",
    amount: 3200,
    claimDate: "2026-06-12",
    status: "Rejected",
    notes: "Annual meet hospitality, omitted executive authorization voucher."
  }
];

// Default Payout historical logs
const INITIAL_PAYROLL_HISTORY: PayrollHistoryItem[] = [
  {
    id: "PAY-LOG-90",
    monthYear: "May 2026",
    disbursedDate: "2026-06-01",
    totalAmountPaid: 535000,
    employeesCount: 5,
    payoutMethod: "Interbank NACH API",
    reconciledBy: "Super Admin (M. Mehta)"
  },
  {
    id: "PAY-LOG-89",
    monthYear: "April 2026",
    disbursedDate: "2026-05-02",
    totalAmountPaid: 520000,
    employeesCount: 5,
    payoutMethod: "Bank Wire Direct",
    reconciledBy: "Super Admin (M. Mehta)"
  }
];

export default function PayrollManager({
  employees,
  onAddEmployee,
  onDisburseAll,
  onUpdateEmployee,
  onDeleteEmployee
}: PayrollManagerProps) {
  
  // Tabs & Views
  const [activeTab, setActiveTab] = useState<HRTab>('roster');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Present' | 'Absent' | 'On Leave'>('All');

  // Selected employee for deep analytics (Profile viewer, salary slip, performance)
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || 'EMP-01');
  const selectedEmp = employees.find(e => e.id === selectedEmpId) || employees[0];

  // Forms / Dialog controls
  const [isNewEmpOpen, setIsNewEmpOpen] = useState(false);
  const [isEditEmpOpen, setIsEditEmpOpen] = useState(false);
  const [isPayslipOpen, setIsPayslipOpen] = useState(false);
  const [payslipMonth, setPayslipMonth] = useState<string>(() => {
    return new Date().toLocaleString('en-US', { month: 'long' });
  });
  const [payslipYear, setPayslipYear] = useState<string>(() => {
    return new Date().getFullYear().toString();
  });
  const [isLeaveRequestOpen, setIsLeaveRequestOpen] = useState(false);
  const [isExpenseClaimOpen, setIsExpenseClaimOpen] = useState(false);

  // States with LocalStorage Persistence
  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    const saved = localStorage.getItem('crm_hr_leaves');
    return saved ? JSON.parse(saved) : INITIAL_LEAVES;
  });

  const [expenses, setExpenses] = useState<ExpenseClaim[]>(() => {
    const saved = localStorage.getItem('crm_hr_expenses');
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [payrollHistory, setPayrollHistory] = useState<PayrollHistoryItem[]>(() => {
    const saved = localStorage.getItem('crm_hr_history');
    return saved ? JSON.parse(saved) : INITIAL_PAYROLL_HISTORY;
  });

  // Global Config for PF, ESI & Tax
  const [epfRate, setEpfRate] = useState<number>(12); // EPF rate: default 12% of basic
  const [esiRate, setEsiRate] = useState<number>(0.75); // ESIC rate: default 0.75% of Gross
  const [tdsRate, setTdsRate] = useState<number>(10); // Standard TDS: 10%
  const [profTax, setProfTax] = useState<number>(200); // Fixed Professional Tax ₹200

  // Forms states
  // 1. Employee Creation Form
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newDept, setNewDept] = useState('Sales & Growth');
  const [newSalary, setNewSalary] = useState('90000');
  const [newAllowance, setNewAllowance] = useState('6000');

  // 2. Employee Edit Form
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editDept, setEditDept] = useState('Sales & Growth');
  const [editSalary, setEditSalary] = useState(0);
  const [editAllowance, setEditAllowance] = useState(0);

  // 3. Leave Request Form
  const [leaveType, setLeaveType] = useState<LeaveRequest['leaveType']>('Casual Leave');
  const [leaveStart, setLeaveStart] = useState('2026-06-20');
  const [leaveEnd, setLeaveEnd] = useState('2026-06-21');
  const [leaveReason, setLeaveReason] = useState('');

  // 4. Expense Claim Form
  const [expenseTitle, setExpenseTitle] = useState('');
  const [expenseCategory, setExpenseCategory] = useState<ExpenseClaim['category']>('Travel');
  const [expenseAmount, setExpenseAmount] = useState('1500');
  const [expenseNotes, setExpenseNotes] = useState('');

  // Performance Rating and Goals States
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [managerReviewText, setManagerReviewText] = useState('');
  const [managerRating, setManagerRating] = useState<number>(5);

  // Toast System
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Syncs to Local Storage
  useEffect(() => {
    localStorage.setItem('crm_hr_leaves', JSON.stringify(leaves));
  }, [leaves]);

  useEffect(() => {
    localStorage.setItem('crm_hr_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('crm_hr_history', JSON.stringify(payrollHistory));
  }, [payrollHistory]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Safe Fallback Selection
  useEffect(() => {
    if (employees.length > 0 && !employees.find(e => e.id === selectedEmpId)) {
      setSelectedEmpId(employees[0].id);
    }
  }, [employees, selectedEmpId]);

  // Sync Edit form values when modal opens or selected employee changes
  useEffect(() => {
    if (selectedEmp) {
      setEditName(selectedEmp.name);
      setEditRole(selectedEmp.role);
      setEditDept(selectedEmp.department);
      setEditSalary(selectedEmp.salary);
      setEditAllowance(selectedEmp.allowance);
    }
  }, [selectedEmp, isEditEmpOpen]);

  // ----------------------------------------------------
  // Dynamic Calculations (Basic, HRA, PF, ESI, TDS)
  // ----------------------------------------------------
  const calculateBreakdown = (grossSalary: number, allowanceAmt: number) => {
    const basic = Math.round(grossSalary * 0.50); // Standard Basic is 50%
    const hra = Math.round(grossSalary * 0.25); // HRA is 25%
    const specialAllowance = Math.round(grossSalary * 0.25); // Special allowance is rest of Gross
    
    // PF 12% of Basic
    const epfDeduction = Math.round(basic * (epfRate / 100));
    
    // ESI 0.75% of Gross
    const esiDeduction = Math.round((grossSalary + allowanceAmt) * (esiRate / 100));
    
    // Simulated Tax/TDS rate based on customizable baseline
    const tdsDeduction = Math.round((grossSalary + allowanceAmt) * (tdsRate / 100));
    
    // Total Deductions
    const totalDeductions = epfDeduction + esiDeduction + tdsDeduction + profTax;
    
    // Net Salary
    const calculatedNet = (grossSalary + allowanceAmt) - totalDeductions;

    return {
      basic,
      hra,
      specialAllowance,
      epfDeduction,
      esiDeduction,
      tdsDeduction,
      profTax,
      totalDeductions,
      calculatedNet
    };
  };

  // Selected Employee computed numbers
  const selectBreakdown = selectedEmp 
    ? calculateBreakdown(selectedEmp.salary, selectedEmp.allowance)
    : { basic: 0, hra: 0, specialAllowance: 0, epfDeduction: 0, esiDeduction: 0, tdsDeduction: 0, profTax: 0, totalDeductions: 0, calculatedNet: 0 };

  // Format Helper
  const formatINR = (val: number) => `₹ ${val.toLocaleString('en-IN')}`;

  // Let's count some metrics
  const totalRosterRevenue = employees.reduce((acc, emp) => {
    const { calculatedNet } = calculateBreakdown(emp.salary, emp.allowance);
    return acc + calculatedNet;
  }, 0);

  const unpaidCount = employees.filter(e => e.paidStatus === 'Unpaid').length;

  // ----------------------------------------------------
  // Core Payroll Disbursements (With strict monthly audit logging)
  // ----------------------------------------------------
  const handleProcessPayrollLedger = () => {
    if (unpaidCount === 0) {
      triggerToast("All employees are already fully paid during this billing cycle.");
      return;
    }

    const currentMonth = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const todayStr = new Date().toISOString().split('T')[0];

    // Compute gross total processed for paid employees
    const newlyDisbursedSum = employees
      .filter(e => e.paidStatus === 'Unpaid')
      .reduce((sum, e) => {
        const { calculatedNet } = calculateBreakdown(e.salary, e.allowance);
        return sum + calculatedNet;
      }, 0);

    // Call upstream trigger
    onDisburseAll();

    // Log the transaction in the history ledger
    const historyItem: PayrollHistoryItem = {
      id: `PAY-LOG-${Date.now().toString().slice(-4)}`,
      monthYear: currentMonth,
      disbursedDate: todayStr,
      totalAmountPaid: newlyDisbursedSum,
      employeesCount: unpaidCount,
      payoutMethod: "Interbank NACH API",
      reconciledBy: "Super Admin (Roster Integrated)"
    };

    setPayrollHistory(prev => [historyItem, ...prev]);
    triggerToast(`Monthly payroll for ${currentMonth} executed successfully! Generated historical record: ${historyItem.id}`);
  };

  // ----------------------------------------------------
  // Leave workflows & metrics
  // ----------------------------------------------------
  const handleRequestLeave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!leaveReason) return;

    const start = new Date(leaveStart);
    const end = new Date(leaveEnd);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

    const newRequest: LeaveRequest = {
      id: `LV-${Date.now().toString().slice(-3)}`,
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      leaveType,
      startDate: leaveStart,
      endDate: leaveEnd,
      totalDays,
      reason: leaveReason,
      status: 'Pending',
      appliedDate: new Date().toISOString().split('T')[0]
    };

    setLeaves(prev => [newRequest, ...prev]);
    setLeaveReason('');
    setIsLeaveRequestOpen(false);
    triggerToast(`Submited leave request for ${selectedEmp.name} (${totalDays} day(s))`);
  };

  const handleUpdateLeaveStatus = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setLeaves(prev => prev.map(req => {
      if (req.id === id) {
        // If approved, optionally update employee status
        if (newStatus === 'Approved') {
          const empToUpdate = employees.find(e => e.id === req.employeeId);
          if (empToUpdate) {
            onUpdateEmployee({
              ...empToUpdate,
              attendance: 'On Leave'
            });
          }
        }
        return { ...req, status: newStatus };
      }
      return req;
    }));
    triggerToast(`Leave request ${id} has been marked as "${newStatus}"`);
  };

  // ----------------------------------------------------
  // Expense claims workflows
  // ----------------------------------------------------
  const handleSubmitExpenseClaim = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expenseTitle || !expenseAmount) return;

    const newClaim: ExpenseClaim = {
      id: `EXP-${Date.now().toString().slice(-3)}`,
      employeeId: selectedEmp.id,
      employeeName: selectedEmp.name,
      title: expenseTitle,
      category: expenseCategory,
      amount: Math.round(Number(expenseAmount)) || 100,
      claimDate: new Date().toISOString().split('T')[0],
      status: 'Pending',
      notes: expenseNotes
    };

    setExpenses(prev => [newClaim, ...prev]);
    setExpenseTitle('');
    setExpenseNotes('');
    setIsExpenseClaimOpen(false);
    triggerToast(`Reimbursement claim submitted for ${selectedEmp.name}: ₹${Number(expenseAmount).toLocaleString()}`);
  };

  const handleUpdateExpenseStatus = (id: string, newStatus: 'Approved' | 'Rejected') => {
    setExpenses(prev => prev.map(claim => {
      if (claim.id === id) {
        // If approved, increment employee's allowances directly
        if (newStatus === 'Approved') {
          const empToUpdate = employees.find(e => e.id === claim.employeeId);
          if (empToUpdate) {
            const updatedAllowance = empToUpdate.allowance + claim.amount;
            const updatedNet = empToUpdate.salary + updatedAllowance - empToUpdate.deduction;
            onUpdateEmployee({
              ...empToUpdate,
              allowance: updatedAllowance,
              netPay: updatedNet
            });
          }
        }
        return { ...claim, status: newStatus };
      }
      return claim;
    }));
    triggerToast(`Expense claim ${id} marked as "${newStatus}"`);
  };

  // ----------------------------------------------------
  // CRUD actions for Employee Management
  // ----------------------------------------------------
  const handleCreateEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newRole) return;

    const sal = Number(newSalary) || 50000;
    const allow = Number(newAllowance) || 4000;
    
    // Use the dynamic calculator to initialize deductions and netPay right away
    const breakdown = calculateBreakdown(sal, allow);

    onAddEmployee({
      name: newName,
      role: newRole,
      department: newDept,
      attendance: 'Present',
      salary: sal,
      allowance: allow,
      deduction: breakdown.totalDeductions
    });

    setNewName('');
    setNewRole('');
    setNewSalary('90000');
    setNewAllowance('6000');
    setIsNewEmpOpen(false);
    triggerToast(`Registered new staff "${newName}" successfully!`);
  };

  const handleEditEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmp) return;

    const sal = Number(editSalary) || 50000;
    const allow = Number(editAllowance) || 4000;
    const breakdown = calculateBreakdown(sal, allow);

    onUpdateEmployee({
      ...selectedEmp,
      name: editName,
      role: editRole,
      department: editDept,
      salary: sal,
      allowance: allow,
      deduction: breakdown.totalDeductions,
      netPay: breakdown.calculatedNet
    });

    setIsEditEmpOpen(false);
    triggerToast(`Employee parameters updated successfully!`);
  };

  const handleDeleteEmployeeSecure = (id: string, name: string) => {
    if (confirm(`Are you absolutely sure you want to remove ${name} from the active staff directory? This delete cannot be undone.`)) {
      onDeleteEmployee(id);
      triggerToast(`Staff listing "${name}" removed safely.`);
    }
  };

  const handleMarkAttendanceDirect = (empId: string, value: 'Present' | 'Absent' | 'On Leave') => {
    const emp = employees.find(e => e.id === empId);
    if (emp) {
      onUpdateEmployee({
        ...emp,
        attendance: value
      });
      triggerToast(`Attendance for ${emp.name} set to ${value}.`);
    }
  };

  // Simulated goals/rating updates
  const handleSaveManagerReview = () => {
    if (!managerReviewText) return;
    triggerToast(`Manager rating of ${managerRating} Stars and professional notes processed for ${selectedEmp.name}!`);
    setManagerReviewText('');
  };

  const handleAddKRAPerformanceGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle) return;
    
    triggerToast(`Appraisal target goal "${newGoalTitle}" successfully assigned to ${selectedEmp.name}.`);
    setNewGoalTitle('');
  };

  // Filtering list
  const filteredEmployeesOnTerms = employees.filter(e => {
    const labelMatch = 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const statusMatch = statusFilter === 'All' || e.attendance === statusFilter;
    return labelMatch && statusMatch;
  });

  return (
    <div id="payroll-hr-subsystem" className="space-y-6 font-sans">
      
      {/* Dynamic Toast Messages */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3.5 shadow-2xl flex items-center gap-2.5 z-50 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Feature Title Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-md font-black text-slate-900 tracking-tight">Payroll & HR Management System</h1>
              <p className="text-xs text-slate-400">All-in-one dynamic suite for personnel management, leaves, salary calculations, PF/ESI taxes, reimbursement, and appraisals.</p>
            </div>
          </div>
        </div>

        {/* Unified Top Tabs bar */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl w-full xl:w-auto">
          <button 
            onClick={() => setActiveTab('roster')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'roster' ? 'bg-white text-slate-900 shadow-xxs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-3.5 h-3.5" /> Employee Management
          </button>
          
          <button 
            onClick={() => setActiveTab('attendance_leaves')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'attendance_leaves' ? 'bg-white text-slate-900 shadow-xxs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" /> Leaves & Attendance
          </button>

          <button 
            onClick={() => setActiveTab('payroll_calc')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'payroll_calc' ? 'bg-white text-slate-900 shadow-xxs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" /> Salary & Payouts ({unpaidCount})
          </button>

          <button 
            onClick={() => setActiveTab('expenses')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'expenses' ? 'bg-white text-slate-900 shadow-xxs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-3.5 h-3.5" /> Expenses Roster
          </button>

          <button 
            onClick={() => setActiveTab('performance')}
            className={`flex-1 sm:flex-none px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'performance' ? 'bg-white text-slate-900 shadow-xxs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Appraisals
          </button>
        </div>
      </div>

      {/* Roster Overview Micro Metric Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xxs">
          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Active Roster Size</span>
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-800">{employees.length} Members</span>
          </div>
          <span className="text-[9.5px] text-emerald-500 mt-1 block font-medium">● System in sync with LocalStorage</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xxs">
          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Today's Presence</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-black text-slate-800">
              {employees.filter(e => e.attendance === 'Present').length} / {employees.length}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">Active Today</span>
          </div>
          <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
            <div className="bg-emerald-500 h-full" style={{ width: `${(employees.filter(e => e.attendance === 'Present').length / employees.length) * 100}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xxs">
          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Active Claims Value</span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-black text-amber-600">
              {formatINR(expenses.filter(e => e.status === 'Pending').reduce((acc, c) => acc + c.amount, 0))}
            </span>
            <span className="text-[10px] text-slate-400">Pending</span>
          </div>
          <span className="text-[9.5px] text-slate-400 block mt-1">{expenses.filter(e => e.status === 'Pending').length} requests needing audit</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xxs">
          <span className="text-[10px] font-black uppercase text-slate-400 block mb-1">Reconciled Net Payroll</span>
          <span className="text-xl font-black text-slate-800 font-mono tracking-tight block">
            {formatINR(totalRosterRevenue)}
          </span>
          <span className="text-[9.5px] text-slate-400 block mt-1 font-semibold text-rose-500">
            {unpaidCount > 0 ? `⚠️ ${unpaidCount} Pending Payouts` : "✅ Closed & Reconciled"}
          </span>
        </div>
      </div>

      {/* ===================== TAB 1: EMPLOYEE MANAGEMENT ===================== */}
      {activeTab === 'roster' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Roster list: cols span 8 */}
          <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-950 uppercase tracking-tight">Active Team Directory</h3>
                  <p className="text-[11px] text-slate-400">Detailed staffing grid with real-time editing status and core telemetry parameters.</p>
                </div>

                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setIsNewEmpOpen(true)}
                    className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Recruit Personnel
                  </button>
                </div>
              </div>

              {/* Filters toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 my-3">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search name, job role, department..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs p-2 pl-8.5 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white transition"
                  />
                </div>

                <div className="flex items-center gap-1 bg-slate-150 p-0.5 rounded-lg text-xs">
                  <span className="text-[9.5px] font-bold text-slate-500 uppercase px-2">Daily Presence:</span>
                  {(['All', 'Present', 'Absent', 'On Leave'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setStatusFilter(tab)}
                      className={`px-2.5 py-1 rounded-md font-bold text-[10.5px] transition ${
                        statusFilter === tab ? 'bg-white text-slate-900 shadow-xxs' : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Directory Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-150 bg-white">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[8.5px] border-b border-slate-150">
                    <tr>
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Full Name</th>
                      <th className="p-3">Department & Role</th>
                      <th className="p-3">Daily Status</th>
                      <th className="p-3">Payout Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredEmployeesOnTerms.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-slate-400 italic bg-slate-50/50">
                          No workers matched search criteria or attendance filters.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployeesOnTerms.map(emp => (
                        <tr 
                          key={emp.id} 
                          onClick={() => setSelectedEmpId(emp.id)}
                          className={`hover:bg-slate-50/80 cursor-pointer transition ${
                            selectedEmpId === emp.id ? 'bg-rose-50/30' : ''
                          }`}
                        >
                          <td className="p-3 font-mono font-bold text-slate-400">{emp.id}</td>
                          <td className="p-3">
                            <span className="text-slate-900 font-extrabold block">{emp.name}</span>
                            <span className="text-[10px] text-slate-400">{emp.role}</span>
                          </td>
                          <td className="p-3 text-slate-700">
                            <strong>{emp.department}</strong>
                          </td>
                          <td className="p-3">
                            <select
                              value={emp.attendance}
                              onChange={(e) => handleMarkAttendanceDirect(emp.id, e.target.value as any)}
                              className={`p-1 text-[10px] font-bold rounded-md bg-white border ${
                                emp.attendance === 'Present' ? 'text-emerald-700 border-emerald-200' :
                                emp.attendance === 'On Leave' ? 'text-amber-700 border-amber-200' : 'text-rose-700 border-rose-200'
                              }`}
                            >
                              <option value="Present">Present</option>
                              <option value="Absent">Absent</option>
                              <option value="On Leave">On Leave</option>
                            </select>
                          </td>
                          <td className="p-3">
                            <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                              emp.paidStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' : 'bg-amber-50 text-amber-600 border border-amber-150 animate-pulse'
                            }`}>
                              {emp.paidStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button 
                                onClick={() => { setSelectedEmpId(emp.id); setIsPayslipOpen(true); }}
                                className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg border border-indigo-150 hover:bg-indigo-100 hover:text-indigo-900"
                                title="View & Print Payslip"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => { setSelectedEmpId(emp.id); setIsEditEmpOpen(true); }}
                                className="p-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-100 hover:text-slate-900"
                                title="Edit employee baseline parameters"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleDeleteEmployeeSecure(emp.id, emp.name)}
                                className="p-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 hover:bg-rose-100"
                                title="Delete/Offboard employee"
                              >
                                <Trash className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-2 italic font-medium">
              * Click any row to focus profile details, appraisals, customized leave trackers, and printable slips on the right panel.
            </p>
          </div>

          {/* Detailed Profile drawer: cols span 4 */}
          <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs flex flex-col justify-between">
            {selectedEmp ? (
              <div className="space-y-4">
                
                {/* Header card info */}
                <div className="text-center pb-4 border-b border-slate-100">
                  <div className="w-14 h-14 bg-rose-500 text-white rounded-full mx-auto flex items-center justify-center font-black text-lg shadow-sm border border-rose-600/30 mb-2">
                    {selectedEmp.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{selectedEmp.name}</h3>
                  <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">{selectedEmp.role}</span>
                  <div className="mt-2 flex justify-center gap-1.5">
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9.5px] font-black">{selectedEmp.department}</span>
                    <span className={`px-2 py-0.5 rounded text-[9.5px] font-black ${
                      selectedEmp.attendance === 'Present' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                    }`}>
                      {selectedEmp.attendance}
                    </span>
                  </div>
                </div>

                {/* Detailed financial attributes */}
                <div className="space-y-3 text-xs bg-slate-50 p-3.5 rounded-xl">
                  <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Baseline Compensation Mapping</h4>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-500">Gross Salary (Base)</span>
                    <span className="font-mono text-slate-900 font-extrabold">{formatINR(selectedEmp.salary)}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-500">Reimbursed Allowances</span>
                    <span className="font-mono text-emerald-600 font-extrabold">+{formatINR(selectedEmp.allowance)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-500">Baseline Deductions</span>
                    <span className="font-mono text-rose-500 font-extrabold">-{formatINR(selectedEmp.deduction)}</span>
                  </div>

                  <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                    <span className="font-extrabold text-slate-800">Net Estimated Pay</span>
                    <span className="font-mono font-black text-rose-600 text-sm">{formatINR(selectBreakdown.calculatedNet)}</span>
                  </div>
                </div>

                {/* Subsystem quick actions */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">SLA Quick Handlers</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsPayslipOpen(true)}
                      className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-sm text-center"
                    >
                      <FileText className="w-3.5 h-3.5" /> View Payslip
                    </button>
                    <button
                      onClick={() => setIsEditEmpOpen(true)}
                      className="px-3 py-2 border border-slate-205 text-slate-700 bg-slate-50 hover:bg-slate-100 font-bold text-xs rounded-xl flex items-center justify-center gap-1 text-center"
                    >
                      <Sliders className="w-3.5 h-3.5" /> Edit Profile
                    </button>
                  </div>
                </div>

                {/* Key parameters of Leaves & Claims */}
                <div className="space-y-2.5 text-xs">
                  <h4 className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Leave Balances (Allotted 18)</h4>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px]">
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block font-bold uppercase">Casual</span>
                      <span className="text-xs font-black text-slate-800">8 / 12 left</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block font-bold uppercase">Sick</span>
                      <span className="text-xs font-black text-slate-800">5 / 6 left</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <span className="text-slate-400 block font-bold uppercase">Earned</span>
                      <span className="text-xs font-black text-slate-800">14 / 15 left</span>
                    </div>
                  </div>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 text-slate-400 italic">No Employee Selected. Recruit or select to analyze.</div>
            )}

            <div className="border-t border-slate-100 pt-3 text-[10.5px] text-slate-400 text-center flex items-center justify-center gap-1 font-semibold block mt-4">
              <Shield className="w-3 h-3 text-rose-500" /> Authorized HR Auditor Profile Access
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 2: LEAVES & ATTENDANCE TRACKING ===================== */}
      {activeTab === 'attendance_leaves' && (
        <div className="space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Attendance & Leave Tracking Dashboard</h3>
              <p className="text-xs text-slate-400">Audit employee absence parameters, approve customized leave policies, and review active requests.</p>
            </div>
            
            <button
              onClick={() => setIsLeaveRequestOpen(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> Log Leave Application
            </button>
          </div>

          {/* Active Leave Requests */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Incoming Leave Request Pipeline</h4>
              
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[8.5px] border-b border-slate-150">
                    <tr>
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Applicant Name</th>
                      <th className="p-3">Leave Type</th>
                      <th className="p-3">Period & Duration</th>
                      <th className="p-3">Reason Summary</th>
                      <th className="p-3">Workflow State</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {leaves.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 text-slate-400 italic">No leaves records tracked. Submit a log above.</td>
                      </tr>
                    ) : (
                      leaves.map(req => (
                        <tr key={req.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-400 text-xxs">{req.id}</td>
                          <td className="p-3 font-bold text-slate-950">{req.employeeName}</td>
                          <td className="p-3 font-semibold text-slate-500">{req.leaveType}</td>
                          <td className="p-3">
                            <span className="block font-semibold">{req.startDate} to {req.endDate}</span>
                            <span className="text-[10px] text-[8.5px] bg-slate-100 text-slate-600 px-1 py-0.2 rounded font-black">{req.totalDays} Workdays</span>
                          </td>
                          <td className="p-3 text-slate-500 max-w-xxs truncate" title={req.reason}>{req.reason}</td>
                          <td className="p-3">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-bold ${
                              req.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' :
                              req.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-150' : 'bg-amber-50 text-amber-600 border border-amber-150 animate-pulse'
                            }`}>
                              {req.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {req.status === 'Pending' ? (
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => handleUpdateLeaveStatus(req.id, 'Approved')}
                                  className="p-1 px-2 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-150 rounded hover:bg-emerald-100 transition"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateLeaveStatus(req.id, 'Rejected')}
                                  className="p-1 px-2 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-150 rounded hover:bg-rose-100 transition"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold">Closed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leave Policy Balances card info */}
            <div className="lg:col-span-4 bg-[#0f172a] text-white p-5 rounded-2xl border border-slate-800 shadow-xs space-y-4">
              <h4 className="text-[10.5px] font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                <Bookmark className="w-3.5 h-3.5 text-rose-500" /> Active Roster Leave Balance Rules
              </h4>

              <p className="text-[11px] text-slate-350 italic">
                Standard institutional leave policies automatically allocated to active employees during financial appraisal cycles.
              </p>

              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span>Casual Leave (CL) Allowance</span>
                    <span className="font-bold text-rose-400">12 Days / Year</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full w-[70%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Sick Leave (SL) Allocation</span>
                    <span className="font-bold text-amber-400">6 Days / Year</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-[45%]"></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span>Earned/Special Leave (EL)</span>
                    <span className="font-bold text-indigo-400">15 Days / Year</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-indigo-400 h-full w-[80%]"></div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/60 text-[10px] text-slate-300">
                <span className="font-extrabold block text-slate-200 mb-1">⚠️ Policy Note:</span>
                Unutilized casual leaves do not carry forward into next calendar year. Sick leaves require signed doctor's diagnostics for approvals.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB 3: SALARY BREAKDOWN & PAYROLL ===================== */}
      {activeTab === 'payroll_calc' && (
        <div className="space-y-6">
          
          <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Monthly Payroll Processing Command</h3>
              <p className="text-xs text-slate-400">Run calculations, verify PF/ESI/TDS tax allocations, and initiate direct payouts to staff.</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleProcessPayrollLedger}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition animate-pulse"
              >
                <Coins className="w-4 h-4" /> Run Monthly Payroll (Bulk Disburse)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* PF, ESI & Tax Rules Slider Config Box */}
            <div className="xl:col-span-4 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Sliders className="w-4 h-4 text-rose-500" />
                <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">PF, ESI & Tax Percentage Config</h4>
              </div>

              <div className="space-y-3.5 text-xs text-slate-600">
                
                {/* EPF Rule Slider */}
                <div>
                  <div className="flex justify-between mb-1 font-bold">
                    <span>EPF Contribution (on Basic 50%)</span>
                    <span className="text-rose-600 font-mono">{epfRate}%</span>
                  </div>
                  <input 
                    type="range" min={6} max={18} step={0.5}
                    value={epfRate}
                    onChange={(e) => setEpfRate(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                  <span className="text-[9px] text-slate-400">EPF calculations default to 12.0% under regional labor rules.</span>
                </div>

                {/* ESI Rule Slider */}
                <div>
                  <div className="flex justify-between mb-1 font-bold">
                    <span>ESI Contribution (on Gross)</span>
                    <span className="text-rose-600 font-mono">{esiRate}%</span>
                  </div>
                  <input 
                    type="range" min={0.25} max={3.0} step={0.05}
                    value={esiRate}
                    onChange={(e) => setEsiRate(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                  <span className="text-[9px] text-slate-400">ESIC coverage premium default is 0.75% for industrial employees.</span>
                </div>

                {/* TDS Rule Slider */}
                <div>
                  <div className="flex justify-between mb-1 font-bold">
                    <span>default TDS Baseline (Income Tax)</span>
                    <span className="text-rose-600 font-mono">{tdsRate}%</span>
                  </div>
                  <input 
                    type="range" min={0} max={30} step={1}
                    value={tdsRate}
                    onChange={(e) => setTdsRate(Number(e.target.value))}
                    className="w-full accent-rose-600"
                  />
                  <span className="text-[9px] text-slate-400">Source withholding defaults to 10.0% standard slab rate.</span>
                </div>

                {/* Profession Tax fixed */}
                <div>
                  <div className="flex justify-between mb-1 font-bold">
                    <span>Fixed Professional Tax (PT)</span>
                    <span className="text-slate-800 font-mono">₹ {profTax} (Monthly)</span>
                  </div>
                  <input 
                    type="number" 
                    value={profTax}
                    onChange={(e) => setProfTax(Number(e.target.value))}
                    className="w-full text-xs p-1.5 border border-slate-205 rounded-lg bg-slate-50"
                  />
                  <span className="text-[9px] text-slate-400">Fixed deduction mandated under state municipal guidelines.</span>
                </div>

              </div>

              <div className="bg-amber-50 text-amber-800 p-3 rounded-lg text-[10px] leading-relaxed border border-amber-100 flex items-start gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  Adjusting these inputs will recalculate deductions and net pay calculations for slips and histories in real-time.
                </span>
              </div>
            </div>

            {/* Calculations and Breakdown Table wrapper */}
            <div className="xl:col-span-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Salary Computation Ledger</h4>
              
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[8.5px] border-b border-slate-150">
                    <tr>
                      <th className="p-3">Employee</th>
                      <th className="p-3">Gross Base</th>
                      <th className="p-3">HRA / Basic</th>
                      <th className="p-3">PF ({epfRate}%)</th>
                      <th className="p-3">ESI ({esiRate}%)</th>
                      <th className="p-3">TDS Tax ({tdsRate}%)</th>
                      <th className="p-3 font-semibold text-slate-900 text-right">Net Payout</th>
                      <th className="p-3 text-center">Status</th>
                      <th className="p-3 text-right">Payslip</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {employees.map(emp => {
                      const calculations = calculateBreakdown(emp.salary, emp.allowance);
                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/50">
                          <td className="p-3">
                            <span className="font-extrabold text-slate-900 block">{emp.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{emp.id}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-600 font-semibold">{formatINR(emp.salary)}</td>
                          <td className="p-3 text-slate-500 font-mono text-xxs">
                            <span>B: {formatINR(calculations.basic)}</span>
                            <span className="block">H: {formatINR(calculations.hra)}</span>
                          </td>
                          <td className="p-3 text-rose-500 font-mono">-{formatINR(calculations.epfDeduction)}</td>
                          <td className="p-3 text-rose-500 font-mono">-{formatINR(calculations.esiDeduction)}</td>
                          <td className="p-3 text-rose-400 font-mono">-{formatINR(calculations.tdsDeduction)}</td>
                          <td className="p-3 font-mono font-black text-slate-850 text-right text-emerald-600">
                            {formatINR(calculations.calculatedNet)}
                          </td>
                          <td className="p-3 text-center">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                              emp.paidStatus === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                            }`}>
                              {emp.paidStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                setSelectedEmpId(emp.id);
                                setIsPayslipOpen(true);
                              }}
                              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10.5px] font-bold inline-flex items-center gap-1 shadow-sm transition"
                              title="Print Statement"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Print</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Historical Run Audit Trail log */}
          <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-xs">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-2.5">Historical Executed Payroll Runs</h4>
            <div className="overflow-x-auto rounded-lg border border-slate-150">
              <table className="w-full text-left text-xs bg-white">
                <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[8px] tracking-wide border-b border-slate-150">
                  <tr>
                    <th className="p-2.5">Run Reference</th>
                    <th className="p-2.5">Billing Period</th>
                    <th className="p-2.5">Release Date</th>
                    <th className="p-2.5">Total Paid Sum</th>
                    <th className="p-2.5">Staff Headcount</th>
                    <th className="p-2.5">Distribution Mode</th>
                    <th className="p-2.5">Reconciliation Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {payrollHistory.map(hist => (
                    <tr key={hist.id} className="hover:bg-slate-50/50">
                      <td className="p-2.5 font-mono text-slate-900 font-bold">{hist.id}</td>
                      <td className="p-2.5 font-extrabold text-slate-800">{hist.monthYear}</td>
                      <td className="p-2.5 text-slate-500">{hist.disbursedDate}</td>
                      <td className="p-2.5 text-emerald-600 font-mono font-bold">{formatINR(hist.totalAmountPaid)}</td>
                      <td className="p-2.5">{hist.employeesCount} Employees</td>
                      <td className="p-2.5 font-semibold text-indigo-600 text-xxs">{hist.payoutMethod}</td>
                      <td className="p-2.5 text-slate-400">{hist.reconciledBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ===================== TAB 4: EXPENSES MANAGEMENT ===================== */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-white p-4 rounded-xl border border-slate-100">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Expense Claims & Reimbursement Control</h3>
              <p className="text-xs text-slate-400">Verify client hospitality vouchers, field travel logs, and issue payouts immediately.</p>
            </div>

            <button
              onClick={() => setIsExpenseClaimOpen(true)}
              className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" /> Submit Expense Claim
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Expense spreadsheet logs list */}
            <div className="lg:col-span-8 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider mb-3">Claims spreadsheet</h4>
              <div className="overflow-x-auto rounded-xl border border-slate-150">
                <table className="w-full text-left text-xs bg-white">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[8.5px] border-b border-slate-150">
                    <tr>
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Claimant Name</th>
                      <th className="p-3">Title Description</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Amount</th>
                      <th className="p-3">Claim Date</th>
                      <th className="p-3">State</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {expenses.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-10 italic text-slate-400">No active expense reports tracked.</td>
                      </tr>
                    ) : (
                      expenses.map(claim => (
                        <tr key={claim.id} className="hover:bg-slate-50/50">
                          <td className="p-3 font-mono font-bold text-slate-400 text-xxs">{claim.id}</td>
                          <td className="p-3 font-bold text-slate-950">{claim.employeeName}</td>
                          <td className="p-3">
                            <span className="block font-bold text-slate-800">{claim.title}</span>
                            <span className="text-[10px] text-slate-400 max-w-xxs block truncate" title={claim.notes}>{claim.notes}</span>
                          </td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9.5px] font-black uppercase">{claim.category}</span>
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-800">{formatINR(claim.amount)}</td>
                          <td className="p-3 text-slate-500 font-medium">{claim.claimDate}</td>
                          <td className="p-3">
                            <span className={`inline-block px-1.5 py-0.5 rounded text-[9.5px] font-extrabold ${
                              claim.status === 'Approved' ? 'bg-emerald-50 text-emerald-600 border border-emerald-150' :
                              claim.status === 'Rejected' ? 'bg-rose-50 text-rose-600 border border-rose-150' : 'bg-amber-50 text-amber-600 border border-amber-150 animate-pulse'
                            }`}>
                              {claim.status}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            {claim.status === 'Pending' ? (
                              <div className="flex gap-1 justify-end">
                                <button
                                  onClick={() => handleUpdateExpenseStatus(claim.id, 'Approved')}
                                  className="p-1 px-1.5 text-[10px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-150 rounded hover:bg-emerald-100"
                                  title="Approve immediately (Increments current-period allowance)"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => handleUpdateExpenseStatus(claim.id, 'Rejected')}
                                  className="p-1 px-1.5 text-[10px] font-bold bg-rose-50 text-rose-600 border border-rose-150 rounded hover:bg-rose-100"
                                >
                                  Reject
                                </button>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-400 font-bold">Processed</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Claims Audit statistics */}
            <div className="lg:col-span-4 bg-slate-50 p-4 rounded-2xl border border-slate-150 space-y-4 font-sans text-slate-800 flex flex-col justify-between">
              <div className="space-y-3.5">
                <h4 className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Expense Audit Policy Guidelines</h4>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Employees must provide digital/scanned vouchers for any claims above ₹500. Travel allowances are reimbursed at ₹12/km for vehicles standard rate.
                </p>

                <div className="border-t border-slate-200 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between font-bold">
                    <span>Approved in June</span>
                    <span className="text-emerald-600 font-mono">{formatINR(expenses.filter(e => e.status === 'Approved').reduce((acc, c) => acc + c.amount, 0))}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Pending Processing</span>
                    <span className="text-amber-600 font-mono">{formatINR(expenses.filter(e => e.status === 'Pending').reduce((acc, c) => acc + c.amount, 0))}</span>
                  </div>
                  <div className="flex justify-between font-medium text-slate-400">
                    <span>Rejected/Omitted Claims</span>
                    <span className="font-mono">{formatINR(expenses.filter(e => e.status === 'Rejected').reduce((acc, c) => acc + c.amount, 0))}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-slate-200 mt-4 text-[10px] text-slate-400">
                <span className="font-bold text-slate-600 block mb-1">💡 Interactive Feature:</span>
                Approving a claim will instantly increment that employee's allowance and update their month-to-date estimated payments!
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ===================== TAB 5: APPRAISALS & PERFORMANCE ===================== */}
      {activeTab === 'performance' && (
        <div className="space-y-6">
          
          <div className="bg-white p-4 rounded-xl border border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase">Appraisals & Performance Evaluator</h3>
              <p className="text-xs text-slate-400">Record evaluations, adjust operational KRA ratings, and align company goals.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Left panel: Selected Employee overview */}
            <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-150 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Award className="w-4 h-4 text-rose-500" />
                <h4 className="text-xs font-black uppercase text-slate-900 tracking-wider">Focus Performance appraisal</h4>
              </div>

              {selectedEmp ? (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div className="w-10 h-10 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center">
                      {selectedEmp.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <span className="font-extrabold text-slate-900 block">{selectedEmp.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold block bg-white px-2 py-0.5 rounded border border-slate-200 mt-0.5">{selectedEmp.role}</span>
                    </div>
                  </div>

                  {/* Rating selection input */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">Overall Appraisal Rating (1-5)</label>
                    <div className="flex items-center gap-1.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button
                          key={star}
                          onClick={() => setManagerRating(star)}
                          className="p-1 transition focus:outline-none"
                        >
                          <span className={`text-xl ${star <= managerRating ? 'text-amber-500 font-bold' : 'text-slate-200'}`}>★</span>
                        </button>
                      ))}
                      <span className="text-[10.5px] font-extrabold text-slate-500 ml-2">Rating: {managerRating}.0 Stars</span>
                    </div>
                  </div>

                  {/* Feedback text */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-1">HR Manager Evaluation Comments</label>
                    <textarea
                      rows={3}
                      className="w-full border border-slate-205 rounded-xl p-2.5 text-xs focus:bg-white bg-slate-50 focus:outline-none focus:ring-1 focus:ring-rose-500"
                      placeholder="e.g. Aman continues to demonstrate fantastic field client mapping. Conversion rates are outstanding..."
                      value={managerReviewText}
                      onChange={(e) => setManagerReviewText(e.target.value)}
                    ></textarea>
                  </div>

                  <button
                    onClick={handleSaveManagerReview}
                    className="w-full py-2 bg-slate-950 text-white font-bold rounded-xl text-center hover:bg-slate-800 transition shadow-sm text-xs"
                  >
                    Lock Manager Evaluation Score
                  </button>

                </div>
              ) : (
                <div className="text-center py-10 italic text-slate-300">Select employee to audit scorecards.</div>
              )}
            </div>

            {/* Right Panel: KRA Performance targets goals list */}
            <div className="lg:col-span-7 bg-white p-4 rounded-2xl border border-slate-100 shadow-xs space-y-4">
              <h4 className="text-xs font-black uppercase text-slate-400 tracking-wider">Key Result Areas (KRAs) & Corporate Target Goals</h4>
              
              <form onSubmit={handleAddKRAPerformanceGoal} className="flex gap-2">
                <input
                  type="text"
                  required
                  placeholder="e.g. Achieve 100% SLA uptime on customer networks..."
                  className="flex-1 text-xs border border-slate-205 rounded-xl p-2 focus:bg-white bg-slate-50"
                  value={newGoalTitle}
                  onChange={(e) => setNewGoalTitle(e.target.value)}
                />
                <button
                  type="submit"
                  className="px-3.5 py-1 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs shrink-0"
                >
                  Assign Goal
                </button>
              </form>

              {/* List of active appraisals goals */}
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-800 block">Goal #1: Close &gt; ₹1.5L in field contracts</span>
                    <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">Applies to: Sales & Growth • Weight: 40%</span>
                  </div>
                  <span className="bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">Active</span>
                </div>

                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-800 block">Goal #2: Maintain customer diagnostics score &gt; 4.5/5</span>
                    <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">Applies to: Tech Engineers & Delivery • Weight: 30%</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded text-[9px] uppercase">Completed</span>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-extrabold text-slate-800 block">Goal #3: SLA diagnostic turnaround within &lt; 4 hours</span>
                    <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">Applies to: Operations Command • Weight: 30%</span>
                  </div>
                  <span className="bg-slate-200 text-slate-600 font-bold px-2 py-0.5 rounded text-[9px] uppercase">Deferred</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ===================== MODAL 1: CREATE RECRUIT PERSONNEL ===================== */}
      {isNewEmpOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-100 shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Recruit New Employee</h3>
            <p className="text-xs text-slate-400 mb-4">Complete physical coordinates to log personnel listings into the active registry.</p>

            <form onSubmit={handleCreateEmployeeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Personnel Full Name *</label>
                  <input 
                    type="text" required
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                    placeholder="e.g. Ketan Patel"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Role Designation *</label>
                  <input 
                    type="text" required
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                    placeholder="e.g. Lead Network Integrator"
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Department Mapping</label>
                  <select 
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs bg-white focus:outline-none"
                    value={newDept}
                    onChange={(e) => setNewDept(e.target.value)}
                  >
                    <option value="Sales & Growth">Sales & Growth</option>
                    <option value="Customer Delivery">Customer Delivery</option>
                    <option value="Operations">Operations</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Monthly Cost/Salary (INR base)</label>
                  <input 
                    type="number" required
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                    placeholder="e.g. 85000"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Initial Monthly Allowances (Travel, Food)</label>
                <input 
                  type="number"
                  className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                  placeholder="e.g. 5000"
                  value={newAllowance}
                  onChange={(e) => setNewAllowance(e.target.value)}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsNewEmpOpen(false)}
                  className="px-4 py-2 border border-slate-205 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold transition"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white hover:bg-rose-700 rounded-lg text-xs font-bold transition shadow-sm"
                >
                  Confirm Registration
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 2: EDIT PERSONNEL Baseline Parameters ===================== */}
      {isEditEmpOpen && selectedEmp && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-slate-105 shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-1">Edit Employee Profile</h3>
            <p className="text-xs text-slate-400 mb-4">Modify structural configuration mapping for {selectedEmp.name}.</p>

            <form onSubmit={handleEditEmployeeSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Employee Full Name *</label>
                  <input 
                    type="text" required
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Role Designation *</label>
                  <input 
                    type="text" required
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Department Mapping</label>
                  <select 
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs bg-white"
                    value={editDept}
                    onChange={(e) => setEditDept(e.target.value)}
                  >
                    <option value="Sales & Growth">Sales & Growth</option>
                    <option value="Customer Delivery">Customer Delivery</option>
                    <option value="Operations">Operations</option>
                    <option value="Human Resources">Human Resources</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Gross Salary Base (INR)</label>
                  <input 
                    type="number" required
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                    value={editSalary}
                    onChange={(e) => setEditSalary(Number(e.target.value))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Reinsurance/Travel Allowance (Month-to-date)</label>
                <input 
                  type="number" required
                  className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                  value={editAllowance}
                  onChange={(e) => setEditAllowance(Number(e.target.value))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button 
                  type="button" 
                  onClick={() => setIsEditEmpOpen(false)}
                  className="px-4 py-2 border border-slate-205 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-bold transition"
                >
                  Discard
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-xs font-bold transition shadow-sm"
                >
                  Approve Configuration Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 3: PAYSILIP GENERATION MODAL ===================== */}
      {isPayslipOpen && selectedEmp && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 border border-slate-200 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            {/* Stamp logo and close handler */}
            <div className="flex justify-between items-center pb-4 border-b border-slate-200">
              <div className="flex items-center gap-1.5">
                <div className="p-1 px-[7px] bg-rose-600 text-white text-[11px] font-black rounded font-mono">VS</div>
                <span className="text-[11px] font-black text-slate-950 uppercase tracking-widest">Vertex Telecom Systems & SLA Corp</span>
              </div>
              
              <button 
                onClick={() => setIsPayslipOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition"
                id="close-payslip-viewer"
              >
                ✕ Close
              </button>
            </div>

            {/* Payslip selectors (Hidden during print) */}
            <div className="print:hidden flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200 my-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-700 uppercase text-[9.5px]">Select Cycle:</span>
                <select
                  value={payslipMonth}
                  onChange={(e) => setPayslipMonth(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-800 focus:outline-none"
                >
                  {['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
                <select
                  value={payslipYear}
                  onChange={(e) => setPayslipYear(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg p-1.5 font-bold text-slate-800 focus:outline-none"
                >
                  {['2025', '2026', '2027', '2028'].map(y => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
              <p className="text-[10px] text-slate-400 font-medium">Select month/year to dynamically regenerate details.</p>
            </div>

            {/* Print Slip markup */}
            <div id="print-slip-document" className="pt-2 space-y-4 font-sans text-xs text-slate-800">
              
              <div className="text-center space-y-1 py-1 bg-slate-50 rounded-xl border border-slate-150">
                <h4 className="font-extrabold text-slate-900 uppercase text-xs">Salary Statement Circular</h4>
                <p className="text-[10px] text-slate-400 font-bold">Billing Cycle: {payslipMonth} {payslipYear} &bull; Issued securely via NACH API</p>
              </div>

              {/* Grid elements */}
              <div className="grid grid-cols-2 gap-4 pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block">Recipient Worker Detail:</span>
                  <span className="font-bold text-slate-900 text-sm block">{selectedEmp.name}</span>
                  <span className="text-[10.5px] text-slate-500 font-medium">{selectedEmp.role}</span>
                  <span className="text-[10.5px] text-slate-500 block">Department: {selectedEmp.department}</span>
                </div>
                <div>
                  <span className="text-[9px] font-extrabold uppercase text-slate-400 block text-right">Payment Coordinates:</span>
                  <p className="text-right text-slate-900 font-mono font-bold block mt-0.5">Reference ID: {selectedEmp.id}-CY9</p>
                  <p className="text-right text-slate-500">Method: Instant IMPS NEFT Transfer</p>
                  <p className="text-right font-black text-emerald-600 uppercase text-[9px]">Status: Reconciled & Paid</p>
                </div>
              </div>

              {/* Structured calculations breakdown table */}
              <div className="grid grid-cols-2 gap-5 pt-1">
                {/* Earnings */}
                <div className="space-y-2">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">Component Earnings</span>
                  
                  <div className="flex justify-between font-medium">
                    <span>Basic Salary (50% baseline)</span>
                    <span className="font-mono">{formatINR(selectBreakdown.basic)}</span>
                  </div>

                  <div className="flex justify-between font-medium">
                    <span>House Rent allowance (HRA) (25%)</span>
                    <span className="font-mono">{formatINR(selectBreakdown.hra)}</span>
                  </div>

                  <div className="flex justify-between font-medium">
                    <span>Special Allowance (25%)</span>
                    <span className="font-mono">{formatINR(selectBreakdown.specialAllowance)}</span>
                  </div>

                  <div className="flex justify-between font-medium text-emerald-600">
                    <span>Ground Expenses Allowances</span>
                    <span className="font-mono">+{formatINR(selectedEmp.allowance)}</span>
                  </div>

                  <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-slate-900 bg-slate-50 px-2 py-1 rounded">
                    <span>Gross Earnings Sum</span>
                    <span className="font-mono">{formatINR(selectedEmp.salary + selectedEmp.allowance)}</span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="space-y-2 border-l border-slate-100 pl-4">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-1">Statutory Deductions</span>
                  
                  <div className="flex justify-between text-slate-650">
                    <span>Employee Provident Fund ({epfRate}%)</span>
                    <span className="font-mono">-{formatINR(selectBreakdown.epfDeduction)}</span>
                  </div>

                  <div className="flex justify-between text-slate-650">
                    <span>Employee State Insurance ({esiRate}%)</span>
                    <span className="font-mono">-{formatINR(selectBreakdown.esiDeduction)}</span>
                  </div>

                  <div className="flex justify-between text-slate-650">
                    <span>Tax Withheld / TDS ({tdsRate}%)</span>
                    <span className="font-mono">-{formatINR(selectBreakdown.tdsDeduction)}</span>
                  </div>

                  <div className="flex justify-between text-slate-650">
                    <span>Professional Tax (PT Rate)</span>
                    <span className="font-mono">-{formatINR(selectBreakdown.profTax)}</span>
                  </div>

                  <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded">
                    <span>Gross Deductions</span>
                    <span className="font-mono">-{formatINR(selectBreakdown.totalDeductions)}</span>
                  </div>
                </div>
              </div>

              {/* Net settled payload */}
              <div className="bg-[#1e293b] text-white p-4 rounded-2xl flex justify-between items-center mt-6">
                <div>
                  <span className="text-[9.5px] text-slate-400 uppercase font-black tracking-widest block">Net Settled Salary</span>
                  <p className="text-[10px] text-slate-350 italic mt-0.5 mt-1">Certified secure bank wire transfer.</p>
                </div>
                <span className="text-lg font-black font-mono tracking-tight text-emerald-400">
                  {formatINR(selectBreakdown.calculatedNet)}
                </span>
              </div>

              <div className="flex items-center gap-2 pt-4 justify-between border-t border-slate-100">
                <span className="text-[9px] text-slate-400 font-mono">Authorized Code: CRM-W3A-NACH-SECURE</span>
                
                <button
                  onClick={() => {
                    if ((window as any).__triggerGlobalPrint) {
                      (window as any).__triggerGlobalPrint(
                        `Salary Payslip - ${selectedEmp.name}`,
                        'payroll_slip',
                        {
                          employeeId: selectedEmp.id,
                          name: selectedEmp.name,
                          role: selectedEmp.role,
                          department: selectedEmp.department,
                          grossEarnings: (selectedEmp.salary + selectedEmp.allowance),
                          totalDeductions: selectBreakdown.totalDeductions,
                          calculatedNet: selectBreakdown.calculatedNet,
                          basic: selectBreakdown.basic,
                          hra: selectBreakdown.hra,
                          specialAllowance: selectBreakdown.specialAllowance,
                          allowance: selectedEmp.allowance,
                          epf: selectBreakdown.epfDeduction,
                          esi: selectBreakdown.esiDeduction,
                          tds: selectBreakdown.tdsDeduction,
                          profTax: selectBreakdown.profTax,
                          billingMonth: payslipMonth,
                          billingYear: payslipYear,
                        }
                      );
                    } else {
                      window.print();
                    }
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Statement
                </button>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ===================== MODAL 4: LOG LEAVE REQUEST FORM ===================== */}
      {isLeaveRequestOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-105 shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Apply for Leave Allocation</h3>
            
            <form onSubmit={handleRequestLeave} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Leave Category Type</label>
                <select
                  className="w-full border border-slate-205 rounded-lg p-2 text-xs bg-white focus:outline-none"
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as any)}
                >
                  <option value="Casual Leave">Casual Leave</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Paid Leave">Paid/LOB Leave</option>
                  <option value="Unpaid Leave">Unpaid Leaves</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Period From</label>
                  <input
                    type="date"
                    required
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                    value={leaveStart}
                    onChange={(e) => setLeaveStart(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Period To</label>
                  <input
                    type="date"
                    required
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                    value={leaveEnd}
                    onChange={(e) => setLeaveEnd(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Justification Reason</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Provide brief justification under compliance guidelines..."
                  className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                  value={leaveReason}
                  onChange={(e) => setLeaveReason(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsLeaveRequestOpen(false)}
                  className="px-4 py-2 border border-slate-205 text-slate-700 bg-white rounded-lg text-xs font-bold"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL 5: EXPENSE CLAIMS FORM ===================== */}
      {isExpenseClaimOpen && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-105 shadow-2xl relative">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-2">Claim Reimbursement Settlement</h3>
            
            <form onSubmit={handleSubmitExpenseClaim} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Claim Title Summary</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Travel tickets Mumbai Core Terminal yard"
                  className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                  value={expenseTitle}
                  onChange={(e) => setExpenseTitle(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Category Type</label>
                  <select
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs bg-white"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value as any)}
                  >
                    <option value="Travel">Travel</option>
                    <option value="Client Entertainment">Client Entertainment</option>
                    <option value="Hardware/Assets">Hardware/Assets</option>
                    <option value="Training/Certifications">Training/Certifications</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Claim Value (INR)</label>
                  <input
                    type="number"
                    required
                    className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-wider mb-1">Additional Notes</label>
                <textarea
                  rows={2}
                  placeholder="Enter invoice receipt reference info, specific tasks, or notes..."
                  className="w-full border border-slate-205 rounded-lg p-2 text-xs"
                  value={expenseNotes}
                  onChange={(e) => setExpenseNotes(e.target.value)}
                ></textarea>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsExpenseClaimOpen(false)}
                  className="px-4 py-2 border border-slate-205 text-slate-700 bg-white rounded-lg text-xs font-bold"
                >
                  Abort
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 text-white rounded-lg text-xs font-bold shadow-sm"
                >
                  Submit Voucher claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
