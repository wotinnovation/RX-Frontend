"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Search, 
  Send, 
  MessageSquare, 
  Users, 
  User, 
  ShieldCheck, 
  Check, 
  CheckCheck, 
  Paperclip, 
  Smile, 
  MoreVertical, 
  Phone, 
  Video, 
  Info, 
  Sparkles, 
  MapPin, 
  X,
  CornerDownLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/context/auth-context";
import { useData, SalesRep } from "@/lib/context/data-context";

// Structure of individual chat messages
interface ChatMessage {
  id: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string; // "10:15 AM" or similar
  isMe: boolean;
  status: "sent" | "read";
}

// Preset conversations to give the app immediate visual context and life
const INITIAL_CONVERSATIONS: Record<string, ChatMessage[]> = {
  "1": [ // Faisal Al Marzouqi (Sales Person)
    { id: "f1", senderName: "Faisal Al Marzouqi", senderRole: "Sales Person", text: "Hi, I just arrived at City Heart Hospital for the clinical sync. Meeting Dr. Ahmed Hammadi in 10 mins.", timestamp: "10:15 AM", isMe: false, status: "read" },
    { id: "f2", senderName: "You", senderRole: "Manager", text: "Excellent! Did you get their feedback on the Amoxicillin 500mg stock request?", timestamp: "10:17 AM", isMe: true, status: "read" },
    { id: "f3", senderName: "Faisal Al Marzouqi", senderRole: "Sales Person", text: "Yes! They requested an extra 50 units for next week. I'm logging it in the app right now.", timestamp: "10:20 AM", isMe: false, status: "read" },
    { id: "f4", senderName: "Faisal Al Marzouqi", senderRole: "Sales Person", text: "I've completed my last meeting at Bur Dubai, heading to Deira now to check on the pharmacy audit.", timestamp: "11:30 AM", isMe: false, status: "read" },
  ],
  "2": [ // Abdulla bin Rashid (Sales Person)
    { id: "a1", senderName: "Abdulla bin Rashid", senderRole: "Sales Person", text: "Dr. Ravi is asking if the compound formula stable at 4°C can be shipped by Wednesday.", timestamp: "09:45 AM", isMe: false, status: "read" },
    { id: "a2", senderName: "You", senderRole: "Manager", text: "Yes, our lab confirmed the stability yesterday. Let's arrange the logistics immediately.", timestamp: "09:50 AM", isMe: true, status: "read" },
    { id: "a3", senderName: "Abdulla bin Rashid", senderRole: "Sales Person", text: "Awesome, thanks. Do we have any updates on the custom compound request from Dr. Ravi?", timestamp: "12:05 PM", isMe: false, status: "read" },
  ],
  "3": [ // Muna Al Falasi (Sales Person)
    { id: "m_f1", senderName: "Muna Al Falasi", senderRole: "Sales Person", text: "Just submitted my fuel and parking allowance expense requests. Total is 335 AED.", timestamp: "Yesterday", isMe: false, status: "read" },
    { id: "m_f2", senderName: "You", senderRole: "Manager", text: "Thanks, Muna. I will review and sign off on them by this afternoon.", timestamp: "Yesterday", isMe: true, status: "read" },
    { id: "m_f3", senderName: "Muna Al Falasi", senderRole: "Sales Person", text: "Thank you! I appreciate the quick approval turnaround.", timestamp: "Yesterday", isMe: false, status: "read" },
  ],
  "m1": [ // John Manager (Manager)
    { id: "j1", senderName: "John Manager", senderRole: "Manager", text: "Hey team, reminder that all monthly reports are due by tomorrow evening. Make sure logs are fully synced.", timestamp: "08:15 AM", isMe: false, status: "read" },
    { id: "j2", senderName: "You", senderRole: "Sales Person", text: "On it, John. My meetings are all updated. Just doing the inventory counts now.", timestamp: "08:20 AM", isMe: true, status: "read" },
    { id: "j3", senderName: "John Manager", senderRole: "Manager", text: "Great job keeping the logs updated! Makes our sync meetings 10x faster.", timestamp: "08:25 AM", isMe: false, status: "read" },
  ],
  "m2": [ // Sarah Al Hashmi (Manager)
    { id: "s1", senderName: "Sarah Al Hashmi", senderRole: "Manager", text: "I've reviewed the expense files for the Sharjah seminar. Let's schedule a 5-min chat about the budget variance.", timestamp: "09:00 AM", isMe: false, status: "read" },
    { id: "s2", senderName: "You", senderRole: "Sales Person", text: "Sure, Sarah. I have a free slot at 2 PM today or tomorrow morning. Let me know what works.", timestamp: "09:15 AM", isMe: true, status: "read" },
  ]
};

