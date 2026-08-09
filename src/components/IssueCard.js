import React from 'react';
import StatusBadge from './StatusBadge';

const IssueCard = ({ issue, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
    >
      <img 
        src={issue.imageUrl} 
        alt={issue.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-800">{issue.title}</h3>
          <StatusBadge status={issue.status} />
        </div>
        <p className="text-gray-600 text-sm mb-2 line-clamp-2">{issue.description}</p>
        <div className="flex items-center text-sm text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{issue.location}</span>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {new Date(issue.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};

export default IssueCard;
