import type { Control, Energy, Part } from "@/lib/checkin";

export type CheckIn = {
  id: string;
  createdAt: string;
  /** YYYY-MM-DD (lokal) */
  date: string;
  part: Part;
  mood: number;
  energy: Energy;
  emotions: string[];
  body: string[];
  influences: string[];
  control?: Control;
  answers: { q: string; a: string }[];
  /** gewählte Übung nach dem Check-in */
  exerciseId?: string;
  /** Stimmung nach der Übung (1–5) */
  moodAfter?: number;
};

export type Session = {
  id: string;
  createdAt: string;
  date: string;
  exerciseId: string;
  /** tatsächlich geatmete Sekunden */
  seconds: number;
  completed: boolean;
  checkinKey?: string;
  moodAfter?: number;
};

export const todayIso = (d = new Date()) => d.toLocaleDateString("sv-SE");
export const newId = (p: string) => `${p}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
