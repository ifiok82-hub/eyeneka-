// EYENEKA Official Starter Data - restored after refactor deleted file
// Real starter items only. All start at 0. No mock users/earnings.

export const TODAY_ISO = new Date().toISOString().slice(0, 10);

export const OFFICIAL_STARTER_LESSONS: any[] = [
  {
    id: "official-lesson-1",
    title: "Welcome to Eyeneka - Learn. Work. Earn. Care.",
    category: "Getting Started",
    skillUnlock: "Eyeneka Basics",
    durationMin: 10,
    certificateFeePi: 0.3,
    summary: "How Eyeneka works: Learn, Work, Earn, Care. Together.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
    sections: [{ heading: "Step 1", body: "Learn a skill, complete a gig, earn Pi, care for your community." }],
    quiz: [{ id: "q-1", question: "What is Eyeneka?", options: ["Learn. Work. Earn. Care. Together.", "A store", "A bank"], correctIndex: 0 }],
  },
];

export const OFFICIAL_GIG_TEMPLATES: any[] = [
  {
    id: "official-gig-1",
    title: "Community Help Task",
    category: "Community",
    pricePi: 1,
    summary: "Help a community member with a small task. Paid in Pi via escrow.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
];

export const OFFICIAL_FIRST_AID_GUIDES: any[] = [
  {
    id: "official-care-1",
    title: "Basic First Aid - Stay Calm, Get Help",
    category: "Care",
    summary: "General safety guide. Always seek professional medical help in an emergency.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
  },
];

export const OFFICIAL_CIRCLE_TEMPLATES: any[] = [
  {
    id: "official-circle-1",
    title: "Savings Circle - Starter",
    category: "Save",
    summary: "Save together with people you trust. No interest. Pi only.",
    creatorHandle: "EYENEKA Official",
    publishedAt: TODAY_ISO,
    isOfficialStarter: true,
    completionsCount: 0,
    reviewsCount: 0,
    earningsPi: 0,
  },
];
