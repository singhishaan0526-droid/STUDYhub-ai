import React, { useState } from 'react';
import { BookText, Sparkles, ChevronLeft, Save, Download } from 'lucide-react';
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

  const classes = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'Social Science', 'English', 'Physics', 'Chemistry', 'Biology'];

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.chapter) return;
    
    setLoading(true);
    try {
      const result = await notesService.generateNotes(formData.class_level, formData.subject, formData.chapter);
      setGeneratedNotes(result.generated_content);
    } catch (error) {
      console.error("Failed to generate notes", error);
      alert("Failed to generate notes. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    generatePDF('printable-notes', `Notes_${formData.chapter.replace(/\s+/g, '_')}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 font-sans selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto space-y-8">
        
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
              <p className="text-sm text-gray-400">AI-powered instant chapter summaries</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Form Sidebar */}
          <div className="md:col-span-1 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
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
                    placeholder="e.g. Thermodynamics"
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
                      Generate Notes
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Area */}
          <div className="md:col-span-2">
            {!generatedNotes && !loading ? (
              <div className="h-full min-h-[400px] rounded-2xl border border-white/10 border-dashed bg-white/5 flex flex-col items-center justify-center text-center p-8">
                <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mb-4">
                  <BookText className="h-8 w-8 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Ready to Learn?</h3>
                <p className="text-gray-400 max-w-sm">
                  Enter your chapter details on the left and our AI will generate comprehensive, structured notes for you in seconds.
                </p>
              </div>
            ) : loading ? (
               <div className="h-full min-h-[400px] rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-8">
                 <div className="relative">
                   <div className="h-16 w-16 rounded-full border-4 border-emerald-500/20 border-t-emerald-500 animate-spin"></div>
                   <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-emerald-500 animate-pulse" />
                 </div>
                 <h3 className="text-xl font-bold text-white mt-6 mb-2">AI is thinking...</h3>
                 <p className="text-gray-400">Synthesizing the best information for {formData.chapter}</p>
               </div>
            ) : (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-end gap-2">
                  <ExportPdfButton 
                    elementId="pdf-notes-export" 
                    filename={`Notes_${formData.chapter.replace(/\s+/g, '_')}.pdf`} 
                  />
                  <button className="flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium hover:bg-emerald-500 transition-colors">
                    <Save className="h-4 w-4" />
                    Save
                  </button>
                </div>

                <div id="printable-notes" className="rounded-2xl border border-white/10 bg-[#0f1115] p-8 sm:p-10 space-y-8 text-white">
                  
                  <div className="border-b border-white/10 pb-6 text-center">
                    <h2 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">
                      {formData.chapter}
                    </h2>
                    <p className="text-gray-400 mt-2">{formData.class_level} • {formData.subject}</p>
                  </div>

                  {/* Chapter Summary */}
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-3 border-b border-emerald-500/30 pb-2 flex items-center gap-2">
                      <BookText className="h-5 w-5 text-emerald-400" /> Chapter Summary
                    </h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {generatedNotes.chapterSummary}
                    </p>
                  </section>

                  {/* Important Points */}
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-3 border-b border-emerald-500/30 pb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-400" /> Important Points
                    </h3>
                    <ul className="list-disc list-inside space-y-2 text-sm text-gray-300">
                      {generatedNotes.importantPoints.map((point, i) => (
                        <li key={i} className="pl-2">{point}</li>
                      ))}
                    </ul>
                  </section>

                  {/* Key Concepts */}
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-3 border-b border-emerald-500/30 pb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-400" /> Key Concepts
                    </h3>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {generatedNotes.keyConcepts.map((concept, i) => (
                        <div key={i} className="rounded-lg bg-black/40 p-4 border border-white/5">
                          <h4 className="font-medium text-emerald-400 mb-1">{concept.concept}</h4>
                          <p className="text-xs text-gray-400">{concept.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Important Definitions */}
                  <section>
                    <h3 className="text-xl font-semibold text-white mb-3 border-b border-emerald-500/30 pb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-emerald-400" /> Important Definitions
                    </h3>
                    <div className="space-y-3">
                      {generatedNotes.importantDefinitions.map((def, i) => (
                        <div key={i} className="flex gap-4 items-start">
                          <div className="mt-1.5 h-1.5 w-1.5 rounded-full bg-teal-500 shrink-0"></div>
                          <div>
                            <span className="font-medium text-white">{def.term}: </span>
                            <span className="text-sm text-gray-400">{def.meaning}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Quick Revision Notes */}
                  <section className="rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5 border border-emerald-500/20">
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2 flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      Quick Revision
                    </h3>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {generatedNotes.quickRevisionNotes}
                    </p>
                  </section>

                </div>

                {/* HIDDEN PRINT TEMPLATE */}
                <div id="pdf-notes-export" className="hidden hidden-print bg-white text-black font-sans leading-relaxed">
                  <PrintHeader 
                    title="Study Notes" 
                    subtitle={`${formData.chapter} • ${formData.subject} • ${formData.class_level}`} 
                  />
                  
                  <div className="space-y-8">
                    <section className="page-break-inside-avoid">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-3">Chapter Summary</h3>
                      <p className="text-gray-800">{generatedNotes.chapterSummary}</p>
                    </section>
                    
                    <section className="page-break-inside-avoid">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-3">Important Points</h3>
                      <ul className="list-disc list-inside space-y-1 text-gray-800">
                        {generatedNotes.importantPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    </section>
                    
                    <section className="page-break-inside-avoid">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-3">Key Concepts</h3>
                      <div className="space-y-4">
                        {generatedNotes.keyConcepts.map((concept, i) => (
                          <div key={i} className="page-break-inside-avoid bg-gray-50 p-4 border border-gray-200 rounded">
                            <h4 className="font-bold text-gray-900">{concept.concept}</h4>
                            <p className="text-gray-700 mt-1">{concept.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                    
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
                    
                    <section className="page-break-inside-avoid">
                      <h3 className="text-xl font-bold text-gray-900 border-b-2 border-gray-200 pb-2 mb-3">Quick Revision</h3>
                      <p className="text-gray-800 italic bg-blue-50 p-4 border-l-4 border-blue-500 rounded-r">{generatedNotes.quickRevisionNotes}</p>
                    </section>
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
