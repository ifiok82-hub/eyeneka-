import { CircleTemplate, FirstAidGuide, GigTemplate, Lesson } from "../types";

export const TODAY_ISO = new Date().toISOString().slice(0, 10);

export const OFFICIAL_STARTER_LESSONS: Lesson[] = [
  // A. AI SURVIVAL (3)
  {
    id: "starter-lesson-1",
    title: "How To Use AI To Write A Better CV In 15 Minutes",
    category: "AI Survival",
    skillUnlock: "CV Writing & AI Editing",
    durationMin: 15,
    certificateFeePi: 0.3,
    summary:
      "Learn how to turn your real work experience, school projects, and community volunteering into a clear, truthful CV using AI without inventing fake claims. This 7-step workflow helps you format cleanly for clients and employers worldwide.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      {
        heading: "Step 1: Gather Your Real Facts First",
        body: "Write down your actual jobs, volunteer tasks, tools you use, languages you speak, and real results before opening any AI tool. Never let AI invent employers, degrees, or numbers you did not achieve.",
      },
      {
        heading: "Step 2: Choose Clear Role Keywords",
        body: "Read the gig or job description carefully and highlight the 5 to 7 exact skill words requested, such as spreadsheet cleanup, customer support, or proofreading.",
      },
      {
        heading: "Step 3: Prompt AI With Role, Facts, and Format",
        body: "Ask AI to rewrite your real bullet points into concise action-plus-result sentences without jargon. Tell AI explicitly: 'Use only the facts I provided and keep every line under 18 words.'",
      },
      {
        heading: "Step 4: Write a 3-Sentence Professional Summary",
        body: "Combine your strongest certified skill, years or types of practical tasks completed, and reliability habit (such as on-time delivery) at the top of your CV.",
      },
      {
        heading: "Step 5: Structure for Easy Reading (ATS-Friendly)",
        body: "Use simple headings—Summary, Skills, Work Experience, Certificates—with plain text and consistent dates. Avoid complex tables or graphics that automated scanners cannot read.",
      },
      {
        heading: "Step 6: Verify Every Single Line",
        body: "Read the generated CV aloud from top to bottom. Remove exaggerated words like 'world-class' and double-check that every skill listed is one you can genuinely demonstrate.",
      },
      {
        heading: "Step 7: Export Cleanly and Tailor Per Application",
        body: "Save a master copy and a clean PDF version. Before applying to a gig or role, adjust the top 3 skills to match what that specific client needs.",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "What should you always do before asking AI to draft your CV?",
        options: [
          "Gather your real tasks, skills, and results first",
          "Ask AI to invent impressive company titles",
          "Leave your skills section completely blank",
        ],
        correctIndex: 0,
      },
      {
        id: "q-2",
        question: "Why should you tell AI 'Use only the facts I provided'?",
        options: [
          "To make the CV file larger",
          "To prevent AI from fabricating fake qualifications or history",
          "To add decorative colors automatically",
        ],
        correctIndex: 1,
      },
      {
        id: "q-3",
        question: "Which layout works best for automated CV scanners (ATS)?",
        options: [
          "Complex multi-column graphics and icons",
          "Clear standard headings and plain structured text",
          "Handwritten notes photographed in low light",
        ],
        correctIndex: 1,
      },
      {
        id: "q-4",
        question: "What belongs in the 3-sentence summary at the top of a CV?",
        options: [
          "Your favorite hobbies only",
          "Your core verified skill, practical experience, and work reliability",
          "Your full home street address and private PIN",
        ],
        correctIndex: 1,
      },
      {
        id: "q-5",
        question: "What is the final mandatory check before sending an AI-assisted CV?",
        options: [
          "Send immediately without reading it",
          "Verify every claim is truthful and matches skills you can prove",
          "Add buzzwords you do not understand",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "starter-lesson-2",
    title: "Prompting Basics: Ask AI Clearly To Get Good Work",
    category: "AI Survival",
    skillUnlock: "Prompting & AI Basics",
    durationMin: 12,
    certificateFeePi: 0.3,
    summary:
      "Clear instructions turn AI from a guessing machine into a reliable daily work helper. Follow this 6-step prompting formula to get accurate, usable drafts on your first or second try.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      {
        heading: "Step 1: Define the Exact Task Goal",
        body: "Start by stating what you want created in one plain sentence, such as summarizing meeting notes, drafting polite support replies, or checking grammar.",
      },
      {
        heading: "Step 2: Give Useful Context",
        body: "Explain who the text is for, what tone is appropriate (calm, polite, concise), and any background facts AI needs so it does not guess blindly.",
      },
      {
        heading: "Step 3: Specify the Output Format",
        body: "Tell AI exactly how to organize the response: numbered steps, a 3-column table, 5 short captions, or a single-page bullet summary.",
      },
      {
        heading: "Step 4: Set Clear Guardrails and Constraints",
        body: "State word limits, reading level (no jargon), and what to avoid (no fake statistics, no off-topic filler, no false promises).",
      },
      {
        heading: "Step 5: Provide One Short Example",
        body: "When formatting matters, paste one small sample of the style you want. AI matches patterns far better when shown a real example.",
      },
      {
        heading: "Step 6: Iterate and Fact-Check",
        body: "Treat AI output as a first draft. Ask follow-up refinements ('Make point 3 shorter') and manually verify all dates, names, prices, and facts.",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "Why does giving AI a specific output format help?",
        options: [
          "It guarantees zero electricity usage",
          "It structures the draft directly into the layout you need",
          "It removes the need to read the answer",
        ],
        correctIndex: 1,
      },
      {
        id: "q-2",
        question: "What is an example of a helpful prompt guardrail?",
        options: [
          "Write as much filler as possible",
          "Keep under 150 words, use plain English, and do not invent statistics",
          "Use complicated technical jargon",
        ],
        correctIndex: 1,
      },
      {
        id: "q-3",
        question: "How can you quickly improve an AI draft that looks too robotic?",
        options: [
          "Include one short human example of the tone you want",
          "Delete your instructions and only type one word",
          "Repeat the exact same vague prompt 10 times",
        ],
        correctIndex: 0,
      },
      {
        id: "q-4",
        question: "How should you treat every AI-generated response?",
        options: [
          "As final verified truth without checking",
          "As a helpful draft that you inspect and fact-check yourself",
          "As legal or medical advice",
        ],
        correctIndex: 1,
      },
      {
        id: "q-5",
        question: "What privacy rule applies when prompting public AI tools?",
        options: [
          "Always paste passwords and Pi wallet passphrases",
          "Never paste private keys, passphrases, or sensitive identity documents",
          "Share client bank credentials in the prompt",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "starter-lesson-3",
    title: "Use AI To Start A Small Service Business",
    category: "AI Survival",
    skillUnlock: "AI Service Operations",
    durationMin: 15,
    certificateFeePi: 0.3,
    summary:
      "Turn practical digital skills into a repeatable micro-service business using AI to speed up planning, checklists, and quality assurance. Built strictly around real human service delivery in Pi.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      {
        heading: "Step 1: Pick One Specific Service Problem",
        body: "Focus on one concrete problem small organizations or busy people face—such as CV rewrites, spreadsheet cleanup, proofreading, or customer reply packs.",
      },
      {
        heading: "Step 2: Define Clear Scope and Deliverables",
        body: "Write down exactly what the buyer gets (for example: 100 rows cleaned + duplicate log) and what is out of scope so expectations stay clear.",
      },
      {
        heading: "Step 3: Build a Repeatable Quality Checklist",
        body: "Use AI to help design a step-by-step verification checklist you run on every single order before submitting proof in escrow.",
      },
      {
        heading: "Step 4: Estimate Your Real Time and Pi Price",
        body: "Track how many minutes a task takes including revisions, and set a fair Pi price knowing EYENEKA's 8% escrow fee supports protection and mediation.",
      },
      {
        heading: "Step 5: Draft Clear, Honest Service Descriptions",
        body: "Ask AI to polish your gig description for clarity—avoiding exaggerated promises—so buyers know timelines, formats, and revision rules upfront.",
      },
      {
        heading: "Step 6: Create Polite Client Communication Templates",
        body: "Prepare reusable, respectful messages for confirming instructions, asking clarifying questions, and delivering finished work inside EYENEKA chat.",
      },
      {
        heading: "Step 7: Keep Simple Bookkeeping",
        body: "Log every completed gig, Pi received after fees, and hours spent so you learn which service packages earn reliably and smoothly.",
      },
      {
        heading: "Step 8: Improve From Real Client Feedback",
        body: "After each real escrow completion, review any buyer notes to refine your checklist and speed without cutting corners on accuracy.",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "What makes a small service offering easy for buyers to trust?",
        options: [
          "Vague promises with no deliverable list",
          "Clear scope, exact deliverables, and realistic deadlines",
          "Asking for payment outside escrow",
        ],
        correctIndex: 1,
      },
      {
        id: "q-2",
        question: "How should AI be used inside a service business?",
        options: [
          "To help organize checklists, polish clarity, and speed up drafting under human review",
          "To impersonate someone else",
          "To skip verifying finished work",
        ],
        correctIndex: 0,
      },
      {
        id: "q-3",
        question: "Why log hours spent alongside Pi earned?",
        options: [
          "To price future gigs fairly and avoid underpricing your time",
          "To invent fake completion statistics",
          "It has no use at all",
        ],
        correctIndex: 0,
      },
      {
        id: "q-4",
        question: "Where must all EYENEKA gig agreements and payouts happen?",
        options: [
          "In external private chat apps",
          "Inside EYENEKA protected gig chat and Pi Smart Contract Escrow",
          "Via unverified gift cards",
        ],
        correctIndex: 1,
      },
      {
        id: "q-5",
        question: "What should happen before you click 'Submit Proof' on any client order?",
        options: [
          "Run through your full quality checklist to confirm zero missing items",
          "Submit empty files and hope the buyer approves",
          "Ask the buyer for their Pi passphrase",
        ],
        correctIndex: 0,
      },
    ],
  },

  // B. DIGITAL WORK (3)
  {
    id: "starter-lesson-4",
    title: "Virtual Assistant Basics: Email, Calendar, Data Entry",
    category: "Digital Work",
    skillUnlock: "Virtual Assistant",
    durationMin: 15,
    certificateFeePi: 0.3,
    summary:
      "Master the daily routines of a trustworthy Virtual Assistant: inbox triage, calendar scheduling across time zones, accurate data entry, and concise handover reporting.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      {
        heading: "Step 1: Confirm Task Scope Before Starting",
        body: "Always clarify access permissions, working hours, priority rules, and expected report format inside gig chat before logging time.",
      },
      {
        heading: "Step 2: Organize Inbox by Priority Labels",
        body: "Sort incoming messages into clear folders—Urgent Today, Waiting Reply, Routine, Archive—and draft polite replies without sending unauthorized commitments.",
      },
      {
        heading: "Step 3: Check Time Zones Twice on Calendar Invites",
        body: "Whenever scheduling across borders, confirm both UTC and the client's local time zone, and include meeting links plus a short agenda.",
      },
      {
        heading: "Step 4: Keep Data Entry Consistent",
        body: "Follow one standard format for dates (YYYY-MM-DD), names, and categories so spreadsheets can be filtered and sorted cleanly.",
      },
      {
        heading: "Step 5: Protect Client Confidentiality",
        body: "Never copy client contact lists, private documents, or internal notes onto personal public drives or share them with outside parties.",
      },
      {
        heading: "Step 6: Track Tasks With a Clear Time Log",
        body: "Record start/end times and exact tasks completed during a 2-hour block so the client sees transparent progress.",
      },
      {
        heading: "Step 7: Spot-Check Before Handover",
        body: "Review calendar links, spreadsheet rows, and drafted replies for typos or missing attachments before finishing your shift.",
      },
      {
        heading: "Step 8: Send a Concise End-of-Shift Report",
        body: "Deliver a clean summary listing Completed Tasks, Open Follow-ups, and Next Recommended Actions alongside your proof submission.",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "What is the safest way to schedule meetings for global clients?",
        options: [
          "Guess the time difference",
          "Double-check both UTC and each participant's local time zone",
          "Omit time zones from the invite",
        ],
        correctIndex: 1,
      },
      {
        id: "q-2",
        question: "What should a Virtual Assistant avoid doing without explicit client approval?",
        options: [
          "Organizing folders neatly",
          "Sending binding financial or legal promises on a client's behalf",
          "Keeping a clear task time log",
        ],
        correctIndex: 1,
      },
      {
        id: "q-3",
        question: "Why use consistent date formats like YYYY-MM-DD during data entry?",
        options: [
          "So spreadsheets sort and filter accurately without errors",
          "Because numbers look decorative",
          "It does not matter what format is used per row",
        ],
        correctIndex: 0,
      },
      {
        id: "q-4",
        question: "What belongs in an End-of-Shift Handover Report?",
        options: [
          "Unrelated personal stories",
          "Tasks completed, time log, and items still awaiting reply",
          "Requests for payment outside Pi Escrow",
        ],
        correctIndex: 1,
      },
      {
        id: "q-5",
        question: "How should client files and contact lists be treated?",
        options: [
          "Posted publicly as portfolio samples without permission",
          "Kept strictly confidential and only stored as instructed",
          "Shared with unrelated third parties",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "starter-lesson-5",
    title: "Data Entry + QA: How To Deliver Error-Free Work",
    category: "Digital Work",
    skillUnlock: "Data Entry & QA",
    durationMin: 12,
    certificateFeePi: 0.3,
    summary:
      "Clean, reliable spreadsheets save buyers hours of rework. Learn a practical 6-step Data Entry and Quality Assurance method covering formatting, duplicate removal, and final verification.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      {
        heading: "Step 1: Back Up the Original File First",
        body: "Always duplicate the client's raw file before editing a single cell so you can compare against the original anytime.",
      },
      {
        heading: "Step 2: Standardize Column Headers and Types",
        body: "Ensure each column holds one kind of value only—for example, keep numeric quantities separate from text units.",
      },
      {
        heading: "Step 3: Trim Extra Spaces and Fix Casing",
        body: "Remove leading/trailing spaces and apply consistent capitalization (Title Case for names, lowercase for handles or emails) across all rows.",
      },
      {
        heading: "Step 4: Find and Resolve Duplicates Carefully",
        body: "Sort or filter for repeated entries, verify whether rows are true duplicates or distinct items, and note every removed duplicate in a QA log.",
      },
      {
        heading: "Step 5: Validate Spelling and Missing Fields",
        body: "Run spell-check on text columns and highlight blank required cells so nothing important goes unnoticed.",
      },
      {
        heading: "Step 6: Run a 10% Random Row Audit",
        body: "Pick at least 10 rows across top, middle, and bottom of the sheet and compare every character against the source before exporting.",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "What should be your very first step before cleaning a client spreadsheet?",
        options: [
          "Delete random rows immediately",
          "Save an untouched backup copy of the original file",
          "Rename every column to numbers",
        ],
        correctIndex: 1,
      },
      {
        id: "q-2",
        question: "Why should you keep units out of numeric price/quantity cells?",
        options: [
          "So spreadsheet formulas (SUM, AVERAGE) work properly",
          "To confuse the buyer",
          "Because spreadsheets cannot store numbers",
        ],
        correctIndex: 0,
      },
      {
        id: "q-3",
        question: "What is the safest practice when removing duplicate rows?",
        options: [
          "Verify they are actual duplicates and note counts removed in your handover",
          "Delete any row that looks similar without checking",
          "Leave duplicate errors untouched",
        ],
        correctIndex: 0,
      },
      {
        id: "q-4",
        question: "What does a 10% Random Row Audit catch?",
        options: [
          "Shifted columns, truncated text, or missed typos before submission",
          "Nothing useful",
          "Hardware battery level",
        ],
        correctIndex: 0,
      },
      {
        id: "q-5",
        question: "What should you do if a source row has unreadable or missing data?",
        options: [
          "Invent plausible data to fill the cell",
          "Flag the missing cell clearly for the buyer instead of guessing",
          "Delete the entire spreadsheet",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "starter-lesson-6",
    title: "Social Media Management For Beginners",
    category: "Digital Work",
    skillUnlock: "Social Media Management",
    durationMin: 14,
    certificateFeePi: 0.3,
    summary:
      "Learn how to plan honest, engaging 5-post content packs with clear hooks, practical value, accurate hashtags, and visual concepts for real community organizations or businesses.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      {
        heading: "Step 1: Understand the Audience and Goal",
        body: "Before drafting posts, confirm who the audience is and whether the goal is teaching, community announcements, or product/service clarity.",
      },
      {
        heading: "Step 2: Balance Value Over Pure Promotion",
        body: "Use a helpful mix—practical tips, behind-the-scenes work proof, and clear calls to action—rather than repeating sales slogans.",
      },
      {
        heading: "Step 3: Write a Clear First Line (Hook)",
        body: "Open each caption with one concrete question or helpful insight in plain language so readers stop scrolling naturally.",
      },
      {
        heading: "Step 4: Keep Captions Readable and Honest",
        body: "Use short paragraphs, accurate descriptions, and zero clickbait or misleading claims.",
      },
      {
        heading: "Step 5: Pair Relevant Hashtag Sets",
        body: "Select 5 to 10 accurate topic hashtags per post instead of pasting unrelated trending tags.",
      },
      {
        heading: "Step 6: Describe Clear Visual Ideas",
        body: "For each post, write a simple image or short-video concept (subjects, lighting, text overlay) a creator can actually shoot or design.",
      },
      {
        heading: "Step 7: Deliver an Organized Content Sheet",
        body: "Package all 5 captions, hashtag sets, and image notes in a clean document or spreadsheet ready for easy copy-pasting.",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "What makes the first line of a social post effective?",
        options: [
          "A clear, relevant hook or practical tip for the audience",
          "Twenty unrelated emojis",
          "Misleading clickbait",
        ],
        correctIndex: 0,
      },
      {
        id: "q-2",
        question: "How many hashtags work best when preparing a clean post pack?",
        options: [
          "50 unrelated trending tags",
          "5 to 10 relevant topic hashtags tailored to the post",
          "Zero organization",
        ],
        correctIndex: 1,
      },
      {
        id: "q-3",
        question: "Why include a visual image idea with every caption?",
        options: [
          "So the post has a clear, practical visual concept ready to produce",
          "To increase word count artificially",
          "Visuals do not matter on social platforms",
        ],
        correctIndex: 0,
      },
      {
        id: "q-4",
        question: "Which content rule builds long-term audience trust?",
        options: [
          "Inventing fake customer testimonials",
          "Honest descriptions, helpful tips, and real work stories",
          "Copying competitors word-for-word",
        ],
        correctIndex: 1,
      },
      {
        id: "q-5",
        question: "How should a 5-Post Social Pack be delivered in escrow?",
        options: [
          "Cleanly organized with captions, hashtags, and image ideas clearly numbered 1 to 5",
          "As one unformatted block of text",
          "Sent via unverified third-party links demanding outside payment",
        ],
        correctIndex: 0,
      },
    ],
  },

  // C. MONEY SKILLS (3)
  {
    id: "starter-lesson-7",
    title: "Pi Money Basics: How Escrow Protects You",
    category: "Money Skills",
    skillUnlock: "Pi Escrow Basics",
    durationMin: 10,
    certificateFeePi: 0.3,
    summary:
      "Understand how Pi Smart Contract Escrow keeps both workers and buyers safe without hidden charges. Learn the exact lifecycle from Funds Locked to Proof Submitted and 8% fee payout.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      {
        heading: "Step 1: Never Start Unfunded Work",
        body: "Wait until the buyer locks the full gig Pi amount inside Smart Contract Escrow so the status reads 'Funds Locked' before beginning deliverables.",
      },
      {
        heading: "Step 2: Understand Custody and Transparency",
        body: "EYENEKA does not hold user Pi outside active gig escrow. Every transaction fee—including the 8% Escrow Service Fee—is shown clearly before confirmation.",
      },
      {
        heading: "Step 3: Complete Every Checklist Item Before Proof",
        body: "Escrow releases only when deliverable proof matches the agreed checklist. Attach real files or photos and check off completed items truthfully.",
      },
      {
        heading: "Step 4: Respect the 48-Hour Buyer Inspection Window",
        body: "Once proof is submitted, the buyer checks deliverables within 48 hours and clicks Approve & Release so 92% settles to the worker.",
      },
      {
        heading: "Step 5: Use 3-Step Mediation If Disagreement Arises",
        body: "If an issue occurs, open EYENEKA's 3-Step Dispute rather than arguing off-platform—evidence in gig chat and uploaded proof guide fair resolution.",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "When should a worker begin completing a micro-gig?",
        options: [
          "As soon as the buyer says 'trust me' without locking Pi",
          "Only after escrow status shows 'Funds Locked'",
          "After sending Pi upfront to the buyer",
        ],
        correctIndex: 1,
      },
      {
        id: "q-2",
        question: "On a 1.50 π completed gig with an 8% service fee (0.12 π), what does the worker receive?",
        options: ["1.38 π", "1.50 π", "0.50 π"],
        correctIndex: 0,
      },
      {
        id: "q-3",
        question: "Does EYENEKA hold user Pi outside active gig escrow?",
        options: [
          "Yes, indefinitely for staking",
          "No, EYENEKA holds Pi only in active gig escrow until proof + approval or dispute decision",
          "Yes, and converts it to fiat",
        ],
        correctIndex: 1,
      },
      {
        id: "q-4",
        question: "How long does the buyer review window last after deliverable proof is submitted?",
        options: ["48 hours", "6 months", "10 seconds"],
        correctIndex: 0,
      },
      {
        id: "q-5",
        question: "What happens if buyer and worker disagree on submitted proof?",
        options: [
          "Move the argument to WhatsApp",
          "Use EYENEKA's transparent 3-Step Dispute mediation based on checklist and proof",
          "Delete the account immediately",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "starter-lesson-8",
    title: "How To Price Your First Gig In Pi",
    category: "Money Skills",
    skillUnlock: "Pi Pricing & Scoping",
    durationMin: 12,
    certificateFeePi: 0.3,
    summary:
      "Learn a straightforward way to scope micro-gigs between 0.2 π and 5.0 π so buyers get clear value and workers earn sustainably after the 8% escrow service fee.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      {
        heading: "Step 1: Break Work Into Small Measurable Units",
        body: "Instead of open-ended 'do all my work' packages, price clear micro-units like 500 words translated, 100 rows cleaned, or a 1-hour task.",
      },
      {
        heading: "Step 2: Account for Prep and Revision Time",
        body: "Count reading instructions, organizing files, and doing one quick quality check—not just typing time—when deciding your Pi rate.",
      },
      {
        heading: "Step 3: Calculate Net Payout After the 8% Fee",
        body: "Multiply any gig price by 0.92 to know your exact net Pi received upon release (for example, 1.00 π minus 0.08 π fee equals 0.92 π).",
      },
      {
        heading: "Step 4: Keep First Gigs Accessible (0.5 – 1.5 π)",
        body: "Well-scoped micro-gigs between 0.5 π and 1.5 π attract real buyers quickly and help build your initial Trust Score and verified reviews.",
      },
      {
        heading: "Step 5: Never Promise Pi-to-Fiat Conversions",
        body: "Price strictly in Pi (π) based on work complexity and effort inside the Pi ecosystem, never referencing external fiat currency rates.",
      },
      {
        heading: "Step 6: State Revision Limits Clearly",
        body: "Specify 'Includes 1 reasonable revision within original scope' in your checklist so scope creep does not turn a 1-hour gig into 5 hours.",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "Why are small measurable units (e.g., 500 words, 100 rows) better for micro-gigs?",
        options: [
          "Both buyer and worker know exact completion criteria",
          "They hide what needs to be delivered",
          "They bypass escrow",
        ],
        correctIndex: 0,
      },
      {
        id: "q-2",
        question: "How much does a worker receive on a 1.00 π gig after the 8% service fee?",
        options: ["0.92 π", "1.08 π", "0.75 π"],
        correctIndex: 0,
      },
      {
        id: "q-3",
        question: "Which pricing rule applies strictly across EYENEKA?",
        options: [
          "Prices shown in Pi (π) only with zero fiat conversion claims",
          "Prices quoted in gift cards",
          "Hidden extra fees added after work is finished",
        ],
        correctIndex: 0,
      },
      {
        id: "q-4",
        question: "What protects a worker from endless unpaid extra requests?",
        options: [
          "Defining deliverables and revision limits clearly upfront",
          "Refusing to read messages",
          "Accepting ambiguous instructions",
        ],
        correctIndex: 0,
      },
      {
        id: "q-5",
        question: "What is required on EYENEKA before posting any gig above 1.0 π?",
        options: [
          "Real Pi KYC verification",
          "Paying off-app deposit",
          "Nothing at all",
        ],
        correctIndex: 0,
      },
    ],
  },
  {
    id: "starter-lesson-9",
    title: "How To Spot A Scam Gig And Report It",
    category: "Money Skills",
    skillUnlock: "Scam Prevention",
    durationMin: 10,
    certificateFeePi: 0.3,
    summary:
      "Protect your Pi wallet and personal safety. Learn the exact red flags of fraudulent gigs, off-app payment traps, and how to block and report suspicious accounts immediately.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      {
        heading: "Step 1: Guard Your Pi Passphrase With Zero Exceptions",
        body: "No legitimate buyer, employer, or EYENEKA admin will EVER ask for your 24-word Pi wallet passphrase or verification fee to release a job.",
      },
      {
        heading: "Step 2: Refuse Off-App Payment or Chat Redirects",
        body: "Requests to move to WhatsApp, Telegram, or pay outside Pi Smart Contract Escrow are classic scam setups. Keep all messages inside Protected Gig Chat.",
      },
      {
        heading: "Step 3: Reject 'Pay Upfront To Unlock Work' Traps",
        body: "Real buyers lock Pi into escrow to pay workers. Any listing asking a worker to send Pi first or buy eSIMs, VPNs, or virtual cards is prohibited.",
      },
      {
        heading: "Step 4: Watch for Unrealistic Rewards for Minimal Effort",
        body: "If someone promises extreme payouts for clicking unknown external links, treat it as phishing and do not open the link.",
      },
      {
        heading: "Step 5: Use Report & Block in Work or Law Immediately",
        body: "Click 'Report Gig' on suspicious listings and use Law > Block User to remove bad actors from your feed and protect fellow Pioneers.",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "Who should you ever share your 24-word Pi wallet passphrase with?",
        options: [
          "Verified gig buyers only",
          "Nobody—ever, under any circumstance",
          "Community support agents",
        ],
        correctIndex: 1,
      },
      {
        id: "q-2",
        question: "A user asks you to move gig chat to WhatsApp and pay a 'security deposit' outside escrow. What is this?",
        options: [
          "Normal onboarding",
          "A scam red flag that must be refused and reported",
          "Required KYC step",
        ],
        correctIndex: 1,
      },
      {
        id: "q-3",
        question: "Are workers ever required to send Pi upfront to a buyer to get hired?",
        options: [
          "No—buyers lock Pi in escrow to pay workers",
          "Yes, for every gig",
          "Only on weekends",
        ],
        correctIndex: 0,
      },
      {
        id: "q-4",
        question: "Are eSIMs, VPNs, virtual cards, or physical retail goods allowed on EYENEKA?",
        options: [
          "Yes, in bulk",
          "No—EYENEKA is strictly a work, learning, care, and savings utility",
          "Only via off-app transfers",
        ],
        correctIndex: 1,
      },
      {
        id: "q-5",
        question: "Where can you permanently block a suspicious account on EYENEKA?",
        options: [
          "Law > Block User & Report Safety Violation",
          "By sending them 0.1 π",
          "Accounts cannot be blocked",
        ],
        correctIndex: 0,
      },
    ],
  },

  // D. FOOD & LIFE (1)
  {
    id: "starter-lesson-10",
    title: "Smart Food Buying: Buy In Bulk, Waste Less, Save Pi",
    category: "Food & Life",
    skillUnlock: "Smart Food Buying",
    durationMin: 12,
    certificateFeePi: 0.3,
    summary:
      "Rising food costs stretch household budgets. Learn how families and peer circles plan staple lists, buy bulk dry goods safely together, store food to prevent spoilage, and track every Pi spent.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      {
        heading: "Step 1: Audit What Your Household Actually Eats Weekly",
        body: "Track staple grains, beans, cooking oil, and produce you use completely each week before shopping—avoid buying items that regularly spoil unused.",
      },
      {
        heading: "Step 2: Compare Unit Weight Before Buying",
        body: "Check price per kilogram or liter rather than package size alone so larger sacks actually deliver real unit savings.",
      },
      {
        heading: "Step 3: Pool Staple Orders Transparently",
        body: "Trusted neighbors or Savings Circle members can agree in writing on exact shares of dry staples (rice, beans, flour) before pooling contributions.",
      },
      {
        heading: "Step 4: Inspect Freshness and Seals Upon Delivery",
        body: "Check dry goods for moisture, intact packaging, and clean smell before splitting shares, and keep receipt photos for full transparency.",
      },
      {
        heading: "Step 5: Store Dry Staples Airtight Off the Floor",
        body: "Keep grains and legumes in clean, dry, sealed containers away from sunlight and damp walls to prevent mold and pests.",
      },
      {
        heading: "Step 6: Rotate Older Stock First (FIFO)",
        body: "Use older pantry staples before newly opened bags and freeze or dry surplus seasonal vegetables to bring food waste close to zero.",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "How do you know if a larger bulk sack actually saves more than smaller packs?",
        options: [
          "Pick the brightest bag color",
          "Compare cost per kilogram or liter",
          "Always assume larger bags are cheaper without checking",
        ],
        correctIndex: 1,
      },
      {
        id: "q-2",
        question: "What keeps dry grains and beans safe from mold and insects?",
        options: [
          "Leaving sacks open directly on damp concrete",
          "Storing in clean, airtight, dry containers off the floor",
          "Placing them in direct hot sunlight",
        ],
        correctIndex: 1,
      },
      {
        id: "q-3",
        question: "What does FIFO mean in household food storage?",
        options: [
          "First In, First Out — use older stock before newer purchases",
          "Freeze everything in open bags",
          "Throw away leftovers every evening",
        ],
        correctIndex: 0,
      },
      {
        id: "q-4",
        question: "How should a peer group ensure fairness when sharing a bulk food purchase?",
        options: [
          "Agree on exact shares upfront and keep photo proof of receipts",
          "Split randomly without records",
          "Let one person guess amounts privately",
        ],
        correctIndex: 0,
      },
      {
        id: "q-5",
        question: "What is the best first step to cut weekly food waste?",
        options: [
          "Shop without a list while hungry",
          "Audit what your household actually finishes each week and plan lists from it",
          "Buy extra perishable items on impulse",
        ],
        correctIndex: 1,
      },
    ],
  },

  // E. HEALTH LITERACY (2)
  {
    id: "starter-lesson-11",
    title: "First Aid Basics: Bleeding, Burns, Choking - What To Do First",
    category: "Health Literacy",
    skillUnlock: "First Aid Basics",
    durationMin: 15,
    certificateFeePi: 0.3,
    summary:
      "Learn calm, safe first-response principles for bleeding, minor burns, and choking while knowing immediately when to seek emergency medical care. Educational guidance only—never replaces clinical care.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      {
        heading: "Step 1: Check Scene Safety First",
        body: "Before helping anyone, check for traffic, electrical hazards, fire, or sharp objects so you do not become a second patient.",
      },
      {
        heading: "Step 2: Call For Professional Help Early",
        body: "If someone is unresponsive, struggling to breathe, or bleeding heavily, call local emergency help or assign someone nearby to call immediately.",
      },
      {
        heading: "Step 3: Heavy Bleeding — Direct Firm Pressure",
        body: "Use a clean cloth or sterile pad and press firmly directly over the wound. Add new cloth on top if soaked rather than lifting the first layer.",
      },
      {
        heading: "Step 4: Burns — Cool Water Only, Never Ice or Butter",
        body: "Hold minor thermal burns under cool (not freezing) running water for 20 minutes, remove loose rings gently if not stuck, and cover loosely with clean wrap—never burst blisters.",
      },
      {
        heading: "Step 5: Choking — Encourage Coughing or Seek Trained Rescue",
        body: "If a person can still cough forcefully, encourage them to keep coughing. If they cannot breathe, speak, or cough, call emergency services and use trained back blows/abdominal thrusts if certified.",
      },
      {
        heading: "Step 6: Monitor Breathing and Warmth",
        body: "Keep the injured person calm, seated or lying safely, and watch for pale skin, dizziness, or worsening breathing while awaiting clinical help.",
      },
      {
        heading: "Step 7: Always Seek Professional Care for Red Signs",
        body: "Deep wounds, chemical/electrical burns, facial burns, infant injuries, or breathing difficulty require urgent clinic or hospital evaluation.",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "What is the very first thing to check before approaching an injured person?",
        options: [
          "Ensure the surrounding scene is safe",
          "Give them a large meal",
          "Move their neck quickly",
        ],
        correctIndex: 0,
      },
      {
        id: "q-2",
        question: "If cloth pressed on a bleeding wound soaks through, what should you do?",
        options: [
          "Rip it off repeatedly",
          "Place another clean cloth on top and keep firm direct pressure",
          "Pour toothpaste on the cut",
        ],
        correctIndex: 1,
      },
      {
        id: "q-3",
        question: "What is the safest immediate action for a minor heat burn?",
        options: [
          "Apply butter or cooking oil",
          "Cool under cool running water for 20 minutes and do not burst blisters",
          "Pack directly with ice cubes",
        ],
        correctIndex: 1,
      },
      {
        id: "q-4",
        question: "When should you encourage a choking person to keep coughing?",
        options: [
          "When they are still able to cough forcefully and move air",
          "When they are unconscious",
          "Never",
        ],
        correctIndex: 0,
      },
      {
        id: "q-5",
        question: "Does EYENEKA Care or this lesson replace professional medical diagnosis?",
        options: [
          "Yes, no doctors needed",
          "No—this is educational first-response guidance; always seek professional care",
          "Only for minor burns",
        ],
        correctIndex: 1,
      },
    ],
  },
  {
    id: "starter-lesson-12",
    title: "Child Nutrition: 5 Cheap Foods That Help Children Grow",
    category: "Health Literacy",
    skillUnlock: "Child Nutrition Basics",
    durationMin: 12,
    certificateFeePi: 0.3,
    summary:
      "Affordable everyday foods can give growing children strong protein, iron, vitamins, and energy. Learn how to combine 5 budget-friendly food groups safely while working with your pediatric clinic.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [
      {
        heading: "Step 1: Beans, Lentils & Groundnuts (Affordable Growth Protein)",
        body: "Cooked soft beans, lentils, or smooth peanut paste supply steady plant protein and iron needed for muscle and brain growth.",
      },
      {
        heading: "Step 2: Eggs (Complete Compact Nutrition)",
        body: "Well-cooked eggs provide complete protein, choline, and essential vitamins at low cost per serving.",
      },
      {
        heading: "Step 3: Dark Leafy Greens & Orange Vegetables",
        body: "Spinach, moringa/local greens, carrots, and sweet potatoes deliver Vitamin A and minerals when cooked soft and mashed for young children.",
      },
      {
        heading: "Step 4: Staple Porridges Fortified Safely",
        body: "Enrich plain maize, millet, rice, or oat porridge with mashed beans, egg yolk, or groundnut paste rather than serving watery starch alone.",
      },
      {
        heading: "Step 5: Bananas & Seasonal Whole Fruits Over Sugary Drinks",
        body: "Mashed banana, pawpaw, or seasonal whole fruits offer potassium and fiber without added refined sugar.",
      },
      {
        heading: "Step 6: Practice Clean Water Hygiene & Growth Checkups",
        body: "Wash hands and utensils with clean water before feeding, adapt food textures to avoid choking, and attend routine clinic growth checks.",
      },
    ],
    quiz: [
      {
        id: "q-1",
        question: "Why enrich plain grain porridge with beans, egg, or groundnut paste?",
        options: [
          "To add essential protein, iron, and healthy energy for growth",
          "Just to change the bowl color",
          "Plain water porridge has everything needed",
        ],
        correctIndex: 0,
      },
      {
        id: "q-2",
        question: "Which affordable food is a complete protein source for growing children?",
        options: ["Sugary soda", "Well-cooked eggs", "Plain refined salt"],
        correctIndex: 1,
      },
      {
        id: "q-3",
        question: "Why should carrots and greens be cooked soft or mashed for toddlers?",
        options: [
          "To prevent choking and improve digestibility",
          "Because raw hard pieces are safer",
          "To remove all nutrients",
        ],
        correctIndex: 0,
      },
      {
        id: "q-4",
        question: "Which everyday snack is healthier than packaged sugary drinks?",
        options: [
          "Whole seasonal fruit like banana or pawpaw",
          "Carbonated candy soda",
          "Extra caffeine",
        ],
        correctIndex: 0,
      },
      {
        id: "q-5",
        question: "If a child loses appetite, stops gaining weight, or shows swelling, what should caregivers do?",
        options: [
          "Wait six months without checking",
          "Seek evaluation from a qualified pediatric clinic or health worker",
          "Only feed plain water",
        ],
        correctIndex: 1,
      },
    ],
  },
];

