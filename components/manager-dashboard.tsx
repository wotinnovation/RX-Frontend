"use client";

import { useState, useMemo } from "react";
import { 
  Users, 
  MapPin, 
  Calendar, 
  Stethoscope, 
  TrendingUp, 
  Award, 
  Clock, 
  AlertTriangle,
  ChevronRight,
  Filter,
  Plus,
  Package,
  UserPlus,
  Hospital as HospitalIcon,
  Search,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  X,
  Lock,
  Wallet,
  Gift,
  Pill,
  MoreHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useData, Hospital, SalesRep } from "@/lib/context/data-context";
import { DashboardOverview } from "./dashboard-overview";
import { RepDetailedPerformance } from "./rep-detailed-performance";
import { AppointmentDetailModal } from "./appointment-detail-modal";
import { GiftDetailModal } from "./gift-detail-modal";
import Link from "next/link";

export function ManagerDashboard() {
  const { 
    hospitals, reps, medicines, appointments, doctors, 
    expenses, giftMeetups, updateExpenseStatus,
    updateAppointment, updateGiftMeetupStatus, approveSamples,
    assignHospital,
    isLoading 
  } = useData();
  
  const [selectedRep, setSelectedRep] = useState<SalesRep | null>(null);
  const [viewAsRep, setViewAsRep] = useState<SalesRep | null>(null);
  const [showBulkAssign, setShowBulkAssign] = useState(false);
  const [showDetailedRep, setShowDetailedRep] = useState<SalesRep | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [selectedGift, setSelectedGift] = useState<any>(null);
  
  // Combine all pending approvals for the unified "Action Required" section
  const unifiedPending = useMemo(() => {
    const pendingExpenses = expenses.filter(e => e.status === "pending").map(e => ({ ...e, category: 'Expense', title: e.description }));
    const pendingVisits = appointments.filter(a => a.status === "pending_approval").map(v => ({ ...v, category: 'Visit', title: v.title }));
    const pendingGifts = giftMeetups.filter(g => g.status === "pending_approval").map(g => ({ ...g, category: 'Gift/Meetup', title: g.item }));
    const pendingSamples = appointments.filter(a => a.freeSamples && a.freeSamples.some(s => !s.approved)).map(s => ({ ...s, category: 'Samples', title: 'Clinical Sample Provision' }));

    return [...pendingExpenses, ...pendingVisits, ...pendingGifts, ...pendingSamples]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [expenses, appointments, giftMeetups]);

  const handleApproveAll = (appId: string) => {
    approveSamples(appId);
  };

  const handleRowClick = (item: any) => {
    if (item.category === 'Visit' || item.category === 'Samples') setSelectedAppointment(item);
    if (item.category === 'Gift/Meetup') setSelectedGift(item);
  };
  
  const activeRep = selectedRep || reps[0];

  const currentWeekDays = useMemo(() => {
    const now = new Date();
    const dayOfWeek = now.getDay(); 
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    
    return [0, 1, 2, 3, 4, 5].map(offset => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + offset);
      return {
        label: d.toLocaleDateString('en-US', { weekday: 'short', day: '2-digit' }).replace(',', ' ·'),
        dateStr: d.toISOString().split('T')[0],
        isToday: d.toISOString().split('T')[0] === now.toISOString().split('T')[0]
      };
    });
  }, []);

  const getStatusStyles = (s: string) => {
    switch (s) {
      case "complete": return "bg-emerald-500/10 text-emerald-600";
      case "behind": return "bg-orange-500/10 text-orange-600";
      case "no check-in": return "bg-red-500/10 text-red-600";
      default: return "bg-blue-500/10 text-blue-600";
    }
  };

  if (isLoading) return (
    <div className="flex items-center justify-center p-20">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (showDetailedRep) {
    return <RepDetailedPerformance rep={showDetailedRep} onBack={() => setShowDetailedRep(null)} />;
  }

  if (viewAsRep) {
    return (
      <div className="space-y-6">
        <button onClick={() => setViewAsRep(null)} className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-[10px] font-bold text-sm transition-all"><ArrowLeft size={18} /> Back to Manager Dashboard</button>
        <div className="p-1 border-2 border-dashed border-white/30 rounded-[10px]">
          <div className="bg-white/10 backdrop-blur-sm p-4 rounded-[10px] mb-4 text-center">
            <p className="text-xs font-black uppercase tracking-widest opacity-80">Preview Mode: Viewing as <span className="text-white">{viewAsRep.name}</span></p>
          </div>
          <DashboardOverview mockUser={{ name: viewAsRep.name, role: "Sales Person" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4 dashboard-header">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider opacity-60 min-[1400px]:block hidden">Team Management Dashboard</h2>
          <h1 className="text-4xl font-extrabold mt-1 tracking-tight">Field Operations Overview</h1>
          <p className="opacity-60 mt-2">Monday, 04 May 2026 · 8 active reps · UAE Territories</p>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Active Reps" value="8/10" sub="2 on leave" icon={Users} color="bg-blue-500" href="/dashboard/team" />
        <KPICard label="Visits Today" value="42 / 56" sub="75% Achievement" icon={MapPin} color="bg-emerald-500" href="/dashboard/manager-appointments" />
        <KPICard label="Action Required" value={unifiedPending.length.toString()} sub="Pending Approvals" icon={AlertTriangle} color="bg-red-500" href="/dashboard/approvals" />
        <KPICard label="Follow-ups" value="14" sub="5 overdue" icon={Clock} color="bg-amber-500" href="/dashboard/manager-appointments" />
        <KPICard label="Unassigned" value={hospitals.filter(h => !h.assignedRepId).length.toString()} sub="Needs assignment" icon={MapPin} color="bg-indigo-500" href="/dashboard/customers" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-[10px] card-shadow overflow-hidden">
          <div className="p-6 border-b border-border flex items-center justify-between bg-secondary/20">
            <div>
              <h3 className="text-xl font-bold">Sales team — today's progress</h3>
              <p className="text-xs text-muted-foreground mt-1">Click any rep to see their visits and remarks</p>
            </div>
          </div>
          <div className="divide-y divide-border overflow-x-auto">
            {reps.slice(0, 6).map((rep) => (
              <div key={rep.id} onClick={() => setShowDetailedRep(rep)} onMouseEnter={() => setSelectedRep(rep)} className={cn("p-4 flex items-center gap-6 cursor-pointer transition-all hover:bg-secondary/30 group/row", selectedRep?.id === rep.id && "bg-primary/5 border-l-4 border-primary")}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-xs shrink-0 shadow-inner bg-primary/10 text-primary">{rep.initials}</div>
                <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                  <div className="md:col-span-1"><p className="font-bold text-sm truncate">{rep.name}</p><p className="text-[10px] text-muted-foreground truncate">{rep.zone}</p></div>
                  <div className="flex flex-col items-center"><p className="text-sm font-black">{rep.visits}/{rep.planned}</p><p className="text-[10px] text-muted-foreground uppercase">visits</p></div>
                  <div className="flex flex-col items-center"><div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden"><div className={cn("h-full", rep.pct >= 80 ? "bg-emerald-500" : rep.pct >= 50 ? "bg-amber-500" : "bg-red-500")} style={{ width: `${rep.pct}%` }} /></div><p className="text-[10px] font-black uppercase mt-1">Plan achievement {rep.pct}%</p></div>
                  <div className="flex flex-col items-center"><p className="text-sm font-black">{rep.doctorsDetailed}/{rep.totalDoctors}</p><p className="text-[10px] text-muted-foreground uppercase">doctors</p></div>
                </div>
                <div className="shrink-0 flex items-center gap-3"><span className={cn("text-[10px] px-2 py-0.5 rounded-full font-black uppercase whitespace-nowrap", getStatusStyles(rep.status))}>{rep.status}</span><ChevronRight size={18} className="text-muted-foreground opacity-0 group-hover/row:opacity-100" /></div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {activeRep && (
            <div className="p-6 bg-card border border-border rounded-[10px] card-shadow glass">
              <div className="flex items-center justify-between mb-6">
                <div><h4 className="text-lg font-black leading-none">{activeRep.name}</h4><p className="text-xs text-muted-foreground mt-1">{activeRep.zone} · {hospitals.filter(h => h.assignedRepId === activeRep.id).length} clinics assigned</p></div>
                <button onClick={() => setViewAsRep(activeRep)} className="text-[10px] font-black text-primary hover:underline flex items-center gap-1 uppercase tracking-widest">View as field rep <ChevronRight size={14} /></button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-secondary/30 rounded-[10px] border border-border text-center"><p className="text-[10px] text-muted-foreground font-black uppercase mb-2">Visits planned</p><p className="text-3xl font-black">{activeRep.planned}</p></div>
                <div className="p-4 bg-secondary/30 rounded-[10px] border border-border text-center"><p className="text-[10px] text-muted-foreground font-black uppercase mb-2">Visits completed</p><p className="text-3xl font-black text-primary">{activeRep.visits}</p><p className="text-[9px] font-black text-red-500 mt-1">{activeRep.pct}% achieved</p></div>
              </div>
              <div className="space-y-4"><div className="flex justify-between items-center text-[10px] font-black uppercase mb-1"><span>Doctor coverage</span><span>{activeRep.doctorsDetailed} / {activeRep.totalDoctors}</span></div><div className="h-2 bg-secondary rounded-full overflow-hidden"><div className="h-full bg-red-500" style={{ width: `${(activeRep.doctorsDetailed / activeRep.totalDoctors) * 100}%` }} /></div></div>
              <div className="mt-8 pt-6 border-t border-border">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Recent Doctor Remarks</h5>
                <div className="p-4 bg-secondary/30 rounded-[10px] border border-border">
                  <div className="flex justify-between items-start mb-2"><div><p className="text-xs font-bold">Dr. Ahmed Al Hammadi</p><p className="text-[9px] text-muted-foreground">GP · Saudi German Hospital</p></div><span className="text-[9px] px-2 py-0.5 bg-muted rounded-full uppercase font-bold">neutral</span></div>
                  <p className="text-xs italic text-foreground leading-relaxed">"Brief encounter only. Will discuss in detail next visit."</p>
                </div>
              </div>
              <button className="w-full mt-6 py-3 bg-secondary text-foreground rounded-[10px] text-[10px] font-black uppercase tracking-widest hover:bg-secondary/70 transition-all">View full activity log →</button>
            </div>
          )}
        </div>
      </div>

      {/* Unified Action Center (All Approvals) */}
      <div className="bg-card border border-border rounded-[10px] card-shadow overflow-hidden mb-10">
        <div className="p-6 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/5 to-transparent">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-[10px] flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h3 className="text-2xl font-black tracking-tight">Unified Action Center</h3>
              <p className="text-[10px] font-black uppercase text-muted-foreground mt-1 tracking-widest">
                Priority Authorization required for {unifiedPending.length} pending requests
              </p>
            </div>
          </div>
          <Link href="/dashboard/approvals" className="px-6 py-2.5 bg-white border border-border rounded-[10px] text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm">
            View All Approvals <ChevronRight size={14} className="inline ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-secondary/10">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Type & Description</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Field Staff / Facility</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-center">Value / Qty</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {unifiedPending.slice(0, 5).map((item: any) => (
                <tr key={`${item.category}-${item.id}`} className="hover:bg-secondary/10 transition-colors group">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "w-10 h-10 rounded-[10px] flex items-center justify-center text-white shrink-0 shadow-lg",
                        item.category === 'Expense' ? "bg-amber-500" : (item.category === 'Visit' ? "bg-primary" : (item.category === 'Samples' ? "bg-emerald-500" : "bg-blue-600"))
                      )}>
                        {item.category === 'Expense' ? <Wallet size={18} /> : (item.category === 'Visit' ? <ShieldCheck size={18} /> : (item.category === 'Samples' ? <Pill size={18} /> : <Gift size={18} />))}
                      </div>
                      <div>
                        <p className="text-sm font-black group-hover:text-primary transition-colors">{item.title || item.item}</p>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 opacity-60">{item.category} · {item.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <p className="text-xs font-bold">{item.staffName}</p>
                    <p className="text-[9px] font-black uppercase text-muted-foreground mt-0.5 tracking-widest">{item.hospitalName || item.entityName || "Medical Facility"}</p>
                  </td>
                  <td className="px-8 py-6 text-center font-black tabular-nums text-sm">
                    {item.amount ? `AED ${item.amount.toLocaleString()}` : (item.cost ? `AED ${item.cost.toLocaleString()}` : (item.freeSamples ? `${item.freeSamples.filter((s:any) => !s.approved).reduce((sum:number, s:any) => sum + s.qty, 0)} Units` : "Report"))}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(item);
                      }}
                      className="px-6 py-2.5 bg-primary/10 text-primary border border-primary/20 rounded-[10px] text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all shadow-sm"
                    >
                      Review & Audit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card border border-border rounded-[10px] card-shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold flex items-center gap-2">Live activity feed</h3>
            <span className="text-[10px] font-black text-emerald-500 flex items-center gap-1 uppercase"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" /> Live</span>
          </div>
          <div className="space-y-6">
            <ActivityItem color="bg-emerald-500" title="Faisal Al Marzouqi completed visit at Mediclinic Dubai Mall - order 8,400 AED" time="Just now · Downtown · 3 doctors detailed" onClick={() => {}} />
            <ActivityItem color="bg-red-500" title="Abdulla bin Rashid logged remark: 'Dr. Sultan will trial new antibiotic line'" time="4 min ago · Al Zahra Hospital Dubai" tag="positive" onClick={() => {}} />
            <ActivityItem color="bg-blue-500" title="Saeed Al Tayer checked in at Emirates Specialty Hospital" time="12 min ago · Healthcare City · 2nd visit" onClick={() => {}} />
            <ActivityItem color="bg-purple-500" title="Mariam Al Hashimi requested clinical trial collateral for King's College Hospital" time="25 min ago · Dubai Hills · Pediatric Unit" onClick={() => {}} />
            <ActivityItem color="bg-amber-500" title="Zayed Al Mansoori registered new liaison profile: Dr. Amina Al Mheiri" time="45 min ago · Abu Dhabi Medical City · Endocrinology Specialist" tag="new profile" onClick={() => {}} />
          </div>
        </div>

        <div className="bg-card border border-border rounded-[10px] card-shadow p-8 flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity"><ShieldCheck size={120} className="text-primary" /></div>
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Customer Assignment</h3>
            <p className="text-xs text-muted-foreground uppercase font-black tracking-widest mb-6">Territory Mapping Status</p>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-[10px] flex items-center justify-center shadow-inner"><ShieldCheck size={28} /></div>
                <div>
                  {(() => {
                    const mappedCount = hospitals.filter(h => h.assignedRepId).length;
                    const pct = hospitals.length > 0 ? Math.round((mappedCount / hospitals.length) * 100) : 0;
                    return (
                      <>
                        <p className={cn("text-2xl font-black", pct === 100 ? "text-emerald-500" : "text-amber-500")}>{pct}%</p>
                        <p className="text-[10px] font-black uppercase text-muted-foreground">{mappedCount} / {hospitals.length} Mapped</p>
                      </>
                    );
                  })()}
                </div>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                {(() => {
                    const pct = hospitals.length > 0 ? Math.round((hospitals.filter(h => h.assignedRepId).length / hospitals.length) * 100) : 0;
                    return <div className={cn("h-full", pct === 100 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${pct}%` }} />;
                })()}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed italic">
                {hospitals.filter(h => !h.assignedRepId).length > 0 
                  ? `${hospitals.filter(h => !h.assignedRepId).length} facilities are currently unassigned:`
                  : `"All facilities successfully mapped. Network integrity is optimal."`}
              </p>
              {hospitals.filter(h => !h.assignedRepId).length > 0 && (
                <div className="max-h-[140px] overflow-y-auto space-y-2 bg-secondary/10 p-4 rounded-[10px] border border-border">
                  {hospitals.filter(h => !h.assignedRepId).map(h => (
                    <div key={h.id} className="flex items-center justify-between border-b border-border/50 pb-2 last:border-0 last:pb-0">
                      <div>
                        <span className="text-xs font-bold block">{h.name}</span>
                        <span className="text-[9px] text-muted-foreground font-black uppercase tracking-widest">{h.area}</span>
                      </div>
                      <span className="text-[9px] uppercase tracking-widest text-amber-500 font-black px-2 py-1 bg-amber-500/10 rounded-full">Pending</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={() => setShowBulkAssign(true)} className="w-full py-4 bg-primary text-primary-foreground rounded-[10px] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">Bulk Assign Console</button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showBulkAssign && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowBulkAssign(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} className="relative bg-card border border-border w-full max-w-4xl rounded-[10px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-8 border-b border-border bg-secondary/10 flex items-center justify-between"><div><h3 className="text-xl font-black">Bulk Assignment Console</h3><p className="text-xs text-muted-foreground uppercase font-black tracking-widest">Territory Mapping & Allocation</p></div><button onClick={() => setShowBulkAssign(false)} className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/70"><X size={20} /></button></div>
              <div className="flex-1 overflow-y-auto p-8"><table className="w-full text-left border-collapse"><thead><tr className="border-b border-border"><th className="pb-4 text-[10px] font-black uppercase text-muted-foreground">Facility</th><th className="pb-4 text-[10px] font-black uppercase text-muted-foreground text-center">Data</th><th className="pb-4 text-[10px] font-black uppercase text-muted-foreground text-right">Target Assignment</th></tr></thead><tbody className="divide-y divide-border">{hospitals.filter(h => !h.assignedRepId).map((h) => (<tr key={h.id} className="hover:bg-secondary/5 transition-colors group"><td className="py-5"><p className="font-bold text-sm">{h.name}</p></td><td className="py-5 text-center"><p className="text-xs font-black">{h.doctors} Docs / {h.patients} Pts</p></td><td className="py-5 text-right"><select onChange={(e) => assignHospital(h.id, e.target.value)} className="bg-secondary/20 border border-border rounded-[10px] px-4 py-2 text-xs font-black outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:bg-secondary/40 transition-all min-w-[180px]"><option value="">Select Rep...</option>{reps.map(r => (<option key={r.id} value={r.id}>{r.name} ({r.zone})</option>))}</select></td></tr>))}</tbody></table>{hospitals.filter(h => !h.assignedRepId).length === 0 && (<div className="py-20 text-center"><ShieldCheck size={32} className="mx-auto mb-4 text-emerald-500" /><h4 className="text-lg font-black">100% Complete</h4></div>)}</div>
              <div className="p-8 border-t border-border bg-secondary/10 flex justify-end"><button onClick={() => setShowBulkAssign(false)} className="px-8 py-3 bg-primary text-primary-foreground rounded-[10px] font-black text-xs uppercase tracking-widest hover:scale-[1.02] transition-all">Finalize Audit</button></div>
            </motion.div>
          </div>
        )}
        {selectedAppointment && (
          <AppointmentDetailModal 
            meeting={selectedAppointment}
            role="Manager"
            onClose={() => setSelectedAppointment(null)}
          />
        )}
        {selectedGift && (
          <GiftDetailModal 
            item={selectedGift}
            onClose={() => setSelectedGift(null)}
            onApprove={(id, comment) => updateGiftMeetupStatus(id, "approved", comment)}
            onReject={(id, comment) => updateGiftMeetupStatus(id, "rejected", comment)}
          />
        )}
      </AnimatePresence>

      <div className="mt-10 bg-card border border-border rounded-[10px] card-shadow overflow-hidden">
        <div className="p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4"><div><h3 className="text-xl font-bold">Visit heatmap — this week</h3><p className="text-xs text-muted-foreground mt-1">Planned vs actual visits per rep, per day</p></div></div>
        <div className="overflow-x-auto"><table className="w-full border-collapse"><thead><tr className="bg-secondary/30"><th className="p-4 text-left text-[10px] font-black uppercase tracking-widest text-muted-foreground border-r border-border w-48">Representative</th>{currentWeekDays.map((day) => (<th key={day.dateStr} className={cn("p-4 text-center text-[10px] font-black uppercase tracking-widest border-r border-border last:border-0", day.isToday ? "text-indigo-600 bg-indigo-50" : "text-muted-foreground")}>{day.label}</th>))}</tr></thead><tbody className="divide-y divide-border">{reps.filter(r => r.role === "Sales Person").map((rep) => (<tr key={rep.id} className="hover:bg-secondary/10 transition-colors"><td className="p-4 font-bold text-sm border-r border-border cursor-pointer hover:bg-primary/5 transition-all group/rep" onClick={() => setShowDetailedRep(rep)}><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary uppercase group-hover/rep:bg-primary group-hover/rep:text-white transition-colors">{rep.initials}</div><span>{rep.name}</span></div></td>{currentWeekDays.map((day) => { const dayApps = appointments.filter(app => app.date === day.dateStr && app.staffName === rep.name); const actual = dayApps.filter(app => ["visited", "completed", "closed"].includes(app.status)).length; const planned = dayApps.length; let color = "bg-secondary/10"; if (planned > 0) { if (actual >= planned && planned > 0) color = "bg-emerald-500"; else if (actual > 0) color = "bg-amber-500"; else color = "bg-rose-500"; } return ( <td key={day.dateStr} className="p-4 border-r border-border last:border-0"><div className={cn("h-14 rounded-[10px] flex flex-col items-center justify-center transition-all group relative overflow-hidden", color, planned > 0 ? "shadow-lg border border-white/10" : "opacity-30 border border-dashed border-border")}>{planned > 0 ? (<><p className="text-lg font-black tabular-nums text-white">{actual} <span className="text-[10px] opacity-70">/ {planned}</span></p></>) : (<span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground opacity-50">Empty</span>)}</div></td> ); })}</tr>))}</tbody></table></div>
      </div>
    </div>
  );
}

function KPICard({ label, value, sub, icon: Icon, color, href }: { label: string, value: string, sub: string, icon: any, color: string, href?: string }) {
  const inner = (
    <div className={cn(
      "p-6 bg-card border border-border rounded-[10px] card-shadow flex items-center gap-4 transition-all group",
      href ? "hover:border-primary/50 hover:-translate-y-0.5 cursor-pointer hover:shadow-xl" : "hover:border-primary/50"
    )}>
      <div className={cn("w-12 h-12 rounded-[10px] flex items-center justify-center text-white shrink-0 shadow-lg group-hover:scale-110 transition-transform", color)}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
        <p className="text-2xl font-black mt-0.5">{value}</p>
        <p className="text-[9px] font-bold text-muted-foreground mt-1">{sub}</p>
      </div>
      {href && <ChevronRight size={14} className="ml-auto text-muted-foreground opacity-0 group-hover:opacity-100 transition-all group-hover:translate-x-0.5" />}
    </div>
  );
  if (href) return <Link href={href}>{inner}</Link>;
  return inner;
}

function ActivityItem({ color, title, time, tag, onClick }: { color: string, title: string, time: string, tag?: string, onClick?: () => void }) {
  return (
    <div className={cn("flex gap-4 group cursor-pointer hover:bg-secondary/20 p-2 rounded-[10px] transition-all", !onClick && "cursor-default hover:bg-transparent")} onClick={onClick}>
      <div className="relative flex flex-col items-center"><div className={cn("w-3 h-3 rounded-full mt-1.5 z-10", color)} /><div className="w-0.5 h-full bg-border absolute top-4 group-last:hidden" /></div>
      <div className="pb-6"><div className="flex items-center gap-2 mb-1"><p className="text-sm font-bold leading-tight group-hover:text-primary transition-colors">{title}</p>{tag && <span className="text-[8px] px-1.5 py-0.5 bg-emerald-50 text-emerald-600 rounded font-black uppercase">+{tag}</span>}</div><p className="text-[10px] text-muted-foreground">{time}</p></div>
    </div>
  );
}
