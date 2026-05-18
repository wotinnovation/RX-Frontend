"use client";

import React, { useState, useMemo } from "react";
import { 
  FileText, 
  Download, 
  Filter, 
  Hospital, 
  User as UserIcon, 
  TrendingUp, 
  Package, 
  FileSpreadsheet, 
  FileJson, 
  File as FilePdf,
  Calendar,
  ShieldCheck,
  Activity,
  UserCheck,
  Target,
  Users,
  Search,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  MapPin,
  Stethoscope,
  Briefcase,
  AlertCircle,
  Pill,
  History,
  Layout,
  DollarSign,
  Heart,
  Plus,
  ArrowRight,
  ClipboardList,
  BarChart3,
  UserPlus,
  MessageSquare,
  Navigation
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useData } from "@/lib/context/data-context";

type ReportType = "hospital" | "doctor" | "sales" | "inventory" | "staff" | "patient";

export default function ReportsPage() {
  const { hospitals, doctors, sales, medicines, reps, patients, appointments } = useData();
  const [selectedType, setSelectedType] = useState<ReportType>("doctor");
  const [selectedEntityId, setSelectedEntityId] = useState<string>("all");
  const [dateRange, setDateRange] = useState("this_month");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [activeDetailRow, setActiveDetailRow] = useState<string | null>(null);
  const [activeDoctorSubRow, setActiveDoctorSubRow] = useState<string | null>(null);
  const [activePatientSubRow, setActivePatientSubRow] = useState<string | null>(null);
  const [filterDoctorId, setFilterDoctorId] = useState<string | null>(null);
  const [showDirectExport, setShowDirectExport] = useState(false);

  const reportConfig = {
    hospital: {
      title: "Facility Utilization Report",
      description: "Deep audit of facilities including clinical staff, patient care, and medicine provision aggregates.",
      icon: Hospital,
      color: "bg-blue-500",
      entityLabel: "Select Hospital",
      entities: hospitals.map(h => ({ id: h.id, name: h.name }))
    },
    doctor: {
      title: "Physician Engagement Audit",
      description: "Comprehensive profile of engagement, clinical outcomes, and staff attribution.",
      icon: UserIcon,
      color: "bg-purple-500",
      entityLabel: "Select Physician",
      entities: doctors.map(d => ({ id: d.id, name: d.name }))
    },
    sales: {
      title: "Commercial Performance Ledger",
      description: "Comprehensive breakdown of revenue, growth, and territory sales targets.",
      icon: TrendingUp,
      color: "bg-emerald-500",
      entityLabel: "Select Market Zone",
      entities: [
        { id: "all", name: "All Territories" },
        { id: "dubai", name: "Dubai Central" },
        { id: "sharjah", name: "Sharjah & Northern" },
        { id: "abudhabi", name: "Abu Dhabi" }
      ]
    },
    inventory: {
      title: "Supply Chain Intelligence",
      description: "Monitor stock levels, depletion rates, and replenishment cycles.",
      icon: Package,
      color: "bg-amber-500",
      entityLabel: "Select SKU / Medicine",
      entities: medicines.map(m => ({ id: m.id, name: m.name }))
    },
    staff: {
      title: "Personnel Activity Audit",
      description: "Review field operations, visit compliance, and target achievement by staff.",
      icon: UserCheck,
      color: "bg-rose-500",
      entityLabel: "Select Sales Representative",
      entities: reps.map(r => ({ id: r.id, name: r.name }))
    },
    patient: {
      title: "Provision & Care Log",
      description: "Audit medicine provision, delivery history, and care outcomes for recipients.",
      icon: Users,
      color: "bg-indigo-500",
      entityLabel: "Select Patient",
      entities: patients.map(p => ({ id: p.id, name: p.name }))
    }
  };

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setShowExportModal(true);
    }, 2000);
  };

  const currentConfig = reportConfig[selectedType];

  // Deep Data Preview Extraction
  const previewData = useMemo(() => {
    switch (selectedType) {
      case "doctor":
        const filteredDoctors = selectedEntityId === "all" ? doctors : doctors.filter(d => d.id === selectedEntityId);
        return filteredDoctors.map(d => {
          const hosp = hospitals.find(h => h.id === d.hospitalId);
          const assignedRep = reps.find(r => r.id === hosp?.assignedRepId);
          const doctorPatients = patients.filter(p => p.assignedDoctorId === d.id);
          const doctorSales = sales.filter(s => s.doctorId === d.id);
          const doctorAppointments = appointments.filter(a => a.doctorName === d.name && a.status === "completed").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          return {
            id: d.id,
            primary: d.name,
            metadata: { Specialty: d.specialty, Facility: hosp?.name || "Independent", "Assigned Staff": assignedRep?.name || "Unassigned", "Patient Load": doctorPatients.length },
            deepDetail: {
              summary: `${d.name} Clinical Engagement Audit: Specializes in ${d.specialty} at ${hosp?.name}. Currently managing ${doctorPatients.length} recipients.`,
              patients: doctorPatients.map(p => ({ id: p.id, name: p.name, condition: p.condition, age: p.age, lastVisit: p.lastVisit.split('T')[0], newMeds: p.newMedicines, oldMeds: p.previousMedicines, address: p.homeAddress, gender: p.gender })),
              sales: doctorSales.slice(0, 5).map(s => ({ id: s.id, med: medicines.find(m => m.id === s.medicineId)?.name || "SKU", amount: s.amount, date: new Date(s.date).toLocaleDateString() })),
              staff: assignedRep,
              appointments: doctorAppointments.slice(0, 5).map(a => ({
                id: a.id,
                title: a.title,
                date: a.date,
                hour: a.hour,
                staff: a.staffName,
                notes: a.closingComments || a.description || "No detailed field notes provided.",
                location: a.location || hosp?.name || "Clinic"
              }))
            },
            value: `${doctorPatients.length} Pts`,
            status: doctorPatients.length > 10 ? "High Load" : "Stable",
            date: doctorAppointments[0]?.date || "No Recent Log"
          };
        });

      case "hospital":
        const filteredHospitals = selectedEntityId === "all" ? hospitals : hospitals.filter(h => h.id === selectedEntityId);
        return filteredHospitals.map(h => {
          const hospitalDocs = doctors.filter(d => d.hospitalId === h.id);
          const hospitalPatients = patients.filter(p => p.hospitalId === h.id);
          const hospitalSales = sales.filter(s => s.hospitalId === h.id);
          const hospitalStaff = reps.find(r => r.id === h.assignedRepId);
          const lastVisit = appointments.filter(a => a.hospitalName === h.name && a.status === "completed").sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];
          
          const provisionSummary = hospitalSales.reduce((acc: any, s: any) => {
            const medName = medicines.find(m => m.id === s.medicineId)?.name || "Unknown SKU";
            if (!acc[medName]) acc[medName] = { name: medName, qty: 0, val: 0 };
            acc[medName].qty += 1;
            acc[medName].val += s.amount;
            return acc;
          }, {});

          return {
            id: h.id,
            primary: h.name,
            metadata: { Area: h.area, Priority: h.priority.toUpperCase(), Staff: hospitalStaff?.name || "Unassigned", Engagement: lastVisit ? `Last Visit: ${lastVisit.date}` : "No recent engagement" },
            deepDetail: {
              summary: `${h.name} Audit: Managing ${hospitalDocs.length} physicians and ${hospitalPatients.length} care recipients. Territory assigned to ${hospitalStaff?.name || "Global Pool"}.`,
              doctors: hospitalDocs.map(d => ({ id: d.id, name: d.name, specialty: d.specialty, patientCount: patients.filter(p => p.assignedDoctorId === d.id).length })),
              patients: hospitalPatients.map(p => ({ id: p.id, doctorId: p.assignedDoctorId, name: p.name, condition: p.condition, meds: [...p.newMedicines, ...p.previousMedicines], lastUpdate: p.lastVisit.split('T')[0], newMeds: p.newMedicines, oldMeds: p.previousMedicines, address: p.homeAddress, gender: p.gender, age: p.age })),
              provisions: Object.values(provisionSummary).sort((a: any, b: any) => b.val - a.val),
              staff: hospitalStaff,
              lastVisit: lastVisit,
              totalVal: hospitalSales.reduce((acc, s) => acc + s.amount, 0)
            },
            value: `${hospitalPatients.length} Patients`,
            status: h.priority === "high" ? "Critical" : "Stable",
            date: lastVisit?.date || "No Date"
          };
        });

      case "patient":
        const filteredPatients = selectedEntityId === "all" ? patients : patients.filter(p => p.id === selectedEntityId);
        return filteredPatients.map(p => {
          const doc = doctors.find(d => d.id === p.assignedDoctorId);
          const hosp = hospitals.find(h => h.id === p.hospitalId);
          return {
            id: p.id,
            primary: p.name,
            metadata: { Condition: p.condition, Age: `${p.age} Yrs`, Physician: doc?.name || "Unassigned", Status: p.status.toUpperCase() },
            deepDetail: { summary: `Care Log: Receiving treatment for ${p.condition} at ${hosp?.name}. Managed by ${doc?.name}.`, patientInfo: { id: p.id, name: p.name, age: p.age, gender: p.gender, condition: p.condition, address: p.homeAddress, lastVisit: p.lastVisit.split('T')[0], newMeds: p.newMedicines, oldMeds: p.previousMedicines } },
            value: p.status === "active" ? "Care Active" : "Inactive", status: p.status, date: p.lastVisit.split('T')[0]
          };
        });

      case "sales":
        const filteredSales = selectedEntityId === "all" ? sales : sales.filter(s => hospitals.find(h => h.id === s.hospitalId)?.area?.toLowerCase().includes(selectedEntityId.toLowerCase()));
        return filteredSales.slice(0, 15).map(s => ({
          id: s.id,
          primary: hospitals.find(h => h.id === s.hospitalId)?.name || "Unknown",
          metadata: { Zone: hospitals.find(h => h.id === s.hospitalId)?.area || "N/A", Rep: reps.find(r => r.id === s.repId)?.name || "Unassigned", SKU: medicines.find(m => m.id === s.medicineId)?.name || "N/A" },
          deepDetail: { summary: s.notes || "Standard procurement log." },
          value: `${s.amount.toLocaleString()} AED`,
          status: "Verified",
          date: new Date(s.date).toLocaleDateString()
        }));

      case "inventory":
        const filteredMeds = selectedEntityId === "all" ? medicines : medicines.filter(m => m.id === selectedEntityId);
        return filteredMeds.map(m => ({
          id: m.id,
          primary: m.name,
          metadata: { Category: m.category, Price: `${m.price} AED`, Stock: m.stock, Health: m.stock < 500 ? "Restock Required" : "Stable" },
          deepDetail: { summary: `SKU Health: ${m.stock < 500 ? "Critical" : "Normal"} depletion rate.` },
          value: `${m.stock} Units`,
          status: m.stock < 500 ? "Alert" : "Healthy",
          date: "Live SKU"
        }));

      case "staff":
        const filteredReps = selectedEntityId === "all" ? reps : reps.filter(r => r.id === selectedEntityId);
        return filteredReps.map(r => ({
          id: r.id,
          primary: r.name,
          metadata: { Zone: r.zone, Compliance: `${r.visits}/${r.planned}`, Achievement: `${r.pct}%`, Target: `${r.targetAmount.toLocaleString()} AED` },
          deepDetail: { summary: `Performance Audit: ${r.name} has achieved ${r.pct}% of target.` },
          value: `${r.pct}%`,
          status: r.pct > 70 ? "Active" : "Behind",
          date: "Monthly"
        }));

      default:
        return [];
    }
  }, [selectedType, selectedEntityId, sales, medicines, hospitals, doctors, patients, reps, appointments]);

  return (
    <div className="space-y-10 pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase">Intelligence Center</h1>
          <p className="text-muted-foreground mt-1 font-medium italic">High-fidelity cross-functional operational auditing engine.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <button 
              onClick={() => setShowDirectExport(!showDirectExport)}
              className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl flex items-center gap-2 hover:scale-[1.02] transition-all shadow-lg shadow-primary/20"
            >
              <Download size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">Export Master Data</span>
            </button>
            <AnimatePresence>
              {showDirectExport && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 top-full mt-2 w-64 bg-card border border-border rounded-2xl shadow-2xl p-4 z-50"
                >
                  <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-3 ml-2">Export Format</p>
                  <div className="space-y-1">
                    <button onClick={() => { setShowDirectExport(false); setTimeout(() => window.print(), 300); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors group">
                      <div className="flex items-center gap-3"><FilePdf size={16} /><span className="text-xs font-black">Audit PDF</span></div>
                      <Download size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button onClick={() => { setShowDirectExport(false); handleGenerate(); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-emerald-500/10 text-emerald-500 transition-colors group">
                      <div className="flex items-center gap-3"><FileSpreadsheet size={16} /><span className="text-xs font-black">Excel Ledger</span></div>
                      <Download size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                    <button onClick={() => { setShowDirectExport(false); handleGenerate(); }} className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-500/10 text-blue-600 transition-colors group">
                      <div className="flex items-center gap-3"><FileJson size={16} /><span className="text-xs font-black">Raw JSON Database</span></div>
                      <Download size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="hidden md:flex px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl items-center gap-2">
            <ShieldCheck size={16} className="text-emerald-500" />
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Deep Audit</span>
          </div>
        </div>
      </header>

      {/* Report Selection Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {(Object.keys(reportConfig) as ReportType[]).map((type) => {
          const config = reportConfig[type];
          const Icon = config.icon;
          const isActive = selectedType === type;
          
          return (
            <motion.button
              key={type}
              onClick={() => {
                setSelectedType(type);
                setSelectedEntityId("all");
                setActiveDetailRow(null);
                setFilterDoctorId(null);
                setActivePatientSubRow(null);
              }}
              className={cn(
                "p-4 rounded-2xl border-2 transition-all text-left relative overflow-hidden group",
                isActive 
                  ? "bg-card border-primary shadow-xl shadow-primary/5" 
                  : "bg-card/40 border-border hover:border-primary/30"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-all",
                isActive ? config.color + " text-white shadow-lg" : "bg-secondary text-muted-foreground"
              )}>
                <Icon size={18} />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-tight leading-tight">{config.title.split(' ').slice(0, 2).join(' ')}</h3>
            </motion.button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Configuration Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 card-shadow">
            <h3 className="text-xl font-black uppercase tracking-tighter mb-8 flex items-center gap-3">
              <Target className="text-primary" size={24} /> Audit Scope
            </h3>
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">{currentConfig.entityLabel}</label>
                <div className="relative group">
                  <select 
                    value={selectedEntityId}
                    onChange={(e) => {
                      setSelectedEntityId(e.target.value);
                      setActiveDetailRow(null);
                      setFilterDoctorId(null);
                      setActivePatientSubRow(null);
                    }}
                    className="w-full px-6 py-4 bg-secondary/50 border border-border rounded-2xl text-[11px] font-black uppercase outline-none focus:ring-4 focus:ring-primary/10 transition-all appearance-none cursor-pointer"
                  >
                    <option value="all">Comprehensive Analysis (Global Pool)</option>
                    {currentConfig.entities.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                  <ChevronRight size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground rotate-90 pointer-events-none" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Temporal Window</label>
                <div className="grid grid-cols-2 gap-2">
                  {["today", "week", "month", "quarter"].map(range => (
                    <button
                      key={range}
                      onClick={() => setDateRange(range)}
                      className={cn(
                        "px-4 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all",
                        dateRange === range ? "bg-primary text-white border-primary shadow-lg" : "bg-secondary/30 text-muted-foreground border-border hover:bg-secondary"
                      )}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className={cn(
                "w-full mt-10 py-6 rounded-2xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 transition-all shadow-2xl",
                isGenerating ? "bg-secondary text-muted-foreground" : "bg-primary text-primary-foreground shadow-primary/20 hover:scale-[1.02] active:scale-98"
              )}
            >
              {isGenerating ? "Generating Audit..." : "Initiate High-Precision Audit"}
            </button>
          </div>
        </div>

        {/* Deep Data Preview Column */}
        <div className="lg:col-span-8">
          <div className="bg-card border border-border rounded-[2.5rem] card-shadow h-full flex flex-col relative overflow-hidden">
            <div className="p-8 border-b border-border flex items-center justify-between bg-secondary/10">
              <div className="flex items-center gap-4">
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg", currentConfig.color)}>
                  {React.createElement(currentConfig.icon, { size: 24 })}
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase tracking-tight">{currentConfig.title}</h4>
                  <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">
                    Entity Drill-Down Extraction
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-auto">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={selectedType + selectedEntityId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="divide-y divide-border"
                >
                  {previewData.length > 0 ? (
                    previewData.map((row, i) => (
                      <div key={row.id + i} className="group transition-all hover:bg-secondary/20">
                        <div 
                          className="px-8 py-6 flex items-center justify-between cursor-pointer"
                          onClick={() => {
                            setActiveDetailRow(activeDetailRow === row.id ? null : row.id);
                            setFilterDoctorId(null);
                            setActivePatientSubRow(null);
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-base font-black text-foreground truncate">{row.primary}</h3>
                              <span className={cn(
                                "px-2 py-0.5 rounded text-[8px] font-black uppercase border",
                                row.status === "Alert" || row.status === "Behind" || row.status === "Critical" || row.status === "High Load" ? "bg-rose-500/10 text-rose-600 border-rose-500/20" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                              )}>
                                {row.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                              {Object.entries(row.metadata).map(([k, v]) => (
                                <div key={k} className="flex items-center gap-1.5">
                                  <span className="text-[9px] font-black uppercase text-muted-foreground/60 tracking-widest">{k}:</span>
                                  <span className="text-[10px] font-bold text-muted-foreground">{v}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="text-right ml-6">
                            <p className="text-lg font-black text-primary leading-none mb-1">{row.value}</p>
                            <p className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter">{row.date}</p>
                          </div>
                          <motion.div 
                            animate={{ rotate: activeDetailRow === row.id ? 90 : 0 }}
                            className="ml-6 text-muted-foreground/40"
                          >
                            <ChevronRight size={20} />
                          </motion.div>
                        </div>
                        
                        <AnimatePresence>
                          {activeDetailRow === row.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="overflow-hidden bg-secondary/10 border-t border-dashed border-border"
                            >
                              <div className="p-8 space-y-10">
                                {/* Summary Narrative */}
                                <div className="space-y-4">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                                      <FileText size={14} /> Executive Summary
                                    </div>
                                  </div>
                                  <p className="text-sm font-medium text-muted-foreground italic leading-relaxed">
                                    "{row.deepDetail.summary}"
                                  </p>
                                </div>

                                {selectedType === "doctor" && (
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    {/* Detailed Field Engagement Logs with Staff Notes */}
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary">
                                          <Navigation size={14} /> Granular Engagement Logs
                                        </div>
                                        <span className="text-[8px] font-black uppercase text-muted-foreground italic">Scroll for full audit</span>
                                      </div>
                                      <div className="space-y-3 max-h-[400px] overflow-auto pr-2 scrollbar-thin">
                                        {(row.deepDetail as any).appointments?.map((app: any, idx: number) => (
                                          <div key={idx} className="p-5 bg-white border border-border rounded-2xl shadow-sm space-y-4 border-l-4 border-l-primary">
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <h5 className="text-xs font-black text-foreground">{app.title}</h5>
                                                <div className="flex items-center gap-2 mt-1">
                                                  <Calendar size={10} className="text-muted-foreground" />
                                                  <span className="text-[9px] font-bold text-muted-foreground uppercase">{app.date} · {app.hour}</span>
                                                </div>
                                              </div>
                                              <div className="text-right">
                                                <div className="px-2 py-0.5 bg-secondary rounded text-[8px] font-black uppercase text-muted-foreground mb-1">{app.location}</div>
                                                <p className="text-[10px] font-black text-primary uppercase tracking-tighter">{app.staff}</p>
                                              </div>
                                            </div>
                                            
                                            <div className="p-3 bg-secondary/20 rounded-xl border border-secondary border-dashed">
                                              <div className="flex items-center gap-1.5 mb-1.5 text-primary">
                                                <MessageSquare size={10} />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Field Personnel Notes:</span>
                                              </div>
                                              <p className="text-[11px] font-medium text-muted-foreground italic leading-relaxed">
                                                "{app.notes}"
                                              </p>
                                            </div>
                                          </div>
                                        ))}
                                        {((row.deepDetail as any).appointments?.length || 0) === 0 && (
                                          <div className="p-10 border border-dashed border-border rounded-2xl text-center">
                                            <p className="text-[10px] font-black uppercase text-muted-foreground opacity-50">No historical engagement logs found.</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Patient & Prescription Section */}
                                    <div className="space-y-6">
                                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600">
                                        <Heart size={14} /> Recipient Care Roster ({(row.deepDetail as any).patients?.length || 0})
                                      </div>
                                      <div className="grid grid-cols-1 gap-3">
                                        {(row.deepDetail as any).patients?.slice(0, 5).map((pat: any) => (
                                          <div key={pat.id} className="p-4 bg-white border border-border rounded-2xl shadow-sm cursor-pointer border-l-4 border-l-indigo-500" onClick={() => setActivePatientSubRow(activePatientSubRow === pat.id ? null : pat.id)}>
                                            <div className="flex items-center justify-between">
                                              <div>
                                                <p className="text-xs font-black">{pat.name}</p>
                                                <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">{pat.condition}</p>
                                              </div>
                                              <ChevronRight size={14} className={cn("transition-transform text-muted-foreground/40", activePatientSubRow === pat.id && "rotate-90")} />
                                            </div>
                                            <AnimatePresence>
                                              {activePatientSubRow === pat.id && (
                                                <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                                                  <div className="mt-4 pt-4 border-t border-dashed border-border/50 grid grid-cols-2 gap-4">
                                                    <div>
                                                      <p className="text-[8px] font-black uppercase text-emerald-600 mb-1">New Provision</p>
                                                      {pat.newMeds.map((m: any, i: number) => <p key={i} className="text-[9px] font-bold text-primary flex items-center gap-1"><Pill size={8} /> {m}</p>)}
                                                    </div>
                                                    <div>
                                                      <p className="text-[8px] font-black uppercase text-amber-600 mb-1">Clinical Archive</p>
                                                      {pat.oldMeds.map((m: any, i: number) => <p key={i} className="text-[9px] font-bold text-muted-foreground opacity-60 flex items-center gap-1"><History size={8} /> {m}</p>)}
                                                    </div>
                                                  </div>
                                                </motion.div>
                                              )}
                                            </AnimatePresence>
                                          </div>
                                        ))}
                                      </div>

                                      <div className="p-6 bg-primary/5 border border-primary/10 rounded-[2rem] space-y-4 mt-auto">
                                        <div className="flex items-center justify-between">
                                          <p className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1">Commercial Footprint</p>
                                          <DollarSign size={16} className="text-primary opacity-30" />
                                        </div>
                                        <div className="space-y-2">
                                          {(row.deepDetail as any).sales?.map((s: any, idx: number) => (
                                            <div key={idx} className="flex items-center justify-between text-[10px] font-bold p-3 bg-white border border-border rounded-xl shadow-sm">
                                              <span className="flex items-center gap-2"><Pill size={14} className="text-primary" /> {s.med}</span>
                                              <span className="text-emerald-600 font-black">{s.amount.toLocaleString()} AED</span>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {selectedType === "hospital" && (
                                  <div className="space-y-10">
                                    {/* Provision Aggregates */}
                                    <div className="space-y-4">
                                      <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600"><BarChart3 size={14} /> Provision Intelligence (AED {((row.deepDetail as any).totalVal || 0).toLocaleString()})</div>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                        {(row.deepDetail as any).provisions?.slice(0, 3).map((med: any, idx: number) => (
                                          <div key={idx} className="p-4 bg-white border border-border rounded-2xl shadow-sm flex items-center justify-between">
                                            <div><p className="text-[10px] font-black uppercase">{med.name}</p><p className="text-[8px] font-black uppercase text-muted-foreground">{med.qty} Units</p></div>
                                            <p className="text-xs font-black text-emerald-600">{med.val.toLocaleString()} AED</p>
                                          </div>
                                        ))}
                                      </div>
                                    </div>

                                    {/* Clinical Staff Section */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 border-t border-border pt-8">
                                      <div className="md:col-span-5 space-y-4">
                                        <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary"><Stethoscope size={14} /> Clinical Staff ({(row.deepDetail as any).doctors?.length || 0})</div><button onClick={() => setFilterDoctorId(null)} className="text-[8px] font-black uppercase text-rose-500 hover:underline">Reset</button></div>
                                        <div className="space-y-2">
                                          {(row.deepDetail as any).doctors?.map((doc: any) => (
                                            <div key={doc.id} onClick={() => setFilterDoctorId(filterDoctorId === doc.id ? null : doc.id)} className={cn("p-4 bg-white border rounded-2xl shadow-sm cursor-pointer transition-all flex items-center justify-between group", filterDoctorId === doc.id ? "border-primary ring-2 ring-primary/10 shadow-md" : "border-border hover:border-primary/40")}>
                                              <div><p className={cn("text-xs font-black transition-colors", filterDoctorId === doc.id ? "text-primary" : "text-foreground")}>{doc.name}</p><p className="text-[9px] text-muted-foreground uppercase font-bold">{doc.specialty}</p></div>
                                              <div className="flex items-center gap-3"><span className={cn("text-[9px] font-black px-2 py-0.5 rounded-full transition-colors", filterDoctorId === doc.id ? "bg-primary text-white" : "bg-primary/5 text-primary")}>{doc.patientCount} Pts</span><ChevronRight size={14} className={cn("transition-all", filterDoctorId === doc.id ? "text-primary translate-x-1" : "text-muted-foreground/30")} /></div>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="md:col-span-7 space-y-4">
                                        <div className="flex items-center justify-between"><div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-600"><Users size={14} /> {filterDoctorId ? `Recipients under ${(row.deepDetail as any).doctors?.find((d: any) => d.id === filterDoctorId)?.name}` : `Facility Recipients (${(row.deepDetail as any).patients?.length || 0})`}</div><div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" /></div>
                                        <div className="grid grid-cols-1 gap-2">
                                          {(filterDoctorId ? (row.deepDetail as any).patients?.filter((p: any) => p.doctorId === filterDoctorId) : (row.deepDetail as any).patients)?.slice(0, 10).map((pat: any) => (
                                            <div key={pat.id} className="p-4 bg-white border border-border rounded-2xl shadow-sm cursor-pointer hover:border-indigo-500/40 transition-all" onClick={() => setActivePatientSubRow(activePatientSubRow === pat.id ? null : pat.id)}>
                                              <div className="flex items-center justify-between"><div><p className="text-xs font-black">{pat.name}</p><p className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">{pat.condition}</p></div><ChevronRight size={14} className={cn("transition-transform text-muted-foreground/40", activePatientSubRow === pat.id && "rotate-90")} /></div>
                                              <AnimatePresence>{activePatientSubRow === pat.id && (<motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden"><div className="mt-4 pt-4 border-t border-dashed border-border/50 grid grid-cols-2 gap-6"><div className="space-y-2"><p className="text-[8px] font-black uppercase text-emerald-600 flex items-center gap-1"><Plus size={10} /> Active Provisions</p>{pat.newMeds.map((m: any, i: number) => <p key={i} className="text-[9px] font-bold text-foreground flex items-center gap-2 bg-emerald-50 p-1.5 rounded-lg border border-emerald-100"><Pill size={10} className="text-emerald-500" /> {m}</p>)}</div><div className="space-y-2"><p className="text-[8px] font-black uppercase text-amber-600 flex items-center gap-1"><History size={10} /> Clinical Archive</p>{pat.oldMeds.map((m: any, i: number) => <p key={i} className="text-[9px] font-bold text-muted-foreground/60 flex items-center gap-2 bg-amber-50 p-1.5 rounded-lg border border-amber-100 opacity-70"><History size={10} /> {m}</p>)}</div></div></motion.div>)}</AnimatePresence>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {/* Attribution Footer */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-border pt-8">
                                  <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 mb-2"><Briefcase size={14} /> Personnel Attribution</div>
                                    <p className="text-sm font-black">{(row.deepDetail as any).staff?.name || "Global Pool"}</p>
                                    <p className="text-[9px] text-emerald-600/60 uppercase font-bold">{(row.deepDetail as any).staff?.role || "Field Specialist"}</p>
                                  </div>
                                  <div className="p-4 bg-primary/5 border border-primary/10 rounded-2xl">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-2"><DollarSign size={14} /> Commercial Ledger</div>
                                    <p className="text-sm font-black">AED {((row.deepDetail as any).totalVal)?.toLocaleString() || ((row.deepDetail as any).sales)?.reduce((acc: number, s: any) => acc + s.amount, 0).toLocaleString() || 0}</p>
                                    <p className="text-[9px] text-primary/60 uppercase font-bold">Extraction Verified</p>
                                  </div>
                                  <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2"><Layout size={14} /> Audit Health</div>
                                    <p className="text-sm font-black uppercase">Secured</p>
                                    <p className="text-[9px] text-amber-600/60 uppercase font-bold">Encrypted Stream</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))
                  ) : (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                      <Search size={48} className="text-muted-foreground opacity-10" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No records extracted for this scope.</p>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="p-6 bg-secondary/5 border-t border-border mt-auto flex items-center justify-between">
              <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                <ShieldCheck className="text-emerald-500" size={16} />
                Certified Audit Stream
              </div>
              <div className="flex gap-1.5">
                {[1, 2, 3].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/20" />)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Export Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-background/95 backdrop-blur-2xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="bg-card border border-border w-full max-w-2xl rounded-[3.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-12 text-center space-y-8">
                <div className="w-24 h-24 bg-emerald-500/10 text-emerald-500 rounded-[2.5rem] flex items-center justify-center mx-auto border border-emerald-500/20 shadow-inner">
                  <Download size={48} className="animate-bounce" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-5xl font-black uppercase tracking-tighter">Audit Compiled</h2>
                  <p className="text-muted-foreground font-medium text-lg italic">The granular data extraction is complete. Select your high-fidelity output format.</p>
                </div>
                
                <div className="grid grid-cols-3 gap-6 py-6">
                  {[
                    { icon: FilePdf, label: "Audit PDF", color: "text-rose-500", bg: "bg-rose-500/10" },
                    { icon: FileSpreadsheet, label: "Excel Ledger", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                    { icon: FileJson, label: "Raw JSON", color: "text-blue-500", bg: "bg-blue-500/10" }
                  ].map((format) => (
                    <button 
                      key={format.label}
                      onClick={() => {
                        setShowExportModal(false);
                        if (format.label === "Audit PDF") {
                          setTimeout(() => window.print(), 300);
                        } else {
                          // Mock download for other formats
                          const a = document.createElement("a");
                          a.href = "data:text/plain;charset=utf-8,Mock%20Export%20Data";
                          a.download = `Intelligence_Center_Export_${format.label.replace(' ', '_')}.txt`;
                          a.click();
                        }
                      }} 
                      className="group p-8 bg-secondary/20 border border-border rounded-[2.5rem] hover:border-primary transition-all flex flex-col items-center gap-4 hover:shadow-2xl hover:shadow-primary/5 active:scale-95"
                    >
                      <div className={cn("p-4 rounded-2xl group-hover:scale-110 transition-transform shadow-sm", format.bg, format.color)}>
                        <format.icon size={32} />
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest">{format.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setShowExportModal(false)}
                  className="w-full py-6 rounded-3xl bg-secondary text-muted-foreground font-black text-xs uppercase tracking-[0.4em] hover:bg-secondary/80 transition-all"
                >
                  Return to Dashboard
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
