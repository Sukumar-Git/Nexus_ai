export interface Memory {
  id: string;
  url: string;
  title: string;
  content: string;
  savedAt: string;
  tags: string[];
}

export interface Note {
  id: string;
  url: string;
  title: string;
  text: string;
  createdAt: string;
  tags: string[];
  snippet?: string; // highlight snippet linked to note
}

export interface Recommendation {
  id: string;
  title: string;
  url: string;
  description: string;
  category: 'docs' | 'video' | 'tutorial' | 'guide';
  matchReason: string;
}

export interface PageSummary {
  url: string;
  title: string;
  tldr: string;
  keyPoints: string[];
  readingTimeSaved: number; // in minutes
  estimatedReadingTime: number; // in minutes
  category: string;
  cachedAt: string;
}

export interface UserPreferences {
  interests: string[];
  readingLevel: 'beginner' | 'intermediate' | 'advanced';
  proactivity: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface SimulatedPage {
  id: string;
  title: string;
  url: string;
  content: string;
  author: string;
  readTime: string;
  category: string;
}
