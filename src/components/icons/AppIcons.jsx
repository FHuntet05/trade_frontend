// RUTA: src/components/icons/AppIcons.jsx
import React from 'react';

// Navegación y UI básica
export const BackIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const ForwardIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 6L15 12L9 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CloseIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Acciones financieras
export const WalletIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M2 7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 15.5C16.8284 15.5 17.5 14.8284 17.5 14C17.5 13.1716 16.8284 12.5 16 12.5C15.1716 12.5 14.5 13.1716 14.5 14C14.5 14.8284 15.1716 15.5 16 15.5Z" fill="currentColor"/>
  </svg>
);

export const DepositIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 4V20M12 20L18 14M12 20L6 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const WithdrawIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 20V4M12 4L18 10M12 4L6 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const CopyIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 4V16C8 17.1046 8.89543 18 10 18H18C19.1046 18 20 17.1046 20 16V7.41421C20 6.88378 19.7893 6.37507 19.4142 6L16 2.58579C15.6249 2.21071 15.1162 2 14.5858 2H10C8.89543 2 8 2.89543 8 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M16 2V6C16 7.10457 16.8954 8 18 8H20M4 8V20C4 21.1046 4.89543 22 6 22H14C15.1046 22 16 21.1046 16 20V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Estado y notificaciones
export const CheckmarkIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const AlertIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const BannedIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.364 18.364C21.8787 14.8492 21.8787 9.15076 18.364 5.63604C14.8492 2.12132 9.15076 2.12132 5.63604 5.63604M18.364 18.364C14.8492 21.8787 9.15076 21.8787 5.63604 18.364C2.12132 14.8492 2.12132 9.15076 5.63604 5.63604M18.364 18.364L5.63604 5.63604" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Social y compartir
export const TelegramIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20.665 3.717L2.935 10.557C1.725 11.037 1.732 11.697 2.713 12.007L7.265 13.443L17.797 6.8C18.295 6.487 18.75 6.652 18.376 6.992L9.843 14.684L9.561 19.377C10.025 19.377 10.228 19.164 10.486 18.917L12.695 16.778L17.306 20.164C18.133 20.618 18.724 20.384 18.928 19.377L21.947 5.151C22.256 3.912 21.474 3.351 20.665 3.717Z" fill="currentColor"/>
  </svg>
);

export const TwitterIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.288 21C16.832 21 21.45 13.932 21.45 7.849C21.45 7.655 21.45 7.462 21.436 7.27C22.194 6.72 22.851 6.042 23.375 5.27C22.679 5.592 21.933 5.809 21.157 5.911C21.95 5.416 22.548 4.618 22.833 3.687C22.087 4.142 21.266 4.471 20.401 4.643C19.711 3.851 18.702 3.359 17.588 3.359C15.441 3.359 13.703 5.097 13.703 7.244C13.703 7.565 13.739 7.875 13.811 8.173C10.606 8.003 7.76 6.461 5.823 4.106C5.473 4.709 5.272 5.416 5.272 6.166C5.272 7.584 5.992 8.843 7.081 9.574C6.457 9.553 5.869 9.377 5.354 9.082V9.132C5.354 11.034 6.685 12.63 8.467 13.012C8.125 13.107 7.766 13.154 7.395 13.154C7.134 13.154 6.881 13.129 6.635 13.08C7.148 14.65 8.596 15.787 10.307 15.819C8.962 16.873 7.277 17.496 5.456 17.496C5.126 17.496 4.801 17.476 4.481 17.437C6.211 18.557 8.259 19.203 10.466 19.203" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Configuración y herramientas
export const SettingsIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M19.4 15C19.1277 15.6171 19.2583 16.3378 19.73 16.82L19.79 16.88C20.1656 17.2551 20.3766 17.7642 20.3766 18.295C20.3766 18.8258 20.1656 19.3349 19.79 19.71C19.4149 20.0856 18.9058 20.2966 18.375 20.2966C17.8442 20.2966 17.3351 20.0856 16.96 19.71L16.9 19.65C16.4178 19.1783 15.6971 19.0477 15.08 19.32C14.4755 19.5791 14.0826 20.1724 14.08 20.83V21C14.08 22.1046 13.1846 23 12.08 23C10.9754 23 10.08 22.1046 10.08 21V20.91C10.0642 20.2256 9.63587 19.6073 9 19.35C8.38291 19.0777 7.66219 19.2083 7.18 19.68L7.12 19.74C6.74485 20.1156 6.23577 20.3266 5.705 20.3266C5.17423 20.3266 4.66515 20.1156 4.29 19.74C3.91435 19.3649 3.70335 18.8558 3.70335 18.325C3.70335 17.7942 3.91435 17.2851 4.29 16.91L4.35 16.85C4.82167 16.3678 4.95231 15.6471 4.68 15.03C4.42093 14.4255 3.82764 14.0326 3.17 14.03H3C1.89543 14.03 1 13.1346 1 12.03C1 10.9254 1.89543 10.03 3 10.03H3.09C3.77444 10.0142 4.39275 9.58587 4.65 8.95C4.92231 8.33291 4.79167 7.61219 4.32 7.13L4.26 7.07C3.88435 6.69485 3.67335 6.18577 3.67335 5.655C3.67335 5.12423 3.88435 4.61515 4.26 4.24C4.63515 3.86435 5.14423 3.65335 5.675 3.65335C6.20577 3.65335 6.71485 3.86435 7.09 4.24L7.15 4.3C7.63219 4.77167 8.35291 4.90231 8.97 4.63H9C9.60447 4.37093 9.99738 3.77764 10 3.12V3C10 1.89543 10.8954 1 12 1C13.1046 1 14 1.89543 14 3V3.09C14.0026 3.74764 14.3955 4.34093 15 4.6C15.6171 4.87231 16.3378 4.74167 16.82 4.27L16.88 4.21C17.2551 3.83435 17.7642 3.62335 18.295 3.62335C18.8258 3.62335 19.3349 3.83435 19.71 4.21C20.0856 4.58515 20.2966 5.09423 20.2966 5.625C20.2966 6.15577 20.0856 6.66485 19.71 7.04L19.65 7.1C19.1783 7.58219 19.0477 8.30291 19.32 8.92V9C19.5791 9.60447 20.1724 9.99738 20.83 10H21C22.1046 10 23 10.8954 23 12C23 13.1046 22.1046 14 21 14H20.91C20.2524 14.0026 19.6591 14.3955 19.4 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const LoaderIcon = ({ className }) => (
  <svg className={`${className} animate-spin`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 3V6M12 18V21M6 12H3M21 12H18M18.364 5.636L16.243 7.757M7.757 16.243L5.636 18.364M18.364 18.364L16.243 16.243M7.757 7.757L5.636 5.636" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// Acciones administrativas
export const AdminIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const QuestionIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.22766 9C8.77678 7.83481 10.2584 7 12.0001 7C14.2092 7 16.0001 8.34315 16.0001 10C16.0001 11.3994 14.7224 12.5751 12.9943 12.9066C12.4519 13.0106 12.0001 13.4477 12.0001 14M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);