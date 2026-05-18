"use client";
// Force rebuild to clear Turbopack cache


import React, { createContext, useContext, useState, useEffect } from "react";
import { STAFF_MEETINGS } from "../data/staff-meetings-data";

export interface Hospital {
  id: string;
  name: string;
  area: string;
  doctors: number;
  patients: number;
  assignedRepId: string | null;
  priority: "high" | "medium" | "low";
}

export interface Doctor {
  id: string;
  name: string;
  hospitalId: string;
  specialty: string;
}

export interface Patient {
  id: string;
  name: string;
  hospitalId: string;
  age: number;
  gender: string;
  condition: string;
  homeAddress: string;
  deliveryAddress: string;
  newMedicines: string[];
  previousMedicines: string[];
  assignedDoctorId: string;
  lastVisit: string;
  status: "active" | "inactive";
}

export interface SalesRep {
  id: string;
  name: string;
  initials: string;
  role: string;
  zone: string;
  status: string;
  pct: number;
  visits: number;
  planned: number;
  doctorsDetailed: number;
  totalDoctors: number;
  targetAmount: number; // In AED
  password?: string;
  email?: string;
  mobile?: string;
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  stock: number;
  price: number; // Price per unit in AED
}

export interface Sale {
  id: string;
  repId: string;
  hospitalId: string;
  doctorId: string; // Linked to doctor
  medicineId: string;
  quantity: number;
  amount: number;
  date: string;
  time: string;
  deliveryNeededDate: string;
  isCompound?: boolean;
  compoundDetails?: string;
  notes?: string;
}

export interface ExpenseRequest {
  id: string;
  staffId: string;
  staffName: string;
  type: "travel" | "meal" | "accommodation" | "other";
  amount: number;
  date: string;
  description: string;
  status: "pending" | "approved" | "rejected";
  managerComment?: string;
}

export interface Appointment {
  id: string;
  title: string;
  type: "medical" | "meeting" | "audit";
  entityName: string; // Doctor Name or Hospital Name or "HQ"
  location: string;
  date: string; // ISO string YYYY-MM-DD
  hour: string; // e.g. "10:00"
  duration: string;
  description: string;
  contactPerson: string;
  status: "scheduled" | "completed" | "cancelled" | "visited" | "closed" | "upcoming" | "pending_approval";
  hospitalName?: string;
  doctorName?: string;
  patientName?: string;
  staffName?: string;
  // Outcome fields
  requirements?: string;
  customCompound?: string;
  freeSamples?: { medicineId: string, qty: number, approved?: boolean }[];
  orders?: { medicineId: string, qty: number, total: number }[];
  prescriptionUrl?: string;
  openingComments?: string;
  closingComments?: string;
  managerComment?: string;
}

export interface GiftMeetup {
  id: string;
  staffName: string;
  type: "gift" | "meetup";
  item: string;
  hospitalName: string;
  doctorName: string;
  quantity: number;
  cost?: number;
  date: string;
  status: "pending_approval" | "approved" | "rejected";
  managerComment?: string;
  proofUrl?: string;
}


interface DataContextType {
  hospitals: Hospital[];
  doctors: Doctor[];
  patients: Patient[];
  reps: SalesRep[];
  medicines: Medicine[];
  sales: Sale[];
  appointments: Appointment[];
  expenses: ExpenseRequest[];
  isLoading: boolean;
  addRep: (rep: Omit<SalesRep, "id" | "initials" | "status" | "pct" | "visits" | "doctorsDetailed" | "totalDoctors">) => void;
  addHospital: (hospital: Omit<Hospital, "id" | "assignedRepId">) => void;
  addDoctor: (doctor: Omit<Doctor, "id">) => void;
  assignHospital: (hospitalId: string, repId: string | null) => void;
  addSale: (sale: Omit<Sale, "id" | "date">) => void;
  addPatient: (patient: Omit<Patient, "id" | "lastVisit" | "status" | "newMedicines" | "previousMedicines">) => void;
  togglePatientStatus: (patientId: string) => void;
  getRepSales: (repId: string) => Sale[];
  getHospitalDoctors: (hospitalId: string) => Doctor[];
  getHospitalPatients: (hospitalId: string) => Patient[];
  getDoctorSales: (doctorId: string) => Sale[];
  addAppointment: (app: Omit<Appointment, "id">) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  addExpense: (expense: Omit<ExpenseRequest, "id" | "status">) => void;
  updateExpenseStatus: (id: string, status: "approved" | "rejected", comment?: string) => void;
  updateHospital: (id: string, updates: Partial<Hospital>) => void;
  deleteHospital: (id: string) => void;
  giftMeetups: GiftMeetup[];
  addGiftMeetup: (item: Omit<GiftMeetup, "id" | "status">) => void;
  updateGiftMeetupStatus: (id: string, status: "approved" | "rejected", comment?: string) => void;
  approveSamples: (appointmentId: string) => void;
}


