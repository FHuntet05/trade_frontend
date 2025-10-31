// RUTA: frontend/src/pages/admin/components/Sidebar.jsx (VERSIÓN ACTUALIZADA)

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineUsers, 
  HiOutlineReceiptRefund, 
  HiOutlineQuestionMarkCircle, 
  HiOutlineCog6Tooth, 
  HiOutlineBuildingLibrary, 
  HiOutlineShieldCheck, 
  HiOutlineFunnel, 
  HiOutlineMegaphone, 
  HiOutlineCommandLine,
  HiOutlineChartBar,
  HiOutlineCalculator // Importamos el nuevo icono
} from 'react-icons/hi2';

const navLinks = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HiOutlineHome },
  { name: 'Usuarios', href: '/admin/users', icon: HiOutlineUsers },
  { name: 'Transacciones', href: '/admin/transactions', icon: HiOutlineReceiptRefund },
  { name: 'Inversiones (Mercado)', href: '/admin/investments', icon: HiOutlineChartBar },
  
  // --- INICIO DE LA MODIFICACIÓN ---
  // Se cambia el nombre, el icono y la ruta para reflejar la nueva funcionalidad.
  { name: 'Cuantitativo', href: '/admin/tools', icon: HiOutlineCalculator },
  // --- FIN DE LA MODIFICACIÓN ---
  
  { name: 'Retiros Pendientes', href: '/admin/withdrawals', icon: HiOutlineQuestionMarkCircle },
  { name: 'Tesorería', href: '/admin/treasury', icon: HiOutlineBuildingLibrary },
  { name: 'Dispensador Gas', href: '/admin/gas-dispenser', icon: HiOutlineFunnel },
  { name: 'Notificaciones', href: '/admin/notifications', icon: HiOutlineMegaphone },
  { name: 'Monitor Blockchain', href: '/admin/blockchain-monitor', icon: HiOutlineCommandLine },
  //{ name: 'Seguridad', href: '/admin/security', icon: HiOutlineShieldCheck },
  { name: 'Ajustes', href: '/admin/settings', icon: HiOutlineCog6Tooth },
];

const Sidebar = ({ onLinkClick = () => {} }) => {
    const linkClasses = "flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-accent-start/10 hover:text-white transition-colors duration-200";
    const activeLinkClasses = "bg-accent-start/20 text-white font-bold";
  
    return (
      <aside className="w-64 bg-dark-secondary p-4 flex flex-col border-r border-white/10 h-full">
        <div className="text-center py-4 mb-4 border-b border-white/10">
          <h1 className="text-2xl font-bold text-accent-start tracking-wider">BLOCKSPHERE</h1>
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