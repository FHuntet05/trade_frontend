// frontend/src/components/team/TeamLevelDetailsModal.jsx

import React from 'react';
import { motion } from 'framer-motion';
import { HiXMark, HiUserCircle } from 'react-icons/hi2';
import Loader from '../common/Loader';

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: { y: "100%", opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 150, damping: 25 } },
  exit: { y: "100%", opacity: 0, transition: { duration: 0.3 } },
};

// Componente para un solo item de la lista de usuarios
const UserRow = ({ user }) => (
  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
    <div className="flex items-center gap-3">
      {user.photoUrl ? (
        <img src={user.photoUrl} alt={user.username} className="w-8 h-8 rounded-full object-cover" />
      ) : (
        <HiUserCircle className="w-8 h-8 text-text-secondary" />
      )}
      <span className="font-semibold text-white">{user.username}</span>
    </div>
    <div className="text-right">
      <span className="font-mono text-accent-start">+{user.effectiveMiningRate.toFixed(2)} NTX/H</span>
      <p className="text-xs text-text-secondary">Aporte</p>
    </div>
  </div>
);

const TeamLevelDetailsModal = ({ level, users, isLoading, onClose }) => {
  return (
    <motion.div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end items-end z-50"
      variants={backdropVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      onClick={onClose}
    >
      <motion.div
        className="bg-dark-primary w-full h-[75vh] max-w-lg rounded-t-2xl border-t border-white/10 flex flex-col"
        variants={modalVariants}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-xl font-bold text-white">Detalles del Nivel {level}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <HiXMark className="w-6 h-6 text-white" />
          </button>
        </header>

        <main className="flex-grow p-4 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader text="Cargando miembros..." />
            </div>
          ) : users && users.length > 0 ? (
            <div className="space-y-2">
              {users.map((user) => (
                <UserRow key={user._id} user={user} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-center text-text-secondary">
              <p>No hay miembros en este nivel todavía.</p>
            </div>
          )}
        </main>
      </motion.div>
    </motion.div>
  );
};

export default TeamLevelDetailsModal;