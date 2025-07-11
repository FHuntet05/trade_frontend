// src/components/layout/BottomNavBar.jsx (REDiseñado para ser más grueso y flotante)
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { HiHome, HiChartBar, HiWrenchScrewdriver, HiUsers, HiUser } from 'react-icons/hi2';
import { motion } from 'framer-motion';

import useTeamStore from '../../store/teamStore';
import useToolsStore from '../../store/toolsStore';

const navItems = [
  { to: '/', labelKey: 'nav.home', Icon: HiHome },
  { to: '/ranking', labelKey: 'nav.ranking', Icon: HiChartBar },
  { to: '/tools', labelKey: 'nav.upgrade', Icon: HiWrenchScrewdriver, prefetch: () => useToolsStore.getState().fetchTools() },
  { to: '/team', labelKey: 'nav.team', Icon: HiUsers, prefetch: () => useTeamStore.getState().fetchTeamStats() },
  { to: '/profile', labelKey: 'nav.profile', Icon: HiUser },
];

const NavItem = ({ to, labelKey, Icon, isRoot, prefetch }) => {
  const { t } = useTranslation();

  const handleMouseEnter = () => {
    if (prefetch) {
      prefetch();
    }
  };

  return (
    <NavLink
      to={to}
      end={isRoot}
      onMouseEnter={handleMouseEnter}
      className="flex-1 flex flex-col items-center justify-center text-xs h-full relative group"
    >
      {({ isActive }) => {
        const IconComponent = Icon;
        
        return (
          // Contenedor del ícono y texto
          <div className="flex flex-col items-center justify-center w-full h-full pt-1">
             {/* --- CAMBIO: Se ajusta el tamaño del icono y el texto --- */}
            <div className="relative mb-1">
              {/* Glow effect (sin cambios) */}
              <motion.div
                className="absolute -inset-2.5 blur-lg bg-gradient-to-r from-accent-start to-accent-end rounded-full"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ 
                  opacity: isActive ? 0.7 : 0, 
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
                  className={`w-7 h-7 transition-colors duration-300 ${isActive ? 'text-white' : 'text-text-secondary group-hover:text-white'}`}
                />
              </motion.div>
            </div>
            <span
              className={`text-xs transition-colors duration-300 ${isActive ? 'font-bold text-white' : 'text-text-secondary group-hover:text-white'}`}
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
    // --- CAMBIO CRÍTICO: Se eliminan los estilos de fondo y borde ---
    // El nav ahora es transparente y más alto para que el Layout.jsx controle el estilo.
    <nav className="w-full h-20 flex justify-around items-center">
      {navItems.map((item, index) => (
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