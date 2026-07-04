import React, { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Navigation2, Users, ClipboardList, Battery, 
  Search, ShieldAlert, Sparkles, Send, Crosshair, Star, CheckCircle, 
  Clock, TrendingUp, DollarSign, Award, Calendar, ChevronRight, 
  Map, Activity, AlertTriangle, FileText, CheckCircle2, XCircle, 
  ArrowUpRight, Download, Printer, ShoppingBag, Eye, Heart, BarChart2,
  TrendingDown, MapPinCheck, RefreshCw, ThumbsUp, Briefcase
} from 'lucide-react';
import { FieldStaff } from '../types';

interface FieldStaffManagerProps {
  fieldStaff: FieldStaff[];
  onDispatchTask: (staffId: string, taskTitle: string, description: string) => void;
}

// Subsystems definition
type ActivePanel = 'performance' | 'gps' | 'attendance' | 'visits' | 'operations';
type ReportSubTab = 'kpi_dashboard' | 'sales_reports' | 'lead_conversion' | 'activity_reports';

// Core State Structures for Durable LocalStorage Tracking
interface CheckInLog {
  id: string;
  staffId: string;
  staffName: string;
  checkType: 'Check-In' | 'Check-Out';
  timestamp: string;
  locationName: string;
  coordinates: string;
  notes: string;
  geofenceStatus: 'Within Geofence Hub' | 'Out of Bounds (Aligned)' | 'Deviated Remote';
  hasPhotoSim: boolean;
}

interface VisitSchedule {
  id: string;
  customerId: string;
  customerName: string;
  companyName: string;
  scheduledTime: string;
  assignedStaffId: string;
  assignedStaffName: string;
  purpose: string;
  status: 'Scheduled' | 'Checked-In' | 'Completed' | 'Deferred';
  feedbackRating?: number; // 1-5 stars
  feedbackNotes?: string;
  salesAmtClosed?: number;
  conversionStage?: 'In Progress' | 'Won' | 'Lost' | 'Follow-Up-Requested';
  salesPotential?: 'High' | 'Medium' | 'Low';
}

interface GPSBreadcrumb {
  time: string;
  label: string;
  lat: string;
  lng: string;
  status: 'Stop' | 'Transit' | 'Operational Site';
}

// Pre-populated default records in case localStorage is empty
const INITIAL_CHECK_INS: CheckInLog[] = [
  {
    id: "CH-901",
    staffId: "STF-01",
    staffName: "Ketan Patel",
    checkType: "Check-In",
    timestamp: "2026-06-17, 08:30 AM",
    locationName: "Noida Sector 62 Warehouse Core",
    coordinates: "28.6272° N, 77.3725° E",
    notes: "Commencing daily depot inventory dispatch and routing checks.",
    geofenceStatus: "Within Geofence Hub",
    hasPhotoSim: true
  },
  {
    id: "CH-902",
    staffId: "STF-02",
    staffName: "Meera Nair",
    checkType: "Check-In",
    timestamp: "2026-06-17, 09:15 AM",
    locationName: "Mumbai Kalamboli Yard Axis",
    coordinates: "19.0238° N, 73.1114° E",
    notes: "Live alignment on physical trunking deployment schedules.",
    geofenceStatus: "Within Geofence Hub",
    hasPhotoSim: true
  },
  {
    id: "CH-903",
    staffId: "STF-03",
    staffName: "Sandeep Roy",
    checkType: "Check-In",
    timestamp: "2026-06-17, 10:02 AM",
    locationName: "Apex Retail NCR Office Block",
    coordinates: "28.5355° N, 77.3910° E",
    notes: "Arrived at customer Noida Site. Checking router firewall diagnostics.",
    geofenceStatus: "Out of Bounds (Aligned)",
    hasPhotoSim: false
  }
];

const INITIAL_VISITS: VisitSchedule[] = [
  {
    id: "VR-391",
    customerId: "CUST-101",
    customerName: "Amit Patel",
    companyName: "Hindustan Logistics",
    scheduledTime: "11:00 AM",
    assignedStaffId: "STF-01",
    assignedStaffName: "Ketan Patel",
    purpose: "Hardware Gateway Installation & SIP Testing",
    status: "Completed",
    feedbackRating: 5,
    feedbackNotes: "Outstanding tech setup. Gateway successfully piped with zero jitter or echo.",
    salesAmtClosed: 250000,
    conversionStage: "Won",
    salesPotential: "High"
  },
  {
    id: "VR-392",
    customerId: "CUST-102",
    customerName: "David Miller",
    companyName: "Quantum Tech Inc",
    scheduledTime: "01:30 PM",
    assignedStaffId: "STF-02",
    assignedStaffName: "Meera Nair",
    purpose: "SLA Router Diagnostic & Bandwidth Expansion",
    status: "Checked-In",
    salesAmtClosed: 480000,
    conversionStage: "Won",
    salesPotential: "High"
  },
  {
    id: "VR-393",
    customerId: "CUST-103",
    customerName: "Preeti Sharma",
    companyName: "Apex Retail Group",
    scheduledTime: "03:45 PM",
    assignedStaffId: "STF-03",
    assignedStaffName: "Sandeep Roy",
    purpose: "System Onboarding, Port Tracing & API Bridging",
    status: "Scheduled",
    salesPotential: "Medium"
  }
];

// Visual coordinates mapped per employee (0-100 on canvas)
const EMPLOYEE_GPS_CONFIG: Record<string, {
  movementStatus: 'Driving' | 'Stopped' | 'At Client Hub' | 'Inactive';
  vehicleSpeed: string;
  signalStrength: string;
  routeTitle: string;
  routePathName: string;
  routeAdherence: 'Optimal' | 'Slightly Deviated' | 'Unauthorized';
  distanceLeft: string;
  durationLeft: string;
  breadcrumbs: GPSBreadcrumb[];
}> = {
  "STF-01": {
    movementStatus: 'At Client Hub',
    vehicleSpeed: '0 km/h',
    signalStrength: 'Excellent (LTE+)',
    routeTitle: 'Noida HQ -> Hindustan Logistics Yard -> Sector 62',
    routePathName: 'Path Core-1 (Adhered)',
    routeAdherence: 'Optimal',
    distanceLeft: '0.2 km',
    durationLeft: '2 mins',
    breadcrumbs: [
      { time: '08:30 AM', label: 'Checked In Noida HQ Dispatcher Depot', lat: '28.6272', lng: '77.3725', status: 'Stop' },
      { time: '10:15 AM', label: 'In Transit via NH-24 Bypass', lat: '28.6180', lng: '77.3820', status: 'Transit' },
      { time: '11:00 AM', label: 'Arrived: Hindustan Logistics Core Terminal', lat: '28.6044', lng: '77.3995', status: 'Operational Site' }
    ]
  },
  "STF-02": {
    movementStatus: 'Driving',
    vehicleSpeed: '48 km/h',
    signalStrength: 'Good (4G-LTE)',
    routeTitle: 'Kalamboli Base -> Belapur Highway -> Quantum Tech Block',
    routePathName: 'Outer Ring Bypass Core',
    routeAdherence: 'Optimal',
    distanceLeft: '1.4 km',
    durationLeft: '9 mins',
    breadcrumbs: [
      { time: '09:15 AM', label: 'Checked In Mumbai Kalamboli Depot', lat: '19.0238', lng: '73.1114', status: 'Stop' },
      { time: '11:45 AM', label: 'Fuel Stop at Kharghar Axis HP Station', lat: '19.0289', lng: '73.0682', status: 'Stop' },
      { time: '01:10 PM', label: 'Driving on Palm Beach Road Expressway', lat: '19.0125', lng: '73.0250', status: 'Transit' }
    ]
  },
  "STF-03": {
    movementStatus: 'Stopped',
    vehicleSpeed: '0 km/h (Traffic Jam)',
    signalStrength: 'Fair (3G Network)',
    routeTitle: 'Noida Sector 18 -> Apex Noida Office -> Sector 15 Metro',
    routePathName: 'Alternative Sector Grid 4',
    routeAdherence: 'Slightly Deviated',
    distanceLeft: '3.6 km',
    durationLeft: '22 mins',
    breadcrumbs: [
      { time: '10:02 AM', label: 'Checked In Noida Sector 18 Depot', lat: '28.5708', lng: '77.3218', status: 'Stop' },
      { time: '11:30 AM', label: 'Sector 55 Diagnostic Visit', lat: '28.5991', lng: '77.3510', status: 'Operational Site' },
      { time: '01:45 PM', label: 'Stuck in construction bottleneck near crossing', lat: '28.5815', lng: '77.3620', status: 'Transit' }
    ]
  },
  "STF-04": {
    movementStatus: 'Inactive',
    vehicleSpeed: '0 km/h',
    signalStrength: 'Offline / Disconnected',
    routeTitle: 'No active physical route itinerary assigned',
    routePathName: 'N/A',
    routeAdherence: 'Optimal',
    distanceLeft: '0 km',
    durationLeft: '0 mins',
    breadcrumbs: [
      { time: 'Yesterday', label: 'Signed off at Delhi Hub Terminal Sector 9', lat: '28.5444', lng: '77.2910', status: 'Stop' }
    ]
  }
};

