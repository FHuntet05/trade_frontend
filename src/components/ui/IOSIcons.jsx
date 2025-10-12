import React from 'react';

// Iconos de navegación
export const HomeIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path 
      d="M4 10l8-6 8 6v10H4V10z" 
      stroke={active ? "#34C759" : "#3C3C43"} 
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

export const MarketIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path 
      d="M3 3v18h18m-9-6l3-3 3 3 3-6" 
      stroke={active ? "#34C759" : "#3C3C43"} 
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

export const StockIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path 
      d="M4 4h16v16H4V4zm4 8l2-2 2 2 4-4" 
      stroke={active ? "#34C759" : "#3C3C43"} 
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

export const WheelIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle 
      cx="12" cy="12" r="9" 
      stroke={active ? "#34C759" : "#3C3C43"} 
      strokeWidth="2"
      fill="none"
    />
    <path 
      d="M12 12l6-6M12 12l-6 6M12 12l6 6M12 12l-6-6" 
      stroke={active ? "#34C759" : "#3C3C43"} 
      strokeWidth="2"
    />
  </svg>
);

export const ProfileIcon = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <circle 
      cx="12" cy="8" r="4" 
      stroke={active ? "#34C759" : "#3C3C43"} 
      strokeWidth="2"
      fill="none"
    />
    <path 
      d="M5 21c0-3.3 3.1-6 7-6s7 2.7 7 6" 
      stroke={active ? "#34C759" : "#3C3C43"} 
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

// Iconos de acción
export const DepositIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path 
      d="M12 4v12m0 0l-4-4m4 4l4-4" 
      stroke="#34C759" 
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const WithdrawIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path 
      d="M12 20V8m0 0l-4 4m4-4l4 4" 
      stroke="#34C759" 
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const GiftIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path 
      d="M4 12h16M12 8v12m8-8v8H4v-8h16zM8 8H4v4h16V8h-4l-2-2-2 2z" 
      stroke="#34C759" 
      strokeWidth="2"
      fill="none"
    />
  </svg>
);

// Iconos de sistema
export const ChevronRight = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path 
      d="M8 4l6 6-6 6" 
      stroke="#3C3C43" 
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path 
      d="M6 6l12 12M6 18L18 6" 
      stroke="#3C3C43" 
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

export const CheckIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path 
      d="M4 12l6 6L20 6" 
      stroke="#34C759" 
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);