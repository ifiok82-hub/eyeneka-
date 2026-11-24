import React, { useEffect, useState } from "react";
import {
  AlertCircle,
  Baby,
  CheckCircle2,
  HeartPulse,
  ImagePlus,
  MapPin,
  MessageCircleHeart,
  Pencil,
  Pill,
  Plus,
  ShieldAlert,
  Star,
  Stethoscope,
  Trash2,
  Volume2,
  Wind,
  X,
} from "lucide-react";
import {
  CareResource,
  ChildTracker,
  FirstAidGuide,
  MedicineReminder,
  PeerListenerMessage,
} from "../types";

interface CareViewProps {
  guides: FirstAidGuide[];
  resources: CareResource[];
  childrenList: ChildTracker[];
  meds: MedicineReminder[];
  peerMessages: PeerListenerMessage[];
  username: string;
  lowDataMode: boolean;
  isAdmin: boolean;
  onPublishGuide: (guide: Omit<FirstAidGuide, "id" | "publishedAt">) => void;
  onUpdateGuide: (id: string, guide: Omit<FirstAidGuide, "id" | "publishedAt">) => void;
  onDeleteGuide: (id: string) => void;
  onIncrementGuideView: (id: string) => void;
  onAddResource: (res: Omit<CareResource, "id" | "rating" | "reviewCount">) => void;
  onRateResource: (resourceId: string, stars: number) => void;
  onRegisterCarePartner: (partner: {
    name: string;
    type: CareResource["type"];
    areaNote: string;
    hours: string;
    documentName: string;
  }) => void;
  onApprovePartner: (resourceId: string) => void;
  onAddChild: (name: string, ageMonths: number) => void;
  onToggleVaccine: (childId: string, vaccine: string) => void;
  onToggleMedTaken: (medId: string) => void;
  onAddMed: (label: string, dosageNote: string, timeOfDay: string) => void;
  onSendPeerMessage: (text: string, asVolunteer: boolean) => void;
  onRecordHealthCheck: (stressScore: number) => void;
}

type CareSubTab = "symptoms" | "firstaid" | "findcare" | "family" | "wellness";
type SymptomPathKey = "fever" | "stomach" | "breathing";

interface SymptomOption {
  id: string;
  label: string;
  level: "red" | "yellow" | "green";
  nextStep: string;
}

interface SymptomPathConfig {
  key: SymptomPathKey;
  title: string;
  subtitle: string;
  questions: SymptomOption[];
}

const SYMPTOM_PATHS: SymptomPathConfig[] = [
  {
    key: "fever",
    title: "Fever Path",
    subtitle: "Check fever duration, age, and warning signs — guidance only, no diagnosis.",
    questions: [
      {
        id: "fev_infant",
        label: "Fever in a baby under 3 months old",
        level: "red",
        nextStep: "Take the baby to an emergency clinic or hospital immediately.",
      },
      {
        id: "fev_seizure",
        label: "Fever with stiff neck, fits/seizures, extreme drowsiness, or non-fading rash",
        level: "red",
        nextStep: "Seek emergency clinical care immediately.",
      },
      {
        id: "fev_48h",
        label: "Fever lasting longer than 48–72 hours or rising despite rest",
        level: "yellow",
        nextStep: "Arrange a clinic or health-worker checkup within 24 hours and keep hydrating.",
      },
      {
        id: "fev_chills",
        label: "Moderate fever with body aches while still drinking fluids cleanly",
        level: "yellow",
        nextStep: "Monitor temperature, sip clean fluids, and consult a clinician if not improving.",
      },
      {
        id: "fev_mild",
        label: "Mild warmth (< 24h) while alert, responsive, and drinking water well",
        level: "green",
        nextStep: "Rest in light clothing, hydrate frequently, and seek professional care if symptoms worsen.",
      },
    ],
  },
  {
    key: "stomach",
    title: "Stomach Pain / Diarrhoea Path",
    subtitle: "Check fluid loss and abdominal danger signs — guidance only, no diagnosis.",
    questions: [
      {
        id: "stom_blood",
        label: "Blood in stool/vomit, or severe sharp sudden belly pain",
        level: "red",
        nextStep: "Seek emergency hospital or urgent clinic evaluation immediately.",
      },
      {
        id: "stom_dehyd",
        label: "Cannot keep any sips down, sunken eyes, or no urine for 6–8 hours",
        level: "red",
        nextStep: "Urgent dehydration care is needed—visit a clinic or emergency service right away.",
      },
      {
        id: "stom_2day",
        label: "Loose stools or repeated vomiting lasting over 24–48 hours",
        level: "yellow",
        nextStep: "Start small sips of clean WHO Oral Rehydration Solution (ORS) and arrange a clinic visit.",
      },
      {
        id: "stom_mild",
        label: "Mild cramping or 1–2 loose stools while able to drink ORS and fluids comfortably",
        level: "green",
        nextStep: "Sip clean water or ORS slowly, eat plain light foods, and seek care if pain worsens.",
      },
    ],
  },
  {
    key: "breathing",
    title: "Cough / Breathing Path",
    subtitle: "Check breathing effort and airway warning signs — guidance only, no diagnosis.",
    questions: [
      {
        id: "br_labor",
        label: "Fast or labored breathing, chest pulling in, bluish lips, or unable to speak full sentences",
        level: "red",
        nextStep: "Call emergency services or get to the nearest emergency clinic immediately.",
      },
      {
        id: "br_chestpain",
        label: "Cough accompanied by severe chest pain or coughing up blood",
        level: "red",
        nextStep: "Seek urgent clinical assessment immediately.",
      },
      {
        id: "br_persist",
        label: "Persistent cough lasting over 7–14 days, wheezing, or recurring night fever",
        level: "yellow",
        nextStep: "Schedule a prompt medical checkup within 24–48 hours.",
      },
      {
        id: "br_mild",
        label: "Mild runny nose, scratchy throat, or occasional light cough with normal easy breathing",
        level: "green",
        nextStep: "Rest, stay hydrated with warm clean fluids, and seek professional care if breathing changes.",
      },
    ],
  },
];

