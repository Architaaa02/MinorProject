import React, { useState, useEffect } from 'react';
import { issueAPI, toIssueView } from '../services/api';
import { useAuth } from '../context/AuthContext';
import IssueCard from '../components/IssueCard';
import Input from '../components/Input';
import Loading from '../components/Loading';

const Dashboard = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    lat: '',
    lng: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    setLoading(true);
    try {
      const response = await issueAPI.getUserIssues();
      setIssues((response.data.issues || []).map(toIssueView));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load your reported issues.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      alert('Please select an image before submitting.');
      return;
    }
    setSubmitting(true);

    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('address', formData.location);
    data.append('lat', formData.lat);
    data.append('lng', formData.lng);
    data.append('image', imageFile);

    try {
      const response = await issueAPI.create(data);
      setIssues((prev) => [toIssueView(response.data.issue), ...prev]);
      setFormData({ title: '', description: '', location: '', lat: '', lng: '' });
      setImageFile(null);
      setImagePreview(null);
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not submit the report. Check that the backend is running and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const statusCounts = {
    submitted: issues.filter(i => i.status === 'Submitted').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user?.name || 'User'} 👋</h1>
              <p className="text-emerald-100 mt-1 text-sm">Track and manage your reported civic issues</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-white text-emerald-700 font-semibold px-5 py-2.5 rounded-xl hover:bg-emerald-50 transition-colors shadow"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={showForm ? 'M6 18L18 6M6 6l12 12' : 'M12 4v16m8-8H4'} />
              </svg>
              {showForm ? 'Cancel' : 'Report New Issue'}
            </button>
          </div>
          {/* Mini Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{statusCounts.submitted}</p>
              <p className="text-xs text-emerald-100 mt-1">Submitted</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{statusCounts.inProgress}</p>
              <p className="text-xs text-emerald-100 mt-1">In Progress</p>
            </div>
            <div className="bg-white/20 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{statusCounts.resolved}</p>
              <p className="text-xs text-emerald-100 mt-1">Resolved</p>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">

        {error && (
          <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        {showForm && (
          <div className="bg-white rounded-2xl shadow-md border border-emerald-100 p-6 mb-8">
            <h2 className="text-2xl font-semibold mb-4 text-emerald-800">Report an Issue</h2>
            <form onSubmit={handleSubmit}>
              <Input
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Brief description of the issue"
                required
              />
              
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Description <span className="text-danger">*</span>
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Detailed description"
                  required
                  rows="4"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <Input
                label="Location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Address or location"
                required
              />

              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Latitude" type="number" step="any" name="lat" value={formData.lat} onChange={handleChange} placeholder="e.g. 22.3072" required />
                <Input label="Longitude" type="number" step="any" name="lng" value={formData.lng} onChange={handleChange} placeholder="e.g. 73.1812" required />
              </div>

              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">
                  Upload Image <span className="text-danger">*</span>
                </label>
                <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary hover:bg-blue-50 transition-colors">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-contain rounded-lg p-1" />
                  ) : (
                    <div className="text-center">
                      <svg className="mx-auto mb-2 w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-sm text-gray-500">Click to upload or drag & drop</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {imagePreview && (
                  <button
                    type="button"
                    onClick={() => { setImageFile(null); setImagePreview(null); }}
                    className="mt-2 text-sm text-danger hover:underline"
                  >
                    Remove image
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Submit Issue'}
              </button>
            </form>
          </div>
        )}

        <div>
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">My Reported Issues</h2>
          {loading ? (
            <Loading />
          ) : issues.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No issues reported yet</p>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
