import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post('/api/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('name', res.data.name);
      window.location.href = "/dashboard";
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-2xl border border-stone-200 shadow-sm w-full max-w-md mx-auto mt-10 text-center">
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Welcome Back</h2>
      <p className="text-stone-600 mb-6 text-sm">Sign in to your account</p>
      {error && <div className="bg-rose-100 text-rose-700 p-3 rounded-xl mb-6 text-sm border border-rose-200">{error}</div>}
      <form onSubmit={handleSubmit} className="text-left">
        <div className="mb-4">
          <label className="block text-sm font-semibold mb-2 text-stone-800">Email Address</label>
          <input
            type="email"
            required
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-stone-50 focus:bg-white"
            placeholder="Enter your email"
            value={formData.email}
            onChange={e => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2 text-stone-800">Password</label>
          <input
            type="password"
            required
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-all bg-stone-50 focus:bg-white"
            placeholder="Enter your password"
            value={formData.password}
            onChange={e => setFormData({ ...formData, password: e.target.value })}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 font-bold rounded-xl shadow-sm transition-all ${loading ? 'bg-violet-100 text-violet-400 cursor-not-allowed' : 'bg-violet-200 text-violet-900 hover:bg-violet-300'}`}
        >
          {loading ? 'Logging in...' : 'Sign In'}
        </button>
      </form>
      <p className="mt-6 text-sm text-stone-600">
        Don't have an account? <Link to="/register" className="text-violet-600 font-semibold hover:text-violet-700 transition">Sign up</Link>
      </p>
    </div>
  );
};

export default Login;
