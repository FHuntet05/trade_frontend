// RUTA: admin-frontend/src/components/Sidebar.jsx (v50.0 - VERSIÓN "BLOCKSPHERE" FINAL)
// ARQUITECTURA: Sidebar del Modelo con terminología adaptada ("Chips" -> "VIPs / Fábricas").

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlineUsers, 
  HiOutlineReceiptRefund, 
  HiOutlineQuestionMarkCircle, 
  HiOutlineWrenchScrewdriver,
  HiOutlineCog6Tooth, 
  HiOutlineBuildingLibrary, 
  HiOutlineShieldCheck, 
  HiOutlineFunnel, 
  HiOutlineMegaphone, 
  HiOutlineCommandLine,
  HiOutlineChartBar
} from 'react-icons/hi2';

// La lista de enlaces de navegación para el panel de administración.
// Cada objeto define el texto, la ruta (href) y el ícono a mostrar.
const navLinks = [
  { name: 'Dashboard', href: '/admin/dashboard', icon: HiOutlineHome },
  { name: 'Usuarios', href: '/admin/users', icon: HiOutlineUsers },
  { name: 'Transacciones', href: '/admin/transactions', icon: HiOutlineReceiptRefund },
  { name: 'Inversiones', href: '/admin/investments', icon: HiOutlineChartBar },
  { name: 'Retiros Pendientes', href: '/admin/withdrawals', icon: HiOutlineQuestionMarkCircle },
  { name: 'Tesorería', href: '/admin/treasury', icon: HiOutlineBuildingLibrary },
  { name: 'Dispensador Gas', href: '/admin/gas-dispenser', icon: HiOutlineFunnel },
  
  // [BLOCKSPHERE - ADAPTACIÓN v4.2]
  // Se cambia el nombre "Chips" por "VIPs / Fábricas" para consistencia de negocio.
  // El backend y la lógica de usuario se refieren a "Fábricas" y niveles "VIP".
  { name: 'VIPs / Fábricas', href: '/admin/factories', icon: HiOutlineWrenchScrewdriver },
  // [FIN DE LA ADAPTACIÓN]
  
  { name: 'Notificaciones', href: '/admin/notifications', icon: HiOutlineMegaphone },
  { name: 'Monitor Blockchain', href: '/admin/blockchain-monitor', icon: HiOutlineCommandLine },
  { name: 'Seguridad', href: '/admin/security', icon: HiOutlineShieldCheck },
  { name: 'Ajustes', href: '/admin/settings', icon: HiOutlineCog6Tooth },
];

const Sidebar = ({ onLinkClick = () => {} }) => {
    // --- Clases de estilo para los enlaces ---
    // Clases base aplicadas a todos los enlaces de navegación.
    const linkClasses = "flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:bg-accent-start/10 hover:text-white transition-colors duration-200";
    
    // Clases aplicadas únicamente al enlace que corresponde a la ruta activa.
    const activeLinkClasses = "bg-accent-start/20 text-white font-bold";
  
    return (
      // El contenedor del sidebar ocupa toda la altura, tiene un fondo oscuro y borde derecho.
      <aside className="w-64 bg-dark-secondary p-4 flex flex-col border-r border-white/10 h-full">
        
        {/* --- Encabezado del Panel --- */}
        <div className="text-center py-4 mb-4 border-b border-white/10">
          <h1 className="text-2xl font-bold text-accent-start tracking-wider">BLOCKSPHERE</h1>
          <p className="text-sm text-text-secondary">Admin Panel</p>
        </div>

        {/* --- Navegación Principal --- */}
        <nav className="flex flex-col gap-2 overflow-y-auto">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              // onClick es importante para cerrar el menú en la vista móvil.
              onClick={onLinkClick}
              // react-router-dom nos provee 'isActive' para saber si el enlace está activo.
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