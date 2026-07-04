import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, Send, Search, Loader2, Sparkles, Mail, Phone, 
  HelpCircle, CheckCircle, Smartphone, Clock, Database, Shield, Zap, 
  AlertCircle, RefreshCw, BarChart2, Plus, Trash2, Check, Sliders, 
  Play, Pause, Server, Wifi, Activity, Laptop, ChevronRight, Eye, 
  Settings, Terminal, FileText, SendHorizontal, Edit2, Share2, Layers, 
  AlertTriangle, Lock, EyeOff, Globe, Volume2, CloudLightning, Info, ArrowRight
} from 'lucide-react';
import { CommsLog, Lead, AccessControl } from '../types';

interface CommunicationManagerProps {
  commsLogs: CommsLog[];
  leads: Lead[];
  onAddCommLog: (log: Omit<CommsLog, 'id' | 'sentTime'>) => void;
  accessControl?: AccessControl;
}

type ModeTab = 'overview' | 'email' | 'mobile' | 'notifications' | 'automation' | 'cloud';

// Simulated Email folder types
type EmailFolder = 'inbox' | 'sent' | 'drafts' | 'trash';

interface MockEmail {
  id: string;
  sender: string;
  emailAddress: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  read: boolean;
  replied?: boolean;
}

interface WorkflowStep {
  id: string;
  type: 'delay' | 'email' | 'sms' | 'whatsapp' | 'alert';
  title: string;
  summary: string;
  config: Record<string, string>;
}

interface Workflow {
  id: string;
  name: string;
  status: 'Active' | 'Draft' | 'Inactive';
  runs: number;
  conversion: number;
  steps: WorkflowStep[];
}

interface NotificationTemplate {
  id: string;
  name: string;
  channel: 'Email' | 'SMS' | 'WhatsApp';
  templateText: string;
}

