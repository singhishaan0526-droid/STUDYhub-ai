import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Trash2, ChevronLeft, BookText, FileQuestion, GraduationCap, MessageCircleQuestion, Eye, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import historyService from '../services/historyService';
import { formatDistanceToNow } from 'date-fns';

export default function History() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await historyService.getHistory();
      setHistory(data);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this record?")) return;
    try {
      await historyService.deleteHistory(id);
      setHistory(history.filter(h => h._id !== id));
    } catch (error) {
      console.error("Failed to delete history item", error);
      alert("Failed to delete item.");
    }
  };

  const getIcon = (type) => {
    switch(type) {
      case 'NOTE': return <BookText className="h-5 w-5 text-emerald-400" />;
      case 'QUESTION': return <FileQuestion className="h-5 w-5 text-blue-400" />;
      case 'EXAM': return <GraduationCap className="h-5 w-5 text-purple-400" />;
      case 'CHAT': return <MessageCircleQuestion className="h-5 w-5 text-orange-400" />;
      case 'QUIZ_ATTEMPT': return <PlayCircle className="h-5 w-5 text-yellow-400" />;
      default: return <HistoryIcon className="h-5 w-5 text-gray-400" />;
    }
  };

  const getGradient = (type) => {
    switch(type) {
      case 'NOTE': return 'from-emerald-500/10 to-teal-500/10 border-emerald-500/20';
      case 'QUESTION': return 'from-blue-500/10 to-indigo-500/10 border-blue-500/20';
      case 'EXAM': return 'from-purple-500/10 to-fuchsia-500/10 border-purple-500/20';
      case 'CHAT': return 'from-orange-500/10 to-red-500/10 border-orange-500/20';
      case 'QUIZ_ATTEMPT': return 'from-yellow-500/10 to-orange-500/10 border-yellow-500/20';
      default: return 'from-gray-500/10 to-gray-600/10 border-gray-500/20';
    }
  };

  const getTitle = (item) => {
    switch(item.activity_type) {
      case 'NOTE': return `Notes: ${item.input_data.chapter}`;
      case 'QUESTION': return `Questions: ${item.input_data.chapter}`;
      case 'EXAM': return `Exam: ${item.input_data.chapter || item.input_data.exam_type}`;
      case 'CHAT': return `Doubt: ${item.input_data.query.length > 30 ? item.input_data.query.substring(0, 30) + '...' : item.input_data.query}`;
      case 'QUIZ_ATTEMPT': return `Quiz: ${item.input_data.topic} (${item.input_data.difficulty})`;
      default: return 'Activity Record';
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 sm:p-8 font-sans selection:bg-pink-500/30">
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
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/20">
              <HistoryIcon className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Activity History</h1>
              <p className="text-sm text-gray-400">Review or delete your previously generated study materials</p>
            </div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="h-8 w-8 rounded-full border-2 border-white/20 border-t-pink-500 animate-spin"></div>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-20 rounded-2xl border border-white/10 border-dashed bg-white/5">
              <HistoryIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400">No activity history found yet.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item._id} 
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border bg-gradient-to-r ${getGradient(item.activity_type)} transition-all hover:brightness-110`}
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1 shrink-0 p-2 rounded-lg bg-black/40">
                    {getIcon(item.activity_type)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-white mb-1">{getTitle(item)}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-400">
                      <span>{formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}</span>
                      {item.input_data.subject && <span>• {item.input_data.subject} ({item.input_data.class_level})</span>}
                      {item.activity_type === 'QUIZ_ATTEMPT' && (
                        <span className="text-yellow-400">• Score: {item.input_data.score}/{item.input_data.total_questions} ({item.input_data.percentage}%)</span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:ml-auto">
                  <button 
                    onClick={() => alert('View/Reuse functionality would navigate to the respective tool and load this data state.')}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors"
                  >
                    <Eye className="h-4 w-4" />
                    View
                  </button>
                  <button 
                    onClick={() => handleDelete(item._id)}
                    className="flex items-center justify-center p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                    title="Delete record"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}
