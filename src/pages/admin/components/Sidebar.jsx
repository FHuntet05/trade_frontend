// RUTA: frontend/src/pages/admin/components/Sidebar.jsx
// --- VERSIÓN FINAL CON ESTILOS CORREGIDOS Y ENLACE VALIDADO ---

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineUsers, 
  HiOutlineReceiptRefund, 
  HiOutlineQuestionMarkCircle, 
  HiOutlineCog6Tooth, 
  HiOutlineBuildingLibrary, 
  HiOutlineFunnel, 
  HiOutlineMegaphone, 
  HiOutlineCommandLine,
  HiOutlineChartBar,
  HiOutlineCalculator,
  HiOutlineDocumentMagnifyingGlass 
} from 'react-icons/hi2';

const navLinks = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HiOutlineHome },
  { name: 'Usuarios', href: '/admin/users', icon: HiOutlineUsers },
  { name: 'Transacciones', href: '/admin/transactions', icon: HiOutlineReceiptRefund },
  { name: 'Inversiones (Mercado)', href: '/admin/investments', icon: HiOutlineChartBar },
  { name: 'Cuantitativo', href: '/admin/tools', icon: HiOutlineCalculator },
  { name: 'Retiros Pendientes', href: '/admin/withdrawals', icon: HiOutlineQuestionMarkCircle },
  { name: 'Depósitos Manuales', href: '/admin/manual-deposits', icon: HiOutlineDocumentMagnifyingGlass },
  { name: 'Tesorería', href: '/admin/treasury', icon: HiOutlineBuildingLibrary },
  { name: 'Dispensador Gas', href: '/admin/gas-dispenser', icon: HiOutlineFunnel },
  { name: 'Notificaciones', href: '/admin/notifications', icon: HiOutlineMegaphone },
  { name: 'Monitor Blockchain', href: '/admin/blockchain-monitor', icon: HiOutlineCommandLine },
  { name: 'Ajustes', href: '/admin/settings', icon: HiOutlineCog6Tooth },
];

const Sidebar = ({ onLinkClick = () => {} }) => {
    // Clases para los enlaces: texto secundario por defecto, blanco al pasar el ratón
    const linkClasses = "flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-white/5 hover:text-white transition-colors duration-200";
    // Clases para el enlace activo: fondo sutil y texto blanco brillante
    const activeLinkClasses = "bg-white/10 text-white font-semibold";
  
    return (
      // Fondo oscuro sólido para todo el sidebar
      <aside className="w-64 bg-dark-primary p-4 flex flex-col border-r border-white/10 h-full">
        <div className="text-center py-4 mb-4 border-b border-white/10">
          <h1 className="text-2xl font-bold text-white tracking-wider">AiBrokTradePro</h1>
          <p className="text-sm text-text-secondary">Admin Panel</p>
        </div>
        <nav className="flex flex-col gap-2 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              onClick={onLinkClick}
              className={({ isActive }) => `${linkClasses} ${isActive ? activeLinkClasses : ''}`}
            >
              <link.icon className="w-6 h-6 flex-shrink-0" />
              <span className="text-sm font-medium">{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    );
};

export default Sidebar;