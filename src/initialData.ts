import { Lead, CallLog, SupportTicket, FieldStaff, Task, Employee, CommsLog, AccessControl } from './types';

export const INITIAL_LEADS: Lead[] = [
  {
    id: 'L-101',
    name: 'John Doe',
    company: 'Bluestone Biotech',
    email: 'johndoe@bluestone.com',
    phone: '9876543210',
    status: 'New Leads',
    value: 125600,
    source: 'Website',
    dateAdded: '2026-06-15',
    notes: 'Inquired about multi-license integrations and custom API gateways.'
  },
  {
    id: 'L-102',
    name: 'Preeti Sharma',
    company: 'Apex Retail',
    email: 'p.sharma@apexretail.in',
    phone: '9123456789',
    status: 'Qualification',
    value: 85000,
    source: 'Referral',
    dateAdded: '2026-06-14',
    notes: 'Referred by key client. Needs billing sync with POS system.'
  },
  {
    id: 'L-103',
    name: 'David Miller',
    company: 'Quantum Tech Inc',
    email: 'miller@quantumtech.com',
    phone: '8765432109',
    status: 'Proposal',
    value: 175000,
    source: 'Social Media',
    dateAdded: '2026-06-12',
    notes: 'Responded to LinkedIn post. Wants detailed security whitepaper.'
  },
  {
    id: 'L-104',
    name: 'Amit Patel',
    company: 'Hindustan Logistics',
    email: 'amit@hindustanlogs.com',
    phone: '9456712390',
    status: 'Negotiation',
    value: 320000,
    source: 'Walk-in',
    dateAdded: '2026-06-10',
    notes: 'Walk-in demo request. Negotiating custom multi-year support tier.'
  },
  {
    id: 'L-105',
    name: 'Sarah Jenkins',
    company: 'Vertex Designs Corp',
    email: 'sarah@vertexcorp.co.uk',
    phone: '7548293022',
    status: 'Won',
    value: 210000,
    source: 'Others',
    dateAdded: '2026-06-08',
    notes: 'Closed custom design pipeline deployment.'
  },
  {
    id: 'L-106',
    name: 'Raj Malhotra',
    company: 'Malhotra Group Corp',
    email: 'raj@malhotragroup.in',
    phone: '9988776655',
    status: 'New Leads',
    value: 45000,
    source: 'Website',
    dateAdded: '2026-06-16'
  },
  {
    id: 'L-107',
    name: 'Sneha Reddy',
    company: 'Hyderabad Logistics Solutions',
    email: 'sneha@hydlogs.com',
    phone: '9000188822',
    status: 'Proposal',
    value: 120000,
    source: 'Website',
    dateAdded: '2026-06-16'
  }
];

export const INITIAL_CALL_LOGS: CallLog[] = [
  {
    id: 'CALL-501',
    clientName: 'John Doe',
    clientPhone: '9876543210',
    time: '2 hours ago',
    duration: '2m 15s',
    type: 'Answered',
    notes: 'Inquired about multi-license integrations and custom API gateways. Follow-up task scheduled.',
    agentName: 'Aman Varma'
  },
  {
    id: 'CALL-502',
    clientName: 'Preeti Sharma',
    clientPhone: '9123456789',
    time: '4 hours ago',
    duration: '0m 0s',
    type: 'Missed',
    notes: 'Inbound ring timed out after 25s. System flagged as VIP priority follow-up.',
    agentName: 'Deepa Rao'
  },
  {
    id: 'CALL-503',
    clientName: 'David Miller',
    clientPhone: '8765432109',
    time: 'Yesterday',
    duration: '5m 40s',
    type: 'Answered',
    notes: 'Discussed cloud scaling, database residency rules, and security clearance criteria.',
    agentName: 'Siddharth Sen'
  },
  {
    id: 'CALL-504',
    clientName: 'Amit Patel',
    clientPhone: '9456712390',
    time: '2 days ago',
    duration: '12m 10s',
    type: 'Answered',
    notes: 'Conducted live system-wide CRM walkthrough including billing and payroll modules.',
    agentName: 'Ketan Patel'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TCK-201',
    subject: 'Billing discrepancy in annual plan',
    clientName: 'Priya Mehta',
    priority: 'High',
    status: 'Open',
    category: 'Billing',
    createdTime: '2026-06-17 08:30 AM',
    description: 'Charged twice during initial checkout transaction. Bank logs show both processed.'
  },
  {
    id: 'TCK-202',
    subject: 'API connection reports 403 Forbidden',
    clientName: 'Karan Malhotra',
    priority: 'Medium',
    status: 'In Progress',
    category: 'Technical',
    createdTime: '2026-06-16 04:15 PM',
    description: 'Integrations fail on authenticating webhook updates. Header token matches configuration exactly.'
  },
  {
    id: 'TCK-203',
    subject: 'Add more user seats',
    clientName: 'Ramesh Chenoy',
    priority: 'Low',
    status: 'Resolved',
    category: 'Account Access',
    createdTime: '2026-06-15 11:00 AM',
    description: 'Need to provision 5 additional seats under the design division workspace logs.',
    aiResponseDraft: 'Hi Ramesh, We have provisioned the additional seats for your design division workspace logs. You can change their roles under Security & Access Control. Warm regards, Support Desk.'
  }
];

