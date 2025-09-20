export interface Question {
  id: number;
  question_en: string;
  question_es: string;
  answer_en: string[];
  answer_es: string[];
  distractors_es: string[];
  explanation_es: string;
  is_6520: boolean;
  category: string;
  imageUrl: string;
}

export interface User {
  id: string;
  email: string;
  referralCode: string;
  referredBy: string | null;
  adFreeUntil: string | null;
  points: number;
  streak: number;
  lastStudied: string | null;
  wildcards: number;
}

export interface Referral {
    id: string;
    referringUserCode: string;
    referredUserId: string;
    timestamp: string;
}

// FIX: Added Page enum to define the different views of the application.
export enum Page {
    Home = 'home',
    Practice = 'practice',
    StudyCards = 'study-cards',
    Quiz = 'quiz',
    Interview = 'interview',
    Dashboard = 'dashboard',
    Donation = 'donation',
}

export enum QuizMode {
    Micro = 'micro',
    Full = 'full',
}