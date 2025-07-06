// src/components/layout/BottomNavBar.jsx (VERSIÓN CON PRE-FETCHING)
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiHome, HiChartBar, HiWrenchScrewdriver, HiUsers, HiUser } from 'react-icons/hi2';
import { motion } from 'framer-motion';

// --- 1. IMPORTAMOS LOS STORES ---
import useTeamStore from '../../store/teamStore';
import useToolsStore from '../../store/toolsStore';

// Definimos los ítems de navegación fuera para mayor claridad
const navItems = [
  { to: '/', labelKey: 'nav.home', Icon: HiHome },
  { to: '/ranking', labelKey: 'nav.ranking', Icon: HiChartBar },
  { to: '/tools', labelKey: 'nav.upgrade', Icon: HiWrenchScrewdriver, prefetch: () => useToolsStore.getState().fetchTools() },
  { to: '/team', labelKey: 'nav.team', Icon: HiUsers, prefetch: () => useTeamStore.getState().fetchTeamStats() },
  { to: '/profile', labelKey: 'nav.profile', Icon: HiUser },
];

const NavItem = ({ to, labelKey, Icon, isRoot, prefetch }) => {
  const { t } = useTranslation();

  // --- 2. FUNCIÓN PARA MANEJAR EL PRE-FETCH ---
  const handleMouseEnter = () => {
    // Si el item de navegación tiene una función prefetch, la ejecutamos
    if (prefetch) {
      prefetch();
    }
  };

  return (
    <NavLink
      to={to}
      end={isRoot}
      // --- 3. AÑADIMOS EL EVENTO onMouseEnter ---
      onMouseEnter={handleMouseEnter}
      className="flex-1 flex flex-col items-center justify-center text-xs h-full relative group"
    >
      {({ isActive }) => {
        const IconComponent = Icon;
        
        return (
          <div className="flex flex-col items-center justify-center w-full h-full">
            <div className="relative mb-1">
              <motion.div
                className="absolute -inset-2 blur-lg bg-gradient-to-r from-accent-start to-accent-end rounded-full"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: isActive ? 0.6 : 0, 
                  scale: isActive ? 1 : 0.5 
                }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              />
              <motion.div 
                className="relative"
                animate={{ y: isActive ? -4 : 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 15 }}
              >
                <IconComponent
                  className={`w-6 h-6 transition-colors duration-300 ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-white'}`}
                />
              </motion.div>
            </div>
            <span
              className={`transition-colors duration-300 ${isActive ? 'font-bold text-white' : 'text-text-secondary group-hover:text-white'}`}
            >
              {t(labelKey)}
            </span>
          </div>
        );
      }}
    </NavLink>
  );
};

const BottomNavBar = () => {
  return (
  <nav className="w-full h-16 bg-white/10 backdrop-blur-xl flex justify-around items-center border-t border-white/10 rounded-t-2xl">
      {navItems.map((item, index) => (
        // --- 4. PASAMOS LA FUNCIÓN PREFETCH AL COMPONENTE NavItem ---
        <NavItem 
            key={index} 
            to={item.to} 
            labelKey={item.labelKey} 
            Icon={item.Icon} 
            isRoot={item.to === '/'} 
            prefetch={item.prefetch}
        />
      ))}
    </nav>
  );
};

export default BottomNavBar;