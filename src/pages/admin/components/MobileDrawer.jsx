import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
// [SOLUCIÓN DEFINITIVA] Se corrige la ruta para que sea local, ya que están en la misma carpeta.
import Sidebar from './Sidebar'; 
import { HiXMark } from 'react-icons/hi2';

const MobileDrawer = ({ isOpen, setIsOpen }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/60 z-20 md:hidden"
                        aria-hidden="true"
                    />
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed top-0 left-0 h-full z-30 md:hidden"
                    >
                        <div className="relative h-full">
                            <Sidebar onLinkClick={() => setIsOpen(false)} />
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="absolute top-2 right-[-40px] p-2 text-white bg-dark-secondary rounded-full hover:bg-white/10"
                                aria-label="Cerrar menú"
                            >
                                <HiXMark className="w-6 h-6" />
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default MobileDrawer;