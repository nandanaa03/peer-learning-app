import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const History = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await axios.get('/api/history', {
          headers: { 'x-auth-token': localStorage.getItem('token') }
        });
        setHistory(res.data);
      } catch (err) {
        setError('Failed to fetch learning history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  if (loading) return <div className="bg-amber-50 p-6 rounded-2xl border border-stone-200 w-full max-w-4xl mx-auto text-center mt-10"><p className="text-stone-600">Loading history...</p></div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 w-full max-w-4xl mx-auto text-center">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-stone-800 m-0">Learning History</h2>
        <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all">Back to Dashboard</button>
      </div>

      {error && <div className="bg-rose-100 text-rose-700 p-3 rounded-xl mb-6 text-sm">{error}</div>}

      {history.length === 0 ? (
        <div className="bg-amber-50 p-8 rounded-2xl border border-stone-200 text-center">
          <p className="text-base text-stone-500 mb-4">No history available yet.</p>
          <button onClick={() => navigate('/sessions')} className="px-6 py-2 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all">Browse Sessions</button>
        </div>
      ) : (
        <div className="grid gap-4">
          {history.map(session => (
            <div key={session._id} className={`bg-white p-5 rounded-2xl border border-stone-200 border-l-4 text-left flex justify-between items-center ${session.status === 'completed' ? 'border-l-teal-500' : 'border-l-orange-400'}`}>
              <div>
                <h3 className="m-0 mb-2 text-lg font-bold text-stone-800">{session.topic}</h3>
                <p className="m-0 text-sm font-medium text-stone-500">
                  📅 {new Date(session.date).toLocaleDateString()} at {session.time}
                </p>
                <p className="mt-2 mb-0 text-sm font-semibold text-stone-700">
                  👥 {session.participants.length} Participants
                </p>
              </div>
              <div className="text-right">
                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${session.status === 'completed' ? 'bg-teal-100 text-teal-700' : 'bg-orange-100 text-orange-700'}`}>
                  {session.status}
                </span>
                <button 
                  onClick={() => navigate(`/session/${session._id}`)}
                  className="block mt-4 px-3 py-1 text-xs font-bold bg-orange-50 text-orange-600 border border-orange-400 rounded-xl hover:bg-orange-100"
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
