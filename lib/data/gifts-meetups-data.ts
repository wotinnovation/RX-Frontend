export interface GiftMeetup {
  id: string;
  staffName: string;
  type: "gift" | "meetup";
  item: string; // e.g. "Medical Textbook", "Lunch Catering", "Promotional Pens"
  hospitalName: string;
  doctorName: string;
  quantity: number;
  cost?: number;
  date: string;
  status: "completed" | "pending_approval" | "approved" | "rejected";
  managerComment?: string;
}

export const GIFTS_MEETUPS_DATA: GiftMeetup[] = [
  {
    id: "gm-1",
    staffName: "Muna Al Falasi",
    type: "gift",
    item: "Anatomy Reference Guide",
    hospitalName: "Bur Dubai Hospital",
    doctorName: "Dr. Ahmed Mahmoud",
    quantity: 2,
    cost: 450,
    date: "2026-05-10",
    status: "approved"
  },
  {
    id: "gm-2",
    staffName: "Abdulla bin Rashid",
    type: "meetup",
    item: "Clinical Detailing Lunch",
    hospitalName: "City Heart Hospital",
    doctorName: "Dr. Ravi Nair",
    quantity: 5,
    cost: 350,
    date: "2026-05-12",
    status: "approved"
  },
  {
    id: "gm-3",
    staffName: "Faisal Al Marzouqi",
    type: "gift",
    item: "Branded Prescription Pads",
    hospitalName: "Jumeirah Family Clinic",
    doctorName: "Dr. John Smith",
    quantity: 50,
    cost: 100,
    date: "2026-05-14",
    status: "pending_approval"
  },
  {
    id: "gm-4",
    staffName: "Ayesha Al Suwaidi",
    type: "meetup",
    item: "Afternoon Coffee Sync",
    hospitalName: "Sharjah Medical Center",
    doctorName: "Dr. Reem Al Hashmi",
    quantity: 3,
    cost: 85,
    date: "2026-05-13",
    status: "approved"
  },
  {
    id: "gm-5",
    staffName: "Omar Al Mansoori",
    type: "gift",
    item: "Electronic Stethoscope (Demo)",
    hospitalName: "Dubai Hills Specialized",
    doctorName: "Dr. Fatima Menon",
    quantity: 1,
    cost: 1200,
    date: "2026-05-11",
    status: "approved"
  }
];
