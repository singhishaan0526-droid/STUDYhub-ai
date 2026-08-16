import React, { useState } from 'react';
import { GraduationCap, Sparkles, ChevronLeft, Save, FileText, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import examsService from '../services/examsService';
import ExportPdfButton from '../components/ExportPdfButton';
import PrintHeader from '../components/PrintHeader';

export default function ExamGenerator() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    class_level: 'Class 10',
    subject: 'Science',
    chapter: '',
    difficulty: 'Medium',
    total_marks: 50,
    exam_type: 'Unit Test',
    question_types: ['MCQs', 'Short Answers']
  });
  const [generatedExam, setGeneratedExam] = useState(null);

  const classes = ['Class 9', 'Class 10', 'Class 11', 'Class 12'];
  const subjects = ['Mathematics', 'Science', 'Social Science', 'English', 'Physics', 'Chemistry', 'Biology'];
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const examTypes = ['Quick Revision Test', 'Unit Test', 'Half-Yearly Practice', 'Board Exam Practice'];
  const availableQuestionTypes = ['MCQs', 'True/False', 'Short Answers', 'Long Answers', 'Case Studies'];

  const toggleQuestionType = (type) => {
    setFormData(prev => {
      const types = prev.question_types.includes(type)
        ? prev.question_types.filter(t => t !== type)
        : [...prev.question_types, type];
      return { ...prev, question_types: types };
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!formData.chapter || formData.question_types.length === 0) return;
    
    setLoading(true);
    try {
      const result = await examsService.generateExam(
        formData.class_level, 
        formData.subject, 
        formData.chapter, 
        formData.difficulty,
        formData.total_marks,
        formData.exam_type,
        formData.question_types
      );
      setGeneratedExam(result.generated_content);
    } catch (error) {
      console.error("Failed to generate exam", error);
      alert("Failed to generate exam. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    generatePDF('printable-exam', `${formData.exam_type.replace(/\s+/g, '_')}_${formData.subject}.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 font-sans selection:bg-purple-500/30">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-lg shadow-purple-500/20">
              <GraduationCap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Personalized Exam Generator</h1>
              <p className="text-sm text-gray-400">Generate custom test papers tailored to your needs</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Form Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sticky top-24 max-h-[80vh] overflow-y-auto custom-scrollbar">
              <form onSubmit={handleGenerate} className="space-y-4">
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Exam Type</label>
                  <select 
                    value={formData.exam_type}
                    onChange={(e) => setFormData({...formData, exam_type: e.target.value})}
                    className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  >
                    {examTypes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Class</label>
                    <select 
                      value={formData.class_level}
                      onChange={(e) => setFormData({...formData, class_level: e.target.value})}
                      className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    >
                      {classes.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Subject</label>
                    <select 
                      value={formData.subject}
                      onChange={(e) => setFormData({...formData, subject: e.target.value})}
                      className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    >
                      {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Syllabus / Chapters</label>
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Current Electricity & Magnetism"
                    value={formData.chapter}
                    onChange={(e) => setFormData({...formData, chapter: e.target.value})}
                    className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Total Marks</label>
                    <input 
                      type="number"
                      min="10"
                      max="100"
                      required
                      value={formData.total_marks}
                      onChange={(e) => setFormData({...formData, total_marks: Number(e.target.value)})}
                      className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Difficulty</label>
                    <select 
                      value={formData.difficulty}
                      onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                      className="w-full rounded-lg border border-white/10 bg-gray-900 py-2.5 px-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
                    >
                      {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Question Types</label>
                  <div className="flex flex-wrap gap-2">
                    {availableQuestionTypes.map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => toggleQuestionType(type)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                          formData.question_types.includes(type)
                            ? 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                            : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !formData.chapter || formData.question_types.length === 0}
                  className="w-full mt-4 group relative flex justify-center items-center gap-2 rounded-lg bg-purple-600 px-4 py-3 text-sm font-semibold text-white hover:bg-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all"
                >
                  {loading ? (
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Generate Exam Paper
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Results Area */}
          <div className="lg:col-span-3">
            {!generatedExam && !loading ? (
              <div className="h-full min-h-[600px] rounded-2xl border border-white/10 border-dashed bg-white/5 flex flex-col items-center justify-center text-center p-8">
                <div className="h-16 w-16 rounded-full bg-purple-500/10 flex items-center justify-center mb-4">
                  <GraduationCap className="h-8 w-8 text-purple-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Create Your Exam</h3>
                <p className="text-gray-400 max-w-sm">
                  Customize your syllabus, marks, and question types. Gemini will generate a full-length, structured exam paper identical to CBSE standards.
                </p>
              </div>
            ) : loading ? (
               <div className="h-full min-h-[600px] rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center p-8">
                 <div className="relative">
                   <div className="h-16 w-16 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                   <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-6 text-purple-500 animate-pulse" />
                 </div>
                 <h3 className="text-xl font-bold text-white mt-6 mb-2">Compiling Paper...</h3>
                 <p className="text-gray-400">Gemini is structuring the sections for {formData.exam_type}</p>
               </div>
            ) : (
              <div className="relative">
                <div id="printable-exam" className="rounded-2xl border border-white/10 bg-white overflow-hidden animate-in fade-in slide-in-from-bottom-4 text-gray-900 font-serif pb-12">
                  
                  <div className="p-8 pb-0">
                    <PrintHeader 
                      title={generatedExam.examTitle} 
                      subtitle={`${formData.subject} - ${formData.class_level}`} 
                    />
                  </div>

                  <div className="px-8 space-y-8">
                    {/* Student Details Fields */}
                    <div className="grid grid-cols-2 gap-8 text-sm font-bold border-2 border-gray-900 p-6 rounded-lg mb-8">
                      <div className="space-y-6">
                        <div className="flex items-end gap-2 border-b border-gray-400 pb-1">
                          <span className="whitespace-nowrap uppercase">Student Name:</span>
                          <span className="w-full"></span>
                        </div>
                        <div className="flex items-end gap-2 border-b border-gray-400 pb-1">
                          <span className="whitespace-nowrap uppercase">Roll No:</span>
                          <span className="w-full"></span>
                        </div>
                      </div>
                      <div className="space-y-6">
                        <div className="flex items-end gap-2 border-b border-gray-400 pb-1">
                          <span className="whitespace-nowrap uppercase">Date:</span>
                          <span className="w-full"></span>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <div><span className="uppercase text-gray-600 mr-2">Time:</span> {generatedExam.duration}</div>
                          <div><span className="uppercase text-gray-600 mr-2">Max Marks:</span> {generatedExam.totalMarks}</div>
                        </div>
                      </div>
                    </div>

                    {/* General Instructions */}
                    <div className="text-sm border border-gray-300 p-4 rounded bg-gray-50">
                      <h4 className="font-bold uppercase tracking-wider mb-2">Instructions:</h4>
                      <ol className="list-decimal list-inside space-y-1 ml-2 text-gray-800">
                        {generatedExam.generalInstructions.map((inst, i) => (
                          <li key={i}>{inst}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Sections */}
                    <div className="space-y-12">
                      {generatedExam.sections.map((section, secIndex) => (
                        <div key={secIndex}>
                          <div className="text-center font-black uppercase tracking-widest border-b-2 border-gray-900 mb-6 text-xl pb-2">
                            {section.sectionName}
                          </div>
                          
                          <div className="space-y-8">
                            {section.questions.map((q, qIndex) => (
                              <div key={qIndex} className="flex gap-4 page-break-inside-avoid">
                                <div className="font-bold min-w-[2rem] text-lg">{q.questionNumber}.</div>
                                <div className="flex-1">
                                  <p className="mb-4 text-lg leading-relaxed">{q.question}</p>
                                  
                                  {q.options && (
                                    <ol className="list-[upper-alpha] list-inside space-y-2 ml-2 mb-4">
                                      {q.options.map((opt, i) => (
                                        <li key={i} className="text-gray-800">{opt}</li>
                                      ))}
                                    </ol>
                                  )}
                                  
                                  {/* Space for written answers if no options */}
                                  {!q.options && (
                                    <div className="mt-4 border-b border-dashed border-gray-300 w-full h-12"></div>
                                  )}
                                  
                                  <details className="group mt-4" data-pdf-ignore>
                                    <summary className="text-xs font-sans font-medium text-blue-600 cursor-pointer outline-none hover:underline">
                                      Show Model Answer (Hidden in PDF)
                                    </summary>
                                    <div className="mt-2 p-3 bg-gray-100 rounded text-sm text-gray-800 font-sans border border-gray-200 whitespace-pre-wrap">
                                      {q.answer}
                                    </div>
                                  </details>
                                </div>
                                <div className="font-bold text-sm bg-gray-100 h-max px-2 py-1 rounded">[{section.marksPerQuestion}]</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Print/Save Action (Sticky footer outside paper) */}
                <div className="absolute bottom-8 right-8 flex gap-2">
                  <ExportPdfButton 
                    elementId="printable-exam" 
                    filename={`${formData.exam_type.replace(/\s+/g, '_')}_${formData.subject}.pdf`}
                    variant="primary"
                    className="shadow-xl shadow-purple-500/30 rounded-full px-6 py-3"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
