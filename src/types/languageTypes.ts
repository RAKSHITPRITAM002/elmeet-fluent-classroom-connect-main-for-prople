import { Json } from "@/integrations/supabase/types";
import { ReactNode } from "react-resizable-panels/dist/declarations/src/vendor/react";

export interface PollQuiz {
  id: string;
  created_at?: string;
  title: string;
  description: string;
  type: "poll" | "quiz";
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
  correctAnswer?: string;
}

export interface Option {
  id: string;
  text: string;
}

// Media resources
export interface MediaResource {
  id: string;
  user_id: string;
  title: string;
  url: string;
  type: "audio" | "video" | "image" | "document";
  description: string;
  created_at?: string;
  updated_at?: string;
}

// Language resources
export interface LanguageResource {
  language_name: ReactNode;
  character_set: boolean;
  common_phrases: boolean;
  dictionary_entries: boolean;
  id: string;
  user_id: string;
  language: string;
  resource_type: string;
  title: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface Scenario {
  id: string;
  title: string;
  description: string;
  roles?: Role[];
}

export interface Role {
  id: string;
  name: string;
  description?: string;
}