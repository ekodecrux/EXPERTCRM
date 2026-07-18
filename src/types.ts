export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: 'New Leads' | 'Qualification' | 'Proposal' | 'Negotiation' | 'Won';
  value: number;
  source: 'Website' | 'Referral' | 'Social Media' | 'Walk-in' | 'Others' | 'Calling';
  dateAdded: string;
  notes?: string;
  aiInsight?: {
    pitch: string;
    closeProbability: number;
    recommendedAction: string;
    sentiment: string;
  };
}

export interface CallLog {
  id: string;
  clientName: string;
  clientPhone: string;
  time: string;
  duration: string; // e.g. "3m 45s"
  type: 'Answered' | 'Missed';
  notes: string;
  agentName: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  clientName: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Open' | 'In Progress' | 'Resolved';
  category: 'Billing' | 'Technical' | 'General Inquiry' | 'Account Access';
  createdTime: string;
  description: string;
  aiResponseDraft?: string;
}

export interface FieldStaff {
  id: string;
  name: string;
  avatar: string;
  status: 'Active' | 'Offline' | 'On Route' | 'On Site';
  battery: number;
  latitudePercentage: number; // For mockup coordinates (0-100)
  longitudePercentage: number; // For mockup coordinates (0-100)
  tasksCompleted: number;
  visitsToday: number;
  phone: string;
}

export interface Task {
  id: string;
  title: string;
  clientName?: string;
  time: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  assignedTo?: string;
  assignedToId?: string; // e.g. staff id or employee id
  type?: 'Task' | 'Meeting' | 'Follow-up';
  meetingDetails?: {
    link?: string;
    location?: string;
    date?: string;
    agenda?: string;
    duration?: string;
    type: 'Virtual' | 'Physical';
  };
  followUpDetails?: {
    stage: string;
    nextContactDate: string;
    lastResponse?: string;
    isOverdue?: boolean;
    leadId?: string;
  };
  createdAt?: string;
}

export interface ActivityHistoryLog {
  id: string;
  timestamp: string;
  type: 'Task' | 'Meeting' | 'Follow-up' | 'Assignment' | 'StatusUpdate' | 'Deletion';
  action: string;
  details: string;
  performedBy: string;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  attendance: 'Present' | 'Absent' | 'On Leave';
  salary: number;
  allowance: number;
  deduction: number;
  netPay: number;
  paidStatus: 'Paid' | 'Unpaid';
  payoutDate?: string;
}

export interface CommsLog {
  id: string;
  recipient: string;
  type: 'Email' | 'SMS' | 'WhatsApp';
  subject?: string;
  content: string;
  sentTime: string;
  status: 'Sent' | 'Delivered' | 'Pending';
}

export type AccessRole = 'Super Admin' | 'Admin' | 'Sales Manager' | 'Support Agent' | 'HR Specialist' | 'Guest' | (string & {});

export interface AccessControl {
  role: AccessRole;
  permissions: {
    viewDashboard: boolean;
    manageLeads: boolean;
    manageCalls: boolean;
    manageSupport: boolean;
    manageStaff: boolean;
    manageTasks: boolean;
    manageHR: boolean;
    manageComms: boolean;
    manageSecurity: boolean;
  };
}