const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [reps, setReps] = useState<SalesRep[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRequest[]>([]);
  const [giftMeetups, setGiftMeetups] = useState<GiftMeetup[]>([]);
  const [isLoading, setIsLoading] = useState(true);


  const initialReps: SalesRep[] = [
    { id: "1", name: "Faisal Al Marzouqi", initials: "FM", role: "Sales Person", zone: "Deira · Al Nahda", status: "on route", pct: 71, visits: 15, planned: 20, doctorsDetailed: 14, totalDoctors: 18, targetAmount: 45000 },
    { id: "2", name: "Abdulla bin Rashid", initials: "AR", role: "Sales Person", zone: "Bur Dubai · Karama", status: "on route", pct: 75, visits: 18, planned: 24, doctorsDetailed: 16, totalDoctors: 22, targetAmount: 50000 },
    { id: "3", name: "Muna Al Falasi", initials: "MF", role: "Sales Person", zone: "Deira", status: "complete", pct: 100, visits: 21, planned: 21, doctorsDetailed: 16, totalDoctors: 16, targetAmount: 40000 },
    { id: "4", name: "Saeed Al Tayer", initials: "ST", role: "Sales Person", zone: "JLT · Marina", status: "behind", pct: 33, visits: 9, planned: 27, doctorsDetailed: 8, totalDoctors: 18, targetAmount: 55000 },
    { id: "5", name: "Ayesha Al Suwaidi", initials: "AS", role: "Sales Person", zone: "Sharjah", status: "on route", pct: 83, visits: 15, planned: 18, doctorsDetailed: 12, totalDoctors: 14, targetAmount: 38000 },
    { id: "6", name: "Omar Al Mansoori", initials: "OM", role: "Sales Person", zone: "Al Quoz", status: "no check-in", pct: 20, visits: 3, planned: 15, doctorsDetailed: 4, totalDoctors: 12, targetAmount: 30000 },
    { id: "m1", name: "John Manager", initials: "JM", role: "Manager", zone: "Dubai HQ", status: "online", pct: 0, visits: 0, planned: 0, doctorsDetailed: 0, totalDoctors: 0, targetAmount: 0 },
    { id: "m2", name: "Sarah Al Hashmi", initials: "SH", role: "Manager", zone: "Regional", status: "online", pct: 0, visits: 0, planned: 0, doctorsDetailed: 0, totalDoctors: 0, targetAmount: 0 },
    { id: "m3", name: "Sultan Al Qasimi", initials: "SQ", role: "Manager", zone: "Regional", status: "online", pct: 0, visits: 0, planned: 0, doctorsDetailed: 0, totalDoctors: 0, targetAmount: 0 },
    { id: "m4", name: "Khalifa Al Mazrouei", initials: "KM", role: "Manager", zone: "Dubai HQ", status: "online", pct: 0, visits: 0, planned: 0, doctorsDetailed: 0, totalDoctors: 0, targetAmount: 0 },
    { id: "m5", name: "Fatima Al Mansoori", initials: "FM", role: "Manager", zone: "Regional", status: "online", pct: 0, visits: 0, planned: 0, doctorsDetailed: 0, totalDoctors: 0, targetAmount: 0 },
  ];

  const generateData = () => {
    const hospitalList: Hospital[] = [];
    const doctorList: Doctor[] = [];
    const patientList: Patient[] = [];
    const zones = ["Deira", "Bur Dubai", "Marina", "Sharjah", "Al Quoz", "JLT"];
    const specialties = ["GP", "Cardiologist", "Pediatrician", "Dermatologist", "Orthopedic"];
    const patientNames = ["Zaid Ahmed", "Fatima Ali", "Yousuf Mohamed", "Amna Sultan", "Omar Hassan", "Noora Jassim", "Ali Rashid", "Maryam Saif"];
    const conditions = ["Hypertension", "Diabetes Type 2", "Chronic Cough", "Seasonal Allergy", "Back Pain", "Migraine"];
    const meds = ["Amoxicillin", "Lipitor", "Ventolin", "Augmentin"];

    initialReps.forEach((rep) => {
      for (let i = 1; i <= 6; i++) {
        const hospitalId = `h-${rep.id}-${i}`;
        const docCount = Math.floor(Math.random() * 5) + 3;
        const patientCount = Math.floor(Math.random() * 15) + 5;

        hospitalList.push({
          id: hospitalId,
          name: `${zones[Math.floor(Math.random() * zones.length)]} Hospital ${rep.id}${i}`,
          area: rep.zone,
          doctors: docCount,
          patients: patientCount,
          assignedRepId: (i % 3 === 0) ? null : rep.id, // Leave some unassigned for demo
          priority: Math.random() > 0.7 ? "high" : "medium"
        });

        const hospitalDocs: Doctor[] = [];
        for (let d = 1; d <= docCount; d++) {
          const doc = {
            id: `d-${hospitalId}-${d}`,
            name: `Dr. ${doctorNames[Math.floor(Math.random() * doctorNames.length)]}`,
            hospitalId: hospitalId,
            specialty: specialties[Math.floor(Math.random() * specialties.length)]
          };
          doctorList.push(doc);
          hospitalDocs.push(doc);
        }

        for (let p = 1; p <= patientCount; p++) {
          const address = `Villa ${Math.floor(Math.random() * 500) + 1}, ${zones[Math.floor(Math.random() * zones.length)]}, Dubai`;
          patientList.push({
            id: `p-${hospitalId}-${p}`,
            name: `${patientNames[Math.floor(Math.random() * patientNames.length)]} ${p}`,
            hospitalId: hospitalId,
            age: Math.floor(Math.random() * 60) + 18,
            gender: Math.random() > 0.5 ? "Male" : "Female",
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            homeAddress: address,
            deliveryAddress: address,
            newMedicines: [meds[0], meds[1]],
            previousMedicines: [meds[2], meds[3]],
            assignedDoctorId: hospitalDocs[Math.floor(Math.random() * hospitalDocs.length)].id,
            lastVisit: new Date().toISOString(),
            status: Math.random() > 0.2 ? "active" : "inactive"
          });
        }
      }
    });

    // Add a Global Pool of unassigned hospitals for demo
    const globalUnassigned = [
      { name: "Al Mankhool Medical Centre", area: "Bur Dubai", docs: 12, patients: 140, priority: "high" },
      { name: "Jumeirah Family Clinic", area: "Jumeirah 1", docs: 5, patients: 45, priority: "medium" },
      { name: "Dubai Hills Specialized Hospital", area: "Dubai Hills", docs: 28, patients: 310, priority: "high" },
      { name: "Silicon Oasis Polyclinic", area: "DSO", docs: 8, patients: 92, priority: "medium" },
      { name: "Palm Jumeirah Medical Hub", area: "Palm Jumeirah", docs: 15, patients: 115, priority: "high" },
      { name: "Dragon Mart Medical Zone", area: "International City", docs: 7, patients: 68, priority: "medium" },
    ];

    globalUnassigned.forEach((h, idx) => {
      const hId = `h-unassigned-${idx}`;
      hospitalList.push({
        id: hId,
        name: h.name,
        area: h.area,
        doctors: h.docs,
        patients: h.patients,
        assignedRepId: null,
        priority: h.priority as any
      });

      // Add one lead doctor for each to ensure table looks full
      doctorList.push({
        id: `d-${hId}-1`,
        name: `Dr. ${doctorNames[idx % doctorNames.length]}`,
        hospitalId: hId,
        specialty: "General Medicine"
      });
    });

    return { hospitals: hospitalList, doctors: doctorList, patients: patientList };
  };

  const doctorNames = ["Dr. Ahmed Al Hammadi", "Dr. Sarah Al Hashmi", "Dr. Sultan Al Qasimi", "Dr. Fatima Al Mazrouei", "Dr. Khalifa Al Suwaidi"];

  const generateSales = (hospitals: Hospital[], doctors: Doctor[], medicines: Medicine[]): Sale[] => {
    if (!medicines || medicines.length === 0) return [];
    const salesList: Sale[] = [];
    doctors.forEach((doc) => {
      const hospital = hospitals.find(h => h.id === doc.hospitalId);
      if (hospital?.assignedRepId) {
        const visitCount = Math.floor(Math.random() * 3) + 1;
        for (let v = 0; v < visitCount; v++) {
          const med = medicines[Math.floor(Math.random() * medicines.length)];
          if (!med) continue;
          const qty = Math.floor(Math.random() * 30) + 5;
          const isCompound = Math.random() > 0.7;
          salesList.push({
            id: `s-${doc.id}-${v}`,
            repId: hospital.assignedRepId,
            hospitalId: hospital.id,
            doctorId: doc.id,
            medicineId: med.id,
            quantity: qty,
            amount: qty * med.price,
            date: new Date(Date.now() - (v * 86400000)).toISOString(),
            time: `${Math.floor(Math.random() * 8) + 9}:00 AM`,
            deliveryNeededDate: new Date(Date.now() + (Math.floor(Math.random() * 5) * 86400000)).toLocaleDateString(),
            isCompound,
            compoundDetails: isCompound ? "Compound Mix: 250mg Amox + 10mg Zinc. Stable at 4°C." : undefined,
            notes: "Detailed provision log."
          });
        }
      }
    });
    return salesList;
  };

    const generateAppointments = (): Appointment[] => {
    const today = new Date();
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    
    const appointments: Appointment[] = [];
    const titles = ["Stock Audit", "Product Detail", "Quarterly Sync", "Clinic Visit", "Requirement Gathering", "Emergency Drop", "Performance Review"];
    const entities = ["City Heart Hospital", "Green Valley Clinic", "Central Medical Hub", "Eastside Medical", "Marina Specialised Clinic", "Sharjah Medical Center", "Al Mankhool Medical Centre"];
    const locations = ["Healthcare City", "Jumeirah", "Downtown Dubai", "Deira", "Marina", "Sharjah", "Bur Dubai"];

    // Generate 15 days past and 15 days future
    const statuses: Appointment["status"][] = ["visited", "completed", "closed", "cancelled", "scheduled", "upcoming"];
    
    for (let i = -15; i <= 15; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateStr = formatDate(targetDate);
      
      const dailyCount = Math.floor(Math.random() * 2) + 1;
      for (let j = 0; j < dailyCount; j++) {
        const isPast = i < 0;
        let status: Appointment["status"] = isPast ? statuses[Math.floor(Math.random() * 3)] : statuses[3 + Math.floor(Math.random() * 3)];
        
        // Ensure some "upcoming" and "scheduled" overlap with current week
        if (i === 0) status = "scheduled";
        if (i > 0 && i < 3 && j === 0) status = "upcoming";

        appointments.push({
          id: `app-${i}-${j}`,
          title: titles[Math.floor(Math.random() * titles.length)],
          type: i % 3 === 0 ? "audit" : (i % 2 === 0 ? "medical" : "meeting"),
          entityName: entities[Math.floor(Math.random() * entities.length)],
          location: locations[Math.floor(Math.random() * locations.length)],
          date: dateStr,
          hour: `${9 + j * 2}:00`,
          duration: "1h",
          description: "Operational field activity log.",
          contactPerson: "Liaison Officer",
          status: status,
          staffName: ["Faisal Al Marzouqi", "Abdulla bin Rashid", "Muna Al Falasi", "Saeed Al Tayer", "Ayesha Al Suwaidi", "Omar Al Mansoori"][Math.floor(Math.random() * 6)],
          hospitalName: entities[Math.floor(Math.random() * entities.length)],
          doctorName: doctorNames[Math.floor(Math.random() * doctorNames.length)],
          freeSamples: i === 0 ? [
            { medicineId: "m1", qty: 5, approved: false },
            { medicineId: "m2", qty: 2, approved: false }
          ] : undefined
        });
      }
    }

    return appointments;
  };

  useEffect(() => {
    const storedHospitals = localStorage.getItem("rx_hospitals_v5");
    const storedDoctors = localStorage.getItem("rx_doctors_v5");
    const storedPatients = localStorage.getItem("rx_patients_v5");
    const storedReps = localStorage.getItem("rx_reps_v4");
    const storedMedicines = localStorage.getItem("rx_medicines_v5");
    const storedSales = localStorage.getItem("rx_sales_v5");
    const storedAppointments = localStorage.getItem("rx_appointments_v7");
    const storedExpenses = localStorage.getItem("rx_expenses_v5");
    const storedGiftMeetups = localStorage.getItem("rx_gift_meetups_v2");

    if (storedReps) {
      const parsed = JSON.parse(storedReps);
      const merged = [...parsed];
      initialReps.forEach(initial => {
        if (!merged.find(r => r.id === initial.id)) {
          merged.push(initial);
        }
      });
      setReps(merged);
    } else {
      setReps(initialReps);
    }

    let currentMedicines = [];
    const defaultMedicines = [
      { id: "m1", name: "Amoxicillin 500mg", category: "Antibiotic", stock: 1200, price: 45 },
      { id: "m2", name: "Lipitor 20mg", category: "Statins", stock: 850, price: 120 },
      { id: "m3", name: "Ventolin Inhaler", category: "Respiratory", stock: 450, price: 65 },
      { id: "m4", name: "Augmentin 625mg", category: "Antibiotic", stock: 600, price: 85 },
      { id: "m5", name: "Metformin 500mg", category: "Antidiabetic", stock: 950, price: 35 },
    ];

    if (storedMedicines) {
      const parsed = JSON.parse(storedMedicines);
      if (parsed.length < 5) currentMedicines = defaultMedicines;
      else currentMedicines = parsed;
    } else {
      currentMedicines = defaultMedicines;
    }
    setMedicines(currentMedicines);

    let currentHospitals = [];
    let currentDoctors = [];
    let currentPatients = [];

    if (storedPatients && JSON.parse(storedPatients)[0]?.status) {
      currentHospitals = JSON.parse(storedHospitals || "[]");
      currentDoctors = JSON.parse(storedDoctors || "[]");
      currentPatients = JSON.parse(storedPatients);
    } else {
      const data = generateData();
      currentHospitals = data.hospitals;
      currentDoctors = data.doctors;
      currentPatients = data.patients;
    }

    setHospitals(currentHospitals);
    setDoctors(currentDoctors);
    setPatients(currentPatients);

    if (storedSales && JSON.parse(storedSales).length > 100 && JSON.parse(storedSales)[0]?.deliveryNeededDate) {
      setSales(JSON.parse(storedSales));
    } else {
      setSales(generateSales(currentHospitals, currentDoctors, currentMedicines));
    }

    if (storedAppointments) setAppointments(JSON.parse(storedAppointments));
    else setAppointments([...STAFF_MEETINGS]);
    
    if (storedExpenses) {
      setExpenses(JSON.parse(storedExpenses));
    } else {
      setExpenses([
        { id: "exp-1", staffId: "u2", staffName: "Muna Al Falasi", type: "travel", amount: 250, date: "2026-05-12", description: "Fuel for Al Ain territory visit", status: "approved" },
        { id: "exp-2", staffId: "u3", staffName: "Abdulla bin Rashid", type: "meal", amount: 85, date: "2026-05-13", description: "Lunch with lead physician at Mediclinic", status: "pending" },
        { id: "exp-3", staffId: "u4", staffName: "Faisal Al Marzouqi", type: "accommodation", amount: 1200, date: "2026-05-11", description: "Overnight stay for Sharjah health summit", status: "pending" },
        { id: "exp-4", staffId: "u2", staffName: "Muna Al Falasi", type: "meal", amount: 45, date: "2026-05-14", description: "Client coffee meeting - Jumeirah", status: "pending" },
        { id: "exp-5", staffId: "u5", staffName: "Saeed Al Tayer", type: "travel", amount: 480, date: "2026-05-10", description: "Monthly vehicle maintenance allowance", status: "approved" },
        { id: "exp-6", staffId: "u3", staffName: "Abdulla bin Rashid", type: "other", amount: 150, date: "2026-05-12", description: "Clinical brochure printing costs", status: "pending" },
        { id: "exp-7", staffId: "u6", staffName: "Omar Al Mansoori", type: "travel", amount: 310, date: "2026-05-13", description: "Inter-city travel (Dubai to Abu Dhabi)", status: "pending" },
      ]);
    }

    if (storedGiftMeetups) {
      setGiftMeetups(JSON.parse(storedGiftMeetups));
    } else {
      setGiftMeetups([
        { id: "gm-1", staffName: "Muna Al Falasi", type: "gift", item: "Anatomy Reference Guide", hospitalName: "Bur Dubai Hospital", doctorName: "Dr. Ahmed Mahmoud", quantity: 2, cost: 450, date: "2026-05-10", status: "approved" },
        { id: "gm-2", staffName: "Abdulla bin Rashid", type: "meetup", item: "Clinical Detailing Lunch", hospitalName: "City Heart Hospital", doctorName: "Dr. Ravi Nair", quantity: 5, cost: 350, date: "2026-05-12", status: "approved" },
        { id: "gm-3", staffName: "Faisal Al Marzouqi", type: "gift", item: "Branded Prescription Pads", hospitalName: "Jumeirah Family Clinic", doctorName: "Dr. John Smith", quantity: 50, cost: 100, date: "2026-05-14", status: "pending_approval" },
        { id: "gm-4", staffName: "Ayesha Al Suwaidi", type: "meetup", item: "Endocrinology Seminar Coffee", hospitalName: "Sharjah Medical Center", doctorName: "Dr. Fatima Al Mazrouei", quantity: 8, cost: 220, date: "2026-05-15", status: "approved" },
        { id: "gm-5", staffName: "Saeed Al Tayer", type: "gift", item: "Premium Stethoscope Set", hospitalName: "Marina Specialised Clinic", doctorName: "Dr. Khalifa Al Suwaidi", quantity: 1, cost: 850, date: "2026-05-16", status: "pending_approval" },
        { id: "gm-6", staffName: "Omar Al Mansoori", type: "meetup", item: "Orthopedics Symposium Dinner", hospitalName: "Al Mankhool Medical Centre", doctorName: "Dr. Ahmed Al Hammadi", quantity: 4, cost: 680, date: "2026-05-17", status: "pending_approval" },
        { id: "gm-7", staffName: "Faisal Al Marzouqi", type: "meetup", item: "Cardiology Unit Tea & Donuts", hospitalName: "City Heart Hospital", doctorName: "Dr. Sarah Al Hashmi", quantity: 12, cost: 180, date: "2026-05-18", status: "approved" },
        { id: "gm-8", staffName: "Muna Al Falasi", type: "gift", item: "Ophthalmology Penlights", hospitalName: "Green Valley Clinic", doctorName: "Dr. Sultan Al Qasimi", quantity: 20, cost: 300, date: "2026-05-18", status: "pending_approval" },
      ]);
    }

    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem("rx_hospitals_v5", JSON.stringify(hospitals));
      localStorage.setItem("rx_doctors_v5", JSON.stringify(doctors));
      localStorage.setItem("rx_patients_v5", JSON.stringify(patients));
      localStorage.setItem("rx_reps_v4", JSON.stringify(reps));
      localStorage.setItem("rx_medicines_v5", JSON.stringify(medicines));
      localStorage.setItem("rx_sales_v5", JSON.stringify(sales));
      localStorage.setItem("rx_appointments_v7", JSON.stringify(appointments));
      localStorage.setItem("rx_expenses_v5", JSON.stringify(expenses));
      localStorage.setItem("rx_gift_meetups_v2", JSON.stringify(giftMeetups));
    }
  }, [hospitals, doctors, patients, reps, medicines, sales, appointments, expenses, giftMeetups, isLoading]);


  const togglePatientStatus = (patientId: string) => {
    setPatients(patients.map(p => p.id === patientId ? { ...p, status: p.status === "active" ? "inactive" : "active" } : p));
  };

  const addRep = (rep: Omit<SalesRep, "id" | "initials" | "status" | "pct" | "visits" | "doctorsDetailed" | "totalDoctors">) => {
    const initials = rep.name.split(" ").map(n => n[0]).join("").toUpperCase();
    const newRep: SalesRep = {
      ...rep,
      id: Math.random().toString(36).substr(2, 9),
      initials,
      status: "inactive",
      pct: 0,
      visits: 0,
      doctorsDetailed: 0,
      totalDoctors: 0,
    };
    setReps([...reps, newRep]);
  };

  const addHospital = (hospital: Omit<Hospital, "id" | "assignedRepId">) => {
    const newHospital: Hospital = { ...hospital, id: Math.random().toString(36).substr(2, 9), assignedRepId: null };
    setHospitals([...hospitals, newHospital]);
  };

  const addDoctor = (doctor: Omit<Doctor, "id">) => {
    const newDoctor: Doctor = { ...doctor, id: Math.random().toString(36).substr(2, 9) };
    setDoctors([...doctors, newDoctor]);
  };

  const assignHospital = (hospitalId: string, repId: string | null) => {
    setHospitals(hospitals.map(h => h.id === hospitalId ? { ...h, assignedRepId: repId } : h));
  };

  const addSale = (sale: Omit<Sale, "id" | "date">) => {
    const newSale: Sale = {
      ...sale, id: Math.random().toString(36).substr(2, 9), date: new Date().toISOString(),
      deliveryNeededDate: new Date(Date.now() + 86400000 * 2).toLocaleDateString(), isCompound: false
    };
    setSales([...sales, newSale]);
  };

  const addPatient = (patient: Omit<Patient, "id" | "lastVisit" | "status" | "newMedicines" | "previousMedicines">) => {
    const newPatient: Patient = {
      ...patient,
      id: Math.random().toString(36).substr(2, 9),
      lastVisit: new Date().toISOString(),
      status: "active",
      newMedicines: [],
      previousMedicines: []
    };
    setPatients([...patients, newPatient]);
  };

  const getRepSales = (repId: string) => sales.filter(s => s.repId === repId);
  const getHospitalDoctors = (hospitalId: string) => doctors.filter(d => d.hospitalId === hospitalId);
  const getHospitalPatients = (hospitalId: string) => patients.filter(p => p.hospitalId === hospitalId);
  const getDoctorSales = (doctorId: string) => sales.filter(s => s.doctorId === doctorId);

  const addAppointment = (app: Omit<Appointment, "id">) => {
    const newApp: Appointment = { ...app, id: Math.random().toString(36).substr(2, 9) };
    setAppointments([newApp, ...appointments]);
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(appointments.map(app => app.id === id ? { ...app, ...updates } : app));
  };

  const addExpense = (expense: Omit<ExpenseRequest, "id" | "status">) => {
    const newExpense: ExpenseRequest = {
      ...expense,
      id: `exp-${Math.random().toString(36).substr(2, 9)}`,
      status: "pending"
    };
    setExpenses([...expenses, newExpense]);
  };

  const updateExpenseStatus = (id: string, status: "approved" | "rejected", comment?: string) => {
    setExpenses(expenses.map(exp => exp.id === id ? { ...exp, status, managerComment: comment } : exp));
  };

  const updateHospital = (id: string, updates: Partial<Hospital>) => {
    setHospitals(hospitals.map(h => h.id === id ? { ...h, ...updates } : h));
  };

  const deleteHospital = (id: string) => {
    setHospitals(hospitals.filter(h => h.id !== id));
  };

  const addGiftMeetup = (item: Omit<GiftMeetup, "id" | "status">) => {
    const newItem: GiftMeetup = {
      ...item,
      id: `gm-${Math.random().toString(36).substr(2, 9)}`,
      status: "pending_approval"
    };
    setGiftMeetups([newItem, ...giftMeetups]);
  };

  const updateGiftMeetupStatus = (id: string, status: "approved" | "rejected", comment?: string) => {
    setGiftMeetups(giftMeetups.map(item => item.id === id ? { ...item, status, managerComment: comment } : item));
  };

  const approveSamples = (appointmentId: string) => {
    setAppointments(appointments.map(app => {
      if (app.id === appointmentId && app.freeSamples) {
        return {
          ...app,
          freeSamples: app.freeSamples.map(s => ({ ...s, approved: true }))
        };
      }
      return app;
    }));
  };

  return (
    <DataContext.Provider value={{
      hospitals, doctors, patients, reps, medicines, sales, appointments, expenses, giftMeetups,
      addRep, addHospital, addDoctor, assignHospital, addSale, addPatient, togglePatientStatus,
      getRepSales, getHospitalDoctors, getHospitalPatients, getDoctorSales,
      addAppointment, updateAppointment, updateHospital, deleteHospital,
      addExpense, updateExpenseStatus, addGiftMeetup, updateGiftMeetupStatus, approveSamples, isLoading
    }}>
      {children}
    </DataContext.Provider>
  );
}


export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
