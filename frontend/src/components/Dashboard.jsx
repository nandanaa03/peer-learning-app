import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api';

const Dashboard = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('name');
  const [progress, setProgress] = useState(null);
  const [expertTags, setExpertTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [progressRes, expertRes] = await Promise.all([
          API.get('/api/history/progress'),
          API.get('/api/expert/me')
        ]);
        setProgress(progressRes.data);
        setExpertTags(expertRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    navigate('/login');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white p-6 rounded border border-gray-200 text-center">
      <h1 className="text-2xl font-bold text-stone-800 mb-2">Hello, {name}! 👋</h1>
      <p className="text-stone-600 mb-8 text-sm">Welcome to your Peer Learning Dashboard</p>
      
      {!loading && progress && (
        <>
        {expertTags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 justify-center">
            {expertTags.map(tag => (
              <span key={tag} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-400">
                ⭐ {tag}
              </span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 border-t-4 border-t-orange-400 text-center">
            <h2 className="text-3xl font-bold text-stone-800 my-2">{progress.totalSessions}</h2>
            <p className="text-stone-500 text-sm font-semibold">Total Sessions</p>
          </div>
          <div className="bg-white p-6 rounded border border-gray-200 border-t-4 border-t-teal-500 text-center">
            <h2 className="text-3xl font-bold text-stone-800 my-2">{progress.sessionsAsMentor}</h2>
            <p className="text-stone-500 text-sm font-semibold">Sessions Conducted</p>
          </div>
          <div className="bg-white p-6 rounded border border-gray-200 border-t-4 border-t-amber-400 text-left sm:col-span-2 md:col-span-1">
            <h4 className="text-stone-800 font-bold mb-2">Subjects Learned</h4>
            <div className="flex flex-wrap gap-2">
              {progress.subjectsLearned.length === 0 ? (
                <span className="text-sm text-stone-400">No subjects yet</span>
              ) : (
                progress.subjectsLearned.map(subject => (
                  <span key={subject} className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold">
                    {subject}
                  </span>
                ))
              )}
            </div>
          </div>
        </div>
        </>
      )}

      <div className="bg-white p-6 rounded-2xl border border-stone-200 border-l-4 border-l-orange-400 mt-8 text-left">
        <h3 className="text-lg font-bold text-stone-800">Quick Navigation 🚀</h3>
        <p className="mt-2 text-stone-600 text-sm">
          Track your progress and access all your learning features from here.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mt-6 justify-center">
        <button className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all" onClick={() => navigate('/profile')}>Edit Profile</button>
        <button className="px-4 py-2 bg-teal-500 text-white font-semibold rounded-xl hover:bg-teal-600 transition-all" onClick={() => navigate('/sessions')}>Find Sessions</button>
        <button className="px-4 py-2 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-all" onClick={() => navigate('/history')}>Learning History</button>
        <button className="px-4 py-2 bg-amber-500 text-white font-semibold rounded-xl hover:bg-amber-600 transition-all" onClick={() => navigate('/forum')}>Academic Forum</button>
        <button className="px-4 py-2 bg-stone-500 text-white font-semibold rounded-xl hover:bg-stone-600 transition-all" onClick={handleLogout}>Logout</button>
      </div>
    </div>
  );
};

export default Dashboard;
