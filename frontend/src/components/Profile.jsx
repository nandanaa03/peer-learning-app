import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SUBJECT_OPTIONS = [
  "React", "Node.js", "Python", "MongoDB", "AWS", "UI Design",
  "Java", "C++", "JavaScript", "TypeScript", "SQL", "Docker", "Machine Learning"
];

const AVAILABILITY_OPTIONS = [
  "Weekends", "Evenings", "Weekdays", "Flexible", "1-2 hrs/day", "2+ hrs/day"
];

const Profile = () => {
  const [formData, setFormData] = useState({
    name: '',
    subjectsKnown: '',
    subjectsToLearn: '',
    availability: ''
  });
  const [expertTags, setExpertTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [updatingExpert, setUpdatingExpert] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
    fetchExpertTags();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await axios.get('/api/profile/me', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      if (res.data) {
        setFormData({
          name: res.data.name || '',
          subjectsKnown: res.data.subjectsKnown.join(', '),
          subjectsToLearn: res.data.subjectsToLearn.join(', '),
          availability: res.data.availability || ''
        });
        setHasProfile(true);
      }
    } catch (err) {
      setHasProfile(false);
      setIsEditMode(true); // auto-edit if no profile
    } finally {
      setLoading(false);
    }
  };

  const fetchExpertTags = async () => {
    try {
      const res = await axios.get('/api/expert/me', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setExpertTags(res.data);
    } catch (err) {
      console.error('Error fetching expert tags');
    }
  };

  const handleUpdateExpert = async () => {
    setUpdatingExpert(true);
    setSuccess('');
    setError('');
    try {
      const res = await axios.get('/api/expert/update', {
        headers: { 'x-auth-token': localStorage.getItem('token') }
      });
      setExpertTags(res.data);
      setSuccess('Expert status updated!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to update expert status');
    } finally {
      setUpdatingExpert(false);
    }
  };

  const validate = () => {
    if (!formData.name.trim()) return 'Display name is required.';
    if (!formData.subjectsKnown.trim()) return 'Please enter at least one subject you can teach.';
    if (!formData.subjectsToLearn.trim()) return 'Please enter at least one subject you want to learn.';
    if (!formData.availability.trim()) return 'Availability is required.';
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'x-auth-token': token };

      let res;
      if (hasProfile) {
        // Use PUT for updating existing profile
        res = await axios.put('/api/profile', formData, { headers });
        setSuccess('✅ Profile Updated Successfully!');
      } else {
        // Use POST for creating new profile
        res = await axios.post('/api/profile', formData, { headers });
        setSuccess('✅ Profile Created Successfully!');
        setHasProfile(true);
      }

      // Update form with returned data to reflect saved values
      if (res.data.profile || res.data) {
        const saved = res.data.profile || res.data;
        setFormData({
          name: saved.name,
          subjectsKnown: saved.subjectsKnown.join(', '),
          subjectsToLearn: saved.subjectsToLearn.join(', '),
          availability: saved.availability
        });
      }

      setIsEditMode(false);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditMode(false);
    setError('');
    fetchProfile(); // restore original data
  };

  if (loading) return (
    <div className="bg-amber-50 p-8 rounded-2xl border border-stone-200 w-full max-w-sm text-center mx-auto mt-10">
      <h2 className="text-xl font-semibold text-stone-800">Loading Profile...</h2>
    </div>
  );

  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 w-full max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold text-stone-800 mb-2">Skill Profile</h2>
      <p className="text-stone-600 mb-6 text-sm">Manage your mentoring skills and learning goals</p>

      {error && <div className="bg-rose-100 text-rose-700 p-3 rounded-xl mb-6 text-sm">{error}</div>}
      {success && (
        <div className="bg-teal-100 text-teal-700 p-3 rounded-xl mb-6 text-sm font-bold">
          {success}
        </div>
      )}

      {/* Expert Badges Card */}
      <div className="bg-white p-6 rounded-2xl border border-stone-200 border-t-4 border-t-orange-400 mb-6 text-left">
        <div className="flex justify-between items-center">
          <h4 className="m-0 font-bold text-stone-800">Expert Badges ⭐</h4>
          <button
            type="button"
            onClick={handleUpdateExpert}
            disabled={updatingExpert}
            className="px-3 py-1 text-xs font-semibold bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition-all"
          >
            {updatingExpert ? 'Checking...' : 'Update Status'}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {expertTags.length === 0 ? (
            <p className="text-sm text-stone-500 m-0">
              No expert tags yet. Conduct sessions and answer forum doubts to earn badges!
            </p>
          ) : (
            expertTags.map(tag => (
              <span key={tag} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-bold border border-yellow-400">
                ⭐ {tag}
              </span>
            ))
          )}
        </div>
      </div>

      {/* Profile View Mode */}
      {hasProfile && !isEditMode ? (
        <div className="bg-white p-6 rounded-2xl border border-stone-200 border-l-4 border-l-amber-400 mb-6 text-left">
          <div className="flex justify-between items-center mb-5">
            <h4 className="m-0 text-stone-800 font-bold">My Skill Profile</h4>
            <button
              onClick={() => setIsEditMode(true)}
              className="px-4 py-2 text-sm font-semibold bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-all"
            >
              ✏️ Edit Profile
            </button>
          </div>

          <div className="grid grid-cols-[160px_1fr] gap-3 text-sm">
            <strong className="text-stone-500">Display Name:</strong>
            <span className="font-semibold text-stone-800">{formData.name}</span>

            <strong className="text-stone-500">Can Teach:</strong>
            <div className="flex flex-wrap gap-2">
              {formData.subjectsKnown.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                <span key={s} className="bg-teal-100 text-teal-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {s}
                </span>
              ))}
            </div>

            <strong className="text-stone-500">Wants to Learn:</strong>
            <div className="flex flex-wrap gap-2">
              {formData.subjectsToLearn.split(',').map(s => s.trim()).filter(Boolean).map(s => (
                <span key={s} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-semibold">
                  {s}
                </span>
              ))}
            </div>

            <strong className="text-stone-500">Availability:</strong>
            <span className="{text-stone-700}">{formData.availability}</span>
          </div>
        </div>
      ) : null}

      {/* Profile Edit Form */}
      {(isEditMode || !hasProfile) && (
        <form onSubmit={handleSubmit}>
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6 text-left">
            <h4 className="m-0 mb-5 text-orange-800 font-bold">
              {hasProfile ? '✏️ Edit Skill Profile' : '🚀 Create Your Profile'}
            </h4>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-800">Display Name <span className="text-rose-600">*</span></label>
              <input
                className="w-full px-4 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                type="text"
                placeholder="Your full name"
                value={formData.name}
                required
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-800">Subjects You Can Teach <span className="text-rose-600">*</span></label>
              <select
                multiple
                className="w-full px-4 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 h-28 bg-white"
                value={formData.subjectsKnown.split(', ').filter(Boolean)}
                required
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData({ ...formData, subjectsKnown: selected.join(', ') });
                }}
              >
                {SUBJECT_OPTIONS.map(sub => (
                  <option key={sub} value={sub} className="py-1 px-2 checked:bg-orange-100 checked:text-orange-900 rounded">{sub}</option>
                ))}
              </select>
              <small className="text-stone-400 text-xs mt-1 block">Hold Ctrl/Cmd to select multiple</small>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-800">Subjects You Want to Learn <span className="text-rose-600">*</span></label>
              <select
                multiple
                className="w-full px-4 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 h-28 bg-white"
                value={formData.subjectsToLearn.split(', ').filter(Boolean)}
                required
                onChange={(e) => {
                  const selected = Array.from(e.target.selectedOptions, option => option.value);
                  setFormData({ ...formData, subjectsToLearn: selected.join(', ') });
                }}
              >
                {SUBJECT_OPTIONS.map(sub => (
                  <option key={sub} value={sub} className="py-1 px-2 checked:bg-orange-100 checked:text-orange-900 rounded">{sub}</option>
                ))}
              </select>
              <small className="text-stone-400 text-xs mt-1 block">Hold Ctrl/Cmd to select multiple</small>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold mb-2 text-gray-800">Availability <span className="text-rose-600">*</span></label>
              <select
                className="w-full px-4 py-2 border border-stone-200 rounded-xl text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 bg-white cursor-pointer"
                value={formData.availability}
                required
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
              >
                <option value="" disabled>Select your availability</option>
                {AVAILABILITY_OPTIONS.map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 py-2 px-4 font-bold rounded text-white ${saving ? 'bg-orange-300 cursor-not-allowed' : 'bg-orange-500 hover:bg-orange-600'}`}
            >
              {saving ? 'Saving...' : hasProfile ? '💾 Save Changes' : '🚀 Create Profile'}
            </button>
            {hasProfile && (
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 py-2 px-4 font-bold rounded text-white bg-stone-500 hover:bg-stone-600"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      )}

      <button
        onClick={() => navigate('/dashboard')}
        className="w-full mt-6 py-2 px-4 font-bold rounded text-white bg-stone-500 hover:bg-stone-600"
      >
        ← Back to Dashboard
      </button>
    </div>
  );
};

export default Profile;
