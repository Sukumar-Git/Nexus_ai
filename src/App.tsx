import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Bookmark, 
  Compass, 
  Settings, 
  MessageSquare, 
  Search, 
  ExternalLink, 
  Trash2, 
  Plus, 
  Edit2, 
  Check, 
  X, 
  Clock, 
  FileText, 
  ArrowRight, 
  Lightbulb, 
  Maximize2, 
  Sliders, 
  HelpCircle,
  Copy,
  Info,
  Layers,
  Send,
  Wifi,
  ChevronRight,
  Monitor
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { SIMULATED_PAGES } from './data/pages';
import { Memory, Note, Recommendation, UserPreferences, ChatMessage, PageSummary } from './types';

export default function App() {
  // Page Simulation states
  const [activePageId, setActivePageId] = useState<string>('p1');
  const currentPage = SIMULATED_PAGES.find(p => p.id === activePageId) || SIMULATED_PAGES[0];
  
  // Highlighting simulation text states
  const [selectedText, setSelectedText] = useState<string>('');
  const [selectionCoords, setSelectionCoords] = useState<{ x: number; y: number } | null>(null);
  const articleRef = useRef<HTMLDivElement>(null);

  // App API State configurations
  const [hasApiKey, setHasApiKey] = useState<boolean>(false);
  const [appUrl, setAppUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'summary' | 'chat' | 'memory' | 'recommendations' | 'preferences'>('summary');
  
  // Summaries State cache
  const [summaries, setSummaries] = useState<Record<string, PageSummary>>({});
  const [loadingSummary, setLoadingSummary] = useState<boolean>(false);
  
  // Recommendations state
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState<boolean>(false);

  // Chats states
  const [chatMessages, setChatMessages] = useState<Record<string, ChatMessage[]>>({});
  const [inputMessage, setInputMessage] = useState<string>('');
  const [sendingChat, setSendingChat] = useState<boolean>(false);

  // DB Memories & Notes states
  const [memories, setMemories] = useState<Memory[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    interests: ['Artificial Intelligence', 'Software Development', 'Web Technologies', 'Productivity'],
    readingLevel: 'intermediate',
    proactivity: 'medium'
  });
  
  // Search states for memory tab
  const [memorySearchQuery, setMemorySearchQuery] = useState<string>('');
  const [selectedMemoryTag, setSelectedMemoryTag] = useState<string | null>(null);

  // Command Palette
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [commandQuery, setCommandQuery] = useState<string>('');

  // Onboarding flow
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(1);

  // Toolbar Extension Popup Simulator toggle
  const [showToolbarPopup, setShowToolbarPopup] = useState<boolean>(false);

  // New Note addition state
  const [newNoteText, setNewNoteText] = useState<string>('');
  const [newNoteTags, setNewNoteTags] = useState<string>('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteText, setEditingNoteText] = useState<string>('');

  // Status Notification popup
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Handle Keyboard shortcuts for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(prev => !prev);
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Fetch initial data from DB server
  useEffect(() => {
    fetchConfig();
    fetchMemories();
    fetchNotes();
    fetchPreferences();
  }, []);

  // Refetch recommendations when active page changes
  useEffect(() => {
    fetchPageRecommendations();
  }, [activePageId]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      setHasApiKey(data.hasApiKey);
      setAppUrl(data.appUrl);
    } catch (e) {
      console.error('Failed to fetch config status', e);
    }
  };

  const fetchMemories = async () => {
    try {
      const res = await fetch('/api/memories');
      const data = await res.json();
      setMemories(data);
    } catch (e) {
      console.error('Failed to fetch memories', e);
    }
  };

  const fetchNotes = async () => {
    try {
      const res = await fetch('/api/notes');
      const data = await res.json();
      setNotes(data);
    } catch (e) {
      console.error('Failed to fetch notes', e);
    }
  };

  const fetchPreferences = async () => {
    try {
      const res = await fetch('/api/preferences');
      const data = await res.json();
      if (data && !data.error) {
        setPreferences(data);
      }
    } catch (e) {
      console.error('Failed to fetch preferences', e);
    }
  };

  const fetchPageRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const res = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: currentPage.url,
          title: currentPage.title,
          text: currentPage.content
        })
      });
      const data = await res.json();
      setRecommendations(data);
    } catch (e) {
      console.error('Failed to fetch recommendations', e);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Trigger page summarization
  const handleSummarize = async () => {
    if (loadingSummary) return;
    setLoadingSummary(true);
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: currentPage.url,
          title: currentPage.title,
          text: currentPage.content
        })
      });
      const data = await res.json();
      setSummaries(prev => ({
        ...prev,
        [currentPage.url]: data
      }));
      showToast(`Successfully analyzed & summarized: "${currentPage.title}"`);
    } catch (e) {
      console.error('Failed to summarize page', e);
      showToast('Error generating page summary.');
    } finally {
      setLoadingSummary(false);
    }
  };

  // Monitor text highlighting in the webpage simulated window
  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 0) {
      const text = selection.toString().trim();
      setSelectedText(text);

      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      
      // Calculate coordinates relative to container window
      if (articleRef.current) {
        const parentRect = articleRef.current.getBoundingClientRect();
        setSelectionCoords({
          x: Math.min(parentRect.width - 150, Math.max(10, rect.left - parentRect.left + rect.width / 2 - 80)),
          y: rect.top - parentRect.top - 50 + articleRef.current.scrollTop
        });
      }
    } else {
      setSelectedText('');
      setSelectionCoords(null);
    }
  };

  // Trigger save selection to memory (with auto-tagging from backend API)
  const handleSaveSelectedMemory = async (customText?: string) => {
    const textToSave = customText || selectedText;
    if (!textToSave) return;

    showToast('Extracting smart tags & saving clip...');
    
    // Clear selection
    setSelectedText('');
    setSelectionCoords(null);
    window.getSelection()?.removeAllRanges();

    try {
      // 1. Generate tags via API
      const tagRes = await fetch('/api/generate-tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: textToSave })
      });
      const tagData = await tagRes.json();
      const tags = tagData.tags || ['SavedClip'];

      // 2. Save memory via API
      const saveRes = await fetch('/api/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: currentPage.url,
          title: currentPage.title,
          content: textToSave,
          tags
        })
      });
      const newMem = await saveRes.json();
      setMemories(prev => [newMem, ...prev]);
      showToast('Saved clipping to Nexus Memory store!');
    } catch (e) {
      console.error('Failed to save memory', e);
      showToast('Failed to save highlight to cloud.');
    }
  };

  // Manual Note capture
  const handleAddManualNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const tagsArr = newNoteTags
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: currentPage.url,
          title: currentPage.title,
          text: newNoteText,
          tags: tagsArr.length ? tagsArr : ['Nexus'],
          snippet: selectedText || undefined
        })
      });
      const newNote = await res.json();
      setNotes(prev => [newNote, ...prev]);
      setNewNoteText('');
      setNewNoteTags('');
      showToast('Captured contextual note!');
    } catch (e) {
      console.error('Failed to create note', e);
    }
  };

  // Update note text
  const handleUpdateNote = async (id: string) => {
    if (!editingNoteText.trim()) return;
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: editingNoteText })
      });
      const updated = await res.json();
      setNotes(prev => prev.map(n => n.id === id ? updated : n));
      setEditingNoteId(null);
      setEditingNoteText('');
      showToast('Note updated successfully!');
    } catch (e) {
      console.error('Failed to update note', e);
    }
  };

  // Delete memory
  const handleDeleteMemory = async (id: string) => {
    try {
      const res = await fetch(`/api/memories/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMemories(prev => prev.filter(m => m.id !== id));
        showToast('Memory item deleted.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Delete note
  const handleDeleteNote = async (id: string) => {
    try {
      const res = await fetch(`/api/notes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotes(prev => prev.filter(n => n.id !== id));
        showToast('Note item deleted.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Chat message send
  const handleSendMessage = async (e?: React.FormEvent, presetMsg?: string) => {
    if (e) e.preventDefault();
    const messageToSend = presetMsg || inputMessage;
    if (!messageToSend.trim() || sendingChat) return;

    const userMsg: ChatMessage = {
      id: 'chat_' + Math.random().toString(36).substr(2, 9),
      sender: 'user',
      text: messageToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update messages for current page
    const pageChats = chatMessages[activePageId] || [];
    const updatedChats = [...pageChats, userMsg];
    setChatMessages(prev => ({
      ...prev,
      [activePageId]: updatedChats
    }));

    if (!presetMsg) setInputMessage('');
    setSendingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          history: pageChats,
          pageContent: {
            url: currentPage.url,
            title: currentPage.title,
            text: currentPage.content
          }
        })
      });
      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: 'chat_' + Math.random().toString(36).substr(2, 9),
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages(prev => ({
        ...prev,
        [activePageId]: [...updatedChats, assistantMsg]
      }));
    } catch (e) {
      console.error(e);
      const errorMsg: ChatMessage = {
        id: 'chat_err_' + Date.now(),
        sender: 'assistant',
        text: 'Sorry, I encountered an issue connecting to the AI brain. Please check your connection or try again!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => ({
        ...prev,
        [activePageId]: [...updatedChats, errorMsg]
      }));
    } finally {
      setSendingChat(false);
    }
  };

  // Save Preferences
  const handleUpdatePreferences = async (newPref: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...newPref };
    setPreferences(updated);
    try {
      await fetch('/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPref)
      });
    } catch (e) {
      console.error('Failed to update preferences', e);
    }
  };

  const handleInterestToggle = (interest: string) => {
    let currentInterests = [...preferences.interests];
    if (currentInterests.includes(interest)) {
      currentInterests = currentInterests.filter(i => i !== interest);
    } else {
      currentInterests.push(interest);
    }
    handleUpdatePreferences({ interests: currentInterests });
  };

  // Filter memories/notes for Memory Tab Search
  const allUniqueTags = Array.from(
    new Set([
      ...memories.flatMap(m => m.tags),
      ...notes.flatMap(n => n.tags)
    ])
  );

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.content.toLowerCase().includes(memorySearchQuery.toLowerCase()) || 
                          m.title.toLowerCase().includes(memorySearchQuery.toLowerCase());
    const matchesTag = selectedMemoryTag ? m.tags.includes(selectedMemoryTag) : true;
    return matchesSearch && matchesTag;
  });

  const filteredNotes = notes.filter(n => {
    const matchesSearch = n.text.toLowerCase().includes(memorySearchQuery.toLowerCase()) || 
                          n.title.toLowerCase().includes(memorySearchQuery.toLowerCase());
    const matchesTag = selectedMemoryTag ? n.tags.includes(selectedMemoryTag) : true;
    return matchesSearch && matchesTag;
  });

  // Commands lookup for Command Palette
  const defaultCommands = [
    { 
      id: 'c1', 
      category: 'AI Action', 
      title: 'Summarize Active Webpage', 
      desc: 'Asynchronously extract key takeaways and TL;DR', 
      action: () => { handleSummarize(); setActiveTab('summary'); setCommandPaletteOpen(false); } 
    },
    { 
      id: 'c2', 
      category: 'Navigation', 
      title: 'Open Companion AI Chat', 
      desc: 'Chat directly with active tab context', 
      action: () => { setActiveTab('chat'); setCommandPaletteOpen(false); } 
    },
    { 
      id: 'c3', 
      category: 'Navigation', 
      title: 'Open Memory Store', 
      desc: 'View highlight logs and search saved notes', 
      action: () => { setActiveTab('memory'); setCommandPaletteOpen(false); } 
    },
    { 
      id: 'c4', 
      category: 'Navigation', 
      title: 'Open Recommendations', 
      desc: 'See context-complementary resources and guides', 
      action: () => { setActiveTab('recommendations'); setCommandPaletteOpen(false); } 
    },
    { 
      id: 'c5', 
      category: 'Navigation', 
      title: 'Open Extension Preferences', 
      desc: 'Set interests, reading level, and cognitive focus', 
      action: () => { setActiveTab('preferences'); setCommandPaletteOpen(false); } 
    },
    { 
      id: 'c6', 
      category: 'Quick Save', 
      title: 'Save Active Webpage reference', 
      desc: 'Store current URL and title with metadata', 
      action: () => { handleSaveSelectedMemory(`Webpage Bookmark Reference: ${currentPage.title} (${currentPage.url})`); setCommandPaletteOpen(false); } 
    },
    { 
      id: 'c7', 
      category: 'Simulation', 
      title: 'Switch to MDN Async/Await Webpage', 
      desc: 'Simulate browsing JavaScript documentation', 
      action: () => { setActivePageId('p2'); setCommandPaletteOpen(false); } 
    },
    { 
      id: 'c8', 
      category: 'Simulation', 
      title: 'Switch to Quantum Computing Webpage', 
      desc: 'Simulate browsing quantum mechanical superpositions', 
      action: () => { setActivePageId('p1'); setCommandPaletteOpen(false); } 
    },
    { 
      id: 'c9', 
      category: 'Simulation', 
      title: 'Switch to Agentic Workflows Tech Blog', 
      desc: 'Simulate reading AI architecture whitepapers', 
      action: () => { setActivePageId('p3'); setCommandPaletteOpen(false); } 
    },
    {
      id: 'c10',
      category: 'Guide',
      title: 'How to install unpack extension in Chrome',
      desc: 'View Chrome extension loading instructions',
      action: () => { setShowOnboarding(true); setOnboardingStep(2); setCommandPaletteOpen(false); }
    }
  ];

  const filteredCommands = defaultCommands.filter(c => 
    c.title.toLowerCase().includes(commandQuery.toLowerCase()) || 
    c.category.toLowerCase().includes(commandQuery.toLowerCase()) ||
    c.desc.toLowerCase().includes(commandQuery.toLowerCase())
  );

  const activeSummary = summaries[currentPage.url];

  return (
    <div className="bg-[#09090B] text-zinc-100 min-h-screen flex flex-col font-sans overflow-x-hidden select-none selection:bg-indigo-600/30 selection:text-white">
      
      {/* Dynamic Toast Alerts */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-indigo-600 text-white font-bold px-6 py-3 rounded-full shadow-2xl border border-indigo-500/30 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
            <span className="text-xs uppercase tracking-wider">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Layer */}
      <div className="flex flex-1 min-h-screen overflow-hidden">
        
        {/* ==========================================
            LEFT SIDE: MOCK WEB BROWSER WORKSPACE
           ========================================== */}
        <div className="flex-1 bg-zinc-50 flex flex-col relative overflow-hidden border-r border-zinc-200">
          
          {/* Simulated Browser Address Bar & Tabs */}
          <div className="h-14 bg-zinc-100 border-b border-zinc-200/80 flex items-center px-4 justify-between gap-4 shrink-0">
            
            {/* Window control dots */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-green-400"></div>
            </div>

            {/* Simulated Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto max-w-lg">
              {SIMULATED_PAGES.map(page => (
                <button
                  key={page.id}
                  onClick={() => {
                    setActivePageId(page.id);
                    setSelectedText('');
                    setSelectionCoords(null);
                  }}
                  className={`px-4 py-1.5 rounded-t-lg text-xs font-semibold flex items-center gap-2 border-t transition-all shrink-0 ${
                    activePageId === page.id 
                    ? 'bg-white text-zinc-900 border-zinc-200 shadow-xs' 
                    : 'text-zinc-500 hover:text-zinc-800 border-transparent bg-transparent'
                  }`}
                >
                  <FileText className="w-3 h-3 text-zinc-400" />
                  <span className="max-w-[120px] truncate">{page.title}</span>
                </button>
              ))}
            </div>

            {/* URL Display bar with dynamic target selector */}
            <div className="flex-1 max-w-xl bg-white h-8 rounded-lg border border-zinc-200 flex items-center px-3 justify-between shadow-xs">
              <div className="flex items-center gap-2 truncate">
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-mono font-bold tracking-tight shrink-0">HTTPS</span>
                <span className="text-xs text-zinc-500 truncate font-medium font-mono">{currentPage.url}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-zinc-400 font-sans tracking-tight">Active Tab Workspace</span>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              </div>
            </div>

            {/* Simulate Toolbar Click popup launcher */}
            <button 
              onClick={() => setShowToolbarPopup(prev => !prev)}
              className="px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-lg text-xs font-bold text-indigo-600 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Simulate Extension Popup</span>
            </button>
          </div>

          {/* Simulated Webpage Body Canvas */}
          <div 
            ref={articleRef}
            onMouseUp={handleTextSelection}
            onKeyUp={handleTextSelection}
            className="p-12 md:p-16 lg:p-20 flex-1 text-zinc-900 overflow-y-auto relative bg-zinc-50 scroll-smooth"
          >
            {/* Highlights floating action panel */}
            <AnimatePresence>
              {selectionCoords && selectedText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 10 }}
                  className="absolute z-40 bg-[#09090B] text-white py-1.5 px-2.5 rounded-xl shadow-2xl border border-zinc-800 flex items-center gap-1.5"
                  style={{ left: `${selectionCoords.x}px`, top: `${selectionCoords.y}px` }}
                >
                  <button 
                    onClick={() => handleSaveSelectedMemory()}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-indigo-400 hover:bg-zinc-900 rounded-lg transition-colors"
                  >
                    <Bookmark className="w-3 h-3 text-indigo-400" />
                    <span>Save highlight</span>
                  </button>
                  <div className="h-4 w-px bg-zinc-800"></div>
                  <button 
                    onClick={() => {
                      setActiveTab('chat');
                      handleSendMessage(undefined, `Regarding this quote from the page: "${selectedText}". Can you explain this concept in more detail?`);
                      setSelectedText('');
                      setSelectionCoords(null);
                    }}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-zinc-400 hover:bg-zinc-900 rounded-lg transition-colors"
                  >
                    <MessageSquare className="w-3 h-3 text-zinc-400" />
                    <span>Ask Nexus</span>
                  </button>
                  <div className="h-4 w-px bg-zinc-800"></div>
                  <button 
                    onClick={() => {
                      setSelectedText('');
                      setSelectionCoords(null);
                      window.getSelection()?.removeAllRanges();
                    }}
                    className="p-1 text-zinc-500 hover:text-white rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="max-w-3xl mx-auto space-y-12">
              
              {/* Header Info */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-zinc-900 text-zinc-100 rounded-full text-xs font-bold uppercase tracking-wider">
                    {currentPage.category}
                  </span>
                  <span className="text-zinc-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {currentPage.readTime}
                  </span>
                </div>
                
                {/* BOLD TYPOGRAPHY: Huge Heavy Titles */}
                <h1 className="text-6xl md:text-7xl font-black leading-[0.9] tracking-tighter text-zinc-950 uppercase select-text">
                  {currentPage.title.split('—')[0].trim()}.
                </h1>
                
                <div className="h-2 w-32 bg-zinc-900"></div>
                
                <div className="text-xs text-zinc-500 font-mono tracking-tight uppercase">
                  Published by <span className="font-bold text-zinc-800">{currentPage.author}</span>
                </div>
              </div>

              {/* Responsive Text Highlight Tooltip Instructions */}
              <div className="bg-yellow-50 border-l-4 border-amber-500/80 p-4 rounded-r-xl flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-700 leading-relaxed">
                  <strong className="text-zinc-900 font-bold block mb-1">Interactive Sandbox Tip</strong>
                  Select or highlight any sentence/paragraph on this simulated page to reveal the custom floating <strong className="text-indigo-600">Nexus Context Menu</strong>, or copy selected items straight to your personal AI memory bank.
                </div>
              </div>

              {/* Article content in custom Typography layout */}
              <div className="space-y-6 text-lg leading-relaxed text-zinc-700 font-serif select-text">
                {currentPage.content.split('\n\n').map((para, idx) => {
                  if (para.startsWith('Potential Applications:') || para.startsWith('Key Design Patterns') || para.startsWith('How it Works:')) {
                    return (
                      <h3 key={idx} className="text-xl font-black tracking-tight text-zinc-900 uppercase pt-4 font-sans border-b-2 border-zinc-200 pb-1">
                        {para}
                      </h3>
                    );
                  }
                  if (para.match(/^\d+\./)) {
                    return (
                      <div key={idx} className="pl-4 py-2 border-l-2 border-zinc-900 bg-zinc-100/50 rounded-r-xl text-sm font-sans my-4">
                        {para}
                      </div>
                    );
                  }
                  if (para.includes('Code Pattern:')) {
                    return (
                      <div key={idx} className="my-4 font-sans text-xs">
                        <div className="font-bold uppercase tracking-wider text-zinc-400 mb-1">Code block snippet</div>
                        <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-xl overflow-x-auto font-mono leading-relaxed">
                          {para}
                        </pre>
                      </div>
                    );
                  }
                  return (
                    <p key={idx} className="first-letter:text-4xl first-letter:font-black first-letter:text-zinc-950 first-letter:float-left first-letter:mr-2">
                      {para}
                    </p>
                  );
                })}
              </div>

            </div>
          </div>

          {/* Absolute Background Gradient Fade at the Bottom for visual flair */}
          <div className="h-16 bg-gradient-to-t from-zinc-50 to-transparent pointer-events-none absolute bottom-0 left-0 right-0"></div>
        </div>

        {/* ==========================================
            RIGHT SIDE: CHROME SIDE PANEL ("NEXUS")
           ========================================== */}
        <aside className="w-[420px] bg-[#09090B] border-l border-zinc-800 flex flex-col shrink-0 select-none relative">
          
          {/* Header containing brand logo & status indicators */}
          <header className="p-6 border-b border-zinc-800 flex items-center justify-between bg-zinc-950 shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <div className="w-4.5 h-4.5 border-2 border-white rounded rotate-45 flex items-center justify-center font-black text-[10px] text-white">N</div>
              </div>
              <div>
                <span className="text-base font-black tracking-tighter block text-white">NEXUS AI</span>
                <span className="text-[10px] text-zinc-500 font-mono tracking-tight uppercase">Companion Side Panel v1</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dynamic Connection status */}
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-emerald-400 uppercase tracking-widest">
                  {loadingSummary ? 'Parsing...' : 'Active'}
                </span>
              </div>
              
              <button
                onClick={() => setShowOnboarding(true)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-900 transition-colors"
                title="View Extension Installation Help"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Quick Stats bar: Standard reading time vs Saved reading time ratios */}
          <div className="bg-zinc-950/80 px-6 py-3 border-b border-zinc-800 flex items-center justify-between text-xs font-mono tracking-tight shrink-0">
            <div className="flex items-center gap-2 text-zinc-400">
              <Clock className="w-3.5 h-3.5 text-zinc-500" />
              <span>Standard: <strong className="text-zinc-200">{currentPage.readTime}</strong></span>
            </div>
            <div className="h-4 w-px bg-zinc-800"></div>
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Saved Time: <strong className="text-white font-bold">{activeSummary ? `${activeSummary.readingTimeSaved} min` : 'Pending'}</strong></span>
            </div>
          </div>

          {/* Custom Tabs Navigation Header */}
          <div className="bg-zinc-950 px-4 border-b border-zinc-800 flex items-center justify-between overflow-x-auto shrink-0 scrollbar-none">
            {[
              { id: 'summary', label: 'Summary', icon: FileText },
              { id: 'chat', label: 'Ask AI', icon: MessageSquare },
              { id: 'memory', label: 'Memories', icon: Bookmark },
              { id: 'recommendations', label: 'Smart Recs', icon: Compass },
              { id: 'preferences', label: 'Focus', icon: Settings }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-3 border-b-2 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 transition-all shrink-0 ${
                    isActive 
                    ? 'border-indigo-500 text-white bg-indigo-500/5' 
                    : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-400 animate-pulse' : 'text-zinc-500'}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* MAIN TAB VIEWPORT CANVAS */}
          <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#09090B]/50">

            {/* TAB 1: SUMMARY VIEW */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                
                {/* Active summary block */}
                {activeSummary ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="space-y-6"
                  >
                    
                    {/* TL;DR Card block */}
                    <div className="space-y-3 bg-zinc-950 p-5 rounded-2xl border border-zinc-800 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-300 animate-spin" />
                          <span>Cognitive TL;DR</span>
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest bg-zinc-900 px-2 py-0.5 rounded">
                          {activeSummary.category}
                        </span>
                      </div>
                      
                      {/* TL;DR Typography */}
                      <p className="text-zinc-200 text-sm leading-relaxed font-serif italic">
                        "{activeSummary.tldr}"
                      </p>

                      {/* Display estimated savings metrics inside summary card */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-900">
                        <div className="p-2.5 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
                          <div className="text-[9px] font-mono text-zinc-500 uppercase">Estimated Page Duration</div>
                          <div className="text-base font-black text-zinc-300">{activeSummary.estimatedReadingTime} min</div>
                        </div>
                        <div className="p-2.5 bg-indigo-950/30 rounded-xl border border-indigo-900/40">
                          <div className="text-[9px] font-mono text-indigo-400 uppercase">Efficiency Saved</div>
                          <div className="text-base font-black text-indigo-300">-{activeSummary.readingTimeSaved} min</div>
                        </div>
                      </div>
                    </div>

                    {/* Key takeaways bullet series */}
                    <div className="space-y-4">
                      <h2 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        Core Takeaways & Structural Outline
                      </h2>
                      
                      <div className="space-y-3">
                        {activeSummary.keyPoints.map((point, i) => (
                          <motion.div 
                            key={i} 
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="p-4 bg-zinc-900/40 border border-zinc-800 rounded-xl flex items-start gap-3 hover:border-zinc-700 transition-colors"
                          >
                            <span className="w-5 h-5 rounded-full bg-zinc-800 flex items-center justify-center text-[10px] font-bold text-zinc-400 shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <span className="text-xs text-zinc-300 leading-relaxed font-sans select-text">
                              {point}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    {/* Quick actions box */}
                    <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bookmark className="w-4 h-4 text-indigo-400" />
                        <div>
                          <div className="text-xs font-bold text-zinc-200">Save full analysis?</div>
                          <div className="text-[10px] text-zinc-500">Add TL;DR block directly to memory.</div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleSaveSelectedMemory(`Page Executive Summary of [${currentPage.title}]: ${activeSummary.tldr}`)}
                        className="px-3 py-1.5 bg-indigo-600 text-white font-bold text-[11px] rounded-lg hover:bg-indigo-500 transition-all uppercase tracking-wider"
                      >
                        Capture
                      </button>
                    </div>

                    {/* Redo check button */}
                    <button 
                      onClick={handleSummarize}
                      className="w-full py-3 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-xl border border-zinc-800 transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Re-Analyze Content</span>
                    </button>

                  </motion.div>
                ) : (
                  <div className="space-y-6 py-6 text-center">
                    
                    {/* Placeholder illustration style */}
                    <div className="w-20 h-20 bg-zinc-900 border border-zinc-800/80 rounded-2xl flex items-center justify-center mx-auto shadow-inner relative">
                      <FileText className="w-8 h-8 text-zinc-600" />
                      <div className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-indigo-500 animate-ping"></div>
                    </div>

                    <div className="max-w-xs mx-auto space-y-2">
                      <h3 className="text-sm font-black text-white uppercase tracking-wider">Analyze Webpage DOM</h3>
                      <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                        Nexus is synced with your active browser tab. Ready to extract structured summaries, reading stats, and key outline concepts dynamically.
                      </p>
                    </div>

                    {/* API Secret status note */}
                    <div className="p-3 bg-zinc-950 border border-zinc-900 rounded-xl max-w-sm mx-auto flex items-start gap-2 text-left">
                      <Info className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-zinc-500 font-mono tracking-tight leading-relaxed">
                        {hasApiKey 
                          ? '✅ Google Gemini Key is detected. Summary will be custom-generated.' 
                          : 'ℹ️ Key missing. Running high-fidelity local cognitive heuristic builder.'
                        }
                      </p>
                    </div>

                    <button
                      onClick={handleSummarize}
                      disabled={loadingSummary}
                      className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2"
                    >
                      {loadingSummary ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                          <span>Executing Cog-Analytic Pipeline...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          <span>Summarize Webpage</span>
                        </>
                      )}
                    </button>

                    {/* Skeleton loading preview box */}
                    {loadingSummary && (
                      <div className="space-y-4 pt-4 border-t border-zinc-900 text-left">
                        <div className="animate-pulse space-y-3">
                          <div className="h-4 bg-zinc-900 rounded w-1/3"></div>
                          <div className="h-20 bg-zinc-900 rounded-xl"></div>
                          <div className="h-3 bg-zinc-900 rounded w-2/3"></div>
                          <div className="h-10 bg-zinc-900 rounded-xl"></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: AI COMPANION CONTEXT CHAT */}
            {activeTab === 'chat' && (
              <div className="space-y-6 flex flex-col h-[520px]">
                
                {/* Active topic contextual indicator header */}
                <div className="bg-zinc-950 p-3 rounded-xl border border-zinc-800 flex items-center gap-2 justify-between shrink-0">
                  <div className="flex items-center gap-1.5 truncate">
                    <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></div>
                    <span className="text-[10px] text-zinc-400 truncate">Chat focused on: <strong>{currentPage.title.split('—')[0]}</strong></span>
                  </div>
                  <button 
                    onClick={() => {
                      setChatMessages(prev => ({ ...prev, [activePageId]: [] }));
                      showToast('Cleared active chat log.');
                    }}
                    className="text-[9px] text-zinc-600 hover:text-zinc-400 font-mono uppercase tracking-tight"
                  >
                    Clear Chat
                  </button>
                </div>

                {/* Messages feed */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1 min-h-0 select-text">
                  {(chatMessages[activePageId] || []).length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-8">
                      <div className="w-12 h-12 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                        <MessageSquare className="w-6 h-6 text-zinc-500" />
                      </div>
                      <div className="max-w-xs space-y-1">
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Start Companion Discussion</h4>
                        <p className="text-[11px] text-zinc-500 leading-relaxed font-sans">
                          Ask questions regarding details in the webpage, define concepts, or organize research notes instantly with your context-bound copilot.
                        </p>
                      </div>

                      {/* Prominent Quick-chat chips */}
                      <div className="w-full space-y-2 pt-2 text-left">
                        <div className="text-[9px] font-black text-zinc-600 uppercase tracking-wider">Example Page Prompts</div>
                        {activePageId === 'p1' && [
                          'Explain qubits and superposition simply',
                          'What is quantum decoherence and error correction?',
                          'How does Shor\'s Algorithm impact cryptography?'
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(undefined, chip)}
                            className="w-full text-left p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 transition-all hover:border-indigo-500/30 flex items-center justify-between"
                          >
                            <span className="truncate">{chip}</span>
                            <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                          </button>
                        ))}
                        {activePageId === 'p2' && [
                          'Compare promises and callbacks',
                          'Explain standard error handling in async/await',
                          'What is Promise.all() parallel execution?'
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(undefined, chip)}
                            className="w-full text-left p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 transition-all hover:border-indigo-500/30 flex items-center justify-between"
                          >
                            <span className="truncate">{chip}</span>
                            <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                          </button>
                        ))}
                        {activePageId === 'p3' && [
                          'What are agentic workflows in Generative AI?',
                          'Explain the multi-agent collaboration pattern',
                          'What is reflection and tool use in model planning?'
                        ].map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleSendMessage(undefined, chip)}
                            className="w-full text-left p-2.5 bg-zinc-950 hover:bg-zinc-900 border border-zinc-800 rounded-xl text-xs text-zinc-300 transition-all hover:border-indigo-500/30 flex items-center justify-between"
                          >
                            <span className="truncate">{chip}</span>
                            <ArrowRight className="w-3 h-3 text-zinc-600 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {(chatMessages[activePageId] || []).map((msg, idx) => (
                        <div 
                          key={msg.id}
                          className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                        >
                          <div className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed select-text ${
                            msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-tr-none'
                            : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none font-serif'
                          }`}>
                            <div className="whitespace-pre-line">
                              {msg.text}
                            </div>
                          </div>
                          <span className="text-[9px] text-zinc-600 font-mono tracking-tight mt-1 px-1">
                            {msg.sender === 'user' ? 'You' : 'Nexus AI'} • {msg.timestamp}
                          </span>
                        </div>
                      ))}

                      {sendingChat && (
                        <div className="flex flex-col items-start">
                          <div className="bg-zinc-900 text-zinc-400 border border-zinc-800 rounded-2xl rounded-tl-none p-4 text-xs flex items-center gap-2">
                            <div className="flex gap-1">
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></div>
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                              <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                            </div>
                            <span>Nexus model reasoning...</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Input prompt bar */}
                <form onSubmit={handleSendMessage} className="pt-2 border-t border-zinc-800 flex items-center gap-2 shrink-0">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask about details in this page..."
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={sendingChat || !inputMessage.trim()}
                    className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl disabled:bg-zinc-900 disabled:text-zinc-600 transition-colors shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

              </div>
            )}

            {/* TAB 3: SEARCHABLE MEMORY FEED & CONTEXT NOTES */}
            {activeTab === 'memory' && (
              <div className="space-y-6">
                
                {/* Search / Filter Headers */}
                <div className="space-y-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-zinc-500" />
                    <input
                      type="text"
                      value={memorySearchQuery}
                      onChange={(e) => setMemorySearchQuery(e.target.value)}
                      placeholder="Search saved highlights or notes..."
                      className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                    />
                  </div>

                  {/* Filter tags buttons series */}
                  {allUniqueTags.length > 0 && (
                    <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none">
                      <button
                        onClick={() => setSelectedMemoryTag(null)}
                        className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                          selectedMemoryTag === null 
                          ? 'bg-indigo-600 text-white' 
                          : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                        }`}
                      >
                        All ({memories.length + notes.length})
                      </button>
                      {allUniqueTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setSelectedMemoryTag(tag === selectedMemoryTag ? null : tag)}
                          className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all shrink-0 ${
                            tag === selectedMemoryTag 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-zinc-900 text-zinc-500 hover:text-zinc-300'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Captured content creation box */}
                <form onSubmit={handleAddManualNote} className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl space-y-3">
                  <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Capture Active Context Note</span>
                  </div>
                  
                  <textarea
                    rows={2}
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Write your research takeaway, preference, or concept summary..."
                    className="w-full bg-zinc-900 border border-zinc-800/80 rounded-xl p-3 text-xs text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  ></textarea>

                  <div className="flex items-center gap-2 justify-between">
                    <input
                      type="text"
                      value={newNoteTags}
                      onChange={(e) => setNewNoteTags(e.target.value)}
                      placeholder="tags (comma separated e.g. code, math)"
                      className="bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300 px-3 py-1.5 rounded-lg w-1/2 placeholder:text-zinc-600"
                    />
                    <button
                      type="submit"
                      disabled={!newNoteText.trim()}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors disabled:bg-zinc-900 disabled:text-zinc-600"
                    >
                      Save Note
                    </button>
                  </div>
                </form>

                {/* Dual memories list and notes lists */}
                <div className="space-y-6">
                  
                  {/* Highlights section */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                        Saved Highlight Snippets ({filteredMemories.length})
                      </h3>
                      {selectedMemoryTag && <span className="text-[9px] font-mono text-indigo-400">Filtered by {selectedMemoryTag}</span>}
                    </div>

                    {filteredMemories.length === 0 ? (
                      <div className="p-6 bg-zinc-950/40 border border-zinc-900 text-center rounded-2xl">
                        <p className="text-xs text-zinc-600">No saved highlights found matching criteria.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredMemories.map(mem => (
                          <motion.div
                            key={mem.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-zinc-950 border border-zinc-850 rounded-2xl space-y-3 relative group"
                          >
                            <button
                              onClick={() => handleDeleteMemory(mem.id)}
                              className="absolute top-4 right-4 p-1 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Delete Memory"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                            <div className="text-[10px] text-zinc-500 font-mono tracking-tight uppercase truncate max-w-[85%]">
                              From: <strong className="text-zinc-400">{mem.title}</strong>
                            </div>

                            <p className="text-xs text-zinc-300 italic font-serif leading-relaxed select-text border-l-2 border-indigo-500/50 pl-2">
                              "{mem.content}"
                            </p>

                            <div className="flex items-center justify-between pt-1">
                              <div className="flex flex-wrap gap-1.5">
                                {mem.tags.map(tag => (
                                  <span key={tag} className="px-2 py-0.5 bg-indigo-505/10 bg-zinc-900 border border-zinc-800 rounded text-[9px] font-bold text-indigo-400">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <span className="text-[8px] font-mono text-zinc-600">
                                {new Date(mem.savedAt).toLocaleDateString()}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Contextual Notes section */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      Custom Research Notes ({filteredNotes.length})
                    </h3>

                    {filteredNotes.length === 0 ? (
                      <div className="p-6 bg-zinc-950/40 border border-zinc-900 text-center rounded-2xl">
                        <p className="text-xs text-zinc-600">No contextual notes recorded yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {filteredNotes.map(note => (
                          <motion.div
                            key={note.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="p-4 bg-zinc-900/20 border border-zinc-800 rounded-2xl space-y-3 relative group"
                          >
                            <div className="flex items-start justify-between">
                              <div className="text-[10px] text-zinc-500 font-mono tracking-tight uppercase truncate max-w-[70%]">
                                Context: <strong className="text-zinc-400">{note.title}</strong>
                              </div>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={() => {
                                    setEditingNoteId(note.id);
                                    setEditingNoteText(note.text);
                                  }}
                                  className="p-1 text-zinc-500 hover:text-white"
                                  title="Edit Note"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteNote(note.id)}
                                  className="p-1 text-zinc-500 hover:text-red-400"
                                  title="Delete Note"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {/* Snippet preview if attached */}
                            {note.snippet && (
                              <div className="text-[10px] text-zinc-500 leading-relaxed italic border-l border-zinc-700 pl-2 line-clamp-2">
                                Anchor Quote: "{note.snippet}"
                              </div>
                            )}

                            {editingNoteId === note.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingNoteText}
                                  onChange={(e) => setEditingNoteText(e.target.value)}
                                  rows={2}
                                  className="w-full bg-zinc-950 border border-indigo-500 rounded-xl p-2.5 text-xs text-white"
                                ></textarea>
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    onClick={() => setEditingNoteId(null)}
                                    className="px-2.5 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-bold rounded"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleUpdateNote(note.id)}
                                    className="px-2.5 py-1 bg-indigo-600 text-white text-[10px] font-bold rounded flex items-center gap-1"
                                  >
                                    <Check className="w-3 h-3" />
                                    <span>Save</span>
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-xs text-zinc-200 leading-relaxed font-sans select-text whitespace-pre-wrap">
                                {note.text}
                              </p>
                            )}

                            <div className="flex items-center justify-between pt-1 border-t border-zinc-900">
                              <div className="flex flex-wrap gap-1">
                                {note.tags.map(tag => (
                                  <span key={tag} className="px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-bold text-zinc-400">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                              <span className="text-[8px] font-mono text-zinc-600">
                                {new Date(note.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

            {/* TAB 4: SMART RECOMMENDATIONS LIST */}
            {activeTab === 'recommendations' && (
              <div className="space-y-6">
                
                <div className="space-y-2">
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Cognitive Context Linkage</div>
                  <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight">Proactive Complementary Resources</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed font-sans">
                    These documentation files, guides, and tutorials are dynamically generated by analyzing the core topic clusters of **{currentPage.title.split('—')[0]}**.
                  </p>
                </div>

                {loadingRecommendations ? (
                  <div className="space-y-4 animate-pulse">
                    <div className="h-24 bg-zinc-900 rounded-2xl"></div>
                    <div className="h-24 bg-zinc-900 rounded-2xl"></div>
                  </div>
                ) : recommendations.length === 0 ? (
                  <div className="p-8 bg-zinc-950/40 border border-zinc-900 text-center rounded-2xl">
                    <p className="text-xs text-zinc-500">No active recommendations. Click "Summarize Webpage" or browse content to boot recommendations engine.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendations.map((rec, i) => (
                      <motion.div
                        key={rec.id || i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-5 bg-zinc-950 border border-zinc-850 hover:border-zinc-750 transition-all rounded-2xl space-y-3 relative group"
                      >
                        <div className="flex justify-between items-start">
                          <span className="px-2 py-0.5 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded text-[9px] font-black uppercase tracking-wider font-mono">
                            {rec.category}
                          </span>
                          <span className="text-[9px] text-zinc-600 font-mono uppercase tracking-tighter">
                            Verified Source Link
                          </span>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors select-text">
                            {rec.title}
                          </h4>
                          <p className="text-xs text-zinc-400 leading-relaxed font-serif mt-1 select-text">
                            {rec.description}
                          </p>
                        </div>

                        {/* Match Reason Indicator */}
                        <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-850 space-y-1">
                          <div className="text-[8px] font-black text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-amber-400" />
                            <span>Nexus Context Fit Reason</span>
                          </div>
                          <p className="text-[10px] text-zinc-400 font-sans leading-relaxed select-text">
                            {rec.matchReason}
                          </p>
                        </div>

                        <div className="pt-1 flex items-center justify-end">
                          <a
                            href={rec.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 hover:text-white flex items-center gap-1.5 transition-colors"
                          >
                            <span>Open Resource</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB 5: PREFERENCES / PERSONALIZATION */}
            {activeTab === 'preferences' && (
              <div className="space-y-6">
                
                <div className="space-y-1">
                  <h3 className="text-base font-black text-white uppercase tracking-tight">Personalization Settings</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">
                    Tune how the Nexus cognitive engine summarizes pages, generates chat suggestions, and links complementary documentation models.
                  </p>
                </div>

                {/* Target Reading level select */}
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Target Explanation Density & Level
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'beginner', label: 'Beginner', desc: 'No-jargon summaries' },
                      { id: 'intermediate', label: 'Intermediate', desc: 'Standard balance' },
                      { id: 'advanced', label: 'Advanced', desc: 'Technical & complete' }
                    ].map(lvl => (
                      <button
                        key={lvl.id}
                        type="button"
                        onClick={() => handleUpdatePreferences({ readingLevel: lvl.id as any })}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          preferences.readingLevel === lvl.id
                          ? 'border-indigo-500 bg-indigo-500/5 text-white shadow-md shadow-indigo-500/1s'
                          : 'border-zinc-800 bg-zinc-950 text-zinc-400 hover:text-zinc-300'
                        }`}
                      >
                        <div className="text-xs font-bold uppercase tracking-wider">{lvl.label}</div>
                        <div className="text-[9px] text-zinc-500 mt-1 font-sans leading-tight">{lvl.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Saved Interests tags */}
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">
                    Core Study & Work Focus Areas
                  </label>
                  
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Artificial Intelligence',
                      'Software Development',
                      'Web Technologies',
                      'Productivity',
                      'Web3 / Cryptography',
                      'Fintech & Economics',
                      'Quantum Computing',
                      'UX & Motion Engineering'
                    ].map(interest => {
                      const selected = preferences.interests.includes(interest);
                      return (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border flex items-center gap-1 ${
                            selected
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:text-zinc-300'
                          }`}
                        >
                          {selected ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 text-zinc-600" />}
                          <span>{interest}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Proactivity levels */}
                <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                      Proactivity / Auto-Recommendations
                    </label>
                    <span className="text-xs font-mono font-bold text-indigo-400 uppercase">{preferences.proactivity}</span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2">
                    {['low', 'medium', 'high'].map(p => (
                      <button
                        key={p}
                        onClick={() => handleUpdatePreferences({ proactivity: p as any })}
                        className={`py-2 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                          preferences.proactivity === p
                          ? 'bg-indigo-600 text-white border-indigo-500'
                          : 'bg-zinc-900 text-zinc-500 border-transparent hover:text-zinc-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  <p className="text-[9px] text-zinc-500 font-sans leading-relaxed">
                    Higher levels trigger automated page analysis as soon as you open simulated tabs. Low and medium wait for your prompt triggers.
                  </p>
                </div>

                {/* Environment configurations Status Info */}
                <div className="p-4 bg-zinc-950/80 border border-zinc-850 rounded-xl space-y-2">
                  <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest font-mono">
                    Runtime Environment Credentials
                  </div>
                  <div className="space-y-1.5 text-xs text-zinc-400 font-mono">
                    <div className="flex justify-between">
                      <span>Google API Key:</span>
                      <span className={hasApiKey ? 'text-emerald-400 font-bold' : 'text-amber-500'}>
                        {hasApiKey ? 'CONFIGURED' : 'NOT SET (SANDBOXFALLBACK)'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Server Host:</span>
                      <span className="text-zinc-300 truncate max-w-[200px]">{appUrl || 'http://localhost:3000'}</span>
                    </div>
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* Footer containing Command Palette keyboard trigger info */}
          <footer className="p-5 border-t border-zinc-800 bg-zinc-950/80 shrink-0">
            <button
              onClick={() => setCommandPaletteOpen(true)}
              className="w-full flex items-center justify-between p-3 bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <Search className="w-4 h-4 text-zinc-500 group-hover:text-indigo-400 transition-colors" />
                <span className="text-xs text-zinc-400 group-hover:text-zinc-300">Search commands inside Nexus...</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-zinc-500 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800 shrink-0">
                <span className="font-sans">Ctrl</span>
                <span>+</span>
                <span>K</span>
              </div>
            </button>
          </footer>

        </aside>
      </div>

      {/* ==========================================
          COMMAND PALETTE DIALOG MODAL (CMD + K)
         ========================================== */}
      <AnimatePresence>
        {commandPaletteOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            {/* Backdrop cover blur */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setCommandPaletteOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-xs"
            />

            {/* Modal Body Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-xl shadow-2xl relative overflow-hidden z-10"
            >
              {/* Search prompt */}
              <div className="p-4 border-b border-zinc-800 flex items-center gap-3">
                <Search className="w-5 h-5 text-indigo-400 shrink-0" />
                <input
                  type="text"
                  value={commandQuery}
                  onChange={(e) => setCommandQuery(e.target.value)}
                  placeholder="Type a command or page topic..."
                  className="bg-transparent border-none text-zinc-100 text-base w-full focus:outline-none placeholder:text-zinc-600 font-sans"
                  autoFocus
                />
                <button 
                  onClick={() => setCommandPaletteOpen(false)}
                  className="p-1 text-zinc-500 hover:text-white rounded"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Action list */}
              <div className="max-h-72 overflow-y-auto p-2 space-y-1 bg-[#09090B]">
                {filteredCommands.length === 0 ? (
                  <div className="py-8 text-center text-xs text-zinc-500">
                    No commands found matching "{commandQuery}"
                  </div>
                ) : (
                  filteredCommands.map((cmd) => (
                    <button
                      key={cmd.id}
                      onClick={cmd.action}
                      className="w-full text-left p-3 rounded-xl hover:bg-indigo-600 transition-all flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black font-mono tracking-wider text-indigo-400 group-hover:text-white bg-zinc-950 p-1 rounded border border-zinc-850">
                          {cmd.category}
                        </span>
                        <div>
                          <div className="text-xs font-bold text-zinc-200 group-hover:text-white">{cmd.title}</div>
                          <div className="text-[10px] text-zinc-500 group-hover:text-indigo-200">{cmd.desc}</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white" />
                    </button>
                  ))
                )}
              </div>

              {/* Quick info bar footer */}
              <div className="bg-zinc-950/80 border-t border-zinc-800 px-4 py-2 flex justify-between items-center text-[10px] text-zinc-500 font-mono">
                <span>Select with mouse or type query</span>
                <span>ESC to close</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          CHROME EXTENSION POPUP TOOLBAR COMPONENT SIMULATOR
         ========================================== */}
      <AnimatePresence>
        {showToolbarPopup && (
          <div className="fixed bottom-16 left-6 z-40">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-80 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              {/* Toolbar Mini Header */}
              <header className="p-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 border border-white rounded rotate-45"></div>
                  </div>
                  <span className="text-xs font-black tracking-tight text-white">NEXUS POPUP</span>
                </div>
                <button 
                  onClick={() => setShowToolbarPopup(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </header>

              {/* Toolbar Actions body */}
              <div className="p-4 space-y-3.5 text-zinc-300">
                <div className="text-[10px] text-zinc-500 font-mono tracking-tight uppercase">
                  Quick Actions (On-Page)
                </div>

                <div className="space-y-2">
                  <button 
                    onClick={() => {
                      handleSummarize();
                      setActiveTab('summary');
                      setShowToolbarPopup(false);
                    }}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Summarize This Page</span>
                  </button>

                  <button 
                    onClick={() => {
                      handleSaveSelectedMemory(`Page Bookmark Captured: ${currentPage.title}`);
                      setShowToolbarPopup(false);
                    }}
                    className="w-full py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 rounded-lg text-xs font-bold border border-zinc-800 transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>Save Bookmark</span>
                  </button>
                </div>

                <div className="pt-2 border-t border-zinc-900 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Active tab title:</span>
                    <span className="text-white truncate max-w-[150px] font-medium">{currentPage.title.split('—')[0]}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Extension status:</span>
                    <span className="text-emerald-400 font-bold">READY (MV3)</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setShowOnboarding(true);
                    setOnboardingStep(1);
                    setShowToolbarPopup(false);
                  }}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors rounded-lg text-xs text-center"
                >
                  View Setup Help / Onboarding
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ==========================================
          ONBOARDING / EXTENSION HELP WALKTHROUGH OVERLAY
         ========================================== */}
      <AnimatePresence>
        {showOnboarding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.8 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowOnboarding(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-zinc-900 border border-zinc-800 rounded-3xl w-full max-w-xl shadow-2xl relative overflow-hidden z-10 p-8"
            >
              <button 
                onClick={() => setShowOnboarding(false)}
                className="absolute top-6 right-6 text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>

              {/* STEP 1: WELCOME & PERMISSIONS PLAN */}
              {onboardingStep === 1 && (
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Meet your Nexus Companion</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                      Nexus is an AI-powered browser assistant that integrates directly with Google Chrome to read webpage DOM structures, summarize contents, catalog clips, and deliver targeted documentation matching your workflow interests.
                    </p>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono">Narrow Scoped Permissions Requested</div>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850">
                        <strong className="text-white block font-bold mb-1">activeTab</strong>
                        <span className="text-zinc-500">Read only the current active domain DOM when explicitly triggered by action menu.</span>
                      </div>
                      <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-850">
                        <strong className="text-white block font-bold mb-1">sidePanel</strong>
                        <span className="text-zinc-500">Open a non-intrusive full companion sidebar on right side of chrome.</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <span className="text-xs text-zinc-500">Step 1 of 3</span>
                    <button
                      onClick={() => setOnboardingStep(2)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1"
                    >
                      <span>Next: Unpack & Load</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: INSTALLATION DIRECTIVES */}
              {onboardingStep === 2 && (
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-indigo-400 font-mono font-bold">
                    MV3
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Load Unpacked Extension</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                      We have compiled a complete, ready-to-use **Manifest V3** package. Follow these easy steps to run Nexus natively inside your Google Chrome browser:
                    </p>
                  </div>

                  <div className="space-y-3 bg-zinc-950 p-4 rounded-xl border border-zinc-850 text-xs text-zinc-300 leading-relaxed space-y-2">
                    <div>
                      <strong className="text-white block font-bold mb-0.5">1. Open Chrome Extensions panel:</strong>
                      <span className="text-zinc-500">Type <code className="text-indigo-400 font-mono">chrome://extensions</code> in a new address bar tab.</span>
                    </div>
                    <div>
                      <strong className="text-white block font-bold mb-0.5">2. Toggle Developer Mode on:</strong>
                      <span className="text-zinc-500">Flip the switch in the top-right corner of the Extensions panel.</span>
                    </div>
                    <div>
                      <strong className="text-white block font-bold mb-0.5">3. Load Unpacked directory:</strong>
                      <span className="text-zinc-500">Click the <strong className="text-zinc-200">"Load Unpacked"</strong> button in the top-left, and choose the compiled <code className="text-indigo-400 font-mono">extension/</code> folder containing background script assets.</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4">
                    <button
                      onClick={() => setOnboardingStep(1)}
                      className="text-xs text-zinc-500 hover:text-white uppercase tracking-wider"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setOnboardingStep(3)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl flex items-center gap-1"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: WORKFLOW INTEGRATIONS */}
              {onboardingStep === 3 && (
                <div className="space-y-6">
                  <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center">
                    <Bookmark className="w-5 h-5 text-white" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-white uppercase tracking-tight">Ready to Boost Productivity</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed font-sans">
                      Now that your environment is fully configured, here's how to harness your new Chrome companion:
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs">
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-1">
                      <strong className="text-indigo-400 block font-bold">On-Page highlight saves:</strong>
                      <p className="text-zinc-500 leading-relaxed">Highlight any phrase or paragraph on a webpage, right-click, and select "Save to Nexus" to trigger AI category tags.</p>
                    </div>
                    <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-850 space-y-1">
                      <strong className="text-indigo-400 block font-bold">Keyboard Command Palette:</strong>
                      <p className="text-zinc-500 leading-relaxed">Press <code className="bg-zinc-900 text-zinc-300 px-1 py-0.5 rounded font-mono">Ctrl+K</code> anywhere to activate search shortcuts instantly.</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setShowOnboarding(false);
                      showToast('Onboarding complete! Welcome to Nexus.');
                    }}
                    className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-lg"
                  >
                    Close & Enter Nexus Space
                  </button>
                </div>
              )}

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
