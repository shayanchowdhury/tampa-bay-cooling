export type BusinessConfig = {
    id: string;
    name: string;
    city: string;
    industry: string;
    phone: string;
    hours: string;
    services: string[];
    greeting: string;
    notes: string;
    notifyEmail: string;
    demo: boolean;
  };
  
  export const DEFAULT_BUSINESS_ID = "tampa-bay-cooling";
  
  export const BUSINESSES: Record<string, BusinessConfig> = {
    "tampa-bay-cooling": {
      id: "tampa-bay-cooling",
      name: "Tampa Bay Cooling",
      city: "Tampa, Florida",
      industry: "HVAC",
      phone: "(813) 555-0148",
      hours: "Hours are not specified.",
      services: ["AC Repair", "Installation", "Maintenance"],
      greeting:
        "Hi! I'm an AI assistant for Tampa Bay Cooling. Ask me about AC repair, installation, or maintenance, or tell me what you need and a technician will follow up.",
      notes: "This is a fictional demo company.",
      notifyEmail: "",
      demo: true,
    },
    "bay-plumbing": {
      id: "bay-plumbing",
      name: "Bay Plumbing Co.",
      city: "St. Petersburg, Florida",
      industry: "plumbing",
      phone: "(727) 555-0142",
      hours: "Open Monday to Friday, 8 AM to 5 PM.",
      services: ["Leak Repair", "Water Heaters", "Drain Cleaning", "Repiping"],
      greeting:
        "Hi! I'm an AI assistant for Bay Plumbing Co. I can answer questions about leaks, water heaters, and drains, or take your details so someone can follow up.",
      notes: "This is a fictional demo company.",
      notifyEmail: "",
      demo: true,
    },
  };
  
  export function getBusiness(id: unknown): BusinessConfig | null {
    const key = typeof id === "string" && id ? id : DEFAULT_BUSINESS_ID;
    return BUSINESSES[key] ?? null;
  }