const VACCINE_MILESTONES = [
  "BCG & Hep B (Birth)",
  "Pentavalent 1 (6 wks)",
  "Pentavalent 2 (10 wks)",
  "Pentavalent 3 (14 wks)",
  "Measles 1 (9 mos)",
  "MMR / Booster (15 mos)",
];

export const CareView: React.FC<CareViewProps> = ({
  guides,
  resources,
  childrenList,
  meds,
  peerMessages,
  username,
  lowDataMode,
  isAdmin,
  onPublishGuide,
  onUpdateGuide,
  onDeleteGuide,
  onIncrementGuideView,
  onAddResource,
  onRateResource,
  onRegisterCarePartner,
  onApprovePartner,
  onAddChild,
  onToggleVaccine,
  onToggleMedTaken,
  onAddMed,
  onSendPeerMessage,
  onRecordHealthCheck,
}) => {
  const [subTab, setSubTab] = useState<CareSubTab>("symptoms");
  const [activePathKey, setActivePathKey] = useState<SymptomPathKey>("fever");
  const [pickedSymptoms, setPickedSymptoms] = useState<string[]>([]);
  const [activeGuideId, setActiveGuideId] = useState<string>(guides[0]?.id ?? "");

  // Admin First Aid Guide Publisher / Editor state
  const [guideOpen, setGuideOpen] = useState(false);
  const [editingGuideId, setEditingGuideId] = useState<string | null>(null);
  const [gTitle, setGTitle] = useState("");
  const [gUrgency, setGUrgency] = useState<FirstAidGuide["urgency"]>("Urgent Action");
  const [gSummary, setGSummary] = useState("");
  const [gStepsText, setGStepsText] = useState("");
  const [gSeekHelp, setGSeekHelp] = useState("");
  const [gImageDataUrl, setGImageDataUrl] = useState<string | undefined>(undefined);
  const [gImageName, setGImageName] = useState("");
  const [gError, setGError] = useState<string | null>(null);

  // Find Care forms
  const [resName, setResName] = useState("");
  const [resType, setResType] = useState<CareResource["type"]>("Clinic");
  const [resArea, setResArea] = useState("");
  const [resHours, setResHours] = useState("");

  // Verified Care Partner modal state (0.5 π/month)
  const [partnerOpen, setPartnerOpen] = useState(false);
  const [partnerName, setPartnerName] = useState("");
  const [partnerService, setPartnerService] = useState<CareResource["type"]>("Clinic");
  const [partnerArea, setPartnerArea] = useState("");
  const [partnerHours, setPartnerHours] = useState("");
  const [partnerDocName, setPartnerDocName] = useState("");
  const [partnerNoDiagnosis, setPartnerNoDiagnosis] = useState(false);
  const [partnerError, setPartnerError] = useState<string | null>(null);

  // Family & Meds forms
  const [childName, setChildName] = useState("");
  const [childAge, setChildAge] = useState("6");
  const [medLabel, setMedLabel] = useState("");
  const [medDosage, setMedDosage] = useState("");
  const [medTime, setMedTime] = useState("09:00");

  // Mental Wellness: 3-minute breathing timer + stress check + peer volunteer chat
  const [breathingActive, setBreathingActive] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(180);
  const [stressLevel, setStressLevel] = useState<number | null>(null);
  const [asVolunteer, setAsVolunteer] = useState(false);
  const [listenerInput, setListenerInput] = useState("");

  useEffect(() => {
    if (!breathingActive) return;
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          setBreathingActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [breathingActive]);

  const activeGuide = guides.find((g) => g.id === activeGuideId) ?? guides[0] ?? null;
  const activePath = SYMPTOM_PATHS.find((p) => p.key === activePathKey) ?? SYMPTOM_PATHS[0];
  const selectedList = activePath.questions.filter((s) => pickedSymptoms.includes(s.id));

  const triageLevel: "red" | "yellow" | "green" | null =
    selectedList.length === 0
      ? null
      : selectedList.some((s) => s.level === "red")
      ? "red"
      : selectedList.some((s) => s.level === "yellow")
      ? "yellow"
      : "green";

  const recommendedNextStep =
    triageLevel === "red"
      ? selectedList.find((s) => s.level === "red")?.nextStep
      : triageLevel === "yellow"
      ? selectedList.find((s) => s.level === "yellow")?.nextStep
      : triageLevel === "green"
      ? selectedList.find((s) => s.level === "green")?.nextStep
      : null;

  const speakGuide = (guide: FirstAidGuide) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(
      `${guide.title}. ${guide.summary}. Steps: ${guide.steps.join(" ")}. ${guide.seekHelpWhen}`
    );
    window.speechSynthesis.speak(u);
  };

  const breathPhase =
    !breathingActive
      ? "Ready for 3-minute calm breath"
      : (180 - secondsLeft) % 14 < 4
      ? "Breathe in gently (4s)"
      : (180 - secondsLeft) % 14 < 8
      ? "Hold softly (4s)"
      : "Breathe out slowly (6s)";

  const openNewGuideModal = () => {
    setEditingGuideId(null);
    setGTitle("");
    setGUrgency("Urgent Action");
    setGSummary("");
    setGStepsText("");
    setGSeekHelp("");
    setGImageDataUrl(undefined);
    setGImageName("");
    setGError(null);
    setGuideOpen(true);
  };

  const openEditGuideModal = (guide: FirstAidGuide) => {
    setEditingGuideId(guide.id);
    setGTitle(guide.title);
    setGUrgency(guide.urgency);
    setGSummary(guide.summary);
    setGStepsText(guide.steps.join("\n"));
    setGSeekHelp(guide.seekHelpWhen);
    setGImageDataUrl(guide.imageUrl);
    setGImageName(guide.imageUrl ? "Uploaded image" : "");
    setGError(null);
    setGuideOpen(true);
  };

  const handlePublishGuideSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGError(null);
    const steps = gStepsText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!gTitle.trim() || !gSummary.trim() || steps.length === 0 || !gSeekHelp.trim()) {
      setGError("Complete title, summary, at least 1 step, and urgent care warning.");
      return;
    }
    const existing = editingGuideId ? guides.find((g) => g.id === editingGuideId) : undefined;
    const payload: Omit<FirstAidGuide, "id" | "publishedAt"> = {
      title: gTitle.trim(),
      urgency: gUrgency,
      summary: gSummary.trim(),
      imageUrl: gImageDataUrl,
      imagePlaceholderLabel: gImageDataUrl ? undefined : existing?.imagePlaceholderLabel,
      publishedBy: existing?.publishedBy || "EYENEKA Official",
      isOfficialStarter: existing?.isOfficialStarter ?? isAdmin,
      viewsCount: existing?.viewsCount ?? 0,
      completionsCount: existing?.completionsCount ?? 0,
      reviewsCount: existing?.reviewsCount ?? 0,
      earningsPi: existing?.earningsPi ?? 0,
      steps,
      seekHelpWhen: gSeekHelp.trim(),
    };
    if (editingGuideId) {
      onUpdateGuide(editingGuideId, payload);
    } else {
      onPublishGuide(payload);
    }
    setGuideOpen(false);
    setEditingGuideId(null);
  };

  return (
    <div className="space-y-6">
      {/* Mandatory Medical Disclaimer Banner on Every Sub-Page */}
      <section className="rounded-2xl bg-[#0D1F17] border border-[#22C55E]/40 p-4 sm:p-5 text-white flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-[#22C55E] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-display font-bold text-sm sm:text-base text-white">
            EYENEKA is education and navigation, not medical diagnosis. Seek professional care.
          </p>
          <p className="text-xs text-slate-300">
            In any emergency, contact qualified local emergency services or visit a clinic immediately.
          </p>
        </div>
      </section>

      {/* Sub-navigation */}
      <div className="rounded-2xl bg-white border border-slate-200 p-2 flex flex-wrap gap-1.5">
        {[
          { id: "symptoms" as CareSubTab, label: "Symptom Checker", Icon: Stethoscope },
          { id: "firstaid" as CareSubTab, label: "First Aid Library", Icon: HeartPulse },
          { id: "findcare" as CareSubTab, label: "Find Care", Icon: MapPin },
          { id: "family" as CareSubTab, label: "Meds & Child Vaccines", Icon: Baby },
          { id: "wellness" as CareSubTab, label: "Mental Wellness", Icon: Wind },
        ].map(({ id, label, Icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => setSubTab(id)}
            className={`min-h-[44px] px-4 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-2 transition-colors whitespace-nowrap ${
              subTab === id
                ? "bg-[#16A34A] text-white"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {/* 1. Symptom Checker — 3 Real Guided Paths */}
      {subTab === "symptoms" && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <h2 className="font-display text-xl font-bold text-slate-900">
                  3 Symptom Navigation Paths (Red / Yellow / Green)
                </h2>
                <p className="text-sm text-slate-600">
                  Choose a path below and check any signs. Guidance only — no diagnosis. Seek professional care.
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {SYMPTOM_PATHS.map((path) => (
                  <button
                    key={path.key}
                    type="button"
                    onClick={() => {
                      setActivePathKey(path.key);
                      setPickedSymptoms([]);
                    }}
                    className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold transition-colors ${
                      activePathKey === path.key
                        ? "bg-[#16A34A] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {path.title}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500">{activePath.subtitle}</p>
            </div>

            <div className="space-y-2">
              {activePath.questions.map((sym) => {
                const checked = pickedSymptoms.includes(sym.id);
                return (
                  <label
                    key={sym.id}
                    className={`flex items-center gap-3 p-3.5 rounded-xl border text-sm cursor-pointer transition-colors ${
                      checked
                        ? "bg-[#22C55E]/10 border-[#16A34A] text-slate-900 font-medium"
                        : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        setPickedSymptoms((prev) =>
                          prev.includes(sym.id)
                            ? prev.filter((x) => x !== sym.id)
                            : [...prev, sym.id]
                        )
                      }
                      className="accent-[#16A34A]"
                    />
                    <span>{sym.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-slate-900">
              {activePath.title} Result & Next Step
            </h3>
            {!triageLevel && (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-sm text-slate-600">
                Answer the {activePath.title} questions on the left to see Red / Yellow / Green navigation and your next step.
              </div>
            )}

            {triageLevel === "red" && (
              <div className="rounded-xl bg-red-50 border border-red-300 p-5 space-y-2">
                <div className="flex items-center gap-2 text-red-700 font-display font-bold text-base">
                  <AlertCircle className="w-5 h-5" />
                  <span>RED · Seek Professional Care Immediately</span>
                </div>
                <p className="text-sm text-red-900 font-medium">
                  Next Step: {recommendedNextStep}
                </p>
              </div>
            )}

            {triageLevel === "yellow" && (
              <div className="rounded-xl bg-amber-50 border border-amber-300 p-5 space-y-2">
                <div className="flex items-center gap-2 text-amber-800 font-display font-bold text-base">
                  <AlertCircle className="w-5 h-5" />
                  <span>YELLOW · Clinic Evaluation Within 24 Hours</span>
                </div>
                <p className="text-sm text-amber-950 font-medium">
                  Next Step: {recommendedNextStep}
                </p>
              </div>
            )}

            {triageLevel === "green" && (
              <div className="rounded-xl bg-[#22C55E]/10 border border-[#22C55E]/50 p-5 space-y-2">
                <div className="flex items-center gap-2 text-[#15803D] font-display font-bold text-base">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>GREEN · Monitor Closely & Rest</span>
                </div>
                <p className="text-sm text-slate-800 font-medium">
                  Next Step: {recommendedNextStep}
                </p>
              </div>
            )}

            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100">
              No diagnosis. EYENEKA is education and navigation only — always seek professional care.
            </p>
          </div>
        </section>
      )}

      {/* 2. First Aid Library (5 Official Guides + Admin Edit/Delete) */}
      {subTab === "firstaid" && (
        <section className="space-y-4">
          <div className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">
                First Aid Library ({guides.length} Official Guides)
              </h2>
              <p className="text-xs text-slate-600">
                Published by EYENEKA Official. Numbered steps with emergency warnings; editable and deletable by admin.
              </p>
            </div>
            {isAdmin && (
              <button
                type="button"
                onClick={openNewGuideModal}
                className="min-h-[44px] px-4 rounded-xl bg-[#16A34A] text-white text-xs font-semibold hover:bg-[#15803D] inline-flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>Publish First Aid Guide (Admin)</span>
              </button>
            )}
          </div>

          {guides.length === 0 ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center space-y-3">
              <HeartPulse className="w-8 h-8 text-[#16A34A] mx-auto" />
              <p className="font-display font-bold text-lg text-slate-900">
                No first aid guides published yet.
              </p>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                Publish a step-by-step first aid guide with urgent care warnings and optional picture upload.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4 space-y-2.5">
                {guides.map((g) => (
                  <div
                    key={g.id}
                    className={`w-full rounded-2xl p-4 border transition-colors ${
                      g.id === activeGuide?.id
                        ? "bg-white border-[#16A34A] ring-2 ring-[#22C55E]/20"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveGuideId(g.id);
                        onIncrementGuideView(g.id);
                      }}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs">
                        {g.isOfficialStarter && (
                          <span className="px-1.5 py-0.5 rounded bg-[#050507] text-[#FFC800] text-[10px] font-bold">
                            OFFICIAL STARTER
                          </span>
                        )}
                        <span className="font-medium text-slate-500">{g.urgency}</span>
                      </div>
                      <p className="mt-1.5 font-display font-bold text-base text-slate-900">{g.title}</p>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{g.summary}</p>
                      <p className="mt-2 text-[11px] text-slate-500 tabular-nums">
                        Author: {g.publishedBy} · {g.publishedAt} · Views: {g.viewsCount}
                      </p>
                    </button>
                    {isAdmin && (
                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditGuideModal(g)}
                          className="min-h-[32px] px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteGuide(g.id)}
                          className="min-h-[32px] px-3 rounded-lg border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {activeGuide && (
                <div className="lg:col-span-8 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-[#16A34A]">
                        {activeGuide.isOfficialStarter && (
                          <span className="px-2 py-0.5 rounded bg-[#050507] text-[#FFC800] text-[10px] font-bold">
                            OFFICIAL STARTER
                          </span>
                        )}
                        <span>
                          {activeGuide.urgency} · Author: {activeGuide.publishedBy}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-bold text-slate-900">
                        {activeGuide.title}
                      </h3>
                      <p className="text-xs text-slate-500 tabular-nums">
                        Published: {activeGuide.publishedAt} · Views: {activeGuide.viewsCount} · Completions: {activeGuide.completionsCount} · Reviews: {activeGuide.reviewsCount} · Earnings: {activeGuide.earningsPi} π
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {isAdmin && (
                        <>
                          <button
                            type="button"
                            onClick={() => openEditGuideModal(activeGuide)}
                            className="min-h-[44px] px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 inline-flex items-center gap-1.5"
                          >
                            <Pencil className="w-3.5 h-3.5" /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteGuide(activeGuide.id)}
                            className="min-h-[44px] px-3 rounded-xl border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 inline-flex items-center gap-1.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </button>
                        </>
                      )}
                      <button
                        type="button"
                        onClick={() => speakGuide(activeGuide)}
                        className="min-h-[44px] px-4 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 inline-flex items-center gap-2"
                      >
                        <Volume2 className="w-4 h-4" />
                        <span>Read Steps Aloud</span>
                      </button>
                    </div>
                  </div>

                  {!lowDataMode && activeGuide.imageUrl && (
                    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-72 flex items-center justify-center">
                      <img
                        src={activeGuide.imageUrl}
                        alt={activeGuide.title}
                        className="w-full h-64 object-contain bg-white"
                      />
                    </div>
                  )}

                  {!activeGuide.imageUrl && activeGuide.imagePlaceholderLabel && (
                    <div className="rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-6 text-center space-y-2">
                      <ImagePlus className="w-6 h-6 text-slate-400 mx-auto" />
                      <p className="text-xs font-medium text-slate-600">
                        {activeGuide.imagePlaceholderLabel}
                      </p>
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => openEditGuideModal(activeGuide)}
                          className="min-h-[36px] px-3.5 rounded-lg bg-slate-900 text-white text-xs font-semibold"
                        >
                          Upload Picture (Admin)
                        </button>
                      )}
                    </div>
                  )}

                  <ol className="space-y-3">
                    {activeGuide.steps.map((step, idx) => (
                      <li
                        key={`${step}-${idx}`}
                        className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-800"
                      >
                        <span className="font-mono-tabular font-bold text-[#16A34A] shrink-0">
                          {String(idx + 1).padStart(2, "0")}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ol>

                  <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-xs sm:text-sm text-red-900">
                    <strong className="font-semibold">Seek professional care if Red symptoms: </strong>
                    {activeGuide.seekHelpWhen}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Admin Publish / Edit First Aid Guide Modal */}
          {guideOpen && isAdmin && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
                <div className="px-6 py-4 bg-[#050507] text-white flex items-center justify-between">
                  <h3 className="font-display font-bold text-base">
                    {editingGuideId ? "Edit First Aid Guide (Admin)" : "Publish First Aid Guide (Admin)"}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setGuideOpen(false)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handlePublishGuideSubmit} className="p-6 space-y-3.5 overflow-y-auto">
                  <input
                    type="text"
                    value={gTitle}
                    onChange={(e) => setGTitle(e.target.value)}
                    placeholder="Guide Title"
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                  <select
                    value={gUrgency}
                    onChange={(e) => setGUrgency(e.target.value as FirstAidGuide["urgency"])}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="Urgent Action">Urgent Action</option>
                    <option value="Careful Monitoring">Careful Monitoring</option>
                  </select>
                  <textarea
                    rows={2}
                    value={gSummary}
                    onChange={(e) => setGSummary(e.target.value)}
                    placeholder="Short educational summary..."
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                  />
                  <textarea
                    rows={3}
                    value={gStepsText}
                    onChange={(e) => setGStepsText(e.target.value)}
                    placeholder="Step-by-step instructions (1 step per line)"
                    className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                  />
                  <input
                    type="text"
                    value={gSeekHelp}
                    onChange={(e) => setGSeekHelp(e.target.value)}
                    placeholder="When to seek urgent medical care..."
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Upload Instructional Picture (Optional)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setGImageName(file.name);
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (typeof reader.result === "string") {
                            setGImageDataUrl(reader.result);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800"
                    />
                    {gImageName && (
                      <p className="text-[11px] text-slate-500 mt-1">Uploaded: {gImageName}</p>
                    )}
                  </div>
                  {gError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
                      {gError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="min-h-[48px] w-full rounded-xl bg-[#16A34A] text-white text-sm font-semibold hover:bg-[#15803D]"
                  >
                    {editingGuideId ? "Save Guide Changes" : "Publish Guide"}
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 3. Find Care (Empty until real users add clinics/pharmacies) */}
      {subTab === "findcare" && (
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-3">
            <div className="rounded-2xl bg-white border border-slate-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <p className="text-xs text-slate-600">
                Empty until real Pioneers add clinics, pharmacies, or health workers. Community-rated only; no diagnosis claims.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPartnerError(null);
                  setPartnerOpen(true);
                }}
                className="min-h-[44px] px-4 rounded-xl bg-[#FFC800] text-[#050507] text-xs font-bold hover:bg-[#eab800] whitespace-nowrap shrink-0"
              >
                List As Verified Care Partner - 0.5 π/month
              </button>
            </div>

            {resources.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-10 text-center space-y-2">
                <MapPin className="w-7 h-7 text-[#16A34A] mx-auto" />
                <p className="font-display font-bold text-base text-slate-900">
                  No care listings yet.
                </p>
                <p className="text-xs text-slate-600">
                  Add a real clinic, pharmacy, or community health worker using the form or apply as a Verified Care Partner.
                </p>
              </div>
            ) : (
              resources.map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl bg-white border border-slate-200 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-medium text-[#16A34A]">{r.type}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">Added by {r.addedBy}</span>
                      {r.approvalStatus === "Verified" && (
                        <>
                          <span className="text-slate-400">·</span>
                          <span className="inline-flex items-center gap-1 font-bold text-[#15803D]">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                          </span>
                        </>
                      )}
                      {r.approvalStatus === "Pending Review" && (
                        <>
                          <span className="text-slate-400">·</span>
                          <span className="font-semibold text-amber-700">
                            Pending Document Review
                          </span>
                        </>
                      )}
                    </div>
                    <h3 className="font-display font-bold text-base text-slate-900">{r.name}</h3>
                    <p className="text-xs text-slate-600">{r.areaNote}</p>
                    <p className="text-xs text-slate-500">
                      {r.hours}
                      {r.documentName ? ` · Doc: ${r.documentName}` : ""}
                    </p>
                  </div>
                  <div className="text-left sm:text-right shrink-0 space-y-1.5">
                    <div>
                      <p className="font-mono-tabular text-base font-bold text-slate-900">
                        {r.reviewCount === 0 ? "Unrated" : `${r.rating.toFixed(1)} / 5.0`}
                      </p>
                      <p className="text-xs text-slate-500 tabular-nums">
                        {r.reviewCount} community ratings
                      </p>
                    </div>
                    <div className="flex items-center sm:justify-end gap-0.5">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => onRateResource(r.id, s)}
                          aria-label={`Rate ${r.name} ${s} stars`}
                          className="p-1"
                        >
                          <Star
                            className={`w-3.5 h-3.5 ${
                              r.reviewCount > 0 && s <= Math.round(r.rating)
                                ? "text-[#FFC800] fill-[#FFC800]"
                                : "text-slate-300"
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                    {r.approvalStatus === "Pending Review" && (
                      <button
                        type="button"
                        onClick={() => onApprovePartner(r.id)}
                        className="min-h-[34px] px-3 rounded-lg bg-slate-900 text-white text-[11px] font-semibold"
                      >
                        Approve Verification
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!resName.trim() || !resArea.trim()) return;
              onAddResource({
                name: resName.trim(),
                type: resType,
                areaNote: resArea.trim(),
                hours: resHours.trim() || "Contact for hours",
                addedBy: username ? `@${username}` : "@pioneer",
                approvalStatus: "Community",
              });
              setResName("");
              setResArea("");
              setResHours("");
            }}
            className="lg:col-span-5 rounded-2xl bg-white border border-slate-200 p-6 space-y-4 h-fit"
          >
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900">
                Add Community Care Point
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Standard free listing (unverified). Use Verified Care Partner (0.5 π/month) for document-reviewed badge eligibility.
              </p>
            </div>
            <input
              type="text"
              value={resName}
              onChange={(e) => setResName(e.target.value)}
              placeholder="Clinic, Pharmacy, or Health Worker Name"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
            />
            <select
              value={resType}
              onChange={(e) => setResType(e.target.value as CareResource["type"])}
              className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
            >
              <option value="Clinic">Clinic</option>
              <option value="Pharmacy">Pharmacy</option>
              <option value="Community Health Worker">Community Health Worker</option>
            </select>
            <input
              type="text"
              value={resArea}
              onChange={(e) => setResArea(e.target.value)}
              placeholder="General area & services (do not include full street address)"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
            />
            <input
              type="text"
              value={resHours}
              onChange={(e) => setResHours(e.target.value)}
              placeholder="Operating hours"
              className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
            />
            <button
              type="submit"
              className="min-h-[44px] w-full rounded-xl bg-[#16A34A] text-white text-sm font-semibold hover:bg-[#15803D] inline-flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Community Care Point</span>
            </button>
          </form>

          {/* Verified Care Partner Modal (0.5 π / month) */}
          {partnerOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
              <div className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 overflow-hidden">
                <div className="px-6 py-4 bg-[#050507] text-white flex items-center justify-between">
                  <div>
                    <h3 className="font-display font-bold text-base">
                      Verified Care Partner · 0.50 π/month
                    </h3>
                    <p className="text-xs text-[#FFC800]">
                      Verified badge displays only after document approval
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setPartnerOpen(false)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setPartnerError(null);
                    if (!partnerName.trim() || !partnerArea.trim()) {
                      setPartnerError("Provide partner name and general area.");
                      return;
                    }
                    if (!partnerDocName) {
                      setPartnerError("Upload a license or community verification document.");
                      return;
                    }
                    if (!partnerNoDiagnosis) {
                      setPartnerError("Confirm you will make no diagnosis claims on EYENEKA.");
                      return;
                    }
                    onRegisterCarePartner({
                      name: partnerName.trim(),
                      type: partnerService,
                      areaNote: partnerArea.trim(),
                      hours: partnerHours.trim() || "Contact for hours",
                      documentName: partnerDocName,
                    });
                    setPartnerOpen(false);
                    setPartnerName("");
                    setPartnerArea("");
                    setPartnerHours("");
                    setPartnerDocName("");
                    setPartnerNoDiagnosis(false);
                  }}
                  className="p-6 space-y-3.5"
                >
                  <input
                    type="text"
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Clinic / Pharmacy / Health Worker Name"
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                  <select
                    value={partnerService}
                    onChange={(e) => setPartnerService(e.target.value as CareResource["type"])}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                  >
                    <option value="Clinic">Clinic</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Community Health Worker">Community Health Worker</option>
                  </select>
                  <input
                    type="text"
                    value={partnerArea}
                    onChange={(e) => setPartnerArea(e.target.value)}
                    placeholder="General area & services (general area only)"
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                  <input
                    type="text"
                    value={partnerHours}
                    onChange={(e) => setPartnerHours(e.target.value)}
                    placeholder="Operating hours"
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Verification Document Upload
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        setPartnerDocName(file ? file.name : "");
                      }}
                      className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-800"
                    />
                  </div>
                  <label className="flex items-start gap-2 text-xs text-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={partnerNoDiagnosis}
                      onChange={(e) => setPartnerNoDiagnosis(e.target.checked)}
                      className="mt-0.5 accent-[#16A34A]"
                    />
                    <span>
                      I confirm this listing makes no medical diagnosis claims and respects community ratings.
                    </span>
                  </label>
                  {partnerError && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-2.5 text-xs text-red-700">
                      {partnerError}
                    </div>
                  )}
                  <button
                    type="submit"
                    className="min-h-[48px] w-full rounded-xl bg-[#FFC800] text-[#050507] text-sm font-bold hover:bg-[#eab800]"
                  >
                    Continue to Pay 0.50 π/month
                  </button>
                </form>
              </div>
            </div>
          )}
        </section>
      )}

      {/* 4. Medicine Reminder + Child Vaccine Tracker (User's Real Data Only) */}
      {subTab === "family" && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Pill className="w-5 h-5 text-[#16A34A]" />
              <span>My Medicine Reminders</span>
            </h2>
            {meds.length === 0 ? (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-center text-xs text-slate-600">
                No medicine reminders yet. Add your own personal reminders below.
              </div>
            ) : (
              <div className="space-y-2.5">
                {meds.map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{m.label}</p>
                      <p className="text-xs text-slate-600">
                        {m.dosageNote} · {m.timeOfDay}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onToggleMedTaken(m.id)}
                      className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                        m.takenToday
                          ? "bg-[#22C55E]/15 text-[#15803D]"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      {m.takenToday ? "Taken Today" : "Mark Taken"}
                    </button>
                  </div>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!medLabel.trim()) return;
                onAddMed(medLabel.trim(), medDosage.trim() || "As directed by clinician", medTime);
                setMedLabel("");
                setMedDosage("");
              }}
              className="pt-3 border-t border-slate-100 space-y-2.5"
            >
              <p className="text-xs font-semibold text-slate-700">Add Personal Reminder</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={medLabel}
                  onChange={(e) => setMedLabel(e.target.value)}
                  placeholder="Medicine / supplement"
                  className="min-h-[40px] px-3 rounded-xl border border-slate-300 text-xs"
                />
                <input
                  type="text"
                  value={medDosage}
                  onChange={(e) => setMedDosage(e.target.value)}
                  placeholder="Clinician dosage note"
                  className="min-h-[40px] px-3 rounded-xl border border-slate-300 text-xs"
                />
                <input
                  type="time"
                  value={medTime}
                  onChange={(e) => setMedTime(e.target.value)}
                  className="min-h-[40px] px-3 rounded-xl border border-slate-300 text-xs"
                />
              </div>
              <button
                type="submit"
                className="min-h-[40px] px-4 rounded-xl bg-slate-900 text-white text-xs font-semibold"
              >
                Save Reminder
              </button>
            </form>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-4">
            <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
              <Baby className="w-5 h-5 text-[#16A34A]" />
              <span>Child Immunization Schedule</span>
            </h2>

            {childrenList.length === 0 ? (
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 text-center text-xs text-slate-600">
                No child profiles yet. Add your child below to track real clinic-verified vaccines.
              </div>
            ) : (
              childrenList.map((child) => (
                <div key={child.id} className="rounded-xl border border-slate-200 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="font-display font-bold text-sm text-slate-900">{child.name}</p>
                    <span className="text-xs text-slate-500 tabular-nums">
                      {child.ageMonths} months · {child.completedVaccines.length}/{VACCINE_MILESTONES.length} logged
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {VACCINE_MILESTONES.map((vac) => {
                      const done = child.completedVaccines.includes(vac);
                      return (
                        <label
                          key={vac}
                          className="flex items-center gap-2.5 p-2.5 rounded-lg border border-slate-200 text-xs text-slate-800 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={done}
                            onChange={() => onToggleVaccine(child.id, vac)}
                            className="accent-[#16A34A]"
                          />
                          <span>{vac}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!childName.trim()) return;
                onAddChild(childName.trim(), Number(childAge) || 1);
                setChildName("");
              }}
              className="pt-3 border-t border-slate-100 flex flex-wrap gap-2"
            >
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                placeholder="Child first name or nickname"
                className="flex-1 min-h-[40px] px-3 rounded-xl border border-slate-300 text-xs"
              />
              <input
                type="number"
                min="0"
                max="144"
                value={childAge}
                onChange={(e) => setChildAge(e.target.value)}
                placeholder="Months"
                className="w-24 min-h-[40px] px-3 rounded-xl border border-slate-300 text-xs"
              />
              <button
                type="submit"
                className="min-h-[40px] px-4 rounded-xl bg-[#16A34A] text-white text-xs font-semibold"
              >
                Add Child
              </button>
            </form>
          </div>
        </section>
      )}

      {/* 5. Mental Wellness (No Fake Listeners) */}
      {subTab === "wellness" && (
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-5">
            <div>
              <h2 className="font-display font-bold text-lg text-slate-900">
                3-Minute Calming Breath & Stress Check
              </h2>
              <p className="text-xs text-slate-600">
                Completing a stress check updates your real Health Score on Home.
              </p>
            </div>

            <div className="rounded-2xl bg-[#0D1F17] text-white p-6 flex flex-col items-center text-center gap-4">
              <div
                className={`w-28 h-28 rounded-full border-4 border-[#22C55E] flex items-center justify-center transition-transform duration-700 ${
                  breathingActive ? "scale-105 bg-[#22C55E]/20" : "scale-100 bg-white/5"
                }`}
              >
                <span className="font-mono-tabular text-xl font-bold">
                  {Math.floor(secondsLeft / 60)}:{String(secondsLeft % 60).padStart(2, "0")}
                </span>
              </div>
              <p className="text-sm font-semibold text-[#86EFAC]">{breathPhase}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (secondsLeft === 0) setSecondsLeft(180);
                    setBreathingActive((v) => !v);
                  }}
                  className="min-h-[44px] px-5 rounded-xl bg-[#22C55E] text-[#050507] text-xs font-bold"
                >
                  {breathingActive ? "Pause" : "Start 3-Min Breathing"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBreathingActive(false);
                    setSecondsLeft(180);
                  }}
                  className="min-h-[44px] px-4 rounded-xl bg-white/10 text-white text-xs font-semibold"
                >
                  Reset
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-slate-700">
                Real Stress Check (1 = Calm, 5 = Overwhelmed)
              </p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => {
                      setStressLevel(n);
                      onRecordHealthCheck(n);
                    }}
                    className={`min-h-[44px] rounded-xl border text-sm font-bold tabular-nums ${
                      stressLevel === n
                        ? "bg-[#16A34A] border-[#16A34A] text-white"
                        : "bg-slate-50 border-slate-200 text-slate-800"
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              {stressLevel !== null && (
                <p className="text-xs text-slate-600 pt-1">
                  {stressLevel >= 4
                    ? "Check-in logged. Try the 3-minute breath above, hydrate, and seek qualified professional support if overwhelm persists."
                    : "Check-in logged to your real Health Score. Keep taking regular breaks."}
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl bg-white border border-slate-200 p-6 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                  <MessageCircleHeart className="w-5 h-5 text-[#16A34A]" />
                  <span>Talk to a Listener (Peer Volunteers)</span>
                </h2>
                <label className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={asVolunteer}
                    onChange={(e) => setAsVolunteer(e.target.checked)}
                    className="accent-[#16A34A]"
                  />
                  <span>Reply as Peer Volunteer</span>
                </label>
              </div>
              <p className="text-xs text-slate-600">
                Real community peer volunteers only — zero automated fake replies. Volunteers are NOT licensed therapists or doctors.
              </p>
            </div>

            <div className="flex-1 min-h-[220px] max-h-64 overflow-y-auto rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2.5">
              {peerMessages.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500 space-y-1">
                  <p className="font-semibold text-slate-700">No peer messages yet.</p>
                  <p>Post a supportive check-in or reply as a volunteer peer listener.</p>
                </div>
              ) : (
                peerMessages.map((msg) => (
                  <div key={msg.id} className="rounded-xl bg-white border border-slate-200 p-3 text-xs">
                    <div className="flex items-center justify-between text-slate-500 mb-1">
                      <span className="font-semibold text-slate-800">
                        {msg.sender} · {msg.role}
                      </span>
                      <span>{msg.timestamp}</span>
                    </div>
                    <p className="text-slate-700">{msg.text}</p>
                  </div>
                ))
              )}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!listenerInput.trim()) return;
                onSendPeerMessage(listenerInput.trim(), asVolunteer);
                setListenerInput("");
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={listenerInput}
                onChange={(e) => setListenerInput(e.target.value)}
                placeholder={
                  asVolunteer
                    ? "Offer a kind peer listener reply..."
                    : "Share what is on your mind..."
                }
                className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
              />
              <button
                type="submit"
                disabled={!listenerInput.trim()}
                className="min-h-[44px] px-4 rounded-xl bg-[#16A34A] text-white text-xs font-semibold disabled:opacity-40"
              >
                Send
              </button>
            </form>
          </div>
        </section>
      )}
    </div>
  );
};
