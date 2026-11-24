import { LanguageName } from "../types";

export const SUPPORTED_LANGUAGES: LanguageName[] = [
  "English",
  "French",
  "Spanish",
  "Portuguese",
  "Hindi",
  "Indonesian",
  "Arabic",
  "Swahili",
  "Yoruba",
  "Hausa",
  "Igbo",
  "Pidgin",
];

interface TranslationStrings {
  welcomePrefix: string;
  tagline: string;
  nav: {
    home: string;
    learn: string;
    work: string;
    care: string;
    save: string;
    wallet: string;
    law: string;
  };
  cards: {
    skills: string;
    gigs: string;
    earnings: string;
    health: string;
  };
  connectPi: string;
  connected: string;
  dailyFeed: string;
  trustScore: string;
}

const DICT: Record<LanguageName, TranslationStrings> = {
  English: {
    welcomePrefix: "Welcome, Pioneer",
    tagline: "Learn. Work. Earn. Care. Together.",
    nav: { home: "Home", learn: "Learn", work: "Work", care: "Care", save: "Save", wallet: "Wallet", law: "Law" },
    cards: { skills: "My Skills", gigs: "My Gigs", earnings: "My Earnings in Pi", health: "My Health Score" },
    connectPi: "Connect Pi",
    connected: "Pi Connected",
    dailyFeed: "Daily Opportunity Feed",
    trustScore: "Trust Score",
  },
  French: {
    welcomePrefix: "Bienvenue, Pionnier",
    tagline: "Apprendre. Travailler. Gagner. Prendre soin. Ensemble.",
    nav: { home: "Accueil", learn: "Apprendre", work: "Travail", care: "Santé", save: "Épargne", wallet: "Portefeuille", law: "Lois" },
    cards: { skills: "Mes Compétences", gigs: "Mes Missions", earnings: "Mes Gains en Pi", health: "Score Santé" },
    connectPi: "Connecter Pi",
    connected: "Pi Connecté",
    dailyFeed: "Opportunités du Jour",
    trustScore: "Score Confiance",
  },
  Spanish: {
    welcomePrefix: "Bienvenido, Pionero",
    tagline: "Aprende. Trabaja. Gana. Cuida. Juntos.",
    nav: { home: "Inicio", learn: "Aprender", work: "Trabajo", care: "Salud", save: "Ahorro", wallet: "Billetera", law: "Legal" },
    cards: { skills: "Mis Habilidades", gigs: "Mis Tareas", earnings: "Mis Ganancias en Pi", health: "Salud Familiar" },
    connectPi: "Conectar Pi",
    connected: "Pi Conectado",
    dailyFeed: "Oportunidades de Hoy",
    trustScore: "Confianza",
  },
  Portuguese: {
    welcomePrefix: "Bem-vindo, Pioneiro",
    tagline: "Aprender. Trabalhar. Ganhar. Cuidar. Juntos.",
    nav: { home: "Início", learn: "Aprender", work: "Trabalho", care: "Saúde", save: "Poupar", wallet: "Carteira", law: "Regras" },
    cards: { skills: "Minhas Habilidades", gigs: "Meus Trabalhos", earnings: "Ganhos em Pi", health: "Índice Saúde" },
    connectPi: "Conectar Pi",
    connected: "Pi Conectado",
    dailyFeed: "Oportunidades Diárias",
    trustScore: "Confiança",
  },
  Hindi: {
    welcomePrefix: "स्वागत है, पायनियर",
    tagline: "सीखें। काम करें। कमाएं। देखभाल करें। साथ मिलकर।",
    nav: { home: "होम", learn: "सीखें", work: "काम", care: "स्वास्थ्य", save: "बचत", wallet: "वॉलेट", law: "नियम" },
    cards: { skills: "मेरे कौशल", gigs: "मेरे काम", earnings: "Pi में कमाई", health: "स्वास्थ्य स्कोर" },
    connectPi: "Pi जोड़ें",
    connected: "Pi जुड़ा है",
    dailyFeed: "आज के अवसर",
    trustScore: "विश्वास स्कोर",
  },
  Indonesian: {
    welcomePrefix: "Selamat datang, Pioneer",
    tagline: "Belajar. Bekerja. Hasilkan. Peduli. Bersama.",
    nav: { home: "Beranda", learn: "Belajar", work: "Kerja", care: "Kesehatan", save: "Tabungan", wallet: "Dompet", law: "Aturan" },
    cards: { skills: "Keahlian Saya", gigs: "Tugas Saya", earnings: "Pendapatan Pi", health: "Skor Kesehatan" },
    connectPi: "Hubungkan Pi",
    connected: "Pi Terhubung",
    dailyFeed: "Peluang Hari Ini",
    trustScore: "Skor Kepercayaan",
  },
  Arabic: {
    welcomePrefix: "مرحباً، رائد",
    tagline: "تعلّم. اعمل. اكسب. اعتنِ. معاً.",
    nav: { home: "الرئيسية", learn: "تعلّم", work: "العمل", care: "الرعاية", save: "الادخار", wallet: "المحفظة", law: "القانون" },
    cards: { skills: "مهاراتي", gigs: "مهامي", earnings: "أرباحي بـ Pi", health: "مؤشر الصحة" },
    connectPi: "ربط Pi",
    connected: "Pi متصل",
    dailyFeed: "فرص اليوم",
    trustScore: "نقاط الثقة",
  },
  Swahili: {
    welcomePrefix: "Karibu, Pioneer",
    tagline: "Jifunze. Fanya kazi. Pata. Tunza. Pamoja.",
    nav: { home: "Nyumbani", learn: "Jifunze", work: "Kazi", care: "Afya", save: "Akiba", wallet: "Pochi", law: "Sheria" },
    cards: { skills: "Ujuzi Wangu", gigs: "Kazi Zangu", earnings: "Mapato ya Pi", health: "Alama ya Afya" },
    connectPi: "Unganisha Pi",
    connected: "Pi Imeunganishwa",
    dailyFeed: "Fursa za Leo",
    trustScore: "Alama ya Uaminifu",
  },
  Yoruba: {
    welcomePrefix: "Káàbọ̀, Pioneer",
    tagline: "Kọ́. Ṣiṣẹ́. Jèrè. Tọ́jú. Papọ̀.",
    nav: { home: "Ilé", learn: "Kọ́", work: "Iṣẹ́", care: "Ìlera", save: "Ìfowópamọ́", wallet: "Àpò", law: "Òfin" },
    cards: { skills: "Ọgbọ́n Mi", gigs: "Iṣẹ́ Mi", earnings: "Èrè Pi Mi", health: "Ìlera Mi" },
    connectPi: "So Pi Pọ̀",
    connected: "Pi Ti Sopọ̀",
    dailyFeed: "Àǹfààní Òní",
    trustScore: "Ìgbẹ́kẹ̀lé",
  },
  Hausa: {
    welcomePrefix: "Barka da zuwa, Pioneer",
    tagline: "Koyo. Aiki. Samu. Kulawa. Tare.",
    nav: { home: "Gida", learn: "Koyo", work: "Aiki", care: "Lafiya", save: "Adana", wallet: "Jakar Pi", law: "Doka" },
    cards: { skills: "Kwarewata", gigs: "Ayyukana", earnings: "Kudin Pi", health: "Lafiya" },
    connectPi: "Haɗa Pi",
    connected: "An Haɗa Pi",
    dailyFeed: "Damar Yau",
    trustScore: "Amincewa",
  },
  Igbo: {
    welcomePrefix: "Nnọọ, Pioneer",
    tagline: "Mụta. Rụọ ọrụ. Nweta. Lekọta. Ọnụ.",
    nav: { home: "Ụlọ", learn: "Mụta", work: "Ọrụ", care: "Ahụike", save: "Nchekwa", wallet: "Obere akpa", law: "Iwu" },
    cards: { skills: "Nkà M", gigs: "Ọrụ M", earnings: "Ego Pi M", health: "Ahụike M" },
    connectPi: "Jikọọ Pi",
    connected: "Ejikọla Pi",
    dailyFeed: "Ohere Taa",
    trustScore: "Ntụkwasị obi",
  },
  Pidgin: {
    welcomePrefix: "Welcome, Pioneer",
    tagline: "Learn. Work. Earn. Care. Together.",
    nav: { home: "Home", learn: "Learn", work: "Work", care: "Care", save: "Save", wallet: "Wallet", law: "Law" },
    cards: { skills: "My Skills", gigs: "My Gigs", earnings: "Pi Wey I Earn", health: "My Health" },
    connectPi: "Connect Pi",
    connected: "Pi Don Connect",
    dailyFeed: "Correct Work & Lesson Today",
    trustScore: "Trust Level",
  },
};

export function getCopy(language: LanguageName): TranslationStrings {
  return DICT[language] ?? DICT.English;
}
