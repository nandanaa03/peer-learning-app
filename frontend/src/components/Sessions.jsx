import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ModeTag = ({ mode }) => {
  if (!mode) return null;
  return mode === 'online' ? (
    <span className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold inline-block mt-1">
      🌐 Online Session
    </span>
  ) : (
    <span className="bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold inline-block mt-1">
      📍 Offline Session
    </span>
  );
};

const Sessions = () => {
  const [mySessions, setMySessions] = useState([]);
  const [allSessions, setAllSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = { 'x-auth-token': localStorage.getItem('token') };
      
      const [myRes, allRes] = await Promise.all([
        axios.get('/api/session/my', { headers }),
        axios.get('/api/session/all', { headers })
      ]);
      
      setMySessions(myRes.data);
      setAllSessions(allRes.data);
    } catch (err) {
      console.error('Failed to fetch sessions');
      setError('Failed to load sessions data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleJoinSession = async (sessionId) => {
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await axios.post(`/api/session/join/${sessionId}`, {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join session');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFindMatch = async () => {
    setActionLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await axios.post('/api/session/match', {}, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setMessage(res.data.message);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to find a match');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <div className="bg-amber-50 p-6 rounded-2xl border border-stone-200 w-full max-w-5xl mx-auto text-center mt-10"><p className="text-stone-600">Loading sessions...</p></div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 w-full max-w-5xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Group Learning Sessions</h2>
      <p className="text-stone-600 mb-6 text-sm">Participate in collaborative sessions or find a private mentor</p>

      {message && <div className="bg-teal-100 text-teal-700 p-3 rounded-xl mb-6 text-sm font-bold border border-green-200">{message}</div>}
      {error && <div className="bg-rose-100 text-rose-700 p-3 rounded-xl mb-6 text-sm border border-red-200">{error}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">

        {/* Available Sessions Section */}
        <div className="text-left">
          <h3 className="mb-4 border-b-2 border-stone-200 pb-2 text-xl font-bold text-stone-800">
            Available Sessions
          </h3>
          {allSessions.length === 0 ? (
            <p className="text-stone-500 text-sm">No group sessions available at the moment.</p>
          ) : (
            allSessions.map(session => {
              const isParticipant = mySessions.some(ms => ms._id === session._id);
              const isFull = session.participants.length >= (session.maxParticipants || 5);

              return (
                <div key={session._id} className="bg-white p-5 rounded-2xl border border-stone-200 border-l-4 border-l-teal-500 mb-4">
                  <h4 className="text-teal-600 font-bold text-lg mb-1">{session.topic}</h4>
                  <ModeTag mode={session.mode} />
                  <p className="text-xs text-stone-400 mt-2 font-medium">
                    📅 {new Date(session.date).toLocaleDateString()} at {session.time}
                  </p>
                  <p className={`text-sm font-semibold mt-1 ${isFull ? 'text-rose-500' : 'text-stone-700'}`}>
                    👥 Participants: {session.participants.length}/{session.maxParticipants || 5}
                    {isFull && <span className="ml-2 text-rose-500">(Full)</span>}
                  </p>
                  {session.mode === 'online' && session.meetingLink && (
                    <p className="text-xs text-orange-600 mt-2 font-semibold">
                      🔗 <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">Join Meeting</a>
                    </p>
                  )}
                  {session.mode === 'offline' && session.location && (
                    <p className="text-xs text-stone-600 mt-2 font-medium">
                      📍 {session.location}
                    </p>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => handleJoinSession(session._id)}
                      disabled={actionLoading || isParticipant || isFull}
                      className={`text-xs px-4 py-2 rounded font-bold text-white ${isParticipant ? 'bg-stone-400 cursor-not-allowed' : isFull ? 'bg-stone-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'}`}
                    >
                      {isParticipant ? 'Joined' : isFull ? 'Session Full' : 'Join Session'}
                    </button>
                    <button
                      onClick={() => navigate(`/session/${session._id}`)}
                      className="text-xs px-4 py-2 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
                    >
                      Details
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* My Sessions Section */}
        <div className="text-left">
          <h3 className="mb-4 border-b-2 border-stone-200 pb-2 text-xl font-bold text-stone-800">
            My Scheduled Sessions
          </h3>

          <button
            onClick={handleFindMatch}
            disabled={actionLoading}
            className={`w-full py-2 mb-6 font-bold text-sm text-white rounded ${actionLoading ? 'bg-teal-400 cursor-not-allowed' : 'bg-teal-500 hover:bg-teal-600'}`}
          >
            {actionLoading ? 'Processing...' : '🔥 Find Expert & Schedule Match'}
          </button>

          {mySessions.length === 0 ? (
            <div className="bg-amber-50 p-5 rounded-2xl border border-stone-200 text-sm text-stone-600">
              <p>No sessions scheduled. Join a group session or click above to find a mentor!</p>
            </div>
          ) : (
            mySessions.map(session => (
              <div key={session._id} className="bg-white p-5 rounded-2xl border border-stone-200 border-l-4 border-l-orange-400 mb-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="text-orange-600 font-bold text-lg mb-1">{session.topic}</h4>
                    <ModeTag mode={session.mode} />
                    <p className="text-xs text-stone-400 mt-2 font-medium">
                      📅 {new Date(session.date).toLocaleDateString()} at {session.time}
                    </p>
                    <p className="text-sm font-semibold text-stone-700 mt-1">
                      👥 {session.participants.length} Participants
                    </p>
                    {session.mode === 'online' && session.meetingLink && (
                      <p className="text-xs text-orange-600 mt-2 font-semibold">
                        🔗 <a href={session.meetingLink} target="_blank" rel="noopener noreferrer" className="hover:underline">Join Meeting</a>
                      </p>
                    )}
                    {session.mode === 'offline' && session.location && (
                      <p className="text-xs text-stone-600 mt-2 font-medium">
                        📍 {session.location}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => navigate(`/session/${session._id}`)}
                    className="text-xs px-3 py-1 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </div>

      <button onClick={() => navigate('/dashboard')} className="w-48 mt-8 py-2 bg-stone-500 text-white font-bold rounded-xl hover:bg-stone-600 transition-all mx-auto block">
        Back to Dashboard
      </button>
    </div>
  );
};

export default Sessions;
