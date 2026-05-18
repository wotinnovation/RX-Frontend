"use client";

import React, { useState } from "react";
import { X, Users, MapPin, Mail, Phone, Lock, DollarSign, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useData } from "@/lib/context/data-context";
import { cn } from "@/lib/utils";

interface NewStaffFormProps {
  onClose: () => void;
  isModal?: boolean;
}

export function NewStaffForm({ onClose, isModal = true }: NewStaffFormProps) {
  const { addRep } = useData();
  
  const [formData, setFormData] = useState({
    name: "",
    role: "Sales Person",
    zone: "Dubai North",
    password: "rx-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
    targetAmount: 25000,
    planned: 40,
    email: "",
    mobile: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addRep(formData);
    onClose();
  };

  const content = (
    <div className={cn("relative bg-card border border-border w-full max-w-2xl rounded-[10px] shadow-2xl overflow-hidden flex flex-col h-[72vh] max-h-[90vh] pointer-events-auto", !isModal && "max-w-none border-0 shadow-none rounded-none h-full")}>
      {isModal && (
        <div className="p-8 bg-indigo-600 text-white relative shrink-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent)]" />
          <button type="button" onClick={onClose} className="absolute top-8 right-8 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-all z-50 pointer-events-auto"><X size={20} /></button>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-2">
              <Users size={14} className="fill-current" />
              <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-70">Team Expansion</p>
            </div>
            <h3 className="text-3xl font-black tracking-tighter">Add New Staff</h3>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-10 space-y-8 overflow-y-auto custom-scrollbar flex-1">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Full Name</label>
            <div className="relative group">
              <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Faisal Al Marzouqi" className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Role / Designation</label>
            <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all appearance-none cursor-pointer">
              <option>Sales Person</option>
              <option>Area Manager</option>
              <option>Medical Liaison</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Assigned Zone</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input required value={formData.zone} onChange={e => setFormData({...formData, zone: e.target.value})} placeholder="e.g. Marina · JBR" className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Access Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-emerald-500/5 border border-emerald-500/20 text-emerald-700 rounded-[10px] text-sm font-black focus:outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="f.marzouqi@rx.com" className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Mobile Number</label>
            <div className="relative group">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input type="tel" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} placeholder="+971 50 ..." className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Monthly Target (AED)</label>
            <div className="relative group">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input type="number" required value={formData.targetAmount} onChange={e => setFormData({...formData, targetAmount: parseInt(e.target.value)})} className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Visits Target</label>
            <div className="relative group">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-indigo-600 transition-colors" size={18} />
              <input type="number" required value={formData.planned} onChange={e => setFormData({...formData, planned: parseInt(e.target.value)})} className="w-full pl-12 pr-4 py-4 bg-secondary/30 border border-border rounded-[10px] text-sm font-bold focus:outline-none focus:ring-4 focus:ring-indigo-600/10 transition-all" />
            </div>
          </div>
        </div>
      </form>

      <div className="p-8 border-t border-border bg-secondary/10 flex justify-end gap-4 shrink-0">
        <button type="button" onClick={onClose} className="px-8 py-4 text-muted-foreground font-black text-[10px] uppercase hover:bg-secondary rounded-[10px] transition-all">Cancel</button>
        <button onClick={handleSubmit} className="px-12 py-4 bg-indigo-600 text-white font-black text-[10px] uppercase rounded-[10px] shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all">Create Profile</button>
      </div>
    </div>
  );

  if (!isModal) return content;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      {content}
    </div>
  );
}
