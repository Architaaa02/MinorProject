import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { issueAPI } from '../services/api';
import { mockIssues, mockStats, CATEGORIES, STATUSES } from '../utils/mockData';
import StatusBadge from '../components/StatusBadge';
import Loading from '../components/Loading';
import IssueDetailModal from '../components/IssueDetailModal';

const StatCard = ({ label, value, color }) => (
  <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
    <p className="text-sm text-gray-500 font-medium">{label}</p>
    <p className={`text-3xl font-bold mt-2 ${color}`}>{value}</p>
  </div>
);

const Sidebar = ({ active, setActive, onLogout, sidebarOpen, setSidebarOpen }) => (
  <>
    {/* Mobile overlay */}
    {sidebarOpen && (
      <div className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
    )}
    <aside className={`fixed top-0 left-0 h-full w-64 bg-blue-900 text-white z-30 flex flex-col transition-transform duration-300
      ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:z-auto`}>
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-xl font-bold">CivicEye</h1>
        <p className="text-blue-300 text-xs mt-1">Admin Panel</p>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {['Dashboard', 'Issues'].map((item) => (
          <button
            key={item}
            onClick={() => { setActive(item); setSidebarOpen(false); }}
            className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors
              ${active === item ? 'bg-blue-700 text-white' : 'text-blue-200 hover:bg-blue-800'}`}
          >
            {item === 'Dashboard' ? (
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </span>
            ) : (
              <span className="flex items-center gap-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Issues
              </span>
            )}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-blue-800">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-blue-200 hover:bg-blue-800 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          Logout
        </button>
      </div>
    </aside>
  </>
);

const AdminDashboard = () => {
  const [issues, setIssues] = useState([]);
  const [stats, setStats] = useState(mockStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [active, setActive] = useState('Dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCategory, setFilterCategory] = useState('All');
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [issuesRes, statsRes] = await Promise.all([issueAPI.getAll(), issueAPI.getStats()]);
      setIssues(issuesRes.data);
      setStats(statsRes.data);
    } catch {
      setIssues(mockIssues);
      setStats(mockStats);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  const handleStatusChange = async (id, status) => {
    try { await issueAPI.updateStatus(id, status); } catch { /* mock fallback */ }
    setIssues(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    setSelectedIssue(prev => prev?.id === id ? { ...prev, status } : prev);
  };

  const handleDepartmentChange = (id, department) => {
    setIssues(prev => prev.map(i => i.id === id ? { ...i, department } : i));
    setSelectedIssue(prev => prev?.id === id ? { ...prev, department } : prev);
  };

  const filtered = useMemo(() => {
    return issues.filter(issue => {
      const matchSearch = search === '' ||
        issue.title.toLowerCase().includes(search.toLowerCase()) ||
        issue.location.toLowerCase().includes(search.toLowerCase()) ||
        issue.userName.toLowerCase().includes(search.toLowerCase());
      const matchStatus = filterStatus === 'All' || issue.status === filterStatus;
      const matchCategory = filterCategory === 'All' || issue.category === filterCategory;
      return matchSearch && matchStatus && matchCategory;
    });
  }, [issues, search, filterStatus, filterCategory]);

  const liveStats = useMemo(() => ({
    total: issues.length,
    pending: issues.filter(i => i.status === 'Submitted').length,
    inProgress: issues.filter(i => i.status === 'In Progress').length,
    resolved: issues.filter(i => i.status === 'Resolved').length,
  }), [issues]);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar
        active={active}
        setActive={setActive}
        onLogout={handleLogout}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden text-gray-500 hover:text-gray-700"
              onClick={() => setSidebarOpen(true)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-xl font-semibold text-gray-800">{active}</h2>
          </div>
          <div className="relative">
            <button
              onClick={() => setProfileOpen(prev => !prev)}
              className="flex items-center gap-2 hover:bg-gray-100 px-3 py-2 rounded-lg transition-colors"
            >
              <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <span className="text-sm text-gray-700 hidden sm:block font-medium">{user?.name || 'Admin'}</span>
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {profileOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-100 z-20 overflow-hidden">
                  {/* Profile Header */}
                  <div className="bg-blue-900 px-4 py-4 flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                      {user?.name?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="text-white font-semibold text-sm">{user?.name || 'Admin'}</p>
                      <p className="text-blue-300 text-xs">{user?.email || 'admin@civiceye.com'}</p>
                      <span className="inline-block mt-1 text-xs bg-blue-700 text-blue-100 px-2 py-0.5 rounded-full">Administrator</span>
                    </div>
                  </div>
                  {/* Menu Items */}
                  <div className="py-2">
                    <button
                      onClick={() => { setActive('Dashboard'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                      Dashboard
                    </button>
                    <button
                      onClick={() => { setActive('Issues'); setProfileOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Manage Issues
                    </button>
                    <div className="border-t border-gray-100 my-1" />
                    <button
                      onClick={() => { logout(); navigate('/login'); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">
              {error}
            </div>
          )}

          {active === 'Dashboard' && (
            <div>
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Issues" value={liveStats.total} color="text-blue-600" />
                <StatCard label="Pending" value={liveStats.pending} color="text-blue-500" />
                <StatCard label="In Progress" value={liveStats.inProgress} color="text-yellow-500" />
                <StatCard label="Resolved" value={liveStats.resolved} color="text-green-500" />
              </div>

              {/* Recent Issues Preview */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-gray-800">Recent Issues</h3>
                  <button onClick={() => setActive('Issues')} className="text-sm text-primary hover:underline">
                    View all
                  </button>
                </div>
                <div className="space-y-3">
                  {issues.slice(0, 4).map(issue => (
                    <div key={issue.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <div className="flex items-center gap-3">
                        <img src={issue.imageUrl} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div>
                          <p className="text-sm font-medium text-gray-800">{issue.title}</p>
                          <p className="text-xs text-gray-400">{issue.location}</p>
                        </div>
                      </div>
                      <StatusBadge status={issue.status} />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {active === 'Issues' && (
            <div>
              {/* Search & Filters */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                      type="text"
                      placeholder="Search issues..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="All">All Statuses</option>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="All">All Categories</option>
                    {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-800">All Issues</h3>
                  <span className="text-sm text-gray-400">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
                </div>

                {loading ? (
                  <Loading />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="px-6 py-3 text-left">Image</th>
                          <th className="px-6 py-3 text-left">Title</th>
                          <th className="px-6 py-3 text-left hidden md:table-cell">Location</th>
                          <th className="px-6 py-3 text-left hidden lg:table-cell">Category</th>
                          <th className="px-6 py-3 text-left hidden lg:table-cell">Date</th>
                          <th className="px-6 py-3 text-left">Status</th>
                          <th className="px-6 py-3 text-left">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filtered.map(issue => (
                          <tr key={issue.id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <img src={issue.imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover" />
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm font-medium text-gray-800">{issue.title}</p>
                              <p className="text-xs text-gray-400">{issue.userName}</p>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 hidden md:table-cell">{issue.location}</td>
                            <td className="px-6 py-4 text-sm text-gray-600 hidden lg:table-cell">{issue.category}</td>
                            <td className="px-6 py-4 text-sm text-gray-400 hidden lg:table-cell">
                              {new Date(issue.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4">
                              <StatusBadge status={issue.status} />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <select
                                  value={issue.status}
                                  onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                                  className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary"
                                >
                                  {STATUSES.map(s => <option key={s}>{s}</option>)}
                                </select>
                                <button
                                  onClick={() => setSelectedIssue(issue)}
                                  className="text-xs px-3 py-1 bg-blue-50 text-primary rounded hover:bg-blue-100 transition-colors font-medium"
                                >
                                  View
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {filtered.length === 0 && (
                      <div className="text-center py-12 text-gray-400">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-sm">No issues match your filters</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Issue Detail Modal */}
      {selectedIssue && (
        <IssueDetailModal
          issue={selectedIssue}
          onClose={() => setSelectedIssue(null)}
          onStatusChange={handleStatusChange}
          onDepartmentChange={handleDepartmentChange}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
