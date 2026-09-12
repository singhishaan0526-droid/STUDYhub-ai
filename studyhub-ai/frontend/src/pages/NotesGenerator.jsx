import React, { useState } from 'react';
import { BookText, Sparkles, ChevronLeft, Save, ChevronDown, ChevronRight, FileText, FlaskConical, HelpCircle, ListChecks } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import notesService from '../services/notesService';
import ExportPdfButton from '../components/ExportPdfButton';
import PrintHeader from '../components/PrintHeader';

export default function NotesGenerator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    class_level: 'Class 10',
    subject: 'Science',
    chapter: ''
  });
  const [generatedNotes, setGeneratedNotes] = useState(null);
  const [expandedTopics, setExpandedTopics] = useState({});

  const classes = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'Social Science', 'English', 'Physics', 'Chemistry', 'Biology'];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.chapter) return;
    
    setLoading(true);
    try {
      const result = await notesService.generateNotes(formData.class_level, formData.subject, formData.chapter);
      setGeneratedNotes(result.generated_content);
      // Expand all topics by default
      const expanded = {};
      (result.generated_content?.topics || []).forEach((_, i) => { expanded[i] = true; });
      setExpandedTopics(expanded);
    } catch (error) {
      console.error("Failed to generate notes", error);
      alert("Failed to generate notes. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const toggleTopic = (index) => {
    setExpandedTopics(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const expandAll = () => {
    const expanded = {};
    (generatedNotes?.topics || []).forEach((_, i) => { expanded[i] = true; });
    setExpandedTopics(expanded);
  };

  const collapseAll = () => setExpandedTopics({});

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 border-b border-white/10 pb-6">
          <button 
            onClick={() => navigate('/dashboard')}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
              <BookText className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Notes Generator</h1>
              <p className="text-sm text-gray-400">AI-powered full chapter notes — topic-wise & exam-ready</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Form Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sticky top-8">
              <form onSubmit={handleGenerate} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Class</label>
                  <select 
                    value={formData.class_level}
                    onChange={(e) => setFormData({...formData, class_level: e.target.value})}
                    className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                  <select 
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  >
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Chapter Name</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Chemical Reactions and Equations"
                    value={formData.chapter}
                    onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                    className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white placeholder:text-gray-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !formData.chapter}
                  className="w-full mt-4 group relative flex justify-center items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Full Notes
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Area */}
          <div className="md:col-span-3">
            {!generatedNotes && !loading ? (
              <div className="h-full min-h-[400px] rounded-2xl border border-white/10 border-dashed bg-white/5 flex flex-col items-center justify-center text-center p-8">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <BookText className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to Learn?</h3>
                <p className="text-gray-400 max-w-sm">
                  Enter your chapter details and our AI will generate full, detailed, topic-wise notes covering the entire chapter — just like a textbook.
                </p>
              </div>
            ) : loading ? (
               <div className="h-full min-h-[400px] rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-8">
                 <div className="relative">
                   <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                   <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-500 animate-pulse" />
                 </div>
                 <h3 className="text-xl font-bold text-white mt-6 mb-2">Generating full chapter notes...</h3>
                 <p className="text-gray-400">Writing detailed topic-wise notes for {formData.chapter}</p>
                 <p className="text-xs text-gray-500 mt-2">This may take 15-30 seconds for comprehensive notes</p>
               </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <button onClick={expandAll} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                      Expand All
                    </button>
                    <button onClick={collapseAll} className="text-xs px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                      Collapse All
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <ExportPdfButton 
                      elementId="pdf-notes-export" 
                      filename={`Notes_${formData.chapter.replace(/\s+/g, '_')}.pdf`} 
                    />
                    <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 transition-colors">
                      <Save className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </div>

                <div id="printable-notes" className="rounded-2xl border border-white/10 bg-[#0f1115] p-6 sm:p-8 space-y-6 text-white">
                  
                  {/* Chapter Header */}
                  <div className="border-b border-white/10 pb-6 text-center">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                      {generatedNotes.chapterTitle || formData.chapter}
                    </h2>
                    <p className="text-gray-400 mt-2">{formData.class_level} • {formData.subject}</p>
                    {generatedNotes.chapterOverview && (
                      <p className="text-sm text-gray-300 mt-4 max-w-2xl mx-auto leading-relaxed">
                        {generatedNotes.chapterOverview}
                      </p>
                    )}
                    {generatedNotes.topics && (
                      <p className="text-xs text-emerald-400 mt-3">
                        📖 {generatedNotes.topics.length} Topics Covered
                      </p>
                    )}
                  </div>

                  {/* Topic-wise Notes */}
                  {generatedNotes.topics && generatedNotes.topics.map((topic, i) => (
                    <section key={i} className="rounded-xl border border-white/10 overflow-hidden">
                      {/* Topic Header (clickable) */}
                      <button
                        onClick={() => toggleTopic(i)}
                        className="w-full flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 transition-colors text-left"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                          {topic.topicNumber || i + 1}
                        </span>
                        <h3 className="flex-1 text-lg font-semibold text-white">
                          {topic.topicTitle}
                        </h3>
                        {expandedTopics[i] ? (
                          <ChevronDown className="h-5 w-5 text-gray-400 shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-gray-400 shrink-0" />
                        )}
                      </button>

                      {/* Topic Content */}
                      {expandedTopics[i] && (
                        <div className="p-5 space-y-5 border-t border-white/5">
                          {/* Detailed Notes */}
                          <div>
                            <p className="text-gray-300 leading-relaxed text-sm whitespace-pre-line">
                              {topic.notes}
                            </p>
                          </div>

                          {/* Key Points */}
                          {topic.keyPoints && topic.keyPoints.length > 0 && (
                            <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-4">
                              <h4 className="text-sm font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                                <ListChecks className="h-4 w-4" /> Key Points to Remember
                              </h4>
                              <ul className="space-y-1.5">
                                {topic.keyPoints.map((point, j) => (
                                  <li key={j} className="flex gap-2 text-sm text-gray-300">
                                    <span className="text-emerald-400 mt-0.5 shrink-0">•</span>
                                    <span>{point}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Formulas */}
                          {topic.formulas && topic.formulas.length > 0 && (
                            <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4">
                              <h4 className="text-sm font-semibold text-blue-400 mb-3 flex items-center gap-2">
                                <FlaskConical className="h-4 w-4" /> Formulas & Equations
                              </h4>
                              <div className="space-y-3">
                                {topic.formulas.map((formula, j) => (
                                  <div key={j} className="rounded-lg bg-black/30 p-3">
                                    <p className="text-xs font-medium text-blue-300 mb-1">{formula.name}</p>
                                    <p className="font-mono text-sm text-white bg-black/40 rounded px-3 py-2 my-1.5 overflow-x-auto">
                                      {formula.expression}
                                    </p>
                                    {formula.description && (
                                      <p className="text-xs text-gray-400 mt-1">{formula.description}</p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Diagrams */}
                          {topic.diagrams && topic.diagrams.length > 0 && (
                            <div className="rounded-lg bg-purple-500/5 border border-purple-500/20 p-4">
                              <h4 className="text-sm font-semibold text-purple-400 mb-2 flex items-center gap-2">
                                <FileText className="h-4 w-4" /> Diagrams & Figures
                              </h4>
                              <div className="space-y-2">
                                {topic.diagrams.map((diagram, j) => (
                                  <div key={j} className="rounded-lg bg-black/30 p-3">
                                    <p className="text-sm font-medium text-purple-300">{diagram.title}</p>
                                    <p className="text-xs text-gray-400 mt-1">{diagram.description}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </section>
                  ))}

                  {/* Important Definitions */}
                  {generatedNotes.importantDefinitions && generatedNotes.importantDefinitions.length > 0 && (
                    <section className="rounded-xl border border-white/10 p-5">
                      <h3 className="text-xl font-semibold text-white mb-4 border-b border-emerald-500/30 pb-2 flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-emerald-400" /> Important Definitions
                      </h3>
                      <div className="space-y-3">
                        {generatedNotes.importantDefinitions.map((def, i) => (
                          <div key={i} className="flex gap-3 items-start">
                            <div className="mt-2 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0"></div>
                            <div>
                              <span className="font-medium text-white">{def.term}: </span>
                              <span className="text-sm text-gray-400">{def.meaning}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* FAQs */}
                  {generatedNotes.frequentlyAskedQuestions && generatedNotes.frequentlyAskedQuestions.length > 0 && (
                    <section className="rounded-xl border border-white/10 p-5">
                      <h3 className="text-xl font-semibold text-white mb-4 border-b border-amber-500/30 pb-2 flex items-center gap-2">
                        <HelpCircle className="h-5 w-5 text-amber-400" /> Frequently Asked Board Exam Questions
                      </h3>
                      <div className="space-y-4">
                        {generatedNotes.frequentlyAskedQuestions.map((faq, i) => (
                          <div key={i} className="rounded-lg bg-black/30 p-4 border border-white/5">
                            <p className="text-sm font-medium text-amber-300 mb-2">Q{i + 1}. {faq.question}</p>
                            <p className="text-sm text-gray-300 leading-relaxed">{faq.answer}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  )}

                  {/* Quick Revision */}
                  {generatedNotes.quickRevisionNotes && (
                    <section className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 border border-emerald-500/20">
                      <h3 className="text-lg font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                        <Sparkles className="h-5 w-5" />
                        Quick Revision
                      </h3>
                      <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                        {generatedNotes.quickRevisionNotes}
                      </p>
                    </section>
                  )}

                </div>

                {/* HIDDEN PRINT TEMPLATE */}
                <div id="pdf-notes-export" className="hidden hidden-print bg-white text-black font-sans leading-relaxed">
                  <PrintHeader 
                    title="Chapter Notes" 
                    subtitle={`${formData.chapter} • ${formData.subject} • ${formData.class_level}`} 
                  />
                  
                  <div className="space-y-8">
                    {generatedNotes.chapterOverview && (
                      <section className="page-break-inside-avoid">
                        <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-3">Chapter Overview</h3>
                        <p className="text-gray-800">{generatedNotes.chapterOverview}</p>
                      </section>
                    )}

                    {generatedNotes.topics && generatedNotes.topics.map((topic, i) => (
                      <section key={i} className="page-break-inside-avoid">
                        <h3 className="text-lg font-bold text-gray-900 border-b-2 border-emerald-200 pb-2 mb-3">
                          {topic.topicNumber || i + 1}. {topic.topicTitle}
                        </h3>
                        <p className="text-gray-800 mb-3 whitespace-pre-line">{topic.notes}</p>
                        
                        {topic.keyPoints && topic.keyPoints.length > 0 && (
                          <div className="mb-3 bg-green-50 p-3 border-l-4 border-green-500 rounded-r">
                            <p className="font-bold text-gray-900 mb-1">Key Points:</p>
                            <ul className="list-disc list-inside space-y-1 text-gray-800 text-sm">
                              {topic.keyPoints.map((p, j) => <li key={j}>{p}</li>)}
                            </ul>
                          </div>
                        )}

                        {topic.formulas && topic.formulas.length > 0 && (
                          <div className="mb-3 bg-blue-50 p-3 border-l-4 border-blue-500 rounded-r">
                            <p className="font-bold text-gray-900 mb-1">Formulas:</p>
                            {topic.formulas.map((f, j) => (
                              <div key={j} className="mb-2">
                                <p className="font-medium text-gray-900">{f.name}</p>
                                <p className="font-mono bg-white px-2 py-1 rounded text-sm my-1">{f.expression}</p>
                                {f.description && <p className="text-gray-600 text-xs">{f.description}</p>}
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    ))}
                    
                    {generatedNotes.importantDefinitions && generatedNotes.importantDefinitions.length > 0 && (
                      <section className="page-break-inside-avoid">
                        <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-3">Important Definitions</h3>
                        <div className="space-y-2">
                          {generatedNotes.importantDefinitions.map((def, i) => (
                            <div key={i} className="page-break-inside-avoid">
                              <span className="font-bold text-gray-900">{def.term}: </span>
                              <span className="text-gray-800">{def.meaning}</span>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {generatedNotes.frequentlyAskedQuestions && generatedNotes.frequentlyAskedQuestions.length > 0 && (
                      <section className="page-break-inside-avoid">
                        <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-3">Frequently Asked Questions</h3>
                        <div className="space-y-3">
                          {generatedNotes.frequentlyAskedQuestions.map((faq, i) => (
                            <div key={i} className="page-break-inside-avoid">
                              <p className="font-bold text-gray-900">Q{i + 1}. {faq.question}</p>
                              <p className="text-gray-800 mt-1">{faq.answer}</p>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                    
                    {generatedNotes.quickRevisionNotes && (
                      <section className="page-break-inside-avoid">
                        <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-3">Quick Revision</h3>
                        <p className="text-gray-800 italic bg-blue-50 p-4 border-l-4 border-blue-500 rounded-r whitespace-pre-line">{generatedNotes.quickRevisionNotes}</p>
                      </section>
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
