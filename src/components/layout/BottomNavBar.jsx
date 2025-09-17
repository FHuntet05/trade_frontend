// RUTA: src/components/layout/BottomNavBar.jsx (VERSIÓN NEXUS RECONSTRUIDA)
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiHome, HiChartBar, HiWrenchScrewdriver, HiUsers, HiUser } from 'react-icons/hi2';
import { motion } from 'framer-motion';

// Los íconos y la estructura de navegación se mantienen
const navItems = [
  { to: '/home', labelKey: 'nav.home', Icon: HiHome },
  { to: '/ranking', labelKey: 'nav.ranking', Icon: HiChartBar },
  { to: '/tools', labelKey: 'nav.upgrade', Icon: HiWrenchScrewdriver },
  { to: '/team', labelKey: 'nav.team', Icon: HiUsers },
  { to: '/profile', labelKey: 'nav.profile', Icon: HiUser },
];

const NavItem = ({ to, labelKey, Icon }) => {
  const { t } = useTranslation();

  return (
    <NavLink
      to={to}
      end={to === '/home'} // 'end' debe ser true solo para la ruta raíz del nav
      className="flex-1 flex flex-col items-center justify-center text-xs h-full relative group z-10"
    >
      {({ isActive }) => (
        <div className="flex flex-col items-center justify-center w-full h-full pt-1">
          <motion.div 
            className="relative mb-1"
            animate={{ y: isActive ? -4 : 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 15 }}
          >
            <Icon
              className={`w-7 h-7 transition-colors duration-300 ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-white'}`}
            />
          </motion.div>
          <span
            className={`text-xs transition-colors duration-300 ${isActive ? 'font-bold text-white' : 'text-text-secondary group-hover:text-white'}`}
          >
            {t(labelKey)}
          </span>
          {/* Indicador activo animado */}
          {isActive && (
            <motion.div
              layoutId="active-nav-indicator"
              className="absolute inset-0 bg-white/5 rounded-xl z-[-1]"
              initial={false}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
        </div>
      )}
    </NavLink>
  );
};

const BottomNavBar = () => {
  return (
    // --- INICIO DE LA RECONSTRUCCIÓN VISUAL ---
    // Contenedor principal que aplica los estilos del diseño de referencia
    <nav className="w-full h-20 flex justify-around items-center bg-dark-secondary/70 backdrop-blur-lg rounded-2xl border border-white/10 shadow-glow">
      {navItems.map((item, index) => (
        <NavItem 
            key={index} 
            to={item.to} 
            labelKey={item.labelKey} 
            Icon={item.Icon} 
        />
      ))}
    </nav>
    // --- FIN DE LA RECONSTRUCCIÓN VISUAL ---
  );
};

export default BottomNavBar;