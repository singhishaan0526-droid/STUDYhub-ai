import React from 'react';

export default function PrintHeader({ title, subtitle, date }) {
  const formattedDate = date || new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="border-b-2 border-gray-900 pb-6 mb-8 mt-2 page-break-inside-avoid">
      {/* App Logo / Name */}
      <div className="flex justify-between items-end mb-4">
        <div>
          <h1 className="text-2xl font-black tracking-tighter uppercase text-gray-900" style={{ fontFamily: "'Inter', sans-serif" }}>
            StudyHub <span className="text-blue-600">AI</span>
          </h1>
          <p className="text-sm text-gray-500 italic font-serif mt-1">Intelligent Educational Platform</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold text-gray-700">Date Generated</p>
          <p className="text-sm text-gray-500">{formattedDate}</p>
        </div>
      </div>
      
      {/* Document Info */}
      <div className="text-center mt-6">
        <h2 className="text-3xl font-bold uppercase tracking-wide text-gray-900" style={{ fontFamily: "serif" }}>
          {title}
        </h2>
        {subtitle && (
          <h3 className="text-lg font-medium text-gray-600 mt-2">
            {subtitle}
          </h3>
        )}
      </div>
    </div>
  );
}
