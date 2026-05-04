import React, { useState } from 'react';
import API from '../api';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await API.post('/api/auth/register', formData);
      setSuccess('Account created! Moving to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm w-full max-w-md mx-auto mt-10 text-center">
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Create Account</h2>
      <p className="text-stone-600 mb-6 text-sm">Join the Peer Learning community</p>
      
      {error && <div className="bg-rose-100 text-rose-700 p-3 rounded-xl mb-6 text-sm border border-rose-200">{error}</div>}
      {success && <div className="bg-emerald-100 text-emerald-800 p-3 rounded-xl mb-6 text-sm border border-emerald-200">{success}</div>}
      
      <form onSubmit={handleSubmit} className="text-left">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2 text-stone-800">Full Name</label>
          <input 
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-stone-50 focus:bg-white"
            type="text" 
            placeholder="e.g. Nandhini P" 
            required 
            onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2 text-stone-800">Email Address</label>
          <input 
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-stone-50 focus:bg-white"
            type="email" 
            placeholder="nandhini@example.com" 
            required 
            onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-stone-800">Password</label>
          <input 
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-stone-50 focus:bg-white"
            type="password" 
            placeholder="At least 6 characters" 
            required 
            onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
          />
        </div>
        
        <button 
          className={`w-full py-3 px-4 font-bold rounded-xl shadow-sm transition-all ${loading ? 'bg-violet-100 text-violet-400 cursor-not-allowed' : 'bg-violet-200 text-violet-900 hover:bg-violet-300'}`} 
          type="submit" 
          disabled={loading}
        >
          {loading ? 'Creating Your Profile...' : 'Register Now'}
        </button>
      </form>
      
      <p className="mt-6 text-sm text-stone-600">
        Already have an account? <Link className="text-violet-600 font-semibold hover:text-violet-700 transition" to="/login">Login here</Link>
      </p>
    </div>
  );
};

export default Register;
