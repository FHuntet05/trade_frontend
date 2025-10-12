import React from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { pageVariants } from '../utils/animations';

export const PageLayout = ({ children, title, showBackButton = false }) => {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen bg-system-background pt-safe-top pb-safe-bottom"
    >
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-10 bg-system-background/80 backdrop-blur-md ios-safe-top">
        <div className="px-4 h-12 flex items-center justify-between">
          {showBackButton && (
            <button 
              onClick={() => window.history.back()}
              className="p-2 -ml-2"
            >
              <ChevronLeft />
            </button>
          )}
          <h1 className="text-lg font-semibold font-ios-display">
            {title}
          </h1>
          <div className="w-10" /> {/* Espaciador */}
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 pt-16">
        {children}
      </main>
    </motion.div>
  );
};

export const CardLayout = ({ children, className = '' }) => {
  return (
    <div className={`bg-system-secondary rounded-ios-xl p-4 shadow-ios-card ${className}`}>
      {children}
    </div>
  );
};

export const GridLayout = ({ children, cols = 2, gap = 4 }) => {
  return (
    <div 
      className={`grid grid-cols-${cols} gap-${gap}`}
      style={{
        gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
      }}
    >
      {children}
    </div>
  );
};

export const ListLayout = ({ children, spacing = 4 }) => {
  return (
    <div className={`space-y-${spacing}`}>
      {children}
    </div>
  );
};

export const SectionLayout = ({ title, children, action }) => {
  return (
    <section className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold font-ios-display">
          {title}
        </h2>
        {action && (
          <button 
            onClick={action.onClick}
            className="text-ios-green text-sm font-medium"
          >
            {action.label}
          </button>
        )}
      </div>
      {children}
    </section>
  );
};

export const TabLayout = ({ tabs, activeTab, onChange, children }) => {
  return (
    <div>
      <div className="flex p-1 bg-system-secondary rounded-ios mb-4">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            className={`flex-1 py-2 px-4 rounded-ios text-sm font-ios transition-all ${
              activeTab === index
                ? 'bg-white text-text-primary shadow-ios-button'
                : 'text-text-secondary'
            }`}
            onClick={() => onChange(index)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {children}
    </div>
  );
};