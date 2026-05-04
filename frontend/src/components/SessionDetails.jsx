import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const SessionDetails = () => {
  const { id } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modeForm, setModeForm] = useState({ mode: 'online', meetingLink: '', location: '' });
  const [modeMsg, setModeMsg] = useState('');
  const [modeError, setModeError] = useState('');
  const [savingMode, setSavingMode] = useState(false);
  const navigate = useNavigate();

  const fetchSession = async () => {
    try {
      const res = await axios.get(`/api/session/${id}`, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setSession(res.data);
      setModeForm({
        mode: res.data.mode || 'online',
        meetingLink: res.data.meetingLink || '',
        location: res.data.location || ''
      });
    } catch (err) {
      setError('Failed to fetch session details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [id]);

  const handleModeChange = (newMode) => {
    setModeForm(prev => ({ ...prev, mode: newMode, meetingLink: '', location: '' }));
  };

  const handleSaveMode = async () => {
    setSavingMode(true);
    setModeMsg('');
    setModeError('');
    try {
      const res = await axios.put(`/api/session/mode/${id}`, modeForm, {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setModeMsg(res.data.message);
      setSession(res.data.session);
    } catch (err) {
      setModeError(err.response?.data?.message || 'Failed to update mode');
    } finally {
      setSavingMode(false);
    }
  };

  if (loading) return <div className="bg-amber-50 p-6 rounded-2xl border border-stone-200 w-full max-w-4xl mx-auto text-center mt-10"><p className="text-stone-600">Loading details...</p></div>;
  if (error) return <div className="bg-amber-50 p-6 rounded-2xl border border-stone-200 w-full max-w-4xl mx-auto text-center mt-10"><div className="bg-rose-100 text-rose-700 p-3 rounded-xl mb-4 text-sm border border-rose-200">{error}</div><button className="px-4 py-2 bg-stone-500 text-white rounded-xl font-bold hover:bg-stone-600 transition-all" onClick={() => navigate('/sessions')}>Back to Sessions</button></div>;
  if (!session) return <div className="bg-amber-50 p-6 rounded-2xl border border-stone-200 w-full max-w-4xl mx-auto text-center mt-10"><p className="text-stone-600">Session not found</p></div>;

  const isCompleted = session.status === 'completed';

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 w-full max-w-3xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Session Details</h2>
      <p className="text-stone-600 mb-6 text-sm">
        Topic: <span className="text-orange-600 font-bold">{session.topic}</span>
      </p>

      {/* Session Info */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 border-t-4 border-t-orange-400 mb-6 text-left">
        <div className="grid grid-cols-[140px_1fr] gap-4 mb-6 text-sm">
          <strong className="text-stone-500">Date:</strong>
          <span className="text-stone-800 font-medium">{new Date(session.date).toLocaleDateString()}</span>

          <strong className="text-stone-500">Time:</strong>
          <span className="text-stone-800 font-medium">{session.time}</span>

          <strong className="text-stone-500">Status:</strong>
          <span className={`uppercase text-xs font-bold ${session.status === 'scheduled' ? 'text-teal-600' : 'text-stone-500'}`}>
            {session.status}
          </span>

          <strong className="text-stone-500">Capacity:</strong>
          <span className="text-stone-800 font-medium">{session.participants.length} / {session.maxParticipants || 5} Participants</span>

          <strong className="text-stone-500">Mode:</strong>
          <span className="flex items-center gap-2">
            {session.mode === 'online' ? (
              <span className="bg-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-block">
                🌐 Online Session
              </span>
            ) : (
              <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold inline-block">
                📍 Offline Session
              </span>
            )}
          </span>

          {session.mode === 'online' && session.meetingLink && (
            <>
              <strong className="text-stone-500">Meeting Link:</strong>
              <a href={session.meetingLink} target="_blank" rel="noopener noreferrer"
                className="text-orange-600 font-medium break-all hover:underline">
                {session.meetingLink}
              </a>
            </>
          )}

          {session.mode === 'offline' && session.location && (
            <>
              <strong className="text-stone-500">Location:</strong>
              <span className="text-stone-800 font-medium">{session.location}</span>
            </>
          )}
        </div>

        <h4 className="border-t border-stone-200 pt-6 mb-4 text-stone-800 font-bold">
          Participants List
        </h4>
        <ul className="list-none p-0">
          {session.participants.map(user => (
            <li key={user._id} className="p-3 bg-amber-50 rounded-xl mb-2 flex items-center border border-stone-200">
              <div className="w-3 h-3 rounded-full bg-orange-400 mr-4"></div>
              <div>
                <div className="font-bold text-stone-800 flex items-center gap-2 text-sm">
                  {user.name}
                  {user.expertTags && user.expertTags.length > 0 && (
                    <span title={user.expertTags.join(', ')} className="cursor-help">⭐</span>
                  )}
                </div>
                <div className="text-xs text-stone-500">{user.email}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Mode Selection Panel */}
      <div className={`bg-amber-50 p-6 rounded-2xl border border-stone-200 border-l-4 border-l-amber-400 mb-6 text-left ${isCompleted ? 'opacity-60 pointer-events-none' : ''}`}>
        <h4 className="mb-4 text-stone-800 font-bold">
          📋 Study Session Mode
          {isCompleted && <span className="text-xs text-rose-600 ml-2 font-normal">
            (Editing disabled — session completed)
          </span>}
        </h4>

        {/* Toggle Buttons */}
        <div className="flex gap-4 mb-6">
          <button
            onClick={() => handleModeChange('online')}
            className={`px-6 py-2 rounded-full font-bold text-sm ${modeForm.mode === 'online' ? 'bg-orange-500 text-white' : 'bg-stone-200 text-stone-700 hover:bg-stone-300'}`}
          >
            🌐 Online
          </button>
          <button
            onClick={() => handleModeChange('offline')}
            className={`px-6 py-2 rounded-full font-bold text-sm ${modeForm.mode === 'offline' ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          >
            📍 Offline
          </button>
        </div>

        {/* Conditional Input */}
        {modeForm.mode === 'online' && (
          <div className="mb-4">
            <label className="block mb-2 font-bold text-gray-700 text-sm">
              Meeting Link <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="url"
              placeholder="e.g. https://meet.google.com/abc-defg-hij"
              value={modeForm.meetingLink}
              onChange={e => setModeForm(prev => ({ ...prev, meetingLink: e.target.value }))}
              className="w-full px-4 py-2 rounded border border-stone-200 text-sm outline-none focus:border-orange-400"
            />
          </div>
        )}

        {modeForm.mode === 'offline' && (
          <div className="mb-4">
            <label className="block mb-2 font-bold text-gray-700 text-sm">
              Location <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Library Room 204, Main Campus"
              value={modeForm.location}
              onChange={e => setModeForm(prev => ({ ...prev, location: e.target.value }))}
              className="w-full px-4 py-2 rounded border border-stone-200 text-sm outline-none focus:border-orange-400"
            />
          </div>
        )}

        {modeMsg && <div className="bg-teal-100 text-teal-700 p-3 rounded-xl mb-3 text-sm font-bold border border-green-200">{modeMsg}</div>}
        {modeError && <div className="bg-rose-100 text-rose-700 p-3 rounded-xl mb-3 text-sm border border-red-200">{modeError}</div>}

        <button
          onClick={handleSaveMode}
          disabled={savingMode}
          className={`bg-orange-500 text-white px-8 py-2 rounded-xl font-bold text-sm ${savingMode ? 'cursor-not-allowed opacity-70' : 'hover:bg-orange-600 transition-all'}`}
        >
          {savingMode ? 'Saving...' : '💾 Save Mode'}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mt-8 justify-center">
        <button onClick={() => navigate('/sessions')} className="px-6 py-2 bg-gray-500 text-white font-bold rounded hover:bg-gray-600">Back to Sessions</button>
        <button onClick={() => navigate(`/chat/${id}`)} className="px-6 py-2 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-all">Join Chat</button>
        <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-all">Dashboard</button>
      </div>
    </div>
  );
};

export default SessionDetails;
