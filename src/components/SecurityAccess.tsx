import React, { useState, useEffect } from 'react';
import { 
  Lock, Shield, ShieldCheck, ShieldAlert, CheckCircle2, 
  Settings, Users, Key, Terminal, RefreshCw, EyeOff,
  UserPlus, Edit, Trash2, ArrowUpRight, Check, AlertTriangle, 
  FileText, Download, Upload, Copy, Eye, Globe, Fingerprint, 
  Calendar, Clock, Search, Save, X, HardDrive, FileJson, Info, Plus, Sparkles
} from 'lucide-react';
import { AccessControl, AccessRole } from '../types';

interface SecurityAccessProps {
  accessControl: AccessControl;
  onUpdateRole: (role: AccessRole) => void;
  onTogglePermission: (permission: keyof AccessControl['permissions']) => void;
}

type SecurityTab = 'matrix' | 'users' | 'roles' | 'controls' | 'audit' | 'backup';

interface SecurityUser {
  id: string;
  name: string;
  role: AccessRole;
  email: string;
  active: boolean;
  device: string;
  mfaEnrolled: boolean;
  lastLogin: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  ipAddress: string;
  severity: 'info' | 'warning' | 'security' | 'critical';
}

const INITIAL_USERS: SecurityUser[] = [
  { id: 'USR-101', name: 'Aman Varma', role: 'Sales Manager', email: 'aman@expertcrm.com', active: true, device: 'Mobile-Apply', mfaEnrolled: true, lastLogin: '2026-06-17 09:12' },
  { id: 'USR-102', name: 'Siddharth Sen', role: 'Sales Manager', email: 'sid@expertcrm.com', active: true, device: 'Web Portal', mfaEnrolled: true, lastLogin: '2026-06-17 08:45' },
  { id: 'USR-103', name: 'Deepa Rao', role: 'Support Agent', email: 'deepa@expertcrm.com', active: true, device: 'Web Portal', mfaEnrolled: false, lastLogin: '2026-06-17 09:30' },
  { id: 'USR-104', name: 'Ketan Patel', role: 'HR Specialist', email: 'ketan@expertcrm.com', active: false, device: 'Offline', mfaEnrolled: false, lastLogin: '2026-06-15 14:22' }
];

const DEFAULT_AUDIT_LOGS: AuditLog[] = [
  { id: 'LOG-881', timestamp: '2026-06-17 09:30:15', action: 'Support ticket T-501 status updated', user: 'deepa@expertcrm.com', ipAddress: '192.168.1.45', severity: 'info' },
  { id: 'LOG-880', timestamp: '2026-06-17 09:15:22', action: 'MFA authorization granted successfully', user: 'aman@expertcrm.com', ipAddress: '10.0.0.12', severity: 'security' },
  { id: 'LOG-879', timestamp: '2026-06-17 08:50:00', action: 'Employee salary disbursed bulk action', user: 'Super Admin (M. Mehta)', ipAddress: '127.0.0.1', severity: 'critical' },
  { id: 'LOG-878', timestamp: '2026-06-17 08:31:10', action: 'Impersonated access role level switched to Sales Manager', user: 'Super Admin (M. Mehta)', ipAddress: '127.0.0.1', severity: 'warning' },
  { id: 'LOG-877', timestamp: '2026-06-16 17:40:05', action: 'IP dynamic exception rule registered', user: 'System Agent', ipAddress: '192.168.1.1', severity: 'info' }
];

