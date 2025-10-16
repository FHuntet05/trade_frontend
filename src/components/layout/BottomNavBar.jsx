// RUTA: src/components/layout/BottomNavBar.jsx (VERSIÓN "NEXUS - iOS STYLE")
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { HomeIcon, ChartIcon, ToolsIcon, TeamIcon, ProfileIcon } from './IOSIcons';
import { triggerImpactHaptic } from '@/utils/haptics';

const navItems = [
  { to: '/home', labelKey: 'nav.home', Icon: HomeIcon },
  { to: '/ranking', labelKey: 'nav.ranking', Icon: ChartIcon },
  { to: '/tools', labelKey: 'nav.upgrade', Icon: ToolsIcon },
  { to: '/team', labelKey: 'nav.team', Icon: TeamIcon },
  { to: '/profile', labelKey: 'nav.profile', Icon: ProfileIcon },
];

const NavItem = ({ to, labelKey, Icon }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = location.pathname === to || (to === '/home' && location.pathname === '/');

  const handleClick = () => {
    triggerImpactHaptic('light');
  };

  return (
    <NavLink
      to={to}
      end={to === '/home'}
      onClick={handleClick}
      className="flex-1 flex flex-col items-center justify-center text-xs h-full relative group z-10"
    >
      <motion.div 
        className="flex flex-col items-center justify-center w-full h-full pt-1"
        initial={false}
        animate={{
          scale: isActive ? 1.05 : 1,
          y: isActive ? -2 : 0
        }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        <div className="relative mb-1">
          <Icon
            className={`w-6 h-6 transition-all duration-300 ${
              isActive 
                ? 'text-accent-500 scale-110' 
                : 'text-text-secondary group-hover:text-white/80'
            }`}
          />
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 bg-accent/20 rounded-full blur-lg"
              />
            )}
          </AnimatePresence>
        </div>
        <span
          className={`text-[10px] font-medium transition-colors duration-300 ${
            isActive 
              ? 'text-accent-500 font-semibold' 
              : 'text-text-secondary group-hover:text-white/80'
          }`}
        >
          {t(labelKey)}
        </span>
        {isActive && (
          <motion.div
            layoutId="nav-indicator"
            className="absolute inset-0 bg-accent/10 rounded-2xl border border-accent/20 backdrop-blur-sm z-[-1]"
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          />
        )}
      </motion.div>
    </NavLink>
  );
};

const BottomNavBar = () => {
  return (
    <motion.div 
      className="fixed bottom-0 left-0 right-0 z-50"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <nav className="mx-auto max-w-md h-[4.5rem] flex justify-around items-center bg-dark-secondary/90 backdrop-blur-xl border-t border-white/5 px-2">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
        <div className="flex justify-around items-center w-full max-w-sm mx-auto relative z-10">
          {navItems.map((item, index) => (
            <NavItem 
              key={index} 
              to={item.to} 
              labelKey={item.labelKey} 
              Icon={item.Icon} 
            />
          ))}
        </div>
      </nav>
    </motion.div>
  );
};

export default BottomNavBar;