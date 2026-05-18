"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  TrendingUp, 
  MapPin, 
  Clock, 
  ChevronRight,
  Hospital as HospitalIcon,
  Pill,
  DollarSign,
  ArrowLeft,
  Calendar as CalendarIcon,
  CheckCircle2,
  X,
  Stethoscope,
  Users as UsersIcon,
  MessageSquare,
  PackageCheck,
  Activity,
  User,
  Home,
  Truck,
  History,
  ClipboardList,
  AlertCircle,
  FlaskConical,
  LayoutList,
  CalendarDays,
  ChevronLeft,
  Maximize2,
  Minimize2,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useData, SalesRep, Sale, Hospital, Medicine, Doctor, Patient, Appointment } from "@/lib/context/data-context";
import { STAFF_MEETINGS } from "@/lib/data/staff-meetings-data";
import { AppointmentDetailModal } from "./appointment-detail-modal";
import { VisitCompletionForm } from "./visit-completion-form";
import { NewAuditForm } from "./forms/new-audit-form";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const HOURS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00", 
  "14:00", "15:00", "16:00", "17:00"
];

const STATUS_COLORS: Record<string, string> = {
  scheduled: "bg-blue-500/10 text-blue-600 border-blue-200",
  completed: "bg-emerald-500/10 text-emerald-600 border-emerald-200",
  visited: "bg-amber-500/10 text-amber-600 border-amber-200",
  pending_approval: "bg-purple-500/10 text-purple-600 border-purple-200",
  cancelled: "bg-rose-500/10 text-rose-600 border-rose-200",
  upcoming: "bg-indigo-500/10 text-indigo-600 border-indigo-200",
};

