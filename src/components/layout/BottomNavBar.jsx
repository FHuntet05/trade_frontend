// RUTA: src/components/layout/BottomNavBar.jsx (NEXUS RECONSTRUIDA Y CORREGIDA)
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiHome, HiChartBar, HiWrenchScrewdriver, HiUsers, HiUser } from 'react-icons/hi2';
import { motion } from 'framer-motion';

// --- INICIO DE LA CORRECCIÓN DE RUTAS ---
// Se han corregido las rutas 'to' para que coincidan con la estructura de la aplicación.
const navItems = [
  { to: '/home', labelKey: 'nav.home', Icon: HiHome },
  { to: '/ranking', labelKey: 'nav.ranking', Icon: HiChartBar },
  { to: '/tools', labelKey: 'nav.upgrade', Icon: HiWrenchScrewdriver },
  { to: '/team', labelKey: 'nav.team', Icon: HiUsers },
  { to: '/profile', labelKey: 'nav.profile', Icon: HiUser },
];
// --- FIN DE LA CORRECCIÓN DE RUTAS ---

const NavItem = ({ to, labelKey, Icon }) => {
  const { t } = useTranslation();

  return (
    <NavLink
      to={to}
      end={to === '/home'}
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
    // --- INICIO DE LA CORRECCIÓN VISUAL ---
    // Se aplican los estilos de la imagen de referencia.
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
    // --- FIN DE LA CORRECCIÓN VISUAL ---
  );
};

export default BottomNavBar;