import React from 'react';

// Hoist static SVG to avoid re-creation on every render
// See: rendering-hoist-jsx
export const ASSISTANT_AVATAR_SVG = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#4A90E2"/>
    <path d="M7 10C7 7.79086 8.79086 6 11 6H13C15.2091 6 17 7.79086 17 10V12C17 14.2091 15.2091 16 13 16H11C8.79086 16 7 14.2091 7 12V10Z" fill="white"/>
    <ellipse cx="10.5" cy="11" rx="1.5" ry="1.5" fill="#4A90E2"/>
    <ellipse cx="13.5" cy="11" rx="1.5" ry="1.5" fill="#4A90E2"/>
    <path d="M10 14C10 14 11 15 12 15C13 15 14 14 14 14" stroke="#4A90E2" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M8 8L6 6M16 8L18 6M8 17L6 19M16 17L18 19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const USER_AVATAR_SVG = (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="12" fill="#6B7280"/>
    <path d="M12 4C9.23858 4 7 6.23858 7 9V11H17V9C17 6.23858 14.7614 4 12 4Z" fill="white"/>
    <path d="M7 11C7 14.3137 9.23858 17 12 17C14.7614 17 17 14.3137 17 11H7Z" fill="white"/>
    <path d="M8 19C8 19 9.5 20 12 20C14.5 20 16 19 16 19" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);