const DEFAULT_ROLE_PERMISSIONS: Record<AccessRole, Record<keyof AccessControl['permissions'], boolean>> = {
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

export default function SecurityAccess({
  accessControl,
  onUpdateRole,
  onTogglePermission
}: SecurityAccessProps) {
  const [activeTab, setActiveTab] = useState<SecurityTab>('users');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // States with persistent configurations in localStorage
  const [users, setUsers] = useState<SecurityUser[]>(() => {
    const saved = localStorage.getItem('crm_security_users');
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('crm_security_audit_logs');
    return saved ? JSON.parse(saved) : DEFAULT_AUDIT_LOGS;
  });

  const [roleMappings, setRoleMappings] = useState<Record<AccessRole, Record<string, boolean>>>(() => {
    const saved = localStorage.getItem('crm_security_role_maps');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const merged = { ...DEFAULT_ROLE_PERMISSIONS };
        Object.keys(parsed).forEach((role) => {
          if (merged[role as AccessRole]) {
            merged[role as AccessRole] = {
              ...merged[role as AccessRole],
              ...parsed[role]
            };
          }
        });
        return merged;
      } catch (e) {
        return DEFAULT_ROLE_PERMISSIONS;
      }
    }
    return DEFAULT_ROLE_PERMISSIONS;
  });

  const [ipWhitelist, setIpWhitelist] = useState<string[]>(() => {
    const saved = localStorage.getItem('crm_security_ip_whitelist');
    return saved ? JSON.parse(saved) : ['192.168.1.1', '10.0.0.12', '127.0.0.1'];
  });

  const [globalMfaEnforced, setGlobalMfaEnforced] = useState<boolean>(() => {
    return localStorage.getItem('crm_security_global_mfa') === 'true';
  });

  const [dataMaskingEnforced, setDataMaskingEnforced] = useState<boolean>(() => {
    return localStorage.getItem('crm_security_data_masking') === 'true';
  });

  // Dynamic roles state & generator configuration
  const [rolesList, setRolesList] = useState<string[]>(() => {
    const saved = localStorage.getItem('crm_security_roles_list');
    return saved ? JSON.parse(saved) : ['Super Admin', 'Admin', 'Sales Manager', 'Support Agent', 'HR Specialist', 'Guest'];
  });

  const [generatorRoleName, setGeneratorRoleName] = useState('');
  const [generatorPrompt, setGeneratorPrompt] = useState('');
  const [generatorLoading, setGeneratorLoading] = useState(false);
  const [generatorJustification, setGeneratorJustification] = useState('');
  const [generatorError, setGeneratorError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('crm_security_roles_list', JSON.stringify(rolesList));
  }, [rolesList]);

  const applyPresetTemplate = (preset: string) => {
    switch (preset) {
      case 'Admin':
        setGeneratorRoleName('System Admin');
        setGeneratorPrompt('Full administrator privileges with active access to security logs, payroll data, and systems configuration.');
        break;
      case 'Sales':
        setGeneratorRoleName('Sales Lead');
        setGeneratorPrompt('Focuses purely on managing pipeline leads, logging client calls, and sending newsletters, with zero access to security or payroll settings.');
        break;
      case 'Support':
        setGeneratorRoleName('Customer Associate');
        setGeneratorPrompt('Accesses customer support tickets, completes standard tasks, and logs outbound calls. Cannot access HR metrics.');
        break;
      case 'HR':
        setGeneratorRoleName('Payroll Auditor');
        setGeneratorPrompt('Accesses HR dashboards, manages field coordinators, and verifies worker payroll slips. Restricted from editing security mappings.');
        break;
      case 'Observer':
        setGeneratorRoleName('Observer Auditor');
        setGeneratorPrompt('Read-only dashboard auditor scope. Restricted write capabilities on all modules including leads, support, and systems.');
        break;
      default:
        break;
    }
  };

  const handleGenerateRole = async () => {
    if (!generatorRoleName.trim()) {
      setGeneratorError('Please provide a descriptive Role name first.');
      return;
    }
    setGeneratorLoading(true);
    setGeneratorError(null);
    setGeneratorJustification('');

    try {
      const response = await fetch('/api/generate-role', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: generatorPrompt,
          customName: generatorRoleName
        })
      });

      if (!response.ok) {
        throw new Error('API server returned an error state.');
      }

      const data = await response.json();
      
      const finalRoleName = data.roleName || generatorRoleName.trim();
      if (!rolesList.includes(finalRoleName)) {
        setRolesList(prev => [...prev, finalRoleName]);
      }

      setRoleMappings(prev => ({
        ...prev,
        [finalRoleName]: data.permissions
      }));

      // Log security audit log entry
      const logId = 'LOG-' + Math.floor(Math.random() * 900 + 100);
      const newLog: AuditLog = {
        id: logId,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        action: `New Access Role generated via AI: ${finalRoleName}`,
        user: `Super Admin (M. Mehta)`,
        ipAddress: '127.0.0.1',
        severity: 'info'
      };
      setAuditLogs(prev => [newLog, ...prev]);

      setGeneratorJustification(data.justification || 'Role generated successfully!');
      
      setToastMessage(`Role "${finalRoleName}" generated & mapped successfully!`);
      setTimeout(() => setToastMessage(null), 4000);

    } catch (err: any) {
      console.error(err);
      setGeneratorError('Failed to call API generator. Please try again.');
    } finally {
      setGeneratorLoading(false);
    }
  };

  const handleDeleteCustomRole = (roleToDelete: string) => {
    if (['Super Admin', 'Admin', 'Sales Manager', 'Support Agent', 'HR Specialist', 'Guest'].includes(roleToDelete)) {
      return; // Absolute protection for default presets
    }
    setRolesList(prev => prev.filter(r => r !== roleToDelete));
    
    // clean up permissions mapping
    const newMappings = { ...roleMappings };
    delete newMappings[roleToDelete];
    setRoleMappings(newMappings);

    // Log security audit log entry
    const logId = 'LOG-' + Math.floor(Math.random() * 900 + 100);
    const newLog: AuditLog = {
      id: logId,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: `Custom Access Role decommissioned: ${roleToDelete}`,
      user: `Super Admin (M. Mehta)`,
      ipAddress: '127.0.0.1',
      severity: 'warning'
    };
    setAuditLogs(prev => [newLog, ...prev]);

    setToastMessage(`Role "${roleToDelete}" decommissioned successfully.`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Selected User for Detail View/Edit Profile
  const [selectedUserId, setSelectedUserId] = useState<string>(() => {
    const initialUsers = localStorage.getItem('crm_security_users');
    const uArr = initialUsers ? JSON.parse(initialUsers) : INITIAL_USERS;
    return uArr[0]?.id || 'USR-101';
  });

  const selectedUser = users.find(u => u.id === selectedUserId) || users[0];

  // Modals & Dialogue triggers
  const [isNewUserOpen, setIsNewUserOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isRestoreConfirmOpen, setIsRestoreConfirmOpen] = useState(false);

  // Form controls
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    email: '',
    role: 'Guest' as AccessRole,
    active: true,
    device: 'Web Portal',
    mfaEnrolled: false
  });

  const [editProfileForm, setEditProfileForm] = useState({
    name: '',
    email: '',
    role: 'Guest' as AccessRole,
    active: true,
    device: 'Web Portal',
    mfaEnrolled: false
  });

  const [newIp, setNewIp] = useState('');
  const [auditSearch, setAuditSearch] = useState('');
  const [auditFilter, setAuditFilter] = useState<'all' | 'info' | 'warning' | 'security' | 'critical'>('all');

  // Backup & Restore states
  const [rawBackupText, setRawBackupText] = useState('');
  const [restoreSummary, setRestoreSummary] = useState<any | null>(null);
  const [restoreError, setRestoreError] = useState<string | null>(null);

  // Persistence hooks
  useEffect(() => {
    localStorage.setItem('crm_security_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    localStorage.setItem('crm_security_audit_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem('crm_security_role_maps', JSON.stringify(roleMappings));
  }, [roleMappings]);

  useEffect(() => {
    localStorage.setItem('crm_security_ip_whitelist', JSON.stringify(ipWhitelist));
  }, [ipWhitelist]);

  // Sync edits when selected user changes
  useEffect(() => {
    if (selectedUser) {
      setEditProfileForm({
        name: selectedUser.name,
        email: selectedUser.email,
        role: selectedUser.role,
        active: selectedUser.active,
        device: selectedUser.device,
        mfaEnrolled: selectedUser.mfaEnrolled
      });
    }
  }, [selectedUser, isEditProfileOpen]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const addAuditLog = (action: string, severity: AuditLog['severity'] = 'info') => {
    const today = new Date();
    const ts = today.toISOString().replace('T', ' ').substring(0, 19);
    const newLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: ts,
      action,
      user: 'Super Admin (' + (accessControl.role) + ')',
      ipAddress: ipWhitelist[0] || '127.0.0.1',
      severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // -----------------------------------------------------------------
  // USER CREATION ACCESS
  // -----------------------------------------------------------------
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserForm.name || !newUserForm.email) {
      triggerToast("Please provide valid Name and Email dimensions.");
      return;
    }

    // Email validation check
    if (!newUserForm.email.includes('@')) {
      triggerToast("Invalid email coordinate format.");
      return;
    }

    const newUserObj: SecurityUser = {
      id: `USR-${Date.now().toString().slice(-3)}`,
      name: newUserForm.name,
      role: newUserForm.role,
      email: newUserForm.email,
      active: newUserForm.active,
      device: newUserForm.device,
      mfaEnrolled: newUserForm.mfaEnrolled,
      lastLogin: 'Never logged in'
    };

    const updated = [...users, newUserObj];
    setUsers(updated);
    addAuditLog(`Registered new system credentials for user "${newUserObj.name}" with role "${newUserObj.role}"`, 'security');
    
    // Clear form
    setNewUserForm({
      name: '',
      email: '',
      role: 'Guest',
      active: true,
      device: 'Web Portal',
      mfaEnrolled: false
    });
    setIsNewUserOpen(false);
    triggerToast(`User "${newUserObj.name}" created successfully!`);
    setSelectedUserId(newUserObj.id);
  };

  // -----------------------------------------------------------------
  // USER PROFILE EDIT
  // -----------------------------------------------------------------
  const handleEditProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const prevRole = selectedUser.role;
    const updated = users.map(u => {
      if (u.id === selectedUser.id) {
        return {
          ...u,
          name: editProfileForm.name,
          email: editProfileForm.email,
          role: editProfileForm.role,
          active: editProfileForm.active,
          device: editProfileForm.device,
          mfaEnrolled: editProfileForm.mfaEnrolled
        };
      }
      return u;
    });

    setUsers(updated);
    
    let auditAction = `Updated user profile details for "${editProfileForm.name}" (${editProfileForm.email})`;
    if (prevRole !== editProfileForm.role) {
      auditAction += `. Role changed from "${prevRole}" to "${editProfileForm.role}"`;
    }
    addAuditLog(auditAction, prevRole !== editProfileForm.role ? 'security' : 'info');

    setIsEditProfileOpen(false);
    triggerToast(`User "${editProfileForm.name}" updated successfully!`);
  };

  const handleRevokeUser = (id: string, name: string) => {
    if (confirm(`CRITICAL: Are you sure you want to revoke login access and delete credentials for "${name}"?`)) {
      const updated = users.filter(u => u.id !== id);
      setUsers(updated);
      addAuditLog(`Revoked login credentials and access tokens for user: "${name}"`, 'critical');
      triggerToast(`Account status for "${name}" terminated.`);
      if (selectedUserId === id) {
        setSelectedUserId(updated[0]?.id || '');
      }
    }
  };

  // -----------------------------------------------------------------
  // ROLES & CUSTOM PERMISSIONS
  // -----------------------------------------------------------------
  const handleRolePermissionToggle = (role: AccessRole, permissionKey: string) => {
    const updated = {
      ...roleMappings,
      [role]: {
        ...roleMappings[role],
        [permissionKey]: !roleMappings[role][permissionKey as keyof AccessControl['permissions']]
      }
    };
    setRoleMappings(updated);
    addAuditLog(`Modified permission map for role group "${role}": Toggled "${permissionKey}"`, 'warning');
    triggerToast(`Updated Role permission template: ${role} -> ${permissionKey}`);

    // If active impersonated role matches this, align with active state mapping
    if (accessControl.role === role) {
      onTogglePermission(permissionKey as any);
    }
  };

  // -----------------------------------------------------------------
  // SYSTEM IMPERSONATION
  // -----------------------------------------------------------------
  const handleSystemImpersonation = (role: AccessRole) => {
    // Dynamically retrieve configured permission template for selected role
    onUpdateRole(role);
    addAuditLog(`Privilege level switched. Currently impersonating: "${role}"`, 'warning');
    triggerToast(`Switched workspace credentials to ${role}`);
  };

  // -----------------------------------------------------------------
  // DATA SECURITY
  // -----------------------------------------------------------------
  const handleRegisterIp = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanIp = newIp.trim();
    if (!cleanIp) return;
    
    // Simple format check
    if (!cleanIp.match(/^([0-9]{1,3}\.){3}[0-9]{1,3}(\/[0-9]{1,2})?$/)) {
      triggerToast("Invalid format. Use standard IPv4 address conventions.");
      return;
    }

    if (ipWhitelist.includes(cleanIp)) {
      triggerToast("This gateway is already listed.");
      return;
    }

    const updated = [...ipWhitelist, cleanIp];
    setIpWhitelist(updated);
    addAuditLog(`Authorized new IP Whitelist node permission: "${cleanIp}"`, 'security');
    setNewIp('');
    triggerToast(`IP threshold restriction for ${cleanIp} applied.`);
  };

  const handleDeauthorizeIp = (ip: string) => {
    if (ipWhitelist.length <= 1) {
      triggerToast("Cannot delete last authorized network, system requires at least one address.");
      return;
    }
    const updated = ipWhitelist.filter(item => item !== ip);
    setIpWhitelist(updated);
    addAuditLog(`Deauthorized IP Access subnet exception: "${ip}"`, 'security');
    triggerToast(`IP gateway constraint "${ip}" removed.`);
  };

  const handleToggleGlobalMfa = () => {
    const nextVal = !globalMfaEnforced;
    setGlobalMfaEnforced(nextVal);
    localStorage.setItem('crm_security_global_mfa', String(nextVal));
    addAuditLog(`Global Corporate Multi-Factor Authentication requirement set to: ${nextVal ? 'STRICT' : 'OPTIONAL'}`, 'critical');
    triggerToast(`MFA Requirement status updated to ${nextVal ? 'Enforced' : 'Optional'}`);
  };

  const handleToggleDataMasking = () => {
    const nextVal = !dataMaskingEnforced;
    setDataMaskingEnforced(nextVal);
    localStorage.setItem('crm_security_data_masking', String(nextVal));
    addAuditLog(`Sensitive database field masking policy set to: ${nextVal ? 'ENABLED' : 'DISABLED'}`, 'security');
    triggerToast(`Database user masking set to: ${nextVal ? 'Active' : 'Bypassed'}`);
  };

  // Helper function to simulate masking
  const maskSensitiveText = (text: string) => {
    if (!dataMaskingEnforced) return text;
    if (!text) return '';
    if (text.includes('@')) {
      const [user, domain] = text.split('@');
      const hiddenUser = user.length > 2 ? user.slice(0, 2) + '*'.repeat(user.length - 2) : user[0] + '*';
      return `${hiddenUser}@${domain}`;
    }
    return text.slice(0, 3) + '*'.repeat(Math.max(4, text.length - 3));
  };

  // -----------------------------------------------------------------
  // DISASTER RECOVERY (BACKUP & RESTORE)
  // -----------------------------------------------------------------
  const handleExportSystemBackup = () => {
    const storageKeys = [
      'crm_leads', 'crm_call_logs', 'crm_support_tickets', 'crm_field_staff',
      'crm_tasks', 'crm_employees', 'crm_comms_logs', 'crm_access_control',
      'crm_hr_leaves', 'crm_hr_expenses', 'crm_hr_history', 'crm_security_users',
      'crm_security_audit_logs', 'crm_security_role_maps', 'crm_security_ip_whitelist'
    ];

    const backupPayload: Record<string, any> = {};
    storageKeys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val) {
        try {
          backupPayload[k] = JSON.parse(val);
        } catch (e) {
          backupPayload[k] = val;
        }
      }
    });

    const fileContent = JSON.stringify({
      metadata: {
        creator: 'ExpertCRM Administrative Security Vault',
        timestamp: new Date().toISOString(),
        securityStandard: 'AES-256 HMAC Simulation Sync',
        recordsCount: Object.keys(backupPayload).length
      },
      data: backupPayload
    }, null, 2);

    const blob = new Blob([fileContent], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ExpertCRM_Vault_RestorePoint_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    addAuditLog(`Created and exported certified cryptographic system backup`, 'critical');
    triggerToast("System JSON Backup download initiated!");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawBackupText(text);
      processBackupString(text);
    };
    reader.readAsText(file);
  };

  const processBackupString = (str: string) => {
    try {
      const parsed = JSON.parse(str);
      if (!parsed || typeof parsed !== 'object' || !parsed.data) {
        setRestoreError("Defective schema structure. Backup payload must contain a master 'data' object.");
        setRestoreSummary(null);
        return;
      }
      
      const summaryCounts: Record<string, number> = {};
      Object.keys(parsed.data).forEach(k => {
        const value = parsed.data[k];
        if (Array.isArray(value)) {
          summaryCounts[k] = value.length;
        } else if (value && typeof value === 'object') {
          summaryCounts[k] = Object.keys(value).length;
        } else {
          summaryCounts[k] = 1;
        }
      });

      setRestoreSummary({
        metadata: parsed.metadata || {},
        counts: summaryCounts,
        raw: parsed.data
      });
      setRestoreError(null);
    } catch (e: any) {
      setRestoreError(`Parsing Exception: ${e.message || "Invalid JSON syntax."}`);
      setRestoreSummary(null);
    }
  };

  const executeSystemStateRestore = () => {
    if (!restoreSummary || !restoreSummary.raw) return;

    const raw = restoreSummary.raw;
    // Overwrite local storage keys
    Object.keys(raw).forEach(key => {
      const targetData = raw[key];
      if (typeof targetData === 'object') {
        localStorage.setItem(key, JSON.stringify(targetData));
      } else {
        localStorage.setItem(key, String(targetData));
      }
    });

    // Write restore audit logs
    const previousLogs = Array.isArray(raw.crm_security_audit_logs) ? raw.crm_security_audit_logs : [];
    const restorationActionLog: AuditLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      action: 'Administrative system-wide recovery block executed from JSON restore point',
      user: 'Super Admin Recovery Portal',
      ipAddress: '127.0.0.1',
      severity: 'critical'
    };
    localStorage.setItem('crm_security_audit_logs', JSON.stringify([restorationActionLog, ...previousLogs]));

    triggerToast("System state hydrated. Reloading active views...");
    setIsRestoreConfirmOpen(false);

    setTimeout(() => {
      alert("Database Restored successfully! The application will refresh elements to apply state parameters.");
      window.location.reload();
    }, 1200);
  };

  const triggerFactoryHardReset = () => {
    if (confirm("DANGER: This action will restore original setup conditions across all leads, employees, communication pipelines, and credentials. All local modifications will be cleared. Proceed?")) {
      localStorage.clear();
      triggerToast("Purged all local parameters. Reloading default factory state...");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  // Filter logs based on search criteria
  const filteredLogs = auditLogs.filter(log => {
    const text = log.action.toLowerCase() || "";
    const nameText = log.user.toLowerCase() || "";
    const ipText = log.ipAddress.toLowerCase() || "";
    const matchSearch = text.includes(auditSearch.toLowerCase()) || 
                        nameText.includes(auditSearch.toLowerCase()) || 
                        ipText.includes(auditSearch.toLowerCase());
    
    const matchSeverity = auditFilter === 'all' || log.severity === auditFilter;
    return matchSearch && matchSeverity;
  });

  return (
    <div id="security-officer-matrix" className="space-y-6 font-sans">
      
      {/* Toast Alert overlay */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 border border-slate-700 text-white rounded-xl px-4 py-3 shadow-2xl flex items-center gap-2.5 z-50 animate-bounce">
          <ShieldCheck className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-bold">{toastMessage}</span>
        </div>
      )}

      {/* Main Administrative Header Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-900 text-amber-400 rounded-xl">
            <Lock className="w-6 h-6 shrink-0" />
          </div>
          <div>
            <h1 className="text-md font-black text-slate-900 tracking-tight">Security & Governance Console</h1>
            <p className="text-xs text-slate-400">Manage user creation permissions, edit system identity profiles, inspect cryptographic audits, and deploy system disaster recovery protocols.</p>
          </div>
        </div>

        {/* Global Security Status Indicator */}
        <div className="bg-slate-55 flex flex-wrap items-center gap-1.5 p-1 rounded-xl self-start lg:self-auto border border-slate-150">
          <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-black text-slate-700 bg-white rounded-lg shadow-xxs">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="uppercase text-[9.5px]">MFA:</span>
            <span className={globalMfaEnforced ? "text-emerald-600 font-extrabold" : "text-amber-500 text-slate-400"}>{globalMfaEnforced ? "STRICT" : "DEMAND"}</span>
          </div>
          <div className="px-3 py-1.5 flex items-center gap-1.5 text-xs font-black text-slate-700 bg-white rounded-lg shadow-xxs">
            <EyeOff className="w-4 h-4 text-rose-500" />
            <span className="uppercase text-[9.5px]">Masking:</span>
            <span className={dataMaskingEnforced ? "text-emerald-600 font-extrabold" : "text-slate-400"}>{dataMaskingEnforced ? "ACTIVE" : "BYPASSED"}</span>
          </div>
        </div>
      </div>

      {/* Primary Navigation Controls */}
      <div className="flex flex-wrap items-center gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/50">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'users' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" /> User Registry ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('roles')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'roles' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Key className="w-4 h-4" /> Roles & Permissions
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'matrix' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Settings className="w-4 h-4" /> privilege Matrix
        </button>
        <button
          onClick={() => setActiveTab('controls')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'controls' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Fingerprint className="w-4 h-4" /> Data Security Controls
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'audit' ? 'bg-white text-slate-950 shadow-sm font-extrabold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" /> Operations Audit Logs ({auditLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 ${
            activeTab === 'backup' ? 'bg-rose-950 text-amber-400 font-extrabold shadow-sm' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <HardDrive className="w-4 h-4 text-amber-500" /> Disaster Recovery
        </button>
      </div>

      {/* Role Impersonation Fast-Switcher Banner */}
      <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div className="space-y-0.5">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Operational Space Impersonator Scope</span>
          <p className="text-xs text-slate-600 font-medium">Toggle active credentials to check client UI restrictions across tabs.</p>
        </div>
        <div className="flex flex-wrap gap-1 bg-white p-1 rounded-xl shadow-xxs border border-slate-150 max-w-full overflow-x-auto">
          {rolesList.map(role => (
            <button
              key={role}
              onClick={() => handleSystemImpersonation(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                accessControl.role === role 
                  ? 'bg-slate-900 text-amber-400 font-black shadow-xs' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* ===================== TAB: USER REGISTRY ===================== */}
      {activeTab === 'users' && (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
          
          {/* User management list container */}
          <div className="xl:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
                <div className="space-y-0.5">
                  <h3 className="text-sm font-black text-slate-900 uppercase">Enterprise Login Credentials registry</h3>
                  <p className="text-[11px] text-slate-400 font-medium">Authorized staff permitted terminal system access and localized telemetry metrics.</p>
                </div>
                <button
                  onClick={() => setIsNewUserOpen(true)}
                  className="px-3.5 py-1.5 bg-slate-900 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-sm hover:bg-slate-800 transition"
                >
                  <UserPlus className="w-4 h-4 text-amber-400" /> Create System User
                </button>
              </div>

              {/* Users list table */}
              <div className="overflow-x-auto rounded-xl border border-slate-150 bg-white mt-4">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[8.5px] border-b border-slate-150">
                    <tr>
                      <th className="p-3">Reference ID</th>
                      <th className="p-3">Staff Identity</th>
                      <th className="p-3">Credential Role</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Status</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {users.map(u => (
                      <tr
                        key={u.id}
                        onClick={() => setSelectedUserId(u.id)}
                        className={`hover:bg-slate-50/60 cursor-pointer transition ${
                          selectedUserId === u.id ? 'bg-amber-50/20' : ''
                        }`}
                      >
                        <td className="p-3 font-mono font-bold text-slate-400 text-[10px]">{u.id}</td>
                        <td className="p-3">
                          <span className="text-slate-900 font-extrabold block">{maskSensitiveText(u.name)}</span>
                          <span className="text-[10px] text-slate-400">Terminal: {u.device}</span>
                        </td>
                        <td className="p-3">
                          <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[9px] font-black border border-slate-200 uppercase">
                            {u.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-500">{maskSensitiveText(u.email)}</td>
                        <td className="p-3">
                          <span className={`inline-block w-2.5 h-2.5 rounded-full ${
                            u.active ? 'bg-emerald-500 shadow-xxs animate-pulse' : 'bg-slate-350'
                          }`} title={u.active ? 'Session Permitted' : 'Access Restricted'} />
                          <span className="text-[10px] text-slate-500 ml-1.5 font-bold">{u.active ? 'Permitted' : 'Inactive'}</span>
                        </td>
                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex justify-end gap-1.5">
                            <button
                              onClick={() => { setSelectedUserId(u.id); setIsEditProfileOpen(true); }}
                              className="p-1 px-1.5 bg-slate-50 text-slate-600 rounded-lg border border-slate-205 hover:bg-slate-100 font-bold text-[10px] flex items-center gap-1"
                              title="Edit user credentials profile details"
                            >
                              <Edit className="w-3.5 h-3.5" /> Edit
                            </button>
                            <button
                              onClick={() => handleRevokeUser(u.id, u.name)}
                              className="p-1 px-1.5 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 hover:bg-rose-100 font-bold text-[10px] flex items-center gap-1"
                              title="Revoke and delete login access client tokens"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Revoke
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-[10px] text-slate-400 mt-4 italic font-medium">
              * Select any registered user row to inspect their deep security details, system logs, verified MFA keys, and active sessions on the sidebar.
            </p>
          </div>

          {/* User Profile deep details viewer */}
          <div className="xl:col-span-4 bg-white p-5 rounded-2xl border border-slate-150 shadow-xxs flex flex-col justify-between">
            {selectedUser ? (
              <div className="space-y-5">
                <div className="text-center pb-4 border-b border-slate-150 flex flex-col items-center">
                  <div className="w-16 h-16 bg-slate-900 border-2 border-amber-400 text-white rounded-2xl flex items-center justify-center font-black text-xl mb-3 shadow-md">
                    {selectedUser.name.split(' ').map(n=>n[0]).join('')}
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm">{maskedName => maskSensitiveText(selectedUser.name)}</h3>
                  <span className="text-[10.5px] font-bold text-slate-400 uppercase tracking-widest">{selectedUser.role}</span>
                  
                  <div className="mt-2 flex gap-1">
                    <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-black text-slate-500">ID: {selectedUser.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black border uppercase ${
                      selectedUser.active ? 'bg-emerald-50 text-emerald-600 border-emerald-150' : 'bg-slate-100 text-slate-400 border-slate-250'
                    }`}>
                      {selectedUser.active ? 'Active' : 'Banned'}
                    </span>
                  </div>
                </div>

                {/* Profile attributes detail lines */}
                <div className="space-y-3.5 text-xs text-slate-600 bg-slate-50/50 p-4 rounded-xl border border-slate-200/40">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Credentials Security Profile</span>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Email Coordinate:</span>
                    <span className="font-mono text-slate-800 font-black">{maskSensitiveText(selectedUser.email)}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Registered Target Device:</span>
                    <span className="text-slate-800 font-black">{selectedUser.device}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">Last Account Access:</span>
                    <span className="text-slate-800 font-black flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" /> {selectedUser.lastLogin}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold">MFA Lock Enrolled:</span>
                    <span className="font-black flex items-center gap-1.5">
                      <Fingerprint className={`w-3.5 h-3.5 ${selectedUser.mfaEnrolled ? 'text-emerald-500' : 'text-slate-350'}`} />
                      <span className={selectedUser.mfaEnrolled ? 'text-emerald-600' : 'text-slate-400'}>
                        {selectedUser.mfaEnrolled ? 'MFA Configured' : 'No Key Found'}
                      </span>
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-150 space-y-1">
                    <span className="text-slate-400 font-bold block">Current Security Clearance Token:</span>
                    <div className="bg-slate-100 p-2 rounded text-[10px] font-mono text-slate-500 break-all border border-slate-200">
                      auth_token.sha256.{selectedUser.id.toLowerCase()}.{selectedUser.role.replace(' ', '').toLowerCase()}_clearance
                    </div>
                  </div>
                </div>

                {/* Quick actions panel */}
                <div className="space-y-2">
                  <span className="text-[9.5px] font-black text-slate-400 uppercase tracking-wider block">Credential Actions</span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setIsEditProfileOpen(true)}
                      className="px-3.5 py-2 bg-slate-900 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 hover:bg-slate-800 shadow-sm transition"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit User Profile
                    </button>
                    <button
                      onClick={() => handleRevokeUser(selectedUser.id, selectedUser.name)}
                      className="px-3 py-2 border border-rose-205 text-rose-600 bg-rose-50/50 hover:bg-rose-50 font-bold text-xs rounded-xl flex items-center justify-center gap-1 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Decommission
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-24 text-slate-400 italic">No User profile selected. Create or select a login row.</div>
            )}

            <div className="border-t border-slate-100 pt-3 text-[10px] text-slate-400 font-bold text-center flex items-center justify-center gap-1.5 block mt-5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" /> Active HR & IT Auditor Control Session
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB: ROLES & PERMISSIONS ===================== */}
      {activeTab === 'roles' && (
        <div className="space-y-6">
          {/* Intelligent Role & Permission Generator Panel */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <Sparkles className="w-32 h-32 text-amber-400" />
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 bg-amber-400/10 rounded-xl border border-amber-400/20">
                <Sparkles className="w-5 h-5 text-amber-400 animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
                  Intelligent Role & Permission Generator
                  <span className="text-[9px] bg-amber-400 text-slate-950 font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-normal">AI Enabled</span>
                </h3>
                <p className="text-[11px] text-slate-400">Generate tailor-fit access roles and map clearance tokens instantly via text instructions or template blueprints.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-5">
              {/* Left Column: Input Form */}
              <div className="lg:col-span-7 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Role Title</label>
                    <input
                      type="text"
                      placeholder="e.g. Sales Intern"
                      value={generatorRoleName}
                      onChange={(e) => setGeneratorRoleName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition"
                    />
                  </div>
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Clearance Presets Quick-Load</label>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { id: 'Admin', label: 'Admin' },
                        { id: 'Sales', label: 'Sales' },
                        { id: 'Support', label: 'Support' },
                        { id: 'HR', label: 'HR Special' },
                        { id: 'Observer', label: 'Observer' }
                      ].map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => applyPresetTemplate(p.id)}
                          className="px-2.5 py-1.5 bg-slate-800 border border-slate-700/60 hover:border-amber-400/60 rounded-lg text-[10.5px] font-bold text-slate-300 transition"
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">Functional Role Scope Prompt & Instructions</label>
                  <textarea
                    rows={3}
                    placeholder="Describe what the employee needs to do. E.g. 'This role is for a call specialist who should be able to log voice calls and complete tasks but is blocked from HR and lead management.'"
                    value={generatorPrompt}
                    onChange={(e) => setGeneratorPrompt(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition resize-none leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setGeneratorRoleName('');
                      setGeneratorPrompt('');
                      setGeneratorJustification('');
                      setGeneratorError(null);
                    }}
                    className="px-3 py-1.5 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-bold rounded-lg transition"
                  >
                    Clear Slate
                  </button>
                  <button
                    type="button"
                    disabled={generatorLoading}
                    onClick={handleGenerateRole}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-500 disabled:bg-amber-400/50 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition"
                  >
                    {generatorLoading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-slate-950" /> Generate Access Role
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: AI Insights & Outputs */}
              <div className="lg:col-span-5 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-1.5 border-b border-slate-800 pb-2">
                    <Info className="w-3.5 h-3.5 text-amber-400" />
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-wider">Security Alignment Analysis</span>
                  </div>

                  {generatorJustification ? (
                    <div className="space-y-2.5">
                      <div className="p-3 bg-emerald-950/40 border border-emerald-900/50 rounded-xl text-xs leading-relaxed text-emerald-300 font-medium">
                        <div className="flex items-center gap-1.5 mb-1 font-bold text-emerald-200">
                          <Check className="w-4 h-4 text-emerald-400" /> Successfully Generated Map!
                        </div>
                        {generatorJustification}
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        This role template has been injected dynamically into the <b>Permission Mapping Matrix</b> below. You can fine-tune specific flags manually anytime.
                      </p>
                    </div>
                  ) : generatorError ? (
                    <div className="p-3 bg-rose-950/40 border border-rose-900/50 rounded-xl text-xs leading-relaxed text-rose-300 font-medium">
                      <div className="flex items-center gap-1.5 mb-1 font-bold text-rose-200">
                        <AlertTriangle className="w-4 h-4 text-rose-400" /> Generation Incident
                      </div>
                      {generatorError}
                    </div>
                  ) : (
                    <div className="py-6 text-center space-y-2">
                      <div className="inline-flex p-2.5 bg-slate-800 rounded-full text-slate-500">
                        <Key className="w-4.5 h-4.5" />
                      </div>
                      <p className="text-[11px] text-slate-400 max-w-[240px] mx-auto leading-relaxed">
                        Specify a custom title and instructions, or load a preset, then click <b>Generate Access Role</b> to map dynamic security tokens.
                      </p>
                    </div>
                  )}
                </div>

                <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-800/80 text-[10px] text-slate-400 leading-normal flex gap-1.5 items-start">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Clearance mappings adhere to the <b>Principle of Least Privilege (PoLP)</b>. Security matrix adjustments are written to the live audit log.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs">
            <h3 className="text-sm font-black text-slate-900 uppercase">Enterprise Permission Mapping Matrix</h3>
            <p className="text-xs text-slate-400 mt-0.5">Customize default permission access tokens on a per-role basis. Toggling options here immediately updates that role's template configurations globally.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
              {rolesList.map(role => (
                <div key={role} className="bg-slate-50 border border-slate-200/75 rounded-2xl p-4 space-y-3 shadow-xxs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-150 pb-2 mb-3">
                      <div className="flex items-center gap-1.5">
                        <Key className="w-4 h-4 text-amber-500" />
                        <span className="text-xs font-black text-slate-900 uppercase tracking-wider truncate max-w-[120px]">{role}</span>
                        {!['Super Admin', 'Admin', 'Sales Manager', 'Support Agent', 'HR Specialist', 'Guest'].includes(role) && (
                          <button
                            onClick={() => handleDeleteCustomRole(role)}
                            className="text-rose-500 hover:text-rose-700 hover:bg-rose-100/50 p-1 rounded transition"
                            title="Decommission custom role"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <span className="text-[9.5px] font-black text-slate-400">
                        {roleMappings[role] ? Object.values(roleMappings[role]).filter(Boolean).length : 0} / 9 Active
                      </span>
                    </div>

                    {/* Permissions list checkboxes */}
                    <div className="space-y-2.5 text-xs">
                      {[
                        { key: 'viewDashboard', label: 'Access Central Dashboard view' },
                        { key: 'manageLeads', label: 'Modify Sales Leads & Pipeline stages' },
                        { key: 'manageCalls', label: 'Log Voice calls & trigger outbound dials' },
                        { key: 'manageSupport', label: 'Resolve client support tickets' },
                        { key: 'manageStaff', label: 'Dispatch Field and staff coordinators' },
                        { key: 'manageTasks', label: 'Add or complete tasks' },
                        { key: 'manageHR', label: 'Access HR metrics & disburse salaries' },
                        { key: 'manageComms', label: 'Compose automated newsletters with AI' },
                        { key: 'manageSecurity', label: 'Manage access roles & adjust credentials' }
                      ].map(p => (
                        <label 
                          key={p.key} 
                          className="flex items-center justify-between p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 cursor-pointer transition select-none"
                        >
                          <span className="text-[10.5px] text-slate-700 font-semibold">{p.label}</span>
                          <input
                            type="checkbox"
                            checked={roleMappings[role] ? roleMappings[role][p.key] : false}
                            onChange={() => handleRolePermissionToggle(role, p.key)}
                            disabled={role === 'Super Admin' && p.key === 'manageSecurity'} // absolute override protection
                            className="w-4.5 h-4.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[9.5px] text-slate-400 font-bold">
                    <span>Clearance Token ID:</span>
                    <span className="font-mono text-slate-500 uppercase">{role.replace(' ', '_')}_ Clearance</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB: ACCESS MATRIX ===================== */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Matrix Description left */}
          <div className="lg:col-span-4 bg-[#0a0f1d] text-slate-100 p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
            <div>
              <span className="text-[9px] font-mono font-bold text-slate-500 block uppercase mb-1">State Cryptography Desk</span>
              <h3 className="text-sm font-extrabold text-slate-200">Role-Based System Security</h3>
              <p className="text-[11px] text-slate-400 mt-2.5 leading-relaxed">
                Expert CRM implements zero-trust cryptographic role bindings. Selecting an impersonator role filters client-side buttons, metrics views, and sidebar panels instantly. Adjust the matrix on the right to dynamically toggle local privilege configurations.
              </p>

              <div className="mt-6 space-y-3.5 bg-slate-900/50 p-4 rounded-xl border border-slate-850/60 text-xs">
                <span className="font-extrabold uppercase text-[9px] text-indigo-400 tracking-wider block">Access Stats</span>
                <div className="flex justify-between text-[11px] text-slate-350">
                  <span>Currently Active Role:</span>
                  <span className="text-amber-400 font-mono font-bold uppercase">{accessControl.role}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-350">
                  <span>Active Tokens Enabled:</span>
                  <span className="font-mono font-bold text-indigo-300">{Object.values(accessControl.permissions).filter(Boolean).length} / 9</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-800 text-[10px] text-slate-500 mt-6 space-y-1">
              <span className="font-bold text-slate-400 block">Active Workspace Hash:</span>
              <p className="font-mono break-all text-xxs">0x5F19DCEE2B38A8F9</p>
            </div>
          </div>

          {/* Privilege Matrix adjustments right */}
          <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-100 shadow-xxs">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Privilege Configuration Dashboard (Currently Switchable)</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { key: 'viewDashboard', label: 'Access Central Dashboard view' },
                { key: 'manageLeads', label: 'Modify Sales Leads & Pipeline stages' },
                { key: 'manageCalls', label: 'Log Voice calls & trigger outbound dials' },
                { key: 'manageSupport', label: 'Resolve client support tickets' },
                { key: 'manageStaff', label: 'Dispatch Field and staff coordinators' },
                { key: 'manageTasks', label: 'Add or complete tasks' },
                { key: 'manageHR', label: 'Access HR metrics & disburse salaries' },
                { key: 'manageComms', label: 'Compose automated newsletters with AI' },
                { key: 'manageSecurity', label: 'Manage access roles & adjust credentials' }
              ].map(p => (
                <div 
                  key={p.key} 
                  className={`p-3.5 rounded-xl border flex items-center justify-between transition ${
                    accessControl.permissions[p.key as keyof AccessControl['permissions']]
                      ? 'bg-emerald-50/20 border-emerald-150'
                      : 'bg-slate-50 border-slate-150 opacity-60'
                  }`}
                >
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-slate-800 block">{p.label}</span>
                    <span className="text-[10px] text-slate-400 font-medium">Token ID: privilege.{p.key}</span>
                  </div>

                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer"
                      checked={accessControl.permissions[p.key as keyof AccessControl['permissions']]}
                      onChange={() => handleRolePermissionToggle(accessControl.role, p.key)}
                    />
                    <div className="w-9 h-5 bg-slate-205 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10b981]"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB: DATA SECURITY CONTROLS ===================== */}
      {activeTab === 'controls' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs space-y-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-500 animate-pulse" /> Advanced Security Configuration
            </h3>
            
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Enforce enterprise encryption parameters, manage Multi-Factor authentication rules, and configure sensitive field masking.
            </p>

            <div className="space-y-4 pt-3">
              {/* Sensitive Data Masking Policy */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-800 block">Field Masking Policy</span>
                  <p className="text-[10.5px] text-slate-400 font-semibold">Mask employee emails/roles in UI for non-authorized personnel.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={dataMaskingEnforced}
                    onChange={handleToggleDataMasking}
                  />
                  <div className="w-10 h-6 bg-slate-205 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>

              {/* Multi Factor Authentication switch */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                <div className="space-y-0.5">
                  <span className="text-xs font-black text-slate-800 block">Global MFA Enforcement</span>
                  <p className="text-[10.5px] text-slate-400 font-semibold">Require certified cryptographic token challenges across active sessions.</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={globalMfaEnforced}
                    onChange={handleToggleGlobalMfa}
                  />
                  <div className="w-10 h-6 bg-slate-205 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
              </div>
            </div>

            <div className="rounded-xl border border-dashed border-slate-200 p-3 bg-amber-50/50 text-[10.5px] text-amber-700 space-y-1">
              <span className="font-extrabold block">⚠️ Crypto Warning:</span>
              <p className="font-medium">Global MFA requires physical or biometric key bindings. Accounts without registered credentials will be flagged on next portal authentication attempts.</p>
            </div>
          </div>

          {/* IP Whitelisting Rules Section */}
          <div className="lg:col-span-8 bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs space-y-4">
            <h3 className="text-sm font-black text-slate-900 uppercase">IP Whitelist Subnet Access Constraints</h3>
            <p className="text-xs text-slate-400 mt-0.5">Define authorized corporate IP address thresholds from which the CRM portal may be safely accessed. Unlisted network endpoints are auto-routed to security portals.</p>

            <form onSubmit={handleRegisterIp} className="flex gap-2 text-xs mt-3">
              <input 
                type="text" 
                placeholder="Enter IPv4 Address (e.g. 192.168.1.15)"
                value={newIp}
                onChange={(e) => setNewIp(e.target.value)}
                className="flex-1 p-2.5 border border-slate-205 rounded-xl focus:bg-slate-50 transition font-mono"
              />
              <button 
                type="submit"
                className="px-4 py-2.5 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 flex items-center gap-1.5 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" /> Append IP Gateway
              </button>
            </form>

            <div className="border border-slate-150 rounded-xl overflow-hidden mt-4 bg-white text-xs">
              <div className="bg-slate-50 p-3 font-extrabold text-[9px] uppercase tracking-wider text-slate-400 border-b border-slate-150">
                ACTIVE GATEWAY SUB-NET RULES ({ipWhitelist.length})
              </div>
              
              <div className="divide-y divide-slate-100 font-medium">
                {ipWhitelist.map(ip => (
                  <div key={ip} className="p-3 flex items-center justify-between hover:bg-slate-50 transition">
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-emerald-500" />
                      <span className="font-mono text-slate-800 font-bold">{ip}</span>
                      {ip === '127.0.0.1' && (
                        <span className="px-1.5 py-0.2 bg-indigo-50 border border-indigo-150 text-[8px] text-indigo-600 rounded uppercase font-black tracking-widest">
                          Localhost
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeauthorizeIp(ip)}
                      className="p-1 px-2 text-[10px] bg-rose-50 border border-rose-100 text-rose-600 font-bold hover:bg-rose-100 rounded-md transition"
                    >
                      Deauthorize Rule
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===================== TAB: AUDIT TIMELINE LOGS ===================== */}
      {activeTab === 'audit' && (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-0.5">
              <h3 className="text-sm font-black text-slate-900 uppercase">Operational Cryptographic Audit trail</h3>
              <p className="text-xs text-slate-400 font-medium">Verified historical log records tracking user actions, security switches, base state restoration events, and login attempts.</p>
            </div>
            
            <button
              onClick={() => {
                const logsCsv = "ID,Timestamp,Action,User,IPAddress,Severity\n" + auditLogs.map(l => `"${l.id}","${l.timestamp}","${l.action.replace(/"/g, '""')}","${l.user}","${l.ipAddress}","${l.severity}"`).join("\n");
                const blob = new Blob([logsCsv], { type: 'text/csv' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `ExpertCRM_SecurityAuditTrail_${new Date().toISOString().split('T')[0]}.csv`;
                link.click();
                triggerToast("Initiated CSV log trail export!");
              }}
              className="px-3.5 py-1.5 border border-slate-205 text-slate-700 bg-slate-55 hover:bg-slate-100 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" /> Export Audit Trail (CSV)
            </button>
          </div>

          {/* Audit Filters Toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Filter logs by keywords, user email, IP addresses..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full text-xs p-2 pl-9 bg-slate-50 border border-slate-205 rounded-xl focus:bg-white transition"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-100 p-0.5 rounded-lg text-xs font-bold shrink-0">
              <span className="px-2 text-[9px] uppercase text-slate-500">Filter Threat:</span>
              {(['all', 'info', 'warning', 'security', 'critical'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setAuditFilter(tab)}
                  className={`px-2.5 py-1 rounded text-[10px] text-slate-600 transition capitalize ${
                    auditFilter === tab ? 'bg-white text-slate-900 shadow-xxs font-black' : 'hover:text-slate-900'
                  }`}
                >
                  {tab === 'all' ? 'All Logs' : tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table log displays */}
          <div className="overflow-x-auto rounded-xl border border-slate-150 bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase text-[8.5px] border-b border-slate-150">
                <tr>
                  <th className="p-3">Audit Reference ID</th>
                  <th className="p-3">Threat Severity</th>
                  <th className="p-3">Operation Description</th>
                  <th className="p-3">User Client Node</th>
                  <th className="p-3">IP Endpoint Address</th>
                  <th className="p-3 text-right">Registered Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-slate-400 italic">No operational logs matched your searches or selected categories.</td>
                  </tr>
                ) : (
                  filteredLogs.map(log => (
                    <tr key={log.id} className="hover:bg-slate-50/50">
                      <td className="p-3 font-mono font-bold text-slate-400 text-xxs">{log.id}</td>
                      <td className="p-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[8.5px] font-black uppercase border tracking-wider ${
                          log.severity === 'critical' ? 'bg-rose-50 text-rose-600 border-rose-200 animate-pulse' :
                          log.severity === 'security' ? 'bg-indigo-50 text-indigo-600 border-indigo-200 font-extrabold' :
                          log.severity === 'warning' ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {log.severity}
                        </span>
                      </td>
                      <td className="p-3 text-slate-800 font-bold">{log.action}</td>
                      <td className="p-3 font-mono text-slate-500">{maskSensitiveText(log.user)}</td>
                      <td className="p-3 font-mono text-slate-400">{log.ipAddress}</td>
                      <td className="p-3 text-right text-slate-400 font-mono text-xxs">{log.timestamp}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===================== TAB: DISASTER RECOVERY (BACKUP & RESTORE) ===================== */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Export utility details */}
          <div className="lg:col-span-5 bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-150">
                  <Download className="w-5 h-5 shrink-0" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">Export CRM Database Vault</h3>
                  <span className="text-[10px] text-slate-450 block font-bold uppercase tracking-widest text-indigo-500">Security Clearance Required</span>
                </div>
              </div>

              <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                Generate a secure, decrypted client-side state payload. This binary-safe file serves as a certified point-in-time recovery block.
              </p>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 text-xs">
                <span className="font-extrabold uppercase text-[9px] text-slate-400 tracking-wider block">Scope of backup dump</span>
                <div className="grid grid-cols-2 gap-2 text-slate-500 text-[11px]">
                  <div className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Active Leads</div>
                  <div className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Employees roster</div>
                  <div className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Support Tickets</div>
                  <div className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Tasks list</div>
                  <div className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Access Configs</div>
                  <div className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-emerald-500" /> Audit Ledger</div>
                </div>
              </div>
            </div>

            <div className="space-y-3.5 pt-6 border-t border-slate-100">
              <button
                onClick={handleExportSystemBackup}
                className="w-full py-3 bg-slate-900 text-white rounded-xl font-extrabold text-xs flex items-center justify-center gap-2"
              >
                <FileJson className="w-4 h-4 text-amber-400 animate-pulse" /> Download State Backup (.json)
              </button>

              <button
                type="button"
                onClick={triggerFactoryHardReset}
                className="w-full py-2 border border-rose-250 text-rose-600 bg-rose-50/20 hover:bg-rose-50 text-[11px] rounded-xl font-bold transition flex items-center justify-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" /> Purge Workspace Data (Factory State)
              </button>
            </div>
          </div>

          {/* Import / Restore panel */}
          <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-100 shadow-xxs space-y-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
                <Upload className="w-5 h-5 shrink-0 hover:rotate-180 transition duration-300" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase">State Recovery Block Uploader</h3>
                <p className="text-[10px] text-slate-400 font-semibold">Overwrites contemporary leads, employees, and ticket variables instantly.</p>
              </div>
            </div>

            {/* Drag & Drop simulated area */}
            <div className="border-2 border-dashed border-slate-205 rounded-xl p-5 text-center cursor-pointer bg-slate-50/50 hover:bg-slate-50 transition relative">
              <input 
                type="file" 
                accept=".json"
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileJson className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <span className="text-xs font-bold text-slate-800 block">Drag your JSON backup block here or <span className="text-indigo-600 underline">Browse files</span></span>
              <span className="text-[10px] text-slate-400 font-bold block mt-1">Accepts only verified ExpertCRM JSON schemas</span>
            </div>

            {/* Manual text-area dump paste alternative */}
            <div className="space-y-1.5 text-xs">
              <span className="text-slate-500 font-bold block">Pasted Raw Recovery String Payload:</span>
              <textarea
                rows={4}
                value={rawBackupText}
                onChange={(e) => {
                  setRawBackupText(e.target.value);
                  processBackupString(e.target.value);
                }}
                placeholder="Pasted JSON content goes here..."
                className="w-full p-2.5 font-mono text-[10.5px] border border-slate-205 rounded-xl focus:bg-slate-50 transition"
              />
            </div>

            {/* Parsing validation response screen */}
            {restoreError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xxs text-rose-700 flex items-center gap-2 font-bold select-none">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" /> {restoreError}
              </div>
            )}

            {restoreSummary && (
              <div className="p-4 bg-emerald-50/30 border border-emerald-150 rounded-xl space-y-2.5 text-xs text-slate-700">
                <div className="flex items-center gap-1 text-emerald-700 font-extrabold text-[12px]">
                  <ShieldCheck className="w-4.5 h-4.5" /> Database restore point successfully validated!
                </div>
                
                <p className="text-[11px] text-slate-450 italic">
                  Backup Generated: <strong>{restoreSummary.metadata?.timestamp || "unspecified"}</strong>
                </p>

                <div className="grid grid-cols-2 gap-x-6 gap-y-1 mt-2 text-[11px] font-bold text-slate-650">
                  {Object.keys(restoreSummary.counts).map(key => (
                    <div key={key} className="flex justify-between border-b border-white p-1">
                      <span className="font-mono text-slate-505">{key}</span>
                      <span className="font-mono text-slate-900 font-extrabold">{restoreSummary.counts[key]} rows</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsRestoreConfirmOpen(true)}
                    className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs shadow-md transition"
                  >
                    🚀 Proceed to Execute Hard Data Hydration
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODAL: REGISTER NEW USER ===================== */}
      {isNewUserOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-xs">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-1">
                <UserPlus className="w-4 h-4 text-amber-400" /> Create System Credentials
              </h3>
              <button onClick={() => setIsNewUserOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-5 space-y-4 font-medium">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">Full Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ketan Patel"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm(prev=>({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">Email Coordinates:</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. ketan@expertcrm.com"
                  value={newUserForm.email}
                  onChange={(e) => setNewUserForm(prev=>({ ...prev, email: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Access Role Group:</label>
                  <select
                    value={newUserForm.role}
                    onChange={(e) => setNewUserForm(prev=>({ ...prev, role: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl font-bold"
                  >
                    {rolesList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Login Device / Terminal:</label>
                  <select
                    value={newUserForm.device}
                    onChange={(e) => setNewUserForm(prev=>({ ...prev, device: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl font-bold"
                  >
                    <option value="Web Portal">Web Portal</option>
                    <option value="Mobile-Apply">Mobile App</option>
                    <option value="Desktop Terminal">Secure Terminal</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-2">
                <input 
                  type="checkbox"
                  id="mfaCheckbox"
                  checked={newUserForm.mfaEnrolled}
                  onChange={(e) => setNewUserForm(prev=>({ ...prev, mfaEnrolled: e.target.checked }))}
                  className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                />
                <label htmlFor="mfaCheckbox" className="text-[11px] text-slate-650 cursor-pointer text-slate-500 font-semibold select-none">
                  Pre-register MFA Cryptographic Security Key
                </label>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsNewUserOpen(false)}
                  className="px-4 py-2 border border-slate-205 bg-white rounded-xl text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-extrabold shadow-sm flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Save Credentials
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== MODAL: EDIT USER PROFILE ===================== */}
      {isEditProfileOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden text-xs">
            <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-extrabold text-sm flex items-center gap-1">
                <Edit className="w-4 h-4 text-amber-400" /> Edit User Profile Credentials
              </h3>
              <button onClick={() => setIsEditProfileOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditProfileSubmit} className="p-5 space-y-4 font-medium">
              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">User Full Name:</label>
                <input
                  type="text"
                  required
                  value={editProfileForm.name}
                  onChange={(e) => setEditProfileForm(prev=>({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-500 font-bold block">Email Coordinates:</label>
                <input
                  type="email"
                  required
                  value={editProfileForm.email}
                  onChange={(e) => setEditProfileForm(prev=>({ ...prev, email: e.target.value }))}
                  className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Clearance access Level:</label>
                  <select
                    value={editProfileForm.role}
                    onChange={(e) => setEditProfileForm(prev=>({ ...prev, role: e.target.value as any }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl font-bold"
                  >
                    {rolesList.map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-500 font-bold block">Active Portal Device:</label>
                  <select
                    value={editProfileForm.device}
                    onChange={(e) => setEditProfileForm(prev=>({ ...prev, device: e.target.value }))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-205 rounded-xl font-bold"
                  >
                    <option value="Web Portal">Web Portal</option>
                    <option value="Mobile-Apply">Mobile App</option>
                    <option value="Desktop Terminal">Secure Terminal</option>
                    <option value="Offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 mt-2">
                <div className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox"
                    id="editActiveCh"
                    checked={editProfileForm.active}
                    onChange={(e) => setEditProfileForm(prev=>({ ...prev, active: e.target.checked }))}
                    className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                  />
                  <label htmlFor="editActiveCh" className="text-[11px] text-slate-500 font-semibold select-none">
                    Status: Permitted
                  </label>
                </div>

                <div className="flex items-center gap-1.5 cursor-pointer">
                  <input 
                    type="checkbox"
                    id="editMfaCh"
                    checked={editProfileForm.mfaEnrolled}
                    onChange={(e) => setEditProfileForm(prev=>({ ...prev, mfaEnrolled: e.target.checked }))}
                    className="w-4 h-4 rounded text-slate-900 border-slate-300 focus:ring-slate-900"
                  />
                  <label htmlFor="editMfaCh" className="text-[11px] text-slate-500 font-semibold select-none">
                    Enforced MFA key
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsEditProfileOpen(false)}
                  className="px-4 py-2 border border-slate-205 bg-white rounded-xl text-slate-700 hover:bg-slate-50 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 font-extrabold shadow-sm flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== CONFIRM RESTORE WATERFALL ===================== */}
      {isRestoreConfirmOpen && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden text-xs text-slate-750">
            <div className="bg-rose-900 text-white p-4 flex justify-between items-center">
              <h3 className="font-extrabold text-xs flex items-center gap-1">
                <AlertTriangle className="w-5 h-5 text-amber-400 animate-bounce" /> Hard system-State Recovery Alert
              </h3>
              <button onClick={() => setIsRestoreConfirmOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3 font-medium">
              <h4 className="font-black text-rose-700 uppercase tracking-widest text-center text-[11px]">Executing Restore Sequence</h4>
              <p className="text-xs text-slate-500 leading-relaxed text-center">
                This action is irreversible and overwrites all active Leads, Tasks, Logs, Employees, and user clearance states with values matched in the validate package dump.
              </p>

              <div className="bg-rose-50 border border-rose-150 p-2 text-rose-800 rounded-lg text-xxs font-semibold space-y-1">
                <span>Validation check passes:</span>
                <p>● Recovery Key Identified</p>
                <p>● CRC Schema aligned</p>
                <p>● Device session context: {restoreSummary?.metadata?.creator || "unverified"}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setIsRestoreConfirmOpen(false)}
                  className="px-3.5 py-1.5 border border-slate-205 bg-white rounded-xl text-slate-750 font-bold"
                >
                  Abort Action
                </button>
                <button
                  type="button"
                  onClick={executeSystemStateRestore}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-black text-xs shadow-md"
                >
                  Authorize Dynamic Overwrite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
