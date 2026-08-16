import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, CheckCircle2, XCircle, Trophy, RefreshCcw, ArrowLeft, ArrowRight, Play, HelpCircle } from 'lucide-react';
import quizService from '../services/quizService';

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract data passed from QuestionGenerator
  const { questions = [], chapter = 'Custom Quiz', difficulty = 'Medium' } = location.state || {};

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { index: "Selected Option" }
  const [isFinished, setIsFinished] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [quizResult, setQuizResult] = useState(null);

  // Redirect if accessed directly without questions
  useEffect(() => {
    if (!questions || questions.length === 0) {
      navigate('/questions');
    }
  }, [questions, navigate]);

  if (!questions || questions.length === 0) return null;

  const currentQ = questions[currentIndex];
  const progressPercentage = ((currentIndex + 1) / questions.length) * 100;
  const isLastQuestion = currentIndex === questions.length - 1;

  const handleOptionSelect = (option) => {
    if (isReviewMode) return;
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: option
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFinish = async () => {
    // Calculate score locally for immediate display
    let correct = 0;
    let incorrect = 0;
    let unanswered = 0;

    questions.forEach((q, idx) => {
      const userAns = answers[idx];
      if (!userAns) unanswered++;
      else if (userAns === q.correctAnswer) correct++;
      else incorrect++;
    });

    const score = correct;
    const percentage = Math.round((correct / questions.length) * 100);

    const resultData = {
      topic: chapter,
      difficulty,
      total_questions: questions.length,
      score,
      percentage,
      correct_answers: correct,
      incorrect_answers: incorrect,
      unanswered,
      answers_data: answers // Store user's specific answers
    };

    setQuizResult(resultData);
    setIsFinished(true);

    // Save to backend
    setIsSaving(true);
    try {
      await quizService.saveAttempt(resultData);
    } catch (error) {
      console.error("Failed to save quiz attempt:", error);
      // We don't block the UI if saving fails, but we log it.
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setCurrentIndex(0);
    setIsFinished(false);
    setIsReviewMode(false);
    setQuizResult(null);
  };

  // --- REVIEW MODE UI ---
  if (isReviewMode) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 font-sans">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-6 mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsReviewMode(false)} className="p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold">Review Answers</h1>
                <p className="text-sm text-gray-400">{chapter} • Score: {quizResult.score}/{questions.length}</p>
              </div>
            </div>
            <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">
              Exit to Dashboard
            </button>
          </div>

          <div className="space-y-8">
            {questions.map((q, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns === q.correctAnswer;
              const isUnanswered = !userAns;

              return (
                <div key={idx} className={`p-6 rounded-2xl border ${isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : isUnanswered ? 'border-gray-500/30 bg-gray-500/5' : 'border-red-500/30 bg-red-500/5'}`}>
                  <div className="flex items-start gap-4 mb-4">
                    <div className="mt-1">
                      {isCorrect ? <CheckCircle2 className="h-6 w-6 text-emerald-500" /> : isUnanswered ? <HelpCircle className="h-6 w-6 text-gray-400" /> : <XCircle className="h-6 w-6 text-red-500" />}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium mb-4"><span className="text-blue-400 mr-2">Q{idx + 1}.</span>{q.question}</h3>
                      
                      <div className="grid sm:grid-cols-2 gap-3 mb-4">
                        {q.options.map((opt, optIdx) => {
                          const isOptUserAns = opt === userAns;
                          const isOptCorrectAns = opt === q.correctAnswer;
                          
                          let style = "border-white/10 bg-white/5 text-gray-400";
                          if (isOptCorrectAns) style = "border-emerald-500 bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500";
                          else if (isOptUserAns && !isCorrect) style = "border-red-500 bg-red-500/20 text-red-300";

                          return (
                            <div key={optIdx} className={`rounded-xl border p-4 text-sm font-medium ${style}`}>
                              {opt}
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10 text-sm text-gray-300">
                        <span className="font-semibold text-white mr-2">Explanation:</span>
                        {q.explanation || "No explanation provided."}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // --- RESULT SCREEN UI ---
  if (isFinished) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 font-sans flex items-center justify-center">
        <div className="w-full max-w-2xl bg-gray-900/50 border border-white/10 rounded-3xl p-8 sm:p-12 text-center backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-8">
          <div className="mx-auto w-24 h-24 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-yellow-500/20 ring-8 ring-yellow-500/10">
            <Trophy className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Quiz Completed!</h1>
          <p className="text-gray-400 mb-8">{chapter} • {difficulty}</p>

          <div className="flex flex-wrap justify-center gap-4 mb-10">
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 min-w-[140px]">
              <p className="text-sm text-gray-400 font-medium mb-1">Accuracy</p>
              <p className="text-4xl font-bold text-blue-400">{quizResult.percentage}%</p>
            </div>
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 min-w-[140px]">
              <p className="text-sm text-gray-400 font-medium mb-1">Score</p>
              <p className="text-4xl font-bold text-white"><span className="text-emerald-400">{quizResult.score}</span> / {questions.length}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button onClick={() => setIsReviewMode(true)} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors">
              <CheckCircle2 className="h-5 w-5" />
              Review Answers
            </button>
            <button onClick={handleRetry} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-colors">
              <RefreshCcw className="h-5 w-5" />
              Try Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-gray-400 hover:bg-white/5 hover:text-white font-medium transition-colors">
              Exit
            </button>
          </div>
          
          {isSaving && <p className="text-xs text-gray-500 mt-6 animate-pulse">Saving results to history...</p>}
        </div>
      </div>
    );
  }

  // --- QUIZ IN-PROGRESS UI ---
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 font-sans flex flex-col">
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-xl font-bold mb-1">{chapter}</h1>
            <p className="text-sm text-blue-400">{difficulty} Quiz</p>
          </div>
          <button 
            onClick={() => {
              if (window.confirm("Are you sure you want to exit? Your progress will be lost.")) {
                navigate(-1);
              }
            }}
            className="px-4 py-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors text-sm font-medium"
          >
            Exit Quiz
          </button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-400 mb-3">
            <span>Question {currentIndex + 1} of {questions.length}</span>
            <span>{Math.round(progressPercentage)}% Completed</span>
          </div>
          <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="flex-1">
          <div className="bg-gray-900/50 border border-white/10 rounded-3xl p-6 sm:p-10 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-8 duration-300" key={currentIndex}>
            <h2 className="text-2xl sm:text-3xl font-medium leading-tight mb-8">
              {currentQ.question}
            </h2>

            <div className="space-y-4">
              {currentQ.options.map((opt, idx) => {
                const isSelected = answers[currentIndex] === opt;
                return (
                  <button
                    key={idx}
                    onClick={() => handleOptionSelect(opt)}
                    className={`w-full text-left px-6 py-4 rounded-2xl border transition-all duration-200 flex items-center justify-between group ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-500/10 text-white ring-1 ring-blue-500 shadow-lg shadow-blue-500/10' 
                        : 'border-white/10 bg-black/40 text-gray-300 hover:bg-white/5 hover:border-gray-500 hover:text-white'
                    }`}
                  >
                    <span className="text-lg">{opt}</span>
                    <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                      isSelected ? 'border-blue-500' : 'border-gray-600 group-hover:border-gray-400'
                    }`}>
                      {isSelected && <div className="h-3 w-3 bg-blue-500 rounded-full animate-in zoom-in" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400 transition-all"
          >
            <ArrowLeft className="h-5 w-5" />
            Previous
          </button>

          {isLastQuestion ? (
            <button
              onClick={handleFinish}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 transition-all"
            >
              Finish Quiz
              <CheckCircle2 className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="flex items-center gap-2 px-8 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/20 transition-all"
            >
              Next
              <ArrowRight className="h-5 w-5" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
