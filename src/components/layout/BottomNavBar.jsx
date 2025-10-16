// RUTA: src/components/layout/BottomNavBar.jsx

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiBarChart2, FiArchive, FiGift, FiUser } from 'react-icons/fi';
import { triggerImpactHaptic } from '@/utils/haptics';

const navItems = [
  { to: '/home', labelKey: 'nav.home', Icon: FiHome },
  { to: '/market', labelKey: 'nav.market', Icon: FiBarChart2 },
  { to: '/quantitative', labelKey: 'nav.quantitative', Icon: FiArchive },
  { to: '/wheel', labelKey: 'nav.wheel', Icon: FiGift },
  { to: '/profile', labelKey: 'nav.profile', Icon: FiUser },
];

const NavItem = ({ to, labelKey, Icon }) => {
  const { t } = useTranslation();
  const location = useLocation();
  const isActive = location.pathname === to;

  const handleClick = () => {
    triggerImpactHaptic('light');
  };

  return (
    <NavLink
      to={to}
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
                ? 'text-ios-green'
                : 'text-text-secondary group-hover:text-text-primary'
            }`}
          />
          <AnimatePresence>
            {isActive && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 bg-ios-green/20 rounded-full blur-md"
              />
            )}
          </AnimatePresence>
        </div>
        <span
          className={`text-[10px] font-medium transition-colors duration-300 ${
            isActive
              ? 'text-ios-green font-semibold'
              : 'text-text-secondary group-hover:text-text-primary'
          }`}
        >
          {t(labelKey)}
        </span>
      </motion.div>
    </NavLink>
  );
};

const BottomNavBar = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 w-full max-w-lg mx-auto z-50">
      <nav className="h-[5rem] flex justify-around items-center bg-system-secondary/80 backdrop-blur-xl border-t border-gray-200/80">
        <div className="flex justify-around items-center w-full h-full">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              labelKey={item.labelKey}
              Icon={item.Icon}
            />
          ))}
        </div>
      </nav>
    </div>
  );
};

export default BottomNavBar;