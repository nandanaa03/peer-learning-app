import React, { useState, useEffect } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Forum = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', subject: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const res = await API.get('/api/forum');
      setPosts(res.data);
    } catch (err) {
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    try {
      await aAPI.post('/api/forum', formData);
      setFormData({ title: '', description: '', subject: '' });
      setShowForm(false);
      fetchPosts();
    } catch (err) {
      console.error('Error posting doubt:', err);
    }
  };

  if (loading) return <div className="bg-amber-50 p-6 rounded-2xl border border-stone-200 w-full max-w-4xl mx-auto text-center mt-10"><p className="text-stone-600">Loading forum...</p></div>;

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 w-full max-w-4xl mx-auto text-center">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-stone-800 m-0">Academic Forum</h2>
        <div className="flex gap-2">
          <button onClick={() => setShowForm(!showForm)} className={`px-4 py-2 text-white font-bold rounded ${showForm ? 'bg-stone-500 hover:bg-stone-600' : 'bg-orange-500 hover:bg-orange-600'}`}>
            {showForm ? 'Cancel' : 'Post a Doubt'}
          </button>
          <button onClick={() => navigate('/dashboard')} className="px-4 py-2 bg-gray-500 text-white font-bold rounded hover:bg-gray-600">Back</button>
        </div>
      </div>

      {showForm && (
        <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200 mb-6 text-left">
          <h3 className="m-0 mb-4 text-orange-800 font-bold text-lg">Post a New Doubt</h3>
          <form onSubmit={handlePostSubmit} className="mt-4">
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-stone-800">Title</label>
              <input 
                type="text" 
                placeholder="Briefly describe your doubt" 
                required 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-4 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-stone-800">Subject</label>
              <input 
                type="text" 
                placeholder="e.g. Mathematics, React, Physics" 
                required 
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                className="w-full px-4 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-stone-800">Description</label>
              <textarea 
                rows="4" 
                placeholder="Give more details about what you're struggling with..." 
                required 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-4 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white resize-y"
              ></textarea>
            </div>
            <button type="submit" className="w-full py-2 bg-blue-500 text-white font-bold rounded hover:bg-blue-600 mt-4">Post Doubt</button>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {posts.length === 0 ? (
          <p className="text-center text-stone-500 py-6">No doubts posted yet. Be the first to ask!</p>
        ) : (
          posts.map(post => (
            <div key={post._id} className="bg-white p-5 rounded-2xl border border-stone-200 text-left cursor-pointer hover:border-orange-400 transition-all" onClick={() => navigate(`/forum/${post._id}`)}>
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-xs uppercase font-bold text-orange-700 bg-orange-100 px-2 py-1 rounded-full inline-block mb-2">
                    {post.subject}
                  </span>
                  <h3 className="m-0 mb-2 text-lg font-bold text-stone-800">{post.title}</h3>
                  <p className="m-0 text-sm text-stone-500 flex items-center gap-2">
                    Posted by <span className="{font-bold text-stone-800">{post.user.name}</span> 
                    {post.user.expertTags && post.user.expertTags.length > 0 && (
                      <span title={post.user.expertTags.join(', ')} className="cursor-help">⭐</span>
                    )}
                    • {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="bg-orange-50 border border-orange-200 px-3 py-1 rounded-xl text-center">
                  <div className="font-bold text-orange-500">?</div>
                  <div className="text-xs text-stone-500 mt-1">View</div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Forum;
