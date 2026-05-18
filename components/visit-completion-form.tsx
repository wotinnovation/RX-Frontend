"use client";

import React, { useState } from "react";
import { 
  X,
  Building2,
  Calendar,
  Clock,
  MessageSquare,
  ClipboardList,
  Zap,
  Package,
  Plus,
  ShoppingCart,
  FileText,
  Upload,
  CheckCircle2,
  Search
} from "lucide-react";
import { motion } from "framer-motion";
import { Appointment, useData } from "@/lib/context/data-context";
import { cn } from "@/lib/utils";

interface VisitCompletionFormProps {
  meeting: Appointment;
  onClose: () => void;
}

function SearchableSelect({ 
  items, 
  onSelect, 
  placeholder,
  theme = "default"
}: { 
  items: any[], 
  onSelect: (id: string) => void,
  placeholder: string,
  theme?: "default" | "blue" | "emerald"
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = items.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

  const themeClasses = {
    default: "bg-secondary/50 border-border text-foreground hover:bg-secondary",
    blue: "bg-blue-500/10 border-blue-500/20 text-blue-700 hover:bg-blue-500/20",
    emerald: "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 hover:bg-emerald-500/20"
  };
  
  const hoverClasses = {
    default: "hover:bg-secondary/50",
    blue: "hover:bg-blue-500/10 hover:text-blue-700",
    emerald: "hover:bg-emerald-500/10 hover:text-emerald-700"
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "border rounded-lg px-3 py-1.5 text-[10px] font-bold outline-none cursor-pointer transition-colors flex items-center justify-between min-w-[160px]",
          themeClasses[theme]
        )}
      >
        <span className="truncate">{placeholder}</span>
        <Plus size={12} className="ml-2 flex-shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-[220px] bg-white dark:bg-slate-900 border border-border rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-border/50 flex items-center gap-2">
            <Search size={12} className="text-muted-foreground flex-shrink-0" />
            <input 
              type="text"
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full bg-transparent border-none outline-none text-[10px] font-medium"
            />
          </div>
          <div className="max-h-[200px] overflow-y-auto custom-scrollbar p-1">
            {filtered.length === 0 ? (
              <div className="p-3 text-center text-[10px] text-muted-foreground font-medium">No results found</div>
            ) : (
              filtered.map(m => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => {
                    onSelect(m.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={cn(
                    "w-full text-left px-3 py-2 text-[10px] font-bold rounded-md transition-colors flex justify-between items-center gap-2",
                    hoverClasses[theme]
                  )}
                >
                  <span className="truncate">{m.name}</span>
                  {m.price && <span className="text-[9px] text-muted-foreground opacity-70 whitespace-nowrap">AED {m.price}</span>}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function VisitCompletionForm({ meeting, onClose }: VisitCompletionFormProps) {
  const { medicines, reps, doctors, updateAppointment } = useData();
  
  const [reportData, setReportData] = useState<Partial<Appointment>>({
    openingComments: meeting.openingComments || "",
    requirements: meeting.requirements || "",
    customCompound: meeting.customCompound || "",
    freeSamples: meeting.freeSamples || [],
    orders: meeting.orders || [],
    closingComments: meeting.closingComments || "",
    status: "completed"
  });

  const [outcomeStatus, setOutcomeStatus] = useState<string>("completed");
  const [proposedDate, setProposedDate] = useState<string>(meeting.date);
  const [proposedHour, setProposedHour] = useState<string>(meeting.hour);
  const [rescheduleReason, setRescheduleReason] = useState<string>("");
  const [cancelReason, setCancelReason] = useState<string>("");

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleSaveReport = () => {
    const finalData: Partial<Appointment> = {
      ...reportData,
      status: outcomeStatus as any,
    };
    if (outcomeStatus === "pending_reschedule") {
      finalData.proposedDate = proposedDate;
      finalData.proposedHour = proposedHour;
      finalData.rescheduleReason = rescheduleReason;
    } else if (outcomeStatus === "pending_cancellation") {
      finalData.cancelReason = cancelReason;
    } else if (outcomeStatus === "completed") {
      // Auto-approve samples for completed visits since VISIT NO NEED TO APPROVAL FROM MANAGER
      if (finalData.freeSamples) {
        finalData.freeSamples = finalData.freeSamples.map(s => ({ ...s, approved: true }));
      }
    }
    updateAppointment(meeting.id, finalData);
    onClose();
  };

  const addFreeSample = () => {
    const newSamples = [...(reportData.freeSamples || []), { medicineId: medicines[0]?.id || "", qty: 1 }];
    setReportData({ ...reportData, freeSamples: newSamples });
  };

  const updateFreeSample = (index: number, field: string, value: any) => {
    const newSamples = [...(reportData.freeSamples || [])];
    newSamples[index] = { ...newSamples[index], [field]: value };
    setReportData({ ...reportData, freeSamples: newSamples });
  };

  const removeFreeSample = (index: number) => {
    const newSamples = [...(reportData.freeSamples || [])].filter((_, i) => i !== index);
    setReportData({ ...reportData, freeSamples: newSamples });
  };

  const addOrder = (medicineId: string) => {
    const med = medicines.find(m => m.id === medicineId);
    if (!med) return;
    const newOrders = [...(reportData.orders || []), { medicineId, qty: 1, total: med.price }];
    setReportData({ ...reportData, orders: newOrders });
  };

  const updateOrder = (index: number, field: string, value: any) => {
    const newOrders = [...(reportData.orders || [])];
    const updatedOrder = { ...newOrders[index], [field]: value };
    
    if (field === "medicineId" || field === "qty") {
      const med = medicines.find(m => m.id === updatedOrder.medicineId);
      if (med) {
        updatedOrder.total = med.price * updatedOrder.qty;
      }
    }
    
    newOrders[index] = updatedOrder;
    setReportData({ ...reportData, orders: newOrders });
  };

  const removeOrder = (index: number) => {
    const newOrders = [...(reportData.orders || [])].filter((_, i) => i !== index);
    setReportData({ ...reportData, orders: newOrders });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-stretch justify-end pointer-events-none">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
        onClick={onClose} 
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-sm pointer-events-auto cursor-pointer" 
      />
      <motion.div 
        initial={{ x: "100%", opacity: 0 }} 
        animate={{ x: 0, opacity: 1 }} 
        exit={{ x: "100%", opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative bg-card border-l border-border w-full max-w-3xl shadow-2xl overflow-hidden flex flex-col h-full pointer-events-auto rounded-l-[2.5rem] rounded-r-none"
      >
        {/* Simple Header */}
        <div className="p-4 border-b border-border relative bg-secondary/10">
          <button 
            type="button"
            onClick={onClose} 
            className="absolute top-4 right-4 w-7 h-7 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <X size={14} />
          </button>
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.3em] text-primary mb-0.5">Log Visit Outcome</p>
              <h2 className="text-lg font-black tracking-tight">{meeting.title}</h2>
              <div className="flex items-center gap-4 mt-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span className="flex items-center gap-1.5"><Building2 size={12} /> {meeting.entityName}</span>
                <span className="flex items-center gap-1.5"><Clock size={12} /> {meeting.hour}</span>
              </div>
            </div>

             <div className="flex flex-col md:flex-row gap-3 min-w-[400px]">
              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Accompanied With</label>
                <select 
                  className="w-full px-4 py-2 bg-card border border-border rounded-lg text-[11px] font-bold outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                  defaultValue=""
                >
                  <option value="">No Accompaniment</option>
                  <optgroup label="Field Staff">
                    {reps.filter(r => r.role.toLowerCase() !== "manager").map(r => (
                      <option key={r.id} value={r.id}>{r.name} ({r.role})</option>
                    ))}
                  </optgroup>
                  <optgroup label="Management">
                    {reps.filter(r => r.role.toLowerCase() === "manager").map(r => (
                      <option key={r.id} value={r.id}>{r.name} (Sales Manager)</option>
                    ))}
                  </optgroup>
                </select>
              </div>

              <div className="flex-1 flex flex-col gap-1.5">
                <label className="text-[9px] font-black uppercase tracking-widest text-muted-foreground ml-1">Outcome Status</label>
                <select 
                  id="outcome-status-select"
                  value={outcomeStatus}
                  onChange={(e) => setOutcomeStatus(e.target.value)}
                  className={cn(
                    "w-full px-4 py-2 border rounded-lg text-[11px] font-black outline-none cursor-pointer transition-all",
                    outcomeStatus === "completed" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 focus:ring-emerald-500" :
                    outcomeStatus === "pending_reschedule" ? "bg-orange-500/10 border-orange-500/30 text-orange-600 focus:ring-orange-500" :
                    "bg-rose-500/10 border-rose-500/30 text-rose-600 focus:ring-rose-500"
                  )}
                >
                  <option value="completed">Completed / Visited</option>
                  <option value="pending_reschedule">Request Reschedule</option>
                  <option value="pending_cancellation">Request Cancel</option>
                </select>
              </div>
            </div>
          </div>
        </div>
        {/* Two-Section Grid Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/30 dark:bg-slate-900/10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-px bg-border">
            
            {/* Left Section: Clinical Detailing & Feedback */}
            <div className="bg-card p-8 space-y-10">
              <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <MessageSquare size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">Detailing & Feedback</h3>
              </div>

              {outcomeStatus === "pending_reschedule" && (
                <div className="p-6 bg-orange-500/5 border border-orange-500/20 rounded-[10px] space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-orange-600 font-bold">Rescheduling Request Details</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Proposed Date</label>
                      <input 
                        id="form-reschedule-date"
                        type="date" 
                        value={proposedDate}
                        onChange={(e) => setProposedDate(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-border rounded-lg text-xs font-black"
                      />
                    </div>
                    <div>
                      <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Proposed Hour</label>
                      <select 
                        id="form-reschedule-hour"
                        value={proposedHour}
                        onChange={(e) => setProposedHour(e.target.value)}
                        className="w-full p-2 bg-white dark:bg-slate-900 border border-border rounded-lg text-xs font-black"
                      >
                        {["08:00", "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00"].map(h => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Reason for Rescheduling</label>
                    <textarea 
                      id="form-reschedule-reason"
                      placeholder="Why does this visit need to be rescheduled?"
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-border rounded-lg text-xs font-semibold min-h-[60px] resize-none"
                    />
                  </div>
                </div>
              )}

              {outcomeStatus === "pending_cancellation" && (
                <div className="p-6 bg-rose-500/5 border border-rose-500/20 rounded-[10px] space-y-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 font-bold">Cancellation Request Details</p>
                  <div>
                    <label className="text-[8px] font-black uppercase tracking-widest text-muted-foreground block mb-1">Reason for Cancellation</label>
                    <textarea 
                      id="form-cancel-reason"
                      placeholder="Why does this visit need to be cancelled?"
                      value={cancelReason}
                      onChange={(e) => setCancelReason(e.target.value)}
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-border rounded-lg text-xs font-semibold min-h-[80px] resize-none"
                    />
                  </div>
                </div>
              )}

              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Opening Remarks</label>
                <textarea 
                  placeholder="Enter visit opening notes..."
                  value={reportData.openingComments}
                  onChange={(e) => setReportData({...reportData, openingComments: e.target.value})}
                  className="w-full p-5 bg-secondary/30 border border-border rounded-[10px] focus:ring-1 focus:ring-primary outline-none text-sm min-h-[100px] resize-none font-medium"
                />
              </section>

              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Requirement Collection</label>
                <textarea 
                  placeholder="Document specific facility needs..."
                  value={reportData.requirements}
                  onChange={(e) => setReportData({...reportData, requirements: e.target.value})}
                  className="w-full p-5 bg-secondary/30 border border-border rounded-[10px] focus:ring-1 focus:ring-primary outline-none text-sm min-h-[100px] resize-none font-medium"
                />
              </section>

              <section className="space-y-4 p-6 bg-purple-500/5 border border-purple-500/10 rounded-[10px]">
                <div className="flex items-center gap-2 text-purple-600 mb-2">
                  <Zap size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Custom Formulation</span>
                </div>
                <textarea 
                  placeholder="Define custom compound details..."
                  value={reportData.customCompound}
                  onChange={(e) => setReportData({...reportData, customCompound: e.target.value})}
                  className="w-full p-4 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-purple-500/20 rounded-[10px] focus:outline-none text-sm min-h-[80px] resize-none font-medium"
                />
              </section>

              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Closing & Follow-up</label>
                <textarea 
                  placeholder="Final feedback and follow-up timeline..."
                  value={reportData.closingComments}
                  onChange={(e) => setReportData({...reportData, closingComments: e.target.value})}
                  className="w-full p-5 bg-secondary/30 border border-border rounded-[10px] focus:ring-1 focus:ring-primary outline-none text-sm min-h-[120px] resize-none font-medium"
                />
              </section>
            </div>

            {/* Right Section: Allocation & Orders */}
            <div className="bg-card p-8 space-y-10 border-l border-border">
              <div className="flex items-center gap-3 pb-2 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                  <Package size={18} />
                </div>
                <h3 className="text-sm font-black uppercase tracking-widest">Allocation & Orders</h3>
              </div>

              {/* Samples Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black uppercase text-muted-foreground ml-1">Free Samples</span>
                  <SearchableSelect 
                    items={medicines}
                    placeholder="Quick Add Sample..."
                    theme="default"
                    onSelect={(medicineId) => {
                      const newSamples = [...(reportData.freeSamples || []), { medicineId, qty: 1, approved: false }];
                      setReportData({ ...reportData, freeSamples: newSamples });
                    }}
                  />
                </div>
                <div className="space-y-2 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                  {reportData.freeSamples?.map((sample, idx) => {
                    const med = medicines.find(m => m.id === sample.medicineId);
                    return (
                      <div key={idx} className="flex items-center justify-between p-3 bg-secondary/20 border border-border/50 rounded-xl group/sample">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Package size={14} />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-tight">{med?.name}</p>
                            <p className="text-[8px] font-bold text-muted-foreground uppercase">{med?.category}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => updateFreeSample(idx, "approved", !sample.approved)}
                            className={cn(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all",
                              sample.approved 
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20" 
                                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                            )}
                          >
                            {sample.approved ? <CheckCircle2 size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-current opacity-30" />}
                            {sample.approved ? "Approved" : "Pending"}
                          </button>
                          <input 
                            type="number" 
                            value={sample.qty}
                            onChange={(e) => updateFreeSample(idx, "qty", parseInt(e.target.value) || 1)}
                            className="w-10 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-border rounded-lg text-center font-black text-[10px] py-1.5"
                          />
                          <button onClick={() => removeFreeSample(idx)} className="text-rose-500 hover:text-rose-600 transition-colors p-1">
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  {(!reportData.freeSamples || reportData.freeSamples.length === 0) && (
                    <div className="py-8 text-center border-2 border-dashed border-border rounded-xl">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">No samples added</p>
                    </div>
                  )}
                </div>
              </section>

              <section className="space-y-4 p-6 bg-blue-500/5 border border-blue-500/10 rounded-[10px]">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-blue-600">
                    <ShoppingCart size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Direct Sale Order</span>
                  </div>
                  <SearchableSelect 
                    items={medicines}
                    placeholder="Add Product..."
                    theme="blue"
                    onSelect={(medicineId) => {
                      addOrder(medicineId);
                    }}
                  />
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {reportData.orders?.map((order, idx) => {
                    const med = medicines.find(m => m.id === order.medicineId);
                    return (
                      <div key={idx} className="space-y-2 p-4 bg-white dark:bg-slate-900 border border-blue-500/10 rounded-xl">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600">
                              <ShoppingCart size={14} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-tight">{med?.name}</p>
                              <p className="text-[8px] font-bold text-muted-foreground uppercase">AED {med?.price} / unit</p>
                            </div>
                          </div>
                          <button onClick={() => removeOrder(idx)} className="text-rose-500 hover:text-rose-600 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                        <div className="flex gap-3 mt-2">
                          <input 
                            type="number" 
                            placeholder="Qty"
                            value={order.qty}
                            onChange={(e) => updateOrder(idx, "qty", parseInt(e.target.value) || 0)}
                            className="w-20 px-3 py-2 bg-secondary/30 border border-border rounded-lg font-bold text-[11px] outline-none focus:ring-1 focus:ring-blue-500 text-center"
                          />
                          <div className="flex-1 flex items-center justify-between px-4 py-2 bg-blue-600 text-white rounded-lg font-black text-[11px]">
                            <span className="uppercase opacity-70">Total:</span>
                            <span>AED {(order.total || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {(!reportData.orders || reportData.orders.length === 0) && (
                    <div className="py-8 text-center border-2 border-dashed border-blue-500/10 rounded-xl">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase">No products ordered</p>
                    </div>
                  )}
                </div>

                {reportData.orders && reportData.orders.length > 0 && (
                  <div className="pt-4 border-t border-blue-500/10 flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-muted-foreground">Grand Total</span>
                    <span className="text-lg font-black text-blue-600">
                      AED {reportData.orders.reduce((sum, o) => sum + (o.total || 0), 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </section>

              <section className="space-y-4">
                <label className="text-[10px] font-black uppercase text-muted-foreground ml-1">Prescription Verification</label>
                <div className="border-2 border-dashed border-border rounded-[10px] p-6 text-center hover:bg-secondary/20 cursor-pointer group transition-colors">
                  <Upload size={20} className="mx-auto mb-2 text-muted-foreground group-hover:text-primary transition-colors" />
                  <p className="text-[9px] font-bold uppercase text-muted-foreground">Upload clinical scans / Proof</p>
                </div>
              </section>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="p-8 border-t border-border bg-secondary/10 flex items-center justify-end gap-4">
          <div className="flex items-center gap-3 mr-auto">
            <div className={cn(
              "w-2 h-2 rounded-full animate-pulse",
              outcomeStatus === "completed" ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <span className={cn(
              "text-[10px] font-black uppercase tracking-[0.2em]",
              outcomeStatus === "completed" ? "text-emerald-600" : "text-amber-600"
            )}>
              {outcomeStatus === "completed" ? "Directly Logged (No Manager Approval Required)" : "Awaiting Managerial Audit"}
            </span>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="px-6 py-3 text-muted-foreground font-black text-[10px] uppercase hover:bg-secondary rounded-[10px] transition-colors">Discard</button>
            <button 
              id="finalize-visit-btn"
              type="button"
              onClick={handleSaveReport} 
              className="px-10 py-3 bg-primary text-primary-foreground font-black text-[10px] uppercase rounded-[10px] shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
            >
              {outcomeStatus === "completed" ? "Finalize Visit" : "Submit Request"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

