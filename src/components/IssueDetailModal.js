import React, { useState } from 'react';
import StatusBadge from './StatusBadge';

const ALLOWED_TRANSITIONS = {
  'Submitted': ['In Progress', 'Rejected'],
  'In Progress': ['Resolved', 'Rejected'],
  'Resolved': [],
  'Rejected': [],
};

const IssueDetailModal = ({ issue, onClose, onStatusChange, readOnly }) => {
  const [note, setNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [localError, setLocalError] = useState('');

  if (!issue) return null;

  const nextStatuses = ALLOWED_TRANSITIONS[issue.status] || [];

  const handleStatusChange = async (newStatus) => {
    setUpdating(true);
    setLocalError('');
    try {
      await onStatusChange(issue.id, newStatus, note);
      setNote('');
    } catch (err) {
      setLocalError(err?.response?.data?.message || 'Could not update status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Issue Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Image */}
        <img
          src={issue.imageUrl}
          alt={issue.title}
          className="w-full h-56 object-cover"
          onError={(e) => { e.target.style.display = 'none'; }}
        />

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold text-gray-800">{issue.title}</h3>
            <StatusBadge status={issue.status} />
          </div>

          <p className="text-gray-600 text-sm">{issue.description}</p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400 font-medium">Category</span>
              <p className="text-gray-700 mt-1">{issue.category || '—'}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Severity</span>
              <p className="text-gray-700 mt-1">{issue.severity || '—'}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Reporter</span>
              <p className="text-gray-700 mt-1">{issue.userName}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Department</span>
              <p className="text-gray-700 mt-1">{issue.department || 'Unassigned'}</p>
            </div>
            <div className="col-span-2">
              <span className="text-gray-400 font-medium">Location</span>
              <p className="text-gray-700 mt-1">{issue.location}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Submitted</span>
              <p className="text-gray-700 mt-1">{new Date(issue.createdAt).toLocaleString()}</p>
            </div>
          </div>

          {/* Status History */}
          {issue.statusHistory && issue.statusHistory.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm font-medium text-gray-700 mb-2">Status History</p>
              <div className="space-y-2">
                {issue.statusHistory.map((entry, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs text-gray-600">
                    <StatusBadge status={entry.status} />
                    <div>
                      {entry.note && <p className="text-gray-500 italic">"{entry.note}"</p>}
                      <p className="text-gray-400">{entry.changedAt ? new Date(entry.changedAt).toLocaleString() : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Status Update — only shown to admins (readOnly=false) and when transitions exist */}
          {!readOnly && nextStatuses.length > 0 && (
            <div className="pt-2 border-t space-y-3">
              <p className="text-sm font-medium text-gray-700">Update Status</p>
              {localError && (
                <p className="text-xs text-red-600">{localError}</p>
              )}
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Optional note for this status change..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              />
              <div className="flex gap-2 flex-wrap">
                {nextStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleStatusChange(s)}
                    disabled={updating}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50
                      ${s === 'Rejected' ? 'bg-red-100 text-red-700 hover:bg-red-200' :
                        s === 'Resolved' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                        'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                  >
                    {updating ? 'Saving...' : `Mark as ${s}`}
                  </button>
                ))}
              </div>
            </div>
          )}

          {!readOnly && nextStatuses.length === 0 && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-400 italic">This issue is in a terminal state and cannot be updated further.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
