import React, { useState } from 'react';
import { FileQuestion, Sparkles, ChevronLeft, Save, HelpCircle, FileText, AlignLeft, BookOpen, Download, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import questionsService from '../services/questionsService';
import ExportPdfButton from '../components/ExportPdfButton';
import PrintHeader from '../components/PrintHeader';

export default function QuestionGenerator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    class_level: 'Class 10',
    subject: 'Science',
    chapter: '',
    difficulty: 'Medium'
  });
  const [generatedQuestions, setGeneratedQuestions] = useState(null);
  const [activeTab, setActiveTab] = useState('mcqs'); // mcqs, shortAnswers, longAnswers, caseStudies

  const classes = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'Social Science', 'English', 'Physics', 'Chemistry', 'Biology'];
  const difficulties = ['Easy', 'Medium', 'Hard'];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.chapter) return;
    
    setLoading(true);
    try {
      const result = await questionsService.generateQuestions(
        formData.class_level, 
        formData.subject, 
        formData.chapter, 
        formData.difficulty
      );
      setGeneratedQuestions(result.generated_content);
      setActiveTab('mcqs');
    } catch (error) {
      console.error("Failed to generate questions", error);
      alert("Failed to generate questions. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    generatePDF('printable-questions', `Questions_${formData.chapter.replace(/\s+/g, '_')}.pdf`);
  };

  const tabs = [
    { id: 'mcqs', label: 'MCQs', icon: HelpCircle },
    { id: 'shortAnswers', label: 'Short Qs', icon: FileText },
    { id: 'longAnswers', label: 'Long Qs', icon: AlignLeft },
    { id: 'caseStudies', label: 'Case Studies', icon: BookOpen },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 font-sans selection:bg-blue-500/30">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <FileQuestion className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Question Generator</h1>
              <p className="text-sm text-gray-400">AI-powered practice questions and tests</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Form Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sticky top-24">
              <form onSubmit={handleGenerate} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Class</label>
                  <select 
                    value={formData.class_level}
                    onChange={(e) => setFormData({...formData, class_level: e.target.value})}
                    className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
                  <select 
                    value={formData.difficulty}
                    onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                    className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  >
                    {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Chapter Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Chemical Reactions"
                    value={formData.chapter}
                    onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                    className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !formData.chapter}
                  className="w-full mt-4 group relative flex justify-center items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Questions
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3 relative">
            {!generatedQuestions && !loading ? (
              <div className="h-full min-h-[500px] rounded-2xl border border-white/10 border-dashed bg-white/5 flex flex-col items-center justify-center text-center p-8">
                <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                  <FileQuestion className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Test Your Knowledge</h3>
                <p className="text-gray-400 max-w-sm">
                  Enter your topic details and difficulty level. Our AI will craft CBSE-aligned MCQs, short/long answers, and case studies.
                </p>
              </div>
            ) : loading ? (
               <div className="h-full min-h-[500px] rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-8">
                 <div className="relative">
                   <div className="h-16 w-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin"></div>
                   <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-blue-500 animate-pulse" />
                 </div>
                 <h3 className="text-xl font-bold text-white mt-6 mb-2">Crafting Questions...</h3>
                 <p className="text-gray-400">Gemini is designing your custom test for {formData.chapter}</p>
               </div>
            ) : (
              <div className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden animate-in fade-in slide-in-from-bottom-4">
                
                {/* Header & Tabs */}
                <div className="border-b border-white/10 bg-black/20 p-6 sm:px-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{formData.chapter}</h2>
                    <p className="text-sm text-blue-400">{formData.difficulty} Difficulty</p>
                  </div>
                  <div className="flex gap-2">
                    <ExportPdfButton 
                      elementId="printable-questions" 
                      filename={`Questions_${formData.chapter.replace(/\s+/g, '_')}.pdf`} 
                    />
                    <button className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-500 transition-colors w-max">
                      <Save className="h-4 w-4" />
                      Save Test
                    </button>
                  </div>
                </div>

                <div className="flex border-b border-white/10 overflow-x-auto no-scrollbar">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap border-b-2 ${
                        activeTab === tab.id 
                          ? 'border-blue-500 text-blue-400 bg-blue-500/5' 
                          : 'border-transparent text-gray-400 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <tab.icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Tab Content */}
                <div className="p-6 sm:p-8">
                  {/* MCQs */}
                  {activeTab === 'mcqs' && (
                    <div className="space-y-8">
                      <div className="p-6 rounded-2xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg font-bold text-white mb-1">Interactive Quiz Mode</h3>
                          <p className="text-sm text-blue-200">Test your knowledge right now with these generated questions.</p>
                        </div>
                        <button
                          onClick={() => navigate('/quiz', { state: { questions: generatedQuestions.mcqs, chapter: formData.chapter, difficulty: formData.difficulty } })}
                          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
                        >
                          <Play className="h-5 w-5 fill-current" />
                          Start Quiz
                        </button>
                      </div>
                      {generatedQuestions.mcqs.map((q, i) => (
                        <div key={i} className="bg-black/40 rounded-xl p-6 border border-white/5">
                          <h3 className="text-lg font-medium text-white mb-4"><span className="text-blue-500 mr-2">Q{i+1}.</span>{q.question}</h3>
                          <div className="grid sm:grid-cols-2 gap-3 mb-4">
                            {q.options.map((opt, j) => (
                              <div key={j} className="rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-300">
                                {opt}
                              </div>
                            ))}
                          </div>
                          <details className="group cursor-pointer">
                            <summary className="text-sm font-medium text-blue-400 outline-none list-none flex items-center gap-2">
                              <span className="group-open:hidden">View Answer</span>
                              <span className="hidden group-open:inline">Hide Answer</span>
                            </summary>
                            <div className="mt-4 rounded-lg bg-blue-500/10 border border-blue-500/20 p-4">
                              <p className="font-bold text-white mb-1">Correct Answer: {q.correctAnswer}</p>
                              <p className="text-sm text-gray-300">{q.explanation}</p>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Short Answers */}
                  {activeTab === 'shortAnswers' && (
                    <div className="space-y-6">
                      {generatedQuestions.shortAnswers.map((q, i) => (
                        <div key={i} className="bg-black/40 rounded-xl p-6 border border-white/5">
                          <h3 className="text-lg font-medium text-white mb-4"><span className="text-blue-500 mr-2">Q{i+1}.</span>{q.question}</h3>
                          <details className="group cursor-pointer">
                            <summary className="text-sm font-medium text-blue-400 outline-none list-none flex items-center gap-2">
                              <span className="group-open:hidden">View Model Answer</span>
                              <span className="hidden group-open:inline">Hide Answer</span>
                            </summary>
                            <div className="mt-4 rounded-lg bg-white/5 border border-white/10 p-4">
                              <p className="text-sm text-gray-300 leading-relaxed">{q.answer}</p>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Long Answers */}
                  {activeTab === 'longAnswers' && (
                    <div className="space-y-6">
                      {generatedQuestions.longAnswers.map((q, i) => (
                        <div key={i} className="bg-black/40 rounded-xl p-6 border border-white/5">
                          <h3 className="text-lg font-medium text-white mb-4"><span className="text-blue-500 mr-2">Q{i+1}.</span>{q.question}</h3>
                          <details className="group cursor-pointer">
                            <summary className="text-sm font-medium text-blue-400 outline-none list-none flex items-center gap-2">
                              <span className="group-open:hidden">View Model Answer</span>
                              <span className="hidden group-open:inline">Hide Answer</span>
                            </summary>
                            <div className="mt-4 rounded-lg bg-white/5 border border-white/10 p-4">
                              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap">{q.answer}</p>
                            </div>
                          </details>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Case Studies */}
                  {activeTab === 'caseStudies' && (
                    <div className="space-y-10">
                      {generatedQuestions.caseStudies.map((cs, i) => (
                        <div key={i} className="bg-black/40 rounded-xl p-6 border border-white/5">
                          <div className="mb-6 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 p-5 border border-blue-500/20">
                            <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wider">Case Study {i+1}</h3>
                            <p className="text-sm text-gray-300 leading-relaxed">{cs.passage}</p>
                          </div>
                          
                          <div className="space-y-6">
                            {cs.questions.map((q, j) => (
                              <div key={j} className="pl-4 border-l-2 border-white/10">
                                <h4 className="font-medium text-white mb-2">{i+1}.{j+1} {q.question}</h4>
                                <details className="group cursor-pointer">
                                  <summary className="text-sm font-medium text-blue-400 outline-none list-none flex items-center gap-2">
                                    <span className="group-open:hidden">View Answer</span>
                                    <span className="hidden group-open:inline">Hide Answer</span>
                                  </summary>
                                  <div className="mt-3 rounded-lg bg-white/5 border border-white/10 p-3">
                                    <p className="text-sm text-gray-300">{q.answer}</p>
                                  </div>
                                </details>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                </div>

                {/* Hidden Printable Section */}
                <div id="printable-questions" className="hidden hidden-print bg-white text-black font-sans leading-relaxed">
                  <PrintHeader 
                    title="Practice Questions" 
                    subtitle={`${formData.chapter} • ${formData.subject} • ${formData.class_level}`} 
                  />

                  {generatedQuestions.mcqs.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-1">Multiple Choice Questions</h2>
                      <div className="space-y-6">
                        {generatedQuestions.mcqs.map((q, i) => (
                          <div key={i} className="page-break-inside-avoid">
                            <p className="font-bold text-gray-900">{i+1}. {q.question}</p>
                            <ol className="list-[upper-alpha] list-inside ml-4 mt-2 space-y-1 text-gray-800">
                              {q.options.map((opt, j) => <li key={j}>{opt}</li>)}
                            </ol>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedQuestions.shortAnswers.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-1">Short Answer Questions</h2>
                      <div className="space-y-4">
                        {generatedQuestions.shortAnswers.map((q, i) => (
                          <div key={i} className="page-break-inside-avoid">
                            <p className="font-bold text-gray-900">{i+1}. {q.question}</p>
                            <div className="mt-2 h-16 border-b border-dashed border-gray-300"></div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedQuestions.longAnswers.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-1">Long Answer Questions</h2>
                      <div className="space-y-6">
                        {generatedQuestions.longAnswers.map((q, i) => (
                          <div key={i} className="page-break-inside-avoid">
                            <p className="font-bold text-gray-900">{i+1}. {q.question}</p>
                            <div className="mt-2 h-32 border-b border-dashed border-gray-300 flex flex-col justify-between pb-1">
                              <div className="border-b border-dashed border-gray-300 w-full h-8"></div>
                              <div className="border-b border-dashed border-gray-300 w-full h-8"></div>
                              <div className="border-b border-dashed border-gray-300 w-full h-8"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {generatedQuestions.caseStudies.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold mb-4 border-b-2 border-gray-200 pb-1">Case Studies</h2>
                      {generatedQuestions.caseStudies.map((cs, i) => (
                        <div key={i} className="mb-8 page-break-inside-avoid">
                          <div className="bg-gray-50 p-4 border border-gray-200 rounded mb-4">
                            <h3 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-2">Case Study {i+1}</h3>
                            <p className="italic text-gray-800">{cs.passage}</p>
                          </div>
                          <div className="space-y-4">
                            {cs.questions.map((q, j) => (
                              <div key={j} className="ml-4">
                                <p className="font-bold text-gray-900">{i+1}.{j+1} {q.question}</p>
                                <div className="mt-1 h-8 border-b border-dashed border-gray-300"></div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ANSWER KEY (Forces a page break) */}
                  <div className="page-break-before mt-12 pt-8">
                    <h2 className="text-2xl font-black text-center mb-6 uppercase tracking-widest border-b-4 border-gray-900 pb-2">Answer Key</h2>
                    
                    {generatedQuestions.mcqs.length > 0 && (
                      <div className="mb-6">
                        <h3 className="font-bold text-lg mb-2">Multiple Choice</h3>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
                          {generatedQuestions.mcqs.map((q, i) => (
                            <div key={i} className="text-gray-800">
                              <span className="font-bold">{i+1}.</span> {q.correctAnswer}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
