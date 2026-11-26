import React, { useEffect, useState } from "react";
import { CheckCircle2, X } from "lucide-react";
import {
  CareResource,
  CertificateRecord,
  ChildTracker,
  CircleTemplate,
  FirstAidGuide,
  Gig,
  GigCategory,
  GigTemplate,
  LanguageName,
  Lesson,
  MedicineReminder,
  NotificationItem,
  PeerListenerMessage,
  PendingPiPayment,
  SavingsCircle,
  SkillCategory,
  TabKey,
  TextScale,
  WalletTransaction,
} from "./types";
const TODAY_ISO = new Date().toISOString().slice(0, 10);

const OFFICIAL_STARTER_LESSONS: Lesson[] = [
  {
    id: "official-ai-cv",
    title: "How To Use AI To Write A Better CV In 15 Minutes",
    category: "AI Survival",
    skillUnlock: "AI CV & Profile Builder",
    durationMin: 15,
    certificateFeePi: 0.3,
    summary: "Turn raw work history into clear, truthful bullet points using structured AI prompts without inventing experience.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      { heading: "Step 1: Gather Real Facts", body: "List every real task, volunteer role, and skill you have completed with dates and tools used." },
      { heading: "Step 2: Role-Match Prompt", body: "Paste the target gig description and ask the AI to highlight matching experience without adding false claims." },
      { heading: "Step 3: Quantify Outcomes", body: "Replace vague phrases with concrete results like turnaround time, accuracy, or items organized." },
      { heading: "Step 4: Plain-Language Edit", body: "Trim buzzwords so any buyer or coordinator can read your summary in 20 seconds." },
      { heading: "Step 5: Final Truth Audit", body: "Verify every line against work you can demonstrate today before submitting." },
    ],
    quiz: [
      {
        id: "q-ai-cv-1",
        question: "What is the most important rule when using AI to improve your CV?",
        options: [
          "Keep every skill and date 100% truthful and verifiable",
          "Let AI invent senior titles you have not held",
          "Copy another person's work history",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "official-ai-scams",
    title: "How To Spot AI Deepfakes, Phishing & Pi Wallet Scams",
    category: "AI Survival",
    skillUnlock: "Pi Security & Scam Defense",
    durationMin: 12,
    certificateFeePi: 0.3,
    summary: "Protect your Pi passphrase and deliverables against cloned voices, fake support DMs, and off-app escrow tricks.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      { heading: "Step 1: Guard Your 24-Word Passphrase", body: "Never enter your Pi wallet passphrase outside the official Pi Wallet inside Pi Browser." },
      { heading: "Step 2: Verify Escrow Inside EYENEKA", body: "Never start work on screenshots alone; wait until gig status shows Funds Locked." },
      { heading: "Step 3: Spot Urgency Traps", body: "Scammers pressure victims with countdowns, fake admin badges, or promised bonus Pi." },
      { heading: "Step 4: Check Deepfake Clues", body: "Verify unexpected voice or video requests using a second channel inside the app." },
      { heading: "Step 5: Report & Block Immediately", body: "Use the Law tab to block suspicious handles and log safety reports." },
    ],
    quiz: [
      {
        id: "q-ai-scam-1",
        question: "When should you ever share your Pi wallet passphrase with support or a buyer?",
        options: [
          "Never — no legitimate service or buyer ever needs your passphrase",
          "Only when confirming an escrow gig",
          "When asked politely in chat",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "official-ai-prompts",
    title: "Structured AI Prompting For Everyday Digital Tasks",
    category: "AI Survival",
    skillUnlock: "Structured Prompting",
    durationMin: 14,
    certificateFeePi: 0.3,
    summary: "Write clear Context + Task + Format + Constraints prompts to complete client summaries, checklists, and translations fast.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      { heading: "Step 1: Define Context", body: "State who the output is for and what problem it solves." },
      { heading: "Step 2: Give Explicit Format", body: "Request numbered steps, a table, or a 3-bullet summary." },
      { heading: "Step 3: Add Guardrails", body: "Specify tone, word limit, and facts the model must not invent." },
      { heading: "Step 4: Iterate Once", body: "Ask for a tighter second draft targeting clarity and accuracy." },
      { heading: "Step 5: Human Review", body: "Read every word aloud and verify numbers before delivering." },
    ],
    quiz: [
      {
        id: "q-ai-prompt-1",
        question: "Which elements make a reliable structured AI prompt?",
        options: [
          "Context, task, output format, and clear constraints",
          "One vague word with no instructions",
          "Skipping human review before delivery",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "official-work-proofreading",
    title: "Clean Proofreading & Document Formatting For Buyers",
    category: "Digital Work",
    skillUnlock: "Proofreading & Formatting",
    durationMin: 15,
    certificateFeePi: 0.3,
    summary: "Fix grammar, headings, spacing, and readability so micro-gig deliverables earn 5-star buyer ratings.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      { heading: "Step 1: Read For Structure", body: "Check headings, section order, and missing information first." },
      { heading: "Step 2: Fix Spelling & Punctuation", body: "Standardize capitalization, dates, and list punctuation." },
      { heading: "Step 3: Shorten Long Sentences", body: "Split dense paragraphs into scannable 2–3 line blocks." },
      { heading: "Step 4: Match Buyer Checklist", body: "Verify every deliverable item listed in the gig brief." },
      { heading: "Step 5: Submit Clean Proof", body: "Attach a concise summary of edits completed when submitting proof." },
    ],
    quiz: [
      {
        id: "q-work-proof-1",
        question: "What should you check before submitting a proofreading gig deliverable?",
        options: [
          "Every item on the buyer's deliverable checklist",
          "Only the first paragraph",
          "Request release before submitting proof",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "official-work-data-cleanup",
    title: "Spreadsheet & Data Entry Accuracy Essentials",
    category: "Digital Work",
    skillUnlock: "Spreadsheet & Data Cleanup",
    durationMin: 16,
    certificateFeePi: 0.3,
    summary: "Organize messy lists, remove duplicates, standardize dates, and deliver error-free tables.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      { heading: "Step 1: Backup Original Sheet", body: "Always duplicate raw data before cleaning rows or columns." },
      { heading: "Step 2: Standardize Columns", body: "Use consistent column headers, ISO dates, and trimmed whitespace." },
      { heading: "Step 3: Remove Exact Duplicates", body: "Flag and verify duplicate entries carefully before deleting." },
      { heading: "Step 4: Spot-Check Totals", body: "Check row counts and numeric sums after every transformation." },
      { heading: "Step 5: Export Clean Output", body: "Deliver clean CSV/JSON with a brief summary of rows cleaned." },
    ],
    quiz: [
      {
        id: "q-work-data-1",
        question: "What is the first step before editing a buyer's raw dataset?",
        options: [
          "Keep an untouched copy of the original raw data",
          "Delete random rows immediately",
          "Mix date formats across columns",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "official-work-support",
    title: "Calm Community Moderation & Support Replies",
    category: "Digital Work",
    skillUnlock: "Community Support & Moderation",
    durationMin: 12,
    certificateFeePi: 0.3,
    summary: "Answer Pioneer questions clearly, de-escalate disputes politely, and enforce community safety rules.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      { heading: "Step 1: Acknowledge Clearly", body: "Read the user's question fully and confirm what they need." },
      { heading: "Step 2: Answer In Steps", body: "Give concise 1-2-3 instructions instead of long paragraphs." },
      { heading: "Step 3: Enforce Safety Rules", body: "Remove scam links and never allow off-app payment solicitation." },
      { heading: "Step 4: Stay Neutral In Disputes", body: "Focus strictly on observable deliverable checklists and proof." },
      { heading: "Step 5: Confirm Resolution", body: "Verify the Pioneer understands the next step before closing." },
    ],
    quiz: [
      {
        id: "q-work-sup-1",
        question: "How should a moderator handle a gig dispute?",
        options: [
          "Review objective deliverable checklists and submitted proof neutrally",
          "Side automatically without reading evidence",
          "Move the conversation off-app",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "official-money-escrow",
    title: "How Smart Contract Pi Escrow Protects Buyers & Workers",
    category: "Money Skills",
    skillUnlock: "Pi Escrow Literacy",
    durationMin: 10,
    certificateFeePi: 0.3,
    summary: "Understand Funds Locked, Proof Submitted, Disputed holds, and transparent 8% fee calculations.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      { heading: "Step 1: Lock Before Work", body: "Buyers lock gig Pi plus the disclosed 8% fee before work begins." },
      { heading: "Step 2: Deliver With Checklist", body: "Workers submit proof tied directly to the agreed checklist." },
      { heading: "Step 3: Buyer Approval Release", body: "Approved proof triggers release and updates Trust Score." },
      { heading: "Step 4: Dispute Freeze Protection", body: "Disputed gigs hold funds safely until reviewed." },
      { heading: "Step 5: Verify On Blockexplorer", body: "Every completed Pi Testnet/Mainnet payment records a verifiable txid." },
    ],
    quiz: [
      {
        id: "q-money-esc-1",
        question: "When should a worker begin completing a paid EYENEKA micro-gig?",
        options: [
          "After escrow status shows Funds Locked",
          "Before any escrow is locked",
          "After sending Pi to unlock a job",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "official-money-circles",
    title: "Running A Fair Zero-Interest Savings Circle",
    category: "Money Skills",
    skillUnlock: "Savings Circle Stewardship",
    durationMin: 12,
    certificateFeePi: 0.3,
    summary: "Coordinate transparent weekly or monthly peer rotations with clear Trust Score rules and food emergency reserves.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      { heading: "Step 1: Set Clear Cycle Rules", body: "Agree on member limit, contribution in π, and payout rotation before Cycle 1." },
      { heading: "Step 2: Check Trust Scores", body: "Invite reliable Pioneers and track on-time cycle completion." },
      { heading: "Step 3: Transparent Ledger", body: "Every member sees who contributed and who receives the next rotation." },
      { heading: "Step 4: Emergency Food Pool", body: "Require member votes to approve any emergency food support payout." },
      { heading: "Step 5: Zero Interest Policy", body: "Peer circles never charge interest or promise investment returns." },
    ],
    quiz: [
      {
        id: "q-money-cir-1",
        question: "How are emergency food pool requests approved in an EYENEKA savings circle?",
        options: [
          "By transparent majority vote of circle members",
          "Secretly by one member without notice",
          "By charging high interest",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "official-food-budget",
    title: "Household Food Budgeting & Bulk Staples Planning",
    category: "Food & Life",
    skillUnlock: "Household Food Planning",
    durationMin: 12,
    certificateFeePi: 0.3,
    summary: "Stretch household resources by planning weekly staples, reducing spoilage, and sharing bulk co-op buys.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      { heading: "Step 1: Audit Existing Pantry", body: "List staples you already have before buying anything new." },
      { heading: "Step 2: Plan 7-Day Base Meals", body: "Anchor meals around affordable grains, legumes, and seasonal greens." },
      { heading: "Step 3: Store Dry Goods Safely", body: "Keep dry staples sealed in cool, moisture-free containers." },
      { heading: "Step 4: Use First-In First-Out", body: "Rotate older pantry items to the front so nothing spoils." },
      { heading: "Step 5: Coordinate Peer Bulk Buys", body: "Pool predictable staples with trusted neighbors to cut unit costs." },
    ],
    quiz: [
      {
        id: "q-food-bud-1",
        question: "Why should households audit existing pantry items before shopping?",
        options: [
          "To avoid duplicate purchases and prevent food spoilage",
          "To throw away usable dry grains",
          "To ignore weekly meal needs",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "official-food-nutrition",
    title: "Balanced Family Nutrition On A Tight Budget",
    category: "Food & Life",
    skillUnlock: "Practical Family Nutrition",
    durationMin: 13,
    certificateFeePi: 0.3,
    summary: "Combine everyday proteins, fiber, hydration, and safe food handling for growing children and elders.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      { heading: "Step 1: Pair Grains & Legumes", body: "Combining beans or lentils with rice or maize creates complete protein affordably." },
      { heading: "Step 2: Add Color Daily", body: "Include dark leafy greens or seasonal fruit for essential vitamins." },
      { heading: "Step 3: Safe Clean Water", body: "Use clean, treated, or boiled drinking water for children and elders." },
      { heading: "Step 4: Wash Hands & Surfaces", body: "Wash hands with soap before preparing or serving meals." },
      { heading: "Step 5: Limit Ultra-Processed Sugar", body: "Favor whole foods over sugary drinks for steady daily energy." },
    ],
    quiz: [
      {
        id: "q-food-nut-1",
        question: "What is an affordable way to provide complete protein in everyday meals?",
        options: [
          "Pairing legumes (beans/lentils) with whole grains",
          "Replacing meals with sugary sodas",
          "Skipping clean water hydration",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "official-health-triage",
    title: "Red vs Yellow Symptoms: When To Seek Urgent Medical Care",
    category: "Health Literacy",
    skillUnlock: "Health Triage Literacy",
    durationMin: 12,
    certificateFeePi: 0.3,
    summary: "Recognize urgent warning signs early so families never delay professional emergency care.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      { heading: "Step 1: Spot Red Breathing Signs", body: "Trouble breathing, blue lips, or chest pain requires immediate emergency care." },
      { heading: "Step 2: Spot Neurological Red Signs", body: "Sudden confusion, seizures, fainting, or inability to wake is urgent." },
      { heading: "Step 3: Severe Bleeding Or High Fever", body: "Uncontrolled bleeding or infant fever needs rapid clinic evaluation." },
      { heading: "Step 4: Monitor Yellow Symptoms", body: "Mild fever or fatigue requires hydration, rest, and close observation." },
      { heading: "Step 5: Keep Clinic Details Ready", body: "Save verified local clinics in the Care tab before an emergency." },
    ],
    quiz: [
      {
        id: "q-health-tri-1",
        question: "What should you do if someone shows Red warning signs like difficulty breathing or chest pain?",
        options: [
          "Seek professional emergency medical care immediately",
          "Wait several days without evaluation",
          "Rely only on online chat",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "official-health-hygiene",
    title: "Clean Water, Oral Rehydration & Safe Medicine Habits",
    category: "Health Literacy",
    skillUnlock: "Safe Care & Hydration",
    durationMin: 11,
    certificateFeePi: 0.3,
    summary: "Prepare safe hydration habits, track child vaccines, and follow prescription schedules accurately.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      { heading: "Step 1: Safe Water Handling", body: "Store treated drinking water in covered clean containers with clean scoops." },
      { heading: "Step 2: Use Verified ORS Packets", body: "Follow exact clean-water measurements printed on Oral Rehydration Salts packets." },
      { heading: "Step 3: Finish Prescribed Courses", body: "Never stop antibiotics early without a clinician's guidance." },
      { heading: "Step 4: Track Daily Reminders", body: "Log daily medicines in EYENEKA Care so doses are not doubled or missed." },
      { heading: "Step 5: Keep Child Vaccine Logs", body: "Maintain up-to-date immunization records for clinic visits." },
    ],
    quiz: [
      {
        id: "q-health-hyg-1",
        question: "How should Oral Rehydration Salts (ORS) packets be prepared?",
        options: [
          "Mixed with the exact clean-water volume printed on the packet",
          "Guessed without measuring water",
          "Mixed with sugary soda",
        ],
        correctIndex: 0,
      },
    ],
  },
];

const OFFICIAL_GIG_TEMPLATES: GigTemplate[] = [
  {
    id: "official-tpl-cv",
    title: "Polish & Format A 1-Page Pioneer Resume",
    category: "Remote Digital",
    requiredSkill: "AI CV & Profile Builder",
    description: "Rewrite and format a clear 1-page resume based strictly on the buyer's real experience.",
    deadline: "48 hours",
    pricePi: 1.5,
    checklist: [
      "Header & concise 2-line skill summary",
      "Truthful bullet points with clear outcomes",
      "Clean, readable formatting with zero typos",
    ],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "official-tpl-sheet",
    title: "Clean & Deduplicate A CSV Contact or Inventory List",
    category: "Remote Digital",
    requiredSkill: "Spreadsheet & Data Cleanup",
    description: "Standardize headers, fix date formats, and remove exact duplicate rows cleanly.",
    deadline: "48 hours",
    pricePi: 2.0,
    checklist: [
      "Consistent column naming & trimmed spaces",
      "Exact duplicate rows removed & logged",
      "Clean CSV/JSON deliverable verified",
    ],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "official-tpl-proof",
    title: "Proofread & Clarify Community Guide (Up To 1,000 Words)",
    category: "Community",
    requiredSkill: "Proofreading & Formatting",
    description: "Edit spelling, grammar, and step-by-step clarity for a community or learning guide.",
    deadline: "24 hours",
    pricePi: 1.0,
    checklist: [
      "Grammar & punctuation corrected",
      "Clear headings and numbered steps",
      "Summary note of key improvements",
    ],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
];

const OFFICIAL_FIRST_AID_GUIDES: FirstAidGuide[] = [
  {
    id: "official-aid-bleeding",
    title: "Severe Bleeding — Immediate Direct Pressure",
    urgency: "Urgent Action",
    summary: "Control heavy bleeding quickly using clean cloth and firm continuous pressure while summoning medical help.",
    imageUrl: "/src/assets/images/first_aid_bleeding_1795511042160.jpg",
    publishedBy: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    viewsCount: 0,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    steps: [
      "Ensure the area is safe and put on clean gloves if available.",
      "Press a clean cloth or sterile gauze firmly and directly onto the wound.",
      "Do not lift the cloth to check; add fresh layers on top if blood soaks through.",
      "Keep the person lying down, calm, and warm until medical help arrives.",
    ],
    seekHelpWhen: "Call emergency services immediately if bleeding does not slow within 5 minutes, spurts, or causes dizziness.",
  },
  {
    id: "official-aid-burns",
    title: "Thermal Burns — Cool Running Water First",
    urgency: "Careful Monitoring",
    summary: "Cool minor and moderate burns promptly with clean cool running water — never apply butter, oil, or toothpaste.",
    imageUrl: "/src/assets/images/first_aid_burns_1795511041963.jpg",
    publishedBy: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    viewsCount: 0,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    steps: [
      "Run cool (not ice-cold) clean water gently over the burn for 20 minutes.",
      "Remove tight rings or watches near the area before swelling starts.",
      "Cover loosely with a clean non-stick dressing or cling wrap; do not pop blisters.",
      "Never apply ice, butter, oil, or household pastes to burned skin.",
    ],
    seekHelpWhen: "Seek urgent medical care for burns on the face, hands, joints, large areas, or any electrical/chemical burn.",
  },
  {
    id: "official-aid-choking",
    title: "Choking — Recognizing Complete Airway Blockage",
    urgency: "Urgent Action",
    summary: "Act immediately when a person cannot speak, cough, or breathe, and obtain emergency medical help.",
    imageUrl: "/src/assets/images/first_aid_choking_1795511042800.jpg",
    publishedBy: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    viewsCount: 0,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    steps: [
      "Ask 'Are you choking?' If the person can cough forcefully, encourage coughing and stay beside them.",
      "If they cannot cough, speak, or breathe, have someone call emergency services immediately.",
      "For an adult or child over 1 year, lean them forward and deliver firm back blows between the shoulder blades followed by abdominal thrusts if trained.",
      "If the person becomes unresponsive, start CPR immediately and wait for emergency responders.",
    ],
    seekHelpWhen: "Always seek emergency medical evaluation immediately after any severe choking episode.",
  },
];

const OFFICIAL_CIRCLE_TEMPLATES: CircleTemplate[] = [
  {
    id: "official-ctpl-weekly-food",
    name: "Weekly Community Food Reserve Circle",
    description: "10-member weekly 1.00 π rotation with a member-voted emergency food pool and 0% interest.",
    maxMembers: 10,
    contributionPi: 1.0,
    cycle: "Weekly",
    payoutMode: "Vote",
    hasFoodPool: true,
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "official-ctpl-monthly-tools",
    name: "Monthly Skill & Tools Rotation Circle",
    description: "8-member monthly 2.00 π rotation supporting Pioneers saving for work equipment or study.",
    maxMembers: 8,
    contributionPi: 2.0,
    cycle: "Monthly",
    payoutMode: "Rotation",
    hasFoodPool: false,
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
];
import {
  PI_APP_REDIRECT_URL,
  PI_SIGNIN_ERROR_MESSAGE,
  authenticateWithPiSdk,
  getVerifiedSessionUser,
  initPiSdk,
  logoutPiSession,
  resumeIncompletePayments,
  retryConnectPi,
} from "./lib/piSdk";
import { Header } from "./components/Header";
import { BottomNav } from "./components/BottomNav";
import { AdminPublishPayload, HomeView } from "./components/HomeView";
import { LearnView } from "./components/LearnView";
import { WorkView } from "./components/WorkView";
import { CareView } from "./components/CareView";
import { SaveView } from "./components/SaveView";
import { WalletView } from "./components/WalletView";
import { LawView } from "./components/LawView";
import { PiPaymentModal } from "./components/PiPaymentModal";
import { PiAuthModal } from "./components/PiAuthModal";
import { Footer } from "./components/Footer";

const STORAGE_KEY = "eyeneka_official_v4";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [activeTab, setActiveTab] = useState<TabKey>("home");
  const [language, setLanguage] = useState<LanguageName>("English");
  const [lowDataMode, setLowDataMode] = useState(false);
  const [textScale, setTextScale] = useState<TextScale>("normal");
  const [isAdmin, setIsAdmin] = useState(true);

  // Real Pi Auth & Balance State (all start at zero / empty)
  const [piConnected, setPiConnected] = useState(false);
  const [inPiBrowser, setInPiBrowser] = useState(false);
  const [username, setUsername] = useState("");
  const [kycVerified, setKycVerified] = useState(false);
  const [kycTrustAwarded, setKycTrustAwarded] = useState(false);
  const [trustScore, setTrustScore] = useState(0);
  const [availablePi, setAvailablePi] = useState(0);
  const [earnedMonthPi, setEarnedMonthPi] = useState(0);
  const [healthScore, setHealthScore] = useState<number | null>(null);
  const [circleLeaderActive, setCircleLeaderActive] = useState(false);

  // Official Starter Products (Published by EYENEKA Official, 0 fake completions/reviews/earnings)
  const [lessons, setLessons] = useState<Lesson[]>(OFFICIAL_STARTER_LESSONS);
  const [gigTemplates, setGigTemplates] = useState<GigTemplate[]>(OFFICIAL_GIG_TEMPLATES);
  const [guides, setGuides] = useState<FirstAidGuide[]>(OFFICIAL_FIRST_AID_GUIDES);
  const [circleTemplates, setCircleTemplates] = useState<CircleTemplate[]>(OFFICIAL_CIRCLE_TEMPLATES);

  // Real User-Created Collections (all start EMPTY)
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [offlineLessonIds, setOfflineLessonIds] = useState<string[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(
    OFFICIAL_STARTER_LESSONS[0]?.id ?? null
  );

  const [gigs, setGigs] = useState<Gig[]>([]);
  const [selectedGigId, setSelectedGigId] = useState<string | null>(null);

  const [resources, setResources] = useState<CareResource[]>([]);
  const [childrenList, setChildrenList] = useState<ChildTracker[]>([]);
  const [meds, setMeds] = useState<MedicineReminder[]>([]);
  const [peerMessages, setPeerMessages] = useState<PeerListenerMessage[]>([]);

  const [circles, setCircles] = useState<SavingsCircle[]>([]);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [blockedUsers, setBlockedUsers] = useState<string[]>([]);

  // Modals & Overlays
  const [pendingPayment, setPendingPayment] = useState<PendingPiPayment | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [connectingPi, setConnectingPi] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const earnedSkills = Array.from(new Set(certificates.map((c) => c.skillUnlock)));

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    void (async () => {
      const sdkReady = await initPiSdk();
      if (sdkReady) {
        void resumeIncompletePayments();
      }
    })();

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const p = JSON.parse(raw);
        if (p.language) setLanguage(p.language);
        if (typeof p.lowDataMode === "boolean") setLowDataMode(p.lowDataMode);
        if (p.textScale) setTextScale(p.textScale);
        if (typeof p.isAdmin === "boolean") setIsAdmin(p.isAdmin);
        if (typeof p.kycTrustAwarded === "boolean") setKycTrustAwarded(p.kycTrustAwarded);
        if (typeof p.trustScore === "number") setTrustScore(p.trustScore);
        if (typeof p.availablePi === "number") setAvailablePi(p.availablePi);
        if (typeof p.earnedMonthPi === "number") setEarnedMonthPi(p.earnedMonthPi);
        if (typeof p.healthScore === "number") setHealthScore(p.healthScore);
        if (typeof p.circleLeaderActive === "boolean") setCircleLeaderActive(p.circleLeaderActive);
        if (Array.isArray(p.lessons)) setLessons(p.lessons);
        if (Array.isArray(p.gigTemplates)) setGigTemplates(p.gigTemplates);
        if (Array.isArray(p.guides)) setGuides(p.guides);
        if (Array.isArray(p.circleTemplates)) setCircleTemplates(p.circleTemplates);
        if (Array.isArray(p.certificates)) setCertificates(p.certificates);
        if (Array.isArray(p.offlineLessonIds)) setOfflineLessonIds(p.offlineLessonIds);
        if (Array.isArray(p.gigs)) setGigs(p.gigs);
        if (Array.isArray(p.resources)) setResources(p.resources);
        if (Array.isArray(p.childrenList)) setChildrenList(p.childrenList);
        if (Array.isArray(p.meds)) setMeds(p.meds);
        if (Array.isArray(p.peerMessages)) setPeerMessages(p.peerMessages);
        if (Array.isArray(p.circles)) setCircles(p.circles);
        if (Array.isArray(p.transactions)) setTransactions(p.transactions);
        if (Array.isArray(p.notifications)) setNotifications(p.notifications);
        if (Array.isArray(p.blockedUsers)) setBlockedUsers(p.blockedUsers);
      }
    } catch {
      // Ignore malformed cache
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          language,
          lowDataMode,
          textScale,
          isAdmin,
          kycTrustAwarded,
          trustScore,
          availablePi,
          earnedMonthPi,
          healthScore,
          circleLeaderActive,
          lessons,
          gigTemplates,
          guides,
          circleTemplates,
          certificates,
          offlineLessonIds,
          gigs,
          resources,
          childrenList,
          meds,
          peerMessages,
          circles,
          transactions,
          notifications,
          blockedUsers,
        })
      );
    } catch {
      // Ignore storage quota errors
    }
  }, [
    hydrated,
    language,
    lowDataMode,
    textScale,
    isAdmin,
    kycTrustAwarded,
    trustScore,
    availablePi,
    earnedMonthPi,
    healthScore,
    circleLeaderActive,
    lessons,
    gigTemplates,
    guides,
    circleTemplates,
    certificates,
    offlineLessonIds,
    gigs,
    resources,
    childrenList,
    meds,
    peerMessages,
    circles,
    transactions,
    notifications,
    blockedUsers,
  ]);

  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("text-scale-lg", "text-scale-xl");
    if (textScale === "lg") html.classList.add("text-scale-lg");
    if (textScale === "xl") html.classList.add("text-scale-xl");
  }, [textScale]);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => {
      setToast((prev) => (prev === message ? null : prev));
    }, 4200);
  };

  const addNotification = (title: string, detail: string, targetTab: TabKey) => {
    setNotifications((prev) => [
      {
        id: `n-${Date.now()}`,
        title,
        detail,
        timestamp: "Just now",
        read: false,
        targetTab,
      },
      ...prev,
    ]);
  };

  const handleAuthenticated = (auth: {
    username: string;
    kycVerified: boolean;
    inPiBrowser: boolean;
  }) => {
    const cleanUsername = auth.username.replace(/^@/, "");
    const nextHandle = `@${cleanUsername}`;
    setPiConnected(true);
    setUsername(cleanUsername);
    setKycVerified(auth.kycVerified);
    setInPiBrowser(auth.inPiBrowser);
    setAuthError(null);
    if (auth.kycVerified && !kycTrustAwarded) {
      setTrustScore((s) => Math.min(100, s + 20));
      setKycTrustAwarded(true);
    }
    setCircles((prev) =>
      prev.map((c) => ({
        ...c,
        nextRecipient: c.nextRecipient === "@pioneer" ? nextHandle : c.nextRecipient,
        members: c.members.map((m) =>
          m.handle === "@pioneer" ? { ...m, handle: nextHandle } : m
        ),
      }))
    );
    setGigs((prev) =>
      prev.map((g) => (g.buyerHandle === "@pioneer" ? { ...g, buyerHandle: nextHandle } : g))
    );
    setResources((prev) =>
      prev.map((r) => (r.addedBy === "@pioneer" ? { ...r, addedBy: nextHandle } : r))
    );
    if (
      typeof window !== "undefined" &&
      window.location.origin === new URL(PI_APP_REDIRECT_URL).origin &&
      window.location.pathname !== "/"
    ) {
      window.history.replaceState(null, "", "/");
    }
    showToast(`Welcome, Pioneer @${cleanUsername}`);
  };

  const handleEnsurePiConnected = async (options?: {
    fresh?: boolean;
  }): Promise<{ connected: boolean; error?: string }> => {
    if (!options?.fresh && piConnected && username) {
      return { connected: true };
    }
    setAuthError(null);
    setConnectingPi(true);
    try {
      const attempt = options?.fresh
        ? await retryConnectPi()
        : await authenticateWithPiSdk();
      if (attempt.success && attempt.result) {
        handleAuthenticated({
          username: attempt.result.username,
          kycVerified: attempt.result.kycVerified,
          inPiBrowser: true,
        });
        return { connected: true };
      }
      const errMsg = attempt.error ?? PI_SIGNIN_ERROR_MESSAGE;
      setAuthError(errMsg);
      return { connected: false, error: errMsg };
    } finally {
      setConnectingPi(false);
    }
  };

  const handleOpenPiConnect = async () => {
    const res = await handleEnsurePiConnected();
    if (!res.connected) {
      setAuthModalOpen(true);
    }
  };

  // Admin Publisher handler (Home)
  const handlePublishOfficialProduct = (payload: AdminPublishPayload) => {
    const nowId = Date.now();
    if (payload.productType === "Lesson") {
      const steps =
        payload.stepsOrChecklist.length >= 5
          ? payload.stepsOrChecklist
          : [
              ...payload.stepsOrChecklist,
              ...Array.from(
                { length: 5 - payload.stepsOrChecklist.length },
                (_, i) => `Review step ${payload.stepsOrChecklist.length + i + 1} carefully.`
              ),
            ];
      const newLesson: Lesson = {
        id: `official-l-${nowId}`,
        title: payload.title,
        category: payload.category as SkillCategory,
        skillUnlock: payload.title,
        durationMin: 12,
        certificateFeePi: Math.min(0.5, Math.max(0.1, payload.pricePi || 0.3)),
        summary: payload.description,
        creatorHandle: "EYENEKA Official",
        publishedAt: TODAY_ISO,
        isOfficialStarter: true,
        completionsCount: 0,
        reviewsCount: 0,
        earningsPi: 0,
        sections: steps.map((s, idx) => ({ heading: `Step ${idx + 1}`, body: s })),
        quiz: [
          {
            id: "q-1",
            question: `What is the primary goal of "${payload.title}"?`,
            options: [
              payload.description.slice(0, 75),
              "Unverified off-app solicitation",
              "Ignoring deliverables",
            ],
            correctIndex: 0,
          },
        ],
      };
      setLessons((prev) => [newLesson, ...prev]);
      setSelectedLessonId(newLesson.id);
      showToast(`Published Official Lesson "${newLesson.title}" (0 completions).`);
      return;
    }

    if (payload.productType === "Gig Template") {
      const newTpl: GigTemplate = {
        id: `official-tpl-${nowId}`,
        title: payload.title,
        category: payload.category as GigCategory,
        requiredSkill: payload.title,
        description: payload.description,
        deadline: "48 hours",
        pricePi: Math.min(5.0, Math.max(0.2, payload.pricePi || 1.0)),
        checklist: payload.stepsOrChecklist,
        author: "EYENEKA Official",
        publishedAt: TODAY_ISO,
        isOfficialStarter: true,
        completionsCount: 0,
        reviewsCount: 0,
        earningsPi: 0,
      };
      setGigTemplates((prev) => [newTpl, ...prev]);
      showToast(`Published Official Gig Template "${newTpl.title}" (0 completions).`);
      return;
    }

    if (payload.productType === "Care Guide") {
      const newGuide: FirstAidGuide = {
        id: `official-aid-${nowId}`,
        title: payload.title,
        urgency: payload.category === "Careful Monitoring" ? "Careful Monitoring" : "Urgent Action",
        summary: payload.description,
        publishedBy: "EYENEKA Official",
        publishedAt: TODAY_ISO,
        isOfficialStarter: true,
        viewsCount: 0,
        completionsCount: 0,
        reviewsCount: 0,
        earningsPi: 0,
        steps: payload.stepsOrChecklist,
        seekHelpWhen: "Seek professional care immediately if Red symptoms appear.",
      };
      setGuides((prev) => [newGuide, ...prev]);
      showToast(`Published Official Care Guide "${newGuide.title}" (0 views).`);
      return;
    }

    const isMonthly = payload.category.includes("Monthly");
    const isVote = payload.category.includes("Vote") || payload.category.includes("Food");
    const isFood = payload.category.includes("Food");
    const membersParsed = Number(payload.stepsOrChecklist[0]) || 10;
    const newCircleTpl: CircleTemplate = {
      id: `official-ctpl-${nowId}`,
      name: payload.title,
      description: payload.description,
      maxMembers: Math.min(20, Math.max(5, membersParsed)),
      contributionPi: Math.min(5.0, Math.max(0.5, payload.pricePi || 1.0)),
      cycle: isMonthly ? "Monthly" : "Weekly",
      payoutMode: isVote ? "Vote" : "Rotation",
      hasFoodPool: isFood,
      author: "EYENEKA Official",
      publishedAt: TODAY_ISO,
      isOfficialStarter: true,
      completionsCount: 0,
      reviewsCount: 0,
      earningsPi: 0,
    };
    setCircleTemplates((prev) => [newCircleTpl, ...prev]);
    showToast(`Published Official Circle Template "${newCircleTpl.name}" (0 completions).`);
  };

  // Learn handlers
  const handlePublishLesson = (payload: Omit<Lesson, "id" | "publishedAt">) => {
    const newLesson: Lesson = {
      ...payload,
      id: `l-${Date.now()}`,
      publishedAt: TODAY_ISO,
    };
    setLessons((prev) => [newLesson, ...prev]);
    setSelectedLessonId(newLesson.id);
    addNotification(
      `Lesson Published: ${newLesson.title}`,
      `Free ${newLesson.category} lesson published (${newLesson.sections.length} steps).`,
      "learn"
    );
    showToast(`Lesson "${newLesson.title}" published.`);
  };

  const handleUpdateLesson = (id: string, payload: Omit<Lesson, "id" | "publishedAt">) => {
    setLessons((prev) =>
      prev.map((l) => (l.id === id ? { ...l, ...payload } : l))
    );
    showToast(`Lesson "${payload.title}" updated.`);
  };

  const handleDeleteLesson = (id: string) => {
    setLessons((prev) => prev.filter((l) => l.id !== id));
    if (selectedLessonId === id) {
      setSelectedLessonId(null);
    }
    showToast("Lesson deleted.");
  };

  const handleToggleOffline = (lessonId: string) => {
    setOfflineLessonIds((prev) => {
      const next = prev.includes(lessonId)
        ? prev.filter((id) => id !== lessonId)
        : [...prev, lessonId];
      showToast(
        next.includes(lessonId)
          ? "Lesson saved for offline reading."
          : "Lesson removed from offline cache."
      );
      return next;
    });
  };

  const handlePassQuiz = (lesson: Lesson) => {
    addNotification(
      `Skill Test Passed: ${lesson.title}`,
      `Get your Verified Certificate (${lesson.certificateFeePi.toFixed(2)} π) to earn +10 Trust Score and unlock ${lesson.skillUnlock} gigs.`,
      "learn"
    );
  };

  const handleMintCertificate = (lesson: Lesson, onMinted: (cert: CertificateRecord) => void) => {
    const certId = `CRT-${Date.now().toString().slice(-5)}`;
    const certFee = Number((lesson.certificateFeePi || 0.3).toFixed(2));
    setPendingPayment({
      title: "Verified Certificate (Testnet)",
      purpose: `Verified Certificate: ${lesson.title} (+10 Trust Score)`,
      amountPi: certFee,
      breakdown: [
        { label: `Free Lesson & Skill Test (${lesson.skillUnlock})`, amountPi: 0 },
        { label: "Verified QR Certificate + Trust +10", amountPi: certFee },
      ],
      memo: `Eyeneka - Verified Certificate (${lesson.skillUnlock})`,
      metadata: {
        type: "certificate",
        itemId: lesson.id,
        buyer: username || "pioneer",
      },
      escrowId: certId,
      onComplete: ({ paymentId, txHash, escrowId }) => {
        const newCert: CertificateRecord = {
          id: `cert-${Date.now()}`,
          lessonId: lesson.id,
          title: lesson.title,
          skillUnlock: lesson.skillUnlock,
          issuedAt: new Date().toISOString().slice(0, 10),
          txHash,
          feePi: certFee,
        };
        setCertificates((prev) => [...prev, newCert]);
        setLessons((prev) =>
          prev.map((l) =>
            l.id === lesson.id
              ? {
                  ...l,
                  completionsCount: (l.completionsCount ?? 0) + 1,
                  earningsPi: Number(((l.earningsPi ?? 0) + certFee).toFixed(2)),
                }
              : l
          )
        );
        setTrustScore((s) => Math.min(100, s + 10));
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            category: "Certificates",
            type: "Certificate Mint",
            label: `Verified Certificate: ${lesson.title}`,
            amountPi: certFee,
            feePi: certFee,
            direction: "out",
            status: "Confirmed",
            timestamp: "Just now",
            dateIso: new Date().toISOString().slice(0, 10),
            escrowId,
            paymentId,
            txHash,
          },
          ...prev,
        ]);
        addNotification(
          `Certificate Minted: ${lesson.skillUnlock}`,
          `Trust Score +10! ${lesson.skillUnlock} micro-gigs are now unlocked in Work.`,
          "work"
        );
        showToast("Certificate minted! Trust Score +10.");
        onMinted(newCert);
      },
    });
  };

  // Work handlers
  const handleCreateGig = (
    payload: Omit<Gig, "id" | "status" | "messages">,
    boost24h: boolean
  ) => {
    const escrowId = `ESC-${Date.now().toString().slice(-5)}`;
    const publishGig = (featuredActive: boolean) => {
      const newGig: Gig = {
        ...payload,
        id: `g-${Date.now()}`,
        escrowId,
        featured: featuredActive,
        featuredUntil: featuredActive ? "24h Featured" : undefined,
        status: "Open",
        messages: [],
      };
      setGigs((prev) => [newGig, ...prev]);
      setSelectedGigId(newGig.id);
      showToast(
        featuredActive
          ? "FEATURED gig published to top of Work for 24h."
          : "Verified micro-gig published to marketplace."
      );
    };

    if (!boost24h) {
      publishGig(false);
      return;
    }

    setPendingPayment({
      title: "Featured Gig Boost (24h)",
      purpose: `24h FEATURED Boost: ${payload.title}`,
      amountPi: 0.2,
      breakdown: [
        { label: "Featured Boost (24h)", amountPi: 0.2 },
        { label: "Gig Price (locked separately in Escrow)", amountPi: payload.pricePi },
      ],
      memo: "Eyeneka - Featured Boost",
      metadata: {
        type: "boost",
        itemId: escrowId,
        buyer: username || "pioneer",
      },
      escrowId: `BST-${Date.now().toString().slice(-5)}`,
      onComplete: ({ paymentId, txHash, escrowId: boostRef }) => {
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            category: "Boosts",
            type: "Featured Gig Boost",
            label: `24h Top Placement Boost: ${payload.title}`,
            amountPi: 0.2,
            feePi: 0.2,
            direction: "out",
            status: "Confirmed",
            timestamp: "Just now",
            dateIso: new Date().toISOString().slice(0, 10),
            escrowId: boostRef,
            paymentId,
            txHash,
          },
          ...prev,
        ]);
        publishGig(true);
      },
    });
  };

  const handleLockEscrow = (gigId: string) => {
    const target = gigs.find((g) => g.id === gigId);
    if (!target) return;
    const feePi = Number((target.pricePi * 0.08).toFixed(2));
    const totalEscrowPi = Number((target.pricePi + feePi).toFixed(2));
    const escrowId = target.escrowId || `ESC-${Date.now().toString().slice(-5)}`;

    setPendingPayment({
      title: "Lock Pi in Smart Contract Escrow",
      purpose: `Gig Escrow: ${target.title}`,
      amountPi: totalEscrowPi,
      breakdown: [
        { label: "Gig Price", amountPi: target.pricePi },
        { label: "Escrow Fee (8%)", amountPi: feePi },
        { label: "Total in Pi", amountPi: totalEscrowPi },
      ],
      memo: `Eyeneka - Gig Escrow (${target.title})`,
      metadata: {
        type: "gig_escrow",
        itemId: target.id,
        buyer: username || "pioneer",
      },
      escrowId,
      onComplete: ({ paymentId, txHash, escrowId: refId }) => {
        setGigs((prev) =>
          prev.map((g) =>
            g.id === gigId
              ? {
                  ...g,
                  status: "Funds Locked",
                  escrowId: refId,
                  paymentId,
                  txHash,
                }
              : g
          )
        );
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            category: "Gigs",
            type: "Escrow Lock",
            label: `Funds Locked: ${target.title} (${target.pricePi.toFixed(2)} π + 8% Fee ${feePi.toFixed(2)} π)`,
            amountPi: totalEscrowPi,
            feePi,
            direction: "locked",
            status: "Locked",
            timestamp: "Just now",
            dateIso: new Date().toISOString().slice(0, 10),
            escrowId: refId,
            paymentId,
            txHash,
          },
          ...prev,
        ]);
        addNotification(
          `Funds Locked (${refId})`,
          `${totalEscrowPi.toFixed(2)} π locked in Smart Contract Escrow for "${target.title}".`,
          "work"
        );
        showToast(`Funds Locked (${totalEscrowPi.toFixed(2)} π) in Smart Contract Escrow.`);
      },
    });
  };

  const handleSubmitProof = (
    gigId: string,
    proofNote: string,
    checkedItems: number[],
    proofFileName?: string,
    proofImageDataUrl?: string
  ) => {
    setGigs((prev) =>
      prev.map((g) =>
        g.id === gigId
          ? {
              ...g,
              status: "Proof Submitted",
              proofNote,
              proofFileName,
              proofImageDataUrl,
              proofCheckedItems: checkedItems,
            }
          : g
      )
    );
    showToast("Deliverable proof submitted. Buyer review started.");
  };

  const handleReleaseEscrow = (gigId: string, rating: number, reviewText: string) => {
    const target = gigs.find((g) => g.id === gigId);
    if (!target) return;
    const feePi = Number((target.pricePi * 0.08).toFixed(2));
    const workerPayoutPi = Number(target.pricePi.toFixed(2));
    const escrowId = target.escrowId || `ESC-${Date.now().toString().slice(-5)}`;
    const releaseDate = new Date().toISOString().slice(0, 10);
    const trustGain = rating >= 4 ? 15 : 10;

    setGigs((prev) =>
      prev.map((g) =>
        g.id === gigId
          ? {
              ...g,
              status: "Released",
              releasedAt: releaseDate,
              workerRating: rating,
              buyerReview: reviewText || undefined,
            }
          : g
      )
    );
    setAvailablePi((p) => Number((p + workerPayoutPi).toFixed(2)));
    setEarnedMonthPi((p) => Number((p + workerPayoutPi).toFixed(2)));
    setTrustScore((s) => Math.min(100, s + trustGain));
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        category: "Gigs",
        type: "Gig Payout",
        label: `Confirmed Release: ${target.title} (Amount ${workerPayoutPi.toFixed(2)} π · Fee ${feePi.toFixed(2)} π)`,
        amountPi: workerPayoutPi,
        feePi,
        direction: "in",
        status: "Confirmed",
        timestamp: "Just now",
        dateIso: releaseDate,
        escrowId,
        paymentId: target.paymentId,
        txHash: target.txHash || escrowId,
      },
      ...prev,
    ]);
    showToast(
      `Escrow released! Worker receives ${workerPayoutPi.toFixed(2)} π · Status: Confirmed.`
    );
  };

  const handleAdvanceDispute = (gigId: string, reason?: string) => {
    setGigs((prev) =>
      prev.map((g) => {
        if (g.id !== gigId) return g;
        if (g.status !== "Disputed") {
          return { ...g, status: "Disputed", disputeStep: 1, disputeReason: reason };
        }
        const currentStep = g.disputeStep ?? 1;
        if (currentStep < 3) {
          return { ...g, disputeStep: (currentStep + 1) as 1 | 2 | 3 };
        }
        // Never auto-release disputed escrow
        return g;
      })
    );
    showToast("Gig status set to Disputed. Escrow remains locked — no auto-release.");
  };

  const handleSendGigMessage = (gigId: string, text: string) => {
    setGigs((prev) =>
      prev.map((g) =>
        g.id === gigId
          ? {
              ...g,
              messages: [
                ...g.messages,
                {
                  id: `gm-${Date.now()}`,
                  sender: username ? `@${username}` : "@pioneer",
                  text,
                  timestamp: "Just now",
                },
              ],
            }
          : g
      )
    );
  };

  const handleReportGig = (gigId: string) => {
    setGigs((prev) => prev.map((g) => (g.id === gigId ? { ...g, reported: true } : g)));
    showToast("Gig flagged for Community Integrity review.");
  };

  const handleUpdateGigTemplate = (id: string, updated: Partial<GigTemplate>) => {
    setGigTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
    showToast("Gig template updated.");
  };

  const handleDeleteGigTemplate = (id: string) => {
    setGigTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast("Gig template deleted.");
  };

  // Care handlers
  const handlePublishGuide = (guide: Omit<FirstAidGuide, "id" | "publishedAt">) => {
    setGuides((prev) => [
      { ...guide, id: `fa-${Date.now()}`, publishedAt: TODAY_ISO },
      ...prev,
    ]);
    showToast(`First Aid guide "${guide.title}" published.`);
  };

  const handleUpdateGuide = (id: string, guide: Omit<FirstAidGuide, "id" | "publishedAt">) => {
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, ...guide } : g))
    );
    showToast(`First Aid guide "${guide.title}" updated.`);
  };

  const handleDeleteGuide = (id: string) => {
    setGuides((prev) => prev.filter((g) => g.id !== id));
    showToast("First Aid guide deleted.");
  };

  const handleIncrementGuideView = (id: string) => {
    setGuides((prev) =>
      prev.map((g) => (g.id === id ? { ...g, viewsCount: g.viewsCount + 1 } : g))
    );
  };

  const handleAddResource = (res: Omit<CareResource, "id" | "rating" | "reviewCount">) => {
    setResources((prev) => [
      { ...res, id: `cr-${Date.now()}`, rating: 0, reviewCount: 0 },
      ...prev,
    ]);
    showToast("Community care listing added.");
  };

  const handleRateResource = (resourceId: string, stars: number) => {
    setResources((prev) =>
      prev.map((r) => {
        if (r.id !== resourceId) return r;
        const nextCount = r.reviewCount + 1;
        const nextAvg = Number(((r.rating * r.reviewCount + stars) / nextCount).toFixed(1));
        return { ...r, rating: nextAvg, reviewCount: nextCount };
      })
    );
    showToast("Community rating recorded.");
  };

  const handleRegisterCarePartner = (partner: {
    name: string;
    type: CareResource["type"];
    areaNote: string;
    hours: string;
    documentName: string;
  }) => {
    setPendingPayment({
      title: "Verified Care Partner Listing",
      purpose: `Monthly Care Partner Listing: ${partner.name}`,
      amountPi: 0.5,
      breakdown: [
        { label: "Care Partner Listing Fee (1 Month)", amountPi: 0.5 },
        { label: `Document Submitted (${partner.documentName})`, amountPi: 0 },
      ],
      memo: `Eyeneka - Care Partner (${partner.name})`,
      metadata: {
        type: "care",
        itemId: partner.name.slice(0, 40),
        buyer: username || "pioneer",
      },
      escrowId: `CARE-${Date.now().toString().slice(-5)}`,
      onComplete: ({ paymentId, txHash, escrowId }) => {
        setResources((prev) => [
          {
            id: `cr-${Date.now()}`,
            name: partner.name,
            type: partner.type,
            areaNote: partner.areaNote,
            hours: partner.hours,
            rating: 0,
            reviewCount: 0,
            addedBy: username ? `@${username}` : "@pioneer",
            verifiedPartner: true,
            approvalStatus: "Pending Review",
            documentName: partner.documentName,
          },
          ...prev,
        ]);
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            category: "Care Listing",
            type: "Care Partner Listing",
            label: `Verified Care Partner (Pending Review): ${partner.name}`,
            amountPi: 0.5,
            feePi: 0.5,
            direction: "out",
            status: "Confirmed",
            timestamp: "Just now",
            dateIso: new Date().toISOString().slice(0, 10),
            escrowId,
            paymentId,
            txHash,
          },
          ...prev,
        ]);
        showToast("Care Partner listing submitted for credential verification.");
      },
    });
  };

  const handleApprovePartner = (resourceId: string) => {
    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, approvalStatus: "Verified" } : r))
    );
    showToast("Care Partner document approved — Verified badge active.");
  };

  const handleAddChild = (name: string, ageMonths: number) => {
    setChildrenList((prev) => [
      ...prev,
      { id: `ch-${Date.now()}`, name, ageMonths, completedVaccines: [] },
    ]);
    showToast(`Added ${name} to immunization tracker.`);
  };

  const handleToggleVaccine = (childId: string, vaccine: string) => {
    setChildrenList((prev) =>
      prev.map((c) => {
        if (c.id !== childId) return c;
        const exists = c.completedVaccines.includes(vaccine);
        return {
          ...c,
          completedVaccines: exists
            ? c.completedVaccines.filter((v) => v !== vaccine)
            : [...c.completedVaccines, vaccine],
        };
      })
    );
  };

  const handleToggleMedTaken = (medId: string) => {
    setMeds((prev) =>
      prev.map((m) => (m.id === medId ? { ...m, takenToday: !m.takenToday } : m))
    );
  };

  const handleAddMed = (label: string, dosageNote: string, timeOfDay: string) => {
    setMeds((prev) => [
      ...prev,
      { id: `med-${Date.now()}`, label, dosageNote, timeOfDay, takenToday: false },
    ]);
    showToast("Medicine reminder saved.");
  };

  const handleSendPeerMessage = (text: string, asVolunteer: boolean) => {
    setPeerMessages((prev) => [
      ...prev,
      {
        id: `pm-${Date.now()}`,
        sender: username ? `@${username}` : "@pioneer",
        role: asVolunteer ? "Volunteer Listener" : "Pioneer",
        text,
        timestamp: "Just now",
      },
    ]);
  };

  const handleRecordHealthCheck = (stressLevel: number) => {
    const baseByStress: Record<number, number> = { 1: 95, 2: 88, 3: 78, 4: 66, 5: 55 };
    const medBonus = meds.some((m) => m.takenToday) ? 5 : 0;
    setHealthScore(Math.min(100, (baseByStress[stressLevel] ?? 75) + medBonus));
    showToast("Wellness check recorded — My Health Score updated.");
  };

  // Save handlers
  const handleUpgradeCircleLeader = () => {
    setPendingPayment({
      title: "Circle Leader Premium",
      purpose: "Circle Leader Monthly Plan (3 Circles + Auto-Reminders + Export Ledger)",
      amountPi: 0.5,
      breakdown: [
        { label: "Circle Leader Subscription (1 Month)", amountPi: 0.5 },
        { label: "Cancel anytime · No refund beyond current month", amountPi: 0 },
      ],
      memo: "Eyeneka - Circle Leader (0.5 Pi/month)",
      metadata: {
        type: "circle",
        itemId: "circle-leader-monthly",
        buyer: username || "pioneer",
      },
      escrowId: `CIRL-${Date.now().toString().slice(-5)}`,
      onComplete: ({ paymentId, txHash, escrowId }) => {
        setCircleLeaderActive(true);
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            category: "Circles",
            type: "Circle Leader Premium",
            label: "Circle Leader Plan (3 Circles, Auto-Reminders, CSV Export)",
            amountPi: 0.5,
            feePi: 0.5,
            direction: "out",
            status: "Confirmed",
            timestamp: "Just now",
            dateIso: new Date().toISOString().slice(0, 10),
            escrowId,
            paymentId,
            txHash,
          },
          ...prev,
        ]);
        showToast("Circle Leader unlocked! You can now run up to 3 circles.");
      },
    });
  };

  const handleCancelCircleLeader = () => {
    setCircleLeaderActive(false);
    showToast("Circle Leader auto-renew cancelled.");
  };

  const handleUpdateCircleTemplate = (id: string, updated: Partial<CircleTemplate>) => {
    setCircleTemplates((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updated } : t))
    );
    showToast("Circle template updated.");
  };

  const handleDeleteCircleTemplate = (id: string) => {
    setCircleTemplates((prev) => prev.filter((t) => t.id !== id));
    showToast("Circle template deleted.");
  };

  const handleCreateCircle = (payload: {
    name: string;
    maxMembers: number;
    contributionPi: number;
    cycle: "Weekly" | "Monthly";
    payoutMode: "Rotation" | "Vote";
    hasFoodPool: boolean;
  }) => {
    const handle = username ? `@${username}` : "@pioneer";
    const newCircle: SavingsCircle = {
      id: `c-${Date.now()}`,
      name: payload.name,
      contributionPi: payload.contributionPi,
      cycle: payload.cycle,
      payoutMode: payload.payoutMode,
      maxMembers: payload.maxMembers,
      currentCycle: 1,
      nextPayoutDate: payload.cycle === "Weekly" ? "7 days from start" : "30 days from start",
      nextRecipient: handle,
      emergencyFoodPoolPi: 0,
      hasFoodPool: payload.hasFoodPool,
      joined: true,
      reminderEnabled: true,
      members: [
        {
          handle,
          trustScore,
          contributedThisCycle: false,
          lateFlag: false,
          payoutPosition: 1,
        },
      ],
      foodRequests: [],
      messages: [],
    };
    setCircles((prev) => [newCircle, ...prev]);
    showToast(`Savings circle "${payload.name}" created.`);
  };

  const handleJoinCircle = (circleId: string) => {
    const handle = username ? `@${username}` : "@pioneer";
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== circleId || c.joined) return c;
        return {
          ...c,
          joined: true,
          members: [
            ...c.members,
            {
              handle,
              trustScore,
              contributedThisCycle: false,
              lateFlag: false,
              payoutPosition: c.members.length + 1,
            },
          ],
        };
      })
    );
    showToast("Joined savings circle.");
  };

  const handleContributeCycle = (circleId: string) => {
    const target = circles.find((c) => c.id === circleId);
    if (!target) return;
    const contributionPi = Number(target.contributionPi.toFixed(2));
    const initialHandle = username ? `@${username}` : "@pioneer";
    setPendingPayment({
      title: "Circle Cycle Contribution",
      purpose: `${target.name} · Cycle ${target.currentCycle}`,
      amountPi: contributionPi,
      breakdown: [
        { label: "Rotating Savings Pool Contribution (0% Interest)", amountPi: contributionPi },
      ],
      memo: `Eyeneka - Circle Contribution (${target.name})`,
      metadata: {
        type: "circle",
        itemId: circleId,
        buyer: username || "pioneer",
      },
      escrowId: `CIR-${Date.now().toString().slice(-5)}`,
      onComplete: ({ paymentId, txHash, escrowId }) => {
        const verifiedName = getVerifiedSessionUser()?.username || username;
        const activeHandle = verifiedName ? `@${verifiedName}` : initialHandle;
        setCircles((prev) =>
          prev.map((c) => {
            if (c.id !== circleId) return c;
            return {
              ...c,
              members: c.members.map((m) =>
                m.handle === activeHandle || m.handle === initialHandle || m.handle === "@pioneer"
                  ? { ...m, handle: activeHandle, contributedThisCycle: true, lateFlag: false }
                  : m
              ),
            };
          })
        );
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            category: "Circles",
            type: "Circle Contribution",
            label: `${target.name} · Cycle ${target.currentCycle}`,
            amountPi: contributionPi,
            direction: "out",
            status: "Confirmed",
            timestamp: "Just now",
            dateIso: new Date().toISOString().slice(0, 10),
            escrowId,
            paymentId,
            txHash,
          },
          ...prev,
        ]);
        showToast(`Recorded ${contributionPi.toFixed(2)} π real contribution.`);
      },
    });
  };

  const handleMarkLateDefault = (circleId: string, memberHandle: string) => {
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== circleId) return c;
        return {
          ...c,
          members: c.members.map((m) =>
            m.handle === memberHandle
              ? { ...m, lateFlag: true, trustScore: Math.max(0, m.trustScore - 5) }
              : m
          ),
        };
      })
    );
    if (memberHandle === `@${username}`) {
      setTrustScore((s) => Math.max(0, s - 5));
    }
    showToast(`Recorded real missed cycle notice for ${memberHandle}.`);
  };

  const handleToggleReminder = (circleId: string) => {
    setCircles((prev) =>
      prev.map((c) =>
        c.id === circleId ? { ...c, reminderEnabled: !c.reminderEnabled } : c
      )
    );
  };

  const handleVoteFoodPool = (circleId: string, requestId: string) => {
    setCircles((prev) =>
      prev.map((c) => {
        if (c.id !== circleId) return c;
        return {
          ...c,
          foodRequests: c.foodRequests.map((r) => {
            if (r.id !== requestId || r.userVoted) return r;
            const nextVotes = r.votesFor + 1;
            return {
              ...r,
              votesFor: nextVotes,
              userVoted: true,
              approved: nextVotes >= r.votesNeeded,
            };
          }),
        };
      })
    );
    showToast("Food pool vote recorded.");
  };

  const handleCreateFoodRequest = (circleId: string, reason: string, amountPi: number) => {
    setCircles((prev) =>
      prev.map((c) =>
        c.id === circleId
          ? {
              ...c,
              foodRequests: [
                ...c.foodRequests,
                {
                  id: `fp-${Date.now()}`,
                  requester: username ? `@${username}` : "@pioneer",
                  reason,
                  amountPi,
                  votesFor: 1,
                  votesNeeded: Math.max(2, Math.ceil(c.members.length / 2)),
                  approved: false,
                  userVoted: true,
                },
              ],
            }
          : c
      )
    );
    showToast("Food support request submitted for member vote.");
  };

  const handleSendCircleMessage = (circleId: string, text: string) => {
    setCircles((prev) =>
      prev.map((c) =>
        c.id === circleId
          ? {
              ...c,
              messages: [
                ...c.messages,
                {
                  id: `cm-${Date.now()}`,
                  sender: username ? `@${username}` : "@pioneer",
                  text,
                  timestamp: "Just now",
                },
              ],
            }
          : c
      )
    );
  };

  // Wallet handlers
  const handleQuickPaymentTest = (
    amountPi: number,
    memo: string,
    paymentType: "test" | "card" = "test",
    itemId = "core-team-test"
  ) => {
    const safeAmount = Number(amountPi.toFixed(2));
    setPendingPayment({
      title: paymentType === "card" ? "Pioneer Card Renewal (0.20 π)" : "Pi Testnet Payment (1.00 π)",
      purpose: memo,
      amountPi: safeAmount,
      memo: `Eyeneka - ${paymentType === "card" ? "Card Renewal" : "Test Payment"}`,
      metadata: {
        type: paymentType,
        itemId,
        buyer: username || "pioneer",
      },
      escrowId: `${paymentType === "card" ? "CRD" : "TST"}-${Date.now().toString().slice(-5)}`,
      onComplete: ({ paymentId, txHash, escrowId }) => {
        setTransactions((prev) => [
          {
            id: `tx-${Date.now()}`,
            category: paymentType === "card" ? "Card" : "Test",
            type: paymentType === "card" ? "Card Renewal" : "Pi Testnet Payment",
            label: memo,
            amountPi,
            direction: "out",
            status: "Confirmed",
            timestamp: "Just now",
            dateIso: new Date().toISOString().slice(0, 10),
            escrowId,
            paymentId,
            txHash,
          },
          ...prev,
        ]);
        showToast(`Payment Complete in Pi Testnet (${txHash.slice(0, 12)}...)`);
      },
    });
  };

  const handleRecordAdSupport = () => {
    setTransactions((prev) => [
      {
        id: `tx-${Date.now()}`,
        category: "Ads",
        type: "Ad Support",
        label: "Pi.Ads.showAd · Ads Support Free Learning",
        amountPi: 0.0,
        direction: "in",
        timestamp: "Just now",
        dateIso: new Date().toISOString().slice(0, 10),
        escrowId: `ADS-${Date.now().toString().slice(-5)}`,
        txHash: `pi_ad_${Date.now().toString(16)}`,
      },
      ...prev,
    ]);
    showToast("Pi Ad recorded — Ads support free learning!");
  };

  // Law handlers
  const handleExportData = () => {
    const payload = {
      platform: "EYENEKA",
      pioneer: username ? `@${username}` : "Unconnected",
      trustScore,
      earnedSkills,
      certificates,
      lessons,
      gigs,
      circles,
      meds,
      childrenList,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `eyeneka-pioneer-${username || "session"}-data.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("Your Pioneer data archive has been downloaded.");
  };

  const handleDeleteMyData = () => {
    void logoutPiSession();
    localStorage.removeItem(STORAGE_KEY);
    setPiConnected(false);
    setInPiBrowser(false);
    setUsername("");
    setKycVerified(false);
    setKycTrustAwarded(false);
    setTrustScore(0);
    setAvailablePi(0);
    setEarnedMonthPi(0);
    setHealthScore(null);
    setCircleLeaderActive(false);
    setCertificates([]);
    setOfflineLessonIds([]);
    setGigs([]);
    setSelectedGigId(null);
    setResources([]);
    setChildrenList([]);
    setMeds([]);
    setPeerMessages([]);
    setCircles([]);
    setTransactions([]);
    setNotifications([]);
    setBlockedUsers([]);
    showToast("All real user data permanently deleted.");
  };

  const lockedEscrowPi = gigs
    .filter((g) => g.status === "Funds Locked" || g.status === "Proof Submitted" || g.status === "Disputed")
    .reduce((sum, g) => sum + g.pricePi, 0);

  const savedCirclesPi = transactions
    .filter((tx) => tx.type === "Circle Contribution")
    .reduce((sum, tx) => sum + tx.amountPi, 0);

  const feesPaidMonthPi = transactions.reduce(
    (sum, tx) => sum + (tx.feePi ?? 0),
    0
  );

  const totalEarnedByPioneersPi = transactions
    .filter((tx) => tx.type === "Gig Payout" && tx.direction === "in")
    .reduce((sum, tx) => sum + tx.amountPi, 0);

  const availableSkillOptions = Array.from(
    new Set([
      ...lessons.map((l) => l.skillUnlock),
      ...gigTemplates.map((t) => t.requiredSkill),
      ...gigs.map((g) => g.requiredSkill),
      ...earnedSkills,
    ])
  ).filter(Boolean);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#050507] text-slate-900">
      {/* Splash Screen with Uploaded Eyeneka Logo */}
      {showSplash && (
        <div
          role="dialog"
          aria-label="EYENEKA Welcome Splash"
          className="fixed inset-0 z-[60] bg-[#050507] text-white flex flex-col items-center justify-center p-6 text-center"
        >
          <div className="space-y-4 max-w-xs flex flex-col items-center">
            <img
              src="/assets/aistudio/eyeneka_logo_cutout_0b9ce129.png"
              alt="EYENEKA Logo"
              className="w-24 h-24 rounded-full bg-white object-contain p-1.5 shadow-2xl"
            />
            <h1 className="font-display text-3xl font-extrabold tracking-tight">EYENEKA</h1>
            <p className="text-xs font-medium text-[#FFC800]">
              Learn. Work. Earn. Care. Together.
            </p>
            <button
              type="button"
              onClick={() => setShowSplash(false)}
              className="mt-2 min-h-[40px] px-5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white"
            >
              Enter EYENEKA
            </button>
          </div>
        </div>
      )}

      <Header
        activeTab={activeTab}
        onTabChange={setActiveTab}
        piConnected={piConnected}
        connectingPi={connectingPi}
        kycVerified={kycVerified}
        username={username}
        trustScore={trustScore}
        language={language}
        unreadCount={unreadCount}
        onConnectPi={handleOpenPiConnect}
        onToggleNotifications={() => setNotifOpen((v) => !v)}
      />

      {/* Toast Feedback */}
      {toast && (
        <div className="fixed top-20 right-4 z-50 max-w-sm rounded-xl bg-white border border-slate-200 shadow-xl px-4 py-3 flex items-center gap-2.5 text-xs font-semibold text-slate-900">
          <CheckCircle2 className="w-4 h-4 text-[#16A34A] shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* Notifications Drawer */}
      {notifOpen && (
        <div className="fixed top-16 right-4 z-50 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden">
          <div className="px-4 py-3 bg-[#050507] text-white flex items-center justify-between">
            <span className="font-display font-bold text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              {notifications.length > 0 && (
                <button
                  type="button"
                  onClick={() =>
                    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
                  }
                  className="text-xs text-[#FFC800] hover:underline"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setNotifOpen(false)}
                className="p-1 text-slate-300 hover:text-white"
                aria-label="Close notifications"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                No notifications yet.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => {
                    setNotifications((prev) =>
                      prev.map((x) => (x.id === n.id ? { ...x, read: true } : x))
                    );
                    setActiveTab(n.targetTab);
                    setNotifOpen(false);
                  }}
                  className={`w-full text-left p-4 hover:bg-slate-50 transition-colors ${
                    n.read ? "opacity-75" : "bg-[#7C3AED]/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-slate-900">{n.title}</span>
                    <span className="text-slate-400">{n.timestamp}</span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600">{n.detail}</p>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-safe-nav">
        {activeTab === "home" && (
          <HomeView
            username={username}
            piConnected={piConnected}
            kycVerified={kycVerified}
            isAdmin={isAdmin}
            trustScore={trustScore}
            language={language}
            lowDataMode={lowDataMode}
            textScale={textScale}
            offlineLessonIds={offlineLessonIds}
            earnedSkills={earnedSkills}
            certificates={certificates}
            gigs={gigs}
            lessons={lessons}
            gigTemplates={gigTemplates}
            guides={guides}
            circleTemplates={circleTemplates}
            circles={circles}
            earnedMonthPi={earnedMonthPi}
            healthScore={healthScore}
            onToggleAdmin={() => setIsAdmin((v) => !v)}
            onPublishOfficialProduct={handlePublishOfficialProduct}
            onLanguageChange={setLanguage}
            onToggleLowData={() => setLowDataMode((v) => !v)}
            onTextScaleChange={setTextScale}
            onNavigate={setActiveTab}
            onSelectLesson={(id) => setSelectedLessonId(id)}
            onSelectGig={(id) => setSelectedGigId(id)}
            onConnectPi={handleOpenPiConnect}
            onRecordAdSupport={handleRecordAdSupport}
          />
        )}

        {activeTab === "learn" && (
          <LearnView
            lessons={lessons}
            selectedLessonId={selectedLessonId}
            earnedSkills={earnedSkills}
            certificates={certificates}
            offlineLessonIds={offlineLessonIds}
            language={language}
            username={username}
            lowDataMode={lowDataMode}
            isAdmin={isAdmin}
            onSelectLesson={setSelectedLessonId}
            onPublishLesson={handlePublishLesson}
            onUpdateLesson={handleUpdateLesson}
            onDeleteLesson={handleDeleteLesson}
            onToggleOffline={handleToggleOffline}
            onPassQuiz={handlePassQuiz}
            onMintCertificate={handleMintCertificate}
            onRecordAdSupport={handleRecordAdSupport}
          />
        )}

        {activeTab === "work" && (
          <WorkView
            gigs={gigs.filter((g) => !blockedUsers.includes(g.buyerHandle))}
            gigTemplates={gigTemplates}
            availableSkillOptions={availableSkillOptions}
            selectedGigId={selectedGigId}
            earnedSkills={earnedSkills}
            username={username}
            trustScore={trustScore}
            kycVerified={kycVerified}
            isAdmin={isAdmin}
            onSelectGig={setSelectedGigId}
            onCreateGig={handleCreateGig}
            onUpdateTemplate={handleUpdateGigTemplate}
            onDeleteTemplate={handleDeleteGigTemplate}
            onLockEscrow={handleLockEscrow}
            onSubmitProof={handleSubmitProof}
            onReleaseEscrow={handleReleaseEscrow}
            onAdvanceDispute={handleAdvanceDispute}
            onSendMessage={handleSendGigMessage}
            onReportGig={handleReportGig}
            onGoToLearn={() => setActiveTab("learn")}
          />
        )}

        {activeTab === "care" && (
          <CareView
            guides={guides}
            resources={resources}
            childrenList={childrenList}
            meds={meds}
            peerMessages={peerMessages}
            username={username}
            lowDataMode={lowDataMode}
            isAdmin={isAdmin}
            onPublishGuide={handlePublishGuide}
            onUpdateGuide={handleUpdateGuide}
            onDeleteGuide={handleDeleteGuide}
            onIncrementGuideView={handleIncrementGuideView}
            onAddResource={handleAddResource}
            onRateResource={handleRateResource}
            onRegisterCarePartner={handleRegisterCarePartner}
            onApprovePartner={handleApprovePartner}
            onAddChild={handleAddChild}
            onToggleVaccine={handleToggleVaccine}
            onToggleMedTaken={handleToggleMedTaken}
            onAddMed={handleAddMed}
            onSendPeerMessage={handleSendPeerMessage}
            onRecordHealthCheck={handleRecordHealthCheck}
          />
        )}

        {activeTab === "save" && (
          <SaveView
            circles={circles}
            circleTemplates={circleTemplates}
            username={username}
            circleLeaderActive={circleLeaderActive}
            isAdmin={isAdmin}
            onUpgradeCircleLeader={handleUpgradeCircleLeader}
            onCancelCircleLeader={handleCancelCircleLeader}
            onCreateCircle={handleCreateCircle}
            onUpdateCircleTemplate={handleUpdateCircleTemplate}
            onDeleteCircleTemplate={handleDeleteCircleTemplate}
            onJoinCircle={handleJoinCircle}
            onContributeCycle={handleContributeCycle}
            onMarkLateDefault={handleMarkLateDefault}
            onToggleReminder={handleToggleReminder}
            onVoteFoodPool={handleVoteFoodPool}
            onCreateFoodRequest={handleCreateFoodRequest}
            onSendCircleMessage={handleSendCircleMessage}
          />
        )}

        {activeTab === "wallet" && (
          <WalletView
            piConnected={piConnected}
            inPiBrowser={inPiBrowser}
            kycVerified={kycVerified}
            username={username}
            availablePi={availablePi}
            lockedEscrowPi={lockedEscrowPi}
            earnedMonthPi={earnedMonthPi}
            savedCirclesPi={savedCirclesPi}
            feesPaidMonthPi={feesPaidMonthPi}
            totalEarnedByPioneersPi={totalEarnedByPioneersPi}
            transactions={transactions}
            onConnectPi={handleOpenPiConnect}
            onQuickPaymentTest={handleQuickPaymentTest}
            onRecordAdSupport={handleRecordAdSupport}
          />
        )}

        {activeTab === "law" && (
          <LawView
            blockedUsers={blockedUsers}
            onBlockUser={(h) =>
              setBlockedUsers((prev) => (prev.includes(h) ? prev : [...prev, h]))
            }
            onUnblockUser={(h) =>
              setBlockedUsers((prev) => prev.filter((u) => u !== h))
            }
            onExportData={handleExportData}
            onDeleteMyData={handleDeleteMyData}
          />
        )}
      </main>

      {/* Pi Auth & Payment Modals */}
      <PiAuthModal
        open={authModalOpen}
        initialError={authError}
        onClose={() => {
          setAuthModalOpen(false);
          setAuthError(null);
        }}
        onAuthenticated={handleAuthenticated}
      />
      <PiPaymentModal
        payment={pendingPayment}
        piConnected={piConnected && Boolean(username)}
        onEnsureConnected={handleEnsurePiConnected}
        onClose={() => setPendingPayment(null)}
      />

      <Footer
        piConnected={piConnected && Boolean(username)}
        onEnsureConnected={handleEnsurePiConnected}
        onTestPaymentComplete={(receipt) => {
          setTransactions((prev) => [
            {
              id: `tx-${Date.now()}`,
              category: "Test",
              type: "Pi Testnet Payment",
              label: "Eyeneka - Test Payment (1 Pi)",
              amountPi: receipt.amount,
              direction: "out",
              status: "Confirmed",
              timestamp: "Just now",
              dateIso: new Date().toISOString().slice(0, 10),
              escrowId: `TST-${Date.now().toString().slice(-5)}`,
              paymentId: receipt.paymentId,
              txHash: receipt.txHash,
            },
            ...prev,
          ]);
          showToast(`Test Payment Complete - ${receipt.paymentId}`);
        }}
      />

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} language={language} />
    </div>
  );
}
