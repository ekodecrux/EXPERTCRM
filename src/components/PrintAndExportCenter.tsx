import React, { useState, useEffect } from 'react';
import { 
  X, Printer, Copy, Check, FileText, Download, Share2, Clipboard, Mail, ShieldAlert
} from 'lucide-react';
import { Lead, CallLog, SupportTicket, FieldStaff, Task, Employee, CommsLog } from '../types';

interface PrintAndExportCenterProps {
  isOpen: boolean;
  onClose: () => void;
  document: {
    title: string;
    type: 'invoice' | 'quotation' | 'payroll_slip' | 'lead_profile' | 'support_ticket' | 'call_log' | 'task_report' | 'field_assignment' | 'security_profile' | 'general';
    data: any;
  } | null;
  userEmail?: string;
}

export default function PrintAndExportCenter({ isOpen, onClose, document, userEmail = 'expertaidtech@gmail.com' }: PrintAndExportCenterProps) {
  const [copied, setCopied] = useState<'none' | 'rich' | 'plain'>('none');
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    if (copied !== 'none') {
      const t = setTimeout(() => setCopied('none'), 3000);
      return () => clearTimeout(t);
    }
  }, [copied]);

  useEffect(() => {
    if (downloaded) {
      const t = setTimeout(() => setDownloaded(false), 3000);
      return () => clearTimeout(t);
    }
  }, [downloaded]);

  if (!isOpen || !document) return null;

  const { title, type, data } = document;
  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const uniqueHash = `EXP-SECURE-${Math.random().toString(36).substring(2, 10).toUpperCase()}-${Date.now().toString().slice(-6)}`;

  // 1. GENERATE PLAIN TEXT (ASCII/MARKDOWN) FOR EASY COPYING
  const generatePlainText = (): string => {
    let text = `==================================================\n`;
    text += `   EXP CRM ENTERPRISE SYSTEM - OFFICIAL RECORD   \n`;
    text += `==================================================\n`;
    text += `Document Title: ${title.toUpperCase()}\n`;
    text += `Document Type:  ${type.replace('_', ' ').toUpperCase()}\n`;
    text += `Generated At:   ${timestamp} (IST)\n`;
    text += `System User:    ${userEmail}\n`;
    text += `Security Code:  ${uniqueHash}\n`;
    text += `==================================================\n\n`;

    switch (type) {
      case 'invoice': {
        const inv = data;
        text += `Invoice ID:     ${inv.id || 'N/A'}\n`;
        text += `Recipient:      ${inv.clientName || 'N/A'}\n`;
        text += `Company:        ${inv.companyName || 'N/A'}\n`;
        text += `--------------------------------------------------\n`;
        text += `Pipeline Item:  ${inv.itemName || 'N/A'}\n`;
        text += `Raw Subtotal:   INR ${inv.rawPrice?.toLocaleString('en-IN') || '0'}\n`;
        text += `Discount (-5%): INR ${inv.discountPrice?.toLocaleString('en-IN') || '0'}\n`;
        text += `GST Taxes (18%):INR ${inv.gstPrice?.toLocaleString('en-IN') || '0'}\n`;
        text += `--------------------------------------------------\n`;
        text += `NET TOTAL DUE:  INR ${inv.netPrice?.toLocaleString('en-IN') || '0'}\n`;
        text += `Status:         PAID & DISPATCHED\n`;
        break;
      }
      case 'quotation': {
        const q = data;
        text += `Quotation ID:   ${q.id || 'N/A'}\n`;
        text += `Client Target:  ${q.leadName || 'N/A'}\n`;
        text += `Description:    ${q.itemName || 'N/A'}\n`;
        text += `--------------------------------------------------\n`;
        text += `Subtotal Base:  INR ${q.rawPrice?.toLocaleString('en-IN') || '0'}\n`;
        text += `Discount App:   INR ${q.discountPrice?.toLocaleString('en-IN') || '0'}\n`;
        text += `Net Estimate:   INR ${q.netPrice?.toLocaleString('en-IN') || '0'}\n`;
        text += `Validity:       Valid representing 30 Days\n`;
        text += `--------------------------------------------------\n`;
        break;
      }
      case 'payroll_slip': {
        const emp = data as Employee;
        text += `Employee ID:    ${emp.id || 'N/A'}\n`;
        text += `Name:           ${emp.name || 'N/A'}\n`;
        text += `Role / Dept:    ${emp.role || 'N/A'} - ${emp.department || 'N/A'}\n`;
        text += `Attendance Rt:  ${emp.attendance || 'N/A'}\n`;
        text += `--------------------------------------------------\n`;
        text += `Basic Salary:   INR ${emp.salary?.toLocaleString('en-IN') || '0'}\n`;
        text += `Allowances (+):  INR ${emp.allowance?.toLocaleString('en-IN') || '0'}\n`;
        text += `Deductions (-):  INR ${emp.deduction?.toLocaleString('en-IN') || '0'}\n`;
        text += `--------------------------------------------------\n`;
        text += `NET DISBURSED:  INR ${emp.netPay?.toLocaleString('en-IN') || '0'}\n`;
        text += `Payout Status:  ${emp.paidStatus.toUpperCase()} (NACH Electronic Transfer)\n`;
        break;
      }
      case 'lead_profile': {
        const lead = data as Lead;
        text += `Lead ID:        ${lead.id || 'N/A'}\n`;
        text += `Name:           ${lead.name || 'N/A'}\n`;
        text += `Company:        ${lead.company || 'N/A'}\n`;
        text += `Email:          ${lead.email || 'N/A'}\n`;
        text += `Phone:          ${lead.phone || 'N/A'}\n`;
        text += `Traffic Source: ${lead.source || 'N/A'}\n`;
        text += `Roster Status:  ${lead.status || 'N/A'}\n`;
        text += `Contract Value: INR ${lead.value?.toLocaleString('en-IN') || '0'}\n`;
        text += `Added Date:     ${lead.dateAdded || 'N/A'}\n`;
        if (lead.notes) {
          text += `Interaction Log:\n"${lead.notes}"\n`;
        }
        if (lead.aiInsight) {
          text += `--------------------------------------------------\n`;
          text += `AI Insights Summary:\n`;
          text += `- Close Probability: ${lead.aiInsight.closeProbability}%\n`;
          text += `- Sentiment Rating:  ${lead.aiInsight.sentiment}\n`;
          text += `- Pitch Angle:       ${lead.aiInsight.pitch}\n`;
          text += `- Recommended Action:${lead.aiInsight.recommendedAction}\n`;
        }
        break;
      }
      case 'support_ticket': {
        const ticket = data as SupportTicket;
        text += `Ticket ID:      ${ticket.id || 'N/A'}\n`;
        text += `Subject:        ${ticket.subject || 'N/A'}\n`;
        text += `Customer Name:  ${ticket.clientName || 'N/A'}\n`;
        text += `Department:     ${ticket.category || 'N/A'}\n`;
        text += `Current Stage:  ${ticket.status || 'N/A'}\n`;
        text += `Priority Rank:  ${ticket.priority || 'N/A'}\n`;
        text += `Date Logged:    ${ticket.createdTime || 'N/A'}\n`;
        text += `--------------------------------------------------\n`;
        text += `DESCRIPTION BRIEF:\n${ticket.description || 'N/A'}\n`;
        if (ticket.aiResponseDraft) {
          text += `--------------------------------------------------\n`;
          text += `AI ACTION INTEGRITY RESPONSE:\n${ticket.aiResponseDraft}\n`;
        }
        break;
      }
      case 'call_log': {
        const call = data as CallLog;
        text += `Telephony Code: ${call.id || 'N/A'}\n`;
        text += `Client Contact: ${call.clientName || 'N/A'} (${call.clientPhone || 'N/A'})\n`;
        text += `Logged Agent:   ${call.agentName || 'N/A'}\n`;
        text += `Call Duration:  ${call.duration || 'N/A'}\n`;
        text += `Outcome Type:   ${call.type || 'N/A'}\n`;
        text += `Timestamp:      ${call.time || 'N/A'}\n`;
        text += `--------------------------------------------------\n`;
        text += `CALL MEMO LOG:\n"${call.notes || 'No call summary provided.'}"\n`;
        break;
      }
      case 'task_report': {
        const task = data as Task;
        text += `Task reference: ${task.id || 'N/A'}\n`;
        text += `Title:          ${task.title || 'N/A'}\n`;
        text += `Target Client:  ${task.clientName || 'N/A'}\n`;
        text += `Task Type:      ${task.type || 'Task'}\n`;
        text += `Priority:       ${task.priority || 'Medium'}\n`;
        text += `Roster Handler: ${task.assignedTo || 'Unassigned'}\n`;
        text += `Alert Time:     ${task.time || 'N/A'}\n`;
        text += `Workflow Stage: ${task.status || 'Pending'}\n`;
        text += `--------------------------------------------------\n`;
        text += `Detailed Description:\n${task.description || 'N/A'}\n`;
        if (task.meetingDetails) {
          text += `--------------------------------------------------\n`;
          text += `Meeting Parameters:\n`;
          text += `- Mode:         ${task.meetingDetails.type}\n`;
          text += `- Duration:     ${task.meetingDetails.duration || 'N/A'}\n`;
          text += `- Target Link:  ${task.meetingDetails.link || 'N/A'}\n`;
          text += `- Office Venue: ${task.meetingDetails.location || 'N/A'}\n`;
        }
        break;
      }
      case 'field_assignment': {
        const staff = data as FieldStaff;
        text += `Staff ID:       ${staff.id || 'N/A'}\n`;
        text += `Officer Name:   ${staff.name || 'N/A'}\n`;
        text += `Work Status:    ${staff.status || 'Offline'}\n`;
        text += `Device Battery: ${staff.battery || 100}%\n`;
        text += `GPS Coordinates:${staff.latitudePercentage.toFixed(2)}°N, ${staff.longitudePercentage.toFixed(2)}°E\n`;
        text += `Trips Completed:${staff.tasksCompleted} Jobs\n`;
        text += `Roster Contact: ${staff.phone || 'N/A'}\n`;
        text += `--------------------------------------------------\n`;
        text += `Current Routing Plan Active: Standard City Field Visit\n`;
        break;
      }
      case 'security_profile': {
        const sec = data;
        text += `Workspace Role: ${sec.role || 'N/A'}\n`;
        text += `Active Permissions Checked:\n`;
        if (sec.permissions) {
          Object.entries(sec.permissions).forEach(([perm, val]) => {
            text += `- ${perm}: ${val ? '🔴 DECLARED ENABLED' : '⚪ RESTRICTED'}\n`;
          });
        }
        text += `--------------------------------------------------\n`;
        text += `MFA Smartlock Key Status: Encrypted & Provisioned\n`;
        break;
      }
      default:
        text += JSON.stringify(data, null, 2);
    }
    
    text += `\n==================================================\n`;
    text += `        END OF SECURE EXP-CRM DATA COPY         \n`;
    text += `==================================================\n`;
    return text;
  };

  // 2. GENERATE RICH TEXT HTML STYLED FORMAT FOR DOCUMENT COPYING
  const generateRichHTML = (): string => {
    let html = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 25px; color: #1e293b; max-width: 600px; border: 1px solid #e2e8f0; border-radius: 8px; background: #ffffff;">
        <div style="border-bottom: 2px solid #4f46e5; padding-bottom: 12px; margin-bottom: 20px;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td>
                <span style="font-size: 15px; font-weight: 900; color: #4f46e5; text-transform: uppercase; letter-spacing: 1px;">EXP CRM ENTERPRISE</span>
                <div style="font-size: 9px; color: #94a3b8; font-weight: 700; margin-top: 2px;">SECURE DIGITAL TRANSMISSION</div>
              </td>
              <td style="text-align: right; font-size: 11px; color: #64748b;">
                <strong>Date:</strong> ${timestamp}<br/>
                <strong>Security:</strong> <span style="font-family: monospace; color: #dc2626;">${uniqueHash}</span>
              </td>
            </tr>
          </table>
        </div>
        
        <h3 style="font-size: 14px; text-transform: uppercase; margin-top: 0; color: #0f172a; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; letter-spacing: 0.5px;">${title}</h3>
        
        <div style="margin-top: 15px; font-size: 12px; line-height: 1.6;">
    `;

    switch (type) {
      case 'invoice': {
        const inv = data;
        html += `
          <div style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
            <table style="width: 100%; font-size: 12px;">
              <tr><td><strong>Invoice SKU ID:</strong></td><td>${inv.id || 'N/A'}</td></tr>
              <tr><td><strong>Client Account:</strong></td><td>${inv.clientName || 'N/A'}</td></tr>
              <tr><td><strong>Enterprise Entity:</strong></td><td>${inv.companyName || 'N/A'}</td></tr>
            </table>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #e2e8f0; margin-top: 10px;">
            <thead>
              <tr style="background: #eedfff; text-align: left;"><th style="padding: 8px; border: 1px solid #e2e8f0;">Specified Pipeline Deliverable</th><th style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">Amount</th></tr>
            </thead>
            <tbody>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0;">${inv.itemName || 'N/A'} (SKU Package)</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">₹${inv.rawPrice?.toLocaleString('en-IN') || '0'}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; color: #64748b; font-style: italic;">Discount Applied (5%)</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #b91c1c;">-₹${inv.discountPrice?.toLocaleString('en-IN') || '0'}</td></tr>
              <tr><td style="padding: 8px; border: 1px solid #e2e8f0; color: #64748b;">GST Taxes (18%)</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #64748b;">+₹${inv.gstPrice?.toLocaleString('en-IN') || '0'}</td></tr>
              <tr style="background: #f1f5f9; font-weight: bold;"><td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px;">NET TOTAL PAID DUE</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-size: 13px; color: #4f46e5;">₹${inv.netPrice?.toLocaleString('en-IN') || '0'}</td></tr>
            </tbody>
          </table>
          <div style="font-size: 10px; color: #16a34a; font-weight: bold; margin-top: 10px; text-transform: uppercase;">✔ Realtime Transaction Confirmed via Digital Gate</div>
        `;
        break;
      }
      case 'quotation': {
        const q = data;
        html += `
          <div style="background: #f8fafc; padding: 12px; border-radius: 6px; margin-bottom: 15px;">
            <table style="width: 100%; font-size: 12px;">
              <tr><td><strong>Quotation ID:</strong></td><td>${q.id || 'N/A'}</td></tr>
              <tr><td><strong>Attention Client:</strong></td><td>${q.leadName || 'N/A'}</td></tr>
              <tr><td><strong>Scope Outline:</strong></td><td>${q.itemName || 'N/A'}</td></tr>
            </table>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #e2e8f0; margin-top: 10px;">
            <tr style="background: #f1f5f9;"><td style="padding: 8px; border: 1px solid #e2e8f0;">Raw Subtotal Estimate</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">₹${q.rawPrice?.toLocaleString('en-IN') || '0'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; color: #b91c1c;">Discount Quote deduction</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #b91c1c;">-₹${q.discountPrice?.toLocaleString('en-IN') || '0'}</td></tr>
            <tr style="font-weight: bold; background: #eef2ff;"><td style="padding: 8px; border: 1px solid #e2e8f0;">Net Quoted Total</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #4f46e5;">₹${q.netPrice?.toLocaleString('en-IN') || '0'}</td></tr>
          </table>
          <p style="font-size: 10px; color: #64748b; font-style: italic; margin-top: 10px;">* This quotation circular represents formal price reservation valid for 30 calendar days from generated timestamp.</p>
        `;
        break;
      }
      case 'payroll_slip': {
        const emp = data as Employee;
        html += `
          <div style="background: #ecfdf5; padding: 12px; border-radius: 6px; border: 1px solid #a7f3d0; margin-bottom: 15px;">
            <table style="width: 100%; font-size: 12px;">
              <tr><td><strong>Staff Name:</strong></td><td><strong>${emp.name || 'N/A'}</strong> (ID: ${emp.id || 'N/A'})</td></tr>
              <tr><td><strong>Role Status:</strong></td><td>${emp.role || 'N/A'} (${emp.department || 'N/A'})</td></tr>
              <tr><td><strong>Attendance Track:</strong></td><td>${emp.attendance || 'N/A'} Roster</td></tr>
            </table>
          </div>
          <h4 style="font-size: 11px; text-transform: uppercase; margin-bottom: 6px; color: #334155;">Earnings & Deductions Outline</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 12px; border: 1px solid #e2e8f0;">
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0;">Basic Standard Pay</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right;">₹${emp.salary?.toLocaleString('en-IN') || '0'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; color: #047857;">Corporate Allowance (+)</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #047857;">+₹${emp.allowance?.toLocaleString('en-IN') || '0'}</td></tr>
            <tr><td style="padding: 8px; border: 1px solid #e2e8f0; color: #b91c1c;">Provident Fund & Deductions (-)</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; color: #b91c1c;">-₹${emp.deduction?.toLocaleString('en-IN') || '0'}</td></tr>
            <tr style="font-weight: bold; background: #f0fdf4;"><td style="padding: 8px; border: 1px solid #e2e8f0; font-size: 13px;">NET REMITTED VALUE</td><td style="padding: 8px; border: 1px solid #e2e8f0; text-align: right; font-size: 13px; color: #047857;">₹${emp.netPay?.toLocaleString('en-IN') || '0'}</td></tr>
          </table>
          <div style="font-size: 10px; color: #475569; margin-top: 12px; font-weight: bold;">Payout Class: NACH Electronic Nettransfer Clearing. Authorization: CRM-W3A-SECURE</div>
        `;
        break;
      }
      case 'lead_profile': {
        const lead = data as Lead;
        html += `
          <div style="background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #cbd5e1; margin-bottom: 12px;">
            <table style="width: 100%; font-size: 12px; border-collapse: collapse;">
              <tr><td style="padding: 4px 0;"><strong>Card ID:</strong></td><td>${lead.id || 'N/A'}</td></tr>
              <tr><td style="padding: 4px 0;"><strong>Name:</strong></td><td><strong>${lead.name || 'N/A'}</strong></td></tr>
              <tr><td style="padding: 4px 0;"><strong>Corporate Domain:</strong></td><td>${lead.company || 'N/A'}</td></tr>
              <tr><td style="padding: 4px 0;"><strong>Email Address:</strong></td><td>${lead.email || 'N/A'}</td></tr>
              <tr><td style="padding: 4px 0;"><strong>Phone Line:</strong></td><td>${lead.phone || 'N/A'}</td></tr>
              <tr><td style="padding: 4px 0;"><strong> Roster Status:</strong></td><td><span style="background: #e0f2fe; color: #0369a1; padding: 2px 6px; border-radius: 4px; font-weight: 700; font-size: 10px;">${lead.status || 'N/A'}</span></td></tr>
              <tr><td style="padding: 4px 0;"><strong>LTV Expected:</strong></td><td>₹${lead.value?.toLocaleString('en-IN') || '0'}</td></tr>
              <tr><td style="padding: 4px 0;"><strong>Added On Date:</strong></td><td>${lead.dateAdded || 'N/A'}</td></tr>
            </table>
          </div>
          ${lead.notes ? `
            <div style="background: #fffdf5; border: 1px solid #fef08a; padding: 10px; border-radius: 4px; font-size: 11px; margin-top: 8px;">
              <strong>Latest Memo/Note:</strong><br/>
              "${lead.notes}"
            </div>
          ` : ''}
          ${lead.aiInsight ? `
            <div style="border: 1px solid #ddd6fe; background: #faf5ff; padding: 12px; border-radius: 6px; margin-top: 12px;">
              <strong style="color: #6b21a8; font-size: 12px;">★ Enterprise AI Advisory Insights</strong>
              <table style="width: 100%; font-size: 11px; border-collapse: collapse; margin-top: 8px;">
                <tr><td style="padding: 3px 0; color: #581c87;">Probability to Seal:</td><td><strong>${lead.aiInsight.closeProbability}%</strong></td></tr>
                <tr><td style="padding: 3px 0; color: #581c87;">Sentiment Class:</td><td>${lead.aiInsight.sentiment}</td></tr>
                <tr><td style="padding: 3px 0; color: #581c87;">Engagement Angle:</td><td>"${lead.aiInsight.pitch}"</td></tr>
                <tr><td style="padding: 3px 0; color: #581c87;">Recommended Action:</td><td><strong>${lead.aiInsight.recommendedAction}</strong></td></tr>
              </table>
            </div>
          ` : ''}
        `;
        break;
      }
      case 'support_ticket': {
        const ticket = data as SupportTicket;
        html += `
          <div style="background: #fef2f2; border: 1px solid #fee2e2; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <table style="width: 100%; font-size: 12px;">
              <tr><td><strong>Ticket reference:</strong></td><td><strong>${ticket.id || 'N/A'}</strong></td></tr>
              <tr><td><strong>Logged Subject:</strong></td><td>${ticket.subject || 'N/A'}</td></tr>
              <tr><td><strong>Customer / User:</strong></td><td>${ticket.clientName || 'N/A'}</td></tr>
              <tr><td><strong>Topic Category:</strong></td><td>${ticket.category || 'N/A'}</td></tr>
              <tr><td><strong>Priority Level:</strong></td><td><span style="color: #b91c1c; font-weight: bold;">${ticket.priority || 'N/A'}</span></td></tr>
              <tr><td><strong>Ticket State:</strong></td><td><strong>${ticket.status || 'N/A'}</strong></td></tr>
              <tr><td><strong>Opened Timestamp:</strong></td><td>${ticket.createdTime || 'N/A'}</td></tr>
            </table>
          </div>
          <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 12px; border-radius: 4px; font-size: 11.5px; margin-top: 8px;">
            <strong>Customer Core Problem Description:</strong><br/>
            <p style="margin: 6px 0 0 0; color: #475569; font-style: italic;">"${ticket.description || 'N/A'}"</p>
          </div>
          ${ticket.aiResponseDraft ? `
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; padding: 12px; border-radius: 4px; font-size: 11.5px; margin-top: 10px;">
              <strong style="color: #166534;">✔ Generated Support Reply Draft</strong><br/>
              <p style="margin: 6px 0 0 0; color: #1e293b; font-family: sans-serif;">${ticket.aiResponseDraft}</p>
            </div>
          ` : ''}
        `;
        break;
      }
      case 'call_log': {
        const call = data as CallLog;
        html += `
          <div style="background: #fff7ed; border: 1px solid #ffedd5; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <table style="width: 100%; font-size: 12px;">
              <tr><td><strong>Telephony voucher:</strong></td><td><strong>${call.id || 'N/A'}</strong></td></tr>
              <tr><td><strong>Contact targeted:</strong></td><td>${call.clientName || 'N/A'} (${call.clientPhone || 'N/A'})</td></tr>
              <tr><td><strong>Representative:</strong></td><td>${call.agentName || 'N/A'}</td></tr>
              <tr><td><strong>Total Duration:</strong></td><td>${call.duration || 'N/A'}</td></tr>
              <tr><td><strong>Call Stamp:</strong></td><td>${call.time || 'N/A'}</td></tr>
              <tr><td><strong>Completion State:</strong></td><td><span style="font-weight: bold; color: ${call.type === 'Answered' ? '#16a34a' : '#dc2626'}">${call.type || 'N/A'}</span></td></tr>
            </table>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 10px; border-radius: 4px; font-size: 11px;">
            <strong>Interaction Memo Log:</strong><br/>
            <p style="margin: 4px 0 0 0; color: #475569; font-style: italic;">"${call.notes || 'No call notes transcribed.'}"</p>
          </div>
        `;
        break;
      }
      case 'task_report': {
        const task = data as Task;
        html += `
          <div style="background: #f3f4f6; border: 1px solid #e5e7eb; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <table style="width: 100%; font-size: 12px;">
              <tr><td><strong>Task code:</strong></td><td><strong>${task.id || 'N/A'}</strong></td></tr>
              <tr><td><strong>Memo summary:</strong></td><td><strong>${task.title || 'N/A'}</strong></td></tr>
              <tr><td><strong>Client Roster:</strong></td><td>${task.clientName || 'N/A'}</td></tr>
              <tr><td><strong>Task Category:</strong></td><td>${task.type || 'Task'}</td></tr>
              <tr><td><strong>Priority Rank:</strong></td><td>${task.priority || 'Medium'}</td></tr>
              <tr><td><strong>Assigned Official:</strong></td><td>${task.assignedTo || 'Unassigned'}</td></tr>
              <tr><td><strong>Alert Date:</strong></td><td>${task.time || 'N/A'}</td></tr>
              <tr><td><strong>Work State:</strong></td><td><strong>${task.status || 'Pending'}</strong></td></tr>
            </table>
          </div>
          <div style="background: #ffffff; border: 1px solid #cbd5e1; padding: 10px; border-radius: 4px; font-size: 11px;">
            <strong>Task Description details:</strong><br/>
            <p style="margin: 4px 0 0 0; color: #475569;">${task.description || 'N/A'}</p>
          </div>
          ${task.meetingDetails ? `
            <div style="background: #eef2ff; border: 1px solid #c7d2fe; padding: 10px; border-radius: 4px; font-size: 11px; margin-top: 10px;">
              <strong style="color: #3730a3;">📶 Virtual Conference / Meeting details</strong><br/>
              <table style="width: 100%; font-size: 11px; margin-top: 4px;">
                <tr><td>Mode Type:</td><td>${task.meetingDetails.type}</td></tr>
                <tr><td>Duration Limit:</td><td>${task.meetingDetails.duration || 'N/A'}</td></tr>
                ${task.meetingDetails.link ? `<tr><td>URL Web Address:</td><td><a href="${task.meetingDetails.link}" style="color: #4f46e5; text-decoration: underline;">${task.meetingDetails.link}</a></td></tr>` : ''}
                ${task.meetingDetails.location ? `<tr><td>Physical Venue:</td><td>${task.meetingDetails.location}</td></tr>` : ''}
              </table>
            </div>
          ` : ''}
        `;
        break;
      }
      case 'field_assignment': {
        const staff = data as FieldStaff;
        html += `
          <div style="background: #fafaf9; border: 1px solid #e7e5e4; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <table style="width: 100%; font-size: 12px;">
              <tr><td><strong>Staff Code:</strong></td><td><strong>${staff.id || 'N/A'}</strong></td></tr>
              <tr><td><strong>Officer Name:</strong></td><td><strong>${staff.name || 'N/A'}</strong></td></tr>
              <tr><td><strong> Roster Status:</strong></td><td>${staff.status || 'Offline'}</td></tr>
              <tr><td><strong>Device Power:</strong></td><td>${staff.battery || 100}% Charged</td></tr>
              <tr><td><strong>GPS coordinates:</strong></td><td>${staff.latitudePercentage.toFixed(2)}°N, ${staff.longitudePercentage.toFixed(2)}°E</td></tr>
              <tr><td><strong>Trips Completed:</strong></td><td>${staff.tasksCompleted} Jobs today</td></tr>
              <tr><td><strong>Roster Contact:</strong></td><td>${staff.phone || 'N/A'}</td></tr>
            </table>
          </div>
          <div style="font-size: 10px; color: #78716c; font-style: italic;">* Live monitoring dispatch record mapped via standard city network framework.</div>
        `;
        break;
      }
      case 'security_profile': {
        const sec = data;
        html += `
          <div style="background: #f8fafc; border: 1px solid #cbd5e1; padding: 12px; border-radius: 6px; margin-bottom: 12px;">
            <table style="width: 100%; font-size: 12px;">
              <tr><td><strong>Assigned Role:</strong></td><td><strong>${sec.role || 'N/A'}</strong></td></tr>
            </table>
          </div>
          <h4 style="font-size: 11px; text-transform: uppercase; color: #475569; margin-bottom: 6px;">Workspace Permissions Map</h4>
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            ${sec.permissions ? Object.entries(sec.permissions).map(([perm, val]) => `
              <tr style="border-bottom: 1px solid #f1f5f9;">
                <td style="padding: 4px; font-family: monospace;">${perm}</td>
                <td style="padding: 4px; text-align: right; font-weight: bold; color: ${val ? '#16a34a' : '#94a3b8'};">${val ? '✔ GRANTED' : '⚪ RESTRICTED'}</td>
              </tr>
            `).join('') : ''}
          </table>
        `;
        break;
      }
      default:
        html += `<pre style="font-family: monospace; font-size: 11px; background: #f8fafc; padding: 10px;">${JSON.stringify(data, null, 2)}</pre>`;
    }

    html += `
        </div>
        <div style="border-top: 1px solid #f1f5f9; margin-top: 25px; padding-top: 12px; font-size: 10px; color: #94a3b8; text-align: center;">
          Exp CRM System Corporate Clearance Document • Strictly Confidential for Authorised Handlers Only
        </div>
      </div>
    `;
    return html;
  };

  // 3. COPY PLAIN TEXT TO CLIPBOARD
  const copyPlain = () => {
    const text = generatePlainText();
    navigator.clipboard.writeText(text).then(() => {
      setCopied('plain');
    });
  };

  // 4. COPY RICH HTML FORMAT TO CLIPBOARD WITH STYLE ATTRIBUTES
  const copyRich = () => {
    const htmlString = generateRichHTML();
    try {
      const typeHtml = "text/html";
      const typeText = "text/plain";
      const blobHtml = new Blob([htmlString], { type: typeHtml });
      const blobText = new Blob([generatePlainText()], { type: typeText });
      
      const dataItem = new ClipboardItem({
        [typeHtml]: blobHtml,
        [typeText]: blobText
      });
      
      navigator.clipboard.write([dataItem]).then(() => {
        setCopied('rich');
      }).catch((err) => {
        // Fallback to text copy if write is blocked
        navigator.clipboard.writeText(generatePlainText()).then(() => {
          setCopied('plain');
        });
      });
    } catch (e) {
      navigator.clipboard.writeText(generatePlainText()).then(() => {
        setCopied('plain');
      });
    }
  };

  // 5. DOWNLOAD DYNAMIC HTML / RECORD FILE
  const downloadFile = () => {
    const element = window.document.createElement("a");
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${title} - EXP CRM Document</title>
        <style>
          body { background: #f1f5f9; padding: 40px; display: flex; justify-content: center; }
        </style>
      </head>
      <body>
        ${generateRichHTML()}
      </body>
      </html>
    `;
    const file = new Blob([htmlContent], { type: 'text/html' });
    element.href = URL.createObjectURL(file);
    element.download = `${title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_receipt.html`;
    window.document.body.appendChild(element);
    element.click();
    window.document.body.removeChild(element);
    setDownloaded(true);
  };

  // 6. ACTUAL NATIVE WINDOW PRINT
  const handleNativePrint = () => {
    // We add a temporary stylesheet to guarantee only .printable-area is printed
    // This is super clean and works perfectly.
    const style = window.document.createElement('style');
    style.id = 'print-overrides-style';
    style.innerHTML = `
      @media print {
        body * {
          visibility: hidden !important;
        }
        #app-print-override-area, #app-print-override-area * {
          visibility: visible !important;
        }
        #app-print-override-area {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          margin: 0 !important;
          padding: 20px !important;
          box-shadow: none !important;
          border: none !important;
        }
      }
    `;
    window.document.head.appendChild(style);
    
    // Trigger standard API
    window.print();
    
    // Cleanup style after print
    setTimeout(() => {
      const el = window.document.getElementById('print-overrides-style');
      if (el) el.remove();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center z-[100] p-4 animate-fadeIn">
      {/* Container Card */}
      <div className="bg-slate-50 rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12 max-h-[90vh]">
        
        {/* Left Side: interactive preview card */}
        <div className="md:col-span-8 p-6 flex flex-col items-center justify-start overflow-y-auto max-h-[60vh] md:max-h-[85vh] bg-slate-100/50 border-r border-slate-200">
          <div className="w-full flex items-center justify-between mb-3 text-xxs tracking-wider font-extrabold text-slate-400 uppercase">
            <span>OFFICIAL SYSTEM RECORD DECLARED PREVIEW</span>
            <span className="text-red-500 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" /> SECURITY ENCRYPT
            </span>
          </div>

          {/* Actual sheet of paper styled UI */}
          <div 
            id="app-print-override-area"
            className="w-full max-w-[620px] bg-white border border-slate-200 shadow-lg rounded-xl p-6 relative select-text font-sans text-slate-800"
          >
            {/* Header watermarks */}
            <div className="border-b-2 border-indigo-600 pb-3 mb-5 flex justify-between items-start">
              <div>
                <h1 className="text-sm font-black text-indigo-600 tracking-wider uppercase">EXP CRM ENTERPRISE</h1>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Automated Intelligence Operations</p>
              </div>
              <div className="text-right text-[10px] text-slate-500 font-medium">
                <p><strong>Issued At:</strong> {timestamp}</p>
                <p className="font-mono text-red-650 mt-0.5"><strong>Secure Hash:</strong> {uniqueHash}</p>
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xs font-black text-slate-900 uppercase border-b pb-1 mb-4 flex items-center gap-1 tracking-wider">
              <FileText className="w-4 h-4 text-indigo-500" />
              {title}
            </h2>

            {/* Core Body Template Renderer */}
            <div className="text-xs space-y-4 text-slate-755">
              {type === 'invoice' && data && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-lg border grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">SKU Invoice Number</p>
                      <p className="font-mono text-slate-900 font-bold">{data.id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Settled Recipient</p>
                      <p className="text-slate-900 font-bold">{data.clientName || 'N/A'}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-[9px] font-black text-slate-400 uppercase">Purchased Enterprise Account Name</p>
                      <p className="text-slate-900 font-bold">{data.companyName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-left quote-table">
                      <thead>
                        <tr className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase">
                          <th className="p-2.5">Specified Pipeline Deliverable</th>
                          <th className="p-2.5 text-right">Raw Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y text-xs">
                        <tr>
                          <td className="p-2.5">
                            <span className="font-bold text-slate-900">{data.itemName || 'N/A'}</span>
                            <span className="block text-[10px] text-slate-400">Enterprise deployment setup package</span>
                          </td>
                          <td className="p-2.5 text-right font-bold text-slate-900">₹{data.rawPrice?.toLocaleString('en-IN') || '0'}</td>
                        </tr>
                        <tr className="text-slate-500 bg-red-50/20">
                          <td className="p-2.5 italic">Contract Discount Added (-5%)</td>
                          <td className="p-2.5 text-right text-red-600 font-bold">-₹{data.discountPrice?.toLocaleString('en-IN') || '0'}</td>
                        </tr>
                        <tr className="text-slate-500">
                          <td className="p-2.5">GST Taxes Allocated (18%)</td>
                          <td className="p-2.5 text-right font-medium">+₹{data.gstPrice?.toLocaleString('en-IN') || '0'}</td>
                        </tr>
                        <tr className="bg-indigo-50/50 font-black text-indigo-700 text-sm border-t-2">
                          <td className="p-2.5">NET DUE COMMITTED</td>
                          <td className="p-2.5 text-right text-lg">₹{data.netPrice?.toLocaleString('en-IN') || '0'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-[10px] tracking-wide uppercase">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping-slow" /> Real-time payment reconciled successfully.
                  </div>
                </div>
              )}

              {type === 'quotation' && data && (
                <div className="space-y-4">
                  <div className="bg-slate-50 p-3 rounded-lg border grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Quotation Number</p>
                      <p className="font-mono text-slate-900 font-bold">{data.id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Client Propect</p>
                      <p className="text-slate-900 font-bold">{data.leadName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="border rounded-xl overflow-hidden mt-2">
                    <table className="w-full text-left">
                      <tbody className="divide-y">
                        <tr>
                          <td className="p-2.5 font-bold text-slate-500">Proposed Scope Deliverable</td>
                          <td className="p-2.5 text-slate-900 font-bold">{data.itemName || 'N/A'}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-500">Base Raw Value</td>
                          <td className="p-2.5 text-slate-900 font-bold">₹{data.rawPrice?.toLocaleString('en-IN') || '0'}</td>
                        </tr>
                        <tr>
                          <td className="p-2.5 font-bold text-slate-500">Applied Discount</td>
                          <td className="p-2.5 text-red-650 font-bold">-₹{data.discountPrice?.toLocaleString('en-IN') || '0'}</td>
                        </tr>
                        <tr className="bg-indigo-50/50 font-black text-indigo-750">
                          <td className="p-2.5 text-sm">Quoted Net Estimate</td>
                          <td className="p-2.5 text-right text-sm">₹{data.netPrice?.toLocaleString('en-IN') || '0'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <p className="text-[10px] text-slate-400 italic font-medium leading-relaxed mt-2 border-t pt-2">
                    * This quotation represents a formal pricing reservation for enterprise services. Terms are valid for 30 business days representing negotiations.
                  </p>
                </div>
              )}

              {type === 'payroll_slip' && data && (
                <div className="space-y-4">
                  <div className="border rounded-xl p-3 bg-emerald-50/30 border-emerald-100 flex justify-between items-center">
                    <div>
                      <h4 className="font-extrabold text-slate-900 leading-none">{data.name || 'N/A'}</h4>
                      <p className="text-[10px] text-slate-500 font-medium mt-1 uppercase tracking-wide">{data.role} ({data.department})</p>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono bg-emerald-100 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded-full font-bold uppercase">
                        {data.paidStatus || 'PAID'}
                      </span>
                    </div>
                  </div>

                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b text-[10px] font-black text-slate-400 uppercase">
                          <th className="p-2">Description Allocation</th>
                          <th className="p-2 text-right">Value (INR)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-mono">
                        <tr>
                          <td className="p-2 font-sans font-medium text-slate-700">Basic Apportioned Salary</td>
                          <td className="p-2 text-right">₹{data.salary?.toLocaleString('en-IN') || '0'}</td>
                        </tr>
                        <tr className="text-emerald-700 font-bold">
                          <td className="p-2 font-sans font-medium">Standard Allowance Additions (+)</td>
                          <td className="p-2 text-right">+₹{data.allowance?.toLocaleString('en-IN') || '0'}</td>
                        </tr>
                        <tr className="text-red-700 font-bold">
                          <td className="p-2 font-sans font-medium">Provident & PF Tax Deductions (-)</td>
                          <td className="p-2 text-right">-₹{data.deduction?.toLocaleString('en-IN') || '0'}</td>
                        </tr>
                        <tr className="bg-emerald-50 font-black text-emerald-800 text-sm border-t-2">
                          <td className="p-2 font-sans">NET REMITTANCE GENERATED</td>
                          <td className="p-2 text-right">₹{data.netPay?.toLocaleString('en-IN') || '0'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="border-t pt-2 flex justify-between items-center text-[9px] text-slate-400 font-mono">
                    <span>Authorized Code: CRM-W3A-NACH-SECURE</span>
                    <span>Clearing House Bank Router</span>
                  </div>
                </div>
              )}

              {type === 'lead_profile' && data && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 border rounded-xl">
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Account Name</p>
                      <p className="text-[13px] font-black text-slate-900">{data.name}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Corporate Domain</p>
                      <p className="text-[13px] font-bold text-slate-650">{data.company}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Roster Status</p>
                      <span className="inline-block mt-0.5 text-[9px] bg-sky-100 border border-sky-200 text-sky-800 px-2 py-0.2 rounded font-bold uppercase">
                        {data.status}
                      </span>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Traffic Source</p>
                      <p className="text-slate-800 font-medium">{data.source}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Value Estimate</p>
                      <p className="text-slate-900 font-extrabold text-sm text-indigo-600">₹{data.value?.toLocaleString('en-IN') || '0'}</p>
                    </div>
                    <div>
                      <p className="text-[9px] font-black text-slate-400 uppercase">Roster Registered</p>
                      <p className="text-slate-600 font-mono text-[10px]">{data.dateAdded}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50/40 border border-amber-200 rounded-xl">
                    <h5 className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Latest Memo Note & Core Records</h5>
                    <p className="mt-1 text-slate-700 leading-relaxed text-xs">"{data.notes || 'No notes created yet for this account.'}"</p>
                  </div>

                  {data.aiInsight && (
                    <div className="border border-indigo-150 bg-indigo-50/30 p-3 rounded-xl space-y-2">
                      <h4 className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest">★ System AI Lead Diagnostic Summary</h4>
                      <div className="grid grid-cols-2 gap-2 text-xxs font-sans text-slate-600">
                        <div>
                          <strong>Close Probability:</strong> {data.aiInsight.closeProbability}%
                        </div>
                        <div>
                          <strong>Client Sentiment:</strong> {data.aiInsight.sentiment}
                        </div>
                        <div className="col-span-2">
                          <strong>Advisory Engagement Pitch:</strong> "{data.aiInsight.pitch}"
                        </div>
                        <div className="col-span-2">
                          <strong>Highest Recommended Action:</strong> <span className="text-indigo-600 font-bold">{data.aiInsight.recommendedAction}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {type === 'support_ticket' && data && (
                <div className="space-y-4">
                  <div className="p-3 bg-red-50/20 border border-red-100 rounded-xl grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Ticket reference ID</span>
                      <strong className="text-slate-900 font-mono">{data.id}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Subject Theme</span>
                      <strong className="text-slate-900">{data.subject}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Priority Status</span>
                      <strong className="text-red-700 uppercase font-black">{data.priority} Priority</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Category</span>
                      <span className="font-bold text-indigo-650">{data.category} Desk</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Customer Core Problem Brief</p>
                    <p className="text-slate-700 italic font-medium leading-relaxed mt-1">"{data.description}"</p>
                  </div>

                  {data.aiResponseDraft && (
                    <div className="p-3 bg-emerald-50/20 border border-emerald-150 rounded-xl space-y-1">
                      <p className="text-[9px] font-black text-emerald-800 uppercase tracking-wide">✔ Generated Support Reply Draft Action</p>
                      <p className="text-slate-800 leading-relaxed leading-none">{data.aiResponseDraft}</p>
                    </div>
                  )}
                </div>
              )}

              {type === 'call_log' && data && (
                <div className="space-y-4">
                  <div className="bg-orange-50/20 border border-orange-100 rounded-xl p-3 grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Telephony voucher Log ID</span>
                      <strong className="text-slate-900 font-mono">{data.id}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Registered Representative</span>
                      <strong className="text-slate-900">{data.agentName}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Lead Contact targeted</span>
                      <strong className="text-slate-900">{data.clientName} ({data.clientPhone})</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block uppercase font-bold">Total Call Duration</span>
                      <strong className="text-orange-700">{data.duration}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-50 border rounded-xl">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Telephony Interaction Memo Log</p>
                    <p className="text-slate-800 italic leading-relaxed mt-1">"{data.notes || 'No call summary logged.'}"</p>
                  </div>
                </div>
              )}

              {type === 'task_report' && data && (
                <div className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl border grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Task referenceID</span>
                      <strong className="text-slate-900 font-mono">{data.id}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Roster Handler Assignee</span>
                      <strong className="text-indigo-600">{data.assignedTo || 'Unassigned'}</strong>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Topic Name</span>
                      <strong className="text-slate-900 text-sm">{data.title}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Task Type</span>
                      <strong className="text-slate-700 uppercase font-black">{data.type || 'Task'}</strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 uppercase block font-bold">Current Work State</span>
                      <strong className="text-emerald-700 uppercase font-black">{data.status}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-white rounded-xl border">
                    <p className="text-[9px] font-black text-slate-400 uppercase col-span-2">Task Description details</p>
                    <p className="text-slate-705 leading-relaxed col-span-2 text-xs mt-1">{data.description}</p>
                  </div>

                  {data.meetingDetails && (
                    <div className="bg-indigo-50/20 border border-indigo-150 p-3 rounded-xl space-y-2">
                      <h4 className="text-[10px] font-extrabold text-indigo-700 uppercase tracking-widest">★ Virtual Conference Params</h4>
                      <div className="grid grid-cols-2 gap-2 text-xxs font-sans text-slate-600">
                        <div>
                          <strong>Mode:</strong> {data.meetingDetails.type}
                        </div>
                        <div>
                          <strong>Duration Limit:</strong> {data.meetingDetails.duration || 'N/A'}
                        </div>
                        {data.meetingDetails.link && (
                          <div className="col-span-2">
                            <strong>Meeting URL:</strong> <a href={data.meetingDetails.link} className="text-indigo-600 hover:underline break-all">{data.meetingDetails.link}</a>
                          </div>
                        )}
                        {data.meetingDetails.location && (
                          <div className="col-span-2">
                            <strong>Physical Venue Venue:</strong> {data.meetingDetails.location}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {type === 'field_assignment' && data && (
                <div className="space-y-4">
                  <div className="p-4 border rounded-xl bg-slate-50 space-y-2">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <strong>Staff Code:</strong> {data.id}
                      </div>
                      <div>
                        <strong>Officer Name:</strong> {data.name}
                      </div>
                      <div>
                        <strong> Roster Status:</strong> {data.status}
                      </div>
                      <div>
                        <strong>Device Battery power:</strong> {data.battery}% charged
                      </div>
                    </div>
                    <div className="border-t pt-2 text-[10.5px] text-slate-600 space-y-1">
                      <p><strong>Trips Completed:</strong> {data.tasksCompleted} jobs today</p>
                      <p><strong>GPS Tracking path:</strong> {data.latitudePercentage.toFixed(2)}°N, {data.longitudePercentage.toFixed(2)}°E</p>
                      <p><strong>Roster Contact:</strong> {data.phone || 'N/A'}</p>
                    </div>
                  </div>
                  <p className="text-[9px] text-slate-400 font-mono italic">
                    * Mapped real-time dispatch trace. Cleared for administrative validation.
                  </p>
                </div>
              )}

              {type === 'security_profile' && data && (
                <div className="space-y-4">
                  <div className="border rounded-xl p-3 bg-red-50/10 border-red-200">
                    <h4 className="font-extrabold text-slate-900 leading-none">Security Clearance Credentials</h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-1.5 uppercase tracking-wide">Workspace Role: {data.role}</p>
                  </div>

                  <div className="border rounded-xl p-3 bg-slate-50">
                    <h5 className="text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Granted Permissions Map</h5>
                    <div className="space-y-2 max-h-[250px] overflow-y-auto">
                      {data.permissions && Object.entries(data.permissions).map(([perm, val]) => (
                        <div key={perm} className="flex justify-between items-center text-xs py-1 border-b border-slate-200 last:border-b-0">
                          <code className="text-[10.5px] font-mono text-slate-650">{perm}</code>
                          <span className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded ${val ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-500'}`}>
                            {val ? 'GRANTED' : 'RESTRICTED'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer watermarks */}
            <div className="border-t mt-6 pt-3 text-[10px] text-slate-400 text-center uppercase tracking-widest font-black">
              Confidential EXP-CRM Secure Audit Record Leafлет
            </div>
          </div>
        </div>

        {/* Right Side: Copy/Export actions drawer */}
        <div className="md:col-span-4 p-6 flex flex-col justify-between bg-white text-slate-800 space-y-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-2 border-b">
              <div>
                <h3 className="text-xs font-black text-slate-900 uppercase">Export Center</h3>
                <p className="text-[10px] text-slate-400">Ready to save, print, or share</p>
              </div>
              <button 
                onClick={onClose}
                className="p-1 px-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-950 font-bold text-xs rounded-lg transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2 text-slate-700 text-xxs">
              <div className="flex items-center gap-1.5 text-amber-800 font-extrabold uppercase">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                Iframe Print Warning
              </div>
              <p className="leading-relaxed font-sans">
                Due to browser sandbox security constraints inside AI Studio iframe preview, direct physical printing can sometimes fail. <strong>Use "Copy Rich HTML" or "Copy Plain Text"</strong> as 100% bulletproof fallbacks to paste beautifully formatted copies into MS Word, Google Docs or email.
              </p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5 pt-2">
              <button
                onClick={handleNativePrint}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md transition"
              >
                <Printer className="w-4 h-4" />
                System Print (PDF)
              </button>

              <button
                onClick={copyRich}
                className={`w-full py-2.5 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 border transition ${
                  copied === 'rich' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
                }`}
              >
                {copied === 'rich' ? <Check className="w-4 h-4 text-emerald-600" /> : <Clipboard className="w-4 h-4 text-slate-500" />}
                {copied === 'rich' ? 'Rich Document Copied!' : 'Copy Rich Layout (Word)'}
              </button>

              <button
                onClick={copyPlain}
                className={`w-full py-2.5 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 border transition ${
                  copied === 'plain' 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
                }`}
              >
                {copied === 'plain' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                {copied === 'plain' ? 'ASCII Record Copied!' : 'Copy Plain ASCII Log'}
              </button>

              <button
                onClick={downloadFile}
                className={`w-full py-2.5 font-extrabold text-xs rounded-xl flex items-center justify-center gap-2 border transition ${
                  downloaded 
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                    : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200 shadow-sm'
                }`}
              >
                {downloaded ? <Check className="w-4 h-4 text-emerald-600" /> : <Download className="w-4 h-4 text-slate-500" />}
                {downloaded ? 'HTML Leaflet Saved!' : 'Download Offline Document'}
              </button>
            </div>
          </div>

          <div className="pt-4 border-t space-y-2 text-xxxs text-slate-400 font-sans tracking-wide">
            <p><strong>SYSTEM EMAIL:</strong> {userEmail}</p>
            <p><strong>ENCRYPTON STAMP:</strong> {uniqueHash}</p>
            <p>EXP CRM Enterprise Print Dispatch Roster v3.45</p>
          </div>
        </div>
      </div>
    </div>
  );
}