export default function FieldStaffManager({ fieldStaff, onDispatchTask }: FieldStaffManagerProps) {
  // Main Panel Tab
  const [activePanel, setActivePanel] = useState<ActivePanel>('performance');
  // Secondary reports tab inside performance panel
  const [reportSubTab, setReportSubTab] = useState<ReportSubTab>('kpi_dashboard');

  // Staff lookup selection
  const [selectedStaffId, setSelectedStaffId] = useState<string>(fieldStaff[0]?.id || 'STF-01');
  const activeStaff = fieldStaff.find(s => s.id === selectedStaffId) || fieldStaff[0];

  // Search variables
  const [activitySearch, setActivitySearch] = useState('');
  const [activityFilterStaff, setActivityFilterStaff] = useState('All');

  // Interactive Live States stored in LocalStorage for high-end fidelity
  const [checkIns, setCheckIns] = useState<CheckInLog[]>(() => {
    const saved = localStorage.getItem('crm_fs_checkins');
    return saved ? JSON.parse(saved) : INITIAL_CHECK_INS;
  });

  const [visits, setVisits] = useState<VisitSchedule[]>(() => {
    const saved = localStorage.getItem('crm_fs_visits');
    return saved ? JSON.parse(saved) : INITIAL_VISITS;
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // New check-in simulation form
  const [formStaffId, setFormStaffId] = useState<string>('STF-01');
  const [formCheckType, setFormCheckType] = useState<'Check-In' | 'Check-Out'>('Check-In');
  const [formLocation, setFormLocation] = useState<string>('Noida Sector 62 Warehouse Core');
  const [formNotes, setFormNotes] = useState<string>('');
  const [formPhoto, setFormPhoto] = useState<boolean>(true);

  // New Sale Simulation form
  const [isSalesModalOpen, setIsSalesModalOpen] = useState(false);
  const [saleRepId, setSaleRepId] = useState('STF-01');
  const [saleCompany, setSaleCompany] = useState('');
  const [saleClientName, setSaleClientName] = useState('');
  const [saleValue, setSaleValue] = useState('180000');
  const [salePotential, setSalePotential] = useState<'High' | 'Medium' | 'Low'>('High');

  // Save changes to LocalStorage
  useEffect(() => {
    localStorage.setItem('crm_fs_checkins', JSON.stringify(checkIns));
  }, [checkIns]);

  useEffect(() => {
    localStorage.setItem('crm_fs_visits', JSON.stringify(visits));
  }, [visits]);

  // Toast notifier trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Check-In Form Submission
  const handlePerformCheckInOut = (e: React.FormEvent) => {
    e.preventDefault();
    const staffRef = fieldStaff.find(s => s.id === formStaffId);
    if (!staffRef) return;

    // Determine Geofence Tag automatically based on location text
    let geofence: CheckInLog['geofenceStatus'] = 'Out of Bounds (Aligned)';
    if (formLocation.toLowerCase().includes('core') || formLocation.toLowerCase().includes('warehouse') || formLocation.toLowerCase().includes('hq')) {
      geofence = 'Within Geofence Hub';
    } else if (formLocation.toLowerCase().includes('deviated') || formLocation.toLowerCase().includes('unauthorized')) {
      geofence = 'Deviated Remote';
    }

    const timestamp = new Date().toLocaleString('en-US', {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: true
    });

    const newLog: CheckInLog = {
      id: `CH-${Date.now().toString().slice(-3)}`,
      staffId: formStaffId,
      staffName: staffRef.name,
      checkType: formCheckType,
      timestamp,
      locationName: formLocation,
      coordinates: `${(28.5 + Math.random() * 0.2).toFixed(4)}° N, ${(77.3 + Math.random() * 0.2).toFixed(4)}° E`,
      notes: formNotes || `${formCheckType} registered automatically at on-ground post.`,
      geofenceStatus: geofence,
      hasPhotoSim: formPhoto
    };

    setCheckIns(prev => [newLog, ...prev]);
    setFormNotes('');
    triggerToast(`Successfully recorded ${formCheckType} GPS Log for ${staffRef.name}! Geofence checked as "${geofence}".`);
  };

  // 2. Mark Visit Complete
  const handleCompleteVisit = (visitId: string, rating: number, notes: string) => {
    setVisits(prev => prev.map(v => {
      if (v.id === visitId) {
        return {
          ...v,
          status: 'Completed',
          feedbackRating: rating,
          feedbackNotes: notes || 'Service completed successfully.'
        };
      }
      return v;
    }));
    triggerToast(`Customer visit record ${visitId} updated to Completed. Rating saved!`);
  };

  // 3. New Sale Booking
  const handleBookSale = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleCompany || !saleClientName) return;

    const staffRef = fieldStaff.find(s => s.id === saleRepId);
    if (!staffRef) return;

    const newVisit: VisitSchedule = {
      id: `VR-${Date.now().toString().slice(-3)}`,
      customerId: `CUST-${Math.floor(100 + Math.random() * 900)}`,
      customerName: saleClientName,
      companyName: saleCompany,
      scheduledTime: "Completed Check-In Direct",
      assignedStaffId: saleRepId,
      assignedStaffName: staffRef.name,
      purpose: "Ground Sales Conversion Demo",
      status: "Completed",
      feedbackRating: 5,
      feedbackNotes: "On-site sale pipeline successfully won and converted.",
      salesAmtClosed: Number(saleValue),
      conversionStage: 'Won',
      salesPotential: salePotential
    };

    setVisits(prev => [newVisit, ...prev]);
    setIsSalesModalOpen(false);
    setSaleCompany('');
    setSaleClientName('');
    setSaleValue('180000');
    triggerToast(`Contract Closed! Registered with ₹${Number(saleValue).toLocaleString()} in revenue allocated to ${staffRef.name}`);
  };

  // Export functions simulation
  const handleCSVExport = () => {
    const csvHeader = 'ID,Staff ID,Staff Name,Log Type,Timestamp,Location,Coordinates,Geofence Status,Notes\n';
    const csvRows = checkIns.map(log => 
      `"${log.id}","${log.staffId}","${log.staffName}","${log.checkType}","${log.timestamp}","${log.locationName}","${log.coordinates}","${log.geofenceStatus}","${log.notes.replace(/"/g, '""')}"`
    ).join('\n');
    
    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `Field_Activity_Report_${new Date().toISOString().slice(0,10)}.csv`);
    a.click();
    triggerToast('Perfect! Your custom CSV report download has initiated with live GPS check-in trails.');
  };

  const handlePrintMockup = () => {
    window.print();
    triggerToast('Print diagnostic sheet requested securely.');
  };

  // Safe configurations retrieval for currently selected employee map/route view
  const config = EMPLOYEE_GPS_CONFIG[selectedStaffId] || EMPLOYEE_GPS_CONFIG["STF-01"];

  // Total Performance metrics calculations
  const totalVisits = visits.length;
  const completedCount = visits.filter(v => v.status === 'Completed').length;
  const completionRate = totalVisits > 0 ? Math.round((completedCount / totalVisits) * 100) : 0;
  const totalRevenue = visits.reduce((sum, v) => sum + (v.salesAmtClosed || 0), 0);

  // Filtered Activity logs
  const filteredCheckIns = checkIns.filter(log => {
    const matchesSearch = 
      log.staffName.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.locationName.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.id.toLowerCase().includes(activitySearch.toLowerCase()) ||
      log.notes.toLowerCase().includes(activitySearch.toLowerCase());
    const matchesStaff = activityFilterStaff === 'All' || log.staffId === activityFilterStaff;
    return matchesSearch && matchesStaff;
  });

  return (
    <div id="field-staff-operations-hub" className="space-y-4 font-sans text-slate-800">
      
      {/* Toast Alert Popups */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 bg-slate-900 text-white px-4 py-3 rounded-xl border border-slate-700 shadow-2xl flex items-center gap-2 z-50 animate-bounce duration-300">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Operations Navigation Header */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-205 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-xs">
            <Navigation className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-slate-900 tracking-tight">Field & Handset Staff Operations Center</h2>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                SLA GPS Terminal
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Integrated enterprise tracker: Performance dashboard, live routes, location breadcrumbs, geofence check-ins, sales metrics, and CRM telemetry syncing.</p>
          </div>
        </div>

        {/* Major System Panel Navigation bar */}
        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-lg shrink-0">
          <button
            onClick={() => setActivePanel('performance')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 uppercase ${
              activePanel === 'performance' ? 'bg-white text-slate-900 shadow-xxs border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-emerald-500" /> Performance & Reports
          </button>
          
          <button
            onClick={() => setActivePanel('gps')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 uppercase ${
              activePanel === 'gps' ? 'bg-white text-slate-900 shadow-xxs border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Crosshair className="w-4 h-4 text-indigo-500" /> Live GPS Tracking ({fieldStaff.filter(s => s.status !== 'Offline').length})
          </button>

          <button
            onClick={() => setActivePanel('attendance')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 uppercase ${
              activePanel === 'attendance' ? 'bg-white text-slate-900 shadow-xxs border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <MapPinCheck className="w-4 h-4 text-amber-500" /> Check-In & Attendance
          </button>

          <button
            onClick={() => setActivePanel('visits')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 uppercase ${
              activePanel === 'visits' ? 'bg-white text-slate-900 shadow-xxs border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <ClipboardList className="w-4 h-4 text-sky-500" /> Visit Schedules & Insights
          </button>

          <button
            onClick={() => setActivePanel('operations')}
            className={`px-3 py-1.5 rounded-md text-xs font-bold transition flex items-center gap-1.5 uppercase ${
              activePanel === 'operations' ? 'bg-white text-slate-900 shadow-xxs border border-slate-200/50' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-rose-500" /> Operations Command
          </button>
        </div>
      </div>

      {/* ===================== SUBPANEL 1: PERFORMANCE & REPORTS ===================== */}
      {activePanel === 'performance' && (
        <div className="space-y-4">
          
          {/* Inner performance panel navigation subtab */}
          <div className="flex border-b border-slate-150">
            <button 
              onClick={() => setReportSubTab('kpi_dashboard')}
              className={`pb-2 px-4 text-xs font-extrabold tracking-tight border-b-2 uppercase transition ${
                reportSubTab === 'kpi_dashboard' ? 'border-emerald-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📊 Performance Dashboard
            </button>
            <button 
              onClick={() => setReportSubTab('sales_reports')}
              className={`pb-2 px-4 text-xs font-extrabold tracking-tight border-b-2 uppercase transition ${
                reportSubTab === 'sales_reports' ? 'border-amber-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              💰 Ground Sales Reports
            </button>
            <button 
              onClick={() => setReportSubTab('lead_conversion')}
              className={`pb-2 px-4 text-xs font-extrabold tracking-tight border-b-2 uppercase transition ${
                reportSubTab === 'lead_conversion' ? 'border-indigo-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📈 Lead Conversion Reports
            </button>
            <button 
              onClick={() => setReportSubTab('activity_reports')}
              className={`pb-2 px-4 text-xs font-extrabold tracking-tight border-b-2 uppercase transition ${
                reportSubTab === 'activity_reports' ? 'border-rose-500 text-slate-900' : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              📝 Field Activity Reports
            </button>
          </div>

          {/* Subtab content: 1. KPI Dashboard Component */}
          {reportSubTab === 'kpi_dashboard' && (
            <div className="space-y-4">
              
              {/* Stat card summaries */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Efficacy Index Score</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-900">94.2%</span>
                    <span className="text-[9px] text-emerald-600 font-bold flex items-center">▲ 1.4% MoM</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-full w-[94.2%]"></div>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Active Headcount Status</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-900">{fieldStaff.length} Reps</span>
                    <span className="text-[9px] text-indigo-600 font-bold">{fieldStaff.filter(s=>s.status !== 'Offline').length} Live</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-2">100% Mobile telemetry signal sync</span>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">SLA Visit Compliance</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-slate-900">{completionRate}%</span>
                    <span className="text-[9px] text-emerald-600 font-bold">{completedCount} / {totalVisits} Completed</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1 rounded-full mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${completionRate}%` }}></div>
                  </div>
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block mb-1">Closed Ground Revenue</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-black text-emerald-600">₹{totalRevenue.toLocaleString()}</span>
                    <span className="text-[9px] bg-emerald-50 text-emerald-700 px-1 py-0.2 rounded font-bold">Closed Deals</span>
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-2">Piped directly via offline closed orders reports</span>
                </div>
              </div>

              {/* Graphic charts grid & Leaderboard */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                
                {/* Custom Responsive SVG Chart: Scheduled vs Completed Visits */}
                <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-205 space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Ground Visit Completion Analysis</h4>
                    <p className="text-[10px] text-slate-400">Total planned visits vs verified completed service orders per individual staff representative</p>
                  </div>

                  {/* SVG Chart */}
                  <div className="relative pt-4">
                    <svg className="w-full h-44 border-b border-slate-200" viewBox="0 0 500 160">
                      {/* Grid Lines */}
                      <line x1="0" y1="40" x2="500" y2="40" stroke="#f1f5f9" strokeDasharray="3 3"/>
                      <line x1="0" y1="80" x2="500" y2="80" stroke="#f1f5f9" strokeDasharray="3 3"/>
                      <line x1="0" y1="120" x2="500" y2="120" stroke="#f1f5f9" strokeDasharray="3 3"/>
                      
                      {/* Ketan Patel */}
                      <rect x="50" y="30" width="24" height="130" fill="#e2e8f0" rx="3" />
                      <rect x="50" y="56" width="24" height="104" fill="#10b981" rx="3" />
                      <text x="62" y="150" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">4</text>
                      
                      {/* Meera Nair */}
                      <rect x="170" y="50" width="24" height="110" fill="#e2e8f0" rx="3" />
                      <rect x="170" y="72" width="24" height="88" fill="#10b981" rx="3" />
                      <text x="182" y="150" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">2</text>
                      
                      {/* Sandeep Roy */}
                      <rect x="290" y="70" width="24" height="90" fill="#e2e8f0" rx="3" />
                      <rect x="290" y="112" width="24" height="48" fill="#10b981" rx="3" />
                      <text x="302" y="150" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">1</text>

                      {/* Total Averages / Target lines */}
                      <rect x="410" y="20" width="24" height="140" fill="#e2e8f0" rx="3" />
                      <rect x="410" y="48" width="24" height="112" fill="#6366f1" rx="3" />
                      <text x="422" y="150" fill="#ffffff" fontSize="9" fontWeight="bold" textAnchor="middle">7</text>
                    </svg>

                    <div className="flex justify-between text-[10px] text-slate-400 pt-2 font-mono">
                      <span className="w-1/4 text-center">Ketan (Noida Base)</span>
                      <span className="w-1/4 text-center">Meera (Mumbai Core)</span>
                      <span className="w-1/4 text-center">Sandeep (Apex Field)</span>
                      <span className="w-1/4 text-center">Collective Team Sum</span>
                    </div>

                    <div className="flex gap-4 justify-center items-center text-[10px] text-slate-500 pt-3">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-200 rounded"></span> Total Assigned Target</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-emerald-500 rounded"></span> Verified Completed Visits</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-indigo-500 rounded"></span> Enterprise Closed SLA</span>
                    </div>
                  </div>
                </div>

                {/* Team Representative Efficacy Leaderboard */}
                <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-205 space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase">Field Agent Efficacy Leaderboard</h4>
                    <p className="text-[10px] text-slate-400">Scorecard indexed by SLA on-route accuracy, on-time visits, customer rating</p>
                  </div>

                  <div className="space-y-2.5">
                    {fieldStaff.map((r, idx) => {
                      const ratingAvg = idx === 0 ? 4.9 : idx === 1 ? 4.8 : 4.4;
                      const taskComps = visits.filter(v => v.assignedStaffId === r.id && v.status === 'Completed').length;
                      return (
                        <div key={r.id} className="flex items-center justify-between p-2 rounded-lg border border-slate-100 hover:bg-slate-50/50">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-[10px] font-black text-slate-400 w-4">#{idx+1}</span>
                            <img src={r.avatar} className="w-8 h-8 rounded-full border border-slate-200" referrerPolicy="no-referrer" />
                            <div className="truncate">
                              <span className="font-extrabold text-slate-800 text-xs block">{r.name}</span>
                              <span className="text-[9px] text-slate-400 block font-mono">{r.id} • SLA Tier 1</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-xs font-black text-slate-900 block">{(96 - idx * 5.2).toFixed(1)}% Score</span>
                            <div className="flex items-center justify-end gap-1 text-[9px] text-amber-500 font-bold mt-0.5">
                              <Star className="w-3 h-3 fill-amber-500" />
                              {ratingAvg} ({taskComps} Verified)
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab content: 2. Ground Sales Reports */}
          {reportSubTab === 'sales_reports' && (
            <div className="space-y-4">
              
              <div className="bg-white p-4 rounded-xl border border-slate-205 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">Ground Sales Contract Logging</h4>
                  <p className="text-[10.5px] text-slate-400">Track and trace sales revenue generation closed physically by agents in the field</p>
                </div>
                <button
                  onClick={() => setIsSalesModalOpen(true)}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
                >
                  <DollarSign className="w-3.5 h-3.5" /> Book Field Contract Sale
                </button>
              </div>

              {/* Table of Ground Sales Contracts */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-black text-[9px] uppercase tracking-wide border-b border-slate-205">
                    <tr>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Assigned Sales Closer</th>
                      <th className="px-4 py-3">Client Company</th>
                      <th className="px-4 py-3">Pipeline Value</th>
                      <th className="px-4 py-3">Sales Potential Category</th>
                      <th className="px-4 py-3">Status Gate</th>
                      <th className="px-4 py-3">Satisfaction Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {visits.map((vis) => (
                      <tr key={vis.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 font-mono text-slate-900 font-bold">{vis.id}</td>
                        <td className="px-4 py-3 flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[9px]">
                            {vis.assignedStaffName.slice(0, 2).toUpperCase()}
                          </div>
                          <span>{vis.assignedStaffName}</span>
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800">{vis.companyName}</td>
                        <td className="px-4 py-3 text-emerald-600 font-bold">
                          {vis.salesAmtClosed ? `₹${vis.salesAmtClosed.toLocaleString()}` : <span className="text-slate-400">₹0 (Tech Only)</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                            vis.salesPotential === 'High' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' :
                            vis.salesPotential === 'Medium' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 'bg-slate-50 text-slate-500'
                          }`}>
                            {vis.salesPotential}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[9.5px] rounded border border-emerald-200">
                            Won & Invoiced
                          </span>
                        </td>
                        <td className="px-4 py-3 text-amber-500 font-bold font-mono">
                          {vis.feedbackRating ? `⭐️ ${vis.feedbackRating}.0` : 'No rating yet'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Subtab content: 3. Lead Conversion Reports */}
          {reportSubTab === 'lead_conversion' && (
            <div className="space-y-4">
              
              {/* Converison Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Core Conversion Velocity</span>
                  <div className="text-xl font-black text-slate-800">3.4 Days Avg</div>
                  <p className="text-[9.5px] text-slate-400">Average days from ground walk assignment to invoicing receipt</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Close Success Ratio</span>
                  <div className="text-xl font-black text-slate-800">83.5% Success</div>
                  <p className="text-[9.5px] text-slate-400">Total conversion velocity based on 12 physical leads assigned</p>
                </div>
                <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block">Total Closed Deal Flow</span>
                  <div className="text-xl font-black text-emerald-600">₹{totalRevenue.toLocaleString()} INR</div>
                  <p className="text-[9.5px] text-slate-400">Aggregated ground ledger sales value pipeline</p>
                </div>
              </div>

              {/* Graphic Leads pipeline illustration */}
              <div className="bg-white p-5 rounded-xl border border-slate-205 space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase">SLA Ground Lead Pipeline Stages</h4>
                  <p className="text-[10px] text-slate-400">Conversion funnel based on on-field representative visits & tech demos</p>
                </div>

                <div className="space-y-3 pt-3">
                  {/* Stage 1 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>1. Assigned Physical Leads (100% Volume)</span>
                      <span>12 General Accounts</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-500 h-full w-full"></div>
                    </div>
                  </div>

                  {/* Stage 2 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>2. Physical Technical Demo Completed (75% Conversion)</span>
                      <span>9 Diagnostic Audits Completed</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-indigo-400 h-full w-[75%]"></div>
                    </div>
                  </div>

                  {/* Stage 3 */}
                  <div>
                    <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                      <span>3. Contract Won & Invoiced (58% Total Pipeline Converted)</span>
                      <span>7 Accounts Won in Core CRM</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full w-[58%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subtab content: 4. Field Activity Reports */}
          {reportSubTab === 'activity_reports' && (
            <div className="space-y-3.5">
              
              {/* Operations row: Export controls & Agent filters */}
              <div className="bg-white p-3.5 rounded-xl border border-slate-205 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="text"
                      className="text-xs p-1.5 pl-8 border border-slate-200 bg-slate-50 focus:bg-white rounded"
                      placeholder="Search reports..."
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                    />
                  </div>

                  <select
                    className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded"
                    value={activityFilterStaff}
                    onChange={(e) => setActivityFilterStaff(e.target.value)}
                  >
                    <option value="All">All Representatives</option>
                    {fieldStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>

                {/* Print/Download triggers */}
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleCSVExport}
                    className="px-2.5 py-1.5 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Export CSV Log
                  </button>
                  <button 
                    onClick={handlePrintMockup}
                    className="px-2.5 py-1.5 text-xs font-bold border border-slate-250 hover:bg-slate-50 text-slate-700 rounded flex items-center gap-1.5 transition"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print Diagnostics Sheet
                  </button>
                </div>
              </div>

              {/* Spreadheet logs list */}
              <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-500 font-extrabold text-[8.5px] uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-2.5">Audit Stamp ID</th>
                      <th className="px-4 py-2.5">Agent Representative</th>
                      <th className="px-4 py-2.5">Activity/Status Type</th>
                      <th className="px-4 py-2.5">Timestamp</th>
                      <th className="px-4 py-2.5">Terminal Landmark Location</th>
                      <th className="px-4 py-2.5 text-right">GPS Geofence Status</th>
                      <th className="px-4 py-2.5">Reporter Work Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {filteredCheckIns.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-10 bg-slate-50 text-slate-400 italic">No activity reports match this search criteria.</td>
                      </tr>
                    ) : (
                      filteredCheckIns.map(log => (
                        <tr key={log.id} className="hover:bg-slate-50/50 text-[11px]">
                          <td className="px-4 py-3 font-mono text-slate-900 font-bold">{log.id}</td>
                          <td className="px-4 py-3 font-bold">{log.staffName}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 text-[10px] rounded font-bold ${
                              log.checkType === 'Check-In' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                            }`}>
                              {log.checkType}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-500">{log.timestamp}</td>
                          <td className="px-4 py-3 text-slate-700">
                            <strong>{log.locationName}</strong>
                            <p className="text-[9.5px] text-slate-400 font-mono leading-none mt-0.5">{log.coordinates}</p>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <span className={`text-[9px] font-black uppercase inline-block px-1.5 py-0.2 rounded ${
                              log.geofenceStatus === 'Within Geofence Hub' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' :
                              log.geofenceStatus === 'Deviated Remote' ? 'bg-red-50 text-red-700 border border-red-150 animate-pulse' : 'bg-slate-50 text-slate-700'
                            }`}>
                              {log.geofenceStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-600 max-w-xs">{log.notes}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===================== SUBPANEL 2: GPS COCKPIT & LIVE MAP ===================== */}
      {activePanel === 'gps' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Left panel: Active Tracking List */}
          <div className="lg:col-span-4 bg-white p-4 rounded-xl border border-slate-200 space-y-4 flex flex-col justify-between h-[520px]">
            <div className="space-y-3.5">
              <div>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Fleet Telemetry</h3>
                <p className="text-[10px] text-slate-400">Click to focus GPS navigation trail</p>
              </div>

              {/* Feed lists */}
              <div className="space-y-2 overflow-y-auto max-h-[380px] pr-1">
                {fieldStaff.map(s => {
                  const sConfig = EMPLOYEE_GPS_CONFIG[s.id] || EMPLOYEE_GPS_CONFIG["STF-01"];
                  return (
                    <div 
                      key={s.id}
                      onClick={() => setSelectedStaffId(s.id)}
                      className={`p-3 rounded-lg border text-left cursor-pointer transition ${
                        selectedStaffId === s.id ? 'bg-slate-900 text-white border-slate-900 shadow-sm' : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <img src={s.avatar} className="w-8 h-8 rounded-full border border-slate-350" referrerPolicy="no-referrer" />
                          <div>
                            <span className="font-extrabold text-xs block">{s.name}</span>
                            <span className={`text-[9px] font-bold ${selectedStaffId === s.id ? 'text-slate-300' : 'text-slate-400'}`}>
                              🔋 {s.battery}% Battery &bull; speed {sConfig.vehicleSpeed}
                            </span>
                          </div>
                        </div>

                        <span className={`text-[8.5px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                          s.status === 'On Site' ? 'bg-emerald-500 text-slate-900' :
                          s.status === 'On Route' ? 'bg-amber-400 text-slate-900' :
                          s.status === 'Active' ? 'bg-blue-500 text-white' : 'bg-slate-150 text-slate-700'
                        }`}>
                          {s.status}
                        </span>
                      </div>

                      <div className={`mt-2 border-t pt-1.5 flex justify-between items-center text-[9px] ${
                        selectedStaffId === s.id ? 'border-white/10 text-slate-300' : 'border-slate-100 text-slate-450'
                      }`}>
                        <span>State: <strong>{sConfig.movementStatus}</strong></span>
                        <span>SLA Adherence: <strong className={sConfig.routeAdherence === 'Optimal' ? 'text-emerald-500' : 'text-amber-500'}>{sConfig.routeAdherence}</strong></span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded text-[10px] text-slate-500 flex justify-between items-center">
              <span>Telemetry Ping Rate: every 4.0s</span>
              <span className="font-bold text-emerald-600">● LIVE CONNECTION</span>
            </div>
          </div>

          {/* Right panel: Modern Glowing Map Coordinate Grid & Path Overlay */}
          <div className="lg:col-span-8 bg-[#0b1329] p-4 rounded-xl border border-slate-800 relative h-[520px] shadow-xl overflow-hidden flex flex-col justify-between">
            
            {/* Grid background & vectors */}
            <div className="absolute inset-0 opacity-15 bg-[linear-gradient(to_right,#10b981_1px,transparent_1px),linear-gradient(to_bottom,#3b82f6_1px,transparent_1px)] bg-[size:28px_28px]"></div>
            
            {/* Roads */}
            <svg className="absolute inset-0 w-full h-full stroke-blue-500/10 fill-none stroke-1" xmlns="http://www.w3.org/2000/svg">
              <line x1="50" y1="0" x2="300" y2="520" />
              <line x1="0" y1="180" x2="900" y2="180" strokeWidth="2" strokeDasharray="5 5" />
              <line x1="0" y1="360" x2="900" y2="360" />
              <line x1="480" y1="0" x2="480" y2="520" strokeWidth="2" />
              <circle cx="480" cy="180" r="110" strokeDasharray="3 3" />
              <circle cx="480" cy="180" r="180" />
            </svg>

            {/* Radar Sweep animation */}
            <div className="absolute top-1/2 left-1/2 w-96 h-96 -mt-48 -ml-48 rounded-full border border-emerald-500/10 animate-ping pointer-events-none"></div>

            {/* Top operational bar info */}
            <div className="relative flex justify-between items-start z-10">
              <span className="text-[10px] uppercase font-black text-[#10b981] bg-slate-900/90 px-2.5 py-1 rounded border border-slate-800 flex items-center gap-1.5 shadow-xl">
                <Crosshair className="w-3.5 h-3.5 animate-spin" /> Live Handset GPS Terminal ACTIVE
              </span>
              <span className="text-[9px] font-mono font-bold text-slate-400 bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                Lat: 28.6° N | Lng: 77.3° E (NCR Georadar Axis)
              </span>
            </div>

            {/* Simulated Live Route Path Display on selection */}
            <svg className="absolute inset-0 w-full h-full fill-none pointer-events-none z-10" xmlns="http://www.w3.org/2000/svg">
              {/* Route lines */}
              {selectedStaffId === 'STF-01' && (
                <path d="M 120 120 L 250 250 L 320 380" stroke="#10b981" strokeWidth="3" strokeDasharray="6 4" strokeLinecap="round" className="animate-pulse" />
              )}
              {selectedStaffId === 'STF-02' && (
                <path d="M 450 180 L 120 400" stroke="#f59e0b" strokeWidth="3" strokeDasharray="6 4" className="animate-pulse" />
              )}
              {selectedStaffId === 'STF-03' && (
                <path d="M 50 420 L 300 120 L 480 320" stroke="#ef4444" strokeWidth="3" strokeDasharray="4 2" strokeLinecap="round" className="animate-pulse" />
              )}
            </svg>

            {/* Active Beacons */}
            {fieldStaff.map(s => {
              const isActive = s.id === selectedStaffId;
              return (
                <div 
                  key={s.id}
                  onClick={() => setSelectedStaffId(s.id)}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group"
                  style={{ 
                    left: `${s.latitudePercentage}%`, 
                    top: `${s.longitudePercentage}%` 
                  }}
                >
                  {/* Beacon rings outline in real time */}
                  <div className={`absolute -inset-4 rounded-full opacity-40 animate-ping ${
                    s.status === 'On Site' ? 'bg-emerald-500' :
                    s.status === 'On Route' ? 'bg-amber-400' : 'bg-blue-500'
                  }`}></div>
                  
                  <div className={`p-2 rounded-full border shadow-xl ${
                    isActive 
                      ? 'scale-125 bg-emerald-500 border-white text-slate-900 z-30 ring-4 ring-emerald-500/30' 
                      : 'bg-slate-950 border-blue-500/80 text-blue-400 hover:scale-110'
                  } transition-all duration-300`}>
                    <MapPin className="w-4 h-4" />
                  </div>

                  {/* Representative Label above node */}
                  <span className="absolute left-7 top-0 bg-slate-950/95 text-[9px] font-black text-slate-200 px-2 py-1 rounded border border-slate-800 shadow-xl truncate max-w-[120px] select-none block">
                    {s.name} ({s.status})
                  </span>
                </div>
              );
            })}

            {/* Bottom Floating Telemetry Panel */}
            <div className="relative z-10 bg-slate-950/85 p-4 rounded-xl border border-slate-800 space-y-3 shadow-xl">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono">Isolated Telemetry Node: {activeStaff?.name}</span>
                  <div className="text-sm font-black text-white mt-0.5 flex items-center gap-2">
                    <span>{config.routeTitle}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                      config.routeAdherence === 'Optimal' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
                    }`}>
                      {config.routeAdherence} Path Adherence
                    </span>
                  </div>
                </div>

                <div className="text-right flex sm:flex-col items-center sm:items-end justify-between font-mono w-full sm:w-auto text-[11px] text-slate-300 border-t sm:border-t-0 border-slate-800/60 pt-2 sm:pt-0">
                  <span>Remaining: <strong>{config.distanceLeft}</strong></span>
                  <span>Duration: <strong className="text-emerald-400">{config.durationLeft}</strong></span>
                </div>
              </div>

              {/* Breadcrumbs historical location route monitoring details */}
              <div className="border-t border-slate-850 pt-2.5 space-y-2">
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">Today Chronological Trail & Breadcrumb History (Location Trajectory History)</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {config.breadcrumbs.map((crumb, idx) => (
                    <div key={idx} className="bg-slate-900/60 p-2 rounded border border-slate-800/80 hover:bg-slate-900/90 transition text-left">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono">
                        <span className="font-bold text-slate-300">{crumb.time}</span>
                        <span className="text-[9px] px-1 py-0.2 bg-slate-800 text-indigo-300 rounded font-bold uppercase">{crumb.status}</span>
                      </div>
                      <p className="text-[11.5px] font-semibold text-slate-200 mt-1 truncate" title={crumb.label}>{crumb.label}</p>
                      <p className="text-[9.5px] text-slate-500 font-mono mt-0.5">Coords: {crumb.lat}, {crumb.lng}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================== SUBPANEL 3: CHECK-IN TERM & ATTENDANCE ===================== */}
      {activePanel === 'attendance' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Interactive Check-in/Check-out Terminal Form logger */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Employee Check-In Terminal</h3>
              <p className="text-[10.5px] text-slate-400">Simulate on-ground handset GPS check processes with verified geofencing boundaries</p>
            </div>

            <form onSubmit={handlePerformCheckInOut} className="space-y-4 text-xs font-medium text-slate-600">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Select Field Representative</label>
                <select
                  value={formStaffId}
                  onChange={(e) => setFormStaffId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded p-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  {fieldStaff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Shift Logging Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormCheckType('Check-In')}
                    className={`py-2 px-3 border rounded text-xs font-bold transition ${
                      formCheckType === 'Check-In' ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xxs' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    🚀 Shift Check-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormCheckType('Check-Out')}
                    className={`py-2 px-3 border rounded text-xs font-bold transition ${
                      formCheckType === 'Check-Out' ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-xxs' : 'bg-slate-50 border-slate-200 text-slate-500'
                    }`}
                  >
                    🚪 Shift Check-Out
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">GPS Geofence Location Landmark</label>
                <select
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-205 rounded p-2 text-xs focus:outline-none"
                >
                  <option value="Noida Sector 62 Warehouse HQ Core">Noida Sector 62 Warehouse HQ Core (Geofenced)</option>
                  <option value="Mumbai Kalamboli Yard Axis Terminal">Mumbai Kalamboli Yard Axis Terminal (Geofenced)</option>
                  <option value="Noida Sector 18 Dispatch Base Central">Noida Sector 18 Dispatch Base Central (Geofenced)</option>
                  <option value="Apex Retail NCR Block Remote Client">Apex Retail NCR Block Remote Client (Aligned / Verified)</option>
                  <option value="Outer Bypass highway construction site (Deviated)">Outer Bypass highway construction site (Deviated)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 tracking-wider mb-1">Representative Log Notes</label>
                <textarea
                  className="w-full border border-slate-205 bg-slate-50 rounded p-2 h-16 text-xs focus:outline-none"
                  placeholder="e.g. Setting up active trunk networks, daily truck dispatcher schedule started..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                />
              </div>

              {/* Handset verification checks checkboxes simulation */}
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 space-y-1.5 text-[11px] text-slate-500">
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="gps_strength" 
                    checked 
                    readOnly
                    className="accent-emerald-600 cursor-not-allowed" 
                  />
                  <label htmlFor="gps_strength" className="font-bold select-none text-slate-700">Verified High Density Handset GPS Signal (Excellent)</label>
                </div>
                <div className="flex items-center gap-2">
                  <input 
                    type="checkbox" 
                    id="photo_attachment" 
                    checked={formPhoto} 
                    onChange={(e) => setFormPhoto(e.target.checked)}
                    className="accent-emerald-600 cursor-pointer" 
                  />
                  <label htmlFor="photo_attachment" className="font-bold select-none text-slate-700">Attach Simulated ID Snapshot Photo Verification</label>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-extrabold shadow-sm flex items-center justify-center gap-2 transition"
              >
                <MapPinCheck className="w-4 h-4" /> Save Shift Logging Dispatch
              </button>
            </form>
          </div>

          {/* Right panel: Geofence compliance metrics chart statistics and Logs history list */}
          <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-slate-200 space-y-5">
            
            {/* GPS Attendance verification KPI blocks */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-indigo-50 p-3 rounded-lg border border-indigo-100 flex items-center gap-3">
                <div className="p-2 bg-indigo-500 text-white rounded-lg">
                  <CheckCircle className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-indigo-700 font-bold block leading-none uppercase">Cumulative Efficacy</span>
                  <span className="text-base font-black text-slate-900 mt-1 inline-block">95.4%</span>
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100 flex items-center gap-3">
                <div className="p-2 bg-emerald-500 text-white rounded-lg">
                  <ThumbsUp className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 font-bold block leading-none uppercase">Geofence Compliance</span>
                  <span className="text-base font-black text-slate-900 mt-1 inline-block">100% Status</span>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-lg border border-amber-100 flex items-center gap-3">
                <div className="p-2 bg-amber-500 text-white rounded-lg">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-amber-700 font-bold block leading-none uppercase">On-time checks</span>
                  <span className="text-base font-black text-slate-900 mt-1 inline-block">100% Registry</span>
                </div>
              </div>
            </div>

            {/* Attendance Logs History timeline */}
            <div className="space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase">GPS Geofenced Daily Attendance Feed Logs</h4>
                <p className="text-[10px] text-slate-400">Chronological list of agent shift checking timestamps cross-verified by GPS and Noida/Mumbai Geofences</p>
              </div>

              <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                {checkIns.map((log) => {
                  const isWithinGeofence = log.geofenceStatus === 'Within Geofence Hub';
                  return (
                    <div key={log.id} className="p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition flex items-start justify-between gap-3 text-xs leading-relaxed">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800">{log.staffName}</span>
                          <span className={`px-1.5 py-0.2 rounded font-mono text-[9px] font-bold uppercase leading-none ${
                            log.checkType === 'Check-In' ? 'bg-emerald-50 text-emerald-700 border border-emerald-150' : 'bg-rose-50 text-rose-700 border border-rose-150'
                          }`}>
                            {log.checkType}
                          </span>
                          <span className="text-slate-400 font-mono text-[10px]">{log.timestamp}</span>
                        </div>
                        <p className="text-slate-600 font-semibold">{log.notes}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Location: {log.locationName} &bull; Coordinates: {log.coordinates}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border block ${
                          isWithinGeofence ? 'bg-emerald-50 text-emerald-800 border-emerald-250' : 'bg-amber-50 text-amber-800 border-amber-250'
                        }`}>
                          {log.geofenceStatus}
                        </span>
                        
                        {log.hasPhotoSim && (
                          <span className="text-[9px] text-emerald-600 font-bold block mt-1">📸 ID Verified</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================== SUBPANEL 4: VISIT SCHEDULES & CLIENT INSIGHTS ===================== */}
      {activePanel === 'visits' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          
          {/* Visit Schedule Calendar List (Left Column) */}
          <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-205 space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Customer Visit Tracking Schedule</h3>
              <p className="text-[10px] text-slate-400">Verified schedules assigned for on-site operations client onboarding & hardware gateway installations</p>
            </div>

            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {visits.map((v) => (
                <div key={v.id} className="p-3 rounded-xl border border-slate-150 hover:bg-slate-50/40 transition text-xs leading-relaxed space-y-2 text-left">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[8.5px] text-slate-400 font-mono font-bold uppercase tracking-widest block">{v.id} &bull; Target Time: {v.scheduledTime}</span>
                      <h4 className="font-extrabold text-slate-800 text-sm mt-0.5">{v.companyName}</h4>
                      <p className="text-[10px] text-slate-400 font-medium">Recipient Client: <strong>{v.customerName}</strong></p>
                    </div>

                    <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${
                      v.status === 'Completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-150' :
                      v.status === 'Checked-In' ? 'bg-indigo-50 text-indigo-800 border-indigo-150' : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}>
                      {v.status}
                    </span>
                  </div>

                  <p className="text-slate-600 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">💻 Mission: {v.purpose}</p>

                  <div className="flex items-center justify-between text-[11px] border-t border-slate-100 pt-2 text-slate-500">
                    <span>Field Rep: <strong>{v.assignedStaffName}</strong></span>
                    
                    {v.status !== 'Completed' ? (
                      <button
                        onClick={() => {
                          const feedback = prompt("Kindly enter client visit feedback remarks:");
                          if (feedback !== null) {
                            handleCompleteVisit(v.id, 5, feedback);
                          }
                        }}
                        className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-black flex items-center gap-1 transition"
                      >
                        <CheckCircle2 className="w-3 h-3" /> Execute Completed
                      </button>
                    ) : (
                      <span className="text-emerald-600 text-[10px] font-black">✓ Complete & Sync</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Insights & Post-visit Satisfaction Ledger (Right Column) */}
          <div className="lg:col-span-6 bg-white p-5 rounded-xl border border-slate-205 space-y-4">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Direct Customer Insights</h3>
              <p className="text-[10px] text-slate-400">Post-visit ratings, customer satisfaction feedback, conversion velocity, sales opportunities tracked by staff</p>
            </div>

            <div className="space-y-3.5 max-h-[420px] overflow-y-auto pr-1">
              {visits.filter(v=>v.status === 'Completed').map((vi) => (
                <div key={vi.id} className="p-3.5 rounded-xl border border-dotted border-slate-250 space-y-2.5 text-xs text-left">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">{vi.companyName}</span>
                      <span className="text-[9.5px] text-slate-400">Field Reporter: {vi.assignedStaffName}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span className="text-[11px] font-mono font-black text-amber-800">{vi.feedbackRating}.0 Metric</span>
                    </div>
                  </div>

                  <div className="bg-emerald-50/55 p-3 rounded-lg border border-emerald-150/60 font-sans leading-relaxed text-slate-800">
                    {vi.feedbackNotes ? `"${vi.feedbackNotes}"` : '"Diagnostics run finalized. Trunk SIP servers online without alerts."'}
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                    <span className="flex items-center gap-1">Sales Closed: <strong className="text-emerald-600">₹{vi.salesAmtClosed?.toLocaleString() || '₹0'}</strong></span>
                    <span className="flex items-center gap-1">SLA Conversion Potential: <strong className="text-indigo-600 tracking-tight uppercase">{vi.salesPotential}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* ===================== SUBPANEL 5: OPERATIONS COMMAND CENTRE ===================== */}
      {activePanel === 'operations' && (
        <div className="space-y-4">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Real-time Ticker Audit Activities Feed Feed logs */}
            <div className="lg:col-span-7 bg-[#0b1329] p-5 rounded-xl border border-slate-800 flex flex-col justify-between h-[450px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div>
                    <h3 className="text-xs font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400 animate-pulse" /> Live Telemetry Event Flow Ticker
                    </h3>
                    <p className="text-[10px] text-slate-400">Subseconds tracking of checks, alerts, low batteries, travel deviation reports</p>
                  </div>
                  <span className="text-[9px] bg-slate-900 border border-green-500/20 text-emerald-400 font-mono font-bold px-2 py-0.5 rounded">
                    SYS_FEED Status: ONLINE
                  </span>
                </div>

                <div className="space-y-2.5 overflow-y-auto max-h-[300px] text-xs font-mono text-slate-350 pr-1">
                  <div className="p-2 border-b border-slate-850/60 leading-normal flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0">[09:17:09 AM]</span>
                    <p className="text-slate-300">SYSTEM: Connected to Noida Base gateway server successfully with zero alarms.</p>
                  </div>
                  <div className="p-2 border-b border-slate-850/60 leading-normal flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0">[09:15:00 AM]</span>
                    <p className="text-slate-300"><strong className="text-slate-100">Meera Nair</strong> logged Check-In at Mumbai Kalamboli Yard Axis (Verified within Noida/Mumbai Geofence limits).</p>
                  </div>
                  <div className="p-2 border-b border-slate-850/60 leading-normal flex items-start gap-2">
                    <span className="text-red-400 shrink-0">[08:44:12 AM]</span>
                    <p className="text-slate-300">TELEMETRY WARNING: Sandeep Roy battery levels drop beneath <strong className="text-rose-400">18% threshold</strong>. Auto Low energy telemetry triggered on ground handset.</p>
                  </div>
                  <div className="p-2 border-b border-slate-850/60 leading-normal flex items-start gap-2">
                    <span className="text-emerald-400 shrink-0">[08:30:21 AM]</span>
                    <p className="text-slate-300"><strong className="text-slate-100">Ketan Patel</strong> logged Check-In at Noida Sector 62 Main Warehouse Core (Verified within Central Sector Geofences).</p>
                  </div>
                  <div className="p-2 border-b border-slate-850/60 leading-normal flex items-start gap-2">
                    <span className="text-[#3b82f6] shrink-0 font-bold">[Yesterday]</span>
                    <p className="text-slate-400">DATA SYNC: Aggregated and processed total ledger contract values ₹7,30,000 across CRM Noida & Mumbai yards.</p>
                  </div>
                </div>
              </div>

              <div className="text-[10px] text-slate-500 font-mono flex items-center justify-between border-t border-slate-850 pt-3">
                <span>Auto-purge logs queue set after 24 hours.</span>
                <span>Telemetry stream sequence index #TC-4009</span>
              </div>
            </div>

            {/* Preserved Task Dispatcher Commander (Right Column) */}
            <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-205 flex flex-col justify-between h-[450px]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Active Dispatcher Command Desk</h3>
                  <p className="text-[10.5px] text-slate-400">Dispatch live tasks directly to field assets (updates synchronized instantly with parent component controllers)</p>
                </div>

                {activeStaff && (
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-150 leading-relaxed text-xs">
                    <div className="flex items-center gap-2">
                      <img src={activeStaff.avatar} className="w-8 h-8 rounded-full border border-slate-250" referrerPolicy="no-referrer" />
                      <div>
                        <span className="font-extrabold text-slate-800 block leading-tight">{activeStaff.name}</span>
                        <span className="text-[10px] font-mono text-slate-400">Targeting Device Signal: {activeStaff.phone}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-slate-500 font-semibold text-xs leading-relaxed space-y-3">
                    <div className="flex items-center gap-2 text-[11px] text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span>Parent dispatcher linked. All commands pipe live to handset.</span>
                    </div>
                    <p className="text-[11px] text-slate-450 leading-normal">
                      We have upgraded your Field & Staff Management Module to use the state-of-the-art Operational Cockpit! If you wish to send instant notifications, please leverage our specialized Sub-Panels above to adjust representative check status or sales contracts.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded text-[10px] text-slate-400 text-center font-mono">
                Preserving core props interfaces for zero integration failures
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ===================== DIALOG MODAL: Ground Sales Contract Simulation ===================== */}
      {isSalesModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-sm w-full p-5 space-y-4 shadow-2xl animate-in fade-in duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xs font-extrabold text-slate-900 uppercase">Book Field Contract Sale</h4>
                <p className="text-[10.5px] text-slate-400">Log a verified won deal concluded by ground representatives</p>
              </div>
              <button 
                onClick={() => setIsSalesModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-extrabold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleBookSale} className="space-y-3.5 text-xs text-slate-650 font-bold">
              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1">Assigned Ground Representative</label>
                <select
                  value={saleRepId}
                  onChange={(e) => setSaleRepId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded p-2 focus:outline-none"
                >
                  {fieldStaff.map(s => <option key={s.id} value={s.id}>{s.name} ({s.id})</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1">Client Company Name</label>
                <input 
                  type="text" required
                  placeholder="e.g. Hindustan Logistics Ltd"
                  className="w-full border p-2 bg-slate-50 font-medium text-xs focus:outline-none rounded"
                  value={saleCompany}
                  onChange={(e) => setSaleCompany(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1">Primary Decision-Maker Representative Name</label>
                <input 
                  type="text" required
                  placeholder="e.g. Suresh Sharma"
                  className="w-full border p-2 bg-slate-50 font-medium text-xs focus:outline-none rounded"
                  value={saleClientName}
                  onChange={(e) => setSaleClientName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1">Sale Contract Value (₹)</label>
                  <input 
                    type="number" required
                    placeholder="180000"
                    className="w-full border p-2 bg-slate-50 font-medium text-xs focus:outline-none rounded"
                    value={saleValue}
                    onChange={(e) => setSaleValue(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[9px] uppercase tracking-wider text-slate-400 mb-1">SLA Deal Potential Category</label>
                  <select
                    value={salePotential}
                    onChange={(e) => setSalePotential(e.target.value as any)}
                    className="w-full bg-slate-50 border p-2 text-xs focus:outline-none rounded"
                  >
                    <option value="High">High potential</option>
                    <option value="Medium">Medium potential</option>
                    <option value="Low">Low potential</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white rounded font-extrabold shadow"
              >
                ✓ Book Verified ground Sale Contract
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
