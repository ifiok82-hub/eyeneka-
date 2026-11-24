export interface LegalDocument {
  id: string;
  title: string;
  updated: string;
  sections: { heading: string; body: string }[];
}

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: "tos",
    title: "Terms of Service",
    updated: "2026-11",
    sections: [
      {
        heading: "1. Platform Purpose & Operator",
        body: "EYENEKA is a decentralized, global, borderless people-utility platform operated by EYENEKA. It connects Pi Pioneers to skills education, verified micro-gig escrow work, everyday health navigation, and transparent rotating savings circles.",
      },
      {
        heading: "2. Pi-Only Ecosystem Rule",
        body: "All platform fees, gig escrow payments, certificate issuance, and savings circle contributions use Pi Coin exclusively via official Pi SDK v2.0 Pi.createPayment inside Pi Browser. Off-app payments, custom tokens, and Pi-to-fiat solicitation are strictly prohibited.",
      },
      {
        heading: "3. People Utility Scope (Not a Store)",
        body: "EYENEKA is not an e-commerce store and does not sell physical retail goods, eSIMs, VPNs, virtual cards, phone numbers, or AI credit packs. Every transaction corresponds to real human work, skill certification, care partner verification, or peer rotating savings.",
      },
    ],
  },
  {
    id: "privacy",
    title: "Privacy Policy",
    updated: "2026-11",
    sections: [
      {
        heading: "1. User Owns Data",
        body: "Pioneers authenticate with Pi UID and Pi username—no external email address is required. You retain full ownership of your lessons, certificates, gigs, care entries, and savings records.",
      },
      {
        heading: "2. Encryption & Permanent Deletion",
        body: "EYENEKA never sells or shares personal data with third parties. Your personal records can be exported as JSON or permanently deleted at any time via Law > Delete My Data.",
      },
    ],
  },
  {
    id: "worker",
    title: "Gig Worker Agreement",
    updated: "2026-11",
    sections: [
      {
        heading: "1. Verified Skill Certification Requirement",
        body: "Workers must pass the corresponding free Skill Test and hold a Verified Certificate in that skill before applying to skill-gated micro-gigs. No certificate = no gig.",
      },
      {
        heading: "2. Authentic Deliverable Proof & 8% Escrow Fee",
        body: "Workers submit proof only after completing every deliverable checklist item. Upon buyer approval, 92% of the gig Pi price settles to the worker and 8% sustains EYENEKA Escrow & Mediation infrastructure.",
      },
    ],
  },
  {
    id: "escrow",
    title: "Buyer Protection & Escrow Policy",
    updated: "2026-11",
    sections: [
      {
        heading: "1. Smart Contract Escrow Custody",
        body: "Buyers lock the full gig Pi amount (0.2 – 5.0 π) into Pi Smart Contract Escrow before work begins. EYENEKA does not hold user Pi except in escrow for active gigs. Real Pi KYC verification is required to post gigs over 1.0 π.",
      },
      {
        heading: "2. 48-Hour Inspection & Auto-Release",
        body: "After proof is submitted, the buyer has 48 hours to inspect and release Pi or open mediation. Escrow releases only on deliverable proof + buyer approval or a final dispute decision.",
      },
    ],
  },
  {
    id: "dispute",
    title: "Dispute Policy",
    updated: "2026-11",
    sections: [
      {
        heading: "3-Step Community Mediation",
        body: "Step 1: Structured direct resolution inside Protected Gig Chat. Step 2: Independent Community Mediator review of checklist and uploaded proof. Step 3: Final Escrow release, split, or refund decision.",
      },
    ],
  },
  {
    id: "health",
    title: "Health Disclaimer",
    updated: "2026-11",
    sections: [
      {
        heading: "Education & Navigation Only",
        body: "EYENEKA Care provides Red/Yellow/Green symptom navigation, user-published first aid guides, community-rated care listings, personal medication/vaccine logs, and peer support. It is NOT medical diagnosis, prescription, or professional therapy. Always seek qualified clinical care.",
      },
    ],
  },
  {
    id: "savings",
    title: "Savings Circle Rules",
    updated: "2026-11",
    sections: [
      {
        heading: "Zero-Interest Rotating Savings",
        body: "Circles operate strictly as transparent, peer-funded rotating savings pools (5–20 members, 0.5–5.0 π per cycle) with zero interest, zero lending, and zero investment return promises. Real defaults affect Trust Score.",
      },
      {
        heading: "Circle Leader Plan & Emergency Food Pool",
        body: "Free Pioneers may run or join 1 circle. Circle Leader (0.5 π/month) unlocks managing up to 3 circles, auto-reminders, and ledger CSV export—cancel anytime with no refund promise beyond the current month. Optional Emergency Food Pools disburse only on member vote.",
      },
    ],
  },
  {
    id: "profit-fees",
    title: "Profit & Fees Policy",
    updated: "2026-11",
    sections: [
      {
        heading: "1. Real Pi Fees Only — Zero Hidden Charges",
        body: "All fees in Pi only. No hidden fees. Every fee is displayed clearly before payment. No interest, no staking, and no investment returns exist on EYENEKA.",
      },
      {
        heading: "2. All 6 Revenue Streams",
        body: "• Gig Escrow Fee (8%): Charged only on real completed gigs (e.g., 1.50 π - 0.12 π fee = 1.38 π worker payout).\n• Verified Certificates (0.10 – 0.50 π): Charged only when a Pioneer mints a real Verified Certificate after passing a free skill test.\n• Featured Gig Boost (0.20 π / 24h): Optional boost for real gigs.\n• Circle Leader Premium (0.50 π / month): Unlocks 3 circles, auto-reminders, and CSV export.\n• Pi Ads: Official Pi.Ads.showAd in Home and Learn — Ads support free learning.\n• Verified Care Partner Listing (0.50 π / month): Applied only after credential document review and approval.",
      },
      {
        heading: "3. Escrow Custody & Official Starter Products",
        body: "EYENEKA does not hold user Pi except in escrow for active gigs. Escrow releases only on proof + approval or dispute decision. Starter products are published by EYENEKA Official. No fake user activity is shown.",
      },
    ],
  },
  {
    id: "id-card",
    title: "ID Card Policy",
    updated: "2026-11",
    sections: [
      {
        heading: "1. Pi KYC & Credential Verification",
        body: "Identity verification for high-value gigs (> 1.0 π) relies exclusively on official Pi Network KYC status and Pioneer @username. EYENEKA never collects or stores government national ID numbers for general browsing.",
      },
      {
        heading: "2. Care Partner Document Uploads",
        body: "Verification documents uploaded voluntarily by Care Partner applicants are used strictly to review clinic, pharmacy, or community health worker credentials before activating a Verified badge, and are deleted upon account data removal.",
      },
    ],
  },
];
