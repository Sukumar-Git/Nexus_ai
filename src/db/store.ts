import fs from 'fs';
import path from 'path';
import { Memory, Note, Recommendation, UserPreferences } from '../types';

const DB_PATH = path.join(process.cwd(), 'nexus_store.json');

interface DatabaseSchema {
  memories: Memory[];
  notes: Note[];
  recommendations: Recommendation[];
  preferences: UserPreferences;
}

const DEFAULT_PREFERENCES: UserPreferences = {
  interests: ['Artificial Intelligence', 'Software Development', 'Web Technologies', 'Productivity'],
  readingLevel: 'intermediate',
  proactivity: 'medium'
};

const DEFAULT_RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'r1',
    title: 'Google GenAI SDK Documentation',
    url: 'https://github.com/google/generative-ai-js',
    description: 'The official GitHub repository and guide for the modern @google/genai TypeScript SDK.',
    category: 'docs',
    matchReason: 'Directly related to building smart LLM applications and using advanced cognitive features.'
  },
  {
    id: 'r2',
    title: 'Vite Extension Build Guide (CRXJS)',
    url: 'https://crxjs.dev/vite-plugin',
    description: 'Learn how to configure Vite with CRXJS plugin for hot-reload in Chrome Extensions.',
    category: 'guide',
    matchReason: 'A useful guide for bundling and deploying Chrome extension assets with Manifest V3.'
  },
  {
    id: 'r3',
    title: 'Tailwind CSS v4.0 Release Guide',
    url: 'https://tailwindcss.com/blog/v4-0',
    description: 'An overview of the new CSS-first configuration and high-performance engine in Tailwind CSS v4.',
    category: 'tutorial',
    matchReason: 'Provides modern CSS-first styling practices for highly customizable web components.'
  }
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = {
      memories: [],
      notes: [],
      recommendations: [...DEFAULT_RECOMMENDATIONS],
      preferences: { ...DEFAULT_PREFERENCES }
    };
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(DB_PATH)) {
        const fileContent = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(fileContent);
        this.data = {
          memories: parsed.memories || [],
          notes: parsed.notes || [],
          recommendations: parsed.recommendations?.length ? parsed.recommendations : [...DEFAULT_RECOMMENDATIONS],
          preferences: parsed.preferences || { ...DEFAULT_PREFERENCES }
        };
      } else {
        this.save();
      }
    } catch (e) {
      console.error('Error loading database, using in-memory fallback:', e);
    }
  }

  private save() {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error saving database:', e);
    }
  }

  // Memories CRUD
  getMemories(): Memory[] {
    return this.data.memories;
  }

  addMemory(memory: Omit<Memory, 'id' | 'savedAt'>): Memory {
    const newMemory: Memory = {
      ...memory,
      id: 'mem_' + Math.random().toString(36).substr(2, 9),
      savedAt: new Date().toISOString()
    };
    this.data.memories.unshift(newMemory);
    this.save();
    return newMemory;
  }

  deleteMemory(id: string): boolean {
    const initialLen = this.data.memories.length;
    this.data.memories = this.data.memories.filter(m => m.id !== id);
    if (this.data.memories.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Notes CRUD
  getNotes(): Note[] {
    return this.data.notes;
  }

  addNote(note: Omit<Note, 'id' | 'createdAt'>): Note {
    const newNote: Note = {
      ...note,
      id: 'note_' + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString()
    };
    this.data.notes.unshift(newNote);
    this.save();
    return newNote;
  }

  updateNote(id: string, text: string, tags?: string[]): Note | null {
    const note = this.data.notes.find(n => n.id === id);
    if (note) {
      note.text = text;
      if (tags) {
        note.tags = tags;
      }
      this.save();
      return note;
    }
    return null;
  }

  deleteNote(id: string): boolean {
    const initialLen = this.data.notes.length;
    this.data.notes = this.data.notes.filter(n => n.id !== id);
    if (this.data.notes.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Preferences CRUD
  getPreferences(): UserPreferences {
    return this.data.preferences;
  }

  updatePreferences(pref: Partial<UserPreferences>): UserPreferences {
    this.data.preferences = {
      ...this.data.preferences,
      ...pref
    };
    this.save();
    return this.data.preferences;
  }

  // Recommendations
  getRecommendations(): Recommendation[] {
    return this.data.recommendations;
  }

  setRecommendations(recs: Recommendation[]) {
    this.data.recommendations = recs;
    this.save();
  }
}

export const db = new Database();
export default db;
