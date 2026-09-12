import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, BookOpen, User, Sparkles, BookText, FileQuestion, GraduationCap, MessageCircleQuestion, Clock, Bookmark, ChevronDown, CheckCircle2, Target, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CLASSES = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];

const SUBJECTS = [
  { name: 'Mathematics',    icon: '➗', color: 'from-blue-500 to-cyan-400' },
  { name: 'Science',        icon: '🔬', color: 'from-emerald-500 to-teal-400' },
  { name: 'Social Science', icon: '🌍', color: 'from-orange-500 to-amber-400' },
  { name: 'English',        icon: '📚', color: 'from-purple-500 to-pink-400' },
];

const RECENT_ACTIVITY = [
  { title: "Generated Notes for Trigonometry",    type: 'Notes', time: '2 hours ago',  icon: BookText },
  { title: "Attempted Science Mock Test",          type: 'Exam',  time: 'Yesterday',   icon: GraduationCap },
  { title: "Asked doubt about Newton's Laws",      type: 'Doubt', time: '2 days ago',  icon: MessageCircleQuestion },
];

const SAVED_CONTENT = [
  { title: 'Important Formulas - Math',     type: 'PDF' },
  { title: 'Chemical Reactions Summary',    type: 'Notes' },
];

const AI_TOOLS = [
  { title: 'Generate Notes',      desc: 'Instant chapter summaries',    path: '/notes',      icon: BookText,            color: 'hover:border-emerald-500/50 hover:shadow-emerald-500/20' },
  { title: 'Generate Questions',  desc: 'Practice with AI MCQs',        path: '/questions',  icon: FileQuestion,        color: 'hover:border-blue-500/50 hover:shadow-blue-500/20' },
  { title: 'Exam Generator',      desc: 'Personalized mock tests',       path: '/exam',       icon: GraduationCap,       color: 'hover:border-purple-500/50 hover:shadow-purple-500/20' },
  { title: 'Ask Doubt',           desc: 'Instant doubt resolution',      path: '/doubt',      icon: MessageCircleQuestion, color: 'hover:border-orange-500/50 hover:shadow-orange-500/20' },
];

export default function Dashboard() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [selectedClass, setSelectedClass] = useState('Class 10');
  const [isClassDropdownOpen, setIsClassDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">StudyHub AI</span>
            </div>
            
            <div className="flex items-center gap-6">
              {/* Class Selector */}
              <div className="relative">
                <button 
                  onClick={() => setIsClassDropdownOpen(!isClassDropdownOpen)}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10 transition-all"
                >
                  {selectedClass}
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
                
                {isClassDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 rounded-xl border border-white/10 bg-gray-900 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    {CLASSES.map((cls) => (
                      <button
                        key={cls}
                        onClick={() => {
                          setSelectedClass(cls);
                          setIsClassDropdownOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-sm transition-colors hover:bg-white/5 ${selectedClass === cls ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-300'}`}
                      >
                        {cls}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-white/10 hidden sm:block"></div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-300 hidden sm:flex">
                  <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                    <User className="h-4 w-4 text-indigo-400" />
                  </div>
                  <span className="font-medium">{user?.name || 'Student'}</span>
                </div>
                <button
                  onClick={() => { logout(); navigate('/login'); }}
                  className="flex items-center justify-center p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors group"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5 group-hover:scale-110 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-12">
        {/* Welcome Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-white/10 p-8 sm:p-12">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
          <div className="absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
              Hello, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">{user?.name?.split(' ')[0] || 'Scholar'}</span> 👋
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl">
              Your personalized AI study companion for {selectedClass} is ready. What would you like to master today?
            </p>
          </div>
        </div>

        {/* AI Study Planner Banner */}
        <div 
          onClick={() => navigate('/study-planner')}
          className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-900/40 to-indigo-900/40 border border-indigo-500/30 p-8 sm:p-10 cursor-pointer group hover:border-indigo-500/60 transition-all shadow-lg hover:shadow-indigo-500/20"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500">
            <CalendarDays className="h-48 w-48 text-indigo-300" />
          </div>
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">New Feature</span>
                <span className="flex items-center gap-1 text-indigo-300 text-sm font-medium"><Sparkles className="h-4 w-4" /> AI Powered</span>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">AI Study Planner</h2>
              <p className="text-gray-300 text-lg">Build a personalized, highly structured study plan based on your syllabus, weak subjects, and target exam date.</p>
            </div>
            
            <button className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-4 font-bold text-white shadow-lg shadow-indigo-500/30 transition-all group-hover:bg-indigo-500 group-hover:-translate-y-1 whitespace-nowrap">
              <Target className="h-5 w-5" />
              Create Study Plan
            </button>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div>
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            AI Quick Tools
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {AI_TOOLS.map((tool) => (
              <div 
                key={tool.title}
                onClick={() => navigate(tool.path)}
                className={`group cursor-pointer rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 hover:shadow-xl ${tool.color}`}
              >
                <div className="mb-4 inline-flex rounded-xl bg-white/10 p-3 text-white transition-transform group-hover:scale-110 group-hover:bg-white/20">
                  <tool.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{tool.title}</h3>
                <p className="mt-1 text-sm text-gray-400">{tool.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Subjects (Takes up 2 columns on large screens) */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              Your Subjects
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {SUBJECTS.map((subject) => (
                <div 
                  key={subject.name}
                  className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 group cursor-pointer hover:border-white/20 transition-colors"
                >
                  <div className={`absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-10 bg-gradient-to-br ${subject.color}`}></div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <span className="text-3xl">{subject.icon}</span>
                      <h3 className="text-lg font-semibold">{subject.name}</h3>
                    </div>
                    <div className="h-8 w-8 rounded-full border border-white/10 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                      <ChevronDown className="h-4 w-4 -rotate-90 text-gray-400" />
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-sm text-gray-400">
                    <span>Progress</span>
                    <span className="text-white font-medium">0%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full bg-white/20 w-0"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar Area: Recent Activity & Saved Content */}
          <div className="space-y-8">
            
            {/* Recent Activity */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-indigo-400" />
                Recent Activity
              </h2>
              <div className="space-y-6">
                {RECENT_ACTIVITY.map((activity, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="relative flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-gray-300">
                        <activity.icon className="h-4 w-4" />
                      </div>
                      {index !== RECENT_ACTIVITY.length - 1 && (
                        <div className="absolute top-8 bottom-[-24px] w-px bg-white/10"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-2">
                      <h4 className="text-sm font-medium text-gray-200">{activity.title}</h4>
                      <span className="text-xs text-gray-500">{activity.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Saved Content */}
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-indigo-400" />
                Saved Content
              </h2>
              <ul className="space-y-3">
                {SAVED_CONTENT.map((content, index) => (
                  <li key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 cursor-pointer transition-colors border border-transparent hover:border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded bg-indigo-500/10 text-indigo-400">
                        <Bookmark className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{content.title}</span>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-white/10 text-gray-300">{content.type}</span>
                  </li>
                ))}
              </ul>
              <button className="mt-4 w-full rounded-lg bg-white/5 py-2 text-sm font-medium text-gray-300 hover:bg-white/10 transition-colors">
                View All Saved
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
