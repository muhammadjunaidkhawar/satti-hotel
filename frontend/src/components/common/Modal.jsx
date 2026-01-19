import React from 'react';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-[#2a2a2a] rounded-xl shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[#2a2a2a] border-b border-gray-700 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl transition-colors"
          >
            <i className="fa-solid fa-times"></i>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