export const OFFICIAL_GIG_TEMPLATES: GigTemplate[] = [
  // Remote Digital (8)
  {
    id: "tpl-gig-1",
    title: "Translation - 500 Words",
    category: "Remote Digital",
    requiredSkill: "Prompting & AI Basics",
    description:
      "Translate 500 words accurately between two supported languages in natural everyday tone without machine-sounding phrasing.",
    deadline: "48 hours",
    pricePi: 1.0,
    checklist: ["Original text", "Translation file", "Proofread once"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-gig-2",
    title: "CV Review + Rewrite",
    category: "Remote Digital",
    requiredSkill: "CV Writing & AI Editing",
    description:
      "Review the client's existing work history and rewrite a truthful, clean, ATS-friendly CV focused on real skills and deliverables.",
    deadline: "48 hours",
    pricePi: 1.5,
    checklist: ["Review CV", "Rewrite", "ATS tips"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-gig-3",
    title: "Data Cleanup - 100 Rows",
    category: "Remote Digital",
    requiredSkill: "Data Entry & QA",
    description:
      "Clean and standardize a 100-row spreadsheet by fixing spelling, formatting dates/names consistently, and removing verified duplicates.",
    deadline: "48 hours",
    pricePi: 1.0,
    checklist: ["Remove duplicates", "Fix spelling", "Return spreadsheet"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-gig-4",
    title: "Social Post Pack - 5 Posts",
    category: "Remote Digital",
    requiredSkill: "Social Media Management",
    description:
      "Prepare 5 ready-to-publish social posts with clear hooks, honest value, relevant hashtags, and practical visual image concepts.",
    deadline: "72 hours",
    pricePi: 1.2,
    checklist: ["5 captions", "5 hashtags sets", "1 image idea each"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-gig-5",
    title: "Research Summary - 1 Topic",
    category: "Remote Digital",
    requiredSkill: "Prompting & AI Basics",
    description:
      "Research one clear practical topic across 5 credible sources and return a crisp 1-page summary with source links included.",
    deadline: "48 hours",
    pricePi: 0.8,
    checklist: ["5 sources", "1-page summary", "Links"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-gig-6",
    title: "Proofreading - 1000 Words",
    category: "Remote Digital",
    requiredSkill: "Data Entry & QA",
    description:
      "Proofread 1,000 words of an article, report, or application for grammar, punctuation, spelling, and clarity comments.",
    deadline: "48 hours",
    pricePi: 0.7,
    checklist: ["Grammar fix", "Spelling fix", "Comments"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-gig-7",
    title: "Virtual Assistant - 2 Hours",
    category: "Remote Digital",
    requiredSkill: "Virtual Assistant",
    description:
      "Complete a focused 2-hour block of inbox organization, calendar checks, or document formatting with a transparent time log.",
    deadline: "24 hours",
    pricePi: 1.0,
    checklist: ["Tasks list", "Time log", "Report"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-gig-8",
    title: "Customer Support Reply Pack - 10 Replies",
    category: "Remote Digital",
    requiredSkill: "Virtual Assistant",
    description:
      "Draft 10 polite, clear customer support message templates covering FAQs and troubleshooting without making false promises.",
    deadline: "48 hours",
    pricePi: 0.8,
    checklist: ["Polite replies", "No fake promises", "Handover notes"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },

  // Local Help (4)
  {
    id: "tpl-gig-9",
    title: "Tutoring - 1 Hour",
    category: "Local Help",
    requiredSkill: "AI Service Operations",
    description:
      "Deliver a structured 1-hour tutoring session on a defined study topic with brief lesson notes and practice questions.",
    deadline: "72 hours",
    pricePi: 0.8,
    checklist: ["Topic", "Lesson notes", "Practice questions"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-gig-10",
    title: "Errand + Market Shopping Help - 1 Hour",
    category: "Local Help",
    requiredSkill: "Smart Food Buying",
    description:
      "Assist a busy neighbor or household with a 1-hour staple shopping errand using an agreed list, clear receipts, and delivery photo.",
    deadline: "24 hours",
    pricePi: 0.6,
    checklist: ["Shopping list", "Receipt photo", "Delivery photo"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-gig-11",
    title: "Elder Help - 1 Hour Visit",
    category: "Local Help",
    requiredSkill: "First Aid Basics",
    description:
      "Provide 1 hour of respectful non-medical household assistance (organizing groceries, reading mail, light errands) with permissioned proof.",
    deadline: "48 hours",
    pricePi: 0.6,
    checklist: ["Visit", "Help task", "Photo proof with permission"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-gig-12",
    title: "Small Repair Help - 1 Task",
    category: "Local Help",
    requiredSkill: "Pi Pricing & Scoping",
    description:
      "Complete one small practical household fix (such as tightening a loose hinge or assembling basic furniture) with before and after photos.",
    deadline: "72 hours",
    pricePi: 1.0,
    checklist: ["Before photo", "Repair", "After photo"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },

  // Community (3)
  {
    id: "tpl-gig-13",
    title: "Teach A Class - 1 Hour",
    category: "Community",
    requiredSkill: "AI Service Operations",
    description:
      "Lead a 1-hour community learning workshop covering practical AI, budgeting, or health literacy using a prepared lesson plan.",
    deadline: "7 days",
    pricePi: 0.8,
    checklist: ["Lesson plan", "Attendance photo", "Feedback"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-gig-14",
    title: "Help A Cooperative Count Stock - 2 Hours",
    category: "Community",
    requiredSkill: "Data Entry & QA",
    description:
      "Assist a community store or bulk-buying cooperative for 2 hours to count physical inventory, record stock totals, and return a clean report.",
    deadline: "72 hours",
    pricePi: 1.0,
    checklist: ["Stock list", "Count photo", "Report"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-gig-15",
    title: "Community Clean-Up - 2 Hours",
    category: "Community",
    requiredSkill: "Smart Food Buying",
    description:
      "Organize or join a 2-hour shared neighborhood clean-up effort documented transparently with before, after, and team photos.",
    deadline: "7 days",
    pricePi: 0.5,
    checklist: ["Before photo", "After photo", "Team photo"],
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
];

export const OFFICIAL_FIRST_AID_GUIDES: FirstAidGuide[] = [
  {
    id: "starter-aid-1",
    title: "Bleeding - Stop Bleeding Safely",
    urgency: "Urgent Action",
    summary:
      "Calm step-by-step first response to help slow external bleeding safely while arranging urgent clinical evaluation.",
    imagePlaceholderLabel: "Admin Picture Placeholder — Click Edit to upload Bleeding First Aid illustration",
    publishedBy: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    viewsCount: 0,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    steps: [
      "Check the scene for sharp glass, metal, or traffic hazards and protect your hands with gloves or clean plastic if available.",
      "Have the injured person sit or lie down calmly so they do not fall if they feel dizzy.",
      "Press a clean cloth, gauze pad, or folded clean garment firmly and directly over the bleeding wound.",
      "If blood soaks through the cloth, do NOT remove the first layer—place fresh clean cloth on top and maintain steady pressure.",
      "Call local emergency medical services immediately if bleeding spurts, will not stop after 10 minutes of pressure, or involves a deep wound.",
    ],
    seekHelpWhen:
      "Seek professional care if Red symptoms appear: spurting blood, wound deeper than surface skin, fainting, pale cold skin, or bleeding that continues after 10 minutes of firm pressure.",
  },
  {
    id: "starter-aid-2",
    title: "Burns - Cool, Cover, Do Not Burst",
    urgency: "Urgent Action",
    summary:
      "Immediate cooling steps for minor heat burns to reduce tissue damage without using harmful home remedies.",
    publishedBy: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    viewsCount: 0,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    steps: [
      "Move the person safely away from heat, steam, hot liquid, or flame.",
      "Hold the burned area gently under cool (not ice-cold) running clean water for a full 20 minutes.",
      "Carefully remove loose watches, belts, or jewelry near the area before swelling begins, unless stuck to skin.",
      "Do NOT apply ice, butter, oil, toothpaste, or herbs, and never pop or peel burn blisters.",
      "Cover loosely with clean non-fluffy cling wrap or a sterile non-stick dressing and monitor for pain or infection.",
    ],
    seekHelpWhen:
      "Seek professional care if Red symptoms appear: burns on face, hands, feet, groin, or joints, burns larger than a palm, white/charred painless skin, chemical or electrical burns, or burns in young children.",
  },
  {
    id: "starter-aid-3",
    title: "Choking - Adult + Child",
    urgency: "Urgent Action",
    summary:
      "Recognize mild versus severe airway blockage in adults and children and know immediate emergency actions.",
    publishedBy: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    viewsCount: 0,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    steps: [
      "Ask clearly 'Are you choking?' If the person can cough forcefully or speak, stay close and encourage them to keep coughing.",
      "Do NOT slap a coughing person on the back while they are clearing their own airway effectively.",
      "If the person cannot breathe, cough, or make sound—or clutches their throat—call emergency services immediately.",
      "If trained in first aid for an adult or child over 1 year, lean them forward and deliver up to 5 firm back blows between the shoulder blades followed by 5 abdominal thrusts (for babies under 1 year, use trained infant chest thrusts/back blows only—never abdominal thrusts).",
      "If the person becomes unconscious, lay them flat on a firm surface and seek immediate emergency resuscitation guidance.",
    ],
    seekHelpWhen:
      "Seek professional care if Red symptoms appear: silent choking, bluish lips, collapse, or persistent swallowing/breathing pain even after the object clears.",
  },
  {
    id: "starter-aid-4",
    title: "Fever In Child - When To Seek Care",
    urgency: "Careful Monitoring",
    summary:
      "Safe comfort, hydration monitoring, and urgent warning signs for fever in babies and children. Educational navigation only.",
    publishedBy: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    viewsCount: 0,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    steps: [
      "Measure temperature carefully if a thermometer is available and note how active and alert the child appears.",
      "Dress the child in one light breathable cotton layer—avoid heavy blankets or cold-water/alcohol sponge baths.",
      "Offer frequent sips of breastmilk, clean water, or oral rehydration solution to prevent dehydration.",
      "Consult a qualified pharmacist or clinician before giving any fever medicine and verify exact weight-based dosing.",
      "Seek urgent medical care immediately for any infant under 3 months with fever or any child showing severe warning signs.",
    ],
    seekHelpWhen:
      "Seek professional care if Red symptoms appear: any fever in a baby under 3 months, seizures/fits, stiff neck, purple/non-fading rash, fast labored breathing, extreme drowsiness, or fever lasting over 48 hours.",
  },
  {
    id: "starter-aid-5",
    title: "Dehydration - Signs + Oral Rehydration",
    urgency: "Careful Monitoring",
    summary:
      "Spot early fluid loss from diarrhoea, vomiting, or heat and support safe oral rehydration alongside clinical advice.",
    publishedBy: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    viewsCount: 0,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    steps: [
      "Check for early dehydration signs: dry mouth, strong thirst, dark urine, or fewer wet diapers in young children.",
      "Prepare standard WHO Oral Rehydration Salts (ORS) packet strictly according to packet directions using safe boiled or treated clean water.",
      "Give small, frequent spoonfuls or sips every few minutes rather than forcing a large glass all at once (which can trigger vomiting).",
      "Continue breastfeeding infants or offering light plain food as tolerated once vomiting eases.",
      "Track wet diapers or urination frequency closely and seek prompt clinic care if fluids cannot stay down.",
    ],
    seekHelpWhen:
      "Seek professional care if Red symptoms appear: sunken eyes, crying without tears, no urine for 6–8 hours, inability to keep any sips down, blood in stool, or extreme lethargy.",
  },
];

export const OFFICIAL_CIRCLE_TEMPLATES: CircleTemplate[] = [
  {
    id: "tpl-circle-1",
    name: "Weekly Small Savers Circle",
    description:
      "Steady weekly rotating savings template with fair sequential rotation and zero interest.",
    maxMembers: 10,
    contributionPi: 1.0,
    cycle: "Weekly",
    payoutMode: "Rotation",
    hasFoodPool: false,
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-circle-2",
    name: "Monthly Builders Circle",
    description:
      "Monthly goal-oriented savings template using transparent member vote for monthly payout order.",
    maxMembers: 10,
    contributionPi: 2.0,
    cycle: "Monthly",
    payoutMode: "Vote",
    hasFoodPool: false,
    author: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
  {
    id: "tpl-circle-3",
    name: "Emergency Food Pool Circle",
    description:
      "Low-contribution weekly community template with a member-voted Emergency Food Pool for staple support.",
    maxMembers: 15,
    contributionPi: 0.5,
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
];
