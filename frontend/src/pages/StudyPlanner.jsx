import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, BookOpen, Target, Sparkles, ChevronLeft, RefreshCcw, CheckCircle2, Circle, AlertCircle, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import studyPlannerService from '../services/studyPlannerService';
import ExportPdfButton from '../components/ExportPdfButton';
import PrintHeader from '../components/PrintHeader';
import { differenceInDays, differenceInHours, differenceInMinutes } from 'date-fns';

export default function StudyPlanner() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  
  // DB Record and Parsed Plan
  const [dbRecord, setDbRecord] = useState(null); 
  const [plan, setPlan] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    examDate: '',
    syllabus: '',
    availableHours: 4,
    prepLevel: 'Intermediate',
    weakSubjects: '',
    targetScore: '85%'
  });

  // Load existing plan on mount
  useEffect(() => {
    loadCurrentPlan();
  }, []);

  const loadCurrentPlan = async () => {
    setLoading(true);
    try {
      const record = await studyPlannerService.getCurrentPlan();
      if (record) {
        setDbRecord(record);
        setPlan(record.generated_content);
      }
    } catch (err) {
      console.error("Failed to load study plan", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.examDate || !formData.syllabus) return;

    setGenerating(true);
    try {
      const newRecord = await studyPlannerService.generatePlan(
        formData.examDate,
        formData.syllabus,
        formData.availableHours,
        formData.prepLevel,
        formData.weakSubjects,
        formData.targetScore
      );
      setDbRecord(newRecord);
      setPlan(newRecord.generated_content);
    } catch (error) {
      console.error("Failed to generate plan", error);
      const msg = error?.response?.data?.message || error?.message || "Unknown error";
      alert(`Failed to generate study plan:\n${msg}`);
    } finally {
      setGenerating(false);
    }
  };

  // Checkbox toggle logic
  const debounceTimer = useRef(null);

  const toggleSessionComplete = (weekIndex, dayIndex, sessionIndex) => {
    // Deep clone the plan
    const updatedPlan = JSON.parse(JSON.stringify(plan));
    const session = updatedPlan.weeklyPlans[weekIndex].days[dayIndex].sessions[sessionIndex];
    session.completed = !session.completed;

    // Optimistic UI update
    setPlan(updatedPlan);

    // Debounce the backend save
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(async () => {
      try {
        await studyPlannerService.updatePlan(dbRecord._id, updatedPlan);
      } catch (err) {
        console.error("Failed to save progress", err);
        // Could revert state here if critical
      }
    }, 1000); // 1 second debounce
  };

  const calculateProgress = () => {
    if (!plan) return 0;
    let total = 0;
    let completed = 0;
    plan.weeklyPlans.forEach(week => {
      week.days.forEach(day => {
        day.sessions.forEach(session => {
          total++;
          if (session.completed) completed++;
        });
      });
    });
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const getCountdown = () => {
    if (!plan || !plan.examDate) return null;
    const target = new Date(plan.examDate);
    const now = new Date();
    
    if (target < now) return { days: 0, hours: 0, mins: 0, past: true };

    return {
      days: differenceInDays(target, now),
      hours: differenceInHours(target, now) % 24,
      mins: differenceInMinutes(target, now) % 60,
      past: false
    };
  };

  const progress = calculateProgress();
  const countdown = getCountdown();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // ==========================================
  // RENDER: GENERATION FORM (No active plan)
  // ==========================================
  if (!plan) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 font-sans selection:bg-indigo-500/30">
        <div className="max-w-4xl mx-auto space-y-8">
          
          <div className="flex items-center gap-4 border-b border-white/10 pb-6">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/20">
                <Target className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AI Study Planner</h1>
                <p className="text-sm text-gray-400">Generate a personalized timetable to crush your exams</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
            {generating ? (
              <div className="h-[500px] flex flex-col items-center justify-center text-center">
                <div className="relative mb-8">
                  <div className="h-20 w-20 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-indigo-500 animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">Analyzing your syllabus...</h3>
                <p className="text-gray-400 max-w-md">Gemini is balancing your weak subjects, structuring revision phases, and building your personalized timetable.</p>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Exam Date <span className="text-red-400">*</span></label>
                      <input 
                        type="date" required
                        value={formData.examDate}
                        onChange={(e) => setFormData({...formData, examDate: e.target.value})}
                        className="w-full rounded-lg border border-white/10 bg-gray-900 py-3 px-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Target Score</label>
                      <input 
                        type="text" placeholder="e.g. 95% or Rank 1"
                        value={formData.targetScore}
                        onChange={(e) => setFormData({...formData, targetScore: e.target.value})}
                        className="w-full rounded-lg border border-white/10 bg-gray-900 py-3 px-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Available Daily Hours <span className="text-red-400">*</span></label>
                      <input 
                        type="number" min="1" max="16" required
                        value={formData.availableHours}
                        onChange={(e) => setFormData({...formData, availableHours: e.target.value})}
                        className="w-full rounded-lg border border-white/10 bg-gray-900 py-3 px-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Current Prep Level</label>
                      <select 
                        value={formData.prepLevel}
                        onChange={(e) => setFormData({...formData, prepLevel: e.target.value})}
                        className="w-full rounded-lg border border-white/10 bg-gray-900 py-3 px-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      >
                        <option>Beginner (Starting from scratch)</option>
                        <option>Intermediate (Know basics)</option>
                        <option>Advanced (Revision phase)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Weak Subjects/Topics</label>
                      <input 
                        type="text" placeholder="e.g. Integration, Magnetism"
                        value={formData.weakSubjects}
                        onChange={(e) => setFormData({...formData, weakSubjects: e.target.value})}
                        className="w-full rounded-lg border border-white/10 bg-gray-900 py-3 px-4 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none"
                      />
                    </div>
                  </div>

                  <div className="h-full flex flex-col">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Full Syllabus <span className="text-red-400">*</span></label>
                    <textarea 
                      required
                      placeholder="Paste your full syllabus here...&#10;Physics: Ch 1, 2, 3&#10;Maths: Calculus, Algebra..."
                      value={formData.syllabus}
                      onChange={(e) => setFormData({...formData, syllabus: e.target.value})}
                      className="w-full flex-1 rounded-lg border border-white/10 bg-gray-900 py-3 px-4 text-white placeholder:text-gray-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none resize-none min-h-[250px]"
                    />
                  </div>
                  
                </div>

                <div className="pt-4 border-t border-white/10">
                  <button type="submit" className="w-full sm:w-auto px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
                    <Sparkles className="h-5 w-5" /> Generate AI Study Plan
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: ACTIVE STUDY PLAN
  // ==========================================
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 font-sans selection:bg-indigo-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/dashboard')} className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white">
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div>
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                {plan.planTitle}
              </h1>
              <p className="text-sm text-gray-400">Target Exam: {new Date(plan.examDate).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ExportPdfButton 
              elementId="printable-study-plan" 
              filename={`StudyPlan_${plan.examDate}.pdf`}
              variant="secondary"
            />
            <button 
              onClick={() => { if(window.confirm("Are you sure? This will delete your current plan.")) { setPlan(null); setDbRecord(null); } }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
            >
              <RefreshCcw className="h-4 w-4" /> Reset Plan
            </button>
          </div>
        </div>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Calendar className="h-5 w-5 text-indigo-400" /> 
              <span className="font-medium">Exam Countdown</span>
            </div>
            {countdown && !countdown.past ? (
              <div className="flex items-end gap-2">
                <span className="text-4xl font-black text-white">{countdown.days}</span>
                <span className="text-gray-400 mb-1">days</span>
                <span className="text-2xl font-bold text-white ml-2">{countdown.hours}</span>
                <span className="text-gray-400 mb-1">hrs</span>
              </div>
            ) : (
              <div className="text-xl font-bold text-red-400 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" /> Exam passed
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Target className="h-5 w-5 text-emerald-400" /> 
              <span className="font-medium">Total Progress</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-white">{progress}%</span>
              <span className="text-gray-400 mb-1">completed</span>
            </div>
            <div className="mt-4 h-2 w-full rounded-full bg-white/10 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-teal-400 transition-all duration-500" style={{ width: `${progress}%` }}></div>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <Clock className="h-5 w-5 text-purple-400" /> 
              <span className="font-medium">Timeline</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-white">{plan.weeklyPlans.length}</span>
              <span className="text-gray-400 mb-1">Weeks</span>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm flex flex-col justify-between">
            <div className="flex items-center gap-2 text-gray-400 mb-2">
              <BookOpen className="h-5 w-5 text-blue-400" /> 
              <span className="font-medium">Daily Target</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-black text-white">{dbRecord.input_data.availableHours}</span>
              <span className="text-gray-400 mb-1">Hours / day</span>
            </div>
          </div>

        </div>

        {/* Timetable View */}
        <div className="space-y-12 mt-8">
          {plan.weeklyPlans.map((week, wIndex) => (
            <div key={wIndex} className="animate-in fade-in slide-in-from-bottom-4">
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold bg-white/10 px-4 py-2 rounded-lg">Week {week.week}</h2>
                <div className="h-px bg-white/10 flex-1"></div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {week.days.map((day, dIndex) => {
                  
                  // Highlight today's date if applicable
                  const isToday = new Date().toDateString() === new Date(day.date).toDateString();
                  
                  return (
                    <div key={dIndex} className={`rounded-xl border ${isToday ? 'border-indigo-500/50 bg-indigo-500/5 shadow-lg shadow-indigo-500/10' : 'border-white/10 bg-white/5'} p-5 flex flex-col`}>
                      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                        <div>
                          <h3 className={`font-bold text-lg ${isToday ? 'text-indigo-400' : 'text-white'}`}>{day.day}</h3>
                          <p className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </div>
                        {isToday && <span className="bg-indigo-500/20 text-indigo-300 text-xs font-bold px-2 py-1 rounded">TODAY</span>}
                      </div>

                      <div className="space-y-4 flex-1">
                        {day.sessions.map((session, sIndex) => (
                          <div 
                            key={session.id || sIndex}
                            onClick={() => toggleSessionComplete(wIndex, dIndex, sIndex)}
                            className={`group relative flex gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                              session.completed 
                                ? 'bg-emerald-500/10 border-emerald-500/30' 
                                : 'bg-black/40 border-white/5 hover:border-indigo-500/50'
                            }`}
                          >
                            <div className="mt-1 shrink-0">
                              {session.completed ? (
                                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                              ) : (
                                <Circle className="h-5 w-5 text-gray-500 group-hover:text-indigo-400 transition-colors" />
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${session.completed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-indigo-500/20 text-indigo-300'}`}>
                                  {session.startTime} - {session.endTime}
                                </span>
                                <span className="text-xs text-gray-400">{session.durationMinutes} min</span>
                              </div>
                              <h4 className={`font-bold text-sm mb-0.5 ${session.completed ? 'text-gray-300 line-through' : 'text-white'}`}>
                                {session.subject}
                              </h4>
                              <p className={`text-xs ${session.completed ? 'text-gray-500' : 'text-gray-300'}`}>
                                {session.topic}
                              </p>
                              <div className="mt-2 inline-block text-[10px] font-medium uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-1 rounded">
                                {session.activity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* HIDDEN PDF PRINT TEMPLATE */}
      <div id="printable-study-plan" className="hidden hidden-print bg-white text-black font-sans leading-relaxed">
        <PrintHeader 
          title={plan.planTitle} 
          subtitle={`Target Exam Date: ${new Date(plan.examDate).toLocaleDateString()}`} 
        />
        
        <div className="mb-8 p-4 bg-gray-50 border border-gray-200 rounded text-center grid grid-cols-2 gap-4">
           <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Overall Progress</p>
              <p className="text-2xl font-black">{progress}%</p>
           </div>
           <div>
              <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">Days Remaining</p>
              <p className="text-2xl font-black">{countdown && !countdown.past ? countdown.days : 0}</p>
           </div>
        </div>

        <div className="space-y-8">
          {plan.weeklyPlans.map((week, wIndex) => (
            <div key={wIndex} className="page-break-inside-avoid mb-10">
              <h2 className="text-xl font-black uppercase tracking-widest border-b-2 border-gray-900 pb-2 mb-4">Week {week.week}</h2>
              <div className="space-y-6">
                {week.days.map((day, dIndex) => (
                  <div key={dIndex} className="page-break-inside-avoid flex gap-6">
                    <div className="w-32 shrink-0 border-r-2 border-gray-200 pr-4">
                      <h3 className="font-bold text-lg text-gray-900">{day.day}</h3>
                      <p className="text-sm text-gray-500">{new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                    </div>
                    <div className="flex-1 space-y-4">
                      {day.sessions.map((session, sIndex) => (
                        <div key={sIndex} className="flex gap-4">
                          <div className="text-sm font-bold text-gray-600 w-24 shrink-0">
                            {session.startTime} - {session.endTime}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">{session.subject}</span>
                              {session.completed && <span className="text-xs font-bold text-green-600 border border-green-600 px-1 rounded">DONE</span>}
                            </div>
                            <p className="text-sm text-gray-700">{session.topic}</p>
                            <p className="text-xs text-gray-500 uppercase mt-1">{session.activity} ({session.durationMinutes} min)</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