// Quick Reply templates to instantly populate the text area
const QUICK_TEMPLATES = [
  { label: "⚡ Stock Sync", text: "Just finished a visit. The clinic requests a stock sync for clinical sample medicines." },
  { label: "📋 Visit Done", text: "Visit completed successfully. Doctor was very satisfied with the compound formulation." },
  { label: "💰 Expense File", text: "I have uploaded the receipts and completed the expense claim. Please review when free." },
  { label: "💊 Compound req", text: "Dr. requires a custom compound formulation of 250mg Amoxicillin + 10mg Zinc." }
];

// Emoji collection for quick insert
const QUICK_EMOJIS = ["👍", "🙌", "✅", "💡", "🩺", "💊", "📦", "🚀"];

export default function TeamChatPage() {
  const { user } = useAuth();
  const { reps, isLoading: dataLoading } = useData();

  // Current selected contact to chat with
  const [activeContact, setActiveContact] = useState<SalesRep | null>(null);
  
  // Real-time chat messages database
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>(INITIAL_CONVERSATIONS);
  
  // Input message state
  const [messageInput, setMessageInput] = useState("");
  
  // Search query to filter contacts
  const [searchQuery, setSearchQuery] = useState("");
  
  // Category tabs: 'all' | 'managers' | 'staff'
  const [activeTab, setActiveTab] = useState<"all" | "managers" | "staff">("all");
  
  // Typing indicator trigger
  const [isTyping, setIsTyping] = useState(false);
  const [typingContactName, setTypingContactName] = useState("");

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom of active chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeContact, chatHistory, isTyping]);

  // Format current time in 12-hour AM/PM format
  const getFormattedTime = () => {
    const date = new Date();
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // 0 should be 12
    const strMinutes = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${strMinutes} ${ampm}`;
  };

  // Filter contacts based on search query, current user name, and role tab
  const filteredContacts = useMemo(() => {
    if (dataLoading || !reps) return [];
    
    return reps.filter((rep) => {
      // 1. Exclude current logged in user from contacts list
      if (user && rep.name.toLowerCase() === user.name.toLowerCase()) {
        return false;
      }
      
      // 2. Search query matching
      const matchesSearch = rep.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            rep.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            rep.role.toLowerCase().includes(searchQuery.toLowerCase());
      
      if (!matchesSearch) return false;
      
      // 3. Category tab matching
      if (activeTab === "managers") {
        return rep.role === "Manager";
      }
      if (activeTab === "staff") {
        return rep.role === "Sales Person";
      }
      
      return true;
    });
  }, [reps, searchQuery, activeTab, user, dataLoading]);

  // Compute last message and unread badge for sidebar lists
  const getContactLastMessage = (contactId: string) => {
    const msgs = chatHistory[contactId];
    if (!msgs || msgs.length === 0) return "No messages yet";
    const last = msgs[msgs.length - 1];
    return last.isMe ? `You: ${last.text}` : last.text;
  };

  const getContactLastMessageTime = (contactId: string) => {
    const msgs = chatHistory[contactId];
    if (!msgs || msgs.length === 0) return "";
    return msgs[msgs.length - 1].timestamp;
  };

  // Preset status colors for contacts
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "online":
      case "on route":
        return "bg-emerald-500";
      case "away":
      case "behind":
        return "bg-amber-500";
      case "offline":
      case "no check-in":
        return "bg-gray-400";
      default:
        return "bg-emerald-500"; // default active
    }
  };

  // Send a message
  const handleSendMessage = (textToSend?: string) => {
    const finalMsg = (textToSend || messageInput).trim();
    if (!finalMsg || !activeContact) return;

    const contactId = activeContact.id;
    const timeStr = getFormattedTime();

    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      senderName: "You",
      senderRole: user?.role || "Team Member",
      text: finalMsg,
      timestamp: timeStr,
      isMe: true,
      status: "sent"
    };

    // Update state with sent message
    setChatHistory(prev => {
      const existing = prev[contactId] || [];
      return {
        ...prev,
        [contactId]: [...existing, newMsg]
      };
    });

    if (!textToSend) {
      setMessageInput("");
    }

    // Trigger simulated bot reply
    triggerSimulatedReply(contactId, finalMsg);
  };

  // Simulated bot responses mapping for realistic team member interactions
  const triggerSimulatedReply = (contactId: string, userText: string) => {
    const lowerText = userText.toLowerCase();
    const contact = reps.find(r => r.id === contactId);
    if (!contact) return;

    setTypingContactName(contact.name);
    
    // Typing delay step 1: Show typing in 600ms
    setTimeout(() => {
      setIsTyping(true);

      // Typing delay step 2: Reply in another 1500ms
      setTimeout(() => {
        setIsTyping(false);
        
        let responseText = "";

        if (contact.role === "Manager") {
          // Manager responses
          if (lowerText.includes("hello") || lowerText.includes("hi")) {
            responseText = `Hello! Hope your audits are going well today. Do you have any new updates on the hospital assignments?`;
          } else if (lowerText.includes("expense") || lowerText.includes("receipt") || lowerText.includes("money") || lowerText.includes("allowance")) {
            responseText = `I see your expense file. I'll inspect the receipts and approve it shortly. Excellent work keeping the fuel logs precise.`;
          } else if (lowerText.includes("audit") || lowerText.includes("hospital") || lowerText.includes("clinic") || lowerText.includes("visit")) {
            responseText = `Understood. Make sure to log the visit outcome in the Completion Form in real-time. It synchronizes automatically with our master ledger.`;
          } else if (lowerText.includes("compound") || lowerText.includes("compounding") || lowerText.includes("formula")) {
            responseText = `For custom compounds, verify the stability indicators with the central pharmacy. Safety is our priority! Let me know if you need stock clearances.`;
          } else if (lowerText.includes("sample") || lowerText.includes("free") || lowerText.includes("medicine")) {
            responseText = `I'll authorize the clinical samples approval for your meets. Keep track of the exact doctor and clinical logs.`;
          } else {
            responseText = `Got it! Keep me posted on your metrics today. Don't hesitate to reach out if you face blockages on the field.`;
          }
        } else {
          // Staff / Sales Person responses
          if (lowerText.includes("hello") || lowerText.includes("hi")) {
            responseText = `Hi! I'm on route to my next customer assignment. What can I do for you?`;
          } else if (lowerText.includes("expense") || lowerText.includes("receipt") || lowerText.includes("money") || lowerText.includes("allowance")) {
            responseText = `Thanks! I've uploaded all invoices in the Expense tab. Let me know if the finance team needs additional details.`;
          } else if (lowerText.includes("audit") || lowerText.includes("hospital") || lowerText.includes("clinic") || lowerText.includes("visit")) {
            responseText = `Yes, I just wrapped up the meeting at City Heart. The clinic head was very pleased, and we finalized the repeat prescription order!`;
          } else if (lowerText.includes("compound") || lowerText.includes("compounding") || lowerText.includes("formula")) {
            responseText = `Dr. Ravi's compounding formula requires 250mg Amoxicillin + 10mg Zinc. I've logged the mix specifications in the ledger.`;
          } else if (lowerText.includes("sample") || lowerText.includes("free") || lowerText.includes("medicine")) {
            responseText = `Yes, Dr. Ahmed requested 5 boxes of the Amoxicillin sample packs. Can we get these approved and dispatched by tomorrow?`;
          } else {
            responseText = `Understood, thanks for the guidance! I'm working on updating my plans and will sync all visits before 6 PM.`;
          }
        }

        const replyMsg: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          senderName: contact.name,
          senderRole: contact.role,
          text: responseText,
          timestamp: getFormattedTime(),
          isMe: false,
          status: "read"
        };

        setChatHistory(prev => {
          const existing = prev[contactId] || [];
          return {
            ...prev,
            [contactId]: [...existing, replyMsg]
          };
        });

      }, 1500);

    }, 600);
  };

  // Keyboard accessibility: Enter to send, Shift+Enter for newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle Quick Reply Templates
  const handleSelectTemplate = (text: string) => {
    handleSendMessage(text);
  };

  // Append emoji to text input
  const handleAddEmoji = (emoji: string) => {
    setMessageInput(prev => prev + emoji);
  };

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-3">
            <MessageSquare className="text-primary h-8 w-8" /> Team Communications
          </h2>
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">
            Real-time chat portal connecting sales representatives, clinical field force, and management
          </p>
        </div>
        <div className="px-4 py-2 bg-emerald-500/10 rounded-[10px] border border-emerald-500/20 shadow-sm flex items-center gap-2 shrink-0 self-start md:self-center">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider">
            Workspace Hub Live
          </span>
        </div>
      </div>

      {/* Main Grid: Contacts + Active Chat */}
      <div className="flex h-[calc(100vh-14.5rem)] bg-card border border-border rounded-[10px] card-shadow overflow-hidden relative">
        
        {/* LEFT SIDEBAR: CONTACTS LIST */}
        <div className="w-full md:w-[350px] border-r border-border flex flex-col bg-secondary/5 shrink-0">
          
          {/* Search Box */}
          <div className="p-4 border-b border-border/60 space-y-3 bg-card/60 backdrop-blur-md sticky top-0 z-10">
            <div className="relative">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <input
                id="chat-search-input"
                type="text"
                placeholder="Search staff & managers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-secondary/50 border border-border rounded-[10px] text-xs font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-3.5 text-muted-foreground hover:text-foreground"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div className="flex bg-secondary p-1 rounded-[10px] border border-border/50">
              <button
                id="chat-tab-all"
                onClick={() => setActiveTab("all")}
                className={cn(
                  "flex-1 py-1.5 rounded-[8px] text-[9px] font-black uppercase tracking-widest transition-all",
                  activeTab === "all" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/40"
                )}
              >
                All
              </button>
              <button
                id="chat-tab-managers"
                onClick={() => setActiveTab("managers")}
                className={cn(
                  "flex-1 py-1.5 rounded-[8px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1",
                  activeTab === "managers" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/40"
                )}
              >
                <ShieldCheck size={10} /> Managers
              </button>
              <button
                id="chat-tab-staff"
                onClick={() => setActiveTab("staff")}
                className={cn(
                  "flex-1 py-1.5 rounded-[8px] text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1",
                  activeTab === "staff" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-secondary/40"
                )}
              >
                <Users size={10} /> Staff
              </button>
            </div>
          </div>

          {/* Contact scroll view */}
          <div className="flex-1 overflow-y-auto divide-y divide-border/40 py-2">
            <AnimatePresence initial={false}>
              {filteredContacts.length > 0 ? (
                filteredContacts.map((contact) => {
                  const isSelected = activeContact?.id === contact.id;
                  const lastMsg = getContactLastMessage(contact.id);
                  const lastMsgTime = getContactLastMessageTime(contact.id);
                  const initials = contact.initials || contact.name.split(" ").map(n => n[0]).join("").toUpperCase();
                  
                  return (
                    <motion.div
                      key={contact.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setActiveContact(contact)}
                      className={cn(
                        "p-4 flex items-start gap-3 cursor-pointer transition-all hover:bg-primary/[0.03] relative border-l-[3px]",
                        isSelected 
                          ? "bg-primary/[0.04] border-primary" 
                          : "border-transparent bg-transparent"
                      )}
                    >
                      {/* Avatar with Status Dot */}
                      <div className="relative shrink-0 mt-0.5">
                        <div className={cn(
                          "w-11 h-11 rounded-[10px] flex items-center justify-center font-black text-sm text-white shadow-inner",
                          contact.role === "Manager" ? "bg-primary" : "bg-emerald-600"
                        )}>
                          {initials}
                        </div>
                        <span className={cn(
                          "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-card rounded-full shadow-sm",
                          getStatusColor(contact.status)
                        )} />
                      </div>

                      {/* Contact metadata */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-xs truncate text-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                            {contact.name}
                            {contact.role === "Manager" && (
                              <ShieldCheck size={12} className="text-primary shrink-0" />
                            )}
                          </span>
                          <span className="text-[9px] text-muted-foreground/80 font-semibold shrink-0">
                            {lastMsgTime}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[8px] font-black uppercase bg-secondary px-1.5 py-0.5 rounded text-muted-foreground tracking-tighter">
                            {contact.role}
                          </span>
                          <span className="text-[8px] font-semibold text-muted-foreground/70 truncate flex items-center gap-0.5">
                            <MapPin size={8} className="text-muted-foreground/50 shrink-0" />
                            {contact.zone}
                          </span>
                        </div>

                        <p className="text-[10px] text-muted-foreground font-medium truncate mt-2 leading-relaxed">
                          {lastMsg}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center opacity-40">
                  <User size={32} className="mb-2 text-muted-foreground" />
                  <p className="text-xs font-black uppercase tracking-widest">No contacts found</p>
                  <p className="text-[10px] mt-1">Try another keyword or filter tab</p>
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Logged in user info */}
          <div className="p-4 border-t border-border bg-card/40 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent flex items-center justify-center font-bold text-accent-foreground shrink-0 shadow-inner">
              {user?.name?.charAt(0) || "S"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold truncate leading-tight">{user?.name || "Sales Executive"}</p>
              <p className="text-[9px] text-muted-foreground font-black uppercase tracking-wider">{user?.role || "Staff Member"}</p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: CONVERSATION PANEL */}
        <div className="flex-1 flex flex-col bg-card relative">
          <AnimatePresence mode="wait">
            {activeContact ? (
              <motion.div
                key={`chat-${activeContact.id}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 flex flex-col h-full overflow-hidden"
              >
                {/* Active Chat Header */}
                <div className="px-6 py-4 border-b border-border flex items-center justify-between bg-card/60 backdrop-blur-md sticky top-0 z-10">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className={cn(
                        "w-11 h-11 rounded-[10px] flex items-center justify-center font-black text-sm text-white shadow-inner",
                        activeContact.role === "Manager" ? "bg-primary" : "bg-emerald-600"
                      )}>
                        {activeContact.initials || activeContact.name.split(" ").map(n => n[0]).join("").toUpperCase()}
                      </div>
                      <span className={cn(
                        "absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-card rounded-full shadow-sm",
                        getStatusColor(activeContact.status)
                      )} />
                    </div>

                    <div>
                      <h4 className="font-black text-sm tracking-tight flex items-center gap-1.5 text-foreground leading-snug">
                        {activeContact.name}
                        {activeContact.role === "Manager" ? (
                          <ShieldCheck size={14} className="text-primary shrink-0" />
                        ) : (
                          <Users size={14} className="text-emerald-600 shrink-0" />
                        )}
                      </h4>
                      <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide flex items-center gap-2 mt-0.5">
                        <span>{activeContact.role}</span>
                        <span>·</span>
                        <span className="flex items-center gap-0.5">
                          <MapPin size={10} className="text-muted-foreground/60" />
                          {activeContact.zone}
                        </span>
                        <span>·</span>
                        <span className="text-emerald-500 font-black">
                          {activeContact.status === "no check-in" ? "Offline" : "Active Now"}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Header Actions */}
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => alert("Direct calling feature is scheduled for next milestone deployment.")}
                      className="p-2 text-muted-foreground hover:bg-secondary rounded-[10px] transition-all hover:text-primary"
                      title="Voice Call"
                    >
                      <Phone size={16} />
                    </button>
                    <button 
                      onClick={() => alert("Video calling feature is scheduled for next milestone deployment.")}
                      className="p-2 text-muted-foreground hover:bg-secondary rounded-[10px] transition-all hover:text-primary"
                      title="Video Call"
                    >
                      <Video size={16} />
                    </button>
                    <button 
                      onClick={() => alert(`Details:\nName: ${activeContact.name}\nRole: ${activeContact.role}\nZone: ${activeContact.zone}\nSales Target: AED ${activeContact.targetAmount || 0}`)}
                      className="p-2 text-muted-foreground hover:bg-secondary rounded-[10px] transition-all hover:text-primary"
                      title="Contact Information"
                    >
                      <Info size={16} />
                    </button>
                  </div>
                </div>

                {/* Message Log Body */}
                <div className="flex-1 overflow-y-auto p-6 bg-secondary/5 space-y-6 flex flex-col">
                  <div className="mx-auto my-2">
                    <span className="px-3 py-1 bg-secondary border border-border text-[9px] font-black text-muted-foreground uppercase tracking-widest rounded-full shadow-sm">
                      Secure Communications Channel
                    </span>
                  </div>

                  {/* Preloaded message loops */}
                  {(chatHistory[activeContact.id] || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={cn(
                        "flex flex-col max-w-[70%] group transition-all duration-300",
                        msg.isMe ? "self-end items-end" : "self-start items-start"
                      )}
                    >
                      {/* Message Bubble Container */}
                      <div
                        className={cn(
                          "px-4 py-3 rounded-[15px] text-xs font-semibold leading-relaxed shadow-sm transition-all duration-200",
                          msg.isMe
                            ? "bg-primary text-white rounded-tr-none"
                            : "bg-card text-foreground border border-border rounded-tl-none hover:border-muted-foreground/30"
                        )}
                      >
                        <p className="whitespace-pre-line">{msg.text}</p>
                      </div>

                      {/* Message details */}
                      <div className="flex items-center gap-1.5 mt-1.5 px-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <span className="text-[9px] font-bold text-muted-foreground">
                          {msg.isMe ? "You" : msg.senderName}
                        </span>
                        <span className="text-[8px] text-muted-foreground font-black uppercase">
                          {msg.timestamp}
                        </span>
                        {msg.isMe && (
                          msg.status === "read" ? (
                            <CheckCheck size={12} className="text-emerald-500 shrink-0" />
                          ) : (
                            <Check size={12} className="text-white/60 shrink-0" />
                          )
                        )}
                      </div>
                    </div>
                  ))}

                  {/* Bot typing indicator */}
                  {isTyping && (
                    <div className="flex flex-col self-start max-w-[70%] items-start">
                      <div className="px-4 py-3 bg-card border border-border rounded-[15px] rounded-tl-none flex items-center space-x-1.5 shadow-sm">
                        <motion.span
                          className="w-1.5 h-1.5 bg-primary rounded-full inline-block"
                          animate={{ y: [0, -3, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                        />
                        <motion.span
                          className="w-1.5 h-1.5 bg-primary rounded-full inline-block"
                          animate={{ y: [0, -3, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                        />
                        <motion.span
                          className="w-1.5 h-1.5 bg-primary rounded-full inline-block"
                          animate={{ y: [0, -3, 0] }}
                          transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                        />
                      </div>
                      <span className="text-[8px] font-bold text-muted-foreground mt-1.5 px-1.5">
                        {typingContactName} is updating logs...
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Toolbar for Quick Replies and Input */}
                <div className="p-4 border-t border-border bg-card space-y-3 sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.02)]">
                  
                  {/* Template selector pills */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                    <div className="flex items-center gap-1 text-[9px] font-black uppercase text-muted-foreground/60 shrink-0">
                      <Sparkles size={10} className="text-primary" /> Template:
                    </div>
                    {QUICK_TEMPLATES.map((tmpl, idx) => (
                      <button
                        key={idx}
                        id={`btn-template-${idx}`}
                        onClick={() => handleSelectTemplate(tmpl.text)}
                        className="px-2.5 py-1 text-[9px] font-black uppercase tracking-wider bg-secondary/50 hover:bg-primary/10 hover:text-primary rounded-full border border-border hover:border-primary/20 shrink-0 transition-all active:scale-95"
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>

                  {/* Message Input Box */}
                  <div className="flex items-end gap-3 bg-secondary/35 border border-border/80 rounded-[12px] p-2.5 focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                    
                    <button
                      onClick={() => alert("File attachment feature is scheduled for next release cycle.")}
                      className="p-2 hover:bg-secondary rounded-[10px] transition-colors text-muted-foreground hover:text-foreground shrink-0"
                      title="Attach File"
                    >
                      <Paperclip size={16} />
                    </button>

                    <textarea
                      id="chat-message-input"
                      rows={1}
                      placeholder={`Send message to ${activeContact.name}...`}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      className="flex-1 bg-transparent border-0 outline-none text-xs font-semibold placeholder:text-muted-foreground resize-none py-1.5 focus:ring-0 focus:outline-none min-h-[28px] max-h-[120px]"
                    />

                    {/* Emoji selection pill list */}
                    <div className="flex items-center gap-1 shrink-0 bg-card border border-border/60 rounded-full px-1.5 py-0.5">
                      {QUICK_EMOJIS.map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => handleAddEmoji(emoji)}
                          className="hover:scale-125 transition-transform text-xs px-0.5"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    <button
                      id="chat-send-btn"
                      onClick={() => handleSendMessage()}
                      disabled={!messageInput.trim()}
                      className={cn(
                        "p-2.5 rounded-[10px] shadow-sm flex items-center justify-center transition-all shrink-0",
                        messageInput.trim() 
                          ? "bg-primary text-primary-foreground hover:bg-primary/95 active:scale-95" 
                          : "bg-secondary text-muted-foreground cursor-not-allowed"
                      )}
                      title="Send Message"
                    >
                      <Send size={15} />
                    </button>
                  </div>
                  
                  <div className="flex justify-between items-center text-[9px] text-muted-foreground/60 px-1 font-semibold">
                    <span>Press Enter to send. Shift + Enter for new line.</span>
                    <span className="flex items-center gap-0.5">
                      <CornerDownLeft size={8} /> Active Encrypted Session
                    </span>
                  </div>

                </div>

              </motion.div>
            ) : (
              <motion.div
                key="empty-chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-secondary/[0.02]"
              >
                <div className="w-16 h-16 rounded-[12px] bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-inner relative">
                  <MessageSquare size={32} />
                  <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-card animate-pulse" />
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight">RxSales Communications Hub</h3>
                <p className="text-xs text-muted-foreground font-semibold max-w-md mt-2 leading-relaxed">
                  Select a Manager, clinical coworker, or Sales Representative from the roster sidebar to initiate secure conversations, sync inventory stock, and audit meetings.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-lg w-full mt-8">
                  <div 
                    onClick={() => setActiveTab("managers")}
                    className="p-4 bg-card border border-border hover:border-primary rounded-[10px] card-shadow cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-3 text-left group"
                  >
                    <div className="p-2.5 bg-primary/10 text-primary rounded-[8px] group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      <ShieldCheck size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide group-hover:text-primary transition-colors">Chat with Managers</p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Submit questions about territory approvals or fuel expenses.</p>
                    </div>
                  </div>

                  <div 
                    onClick={() => setActiveTab("staff")}
                    className="p-4 bg-card border border-border hover:border-emerald-600 rounded-[10px] card-shadow cursor-pointer transition-all hover:scale-[1.02] flex items-center gap-3 text-left group"
                  >
                    <div className="p-2.5 bg-emerald-500/10 text-emerald-600 rounded-[8px] group-hover:bg-emerald-600 group-hover:text-white transition-all">
                      <Users size={18} />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-wide group-hover:text-emerald-600 transition-colors">Chat with Field Roster</p>
                      <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">Sync clinical sample reserves or check assignment zones.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
