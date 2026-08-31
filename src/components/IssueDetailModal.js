import React from 'react';
import StatusBadge from './StatusBadge';
import { STATUSES } from '../utils/mockData';

const IssueDetailModal = ({ issue, onClose, onStatusChange }) => {
  if (!issue) return null;

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
              <p className="text-gray-700 mt-1">{issue.category}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Reporter</span>
              <p className="text-gray-700 mt-1">{issue.userName}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Location</span>
              <p className="text-gray-700 mt-1">{issue.location}</p>
            </div>
            <div>
              <span className="text-gray-400 font-medium">Department</span>
              <p className="text-gray-700 mt-1">{issue.department || 'Unassigned'}</p>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-2 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Update Status</label>
              <select
                value={issue.status}
                onChange={(e) => onStatusChange(issue.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {STATUSES.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueDetailModal;
