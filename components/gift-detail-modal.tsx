"use client";

import React from "react";
import { X, Gift, Coffee, Building2, User, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import { GiftMeetup } from "@/lib/context/data-context";
import { cn } from "@/lib/utils";

interface GiftDetailModalProps {
  item: GiftMeetup;
  onClose: () => void;
  onApprove: (id: string, comment?: string) => void;
  onReject: (id: string, comment: string) => void;
}

export function GiftDetailModal({ item, onClose, onApprove, onReject }: GiftDetailModalProps) {
  const [comment, setComment] = React.useState("");
  const [error, setError] = React.useState("");
  const [complianceStatus, setComplianceStatus] = React.useState("compliant");
  const [authCode, setAuthCode] = React.useState("");
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

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
        className="relative bg-card border border-border w-full max-w-xl rounded-[10px] shadow-2xl overflow-hidden pointer-events-auto"
      >
        <div className={cn(
          "px-10 py-6 text-white relative overflow-hidden",
          item.type === 'gift' ? "bg-primary" : "bg-blue-600"
        )}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent)]" />
          <button type="button" onClick={onClose} className="absolute top-1/2 -translate-y-1/2 right-8 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 z-50 transition-colors"><X size={20} /></button>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1 opacity-70">
              {item.type === 'gift' ? <Gift size={14} /> : <Coffee size={14} />}
              <p className="text-[10px] font-black uppercase tracking-[0.4em]">
                {item.type === 'gift' ? "Promotional Gift" : "Professional Meetup"}
              </p>
            </div>
            <h3 className="text-2xl font-black tracking-tighter pr-12">{item.item}</h3>
            <div className="mt-2 flex items-center gap-2">
               <span className="px-3 py-0.5 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">
                 {item.status.replace('_', ' ')}
               </span>
               <span className="px-3 py-0.5 bg-white/20 rounded-full text-[10px] font-black tabular-nums">
                 AED {item.cost?.toLocaleString()}
               </span>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2">Staff Member</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User size={14} className="text-muted-foreground" />
                  </div>
                  <p className="font-black text-sm">{item.staffName}</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2">Facility</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Building2 size={14} className="text-muted-foreground" />
                  </div>
                  <p className="font-black text-sm">{item.hospitalName}</p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2">Beneficiary (Doctor)</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <User size={14} className="text-muted-foreground" />
                  </div>
                  <p className="font-black text-sm">{item.doctorName}</p>
                </div>
              </div>
              <div>
                <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-2">Activity Date</p>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                    <Calendar size={14} className="text-muted-foreground" />
                  </div>
                  <p className="font-black text-sm">{item.date}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-6 bg-secondary/10 rounded-[10px] border border-border">
             <div className="flex justify-between items-center mb-4">
               <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Provision Details</p>
               <p className="text-[10px] font-black uppercase text-primary">Qty: {item.quantity}</p>
             </div>
             <p className="text-sm font-medium leading-relaxed italic">
               Logged provision of {item.item} for clinical relationship management at {item.hospitalName}.
             </p>
          </div>

          {item.proofUrl && (
            <div className="p-6 bg-secondary/5 rounded-[10px] border border-border">
              <p className="text-[10px] font-black uppercase tracking-widest mb-4 opacity-60">Attached Confirmation / Receipt</p>
              <div className="relative w-full h-48 rounded-[10px] overflow-hidden border border-border">
                <img src={item.proofUrl} alt="Receipt / Proof" className="object-cover w-full h-full hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          )}

          {item.managerComment && (
            <div className="p-6 bg-secondary/20 rounded-[10px] border border-border">
              <p className="text-[10px] font-black uppercase tracking-widest mb-3 text-primary">Compliance Audit Logs</p>
              <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-border text-xs leading-relaxed font-mono">
                {item.managerComment}
              </div>
            </div>
          )}

          {item.status === 'pending_approval' && (
            <div className="p-6 bg-secondary/30 rounded-[10px] border border-border space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Compliance Audit & Authorization Console</p>
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Compliance Check</label>
                  <select 
                    value={complianceStatus}
                    onChange={(e) => setComplianceStatus(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs font-bold focus:outline-none cursor-pointer"
                  >
                    <option value="compliant">Compliant with Policy</option>
                    <option value="exception">Policy Exception Granted</option>
                    <option value="needs_review">Requires Board Review</option>
                  </select>
                </div>
                
                <div className="space-y-1">
                  <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Digital Authorization Code</label>
                  <input 
                    type="password"
                    value={authCode}
                    onChange={(e) => {
                      setAuthCode(e.target.value);
                      if (e.target.value) setError("");
                    }}
                    placeholder="Enter Authorization Code..."
                    className="w-full bg-white dark:bg-slate-900 border border-border rounded-lg px-3 py-2 text-xs font-bold focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground ml-1">Liaison Audit Comments</label>
                <textarea 
                  value={comment}
                  onChange={(e) => {
                    setComment(e.target.value);
                    if (e.target.value) setError("");
                  }}
                  placeholder="Enter audit review comments, required for exception/rejection..."
                  className={cn(
                    "w-full bg-white dark:bg-slate-900 border rounded-lg p-3 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[60px] resize-none",
                    error ? "border-rose-500" : "border-border"
                  )}
                />
              </div>
              
              {error && <p className="text-[9px] font-black text-rose-500 uppercase tracking-widest ml-1">{error}</p>}
            </div>
          )}
        </div>

        <div className="p-8 border-t border-border flex justify-end gap-3 bg-secondary/5">
          <button type="button" onClick={onClose} className="px-8 py-4 bg-secondary text-foreground font-black text-[10px] uppercase rounded-[10px] hover:bg-secondary/70 transition-all">Close</button>
          {item.status === 'pending_approval' && (
            <>
              <button 
                type="button" 
                onClick={() => { 
                  if (!comment.trim()) {
                    setError("REJECTION REQUIRES AUDIT COMMENTS");
                    return;
                  }
                  if (!authCode.trim()) {
                    setError("DIGITAL AUTHORIZATION CODE REQUIRED");
                    return;
                  }
                  onReject(item.id, `[Compliance: REJECTED] Code: ${authCode.substring(0, 2)}** | ${comment}`); 
                  onClose(); 
                }} 
                className="px-8 py-4 bg-rose-500/10 text-rose-600 font-black text-[10px] uppercase rounded-[10px] hover:bg-rose-500/20 transition-all flex items-center gap-2"
              >
                <XCircle size={14} /> Reject
              </button>
              <button 
                type="button" 
                onClick={() => { 
                  if (!authCode.trim()) {
                    setError("DIGITAL AUTHORIZATION CODE REQUIRED");
                    return;
                  }
                  onApprove(item.id, `[Compliance: ${complianceStatus.toUpperCase()}] Code: ${authCode.substring(0, 2)}** | ${comment || "Approved compliant"}`); 
                  onClose(); 
                }} 
                className="px-10 py-4 bg-emerald-500 text-white font-black text-[10px] uppercase rounded-[10px] shadow-xl shadow-emerald-500/20 hover:scale-[1.02] transition-all flex items-center gap-2"
              >
                <CheckCircle2 size={14} /> Approve Now
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
