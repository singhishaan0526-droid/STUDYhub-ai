import React, { useState, useRef, useEffect, useContext } from 'react';
import { MessageCircleQuestion, Sparkles, ChevronLeft, Send, Bot, User as UserIcon, Paperclip, X, Image as ImageIcon, FileText, Mic, MicOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import doubtsService from '../services/doubtsService';
import { AuthContext } from '../context/AuthContext';
import useSpeechRecognition from '../hooks/useSpeechRecognition';

export default function DoubtAssistant() {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState('');
  const [attachment, setAttachment] = useState(null); // { name, mimeType, data, previewUrl }
  const [messages, setMessages] = useState([
    { 
      role: 'assistant', 
      content: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your CBSE & NCERT AI Doubt Assistant. Ask any academic question or attach a diagram, math problem, or textbook page to begin!` 
    }
  ]);

  const chatEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const {
    isListening,
    transcript,
    interimTranscript,
    error: speechError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript,
    setError: setSpeechError
  } = useSpeechRecognition();

  // Auto scroll to bottom as streaming tokens arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Sync speech transcript to input box dynamically
  useEffect(() => {
    if (isListening) {
      // Append the live transcript + interim text to the input field
      // Wait, we need to be careful not to overwrite user's typed text completely
      // A good strategy: if they type, we let them, but speech just overwrites the box for simplicity
      // Or better: speech appends to whatever was in the box before listening started.
      // For this implementation, let's keep it simple: the transcript replaces the box while listening.
      setInput(transcript + (interimTranscript ? ' ' + interimTranscript : ''));
    }
  }, [transcript, interimTranscript, isListening]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("File size exceeds 5MB limit.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result.split(',')[1];
      setAttachment({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        data: base64Data,
        previewUrl: file.type.startsWith('image/') ? reader.result : null
      });
    };
    reader.readAsDataURL(file);
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const submitQuery = async (queryText, fileAttachment = attachment) => {
    if (!queryText.trim() && !fileAttachment) return;

    const userQuery = queryText.trim();
    const mediaPayload = fileAttachment ? { mimeType: fileAttachment.mimeType, data: fileAttachment.data } : null;

    setInput('');
    setAttachment(null);
    resetTranscript();
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Add user message to UI
    const newHistory = [...messages, { 
      role: 'user', 
      content: userQuery || "Attached file for analysis.",
      attachment: fileAttachment 
    }];

    // Reserve placeholder for streaming assistant response
    const assistantMsgIndex = newHistory.length;
    const updatedMessages = [...newHistory, { role: 'assistant', content: '' }];

    setMessages(updatedMessages);
    setLoading(true);

    let accumulatedResponse = '';

    try {
      // Stream response in real-time
      await doubtsService.askDoubtStream(
        userQuery,
        newHistory.slice(1).map(m => ({ role: m.role, content: m.content })),
        mediaPayload,
        // Chunk received
        (chunkText) => {
          accumulatedResponse += chunkText;
          setMessages((prev) => {
            const copy = [...prev];
            copy[assistantMsgIndex] = { role: 'assistant', content: accumulatedResponse };
            return copy;
          });
        },
        // Completed
        () => {
          setLoading(false);
        },
        // Error
        (errorMsg) => {
          console.error("Stream error:", errorMsg);
          setMessages((prev) => {
            const copy = [...prev];
            copy[assistantMsgIndex] = { 
              role: 'assistant', 
              content: accumulatedResponse || `Sorry, an error occurred while generating the answer: ${errorMsg}` 
            };
            return copy;
          });
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Submit error:", err);
      setMessages((prev) => [
        ...prev.slice(0, assistantMsgIndex),
        { role: 'assistant', content: "Unable to reach Gemini API. Please verify backend connection." }
      ]);
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitQuery(input, attachment);
  };

  const quickPrompts = [
    "Explain Newton's Second Law with formula & example",
    "How does Photosynthesis work in NCERT Class 10?",
    "Give top CBSE Board Exam preparation tips for Chemistry",
    "Explain standard steps to balance a chemical equation"
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 font-sans selection:bg-orange-500/30 flex flex-col">
      <div className="max-w-5xl mx-auto w-full flex-1 flex flex-col border border-white/10 rounded-3xl bg-gray-900/50 overflow-hidden shadow-2xl backdrop-blur-xl">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 bg-black/40 p-6 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
                <MessageCircleQuestion className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  Doubt Assistant
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Gemini 3.6 Flash
                  </span>
                </h1>
                <p className="text-sm text-gray-400">CBSE / NCERT AI Tutor with Multimodal Vision & Streaming</p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}>
              
              {/* Avatar */}
              <div className={`shrink-0 h-10 w-10 rounded-full flex items-center justify-center border ${
                msg.role === 'user' 
                  ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' 
                  : 'bg-orange-500/20 border-orange-500/30 text-orange-400'
              }`}>
                {msg.role === 'user' ? <UserIcon className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
              </div>

              {/* Message Bubble */}
              <div className={`p-4 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white rounded-tr-sm' 
                  : 'bg-white/5 border border-white/10 text-gray-200 rounded-tl-sm'
              }`}>
                
                {/* User Attachment Rendering */}
                {msg.attachment && (
                  <div className="mb-3 p-2 bg-black/30 rounded-xl border border-white/10 flex items-center gap-3">
                    {msg.attachment.previewUrl ? (
                      <img src={msg.attachment.previewUrl} alt="Attached image" className="h-16 w-16 object-cover rounded-lg border border-white/20" />
                    ) : (
                      <div className="h-12 w-12 bg-white/10 rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-gray-300" />
                      </div>
                    )}
                    <span className="text-xs text-gray-300 font-mono truncate max-w-[150px]">
                      {msg.attachment.name}
                    </span>
                  </div>
                )}

                <div className="whitespace-pre-wrap leading-relaxed">
                  {msg.content || (loading && idx === messages.length - 1 ? (
                    <span className="animate-pulse text-gray-400">Thinking and solving...</span>
                  ) : '')}
                </div>
              </div>
            </div>
          ))}

          {/* Quick Prompts on initial conversation */}
          {messages.length <= 1 && (
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Quick CBSE Starter Questions:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {quickPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => submitQuery(prompt)}
                    className="text-left text-xs p-3 rounded-xl bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-orange-500/10 text-gray-300 hover:text-orange-300 transition-all flex items-center justify-between group"
                  >
                    <span>{prompt}</span>
                    <Sparkles className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-orange-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div ref={chatEndRef} />
        </div>

        {/* Attachment Preview Bar */}
        {attachment && (
          <div className="px-6 py-2 bg-black/60 border-t border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {attachment.previewUrl ? (
                <img src={attachment.previewUrl} alt="Thumbnail" className="h-10 w-10 object-cover rounded-md border border-white/20" />
              ) : (
                <FileText className="h-6 w-6 text-orange-400" />
              )}
              <div>
                <p className="text-xs font-medium text-white">{attachment.name}</p>
                <p className="text-[10px] text-gray-400">Attached for Gemini Multimodal Analysis</p>
              </div>
            </div>
            <button
              type="button"
              onClick={removeAttachment}
              className="p-1 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-black/40 border-t border-white/10 relative">
          
          {/* Speech Error Banner */}
          {speechError && (
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-red-500/90 text-white text-xs font-medium px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
              <span>{speechError}</span>
              <button onClick={() => setSpeechError(null)} className="hover:text-red-200">
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 max-w-4xl mx-auto items-center">
            
            {/* File Upload Button */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*,application/pdf" 
              className="hidden" 
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-orange-400 hover:bg-white/10 hover:border-orange-500/30 transition-all"
              title="Attach Image or PDF diagram/problem"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            {/* Input Text */}
            <div className="relative flex-1">
              <input 
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isListening ? "Listening..." : "Ask any doubt or describe the attached image/problem..."}
                className={`w-full rounded-xl border ${isListening ? 'border-red-500/50 bg-red-500/5' : 'border-white/10 bg-white/5'} px-4 sm:px-6 py-3 sm:py-4 text-white placeholder:text-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all pr-12`}
              />
              {/* Mic inside or outside? The instructions said "next to the existing doubt input". Let's put it as a separate button right before Send. */}
            </div>

            {/* Voice Input Button */}
            {isSupported && (
              <button
                type="button"
                onClick={isListening ? stopListening : startListening}
                className={`flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl border transition-all ${
                  isListening 
                    ? 'border-red-500/50 bg-red-500/20 text-red-400 animate-pulse' 
                    : 'border-white/10 bg-white/5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30'
                }`}
                aria-label={isListening ? "Stop voice input" : "Start voice input"}
                title={isListening ? "Stop Listening" : "Speak Doubt"}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || (!input.trim() && !attachment)}
              className="group flex h-12 w-12 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-xl bg-orange-600 text-white hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 transition-all"
            >
              <Send className="h-5 w-5 sm:h-6 sm:w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </button>
          </form>

          <div className="text-center mt-3">
            <span className="text-xs text-gray-500 flex items-center justify-center gap-1">
              <Sparkles className="h-3 w-3 text-orange-400" />
              Powered by Google Gemini 3.6 Flash — real-time streaming & vision enabled.
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}

