"use client";

import React from "react";
import { X, Clock, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { Appointment, useData } from "@/lib/context/data-context";
import { cn } from "@/lib/utils";

interface AppointmentDetailModalProps {
  meeting: Appointment;
  role: string;
  onClose: () => void;
  onLogVisit?: () => void;
}

export function AppointmentDetailModal({ meeting, role, onClose, onLogVisit }: AppointmentDetailModalProps) {
  const { medicines, updateAppointment, approveSamples } = useData();
  const isStaff = role === "Staff";
  const isManager = role === "Manager";
  const canLog = isStaff && (meeting.status === "scheduled" || meeting.status === "upcoming");
  const isPending = meeting.status === "pending_approval";
  const hasPendingSamples = meeting.freeSamples && meeting.freeSamples.some(s => !s.approved);
  const [comment, setComment] = React.useState("");
  const [error, setError] = React.useState("");
  const [actionType, setActionType] = React.useState<"none" | "cancel" | "reschedule">("none");
  const [cancelReasonText, setCancelReasonText] = React.useState("");
  const [newDate, setNewDate] = React.useState(meeting.date);
  const [newHour, setNewHour] = React.useState(meeting.hour);
  const [rescheduleReasonText, setRescheduleReasonText] = React.useState("");

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (actionType === "cancel") {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer pointer-events-auto" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-card border border-border w-full max-w-lg rounded-[10px] shadow-2xl overflow-hidden pointer-events-auto">
          <div className="p-8 bg-rose-500 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
            <h3 className="text-xl font-black uppercase tracking-tight">Request Cancellation</h3>
            <p className="text-xs opacity-80 mt-1">{meeting.title}</p>
          </div>
          <div className="p-8 space-y-4">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block">Reason for Cancellation</label>
            <textarea
              id="cancel-reason-textarea"
              value={cancelReasonText}
              onChange={(e) => {
                setCancelReasonText(e.target.value);
                if (e.target.value) setError("");
              }}
              placeholder="Provide cancellation details (e.g. clinic rescheduled or representative conflict)..."
              className="w-full p-4 bg-secondary/30 border border-border rounded-lg text-xs font-semibold focus:ring-1 focus:ring-rose-500 focus:outline-none min-h-[120px] resize-none"
            />
            {error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider">{error}</p>}
          </div>
          <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/5">
            <button type="button" onClick={() => { setActionType("none"); setError(""); }} className="px-6 py-3 bg-secondary text-foreground font-black text-[10px] uppercase rounded-[8px] hover:bg-secondary/70 transition-all">Back</button>
            <button
              id="submit-cancel-request-btn"
              type="button"
              onClick={() => {
                if (!cancelReasonText.trim()) {
                  setError("Please provide a reason for cancellation");
                  return;
                }
                updateAppointment(meeting.id, {
                  status: "pending_cancellation",
                  cancelReason: cancelReasonText
                });
                onClose();
              }}
              className="px-8 py-3 bg-rose-500 text-white font-black text-[10px] uppercase rounded-[8px] hover:bg-rose-600 shadow-lg shadow-rose-500/10 transition-all"
            >
              Submit Cancellation Request
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (actionType === "reschedule") {
    return (
      <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer pointer-events-auto" />
        <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-card border border-border w-full max-w-lg rounded-[10px] shadow-2xl overflow-hidden pointer-events-auto">
          <div className="p-8 bg-orange-500 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
            <h3 className="text-xl font-black uppercase tracking-tight">Request Rescheduling</h3>
            <p className="text-xs opacity-80 mt-1">{meeting.title}</p>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">New Proposed Date</label>
                <input
                  id="reschedule-date-input"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full p-3 bg-secondary/30 border border-border rounded-lg text-xs font-black"
                />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">New Proposed Time</label>
                <select
                  id="reschedule-time-select"
                  value={newHour}
                  onChange={(e) => setNewHour(e.target.value)}
                  className="w-full p-3 bg-secondary/30 border border-border rounded-lg text-xs font-black"
                >
                  {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block mb-2">Reason for Rescheduling</label>
              <textarea
                id="reschedule-reason-textarea"
                value={rescheduleReasonText}
                onChange={(e) => {
                  setRescheduleReasonText(e.target.value);
                  if (e.target.value) setError("");
                }}
                placeholder="Why do you need to reschedule this clinical visit?..."
                className="w-full p-4 bg-secondary/30 border border-border rounded-lg text-xs font-semibold focus:ring-1 focus:ring-orange-500 focus:outline-none min-h-[100px] resize-none"
              />
            </div>
            {error && <p className="text-[10px] font-black text-rose-500 uppercase tracking-wider">{error}</p>}
          </div>
          <div className="p-6 border-t border-border flex justify-end gap-3 bg-secondary/5">
            <button type="button" onClick={() => { setActionType("none"); setError(""); }} className="px-6 py-3 bg-secondary text-foreground font-black text-[10px] uppercase rounded-[8px] hover:bg-secondary/70 transition-all">Back</button>
            <button
              id="submit-reschedule-request-btn"
              type="button"
              onClick={() => {
                if (!rescheduleReasonText.trim()) {
                  setError("Please provide a reason for rescheduling");
                  return;
                }
                updateAppointment(meeting.id, {
                  status: "pending_reschedule",
                  proposedDate: newDate,
                  proposedHour: newHour,
                  rescheduleReason: rescheduleReasonText
                });
                onClose();
              }}
              className="px-8 py-3 bg-orange-500 text-white font-black text-[10px] uppercase rounded-[8px] hover:bg-orange-600 shadow-lg shadow-orange-500/10 transition-all"
            >
              Submit Reschedule Request
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-black/80 backdrop-blur-md cursor-pointer pointer-events-auto" 
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }} 
        animate={{ scale: 1, opacity: 1, y: 0 }} 
        exit={{ scale: 0.9, opacity: 0, y: 20 }} 
        className="relative bg-card border border-border w-full max-w-2xl rounded-[10px] shadow-2xl overflow-hidden pointer-events-auto"
      >
        <div className="px-10 py-6 bg-primary text-primary-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
          <button type="button" onClick={onClose} className="absolute top-1/2 -translate-y-1/2 right-8 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 z-50 transition-colors"><X size={20} /></button>
          <div className="relative z-10">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-1">Audit Hub</p>
            <h3 className="text-2xl font-black tracking-tighter pr-12">{meeting.title}</h3>
            <div className="flex items-center gap-4 mt-2">
               <div className="flex items-center gap-2 px-3 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase"><Clock size={12} /> {meeting.hour}</div>
               <div className="flex items-center gap-2 px-3 py-0.5 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-widest">{meeting.status}</div>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 gap-6">
            <div className="p-6 bg-secondary/20 rounded-[10px] border border-border">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2">Facility & Personnel</p>
              <p className="font-black text-sm">{meeting.hospitalName || meeting.entityName}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">{meeting.location}</p>
              <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">S</div>
                <div>
                  <p className="text-[8px] font-black uppercase text-muted-foreground leading-none">Representative</p>
                  <p className="text-xs font-black">{meeting.staffName || "System Assigned"}</p>
                </div>
              </div>
            </div>
            <div className="p-6 bg-secondary/20 rounded-[10px] border border-border">
              <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2">Lead Contact</p>
              <p className="font-black text-sm">{meeting.doctorName || meeting.contactPerson}</p>
              <p className="text-[10px] font-bold text-muted-foreground uppercase mt-1">Verification Liaison</p>
              {meeting.patientName && (
                <div className="mt-4 pt-4 border-t border-border/50">
                  <p className="text-[8px] font-black uppercase text-pink-500 mb-1">Subject Patient</p>
                  <p className="text-xs font-black">{meeting.patientName}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Operational Engagement Data</h4>
            <div className="grid grid-cols-1 gap-4">
              <div className="p-6 bg-secondary/10 rounded-[10px] border border-border">
                <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Objective & Description</p>
                <p className="text-sm font-medium leading-relaxed">{meeting.description}</p>
              </div>

              {meeting.status === "pending_cancellation" && (
                <div className="p-6 bg-rose-500/5 rounded-[10px] border border-rose-500/20">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-2 text-rose-600">Pending Cancellation Request</p>
                  <div className="space-y-2">
                    <span className="font-bold text-muted-foreground uppercase text-[8px] block">Cancellation Reason:</span>
                    <p className="text-xs font-semibold leading-relaxed italic text-foreground">
                      "{meeting.cancelReason || "No reason provided."}"
                    </p>
                  </div>
                </div>
              )}

              {meeting.status === "pending_reschedule" && (
                <div className="p-6 bg-orange-500/5 rounded-[10px] border border-orange-500/20">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-orange-600 font-bold">Pending Reschedule Request</p>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <span className="font-bold text-muted-foreground uppercase text-[8px] block">Proposed Date:</span>
                      <p className="text-xs font-black text-orange-600">{meeting.proposedDate}</p>
                    </div>
                    <div>
                      <span className="font-bold text-muted-foreground uppercase text-[8px] block">Proposed Time:</span>
                      <p className="text-xs font-black text-orange-600">{meeting.proposedHour}</p>
                    </div>
                  </div>
                  <div>
                    <span className="font-bold text-muted-foreground uppercase text-[8px] block">Reschedule Reason:</span>
                    <p className="text-xs font-semibold italic text-muted-foreground">"{meeting.rescheduleReason || "No reason provided."}"</p>
                  </div>
                </div>
              )}

              {(meeting.openingComments || meeting.closingComments) && (
                <div className="p-6 bg-secondary/10 rounded-[10px] border border-border">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 opacity-60">Field Remarks</p>
                  <div className="space-y-4">
                    {meeting.openingComments && (
                      <div>
                        <p className="text-[8px] font-black uppercase text-muted-foreground">Opening Status</p>
                        <p className="text-sm font-medium italic">"{meeting.openingComments}"</p>
                      </div>
                    )}
                    {meeting.closingComments && (
                      <div>
                        <p className="text-[8px] font-black uppercase text-muted-foreground">Closing Summary</p>
                        <p className="text-sm font-medium italic">"{meeting.closingComments}"</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {(meeting.requirements || (meeting.orders && meeting.orders.length > 0)) && (
                <div className="p-6 bg-emerald-500/5 rounded-[10px] border border-emerald-500/20">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-emerald-600">Operational Outcome</p>
                  {meeting.requirements && (
                    <div className="mb-4">
                      <p className="text-[8px] font-black uppercase text-emerald-600 opacity-60">Requirements Detected</p>
                      <p className="text-sm font-black">{meeting.requirements}</p>
                    </div>
                  )}
                  {meeting.orders && meeting.orders.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[8px] font-black uppercase text-emerald-600 opacity-60 mb-1">Direct Sale Orders</p>
                      {meeting.orders.map((o, idx) => {
                        const med = medicines.find(m => m.id === o.medicineId);
                        return (
                          <div key={idx} className="p-3 bg-white/50 dark:bg-black/20 rounded-[10px] border border-emerald-500/10 flex justify-between items-center">
                            <p className="text-xs font-black">{med?.name || o.medicineId} (x{o.qty})</p>
                            <p className="text-sm font-black text-emerald-600">{o.total.toLocaleString()} AED</p>
                          </div>
                        );
                      })}
                      <div className="pt-2 mt-2 border-t border-emerald-500/10 flex justify-between items-center">
                        <p className="text-[9px] font-black uppercase text-emerald-600">Total Revenue</p>
                        <p className="text-base font-black text-emerald-600">
                          {meeting.orders.reduce((sum, o) => sum + o.total, 0).toLocaleString()} AED
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {meeting.freeSamples && meeting.freeSamples.length > 0 && (
                <div className="p-6 bg-blue-500/5 rounded-[10px] border border-blue-500/20">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-blue-600">Sample Allocation</p>
                  <div className="space-y-2">
                    {meeting.freeSamples.map((s, idx) => {
                      const med = medicines.find(m => m.id === s.medicineId);
                      return (
                        <div key={idx} className="p-3 bg-white/50 dark:bg-black/20 rounded-[10px] border border-blue-500/10 flex justify-between items-center">
                          <div>
                            <p className="text-xs font-black">{med?.name || s.medicineId} (x{s.qty})</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase">{med?.category}</p>
                          </div>
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border",
                            s.approved 
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          )}>
                            {s.approved ? "Approved" : "Pending Approval"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {isManager && (isPending || hasPendingSamples) && (
                <div className="p-6 bg-secondary/30 rounded-[10px] border border-border mt-6">
                  <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-primary">Managerial Audit Remarks</p>
                  <textarea 
                    value={comment}
                    onChange={(e) => {
                      setComment(e.target.value);
                      if (e.target.value) setError("");
                    }}
                    placeholder="Provide audit feedback or reason for rejection..."
                    className={cn(
                      "w-full bg-white dark:bg-black/20 border rounded-[10px] p-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] resize-none",
                      error ? "border-rose-500 shadow-sm shadow-rose-500/10" : "border-border"
                    )}
                  />
                  {error && <p className="text-[10px] font-bold text-rose-500 mt-2 uppercase tracking-widest">{error}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-8 border-t border-border flex justify-end gap-3 bg-secondary/5">
          <button type="button" onClick={onClose} className="px-8 py-4 bg-secondary text-foreground font-black text-[10px] uppercase rounded-[10px] hover:bg-secondary/70 transition-all">Close</button>
          
          {isStaff && (meeting.status === "scheduled" || meeting.status === "upcoming") && (
            <div className="flex gap-2">
              <button
                id="staff-request-cancel-btn"
                type="button"
                onClick={() => setActionType("cancel")}
                className="px-6 py-4 bg-rose-500/10 text-rose-600 border border-rose-500/20 font-black text-[10px] uppercase rounded-[10px] hover:bg-rose-500 hover:text-white transition-all"
              >
                Cancel Appointment
              </button>
              <button
                id="staff-request-reschedule-btn"
                type="button"
                onClick={() => setActionType("reschedule")}
                className="px-6 py-4 bg-orange-500/10 text-orange-600 border border-orange-500/20 font-black text-[10px] uppercase rounded-[10px] hover:bg-orange-500 hover:text-white transition-all"
              >
                Reschedule
              </button>
            </div>
          )}

          {canLog && onLogVisit && (
            <button type="button" onClick={onLogVisit} className="px-12 py-4 bg-primary text-primary-foreground font-black text-[10px] uppercase rounded-[10px] shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Log Visit Outcome</button>
          )}

          {isManager && meeting.status === "pending_cancellation" && (
            <div className="flex gap-2">
              <button 
                id="manager-reject-cancel-btn"
                type="button" 
                onClick={() => {
                  updateAppointment(meeting.id, { status: "scheduled", managerComment: "Cancellation request rejected by manager." });
                  onClose();
                }} 
                className="px-6 py-4 bg-secondary text-foreground border border-border font-black text-[10px] uppercase rounded-[10px] hover:bg-secondary/70 transition-all"
              >
                Reject Cancellation
              </button>
              <button 
                id="manager-approve-cancel-btn"
                type="button" 
                onClick={() => {
                  updateAppointment(meeting.id, { status: "cancelled", managerComment: "Cancellation approved by manager." });
                  onClose();
                }} 
                className="px-12 py-4 bg-rose-500 text-white font-black text-[10px] uppercase rounded-[10px] shadow-xl shadow-rose-500/20 hover:scale-[1.02] transition-all"
              >
                Approve Cancellation
              </button>
            </div>
          )}

          {isManager && meeting.status === "pending_reschedule" && (
            <div className="flex gap-2">
              <button 
                id="manager-reject-reschedule-btn"
                type="button" 
                onClick={() => {
                  updateAppointment(meeting.id, { status: "scheduled", managerComment: "Reschedule request rejected by manager." });
                  onClose();
                }} 
                className="px-6 py-4 bg-secondary text-foreground border border-border font-black text-[10px] uppercase rounded-[10px] hover:bg-secondary/70 transition-all"
              >
                Reject Reschedule
              </button>
              <button 
                id="manager-approve-reschedule-btn"
                type="button" 
                onClick={() => {
                  updateAppointment(meeting.id, { 
                    date: meeting.proposedDate || meeting.date, 
                    hour: meeting.proposedHour || meeting.hour, 
                    status: "scheduled", 
                    managerComment: "Reschedule approved by manager.",
                    proposedDate: undefined,
                    proposedHour: undefined
                  });
                  onClose();
                }} 
                className="px-12 py-4 bg-emerald-500 text-white font-black text-[10px] uppercase rounded-[10px] shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all"
              >
                Approve Reschedule
              </button>
            </div>
          )}

          {isManager && (isPending || hasPendingSamples) && (
            <div className="flex gap-2">
              <button 
                type="button" 
                onClick={() => {
                  if (!comment.trim()) {
                    setError("REJECTION REQUIRES A COMMENT");
                    return;
                  }
                  updateAppointment(meeting.id, { status: "cancelled", managerComment: comment });
                  onClose();
                }} 
                className="px-6 py-4 bg-rose-500/10 text-rose-600 border border-rose-500/20 font-black text-[10px] uppercase rounded-[10px] hover:bg-rose-500 hover:text-white transition-all"
              >
                Reject Report
              </button>
              <button 
                type="button" 
                onClick={() => {
                  if (hasPendingSamples) approveSamples(meeting.id);
                  updateAppointment(meeting.id, { status: "completed", managerComment: comment });
                  onClose();
                }} 
                className="px-12 py-4 bg-emerald-500 text-white font-black text-[10px] uppercase rounded-[10px] shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all"
              >
                Authorize & Complete
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