export default function CommunicationManager({
  commsLogs,
  leads,
  onAddCommLog,
  accessControl
}: CommunicationManagerProps) {
  // Extract permissions
  const activeRole = accessControl?.role || 'Super Admin';
  const hasCommsPermission = accessControl?.permissions?.manageComms !== false || activeRole === 'Super Admin';

  const [activeTab, setActiveTab] = useState<ModeTab>('overview');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'warning' | 'error' } | null>(null);

  // Search input for various logs
  const [searchTerm, setSearchTerm] = useState('');

  // 1. REPORTS & ANALYTICS DATA
  const [selectedAnalyticsTimeframe, setSelectedAnalyticsTimeframe] = useState<'7d' | '30d' | 'all'>('30d');

  // 2. EMAIL INTEGRATION STATE
  const [activeEmailFolder, setActiveEmailFolder] = useState<EmailFolder>('inbox');
  const [selectedEmailId, setSelectedEmailId] = useState<string>('EM-01');
  const [emailCredentials, setEmailCredentials] = useState(() => {
    const saved = localStorage.getItem('crm_email_credentials');
    return saved ? JSON.parse(saved) : {
      smtpHost: 'smtp.gmail.com',
      smtpPort: '587',
      username: 'ekodecrux@gmail.com',
      status: 'Connected' as 'Connected' | 'Disconnected' | 'Verifying'
    };
  });

  useEffect(() => {
    localStorage.setItem('crm_email_credentials', JSON.stringify(emailCredentials));
  }, [emailCredentials]);
  
  const [mockEmails, setMockEmails] = useState<MockEmail[]>(() => {
    const saved = localStorage.getItem('crm_mock_emails');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'EM-01',
        sender: 'Siddharth Sen',
        emailAddress: 'sid@expertcrm.com',
        subject: 'Inquiry regarding software onboarding stages pricing structure',
        preview: 'Hi team, checking on the onboarding timeline and if there is any discount for bulk licenses.',
        body: `Dear Sales Team,\n\nI hope you are doing well. I am the Lead Sales Architect at Siddharth Sen Enterprise.\n\nWe are currently evaluating ExpertCRM for our fleet of 25 field service workers. I wanted to ask a couple of quick questions:\n1. What is the typical duration for complete data syncing onboarding?\n2. Are training materials and platform configurations customizable?\n3. Do you support native Twilio and WhatsApp connections for our custom agents?\n\nLooking forward to your comprehensive response.\n\nBest regards,\nSiddharth Sen`,
        date: 'Today, 08:45 AM',
        read: false
      },
      {
        id: 'EM-02',
        sender: 'Aman Varma',
        emailAddress: 'aman@expertcrm.com',
        subject: 'Urgent: Syncing issues on Mobile App terminal access',
        preview: 'Hello support, we are noticing a slight lag when syncing from mobile offline mode.',
        body: `Hi Support Desk,\n\nThis is Aman from the Delhi Sales Division. One of our staff members experienced a slight lag while syncing lead forms from the mobile app outside of immediate WiFi ranges. \n\nIs there a local persistent cache we can trigger? Please advise.\n\nThanks,\nAman.`,
        date: 'Today, 07:12 AM',
        read: true
      },
      {
        id: 'EM-03',
        sender: 'Deepa Rao',
        emailAddress: 'deepa@expertcrm.com',
        subject: 'Partnership Proposal: SLA requirements and security whitepaper',
        preview: 'Hi Aman, we reviewed your CRM pitch deck and would love to access your latest SOC2 compliance.',
        body: `Dear Aman Varma,\n\nExcellent chatting with you yesterday on our introductory call. \n\nBefore launching our official pilot program with ExpertCRM, our compliance director requires a copy of your formal SOC2 Type II audit or an equivalent security whitepaper on cloud database protection policies.\n\nCould you please share this file at your earliest convenience?\n\nWarm regards,\nDeepa Rao`,
        date: 'Yesterday, 04:30 PM',
        read: true
      },
      {
        id: 'EM-04',
        sender: 'Ketan Patel',
        emailAddress: 'ketan@expertcrm.com',
        subject: 'W2 and Payroll slip dispute regarding recent allowances',
        preview: 'Hello HR division, my net payout matches the base but is missing the weekend routing allowance.',
        body: `Hi HR Specialists,\n\nI noticed my disbursed payout slip this month matches the base ledger perfectly but seems to have skipped my field commission weekend routing allowance. \n\nCould we run a quick verification scan on this ledger state?\n\nBest,\nKetan.`,
        date: '15 June, 02:40 PM',
        read: true
      }
    ];
  });

  // AI draft states inside Mail composer
  const [draftLeadId, setDraftLeadId] = useState('');
  const [draftMedium, setDraftMedium] = useState<'Email' | 'SMS' | 'WhatsApp'>('Email');
  const [draftTone, setDraftTone] = useState<'Professional' | 'Friendly' | 'Urgent' | 'Persuasive'>('Professional');
  const [draftContext, setDraftContext] = useState('');
  const [generatingDraft, setGeneratingDraft] = useState(false);
  const [composedDraftText, setComposedDraftText] = useState('');

  // 3. SMS & WHATSAPP STATE + MOBILE EMULATOR
  const [mobileActiveLeadId, setMobileActiveLeadId] = useState<string>('');
  const [mobileChannel, setMobileChannel] = useState<'SMS' | 'WhatsApp'>('WhatsApp');
  const [mobileMessageInput, setMobileMessageInput] = useState('');
  const [twilioConfig, setTwilioConfig] = useState(() => {
    const saved = localStorage.getItem('crm_twilio_config');
    return saved ? JSON.parse(saved) : {
      accountSid: 'AC_MOCK_TWILIO_SID_FOR_DEMO_PURPOSES',
      balance: '150.00',
      number: '+1 (555) 019-2831',
      whatsappMetaNumber: '+1 (555) 019-2831',
      status: 'Active' as 'Active' | 'Inactive'
    };
  });

  useEffect(() => {
    localStorage.setItem('crm_twilio_config', JSON.stringify(twilioConfig));
  }, [twilioConfig]);
  
  // Real-time conversation states per lead in Mobile app
  const [conversations, setConversations] = useState<Record<string, { sender: string; text: string; time: string; type: 'incoming' | 'outgoing' }[]>>(() => {
    const saved = localStorage.getItem('crm_conversations');
    if (saved) return JSON.parse(saved);
    return {
      'sid': [
        { sender: 'Siddharth Sen', text: 'Hey there! Just wanted to follow up on the custom quotes setup.', time: '09:12 AM', type: 'incoming' },
        { sender: 'System Agent', text: 'Hi Siddharth, our sales managers are preparing the exact rates parameters as we speak.', time: '09:15 AM', type: 'outgoing' },
        { sender: 'Siddharth Sen', text: 'Perfect, looking forward to starting the WhatsApp live campaign integrations.', time: '09:17 AM', type: 'incoming' }
      ],
      'aman': [
        { sender: 'Aman Varma', text: 'Have the updated payroll sheets been dispatched yet?', time: 'Yesterday', type: 'incoming' },
        { sender: 'System Agent', text: 'Yes Aman! Disbursed on 17/06 with dynamic audit confirmation.', time: 'Yesterday', type: 'outgoing' }
      ]
    };
  });

  // 4. NOTIFICATIONS STATE
  const [notificationTemplates, setNotificationTemplates] = useState<NotificationTemplate[]>(() => {
    const saved = localStorage.getItem('crm_notification_templates');
    if (saved) return JSON.parse(saved);
    return [
      { id: 'NT-01', name: 'Lead Qualified Welcome Alert', channel: 'Email', templateText: 'Hello {{name}}, welcome to ExpertCRM! Your dedicated Sales manager is {{sales_rep}}. We look forward to optimizing your business operations.' },
      { id: 'NT-02', name: 'Critical Support Priority SMS', channel: 'SMS', templateText: 'ALERT: Support ticket {{ticket_id}} is labeled High Priority. Support Agent will contact you on {{phone}} shortly.' },
      { id: 'NT-03', name: 'Automated WhatsApp Receipt', channel: 'WhatsApp', templateText: 'Hello {{name}}! 👋 Thanks for subscribing to our plan. Your payment has cleared perfectly. Transaction Hash: {{hash}}' }
    ];
  });
  const [newTemplateForm, setNewTemplateForm] = useState({ name: '', channel: 'Email' as 'Email' | 'SMS' | 'WhatsApp', templateText: '' });
  const [notificationTestOutput, setNotificationTestOutput] = useState<string[]>([]);

  // 5. WORKFLOW AUTOMATION STATE
  const [workflows, setWorkflows] = useState<Workflow[]>(() => {
    const saved = localStorage.getItem('crm_workflows');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'WF-01',
        name: 'New Lead Welcome Sequencer',
        status: 'Active',
        runs: 142,
        conversion: 48,
        steps: [
          { id: 'st-1', type: 'delay', title: 'Wait Interval', summary: 'Pause pipeline for 3 minutes', config: { value: '3', unit: 'minutes' } },
          { id: 'st-2', type: 'email', title: 'Dispatch Intro Email', summary: 'Compose and dispatch core onboarding kit', config: { templateId: 'NT-01' } },
          { id: 'st-3', type: 'delay', title: 'Wait Interval', summary: 'Pause pipeline for 1 day', config: { value: '1', unit: 'days' } },
          { id: 'st-4', type: 'whatsapp', title: 'Automated WhatsApp Greeting', summary: 'Trigger personal check-in note', config: { templateId: 'NT-03' } }
        ]
      },
      {
        id: 'WF-02',
        name: 'High-Priority Support Ticket SLA Ping',
        status: 'Active',
        runs: 58,
        conversion: 94,
        steps: [
          { id: 'wf2-st-1', type: 'alert', title: 'Critical Sound Trigger', summary: 'Flash red alert popup on support desk', config: {} },
          { id: 'wf2-st-2', type: 'sms', title: 'SLA Broker SMS Warning', summary: 'Send urgent message to assigned Specialist', config: { templateId: 'NT-02' } }
        ]
      }
    ];
  });
  const [activeWorkflowId, setActiveWorkflowId] = useState<string>('WF-01');
  const selectedWorkflow = workflows.find(w => w.id === activeWorkflowId) || workflows[0];

  // 6. CLOUD ACCESS & REAL-TIME UPDATES STATE
  const [realtimeUptime, setRealtimeUptime] = useState<string>('99.98%');
  const [activeSocketHeartbeats, setActiveSocketHeartbeats] = useState<number>(14);
  const [cloudLatencyLogs, setCloudLatencyLogs] = useState<{ region: string; speed: number; status: 'optimal' | 'warning' }[]>([
    { region: 'Google Cloud - Asia-East (Changhua)', speed: 28, status: 'optimal' },
    { region: 'Google Cloud - Asia-South (Mumbai)', speed: 34, status: 'optimal' },
    { region: 'Google Cloud - US-West (Oregon)', speed: 78, status: 'optimal' },
    { region: 'Cloud Run Ingress Proxy Node', speed: 12, status: 'optimal' }
  ]);
  const [serverConsoleLogs, setServerConsoleLogs] = useState<string[]>([
    `[${new Date().toISOString().substring(11, 19)}] WS:// connection established. Auth key authenticated (SHA-256).`,
    `[${new Date().toISOString().substring(11, 19)}] Twilio Gateway connected. Account balance healthy: ₹3,990.00.`,
    `[${new Date().toISOString().substring(11, 19)}] Meta WhatsApp Cloud API webhooks listening: SUCCESS.`
  ]);
  const [isDemoTriggering, setIsDemoTriggering] = useState(false);

  // Persistence effects
  useEffect(() => {
    localStorage.setItem('crm_mock_emails', JSON.stringify(mockEmails));
  }, [mockEmails]);

  useEffect(() => {
    localStorage.setItem('crm_conversations', JSON.stringify(conversations));
  }, [conversations]);

  useEffect(() => {
    localStorage.setItem('crm_notification_templates', JSON.stringify(notificationTemplates));
  }, [notificationTemplates]);

  useEffect(() => {
    localStorage.setItem('crm_workflows', JSON.stringify(workflows));
  }, [workflows]);

  // Handle active email selection change
  const currentEmail = mockEmails.find(e => e.id === selectedEmailId) || mockEmails[0];

  useEffect(() => {
    if (currentEmail && !currentEmail.read) {
      setMockEmails(prev => prev.map(m => m.id === currentEmail.id ? { ...m, read: true } : m));
    }
    // Set default values for quick draft if email selected is client
    if (currentEmail) {
      const matchLead = leads.find(l => l.email.toLowerCase() === currentEmail.emailAddress.toLowerCase() || l.name.toLowerCase() === currentEmail.sender.toLowerCase());
      if (matchLead) {
        setDraftLeadId(matchLead.id);
      }
    }
  }, [selectedEmailId]);

  // Set default active lead on mobile load
  useEffect(() => {
    if (leads && leads.length > 0 && !mobileActiveLeadId) {
      setMobileActiveLeadId(leads[0].id);
    }
  }, [leads]);

  // Show customized toasts
  const triggerToast = (message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Role Protection guard helper
  const executeWithPermission = (actionName: string, actionFn: () => void) => {
    if (!hasCommsPermission) {
      triggerToast(`Access Restricted: "${activeRole}" privilege level prohibits executing: ${actionName}. Adjust in Security panel.`, 'error');
      // Append warning logged to console
      setServerConsoleLogs(prev => [
        `[${new Date().toISOString().substring(11, 19)}] SECURITY SHIELD ACTION: Authorization Denied for role "${activeRole}" on "${actionName}"`,
        ...prev
      ]);
      return;
    }
    actionFn();
  };

  // -----------------------------------------------------
  // email dispatch simulation
  // -----------------------------------------------------
  const handleComposeWithAI = async (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingDraft(true);
    setComposedDraftText('');

    const targetLead = leads.find(l => l.id === draftLeadId);
    const clientName = targetLead ? targetLead.name : 'Valued Customer';
    const company = targetLead ? targetLead.company : 'Enterprise Corp';

    setServerConsoleLogs(prev => [
      `[${new Date().toISOString().substring(11, 19)}] Initiating Gemini AI copywriter call for ${clientName} (${draftMedium})`,
      ...prev
    ]);

    try {
      const response = await fetch('/api/compose-communication', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientName, 
          company, 
          medium: draftMedium, 
          tone: draftTone, 
          topic: draftContext 
        }),
      });

      if (!response.ok) throw new Error('Failed to compose communication');
      const data = await response.json();
      setComposedDraftText(data.draft);
      triggerToast("AI Draft crafted perfectly. Review below!", 'success');
    } catch (err) {
      console.error(err);
      // Fallback generator block
      const generatedFallback = `Subject: Quick synergy alignment regarding ${draftContext || 'ExpertCRM suite setup'}\n\nDear ${clientName},\n\nI hope this email finds you well. Regarding your discussion on "${draftContext || 'integrating cloud metrics'}". we are completely confident our full-suite workflow automation suite can help ${company} reduce standard lead routing friction by up to 35%.\n\nOur system architecture currently manages all multi-channel SMS, WhatsApp, and SMTP email connections. Would you or a specialist on your operations team be available for a brief five-minute virtual walkthrough tomorrow?\n\nWarm regards,\nSales Consultant\nExpertCRM Support Node`;
      setComposedDraftText(generatedFallback);
      triggerToast("Gemini draft configured with custom backup templates.", 'info');
    } finally {
      setGeneratingDraft(false);
    }
  };

  const handleSendDraft = () => {
    if (!composedDraftText) return;
    const targetLead = leads.find(l => l.id === draftLeadId);
    const recipientName = targetLead ? targetLead.name : 'Operational Desk';
    
    executeWithPermission('Dispatch Custom Outreach', () => {
      onAddCommLog({
        recipient: recipientName,
        type: draftMedium,
        subject: draftMedium === 'Email' ? 'Partnership Opportunity Alignment' : undefined,
        content: composedDraftText,
        status: 'Sent'
      });

      // Insert sent item into mock email folders list if email
      if (draftMedium === 'Email') {
        const newEmail: MockEmail = {
          id: `EM-${Date.now().toString().slice(-3)}`,
          sender: 'You (Sales Representative)',
          emailAddress: targetLead ? targetLead.email : 'client@company.com',
          subject: 'RE: Inquiry/Outreach Strategy Response',
          preview: composedDraftText.substring(0, 70) + '...',
          body: composedDraftText,
          date: 'Just now',
          read: true
        };
        // Insert into mock emails sent section
        setMockEmails(prev => [newEmail, ...prev]);
        setActiveEmailFolder('sent');
      } else {
        // SMS or WhatsApp goes to conversations mobile chat
        const key = targetLead ? targetLead.id.toLowerCase().substring(0, 3) : 'gen';
        const newMsg = {
          sender: 'System Agent',
          text: composedDraftText,
          time: 'Just now',
          type: 'outgoing' as const
        };
        setConversations(prev => ({
          ...prev,
          [key]: [...(prev[key] || []), newMsg]
        }));
        setMobileActiveLeadId(targetLead?.id || '');
        setMobileChannel(draftMedium as 'SMS' | 'WhatsApp');
        setActiveTab('mobile');
      }

      setComposedDraftText('');
      setDraftContext('');
      triggerToast(`Outreach approved! Dispatching ${draftMedium} message.`, 'success');
      
      setServerConsoleLogs(prev => [
        `[${new Date().toISOString().substring(11, 19)}] Outbound: ${draftMedium} successfully dispatched to "${recipientName}".`,
        ...prev
      ]);
    });
  };

  const handleSMTPTesting = () => {
    setEmailCredentials(prev => ({ ...prev, status: 'Verifying' }));
    setServerConsoleLogs(prev => [
      `[${new Date().toISOString().substring(11, 19)}] SMTP HANDSHAKE: Testing routing connection nodes at ${emailCredentials.smtpHost}:${emailCredentials.smtpPort}`,
      ...prev
    ]);
    setTimeout(() => {
      setEmailCredentials(prev => ({ ...prev, status: 'Connected' }));
      triggerToast("SMTP Server handshake completed with Google OAuth Cloud Services.", "success");
      setServerConsoleLogs(prev => [
        `[${new Date().toISOString().substring(11, 19)}] SMTP HANDSHAKE: SUCCESS. Authenticated to Google SMTP Relay.`,
        ...prev
      ]);
    }, 1500);
  };

  // -----------------------------------------------------
  // MOBILE EMULATOR INTELLIGENCE
  // -----------------------------------------------------
  const handleMobileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileMessageInput.trim() || !mobileActiveLeadId) return;

    const inputMsg = mobileMessageInput.trim();
    const targetedLead = leads.find(l => l.id === mobileActiveLeadId) || leads[0];
    const lookupKey = targetedLead.id.toLowerCase().substring(0, 3);

    const outboundMsg = {
      sender: 'You',
      text: inputMsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      type: 'outgoing' as const
    };

    setConversations(prev => ({
      ...prev,
      [lookupKey]: [...(prev[lookupKey] || []), outboundMsg]
    }));

    setCommsLogsStateAndSystemLogs(targetedLead.name, mobileChannel, inputMsg);
    setMobileMessageInput('');

    // Simulated Auto-Reply in 2.5 seconds
    setServerConsoleLogs(prev => [
      `[${new Date().toISOString().substring(11, 19)}] Mobile dispatcher queue: Hooking automatic AI-copilot context receiver.`,
      ...prev
    ]);

    setTimeout(() => {
      const responsesAnswers = [
        "Acknowledge! Thanks for the quick update. Can we jump on a call at 3 PM?",
        "Matches my expectations. Please send over the PDF sheets.",
        "Got it, appreciate the transparent breakdown.",
        "Yes, our engineering lead is reviewing the secure token maps today."
      ];
      const randomResponse = responsesAnswers[Math.floor(Math.random() * responsesAnswers.length)];
      
      const inboundMsg = {
        sender: targetedLead.name,
        text: randomResponse,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: 'incoming' as const
      };

      setConversations(prev => {
        const list = prev[lookupKey] || [];
        return {
          ...prev,
          [lookupKey]: [...list, inboundMsg]
        };
      });

      // Play simulated incoming beep note
      triggerIncomingNotification(`New ${mobileChannel} message from ${targetedLead.name}: "${randomResponse}"`);
    }, 2200);
  };

  const setCommsLogsStateAndSystemLogs = (recipient: string, type: 'SMS' | 'WhatsApp', msg: string) => {
    onAddCommLog({
      recipient,
      type,
      content: msg,
      status: 'Delivered'
    });
    setServerConsoleLogs(prev => [
      `[${new Date().toISOString().substring(11, 19)}] Outbound ${type} to ${recipient}: "${msg.substring(0, 40)}"`,
      ...prev
    ]);
  };

  // -----------------------------------------------------
  // NOTIFICATIONS TESTING
  // -----------------------------------------------------
  const triggerIncomingNotification = (msgText: string) => {
    // Generate system toast
    setToast({ message: msgText, type: 'info' });
    setNotificationTestOutput(prev => [
      `[${new Date().toTimeString().split(' ')[0]}] ${msgText}`,
      ...prev
    ]);
    setServerConsoleLogs(prev => [
      `[${new Date().toISOString().substring(11, 19)}] Incoming Webhook notification delivered successfully.`,
      ...prev
    ]);
  };

  const handleTestTrigger = (templateId: string, leadId: string) => {
    const template = notificationTemplates.find(t => t.id === templateId);
    const lead = leads.find(l => l.id === leadId) || leads[0];
    if (!template || !lead) return;

    let text = template.templateText
      .replace('{{name}}', lead.name)
      .replace('{{sales_rep}}', activeRole)
      .replace('{{ticket_id}}', 'TKT-821')
      .replace('{{phone}}', lead.phone)
      .replace('{{hash}}', '0x1C2F...B98A');

    triggerIncomingNotification(`[Simulated Notification] ${template.channel}: "${text}"`);
    
    // Add record to archived communications logs
    onAddCommLog({
      recipient: lead.name,
      type: template.channel,
      subject: template.channel === 'Email' ? 'Automated Notification Alert' : undefined,
      content: text,
      status: 'Delivered'
    });
  };

  const handleCreateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTemplateForm.name || !newTemplateForm.templateText) {
      triggerToast("Provide complete credentials template variables.", "error");
      return;
    }

    executeWithPermission('Create Notification Template', () => {
      const templateObj: NotificationTemplate = {
        id: `NT-0${notificationTemplates.length + 1}`,
        name: newTemplateForm.name,
        channel: newTemplateForm.channel,
        templateText: newTemplateForm.templateText
      };
      setNotificationTemplates(prev => [...prev, templateObj]);
      setNewTemplateForm({ name: '', channel: 'Email', templateText: '' });
      triggerToast(`New template "${templateObj.name}" created!`, "success");
      setServerConsoleLogs(prev => [
        `[${new Date().toISOString().substring(11, 19)}] Template Registry: Added new layout template "${templateObj.name}"`,
        ...prev
      ]);
    });
  };

  // -----------------------------------------------------
  // WORKFLOW AUTO ENGINE
  // -----------------------------------------------------
  const handleAddWorkflowStep = (wfId: string) => {
    executeWithPermission('Edit Workflow State Architecture', () => {
      setWorkflows(prev => prev.map(w => {
        if (w.id === wfId) {
          const nextStepNum = w.steps.length + 1;
          const randomTypes: ('email' | 'sms' | 'whatsapp' | 'delay')[] = ['email', 'delay', 'whatsapp', 'sms'];
          const pickedType = randomTypes[Math.floor(Math.random() * randomTypes.length)];
          
          let title = 'Wait interval';
          let summary = 'Hold execution pipeline for 15 minutes';
          if (pickedType === 'email') { title = "Campaign Pitch Email"; summary = "Dispatch automated Gemni follow-up draft"; }
          if (pickedType === 'sms') { title = "Priority SMS Alert"; summary = "Notify client directly on standard mobile node"; }
          if (pickedType === 'whatsapp') { title = "WhatsApp VIP Thankyou"; summary = "Send customized welcome template"; }

          const stepObj: WorkflowStep = {
            id: `wf-step-${Date.now().toString().slice(-4)}`,
            type: pickedType,
            title,
            summary,
            config: {}
          };
          return {
            ...w,
            steps: [...w.steps, stepObj]
          };
        }
        return w;
      }));
      triggerToast("Trigger workflow block injected.", "success");
    });
  };

  const handleRemoveWorkflowStep = (wfId: string, stepId: string) => {
    executeWithPermission('Edit Workflow State Architecture', () => {
      setWorkflows(prev => prev.map(w => {
        if (w.id === wfId) {
          return {
            ...w,
            steps: w.steps.filter(s => s.id !== stepId)
          };
        }
        return w;
      }));
      triggerToast("Automation state block deleted.", "info");
    });
  };

  const handleToggleWorkflowStatus = (wfId: string) => {
    executeWithPermission('Toggle Run States of Workflows', () => {
      setWorkflows(prev => prev.map(w => {
        if (w.id === wfId) {
          const nextStatus = w.status === 'Active' ? 'Inactive' : 'Active';
          return {
            ...w,
            status: nextStatus
          };
        }
        return w;
      }));
      triggerToast("Automation running status updated.", "success");
    });
  };

  // -----------------------------------------------------
  // REAL-TIME SIMULATION CENTER
  // -----------------------------------------------------
  const triggerSimulatedMessageFlow = () => {
    setIsDemoTriggering(true);
    triggerToast("Starting real-time lead interaction simulation scan...", "info");
    
    setServerConsoleLogs(prev => [
      `[${new Date().toISOString().substring(11, 19)}] DEMO MODE: Initializing random packet traffic scheduler...`,
      ...prev
    ]);

    setTimeout(() => {
      const selectedRandomLead = leads[Math.floor(Math.random() * leads.length)] || { name: 'Client Agent', email: 'sales@partner.com' };
      const subjects = [
        "SLA Inquiry on new service setups",
        "WhatsApp Business connection pricing request",
        "Wants to schedule demo tomorrow morning"
      ];
      const randomSub = subjects[Math.floor(Math.random() * subjects.length)];
      
      const randomNewMail: MockEmail = {
        id: `EM-${Date.now().toString().slice(-3)}`,
        sender: selectedRandomLead.name,
        emailAddress: selectedRandomLead.email || 'client@randcompany.com',
        subject: randomSub,
        preview: 'This is a live generated message simulating real-time webhook reception.',
        body: `Dear support and core sales representatives,\n\nI am sending this from my active portal regarding the ${randomSub}. Is our network setup optimal for our region?\n\nLet me know when we can execute the workspace setup.\n\nWarm regards,\n${selectedRandomLead.name}`,
        date: 'Just now',
        read: false
      };

      setMockEmails(prev => [randomNewMail, ...prev]);
      setSelectedEmailId(randomNewMail.id);
      setIsDemoTriggering(false);
      
      // Flash central notification in the screen corner
      setToast({ message: `[Incoming Webhook Node] Simulated message received from ${selectedRandomLead.name}!`, type: 'success' });
      setServerConsoleLogs(prev => [
        `[${new Date().toISOString().substring(11, 19)}] WEBHOOK DETECTED: Incoming client transaction logged from IP: 192.168.1.10`,
        ...prev
      ]);
    }, 2500);
  };


  return (
    <div id="comms-management-enterprise" className="space-y-6 font-sans">
      
      {/* Visual Toast Overlay */}
      {toast && (
        <div className={`fixed bottom-5 right-5 border p-4.5 rounded-xl text-white flex items-start gap-3 shadow-2xl z-50 animate-bounce max-w-sm ${
          toast.type === 'success' ? 'bg-slate-900 border-emerald-500' :
          toast.type === 'error' ? 'bg-rose-950 border-rose-500' :
          toast.type === 'info' ? 'bg-indigo-950 border-indigo-400' : 'bg-slate-900 border-yellow-500'
        }`}>
          <div className="pt-0.5">
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" /> :
             toast.type === 'error' ? <Lock className="w-5 h-5 text-rose-400 shrink-0" /> :
             toast.type === 'info' ? <Wifi className="w-5 h-5 text-indigo-400 shrink-0 animate-pulse" /> : <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />}
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase text-slate-400 block tracking-wider">
              {toast.type === 'success' ? 'System Success Node' :
               toast.type === 'error' ? 'Security Gate Guarded' :
               toast.type === 'info' ? 'Real-Time Notification Event' : 'System Notice'}
            </span>
            <p className="text-xs font-bold leading-normal">{toast.message}</p>
          </div>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white shrink-0 text-xs font-bold font-mono">×</button>
        </div>
      )}

      {/* Main Administrative Comm Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-slate-900 text-indigo-400 rounded-2xl shadow-sm">
            <MessageSquare className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <h1 className="text-md font-black text-slate-900 tracking-tight">Enterprise Multi-Channel Communications</h1>
            <p className="text-xs text-slate-400">SMTP mailboxes setup, custom Twilio/Meta integration, live alerts test sandbox, and visual workflows dispatcher.</p>
          </div>
        </div>

        {/* Global Security Role Label Badge */}
        <div className="bg-slate-50 border border-slate-150 p-2.5 rounded-xl max-w-sm flex items-center gap-2.5 shadow-6 font-mono self-start md:self-auto">
          <Shield className="w-4.5 h-4.5 text-indigo-500" />
          <div className="text-[10px] font-bold">
            <span className="text-slate-400 uppercase font-black block tracking-wider leading-none">Security Scope Layer</span>
            <span className="text-slate-700 font-extrabold flex items-center gap-1 mt-0.5">
              {activeRole} {!hasCommsPermission && <Lock className="w-3 h-3 text-rose-500" />}
            </span>
          </div>
        </div>
      </div>

      {/* Primary Communication Module Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'overview' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <BarChart2 className="w-4 h-4 text-indigo-500" /> Reports & Analytics
        </button>

        <button
          onClick={() => setActiveTab('email')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'email' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Mail className="w-4 h-4 text-sky-500" /> SMS & Email Integrations
        </button>

        <button
          onClick={() => setActiveTab('mobile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'mobile' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Smartphone className="w-4 h-4 text-emerald-500 animate-pulse" /> Mobile Messaging Demo
        </button>

        <button
          onClick={() => setActiveTab('notifications')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'notifications' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Volume2 className="w-4 h-4 text-amber-500" /> Notifications Sandbox
        </button>

        <button
          onClick={() => setActiveTab('automation')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'automation' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Sliders className="w-4 h-4 text-purple-500" /> Workflow Automations
        </button>

        <button
          onClick={() => setActiveTab('cloud')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'cloud' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4 text-rose-500" /> Cloud Services & Realtime
        </button>
      </div>


      {/* ===================== TAB: OVERVIEW & REPORTS & ANALYTICS ===================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key SLA Metric Widgets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xxs relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Outbound Dispatch Volumes</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-md font-black text-slate-900">1,482</span>
                    <span className="text-[10px] font-black text-emerald-600 font-mono">+12.4%</span>
                  </div>
                </div>
                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                  <Mail className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2.5 font-bold">Average daily load: 49.4 messages</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xxs relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">SLA Delivery Rate</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-md font-black text-slate-900">99.8%</span>
                    <span className="text-[10px] font-black text-emerald-600 font-mono">optimal</span>
                  </div>
                </div>
                <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
                  <Check className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2.5 font-bold">Twilio / Gmail networks up</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xxs relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Average Response Delay</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-md font-black text-slate-900">1.4 min</span>
                    <span className="text-[10px] font-black text-amber-500 font-mono">-18s lower</span>
                  </div>
                </div>
                <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg">
                  <Clock className="w-4.5 h-4.5" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2.5 font-bold">Fastest sector response benchmark</p>
            </div>

            <div className="bg-white p-4.5 rounded-2xl border border-slate-100 shadow-xxs relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500" />
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">AI Copywriter Conversion</span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-md font-black text-slate-900">41.2%</span>
                    <span className="text-[10px] font-black text-indigo-600 font-mono">+8.1% gain</span>
                  </div>
                </div>
                <div className="p-1.5 bg-purple-50 text-purple-600 rounded-lg">
                  <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 mt-2.5 font-bold">Outperforms generic drafts</p>
            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Outbound Channel Distribution Bar-Chart */}
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-150/70 shadow-xxs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50 mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Message Open & Engagement Rates</span>
                <span className="text-[10px] font-mono font-bold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded border border-indigo-150">Active SLA metrics</span>
              </div>

              {/* Styled horizontal volume performance meters */}
              <div className="space-y-5.5 py-4">
                
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> WhatsApp Campaign Channel
                    </span>
                    <span className="font-bold text-slate-500">96.2% Opened <span className="text-slate-350 ml-1">/ 44% Clicks</span></span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-emerald-500 h-full rounded-full" style={{ width: '96.2%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Twilio SMS Dispatch Channel
                    </span>
                    <span className="font-bold text-slate-500">91.8% Opened <span className="text-slate-350 ml-1 text-xs">/ 18% Clicks</span></span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-amber-500 h-full rounded-full" style={{ width: '91.8%' }} />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-extrabold text-slate-700 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-500" /> Standard SMTP Email (Gmail SMTP)
                    </span>
                    <span className="font-bold text-slate-500">48.5% Opened <span className="text-slate-350 ml-1 text-xs">/ 35% Clicks</span></span>
                  </div>
                  <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                    <div className="bg-sky-500 h-full rounded-full" style={{ width: '48.5%' }} />
                  </div>
                </div>

              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 mt-5 text-[10.5px] text-slate-500 flex gap-2 items-start font-medium">
                <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p>Delivery open factors updated every 15 minutes. WhatsApp is currently delivering the highest relative lead conversion and CTA answers.</p>
              </div>
            </div>

            {/* Timeframe graph visualization */}
            <div className="lg:col-span-6 bg-white p-5 rounded-2xl border border-slate-150/70 shadow-xxs">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50 mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Dispatch Funnel Conversions (24 Hours)</span>
                <select 
                  className="p-1 px-2 border border-slate-205 rounded bg-white text-xxs font-extrabold text-slate-650"
                  value={selectedAnalyticsTimeframe}
                  onChange={(e) => setSelectedAnalyticsTimeframe(e.target.value as any)}
                >
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                  <option value="all">Complete Database</option>
                </select>
              </div>

              {/* Styled CSS Column bar representations */}
              <div className="relative h-44 flex items-end justify-between px-6 pt-5 bg-slate-50/50 rounded-xl border border-slate-150 shadow-inner">
                
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-8.5 bg-indigo-200 hover:bg-indigo-300 transition-all rounded-t-lg shadow-sm" style={{ height: '110px' }}>
                    <div className="text-[9px] font-extrabold text-indigo-800 text-center -mt-5">1,241</div>
                  </div>
                  <span className="text-[9.5px] font-extrabold text-slate-500">Addressed</span>
                </div>

                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-8.5 bg-indigo-400 hover:bg-indigo-500 transition-all rounded-t-lg shadow-sm animate-pulse" style={{ height: '94px' }}>
                    <div className="text-[9px] font-extrabold text-indigo-950 text-center -mt-5 font-bold">1,012</div>
                  </div>
                  <span className="text-[9.5px] font-extrabold text-slate-500">Delivered</span>
                </div>

                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-8.5 bg-indigo-600 hover:bg-indigo-700 transition-all rounded-t-lg shadow-sm" style={{ height: '70px' }}>
                    <div className="text-[9px] font-extrabold text-indigo-50 text-center -mt-5">782</div>
                  </div>
                  <span className="text-[9.5px] font-extrabold text-slate-500">Engaged</span>
                </div>

                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="w-8.5 bg-amber-400 hover:bg-amber-505 transition-all rounded-t-lg shadow-sm" style={{ height: '42px' }}>
                    <div className="text-[9px] font-extrabold text-amber-950 text-center -mt-5 font-black">412</div>
                  </div>
                  <span className="text-[9.5px] font-black text-slate-900">Won Lead</span>
                </div>

              </div>

              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="text-center p-2 rounded bg-slate-50 border border-slate-200/50">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-black">Avg Session Cost</span>
                  <p className="text-xs font-black text-slate-700">₹1.50 / interaction</p>
                </div>
                <div className="text-center p-2 rounded bg-slate-50 border border-slate-200/50">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block font-black">AI Auto Response Rate</span>
                  <p className="text-xs font-black text-indigo-600">84.5% SLA Match</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}


      {/* ===================== TAB: EMAIL & OUTBOUND INTEG ===================== */}
      {activeTab === 'email' && (
        <div className="space-y-6">
          
          {/* SMTP Credentials config section */}
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase">Cloud SMTP Gateway Settings</h3>
                <p className="text-xs text-slate-400">Configure corporate server relays to send actual outbound proposal emails from your own accounts.</p>
              </div>
              <button 
                onClick={handleSMTPTesting}
                className="px-3.5 py-1.5 border border-slate-205 text-xs font-extrabold bg-slate-50 rounded-xl hover:bg-slate-150 transition-all flex items-center gap-2"
              >
                {emailCredentials.status === 'Verifying' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5 text-indigo-600" />} Test SMTP Connection
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-medium">
              <div>
                <label className="block text-[9.5px] font-black uppercase text-slate-400 tracking-wider mb-1">SMTP Outbound Host</label>
                <input 
                  type="text" 
                  value={emailCredentials.smtpHost} 
                  onChange={(e) => setEmailCredentials(prev=>({...prev, smtpHost: e.target.value}))} 
                  className="w-full p-2.5 border border-slate-205 rounded-xl bg-slate-50 font-mono tracking-wider focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[9.5px] font-black uppercase text-slate-400 tracking-wider mb-1">SMTP Gateway Port</label>
                <input 
                  type="text" 
                  value={emailCredentials.smtpPort} 
                  onChange={(e) => setEmailCredentials(prev=>({...prev, smtpPort: e.target.value}))} 
                  className="w-full p-2.5 border border-slate-205 rounded-xl bg-slate-50 font-mono tracking-wider focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[9.5px] font-black uppercase text-slate-400 tracking-wider mb-1">Authenticated Account User</label>
                <input 
                  type="text" 
                  value={emailCredentials.username} 
                  onChange={(e) => setEmailCredentials(prev=>({...prev, username: e.target.value}))} 
                  className="w-full p-2.5 border border-slate-205 rounded-xl bg-slate-50 font-mono tracking-wider focus:bg-white"
                />
              </div>
              <div>
                <label className="block text-[9.5px] font-black uppercase text-slate-400 tracking-wider mb-1">SMTP Channel Status</label>
                <div className={`p-2.5 rounded-xl border flex items-center gap-2 font-mono ${
                  emailCredentials.status === 'Connected' ? 'bg-emerald-50 text-emerald-700 border-emerald-150' :
                  emailCredentials.status === 'Verifying' ? 'bg-blue-50 text-blue-700 border-blue-150' : 'bg-rose-50 text-rose-700 border-rose-150'
                }`}>
                  <span className={`w-2.5 h-2.5 rounded-full ${emailCredentials.status === 'Connected' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                  <span className="font-extrabold uppercase text-[10px]">{emailCredentials.status}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Email Inbox simulator folder list */}
            <div className="lg:col-span-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-xxs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-450 block mb-3 pl-1">MOCK EMAIL OFFICE BOX</span>

                {/* Sub Folder toggle lists */}
                <div className="grid grid-cols-4 gap-1 mb-4 bg-slate-100 p-1 rounded-xl border border-slate-200">
                  {(['inbox', 'sent', 'drafts', 'trash'] as EmailFolder[]).map(fol => (
                    <button
                      key={fol}
                      onClick={() => setActiveEmailFolder(fol)}
                      className={`py-1 text-[9.5px] font-black uppercase rounded-lg transition-all ${
                        activeEmailFolder === fol ? 'bg-white text-slate-900 shadow-xxs' : 'text-slate-500'
                      }`}
                    >
                      {fol}
                    </button>
                  ))}
                </div>

                {/* Search Inbox bar */}
                <div className="relative mb-3.5">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search inbox..."
                    className="w-full text-xxs p-2 pl-8 border border-slate-205 bg-slate-50 rounded-xl focus:bg-white"
                  />
                </div>

                {/* Emails listing items */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {mockEmails.map(mail => (
                    <div
                      key={mail.id}
                      onClick={() => setSelectedEmailId(mail.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer hover:bg-slate-50 transition-all ${
                        selectedEmailId === mail.id ? 'bg-indigo-50/30 border-indigo-200' : 'border-slate-150'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1 text-xs">
                        <span className={`font-black text-slate-900 ${!mail.read ? 'underline decoration-indigo-400 decoration-2' : ''}`}>{mail.sender}</span>
                        <span className="text-[9.5px] text-slate-400 font-bold">{mail.date}</span>
                      </div>
                      <p className="text-[11px] text-slate-755 font-bold truncate">{mail.subject}</p>
                      <p className="text-[11px] text-slate-400 mt-1 truncate">{mail.preview}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3 mt-4 flex items-center justify-between text-[11px] text-indigo-600 font-extrabold pr-1">
                <span>Incoming Sync Status: Real-time active</span>
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              </div>
            </div>

            {/* Email detail viewer AND AI reply option */}
            <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-150/70 shadow-xxs flex flex-col justify-between">
              {currentEmail ? (
                <div className="space-y-4">
                  {/* Subject and sender */}
                  <div className="pb-3.5 border-b border-slate-100 flex justify-between items-start">
                    <div className="space-y-1">
                      <h3 className="font-extrabold text-slate-900 text-sm leading-snug">{currentEmail.subject}</h3>
                      <div className="text-xs text-slate-500 font-semibold">
                        From: <span className="text-slate-800 font-black">{currentEmail.sender}</span> <span className="font-mono text-slate-400">&lt;{currentEmail.emailAddress}&gt;</span>
                      </div>
                    </div>
                    <span className="text-xxs font-mono font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                      ID: {currentEmail.id}
                    </span>
                  </div>

                  {/* Mail description details body */}
                  <div className="bg-slate-50/50 p-4.5 rounded-xl border border-slate-150 font-serif text-[11.5px] text-slate-700 leading-relaxed whitespace-pre-line max-h-52 overflow-y-auto">
                    {currentEmail.body}
                  </div>

                  {/* Reply with AI Copywriter workspace */}
                  <div className="bg-slate-50 border border-slate-205 p-4 rounded-xl space-y-4.5">
                    <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> AI REPLY ASSISTANT (Powered by Gemini API)
                    </span>

                    <form onSubmit={handleComposeWithAI} className="space-y-3.5">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[9.5px] font-black uppercase text-slate-400 tracking-wider mb-1">Target Account Lead *</label>
                          <select 
                            required
                            className="w-full text-xs p-2.5 border border-slate-205 rounded-lg bg-white font-extrabold"
                            value={draftLeadId}
                            onChange={(e) => setDraftLeadId(e.target.value)}
                          >
                            <option value="">Select a lead...</option>
                            {leads.map(lead => (
                              <option key={lead.id} value={lead.id}>{lead.name} {lead.company ? `(${lead.company})` : ''}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9.5px] font-black uppercase text-slate-400 tracking-wider mb-1">Dispatch Medium</label>
                          <select 
                            className="w-full text-xs p-2.5 border border-slate-205 rounded-lg bg-white"
                            value={draftMedium}
                            onChange={(e) => setDraftMedium(e.target.value as any)}
                          >
                            <option value="Email">📧 SMTP Email</option>
                            <option value="SMS">💬 SMS text</option>
                            <option value="WhatsApp">🟢 WhatsApp</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[9.5px] font-black uppercase text-slate-400 tracking-wider mb-1">Professional Style</label>
                          <select 
                            className="w-full text-xs p-2.5 border border-slate-205 rounded-lg bg-white font-bold"
                            value={draftTone}
                            onChange={(e) => setDraftTone(e.target.value as any)}
                          >
                            <option value="Professional">🤝 Professional</option>
                            <option value="Friendly">😊 Friendly</option>
                            <option value="Urgent">⏱️ Urgent</option>
                            <option value="Persuasive">🔥 Persuasive</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[9.5px] font-black uppercase text-slate-400 tracking-wider mb-1">Instructions for reply content</label>
                        <textarea 
                          rows={2} required
                          placeholder="e.g. Confirm SOC2 is compliant or offer discount on fleet licenses..."
                          value={draftContext}
                          onChange={(e) => setDraftContext(e.target.value)}
                          className="w-full text-xs p-2.5 border border-slate-20s rounded-lg bg-white focus:ring-1"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={generatingDraft}
                        className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition"
                      >
                        {generatingDraft ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} Draft Email response with Gemini
                      </button>

                    </form>

                    {/* Output and approve controls */}
                    {composedDraftText && (
                      <div className="pt-4 border-t border-slate-150 space-y-3">
                        <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider block">Generated Reply Draft</span>
                        <div className="bg-white p-3 rounded-lg border border-slate-200 font-serif text-[11px] text-slate-700 max-h-44 overflow-y-auto whitespace-pre-line">
                          {composedDraftText}
                        </div>
                        <div className="flex justify-end gap-2 text-xxs">
                          <button onClick={() => setComposedDraftText('')} className="px-3.5 py-1.5 border border-slate-200 text-slate-500 rounded font-bold">Discard</button>
                          <button onClick={handleSendDraft} className="px-4 py-1.5 bg-indigo-600 text-white rounded font-extrabold flex items-center gap-1"><Send className="w-3.5 h-3.5" /> Send & Archive Log</button>
                        </div>
                      </div>
                    )}

                  </div>

                </div>
              ) : (
                <div className="text-center py-20 text-slate-400 italic">No email currently selected. Choose from the inbox pane.</div>
              )}
            </div>

          </div>
        </div>
      )}


      {/* ===================== TAB: MOBILE DEVICE ACCESS & SMS CHAT ===================== */}
      {activeTab === 'mobile' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* SMS Twilio/WhatsApp configuration left panel */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs flex flex-col justify-between space-y-5">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-tracker block">Twilio SMS & Meta WhatsApp configuration</span>
              <p className="text-xs text-slate-500 leading-normal font-medium">Connect Twilio API SID and active Phone coordinates to receive dynamic customer SMS text responses here.</p>

              <div className="p-4 bg-slate-50 border border-slate-205 rounded-xl space-y-4.5">
                
                <div className="text-xs space-y-3 font-medium">
                  <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-150">
                    <span className="text-slate-450 font-bold block text-[9px] uppercase">Account TW_API_SID:</span>
                    <input 
                      type="text" 
                      value={twilioConfig.accountSid} 
                      onChange={(e) => setTwilioConfig(prev => ({ ...prev, accountSid: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1 font-mono text-[10px] text-slate-800"
                    />
                  </div>
                  <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-150">
                    <span className="text-slate-450 font-bold block text-[9px] uppercase">Verified Outbound SMS:</span>
                    <input 
                      type="text" 
                      value={twilioConfig.number} 
                      onChange={(e) => setTwilioConfig(prev => ({ ...prev, number: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1 font-mono text-[10px] text-slate-800 font-semibold"
                    />
                  </div>
                  <div className="space-y-1 bg-white p-2.5 rounded-lg border border-slate-150">
                    <span className="text-slate-450 font-bold block text-[9px] uppercase">WhatsApp Cloud Number:</span>
                    <input 
                      type="text" 
                      value={twilioConfig.whatsappMetaNumber} 
                      onChange={(e) => setTwilioConfig(prev => ({ ...prev, whatsappMetaNumber: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 rounded p-1 font-mono text-[10px] text-slate-800 font-semibold"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-150">
                    <span className="text-slate-455 font-bold text-[9px] uppercase">Twilio Wallet Balance:</span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-slate-400">$</span>
                      <input 
                        type="text" 
                        value={twilioConfig.balance} 
                        onChange={(e) => setTwilioConfig(prev => ({ ...prev, balance: e.target.value }))}
                        className="w-16 bg-slate-50 border border-slate-200 rounded p-1 font-mono text-[10px] text-emerald-600 font-bold text-right"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-wide">Twilio SMS API Status: Active node</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => {
                      localStorage.setItem('crm_twilio_config', JSON.stringify(twilioConfig));
                    }}
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded text-[10px] font-bold transition"
                  >
                    Apply Config
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Lead selectors for chat */}
            <div className="space-y-2">
              <label className="block text-[9.5px] font-black uppercase text-slate-400 tracking-wider mb-1">Swap Channel Lead conversation</label>
              <div className="grid grid-cols-2 gap-2 text-xxs font-bold">
                <button 
                  onClick={() => { setMobileActiveLeadId('sid'); setMobileChannel('WhatsApp'); }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    mobileActiveLeadId === 'sid' ? 'bg-indigo-50 border-indigo-200 shadow-xxs' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-slate-800 font-black">Siddharth Sen</span>
                  <span className="text-slate-400 uppercase tracking-widest text-[9px] mt-0.5 block">WhatsApp thread</span>
                </button>
                <button 
                  onClick={() => { setMobileActiveLeadId('aman'); setMobileChannel('SMS'); }}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    mobileActiveLeadId === 'aman' ? 'bg-indigo-50 border-indigo-200 shadow-xxs' : 'bg-slate-50 hover:bg-slate-100'
                  }`}
                >
                  <span className="block text-slate-800 font-black">Aman Varma</span>
                  <span className="text-slate-400 uppercase tracking-widest text-[9px] mt-0.5 block">Twilio SMS thread</span>
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 italic font-medium leading-normal">
              * Click either profile above to focus on the simulator keyboard on the right. When you type and send, an automated client answer response is fired!
            </p>
          </div>

          {/* HIGH-FIDELITY CSS MOBILE APP EMULATOR MOCKUP */}
          <div className="lg:col-span-7 flex justify-center items-center py-4 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden">
            
            <div className="w-80 bg-slate-900 rounded-[40px] p-3 border-4 border-slate-800 shadow-2xl relative">
              {/* Speaker Notch */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-4.5 bg-slate-900 rounded-full z-20 flex justify-center items-center">
                <div className="w-10 h-1 bg-slate-800 rounded-full" />
              </div>

              {/* Mobile Screen Container */}
              <div className="w-full bg-white rounded-[32px] overflow-hidden flex flex-col justify-between h-[480px] relative font-sans text-xs">
                
                {/* Mobile top bar carrier indicators */}
                <div className="bg-slate-50 text-slate-600 px-5 pt-3.5 pb-2.5 flex justify-between items-center text-[9px] font-black border-b border-slate-100 select-none">
                  <div className="flex items-center gap-1 font-mono">
                    <span>9:45</span>
                    <Wifi className="w-2.5 h-2.5 text-slate-500" />
                  </div>
                  <div className="flex items-center gap-1 text-slate-500 uppercase tracking-widest text-[8.5px]">
                    <span>ExpertCRM Net</span>
                    <span className="bg-emerald-500 w-1.5 h-1.5 rounded-full" />
                  </div>
                </div>

                {/* Mobile Active Header */}
                <div className={`p-3 text-white flex items-center justify-between shadow-6 ${
                  mobileChannel === 'WhatsApp' ? 'bg-emerald-600' : 'bg-slate-900'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center font-black">
                      {mobileActiveLeadId === 'sid' ? 'SS' : 'AV'}
                    </div>
                    <div>
                      <span className="block font-black text-xs leading-none">
                        {mobileActiveLeadId === 'sid' ? 'Siddharth Sen' : 'Aman Varma'}
                      </span>
                      <span className="text-[9px] font-medium text-white/80 mt-0.5 block flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        {mobileChannel === 'WhatsApp' ? 'WhatsApp Business' : 'Verified SMS Gateway'}
                      </span>
                    </div>
                  </div>
                  <Smartphone className="w-4 h-4 text-white/50 shrink-0" />
                </div>

                {/* Active Chat bubble frame scrolling */}
                <div className="flex-1 p-3.5 space-y-3 overflow-y-auto bg-[#efe7dd] shadow-inner pb-6 max-h-[310px]">
                  
                  {/* Select conversational array */}
                  {(conversations[mobileActiveLeadId] || conversations['sid']).map((msg, index) => (
                    <div key={index} className={`flex flex-col max-w-[80%] ${
                      msg.type === 'outgoing' ? 'ml-auto items-end' : 'mr-auto items-start'
                    }`}>
                      <div className={`p-2.5 rounded-2xl shadow-xxs text-xs ${
                        msg.type === 'outgoing' 
                          ? 'bg-slate-100 text-slate-800 rounded-tr-none' 
                          : 'bg-white text-slate-800 rounded-tl-none'
                      }`}>
                        <p className="leading-snug font-medium pr-1 whitespace-pre-line">{msg.text}</p>
                        <span className="text-[8.5px] text-slate-400 font-bold block text-right mt-1.5 leading-none">{msg.time}</span>
                      </div>
                    </div>
                  ))}

                </div>

                {/* Chat message input frame */}
                <form onSubmit={handleMobileSubmit} className="p-2 border-t border-slate-100 bg-white flex items-center gap-1.5 select-none" style={{ touchAction: 'none' }}>
                  <input
                    type="text"
                    required
                    maxLength={160}
                    placeholder={`Type response (${mobileChannel})...`}
                    value={mobileMessageInput}
                    onChange={(e) => setMobileMessageInput(e.target.value)}
                    className="flex-1 p-2 bg-slate-50 border border-slate-205 rounded-xl text-xxs focus:bg-white"
                  />
                  <button 
                    type="submit"
                    className={`p-2 rounded-full text-white shrink-0 shadow ${
                      mobileChannel === 'WhatsApp' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-900 hover:bg-slate-850'
                    }`}
                  >
                    <SendHorizontal className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>
            </div>

            {/* Glowing signal rings background decorations */}
            <div className="absolute top-1/2 left-0 -translate-y-1/2 w-32 h-32 bg-indigo-50 rounded-full blur-3xl opacity-30 select-none pointer-events-none" />
            <div className="absolute bottom-5 right-5 w-44 h-44 bg-emerald-100 rounded-full blur-3xl opacity-20 select-none pointer-events-none" />
          </div>

        </div>
      )}


      {/* ===================== TAB: NOTIFICATIONS CENTER ===================== */}
      {activeTab === 'notifications' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Custom Notification alert template builder */}
          <div className="lg:col-span-12 xl:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 pb-2.5 border-b border-slate-100 mb-4">
                <Volume2 className="w-5 h-5 text-amber-500" />
                <div>
                  <h3 className="text-xs font-black text-slate-900 uppercase">Enterprise Notification dispatcher</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Define template alerts that can trigger on real CRM actions. Dynamic variables are supported.</p>
                </div>
              </div>

              {/* Template designer table */}
              <div className="overflow-x-auto rounded-xl border border-slate-150 bg-white">
                <table className="w-full text-left text-xs bg-white">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[8.5px] border-b border-slate-150">
                    <tr>
                      <th className="p-3">Template Reference</th>
                      <th className="p-3">Alert Content Layout</th>
                      <th className="p-3">Trigger Channel</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {notificationTemplates.map(nt => (
                      <tr key={nt.id} className="hover:bg-slate-50/60 transition">
                        <td className="p-3">
                          <span className="text-slate-900 font-extrabold block">{nt.name}</span>
                          <span className="font-mono text-slate-400 text-[9.5px]">{nt.id}</span>
                        </td>
                        <td className="p-3">
                          <p className="text-slate-600 pr-4 italic leading-normal text-[11px]">"{nt.templateText}"</p>
                        </td>
                        <td className="p-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase text-center border ${
                            nt.channel === 'Email' ? 'bg-blue-50 text-blue-700 border-blue-150' :
                            nt.channel === 'SMS' ? 'bg-amber-50 text-amber-700 border-amber-150' : 'bg-emerald-50 text-emerald-700 border-emerald-150'
                          }`}>
                            {nt.channel}
                          </span>
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => handleTestTrigger(nt.id, 'sid')}
                            className="p-1 px-2.5 bg-indigo-50 border border-indigo-150 text-indigo-700 font-black rounded-lg text-[9.5px] hover:bg-indigo-100 transition"
                          >
                            Send Test Alert
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Interactive form to add template */}
              <form onSubmit={handleCreateTemplate} className="border-t border-slate-100 pt-5 mt-5 space-y-4">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Add Custom Alert Template</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Friendly Template Name</label>
                    <input 
                      type="text" required
                      placeholder="e.g. Contract Dispatched Alert"
                      value={newTemplateForm.name}
                      onChange={(e) => setNewTemplateForm(prev=>({...prev, name: e.target.value}))}
                      className="w-full text-xs p-2.5 border border-slate-205 rounded-xl bg-slate-50 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Channel Medium</label>
                    <select
                      className="w-full text-xs p-2.5 border border-slate-205 rounded-xl bg-slate-50 focus:bg-white font-bold"
                      value={newTemplateForm.channel}
                      onChange={(e) => setNewTemplateForm(prev=>({...prev, channel: e.target.value as any}))}
                    >
                      <option value="Email">📧 Email Template</option>
                      <option value="SMS">💬 SMS Message</option>
                      <option value="WhatsApp">🟢 WhatsApp Template</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-black uppercase text-slate-400 tracking-widest mb-1">Active Template Text (Supports coordinates: {"{{name}}"}, {"{{sales_rep}}"}, {"{{ticket_id}}"})</label>
                  <textarea
                    rows={2} required
                    placeholder="Hello {{name}}, welcome to ExpertCRM..."
                    value={newTemplateForm.templateText}
                    onChange={(e) => setNewTemplateForm(prev=>({...prev, templateText: e.target.value}))}
                    className="w-full text-xs p-2.5 border border-slate-20s rounded-xl bg-slate-50 focus:bg-white font-medium shadow-inner"
                  />
                </div>

                <div className="flex justify-between items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10.5px] text-slate-500 font-bold flex items-center gap-1">
                    <CheckCircle className="w-4 h-4 text-emerald-500" /> Auto-validated coordinates syntax
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold rounded-xl text-xxs flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-indigo-400" /> Register Template
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Test log terminal list trigger outputs right */}
          <div className="lg:col-span-12 xl:col-span-5 bg-[#0a0f1d] text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <div className="pb-3 border-b border-slate-800 mb-4 flex justify-between items-center.">
                <div>
                  <span className="text-[9.5px] font-mono font-bold text-slate-500 block uppercase tracking-wider">MOCK ALERT MONITOR TERMINAL</span>
                  <p className="text-xs text-slate-400 mt-1">Simulated webhook payloads fired from user clicks.</p>
                </div>
                <Zap className="w-5 h-5 text-amber-500 animate-pulse shrink-0" />
              </div>

              {/* Console alerts list */}
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {notificationTestOutput.length > 0 ? (
                  notificationTestOutput.map((out, index) => (
                    <div key={index} className="p-3 bg-slate-900 rounded-lg border border-slate-800 font-mono text-[10px] text-slate-300 break-words leading-relaxed flex gap-2">
                      <span className="text-amber-500 font-black shrink-0">▶</span>
                      <span>{out}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-24 text-slate-500 font-mono text-xs italic">
                    [System idle. Trigger "Send Test Alert" on the left to inspect active webhook dispatch payloads]
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-4 mt-5 flex items-center justify-between text-[10px] text-slate-500 font-mono pr-1 select-none">
              <span>ACTIVE WEBSOCKET GATEWAY</span>
              <span className="text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" /> SECURE CONSOLE
              </span>
            </div>
          </div>

        </div>
      )}


      {/* ===================== TAB: WORKFLOW AUTOMATION DYNAMIC BUILDER ===================== */}
      {activeTab === 'automation' && (
        <div className="space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-100 pb-4 mb-5">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase">Interactive System Workflow Architect</h3>
                <p className="text-xs text-slate-400 mt-0.5">Automatically listen to database events and dispatch corresponding notification chains without human intervention.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase text-slate-400">Select active blueprint:</span>
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-150">
                  {workflows.map(wf => (
                    <button
                      key={wf.id}
                      onClick={() => setActiveWorkflowId(wf.id)}
                      className={`px-3 py-1 text-xs font-black uppercase rounded-lg transition-all ${
                        activeWorkflowId === wf.id ? 'bg-white text-slate-900 shadow-xxs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      {wf.id}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Workflow active panel details */}
            {selectedWorkflow && (
              <div className="space-y-6">
                
                {/* Workflow configuration block details bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4 className="font-extrabold text-slate-900 text-sm">{selectedWorkflow.name}</h4>
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase border ${
                        selectedWorkflow.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-150' : 'bg-slate-100 text-slate-400 border-slate-205'
                      }`}>
                        {selectedWorkflow.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-semibold uppercase">Trigger Parameter: WHEN Lead qualifies onto proposals list</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="text-right">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-black">Completed runs</span>
                      <span className="text-slate-700 font-black">{selectedWorkflow.runs} executions</span>
                    </div>
                    <div className="text-right border-l border-slate-200 pl-4">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-black">CTR Open Rate</span>
                      <span className="text-indigo-600 font-black">{selectedWorkflow.conversion}% CTR</span>
                    </div>
                    <div className="border-l border-slate-200 pl-4 flex gap-1.5">
                      <button
                        onClick={() => handleToggleWorkflowStatus(selectedWorkflow.id)}
                        className={`p-1 px-3.5 rounded-lg border text-xxs font-extrabold transition-all ${
                          selectedWorkflow.status === 'Active' ? 'bg-rose-50 border-rose-100 text-rose-600 hover:bg-rose-100' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'
                        }`}
                      >
                        {selectedWorkflow.status === 'Active' ? 'Pause Automation' : 'Resume Sequence'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Workflow structural visual nodes timeline */}
                <div className="relative pt-3 pb-8 pl-5 space-y-6 border-l-2 border-dashed border-indigo-200/50 ml-5 text-xs text-slate-700">
                  
                  {/* Absolute Trigger start banner */}
                  <div className="absolute -left-[14px] top-0 bg-indigo-600 outline outline-4 outline-white text-white p-2.5 rounded-xl flex items-center justify-center font-bold shadow-md">
                    <Zap className="w-4.5 h-4.5 text-amber-300" />
                  </div>
                  
                  <div className="pl-6 pt-1.5">
                    <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-widest block">Entry Event Handler (Trig)</span>
                    <h5 className="font-extrabold text-slate-900 mt-0.5">Database Sync State Detected: "Lead Phase Won"</h5>
                  </div>

                  {/* Mapping steps loops */}
                  {selectedWorkflow.steps.map((st, index) => (
                    <div key={st.id} className="relative pl-6 space-y-1 group">
                      
                      {/* Visual indicator connect */}
                      <div className="absolute -left-[30px] top-1.5 bg-white border-2 border-indigo-400 text-indigo-600 w-6.5 h-6.5 rounded-full flex items-center justify-center font-bold text-xxs shadow-sm">
                        {index + 1}
                      </div>

                      <div className="bg-white hover:bg-slate-50/50 p-3.5 rounded-2xl border border-slate-150 shadow-xxs transition flex items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full shrink-0 ${
                            st.type === 'delay' ? 'bg-amber-50 text-amber-600' :
                            st.type === 'email' ? 'bg-blue-50 text-blue-600' :
                            st.type === 'whatsapp' ? 'bg-emerald-50 text-emerald-600' :
                            st.type === 'sms' ? 'bg-[#efe7dd] text-slate-600' : 'bg-rose-50 text-rose-600'
                          }`}>
                            {st.type === 'delay' ? <Clock className="w-4 h-4 animate-spin-slow" /> :
                             st.type === 'email' ? <Mail className="w-4 h-4" /> :
                             st.type === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> :
                             st.type === 'sms' ? <Smartphone className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                          </div>

                          <div className="space-y-0.5">
                            <span className="font-black text-slate-800 block text-xs">{st.title}</span>
                            <span className="text-[11px] text-slate-400 font-bold block">{st.summary}</span>
                          </div>
                        </div>

                        {/* Remove or edit action */}
                        <button
                          onClick={() => handleRemoveWorkflowStep(selectedWorkflow.id, st.id)}
                          className="p-1 text-slate-350 hover:text-rose-500 transition tooltip"
                          title="Delete automation step block"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  ))}

                  {/* Connect step connector block */}
                  <div className="pt-3 pl-6 flex items-center gap-1.5 select-none text-xxs font-bold">
                    <button
                      onClick={() => handleAddWorkflowStep(selectedWorkflow.id)}
                      className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl flex items-center gap-1 shadow-sm transition"
                    >
                      <Plus className="w-3.5 h-3.5 text-indigo-400" /> Insert Automation Step
                    </button>
                    <span className="text-slate-400 font-medium">Auto-align active sequences on change</span>
                  </div>

                </div>

              </div>
            )}
          </div>
        </div>
      )}


      {/* ===================== TAB: CLOUD SERVICES & REALTIME HEARTBEAT ===================== */}
      {activeTab === 'cloud' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch font-mono">
          
          {/* Cloud latency inspectors and speed gauges left */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[10px] font-black uppercase text-slate-405 tracking-wider font-sans block">Distributed Cloud Access Nodes</span>
              <p className="text-xs text-slate-500 leading-normal font-sans font-medium">ExpertCRM runs containerized micro-servers across multi-regional cloud networks for instant client data synchronization.</p>

              <div className="space-y-3.5">
                {cloudLatencyLogs.map((node, index) => (
                  <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between text-xs font-semibold text-slate-700">
                    <div className="flex items-center gap-2 font-sans text-xs">
                      <Globe className="w-4 h-4 text-slate-500 shrink-0" />
                      <div>
                        <span className="block font-black text-slate-800">{node.region}</span>
                        <span className="text-[9px] text-slate-400 uppercase tracking-wider font-black">ACTIVE RELAY</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-emerald-600 font-extrabold">{node.speed} ms</span>
                      <span className="block text-[8.5px] text-slate-400 uppercase font-black tracking-widest mt-0.5">optimal</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Realtime database status indicators */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-205 space-y-2.5">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-sans">Active Server Heartbeats</span>
              <div className="flex justify-between text-xs">
                <span className="font-sans font-medium text-slate-500">WebSocket listeners count:</span>
                <span className="font-extrabold text-indigo-600 font-bold">{activeSocketHeartbeats} terminals</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="font-sans font-medium text-slate-500">Cluster Hydration SLA:</span>
                <span className="font-extrabold text-slate-700 font-bold">{realtimeUptime} perfection</span>
              </div>
            </div>
          </div>

          {/* Webhook live simulation engine & Terminal logs right */}
          <div className="lg:col-span-7 bg-[#0a0f1d] text-slate-100 p-5 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <div className="pb-3 border-b border-slate-800 flex justify-between items-center bg-[#0a0f1d]">
                <div>
                  <span className="text-[9.5px] font-mono font-bold text-slate-450 block uppercase tracking-wider">REAL-TIME TRANSACTION MONITOR</span>
                  <p className="text-xs text-slate-400 font-sans mt-0.5">Console telemetry logs mapping multi-channel dispatches.</p>
                </div>
                <button
                  disabled={isDemoTriggering}
                  onClick={triggerSimulatedMessageFlow}
                  className="px-3.5 py-1.5 bg-slate-900 border border-slate-750 text-xxs font-extrabold font-sans text-amber-400 hover:bg-slate-800 rounded-lg shadow flex items-center gap-1 transition"
                >
                  {isDemoTriggering ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CloudLightning className="w-3.5 h-3.5 text-amber-500 animate-pulse" />} Simulated incoming message
                </button>
              </div>

              {/* Logs block terminal styled container */}
              <div className="bg-black/40 border border-slate-850 p-4.5 rounded-xl font-mono text-[10px] text-teal-400 leading-relaxed space-y-3 max-h-[290px] overflow-y-auto pr-1">
                {serverConsoleLogs.map((log, index) => (
                  <div key={index} className="flex gap-2 items-start leading-relaxed bg-[#0a0f1d]">
                    <span className="text-slate-500 font-black shrink-0">CRM_NODE_01$</span>
                    <span>{log}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-800 pt-3.5 mt-5 flex justify-between items-center text-[10px] text-slate-500 block">
              <span className="font-sans uppercase text-[9px] font-black tracking-wide">SECURE CLOUD RUN INSTANCE: ACTIVE</span>
              <span className="font-sans text-xs bg-slate-900 text-amber-400 px-2 py-0.5 rounded border border-slate-800 font-black">PORT 3000</span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