export const INITIAL_STAFF: FieldStaff[] = [
  {
    id: 'STF-01',
    name: 'Ketan Patel',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    status: 'On Site',
    battery: 88,
    latitudePercentage: 42,
    longitudePercentage: 55,
    tasksCompleted: 4,
    visitsToday: 5,
    phone: '9898012345'
  },
  {
    id: 'STF-02',
    name: 'Meera Nair',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face',
    status: 'On Route',
    battery: 92,
    latitudePercentage: 58,
    longitudePercentage: 62,
    tasksCompleted: 2,
    visitsToday: 4,
    phone: '9786432110'
  },
  {
    id: 'STF-03',
    name: 'Sandeep Roy',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    status: 'Active',
    battery: 74,
    latitudePercentage: 35,
    longitudePercentage: 45,
    tasksCompleted: 1,
    visitsToday: 3,
    phone: '8112233445'
  }
];

export const INITIAL_TASKS: Task[] = [
  {
    id: 'TSK-901',
    title: 'Call with John Doe',
    clientName: 'John Doe',
    time: '10:00 AM',
    status: 'Completed',
    priority: 'High',
    description: 'Follow up on proposed terms and integration modules.'
  },
  {
    id: 'TSK-902',
    title: 'Meeting with ABC Pvt Ltd',
    clientName: 'ABC Pvt Ltd',
    time: '11:30 AM',
    status: 'In Progress',
    priority: 'High',
    description: 'Product demonstration walkthrough focusing on multi-team hierarchies.'
  },
  {
    id: 'TSK-903',
    title: 'Send Quotation',
    clientName: 'Sneha Reddy',
    time: '01:00 PM',
    status: 'Pending',
    priority: 'Medium',
    description: 'Formulate and send enterprise cost spreadsheet.'
  },
  {
    id: 'TSK-904',
    title: 'Site Visit - Client Location',
    clientName: 'Ketan Patel',
    time: '03:00 PM',
    status: 'Pending',
    priority: 'Medium',
    description: 'Support field engineer Ketan at the primary cluster site.'
  }
];

export const INITIAL_EMPLOYEES: Employee[] = [
  {
    id: 'EMP-01',
    name: 'Aman Varma',
    role: 'Lead Business Developer',
    department: 'Sales & Growth',
    attendance: 'Present',
    salary: 120000,
    allowance: 12500,
    deduction: 4500,
    netPay: 128000,
    paidStatus: 'Paid',
    payoutDate: '2026-06-01'
  },
  {
    id: 'EMP-02',
    name: 'Siddharth Sen',
    role: 'Key Account Manager',
    department: 'Sales & Growth',
    attendance: 'Present',
    salary: 95000,
    allowance: 8500,
    deduction: 3200,
    netPay: 100300,
    paidStatus: 'Paid',
    payoutDate: '2026-06-01'
  },
  {
    id: 'EMP-03',
    name: 'Deepa Rao',
    role: 'Support Engineering Lead',
    department: 'Customer Delivery',
    attendance: 'Present',
    salary: 110000,
    allowance: 5000,
    deduction: 4000,
    netPay: 111000,
    paidStatus: 'Paid',
    payoutDate: '2026-06-01'
  },
  {
    id: 'EMP-04',
    name: 'Ketan Patel',
    role: 'Senior Field Technician',
    department: 'Operations',
    attendance: 'Present',
    salary: 80000,
    allowance: 9500,
    deduction: 2100,
    netPay: 87400,
    paidStatus: 'Unpaid'
  }
];

export const INITIAL_COMMS: CommsLog[] = [
  {
    id: 'COM-301',
    recipient: 'John Doe',
    type: 'Email',
    subject: 'Requested Proposal Sheets - Expert CRM',
    content: 'Hi John, thank you for checking out our solution! Attached is the core integrations guide sheets.',
    sentTime: '10:15 AM',
    status: 'Sent'
  },
  {
    id: 'COM-302',
    recipient: 'Amit Patel',
    type: 'SMS',
    content: 'Hi Amit, your scheduled meeting at our headquarters is confirmed at 2PM today.',
    sentTime: '11:45 AM',
    status: 'Delivered'
  },
  {
    id: 'COM-303',
    recipient: 'Rohan (ABC)',
    type: 'WhatsApp',
    content: 'Awesome connecting with you Rohan! Appreciate your deep feedback during the portal demonstration.',
    sentTime: '12:30 PM',
    status: 'Delivered'
  }
];

export const INITIAL_SECURITY: AccessControl = {
  role: 'Super Admin',
  permissions: {
    viewDashboard: true,
    manageLeads: true,
    manageCalls: true,
    manageSupport: true,
    manageStaff: true,
    manageTasks: true,
    manageHR: true,
    manageComms: true,
    manageSecurity: true
  }
};