export function RepDetailedPerformance({ rep, onBack }: { rep: SalesRep, onBack: () => void }) {
  const { 
    hospitals, medicines, getRepSales, sales, doctors,
    getHospitalDoctors, getHospitalPatients, getDoctorSales,
    togglePatientStatus, appointments
  } = useData();
  
  const [selectedHospitalId, setSelectedHospitalId] = useState<string | null>(null);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"doctors" | "patients" | "ledger">("doctors");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [loggingAppointment, setLoggingAppointment] = useState<Appointment | null>(null);
  
  const [filterRange, setFilterRange] = useState<"today" | "week" | "month">("week");
  const [viewType, setViewType] = useState<"table" | "calendar">("calendar");
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addPreFill, setAddPreFill] = useState<{ date?: string, hour?: string, staffName?: string } | null>(null);
  
  const myHospitals = hospitals.filter(h => h.assignedRepId === rep.id);
  const mySales = getRepSales(rep.id);
  
  const activityItems = showAllActivity ? mySales : mySales.slice(0, 6);
  
  const totalRevenue = mySales.reduce((acc, s) => acc + (s.amount || 0), 0);
  const targetAmount = rep.targetAmount || 1; 
  const revenuePct = Math.round((totalRevenue / targetAmount) * 100);

  const selectedHospital = hospitals.find(h => h.id === selectedHospitalId);
  const hospitalDoctors = selectedHospitalId ? getHospitalDoctors(selectedHospitalId) : [];
  const hospitalPatients = selectedHospitalId ? getHospitalPatients(selectedHospitalId) : [];

  const selectedDoctor = selectedDoctorId ? hospitalDoctors.find(d => d.id === selectedDoctorId) : (hospitalDoctors[0] || null);
  const doctorSales = selectedDoctor ? getDoctorSales(selectedDoctor.id) : [];

  const selectedPatient = selectedPatientId ? hospitalPatients.find(p => p.id === selectedPatientId) : null;
  const patientDoctor = selectedPatient ? doctors.find(d => d.id === selectedPatient.assignedDoctorId) : null;

  const hospitalTotalValue = selectedHospitalId ? sales.filter(s => s.hospitalId === selectedHospitalId && s.repId === rep.id).reduce((acc, s) => acc + (s.amount || 0), 0) : 0;

  const hospitalSales = useMemo(() => {
    if (!selectedHospitalId) return [];
    return sales.filter(s => s.hospitalId === selectedHospitalId && s.repId === rep.id);
  }, [selectedHospitalId, sales, rep.id]);

  const medicineBreakdown = useMemo(() => {
    const breakdown: Record<string, { id: string, name: string, amount: number, qty: number, category: string }> = {};
    hospitalSales.forEach(s => {
      const med = medicines.find(m => m.id === s.medicineId);
      if (med) {
        if (!breakdown[s.medicineId]) {
          breakdown[s.medicineId] = { id: med.id, name: med.name, amount: 0, qty: 0, category: med.category };
        }
        breakdown[s.medicineId].amount += s.amount;
        breakdown[s.medicineId].qty += s.quantity;
      }
    });
    return Object.values(breakdown).sort((a, b) => b.amount - a.amount);
  }, [hospitalSales, medicines]);

  const doctorBreakdown = useMemo(() => {
    const breakdown: Record<string, { id: string, name: string, amount: number, visits: number, specialty: string }> = {};
    hospitalSales.forEach(s => {
      const doc = doctors.find(d => d.id === s.doctorId);
      if (doc) {
        if (!breakdown[s.doctorId]) {
          breakdown[s.doctorId] = { id: doc.id, name: doc.name, amount: 0, visits: 0, specialty: doc.specialty };
        }
        breakdown[s.doctorId].amount += s.amount;
        breakdown[s.doctorId].visits += 1;
      }
    });
    return Object.values(breakdown).sort((a, b) => b.amount - a.amount);
  }, [hospitalSales, doctors]);

  
  const filteredMeetings = useMemo(() => {
    const referenceDate = new Date(currentDate);
    const todayStr = referenceDate.toISOString().split("T")[0];
    
    // Helper for week range
    const getWeekRange = () => {
      const start = new Date(referenceDate);
      start.setDate(referenceDate.getDate() - referenceDate.getDay());
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return { start: start.toISOString().split("T")[0], end: end.toISOString().split("T")[0] };
    };

    const week = getWeekRange();
    const monthStr = referenceDate.toISOString().slice(0, 7); // YYYY-MM

    return appointments.filter(m => {
      if (m.staffName !== rep.name) return false;
      
      if (filterRange === "today") return m.date === todayStr;
      if (filterRange === "week") return m.date >= week.start && m.date <= week.end;
      if (filterRange === "month") return m.date.startsWith(monthStr);
      
      return true;
    });
  }, [filterRange, rep.name, appointments, currentDate]);

  const startOfWeek = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay();
    const diff = d.getDate() - day;
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  }, [currentDate]);

  // Auto-sync currentDate to today when filterRange changes
  useEffect(() => {
    setCurrentDate(new Date());
  }, [filterRange]);

  // Compute weeks to display in calendar view
  const calendarWeeks = useMemo(() => {
    if (filterRange !== "month") {
      return [startOfWeek];
    }
    // All weeks in the current month
    const referenceDate = new Date(currentDate);
    const firstDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
    const lastDay = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 0);
    // Find Sunday at or before firstDay
    const weekStart = new Date(firstDay);
    weekStart.setDate(firstDay.getDate() - firstDay.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weeks: Date[] = [];
    const cursor = new Date(weekStart);
    while (cursor <= lastDay) {
      weeks.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 7);
    }
    return weeks;
  }, [filterRange, startOfWeek, currentDate]);

  const shiftWeek = (weeks: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setDate(currentDate.getDate() + weeks * 7);
    setCurrentDate(nextDate);
  };

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-[10px] font-bold text-sm transition-all"
        >
          <ArrowLeft size={18} /> Back to Team List
        </button>
        <div className="px-4 py-2 bg-primary/20 rounded-[10px] border border-primary/30">
          <p className="text-[10px] font-black uppercase text-primary">Performance Period: May 2026</p>
        </div>
      </div>

      {/* Hero Header */}
      <header className="bg-card border border-border rounded-[10px] p-8 card-shadow relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary rounded-[10px] flex items-center justify-center font-black text-3xl text-primary-foreground shadow-xl">
              {rep.initials}
            </div>
            <div>
              <h2 className="text-3xl font-black">{rep.name}</h2>
              <p className="text-muted-foreground font-medium">{rep.zone} · Senior Sales Executive</p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2">
            <p className="text-[10px] font-black uppercase text-muted-foreground">Monthly Sales Target</p>
            <p className="text-4xl font-black text-primary">{(totalRevenue || 0).toLocaleString()} <span className="text-sm">/ {(rep.targetAmount || 0).toLocaleString()} AED</span></p>
            <div className="w-64 h-2 bg-secondary rounded-full overflow-hidden mt-1">
              <div 
                className={cn("h-full transition-all duration-1000", revenuePct >= 100 ? "bg-emerald-500" : "bg-primary")}
                style={{ width: `${Math.min(revenuePct, 100)}%` }}
              />
            </div>
            <p className="text-xs font-black">{revenuePct}% achieved</p>
          </div>
        </div>
      </header>

      {/* Main Content Grid: 70/30 Split */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-8">
        {/* LEFT COLUMN (70% or 100%): Appointments & Field Activity Below */}
        <div className={cn("space-y-8 transition-all duration-500", isExpanded ? "lg:col-span-10" : "lg:col-span-7")}>
          {/* CALENDAR LEGEND */}
          <div className="flex flex-wrap items-center gap-6 px-6 py-3 bg-secondary/10 border border-border/50 rounded-[10px]">
            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Status Key:</span>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black uppercase text-muted-foreground/80">Scheduled</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="text-[10px] font-black uppercase text-muted-foreground/80">Visited</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
              <span className="text-[10px] font-black uppercase text-muted-foreground/80">Pending Approval</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black uppercase text-muted-foreground/80">Completed</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-[10px] font-black uppercase text-muted-foreground/80">Cancelled</span>
            </div>
          </div>

          {/* Staff Appointments Table */}
          <div className="bg-card border border-border rounded-[10px] card-shadow overflow-hidden">
            <div className="p-6 border-b border-border bg-secondary/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">Staff Appointments</h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Scheduled itinerary and operational audits for {rep.name}</p>
                </div>
                <div className="flex bg-white/50 p-1 rounded-[10px] border border-border hidden md:flex">
                  <button
                    onClick={() => setViewType("table")}
                    className={cn(
                      "p-2 rounded-[8px] transition-all",
                      viewType === "table" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-secondary/40"
                    )}
                  >
                    <LayoutList size={14} />
                  </button>
                  <button
                    onClick={() => setViewType("calendar")}
                    className={cn(
                      "p-2 rounded-[8px] transition-all",
                      viewType === "calendar" ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-secondary/40"
                    )}
                  >
                    <CalendarDays size={14} />
                  </button>
                  <div className="w-px h-4 bg-border mx-1 my-auto" />
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-2 rounded-[8px] text-muted-foreground hover:bg-secondary/40 transition-all"
                    title={isExpanded ? "Collapse View" : "Full Table View"}
                  >
                    {isExpanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  </button>
                </div>
              </div>

              {viewType === "table" ? (
                <div className="flex bg-white/50 p-1 rounded-[10px] border border-border shrink-0">
                  {(["today", "week", "month"] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setFilterRange(r)}
                      className={cn(
                        "px-4 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-all",
                        filterRange === r ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-secondary/40"
                      )}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex bg-white/50 p-1 rounded-[10px] border border-border shrink-0">
                    {(["today", "week", "month"] as const).map((r) => (
                      <button
                        key={r}
                        onClick={() => setFilterRange(r)}
                        className={cn(
                          "px-4 py-1.5 rounded-[8px] text-[10px] font-black uppercase tracking-widest transition-all",
                          filterRange === r ? "bg-primary text-white shadow-md" : "text-muted-foreground hover:bg-secondary/40"
                        )}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex bg-white border border-border rounded-[8px] overflow-hidden">
                      <button onClick={() => shiftWeek(-1)} className="p-1.5 hover:bg-secondary border-r border-border transition-colors"><ChevronLeft size={16} /></button>
                      <div className="px-3 flex items-center font-black text-[9px] uppercase tracking-widest min-w-[120px] justify-center">
                        {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(new Date(startOfWeek).setDate(startOfWeek.getDate() + 6)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      <button onClick={() => shiftWeek(1)} className="p-1.5 hover:bg-secondary border-l border-border transition-colors"><ChevronRight size={16} /></button>
                    </div>
                    <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 bg-secondary/50 border border-border rounded-[8px] text-[9px] font-black uppercase tracking-widest hover:bg-secondary transition-all">Today</button>
                  </div>
                </div>
              )}
            </div>

            {viewType === "table" ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-secondary/20">
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Date & Time</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Title / Type</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground">Facility</th>
                      <th className="px-6 py-4 text-[9px] font-black uppercase tracking-widest text-muted-foreground text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredMeetings.length > 0 ? (
                      filteredMeetings.map((app, i) => (
                        <tr 
                          key={`row-${app.id}-${i}`} 
                          onClick={() => setSelectedAppointment(app)}
                          className="hover:bg-secondary/10 transition-colors cursor-pointer group"
                        >
                          <td className="px-6 py-4">
                            <p className="font-bold text-sm">{new Date(app.date).toLocaleDateString()}</p>
                            <p className="text-[10px] text-muted-foreground font-black uppercase">{app.hour}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-black text-xs uppercase tracking-tight group-hover:text-primary transition-colors">{app.title}</p>
                            <span className="text-[8px] font-black px-1.5 py-0.5 bg-muted rounded uppercase tracking-tighter mt-1 inline-block">{app.type}</span>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-xs font-bold">{app.entityName}</p>
                            <p className="text-[9px] text-muted-foreground uppercase">{app.location}</p>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <span className={cn(
                              "px-3 py-1 rounded-[6px] text-[9px] font-black uppercase border",
                              app.status === "completed" || app.status === "visited" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"
                            )}>
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-6 py-20 text-center">
                          <div className="flex flex-col items-center opacity-40">
                            <Clock size={32} className="mb-2" />
                            <p className="text-sm font-black uppercase tracking-widest">No activities found</p>
                            <p className="text-[10px]">Try expanding your filter range</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto overflow-y-auto max-h-[700px]">
                {calendarWeeks.map((weekStart, weekIdx) => (
                  <div key={weekIdx} className="min-w-[1000px]">
                    {/* Day header row per week */}
                    <div className={cn("grid grid-cols-[80px_repeat(7,1fr)] border-b border-border bg-secondary/10", weekIdx > 0 && "border-t-4 border-t-primary/10")}>
                      <div className="p-4 border-r border-border flex items-center justify-center">
                        {weekIdx === 0 ? <Clock size={14} className="text-muted-foreground" /> : (
                          <span className="text-[8px] font-black text-muted-foreground/50 uppercase">W{weekIdx + 1}</span>
                        )}
                      </div>
                      {DAYS.map((day, idx) => {
                        const date = new Date(weekStart);
                        date.setDate(weekStart.getDate() + idx);
                        const isToday = date.toDateString() === new Date().toDateString();
                        return (
                          <div key={`${weekIdx}-${day}`} className={cn("p-4 text-center border-r last:border-0 border-border", isToday ? "bg-primary/5" : "")}>
                            <p className="font-black text-[9px] uppercase tracking-widest text-muted-foreground">{day}</p>
                            <p className={cn("text-sm font-black", isToday ? "text-primary" : "")}>{date.getDate()}</p>
                            {filterRange === "month" && (
                              <p className="text-[8px] text-muted-foreground/60">{date.toLocaleDateString('en-US', { month: 'short' })}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {/* Hour rows */}
                    {HOURS.map((hour) => (
                      <div key={`${weekIdx}-${hour}`} className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-border last:border-0 min-h-[100px]">
                        <div className="p-4 border-r border-border text-[9px] font-black text-muted-foreground flex items-center justify-center bg-secondary/5">{hour}</div>
                        {DAYS.map((_, dayIdx) => {
                          const dayDate = new Date(weekStart);
                          dayDate.setDate(weekStart.getDate() + dayIdx);
                          const dayDateStr = dayDate.toISOString().split('T')[0];
                          const hourPrefix = parseInt(hour.split(':')[0], 10);
                          const hourApps = filteredMeetings.filter(a => {
                            if (a.date !== dayDateStr) return false;
                            const appHour = parseInt(a.hour.split(':')[0], 10);
                            return appHour === hourPrefix;
                          });
                          return (
                            <div key={dayIdx} className="p-1 border-r last:border-0 border-border relative hover:bg-secondary/5 group transition-all min-h-[100px]">
                              <div className="flex flex-col gap-1 h-full pb-6">
                                {hourApps.map((app, i) => (
                                  <div 
                                    key={`cal-${app.id}-${i}`} 
                                    onClick={() => setSelectedAppointment(app)}
                                    className={cn(
                                      "p-2 rounded-[6px] shadow-sm text-[9px] font-bold cursor-pointer hover:scale-[1.02] transition-all border",
                                      STATUS_COLORS[app.status] || "bg-secondary/10 text-muted-foreground border-border",
                                      hourApps.length === 1 && "flex-1 flex flex-col justify-center h-full min-h-[70px]"
                                    )}
                                  >
                                    <p className="uppercase leading-tight mb-0.5 line-clamp-2">{app.title}</p>
                                    <p className="opacity-70 text-[8px] truncate">{app.entityName}</p>
                                  </div>
                                ))}
                                {hourApps.length === 0 && (
                                  <div 
                                    onClick={() => {
                                      setAddPreFill({ date: dayDateStr, hour: hour, staffName: rep.name });
                                      setIsAddModalOpen(true);
                                    }}
                                    className="absolute inset-0 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-1 border border-primary/20 border-dashed">
                                      <Plus size={16} />
                                    </div>
                                    <span className="text-[8px] font-black uppercase text-primary/60 tracking-widest">Schedule</span>
                                  </div>
                                )}
                              </div>
                              {hourApps.length > 0 && (
                                <button 
                                  onClick={() => {
                                    setAddPreFill({ date: dayDateStr, hour: hour, staffName: rep.name });
                                    setIsAddModalOpen(true);
                                  }}
                                  className="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg hover:scale-110 active:scale-95 z-10"
                                >
                                  <Plus size={14} />
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Field Activity (Below Appointments Table) */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="text-primary" size={20} /> Field Activity Log
            </h3>
            <div className="bg-card border border-border rounded-[10px] card-shadow overflow-hidden">
              <div className="divide-y divide-border">
                {activityItems.map((sale) => {
                  const med = medicines.find(m => m.id === sale.medicineId);
                  const hospital = hospitals.find(h => h.id === sale.hospitalId);
                  const doctor = doctors.find(d => d.id === sale.doctorId);
                  return (
                    <div key={sale.id} className="p-5 hover:bg-primary/[0.03] transition-all group">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-black group-hover:text-primary transition-colors">{med?.name}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <Stethoscope size={10} className="text-primary" />
                            <span className="text-[10px] font-black uppercase text-primary/80 tracking-tighter">Visit with {doctor?.name}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-primary">{(sale.amount || 0).toLocaleString()} <span className="text-[9px] opacity-60">AED</span></p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin size={10} className="text-emerald-500" />
                          <p className="text-[10px] text-muted-foreground font-bold truncate">
                            {hospital?.name} · {hospital?.area}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon size={10} className="text-blue-500" />
                          <p className="text-[10px] text-muted-foreground font-black opacity-80 uppercase tracking-tighter">
                            {new Date(sale.date).toLocaleDateString()} at {sale.time}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              {!showAllActivity && mySales.length > 6 && (
                <button 
                  onClick={() => setShowAllActivity(true)}
                  className="w-full py-4 bg-secondary/20 hover:bg-secondary/40 text-[10px] font-black uppercase tracking-widest text-primary transition-all border-t border-border"
                >
                  View Full Activity Log ({mySales.length - 6} more items)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (30%): Assigned Hospitals */}
        {!isExpanded && (
          <div className="lg:col-span-3 space-y-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <HospitalIcon className="text-primary" size={20} /> Assigned Hospitals
          </h3>
          <div className="space-y-4">
            {myHospitals.map((hospital) => (
              <motion.div 
                key={hospital.id} 
                whileHover={{ scale: 1.02 }}
                onClick={() => setSelectedHospitalId(hospital.id)}
                className="p-6 bg-card border border-border rounded-[10px] card-shadow hover:border-primary transition-all cursor-pointer group"
              >
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold group-hover:text-primary transition-colors">{hospital.name}</h4>
                  <ChevronRight size={18} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-secondary/20 rounded-[10px]">
                    <p className="text-[9px] font-black uppercase opacity-60">Doctors</p>
                    <p className="text-lg font-black">{hospital.doctors}</p>
                  </div>
                  <div className="p-3 bg-secondary/20 rounded-[10px]">
                    <p className="text-[9px] font-black uppercase opacity-60">Patients</p>
                    <p className="text-lg font-black">{hospital.patients}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        )}
      </div>

      <AnimatePresence>
        {selectedHospital && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-10">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => { setSelectedHospitalId(null); setSelectedDoctorId(null); }} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.95, opacity: 0, y: 20 }} 
              className="relative bg-card border border-border w-full max-w-7xl h-[85vh] rounded-[10px] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-8 border-b border-border bg-secondary/10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-primary rounded-[10px] flex items-center justify-center text-primary-foreground shadow-lg">
                    <HospitalIcon size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black">{selectedHospital.name}</h3>
                    <p className="text-muted-foreground font-medium uppercase text-xs tracking-widest">{selectedHospital.area} · Network Audit</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 mr-10">
                  <div className="text-right">
                    <p className="text-[9px] font-black uppercase text-muted-foreground">Network Value</p>
                    <p className="text-xl font-black text-primary">{hospitalTotalValue.toLocaleString()} AED</p>
                  </div>
                  <button onClick={() => { setSelectedHospitalId(null); setSelectedDoctorId(null); }} className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center hover:bg-secondary/70 transition-all">
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* SPLIT CONTENT */}
              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row divide-x divide-border">
                {/* LEFT LIST */}
                <div className="w-full lg:w-[400px] overflow-y-auto p-8 space-y-8 bg-secondary/5">
                  <div className="flex bg-white/50 p-1 rounded-[10px] border border-border">
                    <button onClick={() => setViewMode("doctors")} className={cn("flex-1 py-3 rounded-[10px] font-black text-[10px] uppercase tracking-widest transition-all", viewMode === "doctors" ? "bg-primary text-white shadow-lg" : "text-muted-foreground")}>Doctors</button>
                    <button onClick={() => setViewMode("patients")} className={cn("flex-1 py-3 rounded-[10px] font-black text-[10px] uppercase tracking-widest transition-all", viewMode === "patients" ? "bg-emerald-500 text-white shadow-lg" : "text-muted-foreground")}>Patients</button>
                    <button onClick={() => setViewMode("ledger")} className={cn("flex-1 py-3 rounded-[10px] font-black text-[10px] uppercase tracking-widest transition-all", viewMode === "ledger" ? "bg-amber-500 text-white shadow-lg" : "text-muted-foreground")}>Ledger</button>
                  </div>


                  <div className="space-y-2">
                    {viewMode === "doctors" ? (
                      hospitalDoctors.map(doc => (
                        <div key={doc.id} onClick={() => setSelectedDoctorId(doc.id)} className={cn("p-4 rounded-[10px] border transition-all cursor-pointer flex justify-between", selectedDoctorId === doc.id ? "bg-white border-primary shadow-lg ring-1 ring-primary/20" : "bg-white/40 border-border")}>
                          <p className="font-bold text-sm">{doc.name}</p>
                          <ChevronRight size={16} />
                        </div>
                      ))
                    ) : viewMode === "patients" ? (
                      hospitalPatients.map(pat => (
                        <div key={pat.id} onClick={() => setSelectedPatientId(pat.id)} className="p-4 rounded-[10px] border border-border bg-white/40 hover:border-emerald-500 transition-all cursor-pointer flex justify-between">
                          <p className="font-bold text-sm">{pat.name}</p>
                          <ChevronRight size={16} />
                        </div>
                      ))
                    ) : (
                      <div className="space-y-4">
                        <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-[10px]">
                          <p className="text-[10px] font-black uppercase text-amber-600 mb-1">Total Commercial Value</p>
                          <p className="text-2xl font-black text-amber-700">{hospitalTotalValue.toLocaleString()} AED</p>
                        </div>
                        <div className="p-6 bg-blue-500/10 border border-blue-500/20 rounded-[10px]">
                          <p className="text-[10px] font-black uppercase text-blue-600 mb-1">Total Provisions</p>
                          <p className="text-2xl font-black text-blue-700">{hospitalSales.length}</p>
                        </div>
                        <div className="p-6 bg-emerald-500/10 border border-emerald-500/20 rounded-[10px]">
                          <p className="text-[10px] font-black uppercase text-emerald-600 mb-1">Active Prescribers</p>
                          <p className="text-2xl font-black text-emerald-700">{doctorBreakdown.length}</p>
                        </div>
                      </div>
                    )}
                  </div>

                </div>

                {/* RIGHT PANE */}
                <div className="flex-1 overflow-y-auto p-10 bg-white">
                  {viewMode === "doctors" && selectedDoctor ? (
                    <div className="space-y-8">
                      <h4 className="text-3xl font-black">{selectedDoctor.name} · Provisions</h4>
                      <div className="bg-card border border-border rounded-[10px] overflow-hidden">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="bg-secondary/30">
                              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Medicine Details</th>
                              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Logistics & Timing</th>
                              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-center">Qty / Status</th>
                              <th className="p-6 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Value (AED)</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border">
                            {doctorSales.map((sale, idx) => {
                              const med = medicines.find(m => m.id === sale.medicineId);
                              // Check if this is the first time this medicine is given to this doctor in this list
                              const isFirstTime = doctorSales.slice(0, idx).filter(s => s.medicineId === sale.medicineId).length === 0;
                              
                              return (
                                <React.Fragment key={sale.id}>
                                  <tr className="hover:bg-secondary/5 transition-colors">
                                    <td className="p-6">
                                      <div className="flex items-center gap-4">
                                        <div className={cn(
                                          "w-12 h-12 rounded-[10px] flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                                          sale.isCompound ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"
                                        )}>
                                          {sale.isCompound ? <FlaskConical size={24} /> : <PackageCheck size={24} />}
                                        </div>
                                        <div>
                                          <div className="flex items-center gap-2">
                                            <p className="font-bold text-base tracking-tight">{med?.name}</p>
                                            {isFirstTime ? (
                                              <span className="px-2 py-0.5 bg-emerald-500 text-white text-[8px] font-black rounded uppercase tracking-tighter">New Provision</span>
                                            ) : (
                                              <span className="px-2 py-0.5 bg-blue-100 text-blue-600 text-[8px] font-black rounded uppercase tracking-tighter">Repeat</span>
                                            )}
                                          </div>
                                          <p className="text-[10px] text-muted-foreground font-black uppercase mt-1 tracking-widest">
                                            {med?.category} · {sale.isCompound ? "Custom Compound" : "Standard Pack"}
                                          </p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-6 text-center">
                                      <div className="inline-flex flex-col items-center gap-1">
                                        <div className="px-3 py-1 bg-secondary/30 rounded-lg flex items-center gap-1.5">
                                          <CalendarIcon size={12} className="text-primary" />
                                          <span className="text-[11px] font-bold">{new Date(sale.date).toLocaleDateString()}</span>
                                          <span className="text-[11px] text-muted-foreground">at {sale.time}</span>
                                        </div>
                                        <div className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg border border-blue-100 flex items-center gap-1.5 mt-1">
                                          <Truck size={12} />
                                          <span className="text-[9px] font-black uppercase">ETA: {sale.deliveryNeededDate}</span>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="p-6 text-center">
                                      <p className="text-lg font-black">{sale.quantity}</p>
                                      <p className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">Units Delivered</p>
                                    </td>
                                    <td className="p-6 text-right">
                                      <p className="text-lg font-black text-primary">{(sale.amount || 0).toLocaleString()}</p>
                                      <p className="text-[9px] font-black uppercase text-muted-foreground">AED Total</p>
                                    </td>
                                  </tr>
                                  <tr>
                                    <td colSpan={4} className="p-6 pt-0">
                                      <div className="flex flex-col gap-2">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                          <div className="bg-secondary/10 rounded-[10px] p-4 border border-border flex gap-3">
                                            <MessageSquare size={16} className="text-primary shrink-0 mt-0.5" />
                                            <div>
                                              <p className="text-[8px] font-black uppercase text-muted-foreground tracking-widest mb-1">Representative Remarks</p>
                                              <p className="text-xs text-muted-foreground italic leading-relaxed">"{sale.notes || "No interaction notes recorded."}"</p>
                                            </div>
                                          </div>
                                          <div className="bg-blue-50/30 rounded-[10px] p-4 border border-blue-100 flex gap-3">
                                            <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                                            <div>
                                              <p className="text-[8px] font-black uppercase text-blue-600 tracking-widest mb-1">Delivery Endpoint</p>
                                              <p className="text-xs text-blue-900 font-bold">Main Pharmacy · Receiving Gate 4</p>
                                            </div>
                                          </div>
                                        </div>
                                        {sale.isCompound && (
                                          <div className="bg-amber-50/50 rounded-[10px] p-4 border border-dashed border-amber-200 flex gap-3">
                                            <FlaskConical size={16} className="text-amber-500 shrink-0 mt-0.5" />
                                            <div>
                                              <p className="text-[9px] font-black uppercase text-amber-600 tracking-widest mb-1">Compound Formula & Mixing Details</p>
                                              <p className="text-xs text-amber-900 leading-relaxed italic">{sale.compoundDetails}</p>
                                            </div>
                                          </div>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                </React.Fragment>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : viewMode === "ledger" ? (
                    <div className="space-y-10">
                      <div className="flex items-center justify-between">
                        <h4 className="text-3xl font-black">Commercial Performance Ledger</h4>
                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-[10px] border border-amber-500/20">
                          <TrendingUp size={18} className="text-amber-600" />
                          <span className="text-sm font-black text-amber-700">Audit Status: Verified</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Medicine Breakdown */}
                        <div className="bg-card border border-border rounded-[10px] overflow-hidden shadow-sm">
                          <div className="p-6 border-b border-border bg-secondary/5 flex items-center justify-between">
                            <h5 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Medicine Revenue Split</h5>
                            <PackageCheck size={16} className="text-primary" />
                          </div>
                          <div className="p-0">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-secondary/10 border-b border-border">
                                  <th className="px-6 py-3 text-[9px] font-black uppercase text-muted-foreground">Medicine</th>
                                  <th className="px-6 py-3 text-[9px] font-black uppercase text-muted-foreground text-center">Qty</th>
                                  <th className="px-6 py-3 text-[9px] font-black uppercase text-muted-foreground text-right">Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {medicineBreakdown.map((item) => (
                                  <tr key={item.id} className="hover:bg-secondary/5 transition-colors">
                                    <td className="px-6 py-4">
                                      <p className="text-xs font-bold">{item.name}</p>
                                      <p className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">{item.category}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center font-black text-xs">{item.qty}</td>
                                    <td className="px-6 py-4 text-right">
                                      <p className="text-xs font-black text-primary">{item.amount.toLocaleString()}</p>
                                      <p className="text-[8px] font-black uppercase text-muted-foreground">AED</p>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Doctor Breakdown */}
                        <div className="bg-card border border-border rounded-[10px] overflow-hidden shadow-sm">
                          <div className="p-6 border-b border-border bg-secondary/5 flex items-center justify-between">
                            <h5 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Prescriber Engagement</h5>
                            <Stethoscope size={16} className="text-emerald-500" />
                          </div>
                          <div className="p-0">
                            <table className="w-full text-left">
                              <thead>
                                <tr className="bg-secondary/10 border-b border-border">
                                  <th className="px-6 py-3 text-[9px] font-black uppercase text-muted-foreground">Physician</th>
                                  <th className="px-6 py-3 text-[9px] font-black uppercase text-muted-foreground text-center">Orders</th>
                                  <th className="px-6 py-3 text-[9px] font-black uppercase text-muted-foreground text-right">Value</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-border">
                                {doctorBreakdown.map((item) => (
                                  <tr key={item.id} className="hover:bg-secondary/5 transition-colors">
                                    <td className="px-6 py-4">
                                      <p className="text-xs font-bold">{item.name}</p>
                                      <p className="text-[8px] font-black uppercase text-muted-foreground tracking-tighter">{item.specialty}</p>
                                    </td>
                                    <td className="px-6 py-4 text-center font-black text-xs">{item.visits}</td>
                                    <td className="px-6 py-4 text-right">
                                      <p className="text-xs font-black text-emerald-600">{item.amount.toLocaleString()}</p>
                                      <p className="text-[8px] font-black uppercase text-muted-foreground">AED</p>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>

                      {/* Recent Transactions in Ledger */}
                      <div className="bg-card border border-border rounded-[10px] overflow-hidden shadow-sm">
                        <div className="p-6 border-b border-border bg-secondary/5 flex items-center justify-between">
                          <h5 className="font-black text-xs uppercase tracking-widest text-muted-foreground">Recent Commercial Activity</h5>
                          <History size={16} className="text-amber-500" />
                        </div>
                        <div className="p-0">
                          <table className="w-full text-left">
                            <thead>
                              <tr className="bg-secondary/10 border-b border-border">
                                <th className="px-6 py-3 text-[9px] font-black uppercase text-muted-foreground">Date / Time</th>
                                <th className="px-6 py-3 text-[9px] font-black uppercase text-muted-foreground">Description</th>
                                <th className="px-6 py-3 text-[9px] font-black uppercase text-muted-foreground">Qty</th>
                                <th className="px-6 py-3 text-[9px] font-black uppercase text-muted-foreground text-right">Transaction Value</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                              {hospitalSales.slice(0, 10).map((sale) => {
                                const med = medicines.find(m => m.id === sale.medicineId);
                                const doc = doctors.find(d => d.id === sale.doctorId);
                                return (
                                  <tr key={sale.id} className="hover:bg-secondary/5 transition-colors">
                                    <td className="px-6 py-4">
                                      <p className="text-xs font-bold">{new Date(sale.date).toLocaleDateString()}</p>
                                      <p className="text-[8px] font-black uppercase text-muted-foreground">{sale.time}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                      <p className="text-xs font-black text-primary uppercase tracking-tight">{med?.name}</p>
                                      <p className="text-[9px] font-medium text-muted-foreground">Prescribed by {doc?.name}</p>
                                    </td>
                                    <td className="px-6 py-4 font-black text-xs">{sale.quantity}</td>
                                    <td className="px-6 py-4 text-right">
                                      <p className="text-xs font-black text-primary">{sale.amount.toLocaleString()}</p>
                                      <p className="text-[8px] font-black uppercase text-muted-foreground">AED</p>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  ) : null}

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPREHENSIVE PATIENT MODAL */}
      <AnimatePresence>
        {selectedPatient && (
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-6">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedPatientId(null)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 40 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 40 }} 
              className="relative bg-white w-full max-w-2xl rounded-[10px] shadow-2xl overflow-hidden border border-border"
            >
              {/* Profile Top */}
              <div className={cn(
                "p-10 text-white relative transition-colors duration-500",
                selectedPatient.status === "active" ? "bg-emerald-500" : "bg-slate-500"
              )}>
                <button onClick={() => setSelectedPatientId(null)} className="absolute top-8 right-8 w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30"><X size={20} /></button>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 bg-white/20 rounded-[10px] flex items-center justify-center text-5xl font-black">{selectedPatient.name[0]}</div>
                  <div>
                    <h3 className="text-4xl font-black tracking-tight">{selectedPatient.name}</h3>
                    <div className="flex gap-3 mt-2">
                      <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedPatient.gender}</span>
                      <span className="px-3 py-1 bg-white/20 rounded-full text-[10px] font-black uppercase tracking-widest">{selectedPatient.age} Years Old</span>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5",
                        selectedPatient.status === "active" ? "bg-emerald-400 text-emerald-900" : "bg-slate-400 text-slate-900"
                      )}>
                        {selectedPatient.status === "active" ? <CheckCircle2 size={12} /> : <X size={12} />}
                        {selectedPatient.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-10 space-y-10 max-h-[50vh] overflow-y-auto">
                {/* Status Toggle Area */}
                <div className="p-6 bg-secondary/20 rounded-[10px] border border-border flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold">Patient Management Status</p>
                    <p className="text-[10px] text-muted-foreground uppercase font-black">Toggle medical case availability</p>
                  </div>
                  <button 
                    onClick={() => togglePatientStatus(selectedPatient.id)}
                    className="relative"
                  >
                    <div 
                      className={cn(
                        "w-14 h-8 rounded-full p-1 transition-colors cursor-pointer",
                        selectedPatient.status === "active" ? "bg-emerald-500" : "bg-slate-300"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 bg-white rounded-full transition-transform",
                        selectedPatient.status === "active" ? "translate-x-6" : "translate-x-0"
                      )} />
                    </div>
                  </button>
                </div>
                {/* Logistics Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest"><Home size={14} className="text-emerald-500" /> Home Address</div>
                    <p className="font-bold text-sm leading-relaxed p-4 bg-secondary/20 rounded-[10px] border border-border">{selectedPatient.homeAddress}</p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase text-muted-foreground tracking-widest"><Truck size={14} className="text-primary" /> Delivery Address</div>
                    <p className="font-bold text-sm leading-relaxed p-4 bg-primary/5 rounded-[10px] border border-primary/20 text-primary">{selectedPatient.deliveryAddress}</p>
                  </div>
                </div>

                {/* Medication Section */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2"><ClipboardList size={14} className="text-emerald-500" /> Medication Audit</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-6 bg-emerald-50 border border-emerald-100 rounded-[10px]">
                      <p className="text-[10px] font-black uppercase text-emerald-700 mb-3 flex items-center gap-1.5"><PackageCheck size={12} /> New Prescriptions</p>
                      <div className="space-y-2">
                        {selectedPatient.newMedicines.map(med => (
                          <div key={med} className="flex items-center gap-2 font-bold text-sm text-emerald-900"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> {med}</div>
                        ))}
                      </div>
                    </div>
                    <div className="p-6 bg-secondary/30 border border-border rounded-[10px]">
                      <p className="text-[10px] font-black uppercase text-muted-foreground mb-3 flex items-center gap-1.5"><History size={12} /> Medical History</p>
                      <div className="space-y-2 opacity-60">
                        {selectedPatient.previousMedicines.map(med => (
                          <div key={med} className="flex items-center gap-2 font-bold text-sm line-through"><div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" /> {med}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Physician Section */}
                <div className="pt-8 border-t border-border flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-500 text-white rounded-[10px] flex items-center justify-center shadow-lg shadow-blue-500/20"><Stethoscope size={24} /></div>
                    <div>
                      <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Assigned Physician</p>
                      <p className="font-bold text-lg">{(doctors.find(d => d.id === selectedPatient.assignedDoctorId))?.name}</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-emerald-500/10 text-emerald-600 rounded-[10px] flex items-center gap-2 text-[10px] font-black uppercase">
                    <AlertCircle size={14} /> Critical Care Active
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 bg-secondary/20 border-t border-border flex justify-end gap-3">
                <button onClick={() => setSelectedPatientId(null)} className="px-10 py-4 bg-emerald-500 text-white font-black text-xs uppercase rounded-[10px] hover:bg-emerald-600 transition-all shadow-xl shadow-emerald-500/20">Acknowledge Profile</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Appointment Detail Modals for the new table */}
      <AnimatePresence>
        {selectedAppointment && (
          <AppointmentDetailModal
            meeting={selectedAppointment}
            role="Manager"
            onClose={() => setSelectedAppointment(null)}
            onLogVisit={() => {
              setLoggingAppointment(selectedAppointment);
              setSelectedAppointment(null);
            }}
          />
        )}
        {loggingAppointment && (
          <VisitCompletionForm
            meeting={loggingAppointment}
            onClose={() => setLoggingAppointment(null)}
          />
        )}
        {isAddModalOpen && (
          <NewAuditForm 
            onClose={() => {
              setIsAddModalOpen(false);
              setAddPreFill(null);
            }} 
            initialData={addPreFill ? { ...addPreFill } : {}}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function KPICardSmall({ label, value, icon: Icon, color }: { label: string, value: string, icon: any, color: string }) {
  return (
    <div className="p-4 bg-white border border-border rounded-[10px] flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-[10px] flex items-center justify-center text-white shadow-md", color)}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">{label}</p>
        <p className="text-base font-black">{value}</p>
      </div>
    </div>
  );
}
