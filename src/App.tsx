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
import {
  OFFICIAL_CIRCLE_TEMPLATES,
  OFFICIAL_FIRST_AID_GUIDES,
  OFFICIAL_GIG_TEMPLATES,
  OFFICIAL_STARTER_LESSONS,
  TODAY_ISO,
} from "./data/officialStarterData";
import {
  PI_APP_REDIRECT_URL,
  PI_SIGNIN_ERROR_MESSAGE,
  authenticateWithPiSdk,
  initPiSdk,
  isPiBrowserAvailable,
  logoutPiSession,
  resumeIncompletePayments,
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
  const [notifOpen, setNotifOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  const earnedSkills = Array.from(new Set(certificates.map((c) => c.skillUnlock)));

  useEffect(() => {
    const timer = window.setTimeout(() => setShowSplash(false), 900);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    let active = true;
    void (async () => {
      const sdkReady = await initPiSdk();
      void resumeIncompletePayments();
      if (active && sdkReady && isPiBrowserAvailable()) {
        const attempt = await authenticateWithPiSdk();
        if (active && attempt.success && attempt.result) {
          setPiConnected(true);
          setUsername(attempt.result.username);
          setKycVerified(attempt.result.kycVerified);
          setInPiBrowser(true);
          setAuthError(null);
        }
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
    return () => {
      active = false;
    };
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
    setPiConnected(true);
    setUsername(auth.username);
    setKycVerified(auth.kycVerified);
    setInPiBrowser(auth.inPiBrowser);
    setAuthError(null);
    if (auth.kycVerified && !kycTrustAwarded) {
      setTrustScore((s) => Math.min(100, s + 20));
      setKycTrustAwarded(true);
    }
    setActiveTab("home");
    if (
      typeof window !== "undefined" &&
      window.location.origin === new URL(PI_APP_REDIRECT_URL).origin &&
      window.location.pathname !== "/"
    ) {
      window.history.replaceState(null, "", "/");
    }
    showToast(`Welcome, Pioneer @${auth.username}`);
  };

  const handleOpenPiConnect = async () => {
    setAuthError(null);
    const attempt = await authenticateWithPiSdk();
    if (attempt.success && attempt.result) {
      handleAuthenticated({
        username: attempt.result.username,
        kycVerified: attempt.result.kycVerified,
        inPiBrowser: true,
      });
      return;
    }
    const errMsg = attempt.error ?? PI_SIGNIN_ERROR_MESSAGE;
    setAuthError(errMsg);
    setAuthModalOpen(true);
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
    const certFee = lesson.certificateFeePi || 0.3;
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
    const handle = username ? `@${username}` : "@pioneer";
    setPendingPayment({
      title: "Circle Cycle Contribution",
      purpose: `${target.name} · Cycle ${target.currentCycle}`,
      amountPi: target.contributionPi,
      breakdown: [
        { label: "Rotating Savings Pool Contribution (0% Interest)", amountPi: target.contributionPi },
      ],
      memo: `Eyeneka - Circle Contribution (${target.name})`,
      metadata: {
        type: "circle",
        itemId: circleId,
        buyer: username || "pioneer",
      },
      escrowId: `CIR-${Date.now().toString().slice(-5)}`,
      onComplete: ({ paymentId, txHash, escrowId }) => {
        setCircles((prev) =>
          prev.map((c) => {
            if (c.id !== circleId) return c;
            return {
              ...c,
              members: c.members.map((m) =>
                m.handle === handle
                  ? { ...m, contributedThisCycle: true, lateFlag: false }
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
            amountPi: target.contributionPi,
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
        showToast(`Recorded ${target.contributionPi.toFixed(2)} π real contribution.`);
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
    setPendingPayment({
      title: paymentType === "card" ? "Pioneer Card Renewal (0.20 π)" : "Pi Testnet Payment (1.00 π)",
      purpose: memo,
      amountPi,
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
            onTestPiPayment={() =>
              handleQuickPaymentTest(
                1.0,
                "Eyeneka - Test Payment (1 Pi)",
                "test",
                "core-team-test"
              )
            }
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
        onClose={() => setPendingPayment(null)}
      />

      {/* Footer — EYENEKA only, zero parent entity or reg number */}
      <footer className="border-t border-white/10 bg-[#050507] text-slate-400 py-8 mb-14 md:mb-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
          <div className="space-y-1">
            <p className="font-display font-semibold text-white">
              EYENEKA - Where Pioneers Learn, Work, Earn and Care.
            </p>
            <p>
              Decentralized - Built on Pi Blockchain - Smart Contract Escrow - User Owns Data
            </p>
          </div>
          <div className="text-left sm:text-right space-y-1">
            <p>Operator: EYENEKA</p>
            <p>Global · Borderless · Pi Coin Only</p>
          </div>
        </div>
      </footer>

      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} language={language} />
    </div>
  );
}
