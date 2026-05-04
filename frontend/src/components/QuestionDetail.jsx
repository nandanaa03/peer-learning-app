import React, { useState, useEffect } from 'react';
import API from '../api';
import { useParams, useNavigate } from 'react-router-dom';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newAnswer, setNewAnswer] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPostDetails();
  }, [id]);

  const fetchPostDetails = async () => {
    try {
      const res = await API.get(`/api/forum/${id}`);
      setData(res.data);
    } catch (err) {
      console.error('Error fetching post details:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (!newAnswer.trim()) return;
    setSubmitting(true);
    try {
      const res = await API.post(`/api/forum/${id}/answer`, { answer: newAnswer });
      setData(prev => ({
        ...prev,
        answers: [...prev.answers, res.data]
      }));
      setNewAnswer('');
    } catch (err) {
      console.error('Error submitting answer:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="bg-amber-50 p-6 rounded-2xl border border-stone-200 w-full max-w-4xl mx-auto text-center mt-10"><p className="text-stone-600">Loading question...</p></div>;
  if (!data) return <div className="bg-amber-50 p-6 rounded-2xl border border-stone-200 w-full max-w-4xl mx-auto text-center mt-10"><p className="text-stone-600 font-semibold mb-4">Question not found.</p><button className="px-4 py-2 bg-stone-500 text-white rounded-xl font-bold hover:bg-stone-600 transition-all" onClick={() => navigate('/forum')}>Back to Forum</button></div>;

  const { post, answers } = data;

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 w-full max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={() => navigate('/forum')} className="px-4 py-2 bg-gray-500 text-white font-bold rounded hover:bg-gray-600">← Back to Forum</button>
        <span className="text-sm font-semibold text-stone-500">Question Detail</span>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-stone-200 border-l-4 border-l-orange-400 mb-8 text-left">
        <span className="text-xs uppercase font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full inline-block mb-3">
          {post.subject}
        </span>
        <h2 className="m-0 mb-4 text-xl font-bold text-stone-800">{post.title}</h2>
        <p className="whitespace-pre-wrap text-stone-700 leading-relaxed text-sm m-0">
          {post.description}
        </p>
        <div className="mt-6 pt-4 border-t border-stone-200 text-xs text-stone-500 flex items-center gap-2">
          Asked by <span className="font-bold text-orange-600">{post.user.name}</span> 
          {post.user.expertTags && post.user.expertTags.length > 0 && (
            <span title={post.user.expertTags.join(', ')} className="cursor-help">⭐</span>
          )}
          • {new Date(post.createdAt).toLocaleDateString()}
        </div>
      </div>

      <div className="text-left">
        <h3 className="mb-4 flex items-center gap-3 text-lg font-bold text-stone-800">
          Answers <span className="text-xs bg-orange-500 text-white px-2 py-1 rounded-full">{answers.length}</span>
        </h3>
        
        <div className="grid gap-4 mb-8">
          {answers.length === 0 ? (
            <p className="text-stone-400 italic py-4 text-center bg-amber-50 rounded-xl">No answers yet. Share your knowledge!</p>
          ) : (
            answers.map(ans => (
              <div key={ans._id} className="bg-white p-5 rounded-2xl border border-stone-200">
                <p className="m-0 text-stone-800 whitespace-pre-wrap text-sm">{ans.answer}</p>
                <div className="mt-4 text-xs font-semibold text-stone-500 flex items-center gap-2">
                  Answered by <span className="font-bold text-stone-800">{ans.user.name}</span> 
                  {ans.user.expertTags && ans.user.expertTags.length > 0 && (
                    <span title={ans.user.expertTags.join(', ')} className="cursor-help">⭐</span>
                  )}
                  • {new Date(ans.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200">
          <h4 className="m-0 mb-3 text-orange-800 font-bold text-base">Provide your Answer</h4>
          <form onSubmit={handleAnswerSubmit}>
            <textarea
              rows="4"
              placeholder="Write your explanation here..."
              required
              className="w-full p-4 rounded border border-stone-200 text-stone-800 text-sm outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-100 resize-y bg-white"
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
            ></textarea>
            <button 
              type="submit" 
              disabled={submitting} 
              className={`mt-4 w-full py-2 font-bold text-white rounded ${submitting ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'}`}
            >
              {submitting ? 'Submitting...' : 'Post Answer'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
