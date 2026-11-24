import React, { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  GraduationCap,
  MessageSquare,
  Pencil,
  Play,
  PlayCircle,
  Plus,
  Search,
  Send,
  ShieldCheck,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import {
  CertificateRecord,
  LanguageName,
  Lesson,
  QuizQuestion,
  SkillCategory,
} from "../types";
import { triggerPiAd } from "../lib/piSdk";
import { QrCodeSvg } from "./QrCodeSvg";

interface LearnViewProps {
  lessons: Lesson[];
  selectedLessonId: string | null;
  earnedSkills: string[];
  certificates: CertificateRecord[];
  offlineLessonIds: string[];
  language: LanguageName;
  username: string;
  lowDataMode: boolean;
  isAdmin: boolean;
  onSelectLesson: (id: string | null) => void;
  onPublishLesson: (lesson: Omit<Lesson, "id" | "publishedAt">) => void;
  onUpdateLesson: (id: string, lesson: Omit<Lesson, "id" | "publishedAt">) => void;
  onDeleteLesson: (id: string) => void;
  onToggleOffline: (lessonId: string) => void;
  onPassQuiz: (lesson: Lesson) => void;
  onMintCertificate: (lesson: Lesson, onMinted: (cert: CertificateRecord) => void) => void;
  onRecordAdSupport: () => void;
}

const CATEGORIES: ("All" | SkillCategory)[] = [
  "All",
  "AI Survival",
  "Digital Work",
  "Money Skills",
  "Food & Life",
  "Health Literacy",
];

const TRACKS: SkillCategory[] = [
  "AI Survival",
  "Digital Work",
  "Money Skills",
  "Food & Life",
  "Health Literacy",
];

interface MentorMsg {
  role: "user" | "mentor";
  text: string;
}

export const LearnView: React.FC<LearnViewProps> = ({
  lessons,
  selectedLessonId,
  earnedSkills,
  certificates,
  offlineLessonIds,
  language,
  username,
  lowDataMode,
  isAdmin,
  onSelectLesson,
  onPublishLesson,
  onUpdateLesson,
  onDeleteLesson,
  onToggleOffline,
  onPassQuiz,
  onMintCertificate,
  onRecordAdSupport,
}) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"All" | SkillCategory>("All");
  const [speaking, setSpeaking] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const [quizResult, setQuizResult] = useState<{ passed: boolean; score: number; total: number } | null>(null);
  const [passedLessonIds, setPassedLessonIds] = useState<string[]>([]);
  const [activeCertificate, setActiveCertificate] = useState<CertificateRecord | null>(null);
  const [adSupported, setAdSupported] = useState(false);
  const [adBusy, setAdBusy] = useState(false);

  // AI Mentor Chat state — starts completely empty (answers real user questions only)
  const [mentorOpen, setMentorOpen] = useState(false);
  const [mentorInput, setMentorInput] = useState("");
  const [mentorLoading, setMentorLoading] = useState(false);
  const [mentorError, setMentorError] = useState<string | null>(null);
  const [mentorMessages, setMentorMessages] = useState<MentorMsg[]>([]);

  // Create / Edit Lesson Modal state (5-10 steps + Quiz)
  const [createOpen, setCreateOpen] = useState(false);
  const [editingLessonId, setEditingLessonId] = useState<string | null>(null);
  const [cTitle, setCTitle] = useState("");
  const [cTrack, setCTrack] = useState<SkillCategory>("AI Survival");
  const [cSkill, setCSkill] = useState("");
  const [cDuration, setCDuration] = useState("10");
  const [cCertFee, setCCertFee] = useState("0.3");
  const [cSummary, setCSummary] = useState("");
  const [cSteps, setCSteps] = useState<{ heading: string; body: string }[]>([
    { heading: "Step 1", body: "" },
    { heading: "Step 2", body: "" },
    { heading: "Step 3", body: "" },
    { heading: "Step 4", body: "" },
    { heading: "Step 5", body: "" },
  ]);
  const [cQuiz, setCQuiz] = useState<QuizQuestion[]>([
    { id: "q-1", question: "", options: ["", "", ""], correctIndex: 0 },
  ]);
  const [cError, setCError] = useState<string | null>(null);

  const activeLesson =
    lessons.find((l) => l.id === selectedLessonId) ?? lessons[0] ?? null;

  useEffect(() => {
    setQuizAnswers({});
    setQuizResult(null);
    setAdSupported(false);
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
    }
  }, [activeLesson?.id]);

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const filteredLessons = lessons.filter((l) => {
    const matchCat = category === "All" || l.category === category;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      l.title.toLowerCase().includes(q) ||
      l.skillUnlock.toLowerCase().includes(q) ||
      l.summary.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const handleVoiceToggle = () => {
    if (!activeLesson || typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const textToRead = `${activeLesson.title}. ${activeLesson.summary}. ${activeLesson.sections
      .map((s) => `${s.heading}. ${s.body}`)
      .join(" ")}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setSpeaking(true);
  };

  const handleSubmitQuiz = () => {
    if (!activeLesson) return;
    let correct = 0;
    for (const q of activeLesson.quiz) {
      if (quizAnswers[q.id] === q.correctIndex) {
        correct += 1;
      }
    }
    const passed = correct >= Math.ceil(activeLesson.quiz.length * 0.66);
    setQuizResult({ passed, score: correct, total: activeLesson.quiz.length });
    if (passed) {
      if (!passedLessonIds.includes(activeLesson.id)) {
        setPassedLessonIds((prev) => [...prev, activeLesson.id]);
      }
      onPassQuiz(activeLesson);
    }
  };

  const handleWatchLessonAd = async () => {
    setAdBusy(true);
    try {
      const res = await triggerPiAd("interstitial");
      if (res.completed) {
        setAdSupported(true);
        onRecordAdSupport();
      }
    } finally {
      setAdBusy(false);
    }
  };

  const handleAskMentor = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = mentorInput.trim();
    if (!q || mentorLoading) return;

    setMentorError(null);
    const updated = [...mentorMessages, { role: "user" as const, text: q }];
    setMentorMessages(updated);
    setMentorInput("");
    setMentorLoading(true);

    try {
      const resp = await fetch("/api/mentor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          language,
          lessonContext: activeLesson ? `${activeLesson.title}: ${activeLesson.summary}` : "",
          history: updated.slice(-6),
        }),
      });
      const data = await resp.json();
      if (!resp.ok) {
        throw new Error(data?.error || "Could not reach AI Mentor.");
      }
      setMentorMessages((prev) => [...prev, { role: "mentor", text: data.answer }]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to AI Mentor.";
      setMentorError(msg);
    } finally {
      setMentorLoading(false);
    }
  };

  const openEditLessonModal = (lesson: Lesson) => {
    setEditingLessonId(lesson.id);
    setCTitle(lesson.title);
    setCTrack(lesson.category);
    setCSkill(lesson.skillUnlock);
    setCDuration(String(lesson.durationMin));
    setCCertFee(String(lesson.certificateFeePi));
    setCSummary(lesson.summary);
    setCSteps(lesson.sections.map((s) => ({ ...s })));
    setCQuiz(lesson.quiz.map((q) => ({ ...q, options: [...q.options] })));
    setCError(null);
    setCreateOpen(true);
  };

  const openNewLessonModal = () => {
    setEditingLessonId(null);
    setCTitle("");
    setCTrack("AI Survival");
    setCSkill("");
    setCDuration("10");
    setCCertFee("0.3");
    setCSummary("");
    setCSteps([
      { heading: "Step 1", body: "" },
      { heading: "Step 2", body: "" },
      { heading: "Step 3", body: "" },
      { heading: "Step 4", body: "" },
      { heading: "Step 5", body: "" },
    ]);
    setCQuiz([{ id: "q-1", question: "", options: ["", "", ""], correctIndex: 0 }]);
    setCError(null);
    setCreateOpen(true);
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCError(null);
    const durationMin = Number(cDuration);
    const feePi = Number(cCertFee);

    if (!cTitle.trim() || !cSkill.trim() || !cSummary.trim()) {
      setCError("Provide a Lesson Title, Skill Unlocked, and Summary.");
      return;
    }
    if (Number.isNaN(feePi) || feePi < 0.1 || feePi > 0.5) {
      setCError("Verified Certificate fee must be between 0.10 π and 0.50 π.");
      return;
    }
    const validSteps = cSteps.filter((s) => s.heading.trim() && s.body.trim());
    if (validSteps.length < 5 || validSteps.length > 10) {
      setCError("Every published lesson requires 5 to 10 completed steps.");
      return;
    }
    const validQuiz = cQuiz.filter(
      (q) => q.question.trim() && q.options.every((opt) => opt.trim().length > 0)
    );
    if (validQuiz.length === 0) {
      setCError("Add at least 1 complete Quiz question with 3 answer options.");
      return;
    }

    const existing = editingLessonId ? lessons.find((l) => l.id === editingLessonId) : undefined;
    const payload: Omit<Lesson, "id" | "publishedAt"> = {
      title: cTitle.trim(),
      category: cTrack,
      skillUnlock: cSkill.trim(),
      durationMin: Number.isNaN(durationMin) || durationMin <= 0 ? 10 : durationMin,
      certificateFeePi: feePi,
      summary: cSummary.trim(),
      creatorHandle: existing?.creatorHandle || (isAdmin ? "EYENEKA Official" : username ? `@${username}` : "Pioneer Creator"),
      isOfficialStarter: existing?.isOfficialStarter ?? isAdmin,
      completionsCount: existing?.completionsCount ?? 0,
      reviewsCount: existing?.reviewsCount ?? 0,
      earningsPi: existing?.earningsPi ?? 0,
      sections: validSteps.map((s) => ({ heading: s.heading.trim(), body: s.body.trim() })),
      quiz: validQuiz.map((q, i) => ({
        ...q,
        id: `q-${i + 1}`,
        question: q.question.trim(),
        options: q.options.map((o) => o.trim()),
      })),
    };

    if (editingLessonId) {
      onUpdateLesson(editingLessonId, payload);
    } else {
      onPublishLesson(payload);
    }

    setCreateOpen(false);
    setEditingLessonId(null);
  };

  const existingCert = activeLesson
    ? certificates.find((c) => c.lessonId === activeLesson.id)
    : undefined;
  const isSkillCertified = activeLesson
    ? earnedSkills.includes(activeLesson.skillUnlock) || Boolean(existingCert)
    : false;
  const hasPassedTest = activeLesson
    ? passedLessonIds.includes(activeLesson.id) || isSkillCertified
    : false;
  const isOffline = activeLesson ? offlineLessonIds.includes(activeLesson.id) : false;

  return (
    <div className="space-y-6">
      {/* Academy Header Banner */}
      <section className="rounded-2xl bg-white border border-slate-200 overflow-hidden grid grid-cols-1 lg:grid-cols-5 items-stretch">
        <div className="lg:col-span-3 p-6 sm:p-8 flex flex-col justify-between gap-4">
          <div className="space-y-2">
            <p className="text-xs font-semibold text-[#7C3AED]">
              AI Skills Academy · Free Learning · Verified Certificates (0.1 – 0.5 π)
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 text-wrap-balance">
              Create lessons, learn free, and certify skills for escrow work.
            </h1>
            <p className="text-sm text-slate-600 max-w-xl">
              Lessons appear only when published by real creators (5–10 steps + quiz). Learning is free—pay 0.1–0.5 π only for a Verified Certificate + Skill Badge to unlock gigs.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={openNewLessonModal}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#FFC800] text-[#050507] text-sm font-bold hover:bg-[#eab800] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lesson</span>
            </button>
            <button
              type="button"
              onClick={() => setMentorOpen(true)}
              className="min-h-[44px] px-4 py-2.5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors inline-flex items-center gap-2 whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Mentor ({language})</span>
            </button>
            <span className="text-xs text-slate-500 tabular-nums">
              {lessons.length} published lessons · {certificates.length} certificates
            </span>
          </div>
        </div>
        {!lowDataMode && (
          <div className="lg:col-span-2 relative min-h-[190px] bg-slate-100">
            <img
              src="/src/assets/images/academy_banner_1795511043833.jpg"
              alt="Global learners collaborating in a bright minimalist studio"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </section>

      {/* Search & Track Filter */}
      <section className="rounded-2xl bg-white border border-slate-200 p-4 sm:p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search published lessons or skills..."
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`min-h-[40px] px-3.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  category === cat
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content: Empty State OR Lesson List + Interactive Reader */}
      {lessons.length === 0 ? (
        <section className="rounded-2xl bg-white border border-slate-200 p-10 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-[#7C3AED]/10 text-[#7C3AED] flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <h2 className="font-display text-xl font-bold text-slate-900">
            No lessons yet. Create the first lesson.
          </h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Publish a real 5–10 step course with a verification quiz across AI Survival, Digital Work, Money Skills, Food & Life, or Health Literacy.
          </p>
          <button
            type="button"
            onClick={openNewLessonModal}
            className="min-h-[48px] px-6 rounded-xl bg-[#FFC800] text-[#050507] text-sm font-bold hover:bg-[#eab800] inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create the First Lesson</span>
          </button>
        </section>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left List: Lessons */}
          <div className="lg:col-span-5 space-y-3">
            {filteredLessons.length === 0 ? (
              <div className="rounded-2xl bg-white border border-slate-200 p-8 text-center space-y-2">
                <p className="font-display font-semibold text-slate-900">No matching lessons</p>
                <p className="text-sm text-slate-600">Try clearing your search or choosing All tracks.</p>
              </div>
            ) : (
              filteredLessons.map((lesson) => {
                const selected = lesson.id === activeLesson?.id;
                const unlocked = earnedSkills.includes(lesson.skillUnlock);
                const savedOffline = offlineLessonIds.includes(lesson.id);
                return (
                  <div
                    key={lesson.id}
                    className={`w-full rounded-2xl p-4 border transition-colors ${
                      selected
                        ? "bg-white border-[#7C3AED] ring-2 ring-[#7C3AED]/20"
                        : "bg-white border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onSelectLesson(lesson.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5 flex-wrap">
                          {lesson.isOfficialStarter && (
                            <span className="px-1.5 py-0.5 rounded bg-[#050507] text-[#FFC800] text-[10px] font-bold">
                              OFFICIAL STARTER
                            </span>
                          )}
                          <span>
                            {lesson.category} · {lesson.durationMin} min · {lesson.sections.length} steps
                          </span>
                        </span>
                        <span className="font-mono-tabular font-semibold text-[#7C3AED] shrink-0">
                          Cert {lesson.certificateFeePi.toFixed(2)} π
                        </span>
                      </div>
                      <h3 className="mt-1.5 font-display font-bold text-base text-slate-900">
                        {lesson.title}
                      </h3>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{lesson.summary}</p>
                      <p className="mt-2 text-[11px] text-slate-500 tabular-nums">
                        {lesson.creatorHandle} · {lesson.publishedAt} · Completions: {lesson.completionsCount ?? 0} · Reviews: {lesson.reviewsCount ?? 0} · Earnings: {(lesson.earningsPi ?? 0).toFixed(0)} π
                      </p>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className={unlocked ? "text-[#16A34A] font-semibold" : "text-slate-500"}>
                          {unlocked ? `Certified: ${lesson.skillUnlock}` : `Unlocks: ${lesson.skillUnlock}`}
                        </span>
                        {savedOffline && (
                          <span className="text-slate-500 inline-flex items-center gap-1">
                            <Download className="w-3 h-3" /> Offline
                          </span>
                        )}
                      </div>
                    </button>
                    {isAdmin && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEditLessonModal(lesson)}
                          className="min-h-[34px] px-3 rounded-lg border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 inline-flex items-center gap-1"
                        >
                          <Pencil className="w-3 h-3" /> Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteLesson(lesson.id)}
                          className="min-h-[34px] px-3 rounded-lg border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 inline-flex items-center gap-1"
                        >
                          <Trash2 className="w-3 h-3" /> Delete
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Right Reader */}
          {activeLesson && (
            <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#7C3AED]">
                    {activeLesson.isOfficialStarter && (
                      <span className="px-2 py-0.5 rounded bg-[#050507] text-[#FFC800] text-[10px] font-bold">
                        OFFICIAL STARTER
                      </span>
                    )}
                    <span>
                      {activeLesson.category} · {activeLesson.durationMin} min · Author: {activeLesson.creatorHandle} · Free Lesson
                    </span>
                  </div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    {activeLesson.title}
                  </h2>
                  <p className="text-xs text-slate-500 tabular-nums">
                    Published: {activeLesson.publishedAt} · Completions: {activeLesson.completionsCount ?? 0} · Reviews: {activeLesson.reviewsCount ?? 0} · Earnings: {(activeLesson.earningsPi ?? 0).toFixed(0)} π
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {isAdmin && (
                    <>
                      <button
                        type="button"
                        onClick={() => openEditLessonModal(activeLesson)}
                        className="min-h-[44px] px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 hover:bg-slate-50 inline-flex items-center gap-1.5"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteLesson(activeLesson.id)}
                        className="min-h-[44px] px-3 rounded-xl border border-red-200 text-xs font-semibold text-red-700 hover:bg-red-50 inline-flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    onClick={handleVoiceToggle}
                    className={`min-h-[44px] px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 transition-colors ${
                      speaking
                        ? "bg-[#7C3AED] border-[#7C3AED] text-white"
                        : "bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    {speaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{speaking ? "Stop Voice" : "Read Aloud"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onToggleOffline(activeLesson.id)}
                    className={`min-h-[44px] px-3.5 rounded-xl border text-xs font-semibold inline-flex items-center gap-2 transition-colors ${
                      isOffline
                        ? "bg-[#22C55E]/10 border-[#22C55E] text-[#15803D]"
                        : "bg-slate-50 border-slate-300 text-slate-800 hover:bg-slate-100"
                    }`}
                  >
                    <Download className="w-4 h-4" />
                    <span>{isOffline ? "Saved Offline" : "Save Offline"}</span>
                  </button>
                </div>
              </div>

              <div className="rounded-xl bg-slate-900 text-white p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#7C3AED] flex items-center justify-center shrink-0">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#FFC800]">Lesson Overview</p>
                    <p className="text-xs text-slate-300">{activeLesson.summary}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleVoiceToggle}
                  className="min-h-[40px] px-3 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold whitespace-nowrap shrink-0"
                >
                  {speaking ? "Pause" : "Listen"}
                </button>
              </div>

              <div className="space-y-4">
                {activeLesson.sections.map((sec, idx) => (
                  <div key={`${sec.heading}-${idx}`} className="space-y-1">
                    <h3 className="font-display font-bold text-base text-slate-900">
                      {sec.heading}
                    </h3>
                    <p className="text-sm text-slate-700 leading-relaxed">{sec.body}</p>
                  </div>
                ))}
              </div>

              {/* Skill Test Section */}
              <div className="pt-6 border-t border-slate-200 space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-lg text-slate-900 flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-[#7C3AED]" />
                      <span>Free Skill Verification Test</span>
                    </h3>
                    <p className="text-xs text-slate-600">
                      Pass then get your Verified Certificate ({activeLesson.certificateFeePi.toFixed(2)} π) to unlock "{activeLesson.skillUnlock}" gigs and gain +10 Trust Score.
                    </p>
                  </div>
                  {isSkillCertified && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#16A34A] shrink-0">
                      <CheckCircle2 className="w-4 h-4" /> Certified
                    </span>
                  )}
                </div>

                <div className="space-y-4">
                  {activeLesson.quiz.map((q, idx) => (
                    <div key={q.id} className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5">
                      <p className="text-sm font-semibold text-slate-900">
                        {idx + 1}. {q.question}
                      </p>
                      <div className="space-y-2">
                        {q.options.map((opt, optIdx) => {
                          const picked = quizAnswers[q.id] === optIdx;
                          return (
                            <label
                              key={`${q.id}-${optIdx}`}
                              className={`flex items-center gap-3 p-3 rounded-xl border text-sm cursor-pointer transition-colors ${
                                picked
                                  ? "bg-[#7C3AED]/10 border-[#7C3AED] text-slate-900 font-medium"
                                  : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`${activeLesson.id}-${q.id}`}
                                checked={picked}
                                onChange={() =>
                                  setQuizAnswers((prev) => ({ ...prev, [q.id]: optIdx }))
                                }
                                className="accent-[#7C3AED]"
                              />
                              <span>{opt}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length < activeLesson.quiz.length}
                    className="min-h-[44px] px-5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 disabled:opacity-40 transition-colors"
                  >
                    Submit Free Test
                  </button>

                  {hasPassedTest && !existingCert && (
                    <button
                      type="button"
                      onClick={() =>
                        onMintCertificate(activeLesson, (cert) => setActiveCertificate(cert))
                      }
                      className="min-h-[44px] px-5 rounded-xl bg-[#FFC800] text-[#050507] text-sm font-semibold hover:bg-[#eab800] transition-colors inline-flex items-center gap-2"
                    >
                      <Award className="w-4 h-4" />
                      <span>
                        Get Verified Certificate - {activeLesson.certificateFeePi.toFixed(2)} π
                      </span>
                    </button>
                  )}

                  {existingCert && (
                    <button
                      type="button"
                      onClick={() => setActiveCertificate(existingCert)}
                      className="min-h-[44px] px-5 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] transition-colors inline-flex items-center gap-2"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>View Verified Certificate</span>
                    </button>
                  )}
                </div>

                {quizResult && (
                  <div
                    className={`rounded-xl p-4 border text-sm space-y-3 ${
                      quizResult.passed
                        ? "bg-[#22C55E]/10 border-[#22C55E]/40 text-slate-900"
                        : "bg-amber-50 border-amber-300 text-slate-900"
                    }`}
                  >
                    <p className="font-semibold">
                      {quizResult.passed
                        ? `Passed (${quizResult.score}/${quizResult.total})! Get your Verified Certificate (${activeLesson.certificateFeePi.toFixed(2)} π) to earn +10 Trust Score and unlock "${activeLesson.skillUnlock}" gigs.`
                        : `Scored ${quizResult.score}/${quizResult.total}. Review the lesson steps above and try again.`}
                    </p>

                    {quizResult.passed && (
                      <div className="pt-2 border-t border-[#22C55E]/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                        <span className="text-slate-700">
                          Ads support free learning on EYENEKA.
                        </span>
                        <button
                          type="button"
                          disabled={adBusy || adSupported}
                          onClick={handleWatchLessonAd}
                          className="min-h-[38px] px-3.5 rounded-lg bg-slate-900 text-white font-semibold inline-flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <PlayCircle className="w-3.5 h-3.5 text-[#FFC800]" />
                          <span>
                            {adSupported
                              ? "Ad Support Recorded"
                              : adBusy
                              ? "Showing Pi Ad..."
                              : "Support Free Learning (Pi Ad)"}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create & Publish Real Lesson Modal */}
      {createOpen && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 bg-[#050507] text-white flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base">
                  {editingLessonId ? "Edit Lesson (Admin)" : "Create & Publish Lesson"}
                </h3>
                <p className="text-xs text-[#FFC800]">
                  Requires 5–10 lesson steps and a real skill verification quiz
                </p>
              </div>
              <button
                type="button"
                onClick={() => setCreateOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lesson Title
                  </label>
                  <input
                    type="text"
                    value={cTitle}
                    onChange={(e) => setCTitle(e.target.value)}
                    placeholder="Clear course title"
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Track
                  </label>
                  <select
                    value={cTrack}
                    onChange={(e) => setCTrack(e.target.value as SkillCategory)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-sm"
                  >
                    {TRACKS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Skill Unlocked
                  </label>
                  <input
                    type="text"
                    value={cSkill}
                    onChange={(e) => setCSkill(e.target.value)}
                    placeholder="e.g. Prompting"
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Minutes
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={cDuration}
                    onChange={(e) => setCDuration(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Certificate Fee (0.1–0.5 π)
                  </label>
                  <input
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="0.5"
                    value={cCertFee}
                    onChange={(e) => setCCertFee(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm font-mono-tabular"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Summary
                </label>
                <textarea
                  rows={2}
                  value={cSummary}
                  onChange={(e) => setCSummary(e.target.value)}
                  placeholder="What practical skill will Pioneers learn?"
                  className="w-full p-3 rounded-xl border border-slate-300 text-sm"
                />
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Lesson Steps ({cSteps.length} / 10 — minimum 5)
                  </label>
                  {cSteps.length < 10 && (
                    <button
                      type="button"
                      onClick={() =>
                        setCSteps((prev) => [
                          ...prev,
                          { heading: `Step ${prev.length + 1}`, body: "" },
                        ])
                      }
                      className="text-xs font-semibold text-[#7C3AED] hover:underline"
                    >
                      + Add Step
                    </button>
                  )}
                </div>
                {cSteps.map((st, idx) => (
                  <div key={idx} className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={st.heading}
                        onChange={(e) =>
                          setCSteps((prev) =>
                            prev.map((x, i) => (i === idx ? { ...x, heading: e.target.value } : x))
                          )
                        }
                        placeholder={`Step ${idx + 1} heading`}
                        className="flex-1 min-h-[38px] px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                      />
                      {cSteps.length > 5 && (
                        <button
                          type="button"
                          onClick={() => setCSteps((prev) => prev.filter((_, i) => i !== idx))}
                          className="p-2 text-slate-400 hover:text-red-600"
                          aria-label="Remove step"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <textarea
                      rows={2}
                      value={st.body}
                      onChange={(e) =>
                        setCSteps((prev) =>
                          prev.map((x, i) => (i === idx ? { ...x, body: e.target.value } : x))
                        )
                      }
                      placeholder={`Write clear teaching content for Step ${idx + 1}...`}
                      className="w-full p-2.5 rounded-lg border border-slate-300 bg-white text-xs"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    Verification Quiz ({cQuiz.length} question{cQuiz.length > 1 ? "s" : ""})
                  </label>
                  {cQuiz.length < 5 && (
                    <button
                      type="button"
                      onClick={() =>
                        setCQuiz((prev) => [
                          ...prev,
                          {
                            id: `q-${prev.length + 1}`,
                            question: "",
                            options: ["", "", ""],
                            correctIndex: 0,
                          },
                        ])
                      }
                      className="text-xs font-semibold text-[#7C3AED] hover:underline"
                    >
                      + Add Quiz Question
                    </button>
                  )}
                </div>

                {cQuiz.map((q, qIdx) => (
                  <div key={q.id} className="rounded-xl bg-slate-50 border border-slate-200 p-3 space-y-2">
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) =>
                        setCQuiz((prev) =>
                          prev.map((item, i) =>
                            i === qIdx ? { ...item, question: e.target.value } : item
                          )
                        )
                      }
                      placeholder={`Question ${qIdx + 1}`}
                      className="w-full min-h-[38px] px-3 rounded-lg border border-slate-300 bg-white text-xs font-semibold"
                    />
                    <div className="space-y-1.5">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                          <input
                            type="radio"
                            name={`correct-${qIdx}`}
                            checked={q.correctIndex === optIdx}
                            onChange={() =>
                              setCQuiz((prev) =>
                                prev.map((item, i) =>
                                  i === qIdx ? { ...item, correctIndex: optIdx } : item
                                )
                              )
                            }
                            aria-label={`Mark option ${optIdx + 1} correct`}
                            className="accent-[#16A34A]"
                          />
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) =>
                              setCQuiz((prev) =>
                                prev.map((item, i) => {
                                  if (i !== qIdx) return item;
                                  const nextOpts = [...item.options];
                                  nextOpts[optIdx] = e.target.value;
                                  return { ...item, options: nextOpts };
                                })
                              )
                            }
                            placeholder={`Option ${optIdx + 1} (select radio if correct)`}
                            className="flex-1 min-h-[36px] px-3 rounded-lg border border-slate-300 bg-white text-xs"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {cError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  {cError}
                </div>
              )}

              <button
                type="submit"
                className="min-h-[48px] w-full rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9]"
              >
                {editingLessonId ? "Save Lesson Changes" : "Publish Free Lesson to Academy"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* AI Mentor Drawer Modal — Zero fake history */}
      {mentorOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 bg-[#050507] text-white flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-base">
                  EYENEKA AI Mentor · {language}
                </h3>
                <p className="text-xs text-slate-300">
                  Answers your real question step-by-step in {language}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMentorOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-300 hover:text-white hover:bg-white/10"
                aria-label="Close AI Mentor"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 min-h-[220px]">
              {mentorMessages.length === 0 ? (
                <div className="py-10 text-center space-y-1.5 text-xs text-slate-500">
                  <p className="font-semibold text-slate-700">No questions asked yet.</p>
                  <p>Ask any skill, escrow, or learning question below in {language}.</p>
                </div>
              ) : (
                mentorMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap leading-relaxed ${
                        msg.role === "user"
                          ? "bg-[#7C3AED] text-white"
                          : "bg-white border border-slate-200 text-slate-800"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                ))
              )}
              {mentorLoading && (
                <div className="text-xs text-slate-500 px-2">Thinking clearly in {language}...</div>
              )}
              {mentorError && (
                <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-xs text-red-700">
                  {mentorError}
                </div>
              )}
            </div>

            <form onSubmit={handleAskMentor} className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
              <input
                type="text"
                value={mentorInput}
                onChange={(e) => setMentorInput(e.target.value)}
                placeholder={`Ask a question in ${language}...`}
                className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
              <button
                type="submit"
                disabled={mentorLoading || !mentorInput.trim()}
                className="min-h-[44px] px-4 rounded-xl bg-[#7C3AED] text-white text-sm font-semibold hover:bg-[#6D28D9] disabled:opacity-40 inline-flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Ask</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal — EYENEKA Operator Seal Only */}
      {activeCertificate && (
        <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <BookOpen className="w-6 h-6 text-[#7C3AED]" />
                <span className="font-display font-bold text-lg text-slate-900">
                  EYENEKA Verified Skill Certificate
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveCertificate(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
                aria-label="Close certificate"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl bg-[#050507] text-white p-6 sm:p-8 border border-[#FFC800]/40 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-[#FFC800] tracking-wide">
                    Pi Blockchain Verified Credential · Trust Score +10
                  </p>
                  <h3 className="font-display text-2xl font-bold">{activeCertificate.title}</h3>
                </div>
                <QrCodeSvg
                  value={`eyeneka://verify/${activeCertificate.id}/${activeCertificate.txHash}`}
                  size={78}
                />
              </div>

              <p className="text-sm text-slate-300">
                Awarded to Pioneer{" "}
                <span className="text-white font-semibold">
                  {username ? `@${username}` : "Verified Pioneer"}
                </span>{" "}
                for passing the verified skill test and unlocking{" "}
                <span className="text-[#FFC800] font-semibold">{activeCertificate.skillUnlock}</span> micro-gigs.
              </p>

              <div className="pt-4 border-t border-white/15 grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div>
                  <span className="block text-slate-400">Issued Date</span>
                  <span className="font-mono-tabular text-white">{activeCertificate.issuedAt}</span>
                </div>
                <div>
                  <span className="block text-slate-400">Pi Receipt Hash</span>
                  <span className="font-mono-tabular text-white truncate block">{activeCertificate.txHash}</span>
                </div>
                <div className="col-span-2">
                  <span className="block text-slate-400">Issuing Utility</span>
                  <span className="text-white">EYENEKA · Global Decentralized People Utility</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="min-h-[44px] px-4 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 hover:bg-slate-50"
              >
                Print / Save PDF
              </button>
              <button
                type="button"
                onClick={() => setActiveCertificate(null)}
                className="min-h-[44px] px-5 rounded-xl bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
