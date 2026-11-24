export type TabKey = "home" | "learn" | "work" | "care" | "save" | "wallet" | "law";

export type LanguageName =
  | "English"
  | "French"
  | "Spanish"
  | "Portuguese"
  | "Hindi"
  | "Indonesian"
  | "Arabic"
  | "Swahili"
  | "Yoruba"
  | "Hausa"
  | "Igbo"
  | "Pidgin";

export type TextScale = "normal" | "lg" | "xl";

export type SkillCategory =
  | "AI Survival"
  | "Digital Work"
  | "Money Skills"
  | "Food & Life"
  | "Health Literacy";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
}

export interface Lesson {
  id: string;
  title: string;
  category: SkillCategory;
  skillUnlock: string;
  durationMin: number;
  certificateFeePi: number;
  summary: string;
  creatorHandle: string;
  publishedAt: string;
  sections: { heading: string; body: string }[];
  quiz: QuizQuestion[];
}

export type GigCategory = "Remote Digital" | "Local Help" | "Community";

export type EscrowStatus =
  | "Open"
  | "Applied"
  | "Funds Locked"
  | "Proof Submitted"
  | "Dispute"
  | "Released";

export interface GigMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  flagged?: boolean;
}

export interface Gig {
  id: string;
  title: string;
  category: GigCategory;
  requiredSkill: string;
  description: string;
  deadline: string;
  pricePi: number;
  buyerHandle: string;
  buyerKyc: boolean;
  buyerTrustScore: number;
  checklist: string[];
  status: EscrowStatus;
  escrowId?: string;
  featured?: boolean;
  featuredUntil?: string;
  disputeStep?: 1 | 2 | 3;
  disputeReason?: string;
  proofNote?: string;
  proofFileName?: string;
  proofImageDataUrl?: string;
  proofCheckedItems?: number[];
  workerRating?: number;
  buyerReview?: string;
  messages: GigMessage[];
  reported?: boolean;
}

export interface FirstAidGuide {
  id: string;
  title: string;
  urgency: "Urgent Action" | "Careful Monitoring";
  summary: string;
  imageUrl?: string;
  publishedBy: string;
  steps: string[];
  seekHelpWhen: string;
}

export interface CareResource {
  id: string;
  name: string;
  type: "Clinic" | "Pharmacy" | "Community Health Worker";
  areaNote: string;
  hours: string;
  rating: number;
  reviewCount: number;
  addedBy: string;
  verifiedPartner?: boolean;
  approvalStatus?: "Community" | "Pending Review" | "Verified";
  documentName?: string;
}

export interface ChildTracker {
  id: string;
  name: string;
  ageMonths: number;
  completedVaccines: string[];
}

export interface MedicineReminder {
  id: string;
  label: string;
  dosageNote: string;
  timeOfDay: string;
  takenToday: boolean;
}

export interface PeerListenerMessage {
  id: string;
  sender: string;
  role: "Volunteer Listener" | "Pioneer";
  text: string;
  timestamp: string;
}

export interface CircleMember {
  handle: string;
  trustScore: number;
  contributedThisCycle: boolean;
  lateFlag: boolean;
  payoutPosition: number;
}

export interface FoodPoolRequest {
  id: string;
  requester: string;
  reason: string;
  amountPi: number;
  votesFor: number;
  votesNeeded: number;
  approved: boolean;
  userVoted?: boolean;
}

export interface CircleMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
}

export interface SavingsCircle {
  id: string;
  name: string;
  contributionPi: number;
  cycle: "Weekly" | "Monthly";
  payoutMode: "Rotation" | "Vote";
  maxMembers: number;
  currentCycle: number;
  nextPayoutDate: string;
  nextRecipient: string;
  emergencyFoodPoolPi: number;
  hasFoodPool: boolean;
  joined: boolean;
  reminderEnabled: boolean;
  members: CircleMember[];
  foodRequests: FoodPoolRequest[];
  messages: CircleMessage[];
}

export type TxCategory =
  | "Gigs"
  | "Certificates"
  | "Boosts"
  | "Circles"
  | "Care Listing"
  | "Ads";

export interface WalletTransaction {
  id: string;
  category: TxCategory;
  type:
    | "Gig Payout"
    | "Escrow Lock"
    | "Escrow Fee (8%)"
    | "Certificate Mint"
    | "Featured Gig Boost"
    | "Circle Contribution"
    | "Circle Leader Premium"
    | "Care Partner Listing"
    | "Ad Support";
  label: string;
  amountPi: number;
  feePi?: number;
  direction: "in" | "out" | "locked";
  timestamp: string;
  dateIso: string;
  escrowId: string;
  txHash: string;
}

export interface CertificateRecord {
  id: string;
  lessonId: string;
  title: string;
  skillUnlock: string;
  issuedAt: string;
  txHash: string;
  feePi: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  detail: string;
  timestamp: string;
  read: boolean;
  targetTab: TabKey;
}

export interface PendingPiPayment {
  title: string;
  purpose: string;
  amountPi: number;
  breakdown?: { label: string; amountPi: number }[];
  memo: string;
  metadata: Record<string, string | number | boolean>;
  escrowId?: string;
  onComplete: (receipt: { paymentId: string; txHash: string; escrowId: string }) => void;
}
